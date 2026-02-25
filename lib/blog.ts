import { createClient } from "@/lib/supabase/server";

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

function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function rowToBlogPost(row: {
  slug: string;
  title: string;
  published_at: string | null;
  category: string | null;
  lang: string;
  excerpt: string | null;
  content: string | null;
}): BlogPost {
  const date = row.published_at ?? "";
  const category = (row.category as BlogCategory) ?? "Random";
  const lang = row.lang === "en" ? "en" : "pl";
  const content = row.content ?? "";
  return {
    slug: row.slug,
    title: row.title,
    date,
    category,
    lang,
    excerpt: row.excerpt ?? "",
    content,
    readingTime: calculateReadingTime(content),
  };
}

export async function getAllPosts(locale?: "pl" | "en"): Promise<BlogPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("slug, title, published_at, category, lang, excerpt, content")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (locale) {
    query = query.eq("lang", locale);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []).map(rowToBlogPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, published_at, category, lang, excerpt, content")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return rowToBlogPost(data);
}

export async function getPostsByCategory(
  category: string,
  locale?: "pl" | "en"
): Promise<BlogPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("slug, title, published_at, category, lang, excerpt, content")
    .eq("published", true)
    .eq("category", category)
    .order("published_at", { ascending: false });

  if (locale) {
    query = query.eq("lang", locale);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []).map(rowToBlogPost);
}

export async function getLatestPosts(
  count: number = 3,
  locale?: "pl" | "en"
): Promise<BlogPost[]> {
  const posts = await getAllPosts(locale);
  return posts.slice(0, count);
}
