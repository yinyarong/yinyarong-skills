/**
 * 配置管理 - 自动从多个来源读取 API Key
 */

import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export interface AIServiceConfig {
  provider: "anthropic" | "openai" | "custom";
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

/**
 * 获取 Claude 配置文件路径（支持 Claude Desktop 和 Claude Code）
 */
function getClaudeConfigPath(): string {
  // 优先使用 Claude Code 配置
  const claudeCodePath = join(homedir(), ".config/claude-code/config.json");
  if (existsSync(claudeCodePath)) {
    return claudeCodePath;
  }

  // 回退到 Claude Desktop 配置
  return join(
    process.env.APPDATA ||
      (process.platform === "darwin"
        ? join(homedir(), "Library/Application Support/Claude")
        : join(homedir(), ".config/Claude")),
    "claude_desktop_config.json"
  );
}

/**
 * 从 Claude 配置文件中读取 API Key（支持 Claude Desktop 和 Claude Code）
 */
function loadFromClaudeConfig(): Partial<AIServiceConfig> | null {
  try {
    const configPath = getClaudeConfigPath();
    if (!existsSync(configPath)) {
      return null;
    }

    const content = readFileSync(configPath, "utf-8");
    const config = JSON.parse(content);

    // 查找 yinyarong-skills 的配置
    if (config.mcpServers?.["yinyarong-skills"]?.env) {
      const env = config.mcpServers["yinyarong-skills"].env;
      return {
        apiKey: env.ANTHROPIC_API_KEY || env.OPENAI_API_KEY,
        provider: env.AI_PROVIDER || "anthropic",
        model: env.ANTHROPIC_MODEL || env.OPENAI_MODEL
      };
    }

    // 查找任何包含 ANTHROPIC_API_KEY 的 MCP Server
    for (const [name, serverConfig] of Object.entries(config.mcpServers || {})) {
      const server = serverConfig as any;
      if (server.env?.ANTHROPIC_API_KEY) {
        return {
          apiKey: server.env.ANTHROPIC_API_KEY,
          provider: "anthropic"
        };
      }
      if (server.env?.OPENAI_API_KEY) {
        return {
          apiKey: server.env.OPENAI_API_KEY,
          provider: "openai"
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 从环境变量加载配置
 */
function loadFromEnv(): Partial<AIServiceConfig> | null {
  const config: Partial<AIServiceConfig> = {
    provider: (process.env.AI_PROVIDER as AIServiceConfig["provider"]) || "anthropic"
  };

  // Claude Code 使用 ANTHROPIC_AUTH_TOKEN
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN;

  if (apiKey) {
    config.apiKey = apiKey;
    config.model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

    // 检测自定义 BASE_URL（如智谱AI）
    if (process.env.ANTHROPIC_BASE_URL) {
      config.baseURL = process.env.ANTHROPIC_BASE_URL;
    }
  }

  if (process.env.OPENAI_API_KEY) {
    config.apiKey = process.env.OPENAI_API_KEY;
    config.provider = "openai";
    config.model = process.env.OPENAI_MODEL || "gpt-4o";
  }

  if (!config.apiKey) {
    return null;
  }
  return config;
}

/**
 * 加载配置（按优先级）
 * 1. 环境变量（Claude Code 自动设置 ANTHROPIC_AUTH_TOKEN）
 * 2. Claude Code/Claude Desktop 配置文件
 * 3. 返回默认配置（需要用户配置）
 */
function loadConfig(): AIServiceConfig {
  // 尝试从环境变量读取
  const envConfig = loadFromEnv();
  if (envConfig?.apiKey) {
    return {
      provider: envConfig.provider || "anthropic",
      apiKey: envConfig.apiKey,
      model: envConfig.model
    };
  }

  // 尝试从 Claude Desktop 配置读取
  const claudeConfig = loadFromClaudeConfig();
  if (claudeConfig?.apiKey) {
    return {
      provider: claudeConfig.provider || "anthropic",
      apiKey: claudeConfig.apiKey,
      model: claudeConfig.model
    };
  }

  // 返回默认配置（无 API Key）
  return {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022"
  };
}

/**
 * 当前 AI 服务配置
 */
let aiConfig: AIServiceConfig = loadConfig();

/**
 * 设置 AI 服务配置
 */
export function setAIConfig(config: Partial<AIServiceConfig>): void {
  aiConfig = { ...aiConfig, ...config };
}

/**
 * 获取 AI 服务配置
 */
export function getAIConfig(): AIServiceConfig {
  return { ...aiConfig };
}

/**
 * 检查是否已配置 API Key
 */
export function hasApiKey(): boolean {
  return !!aiConfig.apiKey;
}

/**
 * 获取配置来源（用于调试）
 */
export function getConfigSource(): string {
  if (process.env.ANTHROPIC_AUTH_TOKEN) {
    return "Claude Code (ANTHROPIC_AUTH_TOKEN)";
  }
  if (process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY) {
    return "环境变量";
  }
  if (loadFromClaudeConfig()?.apiKey) {
    return "Claude 配置文件";
  }
  return "未配置";
}
