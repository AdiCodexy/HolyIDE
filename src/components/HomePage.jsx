import { useState, useEffect, useRef } from "react";
import { SUBJECTS } from "./snippets";
import { supabase } from "../supabaseClient";
import BackgroundCanvas from "./BackgroundCanvas";
import AboutPage from "./AboutPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import ReviewPage from "./ReviewPage";
import ProfilePage from "./ProfilePage";

export default function HomePage({ onOpenIDE, onOpenSubject }) {
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
          <button
            onClick={() => setShowSearch(prev => !prev)}
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
            Search
          </button>
          
          {showSearch && (
            <>
              {/* Invisible Clickable Overlay to close search on clicking outside */}
              <div 
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 999,
                  background: "transparent",
                  cursor: "default"
                }}
                onClick={() => setShowSearch(false)}
              />
              
              {/* Dropdown Box */}
              <div style={{
                position: "absolute",
                top: "calc(100% + 12px)",
                right: 0,
                width: "450px",
                background: "#0D0D0D",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxShadow: "0 15px 40px rgba(0, 0, 0, 0.9)",
                boxSizing: "border-box",
                animation: "slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                zIndex: 1000,
              }}
              onClick={e => e.stopPropagation()}
              >
                <style>{`
                  @keyframes slideDown {
                    from {
                      opacity: 0;
                      transform: translateY(-10px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}</style>
                
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", color: "#888888" }}>SEARCH USERS</span>
                  <button 
                    onClick={() => setShowSearch(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#666666",
                      cursor: "pointer",
                      fontSize: "10px",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
                    onMouseLeave={e => e.currentTarget.style.color = "#666666"}
                  >
                    [ ESC ]
                  </button>
                </div>

                {/* Input Wrapper */}
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search friend's name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                    style={{
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "4px",
                      padding: "10px 12px 10px 36px",
                      color: "#FFFFFF",
                      fontSize: "13px",
                      outline: "none",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                  />
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="rgba(255, 255, 255, 0.3)" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>

                {/* Search Results */}
                <div style={{ 
                  maxHeight: "260px", 
                  overflowY: "auto", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "6px" 
                }}>
                  {searching ? (
                    <div style={{ color: "#666666", fontSize: "11px", padding: "8px 0" }}>Searching users...</div>
                  ) : results.length === 0 ? (
                    <div style={{ color: "#666666", fontSize: "11px", padding: "8px 0" }}>
                      {searchQuery ? "No matching friends found." : "Type a name to search..."}
                    </div>
                  ) : (
                    results.map(friend => (
                      <div
                        key={friend.id}
                        onClick={() => handleSelectFriend(friend)}
                        style={{
                          background: "rgba(255, 255, 255, 0.01)",
                          border: "1px solid rgba(255, 255, 255, 0.03)",
                          borderRadius: "6px",
                          padding: "12px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.03)";
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 600 }}>{friend.name}</span>
                          <span style={{ color: "#666666", fontSize: "10px" }}>{friend.studying}</span>
                        </div>
                        <span style={{ color: "#888888", fontSize: "9px", textTransform: "uppercase" }}>View Profile →</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
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