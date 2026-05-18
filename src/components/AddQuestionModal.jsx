import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function AddQuestionModal({ activePaperId, onClose, onSuccess }) {
  const [topic, setTopic] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState(""); // New state for solution code
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Intercept Ctrl+V / Cmd+V paste events to automatically capture screenshots from the clipboard
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
          setError(""); // Clear errors if an image is successfully loaded
          e.preventDefault();
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !questionText) {
      setError("Please provide either a pasted/uploaded screenshot or question text.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const filePath = activePaperId.replace(/\\/g, '/');
    const filename = filePath.split('/').pop();

    try {
      let uploadedUrl = null;

      // 1. Process image upload if an image was provided via file explorer or clipboard paste
      if (imageFile) {
        const fileExt = imageFile.name ? imageFile.name.split('.').pop() : 'png';
        const generatedName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("screenshots")
          .upload(generatedName, imageFile);

        if (uploadError) throw uploadError;

        // Extract the public serving link from your public bucket configuration
        const { data: { publicUrl } } = supabase.storage
          .from("screenshots")
          .getPublicUrl(generatedName);

        uploadedUrl = publicUrl;
      }

      // 2. Fetch authenticated admin profile metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication missing. Please log in first.");

      // 3. Complete database insertion pipeline matching your updated table architecture
      const { data, error: insertError } = await supabase
        .from("questions")
        .insert([
          {
            user_id: user.id,
            file_path: filePath,
            filename: filename,
            topic: topic || null,
            screenshot_url: uploadedUrl,
            question_text: questionText || null,
            answer_text: answerText || null // Writes straight to your new answer column
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

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
        maxWidth: "520px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "#FFFFFF", fontSize: "16px", fontWeight: 600 }}>Add Assignment Question (Admin Mode)</h2>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#7A7A7A", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>

        <div style={{ color: "#7A7A7A", fontSize: "11px" }}>
          Target File Path: <span style={{ color: "#34D399" }}>{activePaperId.replace(/\\/g, '/')}</span>
        </div>

        {error && (
          <div style={{ color: "#F87171", fontSize: "12px", background: "rgba(248, 113, 113, 0.1)", padding: "8px", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#D4D4D4", fontSize: "11px" }}>Topic (optional)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Recursion, SQL Joins..."
              style={inputStyle}
            />
          </div>

          {/* Secure Drag/Drop/Paste Zone for Images */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#D4D4D4", fontSize: "11px" }}>Problem Screenshot</label>
            <div style={{
              border: "1px dashed rgba(255, 255, 255, 0.15)",
              borderRadius: "6px",
              padding: "16px",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.01)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ fontSize: "12px", color: "#A3A3A3" }}>
                Click to browse or press <strong style={{ color: "#34D399" }}>Ctrl + V</strong> to paste image directly
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ fontSize: "11px", color: "#7A7A7A" }}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Captured Preview"
                  style={{ maxWidth: "100%", maxHeight: "140px", borderRadius: "4px", marginTop: "8px", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                />
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#D4D4D4", fontSize: "11px" }}>Question Text / Hints (optional)</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter context, reminders, or Markdown details..."
              rows={3}
              style={textareaStyle}
            />
          </div>

          {/* Upgraded Answer Key Input Element */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#EF4444", fontSize: "11px", fontWeight: 600 }}>Official Solution Code / Text (Hidden from Students)</label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Paste the target solution script or solution description here..."
              rows={4}
              style={{ ...textareaStyle, border: "1px solid rgba(239, 68, 68, 0.25)", color: "#FCA5A5", fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={btnCancelStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ ...btnSubmitStyle, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
            >
              {isSubmitting ? "Uploading..." : "Save Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Design system object consistency configurations
const inputStyle = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "8px 12px", borderRadius: "6px", color: "#FFFFFF", fontSize: "12px", fontFamily: "inherit", outline: "none" };
const textareaStyle = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "8px 12px", borderRadius: "6px", color: "#FFFFFF", fontSize: "12px", fontFamily: "inherit", resize: "vertical", outline: "none" };
const btnCancelStyle = { background: "transparent", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#D4D4D4", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 };
const btnSubmitStyle = { background: "#34D399", border: "none", color: "#0A0A0A", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 };