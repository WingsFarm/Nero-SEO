import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contextDir = join(__dirname, "..", "..", "context");

export function registerWritePostTool(server: McpServer) {
  server.tool(
    "write_post",
    "Generate an SEO-optimized blog post outline and draft",
    {
      topic: z.string().describe("Main topic of the blog post"),
      target_keyword: z.string().describe("Primary keyword to target"),
      word_count: z.number().optional().default(1200).describe("Target word count"),
      funnel_stage: z.enum(["tofu", "mofu", "bofu"]).optional().default("tofu"),
      secondary_keywords: z.array(z.string()).optional().describe("Additional keywords to include"),
    },
    async ({ topic, target_keyword, word_count, funnel_stage, secondary_keywords }) => {
      const brandVoice = readFileSync(join(contextDir, "brand-voice.md"), "utf-8");
      const seoRules = readFileSync(join(contextDir, "seo-rules.md"), "utf-8");

      const secondaryKwText = secondary_keywords?.length
        ? `Secondary keywords: ${secondary_keywords.join(", ")}`
        : "";

      return {
        content: [{
          type: "text",
          text: `## NERO Blog Post Brief

**Topic:** ${topic}
**Primary Keyword:** ${target_keyword}
${secondaryKwText}
**Word Count:** ${word_count}
**Funnel Stage:** ${funnel_stage}

---

## Brand Voice
${brandVoice}

## SEO Rules
${seoRules}

---

## Required Output Format

Deliver the post in this exact order:

1. **Title (H1)** — Hebrew, includes primary keyword, 50–65 characters
2. **Meta Title** — SEO optimized, includes primary keyword, may include NERO
3. **Meta Description** — 140–160 characters, Hebrew, clear benefit, encourages click
4. **URL Slug** — English, lowercase, hyphen-separated, keyword-focused
5. **Full Article** — Written in Hebrew, structured with H2/H3 headings
6. **Suggested Internal Links** — natural anchor text suggestions (if applicable)
7. **Image Prompt** — a short prompt suitable for DALL-E or similar. Images must be saved to context/posts/{slug}/images/, not to the top-level context/images/ directory.

Where internal links are appropriate, write: [INTERNAL_LINK: anchor text]`,
        }],
      };
    }
  );
}
