// Compass quick links: capture buttons (QuickAdd commands) + jump to today's multi-scale planning notes.
// Usage: await dv.view("Meta/views/quicklinks")
const cfg = dv.page("Meta/Compass Config") || {};
const DAILY = cfg.daily_folder || "01 Journal/Daily";
const WEEKLY = cfg.weekly_folder || "01 Journal/Weekly";
const QUARTERLY = cfg.quarterly_folder || "01 Journal/Quarterly";
const RETREATS = cfg.retreat_folder || "02 Retreats";
const root = dv.container.createEl("div", { cls: "lifeos-widget" });

const now = moment();
const links = [
  ["Today", `${DAILY}/${now.format("YYYY-MM-DD")}`, now.format("YYYY-MM-DD")],
  ["This week", `${WEEKLY}/${now.format("gggg-[W]ww")}`, now.format("gggg-[W]ww")],
  ["This quarter", `${QUARTERLY}/${now.format("YYYY-[Q]Q")}`, now.format("YYYY-[Q]Q")],
  ["Retreat", `${RETREATS}/${now.format("YYYY-[Q]Q")} Personal Retreat`, `${now.format("YYYY-[Q]Q")} Personal Retreat`],
];
const p = root.createEl("p");
p.appendText("Jump: ");
links.forEach(([lab, path, name], i) => {
  if (i) p.appendText("  ·  ");
  const a = p.createEl("a", { text: `${lab} (${name})`, cls: "internal-link", attr: { href: name, "data-href": name } });
  a.addEventListener("click", e => { e.preventDefault(); app.workspace.openLinkText(name, path, false); });
});

// Buttons resolve the QuickAdd choice by NAME at click time, so ids may change freely.
const buttons = [
  ["📝 Journal entry", "Journal entry", "lifeos-journal"],
  ["🏆 Log a win", "Log a win", "lifeos-win"],
  ["🙏 Gratitude", "Gratitude", "lifeos-gratitude"],
  ["✅ Add task", "Add task", "lifeos-task"],
];
const wrap = root.createEl("div", { cls: "lifeos-buttons" });
for (const [lab, name, fallbackId] of buttons) {
  const b = wrap.createEl("button", { text: lab });
  b.addEventListener("click", () => {
    const qa = app.plugins?.plugins?.quickadd;
    const choice = qa?.settings?.choices?.find(c => (c.name || "").includes(name));
    const id = `quickadd:choice:${choice ? choice.id : fallbackId}`;
    const ok = app.commands.executeCommandById(id);
    if (!ok) new Notice(`QuickAdd choice "${name}" not found or not enabled as a command. Check QuickAdd settings.`);
  });
}
