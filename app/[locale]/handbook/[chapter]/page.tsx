import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HandbookSidebar } from "@/components/sections/HandbookSidebar";
import {
  handbookChapters,
  type HandbookChapterSlug,
} from "@/content/handbook/config";

type Props = {
  params: Promise<{ locale: string; chapter: string }>;
};

const chapterContent: Record<
  HandbookChapterSlug,
  { title: string; content: string }
> = {
  introduction: {
    title: "Introduction",
    content: `Welcome to the Vibe Coding Handbook. This guide will walk you through building with AI from zero — no prior experience required.

We'll cover environment setup, effective prompting, and iterative development. Each chapter includes practical examples you can try yourself.`,
  },
  setup: {
    title: "Setting Up Your Environment",
    content: `Before you start, you'll need a few tools:

1. **A code editor** — VS Code or Cursor are great choices.
2. **An AI assistant** — Cursor, GitHub Copilot, or Claude in your workflow.
3. **A terminal** — you'll run commands and see output here.

Once these are in place, you're ready for your first prompt.`,
  },
  "first-prompt": {
    title: "Your First Prompt",
    content: `A good prompt is clear and specific. Instead of "make a button", try "Add a primary button that says Submit, placed at the bottom of the form."

Start small: describe what you want in one or two sentences. You can refine with follow-up messages. We'll go deeper into prompt patterns in later chapters.`,
  },
};

export default async function HandbookChapterPage({ params }: Props) {
  const { locale, chapter } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("handbook");

  const slug = chapter as HandbookChapterSlug;
  const validSlugs = handbookChapters.map((c) => c.slug);
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  const { title, content } = chapterContent[slug];

  return (
    <div className="mx-auto flex max-w-6xl gap-12 px-4 py-12 sm:px-6">
      <HandbookSidebar />
      <article className="min-w-0 flex-1">
        <Link
          href="/handbook"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t("back")}
        </Link>
        <h1 className="font-mono text-2xl font-semibold text-foreground sm:text-3xl">
          {title}
        </h1>
        <div className="prose prose-invert mt-8 max-w-none">
          {content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

export function generateStaticParams() {
  return handbookChapters.map(({ slug }) => ({ chapter: slug }));
}
