import { useState, useEffect } from "react";

// Props
// ─────
// activeId      : string        — which file path is currently selected
// onSelect      : (id) => void  — notify App of a new selection
// width         : number        — px width driven by App's drag state
// onOpenProfile : () => void    — open the profile page
// onGoHome      : () => void    — go back to home page
// subjectFilter : string|null   — only show this subject (null = all)

function TreeNode({ node, depth = 0, activeId, onSelect, expanded, toggleNode }) {
  const isFile = node.type === 'file';
  const isExpanded = expanded[node.path];
  const isActive = activeId === node.path;
  
  if (isFile) {
    return (
      <button
        onClick={() => onSelect(node.path)}
        style={{
          width: "100%",
          background: isActive ? "rgba(255, 255, 255, 0.95)" : "transparent",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          padding: `6px 14px 6px ${14 + depth * 12}px`,
          marginBottom: "1px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "1px",
          transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          textAlign: "left",
        }}
        onMouseEnter={e => {
          if (!isActive) e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
        }}
        onMouseLeave={e => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        <span style={{
          color: isActive ? "#0A0A0A" : "#7A7A7A",
          fontSize: "10px",
          fontWeight: isActive ? 600 : 400,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}>
          {node.name}
        </span>
      </button>
    );
  }

  // Directory
  return (
    <div>
      <button
        onClick={() => toggleNode(node.path)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: `8px 14px 8px ${14 + depth * 12}px`,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 200ms",
          textAlign: "left",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <span style={{
          color: "#4A4A4A",
          fontSize: "8px",
          transition: "transform 200ms",
          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
          display: "inline-block",
          width: "8px",
          flexShrink: 0,
        }}>▶</span>
        <span style={{
          color: "#8A8A8A",
          fontSize: "10px",
          fontWeight: 600,
        }}>{node.name}</span>
      </button>
      
      {isExpanded && node.children && (
        <div style={{ paddingBottom: "2px" }}>
          {node.children.map(child => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect}
              expanded={expanded}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ activeId, onSelect, width = 250, onOpenProfile, onGoHome, subjectFilter }) {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    import("../supabaseClient").then(({ supabase }) => {
      if (!supabase) return;

      supabase
        .from('questions')
        .select('file_path')
        .then(({ data, error }) => {
          if (error) {
            console.error('Failed to fetch questions:', error);
            return;
          }

          const paths = data.map(q => q.file_path).filter(Boolean);
          const root = [];

          // Reconstruct the nested tree structure from file paths
          paths.forEach(path => {
            const parts = path.split('/');
            let currentList = root;
            
            for (let i = 0; i < parts.length; i++) {
              const part = parts[i];
              const isFile = i === parts.length - 1;
              let existing = currentList.find(n => n.name === part);
              
              if (isFile) {
                if (!existing) {
                  currentList.push({ name: part, type: 'file', path: path });
                }
              } else {
                if (!existing) {
                  existing = { 
                    name: part, 
                    type: 'directory', 
                    path: parts.slice(0, i + 1).join('/'), 
                    children: [] 
                  };
                  currentList.push(existing);
                }
                currentList = existing.children;
              }
            }
          });

          // Sort folders first, then files
          const sortTree = (nodes) => {
            nodes.sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'directory' ? -1 : 1;
            });
            nodes.forEach(n => {
              if (n.children) sortTree(n.children);
            });
          };
          sortTree(root);

          setTreeData(root);

          // Auto-expand the root level directories
          const map = {};
          root.forEach(n => {
            if (n.type === 'directory') map[n.path] = true;
          });
          setExpanded(map);
        });
    });
  }, []);

  const toggleNode = (path) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Filter top-level subjects if filter is applied
  const visibleTree = subjectFilter
    ? treeData.filter(s => s.name === subjectFilter)
    : treeData;

  // Get user initial from localStorage
  const userName = (() => {
    try {
      const saved = localStorage.getItem("holy-ide-profile");
      return saved ? JSON.parse(saved).name || "S" : "S";
    } catch { return "S"; }
  })();

  return (
    <aside style={{
      width: collapsed ? "48px" : `${width}px`,
      background: "#0F0F0F",
      borderRight: "1px solid rgba(255, 255, 255, 0.06)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace",
      transition: "width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    }}>

      {/* ── Top controls ─────────────────────────────────────── */}
      <div style={{
        display: "flex",
        flexDirection: collapsed ? "column" : "row",
        alignItems: "center",
        gap: "6px",
        padding: collapsed ? "10px 6px" : "10px 12px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        {/* Back to home arrow */}
        <button
          onClick={onGoHome}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#6B6B6B",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "color 150ms, background 150ms, border-color 150ms",
            fontFamily: "'JetBrains Mono', monospace",
            padding: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.10)";
            e.currentTarget.style.color = "#FFFFFF";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.20)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
            e.currentTarget.style.color = "#6B6B6B";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
          }}
          title="Back to Home"
        >
          ←
        </button>

        {/* Profile avatar — hidden when collapsed */}
        {!collapsed && (
          <button
            onClick={onOpenProfile}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
              border: "1px solid rgba(255, 255, 255, 0.10)",
              color: "#FFFFFF",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "border-color 150ms, transform 150ms",
              fontFamily: "'JetBrains Mono', monospace",
              padding: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.10)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title="Profile"
          >
            {userName.charAt(0).toUpperCase()}
          </button>
        )}

        {/* Username */}
        {!collapsed && (
          <span 
            onClick={onOpenProfile}
            style={{
              color: "#7A7A7A",
              fontSize: "10px",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
              cursor: "pointer",
              transition: "color 150ms"
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
            onMouseLeave={e => e.currentTarget.style.color = "#7A7A7A"}
            title="Open Profile"
          >
            {userName}
          </span>
        )}

        {/* Collapse / Expand toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: "none",
            border: "none",
            color: "#4A4A4A",
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: "6px",
            transition: "color 150ms, background 150ms",
            fontSize: "11px",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "#FFFFFF";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "#4A4A4A";
            e.currentTarget.style.background = "none";
          }}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Recursive File Tree */}
      <nav style={{ overflowY: "auto", flex: 1, padding: "6px 8px 6px 0" }}>
        {visibleTree.map(node => (
          collapsed ? (
            <button
              key={node.path}
              onClick={() => setCollapsed(false)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "10px 0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <span style={{
                color: "#4A4A4A",
                fontSize: "10px",
                fontWeight: 600,
              }}>
                {node.name.charAt(0)}
              </span>
            </button>
          ) : (
            <TreeNode
              key={node.path}
              node={node}
              activeId={activeId}
              onSelect={onSelect}
              expanded={expanded}
              toggleNode={toggleNode}
            />
          )
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          color: "#3A3A3A",
          fontSize: "9px",
          letterSpacing: "0.06em",
        }}>
          IIT-M · Holy IDE
        </div>
      )}
    </aside>
  );
}
