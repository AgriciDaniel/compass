const {
  Component,
  ItemView,
  Modal,
  Notice,
  Plugin,
  TFile,
  moment,
  setIcon,
} = require("obsidian");

const VIEW_TYPE = "life-os-home";

const DEFAULT_FOLDERS = Object.freeze({
  daily: "01 Journal/Daily",
  weekly: "01 Journal/Weekly",
  quarterly: "01 Journal/Quarterly",
  retreats: "02 Retreats",
  projects: "04 Projects",
});

const TASK_STATUS_TYPES = Object.freeze({
  " ": "open",
  "/": "open",
  x: "closed",
  X: "closed",
  "-": "closed",
});

function normalizeFolder(value, fallback) {
  const normalized = String(value || fallback)
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return normalized || fallback;
}

function ratingState(value) {
  if (value === undefined || value === null || value === "") {
    return { state: "missing", value: null };
  }
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 10
  ) {
    return { state: "recorded", value };
  }
  return { state: "invalid", value: null };
}

function habitState(value) {
  if (value === undefined || value === null || value === "") {
    return "missing";
  }
  if (value === true) {
    return "done";
  }
  if (value === false) {
    return "unchecked";
  }
  return "invalid";
}

const CAPTURE_ACTIONS = [
  {
    icon: "notebook-pen",
    label: "Journal",
    description: "Append a journal entry to today.",
    command: "quickadd:choice:lifeos-journal",
  },
  {
    icon: "trophy",
    label: "Log a win",
    description: "Record something worth remembering.",
    command: "quickadd:choice:lifeos-win",
  },
  {
    icon: "heart",
    label: "Gratitude",
    description: "Capture what you appreciate.",
    command: "quickadd:choice:lifeos-gratitude",
  },
  {
    icon: "check-square",
    label: "Add a task",
    description: "Send a task to the master inbox.",
    command: "quickadd:choice:lifeos-task",
  },
];

const CAPTURE_MENU_ACTIONS = [
  ...CAPTURE_ACTIONS,
  {
    icon: "lightbulb",
    label: "Project idea",
    description: "Add an idea to the Projects board.",
    command: "quickadd:choice:lifeos-project-idea",
  },
  {
    icon: "mail",
    label: "Newsletter idea",
    description: "Add an idea to the newsletter backlog.",
    command: "quickadd:choice:lifeos-newsletter-idea",
  },
  {
    icon: "video",
    label: "Video idea",
    description: "Add an idea to the video backlog.",
    command: "quickadd:choice:lifeos-video-idea",
  },
  {
    icon: "newspaper",
    label: "Article idea",
    description: "Add an idea to the article backlog.",
    command: "quickadd:choice:lifeos-article-idea",
  },
  {
    icon: "folder-plus",
    label: "New project",
    description: "Create a canonical project note from its template.",
    command: "quickadd:choice:lifeos-new-project",
  },
  {
    icon: "user-plus",
    label: "New person",
    description: "Create a private relationship note from its template.",
    command: "quickadd:choice:lifeos-new-person",
  },
  {
    icon: "file-plus-2",
    label: "New newsletter",
    description: "Create a newsletter draft from its template.",
    command: "quickadd:choice:lifeos-new-newsletter",
  },
  {
    icon: "file-video-2",
    label: "New video script",
    description: "Create a video script from its template.",
    command: "quickadd:choice:lifeos-new-video",
  },
  {
    icon: "file-pen-line",
    label: "New article",
    description: "Create an article draft from its template.",
    command: "quickadd:choice:lifeos-new-article",
  },
  {
    icon: "graduation-cap",
    label: "New course lesson",
    description: "Create a course lesson from its template.",
    command: "quickadd:choice:lifeos-new-course-lesson",
  },
  {
    icon: "book-plus",
    label: "New book note",
    description: "Create a book note in the local library.",
    command: "quickadd:choice:lifeos-new-book",
  },
  {
    icon: "book-open-check",
    label: "New study note",
    description: "Create a reading study note from its template.",
    command: "quickadd:choice:lifeos-new-study-note",
  },
];

const PERIOD_ACTIONS = [
  {
    icon: "calendar-days",
    label: "Today",
    description: "Open or create today’s note.",
    command: "quickadd:choice:lifeos-daily",
  },
  {
    icon: "calendar-range",
    label: "This week",
    description: "Open or create this week’s review.",
    command: "quickadd:choice:lifeos-weekly",
  },
  {
    icon: "compass",
    label: "This quarter",
    description: "Open the current quarterly note.",
    command: "quickadd:choice:lifeos-quarterly",
  },
  {
    icon: "tent-tree",
    label: "Retreat",
    description: "Open the current personal retreat.",
    command: "quickadd:choice:lifeos-retreat",
  },
];

const DESTINATIONS = [
  {
    icon: "layout-dashboard",
    label: "Compass",
    description: "Direction, habits, questions, and life wheel.",
    path: "00 Dashboards/Compass Dashboard.md",
  },
  {
    icon: "list-checks",
    label: "Tasks",
    description: "See the full task system.",
    path: "00 Dashboards/Task Dashboard.md",
  },
  {
    icon: "folder-kanban",
    label: "Projects",
    description: "Review active projects and ideas.",
    path: "00 Dashboards/Projects Dashboard.md",
  },
  {
    icon: "columns-3",
    label: "Boards",
    description: "Open writing and project boards.",
    path: "00 Dashboards/Boards.md",
  },
];

const NAV_ITEMS = [
  { id: "home", icon: "home", label: "Home" },
  { id: "today", icon: "sun", label: "Today" },
  { id: "plan", icon: "calendar-range", label: "Plan" },
  { id: "focus", icon: "crosshair", label: "Focus" },
  { id: "review", icon: "line-chart", label: "Review" },
  { id: "projects", icon: "folder-kanban", label: "Projects" },
  { id: "people", icon: "users", label: "People" },
  { id: "create", icon: "pen-tool", label: "Create" },
  { id: "library", icon: "library", label: "Library" },
  { id: "brain", icon: "brain", label: "Brain" },
  { id: "ai", icon: "sparkles", label: "AI" },
];

const MODULES = {
  today: {
    eyebrow: "Daily operating system",
    title: "Today",
    description:
      "Choose what matters, capture what happens, and close the day honestly.",
    actions: [
      PERIOD_ACTIONS[0],
      ...CAPTURE_ACTIONS,
      {
        icon: "list-checks",
        label: "Today’s tasks",
        description: "Open the task recommendation dashboard.",
        path: "00 Dashboards/Task Dashboard.md",
      },
      {
        icon: "activity",
        label: "Habits",
        description: "Review current habit consistency.",
        path: "00 Dashboards/Habit Canvas.md",
      },
    ],
  },
  plan: {
    eyebrow: "Connected time horizons",
    title: "Plan",
    description:
      "Keep today, this week, and this quarter connected to the same direction.",
    actions: [
      ...PERIOD_ACTIONS,
      {
        icon: "folder-kanban",
        label: "Projects",
        description: "Review active projects and quarter alignment.",
        path: "00 Dashboards/Projects Dashboard.md",
      },
      {
        icon: "clock-3",
        label: "Ideal week",
        description: "Check whether the plan has a place in time.",
        path: "03 Planning/Ideal Week.md",
      },
    ],
  },
  focus: {
    eyebrow: "Attention, not noise",
    title: "Focus",
    description:
      "See the commitments competing for attention and return to the work that matters.",
    actions: [
      {
        icon: "compass",
        label: "Compass",
        description: "Return to the whole-life overview.",
        path: "00 Dashboards/Compass Dashboard.md",
      },
      {
        icon: "list-checks",
        label: "Task recommendations",
        description: "Review due, scheduled, priority, and discuss tasks.",
        path: "00 Dashboards/Task Dashboard.md",
      },
      {
        icon: "folder-kanban",
        label: "Project momentum",
        description: "Find active projects that need a next action.",
        path: "00 Dashboards/Projects Dashboard.md",
      },
      {
        icon: "activity",
        label: "Habit signals",
        description: "See consistency alongside the days that explain it.",
        path: "00 Dashboards/Habit Canvas.md",
      },
    ],
  },
  review: {
    eyebrow: "Evidence over memory",
    title: "Review",
    description:
      "Look back across days and quarters before deciding what should change next.",
    actions: [
      {
        icon: "line-chart",
        label: "Daily questions",
        description: "Review effort scores and trends.",
        path: "00 Dashboards/Daily Questions.md",
      },
      {
        icon: "activity",
        label: "Habit canvas",
        description: "Review streaks, gaps, and completion.",
        path: "00 Dashboards/Habit Canvas.md",
      },
      PERIOD_ACTIONS[1],
      PERIOD_ACTIONS[2],
      PERIOD_ACTIONS[3],
      {
        icon: "compass",
        label: "Whole-life review",
        description: "Open the Compass dashboard and life wheel.",
        path: "00 Dashboards/Compass Dashboard.md",
      },
    ],
  },
  projects: {
    eyebrow: "Outcomes with context",
    title: "Projects",
    description:
      "Keep outcomes, next actions, people, notes, and quarter commitments together.",
    actions: [
      {
        icon: "layout-dashboard",
        label: "Projects dashboard",
        description: "Review all active projects.",
        path: "00 Dashboards/Projects Dashboard.md",
      },
      {
        icon: "columns-3",
        label: "Projects board",
        description: "Move ideas and projects through the pipeline.",
        path: "04 Projects/Projects Board.md",
      },
      {
        icon: "lightbulb",
        label: "Capture an idea",
        description: "Add a project idea to the board.",
        command: "quickadd:choice:lifeos-project-idea",
      },
      {
        icon: "folder-plus",
        label: "New project",
        description: "Create a project note with the canonical template.",
        command: "quickadd:choice:lifeos-new-project",
      },
      {
        icon: "calendar-range",
        label: "Quarter plan",
        description: "Check which projects serve this quarter.",
        command: "quickadd:choice:lifeos-quarterly",
      },
    ],
  },
  people: {
    eyebrow: "Relationships with memory",
    title: "People",
    description:
      "Bring follow-ups, meeting context, and discussion items back to the relationship.",
    actions: [
      {
        icon: "user-plus",
        label: "New person",
        description: "Create a private person note from its template.",
        command: "quickadd:choice:lifeos-new-person",
      },
      {
        icon: "messages-square",
        label: "Discuss queue",
        description: "Open tasks grouped by person and discussion context.",
        path: "00 Dashboards/Task Dashboard.md",
      },
      {
        icon: "search",
        label: "Search people",
        description: "Search the vault for a person or meeting context.",
        command: "global-search:open",
      },
    ],
  },
  create: {
    eyebrow: "Ideas into finished work",
    title: "Create",
    description:
      "Move ideas into newsletters, videos, articles, and course material without losing sources.",
    actions: [
      {
        icon: "columns-3",
        label: "Creative boards",
        description: "Open every writing pipeline.",
        path: "00 Dashboards/Boards.md",
      },
      ...CAPTURE_MENU_ACTIONS.filter((action) =>
        [
          "quickadd:choice:lifeos-newsletter-idea",
          "quickadd:choice:lifeos-video-idea",
          "quickadd:choice:lifeos-article-idea",
          "quickadd:choice:lifeos-new-newsletter",
          "quickadd:choice:lifeos-new-video",
          "quickadd:choice:lifeos-new-article",
          "quickadd:choice:lifeos-new-course-lesson",
        ].includes(action.command)
      ),
    ],
  },
  library: {
    eyebrow: "Knowledge in context",
    title: "Library",
    description:
      "Keep books, sources, reading, and ideas close to the work they inform.",
    actions: [
      {
        icon: "book-plus",
        label: "New book note",
        description: "Create a canonical book note.",
        command: "quickadd:choice:lifeos-new-book",
      },
      {
        icon: "book-open-check",
        label: "New study note",
        description: "Create a reading study note.",
        command: "quickadd:choice:lifeos-new-study-note",
      },
      {
        icon: "book-open",
        label: "Reading plan",
        description: "Open the current reading plan.",
        path: "09 Reading/Reading Plan.md",
      },
      {
        icon: "search",
        label: "Search the library",
        description: "Search books, sources, and connected notes.",
        command: "global-search:open",
      },
      {
        icon: "pen-tool",
        label: "Writing pipelines",
        description: "Use the library in active creative work.",
        path: "00 Dashboards/Boards.md",
      },
    ],
  },
  ai: {
    eyebrow: "Managed intelligence",
    title: "AI",
    description:
      "Ask, review, and draft with the vault as context while every change stays visible.",
    actions: [
      {
        icon: "sparkles",
        label: "Open assistant",
        description: "Use the complete prompt library.",
        path: "00 Dashboards/Assistant.md",
      },
      {
        icon: "sun",
        label: "What matters today",
        description: "Open the Compass brief and daily context.",
        path: "00 Dashboards/Compass Dashboard.md",
      },
      {
        icon: "list-checks",
        label: "Task triage",
        description: "Open the task dashboard and its AI workflow.",
        path: "00 Dashboards/Task Dashboard.md",
      },
      {
        icon: "shield-check",
        label: "Setup and permissions",
        description: "Review AI, MCP, and backup readiness.",
        path: "00 Dashboards/Setup.md",
      },
    ],
  },
};

class LifeOSCaptureModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const root = this.contentEl;
    root.empty();
    root.addClass("life-os-capture-modal");
    root.createEl("h2", { text: "Capture" });
    root.createEl("p", {
      text: "Choose what this is. Life OS will route it to the right place.",
    });

    const groups = [
      { title: "Quick capture", actions: CAPTURE_MENU_ACTIONS.slice(0, 4) },
      { title: "Ideas", actions: CAPTURE_MENU_ACTIONS.slice(4, 8) },
      { title: "Create notes", actions: CAPTURE_MENU_ACTIONS.slice(8) },
    ];
    for (const group of groups) {
      const section = root.createDiv({ cls: "life-os-capture-section" });
      section.createEl("h3", { text: group.title });
      const grid = section.createDiv({ cls: "life-os-capture-grid" });
      for (const action of group.actions) {
        const button = grid.createEl("button", {
          cls: "life-os-capture-choice",
        });
        button.type = "button";
        const icon = button.createSpan();
        setIcon(icon, action.icon);
        const copy = button.createSpan();
        copy.createEl("strong", { text: action.label });
        copy.createEl("small", { text: action.description });
        button.addEventListener("click", () => {
          this.close();
          this.plugin.runCommand(action.command, action.label);
        });
      }
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}

class LifeOSHomeView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.activeScreen = "home";
    this.taskSnapshot = null;
    this.refreshSequence = 0;
    this.refreshTimer = null;
    this.analyticsDays = 30;
    this.includeExamples = false;
    this.showVisuals = true;
    this.visualOptions = {};
    this.itemLimit = 6;
    this.focusGroup = "all";
    this.libraryStatus = "all";
    this.compactLayout = false;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "Life OS";
  }

  getIcon() {
    return "compass";
  }

  async onOpen() {
    const refresh = () => this.queueRefresh();
    this.registerEvent(this.app.metadataCache.on("changed", refresh));
    this.registerEvent(this.app.vault.on("create", refresh));
    this.registerEvent(this.app.vault.on("modify", refresh));
    this.registerEvent(this.app.vault.on("delete", refresh));
    this.registerEvent(this.app.vault.on("rename", refresh));
    await this.refreshLiveData();
  }

  async onClose() {
    this.refreshSequence += 1;
    this.closeBrain();
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.contentEl.empty();
  }

  queueRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      void this.refreshLiveData();
    }, 120);
  }

  async refreshLiveData() {
    const sequence = ++this.refreshSequence;
    this.render();
    const taskSnapshot = await this.loadTaskSnapshot();
    if (sequence !== this.refreshSequence) {
      return;
    }
    this.taskSnapshot = taskSnapshot;
    this.render();
  }

  render(force = false) {
    if (!force && this.activeScreen === "brain" && this.embeddedBrain) return;
    this.closeBrain();
    const root = this.contentEl;
    root.empty();
    root.addClass("life-os-home");

    const frame = root.createDiv({ cls: this.compactLayout ? "life-os-app-frame is-compact" : "life-os-app-frame" });
    this.renderRail(frame);

    const main = frame.createEl("main", { cls: "life-os-main" });
    this.renderTopbar(main);

    if (this.activeScreen === "brain") {
      const host = main.createDiv({ cls: "life-os-brain-embedded" });
      this.embeddedBrain = new LifeOSBrainRenderer(this.app, host);
      this.addChild(this.embeddedBrain);
      return;
    }
    const shell = main.createDiv({ cls: "life-os-shell" });
    if (this.activeScreen === "home") {
      this.renderHome(shell);
    } else {
      this.renderModule(shell);
    }
  }

  closeBrain() {
    if (this.embeddedBrain) this.removeChild(this.embeddedBrain);
    if (this.previewBrain) {
      this.previewGeometry = this.previewBrain.brainGeometry;
      this.removeChild(this.previewBrain);
    }
    this.previewBrain = null;
    this.embeddedBrain = null;
  }

  renderHome(shell) {
    const hero = shell.createEl("header", { cls: "life-os-hero" });
    const identity = hero.createDiv({ cls: "life-os-identity" });
    const mark = identity.createSpan({ cls: "life-os-mark" });
    setIcon(mark, "compass");

    const words = identity.createDiv();
    words.createEl("h1", { text: "LIFE" });
    words.createEl("p", {
      text: "See clearly. Choose deliberately. Live fully.",
    });

    hero.createDiv({
      cls: "life-os-date",
      text: moment().format("dddd, D MMMM YYYY"),
    });

    const status = hero.createDiv({ cls: "life-os-status-row" });
    this.addStatus(status, "shield-check", "Local-first", true);

    const aiReady =
      this.pluginLoaded("agent-client") &&
      this.pluginLoaded("obsidian-local-rest-api");

    this.addStatus(
      status,
      "sparkles",
      aiReady ? "AI tools loaded" : "AI unavailable",
      aiReady
    );

    const heroActions = hero.createDiv({ cls: "life-os-hero-actions" });
    this.addButton(heroActions, {
      icon: "calendar-days",
      label: "Open today",
      description: "Start with the current day.",
      primary: true,
      onClick: () =>
        this.runCommand("quickadd:choice:lifeos-daily", "Today’s note"),
    });

    this.addButton(heroActions, {
      icon: "sparkles",
      label: "Ask Life OS",
      description: "Open the governed AI workspace.",
      onClick: () => this.openPath("00 Dashboards/Assistant.md"),
    });

    this.renderSetupBanner(shell);
    const overview = shell.createDiv({ cls: "life-os-home-overview" });
    const now = overview.createEl("section", { cls: "life-os-home-now" });
    now.createEl("h2", { text: "Now" });
    this.renderTaskLive(now, { limit: 3, attention: true });
    if (this.visualEnabled()) {
      const card = overview.createEl("section", { cls: "life-os-brain-card" });
      card.createEl("h2", { text: "Your connected notes" });
      const host = card.createDiv({ cls: "life-os-brain-preview" });
      this.previewBrain = new LifeOSBrainRenderer(this.app, host, true);
      this.previewBrain.brainGeometry = this.previewGeometry;
      this.addChild(this.previewBrain);
      this.addButton(card, { icon: "brain", label: "Explore Brain", description: "Open the full graph in this dashboard.", onClick: () => { this.activeScreen = "brain"; this.render(); } });
    }

    this.renderActionSection(
      shell,
      "Capture",
      "Put something into the system without breaking your flow.",
      CAPTURE_ACTIONS,
      (action) => this.runCommand(action.command, action.label)
    );
    this.renderPlanLive(shell);
    const signals = shell.createEl("section", { cls: "life-os-signals" });
    const model = this.getAnalytics();
    signals.createEl("h2", { text: "Recorded signals" });
    signals.createEl("p", { text: `${model.scored} scored days in ${this.analyticsDays} days · ${model.average === null ? "No effort scores yet" : `${model.average.toFixed(1)} / 10 mean daily effort`}. Missing days are not zero.${this.includeExamples ? " Samples included." : " Samples excluded."}` });
    this.addButton(signals, { icon: "chart-line", label: "Explore Review", description: "Effort, habit rhythm, and life areas.", onClick: () => { this.activeScreen = "review"; this.render(); } });
  }

  isExample(data) {
    const tags = Array.isArray(data.tags) ? data.tags : String(data.tags || "").split(/[\s,]+/);
    return data.example === true || tags.some((tag) => String(tag).replace(/^#/, "") === "example");
  }

  getAnalytics() {
    const config = this.getConfigFrontmatter();
    const paths = this.getConfiguredFolders(config);
    const folder = paths.daily;
    const today = moment().format("YYYY-MM-DD");
    const end = new Date(`${today}T12:00:00Z`);
    const days = Array.from({ length: this.analyticsDays }, (_, i) => {
      const date = new Date(end);
      date.setUTCDate(date.getUTCDate() - this.analyticsDays + 1 + i);
      return { date: date.toISOString().slice(0, 10), data: null, score: null };
    });
    const byDate = new Map(days.map((day) => [day.date, day]));
    const habits = new Set(this.getHabitKeys(config));
    let samples = 0;
    for (const file of this.app.vault.getMarkdownFiles()) {
      if (!file.path.startsWith(`${folder}/`)) continue;
      const date = file.path.slice(folder.length + 1).replace(/\.md$/, "");
      const day = byDate.get(date);
      if (!day) continue;
      const data = this.getFrontmatter(file);
      if (this.isExample(data)) {
        samples += 1;
        if (!this.includeExamples) continue;
      }
      day.data = data;
      const scores = Object.entries(data)
        .filter(([key, value]) =>
          key.startsWith(config.dq_prefix || "dq_") &&
          ratingState(value).state === "recorded"
        )
        .map(([, value]) => value);
      day.score = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      Object.keys(data).filter((key) => key.startsWith(config.habit_prefix || "habit_")).forEach((key) => habits.add(key));
    }
    const scored = days.filter((day) => day.score !== null);
    const average = scored.length ? scored.reduce((sum, day) => sum + day.score, 0) / scored.length : null;
    const retreatFolder = paths.retreats;
    const retreats = this.app.vault.getMarkdownFiles()
      .filter((file) => file.path.startsWith(`${retreatFolder}/`))
      .filter((file) => this.includeExamples || !this.isExample(this.getFrontmatter(file)))
      .sort((a, b) => b.path.localeCompare(a.path));
    const retreat = retreats.find((file) => Object.entries(this.getFrontmatter(file)).some(([key, value]) =>
      key.startsWith(config.wheel_prefix || "wheel_") && ratingState(value).state === "recorded"));
    const wheel = retreat ? Object.entries(this.getFrontmatter(retreat)).filter(([key, value]) =>
      key.startsWith(config.wheel_prefix || "wheel_") && ratingState(value).state === "recorded") : [];
    return { days, habits: [...habits], samples, average, scored: scored.length, wheel, retreat };
  }

  renderAnalytics(parent) {
    const model = this.getAnalytics();
    const section = parent.createEl("section", { cls: "life-os-analytics" });
    const heading = section.createDiv({ cls: "life-os-analytics-heading" });
    const copy = heading.createDiv();
    copy.createEl("h2", { text: "Your life, in view" });
    copy.createEl("p", { text: this.includeExamples
      ? "Sample notes included. These charts may contain demonstration data."
      : "Recorded effort and habits. Blank days mean no data, not zero." });
    const controls = heading.createDiv({ cls: "life-os-chart-controls" });
    for (const count of [7, 30, 90]) {
      const button = controls.createEl("button", {
        text: `${count} days`, attr: { "aria-pressed": String(this.analyticsDays === count) },
      });
      button.type = "button";
      button.addEventListener("click", () => { this.analyticsDays = count; this.render(); });
    }
    const sample = controls.createEl("button", {
      text: this.includeExamples ? "Samples on" : "Include samples",
      attr: { "aria-pressed": String(this.includeExamples) },
    });
    sample.type = "button";
    sample.addEventListener("click", () => { this.includeExamples = !this.includeExamples; this.render(); });

    const grid = section.createDiv({ cls: "life-os-chart-grid" });
    const effort = grid.createDiv({ cls: "life-os-chart-card life-os-effort-chart" });
    effort.createEl("h3", { text: "Daily effort" });
    effort.createEl("strong", { cls: "life-os-chart-number", text: model.average === null ? "No scores yet" : `${model.average.toFixed(1)} / 10` });
    effort.createEl("p", { text: `${model.scored} scored days · mean of recorded daily questions` });
    const plot = effort.createDiv({ cls: "life-os-effort-plot", attr: { role: "list", "aria-label": "Daily effort scores" } });
    for (const day of model.days) {
      const label = `${day.date}: ${day.score === null ? "No score recorded" : `${day.score.toFixed(1)} out of 10`}`;
      const column = plot.createDiv({ cls: "life-os-effort-column", attr: { role: "listitem", "aria-label": label, title: label } });
      column.createDiv({ cls: day.score === null ? "life-os-effort-bar is-missing" : "life-os-effort-bar",
        attr: { style: `height:${day.score === null ? 2 : day.score * 10}%` } });
      if (day.data) {
        column.setAttribute("role", "button");
        column.setAttribute("tabindex", "0");
        const open = () => void this.openPath(`${this.getConfiguredFolders().daily}/${day.date}.md`);
        this.registerDomEvent(column, "click", open);
        this.registerDomEvent(column, "keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
      }
    }
    const axis = effort.createDiv({ cls: "life-os-chart-axis" });
    axis.createSpan({ text: model.days[0].date });
    axis.createSpan({ text: model.days[model.days.length - 1].date });
    const details = effort.createEl("details", { cls: "life-os-chart-details" });
    details.createEl("summary", { text: "Read daily values" });
    const table = details.createEl("table", { cls: "life-os-chart-table" });
    const header = table.createEl("thead").createEl("tr");
    header.createEl("th", { text: "Date", attr: { scope: "col" } });
    header.createEl("th", { text: "Effort (1 to 10)", attr: { scope: "col" } });
    const body = table.createEl("tbody");
    for (const day of model.days) {
      const row = body.createEl("tr");
      row.createEl("th", { text: day.date, attr: { scope: "row" } });
      row.createEl("td", { text: day.score === null ? "Not recorded" : day.score.toFixed(1) });
    }

    const wheel = grid.createDiv({ cls: "life-os-chart-card" });
    wheel.createEl("h3", { text: "Life areas" });
    wheel.createEl("p", { text: model.retreat ? `Latest scored retreat: ${this.getFileTitle(model.retreat)}` : "Your next retreat will bring this view to life." });
    for (const [key, value] of model.wheel) {
      const row = wheel.createDiv({ cls: "life-os-wheel-row" });
      row.createSpan({ text: this.formatPropertyLabel(key) });
      const track = row.createDiv({ cls: "life-os-wheel-track", attr: { role: "meter", "aria-label": this.formatPropertyLabel(key), "aria-valuemin": "0", "aria-valuemax": "10", "aria-valuenow": String(value) } });
      track.createDiv({ cls: "life-os-wheel-fill", attr: { style: `width:${value * 10}%` } });
      row.createSpan({ text: `${value}/10` });
    }
    if (!model.wheel.length) wheel.createDiv({ cls: "life-os-live-empty", text: "No life-area scores recorded. Open Retreat from Plan to add your own." });
    if (model.retreat) this.addButton(wheel, { icon: "book-open", label: "Open scored retreat", description: "See the source of these life-area scores.", onClick: () => this.openPath(model.retreat.path) });

    const habits = grid.createDiv({ cls: "life-os-chart-card life-os-habit-chart" });
    habits.createEl("h3", { text: "Habit rhythm" });
    habits.createEl("p", { text: "Filled: done · muted: unchecked · outlined: no record. Hover a day for details." });
    const matrix = habits.createDiv({ cls: "life-os-habit-matrix" });
    for (const key of model.habits) {
      const row = matrix.createDiv({ cls: "life-os-habit-row" });
      row.createSpan({ text: this.formatPropertyLabel(key) });
      const cells = row.createDiv({ cls: "life-os-habit-cells" });
      let done = 0, recorded = 0;
      for (const day of model.days) {
        const value = day.data?.[key];
        if (typeof value === "boolean") recorded += 1;
        if (value === true) done += 1;
        const label = `${day.date}, ${this.formatPropertyLabel(key)}: ${value === true ? "Done" : value === false ? "Unchecked" : "No record"}`;
        cells.createSpan({ cls: `life-os-habit-cell ${value === true ? "is-done" : value === false ? "is-open" : "is-missing"}`,
          attr: { title: label, "aria-label": label, role: "img" } });
      }
      row.createSpan({ text: recorded ? `${done}/${recorded}` : "No data" });
    }
    if (!model.habits.length) habits.createDiv({ cls: "life-os-live-empty", text: "Add your habits in Configure to begin." });
  }

  renderRail(parent) {
    const rail = parent.createEl("aside", {
      cls: "life-os-rail",
      attr: { "aria-label": "Life OS navigation" },
    });

    const brand = rail.createEl("button", {
      cls: "life-os-rail-brand",
      attr: { "aria-label": "Open Life OS home" },
    });
    brand.type = "button";
    const mark = brand.createSpan();
    setIcon(mark, "compass");
    brand.createSpan({ text: "LIFE" });
    brand.addEventListener("click", () => {
      this.activeScreen = "home";
      this.render();
    });

    const nav = rail.createEl("nav", { cls: "life-os-nav" });
    for (const item of NAV_ITEMS) {
      const button = nav.createEl("button", {
        cls:
          this.activeScreen === item.id
            ? "life-os-nav-button is-active"
            : "life-os-nav-button",
        attr: {
          "aria-current":
            this.activeScreen === item.id ? "page" : "false",
          title: item.label,
        },
      });
      button.type = "button";
      const icon = button.createSpan();
      setIcon(icon, item.icon);
      button.createSpan({ text: item.label });
      button.addEventListener("click", () => {
        this.activeScreen = item.id;
        this.render();
      });
    }

    const local = rail.createDiv({ cls: "life-os-rail-foot" });
    const localIcon = local.createSpan();
    setIcon(localIcon, "hard-drive");
    local.createSpan({ text: "Local vault" });
  }

  renderTopbar(parent) {
    const topbar = parent.createEl("header", { cls: "life-os-topbar" });
    const context = topbar.createDiv({ cls: "life-os-topbar-context" });
    context.createSpan({ text: "Life OS" });
    context.createEl("strong", { text: this.getScreenTitle() });

    const actions = topbar.createDiv({ cls: "life-os-topbar-actions" });
    this.addTopbarButton(actions, "search", "Search", () => {
      this.runCommand("global-search:open", "Search");
    });
    this.addTopbarButton(actions, "settings-2", "Configure", () => {
      void this.openPath("Meta/Compass Config.md");
    });
    const display = actions.createEl("details", { cls: "life-os-display-options" });
    display.createEl("summary", { text: "View" });
    const options = display.createDiv();
    options.createEl("p", { text: "This view only. No vault settings changed." });
    const density = options.createEl("button", { text: this.compactLayout ? "Use comfortable spacing" : "Use compact spacing" });
    density.type = "button";
    this.registerDomEvent(density, "click", () => { this.compactLayout = !this.compactLayout; this.render(true); });
    const visuals = options.createEl("button", { text: this.showVisuals ? "Hide optional visuals" : "Show optional visuals" });
    visuals.type = "button";
    this.registerDomEvent(visuals, "click", () => { this.showVisuals = !this.showVisuals; this.render(true); });
    if (["home", "today", "focus", "projects", "people", "create", "library", "ai"].includes(this.activeScreen)) {
      const local = options.createEl("button", { text: this.visualOptions[this.activeScreen] === false ? "Show this module's visual" : "Hide this module's visual" });
      local.type = "button";
      this.registerDomEvent(local, "click", () => { this.visualOptions[this.activeScreen] = this.visualOptions[this.activeScreen] === false; this.render(true); });
    }
    const label = options.createEl("label", { text: "Items per list " });
    const limit = label.createEl("select", { attr: { "aria-label": "Items per list" } });
    for (const count of [3, 6, 12]) limit.createEl("option", { text: String(count), attr: { value: String(count) } });
    limit.value = String(this.itemLimit);
    this.registerDomEvent(limit, "change", () => { this.itemLimit = Number(limit.value); this.render(true); });
    const reset = options.createEl("button", { text: "Restore view defaults" });
    reset.type = "button";
    this.registerDomEvent(reset, "click", () => { this.showVisuals = true; this.visualOptions = {}; this.itemLimit = 6; this.compactLayout = false; this.focusGroup = "all"; this.libraryStatus = "all"; this.libraryType = "all"; this.pipelinePath = null; this.render(true); });
    this.addTopbarButton(actions, "plus", "Capture", () => {
      this.plugin.openCapture();
    }, true);
  }

  visualEnabled() { return this.showVisuals && this.visualOptions[this.activeScreen] !== false; }

  addTopbarButton(parent, iconName, label, onClick, primary = false) {
    const button = parent.createEl("button", {
      attr: { "aria-label": label, title: label },
      cls: primary
        ? "life-os-topbar-button is-primary"
        : "life-os-topbar-button",
    });
    button.type = "button";
    const icon = button.createSpan();
    setIcon(icon, iconName);
    button.createSpan({ text: label });
    button.addEventListener("click", onClick);
  }

  getScreenTitle() {
    return NAV_ITEMS.find((item) => item.id === this.activeScreen)?.label || "Home";
  }

  renderModule(shell) {
    const module = MODULES[this.activeScreen];
    if (!module) {
      this.activeScreen = "home";
      this.render();
      return;
    }

    const header = shell.createEl("header", { cls: "life-os-module-header" });
    header.createSpan({ cls: "life-os-eyebrow", text: module.eyebrow });
    header.createEl("h1", { text: module.title });
    header.createEl("p", { text: module.description });

    if (this.activeScreen === "today") {
      this.renderTodayLive(shell);
      this.renderTaskLive(shell, { limit: 5, attention: true });
    } else {
      this.renderModuleLive(shell);
    }

    if (this.activeScreen === "ai") this.renderSystemSummary(shell);
    this.renderActionSection(
      shell,
      "Open and act",
      "Every control below opens a real note, dashboard, or capture workflow.",
      module.actions,
      (action) => {
        if (action.command) {
          this.runCommand(action.command, action.label);
        } else {
          this.openPath(action.path);
        }
      }
    );

    if (this.activeScreen === "ai") {
      const note = shell.createEl("section", { cls: "life-os-principle" });
      const icon = note.createSpan();
      setIcon(icon, "shield-check");
      const copy = note.createDiv();
      copy.createEl("strong", { text: "AI-managed, human-authorized" });
      copy.createEl("p", {
        text:
          "Life OS can retrieve, summarize, and draft. Review context before sending. Human approval is the operating policy, not a guarantee enforced across every connected tool.",
      });
    }
  }

  renderTodayLive(parent) {
    const data = this.getTodayData();
    const section = parent.createEl("section", { cls: "life-os-today-live" });
    const heading = section.createDiv({ cls: "life-os-today-heading" });
    const copy = heading.createDiv();
    copy.createEl("h2", { text: "Today at a glance" });
    copy.createEl("p", {
      text: "A private view of today’s properties. Journal text stays out of this screen.",
    });

    if (!data.exists) {
      heading.createSpan({ cls: "life-os-progress-chip", text: "Not started" });
      const empty = section.createDiv({ cls: "life-os-today-empty" });
      const icon = empty.createSpan();
      setIcon(icon, "sunrise");
      const emptyCopy = empty.createDiv();
      emptyCopy.createEl("strong", { text: "Create today’s note" });
      emptyCopy.createEl("p", {
        text: "Life OS will use your configured questions and habits.",
      });
      this.addButton(empty, {
        icon: "plus",
        label: "Start today",
        description: "Create or open today’s daily note.",
        primary: true,
        onClick: () =>
          this.runCommand("quickadd:choice:lifeos-daily", "Today’s note"),
      });
      return;
    }

    const completed = data.questionRecorded + data.habitRecorded;
    const total = data.questions.length + data.habits.length;
    if (this.visualEnabled() && total) {
      const meter = section.createEl("progress", { cls: "life-os-checkin-meter", attr: { max: String(total), value: String(completed), "aria-label": `${completed} of ${total} check-in properties recorded, not a completion score` } });
      meter.textContent = `${completed}/${total} recorded`;
    }
    heading.createSpan({
      cls: "life-os-progress-chip is-active",
      text: total ? `${completed} of ${total} checked in` : "Ready",
    });

    const grid = section.createDiv({ cls: "life-os-today-grid" });
    this.renderTodayList(
      grid,
      "Daily questions",
      "Rate effort from 1 to 10.",
      data.questions,
      "line-chart"
    );
    this.renderTodayList(
      grid,
      "Habits",
      "A signal, never a judgment.",
      data.habits,
      "activity"
    );

    const actions = section.createDiv({ cls: "life-os-today-actions" });
    this.addButton(actions, {
      icon: "file-text",
      label: "Open daily note",
      description: "See the complete context for today.",
      onClick: () => this.openPath(data.path),
    });
    this.addButton(actions, {
      icon: "message-circle-question",
      label: "Daily questions",
      description: "Run the guided evening check-in.",
      primary: true,
      onClick: () =>
        this.runCommand(
          "templater-obsidian:Templates/Daily Questions Prompt.md",
          "Daily questions"
        ),
    });
  }

  renderTodayList(parent, title, description, rows, iconName) {
    const card = parent.createDiv({ cls: "life-os-today-card" });
    const heading = card.createDiv({ cls: "life-os-today-card-heading" });
    const icon = heading.createSpan();
    setIcon(icon, iconName);
    const copy = heading.createDiv();
    copy.createEl("h3", { text: title });
    copy.createEl("p", { text: description });

    const list = card.createDiv({ cls: "life-os-today-list" });
    for (const row of rows) {
      const item = list.createDiv({ cls: "life-os-today-row" });
      item.createSpan({ text: row.label });
      item.createSpan({
        cls: row.complete
          ? "life-os-today-value is-complete"
          : "life-os-today-value",
        text: row.display,
      });
    }
  }

  getTodayData() {
    const config = this.getConfigFrontmatter();
    const paths = this.getConfiguredFolders(config);
    const todayPath = `${paths.daily}/${moment().format("YYYY-MM-DD")}.md`;
    const todayFile = this.app.vault.getAbstractFileByPath(todayPath);
    const today = this.getFrontmatter(todayFile);
    const questionConfig = Array.isArray(config.questions) ? config.questions : [];
    const habitConfig = Array.isArray(config.habits) ? config.habits : [];

    const questions = questionConfig
      .map((question) => {
        const key = String(question?.key || question || "");
        const result = ratingState(today[key]);
        const recorded = result.state === "recorded";
        return {
          key,
          label:
            String(question?.text || "").trim() || this.formatPropertyLabel(key),
          state: result.state,
          recorded,
          complete: recorded,
          display: recorded
            ? `${result.value}/10`
            : result.state === "invalid"
              ? "Invalid value"
              : "Not rated",
        };
      })
      .filter((question) => question.key);
    const habits = habitConfig
      .map((habit) => String(habit || ""))
      .filter(Boolean)
      .map((key) => {
        const state = habitState(today[key]);
        return {
          key,
          label: this.formatPropertyLabel(key),
          state,
          recorded: state === "done" || state === "unchecked",
          complete: state === "done",
          display:
            state === "done"
              ? "Done"
              : state === "unchecked"
                ? "Unchecked"
                : state === "invalid"
                  ? "Invalid value"
                  : "Not recorded",
        };
      });

    return {
      exists: todayFile instanceof TFile,
      path: todayPath,
      questions,
      habits,
      questionRecorded: questions.filter((question) => question.recorded).length,
      habitRecorded: habits.filter((habit) => habit.recorded).length,
      habitDone: habits.filter((habit) => habit.complete).length,
    };
  }

  formatPropertyLabel(key) {
    return String(key)
      .replace(/^(dq|habit|wheel)_/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  renderModuleLive(parent) {
    if (this.activeScreen === "focus") {
      if (this.visualEnabled()) this.renderFocusGroups(parent);
      this.renderTaskLive(parent, { limit: this.itemLimit, group: this.visualEnabled() ? this.focusGroup : "all" });
    }

    if (this.activeScreen === "plan") {
      this.renderCalendar(parent);
      this.renderPlanLive(parent);
      return;
    }

    if (this.activeScreen === "review") {
      this.renderAnalytics(parent);
      this.renderReviewLive(parent);
      return;
    }

    if (this.activeScreen === "create") {
      this.renderPipelineLive(parent);
      return;
    }

    if (this.activeScreen === "ai") {
      this.renderAiLive(parent);
      return;
    }

    const collections = {
      focus: {
        title: "Active commitments",
        description: "Projects currently asking for attention.",
        types: ["project"],
        icon: "crosshair",
        empty: "No active projects yet.",
      },
      projects: {
        title: "Project pulse",
        description: "Active project notes from your canonical project folder.",
        types: ["project"],
        icon: "folder-kanban",
        empty: "No active project notes yet.",
      },
      people: {
        title: "People directory",
        description: "Relationship notes, kept local and opened in place.",
        types: ["person"],
        icon: "users",
        empty: "No people notes yet.",
      },
      library: {
        title: "Library shelf",
        description: "Typed library notes, including finished books and sources. Samples excluded.",
        types: ["book"],
        icon: "library",
        empty: "No typed library notes yet. Add a book or source with a type property.",
      },
    };
    const collection = collections[this.activeScreen];
    if (collection) {
      this.renderCollectionLive(parent, collection);
    }
  }

  renderPlanLive(parent) {
    const paths = this.getConfiguredFolders();
    const horizons = [
      {
        icon: "sun",
        label: "Today",
        period: moment().format("D MMM"),
        path: `${paths.daily}/${moment().format("YYYY-MM-DD")}.md`,
        command: "quickadd:choice:lifeos-daily",
      },
      {
        icon: "calendar-range",
        label: "This week",
        period: moment().format("[Week] ww"),
        path: `${paths.weekly}/${moment().format("gggg-[W]ww")}.md`,
        command: "quickadd:choice:lifeos-weekly",
      },
      {
        icon: "compass",
        label: "This quarter",
        period: moment().format("YYYY-[Q]Q"),
        path: `${paths.quarterly}/${moment().format("YYYY-[Q]Q")}.md`,
        command: "quickadd:choice:lifeos-quarterly",
      },
      {
        icon: "tent-tree",
        label: "Retreat",
        period: moment().format("YYYY-[Q]Q"),
        path: `${paths.retreats}/${moment().format("YYYY-[Q]Q")} Personal Retreat.md`,
        command: "quickadd:choice:lifeos-retreat",
      },
    ];
    const section = parent.createEl("section", { cls: "life-os-plan-live" });
    this.renderLiveHeading(
      section,
      "Connected horizons",
      "Each layer is ready when its canonical note exists.",
      `${horizons.filter((item) => this.fileExists(item.path)).length} of ${horizons.length} notes created`
    );
    const grid = section.createDiv({ cls: "life-os-horizon-grid" });
    for (const horizon of horizons) {
      const ready = this.fileExists(horizon.path);
      const button = grid.createEl("button", { cls: "life-os-horizon-card" });
      button.type = "button";
      const icon = button.createSpan({ cls: "life-os-horizon-icon" });
      setIcon(icon, horizon.icon);
      const copy = button.createDiv();
      copy.createEl("strong", { text: horizon.label });
      copy.createSpan({ text: horizon.period });
      button.createSpan({
        cls: ready ? "life-os-record-status is-ready" : "life-os-record-status",
        text: ready ? "Open note" : "Create note",
      });
      this.registerDomEvent(button, "click", () => {
        if (ready) {
          void this.openPath(horizon.path);
        } else {
          this.runCommand(horizon.command, horizon.label);
        }
      });
    }
  }

  renderCalendar(parent) {
    const today = moment().format("YYYY-MM-DD");
    const base = new Date(`${today}T12:00:00Z`);
    const month = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + (this.calendarOffset || 0), 1, 12));
    const section = parent.createEl("section", { cls: "life-os-calendar" });
    const toolbar = section.createDiv({ cls: "life-os-calendar-toolbar" });
    toolbar.createEl("h2", { text: month.toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" }) });
    for (const [label, delta] of [["Previous month", -1], ["This month", 0], ["Next month", 1]]) {
      const button = toolbar.createEl("button", { text: label });
      button.type = "button";
      this.registerDomEvent(button, "click", () => { this.calendarOffset = delta ? (this.calendarOffset || 0) + delta : 0; this.render(); });
    }
    const grid = section.createDiv({ cls: "life-os-calendar-grid" });
    const firstDay = moment.localeData?.().firstDayOfWeek?.() ?? 1;
    for (let i = 0; i < 7; i++) grid.createDiv({ cls: "life-os-calendar-weekday", text: new Date(Date.UTC(2026, 0, 4 + (firstDay + i) % 7)).toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" }) });
    const offset = (month.getUTCDay() - firstDay + 7) % 7;
    const folder = this.getConfiguredFolders().daily;
    for (let i = 0; i < 42; i++) {
      const date = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1 - offset + i, 12));
      const iso = date.toISOString().slice(0, 10);
      const path = `${folder}/${iso}.md`;
      const exists = this.fileExists(path);
      const button = grid.createEl("button", { cls: `life-os-calendar-day${exists ? " is-present" : ""}${date.getUTCMonth() !== month.getUTCMonth() ? " is-outside" : ""}`, text: String(date.getUTCDate()), attr: { "aria-label": `${iso}: ${exists ? "Open daily note" : iso === today ? "Create today's note" : "No daily note"}`, ...(iso === today ? { "aria-current": "date" } : {}) } });
      button.type = "button";
      button.disabled = !exists && iso !== today;
      this.registerDomEvent(button, "click", () => exists ? void this.openPath(path) : this.runCommand("quickadd:choice:lifeos-daily", "Today’s note"));
    }
    section.createEl("p", { cls: "life-os-calendar-help", text: "Highlighted days have notes. Open an existing day, or create today. Other empty days are disabled. No entries are generated automatically." });
  }

  renderReviewLive(parent) {
    const config = this.getConfigFrontmatter();
    const paths = this.getConfiguredFolders(config);
    const questionKeys = this.getQuestionKeys(config);
    const habitKeys = this.getHabitKeys(config);
    const days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = moment().clone().subtract(offset, "days");
      const path = `${paths.daily}/${day.format("YYYY-MM-DD")}.md`;
      const file = this.app.vault.getAbstractFileByPath(path);
      const raw = this.getFrontmatter(file);
      const excluded = !this.includeExamples && this.isExample(raw);
      const data = excluded ? {} : raw;
      const metrics = this.summarizeDailyProperties(data, questionKeys, habitKeys);
      days.push({
        label: day.format("ddd"),
        exists: file instanceof TFile && !excluded,
        recorded: metrics.recorded,
        habitsDone: metrics.habitsDone,
        total: questionKeys.length + habitKeys.length,
      });
    }
    const activeDays = days.filter((day) => day.exists).length;
    const section = parent.createEl("section", { cls: "life-os-review-live" });
    this.renderLiveHeading(
      section,
      "Seven-day signal",
      "Property coverage only. Your journal words remain private.",
      `${activeDays} daily notes`
    );
    const grid = section.createDiv({ cls: "life-os-week-grid" });
    for (const day of days) {
      const card = grid.createDiv({
        cls: day.exists ? "life-os-day-card is-present" : "life-os-day-card",
      });
      card.createEl("strong", { text: day.label });
      card.createSpan({
        text: day.exists ? `${day.recorded}/${day.total} recorded` : "No note",
      });
      const meter = card.createDiv({ cls: "life-os-day-meter" });
      const ratio = day.total ? day.recorded / day.total : 0;
      meter.createDiv({
        cls: "life-os-day-meter-fill",
        attr: { style: `width: ${Math.round(ratio * 100)}%` },
      });
    }
  }

  renderPipelineLive(parent) {
    const pipelines = [
      { type: "newsletter", label: "Newsletters", icon: "mail", path: "06 Writing/Newsletters/Newsletter Board.md" },
      { type: "youtube-script", label: "Videos", icon: "video", path: "06 Writing/YouTube Scripts/YouTube Board.md" },
      { type: "article", label: "Articles", icon: "newspaper", path: "06 Writing/Articles/Article Board.md" },
      { type: "course-lesson", label: "Courses", icon: "graduation-cap", path: "06 Writing/Course Content/Course Board.md" },
    ];
    const files = this.app.vault.getMarkdownFiles();
    const section = parent.createEl("section", { cls: "life-os-pipeline-live" });
    this.renderLiveHeading(
      section,
      "Creative studio",
      "Every pipeline stays backed by its Markdown notes and Kanban board.",
      `${pipelines.reduce((sum, pipeline) => sum + this.countType(files, pipeline.type), 0)} notes`
    );
    const grid = section.createDiv({ cls: "life-os-pipeline-grid" });
    for (const pipeline of pipelines) {
      const button = grid.createEl("button", { cls: "life-os-pipeline-card" });
      button.type = "button";
      const icon = button.createSpan();
      setIcon(icon, pipeline.icon);
      const copy = button.createDiv();
      copy.createEl("strong", { text: pipeline.label });
      copy.createSpan({ text: `${this.countType(files, pipeline.type)} notes` });
      const selected = (this.pipelinePath || pipelines[0].path) === pipeline.path;
      if (this.visualEnabled()) button.setAttribute("aria-pressed", String(selected));
      this.registerDomEvent(button, "click", () => {
        if (!this.visualEnabled()) { void this.openPath(pipeline.path); return; }
        this.pipelinePath = pipeline.path;
        this.render();
      });
      if (this.visualEnabled() && selected) {
        const file = this.app.vault.getAbstractFileByPath(pipeline.path);
        const cache = file instanceof TFile ? this.app.metadataCache.getFileCache(file) : null;
        const lanes = cache?.headings?.filter(heading => heading.level === 2) || [];
        const flow = section.createDiv({ cls: "life-os-workflow-lanes" });
        flow.createEl("h3", { text: pipeline.label });
        this.addButton(flow, { icon: "kanban", label: "Open board", description: "Edit cards in the original board.", onClick: () => this.openPath(pipeline.path) });
        if (!file || !cache || !lanes.length || !Array.isArray(cache.listItems)) {
          flow.createEl("p", { text: "Board lane counts unavailable. Open the board to inspect its workflow." });
          continue;
        }
        if (this.isExample(this.getFrontmatter(file))) {
          flow.createEl("p", { text: "Sample board excluded from workflow counts." });
          continue;
        }
        for (let i = 0; i < lanes.length; i++) {
          const start = lanes[i].position.start.line;
          const end = lanes[i + 1]?.position.start.line ?? Infinity;
          const cards = cache.listItems.filter(item => item.task !== undefined && item.position.start.line > start && item.position.start.line < end);
          const laneBox = flow.createDiv({ cls: "life-os-lane-preview" });
          const lane = laneBox.createEl("button", { text: `${lanes[i].heading} · ${cards.length}` });
          lane.type = "button";
          this.registerDomEvent(lane, "click", () => void this.openPath(pipeline.path, start + 1));
          const tasks = this.taskSnapshot?.tasks.filter(task => task.path === pipeline.path && task.line > start + 1 && task.line <= end) || [];
          for (const task of tasks.slice(0, 3)) {
            const item = laneBox.createEl("button", { cls: "life-os-lane-item", text: task.text });
            item.type = "button";
            this.registerDomEvent(item, "click", () => void this.openPath(task.path, task.line));
          }
          laneBox.createEl("p", { text: !this.taskSnapshot ? "Loading open items" : this.taskSnapshot.error ? "Open-item index unavailable" : `${Math.min(tasks.length, 3)} of ${tasks.length} indexed open items shown${this.taskSnapshot.state === "partial" ? " · partial index" : ""}` });
        }
        flow.createEl("p", { text: "Checkbox items by actual board heading, including checked items. Not a completion percentage." });
      }
    }
  }

  renderAiLive(parent) {
    const agentSettings = this.pluginSettings("agent-client");
    const restSettings = this.pluginSettings("obsidian-local-rest-api");
    const agentLoaded = this.pluginLoaded("agent-client");
    const restLoaded = this.pluginLoaded("obsidian-local-rest-api");
    const permissionSetting =
      typeof agentSettings.autoAllowPermissions === "boolean"
        ? agentSettings.autoAllowPermissions
        : null;
    const sessionCount = Array.isArray(agentSettings.savedSessions)
      ? agentSettings.savedSessions.length
      : 0;
    const agentConfigured = agentLoaded && Boolean(agentSettings.defaultAgentId);
    const restConfigured = restLoaded && Boolean(restSettings.apiKey);
    const prompts = this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith("Prompts/")).length;
    const checks = [
      {
        icon: "bot",
        label: "Agent Client",
        ready: agentConfigured,
        state: agentConfigured ? "Configured" : agentLoaded ? "Installed" : "Unavailable",
        detail: agentConfigured
          ? `${sessionCount} local ${sessionCount === 1 ? "session" : "sessions"}`
          : "In-vault assistant interface",
      },
      {
        icon: "plug-zap",
        label: "Local MCP bridge",
        ready: restConfigured,
        state: restConfigured ? "Configured" : restLoaded ? "Installed" : "Unavailable",
        detail: restConfigured ? "Local server key present" : "Local tool connection",
      },
      {
        icon: "library",
        label: "Prompt library",
        ready: prompts > 0,
        state: prompts > 0 ? "Available" : "Unavailable",
        detail: `${prompts} governed workflows`,
      },
      {
        icon: "shield-check",
        label: "Permission policy",
        ready: agentLoaded && permissionSetting === false,
        state: !agentLoaded
          ? "Unavailable"
          : permissionSetting === false
            ? "Manual prompts"
            : permissionSetting === true
              ? "Auto-allow on"
              : "Unknown",
        detail:
          permissionSetting === false
            ? "Client setting is off. This reports policy, not enforcement."
            : permissionSetting === true
              ? "Client may auto-approve requests. This reports policy, not enforcement."
              : "Permission setting was not observable. No enforcement claim.",
      },
    ];
    const ready = checks.filter((check) => check.ready).length;
    const section = parent.createEl("section", { cls: "life-os-ai-live" });
    this.renderLiveHeading(
      section,
      "AI control center",
      "Capability status is local. Installed does not mean authenticated or connected.",
      `${ready} of ${checks.length} available`
    );
    if (this.visualEnabled()) {
      const flow = section.createEl("section", { cls: "life-os-connection-map", attr: { "aria-label": "AI integration map" } });
      flow.createEl("h3", { text: "How the parts connect" });
      const diagram = flow.createDiv({ cls: "life-os-ai-diagram" });
      diagram.createDiv({ cls: "life-os-ai-node", text: "Life OS · local dashboard" });
      diagram.createDiv({ cls: "life-os-ai-connector", text: "Selected context →" });
      const hub = diagram.createDiv({ cls: "life-os-ai-node", text: `Agent Client · ${agentConfigured ? "configured" : agentLoaded ? "loaded, configuration needed" : "unavailable"}` });
      hub.createDiv({ text: "Two separate integration paths ↓" });
      const branches = diagram.createDiv({ cls: "life-os-ai-branches" });
      branches.createDiv({ cls: "life-os-ai-node", text: "Provider · authentication not tested here" });
      branches.createDiv({ cls: "life-os-ai-node", text: `Optional local tools via MCP · ${restConfigured ? "key present, connection not tested" : "not configured"}` });
      flow.createEl("p", { text: "Integration overview, not a live traffic trace. This screen makes no provider requests. Review selected context and permissions before sending." });
    }
    const grid = section.createDiv({ cls: "life-os-ai-check-grid" });
    for (const check of checks) {
      const card = grid.createDiv({
        cls: check.ready ? "life-os-ai-check is-ready" : "life-os-ai-check",
      });
      const icon = card.createSpan();
      setIcon(icon, check.icon);
      const copy = card.createDiv();
      copy.createEl("strong", { text: check.label });
      copy.createSpan({ text: check.detail });
      card.createSpan({
        cls: "life-os-ai-state",
        text: check.state,
      });
    }
  }

  renderCollectionLive(parent, options) {
    const records = this.app.vault
      .getMarkdownFiles()
      .filter((file) => this.isDomainRecord(file))
      .filter((file) => this.activeScreen === "library" ? Boolean(this.getFrontmatter(file).type) : options.types.includes(String(this.getFrontmatter(file).type || "")))
      .filter((file) => this.activeScreen !== "library" || (file.path.startsWith("07 Library/") && !this.isExample(this.getFrontmatter(file))))
      .filter((file) => {
        const status = String(this.getFrontmatter(file).status || "").toLowerCase();
        return this.activeScreen === "library" || !["done", "complete", "completed", "archived"].includes(status);
      })
      .sort(
        (left, right) =>
          (right.stat?.mtime || 0) - (left.stat?.mtime || 0)
      );
    const section = parent.createEl("section", { cls: "life-os-collection-live" });
    this.renderLiveHeading(
      section,
      options.title,
      options.description,
      `${records.length} ${records.length === 1 ? "note" : "notes"}`
    );
    if (!records.length) {
      section.createDiv({ cls: "life-os-live-empty", text: options.empty });
      return;
    }
    let visible = records;
    if (this.activeScreen === "library") {
      const typeLabel = section.createEl("label", { text: "Type " });
      const typeSelect = typeLabel.createEl("select", { attr: { "aria-label": "Library type" } });
      const types = [...new Set(records.map(file => String(this.getFrontmatter(file).type)))].sort();
      if (!types.includes(this.libraryType)) this.libraryType = "all";
      for (const type of ["all", ...types]) typeSelect.createEl("option", { text: type === "all" ? "All types" : type, attr: { value: type } });
      typeSelect.value = this.libraryType;
      this.registerDomEvent(typeSelect, "change", () => { this.libraryType = typeSelect.value; this.render(); });
      const label = section.createEl("label", { text: "Library status " });
      const select = label.createEl("select", { attr: { "aria-label": "Library status" } });
      const statuses = [...new Set(records.map(file => String(this.getFrontmatter(file).status || "Not set")))].sort();
      for (const value of ["all", ...statuses]) select.createEl("option", { text: value === "all" ? "All statuses" : value, attr: { value } });
      if (!statuses.includes(this.libraryStatus)) this.libraryStatus = "all";
      select.value = this.libraryStatus;
      this.registerDomEvent(select, "change", () => { this.libraryStatus = select.value; this.render(); });
      visible = records.filter(file => (this.libraryStatus === "all" || String(this.getFrontmatter(file).status || "Not set") === this.libraryStatus) && (this.libraryType === "all" || String(this.getFrontmatter(file).type) === this.libraryType));
    }
    section.createEl("p", { text: `Showing ${Math.min(visible.length, this.itemLimit)} of ${visible.length} matching notes.` });
    const grid = section.createDiv({ cls: "life-os-record-grid" });
    for (const file of visible.slice(0, this.itemLimit)) {
      const data = this.getFrontmatter(file);
      const button = grid.createEl("button", { cls: "life-os-record-card" });
      button.type = "button";
      if (this.activeScreen === "library" && this.visualEnabled()) {
        button.addClass("life-os-shelf-card");
        const cover = String(data.cover || "").replace(/^!?\[\[/, "").replace(/\]\]$/, "").split("|")[0];
        const imageFile = !/^(?:[a-z]+:|\/)/i.test(cover) && /\.(?:png|jpe?g|webp|gif)$/i.test(cover) ? this.app.metadataCache.getFirstLinkpathDest?.(cover, file.path) : null;
        if (imageFile instanceof TFile && this.app.vault.getResourcePath) button.createEl("img", { cls: "life-os-book-cover", attr: { src: this.app.vault.getResourcePath(imageFile), alt: "", loading: "lazy" } });
        else button.createDiv({ cls: "life-os-book-cover life-os-book-fallback", text: String(data.type || "Note").toUpperCase() });
      }
      const icon = button.createSpan({ cls: "life-os-record-icon" });
      setIcon(icon, options.icon);
      const copy = button.createDiv();
      copy.createEl("strong", { text: this.getFileTitle(file) });
      copy.createSpan({ text: String(data.status || "Status not set") });
      if (this.visualEnabled() && ["projects", "people"].includes(this.activeScreen)) {
        const tasks = this.tasksForRecord(file, this.activeScreen === "projects" ? "project" : "p");
        copy.createSpan({ cls: "life-os-record-metrics", attr: { title: "Counts use explicit routing tags, not inferred ownership." }, text: !this.taskSnapshot || this.taskSnapshot.error ? "Task index unavailable" : `${tasks.length} tagged open · ${tasks.filter(task => task.overdue).length} overdue${this.taskSnapshot.state === "partial" ? " · partial index" : ""}` });
      }
      const arrow = button.createSpan({ cls: "life-os-record-arrow" });
      setIcon(arrow, "arrow-up-right");
      this.registerDomEvent(button, "click", () => void this.openPath(file.path));
    }
    if (this.visualEnabled() && this.activeScreen === "people") {
      const discussion = section.createDiv({ cls: "life-os-discussion-queue" });
      discussion.createEl("h3", { text: "Open conversations" });
      const entries = visible.flatMap(file => this.tasksForRecord(file, "p").filter(task => task.discuss).map(task => ({ file, task })));
      discussion.createEl("p", { text: this.taskSnapshot && !this.taskSnapshot.error ? `${entries.length} indexed person-discussion links${this.taskSnapshot.state === "partial" ? " · partial index" : ""}. Explicit person tags only.` : "Task index unavailable." });
      for (const {file, task} of entries.slice(0, this.itemLimit)) {
        const button = discussion.createEl("button", { text: `${this.getFileTitle(file)} · ${task.text}` });
        button.type = "button";
        this.registerDomEvent(button, "click", () => void this.openPath(task.path, task.line));
      }
    }
  }

  tasksForRecord(file, prefix) {
    const slug = this.getFileTitle(file).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const tag = `#${prefix}/${slug}`;
    return (this.taskSnapshot?.tasks || []).filter(task => task.text.split(/\s+/).includes(tag));
  }

  renderLiveHeading(parent, title, description, status) {
    const heading = parent.createDiv({ cls: "life-os-live-heading" });
    const copy = heading.createDiv();
    copy.createEl("h2", { text: title });
    copy.createEl("p", { text: description });
    heading.createSpan({ cls: "life-os-progress-chip is-active", text: status });
  }

  getFrontmatter(file) {
    return file instanceof TFile
      ? this.app.metadataCache.getFileCache(file)?.frontmatter || {}
      : {};
  }

  getConfigFrontmatter() {
    return this.getFrontmatter(
      this.app.vault.getAbstractFileByPath("Meta/Compass Config.md")
    );
  }

  getConfiguredFolders(config = this.getConfigFrontmatter()) {
    return {
      daily: normalizeFolder(config.daily_folder, DEFAULT_FOLDERS.daily),
      weekly: normalizeFolder(config.weekly_folder, DEFAULT_FOLDERS.weekly),
      quarterly: normalizeFolder(config.quarterly_folder, DEFAULT_FOLDERS.quarterly),
      retreats: normalizeFolder(config.retreat_folder, DEFAULT_FOLDERS.retreats),
      projects: normalizeFolder(config.projects_folder, DEFAULT_FOLDERS.projects),
    };
  }

  summarizeDailyProperties(data, questionKeys, habitKeys) {
    const questionsRecorded = questionKeys.filter(
      (key) => ratingState(data[key]).state === "recorded"
    ).length;
    const habitStates = habitKeys.map((key) => habitState(data[key]));
    const habitsRecorded = habitStates.filter(
      (state) => state === "done" || state === "unchecked"
    ).length;
    return {
      questionsRecorded,
      habitsRecorded,
      habitsDone: habitStates.filter((state) => state === "done").length,
      recorded: questionsRecorded + habitsRecorded,
    };
  }

  getQuestionKeys(config) {
    const questions = Array.isArray(config.questions) ? config.questions : [];
    return questions
      .map((question) => String(question?.key || question || ""))
      .filter(Boolean);
  }

  getHabitKeys(config) {
    return (Array.isArray(config.habits) ? config.habits : [])
      .map((habit) => String(habit || ""))
      .filter(Boolean);
  }

  countType(files, type) {
    return files.filter(
      (file) => this.isDomainRecord(file) && String(this.getFrontmatter(file).type || "") === type
    ).length;
  }

  isDomainRecord(file) {
    const projects = `${this.getConfiguredFolders().projects}/`;
    return [projects, "05 People/", "06 Writing/", "07 Library/"]
      .some((folder) => file.path.startsWith(folder)) &&
      (this.includeExamples || !this.isExample(this.getFrontmatter(file)));
  }

  fileExists(path) {
    return this.app.vault.getAbstractFileByPath(path) instanceof TFile;
  }

  getFileTitle(file) {
    return file.basename || file.path.split("/").pop().replace(/\.md$/i, "");
  }

  resolveTaskStatus(symbol) {
    const normalized = symbol === "" ? " " : String(symbol || "");
    return TASK_STATUS_TYPES[normalized] || "unknown";
  }

  parseTaskLine(line, statusSymbol, file, lineNumber, today) {
    const match = line.match(/^\s*(?:[-+*]|\d+[.)])\s+\[([^\]])\]\s*(.*)$/u);
    if (!match || match[1] !== statusSymbol) {
      return null;
    }
    const raw = match[2].trim();
    const due = raw.match(/📅\s*(\d{4}-\d{2}-\d{2})/)?.[1] || "";
    const scheduled = raw.match(/⏳\s*(\d{4}-\d{2}-\d{2})/)?.[1] || "";
    const overdue = Boolean(due && due < today);
    const dueToday = due === today;
    const scheduledToday = scheduled === today;
    const high = raw.includes("⏫") || raw.includes("🔺");
    const discuss = /(^|\s)#discuss(?:\s|$)/.test(raw);
    const text = raw
      .replace(/\s*[🛫⏳📅✅❌➕]\s*\d{4}-\d{2}-\d{2}/gu, "")
      .replace(/\s*[🔺⏫🔼🔽⏬]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
    return {
      text,
      due,
      scheduled,
      overdue,
      dueToday,
      scheduledToday,
      high,
      discuss,
      path: file.path,
      line: lineNumber,
    };
  }

  async loadTaskSnapshot() {
    const paths = this.getConfiguredFolders();
    const sources = [
      "08 Tasks/Tasks.md",
      `${paths.projects}/`,
      "05 People/",
      "06 Writing/",
    ];
    const files = this.app.vault
      .getMarkdownFiles()
      .filter((file) =>
        sources.some((source) =>
          source.endsWith("/") ? file.path.startsWith(source) : file.path === source
        )
      );
    const today = moment().format("YYYY-MM-DD");
    const tasks = [];
    const exampleFiles = files.filter((file) => this.isExample(this.getFrontmatter(file)));
    const indexFiles = files.filter((file) => !this.isExample(this.getFrontmatter(file)));

    try {
      const contents = await Promise.all(
        indexFiles.map(async (file) => {
          const cache = this.app.metadataCache.getFileCache(file);
          if (!cache) {
            return {
              file,
              content: "",
              listItems: [],
              error: "Metadata unavailable",
              errorType: "metadata",
            };
          }
          try {
            return {
              file,
              content: await this.app.vault.cachedRead(file),
              listItems: Array.isArray(cache.listItems) ? cache.listItems : [],
              error: "",
              errorType: "",
            };
          } catch (error) {
            return {
              file,
              content: "",
              listItems: [],
              error: error?.message || "Unreadable file",
              errorType: "read",
            };
          }
        })
      );
      let unresolvedStatuses = 0;
      let malformedItems = 0;
      for (const { file, content, listItems, error } of contents) {
        if (error) {
          continue;
        }
        const lines = content.split(/\r?\n/);
        for (const item of listItems) {
          if (typeof item.task !== "string") {
            continue;
          }
          const lineIndex = item.position?.start?.line;
          if (!Number.isInteger(lineIndex) || lineIndex < 0 || lineIndex >= lines.length) {
            malformedItems += 1;
            continue;
          }
          const symbol = item.task === "" ? " " : item.task;
          const status = this.resolveTaskStatus(symbol);
          if (status === "unknown") {
            unresolvedStatuses += 1;
            continue;
          }
          if (status !== "open") {
            continue;
          }
          const task = this.parseTaskLine(
            lines[lineIndex],
            symbol,
            file,
            lineIndex + 1,
            today
          );
          if (!task) {
            malformedItems += 1;
            continue;
          }
          tasks.push(task);
        }
      }
      tasks.sort((left, right) => {
        const rank = (task) =>
          task.overdue
            ? 0
            : task.dueToday || task.scheduledToday
              ? 1
              : task.high
                ? 2
                : task.due || task.scheduled
                  ? 3
                  : 4;
        const sortDate = (task) => task.due || task.scheduled || "9999-99-99";
        return (
          rank(left) - rank(right) ||
          sortDate(left).localeCompare(sortDate(right)) ||
          left.path.localeCompare(right.path) ||
          left.line - right.line ||
          left.text.localeCompare(right.text)
        );
      });
      const skipped = contents.filter((item) => item.error).length;
      return {
        tasks,
        error: "",
        state: skipped || unresolvedStatuses || malformedItems ? "partial" : "ready",
        skipped,
        missingMetadata: contents.filter((item) => item.errorType === "metadata").length,
        unresolvedStatuses,
        malformedItems,
        examplesExcluded: exampleFiles.length,
        candidateFiles: files.length,
      };
    } catch (error) {
      return {
        tasks: [],
        error: error?.message || "Task index unavailable",
        state: "unavailable",
        skipped: files.length,
        missingMetadata: 0,
        unresolvedStatuses: 0,
        malformedItems: 0,
        examplesExcluded: exampleFiles.length,
        candidateFiles: files.length,
      };
    }
  }

  taskGroup(task) {
    if (task.overdue) return "overdue";
    if (task.dueToday || task.scheduledToday) return "today";
    const today = moment().format("YYYY-MM-DD");
    if ((task.due && task.due > today) || (task.scheduled && task.scheduled > today)) return "upcoming";
    return "unscheduled";
  }

  renderFocusGroups(parent) {
    const section = parent.createDiv({ cls: "life-os-focus-groups" });
    section.createEl("h2", { text: "Where your attention goes" });
    section.createEl("p", { text: "One group per indexed open task. Past scheduled dates without a current due date fall under Other. Partial indexing may omit tasks." });
    for (const [id, label] of [["all", "All"], ["overdue", "Overdue"], ["today", "Today"], ["upcoming", "Upcoming"], ["unscheduled", "Unscheduled / other"]]) {
      const count = this.taskSnapshot?.tasks.filter(task => id === "all" || this.taskGroup(task) === id).length;
      const button = section.createEl("button", { text: `${label} · ${count ?? "Loading"}`, attr: { "aria-pressed": String(this.focusGroup === id) } });
      button.type = "button";
      this.registerDomEvent(button, "click", () => { this.focusGroup = id; this.render(); });
    }
    const total = this.taskSnapshot?.tasks.length || 0;
    if (total) {
      const bar = section.createDiv({ cls: "life-os-workload-bar", attr: { "aria-label": "Distribution of indexed open tasks" } });
      for (const [id, label] of [["overdue", "Overdue"], ["today", "Today"], ["upcoming", "Upcoming"], ["unscheduled", "Unscheduled / other"]]) {
        const count = this.taskSnapshot.tasks.filter(task => this.taskGroup(task) === id).length;
        if (!count) continue;
        const segment = bar.createEl("button", { cls: `life-os-workload-segment is-${id}`, attr: { style: `flex:${count}`, "aria-label": `${label}: ${count} of ${total}`, title: `${label}: ${count} of ${total}` } });
        segment.type = "button";
        this.registerDomEvent(segment, "click", () => { this.focusGroup = id; this.render(); });
      }
    }
  }

  renderTaskLive(parent, { limit = 7, attention = false, group = "all" } = {}) {
    const snapshot = this.taskSnapshot;
    const section = parent.createEl("section", { cls: "life-os-task-live" });
    const coverage = snapshot
      ? [
          `${snapshot.tasks.length} open`,
          snapshot.skipped - snapshot.missingMetadata > 0
            ? `${snapshot.skipped - snapshot.missingMetadata} unreadable`
            : "",
          snapshot.missingMetadata
            ? `${snapshot.missingMetadata} metadata pending`
            : "",
          snapshot.unresolvedStatuses
            ? `${snapshot.unresolvedStatuses} unresolved status`
            : "",
          snapshot.examplesExcluded
            ? `${snapshot.examplesExcluded} sample excluded`
            : "",
        ]
          .filter(Boolean)
          .join(", ")
      : "Loading";
    this.renderLiveHeading(
      section,
      attention ? "Needs attention" : "Commitment feed",
      attention ? "Overdue, due today, scheduled today, or high priority. Open a task at its source." : "Open tasks from the master inbox, projects, people, and writing notes.",
      coverage
    );

    if (!snapshot) {
      section.createDiv({ cls: "life-os-live-empty", text: "Loading local tasks..." });
      return;
    }
    if (snapshot.error) {
      section.createDiv({ cls: "life-os-live-empty", text: snapshot.error });
      return;
    }
    if (!snapshot.tasks.length) {
      section.createDiv({
        cls: "life-os-live-empty",
        text:
          snapshot.state === "partial"
            ? "No open tasks indexed. Some task data could not be classified."
            : "No open tasks found.",
      });
      return;
    }

    const selected = attention ? snapshot.tasks.filter(task => task.overdue || task.dueToday || task.scheduledToday || task.high) : snapshot.tasks.filter(task => group === "all" || this.taskGroup(task) === group);
    if (!selected.length) section.createDiv({ cls: "life-os-live-empty", text: attention ? "Nothing urgent in the indexed tasks. Other open tasks remain available below." : "No indexed tasks in this group." });
    const list = section.createDiv({ cls: "life-os-task-list" });
    for (const task of selected.slice(0, limit)) {
      const button = list.createEl("button", {
        cls: task.overdue
          ? "life-os-task-row is-overdue"
          : task.dueToday || task.scheduledToday
            ? "life-os-task-row is-today"
            : "life-os-task-row",
      });
      button.type = "button";
      const marker = button.createSpan({ cls: "life-os-task-marker" });
      setIcon(marker, task.discuss ? "messages-square" : "circle");
      const copy = button.createDiv();
      copy.createEl("strong", { text: task.text });
      copy.createSpan({ text: this.getTaskContext(task) });
      if (task.high) {
        button.createSpan({ cls: "life-os-task-priority", text: "High" });
      }
      this.registerDomEvent(button, "click", () => void this.openPath(task.path, task.line));
    }
    this.addButton(section, { icon: "list-checks", label: "All tasks", description: !selected.length ? `View all ${snapshot.tasks.length} indexed open tasks.` : `Showing ${Math.min(selected.length, limit)} of ${selected.length} matching tasks.`, onClick: () => this.openPath("00 Dashboards/Task Dashboard.md") });
  }

  getTaskContext(task) {
    if (task.overdue) {
      return `Overdue · ${task.due}`;
    }
    if (task.dueToday) {
      return "Due today";
    }
    if (task.scheduledToday) {
      return "Scheduled today";
    }
    if (task.due) {
      return `Due ${task.due}`;
    }
    if (task.scheduled) {
      return `Scheduled ${task.scheduled}`;
    }
    return this.getFileTitle({ path: task.path });
  }

  renderSystemSummary(parent) {
    const stats = this.getSystemStats();
    const section = parent.createEl("section", { cls: "life-os-summary" });
    section.createEl("h2", { text: "Live system" });
    const grid = section.createDiv({ cls: "life-os-stat-grid" });

    for (const stat of stats) {
      const card = grid.createDiv({ cls: "life-os-stat" });
      const icon = card.createSpan({ cls: "life-os-stat-icon" });
      setIcon(icon, stat.icon);
      const copy = card.createDiv();
      copy.createEl("strong", { text: String(stat.value) });
      copy.createSpan({ text: stat.label });
    }
  }

  renderSetupBanner(parent) {
    const setupPath = "00 Dashboards/Setup.md";
    const setupFile = this.app.vault.getAbstractFileByPath(setupPath);
    const status = String(this.getFrontmatter(setupFile).status || "open").toLowerCase();
    if (status === "done" || status === "complete" || status === "completed") {
      return;
    }

    const banner = parent.createEl("section", { cls: "life-os-setup-banner" });
    const icon = banner.createSpan({ cls: "life-os-setup-icon" });
    setIcon(icon, "route");
    const copy = banner.createDiv();
    copy.createEl("strong", { text: "Finish your Life OS setup" });
    copy.createEl("p", {
      text: "Complete the guided checklist before depending on automations or AI connections.",
    });
    this.addButton(banner, {
      icon: "arrow-right",
      label: "Continue setup",
      description: "Review the checklist.",
      onClick: () => this.openPath(setupPath),
    });
  }

  getSystemStats() {
    const paths = this.getConfiguredFolders();
    const files = this.app.vault.getMarkdownFiles().filter((file) => this.isDomainRecord(file));
    const frontmatter = (file) =>
      this.app.metadataCache.getFileCache(file)?.frontmatter || {};
    const typeCount = (types) =>
      files.filter((file) => types.includes(String(frontmatter(file).type || ""))).length;

    const activeProjects = files.filter((file) => {
      const data = frontmatter(file);
      const status = String(data.status || "").toLowerCase();
      return (
        data.type === "project" &&
        !["done", "complete", "completed", "archived"].includes(status)
      );
    }).length;

    const todayPath = `${paths.daily}/${moment().format("YYYY-MM-DD")}.md`;
    const weekPath = `${paths.weekly}/${moment().format("gggg-[W]ww")}.md`;
    const aiReady =
      this.pluginLoaded("agent-client") &&
      this.pluginLoaded("obsidian-local-rest-api");

    return [
      {
        icon: "calendar-check",
        value: this.app.vault.getAbstractFileByPath(todayPath) ? "Ready" : "Not created",
        label: "Today",
      },
      {
        icon: "calendar-range",
        value: this.app.vault.getAbstractFileByPath(weekPath) ? "Ready" : "Not created",
        label: "This week",
      },
      { icon: "folder-kanban", value: activeProjects, label: "Active projects" },
      { icon: "users", value: typeCount(["person"]), label: "People" },
      {
        icon: "pen-tool",
        value: typeCount(["newsletter", "youtube-script", "article", "course-lesson"]),
        label: "Creative notes",
      },
      {
        icon: "sparkles",
        value: aiReady ? "Loaded" : "Unavailable",
        label: "AI tools",
      },
    ];
  }

  renderActionSection(parent, title, description, actions, onSelect) {
    const section = parent.createEl("section", {
      cls: "life-os-section",
    });

    const heading = section.createDiv({ cls: "life-os-section-heading" });
    heading.createEl("h2", { text: title });
    heading.createEl("p", { text: description });

    const grid = section.createDiv({ cls: "life-os-grid" });

    for (const action of actions) {
      this.addButton(grid, {
        icon: action.icon,
        label: action.label,
        description: action.description,
        onClick: () => onSelect(action),
      });
    }
  }

  addButton(parent, options) {
    const button = parent.createEl("button", {
      cls: options.primary
        ? "life-os-action is-primary"
        : "life-os-action",
    });

    button.type = "button";

    const icon = button.createSpan({ cls: "life-os-action-icon" });
    setIcon(icon, options.icon);

    const copy = button.createSpan({ cls: "life-os-action-copy" });
    copy.createSpan({
      cls: "life-os-action-label",
      text: options.label,
    });
    copy.createSpan({
      cls: "life-os-action-description",
      text: options.description,
    });

    this.registerDomEvent(button, "click", () => {
      void options.onClick();
    });

    return button;
  }

  addStatus(parent, iconName, label, active) {
    const chip = parent.createSpan({
      cls: active
        ? "life-os-status is-active"
        : "life-os-status is-inactive",
    });

    const icon = chip.createSpan();
    setIcon(icon, iconName);
    chip.createSpan({ text: label });
  }

  runCommand(commandId, label) {
    return this.plugin.runCommand(commandId, label);
  }

  async openPath(path, line = null) {
    if (path === `${DEFAULT_FOLDERS.projects}/Projects Board.md`) {
      path = `${this.getConfiguredFolders().projects}/Projects Board.md`;
    }
    const file = this.app.vault.getAbstractFileByPath(path);

    if (!(file instanceof TFile)) {
      new Notice(`Life OS could not find ${path}.`);
      return;
    }

    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.openFile(file, Number.isInteger(line) && line > 0 ? { eState: { line: line - 1 } } : {});
    const editor = leaf.view?.editor;
    if (editor && Number.isInteger(line) && line > 0) {
      const position = { line: line - 1, ch: 0 };
      editor.setCursor(position);
      editor.scrollIntoView?.({ from: position, to: position }, true);
    }
    await this.app.workspace.revealLeaf(leaf);
  }

  pluginLoaded(id) {
    return Boolean(this.app.plugins?.getPlugin?.(id));
  }

  pluginSettings(id) {
    return this.app.plugins?.getPlugin?.(id)?.settings || {};
  }
}

// Original Canvas renderer inspired by SEO OS's brain-shaped knowledge map.
// Positions are decorative; every displayed edge comes from resolved vault links.
class LifeOSBrainRenderer extends Component {
  constructor(app, contentEl, compact = false) {
    super();
    this.app = app;
    this.contentEl = contentEl;
    this.compact = compact;
    this.panX = 0;
    this.panY = 0;
    this.yaw = 0.28;
    this.pitch = -0.12;
    this.labelMode = compact ? "off" : "auto";
    this.zoom = 1;
    this.query = "";
    this.region = "all";
    this.selected = null;
    this.hovered = null;
    this.nodes = [];
    this.edges = [];
    this.projected = [];
    this.regions = [
      { id: "direction", name: "Direction & projects", color: "#ff906b" },
      { id: "memory", name: "Journal & reflection", color: "#c095e8" },
      { id: "people", name: "People", color: "#e5b96a" },
      { id: "knowledge", name: "Knowledge & ideas", color: "#6fbdd8" },
      { id: "practice", name: "Tasks & systems", color: "#82c3a5" },
    ];
  }
  getViewType() { return "life-os-brain"; }
  getDisplayText() { return "Life OS Brain"; }
  getIcon() { return "brain"; }
  async onOpen() {
    const root = this.contentEl;
    root.empty(); root.addClass("life-os-brain");
    const header = root.createDiv({ cls: "life-os-brain-header" });
    const title = header.createDiv();
    title.createEl("h2", { text: "Your connected brain" });
    this.summary = title.createEl("p", { text: "Reading vault links…", attr: { "aria-live": "polite" } });
    const controls = header.createDiv({ cls: "life-os-brain-controls" });
    const search = controls.createEl("input", { attr: { type: "search", placeholder: "Find a note…", "aria-label": "Search brain notes" } });
    this.registerDomEvent(search, "input", () => { this.query = search.value.toLowerCase(); this.update(); });
    const reset = controls.createEl("button", { text: "Reset view" });
    this.registerDomEvent(reset, "click", () => { this.panX = 0; this.panY = 0; this.yaw = 0.28; this.pitch = -0.12; this.zoom = 1; this.clearHover(); });
    const labels = controls.createEl("select", { attr: { "aria-label": "Note labels" } });
    for (const [value, text] of [["auto", "Labels: Auto"], ["all", "Labels: All"], ["off", "Labels: Hover only"]]) labels.createEl("option", { text, attr: { value } });
    this.registerDomEvent(labels, "change", () => { this.labelMode = labels.value; this.draw(); });
    const standard = controls.createEl("button", { text: "Standard graph" });
    this.registerDomEvent(standard, "click", () => {
      if (!this.app.commands.executeCommandById("graph:open")) new Notice("Enable Obsidian's Graph view core plugin first.");
    });
    this.filters = root.createDiv({ cls: "life-os-brain-filters", attr: { "aria-label": "Brain regions" } });
    for (const region of [{ id: "all", name: "All regions", color: "#c4cecc" }, ...this.regions]) {
      const button = this.filters.createEl("button", { text: region.name, attr: { "aria-pressed": String(region.id === this.region), style: `--region-color:${region.color}` } });
      this.registerDomEvent(button, "click", () => {
        this.region = region.id;
        [...this.filters.children].forEach((child) => child.setAttribute("aria-pressed", String(child === button)));
        this.update();
      });
    }
    const body = root.createDiv({ cls: "life-os-brain-body" });
    this.stage = body.createDiv({ cls: "life-os-brain-stage" });
    this.canvas = this.stage.createEl("canvas", { attr: { tabindex: "0", "aria-label": "3D brain graph. Drag to rotate, Shift-drag to pan, scroll to zoom. Arrow keys rotate. Browse notes in the adjacent list." } });
    this.caption = this.stage.createDiv({ cls: "life-os-brain-caption", text: "Drag to rotate · Shift-drag to pan · Scroll to zoom" });
    this.tooltip = this.stage.createDiv({ cls: "life-os-brain-tooltip", attr: { role: "tooltip" } });
    this.tooltip.hidden = true;
    this.panel = body.createEl("aside", { cls: "life-os-brain-panel", attr: { "aria-label": "Notes and connections" } });
    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) this.caption.setText("Canvas is unavailable. Browse and open notes in the list.");
    let drag = null;
    this.registerDomEvent(this.canvas, "pointerdown", (event) => {
      this.clearHover();
      drag = { x: event.clientX, y: event.clientY, distance: 0 };
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.registerDomEvent(this.canvas, "pointermove", (event) => {
      if (!drag) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left, y = event.clientY - rect.top;
        const hit = this.hitTest(x, y);
        const changed = this.hovered !== (hit?.node.path || null);
        this.hovered = hit?.node.path || null;
        this.tooltip.empty();
        this.tooltip.hidden = !hit;
        if (hit) {
          this.tooltip.createEl("strong", { text: hit.node.title });
          this.tooltip.createDiv({ text: hit.node.path });
          this.tooltip.createDiv({ text: `${this.regions.find((r) => r.id === hit.node.region).name} · ${hit.node.degree} connections${hit.node.sample ? " · Sample note" : ""}` });
          this.tooltip.createDiv({ text: "Click to explore linked notes" });
          this.tooltip.style.left = `${Math.max(8, Math.min(x + 16, rect.width - this.tooltip.offsetWidth - 8))}px`;
          this.tooltip.style.top = `${Math.max(8, Math.min(y + 16, rect.height - this.tooltip.offsetHeight - 8))}px`;
        }
        this.canvas.style.cursor = hit ? "pointer" : "grab";
        if (changed) this.draw();
        return;
      }
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      drag.distance += Math.abs(dx) + Math.abs(dy);
      if (event.shiftKey) { this.panX += dx; this.panY += dy; }
      else { this.yaw += dx * 0.007; this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch + dy * 0.007)); }
      drag.x = event.clientX; drag.y = event.clientY;
      this.draw();
    });
    this.registerDomEvent(this.canvas, "pointerup", (event) => {
      if (drag && drag.distance < 6) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left, y = event.clientY - rect.top;
        const hit = this.hitTest(x, y);
        this.selected = hit?.node.path || null;
        this.update();
      }
      drag = null;
    });
    this.registerDomEvent(this.canvas, "pointercancel", () => { drag = null; });
    this.registerDomEvent(this.canvas, "pointerleave", () => this.clearHover());
    this.registerDomEvent(this.canvas, "wheel", (event) => {
      event.preventDefault();
      this.clearHover();
      this.zoom = Math.max(0.55, Math.min(2.5, this.zoom * Math.exp(-event.deltaY * 0.001)));
      this.draw();
    }, { passive: false });
    this.registerDomEvent(this.canvas, "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "Escape"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "ArrowLeft") this.yaw -= 0.1;
      if (event.key === "ArrowRight") this.yaw += 0.1;
      if (event.key === "ArrowUp") this.pitch = Math.max(-1.4, this.pitch - 0.1);
      if (event.key === "ArrowDown") this.pitch = Math.min(1.4, this.pitch + 0.1);
      if (["+", "="].includes(event.key)) this.zoom = Math.min(2.5, this.zoom + 0.1);
      if (event.key === "-") this.zoom = Math.max(0.55, this.zoom - 0.1);
      if (event.key === "Escape") this.selected = null;
      this.update();
    });
    this.observer = new ResizeObserver(() => this.draw());
    this.observer.observe(this.stage);
    const refresh = () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.refresh(), 150);
    };
    this.registerEvent(this.app.metadataCache.on("resolved", refresh));
    this.registerEvent(this.app.vault.on("rename", refresh));
    this.registerEvent(this.app.vault.on("delete", refresh));
    this.registerEvent(this.app.vault.on("create", refresh));
    this.refresh();
    if (this.compact) {
      this.canvas.setAttribute("tabindex", "-1");
      this.canvas.setAttribute("aria-label", "Preview of connected notes. Use Explore Brain for interactive navigation.");
    }
  }
  regionFor(path) {
    if (/^(03 Planning|04 Projects)\//.test(path)) return "direction";
    if (/^(01 Journal|02 Retreats)\//.test(path)) return "memory";
    if (path.startsWith("05 People/")) return "people";
    if (/^(06 Writing|07 Library|09 Reading|wiki|inbox)\//.test(path)) return "knowledge";
    return "practice";
  }
  clearHover() {
    this.hovered = null;
    if (this.tooltip) this.tooltip.hidden = true;
    this.draw();
  }
  hitTest(x, y) {
    const connected = new Set(this.selected ? this.edges.filter(([a, b]) => a === this.selected || b === this.selected).flat() : []);
    return [...this.projected].reverse().filter((p) => this.selected ? p.node.path === this.selected || connected.has(p.node.path) : this.matches(p.node))
      .map((p) => ({ ...p, distance: Math.hypot(p.x - x, p.y - y) }))
      .filter((p) => p.distance < 10).sort((a, b) => a.distance - b.distance || b.depth - a.depth)[0];
  }
  // Low-resolution 3D volume derived from the original folded brain contour.
  // Cached independently of graph hover so labels never rebuild the surface.
  buildBrainGeometry() {
    if (this.brainGeometry) return this.brainGeometry;
    const sample = (d, count, closed = false) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      const length = path.getTotalLength();
      return Array.from({ length: count }, (_, i) => {
        const p = path.getPointAtLength(length * i / (closed ? count : count - 1));
        return [p.x / 180, -p.y / 180];
      });
    };
    const contour = sample("M -8 -151 C -8 -177 -43 -183 -59 -162 C -82 -180 -113 -159 -113 -140 C -140 -143 -159 -122 -155 -99 C -183 -92 -190 -62 -176 -43 C -199 -21 -188 12 -174 22 C -191 46 -176 73 -155 76 C -160 102 -136 123 -115 118 C -103 147 -74 153 -55 137 C -34 155 -8 135 -8 113 Z", 80, true);
    const grooves = ["M -59 -162 C -43 -145 -69 -130 -56 -112 C -46 -98 -22 -115 -8 -99","M -113 -140 C -92 -145 -77 -129 -85 -109 C -96 -89 -118 -111 -126 -91 C -132 -76 -117 -60 -98 -68","M -155 -99 C -137 -93 -151 -63 -135 -48 C -119 -34 -99 -49 -86 -31 C -75 -15 -90 2 -111 -3","M -176 -43 C -159 -50 -141 -28 -150 -10 C -161 7 -151 25 -132 27 C -109 28 -112 51 -93 55","M -174 22 C -160 31 -175 57 -155 76 C -141 87 -125 67 -112 80 C -99 94 -116 106 -115 118","M -8 -61 C -28 -78 -53 -67 -49 -48 C -44 -28 -65 -21 -62 -3 C -59 15 -32 13 -24 31 C -15 46 -31 65 -8 76","M -55 -112 C -77 -97 -61 -77 -73 -63","M -132 27 C -126 6 -142 -8 -128 -24","M -93 55 C -68 40 -53 61 -61 80 C -69 101 -91 99 -83 119 C -78 133 -63 125 -55 137","M -8 113 C -26 100 -27 79 -45 83"].map((d) => sample(d, 28));
    const faces = [], lines = [];
    for (const side of [1, -1]) {
      const rings = [];
      for (let r = 0; r <= 12; r++) {
        const angle = -Math.PI / 2 + r / 12 * Math.PI;
        rings.push(contour.map(([x, y]) => [
          side * (-0.50 + (x + 0.50) * Math.cos(angle)),
          0.03 + (y - 0.03) * Math.cos(angle),
          Math.sin(angle) * 1.05,
        ]));
      }
      for (let r = 0; r < 12; r++) for (let i = 0; i < contour.length; i++) {
        const next = (i+1) % contour.length;
        faces.push([rings[r][i], rings[r][next], rings[r+1][next], rings[r+1][i]]);
      }
      lines.push({ points: [...rings[6], rings[6][0]], alpha: 0.28 });
      for (const zside of [-1, 1]) for (const groove of grooves) {
        lines.push({ points: groove.map(([x, y]) => {
          const angle = Math.atan2(y-0.03, x+0.5);
          const distance = Math.hypot(x+0.5,y-0.03);
          const boundary = contour.reduce((best,p) => {
            const delta = Math.atan2(p[1]-0.03,p[0]+0.5)-angle;
            const error = Math.abs(Math.atan2(Math.sin(delta),Math.cos(delta)));
            return error < best.error ? { error, radius: Math.hypot(p[0]+0.5,p[1]-0.03) } : best;
          }, { error: Infinity, radius: 1 });
          const ratio = Math.min(1, distance / boundary.radius);
          return [x*side,y,zside*1.05*Math.sqrt(1-ratio*ratio)];
        }), alpha: zside === 1 ? 0.23 : 0.09 });
      }
    }
    // Rounded stem, also a volume, not a flat overlay.
    for (let i = 0; i < 16; i++) {
      const a = i/16*Math.PI*2, b = (i+1)/16*Math.PI*2;
      faces.push([[Math.cos(a)*0.10,-0.72,Math.sin(a)*0.10-0.25],
        [Math.cos(b)*0.10,-0.72,Math.sin(b)*0.10-0.25],
        [Math.cos(b)*0.07,-1.12,Math.sin(b)*0.07-0.15],
        [Math.cos(a)*0.07,-1.12,Math.sin(a)*0.07-0.15]]);
    }
    return this.brainGeometry = { faces, lines };
  }
  drawSurface(ctx, width, height) {
    const key = [width,height,this.yaw,this.pitch,this.panX,this.panY,this.zoom,window.devicePixelRatio].join(":");
    if (key !== this.surfaceKey) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = this.surfaceCanvas || (this.surfaceCanvas = document.createElement("canvas"));
      canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
      const layer = canvas.getContext("2d");
      layer.setTransform(dpr,0,0,dpr,0,0);
      const geometry = this.buildBrainGeometry();
      const faces = geometry.faces.map((face) => face.map((p) => this.project(p,width,height)));
      faces.sort((a,b) => a.reduce((s,p)=>s+p.depth,0)-b.reduce((s,p)=>s+p.depth,0));
      layer.fillStyle = "rgba(240,160,135,0.055)";
      for (const face of faces) {
        layer.beginPath(); face.forEach((p,i)=> i ? layer.lineTo(p.x,p.y) : layer.moveTo(p.x,p.y));
        layer.closePath(); layer.fill();
      }
      layer.lineWidth = 1.1; layer.lineJoin = "round"; layer.lineCap = "round";
      for (const line of geometry.lines) {
        layer.beginPath();
        line.points.forEach((v,i) => { const p=this.project(v,width,height); if(i) layer.lineTo(p.x,p.y); else layer.moveTo(p.x,p.y); });
        layer.strokeStyle = `rgba(240,160,145,${line.alpha})`; layer.stroke();
      }
      this.surfaceKey = key;
    }
    ctx.drawImage(this.surfaceCanvas, 0, 0, width, height);
  }
  pointFor(path, region) {
    let hash = 0;
    for (const char of path) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
    const random = () => { hash = (Math.imul(hash, 1664525) + 1013904223) | 0; return (hash >>> 0) / 4294967296; };
    const side = random() < 0.5 ? -1 : 1;
    const angle = random() * Math.PI * 2, radius = Math.sqrt(random()) * 0.72;
    let y = Math.sin(angle) * radius, z = Math.cos(angle) * radius;
    if (region === "direction") z = 0.35 + random() * 0.45;
    if (region === "memory") y = 0.2 + random() * 0.55;
    if (region === "people") { y = -0.3 - random() * 0.35; z *= 0.65; }
    if (region === "knowledge") z = -0.3 - random() * 0.5;
    let x = (random() * 2 - 1) * 0.82;
    y = (y - 0.08) / 0.82; z /= 1.12;
    const radius3 = Math.hypot(x, y, z);
    if (radius3 > 0.85) { const factor = 0.85 / radius3; x *= factor; y *= factor; z *= factor; }
    return [side * 0.46 + x * 0.45, 0.08 + y * 0.82, z * 1.12];
  }
  refresh() {
    const all = this.app.vault.getMarkdownFiles().filter((file) =>
      !/^(build|Templates|scripts|Guide|Meta)\//i.test(file.path) && !file.path.startsWith("."));
    const files = all.sort((a, b) => a.path.localeCompare(b.path)).slice(0, this.compact ? 300 : 2000);
    this.total = all.length;
    this.nodes = files.map((file) => {
      const region = this.regionFor(file.path);
      const data = this.app.metadataCache.getFileCache(file)?.frontmatter || {};
      const tags = Array.isArray(data.tags) ? data.tags : String(data.tags || "").split(/[ ,]+/);
      return { path: file.path, title: file.basename || file.path.split("/").pop().replace(/\.md$/, ""), region,
        sample: data.example === true || tags.some((tag) => String(tag).replace(/^#/, "") === "example"),
        point: this.pointFor(file.path, region), degree: 0 };
    });
    const lookup = new Map(this.nodes.map((node) => [node.path, node]));
    const seen = new Set(); this.edges = [];
    for (const [source, targets] of Object.entries(this.app.metadataCache.resolvedLinks || {})) {
      if (!lookup.has(source)) continue;
      for (const target of Object.keys(targets)) {
        if (!lookup.has(target) || source === target) continue;
        const key = JSON.stringify([source, target].sort());
        if (seen.has(key)) continue;
        seen.add(key); this.edges.push([source, target]);
        lookup.get(source).degree++; lookup.get(target).degree++;
      }
    }
    if (!lookup.has(this.selected)) this.selected = null;
    this.update();
  }
  matches(node) { return (this.region === "all" || node.region === this.region) && node.path.toLowerCase().includes(this.query); }
  async openNote(node) {
    const file = this.app.vault.getAbstractFileByPath(node.path);
    if (!(file instanceof TFile)) { new Notice("This note is no longer available."); return; }
    const leaf = this.app.workspace.getLeaf("tab"); await leaf.openFile(file); await this.app.workspace.revealLeaf(leaf);
  }
  update() {
    if (!this.panel) return;
    this.hovered = null;
    if (this.tooltip) this.tooltip.hidden = true;
    const visible = this.nodes.filter((node) => this.matches(node));
    const paths = new Set(visible.map((node) => node.path));
    const edgeCount = this.edges.filter(([a, b]) => paths.has(a) && paths.has(b)).length;
    this.summary.setText(`${visible.length} notes · ${edgeCount} links · ${visible.filter((node) => node.sample).length} sample notes${this.total > this.nodes.length ? ` · showing ${this.nodes.length} of ${this.total}` : ""}`);
    if (this.compact) { this.draw(); return; }
    this.panel.empty();
    const selected = this.nodes.find((node) => node.path === this.selected);
    if (selected) {
      this.panel.createEl("h3", { text: selected.title });
      this.panel.createEl("p", { text: `${selected.path}${selected.sample ? " · Sample note" : ""}` });
      const open = this.panel.createEl("button", { text: "Open note", cls: "life-os-brain-open" });
      open.addEventListener("click", () => void this.openNote(selected));
    }
    const connected = new Set(this.edges.flatMap(([a, b]) => a === this.selected ? [b] : b === this.selected ? [a] : []));
    const list = selected ? this.nodes.filter((node) => connected.has(node.path)) : visible;
    this.panel.createEl("h3", { text: selected ? `Connected notes (${list.length})` : `Browse notes (${visible.length})` });
    if (!list.length) this.panel.createEl("p", { text: selected ? "No linked notes yet. Add a wikilink in this note to connect it." : "No matching notes." });
    for (const node of [...list].sort((a, b) => b.degree - a.degree || a.path.localeCompare(b.path)).slice(0, 60)) {
      const button = this.panel.createEl("button", { cls: "life-os-brain-note", attr: { title: node.path } });
      button.createSpan({ text: node.title });
      button.createEl("small", { text: `${node.degree} links${node.sample ? " · Sample" : ""}` });
      button.addEventListener("click", () => { this.selected = node.path; this.update(); });
    }
    if (list.length > 60) this.panel.createEl("p", { text: "Showing the 60 most connected notes. Search to narrow the list." });
    if (selected) {
      const clear = this.panel.createEl("button", { text: "Clear selection" });
      clear.addEventListener("click", () => { this.selected = null; this.update(); });
    }
    this.draw();
  }
  project(point, width, height) {
    const [x, y, z] = point;
    const rx = x * Math.cos(this.yaw) + z * Math.sin(this.yaw);
    const rz = z * Math.cos(this.yaw) - x * Math.sin(this.yaw);
    const ry = y * Math.cos(this.pitch) - rz * Math.sin(this.pitch);
    const depth = y * Math.sin(this.pitch) + rz * Math.cos(this.pitch);
    const scale = Math.min(width, height) * 0.31 * this.zoom * 4.5 / (4.5 - depth);
    return { x: width / 2 + this.panX + rx * scale, y: height / 2 + this.panY - ry * scale, depth, scale };
  }
  draw() {
    const ctx = this.ctx;
    if (!ctx || !this.stage) return;
    const width = this.stage.clientWidth, height = this.stage.clientHeight;
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (this.canvas.width !== Math.round(width * dpr) || this.canvas.height !== Math.round(height * dpr)) {
      this.canvas.width = Math.round(width * dpr); this.canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
    if (!this.compact) {
      const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.min(width, height) * 0.6);
      glow.addColorStop(0, "#173135"); glow.addColorStop(1, "#0c1118"); ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    }
    this.drawSurface(ctx, width, height);
    this.projected = this.nodes.map((node) => ({ ...this.project(node.point, width, height), node })).sort((a, b) => a.depth - b.depth);
    const lookup = new Map(this.projected.map((point) => [point.node.path, point]));
    const focus = this.hovered || this.selected;
    const edges = focus ? this.edges.filter(([a, b]) => a === focus || b === focus) : this.edges;
    const connected = new Set(focus ? edges.flat() : []);
    for (const [a, b] of edges.slice(0, 10000)) {
      const source = lookup.get(a), target = lookup.get(b);
      if (!this.selected && (!this.matches(source.node) || !this.matches(target.node))) continue;
      ctx.beginPath(); ctx.moveTo(source.x, source.y); ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = focus ? "rgba(255,203,159,0.9)" : "rgba(156,193,204,0.15)";
      ctx.lineWidth = focus ? 1.5 : 0.6; ctx.stroke();
    }
    for (const point of this.projected) {
      const active = (focus ? connected.has(point.node.path) || point.node.path === focus : true) && (this.selected || this.matches(point.node)), selected = point.node.path === focus;
      const color = this.regions.find((region) => region.id === point.node.region).color;
      const radius = selected ? 7 : 2.5 + Math.min(3, Math.sqrt(point.node.degree) * 0.5);
      ctx.globalAlpha = active ? Math.max(0.45, 0.7 + point.depth * 0.2) : 0.05;
      ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
    }
    ctx.globalAlpha = 1;
    this.drawLabels(ctx, width, height, focus, connected);
    this.caption.setText(edges.length > 10000 ? "10,000 links drawn. Select a note to isolate its connections." : "Drag to rotate · Shift-drag to pan · Scroll to zoom · Hover or click a note");
  }
  drawLabels(ctx, width, height, focus, connected) {
    const occupied = [];
    this.visibleLabels = [];
    const candidates = this.projected.filter((p) => (this.selected || this.matches(p.node)) && (!focus || p.node.path === focus || connected.has(p.node.path)))
      .sort((a,b) => Number(b.node.path === focus)-Number(a.node.path === focus) || b.node.degree-a.node.degree || b.depth-a.depth);
    ctx.font = "12px sans-serif";
    for (const p of candidates) {
      if (this.labelMode === "off" && p.node.path !== focus) continue;
      const title = p.node.title.length > 36 ? p.node.title.slice(0,35)+"…" : p.node.title;
      const w = ctx.measureText(title).width + 8;
      const box = { x: p.x+9, y: p.y-17, w, h: 18 };
      if (box.x < 0 || box.y < 0 || box.x+w > width || box.y+18 > height-35) continue;
      if (this.labelMode === "auto" && occupied.some((r) => box.x < r.x+r.w && box.x+w > r.x && box.y < r.y+r.h && box.y+18 > r.y)) continue;
      occupied.push(box); this.visibleLabels.push(p.node.path);
      ctx.fillStyle = "rgba(12,17,24,0.78)"; ctx.fillRect(box.x,box.y,w,18);
      ctx.fillStyle = p.node.path === focus ? "#fff1e4" : "#bac9d0";
      ctx.fillText(title,box.x+4,box.y+13);
    }
  }
  async onClose() {
    clearTimeout(this.timer); this.observer?.disconnect(); this.contentEl.empty(); this.ctx = null; this.panel = null; this.surfaceCanvas = null; this.brainGeometry = null;
  }
  onload() { void this.onOpen(); }
  onunload() { void this.onClose(); }
}

// Retain compatibility with already-open standalone Brain tabs.
class LifeOSBrainView extends ItemView {
  async onOpen() {
    this.renderer = new LifeOSBrainRenderer(this.app, this.contentEl);
    this.addChild(this.renderer);
  }
  getViewType() { return "life-os-brain"; }
  getDisplayText() { return "Life OS Brain"; }
  getIcon() { return "brain"; }
  async onClose() { if (this.renderer) this.removeChild(this.renderer); this.renderer = null; }
}

module.exports = class LifeOSPlugin extends Plugin {
  async onload() {
    this.registerView("life-os-brain", (leaf) => new LifeOSBrainView(leaf));
    this.registerView(
      VIEW_TYPE,
      (leaf) => new LifeOSHomeView(leaf, this)
    );

    this.addRibbonIcon("compass", "Open Life OS", () => {
      void this.activateView();
    });

    this.addCommand({
      id: "open-home",
      name: "Open Life OS home",
      callback: () => this.activateView("home"),
    });

    this.addCommand({
      id: "open-capture",
      name: "Open Life OS capture",
      callback: () => this.openCapture(),
    });

    this.addCommand({
      id: "open-configuration",
      name: "Open Life OS configuration",
      callback: () => this.app.workspace.openLinkText("Meta/Compass Config", "", true),
    });

    for (const item of NAV_ITEMS.filter((item) => item.id !== "home")) {
      this.addCommand({
        id: `open-${item.id}`,
        name: `Open Life OS ${item.label}`,
        callback: () => this.activateView(item.id),
      });
    }

    this.app.workspace.onLayoutReady(() => {
      void this.activateView();
    });
  }

  async activateView(screen = "home") {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];

    if (!leaf) {
      leaf = this.app.workspace.getLeaf("tab");
      await leaf.setViewState({
        type: VIEW_TYPE,
        active: true,
      });
    }

    if (leaf.view instanceof LifeOSHomeView) {
      leaf.view.activeScreen = screen;
      leaf.view.render();
    }

    await this.app.workspace.revealLeaf(leaf);
  }

  openCapture() {
    new LifeOSCaptureModal(this.app, this).open();
  }

  runCommand(commandId, label) {
    const ran = this.app.commands.executeCommandById(commandId);

    if (!ran) {
      new Notice(
        `${label} is unavailable. Check that its supporting plugin is enabled.`
      );
    }

    return ran;
  }

  onunload() {
    this.app.workspace.detachLeavesOfType("life-os-brain");
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
};
