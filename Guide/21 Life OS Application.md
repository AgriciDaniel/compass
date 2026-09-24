# Life OS Application

Life OS is the native application layer above the Compass vault. It makes the vault feel like one coherent operating system while Markdown and frontmatter remain the canonical data. There is no second database and no cloud dependency.

## Open it

Life OS opens automatically after Obsidian finishes loading the vault. Use `Ctrl/Cmd+Shift+L`, the compass ribbon icon, or run **Life OS: Open Life OS home** to reopen it. `Ctrl/Cmd+Shift+C` opens universal Capture. Every module also has a **Life OS: Open...** command that can be assigned a hotkey in Obsidian. If the application is missing after an upgrade, run **Reload app without saving** once.

## Application map

| Module | Purpose | Canonical data |
| --- | --- | --- |
| Home | Fast orientation, capture, planning, and AI entry | dashboard and workflow links |
| Today | Daily questions, habits, journal, wins, gratitude, tasks | today's daily-note properties and QuickAdd |
| Plan | Daily, weekly, quarterly, retreat, projects, ideal week | periodic and planning notes |
| Focus | Commitments competing for attention | Tasks and project dashboards |
| Review | Evidence across days and quarters | daily properties and periodic reviews |
| Projects | Active outcomes and project ideas | `04 Projects/` and its Kanban board |
| People | Relationships and discussion queues | `05 People/` and `#discuss` tasks |
| Create | Newsletter, video, article, and course pipelines | `06 Writing/` boards |
| Library | Reading, books, sources, and connected notes | `07 Library/` and `09 Reading/` |
| AI | Retrieval, triage, drafting, and setup | Assistant dashboard, prompts, Agent Client, MCP |

## Brain graph

Choose Brain in the Life OS navigation or run **Life OS: Open Life OS Brain**. The view places notes in five colored regions inside a rotatable brain shape. Drag to rotate, scroll to zoom, or use arrow keys and plus/minus while the canvas has focus. Search or use the region filters, select a node, then open it or browse its linked notes in the side panel. Standard graph opens Obsidian's original Graph view.

Nodes come from the current vault, and connections come exclusively from Obsidian's resolved links. No SEO OS client data is imported. Background hemisphere wires are decorative, not relationships. Sample notes are labeled. Templates, build copies, scripts, Guide, and Meta are omitted. The scene displays at most 2,000 notes and 10,000 links and reports when a limit applies. It renders on interaction without continuous animation or external dependencies.

## Privacy and authority

Home keeps orientation short: up to three tasks needing attention, capture, connected horizons, and a compact recorded-signal summary. Today shows up to five attention tasks. Attention means overdue, due today, scheduled today, or high priority. The full task dashboard remains available.

Review holds three property-based charts: daily effort, a habit calendar, and life-area scores from the latest scored retreat. Select 7, 30, or 90 days for daily charts. Recorded daily effort columns open their source notes with click, Enter, or Space. A disclosure table provides daily values, and the retreat button opens the source of life-area scores. Sample notes are excluded by default; the Include samples control explicitly adds them. Missing scores stay blank and habits distinguish unchecked from unrecorded. Effort averages use recorded numeric scores from 1 to 10. Record counters exclude templates and build copies. See [[22 Data Definitions]] for coverage and calculation details.

Plan includes a six-week month calendar. Highlighted dates open existing daily notes. Today can invoke the existing QuickAdd capture when its note is missing. Other empty dates are disabled. Month navigation never generates notes or edits journal content.

The application version is 0.20.0. Synthetic browser checks are not native Obsidian acceptance. Complete [[23 Native Acceptance]] before treating a packaged candidate as release-ready.

## Minimal visual summaries

