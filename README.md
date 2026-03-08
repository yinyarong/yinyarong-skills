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
| `src/shared/types.ts` | 统一的 TypeScript 类型定义 |
| `src/shared/prompts.ts` | 印亚荣风格提示词模板 |
| `src/shared/utils.ts` | 工具函数和环境变量读取 |
| `src/skills/*/schema.ts` | 各 Skill 的具体实现 |

## 配置

### 环境变量

```bash
# .env 文件
ANTHROPIC_API_KEY=sk-ant-xxx...    # Anthropic API Key
AI_PROVIDER=anthropic               # 或 openai
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Claude Desktop 配置

```json
{
  "mcpServers": {
    "yinyarong-skills": {
      "command": "bash",
      "args": [
        "-c",
        "cd /path/to/yinyarong-skills && source .env && node dist/index.js"
      ]
    }
  }
}
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
