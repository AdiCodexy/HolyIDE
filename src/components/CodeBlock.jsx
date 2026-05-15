import { useState, useEffect, useRef, useCallback } from "react";
import { SNIPPETS, DEFAULT_ID } from "./snippets";

/* ── Faux syntax highlighter (unchanged) ─────────────────────────── */
const KEYWORDS = /^(from|import|if|def|return|class|for|in|not|and|or|True|False|None|with|as|pass|raise|try|except|finally|elif|else|while|lambda|yield|global|nonlocal|del|assert|break|continue|public|private|protected|static|void|int|double|boolean|String|new|extends|implements|abstract|interface|final|this|super|throw|throws|instanceof|synchronized|volatile|record)$/;

function highlightLine(line, idx) {
  if (/^\s*#/.test(line) || /^\s*\/\//.test(line))
    return <span key={idx} style={{ color: "#3D3D3D" }}>{line + "\n"}</span>;

  const parts = [];
  const strRe = /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')/g;
  let last = 0, m;
  while ((m = strRe.exec(line)) !== null) {
    if (m.index > last) parts.push({ type: "code",   text: line.slice(last, m.index) });
    parts.push({ type: "string", text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push({ type: "code", text: line.slice(last) });

  const rendered = parts.map((part, pi) => {
    if (part.type === "string")
      return <span key={pi} style={{ color: "#34D399" }}>{part.text}</span>;

    const text = part.text;
    const nodes = [];
    let pos = 0;
    const re = /@[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*|[a-zA-Z_]\w*/g;
    let cm;
    while ((cm = re.exec(text)) !== null) {
      if (cm.index > pos) nodes.push(<span key={pos}>{text.slice(pos, cm.index)}</span>);
      const word = cm[0];
      if (word.startsWith("@"))
        nodes.push(<span key={cm.index} style={{ color: "#FBBF24" }}>{word}</span>);
      else if (KEYWORDS.test(word))
        nodes.push(<span key={cm.index} style={{ color: "#60A5FA" }}>{word}</span>);
      else if (text.slice(cm.index + word.length).trimStart().startsWith("("))
        nodes.push(<span key={cm.index} style={{ color: "#FBBF24" }}>{word}</span>);
      else
        nodes.push(<span key={cm.index}>{word}</span>);
      pos = cm.index + word.length;
    }
    if (pos < text.length) nodes.push(<span key={pos}>{text.slice(pos)}</span>);
    return <span key={pi}>{nodes}</span>;
  });

  return <span key={idx} style={{ color: "#8A8A8A" }}>{rendered}{"\n"}</span>;
}

/* ── Component ──────────────────────────────────────────────────── */
export default function CodeBlock({ paperId, openTabs = [], onSelectTab, onCloseTab }) {
  const snippet = SNIPPETS[paperId] ?? SNIPPETS[DEFAULT_ID];

  const [content, setContent] = useState(snippet.code);

  // Refs for the three scroll-slaves
  const textareaRef = useRef(null);
  const preRef      = useRef(null);
  const gutterRef   = useRef(null);

  // Reset content + scroll position on paper switch
  useEffect(() => {
    setContent(SNIPPETS[paperId]?.code ?? SNIPPETS[DEFAULT_ID].code);
    // Reset all scroll positions together
    if (textareaRef.current) textareaRef.current.scrollTop = 0;
    if (preRef.current)      preRef.current.scrollTop      = 0;
    if (gutterRef.current)   gutterRef.current.scrollTop   = 0;
  }, [paperId]);

  // textarea is the single scroll master — mirrors scrollTop to pre + gutter
  const syncScroll = useCallback(() => {
    const top = textareaRef.current?.scrollTop ?? 0;
    if (preRef.current)    preRef.current.scrollTop    = top;
    if (gutterRef.current) gutterRef.current.scrollTop = top;
  }, []);

  const lines = content.split("\n");
  const tabsToRender = openTabs.length > 0 ? openTabs : [paperId];

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
        overflowX: "auto",
        flexShrink: 0,
        gap: "2px",
      }}>
        {tabsToRender.map(tabId => {
          const tabSnippet = SNIPPETS[tabId];
          if (!tabSnippet) return null;
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
              <span>{tabSnippet.filename}</span>

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

        {/* Language label — floats right */}
        <div style={{
          marginLeft: "auto",
          paddingRight: "16px",
          color: "#4A4A4A",
          fontSize: "9px",
          letterSpacing: "0.06em",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}>
          {snippet.language}
        </div>
      </div>

      {/* ── Editor row: gutter | [pre + textarea stacked] ─────────── */}
      {/*
        Layout:
          • Outer row is display:flex, flex:1, overflow:hidden
          • Gutter: fixed 44px, overflow:hidden (scrolled via JS ref)
          • Right column: position:relative, flex:1, overflow:hidden
              ├─ <pre>      absolute, overflow:hidden  (scroll slave)
              └─ <textarea> absolute, overflow-y:auto  (scroll MASTER)
      */}
      <div style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
      }}>

        {/* Gutter — scroll slave, no native scrollbar */}
        <div
          ref={gutterRef}
          style={{
            width: "44px",
            flexShrink: 0,
            borderRight: "1px solid rgba(255, 255, 255, 0.04)",
            paddingTop: "16px",
            paddingBottom: "16px",
            paddingRight: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            userSelect: "none",
            overflowY: "hidden",
          }}
        >
          {lines.map((_, i) => (
            <span key={i} style={{
              color: "#2A2A2A",
              fontSize: "11px",
              lineHeight: "1.7",
              display: "block",
              flexShrink: 0,
            }}>
              {i + 1}
            </span>
          ))}
        </div>

        {/* Right column — relative container for the two layers */}
        <div style={{
          position: "relative",
          flex: 1,
          overflow: "hidden",
        }}>

          {/* Highlight layer — scroll slave, pointer-events off */}
          <pre
            ref={preRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              margin: 0,
              padding: "16px",
              fontSize: "11px",
              lineHeight: "1.7",
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              overflowY: "hidden",
              pointerEvents: "none",
              color: "#8A8A8A",
            }}
          >
            {lines.map((line, i) => highlightLine(line, i))}
          </pre>

          {/* Textarea — THE scroll master */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onScroll={syncScroll}
            spellCheck={false}
            style={{
              position: "absolute",
              inset: 0,
              padding: "16px",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              color: "transparent",
              caretColor: "#FFFFFF",
              fontSize: "11px",
              lineHeight: "1.7",
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              overflowY: "auto",
            }}
          />
        </div>
      </div>

      {/* Status bar */}
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
        <span>{snippet.filename}</span>
        <span>Ln {lines.length} · Col 1</span>
      </div>
    </div>
  );
}
