import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminSignOut } from "./AdminSignOut";
import { PostRowActions } from "./PostRowActions";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, category, lang, published, published_at, created_at, updated_at")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Panel admina</h1>
            <p className="text-sm text-muted-foreground">
              Zalogowano jako {user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/posts/new"
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Nowy post
            </Link>
            <AdminSignOut />
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 font-medium">Tytuł</th>
                <th className="px-4 py-3 font-medium">Kategoria</th>
                <th className="px-4 py-3 font-medium">Język</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {posts?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Brak postów. Utwórz pierwszy.
                  </td>
                </tr>
              ) : (
                posts?.map((post) => (
                  <tr key={post.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.category ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {post.lang}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          post.published
                            ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        }
                      >
                        {post.published ? "Opublikowany" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("pl-PL", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : new Date(post.updated_at).toLocaleDateString("pl-PL", {
                            day: "numeric",
                            month: "short",
                          })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PostRowActions
                        id={post.id}
                        published={post.published}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
