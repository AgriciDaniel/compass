Plugin: Kanban 2.0.51 (`obsidian-kanban`, repo now at https://github.com/community-archive/obsidian-kanban, formerly mgmeyers). Boards are plain markdown: each `## Heading` is a lane, each `- [ ]` line is a card, so every board stays searchable, linkable, and readable without the plugin.

## Boards in this vault
| Board | Lanes | Feeds from |
| --- | --- | --- |
| `04 Projects/Projects Board` | Ideas → This quarter → In progress → Waiting on someone → Done | QuickAdd **Project idea**; cards link to project notes |
| `06 Writing/Newsletters/Newsletter Board` | Backlog → Outlining → Drafting → Editing → Ready to publish → Published | QuickAdd **Newsletter idea** |
| `06 Writing/YouTube Scripts/YouTube Board` | same | QuickAdd **Video idea** |
| `06 Writing/Articles/Article Board` | same | QuickAdd **Article idea** |
| `06 Writing/Course Content/Course Board` | same | manual |

## How it is wired
- Global defaults in `.obsidian/plugins/obsidian-kanban/data.json`: dates typed with `@` (for example `@{2026-09-30}`) link to the daily note, relative dates shown, archive stamps the date.
- Each board's own settings (the `%% kanban:settings %%` block at the bottom) set **New note folder** and **Note template**, so "convert card to note" from the Newsletter board creates a note in `06 Writing/Newsletters` from `Templates/Newsletter.md`.
- `Meta/views/boards.js` reads every note with `kanban-plugin` in its properties and shows lane counts. It is on the [[Compass Dashboard]] (compact) and in full on [[Boards]]. Lanes named in `board_done_lanes` (config) count as finished.

## Practices (from the video, 17:42)
- One board per type of work, in that type's folder. Capture to the backlog; drag left to right; the card reaches Published only when the thing is actually out.
- Cards are pointers. The work lives in the note the card links to (task notes), not in the card text.
- Archive done cards at the retreat so the board stays a picture of now.

## Maintenance note for the template
The plugin's README says it is looking for new maintainers. It works on current Obsidian and the format is plain markdown, so the risk is low: if it ever breaks, the boards remain readable lists and can be moved to another board plugin (e.g. a Bases board view) without data loss.
