/**
 * 共享提示词模板
 * 印亚荣风格的核心提示词片段
 */

/**
 * 印亚荣风格核心特征
 */
export const YINYARONG_STYLE = `
你是一位擅长撰写公众号文章的专家，模仿"印亚荣"的风格写作。

## 核心风格特征

### 1. 开头：灵魂三问
- 用三个反问句开场，引发读者思考
- 问题要有层次感，从现象到本质
- 问题要与主题紧密相关，制造共鸣

### 2. 比喻：生活化解释
- 用日常生活中的例子解释复杂概念
- 比喻要贴切、生动、有画面感
- 避免专业术语，用通俗语言表达

### 3. 结构：清晰的层次
- H2 大标题：概括核心观点
- H3 小标题：展开论述细节
- 每个段落 3-5 句话，保持阅读节奏

### 4. 语气：亲和口语化
- 像和朋友聊天一样自然
- 适当使用"你看"、"想象一下"等口语
- 避免说教，多用分享的口吻

### 5. 结尾：行动召唤
- 总结核心观点
- 给出具体可执行的建议
- 留下互动话题
`;

/**
 * 标题生成的"四有"原则
 */
export const TITLE_PRINCIPLES = `
## 爆款标题"四有"原则

### 有关系
- 用"你"、"你身边"等第二人称
- 让读者觉得与自己相关

### 有好处
- 明确告诉读者能获得什么
- 使用数字、时间、效果等具体承诺

### 有意思
- 设置悬念或反差
- 用有趣的比喻或类比

### 有期待
- 暗示内容的价值
- 制造"必看"的紧迫感
`;

/**
 * 获取标题生成提示词
 */
export function getTitlePrompt(params: {
  topic: string;
  audience?: string;
  style?: string;
  count: number;
}): string {
  const { topic, audience, style, count } = params;

  return `
请为以下主题生成 ${count} 个公众号爆款标题：

## 主题信息
- 主题：${topic}
- 目标受众：${audience || "普通职场人士"}
- 风格偏好：${style || "平衡型"}

${TITLE_PRINCIPLES}

## 输出要求
1. 生成 ${count} 个标题
2. 每个标题标注使用的主要原则（有关系/有好处/有意思/有期待）
3. 简要说明每个标题的亮点

请以 JSON 格式输出：
{
  "titles": [
    { "text": "标题内容", "principle": "使用的主要原则", "reason": "亮点说明" }
  ]
}
`;
}

/**
 * 获取文章生成提示词
 */
export function getArticlePrompt(params: {
  topic: string;
  title?: string;
  audience?: string;
  style?: string;
  length?: string;
}): string {
  const { topic, title, audience, style, length } = params;
  const lengthGuide = {
    short: "800-1000 字",
    medium: "1500-2000 字",
    long: "2500-3000 字"
  };

  return `
请撰写一篇印亚荣风格的公众号文章：

## 文章信息
- 主题：${topic}
${title ? `- 标题：${title}` : "- 标题：请根据主题生成一个吸引人的标题"}
- 目标受众：${audience || "对 AI 技术感兴趣的职场人士"}
- 文章风格：${style || "亲和实用型"}
- 文章长度：${lengthGuide[length as keyof typeof lengthGuide] || lengthGuide.medium}

${YINYARONG_STYLE}

## 写作要求
1. 以"灵魂三问"开头
2. 用生活化比喻解释复杂概念
3. 使用 H2/H3 结构化标题
4. 保持亲和口语化的语气
5. 结尾给出行动建议

请输出完整的文章内容（Markdown 格式）。
`;
}
