Plugin: Agent Client 0.12.1 (`agent-client`, https://github.com/RAIT-09/obsidian-agent-client, Apache 2.0, desktop only). It runs a local AI agent (Claude Code, Codex, Gemini CLI, and others) over the Agent Client Protocol and puts the chat in the sidebar, in a tab, in a floating window, or inside a note.

## What it adds to Compass
- Talk to Claude Code about the note you are looking at (auto-mentioned) and `@`-mention any other note.
- Every edit is shown as a diff and needs your approval (auto-allow is off by default; keep it off).
- Prepared prompts as buttons on [[Assistant]] and the [[Compass Dashboard]]: weekly review, retreat prep, "what matters today", writing help.
- The vault root `AGENTS.md` (pointed to by `CLAUDE.md` and `GEMINI.md`) is read at the start of each session. It tells the agent the folder map, the property conventions, and what never to touch. Edit it when you change the system. Recurring jobs are in `Prompts/` ([[20 Prompt Library]]).
- With `.claude/settings.json` (shipped) read-only MCP tools are pre-approved; every write still asks. Together with the claude-obsidian plugin (see [[15 claude-obsidian]]), Claude Code also gets vault skills (`/save`, `/wiki-query`, ingest, lint).
- With the Obsidian MCP bridge (see [[19 Obsidian MCP Bridge]]) the agent can open notes and boards, run any Obsidian command, search, and patch notes from inside the chat.

## Setup (once per machine)
1. Install Claude Code and log in: `curl -fsSL https://claude.ai/install.sh | bash`, then run `claude` once. (An Anthropic API key stored in Obsidian's Keychain works instead; see the plugin docs.)
2. Install the adapter: `npm install -g @agentclientprotocol/claude-agent-acp`.
3. Obsidian: Settings → Agent Client → Preset agents → Claude Code. Click **Auto-detect**, or paste the path from `which claude-agent-acp`.
4. Click the robot icon in the ribbon, send "hello". You should get a reply.

### Linux Flatpak Obsidian
The Flatpak sandbox cannot see `/usr/local/bin`, and its `PATH` is only `/usr/bin:/app/bin`, so the adapter's `#!/usr/bin/env node` shebang fails. Your home directory is mounted in the sandbox, so the fix is a wrapper in `~/.local/bin`:
```sh
#!/bin/sh
exec "$HOME/.local/bin/node" "/path/to/lib/node_modules/@agentclientprotocol/claude-agent-acp/dist/index.js" "$@"
```
Make it executable and set it as the Claude Code path in the plugin settings (use the full path to the wrapper, for example `$HOME/.local/bin/claude-agent-acp` expanded). No `flatpak override` is needed. The maintainer-documented alternative is `flatpak override --user --filesystem=host-os:ro md.obsidian.Obsidian` and pointing the plugin at `/var/run/host/usr/...`; that widens the sandbox and is not required.

To verify, send an ACP `initialize` request to the wrapper from inside the sandbox (`flatpak run --command=<wrapper> md.obsidian.Obsidian`); the adapter answers with its capabilities.

## Embedding chats and buttons in notes
Fenced blocks with language `agent-client` or `agent`, body in YAML (docs: https://rait-09.github.io/obsidian-agent-client/usage/embeddable-blocks.html).
- Chat: `type: chat`, `agent`, `model`, `height`, `id` + `persist: true` to survive restarts, `noteContext: hosting` to pin the mention to the hosting note.
- Button: `type: button`, `text`, `prompt`, `viewType: right-pane | floating | editor-tab | embedded`, `autoSend: true` to fire immediately.

## Settings worth setting
- Export: folder `Meta/Agent Chats` (pre-set), tag `agent-client`, auto-export off. Exported chats contain whatever notes were mentioned, so they show up in vault search like any note.
- Prompt injection: leave on (wikilinks, `$math$`, tables in Obsidian flavour).
- Permissions: leave auto-allow off.

## Security notes for the community template
- Desktop only. The agent has the same access as your terminal user; the plugin only surfaces approvals.
- Machine-specific paths and API keys live in Obsidian's settings and Keychain, never in the vault. The template ships a minimal `agent-client/data.json` (auto-allow off, default agent, export folder) with no sessions, paths, or keys; `build_template.py` strips the rest.
- What leaves your machine is what you send: your messages, mentioned notes, attachments. Journal notes mentioned in a chat go to the model provider.
