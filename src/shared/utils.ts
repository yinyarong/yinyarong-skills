/**
 * 共享工具函数
 */

/**
 * AI 服务配置
 */
export interface AIServiceConfig {
  provider: "anthropic" | "openai" | "custom";
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

/**
 * 从环境变量读取配置
 */
function loadConfigFromEnv(): AIServiceConfig {
  const config: AIServiceConfig = {
    provider: (process.env.AI_PROVIDER as AIServiceConfig["provider"]) || "anthropic"
  };

  // Anthropic 配置
  if (config.provider === "anthropic") {
    config.apiKey = process.env.ANTHROPIC_API_KEY;
    config.model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
  }

  // OpenAI 配置
  if (config.provider === "openai") {
    config.apiKey = process.env.OPENAI_API_KEY;
    config.model = process.env.OPENAI_MODEL || "gpt-4o";
  }

  return config;
}

/**
 * 当前 AI 服务配置（从环境变量初始化）
 */
let aiConfig: AIServiceConfig = loadConfigFromEnv();

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
 * 解析 JSON 响应
 * 注意：callAIService 已移至 ai.ts
 */
export { callAIService } from "./ai.js";

/**
 */
export function parseJSONResponse<T>(text: string): T | null {
  try {
    // 尝试直接解析
    return JSON.parse(text) as T;
  } catch {
    // 尝试提取 JSON 代码块
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]) as T;
      } catch {
        return null;
      }
    }
    // 尝试提取花括号内容
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * 提取纯文本内容（去除 Markdown 格式）
 */
export function extractPlainText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "") // 移除标题
    .replace(/\*\*(.+?)\*\*/g, "$1") // 移除粗体
    .replace(/\*(.+?)\*/g, "$1") // 移除斜体
    .replace(/`(.+?)`/g, "$1") // 移除行内代码
    .replace(/```[\s\S]*?```/g, "") // 移除代码块
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 移除链接
    .replace(/\n{3,}/g, "\n\n") // 合并多余空行
    .trim();
}

/**
 * 统计字数
 */
export function countWords(text: string): number {
  // 移除空白字符后统计
  const cleanText = text.replace(/\s+/g, "");
  // 中文字符
  const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length;
  // 英文单词
  const englishWords = (cleanText.match(/[a-zA-Z]+/g) || []).length;
  return chineseChars + englishWords;
}

/**
 * 生成文章摘要
 */
export function generateSummary(content: string, maxLength = 100): string {
  const plainText = extractPlainText(content);
  if (plainText.length <= maxLength) {
    return plainText;
  }
  return plainText.slice(0, maxLength - 3) + "...";
}

/**
 * 验证主题输入
 */
export function validateTopic(topic: string): boolean {
  return typeof topic === "string" && topic.trim().length >= 5;
}

/**
 * 错误处理包装器
 */
export function withErrorHandling<T>(
  fn: () => T,
  errorMessage = "操作失败"
): { success: boolean; data?: T; error?: string } {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : errorMessage
    };
  }
}

/**
 * 异步错误处理包装器
 */
export async function withAsyncErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage = "操作失败"
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : errorMessage
    };
  }
}
