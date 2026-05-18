import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";
import AddQuestionModal from "./AddQuestionModal";

export default function QuestionPanel({ activePaperId, width, setWidth }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!activePaperId) return;

    // Convert backslashes to forward slashes for consistent DB querying
    const filePath = activePaperId.replace(/\\/g, '/');

    async function fetchQuestion() {
      if (!isSupabaseConfigured) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("screenshot_url, question_text")
          .eq("file_path", filePath)
          .single();

        if (error) {
          console.error("Error fetching question:", error);
          setQuestion(null);
        } else {
          setQuestion(data);
        }
      } catch (err) {
        console.error("Failed to fetch question", err);
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
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#FFFFFF",
            cursor: "pointer",
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
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
            style={{
              background: "transparent",
              border: "none",
              color: "#7A7A7A",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            «
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          {loading ? (
            <div style={{ color: "#7A7A7A", fontSize: "12px", textAlign: "center", marginTop: "20px" }}>Loading...</div>
          ) : question ? (
            <>
              {question.screenshot_url && (
                <div style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.02)"
                }}>
                  <img
                    src={question.screenshot_url}
                    alt="Question Screenshot"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
              )}

              {question.question_text && (
                <div style={{
                  color: "#D4D4D4",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}>
                  {question.question_text}
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
              {isSupabaseConfigured && (
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
                    transition: "all 0.2s"
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
