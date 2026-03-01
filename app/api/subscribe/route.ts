import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

export async function POST(request: Request) {
  if (!AUDIENCE_ID) {
    return NextResponse.json(
      { error: "Audience not configured" },
      { status: 500 }
    );
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    await resend.contacts.create({
      email,
      audienceId: AUDIENCE_ID,
    });

    try {
      await resend.emails.send({
        from: "Piotr <piotr@nowosielski.ai>",
        to: email,
        subject: "Cześć, cieszę się że jesteś 👋",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; line-height: 1.7; font-size: 16px;">
            <p>Hej!</p>
            <p>Dzięki za zapis — cieszę się, że tu jesteś.</p>
            <p>Jestem Piotr Nowosielski, CEO i współzałożyciel <a href="https://justjoin.it" style="color: #1a1a1a; font-weight: 600;">justjoin.it</a> i <a href="https://rocketjobs.pl" style="color: #1a1a1a; font-weight: 600;">rocketjobs.pl</a>. Od niedawna buduję <a href="https://nowosielski.ai" style="color: #1a1a1a; font-weight: 600;">nowosielski.ai</a> — mój osobisty plac zabaw, gdzie uczę się vibe codingu i dzielę się tym, co odkrywam po drodze.</p>
            <p><strong>Co będę wysyłał?</strong> Refleksje o AI, vibe coding, budowaniu produktów bez VC i lekcje z prowadzenia firmy. Bez lania wody — tylko to, co faktycznie mnie zaciekawiło lub czego się nauczyłem.</p>
            <p><strong>Jak często?</strong> Przy każdym nowym poście na blogu. Żadnego spamu, obiecuję.</p>
            <p>A jeśli chcesz pogadać — po prostu odpisz na tego maila. Czytam wszystko.</p>
            <p>A na rozgrzewkę — <a href="https://www.youtube.com/watch?v=WMs2vBpFkWo" style="color: #1a1a1a; font-weight: 600;">KęKę - Tryb On</a> 🎵</p>
            <p>Do usłyszenia!<br/>Piotr</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
