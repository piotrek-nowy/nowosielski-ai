"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { deletePost, togglePostPublished } from "@/app/admin/posts/actions";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type Props = { id: string; published: boolean };

export function PostRowActions({ id, published }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Usunąć ten post?")) return;
    await deletePost(id);
    router.refresh();
  }

  async function handleToggle() {
    await togglePostPublished(id, !published);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/posts/${id}/edit`}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Pencil className="h-3.5 w-3.5" />
          <span className="sr-only">Edytuj</span>
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleToggle}
        title={published ? "Cofnij publikację" : "Opublikuj"}
      >
        {published ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
        <span className="sr-only">
          {published ? "Cofnij publikację" : "Opublikuj"}
        </span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        onClick={handleDelete}
        title="Usuń"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="sr-only">Usuń</span>
      </Button>
    </div>
  );
}
