"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PostUpdate } from "@/types/post";

export async function createPost(formData: {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  category: string;
  lang: "pl" | "en";
  published: boolean;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("posts").insert({
    title: formData.title,
    slug: formData.slug,
    content: formData.content || null,
    excerpt: formData.excerpt || null,
    cover_image_url: formData.cover_image_url || null,
    category: formData.category || null,
    lang: formData.lang,
    published: formData.published,
    published_at: formData.published ? new Date().toISOString() : null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/pl/blog");
  revalidatePath("/en/blog");
  revalidatePath("/pl");
  revalidatePath("/en");
  return { error: null };
}

export async function updatePost(
  id: string,
  formData: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image_url: string;
    category: string;
    lang: "pl" | "en";
    published: boolean;
  }
) {
  const supabase = await createClient();

  const payload: PostUpdate = {
    title: formData.title,
    slug: formData.slug,
    content: formData.content || null,
    excerpt: formData.excerpt || null,
    cover_image_url: formData.cover_image_url || null,
    category: formData.category || null,
    lang: formData.lang,
    published: formData.published,
  };

  if (formData.published) {
    const { data: existing } = await supabase
      .from("posts")
      .select("published_at")
      .eq("id", id)
      .single();
    if (existing && !existing.published_at) {
      payload.published_at = new Date().toISOString();
    }
  } else {
    payload.published_at = null;
  }

  const { error } = await supabase.from("posts").update(payload).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath(`/admin/posts/${id}/edit`);
  revalidatePath("/pl/blog");
  revalidatePath("/en/blog");
  revalidatePath("/pl");
  revalidatePath("/en");
  return { error: null };
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/pl/blog");
  revalidatePath("/en/blog");
  revalidatePath("/pl");
  revalidatePath("/en");
  return { error: null };
}

export async function togglePostPublished(id: string, published: boolean) {
  const supabase = await createClient();
  const payload: PostUpdate = {
    published,
    published_at: published ? new Date().toISOString() : null,
  };
  const { error } = await supabase.from("posts").update(payload).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/pl/blog");
  revalidatePath("/en/blog");
  revalidatePath("/pl");
  revalidatePath("/en");
  return { error: null };
}
