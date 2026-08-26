---
cssclasses:
  - lifeos-dashboard
---
Everything below is generated from the notes you already write. Change the daily note template, the retreat note, or the config and this page follows. You never touch this code.

```dataviewjs
await dv.view("Meta/views/quicklinks");
```

> [!theme] Life theme
> ![[Life Theme#Theme]]

## Wheel of life (this quarter's retreat)
```dataviewjs
await dv.view("Meta/views/wheel");
```

## Daily questions
Lines and averages of every `dq_*` property in the daily notes. Toggle questions, pick a time frame.
```dataviewjs
await dv.view("Meta/views/dailyquestions", { days: 30 });
```

## Habits
```dataviewjs
await dv.view("Meta/views/habits", { days: 21 });
```

## Boards
```dataviewjs
await dv.view("Meta/views/boards", { compact: true });
```

## Memento mori
```dataviewjs
await dv.view("Meta/views/memento");
```

## Ask
Open [[Assistant]] for the full prompt library, or fire one of these (needs the Agent Client plugin and a configured agent):
```agent
type: button
text: "What matters today"
prompt: "Read Prompts/14 What Matters Today.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```
```agent
type: button
text: "Review this week"
prompt: "Read Prompts/03 Weekly Review.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```

## Related dashboards
- [[Habit Canvas]]
- [[Daily Questions]]
- [[Task Dashboard]]
- [[Projects Dashboard]]
- [[Boards]]
- [[Assistant]]
- [[Setup]]
- [[Ideal Week]] · [[Core Values]] · [[Life Theme]]
