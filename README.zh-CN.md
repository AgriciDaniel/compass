<p align="center"><img src="Meta/attachments/cover.png" alt="Compass" width="100%"></p>

# Life OS

[English](README.md) | 简体中文

*用 Obsidian 管理生活，从每晚认真回答一组问题开始。*

Compass 是一个完整的 Obsidian 笔记库模板，包含每日问题、日记、季度个人复盘、多尺度规划、习惯追踪、阅读、任务管理和写作看板。Compass 自带的 Life OS 应用为这些工作流提供统一导航、快捷记录和实时摘要。笔记仍以 Markdown 和属性保存，[AGENTS.md](AGENTS.md) 为 AI 助手提供操作约定。

**当前状态：开发候选版，尚未作为新版正式发布。** 已发布的 1.0.2 压缩包不含 Life OS 应用；下一版模板候选版本为 1.1.0，正式发布需完成打包检查和 Obsidian 原生验收。需要 Obsidian 1.13.1 或更新版本。核心仪表盘的移动端兼容性尚需原生测试；Agent Client 和本地 API 桥接仅适用于桌面端。参见[原生验收记录](Guide/23%20Native%20Acceptance.md)。

## 简体中文支持范围

本次变更为开发候选版增加中文入门文档和 Life OS 界面语言选择。应用顶部可选择 **English** 或 **简体中文**，默认英文；语言偏好保存在当前笔记库的 Life OS 插件设置中，缺失的翻译回退到英文。切换语言影响应用界面、命令显示名称和日期显示格式。

现有 Markdown 仪表盘、笔记模板、完整英文指南、AI 提示词和第三方插件界面仍保留原来的语言。笔记内容、文件路径、属性键、命令 ID 和看板标题不会随语言选择改变。每日问题的文字可自行翻译，见[配置与本地化](Guide/zh-CN/01%20Configuration%20and%20Localization.zh-CN.md)。

## 快速开始

1. 要体验本次简体中文支持，使用包含本次变更的源码或候选包。源码根目录或解压后的目录就是笔记库。[Releases](https://github.com/AgriciDaniel/compass/releases) 中现有的 1.0.2 压缩包不包含 Life OS 和本次界面语言功能。
2. 在 Obsidian 中选择 **Open folder as vault**，打开该目录。
3. 出现 **Restricted mode** 提示时，选择 **Turn off**。打开命令面板，执行 **Reload app without saving**，加载随附的十个社区插件及 Life OS。Life OS 在重新加载后自动打开。
4. 打开 [00 Dashboards/Setup.md](00%20Dashboards/Setup.md)，按状态清单完成设置。在 Life OS 顶部选择 **简体中文**。
5. 今晚用 `Ctrl/Cmd+Shift+D` 创建或打开当天日记，用 `Ctrl/Cmd+Shift+Q` 回答每日问题，以 1 到 10 分评价努力，并在 `## Journal` 下写一句话。先坚持 30 天，再增加其他工作流。

标记为 `example` 的笔记是用于展示的示例数据。真实记录建立后，按 Setup 清单逐项移除示例。完整中文步骤见[从这里开始](Guide/zh-CN/00%20Start%20Here.zh-CN.md)。

## 七个工作流

| 工作流 | 主要位置 | 英文原文 |
| --- | --- | --- |
| 日记与每日问题 | `01 Journal/Daily` | [日记与每日问题](Guide/03%20Workflow%20-%20Journaling%20and%20Daily%20Questions.md) |
| 季度个人复盘 | `02 Retreats` | [个人复盘](Guide/04%20Workflow%20-%20Personal%20Retreat.md) |
| 多尺度规划 | `01 Journal`、`03 Planning` | [多尺度规划](Guide/05%20Workflow%20-%20Multi-Scale%20Planning.md) |
| 习惯追踪 | 日记中的 `habit_*` 属性 | [习惯追踪](Guide/06%20Workflow%20-%20Habit%20Tracking.md) |
| 每日阅读 | `09 Reading`，以圣经阅读为示例 | `Guide/07 Workflow - Daily Reading.md`（可选模块） |
| 任务管理 | `08 Tasks`、`04 Projects`、`05 People` | [任务管理](Guide/08%20Workflow%20-%20Task%20Management.md) |
| 写作 | `06 Writing` 下的各类看板 | [写作](Guide/09%20Workflow%20-%20Writing.md) |

日记属性 `dq_*`、`habit_*` 和复盘属性 `wheel_*` 是数据约定。统一配置位于 [Meta/Compass Config.md](Meta/Compass%20Config.md)。使用中文时保留这些键和前缀，避免历史记录、图表和查询失去关联。

## AI 与数据

AI 功能是可选的。`Prompts/` 包含 16 项常用工作流，Agent Client 连接本地运行的 AI 代理，本地 REST API 可通过 MCP 向代理提供笔记库工具。模板不含 API 密钥、代理会话或导出的聊天，默认关闭自动授权。

本地运行代理不代表所有数据都留在本机。发给代理的消息、提及的笔记和附件可能发送给模型服务商；嵌入聊天会使用所在笔记作为上下文，活动笔记和链接笔记是否加入上下文取决于客户端设置。发送前检查共享内容和权限。人工授权是操作约定，不能保证所有外部工具都强制执行。详情见[AI 指南](Guide/14%20Agent%20Client%20and%20Claude%20Code.md)、[提示词库](Guide/20%20Prompt%20Library.md)及[MCP 桥接](Guide/19%20Obsidian%20MCP%20Bridge.md)。

## 贡献、更新与许可

系统文件通过模板构建流程发布。发布默认配置来源是 `scripts/template/defaults/`；只修改笔记库里的配置不会改变重新构建后的默认值。提交贡献前阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 并运行 `python3 scripts/verify_template.py .`。自动检查不能替代原生 Obsidian 验收。

更新前备份完整笔记库，将新版解压到独立目录，再逐项比较并迁移自己的笔记、配置和模板。不要整体覆盖正在使用的 `.obsidian` 目录。只有经过恢复测试，才能确认备份可用。参见[发布清单](scripts/RELEASE.md)。

Compass 根据 Mike Schmitz 的公开视频独立实现，与 Practical PKM、LifeHQ 及 Obsidian Starter Vault 无关联。完整来源与致谢见 [CREDITS.md](CREDITS.md)。代码、模板、脚本和配置使用 [MIT 许可](LICENSE)；`Guide/` 文档使用 [CC BY 4.0](LICENSE-GUIDE.md)；第三方插件保留各自许可，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

中文资料：[从这里开始](Guide/zh-CN/00%20Start%20Here.zh-CN.md) · [配置与本地化](Guide/zh-CN/01%20Configuration%20and%20Localization.zh-CN.md) · [术语表](Guide/zh-CN/Terminology.zh-CN.md)。完整项目说明以[英文 README](README.md)及各工作流原文为参考。
