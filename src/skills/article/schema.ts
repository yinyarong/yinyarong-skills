/**
 * yinyarong-article - 文章生成 Skill
 * 撰写印亚荣风格的公众号文章，可依赖 title skill 生成标题
 */

import type { Skill, SkillDefinition, SkillParams, SkillResult, ArticleParams } from "../../shared/types.js";
import { getArticlePrompt } from "../../shared/prompts.js";
import { callAIService, countWords, generateSummary, validateTopic, withAsyncErrorHandling } from "../../shared/utils.js";

/**
 * 导入 title skill（用于生成标题）
 * 注意：这里使用动态导入避免循环依赖
 */
async function getTitleSkill() {
  const { titleSkill } = await import("../title/index.js");
  return titleSkill;
}

/**
 * 文章生成器配置
 */
export interface ArticleGeneratorConfig {
  /** 默认文章长度 */
  defaultLength?: ArticleParams["length"];
  /** 默认风格 */
  defaultStyle?: ArticleParams["style"];
  /** 是否自动生成标题（如果未提供） */
  autoGenerateTitle?: boolean;
}

/**
 * 文章生成器类
 */
export class ArticleSkill implements Skill {
  private config: ArticleGeneratorConfig;

  constructor(config: ArticleGeneratorConfig = {}) {
    this.config = {
      defaultLength: "medium",
      defaultStyle: "humorous",
      autoGenerateTitle: true,
      ...config
    };
  }

  /**
   * 获取 Skill 定义
   */
  getDefinition(): SkillDefinition {
    return {
      name: "yinyarong_article",
      description: "撰写印亚荣风格的公众号文章，包含灵魂三问开头、生活化比喻、结构化布局和亲和口语化语气",
      inputSchema: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "文章主题（至少 5 个字）",
            minLength: 5
          },
          title: {
            type: "string",
            description: "自定义标题（可选，不传则自动生成）"
          },
          audience: {
            type: "string",
            description: "目标受众（如：职场人士、创业者、技术爱好者等）"
          },
          style: {
            type: "string",
            enum: ["humorous", "professional", "storytelling", "tutorial"],
            description: "文章风格：humorous(幽默风趣)、professional(专业干货)、storytelling(故事讲述)、tutorial(教程指南)"
          },
          length: {
            type: "string",
            enum: ["short", "medium", "long"],
            description: "文章长度：short(800-1000字)、medium(1500-2000字)、long(2500-3000字)"
          },
          generateTitle: {
            type: "boolean",
            description: "是否自动生成标题（默认 true）",
            default: true
          },
          titleStyle: {
            type: "string",
            enum: ["emotional", "rational", "story", "practical"],
            description: "生成标题时的风格偏好"
          }
        },
        required: ["topic"]
      }
    };
  }

  /**
   * 验证参数
   */
  private validateParams(params: ArticleParams): { valid: boolean; error?: string } {
    if (!validateTopic(params.topic)) {
      return { valid: false, error: "主题至少需要 5 个字符" };
    }
    return { valid: true };
  }

  /**
   * 生成或获取标题
   */
  private async getOrGenerateTitle(params: ArticleParams): Promise<string> {
    // 如果已提供标题，直接使用
    if (params.title && params.title.trim().length > 0) {
      return params.title.trim();
    }

    // 如果配置不自动生成标题，返回主题
    if (params.generateTitle === false) {
      return params.topic;
    }

    // 调用 title skill 生成标题
    try {
      const titleSkill = await getTitleSkill();
      const result = await titleSkill.execute({
        topic: params.topic,
        audience: params.audience,
        style: params.titleStyle || "emotional",
        count: 1
      });

      if (result.success && result.data?.titles?.length > 0) {
        return result.data.titles[0];
      }

      // 生成失败，返回主题作为后备
      return params.topic;
    } catch (error) {
      // 调用失败，返回主题作为后备
      return params.topic;
    }
  }

  /**
   * 解析文章内容
   */
  private parseArticle(responseText: string, title: string) {
    // 移除可能的代码块标记
    let content = responseText
      .replace(/^```markdown\s*\n/i, "")
      .replace(/^```\s*\n/i, "")
      .replace(/\n```$/i, "")
      .trim();

    // 确保有标题（如果 AI 没有生成）
    if (!content.startsWith("#") && !content.startsWith("##")) {
      content = `# ${title}\n\n${content}`;
    }

    // 提取标题（如果 AI 生成了不同的标题）
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const finalTitle = titleMatch ? titleMatch[1] : title;

    return {
      title: finalTitle,
      content: content
    };
  }

  /**
   * 执行文章生成
   */
  async execute(params: SkillParams): Promise<SkillResult> {
    // 参数验证
    const validation = this.validateParams(params as ArticleParams);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    const articleParams: ArticleParams = {
      topic: params.topic,
      title: params.title,
      audience: params.audience,
      style: params.style || this.config.defaultStyle,
      length: params.length || this.config.defaultLength,
      generateTitle: params.generateTitle !== false && this.config.autoGenerateTitle,
      titleStyle: params.titleStyle
    };

    // 第一步：获取或生成标题
    const title = await this.getOrGenerateTitle(articleParams);

    // 第二步：生成文章内容
    const prompt = getArticlePrompt({
      topic: articleParams.topic,
      title: title,
      audience: articleParams.audience,
      style: articleParams.style,
      length: articleParams.length
    });

    const result = await withAsyncErrorHandling(async () => {
      return await callAIService(prompt);
    }, "文章生成失败");

    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }

    // 解析文章
    const article = this.parseArticle(result.data!, title);
    const wordCount = countWords(article.content);
    const summary = generateSummary(article.content);

    return {
      success: true,
      data: {
        title: article.title,
        content: article.content,
        wordCount: wordCount,
        summary: summary,
        params: articleParams
      },
      metadata: {
        skill: "yinyarong_article",
        timestamp: new Date().toISOString(),
        dependencies: articleParams.generateTitle && !params.title ? ["yinyarong_title"] : []
      }
    };
  }
}

// 导出单例
export const articleSkill = new ArticleSkill();
