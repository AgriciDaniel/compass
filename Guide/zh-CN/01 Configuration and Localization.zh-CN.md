# 配置与本地化

[中文 README](../../README.zh-CN.md) · [从这里开始](00%20Start%20Here.zh-CN.md) · [术语表](Terminology.zh-CN.md) · [英文配置原文](../../Meta/Compass%20Config.md)

## 界面语言与笔记配置

包含本次变更的开发候选版在 Life OS 顶部提供 **English / 简体中文** 语言选择，默认英文；语言偏好保存在当前笔记库的 Life OS 插件设置中，缺少翻译时回退英文。该设置改变应用界面、命令显示名称和日期显示格式，不改写笔记内容、文件路径、属性键、命令 ID 或看板标题，也不会更改 Obsidian 和第三方插件的语言。

现有 Markdown 仪表盘、模板、完整英文指南和 AI 提示词仍保留英文。问题原文与习惯键来自笔记库配置，不会因为切换语言自动翻译。

笔记库的统一配置是 [Meta/Compass Config.md](../../Meta/Compass%20Config.md)，文件顶部的 YAML 属性包含问题、习惯、生活领域、目录和前缀。日记与个人复盘模板在创建新笔记时读取这些列表；旧笔记保留已有属性。

## 将每日问题改为中文

编辑 `questions` 中每项的 `text`，保留原来的 `key` 和文件里的其他配置。下方示例仅展示默认六个问题的译文。如果你的问题或键已经自定义，请逐项翻译现有 `text`，不要用示例覆盖整个列表。即使仍使用默认问题，也建议只复制相应的 `text`。

```yaml
questions:
  - key: dq_goals
    text: 今天，我是否尽了最大努力设定清晰的目标？
  - key: dq_progress
    text: 今天，我是否尽了最大努力朝目标取得进展？
  - key: dq_meaning
    text: 今天，我是否尽了最大努力找到意义？
  - key: dq_happy
    text: 今天，我是否尽了最大努力让自己快乐？
  - key: dq_relationships
    text: 今天，我是否尽了最大努力建立良好的人际关系？
  - key: dq_engaged
    text: 今天，我是否尽了最大努力全心投入？
```

回答仍使用 1 到 10 的数字，评价努力而非成果。晚间每日问题模板读取 `text`，所以问题会按配置显示中文；量表提示、习惯选项和保存通知等模板固定文字仍为英文。部分旧图表和习惯标签从键名生成，保留英文键时这些标签可能仍是英文。

只翻译同一问题的 `text`，可以保留历史数据的关联。已开始记录后不要为翻译而重命名或删除 `dq_*`、`habit_*`、`wheel_*` 属性；旧笔记不会自动迁移，改键会让历史数据分成不同系列。如果问题的含义发生变化，即使保留原键，也不宜把前后的评分当作同一指标直接比较。

## 其他配置

| 属性 | 用途 | 本地化约定 |
| --- | --- | --- |
| `birthdate` | 生命时间视图（Memento Mori） | 自行填写 `YYYY-MM-DD`；模板默认留空 |
| `life_expectancy` | 预期寿命年数 | 保留数字类型 |
| `habits` | 新日记的复选框属性 | 每阶段保持 3 到 5 项；保留 `habit_` 前缀及已有键 |
| `wheel_areas` | 新个人复盘的 1 到 10 分属性 | 保留 `wheel_` 前缀及已有键 |
| `daily_folder`、`weekly_folder`、`quarterly_folder`、`retreat_folder`、`projects_folder` | 工作流目录 | 保留规范路径；移动目录还需协调模板、快捷记录和 Periodic Notes 设置 |
| `dq_prefix`、`habit_prefix`、`wheel_prefix` | 识别问题、习惯和生活领域属性 | 默认分别为 `dq_`、`habit_`、`wheel_`，保持原样 |
| `board_done_lanes` | 哪些看板列算作已完成 | 默认 `Done,Published,Archive`；必须与实际列标题一致 |

不要只翻译模板中的 `## Journal`、`## Wins`、`## Gratitude` 或其他被引用的标题。捕获路由、查询和嵌入链接依赖这些名称。可以在标题下用中文写内容，而保持标题、文件名、标签和属性键不变。任务的日期格式与路由标签 `#project/<slug>`、`#p/<slug>`、`#discuss` 也属于数据约定。

## 为贡献者准备可重复构建

用户在自己的笔记库中修改 `Meta/Compass Config.md`，是在修改个人配置。构建新的发布包时，脚本会使用源码仓库中的 `scripts/template/defaults/Meta/Compass Config.md` 填入不含个人数据的默认配置，因此只改笔记库配置不会改变重新构建的发布包默认值。构建过程不会把运行中的笔记库配置恢复为默认值。该默认值目录不随发布包分发。

本阶段保留英文默认问题，并通过上面的说明让中文用户自行翻译 `text`。若后续贡献要更改发布默认值，需同步审查默认配置来源，并验证构建结果；不要复制个人出生日期、笔记或插件会话。

中文指南随模板构建复制。按[贡献规则](../../CONTRIBUTING.md)记录变更并执行 `python3 scripts/verify_template.py .`。静态或模拟检查不代表已在 Obsidian 中完成语言切换、重启后保留语言偏好、快捷记录及图表的原生验收；验收项目见[原生验收记录](../23%20Native%20Acceptance.md)。
