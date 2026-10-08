#!/usr/bin/env python3
"""Build a clean, distributable copy of this vault from the live one.

    python3 scripts/build_template.py --out ../life-os-releases --name Candidate --version 1.1.0 --zip
    python3 scripts/build_template.py --out ../life-os-releases --name CandidateLite --version 1.1.0 --without-reading

Never writes into the live vault. Steps: copy with drop rules, keep only example-tagged notes in
user folders, reset defaults, strip machine state from plugin settings, trim the transcript, add
version and a one-page workspace, chmod, verify, zip. See scripts/RELEASE.md.
"""
import argparse, fnmatch, json, os, re, shutil, stat, subprocess, sys, hashlib, zipfile, datetime, tempfile
from pathlib import Path

HERE = os.path.dirname(os.path.abspath(__file__))
LIVE = os.path.dirname(HERE)

DROP_GLOBS = [
    ".directory", ".claude", ".claude/*", ".claude-obsidian.json", ".github", ".github/*",
    "Guide/18 Distribution Checklist.md",
    ".git", ".git/*", ".vault-meta", ".vault-meta/*", ".raw", ".raw/*", ".trash", ".trash/*",
    ".claude/settings.local.json", ".mcp.json", ".obsidian/workspace*.json", ".obsidian/graph.json",
    ".obsidian/plugins/agent-client/sessions", ".obsidian/plugins/agent-client/sessions/*",
    ".obsidian/plugins/*/data.json.bak", "Meta/Agent Chats", "Meta/Agent Chats/*", "Agent Client", "Agent Client/*",
    "scripts/template", "scripts/template/*", "build", "build/*",
    "wiki/concepts", "wiki/concepts/*", "wiki/sources", "wiki/sources/*", "wiki/entities", "wiki/entities/*", "wiki/questions", "wiki/questions/*", "wiki/log/*", "inbox/*",
    "Untitled*", "*/Untitled*", "*.canvas", ".DS_Store", "*/.DS_Store", "Thumbs.db", "*/Thumbs.db",
    "__pycache__", "*/__pycache__", "*.pyc", "*.png.bak", "*.html", "*.log",
]
USER_CONTENT = ["01 Journal/", "02 Retreats/", "04 Projects/", "05 People/", "06 Writing/", "07 Library/",
                "09 Reading/Chapters/", "09 Reading/Verses/", "09 Reading/Study Notes/", "09 Reading/Topics/"]
KEEP_IN_USER_FOLDERS = re.compile(r".* Board\.md$")
BOARD_DEFAULTS = {
    "04 Projects/Projects Board.md": ("Projects Board", "Ideas"),
    "06 Writing/Newsletters/Newsletter Board.md": ("Newsletter Board", "Backlog"),
    "06 Writing/YouTube Scripts/YouTube Board.md": ("YouTube Board", "Backlog"),
    "06 Writing/Articles/Article Board.md": ("Article Board", "Backlog"),
    "06 Writing/Course Content/Course Board.md": ("Course Board", "Ideas"),
}
READING_PATHS = ["09 Reading", "Guide/07 Workflow - Daily Reading.md", "scripts/generate_reading_plan.py", "scripts/split_bible.py", "Templates/Study Note.md"]

def dropped(rel):
    if rel.startswith("Meta/attachments/"):
        return not (os.path.basename(rel) in (".gitkeep",) or os.path.basename(rel).startswith("cover."))
    return any(fnmatch.fnmatch(rel, g) for g in DROP_GLOBS)

def has_example_tag(path):
    try:
        with open(path, encoding="utf-8") as stream:
            head = stream.read(4000)
    except Exception:
        return False
    m = re.match(r"^---\n(.*?)\n---", head, re.S)
    return bool(m) and re.search(r"^\s*-\s*example\s*$", m.group(1), re.M) is not None

