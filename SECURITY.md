# Security

Compass is a local Obsidian vault. Nothing in it phones home. This page says what listens on your machine, what the template never contains, and how to report a problem.

## What the template ships, network-wise

| Component | State on first open | Notes |
| --- | --- | --- |
| Local REST API 5.1.0 (`obsidian-local-rest-api`) | Enabled, non-encrypted HTTP server on port 27123, bound to 127.0.0.1 | Shipped settings are exactly `{"enableInsecureServer": true}`. The plugin generates a per-install API key and a self-signed certificate on first load and stores them on your machine. The key is a password to read and write the vault: do not share screenshots of the settings page. "Reset all cryptography" rotates key and certificate. The same key authenticates the MCP server at `http://127.0.0.1:27123/mcp`. Never set `bindingHost`. HTTPS on 27124 stays available if you prefer it. |
| Omnisearch 1.30.1 | Installed and enabled, its HTTP server off | The Omnisearch HTTP endpoint has no authentication and allows any origin, so the template leaves it off. Never set `DANGER_httpHost`. |
| Agent Client 0.12.1 | Installed, auto-allow off, no sessions, no paths, no keys | Runs a local agent (Claude Code, Codex, Gemini CLI) over the Agent Client Protocol. The agent has the same access as your terminal user; the plugin surfaces approvals. What leaves your machine is what you send: your messages, mentioned notes, attachments. Journal notes mentioned in a chat go to the model provider. |
| Web viewer (core plugin) | On | A Chromium webview inside Obsidian with ad blocking on. While Obsidian runs, third-party plugins can access its cookies, so use your main browser for anything password protected. |
| QuickAdd | Online features off, no AI provider keys | Verified by the release gate. |
| SEO | External link checking off | Needs the network only if you turn it on. |
| Obsidian Sync (core) | Off | |

Read `Guide/17 Search Providers.md` and `Guide/19 Obsidian MCP Bridge.md` for the reasoning behind these defaults.

## What never ships

- API keys, bearer tokens, certificates, or private keys of any kind.
- A real `.mcp.json` (only `.mcp.example.json` with a placeholder) or `.claude/settings.local.json`.
- Agent Client sessions, exported chats, or `Meta/Agent Chats/`.
- Journal, retreat, planning, or other personal notes. User folders contain only notes tagged `example`.
- `.vault-meta/` (claude-obsidian journal), `wiki/` content folders, `inbox/` contents, workspace files.
- Absolute paths, user names, or email addresses.

`scripts/verify_template.py` refuses to build a copy that contains any of these, and `scripts/build_template.py` strips machine state from plugin settings on every build. The `verify` workflow runs the same gate on every push.

## Your responsibilities as a member

- Keep the Local REST API key out of the vault folder. Register it in your agent's user-scope config (for Claude Code, `claude mcp add --scope user ...`), never in a `.mcp.json` inside the vault.
- Keep Agent Client auto-allow off. `AGENTS.md` rule 2 (ask before edit) is the behaviour floor for every agent.
- Do not sign in to sensitive sites inside the in-app Web viewer.
- If you publish your own copy, run `python3 scripts/verify_template.py .` first.

## Reporting a problem

This repository is public.
