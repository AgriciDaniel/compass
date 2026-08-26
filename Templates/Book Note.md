---
type: book
author: 
year: 
rating: 
status: reading
started: <% tp.date.now("YYYY-MM-DD") %>
finished: 
tags:
  - book
---
## Summary in three sentences


## Key ideas
- 

## Quotes
Give each quote a block id so you can embed it in your writing without leaving the vault.

> "" ^quote-1

## How this changes what I do
- 

```agent
type: button
text: "File this page in the wiki"
prompt: "Read Prompts/12 Research Capture.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```

## Linked writing
```dataview
LIST
FROM "06 Writing"
WHERE contains(file.outlinks, this.file.link)
```
