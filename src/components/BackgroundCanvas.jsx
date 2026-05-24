import { useEffect, useRef } from "react";

// =========================================================================
// CONFIGURATION VARIABLES (Easily tweakable)
// =========================================================================
const CONFIG = {
  waveCount: 3,                           // Number of overlapping ribbon waves
  baselineRatio: 0.8,                     // Vertical position: 0.8 means 80% down the screen (bottom area)
  mouseRadius: 200,                       // Horizontal mouse interactive radius
  mouseRippleStrength: 25,                 // Ripple amplitude distortion at mouse cursor
  canvasBlur: "1.5px"                     // CSS blur to soften lines into glowing ribbons
};

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let mouse = { x: -10000, y: -10000, active: false };

    // Setup dimensions
    let dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Define distinct waves
    const waves = [
      {
        amplitude: 35,
        frequency: 0.0025,
        speed: 0.006,
        phase: 0,
        opacity: 0.12,
        thickness: 1.5
      },
      {
        amplitude: 50,
        frequency: 0.0018,
        speed: -0.004,
        phase: Math.PI / 3,
        opacity: 0.08,
        thickness: 1.0
      },
      {
        amplitude: 20,
        frequency: 0.0035,
        speed: 0.009,
        phase: Math.PI / 1.5,
        opacity: 0.05,
        thickness: 0.8
      }
    ];

    const initCanvas = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      // Handle screen resize
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.scale(dpr, dpr);
    };

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const baselineY = height * CONFIG.baselineRatio;

      // Draw each wave ribbon
      for (let i = 0; i < waves.length; i++) {
        const wave = waves[i];
        
        // Update wave phase
        wave.phase += wave.speed;

        ctx.beginPath();
        ctx.lineWidth = wave.thickness;

        // Step by 4px for smooth curves
        for (let x = 0; x <= width; x += 4) {
          // Double harmonic wave for organic complexity
          let y = baselineY + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
          y += Math.cos(x * (wave.frequency * 2.1) - wave.phase * 0.4) * (wave.amplitude * 0.25);

          // Mouse localized ripple distortion
          if (mouse.active) {
            const dist = Math.abs(x - mouse.x);
            if (dist < CONFIG.mouseRadius) {
              const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
              const easeForce = force * force * (3 - 2 * force); // Smooth step
              const ripple = Math.sin(x * 0.02 - wave.phase * 2) * CONFIG.mouseRippleStrength * easeForce;
              y += ripple;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Create linear gradient for mouse spotlight glow
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        const mousePercent = mouse.x / width;
        
        grad.addColorStop(0, `rgba(255, 255, 255, ${wave.opacity})`);
        
        if (mouse.active && mousePercent >= 0 && mousePercent <= 1) {
          const leftStop = Math.max(0, mousePercent - CONFIG.mouseRadius / width);
          const rightStop = Math.min(1, mousePercent + CONFIG.mouseRadius / width);
          
          grad.addColorStop(leftStop, `rgba(255, 255, 255, ${wave.opacity})`);
          grad.addColorStop(mousePercent, `rgba(255, 255, 255, ${wave.opacity * 4.0})`); // Spotlight center
          grad.addColorStop(rightStop, `rgba(255, 255, 255, ${wave.opacity})`);
        }
        
        grad.addColorStop(1, `rgba(255, 255, 255, ${wave.opacity})`);

        ctx.strokeStyle = grad;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => initCanvas();
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -10000;
      mouse.y = -10000;
    };
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };
    const handleTouchEnd = () => {
      mouse.active = false;
      mouse.x = -10000;
      mouse.y = -10000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    initCanvas();
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1, // Behind page contents
        pointerEvents: "none", // Allow clicks to pass through to elements below
        background: "#000000", // Sleek black background
        filter: `blur(${CONFIG.canvasBlur})`, // Soft ethereal blur to prevent distraction
      }}
    />
  );
}