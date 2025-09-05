// src/lib/opfs.js
import { OPFS_NAME } from "../config.js";

export async function readOpfsJson(name = OPFS_NAME) {
  if (!("storage" in navigator) || !navigator.storage?.getDirectory) return null;
  try {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle(name, { create: false });
    const file = await handle.getFile();
    return JSON.parse(await file.text());
  } catch {
    return null;
  }
}

export async function writeOpfsJson(data, name = OPFS_NAME) {
  if (!("storage" in navigator) || !navigator.storage?.getDirectory) return false;
  try {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    await writable.close();
    return true;
  } catch {
    return false;
  }
}
