This page is a **recommendation engine**, not the place the day gets executed. Read it, pick what you will actually do, time block it (paper notebook or calendar). "The computer is the brain, the notebook is the list."

```agent
type: button
text: "Triage my inbox"
prompt: "Read Prompts/06 Task Triage.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```
```agent
type: button
text: "What matters today"
prompt: "Read Prompts/14 What Matters Today.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: right-pane
```

Capture everything to [[Tasks]] (the master list you never read) with the QuickAdd command **Add task**. Tag `#project/<slug>` or `#p/<person>` to route a task to its context. The queries below surface the right tasks at the right time.

## Overdue
```tasks
not done
path does not include wiki/
due before today
sort by due
group by filename
```

## Today
```tasks
not done
path does not include wiki/
(due on today) OR (scheduled on today)
path does not include 09 Reading/Reading Plan
sort by priority
group by filename
```

## Next 7 days
```tasks
not done
path does not include wiki/
due after today
due before in 8 days
sort by due
group by due
```

## To discuss (by person)
```tasks
not done
path does not include wiki/
tags include #discuss
group by tags
sort by created
```

## High priority without a date
```tasks
not done
path does not include wiki/
no due date
(priority is high) OR (priority is highest)
group by filename
```

## Inbox (untagged, undated, needs a home)
```tasks
not done
path does not include wiki/
path includes 08 Tasks/Tasks
no due date
tags do not include #project
tags do not include #p/
limit 25
```

## Done this week
```tasks
done after 7 days ago
path does not include wiki/
group by done
```
