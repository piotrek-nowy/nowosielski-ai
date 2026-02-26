"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";

const SKINS = {
  classic: {
    name: "Classic",
    bg: "#232323", titleBg: "#1a1a1a", titleText: "#a0a0a0",
    display: "#000", displayText: "#00ff41", displaySecondary: "#006614",
    btn: "#3a3a3a", btnBorder: "#555 #222 #222 #555", btnText: "#b0b0b0",
    btnActive: "#4a4a4a", accent: "#00ff41", eqBar: "#00ff41", eqBg: "#000",
    border: "#555 #111 #111 #555", insetBorder: "#111 #555 #555 #111",
    panelBg: "#2a2a2a", ledOff: "#003d00",
  },
  blue: {
    name: "Azureus",
    bg: "#0a1628", titleBg: "#071020", titleText: "#4a9eff",
    display: "#000510", displayText: "#4dc8ff", displaySecondary: "#0a3a5a",
    btn: "#0d2040", btnBorder: "#1a4080 #040e20 #040e20 #1a4080", btnText: "#4a9eff",
    btnActive: "#1a3060", accent: "#4dc8ff", eqBar: "#4dc8ff", eqBg: "#000510",
    border: "#1a4080 #040e20 #040e20 #1a4080", insetBorder: "#040e20 #1a4080 #1a4080 #040e20",
    panelBg: "#0d1e38", ledOff: "#002040",
  },
  red: {
    name: "Inferno",
    bg: "#1a0a0a", titleBg: "#110606", titleText: "#ff6040",
    display: "#050000", displayText: "#ff4422", displaySecondary: "#5a0a00",
    btn: "#2a0e0e", btnBorder: "#603020 #100606 #100606 #603020", btnText: "#ff6040",
    btnActive: "#3a1010", accent: "#ff4422", eqBar: "#ff4422", eqBg: "#050000",
    border: "#603020 #100606 #100606 #603020", insetBorder: "#100606 #603020 #603020 #100606",
    panelBg: "#200e0e", ledOff: "#3a0500",
  },
  matrix: {
    name: "Matrix",
    bg: "#050f05", titleBg: "#020a02", titleText: "#39ff14",
    display: "#000500", displayText: "#39ff14", displaySecondary: "#0a2a0a",
    btn: "#081408", btnBorder: "#1a4a1a #020a02 #020a02 #1a4a1a", btnText: "#39ff14",
    btnActive: "#102010", accent: "#39ff14", eqBar: "#39ff14", eqBg: "#000500",
    border: "#1a4a1a #020a02 #020a02 #1a4a1a", insetBorder: "#020a02 #1a4a1a #1a4a1a #020a02",
    panelBg: "#061006", ledOff: "#002000",
  },
} as const;

type SkinKey = keyof typeof SKINS;
type Skin = (typeof SKINS)[SkinKey];

const YT_VIDEO_ID = "2OSheSVLHGQ";
const TRACK = { title: "tryb on", artist: "KęKę" };
const EQ_BANDS = [60, 170, 310, 600, "1K", "3K", "6K", "12K", "14K", "16K"];
const BASE_EQ = [7, 9, 8, 6, 5, 6, 7, 8, 7, 6];

