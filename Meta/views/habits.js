// Compass Habit Canvas widget.
// Usage:  await dv.view("Meta/views/habits", { days: 14 })
// Reads every daily note, finds checkbox properties starting with habit_prefix and
// renders: last N days grid, current streak, best streak, longest break, completion %, total.
const cfg = dv.page("Meta/Compass Config") || {};
const FOLDER = cfg.daily_folder || "01 Journal/Daily";
const PREFIX = cfg.habit_prefix || "habit_";
const DAYS = (input && input.days) || 14;

const isDaily = n => /^\d{4}-\d{2}-\d{2}$/.test(n);
const pages = dv.pages(`"${FOLDER}"`).where(p => isDaily(p.file.name)).array();
const byDate = new Map();
const habits = new Set();
for (const p of pages) {
  const fm = p.file.frontmatter || {};
  const vals = {};
  for (const k of Object.keys(fm)) {
    if (!k.startsWith(PREFIX)) continue;
    habits.add(k);
    vals[k] = fm[k] === true;
  }
  byDate.set(p.file.name, vals);
}

const root = dv.container.createEl("div", { cls: "lifeos-widget" });
if (habits.size === 0) {
  root.createEl("p", { text: `No checkbox properties starting with "${PREFIX}" found in ${FOLDER} yet. Add some to Templates/Daily Note.md and start checking them off.` });
} else {
  const today = moment().startOf("day");
  const fmt = d => d.format("YYYY-MM-DD");
  const label = k => k.slice(PREFIX.length).replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const dates = [...byDate.keys()].sort();
  const first = moment(dates[0]);
  const rows = [];
  for (const h of [...habits].sort()) {
    const rec = d => byDate.get(fmt(d));
    const tracked = d => { const v = rec(d); return !!v && (h in v); };
    const done = d => { const v = rec(d); return !!v && v[h] === true; };

    // current streak: count back from today; if today is not done yet, start from yesterday
    let cur = 0;
    let d = today.clone();
    if (!done(d)) d.subtract(1, "day");
    while (done(d)) { cur++; d.subtract(1, "day"); }

    // best streak, longest break, totals (calendar days from first daily note to today)
    let best = 0, run = 0, brk = 0, gap = 0, total = 0, trackedDays = 0;
    for (let x = first.clone(); !x.isAfter(today); x.add(1, "day")) {
      if (tracked(x)) trackedDays++;
      if (done(x)) { total++; run++; if (run > best) best = run; if (gap > brk) brk = gap; gap = 0; }
      else if (tracked(x)) { run = 0; gap++; }   // tracked and missed: breaks the streak, extends the break
      else { run = 0; }                          // no daily note: breaks the streak, does not count as a break day
    }
    if (gap > brk) brk = gap;
    const pct = trackedDays ? Math.round(100 * total / trackedDays) : 0;

    const grid = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const x = today.clone().subtract(i, "day");
      grid.push(done(x) ? "●" : (tracked(x) ? "○" : "·"));
    }
    rows.push({ name: label(h), grid: grid.join(""), cur, best, brk, pct, total });
  }

  const table = root.createEl("table", { cls: "lifeos-table" });
  const thead = table.createEl("thead").createEl("tr");
  for (const h of ["Habit", `Last ${DAYS} days`, "Current", "Best", "Longest break", "Completion", "Total"]) thead.createEl("th", { text: h });
  const tbody = table.createEl("tbody");
  for (const r of rows) {
    const tr = tbody.createEl("tr");
    tr.createEl("td", { text: r.name });
    tr.createEl("td", { text: r.grid, cls: "lifeos-grid" });
    tr.createEl("td", { text: String(r.cur) });
    tr.createEl("td", { text: String(r.best) });
    tr.createEl("td", { text: String(r.brk) });
    tr.createEl("td", { text: r.pct + "%" });
    tr.createEl("td", { text: String(r.total) });
  }
  root.createEl("p", { text: "● done   ○ tracked but missed   · no daily note", cls: "lifeos-legend" }).style.opacity = "0.6";
}
