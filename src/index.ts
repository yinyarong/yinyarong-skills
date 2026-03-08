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
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // stderr 用于日志输出（不影响 MCP 通信）
  console.stderr = process.stderr;
  console.error("yinyarong-skills MCP Server started");
}

// 启动服务
main().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// 导出供测试使用
export { createServer, titleSkill, articleSkill };
