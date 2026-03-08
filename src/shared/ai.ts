/**
 * AI 服务实际调用实现
 * 支持 Anthropic Claude 和 OpenAI
 */

import type { AIServiceConfig } from "./utils.js";

/**
 * Anthropic API 响应类型
 */
interface AnthropicMessageResponse {
  id: string;
  type: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string;
}

/**
 * OpenAI API 响应类型
 */
interface OpenAIChatResponse {
  id: string;
  object: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  model: string;
}

/**
 * 调用 Anthropic Claude API
 */
export async function callAnthropic(
  prompt: string,
  systemPrompt: string | undefined,
  config: AIServiceConfig
): Promise<string> {
  if (!config.apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  // 支持自定义 BASE_URL（如智谱AI）
  const baseURL = config.baseURL || "https://api.anthropic.com";
  const url = `${baseURL}/v1/messages`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": config.apiKey,
    "anthropic-version": "2023-06-01"
  };

  const body = JSON.stringify({
    model: config.model || "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    system: systemPrompt || "你是一位专业的内容创作者。",
    messages: [{ role: "user", content: prompt }]
  });

  const response = await fetch(url, { method: "POST", headers, body });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as AnthropicMessageResponse;

  // 提取文本内容
  const textBlock = data.content.find(block => block.type === "text");
  if (!textBlock) {
    throw new Error("No text content in response");
  }

  return textBlock.text;
}

/**
 * 调用 OpenAI API
 */
export async function callOpenAI(
  prompt: string,
  systemPrompt: string | undefined,
  config: AIServiceConfig
): Promise<string> {
  if (!config.apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const url = "https://api.openai.com/v1/chat/completions";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${config.apiKey}`
  };

  // 将 system prompt 转换为消息
  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const body = JSON.stringify({
    model: config.model || "gpt-4o",
    messages: messages,
    max_tokens: 4096
  });

  const response = await fetch(url, { method: "POST", headers, body });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as OpenAIChatResponse;

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No choices in response");
  }

  return data.choices[0].message.content;
}

/**
 * 统一的 AI 调用入口
 */
export async function callAIService(
  prompt: string,
  systemPrompt?: string,
  config?: AIServiceConfig
): Promise<string> {
  // 动态导入避免循环依赖
  const { getAIConfig } = await import("./utils.js");
  const finalConfig = config || getAIConfig();

  switch (finalConfig.provider) {
    case "anthropic":
      return await callAnthropic(prompt, systemPrompt, finalConfig);
    case "openai":
      return await callOpenAI(prompt, systemPrompt, finalConfig);
    default:
      throw new Error(`Unsupported AI provider: ${finalConfig.provider}`);
  }
}
