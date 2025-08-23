const fs = require("fs-extra");
const path = require("path");
const mime = require("mime-types");

async function listPrerolls(prerollDir) {
  await fs.ensureDir(prerollDir);
  const entries = await fs.readdir(prerollDir, { withFileTypes: true });
  const files = entries.filter(e => e.isFile());
  return Promise.all(files.map(async f => {
    const p = path.join(prerollDir, f.name);
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

async function saveUpload(prerollDir, { filename, buffer }) {
  await fs.ensureDir(prerollDir);
  const safe = filename.replace(/[^\w.\- ]+/g, "_");
  const full = path.join(prerollDir, safe);
  await fs.writeFile(full, buffer);
  return full;
}

async function removePreroll(prerollDir, filename) {
  const full = path.join(prerollDir, filename);
  await fs.unlink(full);
}

module.exports = {
  listPrerolls,
  saveUpload,
  removePreroll
};
