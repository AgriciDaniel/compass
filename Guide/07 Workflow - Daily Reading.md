# Workflow 5: Daily Bible Reading

Video: 11:51 to 14:11 (Mike's daily Bible reading). The oldest tracked habit, and "the workflow that taught me why I keep everything in one vault." In this template the module is generic: any daily reading with a plan, chapter notes, study notes, and topic maps. The Bible is the worked example because that is what the video shows and what the scripts generate.

Optional module: delete `09 Reading/` and the `[!reading]` callout in `Templates/Daily Note.md` if you do not want it. Or use it for any daily reading (a book a quarter, a course, a canon of essays): one task per chapter in `Reading Plan.md`, one note per chapter in `Chapters/`, study notes that link the chapters.

## Two representations (12:09)
| | Note as chapter | Note as verse |
| --- | --- | --- |
| Folder | `09 Reading/Chapters/Genesis 1.md` | `09 Reading/Verses/Genesis 1.1.md` |
| Purpose | daily reading plan | linking target for sermon notes, topical MOCs, study notes, book notes |
| Count | 1,189 | 31,102 |

## Reading plan (12:22)
`09 Reading/Reading Plan.md` holds one task per chapter with a scheduled date (⏳). The daily note's **Bible reading** callout runs a Tasks query for chapters scheduled on or before today, so unread chapters roll forward. Check them off in the callout.

Generate a full plan:
```bash
python3 scripts/generate_reading_plan.py --start 2026-09-01 --days 365 > "09 Reading/Reading Plan.md"
```
Options: `--order canonical` (default) or `--order chronological` (a common chronological ordering is built in), `--days 365`.

## Generating chapter and verse notes
```bash
python3 scripts/split_bible.py path/to/kjv.txt --out "09 Reading"
```
Expects a plain-text file with one verse per line as `Book Chapter:Verse<TAB>Text` (the common format of public-domain KJV/WEB dumps). Produces `Chapters/<Book> <N>.md` with the full text and verse links, and `Verses/<Book> <N>.<V>.md` with previous/next links. 31k small files is fine for Obsidian; give the first index a minute.

## Cross-reference library (12:53)
- Sermon notes (`Templates/Study Note.md`) link every verse mentioned. Open the local graph on a verse to see every sermon, study note, and topical page that touched it.
- Topical pages in `09 Reading/Topics/` are maps of content.
- Paper-Bible highlights become tags on the verse note (`#highlight`, `#topic/...`).

Mike's own Bible resource files: https://download.mikeschmitz.com/bible
