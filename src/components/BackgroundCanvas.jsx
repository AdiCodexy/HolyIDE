import { useEffect, useRef } from "react";

// =========================================================================
// CONFIGURATION VARIABLES (Easily tweakable)
// =========================================================================
const CONFIG = {
  particleCount: 70,                      // Sparse floating particles (decreased for a cleaner layout)
  particleColor: "rgba(180, 180, 180, 0.35)", // Subtle particle base color
  particleBaseRadius: 1.2,                // Slightly smaller base radius of dots
  particleMaxRadius: 4.0,                 // Softer max radius near mouse
  glowColor: "#ffffff",                   // Connection color: white
  glowRadius: 30,                         // shadowBlur size for glowing elements (refined, softer glow)
  mouseRadius: 160,                       // Mouse interactive radius
  maxLineDistance: 120,                   // Line connect threshold distance (reduced for sparse mesh)
  growthSpeed: 0.1,                       // Interpolation speed for size transition (lerp)
  driftSpeedFactor: 0.12,                 // Particle drift speed factor (slowed down by ~65% for calm drift)
  bulgeStrength: 0.6,                     // Lens distortion factor under mouse (slightly softened)
  canvasBlur: "1.5px"                     // Ethereal filter blur
};

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let mouse = { x: -10000, y: -10000, active: false };

    // Setup dimensions
    let dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // Render coordinates (physics position + lens displacement)
        this.drawX = this.x;
        this.drawY = this.y;

        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.5 + 0.2) * CONFIG.driftSpeedFactor;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.baseRadius = CONFIG.particleBaseRadius + Math.random() * 0.4;
        this.maxRadius = CONFIG.particleMaxRadius + Math.random() * 1.0;
        this.radius = this.baseRadius;
        this.targetRadius = this.baseRadius;
      }

      update() {
        // Update physical position
        this.x += this.vx;
        this.y += this.vy;

        // Bounce seamlessly off the edges
        if (this.x < 0) {
          this.x = 0;
          this.vx *= -1;
        } else if (this.x > width) {
          this.x = width;
          this.vx *= -1;
        }

        if (this.y < 0) {
          this.y = 0;
          this.vy *= -1;
        } else if (this.y > height) {
          this.y = height;
          this.vy *= -1;
        }

        // Initialize render positions to current physical positions
        this.drawX = this.x;
        this.drawY = this.y;

        // Mouse radius checks for size scaling and 3D lens bulge displacement
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.mouseRadius) {
            this.targetRadius = this.maxRadius;

            // Spherical lens bulge/zoom distortion math:
            // Calculate normalized distance (0 at center, 1 at edge of mouse radius)
            const t = dist / CONFIG.mouseRadius;
            
            // Bulge displacement uses a sine distribution (strongest at mid-radius, 0 at bounds)
            // Push coordinates outwards to mimic convex magnifying lens
            const displacement = CONFIG.bulgeStrength * Math.sin(t * Math.PI) * 35; 
            const angle = Math.atan2(dy, dx);
            this.drawX += Math.cos(angle) * displacement;
            this.drawY += Math.sin(angle) * displacement;
          } else {
            this.targetRadius = this.baseRadius;
          }
        } else {
          this.targetRadius = this.baseRadius;
        }

        // Smooth size scaling transition (lerp)
        this.radius += (this.targetRadius - this.radius) * CONFIG.growthSpeed;
      }

      draw() {
        ctx.beginPath();
        // Draw at distorted visual coordinates
        ctx.arc(this.drawX, this.drawY, this.radius, 0, Math.PI * 2);

        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.mouseRadius) {
            ctx.fillStyle = CONFIG.glowColor;
          } else {
            ctx.fillStyle = CONFIG.particleColor;
          }
        } else {
          ctx.fillStyle = CONFIG.particleColor;
        }

        ctx.fill();
      }
    }

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

      particles = [];
      for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update positions & draw coordinates
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }

      // Group lines for rendering passes
      const faintLines = [];
      const glowingLines = [];

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.maxLineDistance) {
            // Determine alpha opacity based on closeness (further = fainter)
            // Reduced by ~60% to make standard background lines extremely subtle
            const alpha = (1 - dist / CONFIG.maxLineDistance) * 0.07;

            let isGlowing = false;
            if (mouse.active) {
              const dx1 = p1.x - mouse.x;
              const dy1 = p1.y - mouse.y;
              const distToMouse1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

              const dx2 = p2.x - mouse.x;
              const dy2 = p2.y - mouse.y;
              const distToMouse2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

              // Glow if both endpoints of the connection are inside the mouse radius
              if (distToMouse1 < CONFIG.mouseRadius && distToMouse2 < CONFIG.mouseRadius) {
                isGlowing = true;
              }
            }

            if (isGlowing) {
              glowingLines.push({ p1, p2, alpha });
            } else {
              faintLines.push({ p1, p2, alpha });
            }
          }
        }
      }

      // Pass 1: Render faint, standard lines (No glow state mutations, fast)
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;

      for (let k = 0; k < faintLines.length; k++) {
        const { p1, p2, alpha } = faintLines[k];
        // Render with faint white
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.drawX, p1.drawY);
        ctx.lineTo(p2.drawX, p2.drawY);
        ctx.stroke();
      }

      // Pass 2: Render glowing lines near mouse (Apply glow effects selectively)
      if (glowingLines.length > 0) {
        ctx.shadowBlur = CONFIG.glowRadius;
        ctx.shadowColor = CONFIG.glowColor;
        ctx.lineWidth = 1.5; // Softer line width to reduce distraction

        for (let k = 0; k < glowingLines.length; k++) {
          const { p1, p2 } = glowingLines[k];
          ctx.strokeStyle = CONFIG.glowColor;
          ctx.beginPath();
          ctx.moveTo(p1.drawX, p1.drawY);
          ctx.lineTo(p2.drawX, p2.drawY);
          ctx.stroke();
        }

        // Clean up shadow blur state
        ctx.shadowBlur = 0;
      }

      // Render dots on top of lines
      for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
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