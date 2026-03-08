/**
 * 统一的 Skill 接口定义
 */

/**
 * Skill 执行结果
 */
export interface SkillResult {
  /** 是否成功 */
  success: boolean;
  /** 返回的数据 */
  data?: any;
  /** 错误信息 */
  error?: string;
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * Skill 参数基类
 */
export interface SkillParams {
  [key: string]: any;
}

/**
 * Skill 定义接口
 */
export interface SkillDefinition {
  /** Skill 名称 */
  name: string;
  /** Skill 描述 */
  description: string;
  /** 输入参数 Schema (JSON Schema 格式) */
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Skill 接口
 */
export interface Skill {
  /** 获取 Skill 定义 */
  getDefinition(): SkillDefinition;
  /** 执行 Skill */
  execute(params: SkillParams): Promise<SkillResult>;
}

/**
 * 标题生成参数
 */
export interface TitleParams {
  /** 文章主题或内容概要 */
  topic: string;
  /** 目标受众 */
  audience?: string;
  /** 风格偏好 */
  style?: "emotional" | "rational" | "story" | "practical";
  /** 生成数量 */
  count?: number;
}

/**
 * 文章生成参数
 */
export interface ArticleParams {
  /** 文章主题 */
  topic: string;
  /** 自定义标题（可选，不传则自动生成） */
  title?: string;
  /** 目标受众 */
  audience?: string;
  /** 文章风格 */
  style?: "humorous" | "professional" | "storytelling" | "tutorial";
  /** 文章长度 */
  length?: "short" | "medium" | "long";
  /** 是否需要生成标题 */
  generateTitle?: boolean;
  /** 标题风格（用于生成标题） */
  titleStyle?: TitleParams["style"];
}

/**
 * 生成的标题结果
 */
export interface TitleResult {
  titles: string[];
  selected?: string;
  reasoning?: string;
}

/**
 * 生成的文章结果
 */
export interface ArticleResult {
  title: string;
  content: string;
  summary?: string;
  wordCount?: number;
}
