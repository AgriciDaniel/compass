---
type: project
status: active
area: 
quarter: <% tp.date.now("YYYY-[Q]Q") %>
started: <% tp.date.now("YYYY-MM-DD") %>
due: 
people: []
tags:
  - project
---
Tag tasks anywhere in the vault with `#project/<% tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") %>` and they roll up here. Every task stays one click from the context that explains why it exists.

```agent
type: button
text: "Kick off this project"
prompt: "Read Prompts/08 Project Kickoff.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```

## Outcome
What "done" looks like:
- 

## Next actions
```tasks
not done
tags include #project/<% tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") %>
sort by due
```

## Inline tasks
- [ ] First step #project/<% tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") %>

## Notes


## Log
- <% tp.date.now("YYYY-MM-DD") %> Created.

## Done
```tasks
done
tags include #project/<% tp.file.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") %>
sort by done reverse
limit 20
```
