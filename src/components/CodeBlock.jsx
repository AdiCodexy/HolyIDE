import { useState, useEffect, useCallback, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { io } from "socket.io-client";

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
  const [activeProcessId, setActiveProcessId] = useState(null);
  const saveTimeoutRef = useRef(null);

  // Listen for process exit to reset the Run button
  useEffect(() => {
    const socket = io("http://localhost:3001");
    socket.on("exit", ({ processId, code }) => {
      setActiveProcessId(prev => (prev === processId ? null : prev));
    });
    return () => socket.disconnect();
  }, []);

  // Fetch file content when paperId changes
  useEffect(() => {
    if (!paperId) return;
    
    setIsLoading(true);
    fetch(`http://localhost:3001/api/fs/file?path=${encodeURIComponent(paperId)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch file');
        return res.json();
      })
      .then(data => {
        setContent(data.content || "");
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setContent("");
        setIsLoading(false);
      });
  }, [paperId]);

  const handleEditorChange = (value) => {
    setContent(value);
    
    // Auto-save with debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      fetch('http://localhost:3001/api/fs/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: paperId, content: value })
      }).catch(err => console.error('Save failed:', err));
    }, 1000);
  };

  // Extract info from path e.g. "Python\file.py"
  const getFileInfo = (pathId) => {
    if (!pathId) return { filename: 'Unknown', language: 'plaintext' };
    // Handle both Windows and Unix slashes
    const parts = pathId.split(/[/\\]/);
    const filename = parts[parts.length - 1];
    const ext = filename.split('.').pop();
    
    // Map extension to Monaco language
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
          // Hide scrollbar for a cleaner look
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
            {activeProcessId ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetch('http://localhost:3001/api/stop', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ processId: activeProcessId })
                  }).then(() => setActiveProcessId(null));
                }}
                style={{
                  background: "rgba(248, 113, 113, 0.1)",
                  border: "1px solid rgba(248, 113, 113, 0.3)",
                  color: "#F87171",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "9px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <div style={{ width: "6px", height: "6px", background: "#F87171", borderRadius: "1px" }} />
                STOP
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetch('http://localhost:3001/api/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: paperId })
                  })
                  .then(res => res.json())
                  .then(data => {
                    if (data.processId) setActiveProcessId(data.processId);
                  });
                }}
                style={{
                  background: "rgba(52, 211, 153, 0.1)",
                  border: "1px solid rgba(52, 211, 153, 0.3)",
                  color: "#34D399",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "9px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                ▶ RUN
              </button>
            )}
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

