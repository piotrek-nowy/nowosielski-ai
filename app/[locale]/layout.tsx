import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "pl")) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <div
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans bg-background text-foreground`}
    >
      <NextIntlClientProvider messages={messages}>
        <Navbar />
        <main className="min-h-[calc(100vh-10rem)]">{children}</main>
        <Footer />
      </NextIntlClientProvider>
    </div>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
