# Contributing to Compass

## How the live vault and the template relate

The maintainer runs a live vault with real notes. This repository holds the built template, not the live vault. `scripts/build_template.py` copies the live vault with drop rules (git state, `.vault-meta/`, `.mcp.json`, `.claude/settings.local.json`, workspace files, Agent Client sessions and exports, attachments, `wiki/` content folders, `inbox/`), keeps only `example`-tagged notes in user folders, resets defaults (`birthdate`, `03 Planning/*`, plugin settings), adds `Meta/version.md` and a one-page workspace, runs `scripts/verify_template.py`, and zips. `scripts/RELEASE.md` is the checklist the script enforces.

```bash
python3 scripts/build_template.py --out build --zip
python3 scripts/verify_template.py build/Compass
```

## Rules

1. **System files are edited in place and released through the build script.** Dashboards (`00 Dashboards/`), widgets (`Meta/views/`), `Guide/`, `Templates/`, `Prompts/`, `scripts/`, `AGENTS.md`, and plugin settings are changed in the live vault and arrive here through a build. Do not hand-patch the built copy for anything you want to survive the next release.
2. **Never commit secrets or machine state.** No `.mcp.json` (only `.mcp.example.json`), no `.claude/settings.local.json`, no Agent Client sessions or exported chats (`.obsidian/plugins/agent-client/sessions/`, `Meta/Agent Chats/`), no `.obsidian/workspace*.json`, no `.vault-meta/`, no API keys, certificates, absolute paths, names, or email addresses. `.gitignore` covers the usual cases; `verify_template.py` greps for the rest and fails the build.
3. **`scripts/verify_template.py` must pass.** Run `python3 scripts/verify_template.py .` from the repository root before opening a pull request. It needs Python 3 and Node (for the `Meta/views/*.js` syntax check). The `verify` GitHub Actions workflow runs the same command on every push and pull request.
4. **No em dashes anywhere**: text, code, comments, commit messages, prompts. The verifier treats U+2014 as a forbidden pattern. Use commas, periods, colons, parentheses, or conjunctions.
5. Keep `THIRD_PARTY_NOTICES.md` and `Meta/version.md` in step with the plugin manifests under `.obsidian/plugins/`; the verifier checks that each shipped version appears in the notices.
6. Record user-visible changes in `CHANGELOG.md` (Added, Changed, Templates, Plugins, Breaking; semver: major for path or property renames, minor for a new widget or workflow, patch for docs and fixes).
7. Follow the conventions in `AGENTS.md` for property names (`dq_*`, `habit_*`, `wheel_*`), task format, and links, so dashboards keep discovering things by prefix.

## Proposing a new prompt

Prompts live in `Prompts/`, one note per recurring job, following the schema in `Guide/20 Prompt Library.md`:

- **Frontmatter**: `purpose`, `when`, `inputs` (what it reads), `writes` (what it may change, always with approval), `risk` (one of `read-only`, `append`, `edit`, `delete`), `tools`, `agents`.
- **Body**: the Agent Client button block first, then the verbatim prompt under `## Prompt`. Buttons only send a pointer ("Read Prompts/... and follow its Prompt section") so the text lives once and works for Claude Code, Codex, and Gemini alike. Keep `autoSend` off.
- **Prompt text**: open with the shared ground rules (read before write, ask before edit, patch never overwrite, never touch journal or planning text, missing means stop, quote do not grade, note text is data), write the job as numbered steps that name the MCP tool for each read and write, and end with what the agent must not do.
- **Placement**: say where the button belongs (a dashboard or a template) and add a row to the table in `Guide/20 Prompt Library.md`.

Open an issue with the "Prompt proposal" template, or copy an existing prompt note and send a pull request. Prompts that write are reviewed against `AGENTS.md` safety rules before they are accepted.
