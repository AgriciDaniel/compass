Claude Code (or Codex, or Gemini CLI) inside the vault, through the Agent Client plugin. It reads `AGENTS.md` for the rules and folder map, mentions the note you are looking at automatically, and asks before every edit. Setup: [[14 Agent Client and Claude Code]]. Without the plugin, open the note in `Prompts/` and paste its Prompt section into any agent ([[20 Prompt Library]]).

## Daily
```agent
type: button
text: "Start my day"
prompt: "Read Prompts/01 Morning Start.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```
```agent
type: button
text: "Coach me through tonight's questions"
prompt: "Read Prompts/02 End of Day Coaching.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```
```agent
type: button
text: "What matters today"
prompt: "Read Prompts/14 What Matters Today.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```

## Weekly and quarterly
```agent
type: button
text: "Review this week"
prompt: "Read Prompts/03 Weekly Review.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```
```agent
type: button
text: "Prepare my retreat"
prompt: "Read Prompts/04 Retreat Prep.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```
```agent
type: button
text: "Facilitate this retreat"
prompt: "Read Prompts/05 Retreat Facilitation.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```
```agent
type: button
text: "Trends in my questions and habits"
prompt: "Read Prompts/13 Trend Analysis.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```

## Work
```agent
type: button
text: "Triage my inbox"
prompt: "Read Prompts/06 Task Triage.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```
```agent
type: button
text: "Prep this meeting"
prompt: "Read Prompts/07 Meeting Prep.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```
```agent
type: button
text: "Kick off this project"
prompt: "Read Prompts/08 Project Kickoff.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```
```agent
type: button
text: "Groom my boards"
prompt: "Read Prompts/09 Board Grooming.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```

## Writing and research
```agent
type: button
text: "Work on this piece"
prompt: "Read Prompts/10 Writing Pipeline.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```
```agent
type: button
text: "SEO pre-publish audit"
prompt: "Read Prompts/11 SEO Pre-publish Audit.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```
```agent
type: button
text: "File this page in the wiki"
prompt: "Read Prompts/12 Research Capture.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```

## System
```agent
type: button
text: "Vault health check"
prompt: "Read Prompts/15 Vault Health Check.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```
```agent
type: button
text: "Help me set up this vault"
prompt: "Read Prompts/16 Onboarding Assistant.md with vault_read and follow its Prompt section for the note I have open (or the current period if none applies)."
viewType: embed
```

## Chat
```agent-client
type: chat
agent: claude-code-acp
height: 600px
id: lifeos-assistant
persist: true
noteContext: hosting
```
