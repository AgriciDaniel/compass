# Release checklist (maintainers)

The build script does most of this; the list is what it enforces.

```bash
python3 scripts/build_template.py --out build --zip        # clean copy + verify + zip
python3 scripts/verify_template.py build/Compass            # re-run the gate on any folder
```

Manual version of the rules, kept for review:

1. Delete every note tagged `example` (daily seed notes, 2026-W33/W34/W35, 2026-Q3, the 2026-Q3 retreat, example project, person, book note, newsletter) or leave them and say so in the README. Decide once.
2. Reset `Meta/Compass Config.md` `birthdate` to a placeholder, and `03 Planning/*` to the template text.
3. Remove `.obsidian/workspace.json`, `.obsidian/workspace-mobile.json`, and `.vault-meta/` (claude-obsidian journal). Make sure `wiki/hot.md`, `wiki/log.md`, `wiki/index.md` still contain template text, not your own session history.
3b. Decision taken 2026-08-26: Local REST API ships **enabled** (HTTP 27123, loopback, per-install key). See `Guide/17`.
4. Run the release gate: `python3 scripts/verify_template.py build/Compass` must print zero failures. Then confirm no other plugin `data.json` contains secrets or machine paths:
5. Decision taken 2026-08-26: **ship the plugin binaries** so members get a working vault on first open (owner tests each plugin in this copy). Re-check this when a plugin releases a security fix. Background: ship plugin binaries in `.obsidian/plugins/` (members get a working vault on first open, but you are redistributing third-party code and pinning versions) or ship only `community-plugins.json` plus this guide (members install from the catalog, always current). Licences: Dataview MIT, Templater AGPL-3.0, Periodic Notes MIT, QuickAdd MIT, Tasks MIT, Kanban MIT, Omnisearch GPL-3.0, Local REST API MIT, Agent Client Apache-2.0, SEO MIT. Redistribution of the release artefacts is permitted by all of them with the licence files included; check each repo's LICENSE before shipping.
5b. Make sure there is no `.mcp.json` (only `.mcp.example.json`) and no `.claude/settings.local.json`; the shipped `.claude/settings.json` holds only the read-only tool allowlist.
6. Grep the tree for your name, email, and absolute paths: `grep -rn "agricidaniel\|/var/home" --exclude-dir=.obsidian .`
7. Open the zipped copy in a fresh vault on another machine (or a second user account) and walk `Guide/00 Start Here.md` top to bottom.
