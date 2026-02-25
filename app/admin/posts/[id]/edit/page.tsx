import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "@/components/admin/PostForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) notFound();

  return (
    <PostForm
      mode="edit"
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        cover_image_url: post.cover_image_url,
        category: post.category,
        lang: post.lang,
        published: post.published,
        published_at: post.published_at,
        created_at: post.created_at,
        updated_at: post.updated_at,
      }}
    />
  );
}
