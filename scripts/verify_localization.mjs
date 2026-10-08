#!/usr/bin/env node

// Synthetic VM regression only. No personal vault, native app, or provider calls.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(process.argv[2] || ".");
const mainPath = path.join(root, ".obsidian/plugins/life-os-app/main.js");
const source = fs.readFileSync(mainPath, "utf8");
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: Boolean(ok), detail });
const walk = (element) => [element, ...element.children.flatMap(walk)];
const texts = (element) => walk(element).map((node) => String(node.options.text ?? node.textContent ?? ""));
const hasClass = (element, cls) => String(element.options.cls || "").split(/\s+/).includes(cls);
const byClass = (element, cls) => walk(element).filter((node) => hasClass(node, cls));

class FakeElement {
  constructor(tag = "div", options = {}) {
    this.tag = tag;
    this.options = { ...options };
    this.children = [];
    this.handlers = {};
    this.style = {};
    this.value = options.attr?.value || "";
  }
  empty() { this.children = []; }
  createEl(tag, options = {}) {
    const child = new FakeElement(tag, options);
    this.children.push(child);
    return child;
  }
  createDiv(options) { return this.createEl("div", options); }
  createSpan(options) { return this.createEl("span", options); }
  addClass(name) { this.options.cls = `${this.options.cls || ""} ${name}`.trim(); }
  setText(value) { this.options.text = String(value); }
  setAttribute(name, value) { this.options.attr = { ...this.options.attr, [name]: String(value) }; }
  addEventListener(name, handler) { this.handlers[name] = handler; }
  getContext() { return null; }
}

class Component {
  addChild(child) { (this.children ||= new Set()).add(child); child.onload?.(); }
  removeChild(child) { this.children?.delete(child); child.onunload?.(); }
  registerDomEvent(element, name, handler) { element.addEventListener(name, handler); }
  registerEvent(event) { return event; }
}
class ItemView extends Component {
  constructor(leaf) { super(); this.app = leaf.app; this.leaf = leaf; this.contentEl = new FakeElement(); }
}
// The preexisting Capture Modal uses registerDomEvent, although Obsidian Modal
// does not provide Component lifecycle methods. This shim isolates localization
// routing; the existing native defect must not be reported as fixed by this gate.
class Modal extends Component {
  constructor(app) { super(); this.app = app; this.contentEl = new FakeElement(); Modal.lastOpened = this; }
  open() { this.onOpen(); }
  close() { this.onClose(); }
}
class Plugin extends Component {
  constructor() { super(); this.saved = undefined; this.writes = []; }
  async loadData() { return this.saved; }
  async saveData(value) { this.saved = { ...value }; this.writes.push({ ...value }); }
  registerView(type, factory) { (this.views ||= new Map()).set(type, factory); }
  addRibbonIcon(icon, name, callback) { this.ribbon = { icon, name, callback }; }
  addCommand(command) {
    // Obsidian returns the registered command with its plugin prefixes applied.
    const registered = { ...command, id: `life-os-app:${command.id}`, name: `Life OS: ${command.name}` };
    (this.commands ||= []).push(registered);
    return registered;
  }
}
class TFile {
  constructor(filePath) { this.path = filePath; this.basename = filePath.split("/").pop().replace(/\.md$/, ""); }
}
const moment = (value = "2026-09-09") => {
  const date = new Date(`${value}T12:00:00Z`);
  return {
    clone: () => moment(date.toISOString().slice(0, 10)),
    subtract(n) { date.setUTCDate(date.getUTCDate() - n); return this; },
    format(format) {
      const iso = date.toISOString().slice(0, 10);
      return ({ "YYYY-MM-DD": iso, "YYYY-MM": iso.slice(0, 7), "gggg-[W]ww": "2026-W37", "YYYY-[Q]Q": "2026-Q3", "D MMM": "9 Sep", "ddd": "Wed", "[Week] ww": "Week 37" })[format] || iso;
    },
  };
};
moment.localeData = () => ({ firstDayOfWeek: () => 1 });

const moduleBox = { exports: {} };
const context = vm.createContext({
  module: moduleBox,
  exports: moduleBox.exports,
  setTimeout,
  clearTimeout,
  ResizeObserver: class { observe() {} disconnect() {} },
  require(id) {
    if (id !== "obsidian") throw new Error(`Unexpected dependency: ${id}`);
    return { Component, ItemView, Modal, Plugin, TFile, moment, Notice: class {}, setIcon() {} };
  },
});

