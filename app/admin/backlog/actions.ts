"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BacklogInsert, BacklogUpdate } from "@/types/backlog";

export async function createBacklogItem(data: BacklogInsert) {
  const supabase = await createClient();

  const { error } = await supabase.from("backlog").insert({
    name: data.name,
    difficulty: data.difficulty || null,
    category: data.category || null,
    estimated_time: data.estimated_time ?? null,
    estimated_date: data.estimated_date || null,
    actual_time: data.actual_time ?? null,
    actual_date: data.actual_date || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/backlog");
  revalidatePath("/pl/zadania");
  revalidatePath("/en/zadania");
  return { error: null };
}

export async function updateBacklogItem(id: number, data: BacklogUpdate) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("backlog")
    .update(data)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/backlog");
  revalidatePath("/pl/zadania");
  revalidatePath("/en/zadania");
  return { error: null };
}

export async function deleteBacklogItem(id: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("backlog")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/backlog");
  revalidatePath("/pl/zadania");
  revalidatePath("/en/zadania");
  return { error: null };
}
