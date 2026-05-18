import { useState, useEffect } from "react";
import { SUBJECTS } from "./snippets";

import { supabase, isSupabaseConfigured } from "../supabaseClient";

export default function HomePage({ onOpenIDE, onOpenSubject }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Listen for auth state changes ─────────────────────────────
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth changes (login, logout, token refresh)
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

  // Extract user info from Google metadata
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const firstName = fullName.split(" ")[0] || "User";

  // ── Shared button style ───────────────────────────────────────
  const navBtnStyle = {
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.10)",
    borderRadius: "10px",
    color: "#9A9A9A",
    cursor: "pointer",
    padding: "8px 18px",
    fontSize: "11px",
    fontWeight: 500,
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const btnHoverIn = (e) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
    e.currentTarget.style.color = "#FFFFFF";
  };
  const btnHoverOut = (e) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
    e.currentTarget.style.color = "#9A9A9A";
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#0A0A0A",
      overflowY: "auto",
      fontFamily: "'JetBrains Mono', monospace",
      zIndex: 200,
    }}>


      {/* ── Top nav bar ───────────────────────────────────────────── */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        position: "sticky",
        top: 0,
        background: "rgba(10, 10, 10, 0.85)",
        backdropFilter: "blur(16px)",
        zIndex: 10,
      }}>
        {/* Left — Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #2563eb, #3b2682)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 800,
            color: "#FFFFFF",
          }}>
            H
          </div>
          <span style={{
            color: "#FFFFFF",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}>
            Holy IDE
          </span>
        </div>

        {/* Right — Auth + Open IDE */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!loading && (
            user ? (
              /* ── Logged in: avatar + name + logout ─────────── */
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt={firstName}
                    referrerPolicy="no-referrer"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      objectFit: "cover",
                    }}
                  />
                )}
                <span style={{
                  color: "#C0C0C0",
                  fontSize: "11px",
                  fontWeight: 500,
                }}>
                  {firstName}
                </span>
                <button
                  onClick={signOut}
                  style={{
                    ...navBtnStyle,
                    padding: "6px 14px",
                    fontSize: "10px",
                    color: "#6B6B6B",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                  }}
                  onMouseEnter={btnHoverIn}
                  onMouseLeave={btnHoverOut}
                >
                  Log Out
                </button>
              </div>
            ) : (
              /* ── Logged out: sign in button ────────────────── */
              <button
                onClick={signInWithGoogle}
                style={{
                  ...navBtnStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={btnHoverIn}
                onMouseLeave={btnHoverOut}
              >
                {/* Google "G" icon (inline SVG) */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
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
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "80px 32px 40px",
        textAlign: "center",
      }}>
        <h1 style={{
          color: "#FFFFFF",
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: 800,
          lineHeight: 1.15,
          margin: 0,
          letterSpacing: "-0.03em",
        }}>
          Practice the previous{" "}
          <br />
          quiz{" "}
          <span style={{
            background: "linear-gradient(135deg, #34D399, #10B981)",
            color: "#0A0A0A",
            padding: "2px 14px",
            borderRadius: "8px",
            fontWeight: 800,
          }}>
            question papers
          </span>
          <br />
          IITM BS Degree
        </h1>

        <p style={{
          color: "#5A5A5A",
          fontSize: "12px",
          marginTop: "20px",
          lineHeight: 1.6,
          maxWidth: "500px",
          margin: "20px auto 0",
        }}>
          This app is independently run by individuals and is not an official platform of any IIT.
        </p>

        {/* ── Subject pills ────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
          marginTop: "36px",
        }}>
          {SUBJECTS.map(subject => (
            <button
              key={subject.name}
              onClick={() => onOpenSubject(subject.name, subject.questions[0]?.id)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "10px",
                color: "#FFFFFF",
                cursor: "pointer",
                padding: "10px 22px",
                fontSize: "12px",
                fontWeight: 500,
                fontFamily: "'JetBrains Mono', monospace",
                transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.30)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>


      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.04)",
        padding: "20px 32px",
        textAlign: "center",
        color: "#2A2A2A",
        fontSize: "10px",
        letterSpacing: "0.04em",
      }}>
        IIT-M · Holy IDE · Built for students
      </div>
    </div>
  );
}
