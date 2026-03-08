#!/usr/bin/env node
/**
 * yinyarong-skills MCP Server
 * 印亚荣风格公众号文章生成技能集
 */

import { main } from "./index.js";

main().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
