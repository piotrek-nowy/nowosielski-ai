"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createBacklogItem,
  updateBacklogItem,
  deleteBacklogItem,
} from "./actions";
import type {
  BacklogItem,
  BacklogDifficulty,
  BacklogCategory,
} from "@/types/backlog";
import Link from "next/link";

const DIFFICULTIES: BacklogDifficulty[] = ["easy", "medium", "hard", "killer"];
const CATEGORIES: BacklogCategory[] = ["random", "fun", "AI", "praca", "edukacja"];

const DIFFICULTY_LABELS: Record<BacklogDifficulty, string> = {
  easy: "Łatwy",
  medium: "Średni",
  hard: "Trudny",
  killer: "Killer",
};

const DIFFICULTY_COLORS: Record<BacklogDifficulty, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  hard: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  killer: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

type SortField =
  | "difficulty"
  | "estimated_time"
  | "created_at"
  | "estimated_date"
  | "actual_date";
type SortDir = "asc" | "desc";

const DIFFICULTY_ORDER: Record<BacklogDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  killer: 4,
};

function minutesToDisplay(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}min`;
}

function minutesToTimeInput(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeInputToMinutes(value: string): number | null {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (m > 59 || (h === 0 && m === 0)) return null;
  return h * 60 + m;
}

function formatTimeMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, digits.length - 2)}:${digits.slice(-2)}`;
}

