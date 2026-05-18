import { useState, useRef, useEffect } from "react";

const HINTS = [
  { tag: "Q1",  text: "Flask's render_template looks in /templates by default — path is relative to app root." },
  { tag: "Q3",  text: "SQLAlchemy requires session.commit() after every db.session.add() to persist changes." },
  { tag: "Q5",  text: "HTTP 302 vs 200 — redirect() returns 302, not 200. Use it for POST→GET redirects."     },
  { tag: "TIP", text: "Jinja2: {{ var }} outputs a value, {% block %} defines an overridable template region." },
];

function OutputLine({ text }) {
  if (text.startsWith(">"))
    return <div><span style={{ color: "#FBBF24" }}>&gt;</span><span style={{ color: "#9A9A9A" }}>{text.slice(1)}</span></div>;
  if (text.includes("Error") || text.includes("Exception") || /\b404|500\b/.test(text)) 
    return <div style={{ color: "#F87171" }}>{text}</div>;
  if (text.startsWith(" *") || text.includes("http://")) 
    return <div style={{ color: "#34D399" }}>{text}</div>;
  // Compiling / success indicator lines
  if (text.startsWith("⏳"))  return <div style={{ color: "#FBBF24" }}>{text}</div>;
  if (text.startsWith("✓"))   return <div style={{ color: "#34D399" }}>{text}</div>;
  return <div style={{ color: "#D4D4D4", whiteSpace: "pre-wrap" }}>{text}</div>;
}

export default function Terminal() {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState(["> System initialized. Ready to execute code.\n"]);
  const [activePane, setPane] = useState("output");
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleTerminalOutput = (e) => {
      const { text, type } = e.detail;
      if (type === 'clear') {
        setLines(["> System initialized. Ready to execute code.\n"]);
      } else {
        setLines(prev => {
          if (!text) return prev;
          
          const last = prev[prev.length - 1];
          if (last && !last.endsWith('\n') && !text.startsWith('\n')) {
            const newPrev = [...prev];
            newPrev[newPrev.length - 1] = last + text;
            return newPrev;
          }
          return [...prev, text];
        });
      }
    };

    window.addEventListener("terminal-output", handleTerminalOutput);
    return () => window.removeEventListener("terminal-output", handleTerminalOutput);
  }, []);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "#0A0A0A",
      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
      fontFamily: "'JetBrains Mono', monospace",
    }}>

      {/* Pane switcher */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        height: "32px",
        alignItems: "center",
        flexShrink: 0,
        paddingLeft: "4px",
        gap: "2px",
      }}>
        {["output", "hints"].map(pane => (
          <button
            key={pane}
            onClick={() => setPane(pane)}
            style={{
              background: activePane === pane ? "rgba(255, 255, 255, 0.95)" : "transparent",
              border: "none",
              borderBottom: "none",
              color: activePane === pane ? "#0A0A0A" : "#4A4A4A",
              cursor: "pointer",
              padding: "0 14px",
              height: "24px",
              fontSize: "9px",
              fontWeight: activePane === pane ? 600 : 400,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              borderRadius: "6px",
              margin: "4px 0",
              transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={e => {
              if (activePane !== pane) {
                e.currentTarget.style.color = "#9A9A9A";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
              }
            }}
            onMouseLeave={e => {
              if (activePane !== pane) {
                e.currentTarget.style.color = "#4A4A4A";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {pane === "output" ? "Output" : "Exam Hints"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activePane === "output" ? (
          <>
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px 16px",
                fontSize: "11px",
                lineHeight: "1.6",
              }}
            >
              {lines.map((line, i) => <OutputLine key={i} text={line} />)}
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              padding: "0 16px",
              height: "36px",
              gap: "8px",
              flexShrink: 0,
            }}>
              <span style={{ color: "#FBBF24", fontSize: "10px" }}>$</span>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    // Could implement sending stdin to process later
                    setInput("");
                  }
                }}
                placeholder="Terminal input (read-only for now)…"
                disabled={true}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#9A9A9A",
                  fontSize: "10px",
                  fontFamily: "'JetBrains Mono', monospace",
                  caretColor: "#FFFFFF",
                  opacity: 0.5,
                }}
              />
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}>
            {HINTS.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                }}
              >
                <span style={{
                  color: "#FFFFFF",
                  fontSize: "8px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: "rgba(255, 255, 255, 0.08)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  minWidth: "fit-content",
                  flexShrink: 0,
                }}>
                  {h.tag}
                </span>
                <span style={{ color: "#7A7A7A", fontSize: "10px", lineHeight: "1.6" }}>
                  {h.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
