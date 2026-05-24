import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";
import { SNIPPETS } from "./snippets";

function getSubjectName(filePath) {
  if (!filePath) return "Uncategorized";
  const firstSegment = filePath.split('/')[0] || "Uncategorized";
  
  if (firstSegment.startsWith("py-") || firstSegment === "py") return "Python";
  if (firstSegment.startsWith("pdsa-") || firstSegment === "pdsa") return "PDSA";
  if (firstSegment.startsWith("mad1-") || firstSegment === "mad1") return "MAD 1";
  if (firstSegment.startsWith("mad2-") || firstSegment === "mad2") return "MAD 2";
  if (firstSegment.startsWith("java-") || firstSegment === "java") return "Java";
  
  return firstSegment;
}

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

export default function ProfilePage({ onClose, userId = null, userName = null }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({ name: "Student", studying: "Data Science", aboutMe: "", avatarUrl: null });

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStudying, setEditStudying] = useState("");
  const [editAboutMe, setEditAboutMe] = useState("");

  // Dynamic Data States
  const [globalStats, setGlobalStats] = useState({ solved: 0, total: 0 });
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  const isReadOnly = !!userId;

  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured) {
        setGlobalStats({ solved: 0, total: 0 });
        setSubjectProgress([]);
        setActivityLog([]);
        
        if (isReadOnly) {
          const mockFriends = {
            "mock-alice": {
              name: "Alice Vance",
              studying: "Computer Science",
              aboutMe: "Deep learning enthusiast and algorithm lover. Currently working on competitive programming.",
              solved: 12,
              total: 18,
              progress: [
                { name: "Python", completed: 5, total: 6 },
                { name: "PDSA", completed: 4, total: 6 },
                { name: "Java", completed: 3, total: 6 }
              ],
              logs: [
                { action: "Solved", item: "binary_search", subject: "PDSA", time: "2h ago" },
                { action: "Updated", item: "lists_basics", subject: "Python", time: "1d ago" }
              ]
            },
            "mock-bob": {
              name: "Bob Smith",
              studying: "Data Science",
              aboutMe: "Aspiring data analyst. Enjoys cleaning data and making graphs.",
              solved: 6,
              total: 18,
              progress: [
                { name: "Python", completed: 4, total: 6 },
                { name: "PDSA", completed: 1, total: 6 },
                { name: "Java", completed: 1, total: 6 }
              ],
              logs: [
                { action: "Updated", item: "variables", subject: "Python", time: "5h ago" }
              ]
            },
            "mock-charlie": {
              name: "Charlie Kovach",
              studying: "Software Engineering",
              aboutMe: "Full stack developer. Working on building compilers.",
              solved: 15,
              total: 18,
              progress: [
                { name: "Python", completed: 6, total: 6 },
                { name: "PDSA", completed: 5, total: 6 },
                { name: "Java", completed: 4, total: 6 }
              ],
              logs: [
                { action: "Solved", item: "sorting_algorithms", subject: "PDSA", time: "1h ago" },
                { action: "Solved", item: "inheritance", subject: "Java", time: "3h ago" }
              ]
            }
          };

          const friend = mockFriends[userId] || {
            name: userName || "Friend",
            studying: "Data Science",
            aboutMe: "Active user on Holy IDE.",
            solved: 2,
            total: 18,
            progress: [],
            logs: []
          };

          setProfile({ name: friend.name, studying: friend.studying, aboutMe: friend.aboutMe, avatarUrl: null });
          setGlobalStats({ solved: friend.solved, total: friend.total });
          setSubjectProgress(friend.progress);
          setActivityLog(friend.logs);
        } else {
          const guestName = localStorage.getItem("profile_name_guest") || "Student";
          const guestStudying = localStorage.getItem("profile_studying_guest") || "Data Science";
          const guestAboutMe = localStorage.getItem("profile_aboutme_guest") || "Passionate computer science student learning data structures, algorithms, and web technologies.";
          
          setProfile({
            name: guestName,
            studying: guestStudying,
            aboutMe: guestAboutMe,
            avatarUrl: null
          });
          setEditName(guestName);
          setEditStudying(guestStudying);
          setEditAboutMe(guestAboutMe);
        }
        return;
      }

      try {
        let targetUserId = userId;
        let isCurrentUser = false;

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          setSession(currentSession);
          if (!targetUserId) {
            targetUserId = currentSession.user.id;
            isCurrentUser = true;
          } else if (targetUserId === currentSession.user.id) {
            isCurrentUser = true;
          }
        }

        if (!targetUserId) return;

        // 1. Load Profile Metadata
        let googleAvatar = null;
        let profileData = null;
        let aboutMeVal = "";

        if (isCurrentUser && currentSession) {
          googleAvatar = currentSession.user.user_metadata?.avatar_url;
        }

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name, studying, about_me')
            .eq('id', targetUserId)
            .single();

          if (!error && data) {
            profileData = data;
            aboutMeVal = data.about_me || "";
          } else {
            // Fallback
            const { data: fallbackData } = await supabase
              .from('profiles')
              .select('name, studying')
              .eq('id', targetUserId)
              .single();
            profileData = fallbackData;
            aboutMeVal = localStorage.getItem(`about_me_${targetUserId}`) || "";
          }
        } catch {
          const { data: fallbackData } = await supabase
            .from('profiles')
            .select('name, studying')
            .eq('id', targetUserId)
            .single();
          profileData = fallbackData;
          aboutMeVal = localStorage.getItem(`about_me_${targetUserId}`) || "";
        }

        const currentName = profileData?.name || (isCurrentUser && currentSession ? (currentSession.user.user_metadata?.full_name || currentSession.user.user_metadata?.name) : null) || userName || "Student";
        const currentStudying = profileData?.studying || "Data Science";

        setProfile({ name: currentName, studying: currentStudying, aboutMe: aboutMeVal, avatarUrl: googleAvatar });
        
        if (!isReadOnly) {
          setEditName(currentName);
          setEditStudying(currentStudying);
          setEditAboutMe(aboutMeVal);
        }

        // 2. Load Questions (to get the denominator/totals)
        const { data: questionsData } = await supabase.from('questions').select('file_path');

        // 3. Load User Code
        const { data: userCodeData } = await supabase
          .from('user_code')
          .select('file_path, updated_at, code_content')
          .eq('user_id', targetUserId)
          .order('updated_at', { ascending: false });

        // 4. Calculate Stats
        const statsMap = {};
        let totalQuestions = 0;
        let totalSolved = 0;

        // Map out all available questions by subject
        questionsData?.forEach(q => {
          if (!q.file_path) return;
          const subject = getSubjectName(q.file_path);
          if (!statsMap[subject]) statsMap[subject] = { name: subject, total: 0, completed: 0 };
          statsMap[subject].total++;
          totalQuestions++;
        });

        // Map out what the user has completed
        userCodeData?.forEach(c => {
          if (!c.file_path) return;
          if (c.code_content && c.code_content.trim() !== "") {
            const subject = getSubjectName(c.file_path);
            if (statsMap[subject]) {
              statsMap[subject].completed++;
            } else {
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
          const subject = getSubjectName(c.file_path);
          const filename = c.file_path.split('/').pop() || "code";
          let cleanName = filename.replace(/\.[^/.]+$/, "");

          // Lookup snippet for readable file name
          if (SNIPPETS[cleanName]) {
            const snippet = SNIPPETS[cleanName];
            cleanName = snippet.filename.replace(/\.[^/.]+$/, "");
          }

          return {
            action: "Updated",
            item: cleanName,
            subject: subject,
            time: timeAgo(c.updated_at)
          };
        }) || [];

        setActivityLog(recent);
      } catch (err) {
        console.error("Failed to load profile data:", err);
      }
    }

    loadData();
  }, [userId, userName, isReadOnly]);

  const handleSave = async () => {
    setProfile(p => ({ ...p, name: editName, studying: editStudying, aboutMe: editAboutMe }));
    setEditing(false);

    if (!isSupabaseConfigured) {
      localStorage.setItem("profile_name_guest", editName);
      localStorage.setItem("profile_studying_guest", editStudying);
      localStorage.setItem("profile_aboutme_guest", editAboutMe);
      return;
    }

    if (session && isSupabaseConfigured) {
      localStorage.setItem(`about_me_${session.user.id}`, editAboutMe);
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            name: editName,
            studying: editStudying,
            about_me: editAboutMe,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.warn("Could not save 'about_me' to database, falling back to name/studying only:", error);
          await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              name: editName,
              studying: editStudying,
              updated_at: new Date().toISOString()
            });
        }
      } catch (err) {
        console.error("Failed to save profile:", err);
      }
    }
  };

  const handleCancel = () => {
    setEditName(profile.name);
    setEditStudying(profile.studying);
    setEditAboutMe(profile.aboutMe);
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
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#FFFFFF",
            cursor: "pointer",
            padding: "10px 24px",
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            borderRadius: "4px",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#000000"; e.currentTarget.style.borderColor = "#FFFFFF"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"; }}
        >
          {isReadOnly ? "← Back to Search" : "← Return to IDE"}
        </button>
      </div>

      {/* ── Main Desktop Grid ─────────────────────────────────── */}
      <div style={{
        maxWidth: "1400px", margin: "0 auto", padding: "0 60px 80px 60px",
        display: "flex", flexWrap: "wrap", gap: "60px",
      }}>

        {/* ── Left Column: Profile & Stats ────────────────────── */}
        <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "32px" }}>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.01)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}>
            <div style={{
              width: "140px", height: "140px",
              background: profile.avatarUrl ? `url(${profile.avatarUrl}) center/cover no-repeat` : "#111111",
              border: "2px solid #FFFFFF",
              boxShadow: "0 0 20px rgba(255, 255, 255, 0.05)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "48px", fontWeight: 300, color: "#FFFFFF",
              filter: "grayscale(100%)",
              borderRadius: "8px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 0 25px rgba(255, 255, 255, 0.15)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.05)";
            }}
            >
              {!profile.avatarUrl && profile.name.charAt(0).toUpperCase()}
            </div>

            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <input
                  value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" autoFocus
                  style={{
                    background: "transparent", border: "none", borderBottom: "1px solid #555555",
                    color: "#FFFFFF", padding: "8px 0", fontSize: "28px", fontWeight: 300, outline: "none",
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
                <textarea
                  value={editAboutMe} onChange={e => setEditAboutMe(e.target.value)} placeholder="About Me (interests, goals, bio...)"
                  rows={4}
                  style={{
                    background: "transparent", border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#CCCCCC", padding: "10px", fontSize: "13px", fontWeight: 400, outline: "none",
                    fontFamily: "inherit", transition: "border-color 0.2s, background-color 0.2s",
                    borderRadius: "6px",
                    resize: "vertical"
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; e.currentTarget.style.background = "transparent"; }}
                />
                <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                  <button onClick={handleSave} style={{
                    background: "#FFFFFF", border: "1px solid #FFFFFF", color: "#000000",
                    padding: "12px 32px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em",
                    cursor: "pointer", transition: "opacity 0.2s", borderRadius: "4px"
                  }}>Save</button>
                  <button onClick={handleCancel} style={{
                    background: "transparent", border: "1px solid #333333", color: "#888888",
                    padding: "12px 32px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em",
                    cursor: "pointer", transition: "color 0.2s", borderRadius: "4px"
                  }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <h1 style={{ fontSize: "36px", fontWeight: 300, margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
                    {profile.name}
                  </h1>
                  <p style={{ color: "#888888", fontSize: "14px", margin: "0 0 16px 0", fontWeight: 400 }}>
                    {profile.studying}
                  </p>
                  {profile.aboutMe && (
                    <div style={{
                      fontSize: "13px",
                      lineHeight: "1.6",
                      color: "#BBBBBB",
                      borderLeft: "2px solid rgba(255, 255, 255, 0.1)",
                      paddingLeft: "12px",
                      marginBottom: "16px",
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap"
                    }}>
                      {profile.aboutMe}
                    </div>
                  )}
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#888888",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                      width: "fit-content",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.borderColor = "#FFFFFF"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#888888"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"; }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            )}

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "24px",
            }}>
              {[
                { 
                  value: `${globalStats.solved}`, 
                  label: "Questions Solved",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#888888" }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                },
                { 
                  value: `${globalStats.total}`, 
                  label: "Total Available",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#888888" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                },
                { 
                  value: "N/A", 
                  label: "Day Streak",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#888888" }}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                },
                { 
                  value: "N/A", 
                  label: "Hours Logged",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#888888" }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "10px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    transition: "all 0.2s ease",
                    cursor: "default"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                      {stat.value}
                    </div>
                    {stat.icon}
                  </div>
                  <div style={{ color: "#666666", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column: Progress & Activity ─────────────────── */}
        <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "32px", paddingTop: "0" }}>

          {/* Progress Section */}
          <div style={{
            background: "rgba(255, 255, 255, 0.01)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "36px",
          }}>
            <div style={{
              color: "#FFFFFF", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: "32px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
              display: "flex", justifyContent: "space-between"
            }}>
              <span>Subject Progression</span>
              <span style={{ color: "#666666" }}>PROGRESS PANEL</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {subjectProgress.length === 0 ? (
                <div style={{ color: "#666666", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}>No questions available yet. Start adding them!</div>
              ) : (
                subjectProgress.map((subject) => {
                  const percentage = subject.total > 0 ? Math.round((subject.completed / subject.total) * 100) : 0;

                  return (
                    <div key={subject.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "baseline" }}>
                        <span style={{ color: "#E2E8F0", fontSize: "13px", fontWeight: 500 }}>{subject.name}</span>
                        <div style={{ display: "flex", gap: "12px", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
                          <span style={{ color: "#666666" }}>
                            {subject.completed} / {subject.total}
                          </span>
                          <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{percentage}%</span>
                        </div>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.05)", width: "100%", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${percentage}%`,
                          background: "#FFFFFF",
                          borderRadius: "3px",
                          transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
                        }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Activity Section */}
          <div style={{
            background: "rgba(255, 255, 255, 0.01)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "36px",
          }}>
            <div style={{
              color: "#FFFFFF", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: "32px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
              display: "flex", justifyContent: "space-between"
            }}>
              <span>System Log</span>
              <span style={{ color: "#666666" }}>ACTIVITY STREAM</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", position: "relative", paddingLeft: "24px" }}>
              {/* Vertical timeline line */}
              {activityLog.length > 0 && (
                <div style={{
                  position: "absolute",
                  left: "5px",
                  top: "10px",
                  bottom: "24px",
                  width: "1px",
                  background: "rgba(255, 255, 255, 0.08)"
                }} />
              )}

              {activityLog.length === 0 ? (
                <div style={{ color: "#666666", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", marginLeft: "-24px" }}>Awaiting execution logs...</div>
              ) : (
                activityLog.map((activity, i) => (
                  <div 
                    key={i} 
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      paddingBottom: "24px",
                      transition: "all 0.2s"
                    }}
                  >
                    {/* Timeline dot */}
                    <div style={{
                      position: "absolute",
                      left: "-23px",
                      top: "5px",
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      border: "1px solid #FFFFFF",
                      background: "#000000",
                      zIndex: 2
                    }} />
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ fontSize: "13px", color: "#888888", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          fontSize: "9px",
                          fontFamily: "'JetBrains Mono', monospace",
                          background: "rgba(255, 255, 255, 0.06)",
                          color: "#FFFFFF",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          letterSpacing: "0.05em"
                        }}>
                          {activity.action.toUpperCase()}
                        </span>
                        <span style={{ color: "#FFFFFF", fontWeight: 500 }}>{activity.item}</span>
                        <span style={{ color: "#444444" }}>—</span>
                        <span style={{ color: "#666666", fontSize: "12px" }}>{activity.subject}</span>
                      </div>
                      <span style={{ color: "#555555", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>
                        {activity.time}
                      </span>
                    </div>
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