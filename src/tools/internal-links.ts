import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contextDir = join(__dirname, "..", "..", "context");

type EntryType = "post" | "collection" | "product";

interface IndexEntry {
  title: string;
  slug: string;
  type?: EntryType;
  main_keyword?: string;
  topics: string[];
  summary: string;
}

interface ScoredEntry {
  entry: IndexEntry;
  type: EntryType;
  score: number;
}

function loadIndex(filename: string, fallbackType: EntryType): IndexEntry[] {
  try {
    const raw = readFileSync(join(contextDir, filename), "utf-8");
    const entries: IndexEntry[] = JSON.parse(raw);
    return entries.map(e => ({ ...e, type: e.type ?? fallbackType }));
  } catch {
    return [];
  }
}

function scoreRelevance(entry: IndexEntry, topic: string, keywords: string[]): number {
  const needles = [topic, ...keywords].map(k => k.toLowerCase());
  let score = 0;

  for (const kw of needles) {
    if (entry.title.toLowerCase().includes(kw)) score += 3;
    if (entry.main_keyword?.toLowerCase().includes(kw)) score += 3;
    if (entry.topics.some(t => t.toLowerCase().includes(kw))) score += 2;
    if (entry.summary.toLowerCase().includes(kw)) score += 1;
  }

  return score;
}

function typeLabel(type: EntryType): string {
  return { post: "פוסט", collection: "קולקציה", product: "מוצר" }[type];
}

export function registerInternalLinksTool(server: McpServer) {
  server.tool(
    "suggest_internal_links",
    "Suggest relevant internal links from posts, collections, and products based on topic and keywords",
    {
      topic: z.string().describe("Topic of the current post being written"),
      keywords: z.array(z.string()).describe("Keywords in the current post"),
      max_links: z.number().optional().default(6).describe("Maximum total suggestions to return"),
      types: z.array(z.enum(["post", "collection", "product"])).optional()
        .describe("Filter by entry type. Omit to include all types."),
    },
    async ({ topic, keywords, max_links, types }) => {
      const posts = loadIndex("posts-index.json", "post");
      const collections = loadIndex("collections-index.json", "collection");
      const products = loadIndex("products-index.json", "product");

      const all: ScoredEntry[] = [...posts, ...collections, ...products]
        .filter(e => !types || types.includes((e.type ?? "post") as EntryType))
        .map(entry => ({
          entry,
          type: (entry.type ?? "post") as EntryType,
          score: scoreRelevance(entry, topic, keywords),
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, max_links);

      if (all.length === 0) {
        return {
          content: [{
            type: "text",
            text: "לא נמצאו לינקים פנימיים רלוונטיים לנושא זה. הוסף עוד פוסטים, קולקציות או מוצרים לאינדקסים.",
          }],
        };
      }

      // Group by type for readable output
      const grouped: Record<EntryType, ScoredEntry[]> = { post: [], collection: [], product: [] };
      for (const item of all) grouped[item.type].push(item);

      const sections: string[] = [];

      for (const type of ["collection", "product", "post"] as EntryType[]) {
        if (grouped[type].length === 0) continue;
        const label = typeLabel(type);
        const lines = grouped[type].map(({ entry, score }) =>
          `- [${entry.title}](${entry.slug}) — ${entry.summary}\n  ציון רלוונטיות: ${score}`
        ).join("\n\n");
        sections.push(`### ${label}ות\n\n${lines}`);
      }

      return {
        content: [{
          type: "text",
          text: `## הצעות לינקים פנימיים\n\n${sections.join("\n\n")}\n\n---\nהשתמש ב-anchor text טבעי כשמזכירים את הנושא במאמר.`,
        }],
      };
    }
  );
}
