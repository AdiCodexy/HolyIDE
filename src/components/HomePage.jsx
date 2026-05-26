import { useState, useEffect, useRef } from "react";
import { SUBJECTS } from "./snippets";
import { supabase } from "../supabaseClient";
import BackgroundCanvas from "./BackgroundCanvas";
import AboutPage from "./AboutPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import ReviewPage from "./ReviewPage";
import ProfilePage from "./ProfilePage";

// Helper to generate a unique, subtle premium dark gradient background for student avatars
const getAvatarGradient = (name) => {
  const colors = [
    ['#ff4e50', '#f9d423'],
    ['#e1578a', '#fee140'],
    ['#6a11cb', '#2575fc'],
    ['#30cfd0', '#330867'],
    ['#f093fb', '#f5576c'],
    ['#5ee7df', '#b490ca'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#0acffe', '#495aff'],
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  const [c1, c2] = colors[index];
  return `linear-gradient(135deg, ${c1}30 0%, ${c2}15 100%)`;
};

export default function HomePage({ onOpenIDE, onOpenSubject, deletedDefaultIds = new Set() }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!supabase);

  const scrollContainerRef = useRef(null);
  const blockRef = useRef(null);

  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    if (!showSearch) {
      setTimeout(() => {
        setSearchQuery("");
        setResults([]);
      }, 0);
      return;
    }
  }, [showSearch]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setTimeout(() => {
        setResults([]);
      }, 0);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        if (!supabase) {
          const mockData = [
            { id: "mock-alice", name: "Alice Vance", studying: "Computer Science" },
            { id: "mock-bob", name: "Bob Smith", studying: "Data Science" },
            { id: "mock-charlie", name: "Charlie Kovach", studying: "Software Engineering" }
          ];
          const filtered = mockData.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
          setResults(filtered);
        } else {
          const { data, error } = await supabase
            .from("profiles")
            .select("id, name, studying")
            .ilike("name", `%${searchQuery}%`)
            .limit(10);

          if (!error && data) {
            setResults(data);
          } else {
            setResults([]);
          }
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle search on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
      // Open search on '/' if not in an input/textarea
      if (e.key === '/' && !showSearch && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowSearch(true);
      }
      // Close search on Escape
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
  };

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
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: translate(-50%, -15px) scale(0.98); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <BackgroundCanvas />
      {/* ── Top nav bar ───────────────────────────────────────────── */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        position: "sticky",
        top: 0,
        background: "#000000",
        zIndex: 200,
        height: "65px",
        boxSizing: "border-box"
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

            <button
              onClick={() => document.getElementById('privacy-section')?.scrollIntoView({ behavior: 'smooth' })}
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
              Privacy
            </button>

            <button
              onClick={() => document.getElementById('review-section')?.scrollIntoView({ behavior: 'smooth' })}
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
              Review
            </button>
          </div>
        </div>
        {/* Right — Auth + Open IDE */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => setShowSearch(true)}
            style={{
              ...navBtnStyle,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              height: "32px",
              fontSize: "10px",
            }}
            onMouseEnter={btnHoverIn}
            onMouseLeave={btnHoverOut}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Search</span>
            <span style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "0px",
              padding: "1px 4px",
              fontSize: "8px",
              marginLeft: "4px",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "inherit",
            }}>
              /
            </span>
          </button>
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
  {SUBJECTS.filter(subject => subject.questions.some(q => !deletedDefaultIds.has(q.id))).map(subject => (
    <button
      key={subject.name}
      onClick={() => {
        const firstActive = subject.questions.find(q => !deletedDefaultIds.has(q.id));
        if (firstActive) {
          onOpenSubject(subject.name, firstActive.id);
        }
      }}
      style={{
        background: "transparent",
        border: "1px solid #333333",
        color: "#FFFFFF",
        cursor: "pointer",
        padding: "16px 32px",
        fontSize: "14px",
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
      <PrivacyPolicyPage />
      <ReviewPage />

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
        <div style={{ display: "flex", gap: "16px" }}>
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
          <button 
            onClick={() => document.getElementById('privacy-section')?.scrollIntoView({ behavior: 'smooth' })}
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
            Privacy
          </button>
          <button 
            onClick={() => document.getElementById('review-section')?.scrollIntoView({ behavior: 'smooth' })}
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
            Review
          </button>
        </div>
      </div>

      {/* ── Command Palette (Search Modal) ───────────────────────────── */}
      {showSearch && (
        <>
          <div 
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(12px)",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={() => setShowSearch(false)}
          />
          
          <div style={{
            position: "fixed",
            top: "12vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(640px, 92vw)",
            maxHeight: "80vh",
            background: "rgba(10, 10, 10, 0.8)",
            backdropFilter: "blur(30px)",
            borderRadius: "0px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 30px 70px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 1px rgba(255, 255, 255, 0.15)",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
            animation: "scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            overflow: "hidden",
            boxSizing: "border-box"
          }}
          onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "18px 24px",
              gap: "16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              background: "rgba(255, 255, 255, 0.01)"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              
              <input
                type="text"
                placeholder="Search students by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 500,
                  outline: "none",
                  padding: "4px 0",
                  fontFamily: "inherit",
                  letterSpacing: "0.03em",
                }}
              />
              
              <button
                onClick={() => setShowSearch(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  padding: "4px 10px",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  fontFamily: "inherit",
                  borderRadius: "0px",
                  transition: "all 0.15s ease",
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                }}
              >
                ESC
              </button>
            </div>
            
            <div style={{
              padding: "16px 8px 16px 16px",
              overflowY: "auto",
              maxHeight: "380px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              boxSizing: "border-box"
            }}>
              <div style={{ 
                fontSize: "10px", 
                fontWeight: 600, 
                letterSpacing: "0.1em", 
                color: "rgba(255, 255, 255, 0.35)",
                padding: "4px 8px 8px",
                textTransform: "uppercase"
              }}>
                Students
              </div>
              
              {searching ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "40px 0",
                  color: "rgba(255, 255, 255, 0.4)",
                  fontSize: "12px"
                }}>
                  <div className="search-spinner" style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255, 255, 255, 0.1)",
                    borderTopColor: "rgba(255, 255, 255, 0.6)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  Searching database...
                </div>
              ) : results.length === 0 ? (
                <div style={{ 
                  color: "rgba(255, 255, 255, 0.35)", 
                  fontSize: "12px", 
                  textAlign: "center",
                  padding: "40px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: "4px" }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  {searchQuery ? (
                    <>
                      <span>No students found for "{searchQuery}"</span>
                      <span style={{ fontSize: "10px", opacity: 0.7 }}>Try checking the spelling or typing a different name.</span>
                    </>
                  ) : (
                    <span>Type a name to search for other students...</span>
                  )}
                </div>
              ) : (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}>
                  {results.map(friend => {
                    const initials = friend.name ? friend.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "ST";
                    return (
                      <div
                        key={friend.id}
                        onClick={() => {
                          handleSelectFriend(friend);
                          setShowSearch(false);
                        }}
                        style={{
                          background: "transparent",
                          border: "1px solid transparent",
                          borderRadius: "0px",
                          padding: "10px 12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                          const arrow = e.currentTarget.querySelector('.result-arrow');
                          if (arrow) {
                            arrow.style.transform = "translateX(4px)";
                            arrow.style.color = "#FFFFFF";
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "transparent";
                          e.currentTarget.style.background = "transparent";
                          const arrow = e.currentTarget.querySelector('.result-arrow');
                          if (arrow) {
                            arrow.style.transform = "translateX(0)";
                            arrow.style.color = "rgba(255, 255, 255, 0.3)";
                          }
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "0px",
                            background: getAvatarGradient(friend.name),
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#FFFFFF",
                            letterSpacing: "0.05em",
                            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                          }}>
                            {initials}
                          </div>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ color: "#FFFFFF", fontSize: "13.5px", fontWeight: 500 }}>{friend.name}</span>
                            <span style={{ color: "rgba(255, 255, 255, 0.45)", fontSize: "11px" }}>{friend.studying}</span>
                          </div>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>View Profile</span>
                          <span className="result-arrow" style={{ 
                            color: "rgba(255, 255, 255, 0.3)", 
                            fontSize: "14px", 
                            transition: "all 0.15s ease",
                            display: "inline-block"
                          }}>→</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Friend Profile Overlay ───────────────────────────────────── */}
      {selectedFriend && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 1100,
          background: "#0A0A0A",
        }}>
          <ProfilePage 
            userId={selectedFriend.id} 
            userName={selectedFriend.name} 
            onClose={() => setSelectedFriend(null)} 
          />
        </div>
      )}
    </div>
  );
}