# Changelog

Format: Added, Changed, Templates (manual merge notes), Plugins, Breaking. Semver: major = path or property rename, minor = new widget or workflow, patch = docs and fixes.

## Unreleased

### Simplified Chinese support
- Keep the language selector and toolbar controls visible in narrow Obsidian panes inside wide windows, and stack the embedded Brain details below its drawing area. Browser checks cover 390px panes in both languages while allowing the navigation rail to scroll within its own container.
- Review all 411 Chinese interface messages and four Chinese onboarding documents against their English source and rendering context. Correct newsletter and graph-label terminology, task and board count descriptions, authorization wording, and instructions for customizing existing questions without replacing their keys.
- Add a Chinese README, quick-start guide, configuration/localization guide, and bilingual terminology glossary, with links back to the canonical English documentation.
- Add an English/Simplified Chinese language selector to the Life OS top bar with persisted selection and English fallback. Language changes affect application text while canonical paths, properties, commands, and user content remain unchanged. Existing Markdown dashboards, templates, and AI prompts retain their current language.
- Document safe translation of daily question text without renaming existing property keys, and distinguish personal configuration from clean build defaults. Native Obsidian acceptance remains required before release.

### Release preparation hardening
- Skip live personal defaults before staging; rebuild canonical boards empty instead of copying live cards; remove the arbitrary Board.md exemption; reset core machine state and omit local agent directories.
- Add disposable archive restore verification with checksum, traversal, duplicate-path, file-type, inventory, and per-file integrity checks. Eleven release-safety tests cover core rejection paths.
- Update acceptance evidence for application 0.20.0 and separate owner-reported testing from reproducible automated checks. Native workflows, personal backup recovery, provider authentication, and redistribution provenance remain separate gates.

### Application 0.20.0 candidate
- Muted copper emphasis replaces bright orange primary buttons. Shared section gaps and card spacing apply across modules, with narrow-pane adjustments. Home's duplicate bottom Assistant banner and system summary are removed; setup is a compact notice near the top.
- Today adds a recorded-property meter, Focus adds clickable workload segments, Projects shows explicit routing-tag task counts, and People has a tagged discussion queue. Missing or partial task indexes are disclosed.
- Create adds up to three indexed open-item previews per actual board lane. Library supports typed sources, status/type filters, existing local raster covers and text fallbacks, with no remote cover requests. AI has separate provider and optional local-tool branches.
- Per-module optional-visual controls complement the global switch. Preferences remain session-only. Ten-module browser checks cover spacing, narrow widths, source navigation, new summaries, and a light-theme smoke check. Native acceptance and release remain open.

### Application 0.19.0 candidate
- Home has a transparent, non-animated Brain preview beside Now. It shows at most 300 notes, labels sample counts, and opens the full Brain inside the same dashboard with navigation preserved.
- Focus provides mutually exclusive task groups; Create summarizes one selected board's actual level-two lanes; Library retains finished books and filters by recorded status; AI includes a configuration map without claiming live connectivity.
- View controls hide optional visuals, change record/Focus list limits, select compact or comfortable spacing, and restore defaults. Controls are in-memory per view, not persisted to vault or AI settings.
- Browser checks cover preview cleanup, full Brain navigation, group filtering, board counts and source links, completed books, and narrow module widths. No personal records or live AI settings changed; no new plugins installed.

### Application 0.18.0 candidate
- Simplified Home to attention, capture, horizons, and compact signals. Full analytics now live in Review. Added local Plan month navigation, daily-note links, keyboard-operable effort source links, a daily values table, and scored-retreat navigation.
- Strict score validation, separate habit completion and recorded coverage, configurable folder handling, metadata-backed task indexing, unresolved status reporting, sample exclusions, and task source-line navigation.
- Assistant workflows explicitly prepare without auto-send. Privacy guidance distinguishes context sharing and operating policy from technical enforcement.
- Hardened local candidate building with fresh external destinations, sanitize-before-copy settings, symlink rejection, embedded checksums, archive validation, and live-vault verification preflight. No public release or native acceptance is claimed.
- Added synthetic dashboard interactions, Brain regression checks, assistant contracts, and release-safety tests. No new community plugins installed and no personal records changed.

### Added
- Life OS Brain: a rotatable brain-shaped graph of the vault's resolved links, with region filters, search, connected-note browsing, zoom, keyboard controls, and note opening. Standard Obsidian Graph view remains available.
- Review analytics: 7/30/90-day effort charts, habit calendar, and latest retreat life-area scores, with explicit sample-data control and missing-data states. Tasks and planning horizons appear directly on Home.
- Scoped button sizing and container-responsive layouts correct clipped descriptions and overlapping cards in Obsidian panes.
- First-party Life OS application plugin with a native Home view, persistent navigation for Today, Plan, Focus, Review, Projects, People, Create, Library, and AI, a universal capture router, live system summary, responsive layout, and approval-aware AI messaging.
- Privacy-preserving Today cockpit that reads only configured question and habit properties, reports completion, and opens the existing guided check-in workflows.
- Live refresh on metadata, create, delete, and rename events, plus automatic opening as the primary surface after Obsidian finishes loading the vault.
- Native live panels for connected planning horizons, seven-day review signals, active projects, people, books, and creative pipeline counts.
- Native commitment feed for Today and Focus, ranked by overdue, due-today, and high-priority state from the canonical task, project, and people files.
- Home-level system telemetry and an AI control center that separates local capability availability from authentication and live connection state.
- Command-palette entry points for every application module and the universal Capture modal, ready for user-defined hotkeys.
- Task ranking now treats scheduled-today work as immediate and recognizes both high and highest Tasks priorities.
- Configuration entry points in the application top bar and command palette, opening the canonical Compass Config note.
- Home onboarding banner that follows the canonical Setup note status and disappears only when onboarding is marked complete.
- Debounced live refresh now includes body modifications, keeping the commitment feed current without redundant re-indexing bursts.
- Setup now treats Life OS as a required application component and accepts any configured local Agent Client provider. The AI control center distinguishes installed tooling from configured sessions and local server state.
- Commitment indexing now tolerates individual unreadable files, reports partial coverage, and sorts scheduled work deterministically.
- Vault-local hotkeys for opening Life OS (`Mod+Shift+L`) and universal Capture (`Mod+Shift+C`).
- First-class New Project and New Person template inputs in universal Capture and the corresponding native modules, with collision-safe existing-note behavior.
- Template-backed creation for newsletter drafts, video scripts, articles, and course lessons from universal Capture and the native Create module.
- Universal Capture is grouped into Quick capture, Ideas, and Create notes for a faster, scalable input surface.
- Template-backed New Book and New Study Note inputs complete the Library creation path.
- `scripts/verify_life_os_app.mjs` validates the application manifest, command and path contracts, styles, capabilities, screen rendering, capture modal, and view activation. The release gate now runs it against every built template.

### Fixed
- Restored `04 Projects` as a top-level folder so Templater, QuickAdd, dashboard links, Kanban note creation, and the documented folder contract agree again. Existing project content was moved without rewriting it.

## 1.0.2 (2026-08-27)
### Fixed
- Note creation no longer depends on Templater's on-create trigger, which does not fire reliably when Periodic Notes creates a note (the note then shows raw `<%` code and has no properties). Ctrl/Cmd+Shift+D, Ctrl/Cmd+Alt+W, Ctrl/Cmd+Alt+Q, and "New personal retreat" are QuickAdd template commands that create the note in the right folder, run Templater, and open it (or just open it if it exists). Periodic Notes and Calendar remain for navigation. Setup, Guide 02, AGENTS.md, and prompts 01 and 16 updated.

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
