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

1. **Title** — Hebrew, includes primary keyword, 50–65 characters (this becomes the Shopify post title — do NOT add an H1 tag in the HTML)
2. **Meta Title** — SEO optimized, includes primary keyword, may include NERO
3. **Meta Description** — 140–160 characters, Hebrew, clear benefit, encourages click
4. **URL Slug** — English, lowercase, hyphen-separated, keyword-focused
5. **Full Article** — Written in Hebrew, inline styles required (Shopify-compatible). **Do NOT include an `<h1>` tag — Shopify renders the post title as H1 automatically. Start the HTML content with the first `<p>` or `<h2>`.**
6. **Suggested Internal Links** — natural anchor text suggestions (if applicable)
7. **Image Prompt** — a short prompt suitable for DALL-E or similar. Images must be saved to context/posts/{slug}/images/, not to the top-level context/images/ directory.

Where internal links are appropriate, use proper anchor tags with target="_blank" rel="noopener noreferrer" so links open in a new tab. Example: <a href="/blogs/news/slug" target="_blank" rel="noopener noreferrer" style="color:#0d0d0d; font-weight:600; text-decoration:underline; text-underline-offset:3px;">anchor text</a>

**Link distribution rule:** Of the 2–4 internal links per post, follow this split:
- 50–60% → other blog posts (build topic authority)
- 20–30% → product pages (help with conversions)
- 10–20% → collection pages (category keywords, broader ranking)`,
        }],
      };
    }
  );
}
