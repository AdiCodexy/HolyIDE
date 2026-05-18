import { useState, useEffect, useCallback, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { supabase } from "../supabaseClient"; // ── STATIC IMPORT: Rock-solid for production ──

/* ── Helper to map snippet language strings to Monaco language IDs ── */
function getMonacoLanguage(langString) {
  if (!langString) return "plaintext";
  const lower = langString.toLowerCase();
  if (lower.includes("python")) return "python";
  if (lower.includes("java") && !lower.includes("javascript")) return "java";
  if (lower.includes("javascript") || lower.includes("vue")) return "javascript";
  if (lower.includes("sql")) return "sql";
  if (lower.includes("html") || lower.includes("jinja")) return "html";
  return "plaintext";
}

/* ── Component ──────────────────────────────────────────────────── */
export default function CodeBlock({ paperId, openTabs = [], onSelectTab, onCloseTab }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const saveTimeoutRef = useRef(null);
  const latestContentRef = useRef("");
  const prevPaperIdRef = useRef(paperId);

  const writeToTerminal = (text, type = 'output') => {
    window.dispatchEvent(new CustomEvent('terminal-output', { detail: { text, type } }));
  };

  // Dedicated helper to safely upsert code content to Supabase
  const saveToSupabase = async (value, pathId) => {
    if (!pathId) return;
    const normalizedPath = pathId.replace(/\\/g, '/');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_code')
        .upsert({
          user_id: user.id,
          file_path: normalizedPath,
          code_content: value
        }, { onConflict: 'user_id, file_path' });

      if (error) {
        console.error('Auto-save database rejection:', error.message);
      } else {
        console.log(`Cloud sync complete for: ${normalizedPath} ✔️`);
      }
    } catch (err) {
      console.error('Failed to run save transaction:', err);
    }
  };

  // Sync state changes and handle virtual loading pipelines when paperId updates
  useEffect(() => {
    // 1. EMERGENCY FLASH SAVE: If user switches files while a 2s auto-save is pending, force commit immediately
    if (saveTimeoutRef.current && prevPaperIdRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveToSupabase(latestContentRef.current, prevPaperIdRef.current);
      saveTimeoutRef.current = null;
    }

    // Update tracking reference to the new active path identifier
    prevPaperIdRef.current = paperId;

    if (!paperId) return;

    async function loadSavedCode() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setContent("");
          latestContentRef.current = "";
          setIsLoading(false);
          return;
        }

        const normalizedPath = paperId.replace(/\\/g, '/');

        const { data, error } = await supabase
          .from('user_code')
          .select('code_content')
          .eq('user_id', user.id)
          .eq('file_path', normalizedPath)
          .maybeSingle(); // Cleanly handles empty states if student hasn't touched it yet

        if (error) throw error;

        if (data && data.code_content) {
          setContent(data.code_content);
          latestContentRef.current = data.code_content;
        } else {
          setContent(""); // Default empty canvas for new question targets
          latestContentRef.current = "";
        }
      } catch (err) {
        console.error("Failed to load virtual workspace code:", err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadSavedCode();
  }, [paperId]);

  const handleEditorChange = (value) => {
    setContent(value);
    latestContentRef.current = value; // Keep reference pointer up to date instantly

    // Auto-save with debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase(value, paperId);
      saveTimeoutRef.current = null;
    }, 2000);
  };

  // Extract info from path e.g. "Python\file.py"
  const getFileInfo = (pathId) => {
    if (!pathId) return { filename: 'Unknown', language: 'plaintext' };
    const parts = pathId.split(/[/\\]/);
    const filename = parts[parts.length - 1];
    const ext = filename.split('.').pop();

    const extMap = {
      'py': 'python',
      'java': 'java',
      'js': 'javascript',
      'jsx': 'javascript',
      'html': 'html',
      'sql': 'sql',
      'vue': 'javascript'
    };

    return {
      filename,
      language: extMap[ext] || 'plaintext'
    };
  };

  const tabsToRender = openTabs.length > 0 ? openTabs : (paperId ? [paperId] : []);
  const currentFileInfo = getFileInfo(paperId);
  const monacoLang = currentFileInfo.language;

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: "#0E0E0E",
      overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace",
    }}>

      {/* ── Multi-tab bar ──────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        background: "#0E0E0E",
        paddingLeft: "4px",
        height: "36px",
        flexShrink: 0,
        justifyContent: "space-between",
      }}>
        {/* Scrollable Tabs Area */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          flex: 1,
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {tabsToRender.map(tabId => {
            const tabInfo = getFileInfo(tabId);
            const isActive = tabId === paperId;
            const canClose = tabsToRender.length > 1;

            return (
              <div
                key={tabId}
                onClick={() => onSelectTab?.(tabId)}
                style={{
                  background: isActive ? "rgba(255, 255, 255, 0.10)" : "transparent",
                  border: isActive
                    ? "1px solid rgba(255, 255, 255, 0.08)"
                    : "1px solid transparent",
                  color: isActive ? "#FFFFFF" : "#5A5A5A",
                  padding: "0 6px 0 12px",
                  height: "28px",
                  fontSize: "10px",
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: "0.04em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                  borderRadius: "8px",
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "#9A9A9A";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#5A5A5A";
                  }
                }}
              >
                <span>{tabInfo.filename}</span>

                {/* Close button — hidden if only one tab */}
                {canClose && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab?.(tabId);
                    }}
                    style={{
                      color: isActive ? "#6B6B6B" : "#3A3A3A",
                      fontSize: "13px",
                      lineHeight: 1,
                      width: "18px",
                      height: "18px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = isActive ? "#6B6B6B" : "#3A3A3A";
                    }}
                  >
                    ×
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Pinned Action Area */}
        <div style={{
          paddingLeft: "12px",
          paddingRight: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
          background: "#0E0E0E",
        }}>
          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!content.trim() || isExecuting) return;

                writeToTerminal('', 'clear');
                writeToTerminal(`> Sending ${currentFileInfo.filename} to Cloud Execution API...\n`);

                setIsExecuting(true);

                const lang = monacoLang === "python" ? "python" : "java";

                fetch('https://emkc.org/api/v2/piston/execute', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    language: lang,
                    version: "*",
                    files: [{ name: currentFileInfo.filename, content: content }]
                  })
                })
                  .then(res => res.json())
                  .then(data => {
                    setIsExecuting(false);
                    if (data.message) {
                      writeToTerminal(`\nError: ${data.message}\n`);
                    } else if (data.run) {
                      if (data.run.stdout) writeToTerminal(data.run.stdout);
                      if (data.run.stderr) writeToTerminal(data.run.stderr);
                      writeToTerminal(`\n> Process exited with code ${data.run.code}\n`);
                    }
                  })
                  .catch(err => {
                    setIsExecuting(false);
                    writeToTerminal(`\nExecution Error: Failed to connect to sandbox API. ${err.message}\n`);
                  });
              }}
              disabled={isExecuting}
              style={{
                background: isExecuting ? "rgba(255, 255, 255, 0.1)" : "rgba(52, 211, 153, 0.1)",
                border: isExecuting ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(52, 211, 153, 0.3)",
                color: isExecuting ? "#A3A3A3" : "#34D399",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "9px",
                fontWeight: 600,
                cursor: isExecuting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 200ms ease"
              }}
            >
              {isExecuting ? "⏳ RUNNING..." : "▶ RUN"}
            </button>
          </div>

          {/* Language label */}
          <div style={{
            color: "#4A4A4A",
            fontSize: "9px",
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
          }}>
            {currentFileInfo.language.toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── Editor ────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflow: "hidden",
        position: "relative",
      }}>
        <Editor
          height="100%"
          language={monacoLang}
          theme="vs-dark"
          value={isLoading ? "Loading..." : content}
          onChange={handleEditorChange}
          options={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            minimap: { enabled: false },
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>

      <div style={{
        height: "24px",
        flexShrink: 0,
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        paddingLeft: "16px",
        paddingRight: "16px",
        justifyContent: "space-between",
        color: "#3D3D3D",
        fontSize: "9px",
        letterSpacing: "0.06em",
      }}>
        <span>{currentFileInfo.filename}</span>
        <span>{monacoLang.toUpperCase()}</span>
      </div>
    </div>
  );
}