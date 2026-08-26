// Compass Boards widget: every Kanban board in the vault with card counts per lane.
// Usage:
//   await dv.view("Meta/views/boards")                       all boards, all lanes
//   await dv.view("Meta/views/boards", { compact: true })    one line per board: open cards + the lane that needs attention
//   await dv.view("Meta/views/boards", { folder: "06 Writing" })
const cfg = dv.page("Meta/Compass Config") || {};
const FOLDER = input && input.folder ? input.folder : null;
const COMPACT = !!(input && input.compact);
const DONE_LANES = (cfg.board_done_lanes || "Done,Published,Archive").split(",").map(s => s.trim().toLowerCase());

const boards = dv.pages(FOLDER ? `"${FOLDER}"` : "").where(p => {
  const fm = p.file.frontmatter || {};
  return typeof fm["kanban-plugin"] === "string";
}).sort(p => p.file.path).array();

const root = dv.container.createEl("div", { cls: "lifeos-widget" });
if (boards.length === 0) {
  root.createEl("p", { text: "No Kanban boards found (a board is any note with `kanban-plugin` in its properties)." });
} else {
  const parsed = [];
  for (const b of boards) {
    const tfile = app.vault.getAbstractFileByPath(b.file.path);
    let text = "";
    try { text = await app.vault.cachedRead(tfile); } catch (e) { continue; }
    text = text.replace(/^---[\s\S]*?---\n/, "");
    const cut = text.indexOf("\n%% kanban:settings");
    if (cut !== -1) text = text.slice(0, cut);
    const archiveCut = text.indexOf("\n***");
    if (archiveCut !== -1) text = text.slice(0, archiveCut);
    const lanes = [];
    let cur = null;
    for (const line of text.split("\n")) {
      const h = line.match(/^##\s+(.*)$/);
      if (h) { cur = { name: h[1].trim(), cards: [] }; lanes.push(cur); continue; }
      const c = line.match(/^- \[( |x)\]\s+(.*)$/);
      if (c && cur) cur.cards.push({ done: c[1] === "x", text: c[2].trim() });
    }
    const open = lanes.filter(l => !DONE_LANES.includes(l.name.toLowerCase())).reduce((s, l) => s + l.cards.length, 0);
    const done = lanes.filter(l => DONE_LANES.includes(l.name.toLowerCase())).reduce((s, l) => s + l.cards.length, 0);
    parsed.push({ page: b, lanes, open, done });
  }

  if (COMPACT) {
    const table = root.createEl("table", { cls: "lifeos-table" });
    const tr = table.createEl("thead").createEl("tr");
    for (const h of ["Board", "Open", "Done", "Lanes"]) tr.createEl("th", { text: h });
    const tb = table.createEl("tbody");
    for (const b of parsed) {
      const r = tb.createEl("tr");
      const td = r.createEl("td");
      const a = td.createEl("a", { text: b.page.file.name, cls: "internal-link", attr: { href: b.page.file.path, "data-href": b.page.file.path } });
      a.addEventListener("click", e => { e.preventDefault(); app.workspace.openLinkText(b.page.file.path, "", false); });
      r.createEl("td", { text: String(b.open) });
      r.createEl("td", { text: String(b.done) });
      r.createEl("td", { text: b.lanes.filter(l => !DONE_LANES.includes(l.name.toLowerCase())).map(l => `${l.name} ${l.cards.length}`).join("  ·  ") });
    }
  } else {
    for (const b of parsed) {
      const h = root.createEl("h4");
      const a = h.createEl("a", { text: b.page.file.name, cls: "internal-link", attr: { href: b.page.file.path, "data-href": b.page.file.path } });
      a.addEventListener("click", e => { e.preventDefault(); app.workspace.openLinkText(b.page.file.path, "", false); });
      h.appendText(`  (${b.open} open, ${b.done} done)`);
      const table = root.createEl("table", { cls: "lifeos-table" });
      const tr = table.createEl("thead").createEl("tr");
      for (const l of b.lanes) tr.createEl("th", { text: `${l.name} (${l.cards.length})` });
      const row = table.createEl("tbody").createEl("tr");
      for (const l of b.lanes) {
        const td = row.createEl("td");
        td.style.verticalAlign = "top";
        const items = l.cards.slice(0, 6);
        for (const c of items) {
          const d = td.createEl("div", { text: c.text.replace(/@\{[^}]*\}/g, "").replace(/\[\[|\]\]/g, "").trim() });
          if (c.done) d.style.opacity = "0.5";
          d.style.fontSize = "0.85em";
        }
        if (l.cards.length > items.length) td.createEl("div", { text: `+${l.cards.length - items.length} more` }).style.opacity = "0.6";
      }
    }
  }
}
