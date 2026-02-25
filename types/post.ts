export type PostLang = "pl" | "en";

export type PostCategory = "AI" | "Bootstrap" | "Dziennik" | "Random";

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  lang: PostLang;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostInsert = Omit<Post, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PostUpdate = Partial<
  Omit<Post, "id" | "created_at" | "updated_at">
>;
