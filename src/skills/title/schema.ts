/**
 * yinyarong-title - 标题生成 Skill
 * 专注于生成符合"四有原则"的公众号爆款标题
 */

import type { Skill, SkillDefinition, SkillParams, SkillResult, TitleParams } from "../../shared/types.js";
import { getTitlePrompt } from "../../shared/prompts.js";
import { callAIService, parseJSONResponse, validateTopic, withAsyncErrorHandling } from "../../shared/utils.js";

/**
 * 标题生成器配置
 */
export interface TitleGeneratorConfig {
  /** 默认生成数量 */
  defaultCount?: number;
  /** 最大生成数量 */
  maxCount?: number;
  /** 默认风格 */
  defaultStyle?: TitleParams["style"];
}

/**
 * 标题生成器类
 */
export class TitleSkill implements Skill {
  private config: TitleGeneratorConfig;

  constructor(config: TitleGeneratorConfig = {}) {
    this.config = {
      defaultCount: 5,
      maxCount: 10,
      defaultStyle: "emotional",
      ...config
    };
  }

  /**
   * 获取 Skill 定义
   */
  getDefinition(): SkillDefinition {
    return {
      name: "yinyarong_title",
      description: "生成印亚荣风格的公众号爆款标题，基于'四有原则'（有关系、有好处、有意思、有期待）",
      inputSchema: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "文章主题或内容概要（至少 5 个字）",
            minLength: 5
          },
          audience: {
            type: "string",
            description: "目标受众（如：职场人士、创业者、技术爱好者等）"
          },
          style: {
            type: "string",
            enum: ["emotional", "rational", "story", "practical"],
            description: "标题风格：emotional(情感型)、rational(理性型)、story(故事型)、practical(实用型)"
          },
          count: {
            type: "number",
            description: "生成标题的数量（默认 5，最多 10）",
            default: 5,
            minimum: 1,
            maximum: 10
          }
        },
        required: ["topic"]
      }
    };
  }

  /**
   * 验证参数
   */
  private validateParams(params: TitleParams): { valid: boolean; error?: string } {
    if (!validateTopic(params.topic)) {
      return { valid: false, error: "主题至少需要 5 个字符" };
    }

    if (params.count !== undefined) {
      if (params.count < 1) {
        return { valid: false, error: "生成数量至少为 1" };
      }
      if (params.count > (this.config.maxCount || 10)) {
        return { valid: false, error: `生成数量最多为 ${this.config.maxCount}` };
      }
    }

    return { valid: true };
  }

  /**
   * 解析 AI 响应
   */
  private parseResponse(responseText: string, count: number) {
    interface TitleItem {
      text: string;
      principle: string;
      reason: string;
    }

    interface ResponseJSON {
      titles: TitleItem[];
    }

    const parsed = parseJSONResponse<ResponseJSON>(responseText);

    if (parsed && parsed.titles && Array.isArray(parsed.titles)) {
      return {
        titles: parsed.titles.map(t => t.text),
        details: parsed.titles
      };
    }

    // 如果解析失败，尝试按行分割
    const lines = responseText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith("```"));

    return {
      titles: lines.slice(0, count),
      details: lines.map(text => ({ text, principle: "N/A", reason: "N/A" }))
    };
  }

  /**
   * 执行标题生成
   */
  async execute(params: SkillParams): Promise<SkillResult> {
    // 参数验证
    const validation = this.validateParams(params as TitleParams);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    const titleParams: TitleParams = {
      topic: params.topic,
      audience: params.audience,
      style: params.style || this.config.defaultStyle,
      count: params.count || this.config.defaultCount
    };

    // 生成提示词
    const prompt = getTitlePrompt({
      topic: titleParams.topic,
      audience: titleParams.audience,
      style: titleParams.style,
      count: titleParams.count!
    });

    // 调用 AI 服务
    const result = await withAsyncErrorHandling(async () => {
      return await callAIService(prompt);
    }, "标题生成失败");

    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }

    // 解析响应
    const parsed = this.parseResponse(result.data!, titleParams.count!);

    return {
      success: true,
      data: {
        titles: parsed.titles,
        details: parsed.details,
        params: titleParams
      },
      metadata: {
        skill: "yinyarong_title",
        timestamp: new Date().toISOString()
      }
    };
  }
}

// 导出单例
export const titleSkill = new TitleSkill();
