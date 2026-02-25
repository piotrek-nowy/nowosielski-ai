"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Editor } from "@/components/admin/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/slug";
import { createPost, updatePost } from "@/app/admin/posts/actions";
import type { Post } from "@/types/post";
import { ArrowLeft } from "lucide-react";

const CATEGORIES = ["AI", "Bootstrap", "Dziennik", "Random"] as const;

type PostFormProps = {
  mode: "new";
  post?: null;
};

type PostFormPropsEdit = {
  mode: "edit";
  post: Post;
};

export function PostForm(props: PostFormProps | PostFormPropsEdit) {
  const { mode, post } = props;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(mode === "edit" ? post.title : "");
  const [slug, setSlug] = useState(mode === "edit" ? post.slug : "");
  const [content, setContent] = useState(mode === "edit" ? post.content ?? "" : "");
  const [excerpt, setExcerpt] = useState(mode === "edit" ? post.excerpt ?? "" : "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    mode === "edit" ? post.cover_image_url ?? "" : ""
  );
  const [category, setCategory] = useState(
    mode === "edit" ? post.category ?? "" : "Random"
  );
  const [lang, setLang] = useState<"pl" | "en">(
    mode === "edit" ? post.lang : "pl"
  );
  const [error, setError] = useState("");

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (mode === "new") setSlug(slugify(v));
  };

  const submit = (published: boolean) => {
    setError("");
    const payload = {
      title,
      slug: slug || slugify(title),
      content,
      excerpt,
      cover_image_url: coverImageUrl,
      category,
      lang,
      published,
    };

    startTransition(async () => {
      if (mode === "new") {
        const result = await createPost(payload);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.push("/admin");
        router.refresh();
      } else {
        const result = await updatePost(post.id, payload);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.push("/admin");
        router.refresh();
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Panel admina
      </Link>

      <h1 className="text-2xl font-semibold">
        {mode === "new" ? "Nowy post" : "Edycja posta"}
      </h1>

      <form className="mt-8 space-y-6">
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium">Tytuł</label>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Tytuł posta"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Slug</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-slug"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Excerpt</label>
          <Input
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Krótki opis"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Kategoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Język</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "pl" | "en")}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="pl">pl</option>
            <option value="en">en</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Cover image URL
          </label>
          <Input
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Treść</label>
          <Editor content={content} onChange={setContent} />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => submit(false)}
            disabled={pending}
          >
            Zapisz draft
          </Button>
          <Button
            type="button"
            onClick={() => submit(true)}
            disabled={pending}
          >
            Opublikuj
          </Button>
        </div>
      </form>
    </div>
  );
}