const fmt = (s: number) => {
  if (!s || isNaN(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export function WinampPlayer() {
  const [skinKey, setSkinKey] = useState<SkinKey>("classic");
  const s = SKINS[skinKey];

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [showEQ, setShowEQ] = useState(true);
  const [showPL, setShowPL] = useState(true);
  const [ytReady, setYtReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [ticker, setTicker] = useState(0);
  const [eqAnim, setEqAnim] = useState(BASE_EQ);

  const ytContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeatRef = useRef(repeat);
  repeatRef.current = repeat;

  useEffect(() => {
    const doInit = () => {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: YT_VIDEO_ID,
        width: "1",
        height: "1",
        playerVars: {
          autoplay: 0, controls: 0, disablekb: 1,
          fs: 0, modestbranding: 1, rel: 0, iv_load_policy: 3,
        },
        events: {
          onReady: (e: any) => {
            setYtReady(true);
            e.target.setVolume(80);
            const d = e.target.getDuration();
            if (d > 0) setDuration(d);
          },
          onStateChange: (e: any) => {
            const S = window.YT.PlayerState;
            if (e.data === S.PLAYING) {
              setIsPlaying(true);
              setDuration(playerRef.current.getDuration());
            } else if (e.data === S.PAUSED) {
              setIsPlaying(false);
            } else if (e.data === S.ENDED) {
              setIsPlaying(false);
              if (repeatRef.current) {
                playerRef.current.seekTo(0);
                playerRef.current.playVideo();
              } else {
                setCurrentTime(0);
              }
            }
          },
          onError: () => setLoadError(true),
        },
      });
    };

    if (window.YT && window.YT.Player) {
      doInit();
    } else {
      window.onYouTubeIframeAPIReady = doInit;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      pollerRef.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 300);
    } else {
      if (pollerRef.current) clearInterval(pollerRef.current);
    }
    return () => { if (pollerRef.current) clearInterval(pollerRef.current); };
  }, [isPlaying]);

  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (isPlaying) t = setInterval(() => setTicker((x) => x + 1), 180);
    return () => clearInterval(t);
  }, [isPlaying]);

  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (isPlaying) {
      t = setInterval(() => {
        setEqAnim(BASE_EQ.map((v) => Math.max(1, Math.min(14, v + (Math.random() * 4 - 2)))));
      }, 100);
    } else {
      setEqAnim(BASE_EQ);
    }
    return () => clearInterval(t);
  }, [isPlaying]);

  useEffect(() => {
    playerRef.current?.setVolume?.(volume);
  }, [volume]);

  const togglePlay = () => {
    if (!ytReady || !playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };
  const stop = () => {
    if (!playerRef.current) return;
    playerRef.current.pauseVideo();
    playerRef.current.seekTo(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };
  const seekRel = (d: number) => {
    if (!playerRef.current) return;
    const t = Math.max(0, Math.min(duration, currentTime + d));
    playerRef.current.seekTo(t, true);
    setCurrentTime(t);
  };
  const seekPct = (pct: number) => {
    if (!playerRef.current) return;
    const t = pct * duration;
    playerRef.current.seekTo(t, true);
    setCurrentTime(t);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const fullTitle = `${TRACK.artist} — ${TRACK.title}`;
  const scrollSrc = `${fullTitle}     `;
  const displayTitle = scrollSrc.repeat(3).slice(ticker % scrollSrc.length, ticker % scrollSrc.length + 26);

  const panel: CSSProperties = { background: s.bg, border: "2px solid", borderColor: s.border, padding: 2, marginBottom: 2 };
  const titleBar: CSSProperties = {
    background: `linear-gradient(180deg, ${s.titleBg} 0%, ${s.bg} 100%)`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "2px 4px", borderBottom: `1px solid ${s.accent}33`,
    fontSize: 9, color: s.titleText, letterSpacing: 2,
    fontWeight: "bold", textTransform: "uppercase", fontFamily: "monospace",
  };
  const wBtn = (active = false, small = false): CSSProperties => ({
    background: active ? s.btnActive : s.btn,
    border: "1px solid", borderColor: active ? s.insetBorder : s.btnBorder,
    color: active ? s.accent : s.btnText,
    fontSize: small ? 8 : 9, padding: small ? "1px 3px" : "2px 5px",
    cursor: "pointer", fontFamily: "monospace", lineHeight: 1,
    outline: "none", minWidth: small ? 14 : 20, fontWeight: "bold",
  });
  const displayBox: CSSProperties = {
    background: s.display, border: `1px solid ${s.displaySecondary}`,
    padding: "4px 6px", margin: "4px 2px",
    fontFamily: "monospace", color: s.displayText, fontSize: 11, lineHeight: 1.3,
    boxShadow: `inset 0 0 8px ${s.accent}22`,
  };

  return (
    <div style={{ width: 275, fontFamily: "monospace", userSelect: "none", cursor: "default", filter: "drop-shadow(0 6px 28px rgba(0,0,0,0.9))" }}>

      <div style={{ position: "fixed", left: -9999, top: -9999, width: 1, height: 1, overflow: "hidden", pointerEvents: "none", opacity: 0 }}>
        <div ref={ytContainerRef} id="yt-winamp-player" />
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 4, justifyContent: "center" }}>
        {Object.entries(SKINS).map(([key, sk]) => (
          <button key={key} onClick={() => setSkinKey(key as SkinKey)} style={{
            fontSize: 8, padding: "2px 6px", fontFamily: "monospace", fontWeight: "bold",
            background: skinKey === key ? sk.accent : sk.bg,
            color: skinKey === key ? sk.bg : sk.btnText,
            border: `1px solid ${sk.accent}`, cursor: "pointer",
          }}>
            {sk.name}
          </button>
        ))}
      </div>

      <div style={panel}>
        <div style={titleBar}>
          <span>▓ WINAMP</span>
          <div style={{ display: "flex", gap: 2 }}>
            {["_", "□", "✕"].map((c, i) => (
              <button key={i} style={{ ...wBtn(false, true), padding: "0 3px", color: i === 2 ? "#ff4040" : s.btnText }}>{c}</button>
            ))}
          </div>
        </div>

        <div style={displayBox}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              fontSize: 22, letterSpacing: 2, color: s.displayText,
              textShadow: `0 0 12px ${s.accent}`, minWidth: 68, fontWeight: "bold",
            }}>
              {fmt(currentTime)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: s.displaySecondary, marginBottom: 1 }}>1. KęKę — tryb on</div>
              <div style={{ fontSize: 8, color: s.displaySecondary }}>
                {loadError ? "⚠ Błąd YT" : ytReady ? "128kbps  44kHz  Stereo" : "⏳ Ładowanie..."}
              </div>
            </div>
          </div>

          <div style={{
            fontSize: 9, color: s.accent, letterSpacing: 1, marginTop: 3,
            overflow: "hidden", whiteSpace: "nowrap",
            textShadow: `0 0 5px ${s.accent}99`,
          }}>
            {displayTitle}
          </div>

          <div style={{ height: 6, background: s.displaySecondary, marginTop: 5, cursor: "pointer", position: "relative" }}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              seekPct((e.clientX - r.left) / r.width);
            }}>
            <div style={{ height: "100%", width: `${progress}%`, background: s.accent, boxShadow: `0 0 6px ${s.accent}`, transition: "width 0.3s linear" }} />
            <div style={{
              position: "absolute", top: "50%", left: `${progress}%`,
              transform: "translate(-50%, -50%)",
              width: 10, height: 10, background: s.accent, boxShadow: `0 0 8px ${s.accent}`,
            }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 6px" }}>
          <span style={{ fontSize: 7, color: s.btnText }}>VOL</span>
          <input type="range" min={0} max={100} value={volume}
            onChange={(e) => setVolume(+e.target.value)}
            style={{ flex: 1, accentColor: s.accent }} />
          <span style={{ fontSize: 7, color: s.displaySecondary, minWidth: 22 }}>{volume}%</span>
        </div>

        <div style={{ display: "flex", gap: 2, padding: "3px 4px", justifyContent: "center" }}>
          <button style={wBtn()} onClick={() => seekRel(-10)} title="⏮ -10s">⏮</button>
          <button style={wBtn()} onClick={() => seekRel(-5)} title="-5s">⏪</button>
          <button style={{ ...wBtn(isPlaying), minWidth: 34, fontSize: 14, color: isPlaying ? s.accent : s.btnText }}
            onClick={togglePlay}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button style={wBtn()} onClick={stop}>⏹</button>
          <button style={wBtn()} onClick={() => seekRel(5)}>⏩</button>
          <button style={wBtn()} onClick={() => seekRel(10)}>⏭</button>
          <div style={{ width: 3 }} />
          <button style={{ ...wBtn(shuffle), fontSize: 7, padding: "2px 4px" }} onClick={() => setShuffle(x => !x)}>SHF</button>
          <button style={{ ...wBtn(repeat), fontSize: 7, padding: "2px 4px" }} onClick={() => setRepeat(x => !x)}>REP</button>
        </div>

        <div style={{ display: "flex", gap: 2, padding: "1px 4px 4px", alignItems: "center" }}>
          <button style={{ ...wBtn(showEQ), fontSize: 7 }} onClick={() => setShowEQ(x => !x)}>EQ</button>
          <button style={{ ...wBtn(showPL), fontSize: 7 }} onClick={() => setShowPL(x => !x)}>PL</button>
          <span style={{ fontSize: 7, color: s.displaySecondary, marginLeft: "auto" }}>{fmt(currentTime)} / {fmt(duration)}</span>
        </div>
      </div>

      {showEQ && (
        <div style={panel}>
          <div style={titleBar}>
            <span>▓ WINAMP EQUALIZER</span>
            <button style={{ ...wBtn(false, true), padding: "0 3px", color: "#ff4040" }} onClick={() => setShowEQ(false)}>✕</button>
          </div>
          <div style={{ background: s.eqBg, padding: "6px 4px 4px" }}>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", justifyContent: "center" }}>
              {EQ_BANDS.map((hz, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ display: "flex", flexDirection: "column-reverse", height: 50, gap: 1 }}>
                    {Array.from({ length: 14 }).map((_, j) => {
                      const lit = j < Math.round(eqAnim[i] ?? 7);
                      return (
                        <div key={j} style={{
                          width: 10, height: 3,
                          background: lit ? s.eqBar : s.ledOff,
                          boxShadow: lit && isPlaying ? `0 0 3px ${s.accent}` : "none",
                          transition: "background 0.06s",
                        }} />
                      );
                    })}
                  </div>
                  <span style={{ fontSize: 5.5, color: s.displaySecondary }}>{hz}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPL && (
        <div style={panel}>
          <div style={titleBar}>
            <span>▓ WINAMP PLAYLIST</span>
            <button style={{ ...wBtn(false, true), padding: "0 3px", color: "#ff4040" }} onClick={() => setShowPL(false)}>✕</button>
          </div>
          <div style={{ background: s.display, padding: "5px 6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: s.accent, textShadow: `0 0 4px ${s.accent}88` }}>
              <span>1. KęKę — tryb on</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 2, padding: "3px 4px", background: s.panelBg, alignItems: "center" }}>
            {["ADD", "REM", "SEL", "MISC"].map((l) => (
              <button key={l} style={{ ...wBtn(false, true), fontSize: 7, padding: "2px 4px" }}>{l}</button>
            ))}
            <span style={{ fontSize: 7, color: s.displaySecondary, marginLeft: "auto" }}>{fmt(currentTime)}/{fmt(duration)}</span>
          </div>
        </div>
      )}

      <div style={{ fontSize: 7, color: s.displaySecondary, textAlign: "center", marginTop: 2 }}>
        {loadError ? "⚠ Sprawdź ID wideo w kodzie" : ytReady ? `▶ YT Audio ready  •  ID: ${YT_VIDEO_ID}` : "⏳ Ładowanie YouTube IFrame API..."}
      </div>
    </div>
  );
}
