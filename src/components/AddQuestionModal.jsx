import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AddQuestionModal({ activePaperId, onClose, onSuccess }) {
  const [topic, setTopic] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshotUrl && !questionText) {
      setError("Please provide either a screenshot URL or question text.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Convert backslashes to forward slashes
    const filePath = activePaperId.replace(/\\/g, '/');
    const filename = filePath.split('/').pop();

    try {
      const { data, error: insertError } = await supabase
        .from("questions")
        .insert([
          { 
            file_path: filePath,
            filename: filename, // keeping this for legacy/redundancy if needed
            topic: topic || null,
            screenshot_url: screenshotUrl || null,
            question_text: questionText || null
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      onSuccess(data);
    } catch (err) {
      console.error("Failed to add question:", err);
      setError(err.message || "Failed to add question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(4px)",
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{
        background: "#0E0E0E",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "480px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "#FFFFFF", fontSize: "16px", fontWeight: 600 }}>Add Assignment Question</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: "transparent", 
              border: "none", 
              color: "#7A7A7A", 
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ color: "#7A7A7A", fontSize: "11px" }}>
          Target File: <span style={{ color: "#34D399" }}>{activePaperId.replace(/\\/g, '/')}</span>
        </div>

        {error && (
          <div style={{ color: "#F87171", fontSize: "12px", background: "rgba(248, 113, 113, 0.1)", padding: "8px", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#D4D4D4", fontSize: "11px" }}>Topic (optional)</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Recursion, SQL Joins..."
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "8px 12px",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "12px",
                fontFamily: "inherit",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#D4D4D4", fontSize: "11px" }}>Screenshot URL (optional)</label>
            <input 
              type="url" 
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="https://..."
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "8px 12px",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "12px",
                fontFamily: "inherit",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#D4D4D4", fontSize: "11px" }}>Question Text (optional)</label>
            <textarea 
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter the assignment details..."
              rows={6}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "8px 12px",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "12px",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#D4D4D4",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              style={{
                background: "#34D399",
                border: "none",
                color: "#0A0A0A",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontWeight: 600,
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? "Saving..." : "Save Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
