// src/styles/styles.js
export const styles = {
  // Page & layout
  page: {
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    background: "#0b1220",      // deep slate
    color: "#e5e7eb",           // light text
    minHeight: "100vh",
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "24px 16px 64px",
  },

  // Header
  header: {
    display: "flex",
    gap: 12,
    alignItems: "stretch",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",            // responsive wrap
  },
  title: { fontSize: 24, fontWeight: 800, letterSpacing: -0.25 },

  // Toolbar
  toolbar: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",            // buttons wrap on small screens
  },

  // Inputs & buttons
  search: {
    padding: "10px 12px",
    border: "1px solid #2a364a",
    borderRadius: 10,
    minWidth: 220,
    background: "#0f172a",
    color: "#e5e7eb",
    outline: "none",
  },
  button: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #2a364a",
    background: "#111827",
    color: "#e5e7eb",
    cursor: "pointer",
  },
  primary: { background: "#2563eb", color: "#fff", borderColor: "#1d4ed8" },
  danger:  { background: "#b91c1c", color: "#fff", borderColor: "#7f1d1d" },

  // Grid/cards
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#0f172a",        // card surface
    border: "1px solid #1f2937",  // subtle border
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
  },
  cardHeader: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    flexWrap: "wrap",             // responsive
  },
  cardTitle: { fontWeight: 700 },

  // Form elements inside cards
  input: {
    width: "100%",
    padding: "10px 10px",
    borderRadius: 10,
    border: "1px solid #2a364a",
    background: "#0b1220",
    color: "#e5e7eb",
    outline: "none",
  },

  // Item rows
  itemRow: {
    display: "grid",
    gridTemplateColumns: "24px 1fr auto", // checkbox | text | actions
    alignItems: "center",
    gap: 8,
    padding: "6px 0",
  },
  itemText: (done) => ({
    textDecoration: done ? "line-through" : "none",
    color: done ? "#94a3b8" : "#e5e7eb",
    wordBreak: "break-word",
    lineHeight: 1.35,
  }),
  itemActions: { display: "flex", gap: 6 },

  // Footer
  footer: {
    marginTop: 24,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
  },
};
