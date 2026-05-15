import { useState, useRef, useEffect } from "react";

const INITIAL_OUTPUT = `> python main.py
 * Running on http://127.0.0.1:5000
 * Debug mode: on
[2024-01-15 14:32:01] GET / 200 -
[2024-01-15 14:32:01] GET /static/style.css 200 -`;

const HINTS = [
  { tag: "Q1",  text: "Flask's render_template looks in /templates by default — path is relative to app root." },
  { tag: "Q3",  text: "SQLAlchemy requires session.commit() after every db.session.add() to persist changes." },
  { tag: "Q5",  text: "HTTP 302 vs 200 — redirect() returns 302, not 200. Use it for POST→GET redirects."     },
  { tag: "TIP", text: "Jinja2: {{ var }} outputs a value, {% block %} defines an overridable template region." },
];

// Run button states
const RUN_IDLE      = "idle";
const RUN_COMPILING = "compiling";
const RUN_DONE      = "done";

function OutputLine({ text }) {
  if (text.startsWith(">"))
    return <div><span style={{ color: "#FBBF24" }}>&gt;</span><span style={{ color: "#9A9A9A" }}>{text.slice(1)}</span></div>;
  if (/\b200\b/.test(text))  return <div style={{ color: "#34D399" }}>{text}</div>;
  if (/\b404|500\b/.test(text)) return <div style={{ color: "#F87171" }}>{text}</div>;
  if (text.startsWith(" *")) return <div style={{ color: "#3D3D3D" }}>{text}</div>;
  // Compiling / success indicator lines
  if (text.startsWith("⏳"))  return <div style={{ color: "#FBBF24" }}>{text}</div>;
  if (text.startsWith("✓"))   return <div style={{ color: "#34D399" }}>{text}</div>;
  return <div style={{ color: "#3D3D3D" }}>{text}</div>;
}

export default function Terminal() {
  const [input,      setInput]     = useState("");
  const [lines,      setLines]     = useState(INITIAL_OUTPUT.split("\n"));
  const [activePane, setPane]      = useState("output");
  const [runState,   setRunState]  = useState(RUN_IDLE);
  const scrollRef                  = useRef(null);
  const timerRef                   = useRef(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleRun = () => {
    if (runState !== RUN_IDLE) return;

    const cmd = input.trim();
    setInput("");

    // 1. Show "Compiling..." immediately
    setRunState(RUN_COMPILING);
    setLines(prev => [
      ...prev,
      cmd ? `> ${cmd}` : "> python main.py",
      "⏳ Compiling...",
    ]);

    // 2. After 1 s, swap to success
    timerRef.current = setTimeout(() => {
      setLines(prev => {
        // Replace the last "⏳ Compiling…" line with a success line
        const updated = [...prev];
        const lastIdx = updated.lastIndexOf("⏳ Compiling...");
        if (lastIdx !== -1)
          updated[lastIdx] = "✓ Compiled & executed successfully.";
        return updated;
      });
      setRunState(RUN_DONE);

      // Reset button back to idle after a short pause so user sees ✓
      timerRef.current = setTimeout(() => setRunState(RUN_IDLE), 1500);
    }, 1000);
  };

  // Button label + colour driven by runState
  const btnLabel = runState === RUN_COMPILING
    ? "…"
    : runState === RUN_DONE
    ? "✓"
    : "▶ Run";

  const btnColor = runState === RUN_COMPILING
    ? "#FBBF24"
    : runState === RUN_DONE
    ? "#34D399"
    : "#6B6B6B";

  const btnBg = runState === RUN_COMPILING
    ? "rgba(251, 191, 36, 0.10)"
    : runState === RUN_DONE
    ? "rgba(52, 211, 153, 0.10)"
    : "rgba(255, 255, 255, 0.06)";

  const btnBorder = runState !== RUN_IDLE
    ? (runState === RUN_DONE ? "rgba(52, 211, 153, 0.3)" : "rgba(251, 191, 36, 0.3)")
    : "rgba(255, 255, 255, 0.08)";

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
              // Active tab = white pill (matching the reference's "Folders" tab style)
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

        {activePane === "output" && (
          <button
            onClick={handleRun}
            disabled={runState !== RUN_IDLE}
            style={{
              marginLeft: "auto",
              marginRight: "12px",
              background: btnBg,
              border: `1px solid ${btnBorder}`,
              borderRadius: "8px",
              color: btnColor,
              cursor: runState !== RUN_IDLE ? "default" : "pointer",
              padding: "3px 14px",
              fontSize: "9px",
              fontWeight: 500,
              letterSpacing: "0.05em",
              minWidth: "52px",
              transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={e => {
              if (runState === RUN_IDLE) {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.20)";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.10)";
              }
            }}
            onMouseLeave={e => {
              if (runState === RUN_IDLE) {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.color = "#6B6B6B";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
              }
            }}
          >
            {btnLabel}
          </button>
        )}
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
                fontSize: "10px",
                lineHeight: "1.8",
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
                onKeyDown={e => e.key === "Enter" && handleRun()}
                placeholder="enter command…"
                disabled={runState !== RUN_IDLE}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#9A9A9A",
                  fontSize: "10px",
                  fontFamily: "'JetBrains Mono', monospace",
                  caretColor: "#FFFFFF",
                  opacity: runState !== RUN_IDLE ? 0.3 : 1,
                  transition: "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)",
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
                  // Glassy card — like the reference folder cards
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
