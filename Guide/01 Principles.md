Quoted or closely paraphrased from Mike Schmitz, with timestamps.

## 1. Connections are the point (0:00 to 2:40)
- "PKM isn't just about storing information, it's about connecting it." Apps that never integrate leave every area organized but none of it talking.
- This is **not** "make Obsidian do everything". He still says that is the wrong approach. The difference: cramming everything in for the sake of it, versus running the things that *benefit from being connected* in the same place.
- The chain he describes (1:29): journal entry → linked to the habits being built → feeding the quarterly retreat that judges whether they create change → shaping the projects committed to → producing the writing published → which pulls from the journal entries you started with. "The connections doing the heavy lifting."
- **PKM stack / jobs to be done**: hire each app for a specific job. Until you are clear on the jobs, no app gives you clarity. For most of his life-management jobs the right tool happens to be Obsidian; there are trade-offs, and it works because he is clear on what he wants.

## 2. Journal to craft the future (2:40 to 5:52)
- Daily Questions from Marshall Goldsmith's *Triggers*: "Did I do my best to ___?" Rate 1 to 10. Focus on **effort, not results**.
- Example: cut a 12-mile training run to 6 → maybe a 5. Sick, but did a slow 3 miles anyway → a 10. "Control what you can control and be intentional about your actions."
- Easier to do consistently because you never judge yourself on what got done.
- Values are written to **properties in the daily note** by an end-of-day shortcut. Wins, gratitude, and journal entries are captured with a QuickAdd macro into the same note. "No separate journaling apps to remember to open."
- **On this day**: a Bases query in the daily note template surfaces what you wrote 1, 2, 3 years ago on the same date. "It's not the act of writing the entry, it's the act of bumping into your past self when you weren't expecting to."
- "Don't journal to record the past, journal to craft the future. Drop a marker that future you will find useful."
- If he could keep only one Obsidian workflow for life, it is this one.

## 3. The personal retreat is the highest leverage day (5:52 to 7:53)
- Once a quarter, a full day off, everything in a single note.
- Format: review life theme and core values → review journal (queries + daily questions dashboard) → wheel of life (rate happiness per area, pick one for the next 90 days) → two-part retrospective (look back, then start/stop/keep) → set intentions for next quarter → review the ideal week so the intentions have time.
- Because past retreats are linkable, you can put Q2 2024 next to today's and "instantly see whether I'm actually changing or just rewriting the same goals with slightly different wording." "You can't lie to yourself when your own writing from 2 years ago is staring you in the face."
- "You do not need to go to a cabin in the woods. What you need is a few hours, a single document, and the willingness to actually answer the hard questions."

## 4. Multi-scale planning (7:53 to 9:45)
- Cal Newport's idea: align daily, weekly, and quarterly plans so you consistently act on what you decided mattered at the retreat.
- Above the quarter: roles and values. Mike's version: a **life theme** (personal mission statement) and **personal core values**, each an individual note, reviewed every 90 days.
- Cadence: quarterly, weekly, daily. **No annual plans**: "too long, and impossible to get right." A quarter is long enough for significant progress and short enough for built-in resets.
- Each layer is its own note, connected by the Periodic Notes plugin with separate templates for quarterly, weekly, daily.

## 5. Habits: no app, no notifications, no streak shame (9:45 to 11:51)
- He cycled through Streaks, Habitify, Strides, Way of Life every six months; none stuck, because the data lived away from the reflection that explained *why* a day was missed.
- Now: checkbox properties in the daily note for the habits tracked **this season**. 15 seconds at the end of the day. "That's the entire data entry layer."
- A DataviewJS dashboard reads every daily note and shows streaks, gaps, trends. Same visualization the apps gave, but next to the journal entry: the difference between "I missed 3 days" and "I missed 3 days because that's the week my dad was in the hospital."
- "Tracking honestly is more important than tracking perfectly." A tracker is only useful if it changes behaviour, and putting it in the place you already open every morning is "the single biggest behavior change lever."

## 6. Bible reading: the cleanest example of one-vault linking (11:51 to 14:11)
- Two representations: **note as chapter** (for the daily reading plan) and **note as verse** (30,000+ atomic notes).
- A chronological plan file holds repeating tasks per chapter assigned to a day; a custom callout in the daily note shows that day's reading.
- Sermon sketch notes since 2017 link to each verse mentioned, so the local graph is a personal cross-reference library. Maps of content, topical Bibles, and college notes link to verses too. Paper-Bible highlights became note-level tags.
- "No dedicated Bible app also holds my sermon notes, my book notes, and my journal. That's why everything lives in one vault."

## 7. Tasks without context are a list of guilt (14:11 to 16:42)
- Used OmniFocus, Todoist, Things, TickTick, Asana. All good; Obsidian replaced them for *his* kind of work.
- Pieces: Tasks plugin for inline tasks; most captured to a **master task list he never looks at**; project membership by **tag**; queries surface the right tasks at the right time.
- People notes with custom queries. A task tagged `discuss` + the person's tag rolls up into a discuss query read before the meeting. Same for projects. A task dashboard queries the whole vault for what to look at today.
- Why it beats a dedicated app: "Every task is one click away from the context that explains why it exists."
- Honest caveat: location reminders or 50 client projects with SLAs → "my system is probably terrible for you."
- Obsidian is where tasks **live**, not where the day is **executed**. The dashboard is "a recommendation engine"; he picks tasks and **time blocks** them. "The computer is the brain, but the notebook is the list."

## 8. Writing: just keep writing (16:42 to 18:36)
- Newsletters, YouTube scripts, course content, book notes, articles: every piece starts and ends in Obsidian.
- Not because the editor is magical, but because **source material and draft share the vault**: link the book note, embed the quote, keep writing. The friction between "I had an idea" and "it's in a published piece" kills most writing; same-vault writing fixes most of it.
- Kanban boards per writing type, separate folders per type, QuickAdd captures to the board backlog, cards move left to right until published. Each type has its own template and metadata. These are "task notes" rather than inline tasks.
- Export markdown at the end: scripts to the editor in Notion, newsletter through Kit, articles to Ghost.

## 9. The Compass dashboard (18:36 to 20:46)
- Built with DataviewJS (with Claude's help, per his earlier video). Wheel of life pulled from this quarter's retreat by date and naming convention; combined daily questions widget with toggles and a time-frame dropdown; habits widget with current streak, best streak, longest break, completion %, total, and recent days; life theme; memento mori; quick links to capture and to the planning notes.
- "Because everything I do is dynamically generated, I don't have to touch a single line of code."

## 10. Reduce the seams (22:07 to 23:17)
- "Every time you context switch between apps, you pay a small tax. Over months and years, those small taxes compound. The fewer seams you have, the more compound interest your system earns."
- That does not mean dump everything in one app. Find where the friction is, get clear on what you are optimizing for, then build.
- "What I showed you took me over 5 years to build. Please do not try to copy the whole thing in a weekend." Pick one workflow, probably daily journaling, get it working for 30 days, then layer the next one.

See [[11 Build Order]] for that layering turned into a plan.
