claude-obsidian (https://github.com/AgriciDaniel/claude-obsidian, a Claude Code plugin by the template author) is the **knowledge and provenance layer**. It gives Claude Code vault skills: `/save`, `/wiki-query`, `/wiki-ingest`, `/wiki-lint`, `/autoresearch`, `/think`, `/canvas`, Bases and Markdown references, and a transaction core that plans, shows a hash, and only writes after approval.

## What it is not
It is not the thing that runs Compass. Its transaction core writes only under `wiki/` and `.raw/`. Daily notes, retreats, tasks, people, and writing are edited in Obsidian (QuickAdd, Templater, Tasks, Kanban) or through the Agent Client chat with per-edit approval ([[14 Agent Client and Claude Code]]). Both layers read the vault-root `CLAUDE.md`.

## What the knowledge layer adds
| Path | Purpose |
| --- | --- |
| `.claude-obsidian.json` | workspace marker (`role: vault`, `source_inbox: inbox`) |
| `.gitignore` | ignores `.vault-meta/`, `.mcp.json`, `.obsidian/workspace*.json`, `.trash/` |
| `inbox/` | drop sources here, then ingest |
| `.raw/.manifest.json` | ingest delta tracker |
| `wiki/overview.md`, `wiki/hot.md`, `wiki/index.md`, `wiki/log.md` | orientation, recent context, catalog, operation log |
| `wiki/routing-map.md` | owner-authored: where operations file things in this vault |
| `wiki/meta/ledgers/*.json` | source and claim ledgers (empty) |
| `.obsidian/snippets/vault-colors.css` | colours `wiki/*` folders in the file tree (enabled) |
| `.vault-meta/` | runtime journal, gitignored; delete before distributing |

Vault-wide task queries on the dashboards exclude `wiki/`, so checklists inside wiki pages never leak into the Task or Projects dashboards.

## Commands
```bash
CORE=<claude plugin cache>/claude-obsidian/<version>/scripts/claude-obsidian.py   # or use the /claude-obsidian:* slash commands
python3 "$CORE" doctor --vault .            # health
python3 "$CORE" lint --vault . --format markdown   # read-only wiki lint
```
In Claude Code (terminal or the Agent Client chat): `/claude-obsidian:wiki-query`, `/claude-obsidian:save`, `/claude-obsidian:wiki-lint`. Every write goes through inspect → approve → apply. Never use `--force`.

Optional: `export CLAUDE_OBSIDIAN_SESSION_CONTEXT=1` makes each Claude Code session start by reading `wiki/hot.md` (puts vault text into model context; opt in deliberately).

## For community members without the plugin
Nothing breaks. `wiki/` and `inbox/` are ordinary Markdown folders with valid frontmatter; the dotfiles are invisible. They simply do not get the `/claude-obsidian:*` workflows.
