import fs from "fs/promises";
import path from "path";
import mime from "mime-types";

const PREROLL_DIR = process.env.PREROLL_DIR || "/app/prerolls";

async function ensureDir() {
  await fs.mkdir(PREROLL_DIR, { recursive: true });
}

async function listPrerolls() {
  await ensureDir();
  const entries = await fs.readdir(PREROLL_DIR, { withFileTypes: true });
  const files = entries.filter(e => e.isFile());
  return Promise.all(files.map(async f => {
    const p = path.join(PREROLL_DIR, f.name);
    const stat = await fs.stat(p);
    return {
      name: f.name,
      path: p,
      size: stat.size,
      mime: mime.lookup(p) || "application/octet-stream",
      mtime: stat.mtime
    };
  }));
}

async function saveUpload({ filename, buffer }) {
  await ensureDir();
  const safe = filename.replace(/[^\w.\- ]+/g, "_");
  const full = path.join(PREROLL_DIR, safe);
  await fs.writeFile(full, buffer);
  return full;
}

async function removePreroll(filename) {
  const full = path.join(PREROLL_DIR, filename);
  await fs.unlink(full);
}

export default {
  PREROLL_DIR,
  listPrerolls,
  saveUpload,
  removePreroll
};
