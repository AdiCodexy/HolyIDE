import { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";
import "./App.css";
import Sidebar from "./components/Sidebar";
import CodeBlock from "./components/CodeBlock";
import Terminal from "./components/Terminal";
import ProfilePage from "./components/ProfilePage";
import HomePage from "./components/HomePage";
import QuestionPanel from "./components/QuestionPanel";

// ── Clamp helper ───────────────────────────────────────────────────
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// ── Resize handle component ────────────────────────────────────────
// direction: "col" (vertical bar) | "row" (horizontal bar)
// onDragStart: (e) => void
function ResizeHandle({ direction, onDragStart }) {
  const isCol = direction === "col";

  return (
    <div
      onMouseDown={onDragStart}
      style={{
        // Hit zone — wider/taller than the visible line for easy grabbing
        flexShrink: 0,
        width: isCol ? "5px" : "100%",
        height: isCol ? "100%" : "5px",
        cursor: isCol ? "col-resize" : "row-resize",
        position: "relative",
        zIndex: 10,
        background: "transparent",
        // Prevent text selection while dragging
        userSelect: "none",
      }}
    >
      {/* Visible 1px indicator line, centred inside the hit zone */}
      <div style={{
        position: "absolute",
        // Col handle: vertical line at horizontal centre
        ...(isCol ? {
          top: 0, bottom: 0,
          left: "50%",
          width: "1px",
          transform: "translateX(-50%)",
        } : {
          left: 0, right: 0,
          top: "50%",
          height: "1px",
          transform: "translateY(-50%)",
        }),
        background: "rgba(255, 255, 255, 0.04)",
        transition: "background 100ms ease",
        // Brighten on parent hover via CSS — we handle it with onMouseEnter/Leave
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ── Main layout ────────────────────────────────────────────────────
export default function App() {
  const [activePaperId, setActivePaperId] = useState("Python/2024/Term1/python_basics.py");
  const [openTabs, setOpenTabs] = useState(["Python/2024/Term1/python_basics.py"]);
  const [showProfile, setShowProfile] = useState(false);
  const [currentView, setCurrentView] = useState("home");
  const [subjectFilter, setSubjectFilter] = useState(null);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTransition = useCallback((action) => {
    setIsTransitioning(true);
    setTimeout(() => {
      action();
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 250);
  }, []);

  // When a question is selected from the sidebar, add it as a tab (if not already) and switch to it
  const handleSelect = useCallback((id) => {
    setOpenTabs(prev => prev.includes(id) ? prev : [...prev, id]);
    setActivePaperId(id);
  }, []);

  // Close a tab — switch to the nearest remaining tab
  const handleCloseTab = useCallback((id) => {
    setOpenTabs(prev => {
      const next = prev.filter(t => t !== id);
      if (next.length === 0) {
        // Always keep at least one tab open
        return prev;
      }
      // If we're closing the active tab, switch to the nearest one
      if (id === activePaperId) {
        const idx = prev.indexOf(id);
        const newActive = next[Math.min(idx, next.length - 1)];
        setActivePaperId(newActive);
      }
      return next;
    });
  }, [activePaperId]);

  // Sidebar width (px) — clamped [160, 480]
  const [sidebarWidth, setSidebarWidth] = useState(250);

  // Question panel width (px) — clamped [300, 800]
  const [questionWidth, setQuestionWidth] = useState(400);

  // Terminal height (px) — clamped [80, window - 120]
  const [terminalHeight, setTerminalHeight] = useState(
    () => Math.round(window.innerHeight * 0.30)
  );

  // Which axis is currently being dragged: null | "sidebar" | "terminal" | "question"
  const dragging = useRef(null);
  const dragOrigin = useRef(0);   // mouseX or mouseY at drag start
  const sizeAtDrag = useRef(0);   // width/height at drag start

  // ── Sidebar drag ────────────────────────────────────────────────
  const startSidebarDrag = useCallback((e) => {
    e.preventDefault();
    dragging.current = "sidebar";
    dragOrigin.current = e.clientX;
    sizeAtDrag.current = sidebarWidth;
  }, [sidebarWidth]);

  // ── Question drag ───────────────────────────────────────────────
  const startQuestionDrag = useCallback((e) => {
    e.preventDefault();
    dragging.current = "question";
    dragOrigin.current = e.clientX;
    sizeAtDrag.current = questionWidth;
  }, [questionWidth]);

  // ── Terminal drag ───────────────────────────────────────────────
  const startTerminalDrag = useCallback((e) => {
    e.preventDefault();
    dragging.current = "terminal";
    dragOrigin.current = e.clientY;
    sizeAtDrag.current = terminalHeight;
  }, [terminalHeight]);

  // ── Global mouse handlers ───────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;

      if (dragging.current === "sidebar") {
        const delta = e.clientX - dragOrigin.current;
        setSidebarWidth(clamp(sizeAtDrag.current + delta, 160, 480));
      }

      if (dragging.current === "question") {
        const delta = e.clientX - dragOrigin.current;
        setQuestionWidth(clamp(sizeAtDrag.current + delta, 300, 800));
      }

      if (dragging.current === "terminal") {
        // Dragging up → terminal grows (delta is negative → subtract)
        const delta = e.clientY - dragOrigin.current;
        const maxH = window.innerHeight - 120;   // leave at least 120px for editor
        setTerminalHeight(clamp(sizeAtDrag.current - delta, 80, maxH));
      }
    };

    const onUp = () => { dragging.current = null; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []); // stable — refs carry latest values, no deps needed

  return (
    <>
      {/* ── Full-screen Home Page ───────────────────────────────── */}
      {currentView === "home" && (
        <HomePage
          onOpenIDE={() => handleTransition(() => { setSubjectFilter(null); setCurrentView("ide"); })}
          onOpenSubject={(subjectName, questionId) => handleTransition(() => {
            setSubjectFilter(subjectName);
            handleSelect(questionId);
            setCurrentView("ide");
          })}
        />
      )}

      {/* ── Full-screen Profile Overlay ─────────────────────────── */}
      {showProfile && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "#0A0A0A",
        }}>
          <ProfilePage onClose={() => handleTransition(() => setShowProfile(false))} />
        </div>
      )}

      {/* ── IDE Layout ─────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: currentView === "home" ? "none" : "flex",
          background: "#0A0A0A",
          overflow: "hidden",
          cursor: "inherit",
        }}
      >
        {/* ── Sidebar (controlled width) ─────────────────────── */}
        <Sidebar
          activeId={activePaperId}
          onSelect={(id) => { handleSelect(id); if (showProfile) handleTransition(() => setShowProfile(false)); }}
          width={sidebarWidth}
          onOpenProfile={() => handleTransition(() => setShowProfile(true))}
          onGoHome={() => handleTransition(() => { setCurrentView("home"); setSubjectFilter(null); })}
          subjectFilter={subjectFilter}
        />

        {/* ── Vertical resize handle ─────────────────────────── */}
        <ResizeHandle direction="col" onDragStart={startSidebarDrag} />

        {/* ── Right column ─────────────────────────────────────── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}>
          {/* Editor Area (Split Panel) */}
          <div style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "row",
            minHeight: 0,
          }}>
            <QuestionPanel
              activePaperId={activePaperId}
              width={questionWidth}
              setWidth={setQuestionWidth}
            />

            {/* ── Vertical resize handle for Question panel ── */}
            <ResizeHandle direction="col" onDragStart={startQuestionDrag} />

            <CodeBlock
              paperId={activePaperId}
              openTabs={openTabs}
              onSelectTab={setActivePaperId}
              onCloseTab={handleCloseTab}
            />
          </div>

          {/* ── Horizontal resize handle ──────────────────────── */}
          <ResizeHandle direction="row" onDragStart={startTerminalDrag} />

          {/* Terminal */}
          <div style={{
            height: terminalHeight,
            flexShrink: 0,
            overflow: "hidden",
          }}>
            <Terminal />
          </div>
        </div>
      </div>

      {/* ── Global Fade Overlay ─────────────────────────────────── */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "#000000",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: isTransitioning ? 1 : 0,
        transition: "opacity 0.25s ease-in-out",
      }} />
    </>
  );
}
