"Did I do my best to ..." rated 1 to 10, from Marshall Goldsmith's *Triggers*. Effort, not results: a slow 3-mile run while sick can be a 10; cutting a planned 12-miler to 6 because you did not feel like it can be a 5.

Questions are the `dq_*` number properties in the daily note. Edit the `questions` list in [[Compass Config]]; new daily notes and the end-of-day prompt follow it.

## Trend
```dataviewjs
await dv.view("Meta/views/dailyquestions", { days: 90 });
```

## Days answered
```dataviewjs
const cfg = dv.page("Meta/Compass Config") || {};
const folder = cfg.daily_folder || "01 Journal/Daily", pre = cfg.dq_prefix || "dq_";
const pages = dv.pages(`"${folder}"`).where(p => /^\d{4}-\d{2}-\d{2}$/.test(p.file.name)).sort(p => p.file.name, "desc").array();
const keys = [...new Set(pages.flatMap(p => Object.keys(p.file.frontmatter || {}).filter(k => k.startsWith(pre))))].sort();
const label = k => k.slice(pre.length).replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const val = (p, k) => { const v = (p.file.frontmatter || {})[k]; return v === null || v === undefined || v === "" ? "" : String(v); };
const rows = pages.filter(p => keys.some(k => val(p, k) !== "")).slice(0, 30).map(p => [p.file.link, ...keys.map(k => val(p, k))]);
if (keys.length) dv.table(["Day", ...keys.map(label)], rows); else dv.paragraph(`No ${pre}* properties found yet.`);
```

## Ask
```agent
type: button
text: "Trends in my questions and habits"
prompt: "Read Prompts/13 Trend Analysis.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```
