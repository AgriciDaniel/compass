Data entry is checkbox properties in the daily note (`habit_*`). No app, no notifications, no streak shame. This page only visualizes what is already there, and the habit sits next to the journal entry that explains why you missed it.

## Last 8 weeks
```dataviewjs
await dv.view("Meta/views/habits", { days: 56 });
```

## Last 2 weeks
```dataviewjs
await dv.view("Meta/views/habits", { days: 14 });
```

## Changing the habits you track
1. Open [[Compass Config]].
2. Add or remove entries in the `habits` list (keep the `habit_` prefix).
3. Done. New daily notes carry the new checkbox, and this dashboard picks it up automatically.

Track a small set per season (3 to 5). Tracking honestly beats tracking perfectly.

## Ask
```agent
type: button
text: "Trends in my questions and habits"
prompt: "Read Prompts/13 Trend Analysis.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```
