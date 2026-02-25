export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[ąćęłńóśźż]/g, (c) => {
      const map: Record<string, string> = {
        ą: "a", ć: "c", ę: "e", ł: "l", ń: "n",
        ó: "o", ś: "s", ź: "z", ż: "z",
      };
      return map[c] ?? c;
    })
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "post";
}
