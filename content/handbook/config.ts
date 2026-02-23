export const handbookChapters = [
  { slug: "introduction", title: "Introduction" },
  { slug: "setup", title: "Setting Up Your Environment" },
  { slug: "first-prompt", title: "Your First Prompt" },
] as const;

export type HandbookChapterSlug = (typeof handbookChapters)[number]["slug"];
