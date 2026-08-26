---
date: <% tp.date.now("YYYY-MM-DD") %>
quarter: <% tp.file.title.slice(0, 7) %>
tags:
  - retreat
<%* const _cf = app.vault.getAbstractFileByPath("Meta/Compass Config.md"); const _cfg = _cf ? (app.metadataCache.getFileCache(_cf)?.frontmatter ?? {}) : {}; const _ws = Array.isArray(_cfg.wheel_areas) && _cfg.wheel_areas.length ? _cfg.wheel_areas : ["wheel_health","wheel_relationships","wheel_family","wheel_career","wheel_finances","wheel_growth","wheel_fun","wheel_meaning"]; tR += _ws.map(k => k + ": ").join("
"); %>
---
> Name this note `YYYY-QN Personal Retreat` (for example `2026-Q3 Personal Retreat`). The Compass dashboard finds this quarter's retreat by that naming convention and renders the wheel of life from the `wheel_*` properties above. No code changes needed.

Previous retreat: [[<% moment(tp.file.title.slice(0, 7), "YYYY-[Q]Q").subtract(1, "quarter").format("YYYY-[Q]Q") %> Personal Retreat]] · Quarter note: [[<% tp.file.title.slice(0, 7) %>]] · Same quarter last year: [[<% moment(tp.file.title.slice(0, 7), "YYYY-[Q]Q").subtract(1, "year").format("YYYY-[Q]Q") %> Personal Retreat]]

Block a full day. You do not need a cabin in the woods: a few hours, this one document, and the willingness to answer the hard questions.

```agent
type: button
text: "Prepare my retreat"
prompt: "Read Prompts/04 Retreat Prep.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```
```agent
type: button
text: "Facilitate this retreat"
prompt: "Read Prompts/05 Retreat Facilitation.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```

## 1. Review life theme and core values
Do they still resonate? Edit the source notes if not.
![[Life Theme#Theme]]
![[Core Values#Values]]

Notes:
- 

## 2. Review the journal
Read the last 90 days of daily notes. Look for trends in the effort scores and for what you kept writing about.
```dataviewjs
const q = moment(dv.current().quarter, "YYYY-[Q]Q");
await dv.view("Meta/views/dailyquestions", { from: q.clone().startOf("quarter").format("YYYY-MM-DD"), to: q.clone().endOf("quarter").format("YYYY-MM-DD") });
```
```dataviewjs
await dv.view("Meta/views/habits", { days: 28 });
```
Wins this quarter:
```dataviewjs
const q = moment(dv.current().quarter, "YYYY-[Q]Q");
const from = q.clone().startOf("quarter"), to = q.clone().endOf("quarter");
const cfg = dv.page("Meta/Compass Config") || {};
const pages = dv.pages(`"${cfg.daily_folder || "01 Journal/Daily"}"`).where(p => /^\d{4}-\d{2}-\d{2}$/.test(p.file.name) && moment(p.file.name).isBetween(from, to, "day", "[]")).sort(p => p.file.name);
const wins = [];
for (const p of pages) for (const L of p.file.lists) if (L.section && L.section.subpath === "Wins") wins.push(`${p.file.link}: ${L.text}`);
if (wins.length) dv.list(wins); else dv.paragraph("*No wins logged this quarter.*");
```
What stood out:
- 

## 3. Wheel of life
Rate your current happiness with each area 1 to 10 in the properties at the top. Then pick ONE area that gets attention for the next 90 days.
```dataviewjs
await dv.view("Meta/views/wheel", { page: dv.current().file.path });
```
Focus area for the next 90 days:
- 

Why this one:
- 

## 4. Retrospective
### Part 1: Look back at last quarter
Open last quarter's retreat next to this one. Did the intentions happen? Are you changing, or rewriting the same goals with different wording?

What went well:
- 

What did not go well:
- 

What I learned:
- 

### Part 2: Start / Stop / Keep
| Start | Stop | Keep |
| --- | --- | --- |
|  |  |  |

## 5. Intentions for next quarter
Three at most. Each should be something you can act on weekly.
1. 
2. 
3. 

## 6. Review the ideal week
Does [[Ideal Week]] have time blocked for the intentions above? Update it now.
![[Ideal Week#Grid]]

Changes to make:
- 

## 7. Projects to commit to
Create or update project notes in `04 Projects/` and set `quarter:` to this quarter so they show up on the quarterly note.
- 

## Closing
One sentence summary of this quarter's direction:
- 
