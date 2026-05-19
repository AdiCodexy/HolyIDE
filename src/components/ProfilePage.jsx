import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

// Helper to convert timestamps to "2h ago", "1d ago", etc.
function timeAgo(dateString) {
  if (!dateString) return "unknown";
  const seconds = Math.round((new Date() - new Date(dateString)) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function ProfilePage({ onClose }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({ name: "Student", studying: "Data Science", avatarUrl: null });

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStudying, setEditStudying] = useState("");

  // Dynamic Data States
  const [globalStats, setGlobalStats] = useState({ solved: 0, total: 0 });
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;
      setSession(session);

      // 1. Load Profile Metadata
      const googleAvatar = session.user.user_metadata?.avatar_url;
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, studying')
        .eq('id', session.user.id)
        .single();

      const currentName = profileData?.name || session.user.user_metadata?.full_name || "Student";
      const currentStudying = profileData?.studying || "Data Science";

      setProfile({ name: currentName, studying: currentStudying, avatarUrl: googleAvatar });
      setEditName(currentName);
      setEditStudying(currentStudying);

      // 2. Load Questions (to get the denominator/totals)
      const { data: questionsData } = await supabase.from('questions').select('file_path');

      // 3. Load User Code (to get the numerator/solved and recent activity)
      const { data: userCodeData } = await supabase
        .from('user_code')
        .select('file_path, updated_at, code_content')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      // 4. Calculate Stats
      const statsMap = {};
      let totalQuestions = 0;
      let totalSolved = 0;

      // Map out all available questions by subject (First folder in path, e.g. "Python/file.py" -> "Python")
      questionsData?.forEach(q => {
        if (!q.file_path) return;
        const subject = q.file_path.split('/')[0] || "Uncategorized";
        if (!statsMap[subject]) statsMap[subject] = { name: subject, total: 0, completed: 0 };
        statsMap[subject].total++;
        totalQuestions++;
      });

      // Map out what the user has completed
      userCodeData?.forEach(c => {
        if (!c.file_path) return;
        // We consider it "solved/attempted" if there is code content
        if (c.code_content && c.code_content.trim() !== "") {
          const subject = c.file_path.split('/')[0] || "Uncategorized";
          if (statsMap[subject]) {
            statsMap[subject].completed++;
          } else {
            // If they solved something that doesn't exist in questions anymore
            statsMap[subject] = { name: subject, total: 1, completed: 1 };
          }
          totalSolved++;
        }
      });

      setGlobalStats({ solved: totalSolved, total: totalQuestions });

      // Convert map to array and sort alphabetically
      const progressArray = Object.values(statsMap).sort((a, b) => a.name.localeCompare(b.name));
      setSubjectProgress(progressArray);

      // 5. Generate System Log from the 5 most recently updated files
      const recent = userCodeData?.slice(0, 5).map(c => {
        const parts = c.file_path.split('/');
        const subject = parts[0];
        const filename = parts[parts.length - 1];

        return {
          action: "Updated",
          item: filename.replace(/\.[^/.]+$/, ""), // Removes the extension (e.g., .py, .java)
          subject: subject,
          time: timeAgo(c.updated_at)
        };
      }) || [];

      setActivityLog(recent);
    }

    loadData();
  }, []);

  const handleSave = async () => {
    setProfile(p => ({ ...p, name: editName, studying: editStudying }));
    setEditing(false);

    if (session) {
      await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          name: editName,
          studying: editStudying,
          updated_at: new Date().toISOString()
        });
    }
  };

  const handleCancel = () => {
    setEditName(profile.name);
    setEditStudying(profile.studying);
    setEditing(false);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "#000000",
      color: "#FFFFFF",
      overflowY: "auto",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      boxSizing: "border-box",
    }}>

      {/* ── Top Navigation ────────────────────────────────────── */}
      <div style={{ padding: "40px 60px", display: "flex", alignItems: "center" }}>
        <button
          onClick={onClose}
          style={{
            background: "transparent", border: "1px solid #333333", color: "#FFFFFF",
            cursor: "pointer", padding: "10px 24px", fontSize: "12px",
            letterSpacing: "0.05em", textTransform: "uppercase", transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#000000"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#FFFFFF"; }}
        >
          Return
        </button>
      </div>

      {/* ── Main Desktop Grid ─────────────────────────────────── */}
      <div style={{
        maxWidth: "1400px", margin: "0 auto", padding: "0 60px 80px 60px",
        display: "flex", flexWrap: "wrap", gap: "100px",
      }}>

        {/* ── Left Column: Profile & Stats ────────────────────── */}
        <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: "48px" }}>

          <div>
            <div style={{
              width: "160px", height: "160px",
              background: profile.avatarUrl ? `url(${profile.avatarUrl}) center/cover no-repeat` : "#111111",
              border: "1px solid #333333", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "48px", fontWeight: 300, color: "#FFFFFF", marginBottom: "32px",
              filter: "grayscale(100%)",
            }}>
              {!profile.avatarUrl && profile.name.charAt(0).toUpperCase()}
            </div>

            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <input
                  value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" autoFocus
                  style={{
                    background: "transparent", border: "none", borderBottom: "1px solid #555555",
                    color: "#FFFFFF", padding: "8px 0", fontSize: "32px", fontWeight: 300, outline: "none",
                    fontFamily: "inherit", transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.currentTarget.style.borderBottomColor = "#FFFFFF"}
                  onBlur={e => e.currentTarget.style.borderBottomColor = "#555555"}
                />
                <input
                  value={editStudying} onChange={e => setEditStudying(e.target.value)} placeholder="Studying..."
                  style={{
                    background: "transparent", border: "none", borderBottom: "1px solid #555555",
                    color: "#888888", padding: "8px 0", fontSize: "16px", fontWeight: 400, outline: "none",
                    fontFamily: "inherit", transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.currentTarget.style.borderBottomColor = "#FFFFFF"}
                  onBlur={e => e.currentTarget.style.borderBottomColor = "#555555"}
                />
                <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                  <button onClick={handleSave} style={{
                    background: "#FFFFFF", border: "1px solid #FFFFFF", color: "#000000",
                    padding: "12px 32px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em",
                    cursor: "pointer", transition: "opacity 0.2s",
                  }}>Save</button>
                  <button onClick={handleCancel} style={{
                    background: "transparent", border: "1px solid #333333", color: "#888888",
                    padding: "12px 32px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em",
                    cursor: "pointer", transition: "color 0.2s",
                  }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <h1 style={{ fontSize: "42px", fontWeight: 300, margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
                  {profile.name}
                </h1>
                <p style={{ color: "#888888", fontSize: "16px", margin: "0 0 32px 0", fontWeight: 400 }}>
                  {profile.studying}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: "transparent", border: "none", color: "#666666", cursor: "pointer", padding: "0",
                    fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em",
                    borderBottom: "1px solid transparent", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.borderBottom = "1px solid #FFFFFF"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#666666"; e.currentTarget.style.borderBottom = "1px solid transparent"; }}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px",
            borderTop: "1px solid #222222", paddingTop: "48px",
          }}>
            {[
              { value: `${globalStats.solved}`, label: "Questions Solved" },
              { value: `${globalStats.total}`, label: "Total Available" },
              { value: "N/A", label: "Day Streak" }, // Requires a dedicated sessions table to track accurately
              { value: "N/A", label: "Hours Logged" }, // Requires a dedicated sessions table to track accurately
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ color: "#FFFFFF", fontSize: "36px", fontWeight: 300, fontFamily: "'JetBrains Mono', monospace", marginBottom: "8px" }}>
                  {stat.value}
                </div>
                <div style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Column: Progress & Activity ─────────────────── */}
        <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "80px", paddingTop: "16px" }}>

          {/* Progress Section */}
          <div>
            <div style={{
              color: "#FFFFFF", fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: "40px", borderBottom: "1px solid #222222", paddingBottom: "16px",
            }}>
              Subject Progression
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {subjectProgress.length === 0 ? (
                <div style={{ color: "#666", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}>No questions available yet. Start adding them!</div>
              ) : (
                subjectProgress.map((subject) => {
                  const percentage = subject.total > 0 ? (subject.completed / subject.total) * 100 : 0;

                  return (
                    <div key={subject.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <span style={{ color: "#CCCCCC", fontSize: "14px", fontWeight: 400 }}>{subject.name}</span>
                        <span style={{ color: "#666666", fontSize: "14px", fontFamily: "'JetBrains Mono', monospace" }}>
                          {subject.completed} / {subject.total}
                        </span>
                      </div>
                      <div style={{ height: "2px", background: "#1A1A1A", width: "100%" }}>
                        <div style={{
                          height: "100%",
                          width: `${percentage}%`,
                          background: "#FFFFFF",
                          transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Activity Section */}
          <div>
            <div style={{
              color: "#FFFFFF", fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: "40px", borderBottom: "1px solid #222222", paddingBottom: "16px",
            }}>
              System Log
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {activityLog.length === 0 ? (
                <div style={{ color: "#666", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}>Awaiting execution logs...</div>
              ) : (
                activityLog.map((activity, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "baseline", gap: "24px",
                    padding: "24px 0", borderBottom: "1px solid #111111",
                  }}>
                    <div style={{ width: "6px", height: "6px", border: "1px solid #FFFFFF", background: "#FFFFFF", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ color: "#888888", fontSize: "14px" }}>
                        {activity.action}{" "}
                        <span style={{ color: "#FFFFFF" }}>{activity.item}</span>
                        {" "}
                        <span style={{ color: "#444444" }}>— {activity.subject}</span>
                      </span>
                    </div>
                    <span style={{ color: "#555555", fontSize: "12px", flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                      {activity.time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}