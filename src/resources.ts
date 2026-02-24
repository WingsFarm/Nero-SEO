import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contextDir = join(__dirname, "..", "context");

export function registerResources(server: McpServer) {
  // Brand voice guidelines
  server.resource(
    "brand-voice",
    "context://brand-voice",
    async () => ({
      contents: [{
        uri: "context://brand-voice",
        mimeType: "text/markdown",
        text: readFileSync(join(contextDir, "brand-voice.md"), "utf-8"),
      }],
    })
  );

  // SEO writing rules
  server.resource(
    "seo-rules",
    "context://seo-rules",
    async () => ({
      contents: [{
        uri: "context://seo-rules",
        mimeType: "text/markdown",
        text: readFileSync(join(contextDir, "seo-rules.md"), "utf-8"),
      }],
    })
  );

  // Posts index for internal linking
  server.resource(
    "posts-index",
    "context://posts-index",
    async () => ({
      contents: [{
        uri: "context://posts-index",
        mimeType: "application/json",
        text: readFileSync(join(contextDir, "posts-index.json"), "utf-8"),
      }],
    })
  );

  // Image generation guidelines
  server.resource(
    "image-guidelines",
    "context://image-guidelines",
    async () => ({
      contents: [{
        uri: "context://image-guidelines",
        mimeType: "text/markdown",
        text: readFileSync(join(contextDir, "image-guidelines.md"), "utf-8"),
      }],
    })
  );

  // Products index for internal linking
  server.resource(
    "products-index",
    "context://products-index",
    async () => ({
      contents: [{
        uri: "context://products-index",
        mimeType: "application/json",
        text: readFileSync(join(contextDir, "products-index.json"), "utf-8"),
      }],
    })
  );
}