try {
  vm.runInContext(`${source}\n;globalThis.localizationTest = { translate, normalizeLanguage, LifeOSHomeView, LifeOSBrainRenderer };`, context, { filename: mainPath });
  const { translate, normalizeLanguage, LifeOSHomeView, LifeOSBrainRenderer } = context.localizationTest;
  const LifeOSPlugin = moduleBox.exports;
  check("locale normalization", normalizeLanguage("zh-cn") === "zh-CN" && normalizeLanguage("fr-FR") === "en" && normalizeLanguage(undefined) === "en");
  check("English translations retain source text", ["Home", "Today", "Journal", "Add a task", "Capture"].every((message) => translate("en", message) === message));
  check("Chinese common interface translations", [["Home", "首页"], ["Today", "今天"], ["Journal", "日记"], ["Add a task", "添加任务"], ["Capture", "记录"]].every(([message, expected]) => translate("zh-CN", message) === expected));
  check("unsupported and missing translations fall back to English", translate("fr-FR", "Home") === "Home" && translate("zh-CN", "Untranslated fixture message") === "Untranslated fixture message");
  const literal = "Home ${title} $& {count} <日记>";
  check("interpolation preserves user values verbatim", translate("zh-CN", "Fixture {title} / {count}", { title: literal, count: 7 }) === `Fixture ${literal} / 7`);
  check("interpolation preserves unspecified placeholders", translate("en", "Fixture {missing}") === "Fixture {missing}");

  const makeFixture = async (saved) => {
    const files = new Map(), metadata = new Map(), contents = new Map();
    const add = (filePath, frontmatter = {}, body = "") => {
      const file = new TFile(filePath);
      files.set(filePath, file);
      metadata.set(filePath, {
        frontmatter,
        listItems: body.split("\n").flatMap((line, index) => {
          const match = line.match(/^- \[(.)\]/);
          return match ? [{ task: match[1], position: { start: { line: index } } }] : [];
        }),
      });
      contents.set(filePath, body);
    };
    add("Meta/Compass Config.md", { questions: [{ key: "dq_fixture", text: "Home" }], habits: ["habit_fixture"] });
    add("00 Dashboards/Setup.md", { status: "done" });
    add("01 Journal/Daily/2026-09-09.md", { dq_fixture: 8, habit_fixture: true });
    add("04 Projects/Home.md", { type: "project", status: "active" }, "- [ ] Today #project/home 📅 2026-09-09");
    add("05 People/Today.md", { type: "person" });
    add("08 Tasks/Tasks.md", {}, "- [ ] Journal 📅 2026-09-09");
    const leaves = [], commands = [], opened = [];
    const app = {
      commands: { executeCommandById(id) { commands.push(id); return true; } },
      plugins: { getPlugin: () => null },
      metadataCache: { resolvedLinks: {}, on: () => ({}), getFileCache: (file) => metadata.get(file.path) || { frontmatter: {}, listItems: [] } },
      vault: { on: () => ({}), getMarkdownFiles: () => [...files.values()], getAbstractFileByPath: (filePath) => files.get(filePath), cachedRead: async (file) => contents.get(file.path) || "" },
      workspace: {
        getLeavesOfType: (type) => leaves.filter((leaf) => leaf.view?.getViewType?.() === type),
        getLeaf: () => ({ async setViewState() {}, async openFile(file) { opened.push(file.path); } }),
        onLayoutReady() {}, revealLeaf: async () => {}, detachLeavesOfType() {},
      },
    };
    const plugin = new LifeOSPlugin();
    plugin.app = app;
    plugin.saved = saved;
    await plugin.onload();
    const view = new LifeOSHomeView({ app }, plugin);
    leaves.push({ view });
    await view.onOpen();
    return { plugin, view, app, leaves, commands, opened };
  };

  const english = await makeFixture(undefined);
  check("fresh installation defaults to English", english.plugin.language === "en" && texts(english.view.contentEl).includes("Home"));
  const commandIds = [...english.plugin.commands].map((command) => command.id);
  const commandNames = english.plugin.commands.map((command) => command.name);
  await english.plugin.setLanguage("zh-CN");
  const chineseNamesKeepPrefix = english.plugin.commands.every((command) => command.name.startsWith("Life OS: ") && /[\u3400-\u9fff]/u.test(command.name));
  await english.plugin.setLanguage("en");
  check("English to Chinese to English preserves registered command metadata", chineseNamesKeepPrefix && JSON.stringify(english.plugin.commands.map((command) => command.id)) === JSON.stringify(commandIds) && JSON.stringify(english.plugin.commands.map((command) => command.name)) === JSON.stringify(commandNames));
  const unsupported = await makeFixture({ language: "fr-FR" });
  check("unsupported saved locale renders English", unsupported.plugin.language === "en" && texts(unsupported.view.contentEl).includes("Home"));
  const chinese = await makeFixture({ language: "zh-CN" });
  check("saved Chinese locale renders navigation and capture", chinese.plugin.language === "zh-CN" && ["首页", "今天", "记录"].every((text) => texts(chinese.view.contentEl).includes(text)));
  check("localization preserves command IDs", JSON.stringify(chinese.plugin.commands.map((command) => command.id)) === JSON.stringify(commandIds));
  check("Chinese registered command names keep the Obsidian prefix", chinese.plugin.commands.every((command) => command.name.startsWith("Life OS: ") && /[\u3400-\u9fff]/u.test(command.name)));

  for (const [screen, message] of [["today", "Today"], ["projects", "Projects"], ["people", "People"]]) {
    chinese.view.activeScreen = screen;
    chinese.view.render();
    check(`Chinese ${screen} module title`, walk(chinese.view.contentEl).some((node) => node.tag === "h1" && node.options.text === chinese.plugin.t(message) && /[\u3400-\u9fff]/u.test(node.options.text)));
  }
  chinese.view.activeScreen = "projects";
  chinese.view.render();
  const projectCards = byClass(chinese.view.contentEl, "life-os-record-card");
  check("user note title equal to a UI key remains original", projectCards.some((card) => texts(card).includes("Home")));
  if (projectCards[0]) await projectCards[0].handlers.click();
  check("localized record opens its canonical path", chinese.opened.includes("04 Projects/Home.md"));
  chinese.view.activeScreen = "today";
  chinese.view.render();
  check("user question equal to a UI key remains original", byClass(chinese.view.contentEl, "life-os-today-row").some((row) => texts(row).includes("Home")));
  check("user task text equal to a UI key remains original", byClass(chinese.view.contentEl, "life-os-task-row").some((row) => texts(row).includes("Journal")));
  const allAttrs = walk(chinese.view.contentEl).flatMap((node) => Object.entries(node.options.attr || {}));
  check("Chinese accessible check-in label", allAttrs.some(([name, value]) => name === "aria-label" && /[\u3400-\u9fff]/u.test(value) && String(value).includes("2")));

  const brain = new LifeOSBrainRenderer(chinese.app, new FakeElement(), false, chinese.plugin);
  await brain.onOpen();
  check("Chinese Brain search accessibility", walk(brain.contentEl).some((node) => node.options.attr?.["aria-label"] === chinese.plugin.t("Search brain notes") && /[\u3400-\u9fff]/u.test(node.options.attr["aria-label"])));
  check("Brain preserves user titles equal to UI keys", byClass(brain.contentEl, "life-os-brain-note").some((node) => texts(node).includes("Home")));
  await brain.onClose();

  chinese.plugin.openCapture();
  const modal = Modal.lastOpened;
  check("Chinese capture menu renders localized choices", ["记录", "日记", "添加任务"].every((text) => texts(modal.contentEl).includes(text)));
  const choice = byClass(modal.contentEl, "life-os-capture-choice").find((button) => texts(button).includes("日记"));
  choice?.handlers.click();
  check("localized capture keeps canonical QuickAdd ID", chinese.commands.at(-1) === "quickadd:choice:lifeos-journal");

  const secondHome = new LifeOSHomeView({ app: chinese.app }, chinese.plugin);
  secondHome.activeScreen = "projects";
  chinese.leaves.push({ view: secondHome });
  await secondHome.onOpen();
  const brainFactory = chinese.plugin.views.get("life-os-brain");
  const standalone = brainFactory({ app: chinese.app });
  chinese.leaves.push({ view: standalone });
  await standalone.onOpen();
  const chineseBrainTitle = chinese.plugin.t("Your connected brain");
  check("standalone Brain starts in saved Chinese", /[\u3400-\u9fff]/u.test(chineseBrainTitle) && texts(standalone.contentEl).includes(chineseBrainTitle));
  await chinese.plugin.setLanguage("en");
  check("language change persists normalized preference", chinese.plugin.language === "en" && chinese.plugin.writes.at(-1)?.language === "en");
  check("language toggle preserves registered command IDs and name prefixes", JSON.stringify(chinese.plugin.commands.map((command) => command.id)) === JSON.stringify(commandIds) && JSON.stringify(chinese.plugin.commands.map((command) => command.name)) === JSON.stringify(commandNames));
  check("language change refreshes every open app view", texts(chinese.view.contentEl).includes("Today") && texts(secondHome.contentEl).includes("Projects") && !texts(secondHome.contentEl).includes("项目") && texts(standalone.contentEl).includes("Your connected brain") && !texts(standalone.contentEl).includes(chineseBrainTitle));
  check("switching back restores English UI", texts(chinese.view.contentEl).includes("Today") && !texts(chinese.view.contentEl).includes("今天"));
  await english.view.onClose();
  await unsupported.view.onClose();
  await chinese.view.onClose();
  await secondHome.onClose();
  await standalone.onClose();
} catch (error) {
  check("localization runtime", false, error.stack || String(error));
}

for (const result of results.filter((entry) => !entry.ok)) console.error(`FAIL ${result.name}${result.detail ? `: ${result.detail}` : ""}`);
const failed = results.filter((entry) => !entry.ok).length;
console.log(`${results.length - failed} passed, ${failed} failed (synthetic localization only; native acceptance not established)`);
process.exitCode = failed ? 1 : 0;
