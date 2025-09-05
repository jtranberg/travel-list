// src/lib/storage.js
import { uid } from "./ids.js";
import { TEMPLATE_SEED } from "../template.js";
import { LS_KEY } from "../config.js";

export { LS_KEY }; // so App.jsx can keep importing LS_KEY from storage

export function instantiateTemplate(seed = TEMPLATE_SEED) {
  return seed.map((s) => ({
    id: uid("sec"),
    title: s.title,
    items: s.items.map((t) => ({ id: uid("it"), text: t, done: false })),
  }));
}

export function loadInitialSections() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
    return instantiateTemplate();
  } catch {
    return instantiateTemplate();
  }
}

export function saveSections(sections) {
  localStorage.setItem(LS_KEY, JSON.stringify(sections));
}

export function normalizeList(list) {
  if (!Array.isArray(list)) return [];
  return list.map((s) => ({
    id: s?.id || uid("sec"),
    title: String(s?.title || "Untitled"),
    items: Array.isArray(s?.items)
      ? s.items.map((it) => ({
          id: it?.id || uid("it"),
          text: String(it?.text || ""),
          done: Boolean(it?.done),
        }))
      : [],
  }));
}
