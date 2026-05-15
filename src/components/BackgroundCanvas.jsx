import { useRef, useEffect } from "react";

/*
 * BackgroundCanvas — "The Dark Aurora"
 * Slow, flowing, blurred gradients in deep blacks and dark greens.
 * Sits behind all content via fixed positioning and -z-index.
 * Uses requestAnimationFrame for buttery-smooth 60fps animation.
 */

// Aurora blob configuration
const BLOBS = [
  { x: 0.25, y: 0.3,  rx: 380, ry: 220, speed: 0.00012, phase: 0,     color: [52, 211, 153] },  // accent green
  { x: 0.70, y: 0.5,  rx: 340, ry: 260, speed: 0.00015, phase: 1.2,   color: [52, 211, 153] },  // accent green
  { x: 0.50, y: 0.7,  rx: 400, ry: 200, speed: 0.00010, phase: 2.8,   color: [255, 255, 255] }, // white
  { x: 0.15, y: 0.6,  rx: 300, ry: 240, speed: 0.00018, phase: 4.1,   color: [96, 165, 250] },  // soft blue
  { x: 0.80, y: 0.25, rx: 350, ry: 230, speed: 0.00013, phase: 5.5,   color: [139, 92, 246] },  // muted purple
];

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let w, h;

    // ── Resize handler ──────────────────────────────────────
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Draw loop ───────────────────────────────────────────
    const draw = (time) => {
      // Clear to deep black
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      // Very heavy blur gives the aurora its soft glow
      ctx.filter = "blur(100px)";

      for (let i = 0; i < BLOBS.length; i++) {
        const blob = BLOBS[i];
        const t = time * blob.speed + blob.phase;

        // Gentle drifting motion — elliptical orbit with varying amplitude
        const cx = blob.x * w + Math.sin(t) * (w * 0.08) + Math.cos(t * 0.7) * (w * 0.03);
        const cy = blob.y * h + Math.cos(t * 1.3) * (h * 0.06) + Math.sin(t * 0.5) * (h * 0.04);

        // Breathing radius
        const scaleX = blob.rx + Math.sin(t * 0.8) * 40;
        const scaleY = blob.ry + Math.cos(t * 0.6) * 30;

        // Very low alpha — subtle, not distracting
        const [r, g, b] = blob.color;
        const alpha = 0.14 + Math.sin(t * 0.4) * 0.04; // oscillates ~0.10–0.18

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(scaleX, scaleY));
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.beginPath();
        ctx.ellipse(cx, cy, scaleX, scaleY, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Reset filter for next frame
      ctx.filter = "none";

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    // ── Cleanup ─────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        background: "#0a0a0a",
      }}
    />
  );
}
