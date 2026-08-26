# Changelog

Format: Added, Changed, Templates (manual merge notes), Plugins, Breaking. Semver: major = path or property rename, minor = new widget or workflow, patch = docs and fixes.

## 1.0.1 (2026-08-26)
Fixes from the full post-publication review. Everyone on 1.0.0 should re-download; the daily note template in 1.0.0 did not create the question and habit properties.

### Fixed
- `Templates/Daily Note.md` and `Templates/Personal Retreat.md`: the property generator contained a literal line break inside a JavaScript string, so Templater failed and new notes had no `dq_*`, `habit_*`, or `wheel_*` properties. The verify gate now simulates both generators.
- Quarterly note embedded `#Intentions for next quarter`; the retreat heading is `## 5. Intentions for next quarter`. The verify gate now checks every heading fragment in links.
- Navigation links in daily, weekly, quarterly, and retreat templates now carry the folder path, and Templater folder templates cover `01 Journal/Daily`, `Weekly`, `Quarterly`, so clicking a not-yet-existing period note creates it in the right folder from the right template.
- Setup checklist no longer marks the Agent Client path and the reading module as done on a fresh copy.
- `SECURITY.md` reporting section, `Guide/02` QuickAdd count and button mechanics, `Guide/14` prerequisites (Node.js) and Flatpak wrapper instructions, `Guide/19` reference to `AGENTS.md`, prompt 02 and 07 input lists, README tree.

### Added
- `LICENSE` is plain MIT (GitHub detects it); Guide prose license moved to `LICENSE-GUIDE.md`. `CODE_OF_CONDUCT.md`, pull request template. Repository Discussions enabled.
- Build drops any non-Markdown file in personal folders; verifier ignores `.git` when measuring size.

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
