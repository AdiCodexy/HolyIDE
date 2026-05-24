import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";

// Helper for relative timestamps (e.g. "3 hours ago")
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

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
      ref.current.style.transform = `translateY(${(1 - progress) * 40}px) scale(${0.97 + 0.03 * progress})`;
    };

    window.addEventListener("holy-scroll", handleCustomScroll);
    handleCustomScroll();
    
    return () => window.removeEventListener("holy-scroll", handleCustomScroll);
  }, []);

  return (
    <div ref={ref} style={{ willChange: "opacity, transform" }}>
      {children}
    </div>
  );
}

export default function ReviewPage() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [prosText, setProsText] = useState("");
  const [consText, setConsText] = useState("");
  const [commentInputs, setCommentInputs] = useState({}); // { reviewId: "text" }
  const [expandedComments, setExpandedComments] = useState({}); // { reviewId: true/false }
  const [likersModalReview, setLikersModalReview] = useState(null); // Review object for active Likers modal
  const [isFallbackMode, setIsFallbackMode] = useState(!supabase);

  // 1. LocalStorage Fallback Handlers
  const loadLocalStorageReviews = useCallback(() => {
    const localData = localStorage.getItem("holy_ide_reviews");
    if (localData) {
      try {
        setReviews(JSON.parse(localData));
      } catch {
        setReviews([]);
      }
    } else {
      // Seed default reviews for presentation
      const defaultReviews = [
        {
          id: "seed-1",
          user_name: "Om Pandey",
          user_avatar: "https://lh3.googleusercontent.com/a/ACg8ocLx-example",
          pros: "The cloud sync is flawless. Code outputs are instantaneous, and practicing code questions feels extremely fast compared to manual terminal builds.",
          cons: "Dark theme lacks customization options. Would be great if we could choose between JetBrains Dracula and Github Dark themes.",
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          review_likes: [
            { user_name: "Aditya Karale", user_avatar: "" }
          ],
          review_comments: [
            {
              id: "comment-seed-1",
              user_name: "Aditya Karale",
              content: "Agreed! Dracula theme would be a fantastic addition.",
              created_at: new Date(Date.now() - 3600000 * 3).toISOString()
            }
          ]
        }
      ];
      localStorage.setItem("holy_ide_reviews", JSON.stringify(defaultReviews));
      setReviews(defaultReviews);
    }
  }, []);

  const saveLocalStorageReviews = useCallback((updatedReviews) => {
    localStorage.setItem("holy_ide_reviews", JSON.stringify(updatedReviews));
    setReviews(updatedReviews);
  }, []);

  // 2. Fetch Reviews from Database
  const fetchReviews = useCallback(async () => {
    if (!supabase) {
      setIsFallbackMode(true);
      loadLocalStorageReviews();
      return;
    }

    try {
      // Fetch reviews with their comments and likes
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          *,
          review_likes(*),
          review_comments(*)
        `)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        console.warn("Supabase query error, fallback to LocalStorage:", reviewsError.message);
        setIsFallbackMode(true);
        loadLocalStorageReviews();
        return;
      }

      setReviews(reviewsData || []);
    } catch (err) {
      console.warn("Supabase fetch exception, fallback to LocalStorage:", err);
      setIsFallbackMode(true);
      loadLocalStorageReviews();
    }
  }, [loadLocalStorageReviews]);

  // ── Auth Listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      // Defer state updates to prevent synchronous renders inside effects
      setTimeout(() => {
        loadLocalStorageReviews();
      }, 0);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadLocalStorageReviews]);

  // ── Fetch Reviews (Supabase or LocalStorage) ──────────────────
  useEffect(() => {
    setTimeout(() => {
      fetchReviews();
    }, 0);
  }, [fetchReviews]);

  // ── Auth Action ───────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
  };

  // ── Actions: Post Review ──────────────────────────────────────
  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!prosText.trim() || !consText.trim()) return;

    const reviewerName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Anonymous Student";
    const reviewerAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";

    if (!isFallbackMode) {
      try {
        const { error } = await supabase
          .from("reviews")
          .insert({
            user_id: user.id,
            user_name: reviewerName,
            user_avatar: reviewerAvatar,
            pros: prosText,
            cons: consText
          });

        if (error) throw error;
        setProsText("");
        setConsText("");
        fetchReviews();
      } catch (err) {
        alert("Failed to submit review: " + err.message);
      }
    } else {
      // LocalStorage update
      const newReview = {
        id: "local-" + Date.now(),
        user_name: reviewerName,
        user_avatar: reviewerAvatar,
        pros: prosText,
        cons: consText,
        created_at: new Date().toISOString(),
        review_likes: [],
        review_comments: []
      };
      const updated = [newReview, ...reviews];
      saveLocalStorageReviews(updated);
      setProsText("");
      setConsText("");
    }
  };

  // ── Actions: Toggle Like ──────────────────────────────────────
  const handleToggleLike = async (review) => {
    if (!user) {
      alert("Please sign in at the top to like reviews!");
      return;
    }

    const reviewerName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Anonymous Student";
    const reviewerAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";

    const userLikedRecord = review.review_likes?.find(like => like.user_id === user.id || (isFallbackMode && like.user_name === reviewerName));

    if (!isFallbackMode) {
      try {
        if (userLikedRecord) {
          // Unlike
          await supabase
            .from("review_likes")
            .delete()
            .match({ review_id: review.id, user_id: user.id });
        } else {
          // Like
          await supabase
            .from("review_likes")
            .insert({
              review_id: review.id,
              user_id: user.id,
              user_name: reviewerName,
              user_avatar: reviewerAvatar
            });
        }
        fetchReviews();
      } catch (err) {
        console.error(err);
      }
    } else {
      // LocalStorage update
      const updatedReviews = reviews.map(r => {
        if (r.id === review.id) {
          let newLikes = [...(r.review_likes || [])];
          if (userLikedRecord) {
            newLikes = newLikes.filter(l => l.user_name !== reviewerName);
          } else {
            newLikes.push({
              user_name: reviewerName,
              user_avatar: reviewerAvatar
            });
          }
          return { ...r, review_likes: newLikes };
        }
        return r;
      });
      saveLocalStorageReviews(updatedReviews);
    }
  };

  // ── Actions: Submit Comment ───────────────────────────────────
  const handlePostComment = async (e, reviewId) => {
    e.preventDefault();
    const commentContent = commentInputs[reviewId];
    if (!commentContent || !commentContent.trim()) return;

    if (!user) {
      alert("Please sign in at the top to write comments!");
      return;
    }

    const commentatorName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Anonymous Student";
    const commentatorAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";

    if (!isFallbackMode) {
      try {
        const { error } = await supabase
          .from("review_comments")
          .insert({
            review_id: reviewId,
            user_id: user.id,
            user_name: commentatorName,
            user_avatar: commentatorAvatar,
            content: commentContent
          });

        if (error) throw error;
        setCommentInputs(prev => ({ ...prev, [reviewId]: "" }));
        fetchReviews();
      } catch (err) {
        alert("Failed to submit comment: " + err.message);
      }
    } else {
      // LocalStorage update
      const updatedReviews = reviews.map(r => {
        if (r.id === reviewId) {
          const newComments = [...(r.review_comments || [])];
          newComments.push({
            id: "comment-" + Date.now(),
            user_name: commentatorName,
            user_avatar: commentatorAvatar,
            content: commentContent,
            created_at: new Date().toISOString()
          });
          return { ...r, review_comments: newComments };
        }
        return r;
      });
      saveLocalStorageReviews(updatedReviews);
      setCommentInputs(prev => ({ ...prev, [reviewId]: "" }));
    }
  };

  const toggleComments = (reviewId) => {
    setExpandedComments(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  // ── Brutalist Shared Button Style ─────────────────────────────
  const btnStyle = {
    background: "transparent",
    border: "1px solid #333333",
    color: "#FFFFFF",
    cursor: "pointer",
    padding: "8px 16px",
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.2s ease",
  };

  const btnHoverIn = (e) => {
    e.currentTarget.style.background = "#FFFFFF";
    e.currentTarget.style.color = "#000000";
    e.currentTarget.style.borderColor = "#FFFFFF";
  };
  const btnHoverOut = (e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.color = "#FFFFFF";
    e.currentTarget.style.borderColor = "#333333";
  };

  return (
    <div id="review-section" style={{
      color: "#FFFFFF",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      paddingTop: "60px",
      position: "relative",
    }}>

      {/* ── Content Container ─────────────────────────────────── */}
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "80px 32px 100px 32px",
      }}>

        {/* Title */}
        <AnimatedSection>
          <h1 style={{
            fontSize: "clamp(48px, 8vw, 80px)",
            fontWeight: 300,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            margin: "0 0 24px 0",
          }}>
            Reviews.
          </h1>
        </AnimatedSection>

        {/* Version / Subtitle */}
        <AnimatedSection>
          <p style={{
            color: "#888888",
            fontSize: "16px",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.05em",
            margin: "0 0 40px 0",
            textTransform: "uppercase"
          }}>
            v1.0.0 // Peer Feedback & Reviews
          </p>
        </AnimatedSection>

        {/* Fallback Banner warning */}
        {isFallbackMode && (
          <AnimatedSection>
            <div style={{
              background: "rgba(251, 191, 36, 0.05)",
              border: "1px solid rgba(251, 191, 36, 0.2)",
              padding: "16px",
              marginBottom: "40px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              color: "#fbbf24",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span>⚠️</span>
              <span>
                Running in Local Storage Sandbox mode. Run the Supabase SQL schema in your project dashboard to connect database cloud sync.
              </span>
            </div>
          </AnimatedSection>
        )}

        {/* ── Input Box: Leave Review ───────────────────────────── */}
        <AnimatedSection>
          <div style={{
            borderTop: "1px solid #222222",
            paddingTop: "32px",
            marginBottom: "60px"
          }}>
            <h2 style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#666666",
              marginBottom: "24px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Leave a Review
            </h2>

            {user ? (
              <form onSubmit={handlePostReview} style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  {/* Pros Textbox */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#888888" }}>PROS</label>
                    <textarea
                      placeholder="What do you like about the IDE? (e.g. speed, cloud sync...)"
                      value={prosText}
                      onChange={e => setProsText(e.target.value)}
                      required
                      style={{
                        background: "#080808",
                        border: "1px solid #222222",
                        color: "#FFFFFF",
                        padding: "16px",
                        fontSize: "14px",
                        fontFamily: "'Inter', sans-serif",
                        height: "120px",
                        resize: "none",
                        outline: "none",
                        transition: "border-color 0.2s ease"
                      }}
                      onFocus={e => e.target.style.borderColor = "#ffffff"}
                      onBlur={e => e.target.style.borderColor = "#222222"}
                    />
                  </div>

                  {/* Cons Textbox */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#888888" }}>CONS</label>
                    <textarea
                      placeholder="What should be improved? (e.g. missing shortcuts, theme customization...)"
                      value={consText}
                      onChange={e => setConsText(e.target.value)}
                      required
                      style={{
                        background: "#080808",
                        border: "1px solid #222222",
                        color: "#FFFFFF",
                        padding: "16px",
                        fontSize: "14px",
                        fontFamily: "'Inter', sans-serif",
                        height: "120px",
                        resize: "none",
                        outline: "none",
                        transition: "border-color 0.2s ease"
                      }}
                      onFocus={e => e.target.style.borderColor = "#ffffff"}
                      onBlur={e => e.target.style.borderColor = "#222222"}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    ...btnStyle,
                    alignSelf: "flex-start",
                    padding: "12px 24px"
                  }}
                  onMouseEnter={btnHoverIn}
                  onMouseLeave={btnHoverOut}
                >
                  Post Review →
                </button>
              </form>
            ) : (
              <div style={{
                background: "#050505",
                border: "1px solid #1a1a1a",
                padding: "32px",
                textAlign: "center"
              }}>
                <p style={{
                  color: "#666666",
                  fontSize: "14px",
                  marginBottom: "20px"
                }}>
                  Please log in with Google to post your review, like, or comment.
                </p>
                <button
                  onClick={signInWithGoogle}
                  style={btnStyle}
                  onMouseEnter={btnHoverIn}
                  onMouseLeave={btnHoverOut}
                >
                  Sign in with Google
                </button>
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* ── Reviews Feed List ─────────────────────────────────── */}
        <AnimatedSection>
          <div style={{
            borderTop: "1px solid #222222",
            paddingTop: "32px"
          }}>
            <h2 style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#666666",
              marginBottom: "32px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Recent Student Feedback ({reviews.length})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {reviews.map(review => {
                const totalLikes = review.review_likes?.length || 0;
                const totalComments = review.review_comments?.length || 0;
                const hasLiked = user && review.review_likes?.some(l => l.user_id === user.id);

                return (
                  <div
                    key={review.id}
                    style={{
                      background: "#050505",
                      border: "1px solid #1a1a1a",
                      padding: "32px",
                      position: "relative"
                    }}
                  >
                    {/* Header: User Profile Details */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "24px",
                      borderBottom: "1px solid #111111",
                      paddingBottom: "16px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {review.user_avatar ? (
                          <img
                            src={review.user_avatar}
                            alt=""
                            referrerPolicy="no-referrer"
                            style={{
                              width: "36px",
                              height: "36px",
                              border: "1px solid #222222",
                              objectFit: "cover",
                              filter: "grayscale(100%)",
                              transition: "filter 0.2s ease"
                            }}
                            onMouseEnter={e => e.currentTarget.style.filter = "none"}
                            onMouseLeave={e => e.currentTarget.style.filter = "grayscale(100%)"}
                          />
                        ) : (
                          <div style={{
                            width: "36px",
                            height: "36px",
                            border: "1px solid #222222",
                            background: "#111111",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#666666"
                          }}>
                            {review.user_name ? review.user_name[0].toUpperCase() : "?"}
                          </div>
                        )}
                        <div>
                          <span style={{ fontSize: "14px", fontWeight: 500, color: "#E2E8F0" }}>{review.user_name}</span>
                          <div style={{
                            fontSize: "10px",
                            color: "#555555",
                            fontFamily: "'JetBrains Mono', monospace",
                            textTransform: "uppercase",
                            marginTop: "2px"
                          }}>
                            Student / {formatRelativeTime(review.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Body (Pros & Cons) */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "24px",
                      marginBottom: "32px"
                    }}>
                      {/* Pros Display */}
                      <div style={{
                        background: "#080a08",
                        borderLeft: "2px solid #22c55e",
                        padding: "16px",
                      }}>
                        <h4 style={{
                          color: "#22c55e",
                          fontSize: "11px",
                          fontFamily: "'JetBrains Mono', monospace",
                          marginBottom: "8px",
                          textTransform: "uppercase"
                        }}>PROS</h4>
                        <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#cbd5e1" }}>{review.pros}</p>
                      </div>

                      {/* Cons Display */}
                      <div style={{
                        background: "#0a0808",
                        borderLeft: "2px solid #ef4444",
                        padding: "16px",
                      }}>
                        <h4 style={{
                          color: "#ef4444",
                          fontSize: "11px",
                          fontFamily: "'JetBrains Mono', monospace",
                          marginBottom: "8px",
                          textTransform: "uppercase"
                        }}>CONS</h4>
                        <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#cbd5e1" }}>{review.cons}</p>
                      </div>
                    </div>

                    {/* Action Bar (Likes and Comments) */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "24px",
                      fontSize: "12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      borderTop: "1px solid #111111",
                      paddingTop: "16px"
                    }}>
                      {/* Likes count trigger */}
                      <button
                        onClick={() => handleToggleLike(review)}
                        style={{
                          background: "none",
                          border: "none",
                          color: hasLiked ? "#ffffff" : "#666666",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 0",
                          fontFamily: "'JetBrains Mono', monospace"
                        }}
                      >
                        <span>{hasLiked ? "★" : "☆"}</span>
                        <span>{hasLiked ? "LIKED" : "LIKE"}</span>
                      </button>

                      {/* Likers Modal Trigger */}
                      {totalLikes > 0 && (
                        <button
                          onClick={() => setLikersModalReview(review)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#8b5cf6",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontFamily: "'JetBrains Mono', monospace",
                            padding: "4px 0"
                          }}
                        >
                          ({totalLikes} {totalLikes === 1 ? "LIKE" : "LIKES"})
                        </button>
                      )}

                      {/* Comments expand trigger */}
                      <button
                        onClick={() => toggleComments(review.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#666666",
                          cursor: "pointer",
                          fontFamily: "'JetBrains Mono', monospace",
                          padding: "4px 0",
                          marginLeft: "auto"
                        }}
                      >
                        {totalComments === 0
                          ? "NO COMMENTS"
                          : `${totalComments} ${totalComments === 1 ? "COMMENT" : "COMMENTS"}`}
                      </button>
                    </div>

                    {/* ── Comments Drawer ─────────────────────────────────── */}
                    {expandedComments[review.id] && (
                      <div style={{
                        marginTop: "24px",
                        borderTop: "1px solid #1a1a1a",
                        paddingTop: "24px"
                      }}>
                        {/* Comments List */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                          {review.review_comments?.map(comment => (
                            <div
                              key={comment.id}
                              style={{
                                display: "flex",
                                gap: "12px",
                                background: "#0a0a0a",
                                padding: "12px 16px",
                                border: "1px solid #111"
                              }}
                            >
                              {comment.user_avatar ? (
                                <img
                                  src={comment.user_avatar}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "0",
                                    border: "1px solid #222222",
                                    objectFit: "cover",
                                    filter: "grayscale(100%)"
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: "24px",
                                  height: "24px",
                                  border: "1px solid #222222",
                                  background: "#151515",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "9px",
                                  fontWeight: "bold",
                                  color: "#666666"
                                }}>
                                  {comment.user_name ? comment.user_name[0].toUpperCase() : "?"}
                                </div>
                              )}
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#cbd5e1" }}>{comment.user_name}</span>
                                  <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#555" }}>
                                    {formatRelativeTime(comment.created_at)}
                                  </span>
                                </div>
                                <p style={{ fontSize: "13px", lineHeight: "1.5", color: "#94a3b8" }}>{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Comment Input */}
                        {user ? (
                          <form
                            onSubmit={(e) => handlePostComment(e, review.id)}
                            style={{
                              display: "flex",
                              gap: "12px"
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentInputs[review.id] || ""}
                              onChange={e => setCommentInputs(prev => ({ ...prev, [review.id]: e.target.value }))}
                              style={{
                                flex: 1,
                                background: "#0a0a0a",
                                border: "1px solid #1a1a1a",
                                color: "#FFFFFF",
                                padding: "8px 16px",
                                fontSize: "13px",
                                outline: "none",
                                fontFamily: "'Inter', sans-serif"
                              }}
                              onFocus={e => e.target.style.borderColor = "#333"}
                              onBlur={e => e.target.style.borderColor = "#1a1a1a"}
                            />
                            <button
                              type="submit"
                              style={btnStyle}
                              onMouseEnter={btnHoverIn}
                              onMouseLeave={btnHoverOut}
                            >
                              Post
                            </button>
                          </form>
                        ) : (
                          <p style={{ fontSize: "11px", color: "#555", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
                            Sign in with Google to post comments.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

      </div>

      {/* ── Likers List Modal ───────────────────────────────────── */}
      {likersModalReview && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            background: "#080808",
            border: "1px solid #333333",
            width: "100%",
            maxWidth: "380px",
            padding: "24px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              borderBottom: "1px solid #222222",
              paddingBottom: "12px"
            }}>
              <span style={{
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: "bold",
                letterSpacing: "0.1em",
                color: "#666666"
              }}>
                LIKED BY
              </span>
              <button
                onClick={() => setLikersModalReview(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666666",
                  fontSize: "16px",
                  cursor: "pointer"
                }}
                onMouseEnter={e => e.target.style.color = "#fff"}
                onMouseLeave={e => e.target.style.color = "#666666"}
              >
                ✕
              </button>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxHeight: "260px",
              overflowY: "auto"
            }}>
              {likersModalReview.review_likes?.map((like, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "#0a0a0a",
                    padding: "8px 12px",
                    border: "1px solid #111"
                  }}
                >
                  {like.user_avatar ? (
                    <img
                      src={like.user_avatar}
                      alt=""
                      referrerPolicy="no-referrer"
                      style={{
                        width: "28px",
                        height: "28px",
                        border: "1px solid #222222",
                        objectFit: "cover",
                        filter: "grayscale(100%)"
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "28px",
                      height: "28px",
                      border: "1px solid #222222",
                      background: "#151515",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#666666"
                    }}>
                      {like.user_name ? like.user_name[0].toUpperCase() : "?"}
                    </div>
                  )}
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#cbd5e1" }}>
                    {like.user_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
