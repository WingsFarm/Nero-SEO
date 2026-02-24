import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contextDir = join(__dirname, "..", "context");

export function registerPrompts(server: McpServer) {
  server.prompt(
    "write-blog-post",
    "Generate a full SEO-optimized blog post using brand voice and SEO rules",
    {
      topic: z.string().describe("The main topic of the blog post"),
      target_keyword: z.string().describe("Primary keyword to target"),
      word_count: z.string().optional().describe("Target word count (default: 1200)"),
      funnel_stage: z.enum(["tofu", "mofu", "bofu"]).optional().describe("Funnel stage: tofu (awareness), mofu (consideration), bofu (decision)"),
    },
    ({ topic, target_keyword, word_count, funnel_stage }) => {
      const brandVoice = readFileSync(join(contextDir, "brand-voice.md"), "utf-8");
      const seoRules = readFileSync(join(contextDir, "seo-rules.md"), "utf-8");

      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `You are an expert SEO content writer for NERO, a premium minimalist men's jewelry brand. Use the following guidelines exactly.

## Brand Voice
${brandVoice}

## SEO Rules
${seoRules}

## Task
Write a full blog post about: **${topic}**
- Primary keyword: ${target_keyword}
- Target word count: ${word_count ?? "1200"} words
- Funnel stage: ${funnel_stage ?? "tofu"}

## Required Output Format
Deliver the post in this exact order:

**Title (H1)** — Hebrew, includes primary keyword, 50–65 characters
**Meta Title** — SEO optimized, includes primary keyword, may include NERO
**Meta Description** — 140–160 characters, Hebrew, clear benefit, encourages click
**URL Slug** — English, lowercase, hyphen-separated, keyword-focused
**Full Article** — Written in Hebrew, structured with H2/H3 headings
**Suggested Internal Links** — natural anchor text suggestions (if applicable)
**Image Prompt** — a short prompt suitable for image generation

Where internal links are appropriate, write: [INTERNAL_LINK: anchor text]`,
          },
        }],
      };
    }
  );
}
