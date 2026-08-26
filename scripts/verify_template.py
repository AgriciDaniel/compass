#!/usr/bin/env python3
"""Gate for a built template folder. Exit 1 on any failure.
    python3 scripts/verify_template.py build/Compass [--json]
"""
import json, os, re, sys, subprocess

FORBIDDEN = [r"agricidaniel", r"/var/home", r"/home/[a-z]", r"/Users/", r"C:\\\\Users", r"@gmail\.com", r"@proton",
             r"BEGIN CERTIFICATE", r"BEGIN RSA", r"privateKey", r"\"apiKey\": \"[A-Za-z0-9]", r"\bsk-[A-Za-z0-9]{8}", r"AKIA[0-9A-Z]{12}", r"xoxb-", r"ghp_[A-Za-z0-9]",
             r"Bearer [A-Za-z0-9]{16}", r"Decision taken 20", r"tested 20\d\d", r"on this machine", "\u2014"]
# Owner-specific names to forbid can be listed one per line in scripts/template/forbidden.local.txt (never shipped).
_local = os.path.join(os.path.dirname(os.path.abspath(__file__)), "template", "forbidden.local.txt")
if os.path.exists(_local):
    FORBIDDEN += [re.escape(l.strip()) for l in open(_local) if l.strip() and not l.startswith("#")]
ALLOW_FILES = {"scripts/verify_template.py", "scripts/build_template.py", "scripts/RELEASE.md"}
SKIP_DIR_PARTS = ("/.obsidian/plugins/",)
DATE_LINK = re.compile(r"^\d{4}-(\d\d-\d\d|W\d\d|Q\d( Personal Retreat)?)$")

