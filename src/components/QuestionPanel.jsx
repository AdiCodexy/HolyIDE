import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";
import AddQuestionModal from "./AddQuestionModal";
import { SNIPPETS } from "./snippets";

export default function QuestionPanel({ activePaperId, width, question, loading, setQuestion, onDeleteQuestion }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSolution, setShowSolution] = useState(false); // Collapsible status toggle state for solutions
  const [isAdmin, setIsAdmin] = useState(false);
  const isCustom = !SNIPPETS[activePaperId];

  // Define your exact admin account authorization constraint string
  const ADMIN_EMAIL = "adityakarale7@gmail.com";

  // 1. Verify user profile properties to safely manage admin interface permissions
  useEffect(() => {
    async function checkAdminPrivileges() {
      if (!isSupabaseConfigured) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
    checkAdminPrivileges();
  }, []);

  // 2. Secret global keyboard gateway event intercept system
  useEffect(() => {
    const handleGlobalShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'q') {
        if (isAdmin) {
          e.preventDefault();
          setShowAddModal((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, [isAdmin]);

  // 3. Reset solution view on active paper changes
  useEffect(() => {
    setTimeout(() => setShowSolution(false), 0);
  }, [activePaperId]);

  if (collapsed) {
    return (
      <div style={{
        width: "36px",
        height: "100%",
        background: "#0A0A0A",
        borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "12px",
        flexShrink: 0
      }}>
        <button
          onClick={() => setCollapsed(false)}
          title="Expand Question Panel"
          style={collapseToggleStyle}
        >
          »
        </button>
        <div style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          marginTop: "24px",
          color: "#7A7A7A",
          fontSize: "10px",
          letterSpacing: "0.1em",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          QUESTION PANEL
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        width: `${width}px`,
        height: "100%",
        background: "#0E0E0E",
        borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {/* Header */}
        <div style={{
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          background: "#0A0A0A",
          flexShrink: 0,
        }}>
          <span style={{ color: "#D4D4D4", fontSize: "11px", fontWeight: 600 }}>Assignment Question</span>
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse Panel"
            style={{ background: "transparent", border: "none", color: "#7A7A7A", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            «
          </button>
        </div>

        {/* Main Content Node Render Matrix */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          {loading ? (
            <div style={{ flex: 1 }} />
          ) : question ? (
            <>
              {question.screenshot_url && question.screenshot_url !== "placeholder" && (
                <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(255, 255, 255, 0.02)" }}>
                  <img
                    src={question.screenshot_url}
                    alt="Question Screenshot"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
              )}

              {question.question_text && (
                <div style={{ color: "#D4D4D4", fontSize: "12px", lineHeight: "1.6", whiteSpace: "pre-wrap", background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  {question.question_text}
                </div>
              )}

              {/* Render Test Cases if they exist */}
              {question.test_cases && question.test_cases.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                  <div style={{ color: "#7A7A7A", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Test Cases</div>
                  {question.test_cases.map((tc, idx) => (
                    <div key={idx} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.04)", borderRadius: "6px", padding: "12px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ color: "#7A7A7A", width: "60px", flexShrink: 0 }}>Input:</span> 
                        <span style={{ color: "#D4D4D4", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre-wrap" }}>{tc.input || "(none)"}</span>
                      </div>
                      <div style={{ height: "1px", background: "rgba(255,255,255,0.03)" }}></div>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ color: "#7A7A7A", width: "60px", flexShrink: 0 }}>Expected:</span> 
                        <span style={{ color: "#34D399", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre-wrap" }}>{tc.expected}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Collapsible Answer Key Render Frame Block */}
              {question.answer_text && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                  <button
                    onClick={() => setShowSolution((prev) => !prev)}
                    style={{
                      background: showSolution ? "rgba(239, 68, 68, 0.15)" : "transparent",
                      border: "1px solid #EF4444",
                      color: "#EF4444",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {showSolution ? "Hide Answer Key" : "Reveal Answer Key"}
                  </button>

                  {showSolution && (
                    <div style={{
                      background: "#0A0A0A",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      padding: "14px",
                      borderRadius: "8px",
                      color: "#FCA5A5",
                      fontSize: "12px",
                      whiteSpace: "pre",
                      overflowX: "auto",
                      lineHeight: "1.5"
                    }}>
                      {question.answer_text}
                    </div>
                  )}
                </div>
              )}

              {(!question.screenshot_url || question.screenshot_url === "placeholder") && !question.question_text && (
                <div style={{ color: "#7A7A7A", fontSize: "12px", textAlign: "center", marginTop: "20px" }}>
                  No details provided for this question.
                </div>
              )}

              {/* Admin edit button */}
              {isAdmin && (
                <div style={{ marginTop: "16px" }}>
                  <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                      width: "100%",
                      background: "rgba(52, 211, 153, 0.1)",
                      border: "1px solid rgba(52, 211, 153, 0.3)",
                      color: "#34D399",
                      borderRadius: "0px",
                      padding: "8px 12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#34D399";
                      e.currentTarget.style.color = "#000000";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(52, 211, 153, 0.1)";
                      e.currentTarget.style.color = "#34D399";
                    }}
                  >
                    Edit Question Details
                  </button>
                </div>
              )}

              {/* Admin delete button */}
              {isAdmin && isCustom && (
                <div style={{ marginTop: "24px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "16px" }}>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete this question? This will remove the question and all user submissions for it.`)) {
                        onDeleteQuestion(activePaperId);
                      }
                    }}
                    style={{
                      width: "100%",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#EF4444",
                      borderRadius: "0px",
                      padding: "8px 12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#EF4444";
                      e.currentTarget.style.color = "#000000";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                      e.currentTarget.style.color = "#EF4444";
                    }}
                  >
                    Delete Question
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "40px", gap: "16px", width: "100%" }}>
              <div style={{ color: "#7A7A7A", fontSize: "12px", textAlign: "center" }}>
                {isSupabaseConfigured
                  ? "No question found in database for this file."
                  : "Supabase not configured. Cannot fetch question."}
              </div>

              {/* Only displays addition buttons if authorized admin email matching verification succeeds */}
              {isSupabaseConfigured && isAdmin && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", alignItems: "center" }}>
                  <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                      background: "rgba(52, 211, 153, 0.1)",
                      border: "1px solid rgba(52, 211, 153, 0.3)",
                      color: "#34D399",
                      borderRadius: "0px",
                      padding: "6px 12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    + Add Question Details
                  </button>
                  {isCustom && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete this question?`)) {
                          onDeleteQuestion(activePaperId);
                        }
                      }}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#EF4444",
                        borderRadius: "0px",
                        padding: "6px 12px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        width: "100%",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      Delete Empty Question
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddQuestionModal
          activePaperId={activePaperId}
          existingQuestion={question}
          onClose={() => setShowAddModal(false)}
          onSuccess={(newQuestion) => {
            const filePath = activePaperId.replace(/\\/g, '/');
            if (!window.__questionCache) window.__questionCache = {};
            window.__questionCache[filePath] = newQuestion;

            setQuestion(newQuestion);
            setShowAddModal(false);
          }}
        />
      )}
    </>
  );
}

const collapseToggleStyle = { background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#FFFFFF", cursor: "pointer", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" };