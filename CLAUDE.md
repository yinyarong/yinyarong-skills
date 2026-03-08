# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 MCP (Model Context Protocol) 的技能服务器，提供两个核心技能：
- **yinyarong_title**: 生成符合"四有原则"的公众号爆款标题
- **yinyarong_article**: 撰写印亚荣风格的公众号文章

印亚荣风格的核心特征包括：灵魂三问开场、生活化比喻、H2/H3 结构化布局、亲和口语化语气。

## 常用命令

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 监听模式编译（开发时使用）
npm run dev

# 启动 MCP Server
npm start

# Lint 检查
npm run lint
```

## 架构设计

### 技能系统架构

```
src/index.ts          # MCP Server 入口，处理 ListTools/CallTool 请求
src/shared/           # 共享层
  ├── types.ts        # 统一的类型定义（Skill 接口、参数、返回值）
  ├── ai.ts           # AI 调用实现（Anthropic/OpenAI）
  ├── config.ts       # API Key 配置自动读取
  ├── prompts.ts      # 印亚荣风格提示词模板
  └── utils.ts        # 工具函数（JSON 解析、字数统计等）
src/skills/           # 各技能实现
  ├── title/          # 标题生成技能
  └── article/        # 文章生成技能（依赖 title skill）
```

### Skill 接口

所有技能必须实现 `Skill` 接口：

```typescript
interface Skill {
  getDefinition(): SkillDefinition;  // 返回 name, description, inputSchema
  execute(params: SkillParams): Promise<SkillResult>;  // 执行逻辑
}
```

### AI Provider 切换

通过环境变量配置：
- `AI_PROVIDER=anthropic` (默认) 或 `AI_PROVIDER=openai`
- `ANTHROPIC_API_KEY` 或 `OPENAI_API_KEY`
- `ANTHROPIC_BASE_URL` (支持自定义端点，如智谱 AI)

配置读取优先级：环境变量 > Claude Desktop 配置文件 > 未配置

### 技能间依赖

`article` skill 可以依赖 `title` skill 生成标题。使用动态导入避免循环依赖：

```typescript
async function getTitleSkill() {
  const { titleSkill } = await import("../title/index.js");
  return titleSkill;
}
```

## 添加新技能

1. 在 `src/skills/` 下创建新目录
2. 实现 `schema.ts`（技能类）和 `index.ts`（导出）
3. 在 `src/index.ts` 的 `skills` 数组中注册

## TypeScript 配置

- ES2022 target, Node16 module
- 输出到 `dist/` 目录
- 生成 .d.ts 和 sourceMap
