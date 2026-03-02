import "dotenv/config";
import fs from "fs";
import path from "path";
import config, { DocNode } from "../docs.config";

const root = process.cwd();
const basePath = path.join(root, config.basePath || "app");

const DOCUMENTATION_INSTRUCTIONS = `
You are a technical documentation writer for a SaaS product.

Generate clear, user-facing documentation in clean Markdown suitable for MDX.

Use structured headings and step-by-step instructions with bulletpoints when helpful.
Focus on end users, not internal implementation.
Write in a way that is easy to understand for non-technical users.
Use proper Markdown formatting and fenced code blocks when needed.

Output only valid Markdown.
`;

const DOCUMENTATION_INSTRUCTIONS_TEST = `
You are a technical documentation writer for a SaaS product.

Generate a placeholder for docs. Keep it a few lines.
`;

async function callOpenAiApi(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not defined");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      instructions: DOCUMENTATION_INSTRUCTIONS_TEST,
      input: prompt,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  if (!data?.output?.length) {
    throw new Error("API returned no output.");
  }

  const text = data.output?.[0]?.content?.[0]?.text;

  if (!text) {
    throw new Error("Model returned no text output.");
  }

  return text.trim();
}

async function generateContent({
  title,
  description,
  prompt,
  asIndexPage = false,
  existingBody,
}: {
  title: string;
  description?: string;
  prompt: string;
  asIndexPage?: boolean;
  existingBody?: string;
}): Promise<string> {
  const body = existingBody ?? (await callOpenAiApi(prompt));

  return `---
title: ${title}
description: ${description ?? ""}
${asIndexPage ? "asIndexPage: true" : ""}
---

# ${title}

${body.trim()}
`;
}

/**
 * Recursive page generator
 */

type MetaItem = {
  title: string;
  type?: "page"; // only allowed at top level
  items?: Record<string, MetaItem>;
};

type MetaTree = Record<string, MetaItem>;

async function generatePages(
  nodes: Record<string, DocNode>,
  currentPath: string[] = [],
): Promise<MetaTree> {
  const metaTree: MetaTree = {};

  const isTopLevel = currentPath.length === 0;

  for (const [key, node] of Object.entries(nodes)) {
    const newPath = [...currentPath, key];
    const childDir = path.join(basePath, ...newPath);
    const filePath = path.join(childDir, "page.mdx");

    const isIndexPage = !!node.children && currentPath.length > 0;

    try {
      fs.mkdirSync(childDir, { recursive: true });

      let existingBody: string | undefined;

      if (fs.existsSync(filePath)) {
        console.log(`♻️ Updating frontmatter: ${filePath}`);

        const existing = fs.readFileSync(filePath, "utf-8");

        // strip frontmatter safely
        existingBody = existing.replace(/^---[\s\S]*?---/, "").trim();
      }

      const content = await generateContent({
        title: node.title,
        description: node.description,
        prompt: node.prompt,
        asIndexPage: isIndexPage,
        existingBody,
      });

      fs.writeFileSync(filePath, content);

      const metaEntry: MetaItem = {
        title: node.title,
      };

      if (isTopLevel) {
        metaEntry.type = "page";
      }

      if (node.children) {
        const childrenMeta = await generatePages(node.children, newPath);

        if (Object.keys(childrenMeta).length > 0) {
          metaEntry.items = childrenMeta;
        }
      }

      metaTree[key] = metaEntry;
    } catch (error) {
      console.error(`❌ Failed generating "${key}"`);
      console.error(error);
      throw error;
    }
  }

  return metaTree;
}

/**
 * Write single global meta file
 */
function writeGlobalMeta(metaTree: MetaTree) {
  const metaPath = path.join(basePath, "_meta.global.ts");

  const finalMeta: MetaTree = {
    index: { title: "Home", type: "page" },
    ...metaTree,
  };

  const content = `export default ${JSON.stringify(finalMeta, null, 2)};`;

  fs.writeFileSync(metaPath, content);

  console.log(`\n✅ Global meta written to: ${metaPath}`);
}

async function main() {
  console.log("Starting AI documentation generation...\n");

  const metaTree = await generatePages(config.pages);

  writeGlobalMeta(metaTree);

  console.log("\nDocumentation generation complete.");
}

main().catch((err) => {
  console.error("Error during generation:");
  console.error(err);
  process.exit(1);
});
