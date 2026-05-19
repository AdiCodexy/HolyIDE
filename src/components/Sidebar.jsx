import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

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
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: `8px 14px 8px ${14 + depth * 12}px`,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s ease",
          textAlign: "left",
          borderLeft: isActive ? "2px solid #FFFFFF" : "2px solid transparent",
        }}
        onMouseEnter={e => {
          if (!isActive) e.currentTarget.style.color = "#FFFFFF";
        }}
        onMouseLeave={e => {
          if (!isActive) e.currentTarget.style.color = "#666666";
        }}
      >
        <span style={{
          color: isActive ? "#FFFFFF" : "#666666",
          fontSize: "11px",
          fontWeight: isActive ? 500 : 400,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          transition: "color 0.2s ease"
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
          textAlign: "left",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
        onMouseLeave={e => e.currentTarget.style.color = "#888888"}
      >
        <span style={{
          color: "#444444",
          fontSize: "8px",
          transition: "transform 0.2s",
          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
          display: "inline-block",
          width: "8px",
          flexShrink: 0,
        }}>▶</span>
        <span style={{
          color: "inherit",
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }}>{node.name}</span>
      </button>

      {isExpanded && node.children && (
        <div style={{ paddingBottom: "4px" }}>
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
  const [userProfile, setUserProfile] = useState({ name: "S", avatarUrl: null });

  // Fetch Tree Data & User Profile Avatar
  useEffect(() => {
    async function loadData() {
      // 1. Load Tree Data
      const { data: qData } = await supabase.from('questions').select('file_path');
      if (qData) {
        const paths = qData.map(q => q.file_path).filter(Boolean);
        const root = [];

        paths.forEach(path => {
          const parts = path.split('/');
          let currentList = root;

          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isFile = i === parts.length - 1;
            let existing = currentList.find(n => n.name === part);

            if (isFile) {
              if (!existing) currentList.push({ name: part, type: 'file', path: path });
            } else {
              if (!existing) {
                existing = { name: part, type: 'directory', path: parts.slice(0, i + 1).join('/'), children: [] };
                currentList.push(existing);
              }
              currentList = existing.children;
            }
          }
        });

        const sortTree = (nodes) => {
          nodes.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'directory' ? -1 : 1;
          });
          nodes.forEach(n => { if (n.children) sortTree(n.children); });
        };
        sortTree(root);
        setTreeData(root);

        const map = {};
        root.forEach(n => { if (n.type === 'directory') map[n.path] = true; });
        setExpanded(map);
      }

      // 2. Load User Profile
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const googleAvatar = session.user.user_metadata?.avatar_url;
        const { data: pData } = await supabase.from('profiles').select('name').eq('id', session.user.id).single();

        setUserProfile({
          name: pData?.name || session.user.user_metadata?.full_name || "Student",
          avatarUrl: googleAvatar
        });
      }
    }
    loadData();
  }, []);

  const toggleNode = (path) => setExpanded(prev => ({ ...prev, [path]: !prev[path] }));

  const visibleTree = subjectFilter ? treeData.filter(s => s.name === subjectFilter) : treeData;

  return (
    <aside style={{
      width: collapsed ? "48px" : `${width}px`,
      background: "#000000", // Pure Black
      borderRight: "1px solid #1A1A1A",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace",
    }}>

      {/* ── Top controls ─────────────────────────────────────── */}
      <div style={{
        display: "flex",
        flexDirection: collapsed ? "column" : "row",
        alignItems: "center",
        gap: "12px",
        padding: collapsed ? "12px 6px" : "16px 16px",
        borderBottom: "1px solid #1A1A1A",
      }}>
        {/* B&W Profile avatar */}
        {!collapsed && (
          <button
            onClick={onOpenProfile}
            style={{
              width: "24px",
              height: "24px",
              background: userProfile.avatarUrl ? `url(${userProfile.avatarUrl}) center/cover` : "#111111",
              border: "1px solid #333333",
              color: "#FFFFFF",
              fontSize: "10px",
              fontWeight: 400,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              filter: "grayscale(100%)",
              transition: "border-color 0.2s",
              padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#FFFFFF"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#333333"}
            title="Profile"
          >
            {!userProfile.avatarUrl && userProfile.name.charAt(0).toUpperCase()}
          </button>
        )}

        {/* Username */}
        {!collapsed && (
          <span
            onClick={onOpenProfile}
            style={{
              color: "#888888",
              fontSize: "11px",
              fontWeight: 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
              cursor: "pointer",
              transition: "color 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
            onMouseLeave={e => e.currentTarget.style.color = "#888888"}
            title="Open Profile"
          >
            {userProfile.name}
          </span>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: "none",
            border: "none",
            color: "#555555",
            cursor: "pointer",
            padding: "0",
            transition: "color 0.2s",
            fontSize: "12px",
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
          onMouseLeave={e => e.currentTarget.style.color = "#555555"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Recursive File Tree */}
      <nav style={{ overflowY: "auto", flex: 1, padding: "12px 0" }}>
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
                color: "#666666"
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: 600 }}>
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
      <div style={{
        padding: collapsed ? "12px 0" : "12px 16px",
        borderTop: "1px solid #1A1A1A",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
      }}>
        {!collapsed && (
          <span style={{
            color: "#444444",
            fontSize: "9px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 600,
          }}>
            HOLY IDE
          </span>
        )}
        <button
          onClick={onGoHome}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            border: "1px solid #333333",
            color: "#888888",
            fontSize: "9px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 600,
            cursor: "pointer",
            padding: collapsed ? "6px" : "6px 12px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#FFFFFF";
            e.currentTarget.style.color = "#000000";
            e.currentTarget.style.borderColor = "#FFFFFF";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#888888";
            e.currentTarget.style.borderColor = "#333333";
          }}
          title="Return to Home Page"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          {!collapsed && <span>Home</span>}
        </button>
      </div>
    </aside>
  );
}