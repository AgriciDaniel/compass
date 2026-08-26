---
type: meta
title: Routing Map
status: evergreen
created: 2026-08-26
updated: 2026-08-26
tags:
  - meta
  - routing
---

# Routing Map

Where claude-obsidian operations file things in this Compass vault. The plugin can only write under `wiki/` (and `.raw/` for ingest payloads); these rules decide the subfolder and what to link instead of duplicating.

| Operation | Destination | Rule |
| --- | --- | --- |
| `/save` an answer, decision, or insight | `wiki/concepts/<slug>.md` | One page per idea. Link the Compass note it came from (a daily note, a retreat, a project). |
| `/save` a session summary | `wiki/log.md` | Append; newest first. |
| Ingest a book, article, transcript, clipped page | `wiki/sources/<slug>.md` + source ledger row | Book notes that the user writes by hand stay in `07 Library/Book Notes` (Templater folder template, block-id quotes). Do not move them. |
| Anything about a person | link to `05 People/<Name>.md` | Do not create `wiki/entities/<name>.md` for people who have a people note. |
| Anything about a project | link to `04 Projects/<Name>.md` | Same rule. |
| Journal, retreat, planning, habit, task content | never ingested | Personal operating data; no ledger rows, no provenance model. |
| Questions to research later | `wiki/index.md` → Questions | Then `autoresearch` only with explicit consent (network egress). |

Mode: `generic` (no `.vault-meta/mode.json`). Do not switch to PARA; it would duplicate `04 Projects` and `03 Planning` under `wiki/`.
