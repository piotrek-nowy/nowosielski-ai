"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { BacklogItem } from "@/types/backlog";

function minutesToDisplay(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}min`;
}

export function CurrentlyWorkingOn() {
  const t = useTranslations("zadania");
  const [activeItem, setActiveItem] = useState<BacklogItem | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("backlog")
        .select("*")
        .eq("in_progress", true)
        .limit(1);
      if (data && data.length > 0) setActiveItem(data[0]);
    }
    load();
  }, []);

  if (!activeItem) return null;

  return (
    <div className="mt-6 flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-900/15">
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
        className="shrink-0 text-amber-500 animate-[spin_3s_linear_infinite]"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span className="text-sm">
        <span className="font-medium text-amber-600 dark:text-amber-400">
          {t("currentlyWorkingOn")}:
        </span>{" "}
        <span className="font-medium text-foreground">
          {activeItem.name}
        </span>
        {activeItem.actual_time != null && (
          <span className="text-muted-foreground">
            {" "}— {minutesToDisplay(activeItem.actual_time)}
          </span>
        )}
      </span>
    </div>
  );
}
