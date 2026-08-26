#!/usr/bin/env python3
"""Build a clean, distributable copy of this vault from the live one.

    python3 scripts/build_template.py --out build --zip
    python3 scripts/build_template.py --out build --without-reading   # drop the 09 Reading module

Never writes into the live vault. Steps: copy with drop rules, keep only example-tagged notes in
user folders, reset defaults, strip machine state from plugin settings, trim the transcript, add
version and a one-page workspace, chmod, verify, zip. See scripts/RELEASE.md.
"""
import argparse, fnmatch, json, os, re, shutil, stat, subprocess, sys, hashlib, zipfile, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
LIVE = os.path.dirname(HERE)

DROP_GLOBS = [
    ".git", ".git/*", ".vault-meta", ".vault-meta/*", ".raw", ".raw/*", ".trash", ".trash/*",
    ".claude/settings.local.json", ".mcp.json", ".obsidian/workspace*.json", ".obsidian/graph.json",
    ".obsidian/plugins/agent-client/sessions", ".obsidian/plugins/agent-client/sessions/*",
    ".obsidian/plugins/*/data.json.bak", "Meta/Agent Chats", "Meta/Agent Chats/*", "Agent Client", "Agent Client/*",
    "scripts/template", "scripts/template/*", "build", "build/*",
    "wiki/concepts", "wiki/concepts/*", "wiki/sources", "wiki/sources/*", "wiki/entities", "wiki/entities/*", "wiki/questions", "wiki/questions/*", "wiki/log/*", "inbox/*",
    "Untitled*", "*/Untitled*", "*.canvas", ".DS_Store", "*/.DS_Store", "Thumbs.db", "*/Thumbs.db",
]
USER_CONTENT = ["01 Journal/", "02 Retreats/", "04 Projects/", "05 People/", "06 Writing/", "07 Library/",
                "09 Reading/Chapters/", "09 Reading/Verses/", "09 Reading/Study Notes/", "09 Reading/Topics/"]
KEEP_IN_USER_FOLDERS = re.compile(r".* Board\.md$")
READING_PATHS = ["09 Reading", "Guide/07 Workflow - Daily Reading.md", "scripts/generate_reading_plan.py", "scripts/split_bible.py", "Templates/Study Note.md"]

def dropped(rel):
    if rel.startswith("Meta/attachments/"):
        return not (os.path.basename(rel) in (".gitkeep",) or os.path.basename(rel).startswith("cover."))
    return any(fnmatch.fnmatch(rel, g) for g in DROP_GLOBS)

def has_example_tag(path):
    try:
        head = open(path, encoding="utf-8").read(4000)
    except Exception:
        return False
    m = re.match(r"^---\n(.*?)\n---", head, re.S)
    return bool(m) and re.search(r"^\s*-\s*example\s*$", m.group(1), re.M) is not None

def copy_tree(live, out):
    for root, dirs, files in os.walk(live):
        rel_root = os.path.relpath(root, live)
        rel_root = "" if rel_root == "." else rel_root
        dirs[:] = [d for d in dirs if not dropped(os.path.join(rel_root, d) if rel_root else d)]
        for f in files:
            rel = os.path.join(rel_root, f) if rel_root else f
            if dropped(rel):
                continue
            if any(rel.startswith(u) for u in USER_CONTENT) and rel.endswith(".md") and not KEEP_IN_USER_FOLDERS.match(f):
                if not has_example_tag(os.path.join(root, f)):
                    continue
            dst = os.path.join(out, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(os.path.join(root, f), dst)

def reset_defaults(out):
    src = os.path.join(HERE, "template", "defaults")
    for root, _, files in os.walk(src):
        for f in files:
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
        "---\ntemplate_version: %s\nreleased: %s\nmin_obsidian: 1.13.1\nplugins:\n%s---\n# Version\n\nSee `CHANGELOG.md` for what changed and what to merge by hand after an upgrade. System files (dashboards, views, guide, scripts, plugins) can be overwritten by an upgrade; your notes, `Meta/Compass Config.md`, and `Templates/` are never overwritten.\n"
        % (version, datetime.date.today().isoformat(), "".join('  %s: "%s"\n' % kv for kv in plugins.items())))

def chmod_all(out):
    for root, dirs, files in os.walk(out):
        for d in dirs: os.chmod(os.path.join(root, d), 0o755)
        for f in files: os.chmod(os.path.join(root, f), 0o755 if f.endswith(".py") else 0o644)

def manifest(out):
    lines = []
    for root, _, files in os.walk(out):
        for f in sorted(files):
            p = os.path.join(root, f)
            h = hashlib.sha256(open(p, "rb").read()).hexdigest()
            lines.append("%s  %s" % (h, os.path.relpath(p, out)))
    open(os.path.join(os.path.dirname(out), "MANIFEST.sha256"), "w").write("\n".join(sorted(lines)) + "\n")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--live", default=LIVE)
    ap.add_argument("--out", default=os.path.join(LIVE, "build"))
    ap.add_argument("--name", default="Compass")
    ap.add_argument("--version", default=None)
    ap.add_argument("--zip", action="store_true")
    ap.add_argument("--without-reading", action="store_true")
    a = ap.parse_args()
    version = a.version
    if not version:
        m = re.search(r"template_version:\s*(\S+)", open(os.path.join(a.live, "Meta/version.md")).read())
        version = m.group(1) if m else "0.0.0"
    out = os.path.join(a.out, a.name)
    if os.path.exists(out): shutil.rmtree(out)
    os.makedirs(out)
    copy_tree(a.live, out)
    reset_defaults(out)
    json_surgery(out)
    text_surgery(out, a.without_reading)
    version_stamp(out, version)
    os.makedirs(os.path.join(out, "inbox"), exist_ok=True); open(os.path.join(out, "inbox/.gitkeep"), "a").close()
    os.makedirs(os.path.join(out, "Meta/attachments"), exist_ok=True)
    open(os.path.join(out, "Meta/attachments/.gitkeep"), "a").close()
    chmod_all(out)
    manifest(out)
    print("built", out)
    rc = subprocess.call([sys.executable, os.path.join(HERE, "verify_template.py"), out])
    if rc != 0:
        print("verify FAILED; no zip produced"); sys.exit(rc)
    if a.zip:
        zp = os.path.join(a.out, "%s-template-v%s%s.zip" % (a.name, version, "-without-reading" if a.without_reading else ""))
        with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
            for root, _, files in os.walk(out):
                for f in files:
                    p = os.path.join(root, f); z.write(p, os.path.join(a.name, os.path.relpath(p, out)))
        print("zip", zp, hashlib.sha256(open(zp, "rb").read()).hexdigest()[:16], "%.1f MB" % (os.path.getsize(zp) / 1e6))

if __name__ == "__main__":
    main()
