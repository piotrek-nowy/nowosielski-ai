import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "@/components/admin/PostForm";

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return <PostForm mode="new" />;
}
