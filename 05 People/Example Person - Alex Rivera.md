---
type: person
role: Example
company: 
email: 
meets: weekly
tags:
  - person
  - example
---
Tag: `#p/example-person-alex-rivera`

## To discuss
```tasks
not done
tags include #discuss
tags include #p/example-person-alex-rivera
sort by created
```

## Open tasks involving them
```tasks
not done
tags include #p/example-person-alex-rivera
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
- Example person note. The "To discuss" query collects anything tagged `#discuss #p/example-person-alex-rivera` from anywhere in the vault; open this note before the meeting.

## Meeting log
- 2026-08-26 Created.
