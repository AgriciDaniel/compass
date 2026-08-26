Every Kanban board in the vault, read live from the board files. Cards move left to right; the last lane (Done or Published) counts as finished. Boards are just markdown, so the QuickAdd "idea" commands append straight into a Backlog lane.

```agent
type: button
text: "Groom my boards"
prompt: "Read Prompts/09 Board Grooming.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```

## Overview
```dataviewjs
await dv.view("Meta/views/boards", { compact: true });
```

## Projects
```dataviewjs
await dv.view("Meta/views/boards", { folder: "04 Projects" });
```

## Writing
```dataviewjs
await dv.view("Meta/views/boards", { folder: "06 Writing" });
```

## Adding a board
1. Create a note anywhere, open the command palette, run **Kanban: Create new board** (or add `kanban-plugin: board` to the properties).
2. Name the lanes. Put finished-state lanes last and call them `Done` or `Published` so the widget counts them as done (edit `board_done_lanes` in [[Compass Config]] to change that list).
3. Optional: in the board's settings set "New note folder" and "Note template" so cards turned into notes use the right template.
