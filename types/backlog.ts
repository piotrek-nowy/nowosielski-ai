export type BacklogDifficulty = "easy" | "medium" | "hard" | "killer";

export type BacklogCategory = "random" | "fun" | "AI" | "praca" | "edukacja";

export type BacklogItem = {
  id: number;
  created_at: string;
  name: string;
  difficulty: BacklogDifficulty | null;
  category: BacklogCategory | null;
  estimated_time: number | null;
  estimated_date: string | null;
  actual_time: number | null;
  actual_date: string | null;
  done: boolean;
};

export type BacklogInsert = Omit<BacklogItem, "id" | "created_at">;

export type BacklogUpdate = Partial<BacklogInsert>;
