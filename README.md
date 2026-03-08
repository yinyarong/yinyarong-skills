# yinyarong-skills

印亚荣风格公众号文章生成技能集，基于 MCP 协议构建。

> 快速开始请查看 [QUICKSTART.md](./QUICKSTART.md)

## 简介

将两个核心技能封装成一个统一的 MCP Server：

- **yinyarong-title**: 生成符合"四有原则"的公众号爆款标题
- **yinyarong-article**: 撰写印亚荣风格的公众号文章

### 印亚荣风格特征

| 特征 | 说明 |
|------|------|
| 灵魂三问 | 用三个反问句开场，引发思考 |
| 生活化比喻 | 用日常例子解释复杂概念 |
| 结构化布局 | H2/H3 层次分明 |
| 亲和口语化 | 像朋友聊天般自然 |

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                     yinyarong-skills                    │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────┐      ┌──────────────────────────┐   │
│  │  MCP Server   │──────│      Skills Registry     │   │
│  │  (src/index) │      │  ┌────────┬────────────┐ │   │
│  └───────────────┘      │  │ title  │  article   │ │   │
│                         │  └────────┴────────────┘ │   │
│                         └──────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Shared Layer (src/shared/)                              │
│  ┌──────────┬──────────┬──────────┬──────────────┐     │
│  │ types.ts │ ai.ts    │prompts.ts│  utils.ts    │     │
│  │ 类型定义  │ AI调用   │ 提示词   │  工具函数    │     │
│  └──────────┴──────────┴──────────┴──────────────┘     │
├─────────────────────────────────────────────────────────┤
│  AI Provider (可切换)                                    │
│  ┌──────────────────┬──────────────────┐                │
│  │ Anthropic Claude │   OpenAI GPT     │                │
│  └──────────────────┴──────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

## 核心文件说明

| 文件 | 作用 |
|------|------|
| `src/index.ts` | MCP Server 入口，处理请求路由 |
| `src/shared/ai.ts` | AI API 调用实现（支持 Anthropic/OpenAI） |
| `src/shared/config.ts` | **自动读取 API Key 配置** |
| `src/shared/types.ts` | 统一的 TypeScript 类型定义 |
| `src/shared/prompts.ts` | 印亚荣风格提示词模板 |
| `src/shared/utils.ts` | 工具函数 |
| `src/skills/*/schema.ts` | 各 Skill 的具体实现 |

## 安装

### 方式一：npm 全局安装（推荐）

```bash
npm install -g yinyarong-skills
```

安装后在 Claude Code 配置文件中添加：

```json
{
  "mcpServers": {
    "yinyarong-skills": {
      "command": "yinyarong-skills"
    }
  }
}
```

### 方式二：从源码安装

#### 前置要求

- **Node.js**: >= 20.17.0
- **npm**: 或其他包管理器（pnpm/yarn）
- **Claude Code**: CLI 工具（用于使用 MCP 技能）

#### 1. 克隆或下载项目

```bash
git clone https://github.com/yourusername/yinyarong-skills.git
cd yinyarong-skills
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 编译项目

```bash
npm run build
```

编译成功后会在 `dist/` 目录生成 JavaScript 文件。

#### 4. 配置 Claude Code

找到 Claude Code 配置文件：

- **macOS/Linux**: `~/.config/claude-code/config.json`
- **Windows**: `%APPDATA%\claude-code\config.json`

添加以下配置（**注意替换路径为你的实际路径**）：

```json
{
  "mcpServers": {
    "yinyarong-skills": {
      "command": "node",
      "args": [
        "/Users/yin/Documents/yinyarong-skills/dist/index.js"
      ]
    }
  }
}
```

> **提示**: API Key 会自动从 Claude Code 的配置中读取，无需单独设置。

#### 开发模式

监听模式编译（代码变更自动重新编译）：

```bash
npm run dev
```

## API 文档

### yinyarong_title

生成公众号爆款标题，基于"四有原则"（有关系、有好处、有意思、有期待）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| topic | string | ✅ | 文章主题 |
| audience | string | ❌ | 目标受众 |
| style | string | ❌ | emotional/rational/story/practical |
| count | number | ❌ | 生成数量（默认5） |

### yinyarong_article

撰写印亚荣风格文章，可自动调用 title skill 生成标题

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| topic | string | ✅ | 文章主题 |
| title | string | ❌ | 自定义标题 |
| audience | string | ❌ | 目标受众 |
| style | string | ❌ | humorous/professional/storytelling/tutorial |
| length | string | ❌ | short/medium/long |
| generateTitle | boolean | ❌ | 是否自动生成标题（默认true） |

## 添加新 Skill

1. 在 `src/skills/` 下创建新目录
2. 实现 `Skill` 接口
3. 在 `src/index.ts` 中注册

```typescript
// src/skills/your-skill/schema.ts
import type { Skill, SkillDefinition } from "../../shared/types.js";

export class YourSkill implements Skill {
  getDefinition(): SkillDefinition {
    return {
      name: "your_skill",
      description: "Your skill description",
      inputSchema: { /* ... */ }
    };
  }

  async execute(params: SkillParams): Promise<SkillResult> {
    // 实现逻辑
  }
}
```

## 许可证

MIT
