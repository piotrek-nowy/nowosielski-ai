"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BacklogItem, BacklogDifficulty } from "@/types/backlog";

const DIFFICULTY_LABELS_PL: Record<BacklogDifficulty, string> = {
  easy: "Łatwy",
  medium: "Średni",
  hard: "Trudny",
  killer: "Killer",
};

const DIFFICULTY_LABELS_EN: Record<BacklogDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  killer: "Killer",
};

const DIFFICULTY_COLORS: Record<BacklogDifficulty, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  hard: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  killer: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const DIFFICULTY_ORDER: Record<BacklogDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  killer: 4,
};

type SortField =
  | "difficulty"
  | "estimated_time"
  | "created_at"
  | "estimated_date"
  | "actual_date";
type SortDir = "asc" | "desc";

function minutesToDisplay(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}min`;
}

export default function ZadaniaPage() {
  const t = useTranslations("zadania");
  const tNav = useTranslations("nav");
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Detect locale from nav translation (simple heuristic)
  const locale = tNav("home") === "Start" ? "pl" : "en";
  const diffLabels = locale === "pl" ? DIFFICULTY_LABELS_PL : DIFFICULTY_LABELS_EN;

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("backlog")
        .select("*")
        .order("created_at", { ascending: false });
      setItems(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

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

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subheading")}</p>
      </div>

      {loading ? (
        <p className="mt-10 text-muted-foreground">{t("loading")}</p>
      ) : sortedItems.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="mt-10 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-3 text-xs font-medium whitespace-nowrap">{t("colNr")}</th>
                <th className="px-3 py-3 text-xs font-medium w-12 whitespace-nowrap">{t("colDone")}</th>
                <th
                  className="px-3 py-3 text-xs font-medium cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                  onClick={() => toggleSort("created_at")}
                >
                  {t("colDate")}{sortIndicator("created_at")}
                </th>
                <th className="px-3 py-3 text-xs font-medium whitespace-nowrap">{t("colName")}</th>
                <th
                  className="px-3 py-3 text-xs font-medium cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                  onClick={() => toggleSort("difficulty")}
                >
                  {t("colDifficulty")}{sortIndicator("difficulty")}
                </th>
                <th className="px-3 py-3 text-xs font-medium whitespace-nowrap">{t("colCategory")}</th>
                <th
                  className="px-3 py-3 text-xs font-medium cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                  onClick={() => toggleSort("estimated_time")}
                >
                  {t("colEstTime")}{sortIndicator("estimated_time")}
                </th>
                <th
                  className="px-3 py-3 text-xs font-medium cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                  onClick={() => toggleSort("estimated_date")}
                >
                  {t("colEstDate")}{sortIndicator("estimated_date")}
                </th>
                <th className="px-3 py-3 text-xs font-medium whitespace-nowrap">{t("colActTime")}</th>
                <th
                  className="px-3 py-3 text-xs font-medium cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                  onClick={() => toggleSort("actual_date")}
                >
                  {t("colActDate")}{sortIndicator("actual_date")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-border/60 hover:bg-muted/30 ${item.done ? "opacity-50" : ""}`}
                >
                  <td className="px-3 py-3 text-muted-foreground tabular-nums">
                    {item.id}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {item.done ? (
                      <span className="text-gray-500" title={t("colDone")}>
                        ✔️
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground text-xs tabular-nums">
                    {new Date(item.created_at).toLocaleDateString(
                      locale === "pl" ? "pl-PL" : "en-US",
                      { day: "2-digit", month: "2-digit", year: "numeric" }
                    )}
                  </td>
                  <td className="px-3 py-3 font-medium">
                    {item.name || "—"}
                  </td>
                  <td className="px-3 py-3">
                    {item.difficulty ? (
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${DIFFICULTY_COLORS[item.difficulty]}`}
                      >
                        {diffLabels[item.difficulty]}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {item.category ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-xs tabular-nums">
                    {minutesToDisplay(item.estimated_time)}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                    {item.estimated_date
                      ? new Date(item.estimated_date + "T00:00:00").toLocaleDateString(
                          locale === "pl" ? "pl-PL" : "en-US",
                          { day: "2-digit", month: "2-digit", year: "numeric" }
                        )
                      : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs tabular-nums">
                    {minutesToDisplay(item.actual_time)}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                    {item.actual_date
                      ? new Date(item.actual_date + "T00:00:00").toLocaleDateString(
                          locale === "pl" ? "pl-PL" : "en-US",
                          { day: "2-digit", month: "2-digit", year: "numeric" }
                        )
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        {t("totalTasks")}: <strong>{items.length}</strong>
      </p>
    </section>
  );
}
