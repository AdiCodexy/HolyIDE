import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";
import AddQuestionModal from "./AddQuestionModal";

export default function QuestionPanel({ activePaperId, width }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSolution, setShowSolution] = useState(false); // Collapsible status toggle state for solutions
  const [isAdmin, setIsAdmin] = useState(false);

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

  // 3. Document query listener tracking code file pathway selections
  useEffect(() => {
    if (!activePaperId) return;

    const filePath = activePaperId.replace(/\\/g, '/');

    async function fetchQuestion() {
      if (!isSupabaseConfigured) return;

      if (window.__questionCache?.[filePath] !== undefined) {
        setQuestion(window.__questionCache[filePath]);
        setLoading(false);
        setShowSolution(false);
        return;
      }

      setLoading(true);
      setShowSolution(false); // Make sure answers default to a hidden state on file swap!
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("screenshot_url, question_text, answer_text") // Fetches answer text column safely
          .eq("file_path", filePath)
          .single();

        if (!window.__questionCache) window.__questionCache = {};
        
        if (error) {
          window.__questionCache[filePath] = null;
          setQuestion(null);
        } else {
          window.__questionCache[filePath] = data;
          setQuestion(data);
        }
      } catch (err) {
        if (!window.__questionCache) window.__questionCache = {};
        window.__questionCache[filePath] = null;
        setQuestion(null);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestion();
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
              {question.screenshot_url && (
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

              {!question.screenshot_url && !question.question_text && (
                <div style={{ color: "#7A7A7A", fontSize: "12px", textAlign: "center", marginTop: "20px" }}>
                  No details provided for this question.
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "40px", gap: "16px" }}>
              <div style={{ color: "#7A7A7A", fontSize: "12px", textAlign: "center" }}>
                {isSupabaseConfigured
                  ? "No question found in database for this file."
                  : "Supabase not configured. Cannot fetch question."}
              </div>

              {/* Only displays addition buttons if authorized admin email matching verification succeeds */}
              {isSupabaseConfigured && isAdmin && (
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    background: "rgba(52, 211, 153, 0.1)",
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                    color: "#34D399",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Add Question
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddQuestionModal
          activePaperId={activePaperId}
          onClose={() => setShowAddModal(false)}
          onSuccess={(newQuestion) => {
            setQuestion(newQuestion);
            setShowAddModal(false);
          }}
        />
      )}
    </>
  );
}

const collapseToggleStyle = { background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#FFFFFF", cursor: "pointer", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" };