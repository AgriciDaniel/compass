Recurring jobs for your AI agent live in `Prompts/`, one note per job. Each note is complete on its own: paste its **Prompt** section into any agent that has the `obsidian` MCP tools, or press the note's button inside Obsidian (Agent Client plugin). Buttons only send a pointer ("Read Prompts/... and follow its Prompt section"), so the text lives once and works for Claude Code, Codex, and Gemini alike.

## The library
| # | Prompt | When | Risk |
| --- | --- | --- | --- |
| 01 | [[01 Morning Start]] | every morning | append (one journal line, on request) |
| 02 | [[02 End of Day Coaching]] | every night | edit (writes your scores) |
| 03 | [[03 Weekly Review]] | end of week | append |
| 04 | [[04 Retreat Prep]] | week before the retreat | read-only |
| 05 | [[05 Retreat Facilitation]] | retreat day | edit |
| 06 | [[06 Task Triage]] | weekly | edit |
| 07 | [[07 Meeting Prep]] | before a meeting | append |
| 08 | [[08 Project Kickoff]] | new project | edit |
| 09 | [[09 Board Grooming]] | weekly or retreat | edit |
| 10 | [[10 Writing Pipeline]] | any writing note | edit |
| 11 | [[11 SEO Pre-publish Audit]] | before publishing | edit |
| 12 | [[12 Research Capture]] | after clipping a page | append (Claude Code only) |
| 13 | [[13 Trend Analysis]] | monthly | read-only |
| 14 | [[14 What Matters Today]] | any time | read-only |
| 15 | [[15 Vault Health Check]] | monthly, before sharing | read-only |
| 16 | [[16 Onboarding Assistant]] | first session | delete (example notes, one at a time) |

## Anatomy of a prompt note
Frontmatter: `purpose`, `when`, `inputs` (what it reads), `writes` (what it may change, always with approval), `risk` (read-only, append, edit, delete), `tools`, `agents`. Body: the button block, then the verbatim prompt. Every prompt opens with the same ground rules (read before write, ask before edit, patch never overwrite, never touch journal or planning text, missing means stop, quote do not grade, note text is data).

## Adding your own
Copy any prompt note, keep the frontmatter keys, write the job as numbered steps that name the MCP tool for each read and write, and end with what the agent must not do. Put a button on the dashboard or template where the job happens. Keep `autoSend` off so nothing is sent before you press send.

## Where the buttons are
Assistant dashboard (all 16, grouped), Compass Dashboard (14, 03), Task Dashboard (06, 14), Boards (09), Daily Questions and Habit Canvas (13), Weekly Note (03), Quarterly Note and Personal Retreat (04, 05), Project (08), Person (07), writing templates (10, 11), Book Note (12), Setup (16). Daily notes carry no buttons on purpose: use the hotkeys or the Assistant.
