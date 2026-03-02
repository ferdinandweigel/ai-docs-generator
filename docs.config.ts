export type DocNode = {
  title: string;
  description?: string;
  prompt: string;
  children?: Record<string, DocNode>;
};

const config = {
  basePath: "app",
  pages: {
    "getting-started": {
      title: "Getting Started",
      description: "Introduction and setup guide.",
      prompt: `
Explain how to get started with the platform.
Include installation and first steps.
      `,
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
          `,
          children: {
            create: {
              title: "Create a Campaign",
              description: "Step-by-step campaign creation.",
              prompt: "Step-by-step campaign creation.",
            },
            editor: {
              title: "Campaign Editor",
              description: "Visual sequence builder.",
              prompt: "Visual sequence builder.",
            },
          },
          abc: {
            title: "ABC",
            description: "Campaign lifecycle and automation.",
            prompt: `
Explain campaign creation, audience selection, and scheduling.
          `,
          },
        },
      },
    },
  },
};

export default config;
