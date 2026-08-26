// Compass Daily Questions widget: lines + averages of every dq_* number property.
// Usage:
//   await dv.view("Meta/views/dailyquestions", { days: 30 })              interactive (dropdown + toggles)
//   await dv.view("Meta/views/dailyquestions", { from: "2026-07-01", to: "2026-09-30" })  fixed range
const cfg = dv.page("Meta/Compass Config") || {};
const FOLDER = cfg.daily_folder || "01 Journal/Daily";
const PREFIX = cfg.dq_prefix || "dq_";
const DEFAULT_RANGE = (input && input.days) || 30;
const FIXED_FROM = input && input.from ? moment(input.from) : null;
const FIXED_TO = input && input.to ? moment(input.to) : null;
const COLORS = ["#e6194b", "#3cb44b", "#4363d8", "#f58231", "#911eb4", "#42d4f4", "#f032e6", "#9a6324", "#469990", "#800000"];

const pages = dv.pages(`"${FOLDER}"`).where(p => /^\d{4}-\d{2}-\d{2}$/.test(p.file.name)).array();
const series = {};
for (const p of pages) {
  const fm = p.file.frontmatter || {};
  for (const k of Object.keys(fm)) {
    if (!k.startsWith(PREFIX)) continue;
    if (fm[k] === null || fm[k] === "" || fm[k] === undefined) continue;
    const v = Number(fm[k]);
    if (isNaN(v)) continue;
    (series[k] ||= []).push({ date: p.file.name, t: moment(p.file.name).valueOf(), v });
  }
}
const keys = Object.keys(series).sort();
const label = k => k.slice(PREFIX.length).replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const root = dv.container.createEl("div", { cls: "lifeos-widget" });
if (keys.length === 0) {
  root.createEl("p", { text: `No number properties starting with "${PREFIX}" found in ${FOLDER} yet. Answer your daily questions (Templates/Daily Questions Prompt.md) and they will show up here.` });
} else {
  const controls = root.createEl("div", { cls: "lifeos-controls" });
  let sel = null;
  if (!FIXED_FROM) {
    sel = controls.createEl("select");
    for (const [v, l] of [[7, "Last 7 days"], [30, "Last 30 days"], [90, "Last 90 days"], [365, "Last year"], [0, "All time"]]) {
      const o = sel.createEl("option", { text: l });
      o.value = String(v);
      if (v === DEFAULT_RANGE) o.selected = true;
    }
    sel.addEventListener("change", render);
  } else {
    controls.createEl("span", { text: `${FIXED_FROM.format("YYYY-MM-DD")} → ${FIXED_TO ? FIXED_TO.format("YYYY-MM-DD") : "today"}` });
  }
  const toggles = {};
  keys.forEach((k, i) => {
    const lab = controls.createEl("label");
    const cb = lab.createEl("input", { attr: { type: "checkbox" } });
    cb.checked = true;
    lab.appendText(" " + label(k));
    lab.style.color = COLORS[i % COLORS.length];
    toggles[k] = cb;
    cb.addEventListener("change", render);
  });
  const chart = root.createEl("div", { cls: "lifeos-chart" });
  const tableEl = root.createEl("div");

  function render() {
    const today = moment().startOf("day");
    let from, to = FIXED_TO ? FIXED_TO.clone().endOf("day") : today.clone().endOf("day");
    if (FIXED_FROM) from = FIXED_FROM.clone().startOf("day");
    else {
      const days = Number(sel.value);
      if (days > 0) from = today.clone().subtract(days - 1, "day");
      else { const all = keys.flatMap(k => series[k].map(x => x.t)); from = moment(Math.min(...all)).startOf("day"); }
    }
    const t0 = from.valueOf(), t1 = to.valueOf();
    const W = 720, H = 260, ml = 32, mr = 12, mt = 12, mb = 28;
    const iw = W - ml - mr, ih = H - mt - mb;
    const x = t => t1 === t0 ? ml + iw / 2 : ml + (t - t0) / (t1 - t0) * iw;
    const y = v => mt + (10 - v) / 9 * ih;
    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    for (let g = 1; g <= 10; g++) {
      svg += `<line x1="${ml}" x2="${W - mr}" y1="${y(g)}" y2="${y(g)}" stroke="currentColor" stroke-opacity="${g === 1 || g === 10 ? 0.35 : 0.12}" />`;
      if (g === 1 || g === 5 || g === 10) svg += `<text x="${ml - 6}" y="${y(g) + 4}" font-size="11" text-anchor="end" fill="currentColor" opacity="0.7">${g}</text>`;
    }
    svg += `<text x="${ml}" y="${H - 8}" font-size="11" fill="currentColor" opacity="0.7">${from.format("MMM D, YYYY")}</text>`;
    svg += `<text x="${W - mr}" y="${H - 8}" font-size="11" text-anchor="end" fill="currentColor" opacity="0.7">${to.format("MMM D, YYYY")}</text>`;
    const rows = [];
    keys.forEach((k, i) => {
      if (!toggles[k].checked) return;
      const pts = series[k].filter(p => p.t >= t0 && p.t <= t1).sort((a, b) => a.t - b.t);
      if (pts.length === 0) { rows.push([label(k), "-", "-", "-", 0, "-"]); return; }
      const color = COLORS[i % COLORS.length];
      const poly = pts.map(p => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
      svg += `<polyline points="${poly}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />`;
      for (const p of pts) svg += `<circle cx="${x(p.t).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="2.5" fill="${color}"><title>${p.date}: ${p.v}</title></circle>`;
      const vals = pts.map(p => p.v);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      svg += `<line x1="${ml}" x2="${W - mr}" y1="${y(avg)}" y2="${y(avg)}" stroke="${color}" stroke-opacity="0.35" stroke-dasharray="4 4" />`;
      rows.push([label(k), avg.toFixed(1), Math.min(...vals), Math.max(...vals), vals.length, vals[vals.length - 1]]);
    });
    svg += `</svg>`;
    chart.innerHTML = svg;
    let html = `<table class="lifeos-table"><thead><tr><th>Question</th><th>Average</th><th>Min</th><th>Max</th><th>Days answered</th><th>Latest</th></tr></thead><tbody>`;
    for (const r of rows) html += `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`;
    html += `</tbody></table>`;
    tableEl.innerHTML = html;
  }
  render();
}
