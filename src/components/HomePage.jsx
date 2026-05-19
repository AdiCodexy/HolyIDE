import { useState, useEffect, useRef } from "react";
import { SUBJECTS } from "./snippets";
import { supabase } from "../supabaseClient";
import BackgroundCanvas from "./BackgroundCanvas";
import AboutPage from "./AboutPage";

export default function HomePage({ onOpenIDE, onOpenSubject }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const scrollContainerRef = useRef(null);
  const blockRef = useRef(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current || !blockRef.current) return;
    const scrollY = scrollContainerRef.current.scrollTop;
    
    // Dispatch custom event to sync with AboutPage animations
    window.dispatchEvent(new CustomEvent('holy-scroll'));

    // Panning out over 200px of scroll
    const progress = Math.min(scrollY / 200, 1);
    
    // Remove transition for instant scrubbing
    blockRef.current.style.transition = "none";
    
    // Block retreats to the left as you scroll down
    blockRef.current.style.clipPath = `inset(0 ${progress * 100}% 0 0)`;
  };

  // ── Initial Hero Animation ────────────────────────────────────
  useEffect(() => {
    if (blockRef.current) {
      // Small delay to ensure the page renders first
      setTimeout(() => {
        if (blockRef.current) {
          blockRef.current.style.transition = "clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1)";
          blockRef.current.style.clipPath = "inset(0 0% 0 0)";
        }
      }, 100);
    }
  }, []);

  // ── Listen for auth state changes ─────────────────────────────
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth actions ──────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const firstName = fullName.split(" ")[0] || "User";

  // ── Brutalist Shared Button Style ─────────────────────────────
  const navBtnStyle = {
    background: "transparent",
    border: "1px solid #333333",
    color: "#FFFFFF",
    cursor: "pointer",
    padding: "8px 16px",
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.2s ease",
  };

  const btnHoverIn = (e) => {
    e.currentTarget.style.background = "#FFFFFF";
    e.currentTarget.style.color = "#000000";
  };
  const btnHoverOut = (e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.color = "#FFFFFF";
  };

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      style={{
      position: "fixed",
      inset: 0,
      background: "transparent",
      overflowY: "auto",
      fontFamily: "'JetBrains Mono', monospace",
      zIndex: 200,
      userSelect: "none",
      WebkitUserSelect: "none",
    }}>
      <BackgroundCanvas />
      {/* ── Top nav bar ───────────────────────────────────────────── */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        borderBottom: "1px solid #1A1A1A",
        position: "sticky",
        top: 0,
        background: "#000000",
        zIndex: 10,
      }}>
        {/* Left — Logo & Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "48px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 800,
              color: "#000000",
            }}>
              H
            </div>
            <span style={{
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              Holy IDE
            </span>
          </div>

          {/* Navigation Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button
              onClick={() => document.getElementById('home-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: "transparent",
                border: "none",
                color: "#666666",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                padding: "4px 0",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
              onMouseLeave={e => e.currentTarget.style.color = "#666666"}
            >
              Home
            </button>

            <button
              onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: "transparent",
                border: "none",
                color: "#666666",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                padding: "4px 0",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
              onMouseLeave={e => e.currentTarget.style.color = "#666666"}
            >
              About
            </button>
          </div>
        </div>
        {/* Right — Auth + Open IDE */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
    {!loading && (
      user ? (
        /* ── Logged in ─────────── */
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={firstName}
              referrerPolicy="no-referrer"
              style={{
                width: "28px",
                height: "28px",
                border: "1px solid #333333",
                objectFit: "cover",
                filter: "grayscale(100%)", // B&W Avatar
              }}
            />
          )}
          <span style={{
            color: "#888888",
            fontSize: "11px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {firstName}
          </span>
          <button
            onClick={signOut}
            style={{
              ...navBtnStyle,
              padding: "6px 12px",
              fontSize: "10px",
              color: "#666666",
              borderColor: "#222222",
            }}
            onMouseEnter={btnHoverIn}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#666666";
            }}
          >
            Log Out
          </button>
        </div>
      ) : (
        /* ── Logged out ────────────────── */
        <button
          onClick={signInWithGoogle}
          style={{
            ...navBtnStyle,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
          onMouseEnter={btnHoverIn}
          onMouseLeave={btnHoverOut}
        >
          {/* Monochrome Google Logo */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
      )
    )}

    <button
      onClick={onOpenIDE}
      style={navBtnStyle}
      onMouseEnter={btnHoverIn}
            onMouseLeave={btnHoverOut}
          >
            Open IDE →
          </button>
        </div>
      </nav>

      {/* ── Hero section ──────────────────────────────────────────── */}
      <div id="home-section" style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "100px 32px 60px",
        textAlign: "center",
      }}>
        <h1 style={{
          color: "#FFFFFF",
          fontSize: "clamp(40px, 6vw, 72px)",
          fontWeight: 300,
          lineHeight: 1.1,
          margin: 0,
          letterSpacing: "-0.04em",
          fontFamily: "'Inter', system-ui, sans-serif", // Contrast the mono font
        }}>
          Practice the previous <br />
          quiz{" "}
          <span style={{
            position: "relative",
            display: "inline-block",
            fontWeight: 700,
            verticalAlign: "bottom",
          }}>
            {/* Base layer: White text on transparent background */}
            <span style={{
              display: "inline-block",
              padding: "4px 16px 12px 16px",
              color: "#FFFFFF",
              lineHeight: 1,
            }}>
              question papers
            </span>
            {/* Overlay layer: Solid white block with black text, clipped on scroll */}
            <span 
              ref={blockRef}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                background: "#FFFFFF",
                color: "#000000",
                display: "inline-block",
                padding: "4px 16px 12px 16px",
                whiteSpace: "nowrap",
                clipPath: "inset(0 100% 0 0)",
                pointerEvents: "none",
                willChange: "clip-path",
                lineHeight: 1,
            }}>
              question papers
            </span>
          </span>
          <br />
          IITM BS Degree
        </h1>

        <p style={{
          color: "#666666",
          fontSize: "12px",
          marginTop: "32px",
          lineHeight: 1.6,
          maxWidth: "500px",
          margin: "32px auto 0",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}>
          Independently run by students. Not an official platform.
        </p>

{/* ── Subject pills ────────────────────────────────────────── */ }
<div style={{
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
  justifyContent: "center",
  marginTop: "64px",
}}>
  {SUBJECTS.map(subject => (
    <button
      key={subject.name}
      onClick={() => onOpenSubject(subject.name, subject.questions[0]?.id)}
      style={{
        background: "transparent",
        border: "1px solid #333333",
        color: "#FFFFFF",
        cursor: "pointer",
        padding: "12px 24px",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontFamily: "'JetBrains Mono', monospace",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "#FFFFFF";
        e.currentTarget.style.color = "#000000";
        e.currentTarget.style.borderColor = "#FFFFFF";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#FFFFFF";
        e.currentTarget.style.borderColor = "#333333";
      }}
    >
      {subject.name}
    </button>
  ))}
</div>
      </div>

      <AboutPage />

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        width: "100%",
        borderTop: "1px solid #1A1A1A",
        padding: "24px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#444444",
        fontSize: "10px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}>
        <span>IIT-M · Holy IDE · Built for students</span>
        <button 
          onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
          style={{
            background: "none",
            border: "none",
            color: "#666666",
            cursor: "pointer",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
            padding: 0,
            textDecoration: "underline",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#FFFFFF"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#666666"}
        >
          About
        </button>
      </div>
    </div>
  );
}