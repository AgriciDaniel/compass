# Workflow 2: Quarterly Personal Retreat

Video: 5:52 to 7:53. "Without exaggeration, the single highest leverage day on my calendar."

## Format (6:12), in the order Mike does it
1. Review **life theme** and **core values**: do they still resonate?
2. Review **journal entries** (queries + daily questions dashboard, spot trends).
3. **Wheel of life**: rate current happiness per area, choose one area for the next 90 days.
4. **Two-part retrospective**: look back at the quarter; then list what to **start, stop, keep**.
5. **Set intentions** for the next quarter.
6. Review the **ideal week** so the intentions actually have time.

## How it is built here
- `Templates/Personal Retreat.md`, auto-applied to any note created in `02 Retreats/` (Templater folder template).
- File name convention **`YYYY-QN Personal Retreat`**. The Compass dashboard finds the current quarter's retreat by that name and date (19:22) and draws the wheel from the `wheel_*` number properties. Fallback: most recent retreat.
- The template links the previous retreat and the same quarter last year, so you can put them side by side (7:10).
- Sections 2 and 3 render live: daily questions for the quarter, habits, wins list, and the radar chart of your own `wheel_*` values.
- Section 5's intentions are embedded into the quarterly note and from there into every weekly note. Write them once.

## Wheel of life areas (edit to taste)
`wheel_faith`, `wheel_family`, `wheel_marriage`, `wheel_friends`, `wheel_health`, `wheel_career`, `wheel_finances`, `wheel_growth`. Rename in the template; the chart discovers whatever `wheel_*` exists.

## Practices
- Block a whole day. No cabin required (7:40).
- Read last quarter's retreat first. If this quarter's intentions are last quarter's with new wording, that is the finding.
- Three intentions maximum. Each must be actionable weekly.
- End by creating or updating project notes with `quarter:` set, so the quarterly note lists them.

Related: NeuYear Personal Retreat Planner (paper option Mike links): https://www.neuyear.net/products/the-personal-retreat-planner