- Home's transparent Brain preview is non-animated and capped at 300 alphabetically selected eligible notes. Its connections only describe that subset, not the entire vault. Sample counts remain visible. Explore Brain opens the full module in the same tab and keeps the sidebar.
- Focus groups each indexed open task exactly once: overdue first, then today, upcoming, or unscheduled/other. High priority remains visible in the feed but is not a second overlapping count. Past scheduled dates without a current due date fall into Other.
- Create selects one content pipeline at a time. Lane labels come from the board's actual level-two headings. Counts represent indexed checkbox items in each lane, including checked items, not completion percentages. Missing metadata and sample boards have explicit unavailable/excluded states. Open board edits in the original Kanban surface; lane buttons open the source heading.
- Library lists typed notes under `07 Library/`, including completed books and sources, and filters by actual type and status properties. Samples remain excluded. Missing status is shown as not set, not inferred as ready. A `cover` property can reference an existing local PNG, JPEG, WebP, or GIF, including a wikilink. Remote covers are never requested; unavailable covers use a text fallback.
- AI shows an integration overview and observable configuration. It does not test provider authentication or send requests. An available key is not evidence of a working connection.

The top-bar View menu controls optional visuals globally or for the current module, compact/comfortable spacing, and 3/6/12 items for record and Focus lists. Home and Today keep their attention limits of three and five. Controls apply to the current open view only and reset when that view is recreated. Restore view defaults resets display choices without editing any vault configuration. Persisted presets and additional property mappings are not implemented.

Home uses a consistent section gap, quieter primary actions, and a compact setup notice. System status remains in AI rather than being duplicated at the bottom of Home. Planning labels report notes created, not planning completion.

Today shows recorded-property coverage, not a life score. Focus workload segments use the same mutually exclusive categories as its filters. Projects and People counts require explicit `#project/<slug>` or `#p/<slug>` tags in indexed open tasks. People discussions also require `#discuss`. A task tagged to several people can appear for each person; the queue counts person-discussion links, not unique tasks. Slugs follow the existing convention: lowercase, non-letter and non-digit characters to hyphens, with Unicode letters kept. Untagged tasks are not assigned by inference.

Create shows up to three indexed open-item previews in each lane, while its heading count still includes all indexed checkbox items, including checked items. Source-line links open the original board. Missing and partial indexes remain visible. AI's diagram distinguishes the provider path from optional local MCP tools; neither branch implies a tested live connection.

The live Today cockpit reads configured `dq_*` and `habit_*` frontmatter through Obsidian's local metadata cache. It does not render or send journal prose. Capture buttons run the existing QuickAdd commands so routing stays visible and deterministic. Universal Capture can also create actual Project, Person, newsletter, video-script, article, course-lesson, book, and study notes from the canonical templates, leaving an existing same-name note untouched.

AI may retrieve, summarize, detect patterns, and draft. Human approval is the operating policy, not a universal enforcement guarantee. The AI module reports the observable Agent Client permission setting; it does not change it. The application does not contain direct network, process, or vault-write capabilities.

## Architecture

The first-party plugin lives at `.obsidian/plugins/life-os-app/`. `main.js` registers the dashboard ItemView and a compatibility standalone Brain view. A shared child component renders the embedded Brain and Home preview, releasing listeners and observers on removal. `styles.css` owns the responsive visual system, and `manifest.json` carries its independent version. The view refreshes when metadata changes or Markdown files are created, deleted, or renamed.

The application deliberately composes the existing tools:

- QuickAdd owns capture and periodic-note creation.
- Templater owns note structure and the guided Daily Questions prompt.
- Tasks, Dataview, and Kanban own their mature query and board surfaces.
- Agent Client and Local REST API provide the governed AI path.
- Markdown, links, and frontmatter remain portable if the application plugin is disabled.

## Verification

Run `node scripts/verify_life_os_app.mjs .` for the focused application gate. The complete template build also runs this gate through `scripts/verify_template.py`. Static and mock-runtime verification do not replace checking the view inside Obsidian after a reload.

## Build direction

The implementation sequence is vertical: make one module truly useful with real local data, verify it, then expand. Today is the first live cockpit. The remaining modules can gain richer native summaries without changing their canonical files or bypassing the existing approval boundary.
