/**
 * yinyarong-skills MCP Server
 * 印亚荣风格公众号文章生成技能集
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool
} from "@modelcontextprotocol/sdk/types.js";
import { titleSkill } from "./skills/title/index.js";
import { articleSkill } from "./skills/article/index.js";
import { hasApiKey, getConfigSource, getAIConfig } from "./shared/utils.js";

/**
 * 创建 MCP Server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: "yinyarong-skills",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // 注册所有 tools
  const skills = [titleSkill, articleSkill];

  /**
   * 处理 ListTools 请求
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = skills.map(skill => {
      const definition = skill.getDefinition();
      return {
        name: definition.name,
        description: definition.description,
        inputSchema: definition.inputSchema
      };
    });

    return { tools };
  });

  /**
   * 处理 CallTool 请求
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // 查找对应的 skill
    const skill = skills.find(s => s.getDefinition().name === name);

    if (!skill) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: `Unknown tool: ${name}`
            })
          }
        ],
        isError: true
      };
    }

    try {
      // 执行 skill
      const result = await skill.execute(args || {});

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data, null, 2)
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: result.error
              })
            }
          ],
          isError: true
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : "Unknown error"
            })
          }
        ],
        isError: true
      };
    }
  });

  return server;
}

/**
 * 启动 Server
 */
async function main() {
  // 输出配置状态到 stderr（不影响 MCP 通信）
  console.error("yinyarong-skills MCP Server starting...");
  console.error(`API 配置来源: ${getConfigSource()}`);
  console.error(`AI Provider: ${getAIConfig().provider}`);
  console.error(`已配置 API Key: ${hasApiKey() ? "是" : "否"}`);

  if (!hasApiKey()) {
    console.error("⚠️  警告: 未检测到 API Key");
    console.error("   Claude Code 会自动设置 ANTHROPIC_AUTH_TOKEN");
    console.error("   如需使用 OpenAI，请设置 OPENAI_API_KEY 环境变量");
  }

  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("yinyarong-skills MCP Server started ✓");
}

// 导出供 CLI 和测试使用
export { createServer, titleSkill, articleSkill, main };
