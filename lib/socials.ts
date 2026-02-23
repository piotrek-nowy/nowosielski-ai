export const socials = [
  { label: "X", href: "https://x.com/piotrek_nowy" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/piotrnowosielski/" },
  { label: "Instagram", href: "https://www.instagram.com/piotrek_nowy/" },
  { label: "Facebook", href: "https://www.facebook.com/nowosielski.piotr" },
  { label: "Email", href: "mailto:piotr@justjoin.it" },
] as const;

export type SocialKey = (typeof socials)[number]["label"];
