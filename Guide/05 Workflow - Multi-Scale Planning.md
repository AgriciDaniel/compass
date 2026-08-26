# Workflow 3: Multi-Scale Planning

Video: 7:53 to 9:45. Cal Newport's term: align daily, weekly, and quarterly plans so daily action serves what the retreat decided.

## Layers
| Layer | Note | Template | Reviewed |
| --- | --- | --- | --- |
| Roles and values | `03 Planning/Life Theme.md`, `03 Planning/Core Values.md` (roles table inside) | manual | every 90 days at the retreat |
| Quarter | `01 Journal/Quarterly/YYYY-QN.md` | `Templates/Quarterly Note.md` | at the retreat, glanced weekly |
| Week | `01 Journal/Weekly/gggg-Www.md` | `Templates/Weekly Note.md` | Sunday or Monday, and Friday review |
| Day | `01 Journal/Daily/YYYY-MM-DD.md` | `Templates/Daily Note.md` | morning and 21:00 |

No annual plan, by design (8:46).

## How the layers connect
- Periodic Notes creates each layer in its folder from its template (9:16). Templater fills the date math.
- Daily note embeds **this week's intentions** and **this quarter's intentions** are embedded in the weekly note; the quarterly note embeds the **retreat's intentions**. One source of truth, visible at every scale.
- Every note has a navigation line: previous, parent scale, dashboard, next.
- `Ideal Week` is checked in the weekly note and rewritten at the retreat.

## Weekly note
- Three weekly intentions, chosen against the quarterly ones.
- Tasks due this week (Tasks query).
- Friday review: a table of each day's effort scores and habit hits (`Meta/views/week.js`) plus wins pulled from the daily notes.

## Quarterly note
- Focus area from the wheel.
- Projects with `quarter: YYYY-QN` and status not done.
- List of the quarter's weekly notes.
- Daily questions chart locked to the quarter's dates.

## Practices
- Plan the week before the week starts; adjust the calendar then, not on Thursday.
- If a weekly intention does not trace back to a quarterly one, ask why it is there.
