# 快速开始指南

## 1. 安装依赖

```bash
cd yinyarong-skills
npm install
```

## 2. 配置 API Key

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 API Key：

```bash
# 使用 Anthropic Claude（推荐）
ANTHROPIC_API_KEY=sk-ant-xxx...

# 或使用 OpenAI
# OPENAI_API_KEY=sk-xxx...
# AI_PROVIDER=openai
```

## 3. 编译项目

```bash
npm run build
```

## 4. 配置 Claude Desktop

在 Claude Desktop 的配置文件中添加：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "yinyarong-skills": {
      "command": "bash",
      "args": [
        "-c",
        "cd /Users/yin/Documents/Git-learn/Demo/yinyarong-skills && source .env && node dist/index.js"
      ]
    }
  }
}
```

注意：将路径替换为你实际的路径。

## 5. 重启 Claude Desktop

重启后，你就可以在对话中使用这些技能了：

### 生成标题

```
请使用 yinyarong_title 为以下主题生成 5 个标题：如何用 AI 提高写作效率
```

### 生成文章

```
请使用 yinyarong_article 撰写一篇关于 AI 工具的文章，风格幽默，长度中等
```

### 一步到位（自动生成标题+文章）

```
请使用 yinyarong_article 为我写一篇关于 AI 写作工具的文章
```

## 常见问题

### Q: 提示 API Key 错误
A: 检查 `.env` 文件是否存在，API Key 是否正确

### Q: 找不到 MCP Server
A: 检查 Claude Desktop 配置文件中的路径是否正确

### Q: 想使用本地模型
A: 可以修改 `src/shared/ai.ts`，添加对 Ollama 等本地模型的支持
