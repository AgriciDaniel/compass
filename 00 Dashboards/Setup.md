---
status: open
setup_claude_login: false
setup_mcp_registered: false
setup_vault_lens: false
setup_backup: false
tags:
  - setup
---
A vault that asks you one honest question set every night. Everything else (planning, habits, tasks, writing, an AI assistant) is layered on top of that, one layer at a time. Compass is based on Mike Schmitz's "How I Run My Whole Life Out of Obsidian"; not affiliated with Practical PKM.

## Step A: turn plugins on (do this first)
When you opened this folder, Obsidian showed a box about **Restricted mode**. Click **Turn off**. If you closed it: Settings → Community plugins → **Turn off Restricted mode**. You will see ten plugins listed, already installed. Then press Ctrl/Cmd+P and run **Reload app without saving**.

**If the box below shows code instead of a checklist, Step A is not done yet.**

## Setup status
```dataviewjs
await dv.view("Meta/views/setup");
```
Four items are self-declared because no script can see them (your Claude login, the MCP registration, the browser extension, a backup): tick them in this note's properties when done.

## Today (20 minutes)
1. Step A above.
2. [[Compass Config]]: set `birthdate`.
3. [[Life Theme]]: one draft sentence under `## Theme` (it shows in every daily note; refine it at the first retreat).
4. Open [[Compass Dashboard]]; it renders from the example data.
5. Tonight: Ctrl/Cmd+Shift+D opens today's note; Ctrl/Cmd+Shift+Q asks the questions. Answer 1 to 10, write one line under `## Journal`. Stop there.

## This week
- Every morning Ctrl/Cmd+Shift+D, every night Ctrl/Cmd+Shift+Q.
- Day 3: open [[Compass Config]] and reword one question you did not mean. Keep 3 to 5 habits.
- Day 7: look at [[Daily Questions]]. Change nothing. Decide the reading module: fill [[Reading Plan]] or delete `09 Reading`.

## This month
- Day 8: delete the notes tagged `example` (the [[16 Onboarding Assistant]] can do it one file at a time, or use search `tag:#example`).
- Day 14: open this week's weekly note (command palette: Periodic Notes: Open weekly note) and fill only "What went well".
- Day 21: optional, AI in the vault: [[14 Agent Client and Claude Code]], then press **Help me set up this vault** below.
- Day 30: if 25 of 30 days are scored (the checklist counts), read [[04 Workflow - Personal Retreat]] and book a retreat for day 60 to 90. Tasks, writing boards, the browser extension come after that ([[11 Build Order]]).

## With an assistant
```agent
type: button
text: "Help me set up this vault"
prompt: "Read Prompts/16 Onboarding Assistant.md with vault_read and follow its Prompt section from step 0."
viewType: right-pane
```

## Not in English?
Rename the keys in [[Compass Config]] (`dq_aprender`) and translate the question text there; every chart labels itself from the key. The Guide stays in English.

## When you are done
Set this note's `status` property to `done`. The checklist hides itself. Reopen it any time by setting it back to `open`.
