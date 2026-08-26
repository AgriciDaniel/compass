// Compass Setup status widget. Usage: await dv.view("Meta/views/setup")
// Detects what is still at its template default. Renders booleans only; never shows key values; never writes.
const cfg = dv.page("Meta/Compass Config") || {};
const cur = dv.current() || {};
const rows = [];
const add = (tier, item, ok, where, note) => rows.push({ tier, item, ok, where, note: note || "" });
const readJson = async p => { try { return JSON.parse(await app.vault.adapter.read(p)); } catch (e) { return null; } };
const readText = async p => { try { const f = app.vault.getAbstractFileByPath(p); return f ? await app.vault.cachedRead(f) : ""; } catch (e) { return ""; } };
const enabled = id => { try { return app.plugins.enabledPlugins.has(id); } catch (e) { return false; } };
const pset = id => { try { return app.plugins.plugins[id]?.settings || null; } catch (e) { return null; } };
const today = moment();

// Tier 0: the app
for (const [id, name] of [["dataview", "Dataview"], ["templater-obsidian", "Templater"], ["periodic-notes", "Periodic Notes"], ["quickadd", "QuickAdd"], ["obsidian-tasks-plugin", "Tasks"], ["obsidian-kanban", "Kanban"]])
  add(0, `${name} plugin enabled`, enabled(id), "Settings → Community plugins");
add(0, "Dataview JavaScript queries on", !!(pset("dataview")?.enableDataviewJs), "Settings → Dataview");
add(0, "CSS snippet lifeos on", (() => { try { return app.customCss.enabledSnippets.has("lifeos"); } catch (e) { return false; } })(), "Settings → Appearance → CSS snippets");
add(0, "Periodic Notes daily folder matches config", (() => { const pn = pset("periodic-notes"); return !!pn && pn.daily?.folder === (cfg.daily_folder || "01 Journal/Daily") && /Daily Note\.md$/.test(pn.daily?.template || ""); })(), "Settings → Periodic Notes");
add(0, "Templater triggers on new files", (() => { const t = pset("templater-obsidian"); return !!t && (t.trigger_on_file_creation === true || t.trigger_on_file_creation_mode === "folder"); })(), "Settings → Templater");
add(0, "QuickAdd captures available as commands", (() => { const ch = pset("quickadd")?.choices || []; return ["Journal entry", "Log a win", "Gratitude", "Add task"].every(n => ch.find(c => (c.name || "").includes(n))?.command === true); })(), "Settings → QuickAdd (lightning icon per choice)");
add(0, "Hotkeys for today's note and the questions prompt", (() => { try { const hk = app.hotkeyManager.customKeys || {}; return ["quickadd:choice:lifeos-daily", "templater-obsidian:Templates/Daily Questions Prompt.md"].every(id => (hk[id] || []).length > 0); } catch (e) { return false; } })(), "Settings → Hotkeys");

// Tier 1: make it yours
add(1, "Birthdate set", !!cfg.birthdate && String(cfg.birthdate).slice(0, 10) !== "1990-01-01", "[[Compass Config]]");
const theme = await readText("03 Planning/Life Theme.md");
add(1, "Life theme written", theme.length > 0 && !theme.includes("Replace this line with your life theme"), "[[Life Theme]]");
const values = await readText("03 Planning/Core Values.md");
add(1, "Core values written", values.length > 0 && !/\*\*Value one\*\*/.test(values), "[[Core Values]]");
add(1, "Ideal week is yours (example property removed)", !((dv.page("03 Planning/Ideal Week") || {}).example === true), "[[Ideal Week]]", "fill the grid, then delete the example property");
add(1, "Questions, habits, wheel areas reviewed", Array.isArray(cfg.questions) && cfg.questions.length > 0 && Array.isArray(cfg.habits) && cfg.habits.length <= 5, "[[Compass Config]]", Array.isArray(cfg.habits) && cfg.habits.length > 5 ? "more than 5 habits; keep 3 to 5 per season" : "");
const examples = dv.pages("#example").length;
add(1, "Example notes deleted", examples === 0, "[[16 Onboarding Assistant]] step 6, or delete notes tagged example", examples ? `${examples} example notes remain` : "");

