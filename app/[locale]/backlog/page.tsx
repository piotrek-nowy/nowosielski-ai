import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "backlog" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

const mainItems = [
  { done: true, text: { pl: "stworzyć swoją stronę domową", en: "build my own homepage" } },
  {
    done: false,
    text: {
      pl: "podpiąć feed z mojego X po założeniu konta deweloperskiego na tym serwisie",
      en: "connect my X feed after setting up a developer account",
    },
    deadline: "to do: W4 luty",
  },
  {
    done: false,
    text: {
      pl: "postawić bloga na supabase z opcją logowania i edytorem tekstu",
      en: "set up a blog on Supabase with login and a text editor",
    },
    deadline: "to do: W4 luty",
  },
  {
    done: false,
    text: {
      pl: "notatnik (za logowaniem) w stylu airtable: nad czym pracowałem, czas zadania i poziom trudności",
      en: "notebook (behind login) airtable-style: what I worked on, task time and difficulty level",
    },
    deadline: "to do: W4 luty",
  },
  {
    done: false,
    text: {
      pl: "podpiąć bloga do newslettera, który będzie wysyłał każdy mój nowy wpis i zrobić tu automatyzację",
      en: "connect the blog to a newsletter that sends every new post automatically",
    },
    deadline: "to do: W4 luty",
  },
  {
    done: false,
    text: {
      pl: "proste calendly do złapki ze mną z automatycznym dodawaniem do kalendarza google",
      en: "simple Calendly for booking a call with me, with automatic Google Calendar integration",
    },
    deadline: "to do: W4 luty",
  },
  {
    done: false,
    text: {
      pl: "jakieś proste gry: snake, saper, pasjans solitaire",
      en: "some simple games: snake, minesweeper, solitaire",
    },
  },
  {
    done: false,
    text: {
      pl: "może bardziej skomplikowane gry jak szachy z różnymi skórkami szachownicy",
      en: "maybe more complex games like chess with different board skins",
    },
  },
  {
    done: false,
    text: {
      pl: "szachy z możliwością zagrania ze mną online asynchronicznie (po rejestracji)",
      en: "chess with the option to play against me online asynchronously (after registration)",
    },
  },
  {
    done: false,
    text: {
      pl: "zintegrowanie się z jakimś zewnętrznym API",
      en: "integrate with some external API",
    },
  },
  {
    done: false,
    text: {
      pl: "podpięcie płatności pod zakup czegoś",
      en: "add payments for purchasing something",
    },
  },
];

const industryItems = [
  {
    text: {
      pl: "wizualizacje wykresów na bazie danych z naszych job boardów po API Snowflake",
      en: "chart visualizations based on data from our job boards via Snowflake API",
    },
  },
  {
    text: {
      pl: "zbudowanie własnej wtyczki do przeglądarki do czegoś, np scraping ofert pracy",
      en: "build my own browser extension for something, e.g. scraping job offers",
    },
  },
  {
    text: {
      pl: "coś pod e-learning, na przykład generator mini-kursu po wrzuceniu linku z youtube",
      en: "something for e-learning, e.g. a mini-course generator from a YouTube link",
    },
  },
  {
    text: {
      pl: "zbudowanie agregatora newsów o rynku pracy",
      en: "build a job market news aggregator",
    },
  },
  {
    text: {
      pl: "zbudowanie prostego generatora CV",
      en: "build a simple CV generator",
    },
  },
];

const advancedItems = [
  {
    text: {
      pl: "nasz wewnętrzny TomHRM - do urlopów dla firmy",
      en: "our internal TomHRM - leave management for the company",
    },
    deadline: "Q2",
  },
  {
    text: {
      pl: "mini-platforma edukacyjna z kursami do nauki na podstawie dostarczonych materiałów",
      en: "mini educational platform with courses based on provided materials",
    },
    deadline: "Q2",
  },
];

export default async function BacklogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("backlog");
  const lang = locale as "pl" | "en";

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subheading")}</p>
      </div>

      <ol className="mt-10 list-decimal space-y-3 pl-6 text-foreground">
        {mainItems.map((item, i) => (
          <li key={i} className={item.done ? "line-through text-muted-foreground" : ""}>
            {item.done ? (
              <span>
                <strong>{item.text[lang]}</strong> — <strong>done</strong> ✅
              </span>
            ) : (
              <span>
                {item.text[lang]}
                {item.deadline && (
                  <span className="ml-1 font-semibold text-muted-foreground">
                    ({item.deadline})
                  </span>
                )}
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-14 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t("industryHeading")}
        </h2>
      </div>

      <ol className="mt-6 list-decimal space-y-3 pl-6 text-foreground">
        {industryItems.map((item, i) => (
          <li key={i}>{item.text[lang]}</li>
        ))}
      </ol>

      <div className="mt-14 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t("advancedHeading")}
        </h2>
      </div>

      <ol className="mt-6 list-decimal space-y-3 pl-6 text-foreground">
        {advancedItems.map((item, i) => (
          <li key={i}>
            {item.text[lang]}
            {item.deadline && (
              <span className="ml-1 font-semibold text-muted-foreground">
                ({item.deadline})
              </span>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-14 text-sm text-muted-foreground">
        {t("updateNote")}
        <br />
        {t("lastUpdate")}: <strong>24/02</strong>.
      </p>
    </section>
  );
}