export default function AdminBacklogPage() {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});

  const fetchItems = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("backlog")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const sortedItems = (() => {
    if (!sortField) return items;
    return [...items].sort((a, b) => {
      let cmp = 0;
      if (sortField === "difficulty") {
        const aVal = a.difficulty ? DIFFICULTY_ORDER[a.difficulty] : 99;
        const bVal = b.difficulty ? DIFFICULTY_ORDER[b.difficulty] : 99;
        cmp = aVal - bVal;
      } else if (sortField === "estimated_time") {
        cmp = (a.estimated_time ?? 99999) - (b.estimated_time ?? 99999);
      } else if (sortField === "created_at") {
        cmp =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === "estimated_date") {
        const aVal = a.estimated_date
          ? new Date(a.estimated_date + "T00:00:00").getTime()
          : Infinity;
        const bVal = b.estimated_date
          ? new Date(b.estimated_date + "T00:00:00").getTime()
          : Infinity;
        cmp = aVal - bVal;
      } else if (sortField === "actual_date") {
        const aVal = a.actual_date
          ? new Date(a.actual_date + "T00:00:00").getTime()
          : Infinity;
        const bVal = b.actual_date
          ? new Date(b.actual_date + "T00:00:00").getTime()
          : Infinity;
        cmp = aVal - bVal;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  })();

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  async function handleAddItem() {
    const result = await createBacklogItem({
      name: "",
      difficulty: null,
      category: null,
      estimated_time: null,
      estimated_date: null,
      actual_time: null,
      actual_date: null,
      done: false,
    });
    if (!result.error) fetchItems();
  }

  async function handleDelete(id: number) {
    if (!confirm("Czy na pewno chcesz usunąć to zadanie?")) return;
    const result = await deleteBacklogItem(id);
    if (!result.error) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  }

  function handleFieldChange(
    id: number,
    field: keyof BacklogItem,
    value: string | number | boolean | null
  ) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
    }
    debounceTimers.current[id] = setTimeout(() => {
      saveItem(id, field, value);
    }, 600);
  }

  async function saveItem(
    id: number,
    field: keyof BacklogItem,
    value: string | number | boolean | null
  ) {
    setSaving((prev) => ({ ...prev, [id]: true }));
    await updateBacklogItem(id, { [field]: value });
    setSaving((prev) => ({ ...prev, [id]: false }));
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Backlog</h1>
            <p className="text-sm text-muted-foreground">
              Zarządzaj zadaniami
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
            >
              ← Posty
            </Link>
            <button
              onClick={handleAddItem}
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Dodaj zadanie
            </button>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-3 font-medium w-12">Nr</th>
                <th className="px-3 py-3 font-medium w-12">Done</th>
                <th
                  className="px-3 py-3 font-medium w-28 cursor-pointer select-none hover:text-foreground"
                  onClick={() => toggleSort("created_at")}
                >
                  Data dodania{sortIndicator("created_at")}
                </th>
                <th className="px-3 py-3 font-medium min-w-[200px]">Nazwa zadania</th>
                <th
                  className="px-3 py-3 font-medium w-32 cursor-pointer select-none hover:text-foreground"
                  onClick={() => toggleSort("difficulty")}
                >
                  Trudność{sortIndicator("difficulty")}
                </th>
                <th className="px-3 py-3 font-medium w-28">Kategoria</th>
                <th
                  className="px-3 py-3 font-medium w-28 cursor-pointer select-none hover:text-foreground"
                  onClick={() => toggleSort("estimated_time")}
                >
                  Est. czas{sortIndicator("estimated_time")}
                </th>
                <th
                  className="px-3 py-3 font-medium w-32 cursor-pointer select-none hover:text-foreground"
                  onClick={() => toggleSort("estimated_date")}
                >
                  Est. data{sortIndicator("estimated_date")}
                </th>
                <th className="px-3 py-3 font-medium w-28">Fakt. czas</th>
                <th
                  className="px-3 py-3 font-medium w-32 cursor-pointer select-none hover:text-foreground"
                  onClick={() => toggleSort("actual_date")}
                >
                  Fakt. data{sortIndicator("actual_date")}
                </th>
                <th className="px-3 py-3 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Brak zadań. Dodaj pierwsze.
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/60 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2 text-muted-foreground tabular-nums">
                      {item.id}
                      {saving[item.id] && (
                        <span className="ml-1 text-xs text-blue-500">●</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={item.done ?? false}
                        onChange={async () => {
                          const next = !(item.done ?? false);
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id ? { ...i, done: next } : i
                            )
                          );
                          await saveItem(item.id, "done", next);
                        }}
                        className="h-4 w-4 rounded border-border"
                      />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs tabular-nums">
                      {new Date(item.created_at).toLocaleDateString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm hover:border-border focus:border-border focus:outline-none focus:ring-1 focus:ring-ring"
                        value={item.name}
                        placeholder="Nazwa zadania..."
                        onChange={(e) =>
                          handleFieldChange(item.id, "name", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-sm hover:border-border focus:border-border focus:outline-none"
                        value={item.difficulty ?? ""}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            "difficulty",
                            e.target.value || null
                          )
                        }
                      >
                        <option value="">—</option>
                        {DIFFICULTIES.map((d) => (
                          <option key={d} value={d}>
                            {DIFFICULTY_LABELS[d]}
                          </option>
                        ))}
                      </select>
                      {item.difficulty && (
                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${DIFFICULTY_COLORS[item.difficulty]}`}
                        >
                          {DIFFICULTY_LABELS[item.difficulty]}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-sm hover:border-border focus:border-border focus:outline-none"
                        value={item.category ?? ""}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            "category",
                            e.target.value || null
                          )
                        }
                      >
                        <option value="">—</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <TimeInput
                        value={item.estimated_time}
                        onChange={(minutes) =>
                          handleFieldChange(item.id, "estimated_time", minutes)
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-sm hover:border-border focus:border-border focus:outline-none"
                        value={item.estimated_date ?? ""}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            "estimated_date",
                            e.target.value || null
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <TimeInput
                        value={item.actual_time}
                        onChange={(minutes) =>
                          handleFieldChange(item.id, "actual_time", minutes)
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-sm hover:border-border focus:border-border focus:outline-none"
                        value={item.actual_date ?? ""}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            "actual_date",
                            e.target.value || null
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        title="Usuń"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {sortedItems.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            {sortedItems.length} zadań · Zmiany zapisują się automatycznie
          </p>
        )}
      </div>
    </div>
  );
}

function TimeInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (minutes: number | null) => void;
}) {
  const [rawValue, setRawValue] = useState(minutesToTimeInput(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setRawValue(minutesToTimeInput(value));
    }
  }, [value, focused]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatTimeMask(e.target.value);
    setRawValue(formatted);
  }

  function handleBlur() {
    setFocused(false);
    const minutes = timeInputToMinutes(rawValue);
    if (rawValue && minutes === null) {
      setRawValue(minutesToTimeInput(value));
      return;
    }
    onChange(minutes);
  }

  return (
    <div>
      <input
        type="text"
        className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-sm tabular-nums hover:border-border focus:border-border focus:outline-none"
        placeholder="HH:MM"
        value={focused ? rawValue : minutesToTimeInput(value)}
        onChange={handleChange}
        onFocus={() => {
          setFocused(true);
          setRawValue(minutesToTimeInput(value));
        }}
        onBlur={handleBlur}
      />
      {value !== null && value !== undefined && !focused && (
        <span className="text-xs text-muted-foreground">
          {minutesToDisplay(value)}
        </span>
      )}
    </div>
  );
}
