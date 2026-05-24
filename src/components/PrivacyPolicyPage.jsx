import { useEffect, useRef } from "react";

function AnimatedSection({ children }) {
    const ref = useRef(null);

    useEffect(() => {
        const handleCustomScroll = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            const visibleAmount = windowHeight - rect.top;
            const progress = Math.min(Math.max(visibleAmount / 250, 0), 1);
            
            ref.current.style.opacity = progress;
            ref.current.style.transform = `translateY(${(1 - progress) * 50}px) scale(${0.95 + 0.05 * progress})`;
        };

        window.addEventListener('holy-scroll', handleCustomScroll);
        handleCustomScroll();
        
        return () => window.removeEventListener('holy-scroll', handleCustomScroll);
    }, []);

    return (
        <div ref={ref} style={{ willChange: "opacity, transform" }}>
            {children}
        </div>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <div id="privacy-section" style={{
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
                <AnimatedSection>
                    <h1 style={{
                        fontSize: "clamp(48px, 8vw, 80px)",
                        fontWeight: 300,
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                        margin: "0 0 24px 0",
                    }}>
                        Privacy.
                    </h1>
                </AnimatedSection>

                <AnimatedSection>
                    <p style={{
                        color: "#888888",
                        fontSize: "16px",
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "0.05em",
                        margin: "0 0 80px 0",
                        textTransform: "uppercase"
                    }}>
                        v1.0.0 // Policy & Data Protection
                    </p>
                </AnimatedSection>

                {/* Grid Sections */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "64px",
                }}>

                    {/* Section 1: Authentication & Profiles */}
                    <AnimatedSection>
                        <div style={{ borderTop: "1px solid #222222", paddingTop: "32px" }}>
                            <h2 style={{
                                fontSize: "12px",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                color: "#666666",
                                marginBottom: "24px",
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                01 // Authentication & Profiles
                            </h2>
                            <p style={{
                                fontSize: "20px",
                                fontWeight: 300,
                                lineHeight: 1.6,
                                color: "#E2E8F0",
                                maxWidth: "800px"
                            }}>
                                Holy IDE utilizes Google OAuth for secure user authentication. When you sign in, we only retrieve basic profile information (such as your full name, email address, and avatar image URL) to identify you and customize your development environment. This profile metadata is stored securely in our database.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Section 2: Data Storage & Progress Sync */}
                    <AnimatedSection>
                        <div style={{ borderTop: "1px solid #222222", paddingTop: "32px" }}>
                            <h2 style={{
                                fontSize: "12px",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                color: "#666666",
                                marginBottom: "24px",
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                02 // Storage & Cloud Syncing
                            </h2>
                            <p style={{
                                fontSize: "20px",
                                fontWeight: 300,
                                lineHeight: 1.6,
                                color: "#E2E8F0",
                                maxWidth: "800px"
                            }}>
                                To provide continuous practice progress across devices, we store your quiz history, custom bookmarks, code snippets, and compilation attempts. All communication between the client IDE application and our servers is fully encrypted. We do not sell or share any user metrics or code data.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Section 3: Cookies & Local Storage */}
                    <AnimatedSection>
                        <div style={{ borderTop: "1px solid #222222", paddingTop: "32px" }}>
                            <h2 style={{
                                fontSize: "12px",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                color: "#666666",
                                marginBottom: "24px",
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                03 // Local Storage & Cookies
                            </h2>
                            <p style={{
                                fontSize: "20px",
                                fontWeight: 300,
                                lineHeight: 1.6,
                                color: "#E2E8F0",
                                maxWidth: "800px"
                            }}>
                                We do not use third-party advertisement trackers, Google Analytics, or invasive cookies. The application relies strictly on standard local storage to save your editor settings, theme preferences, and secure Supabase credentials to keep you logged in between sessions.
                            </p>
                        </div>
                    </AnimatedSection>

                </div>
            </div>
        </div>
    );
}
