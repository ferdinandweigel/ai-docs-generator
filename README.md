# AI Documentation Generator (Next.js + Nextra)

This project automatically generates structured documentation pages for a Next.js (App Router) application using Nextra and AI. Define your documentation structure in `docs.config.ts`, run the generator script, and MDX pages will be created recursively inside `/app`.

---

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/ferdinandweigel/ai-docs-generator.git
cd ai-docs-generator
npm install
```

---

## Environment Configuration

Create a `.env` file in the project root:

```
OPENAI_API_KEY=your_api_key_here
```

If you customize this template and the API key is also used by the Next.js runtime, use `.env.local` instead.

Ensure your generator script loads environment variables (for example by importing `dotenv/config`).

---

## Create `docs.config.ts`

Create a `docs.config.ts` file in the project root:

```ts
export type DocNode = {
  title: string
  description?: string
  prompt: string
  children?: Record<string, DocNode>
}

const config = {
  basePath: "app",
  pages: {
    "getting-started": {
      title: "Getting Started",
      description: "Introduction and setup guide.",
      prompt: `
Explain how to get started with the platform.
Include installation and first steps.
      `
    },
    guides: {
      title: "Guides",
      description: "Feature deep dives.",
      prompt: `
Provide an overview of advanced guides.
      `,
      children: {
        campaigns: {
          title: "Campaigns",
          description: "Campaign lifecycle and automation.",
          prompt: `
Explain campaign creation, audience selection, and scheduling.
          `
        }
      }
    }
  }
}

export default config;
```

---

## Generate Documentation

Run the generator script:

```bash
npm run docs:generate
```

The script will:

- Recursively create folders inside `/app`
- Generate page content by sending the defined prompts to the OpenAI API
- Create `page.mdx` files automatically using the AI-generated content
- Skip files that already exist

---

## Result

Your documentation structure inside `/app` will mirror `docs.config.ts`, and Nextra will automatically render the generated MDX pages.