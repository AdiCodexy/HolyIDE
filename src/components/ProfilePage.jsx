import { useState, useEffect } from "react";
import { SUBJECTS } from "./snippets";

// Load/save profile from localStorage
const STORAGE_KEY = "holy-ide-profile";
const defaultProfile = { name: "Student", studying: "B.Sc Computer Science" };

function loadProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
  } catch { return defaultProfile; }
}
function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function getStats() {
  const totalQuestions = SUBJECTS.reduce((sum, s) => sum + s.questions.length, 0);
  return { totalQuestions, totalSubjects: SUBJECTS.length };
}

// ── Full-page Profile ──────────────────────────────────────────────
export default function ProfilePage({ onClose }) {
  const [profile, setProfile] = useState(loadProfile);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editStudying, setEditStudying] = useState(profile.studying);
  const stats = getStats();

  useEffect(() => { saveProfile(profile); }, [profile]);

  const handleSave = () => {
    setProfile(p => ({ ...p, name: editName, studying: editStudying }));
    setEditing(false);
  };
  const handleCancel = () => {
    setEditName(profile.name);
    setEditStudying(profile.studying);
    setEditing(false);
  };

  const questionsCompleted = Math.floor(stats.totalQuestions * 0.6);

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: "#0A0A0A",
      overflowY: "auto",
      fontFamily: "'JetBrains Mono', monospace",
    }}>

      {/* ── Banner ──────────────────────────────────────────────── */}
      <div style={{
        height: "220px",
        background: "linear-gradient(135deg, #1e3a5f 0%, #3b2682 30%, #2563eb 60%, #1e3a5f 100%)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 80% 20%, rgba(96,165,250,0.25) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(139,92,246,0.20) 0%, transparent 50%)",
        }} />

        {/* Back button — over the banner */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            left: "24px",
            background: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "10px",
            color: "#FFFFFF",
            cursor: "pointer",
            padding: "8px 18px",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.03em",
            fontFamily: "'JetBrains Mono', monospace",
            transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 2,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.30)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
          }}
        >
          ← Back
        </button>
      </div>

      {/* ── Profile info (overlaps banner bottom) ───────────────── */}
      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "0 32px",
        marginTop: "-60px",
        position: "relative",
        zIndex: 2,
      }}>

        {/* Avatar */}
        <div style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3b2682, #2563eb)",
          border: "4px solid #0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "38px",
          color: "#FFFFFF",
          fontWeight: 600,
          boxShadow: "0 6px 28px rgba(37, 99, 235, 0.35)",
        }}>
          {profile.name.charAt(0).toUpperCase()}
        </div>

        {/* Name & studying */}
        <div style={{ marginTop: "20px" }}>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "360px" }}>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Your name"
                autoFocus
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "10px",
                  color: "#FFFFFF",
                  padding: "10px 14px",
                  fontSize: "18px",
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
              />
              <input
                value={editStudying}
                onChange={e => setEditStudying(e.target.value)}
                placeholder="What are you studying?"
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "10px",
                  color: "#9A9A9A",
                  padding: "10px 14px",
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleSave} style={{
                  background: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  color: "#0A0A0A",
                  padding: "8px 20px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>Save</button>
                <button onClick={handleCancel} style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.10)",
                  borderRadius: "10px",
                  color: "#9A9A9A",
                  padding: "8px 20px",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <h1 style={{
                  color: "#FFFFFF",
                  fontSize: "28px",
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}>
                  {profile.name}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                    borderRadius: "8px",
                    color: "#6B6B6B",
                    cursor: "pointer",
                    padding: "5px 14px",
                    fontSize: "10px",
                    fontWeight: 500,
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: "all 200ms",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "#6B6B6B";
                  }}
                >
                  Edit
                </button>
              </div>
              <p style={{
                color: "#5A5A5A",
                fontSize: "13px",
                marginTop: "6px",
                margin: "6px 0 0 0",
              }}>
                {profile.studying}
              </p>
            </div>
          )}
        </div>

        {/* ── Stats row ─────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          gap: "0",
          marginTop: "32px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          paddingBottom: "28px",
        }}>
          {[
            { value: `${questionsCompleted}`, label: "solved" },
            { value: `${stats.totalQuestions}`, label: "total" },
            { value: "12", label: "day streak" },
            { value: "47h", label: "logged" },
            { value: "86%", label: "accuracy" },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1,
              textAlign: i === 0 ? "left" : "center",
            }}>
              <div style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                {stat.value}
              </div>
              <div style={{ color: "#4A4A4A", fontSize: "9px", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Progress by Subject (no box) ───────────────────────── */}
        <div style={{ marginTop: "32px" }}>
          <div style={{
            color: "#6B6B6B",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 500,
            marginBottom: "20px",
          }}>
            Progress by Subject
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {SUBJECTS.map((subject, i) => {
              const progress = [75, 60, 80, 45, 30][i] ?? 50;
              const completed = Math.round(subject.questions.length * progress / 100);
              const colors = ["#60A5FA", "#34D399", "#FBBF24", "#F87171", "#A78BFA"];
              return (
                <div key={subject.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ color: "#C0C0C0", fontSize: "12px", fontWeight: 500 }}>{subject.name}</span>
                    <span style={{ color: "#4A4A4A", fontSize: "10px" }}>{completed}/{subject.questions.length}</span>
                  </div>
                  <div style={{ height: "5px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${progress}%`,
                      background: colors[i] ?? "#60A5FA",
                      borderRadius: "4px",
                      transition: "width 800ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Activity (no box) ──────────────────────────── */}
        <div style={{ marginTop: "40px", paddingBottom: "60px" }}>
          <div style={{
            color: "#6B6B6B",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 500,
            marginBottom: "20px",
          }}>
            Recent Activity
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {[
              { action: "Completed", item: "BFS & Shortest Path", subject: "PDSA", time: "2h ago", color: "#34D399" },
              { action: "Started", item: "OOP Fundamentals", subject: "Java", time: "5h ago", color: "#60A5FA" },
              { action: "Completed", item: "Flask Routing", subject: "MAD 1", time: "1d ago", color: "#34D399" },
              { action: "Reviewed", item: "Statistics & Math", subject: "Python", time: "2d ago", color: "#FBBF24" },
              { action: "Completed", item: "Vue.js Components", subject: "MAD 2", time: "3d ago", color: "#34D399" },
            ].map((activity, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 0",
                borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
              }}>
                {/* Status dot */}
                <div style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: activity.color,
                  flexShrink: 0,
                  boxShadow: `0 0 8px ${activity.color}40`,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: "#7A7A7A", fontSize: "11px" }}>
                    {activity.action}{" "}
                    <span style={{ color: "#FFFFFF", fontWeight: 500 }}>{activity.item}</span>
                    {" "}
                    <span style={{ color: "#3A3A3A" }}>· {activity.subject}</span>
                  </span>
                </div>
                <span style={{ color: "#3A3A3A", fontSize: "10px", flexShrink: 0 }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
