// src/config.js
// Build-time target: "web" (default) or "play"
const TARGET =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_TARGET) ||
  (typeof window !== "undefined" && window.__APP_TARGET__) || // optional runtime override
  "web";

// Use distinct keys so installs don’t share data
export const LS_KEY   = TARGET === "play" ? "travel-checklist-play-v3" : "travel-checklist-v3";
export const OPFS_NAME = TARGET === "play" ? "checklist-play.json" : "checklist.json";

// Optional flag for UI tweaks if ever needed
export const IS_PLAY = TARGET === "play";

export default { TARGET, LS_KEY, OPFS_NAME, IS_PLAY };
