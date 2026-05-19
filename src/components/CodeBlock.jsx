import { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { supabase } from "../supabaseClient";



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

      if (error) console.error('Auto-save error:', error.message);
    } catch (err) {
      console.error('Failed save:', err);
    }
  };

  useEffect(() => {
    if (saveTimeoutRef.current && prevPaperIdRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveToSupabase(latestContentRef.current, prevPaperIdRef.current);
      saveTimeoutRef.current = null;
    }

    prevPaperIdRef.current = paperId;
    if (!paperId) return;

    async function loadSavedCode() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const normalizedPath = paperId.replace(/\\/g, '/');
        const { data, error } = await supabase
          .from('user_code')
          .select('code_content')
          .eq('user_id', user.id)
          .eq('file_path', normalizedPath)
          .maybeSingle();

        if (error) throw error;

        setContent(data?.code_content || "");
        latestContentRef.current = data?.code_content || "";
      } catch (err) {
        console.error("Load error:", err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadSavedCode();
  }, [paperId]);

  const handleEditorChange = (value) => {
    setContent(value);
    latestContentRef.current = value;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase(value, paperId);
      saveTimeoutRef.current = null;
    }, 2000);
  };

  const getFileInfo = (pathId) => {
    if (!pathId) return { filename: 'Unknown', language: 'plaintext' };
    const parts = pathId.split(/[/\\]/);
    const filename = parts[parts.length - 1];
    const ext = filename.split('.').pop();

    const extMap = { 'py': 'python', 'java': 'java', 'js': 'javascript', 'jsx': 'javascript', 'html': 'html', 'sql': 'sql', 'vue': 'javascript' };
    return { filename, language: extMap[ext] || 'plaintext' };
  };

  const tabsToRender = openTabs.length > 0 ? openTabs : (paperId ? [paperId] : []);
  const currentFileInfo = getFileInfo(paperId);
  const monacoLang = currentFileInfo.language;

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: "#000000",
      overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace",
    }}>

      {/* ── Multi-tab bar ──────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #1A1A1A",
        background: "#000000",
        paddingLeft: "16px",
        height: "44px",
        flexShrink: 0,
        justifyContent: "space-between",
      }}>
        {/* Tabs Area */}
        <div style={{
          display: "flex",
          alignItems: "flex-end", // Align to bottom so borders touch
          gap: "24px",
          flex: 1,
          height: "100%",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}>
          {tabsToRender.map(tabId => {
            const tabInfo = getFileInfo(tabId);
            const isActive = tabId === paperId;
            const canClose = tabsToRender.length > 1;

            return (
              <div
                key={tabId}
                onClick={() => onSelectTab?.(tabId)}
                style={{
                  color: isActive ? "#FFFFFF" : "#666666",
                  paddingBottom: "10px",
                  fontSize: "11px",
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  borderBottom: isActive ? "2px solid #FFFFFF" : "2px solid transparent",
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.color = "#AAAAAA";
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.color = "#666666";
                }}
              >
                <span>{tabInfo.filename}</span>

                {canClose && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab?.(tabId);
                    }}
                    style={{
                      color: isActive ? "#888888" : "#444444",
                      fontSize: "14px",
                      lineHeight: 1,
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
                    onMouseLeave={e => e.currentTarget.style.color = isActive ? "#888888" : "#444444"}
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
          paddingLeft: "24px",
          paddingRight: "16px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexShrink: 0,
        }}>
          {/* Brutalist RUN Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!content.trim() || isExecuting) return;

              writeToTerminal('', 'clear');
              writeToTerminal(`> Executing ${currentFileInfo.filename}...\n`);

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
                    writeToTerminal(`\n> Exit Code: ${data.run.code}\n`);
                  }
                })
                .catch(err => {
                  setIsExecuting(false);
                  writeToTerminal(`\n> System Failure: ${err.message}\n`);
                });
            }}
            disabled={isExecuting}
            style={{
              background: isExecuting ? "#111111" : "#FFFFFF",
              border: isExecuting ? "1px solid #333333" : "1px solid #FFFFFF",
              color: isExecuting ? "#666666" : "#000000",
              padding: "6px 16px",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: isExecuting ? "not-allowed" : "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              if (!isExecuting) {
                e.currentTarget.style.background = "#000000";
                e.currentTarget.style.color = "#FFFFFF";
              }
            }}
            onMouseLeave={e => {
              if (!isExecuting) {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.color = "#000000";
              }
            }}
          >
            {isExecuting ? "Running" : "Run"}
          </button>
        </div>
      </div>

      {/* ── Editor ────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Using standard vs-dark, but Monaco is flexible */}
        <Editor
          height="100%"
          language={monacoLang}
          theme="vs-dark"
          value={isLoading ? "Loading..." : content}
          onChange={handleEditorChange}
          options={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            minimap: { enabled: false },
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            padding: { top: 24, bottom: 24 },
          }}
        />
      </div>

      <div style={{
        height: "28px",
        flexShrink: 0,
        borderTop: "1px solid #1A1A1A",
        background: "#000000",
        display: "flex",
        alignItems: "center",
        paddingLeft: "16px",
        paddingRight: "16px",
        justifyContent: "space-between",
        color: "#555555",
        fontSize: "10px",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}>
        <span>{currentFileInfo.filename}</span>
        <span>{monacoLang}</span>
      </div>
    </div>
  );
}