def copy_tree(live, out):
    for root, dirs, files in os.walk(live):
        rel_root = os.path.relpath(root, live)
        rel_root = "" if rel_root == "." else rel_root
        dirs[:] = [d for d in dirs if not dropped(os.path.join(rel_root, d) if rel_root else d)]
        if any(os.path.islink(os.path.join(root, d)) for d in dirs):
            raise ValueError("Package source contains a symbolic-link directory")
        for f in files:
            rel = os.path.join(rel_root, f) if rel_root else f
            if dropped(rel):
                continue
            source = os.path.join(root, f)
            if os.path.islink(source) or not stat.S_ISREG(os.stat(source).st_mode):
                raise ValueError("Package source contains a non-regular file")
            default = Path(HERE, "template", "defaults", rel)
            if default.is_file():
                # Never stage personal values before replacing them with defaults.
                continue
            if rel.startswith(("03 Planning/", "08 Tasks/", "wiki/")):
                # Only reviewed defaults populate these personal-state folders.
                continue
            if rel.startswith(".obsidian/") and not rel.startswith(".obsidian/plugins/"):
                name = rel.removeprefix(".obsidian/")
                settings = None
                if name == "app.json": settings = {"newFileLocation": "current"}
                elif name in ("appearance.json", "types.json", "webviewer.json"): settings = {}
                elif name == "core-plugins.json":
                    original = json.loads(Path(source).read_text())
                    if not isinstance(original, dict): raise ValueError("Unsupported core plugin settings")
                    settings = {key: value for key, value in original.items() if isinstance(value, bool)}
                    settings["sync"] = False
                elif name == "community-plugins.json":
                    original = json.loads(Path(source).read_text())
                    if not isinstance(original, list) or any(not isinstance(value, str) or not re.fullmatch(r"[a-z0-9-]+", value) for value in original):
                        raise ValueError("Unsupported plugin inventory")
                    settings = original
                elif name == "hotkeys.json":
                    original = json.loads(Path(source).read_text())
                    settings = {key: value for key, value in original.items() if key.startswith("life-os-app:")}
                if settings is not None:
                    target = Path(out, rel)
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_text(json.dumps(settings, indent=2), encoding="utf-8")
                continue
            if rel in BOARD_DEFAULTS:
                target = Path(out, rel)
                target.parent.mkdir(parents=True, exist_ok=True)
                title, first_lane = BOARD_DEFAULTS[rel]
                target.write_text(f"---\nkanban-plugin: board\n---\n\n# {title}\n\n## {first_lane}\n\n## In progress\n\n## Done\n", encoding="utf-8")
                continue
            if rel.startswith(".obsidian/plugins/") and f != "data.json" and f not in ("main.js", "manifest.json", "styles.css", "LICENSE"):
                continue
            if rel.startswith(".obsidian/plugins/") and f == "data.json":
                # Never copy raw machine state into staging, even temporarily.
                settings = safe_plugin_settings(rel.split("/")[2], source)
                if settings is not None:
                    dst = os.path.join(out, rel)
                    os.makedirs(os.path.dirname(dst), exist_ok=True)
                    with open(dst, "w", encoding="utf-8") as target:
                        json.dump(settings, target, indent=2)
                continue
            if any(rel.startswith(u) for u in USER_CONTENT):
                if not rel.endswith(".md") or not has_example_tag(os.path.join(root, f)):
                    continue
            dst = os.path.join(out, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(os.path.join(root, f), dst)

def safe_plugin_settings(plugin, source):
    fixed = {
        "obsidian-local-rest-api": {"enableInsecureServer": True},
        "agent-client": {"savedSessions": [], "autoAllowPermissions": False, "customAgents": [], "presetAgents": {}, "autoMentionActiveNote": False, "expandWikilinkContext": False},
        "seo": {"scanDirectories": "06 Writing", "checkExternalLinks": False},
        "omnisearch": {"httpApiEnabled": False, "DANGER_httpHost": None},
        "life-os-app": {},
    }
    if plugin in fixed:
        return fixed[plugin]
    allowed = {
        "dataview": ["enableDataviewJs", "enableInlineDataviewJs", "enableInlineDataview", "refreshEnabled", "refreshInterval"],
        "templater-obsidian": ["data_version", "templates_folder", "trigger_on_file_creation_mode", "trigger_on_file_creation", "folder_templates", "enabled_templates_hotkeys", "syntax_highlighting", "syntax_highlighting_mobile"],
        "periodic-notes": ["daily", "weekly", "monthly", "quarterly", "yearly", "hasMigratedDailyNoteSettings", "hasMigratedWeeklyNoteSettings"],
        "quickadd": ["choices", "templateFolderPaths", "migrations", "version"],
        "obsidian-tasks-plugin": ["globalQuery", "globalFilter", "removeGlobalFilter", "taskFormat", "setCreatedDate", "setDoneDate", "setCancelledDate", "recurrenceOnNextLine"],
        "obsidian-kanban": ["kanban-plugin", "show-checkboxes", "lane-width", "date-format", "time-format"],
    }
    if plugin not in allowed:
        return None
    with open(source, encoding="utf-8") as stream:
        original = json.load(stream)
    def clean(value):
        if isinstance(value, dict):
            return {k: clean(v) for k, v in value.items() if not re.search(r"secret|token|password|api.?key|authorization|certificate|private.?key|^env$", k, re.I)}
        if isinstance(value, list):
            return [clean(v) for v in value]
        if isinstance(value, str) and re.search(r"BEGIN (?:RSA |PRIVATE |CERTIFICATE)|\b(?:sk-|ghp_|xoxb-)[A-Za-z0-9_-]{8,}|Bearer\s+\S{16,}", value):
            raise ValueError("Sensitive value detected in allowlisted settings; nothing written")
        return value
    result = clean({k: original[k] for k in allowed[plugin] if k in original})
    if plugin == "quickadd":
        result.update(disableOnlineFeatures=True, ai={"providers": []}, globalVariables={})
    return result

def validate_destination(live, output_root, name):
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", name) or name in (".", ".."):
        raise ValueError("Build name must be one plain directory name")
    raw = Path(output_root).absolute()
    if any(p.is_symlink() for p in [raw, *raw.parents]):
        raise ValueError("Output paths must not contain symbolic links")
    source = Path(live).resolve(strict=True)
    parent = raw.resolve()
    destination = parent / name
    if parent == source or parent in source.parents or source in parent.parents:
        raise ValueError("Output root must be outside the live vault and its ancestors")
    if destination.exists() or destination.is_symlink():
        raise ValueError("Destination already exists; choose a fresh output name")
    return source, parent, destination

def reset_defaults(out):
    src = os.path.join(HERE, "template", "defaults")
    required = ["Meta/Compass Config.md", "03 Planning/Life Theme.md", "03 Planning/Core Values.md", "03 Planning/Ideal Week.md", "08 Tasks/Tasks.md"]
    if any(not Path(src, rel).is_file() or Path(src, rel).is_symlink() for rel in required):
        raise ValueError("Clean source defaults are missing or unsafe")
    for root, _, files in os.walk(src):
        for f in files:
            if Path(root, f).is_symlink():
                raise ValueError("Defaults must not contain symlinks")
            rel = os.path.relpath(os.path.join(root, f), src)
            dst = os.path.join(out, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(os.path.join(root, f), dst)

def json_surgery(out):
    def load(rel):
        p = os.path.join(out, rel)
        return (p, json.load(open(p))) if os.path.exists(p) else (p, None)
    def save(p, d):
        json.dump(d, open(p, "w"), indent=2, ensure_ascii=False); open(p, "a").write("\n")
    p, d = load(".obsidian/plugins/obsidian-local-rest-api/data.json")
    save(p, {"enableInsecureServer": True})
    p, d = load(".obsidian/plugins/agent-client/data.json")
    if d is not None:
        for k in ["savedSessions", "lastUsedModels", "lastUsedModes", "lastUsedConfigOptions", "floatingWindowPosition", "floatingButtonPosition", "floatingWindowSize", "nodePath"]:
            d.pop(k, None)
        d["savedSessions"] = []; d["autoAllowPermissions"] = False
        for pid, pa in (d.get("presetAgents") or {}).items():
            if isinstance(pa, dict):
                pa["command"] = pa.get("command", "") if not str(pa.get("command", "")).startswith("/") else ""
                pa.pop("env", None); pa["env"] = {}
                for k in list(pa.keys()):
                    if "secret" in k.lower() or "apikey" in k.lower(): pa[k] = ""
        d["customAgents"] = []
        save(p, d)
    p, d = load(".obsidian/plugins/seo/data.json")
    if d is not None:
        d.pop("cachedGlobalResults", None); d.pop("lastScanTimestamp", None)
        d["scanDirectories"] = "06 Writing"; d["checkExternalLinks"] = False
        save(p, d)
    p, d = load(".obsidian/plugins/omnisearch/data.json")
    if d is not None:
        d.pop("welcomeMessage", None); d["httpApiEnabled"] = False; d["DANGER_httpHost"] = None; save(p, d)
    p, d = load(".obsidian/plugins/quickadd/data.json")
    if d is not None:
        for prov in (d.get("ai", {}) or {}).get("providers", []) or []:
            if isinstance(prov, dict): prov["apiKey"] = ""
        d["disableOnlineFeatures"] = True; save(p, d)
    p, d = load(".obsidian/core-plugins.json")
    if d is not None: d["sync"] = False; save(p, d)
    p, d = load(".obsidian/app.json")
    if d is not None: d["newFileLocation"] = "current"; d.pop("newFileFolderPath", None); save(p, d)
    workspace = {"main": {"id": "main", "type": "split", "children": [{"id": "leaf", "type": "tabs", "children": [{"id": "setup", "type": "leaf", "state": {"type": "markdown", "state": {"file": "00 Dashboards/Setup.md", "mode": "preview"}}}]}], "direction": "vertical"},
                 "active": "setup", "lastOpenFiles": ["00 Dashboards/Setup.md"]}
    save(os.path.join(out, ".obsidian/workspace.json"), workspace)

def text_surgery(out, without_reading):
    p = os.path.join(out, "Guide/Source - Video Analysis.md")
    if os.path.exists(p):
        s = open(p, encoding="utf-8").read()
        i = s.find("\n## Transcript")
        if i != -1:
            s = s[:i] + "\n## Transcript\nNot included in the distributed template. Watch the video at the source URL above.\n"
            open(p, "w", encoding="utf-8").write(s)
    if without_reading:
        for rel in READING_PATHS:
            p = os.path.join(out, rel)
            if os.path.isdir(p): shutil.rmtree(p)
            elif os.path.exists(p): os.remove(p)
        p = os.path.join(out, "Templates/Daily Note.md")
        s = open(p, encoding="utf-8").read()
        s = re.sub(r"> \[!reading\]- Daily reading\n(?:> .*\n)+\n", "", s)
        s = s.replace("path does not include 09 Reading/Reading Plan\n", "")
        open(p, "w", encoding="utf-8").write(s)
        def edit(rel, fn):
            q = os.path.join(out, rel)
            if os.path.exists(q):
                t = open(q, encoding="utf-8").read(); open(q, "w", encoding="utf-8").write(fn(t))
        edit("00 Dashboards/Setup.md", lambda t: t.replace(" Decide the reading module: fill [[Reading Plan]] or delete `09 Reading`.", ""))
        edit("Guide/00 Start Here.md", lambda t: re.sub(r"^\| 5 \| Daily reading.*\n", "", t, flags=re.M))
        edit("AGENTS.md", lambda t: re.sub(r"^\| `09 Reading/`.*\n", "", t, flags=re.M))
        edit("README.md", lambda t: re.sub(r"^09 Reading/.*\n", "", t, flags=re.M))
        edit("00 Dashboards/Task Dashboard.md", lambda t: t.replace("path does not include 09 Reading/Reading Plan\n", ""))
        tj = os.path.join(out, ".obsidian/plugins/templater-obsidian/data.json")
        if os.path.exists(tj):
            d = json.load(open(tj)); d["folder_templates"] = [x for x in d.get("folder_templates", []) if not x.get("folder", "").startswith("09 Reading")]
            json.dump(d, open(tj, "w"), indent=2); open(tj, "a").write("\n")

def version_stamp(out, version):
    plugins = {}
    pdir = os.path.join(out, ".obsidian/plugins")
    for d in sorted(os.listdir(pdir)):
        m = os.path.join(pdir, d, "manifest.json")
        if os.path.exists(m): plugins[d] = json.load(open(m))["version"]
    open(os.path.join(out, "Meta/version.md"), "w").write(
        "---\ntemplate_version: %s\nbuilt: %s\nrelease_status: candidate\nmin_obsidian: 1.13.1\nplugins:\n%s---\n# Version\n\nThis is a local candidate, not evidence of native acceptance or publication. There is no in-place updater. Back up the old vault and migrate content and custom configuration into a separate fresh copy with conflict review. See `scripts/RELEASE.md`.\n"
        % (version, datetime.date.today().isoformat(), "".join('  %s: "%s"\n' % kv for kv in plugins.items())))

def chmod_all(out):
    for root, dirs, files in os.walk(out):
        for d in dirs: os.chmod(os.path.join(root, d), 0o755)
        for f in files: os.chmod(os.path.join(root, f), 0o755 if f.endswith(".py") else 0o644)

def manifest(out):
    lines = []
    for root, _, files in os.walk(out):
        for f in sorted(files):
            if f == "MANIFEST.sha256": continue
            p = os.path.join(root, f)
            h = hashlib.sha256(Path(p).read_bytes()).hexdigest()
            lines.append("%s  %s" % (h, os.path.relpath(p, out)))
    Path(out, "MANIFEST.sha256").write_text("\n".join(sorted(lines)) + "\n")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--live", default=LIVE)
    ap.add_argument("--out", default=os.path.join(os.path.dirname(LIVE), "life-os-releases"))
    ap.add_argument("--name", default="Compass")
    ap.add_argument("--version", required=True)
    ap.add_argument("--zip", action="store_true")
    ap.add_argument("--without-reading", action="store_true")
    a = ap.parse_args()
    version = a.version
    if not re.fullmatch(r"\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?", version):
        raise ValueError("Version must be an explicit semantic version")
    live, parent, destination = validate_destination(a.live, a.out, a.name)
    archive = parent / ("%s-template-v%s%s.zip" % (a.name, version, "-without-reading" if a.without_reading else ""))
    checksum = Path(str(archive) + ".sha256")
    if a.zip and (os.path.lexists(archive) or os.path.lexists(checksum)):
        raise ValueError("Archive or checksum already exists; refusing overwrite")
    parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".life-os-stage-", dir=parent) as staging:
        out = os.path.join(staging, a.name)
        os.mkdir(out, 0o700)
        copy_tree(str(live), out)
        reset_defaults(out)
        json_surgery(out)
        text_surgery(out, a.without_reading)
        version_stamp(out, version)
        os.makedirs(os.path.join(out, "inbox"), exist_ok=True); open(os.path.join(out, "inbox/.gitkeep"), "a").close()
        os.makedirs(os.path.join(out, "Meta/attachments"), exist_ok=True)
        open(os.path.join(out, "Meta/attachments/.gitkeep"), "a").close()
        chmod_all(out)
        manifest(out)
        rc = subprocess.call([sys.executable, os.path.join(HERE, "verify_template.py"), out])
        if rc != 0:
            print("Verification failed; private staging removed; no archive published")
            return rc
        # Exclusive reservation prevents replacement of an existing destination.
        destination.mkdir(mode=0o700)
        try:
            os.replace(out, destination)
        except Exception:
            destination.rmdir()
            raise
        print("Verified local candidate", destination)
        if a.zip:
            temporary_zip = os.path.join(staging, "candidate.zip")
            with zipfile.ZipFile(temporary_zip, "w", zipfile.ZIP_DEFLATED) as z:
                for root, dirs, files in os.walk(destination):
                    dirs.sort()
                    for f in sorted(files):
                        p = os.path.join(root, f); z.write(p, os.path.join(a.name, os.path.relpath(p, destination)))
            with zipfile.ZipFile(temporary_zip) as z:
                if z.testzip() is not None: raise ValueError("Archive integrity failed")
            digest = hashlib.sha256(Path(temporary_zip).read_bytes()).hexdigest()
            temporary_sum = os.path.join(staging, "candidate.sha256")
            Path(temporary_sum).write_text(digest + "  " + archive.name + "\n")
            # Same-filesystem exclusive hard links publish complete files, never partial ZIPs.
            os.link(temporary_zip, archive)
            os.link(temporary_sum, checksum)
            print("Local archive and full SHA256 written; native acceptance still required")
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ValueError, OSError):
        print("Build refused or failed safely. Check fresh destination, inputs, and permissions.", file=sys.stderr)
        sys.exit(1)
