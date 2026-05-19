import { useState, useEffect } from "react";
import { SUBJECTS } from "./snippets";
import { supabase } from "../supabaseClient"; // Adjust this path if needed

function getStats() {
  const totalQuestions = SUBJECTS.reduce((sum, s) => sum + s.questions.length, 0);
  return { totalQuestions, totalSubjects: SUBJECTS.length };
}

export default function ProfilePage({ onClose }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({
    name: "Student",
    studying: "Data Science", // Clean, minimal default
    avatarUrl: null
  });

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStudying, setEditStudying] = useState("");

  const stats = getStats();

  // Fetch Session & Profile Data
  useEffect(() => {
    async function loadProfileData() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setSession(session);
        const googleAvatar = session.user.user_metadata?.avatar_url;

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('name, studying')
          .eq('id', session.user.id)
          .single();

        if (!error && profileData) {
          const currentName = profileData.name || session.user.user_metadata?.full_name || "Student";
          const currentStudying = profileData.studying || "Data Science";

          setProfile({
            name: currentName,
            studying: currentStudying,
            avatarUrl: googleAvatar
          });

          setEditName(currentName);
          setEditStudying(currentStudying);
        } else {
          // If no profile exists yet, pre-fill with Google name
          setEditName(session.user.user_metadata?.full_name || "Student");
          setEditStudying("Data Science");
          setProfile(p => ({ ...p, avatarUrl: googleAvatar }));
        }
      }
    }

    loadProfileData();
  }, []);

  // Save to Supabase using UPSERT
  const handleSave = async () => {
    setProfile(p => ({ ...p, name: editName, studying: editStudying }));
    setEditing(false);

    if (session) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          name: editName,
          studying: editStudying,
          updated_at: new Date().toISOString()
        });

      if (error) console.error("Error saving profile:", error);
    }
  };

  const handleCancel = () => {
    setEditName(profile.name);
    setEditStudying(profile.studying);
    setEditing(false);
  };

  const questionsCompleted = Math.floor(stats.totalQuestions * 0.6);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "#000000", // Pure Black
      color: "#FFFFFF",
      overflowY: "auto",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", // Clean sans-serif
      boxSizing: "border-box",
    }}>

      {/* ── Top Navigation ────────────────────────────────────── */}
      <div style={{
        padding: "40px 60px",
        display: "flex",
        alignItems: "center",
      }}>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1px solid #333333",
            color: "#FFFFFF",
            cursor: "pointer",
            padding: "10px 24px",
            fontSize: "12px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#FFFFFF";
            e.currentTarget.style.color = "#000000";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#FFFFFF";
          }}
        >
          Return
        </button>
      </div>

      {/* ── Main Desktop Grid ─────────────────────────────────── */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 60px 80px 60px",
        display: "flex",
        flexWrap: "wrap", // Allows stacking on smaller screens
        gap: "100px",
      }}>

        {/* ── Left Column: Profile & Stats ────────────────────── */}
        <div style={{
          flex: "1 1 350px",
          display: "flex",
          flexDirection: "column",
          gap: "48px",
        }}>

          {/* Avatar Section */}
          <div>
            <div style={{
              width: "160px",
              height: "160px",
              background: profile.avatarUrl ? `url(${profile.avatarUrl}) center/cover no-repeat` : "#111111",
              border: "1px solid #333333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: 300,
              color: "#FFFFFF",
              marginBottom: "32px",
              filter: "grayscale(100%)", // Forces B&W aesthetic
            }}>
              {!profile.avatarUrl && profile.name.charAt(0).toUpperCase()}
            </div>

            {/* Editing vs Viewing State */}
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Name"
                  autoFocus
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid #555555",
                    color: "#FFFFFF",
                    padding: "8px 0",
                    fontSize: "32px",
                    fontWeight: 300,
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.currentTarget.style.borderBottomColor = "#FFFFFF"}
                  onBlur={e => e.currentTarget.style.borderBottomColor = "#555555"}
                />
                <input
                  value={editStudying}
                  onChange={e => setEditStudying(e.target.value)}
                  placeholder="Studying..."
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid #555555",
                    color: "#888888",
                    padding: "8px 0",
                    fontSize: "16px",
                    fontWeight: 400,
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.currentTarget.style.borderBottomColor = "#FFFFFF"}
                  onBlur={e => e.currentTarget.style.borderBottomColor = "#555555"}
                />
                <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                  <button onClick={handleSave} style={{
                    background: "#FFFFFF",
                    border: "1px solid #FFFFFF",
                    color: "#000000",
                    padding: "12px 32px",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >Save</button>
                  <button onClick={handleCancel} style={{
                    background: "transparent",
                    border: "1px solid #333333",
                    color: "#888888",
                    padding: "12px 32px",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
                    onMouseLeave={e => e.currentTarget.style.color = "#888888"}
                  >Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <h1 style={{
                  fontSize: "42px",
                  fontWeight: 300,
                  margin: "0 0 12px 0",
                  letterSpacing: "-0.02em",
                }}>
                  {profile.name}
                </h1>
                <p style={{
                  color: "#888888",
                  fontSize: "16px",
                  margin: "0 0 32px 0",
                  fontWeight: 400,
                }}>
                  {profile.studying}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#666666",
                    cursor: "pointer",
                    padding: "0",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    borderBottom: "1px solid transparent",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.borderBottom = "1px solid #FFFFFF";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "#666666";
                    e.currentTarget.style.borderBottom = "1px solid transparent";
                  }}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            borderTop: "1px solid #222222",
            paddingTop: "48px",
          }}>
            {[
              { value: `${questionsCompleted}`, label: "Questions Solved" },
              { value: `${stats.totalQuestions}`, label: "Total Available" },
              { value: "12", label: "Day Streak" },
              { value: "47", label: "Hours Logged" },
            ].map((stat, i) => (
              <div key={i}>
                <div style={{
                  color: "#FFFFFF",
                  fontSize: "36px",
                  fontWeight: 300,
                  fontFamily: "'JetBrains Mono', monospace", // Keep mono for numbers
                  marginBottom: "8px"
                }}>
                  {stat.value}
                </div>
                <div style={{
                  color: "#666666",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Column: Progress & Activity ─────────────────── */}
        <div style={{
          flex: "2 1 600px",
          display: "flex",
          flexDirection: "column",
          gap: "80px",
          paddingTop: "16px",
        }}>

          {/* Progress Section */}
          <div>
            <div style={{
              color: "#FFFFFF",
              fontSize: "14px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "40px",
              borderBottom: "1px solid #222222",
              paddingBottom: "16px",
            }}>
              Subject Progression
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {SUBJECTS.map((subject, i) => {
                const progress = [75, 60, 80, 45, 30][i] ?? 50;
                const completed = Math.round(subject.questions.length * progress / 100);

                return (
                  <div key={subject.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ color: "#CCCCCC", fontSize: "14px", fontWeight: 400 }}>{subject.name}</span>
                      <span style={{ color: "#666666", fontSize: "14px", fontFamily: "'JetBrains Mono', monospace" }}>
                        {completed} / {subject.questions.length}
                      </span>
                    </div>
                    {/* B&W Minimalist Progress Bar */}
                    <div style={{ height: "2px", background: "#1A1A1A", width: "100%" }}>
                      <div style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: "#FFFFFF",
                        transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Section */}
          <div>
            <div style={{
              color: "#FFFFFF",
              fontSize: "14px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "40px",
              borderBottom: "1px solid #222222",
              paddingBottom: "16px",
            }}>
              System Log
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { action: "Completed", item: "BFS & Shortest Path", subject: "PDSA", time: "2h ago" },
                { action: "Started", item: "OOP Fundamentals", subject: "Java", time: "5h ago" },
                { action: "Completed", item: "Flask Routing", subject: "MAD 1", time: "1d ago" },
                { action: "Reviewed", item: "Statistics & Math", subject: "Python", time: "2d ago" },
              ].map((activity, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "24px",
                  padding: "24px 0",
                  borderBottom: "1px solid #111111",
                }}>
                  {/* Minimalist Dot */}
                  <div style={{
                    width: "6px",
                    height: "6px",
                    border: "1px solid #FFFFFF",
                    background: activity.action === "Completed" ? "#FFFFFF" : "transparent",
                    flexShrink: 0,
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ color: "#888888", fontSize: "14px" }}>
                      {activity.action}{" "}
                      <span style={{ color: "#FFFFFF" }}>{activity.item}</span>
                      {" "}
                      <span style={{ color: "#444444" }}>— {activity.subject}</span>
                    </span>
                  </div>

                  <span style={{
                    color: "#555555",
                    fontSize: "12px",
                    flexShrink: 0,
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}