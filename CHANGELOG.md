# Changelog

Format: Added, Changed, Templates (manual merge notes), Plugins, Breaking. Semver: major = path or property rename, minor = new widget or workflow, patch = docs and fixes.

## 1.0.0 (2026-08-26)
First public template.

### Added
- Seven workflows from the video: daily questions, personal retreat, multi-scale planning, habits, daily reading, tasks, writing boards; Compass, Habit Canvas, Daily Questions, Task, Projects, Boards, Assistant, Setup dashboards.
- `Meta/Compass Config.md` as the single config: questions, habits, wheel areas, folders, prefixes, birthdate.
- `AGENTS.md` (canonical agent instructions), `CLAUDE.md` and `GEMINI.md` pointers, `Prompts/` library (16 jobs), `.claude/settings.json` read-only allowlist.
- Obsidian MCP bridge (Local REST API `/mcp`), Agent Client integration, Vault Lens provider, Web viewer, SEO, Omnisearch, claude-obsidian knowledge layer (`wiki/`).
- `scripts/build_template.py` and `scripts/verify_template.py` for releases; `THIRD_PARTY_NOTICES.md`, `CREDITS.md`, `LICENSE`.

### Council decisions recorded
- Public name changed from the working name "LifeOS" to **Compass** (owner decision after the council). Internal ids (`lifeos-*` QuickAdd choices, CSS classes, snippet name) are unchanged on purpose.
- Generalize the Bible module to `09 Reading` with Bible as the worked example (dissent: keep `09 Bible` and offer a build variant).
- Ship plugin binaries with license copies (dissent: ship only the plugin list).
- Local REST API enabled by default on loopback with a per-install key (dissent: installed, not enabled).
- Daily notes carry no agent buttons (dissent: put morning and evening buttons in the daily template).
- `AGENTS.md` canonical rather than `CLAUDE.md` (dissent: keep the documented name).

### Plugins
dataview, templater-obsidian, periodic-notes, quickadd, obsidian-tasks-plugin, obsidian-kanban, omnisearch, obsidian-local-rest-api, agent-client, seo (versions in `Meta/version.md`).
