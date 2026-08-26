Projects are notes in `04 Projects/` with a `status`, `area`, `quarter`, and `due` property. Tasks belong to a project via `#project/<slug>`.

## Active
```dataviewjs
const cfg = dv.page("Meta/Compass Config") || {};
const folder = cfg.projects_folder || "04 Projects";
const projects = dv.pages(`"${folder}"`).where(p => p.type === "project" && p.status !== "done").sort(p => p.due ?? "9999", "asc");
const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const allTasks = dv.pages().where(p => !p.file.path.startsWith("wiki/")).file.tasks;
const rows = projects.map(p => {
  const tag = "#project/" + slug(p.file.name);
  const mine = allTasks.where(t => (t.tags || []).some(x => x === tag || x.startsWith(tag + "/")));
  const open = mine.where(t => !t.completed).length;
  const done = mine.where(t => t.completed).length;
  const pct = open + done ? Math.round(100 * done / (open + done)) : 0;
  return [p.file.link, p.status, p.area ?? "", p.quarter ?? "", p.due ?? "", open, `${pct}%`];
});
dv.table(["Project", "Status", "Area", "Quarter", "Due", "Open tasks", "Progress"], rows);
```

## By quarter
```dataview
TABLE WITHOUT ID file.link AS Project, status, area, due
FROM "04 Projects"
WHERE type = "project"
GROUP BY quarter
SORT quarter DESC
```

## Done
```dataview
LIST
FROM "04 Projects"
WHERE type = "project" AND status = "done"
SORT file.mtime DESC
```
