import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Replace with your preferred image generation API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export function registerGenerateImageTool(server: McpServer) {
  server.tool(
    "generate_image",
    "Generate a blog post image using DALL-E and return the URL with SEO-ready alt text",
    {
      topic: z.string().describe("Blog post topic — used to craft the image prompt"),
      style: z.enum(["realistic", "illustration", "minimal", "infographic"]).optional().default("illustration"),
      alt_text: z.string().optional().describe("Custom alt text. If omitted, one is generated from the topic."),
    },
    async ({ topic, style, alt_text }) => {
      if (!OPENAI_API_KEY) {
        return {
          content: [{
            type: "text",
            text: "Error: OPENAI_API_KEY environment variable is not set. Add it to your environment to use image generation.",
          }],
          isError: true,
        };
      }

      const imagePrompt = `${style} style blog header image about: ${topic}. Clean, professional, suitable for a blog post.`;
      const finalAltText = alt_text ?? `${topic} — blog post illustration`;

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1792x1024",
          quality: "standard",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          content: [{ type: "text", text: `Image generation failed: ${error}` }],
          isError: true,
        };
      }

      const data = await response.json() as { data: { url: string }[] };
      const imageUrl = data.data[0].url;

      return {
        content: [{
          type: "text",
          text: `## Generated Image\n\n**URL:** ${imageUrl}\n**Alt text:** ${finalAltText}\n**Prompt used:** ${imagePrompt}\n\n> Note: DALL-E URLs expire after 1 hour. Download and host the image on your own CDN.`,
        }],
      };
    }
  );
}
