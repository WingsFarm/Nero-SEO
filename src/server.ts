import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerWritePostTool } from "./tools/write-post.js";
import { registerInternalLinksTool } from "./tools/internal-links.js";
import { registerGenerateImageTool } from "./tools/generate-image.js";
import { registerResources } from "./resources.js";
import { registerPrompts } from "./prompts.js";

const server = new McpServer({
  name: "seo-mcp",
  version: "1.0.0",
});

registerResources(server);
registerPrompts(server);
registerWritePostTool(server);
registerInternalLinksTool(server);
registerGenerateImageTool(server);

const transport = new StdioServerTransport();
await server.connect(transport);