def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "build/Compass"
    as_json = "--json" in sys.argv
    results = []
    def check(name, ok, detail=""):
        results.append((name, bool(ok), detail))
    files = []
    for r, _, fs in os.walk(root):
        for f in fs: files.append(os.path.relpath(os.path.join(r, f), root))
    files.sort()
    texts = {}
    for rel in files:
        if any(p in ("/" + rel) for p in SKIP_DIR_PARTS) and not rel.endswith("data.json"): continue
        if rel.endswith((".md", ".js", ".json", ".css", ".py", ".txt", ".yaml", ".yml")):
            try: texts[rel] = open(os.path.join(root, rel), encoding="utf-8").read()
            except Exception: pass
    # forbidden strings
    for pat in FORBIDDEN:
        hits = [rel for rel, t in texts.items() if rel not in ALLOW_FILES and re.search(pat, t)]
        check("no forbidden pattern %r" % pat, not hits, ", ".join(hits[:5]))
    # json asserts
    def load(rel):
        p = os.path.join(root, rel); return json.load(open(p)) if os.path.exists(p) else None
    ra = load(".obsidian/plugins/obsidian-local-rest-api/data.json"); check("REST API settings are exactly enableInsecureServer:true", ra == {"enableInsecureServer": True}, str(ra)[:80])
    ac = load(".obsidian/plugins/agent-client/data.json")
    check("agent-client: no sessions, auto-allow off, no absolute command", ac is not None and ac.get("savedSessions") == [] and ac.get("autoAllowPermissions") is False and not any(str((pa or {}).get("command", "")).startswith("/") for pa in (ac.get("presetAgents") or {}).values()))
    seo = load(".obsidian/plugins/seo/data.json"); check("seo: no scan cache, scan dir set", seo is not None and "cachedGlobalResults" not in seo and "06 Writing" in seo.get("scanDirectories", ""))
    om = load(".obsidian/plugins/omnisearch/data.json"); check("omnisearch: http server off", om is None or (om.get("httpApiEnabled") is False and om.get("DANGER_httpHost") in (None, "")))
    qa = load(".obsidian/plugins/quickadd/data.json"); check("quickadd: no AI keys, online off", qa is not None and qa.get("disableOnlineFeatures") is True and all((p or {}).get("apiKey", "") == "" for p in (qa.get("ai", {}) or {}).get("providers", []) or []))
    cp = load(".obsidian/core-plugins.json"); check("core-plugins: sync off, webviewer on, bases on", cp is not None and cp.get("sync") is False and cp.get("webviewer") is True and cp.get("bases") is True)
    app = load(".obsidian/app.json"); check("app.json: new files in current folder", app is not None and app.get("newFileLocation") == "current")
    # plugin folders
    ids = load(".obsidian/community-plugins.json") or []
    for pid in ids:
        d = os.path.join(root, ".obsidian/plugins", pid)
        check("plugin %s has main.js, manifest.json, LICENSE" % pid, all(os.path.exists(os.path.join(d, f)) for f in ["main.js", "manifest.json", "LICENSE"]))
    # notices match manifests
    notices = texts.get("THIRD_PARTY_NOTICES.md", "")
    for pid in ids:
        m = os.path.join(root, ".obsidian/plugins", pid, "manifest.json")
        if os.path.exists(m):
            v = json.load(open(m))["version"]; check("notices list %s %s" % (pid, v), ("| %s | %s |" % (pid, v)) in notices)
    # referenced paths resolve
    def exists(rel): return os.path.exists(os.path.join(root, rel))
    tp = load(".obsidian/plugins/templater-obsidian/data.json") or {}
    for ft in tp.get("folder_templates", []): check("templater folder template %s" % ft.get("template"), exists(ft.get("template", "")) and exists(ft.get("folder", "")))
    pn = load(".obsidian/plugins/periodic-notes/data.json") or {}
    for k in ["daily", "weekly", "quarterly"]:
        c = pn.get(k, {}); check("periodic-notes %s folder and template exist" % k, (not c.get("enabled")) or (exists(c.get("folder", "")) and exists(c.get("template", ""))))
    for ch in (qa or {}).get("choices", []):
        target = re.sub(r"\{\{DATE:[^}]*\}\}", "2000-01-01", ch.get("captureTo", ""))
        ok = (not target) or exists(target) or (ch.get("createFileIfItDoesntExist", {}).get("enabled") and exists(os.path.dirname(target)))
        check("quickadd capture target %s" % ch.get("name"), ok, target)
        t = ch.get("createFileIfItDoesntExist", {}).get("template", "")
        if t: check("quickadd template %s" % t, exists(t))
    for rel, t in texts.items():
        if not rel.endswith(".md"): continue
        for m in re.finditer(r'"new-note-template":"([^"]+)"', t): check("kanban template in %s" % rel, exists(m.group(1)), m.group(1))
    wv = load(".obsidian/webviewer.json") or {}
    if wv.get("markdownPath"): check("webviewer markdownPath exists", exists(wv["markdownPath"]))
    # content asserts
    for rel in files:
        if rel.endswith(".md") and any(rel.startswith(u) for u in ["01 Journal/", "02 Retreats/", "04 Projects/", "05 People/", "06 Writing/", "07 Library/"]) and not rel.endswith(" Board.md"):
            t = texts.get(rel, ""); fm = re.match(r"^---\n(.*?)\n---", t, re.S)
            check("user-folder note tagged example: %s" % rel, bool(fm) and re.search(r"^\s*-\s*example\s*$", fm.group(1), re.M) is not None)
    cfg = texts.get("Meta/Compass Config.md", ""); check("config birthdate empty", re.search(r"^birthdate:\s*$", cfg, re.M) is not None)
    check("Life Theme is template text", "Replace this line with your life theme" in texts.get("03 Planning/Life Theme.md", ""))
    check("Core Values is template text", "**Value one**" in texts.get("03 Planning/Core Values.md", ""))
    check("wiki log empty", re.sub(r"^---.*?---\n", "", texts.get("wiki/log.md", ""), flags=re.S).strip().endswith("Newest completed operations appear first."))
    plan_body = re.sub(r"```.*?```", "", texts.get("09 Reading/Reading Plan.md", ""), flags=re.S)
    check("reading plan has no tasks", not re.search(r"^- \[ \]", plan_body, re.M))
    for rel, t in texts.items():
        if rel.startswith("01 Journal/Weekly/"):
            m = re.search(r"^week:\s*(\S+)", t, re.M); check("weekly note week property matches name: %s" % rel, m and m.group(1) == os.path.basename(rel)[:-3])
    for bad in ["wiki/concepts", "wiki/sources", "wiki/entities", "wiki/questions", ".vault-meta", ".raw", ".mcp.json", ".claude/settings.local.json", ".obsidian/plugins/agent-client/sessions", "Untitled.canvas", "08 Tasks/Untitled.base", "Guide/18 Distribution Checklist.md"]:
        check("absent: %s" % bad, not exists(bad))
    for led in ["wiki/meta/ledgers/source-ledger.json", "wiki/meta/ledgers/claim-ledger.json"]:
        d = load(led); check("ledger empty: %s" % led, d is not None and not (d.get("sources") or d.get("claims")))
    check("inbox empty", [f for f in files if f.startswith("inbox/") and not f.endswith(".gitkeep")] == [])
    if ".obsidian/workspace.json" in texts: check("workspace.json opens Setup", "00 Dashboards/Setup.md" in texts[".obsidian/workspace.json"])
    for must in ["AGENTS.md", "CLAUDE.md", "GEMINI.md", ".mcp.example.json", "LICENSE", "THIRD_PARTY_NOTICES.md", "CREDITS.md", "CHANGELOG.md", "Meta/version.md", "00 Dashboards/Setup.md", "Prompts/16 Onboarding Assistant.md"]:
        check("present: %s" % must, exists(must))
    check("CLAUDE.md and GEMINI.md import AGENTS.md", "@AGENTS.md" in texts.get("CLAUDE.md", "") and "@AGENTS.md" in texts.get("GEMINI.md", ""))
    # wikilinks resolve
    names = {os.path.basename(f)[:-3] for f in files if f.endswith(".md")}
    unresolved = {}
    for rel, t in texts.items():
        if not rel.endswith(".md") or rel.startswith("Guide/Source"): continue
        body = re.sub(r"```.*?```", "", t, flags=re.S); body = re.sub(r"`[^`\n]*`", "", body); body = re.sub(r"<%.*?%>", "", body, flags=re.S)
        for m in re.finditer(r"\[\[([^\]\|#]+)(?:#[^\]\|]*)?(?:\|[^\]]*)?\]\]", body):
            tgt = m.group(1).strip()
            if tgt in names or DATE_LINK.match(tgt) or tgt.endswith(".base"): continue
            unresolved.setdefault(tgt, []).append(rel)
    check("all wikilinks resolve (except periodic dates)", not unresolved, "; ".join("%s <- %s" % (k, v[0]) for k, v in list(unresolved.items())[:8]))
    # js syntax
    for rel in files:
        if rel.startswith("Meta/views/") and rel.endswith(".js"):
            src = texts.get(rel, "")
            r = subprocess.run(["node", "-e", "new (Object.getPrototypeOf(async function(){}).constructor)('dv','input','moment','app','Notice', require('fs').readFileSync(process.argv[1],'utf8'))", os.path.join(root, rel)], capture_output=True, text=True)
            check("js syntax %s" % rel, r.returncode == 0, r.stderr[-200:])
    total = sum(os.path.getsize(os.path.join(root, f)) for f in files)
    check("total size under 20 MB", total < 20e6, "%.1f MB" % (total / 1e6))
    failed = [r for r in results if not r[1]]
    if as_json: print(json.dumps([{"check": n, "ok": ok, "detail": d} for n, ok, d in results], indent=1))
    else:
        for n, ok, d in results:
            if not ok: print("FAIL", n, ("(" + d + ")") if d else "")
        print("%d passed, %d failed" % (len(results) - len(failed), len(failed)))
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
