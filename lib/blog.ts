import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogCategory = "AI" | "Bootstrap" | "Dziennik" | "Random";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: BlogCategory;
  lang: "pl" | "en";
  excerpt: string;
  content: string;
  readingTime: number;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const filePath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
      slug: data.slug ?? filename.replace(/\.mdx$/, ""),
      title: data.title ?? "Untitled",
      date: data.date ?? "1970-01-01",
      category: data.category ?? "Random",
      lang: data.lang ?? "en",
      excerpt: data.excerpt ?? "",
      content,
      readingTime: calculateReadingTime(content),
    } as BlogPost;
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getLatestPosts(count: number = 3): BlogPost[] {
  return getAllPosts().slice(0, count);
}
