This vault is a from-scratch template of everything Mike Schmitz describes in **"How I Run My Whole Life Out of Obsidian"** (Practical PKM, 26 Jun 2026): https://www.youtube.com/watch?v=-h7ZAuuNDLE. Independent implementation; see `CREDITS.md`.

New here? Open [[Setup]] first. It has the status checklist and the day-1, week-1, month-1 plan. This page is the map.

Seven workflows, one vault, dashboards on top:

| # | Workflow | Where it lives | Guide |
| --- | --- | --- | --- |
| 1 | Journaling with Daily Questions | `01 Journal/Daily`, `Templates/Daily Note.md`, `Templates/Daily Questions Prompt.md`, questions in `Meta/Compass Config.md` | [[03 Workflow - Journaling and Daily Questions]] |
| 2 | Quarterly personal retreat | `02 Retreats`, `Templates/Personal Retreat.md` | [[04 Workflow - Personal Retreat]] |
| 3 | Multi-scale planning | `01 Journal/{Daily,Weekly,Quarterly}`, `03 Planning` | [[05 Workflow - Multi-Scale Planning]] |
| 4 | Habit tracking | `habit_*` properties in the daily note, `00 Dashboards/Habit Canvas.md` | [[06 Workflow - Habit Tracking]] |
| 5 | Daily reading (Bible as the worked example) | `09 Reading` | [[07 Workflow - Daily Reading]] |
| 6 | Task management | `08 Tasks/Tasks.md`, `04 Projects`, `05 People`, `00 Dashboards/Task Dashboard.md` | [[08 Workflow - Task Management]] |
| 7 | Writing | `06 Writing/*` with Kanban boards | [[09 Workflow - Writing]] |
| + | Compass dashboard | `00 Dashboards/Compass Dashboard.md`, `Meta/views/*.js` | [[10 Compass Dashboard]] |
| + | Kanban boards | `04 Projects/Projects Board.md`, `06 Writing/*/… Board.md`, `00 Dashboards/Boards.md` | [[13 Kanban Boards]] |
| + | AI in the vault | `AGENTS.md`, `Prompts/`, `00 Dashboards/Assistant.md` | [[14 Agent Client and Claude Code]], [[20 Prompt Library]] |
| + | Knowledge layer (claude-obsidian) | `wiki/`, `inbox/`, `wiki/routing-map.md` | [[15 claude-obsidian]] |
| + | Research and publishing | Web viewer, SEO, Vault Lens | [[16 SEO, Web Viewer, and Vault Lens]], [[17 Search Providers]] |
| + | Obsidian MCP bridge | Local REST API `/mcp`, `.mcp.example.json` | [[19 Obsidian MCP Bridge]] |

Read next: [[01 Principles]] (the ideas behind it), [[02 Plugins]] (what is installed and the first-open checklist), [[11 Build Order]] (why one layer at a time), [[12 Resources and Links]].

## Layering rule
Everything shown took the original author five years. Pick one workflow, probably the daily journaling, get it working for 30 days, then layer the next one. [[Setup]] enforces that order.

## Maintainers
Releases are built with `scripts/build_template.py` and gated by `scripts/verify_template.py`; see `scripts/RELEASE.md`.
