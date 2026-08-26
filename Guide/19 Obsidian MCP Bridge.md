How Claude (in the Obsidian chat panel, or in a terminal) drives Obsidian itself: open notes, switch to a board, run any command, search, edit. No extra plugin: Local REST API 5.x ships an MCP server at `http://127.0.0.1:27123/mcp`, authenticated with the same per-install API key.

## What the agent can do through it (16 tools)
| Tool | Use |
| --- | --- |
| `open_file` | open any note in the UI (a board, a dashboard, today's note) |
| `command_list`, `command_execute` | run any Obsidian command by id: QuickAdd captures (`quickadd:choice:lifeos-journal`), Kanban (`obsidian-kanban:create-new-kanban-board`, archive completed cards), Periodic Notes (`periodic-notes:open-daily-note`), Templater, SEO audits, `app:reload`, workspace and view switching |
| `active_file_get_path` | know what you are looking at |
| `vault_list`, `vault_read`, `vault_get_document_map` | navigate folders, read notes or one section |
| `vault_write`, `vault_append`, `vault_patch`, `vault_move`, `vault_copy`, `vault_delete` | edit (append under a heading, patch a section, move a note) |
| `search_simple`, `search_query`, `tag_list` | Obsidian search, JsonLogic metadata queries, tag inventory |

Boards are markdown, so "move this card to Drafting" is a `vault_patch` on the board file; Obsidian re-renders the Kanban view live.

## Other agents
- Codex (`~/.codex/config.toml`): `[mcp_servers.obsidian]` with `url = "http://127.0.0.1:27123/mcp"` and a bearer token from an environment variable. Check the current Codex docs for the exact key names.
- Gemini CLI (`~/.gemini/settings.json`): `"mcpServers": {"obsidian": {"httpUrl": "http://127.0.0.1:27123/mcp", "headers": {"Authorization": "Bearer <key>"}}}`. Check the current Gemini CLI docs.
- Run Codex in its default approval mode and Gemini CLI without auto-approve inside this vault; `AGENTS.md` rule 2 (ask before edit) is the behaviour floor.
- `.claude/settings.json` pre-approves the read-only tools for Claude Code (`vault_read`, `vault_list`, `vault_get_document_map`, `search_*`, `tag_list`, `active_file_get_path`, `command_list`, `open_file`); everything that writes or executes still asks.

## Setup on a machine (once)
Optional and terminal-based. Skip if you do not use a terminal; the Agent Client chat works without this, it just cannot open notes or run commands on its own.
1. Local REST API is enabled with the HTTP server on 27123 (shipped).
2. Register the server for Claude Code at user scope, key kept outside the vault:
   ```bash
   claude mcp add --scope user --transport http obsidian http://127.0.0.1:27123/mcp \
     --header "Authorization: Bearer <key from Settings → Local REST API>"
   claude mcp list   # obsidian: ... ✔ Connected
   ```
   `.mcp.example.json` in the vault root shows the same config for other MCP clients. Do not create a real `.mcp.json` with the key inside the vault; it would ship with the template (`.gitignore` already excludes it).
3. In Obsidian → Agent Client chat menu → **Restart agent** (or open a new chat) so the Claude Code session loads the server. The ACP adapter reads the same user, project, and local settings as the CLI.
4. Test in the chat: "Open the Projects Board" or "Run the Daily Questions Prompt command". You will see an `obsidian` tool call and a permission prompt the first time.

## Two Claudes, one vault
The chat panel in [[Assistant]] and a terminal `claude` session are separate processes. They do not need to talk to each other: both reach the same Obsidian through this MCP server and the same files on disk. If you want one to hand work to the other, write it into a note (for example `wiki/hot.md` or the daily note) and the other picks it up. Claude Code's Remote Control or a custom MCP relay would be needed only for live message passing between the two, which Compass does not require.

## Safety
- Loopback only; the key is the password. Everything the agent does through the API is a normal Obsidian action, so Agent Client still shows each tool call and asks permission unless you turn auto-allow on. Keep it off.
- `vault_delete` moves to trash by default. `vault_write` replaces a whole file; prefer `vault_patch` or `vault_append`.
- The vault-root `AGENTS.md` tells the agent which folders are edit-on-request only.
