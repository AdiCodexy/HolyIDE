import { useState } from "react";
import { SUBJECTS } from "./snippets";

// Props
// ─────
// activeId      : string        — which question is currently selected (owned by App)
// onSelect      : (id) => void  — notify App of a new selection
// width         : number        — px width driven by App's drag state
// onOpenProfile : () => void    — open the profile page
// onGoHome      : () => void    — go back to home page
// subjectFilter : string|null   — only show this subject (null = all)
export default function Sidebar({ activeId, onSelect, width = 250, onOpenProfile, onGoHome, subjectFilter }) {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(() => {
    const map = {};
    SUBJECTS.forEach(s => { map[s.name] = true; });
    return map;
  });

  const toggleSubject = (name) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Filter subjects based on subjectFilter
  const visibleSubjects = subjectFilter
    ? SUBJECTS.filter(s => s.name === subjectFilter)
    : SUBJECTS;

  const activeSubject = visibleSubjects.find(s =>
    s.questions.some(q => q.id === activeId)
  )?.name;

  // Get user initial from localStorage
  const userName = (() => {
    try {
      const saved = localStorage.getItem("holy-ide-profile");
      return saved ? JSON.parse(saved).name || "S" : "S";
    } catch { return "S"; }
  })();

  return (
    <aside style={{
      width: collapsed ? "48px" : `${width}px`,
      background: "#0F0F0F",
      borderRight: "1px solid rgba(255, 255, 255, 0.06)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace",
    }}>

      {/* ── Top controls ─────────────────────────────────────── */}
      <div style={{
        display: "flex",
        flexDirection: collapsed ? "column" : "row",
        alignItems: "center",
        gap: "6px",
        padding: collapsed ? "10px 6px" : "10px 12px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        {/* Back to home arrow */}
        <button
          onClick={onGoHome}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#6B6B6B",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "color 150ms, background 150ms, border-color 150ms",
            fontFamily: "'JetBrains Mono', monospace",
            padding: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.10)";
            e.currentTarget.style.color = "#FFFFFF";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.20)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
            e.currentTarget.style.color = "#6B6B6B";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
          }}
          title="Back to Home"
        >
          ←
        </button>

        {/* Profile avatar — hidden when collapsed */}
        {!collapsed && (
          <button
            onClick={onOpenProfile}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
              border: "1px solid rgba(255, 255, 255, 0.10)",
              color: "#FFFFFF",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "border-color 150ms, transform 150ms",
              fontFamily: "'JetBrains Mono', monospace",
              padding: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.10)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title="Profile"
          >
            {userName.charAt(0).toUpperCase()}
          </button>
        )}

        {/* Username */}
        {!collapsed && (
          <span style={{
            color: "#7A7A7A",
            fontSize: "10px",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
          }}>
            {userName}
          </span>
        )}

        {/* Collapse / Expand toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: "none",
            border: "none",
            color: "#4A4A4A",
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: "6px",
            transition: "color 150ms, background 150ms",
            fontSize: "11px",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "#FFFFFF";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "#4A4A4A";
            e.currentTarget.style.background = "none";
          }}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Subject → Question tree */}
      <nav style={{ overflowY: "auto", flex: 1, padding: "6px 0" }}>
        {visibleSubjects.map(subject => {
          const isSubjectActive = activeSubject === subject.name;
          const isExpanded = expanded[subject.name];

          return (
            <div key={subject.name}>
              {/* Subject header — click to expand/collapse */}
              <button
                onClick={() => !collapsed && toggleSubject(subject.name)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: collapsed ? "10px 0" : "8px 14px",
                  display: "flex",
                  alignItems: collapsed ? "center" : "flex-start",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: "8px",
                  transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                  textAlign: "left",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {collapsed ? (
                  <span style={{
                    color: isSubjectActive ? "#FFFFFF" : "#4A4A4A",
                    fontSize: "9px",
                    fontWeight: 600,
                  }}>
                    {subject.name.charAt(0)}
                  </span>
                ) : (
                  <>
                    {/* Chevron */}
                    <span style={{
                      color: "#4A4A4A",
                      fontSize: "8px",
                      transition: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      display: "inline-block",
                      width: "8px",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}>
                      ▶
                    </span>
                    <span style={{
                      color: isSubjectActive ? "#FFFFFF" : "#8A8A8A",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                      transition: "color 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }}>
                      {subject.name}
                    </span>
                    {/* Question count badge */}
                    <span style={{
                      marginLeft: "auto",
                      color: "#4A4A4A",
                      fontSize: "8px",
                      background: "rgba(255, 255, 255, 0.06)",
                      padding: "1px 6px",
                      borderRadius: "8px",
                      fontWeight: 500,
                    }}>
                      {subject.questions.length}
                    </span>
                  </>
                )}
              </button>

              {/* Questions list — shown when expanded */}
              {!collapsed && isExpanded && (
                <div style={{ paddingBottom: "4px" }}>
                  {subject.questions.map(q => {
                    const isActive = activeId === q.id;
                    return (
                      <button
                        key={q.id}
                        onClick={() => onSelect(q.id)}
                        style={{
                          width: "100%",
                          background: isActive ? "rgba(255, 255, 255, 0.95)" : "transparent",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          padding: "6px 14px 6px 30px",
                          marginBottom: "1px",
                          marginLeft: "8px",
                          marginRight: "8px",
                          maxWidth: "calc(100% - 16px)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "1px",
                          transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                          textAlign: "left",
                        }}
                        onMouseEnter={e => {
                          if (!isActive) e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                        }}
                        onMouseLeave={e => {
                          if (!isActive) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span style={{
                          color: isActive ? "#0A0A0A" : "#7A7A7A",
                          fontSize: "10px",
                          fontWeight: isActive ? 600 : 400,
                          transition: "color 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}>
                          {q.label}
                        </span>
                        <span style={{
                          color: isActive ? "#3A3A3A" : "#3A3A3A",
                          fontSize: "8px",
                          transition: "color 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                        }}>
                          {q.filename}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          color: "#3A3A3A",
          fontSize: "9px",
          letterSpacing: "0.06em",
        }}>
          IIT-M · Holy IDE
        </div>
      )}
    </aside>
  );
}
