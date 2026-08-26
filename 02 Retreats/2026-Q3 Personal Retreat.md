---
date: 2026-08-26
quarter: 2026-Q3
tags:
  - retreat
  - example
wheel_health: 6
wheel_relationships: 4
wheel_family: 8
wheel_career: 7
wheel_finances: 6
wheel_growth: 8
wheel_fun: 5
wheel_meaning: 7
---
> Example retreat so the Compass dashboard has a wheel to draw. Replace the numbers and the text with your own; keep the file name pattern `YYYY-QN Personal Retreat`.

Previous retreat: [[2026-Q2 Personal Retreat]] · Quarter note: [[2026-Q3]] · Same quarter last year: [[2025-Q3 Personal Retreat]]

## 1. Review life theme and core values
![[Life Theme#Theme]]
![[Core Values#Values]]

Notes:
- Still resonates. No change.

## 2. Review the journal
```dataviewjs
const q = moment(dv.current().quarter, "YYYY-[Q]Q");
await dv.view("Meta/views/dailyquestions", { from: q.clone().startOf("quarter").format("YYYY-MM-DD"), to: q.clone().endOf("quarter").format("YYYY-MM-DD") });
```
```dataviewjs
await dv.view("Meta/views/habits", { days: 28 });
```
What stood out:
- Relationships score consistently the lowest of the daily questions.

## 3. Wheel of life
```dataviewjs
await dv.view("Meta/views/wheel", { page: dv.current().file.path });
```
Focus area for the next 90 days:
- Relationships

Why this one:
- Lowest on the wheel and lowest daily question. Everything else is holding.

## 4. Retrospective
### Part 1: Look back at last quarter
What went well:
- Journaling stuck for 60+ days.

What did not go well:
- Habit tracking lived in a separate app and died in week 3.

What I learned:
- Tracking only sticks next to the reflection that explains the misses.

### Part 2: Start / Stop / Keep
| Start | Stop | Keep |
| --- | --- | --- |
| One friend call per week | Separate habit app | Daily questions at 21:00 |

## 5. Intentions for next quarter
1. Call or see one friend every week.
2. Habits tracked in the daily note, reviewed every Friday.
3. Ship one piece of writing every week from the vault.

## 6. Review the ideal week
![[Ideal Week#Grid]]

Changes to make:
- Add "friend call" to Thursday 20:00.

## 7. Projects to commit to
- [[Example Project - Compass Vault]]

## Closing
- A quarter of showing up for people, tracked honestly.
