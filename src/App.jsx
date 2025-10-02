// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { styles } from "./styles/styles.js";
import { uid } from "./lib/ids.js";
import {
  LS_KEY,
  loadInitialSections,
  saveSections,
  instantiateTemplate,
  normalizeList,
} from "./lib/storage.js";

import { readOpfsJson, writeOpfsJson } from "./lib/opfs.js";

// Simple feature check for File System Access API
const supportsFS = () =>
  "showSaveFilePicker" in window && "showOpenFilePicker" in window;

export default function App() {
  const [sections, setSections] = useState(() => loadInitialSections());
  const [filter, setFilter] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  useEffect(() => {
    saveSections(sections);
  }, [sections]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter((it) => it.text.toLowerCase().includes(q)),
      }))
      .filter((s) => s.items.length > 0);
  }, [sections, filter]);

  // After your state is created:
  useEffect(() => {
    // On first run: if OPFS has data, prefer it; else seed OPFS from current sections
    (async () => {
      const opfsData = await readOpfsJson();
      if (opfsData && Array.isArray(opfsData)) {
        setSections(opfsData);
      } else {
        await writeOpfsJson(sections);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep OPFS in sync whenever sections change
  useEffect(() => {
    (async () => {
      await writeOpfsJson(sections);
    })();
  }, [sections]);

  // One-click full reset to the standard template
  function resetAppData() {
    try {
      localStorage.removeItem(LS_KEY);
    } catch (err) {
      // Non-fatal: localStorage may be unavailable (private mode, blocked, etc.)
      console.warn("Could not clear localStorage:", err);
    }

    setFilter("");
    const fresh = instantiateTemplate();
    setSections(fresh);

    // Keep OPFS in sync (don't block UI; ignore failures)
    writeOpfsJson(fresh).catch((e) => {
      console.warn("OPFS write failed:", e);
    });
  }

  // Save current list to a user-picked file on the phone
  async function saveToPhone() {
    if (!supportsFS()) {
      exportJSON();
      return;
    } // fallback
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "travel-checklist.json",
        types: [
          { description: "JSON", accept: { "application/json": [".json"] } },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(
        new Blob([JSON.stringify(sections, null, 2)], {
          type: "application/json",
        })
      );
      await writable.close();
      alert("Saved to phone ✔");
    } catch (e) {
      // user cancelled or error
      if (e?.name !== "AbortError") alert("Save failed");
    }
  }

  // Open a JSON file from the phone and load it
  async function openFromPhoneAndLoad() {
    if (!supportsFS()) {
      alert(
        "Your browser doesn’t support direct file access. Use Import instead."
      );
      return;
    }
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          { description: "JSON", accept: { "application/json": [".json"] } },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);
      setSections(normalizeList(data));
      // keep OPFS in sync (optional)
      writeOpfsJson(normalizeList(data));
      alert("Loaded from phone ✔");
    } catch (e) {
      if (e?.name !== "AbortError") alert("Open failed");
    }
  }

  function addSection(title) {
    const t = title?.trim();
    if (!t) return;
    setSections((prev) => [...prev, { id: uid("sec"), title: t, items: [] }]);
  }

  function addItem(sectionId, text) {
    const t = text?.trim();
    if (!t) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: [...s.items, { id: uid("it"), text: t, done: false }],
            }
          : s
      )
    );
  }

  function toggleItem(sectionId, itemId) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((it) =>
                it.id === itemId ? { ...it, done: !it.done } : it
              ),
            }
          : s
      )
    );
  }

  function editItem(sectionId, itemId, newText) {
    const t = newText.trim();
    if (!t) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((it) =>
                it.id === itemId ? { ...it, text: t } : it
              ),
            }
          : s
      )
    );
  }

  function deleteItem(sectionId, itemId) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((it) => it.id !== itemId) }
          : s
      )
    );
  }

  function deleteSection(sectionId) {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }

  function renameSection(sectionId, newTitle) {
    const t = newTitle.trim();
    if (!t) return;
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title: t } : s))
    );
  }

  function sectionToggleAll(sectionId, done) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((it) => ({ ...it, done })) }
          : s
      )
    );
  }

  function clearAllChecks() {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        items: s.items.map((it) => ({ ...it, done: false })),
      }))
    );
  }

  function resetTemplate() {
    if (!confirm("Replace your current list with the default template?"))
      return;
    setSections(instantiateTemplate());
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(sections, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `travel-checklist-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data)) throw new Error("Invalid file");
        setSections(normalizeList(data));
      } catch {
        alert("Could not import this file.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={styles.title}>Travel Checklist Plus</h1>
            <input
              aria-label="Search items"
              placeholder="Search items…"
              style={styles.search}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div style={styles.toolbar}>
            <button style={styles.button} onClick={openFromPhoneAndLoad}>
              Open from phone
            </button>
            <button style={styles.button} onClick={saveToPhone}>
              Save to phone
            </button>
            

            <button
              style={styles.button}
              onClick={() => setAddingSection(true)}
            >
              + Section
            </button>
            <button style={styles.button} onClick={clearAllChecks}>
              Clear checks
            </button>
            <button style={styles.button} onClick={resetTemplate}>
              Load template
            </button>
            <button style={styles.button} onClick={exportJSON}>
              Export
            </button>
            <label
              style={{
                ...styles.button,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Import
              <input
                type="file"
                accept="application/json"
                style={{ display: "none" }}
                onChange={(e) => importJSON(e.target.files?.[0])}
              />
            </label><button
              style={{ ...styles.button, ...styles.danger }}
              title="Reset to standard template"
              onClick={resetAppData}
            >
              Reset data
            </button>
            <button
              style={{ ...styles.button, ...styles.primary }}
              onClick={() => window.print()}
            >
              Print
            </button>
          </div>
        </header>

        {addingSection && (
          <InlineAddSection
            onCancel={() => setAddingSection(false)}
            onAdd={(t) => {
              addSection(t);
              setAddingSection(false);
            }}
          />
        )}

        <main style={styles.grid}>
          {filtered.map((s) => (
            <SectionCard
              key={s.id}
              section={s}
              onAddItem={(text) => addItem(s.id, text)}
              onToggle={(itemId) => toggleItem(s.id, itemId)}
              onDeleteItem={(itemId) => deleteItem(s.id, itemId)}
              onEditItem={(itemId, text) => editItem(s.id, itemId, text)}
              onDeleteSection={() => deleteSection(s.id)}
              onRenameSection={(t) => renameSection(s.id, t)}
              onToggleAll={(done) => sectionToggleAll(s.id, done)}
            />
          ))}
        </main>

        <p style={styles.footer}>Data saves automatically in your browser.</p>
      </div>
    </div>
  );
}

function InlineAddSection({ onCancel, onAdd }) {
  const [title, setTitle] = useState("");
  const inputRef = useRef(null);
  useEffect(() => inputRef.current?.focus(), []);
  return (
    <div
      style={{
        maxWidth: 980,
        margin: "0 auto 16px",
        padding: 12,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <input
        ref={inputRef}
        placeholder="New section title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAdd(title)}
        style={{
          flex: 1,
          padding: "8px 10px",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      />
      <button
        onClick={() => onAdd(title)}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          background: "#2563eb",
          color: "#fff",
        }}
      >
        Add
      </button>
      <button
        onClick={onCancel}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          background: "#fff",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

function SectionCard({
  section,
  onAddItem,
  onToggle,
  onDeleteItem,
  onEditItem,
  onDeleteSection,
  onRenameSection,
  onToggleAll,
}) {
  const [adding, setAdding] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newItem, setNewItem] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const doneCount = section.items.filter((i) => i.done).length;
  const allChecked =
    section.items.length > 0 && doneCount === section.items.length;

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        {editingTitle ? (
          <input
            defaultValue={section.title}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onRenameSection(e.currentTarget.value);
                setEditingTitle(false);
              }
            }}
            onBlur={(e) => {
              onRenameSection(e.currentTarget.value);
              setEditingTitle(false);
            }}
            style={{ ...styles.input, fontWeight: 700 }}
            autoFocus
          />
        ) : (
          <h2 style={styles.cardTitle}>
            {section.title}
            <span
              style={{
                fontWeight: 500,
                marginLeft: 8,
                color: "#6b7280",
                fontSize: 12,
              }}
            >
              {doneCount}/{section.items.length}
            </span>
          </h2>
        )}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            title="Toggle all"
            style={styles.button}
            onClick={() => onToggleAll(!allChecked)}
          >
            {allChecked ? "Uncheck all" : "Check all"}
          </button>
          <button
            title="Rename"
            style={styles.button}
            onClick={() => setEditingTitle(true)}
          >
            Rename
          </button>
          <button
            title="Delete section"
            style={{ ...styles.button, ...styles.danger }}
            onClick={onDeleteSection}
          >
            Delete
          </button>
        </div>
      </div>

      <div>
        {section.items.map((it) => (
          <ItemRow
            key={it.id}
            item={it}
            onToggle={() => onToggle(it.id)}
            onDelete={() => onDeleteItem(it.id)}
            onEdit={(t) => onEditItem(it.id, t)}
          />
        ))}
      </div>

      {adding ? (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            ref={inputRef}
            placeholder="New item…"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAddItem(newItem);
                setNewItem("");
                inputRef.current?.focus();
              }
            }}
            style={styles.input}
          />
          <button
            style={{ ...styles.button, ...styles.primary }}
            onClick={() => {
              onAddItem(newItem);
              setNewItem("");
              inputRef.current?.focus();
            }}
          >
            Add
          </button>
          <button style={styles.button} onClick={() => setAdding(false)}>
            Done
          </button>
        </div>
      ) : (
        <button
          style={{ ...styles.button, marginTop: 8 }}
          onClick={() => setAdding(true)}
        >
          + Add item
        </button>
      )}
    </section>
  );
}

function ItemRow({ item, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  return (
    <div style={styles.itemRow}>
      <input type="checkbox" checked={item.done} onChange={onToggle} />
      {editing ? (
        <input
          ref={inputRef}
          defaultValue={item.text}
          onBlur={(e) => {
            onEdit(e.currentTarget.value);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onEdit(e.currentTarget.value);
              setEditing(false);
            } else if (e.key === "Escape") {
              setEditing(false);
            }
          }}
          style={{ ...styles.input, ...styles.itemText(item.done) }}
        />
      ) : (
        <label
          style={styles.itemText(item.done)}
          onDoubleClick={() => setEditing(true)}
        >
          {item.text}
        </label>
      )}
      <div style={styles.itemActions}>
        <button
          title="Edit"
          style={styles.button}
          onClick={() => setEditing(true)}
        >
          Edit
        </button>
        <button
          title="Delete"
          style={{ ...styles.button, borderColor: "#fca5a5", color: "#b91c1c" }}
          onClick={onDelete}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
