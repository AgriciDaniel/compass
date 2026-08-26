---
birthdate: 
life_expectancy: 80
daily_folder: 01 Journal/Daily
weekly_folder: 01 Journal/Weekly
quarterly_folder: 01 Journal/Quarterly
retreat_folder: 02 Retreats
projects_folder: 04 Projects
dq_prefix: dq_
habit_prefix: habit_
wheel_prefix: wheel_
board_done_lanes: Done,Published,Archive
questions:
  - key: dq_goals
    text: Did I do my best to set clear goals today?
  - key: dq_progress
    text: Did I do my best to make progress toward my goals?
  - key: dq_meaning
    text: Did I do my best to find meaning?
  - key: dq_happy
    text: Did I do my best to be happy?
  - key: dq_relationships
    text: Did I do my best to build positive relationships?
  - key: dq_engaged
    text: Did I do my best to be fully engaged?
habits:
  - habit_journal
  - habit_exercise
  - habit_reading
wheel_areas:
  - wheel_health
  - wheel_relationships
  - wheel_family
  - wheel_career
  - wheel_finances
  - wheel_growth
  - wheel_fun
  - wheel_meaning
---
# Compass Config

The single place the system reads its settings from. Every dashboard widget in `Meta/views/` starts with `dv.page("Meta/Compass Config")`, and the daily, retreat, and questions templates read the lists below when a new note is created. Change things here; nothing else needs to move.

## Personal
| Property | Used by | Notes |
| --- | --- | --- |
| `birthdate` | Memento Mori widget | ISO date, `YYYY-MM-DD`. Empty until you set it. |
| `life_expectancy` | Memento Mori widget | years |

## Daily questions (`questions`)
"Did I do my best to ..." rated 1 to 10, from Marshall Goldsmith's *Triggers*. Effort, not results. The six shipped are Goldsmith's universal set. Edit the text, rename keys (keep the `dq_` prefix, lowercase, no spaces), add or remove entries. New daily notes pick the list up automatically; the end-of-day prompt asks them in this order; dashboards discover whatever `dq_*` exists.

Preset from the video (Mike Schmitz), paste over the list if you prefer it:
```yaml
questions:
  - {key: dq_spiritual, text: Did I do my best to grow spiritually?}
  - {key: dq_spouse, text: Did I do my best to love my spouse?}
  - {key: dq_kids, text: Did I do my best to love my kids?}
  - {key: dq_friend, text: Did I do my best to be a good friend?}
  - {key: dq_learn, text: Did I do my best to learn something?}
  - {key: dq_create, text: Did I do my best to create something?}
  - {key: dq_exercise, text: Did I do my best to exercise?}
```

## Habits (`habits`)
Checkbox properties added to every new daily note. Keep 3 to 5 per season. Prefix `habit_`.

## Wheel of life (`wheel_areas`)
Number properties (1 to 10) added to every new personal retreat note. Rename freely with the `wheel_` prefix; the radar chart labels itself from the key.

## Folders and prefixes
| Property | Used by |
| --- | --- |
| `daily_folder`, `weekly_folder`, `quarterly_folder`, `retreat_folder`, `projects_folder` | widgets and quick links; must match the Periodic Notes settings |
| `dq_prefix`, `habit_prefix`, `wheel_prefix` | property discovery |
| `board_done_lanes` | Kanban lanes that count as finished on the Boards dashboard |

Not in English? Rename the keys (`dq_aprender`) and translate the `text` values; every chart labels itself from the key. The Guide stays in English.
