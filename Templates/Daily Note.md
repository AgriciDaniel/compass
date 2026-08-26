---
date: <% tp.date.now("YYYY-MM-DD", 0, tp.file.title, "YYYY-MM-DD") %>
tags:
  - daily
<%* const _cf = app.vault.getAbstractFileByPath("Meta/Compass Config.md"); const _cfg = _cf ? (app.metadataCache.getFileCache(_cf)?.frontmatter ?? {}) : {}; const _qs = Array.isArray(_cfg.questions) && _cfg.questions.length ? _cfg.questions.map(q => (q && q.key) ? q.key : q).filter(Boolean) : ["dq_goals","dq_progress","dq_meaning","dq_happy","dq_relationships","dq_engaged"]; const _hs = Array.isArray(_cfg.habits) && _cfg.habits.length ? _cfg.habits : ["habit_journal","habit_exercise","habit_reading"]; tR += _qs.map(k => k + ": ").join("
") + "
" + _hs.map(k => k + ": false").join("
"); %>
---
« [[<% tp.date.now("YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD") %>|Yesterday]] · [[<% tp.date.now("gggg-[W]ww", 0, tp.file.title, "YYYY-MM-DD") %>|Week]] · [[<% tp.date.now("YYYY-[Q]Q", 0, tp.file.title, "YYYY-MM-DD") %>|Quarter]] · [[Compass Dashboard]] · [[<% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>|Tomorrow]] »

# <% tp.date.now("dddd, MMMM D, YYYY", 0, tp.file.title, "YYYY-MM-DD") %>

> [!theme]- Life theme
> ![[Life Theme#Theme]]

> [!reading]- Daily reading
> ```tasks
> not done
> path includes 09 Reading/Reading Plan
> (scheduled on <% tp.date.now("YYYY-MM-DD", 0, tp.file.title, "YYYY-MM-DD") %>) OR (scheduled before <% tp.date.now("YYYY-MM-DD", 0, tp.file.title, "YYYY-MM-DD") %>)
> sort by scheduled
> hide scheduled date
> hide backlink
> short mode
> ```

> [!intention]- Intentions this week
> ![[<% tp.date.now("gggg-[W]ww", 0, tp.file.title, "YYYY-MM-DD") %>#Weekly intentions]]

## Today
```tasks
not done
(due on <% tp.date.now("YYYY-MM-DD", 0, tp.file.title, "YYYY-MM-DD") %>) OR (due before <% tp.date.now("YYYY-MM-DD", 0, tp.file.title, "YYYY-MM-DD") %>) OR (scheduled on <% tp.date.now("YYYY-MM-DD", 0, tp.file.title, "YYYY-MM-DD") %>)
path does not include 09 Reading/Reading Plan
sort by due
short mode
```

## Journal


## Wins


## Gratitude


## Daily questions
Tonight: press the Daily Questions hotkey (Ctrl/Cmd+Shift+Q) or run **Templater: Daily Questions Prompt**. It asks the questions from [[Compass Config]] and writes the `dq_*` and `habit_*` properties above. Rate effort, not results, 1 to 10.

## On this day
```dataviewjs
const me = dv.current().file.name;
const cfg = dv.page("Meta/Compass Config") || {};
const folder = cfg.daily_folder || "01 Journal/Daily";
if (/^\d{4}-\d{2}-\d{2}$/.test(me)) {
  const mmdd = me.slice(4);
  const yr = parseInt(me.slice(0, 4));
  const hits = dv.pages(`"${folder}"`).where(p => p.file.name !== me && p.file.name.endsWith(mmdd)).sort(p => p.file.name, "desc");
  if (hits.length === 0) dv.paragraph("*Nothing from previous years yet. Drop a marker future you will find useful.*");
  for (const p of hits) {
    const n = yr - parseInt(p.file.name.slice(0, 4));
    dv.header(4, `${n} year${n === 1 ? "" : "s"} ago: ${p.file.link}`);
    dv.paragraph(`![[${p.file.name}#Journal]]`);
  }
}
```

> [!memento]- Memento mori
> ```dataviewjs
> await dv.view("Meta/views/memento");
> ```
