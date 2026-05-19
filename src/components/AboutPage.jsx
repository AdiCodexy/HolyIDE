export default function AboutPage() {
    return (
        <div id="about-section" style={{
            color: "#FFFFFF",
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            paddingTop: "60px",
        }}>

            {/* ── Content Container ─────────────────────────────────── */}
            <div style={{
                maxWidth: "900px",
                margin: "0 auto",
                padding: "80px 32px 120px 32px",
            }}>

                {/* Header */}
                <h1 style={{
                    fontSize: "clamp(48px, 8vw, 80px)",
                    fontWeight: 300,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    margin: "0 0 24px 0",
                }}>
                    Holy IDE.
                </h1>

                <p style={{
                    color: "#888888",
                    fontSize: "16px",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.05em",
                    margin: "0 0 80px 0",
                    textTransform: "uppercase"
                }}>
                    v1.0.0 // Built for IIT-M BS Students
                </p>

                {/* Grid Sections */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "64px",
                }}>

                    {/* Section 1: The Mission */}
                    <div style={{ borderTop: "1px solid #222222", paddingTop: "32px" }}>
                        <h2 style={{
                            fontSize: "12px",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "#666666",
                            marginBottom: "24px",
                            fontFamily: "'JetBrains Mono', monospace",
                        }}>
                            01 // The Mission
                        </h2>
                        <p style={{
                            fontSize: "24px",
                            fontWeight: 300,
                            lineHeight: 1.6,
                            color: "#E2E8F0",
                            maxWidth: "800px"
                        }}>
                            Holy IDE was created to bridge the gap between static lecture material and active application. It provides a brutalist, distraction-free environment to practice past quiz questions with real-time compilation, instant feedback, and continuous cloud syncing.
                        </p>
                    </div>

                    {/* Section 2: Disclaimer */}
                    <div style={{ borderTop: "1px solid #222222", paddingTop: "32px" }}>
                        <h2 style={{
                            fontSize: "12px",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "#666666",
                            marginBottom: "24px",
                            fontFamily: "'JetBrains Mono', monospace",
                        }}>
                            02 // Transparency
                        </h2>
                        <div style={{
                            background: "#111111",
                            border: "1px solid #333333",
                            padding: "32px",
                        }}>
                            <p style={{
                                fontSize: "18px",
                                fontWeight: 400,
                                lineHeight: 1.6,
                                color: "#FFFFFF",
                                margin: 0
                            }}>
                                This application is independently developed and operated by students. It is strictly an educational utility and is <span style={{ borderBottom: "1px solid #FFFFFF" }}>not affiliated with, endorsed by, or officially connected to the Indian Institute of Technology Madras (IIT-M).</span>
                            </p>
                        </div>
                    </div>

                    {/* Section 3: Developers */}
                    <div style={{ borderTop: "1px solid #222222", paddingTop: "32px" }}>
                        <h2 style={{
                            fontSize: "12px",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "#666666",
                            marginBottom: "32px",
                            fontFamily: "'JetBrains Mono', monospace",
                        }}>
                            03 // Developers
                        </h2>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "24px",
                        }}>
                            {/* Aditya Karale */}
                            <div style={{
                                padding: "24px",
                                border: "1px solid #222222",
                                background: "#050505",
                            }}>
                                <h3 style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 400, margin: "0 0 24px 0" }}>Aditya Karale</h3>
                                <div style={{ display: "flex", gap: "16px" }}>
                                    <a href="#" style={{ color: "#888888", textDecoration: "none", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace", transition: "color 0.2s ease" }} onMouseEnter={e => e.target.style.color = "#FFFFFF"} onMouseLeave={e => e.target.style.color = "#888888"}>LinkedIn</a>
                                    <a href="#" style={{ color: "#888888", textDecoration: "none", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace", transition: "color 0.2s ease" }} onMouseEnter={e => e.target.style.color = "#FFFFFF"} onMouseLeave={e => e.target.style.color = "#888888"}>GitHub</a>
                                    <a href="#" style={{ color: "#888888", textDecoration: "none", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace", transition: "color 0.2s ease" }} onMouseEnter={e => e.target.style.color = "#FFFFFF"} onMouseLeave={e => e.target.style.color = "#888888"}>Gmail</a>
                                </div>
                            </div>

                            {/* Om Pandey */}
                            <div style={{
                                padding: "24px",
                                border: "1px solid #222222",
                                background: "#050505",
                            }}>
                                <h3 style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 400, margin: "0 0 24px 0" }}>Om Pandey</h3>
                                <div style={{ display: "flex", gap: "16px" }}>
                                    <a href="#" style={{ color: "#888888", textDecoration: "none", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace", transition: "color 0.2s ease" }} onMouseEnter={e => e.target.style.color = "#FFFFFF"} onMouseLeave={e => e.target.style.color = "#888888"}>LinkedIn</a>
                                    <a href="#" style={{ color: "#888888", textDecoration: "none", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace", transition: "color 0.2s ease" }} onMouseEnter={e => e.target.style.color = "#FFFFFF"} onMouseLeave={e => e.target.style.color = "#888888"}>GitHub</a>
                                    <a href="#" style={{ color: "#888888", textDecoration: "none", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace", transition: "color 0.2s ease" }} onMouseEnter={e => e.target.style.color = "#FFFFFF"} onMouseLeave={e => e.target.style.color = "#888888"}>Gmail</a>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}