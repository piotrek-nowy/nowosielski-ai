import Image from "next/image";
import { SocialIcons } from "@/components/SocialIcons";
import { Globe } from "lucide-react";
import { WinampPlayer } from "@/components/sections/WinampPlayer";

const websites = [
  { label: "justjoin.it", href: "https://justjoin.it" },
  { label: "rocketjobs.pl", href: "https://rocketjobs.pl" },
  { label: "aulapolska.pl", href: "https://aulapolska.pl" },
];

export function Sidebar() {
  return (
    <div className="flex flex-col items-center gap-6">
      <Image
        src="/piotr.png"
        alt="Piotr Nowosielski"
        width={180}
        height={180}
        className="rounded-2xl"
        priority
      />
      <SocialIcons className="pt-1" />
      <div className="flex flex-col items-center gap-1.5">
        {websites.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />
            {label}
          </a>
        ))}
      </div>
      <WinampPlayer />
    </div>
  );
}