// Tier 2: the practice
const daily = cfg.daily_folder || "01 Journal/Daily";
const dqp = cfg.dq_prefix || "dq_";
add(2, "Today's daily note exists", !!dv.page(`${daily}/${today.format("YYYY-MM-DD")}`), "Ctrl/Cmd+Shift+D");
const real = dv.pages(`"${daily}"`).where(p => /^\d{4}-\d{2}-\d{2}$/.test(p.file.name) && !(p.tags || []).includes("example")).array();
const answered = real.filter(p => Object.entries(p.file.frontmatter || {}).some(([k, v]) => k.startsWith(dqp) && v !== null && v !== "" && v !== undefined));
const last30 = answered.filter(p => today.diff(moment(p.file.name), "days") < 30).length;
add(2, "First real daily questions answered", answered.length > 0, "Ctrl/Cmd+Shift+Q tonight, or [[02 End of Day Coaching]]");
add(2, `Days answered in the last 30 (goal 25)`, last30 >= 25, "keep going", `${last30}/30`);
add(2, "This week's weekly note exists", !!dv.page(`${cfg.weekly_folder || "01 Journal/Weekly"}/${today.format("gggg-[W]ww")}`), "Command palette: Periodic Notes: Open weekly note", "from week 2");
add(2, "A personal retreat note exists for this quarter", !!dv.page(`${cfg.retreat_folder || "02 Retreats"}/${today.format("YYYY-[Q]Q")} Personal Retreat`), "[[04 Workflow - Personal Retreat]]", "from day 60");
const plan = (await readText("09 Reading/Reading Plan.md")).replace(/```[\s\S]*?```/g, "");
if (app.vault.getAbstractFileByPath("09 Reading")) add(2, "Reading module decided (plan filled, or delete the folder)", /^- \[ \]/m.test(plan), "[[07 Workflow - Daily Reading]]", "optional");

// Tier 3: AI in the vault (optional)
add(3, "Agent Client plugin enabled", enabled("agent-client"), "Settings → Community plugins", "optional");
const ac = await readJson(".obsidian/plugins/agent-client/data.json");
const cmd = ac?.presetAgents?.["claude-code-acp"]?.command || "";
const isLinux = navigator.userAgent.includes("Linux") && !navigator.userAgent.includes("Android");
add(3, "Claude Code path set in Agent Client", cmd.length > 0 && (!isLinux || cmd.startsWith("/")), "Settings → Agent Client → Claude Code → Auto-detect", "optional; on Linux Flatpak paste the full path to the wrapper, see Guide 14");
add(3, "Claude Code login done (self-declared)", cur.setup_claude_login === true, "tick setup_claude_login in this note's properties", "optional");
add(3, "Obsidian MCP server registered for your agent (self-declared)", cur.setup_mcp_registered === true, "[[19 Obsidian MCP Bridge]] then tick setup_mcp_registered", "optional");
add(3, "Agent Client has had a conversation", (ac?.savedSessions || []).length > 0, "[[Assistant]]", "optional");

// Tier 4: browser and web (optional)
add(4, "Local REST API enabled", enabled("obsidian-local-rest-api"), "Settings → Community plugins", "optional");
const ra = await readJson(".obsidian/plugins/obsidian-local-rest-api/data.json");
add(4, "REST API key generated (never shown here)", typeof ra?.apiKey === "string" && ra.apiKey.length > 0 && ra?.enableInsecureServer === true, "Settings → Local REST API", "optional");
add(4, "Vault Lens extension connected (self-declared)", cur.setup_vault_lens === true, "[[17 Search Providers]] then tick setup_vault_lens", "optional");
add(4, "Web viewer core plugin on", (() => { try { return app.internalPlugins.plugins.webviewer?.enabled === true; } catch (e) { return false; } })(), "Settings → Core plugins", "optional");
add(4, "SEO scan directory set", ((await readJson(".obsidian/plugins/seo/data.json"))?.scanDirectories || "").includes("06 Writing"), "Settings → SEO", "optional");
add(4, "Backup of the vault folder exists (self-declared)", cur.setup_backup === true, "copy the folder somewhere else, then tick setup_backup");

// Render
const root = dv.container.createEl("div", { cls: "lifeos-widget" });
if (cur.status === "done") { root.createEl("p", { text: "Setup marked done. Change the status property of this note to reopen the checklist." }); }
else {
  const tiers = { 0: "Tier 0: the app", 1: "Tier 1: make it yours", 2: "Tier 2: the practice", 3: "Tier 3: AI in the vault (optional)", 4: "Tier 4: browser and web (optional)" };
  const total = rows.filter(r => r.tier <= 2).length, done = rows.filter(r => r.tier <= 2 && r.ok).length;
  root.createEl("p", { text: `Required items done: ${done} of ${total}. Optional tiers below are extras; the vault works without them.` });
  for (const t of [0, 1, 2, 3, 4]) {
    root.createEl("h4", { text: tiers[t] });
    const table = root.createEl("table", { cls: "lifeos-table" });
    const th = table.createEl("thead").createEl("tr"); for (const h of ["", "Item", "Where to fix", "Note"]) th.createEl("th", { text: h });
    const tb = table.createEl("tbody");
    for (const r of rows.filter(x => x.tier === t)) {
      const tr = tb.createEl("tr");
      tr.createEl("td", { text: r.ok ? "✅" : "⬜" });
      tr.createEl("td", { text: r.item });
      const td = tr.createEl("td");
      const m = r.where.match(/^\[\[([^\]]+)\]\]/);
      if (m) { const a = td.createEl("a", { text: m[1], cls: "internal-link", attr: { href: m[1], "data-href": m[1] } }); a.addEventListener("click", e => { e.preventDefault(); app.workspace.openLinkText(m[1], "", false); }); td.appendText(r.where.slice(m[0].length)); }
      else td.setText(r.where);
      tr.createEl("td", { text: r.note });
    }
  }
}
