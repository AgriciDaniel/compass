---
week: <% tp.file.title %>
quarter: <% moment(tp.file.title, "gggg-[W]ww").format("YYYY-[Q]Q") %>
tags:
  - weekly
---
« [[<% moment(tp.file.title, "gggg-[W]ww").subtract(1, "week").format("gggg-[W]ww") %>|Last week]] · [[<% moment(tp.file.title, "gggg-[W]ww").format("YYYY-[Q]Q") %>|Quarter]] · [[Compass Dashboard]] · [[<% moment(tp.file.title, "gggg-[W]ww").add(1, "week").format("gggg-[W]ww") %>|Next week]] »

# Week <% moment(tp.file.title, "gggg-[W]ww").format("w, gggg") %>
<% moment(tp.file.title, "gggg-[W]ww").startOf("week").format("MMM D") %> to <% moment(tp.file.title, "gggg-[W]ww").endOf("week").format("MMM D") %>

Days: <%* const s = moment(tp.file.title, "gggg-[W]ww").startOf("week"); const parts = []; for (let i = 0; i < 7; i++) parts.push(`[[${s.clone().add(i, "day").format("YYYY-MM-DD")}|${s.clone().add(i, "day").format("ddd")}]]`); tR += parts.join(" · "); %>

> [!intention]- Quarterly intentions
> ![[<% moment(tp.file.title, "gggg-[W]ww").format("YYYY-[Q]Q") %>#Quarterly intentions]]

## Weekly intentions
The 3 things that, if done this week, move the quarterly intentions forward.
1. 
2. 
3. 

## Ideal week check
Look at [[Ideal Week]]. Where does the time for the intentions above actually live this week? Adjust the calendar now, not on Thursday.

- 

## Due this week
```tasks
not done
due after <% moment(tp.file.title, "gggg-[W]ww").startOf("week").subtract(1, "day").format("YYYY-MM-DD") %>
due before <% moment(tp.file.title, "gggg-[W]ww").endOf("week").add(1, "day").format("YYYY-MM-DD") %>
sort by due
group by filename
```

```agent
type: button
text: "Review this week"
prompt: "Read Prompts/03 Weekly Review.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```

## Weekly review
Done at the end of the week. Effort scores and habit hits per day, from the daily notes.
```dataviewjs
await dv.view("Meta/views/week", { week: dv.current().file.name });
```

### What went well

### What did not

### Wins this week
```dataview
LIST L.text
FROM "01 Journal/Daily"
FLATTEN file.lists AS L
WHERE L.section.subpath = "Wins" AND file.day >= date(<% moment(tp.file.title, "gggg-[W]ww").startOf("week").format("YYYY-MM-DD") %>) AND file.day <= date(<% moment(tp.file.title, "gggg-[W]ww").endOf("week").format("YYYY-MM-DD") %>)
SORT file.name ASC
```
