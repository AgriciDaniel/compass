---
type: person
role: 
company: 
email: 
meets: 
tags:
  - person
---
Tag: `#p/<% tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") %>`

Capture "remember to talk to them about X" as a task with `#discuss #p/<% tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") %>` anywhere in the vault. Open this note before the meeting.

```agent
type: button
text: "Prep this meeting"
prompt: "Read Prompts/07 Meeting Prep.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```

## To discuss
```tasks
not done
tags include #discuss
tags include #p/<% tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") %>
sort by created
```

## Open tasks involving them
```tasks
not done
tags include #p/<% tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") %>
tags do not include #discuss
sort by due
```

## Projects together
```dataview
LIST
FROM "04 Projects"
WHERE contains(people, this.file.link) AND status != "done"
```

## Notes


## Meeting log
- <% tp.date.now("YYYY-MM-DD") %> 
