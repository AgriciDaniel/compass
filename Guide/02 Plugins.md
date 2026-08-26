## Named in the video
| Plugin | ID (community) | Used for | Where configured |
| --- | --- | --- | --- |
| **QuickAdd** | `quickadd` | Capture journal entries, wins, gratitude to the daily note; tasks to the master list; ideas to the Kanban backlogs (4:40, 17:51) | `.obsidian/plugins/quickadd/data.json` (8 capture choices, all registered as commands) |
| **Periodic Notes** | `periodic-notes` | Daily, weekly, quarterly notes with their own templates and folders (9:16) | `.obsidian/plugins/periodic-notes/data.json` |
| **Obsidian Tasks** | `obsidian-tasks-plugin` | Inline tasks, `tasks` query blocks on dashboards, people, projects, and the Bible reading callout (14:37) | `.obsidian/plugins/obsidian-tasks-plugin/data.json` |
| **Dataview** (DataviewJS) | `dataview` | Habit dashboard, daily questions widget, wheel of life, projects dashboard (10:47, 18:49) | `.obsidian/plugins/dataview/data.json`, JS enabled |
| **Kanban** | `obsidian-kanban` | One board per writing type (17:44) | Boards in `06 Writing/*/… Board.md` |
| **Bases** (core, Obsidian 1.9+) | built-in | Mike's "on this day" query in the daily note (5:01) | This vault uses a DataviewJS block for "on this day" so the daily note works on any version; a Bases equivalent is in the guide below |

## Added after the video (owner's choices)
| Plugin | ID | Used for | Guide |
| --- | --- | --- | --- |
| **Agent Client** 0.12.1 | `agent-client` | Claude Code inside Obsidian; buttons and embedded chat on the dashboards | [[14 Agent Client and Claude Code]] |
| **SEO** 0.5.6 | `seo` | audit notes in `06 Writing` before publishing | [[16 SEO, Web Viewer, and Vault Lens]] |
| **Omnisearch** 1.30.1 | `omnisearch` | better in-vault search; search provider for the Vault Lens browser extension | [[17 Search Providers]] |
| **Local REST API** 5.1.0 | `obsidian-local-rest-api` | provider for Vault Lens note preview and editing from the browser; general local API | [[17 Search Providers]] |
| **Web viewer** (core) | `webviewer` | browse and clip inside Obsidian | [[16 SEO, Web Viewer, and Vault Lens]] |

## Added to make the template work
| Plugin | ID | Why |
| --- | --- | --- |
| **Templater** | `templater-obsidian` | Mike says "template files"; Periodic Notes needs a template engine for the date math in the weekly/quarterly notes, and the Daily Questions Prompt (writing 1 to 10 answers into properties, his "custom shortcut" at 4:29) is a Templater script. Folder templates auto-apply Project, Person, Retreat, and writing templates. |

Links: QuickAdd https://github.com/chhoumann/quickadd · Periodic Notes https://github.com/liamcain/obsidian-periodic-notes · Tasks https://github.com/obsidian-tasks-group/obsidian-tasks · Dataview https://github.com/blacksmithgu/obsidian-dataview · Kanban https://github.com/mgmeyers/obsidian-kanban · Templater https://github.com/SilentVoid13/Templater

## First open checklist
All ten plugins are **already installed** in `.obsidian/plugins/` (Dataview 0.5.x, Templater 2.25, Periodic Notes 0.0.17, QuickAdd 2.23, Tasks 8.4, Kanban 2.0.51) and listed as enabled in `community-plugins.json`.

1. Settings → Community plugins → **Turn off Restricted mode** (Obsidian asks this once per vault; it is not stored in the vault files). If the plugins do not light up immediately, run the command **Reload app without saving**.
2. Settings → Appearance → CSS snippets → make sure `lifeos` is on (custom callouts: `reading`, `intention`, `memento`, `theme`).
3. Templater: confirm **Trigger Templater on new file creation** and **Folder templates** are on.
4. Periodic Notes: confirm daily `YYYY-MM-DD` → `01 Journal/Daily`, weekly `gggg-[W]ww` → `01 Journal/Weekly`, quarterly `YYYY-[Q]Q` → `01 Journal/Quarterly`, each with its template. The core Daily Notes plugin is off.
5. QuickAdd: confirm the eight choices show and each has the lightning-bolt "command" toggle on. (The dashboard buttons find choices by name, so ids may change.)
6. Dataview: **Enable JavaScript queries** is on (pre-set).
7. Open `00 Dashboards/Compass Dashboard.md`. If a widget says "No … found", that is the empty-state message, not an error.

## Hotkeys (pre-seeded in `.obsidian/hotkeys.json`)
| Keys | Action |
| --- | --- |
| Ctrl/Cmd+Shift+D | Open today's daily note |
| Ctrl/Cmd+Shift+J | Journal entry (timestamped, into today's note) |
| Ctrl/Cmd+Shift+W | Log a win |
| Ctrl/Cmd+Shift+G | Gratitude |
| Ctrl/Cmd+Shift+T | Add task to the master list |
| Ctrl/Cmd+Shift+Q | Daily Questions Prompt (run with today's note open) |

Change them in Settings → Hotkeys. They take effect after a reload.

To update a plugin later use Settings → Community plugins → Check for updates, as usual.

## QuickAdd capture choices (recreate by hand if the seeded config is rejected)
| Name | Capture to | Format | Insert after |
| --- | --- | --- | --- |
| 📝 Journal entry | `01 Journal/Daily/{{DATE:YYYY-MM-DD}}.md` (create with Daily Note template) | `- {{DATE:HH:mm}} {{VALUE}}` | `## Journal` |
| 🏆 Log a win | same | `- {{VALUE}}` | `## Wins` |
| 🙏 Gratitude | same | `- {{VALUE}}` | `## Gratitude` |
| ✅ Add task | `08 Tasks/Tasks.md` | `- [ ] {{VALUE}} ➕ {{DATE:YYYY-MM-DD}}` | `## Inbox` |
| ✉️ Newsletter idea | `06 Writing/Newsletters/Newsletter Board.md` | `- [ ] {{VALUE}}` | `## Backlog` |
| 🎬 Video idea | `06 Writing/YouTube Scripts/YouTube Board.md` | `- [ ] {{VALUE}}` | `## Backlog` |
| 📰 Article idea | `06 Writing/Articles/Article Board.md` | `- [ ] {{VALUE}}` | `## Backlog` |
| 💡 Project idea | `04 Projects/Projects Board.md` | `- [ ] {{VALUE}}` | `## Ideas` |

The dashboard's capture buttons find these choices by name at click time, so you can rename ids freely.

## "On this day" with Bases (optional swap)
Create `Meta/On This Day.base` and embed it in the daily template with `![[On This Day.base]]`:
```yaml
filters:
  and:
    - file.inFolder("01 Journal/Daily")
    - file.name != this.file.name
    - file.name.endsWith(this.file.name.slice(4))
views:
  - type: table
    name: On this day
    order:
      - file.name
    sort:
      - property: file.name
        direction: DESC
```
Bases formula syntax is still evolving; verify against https://help.obsidian.md/bases/functions on your Obsidian version.
