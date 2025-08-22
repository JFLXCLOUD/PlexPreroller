const BASE = location.origin.replace(/:\d+$/, ":8088"); // backend via docker-compose
let API_KEY = localStorage.getItem("pr_api_key") || "";

function saveKey() {
  API_KEY = document.getElementById("apiKey").value.trim();
  localStorage.setItem("pr_api_key", API_KEY);
  load();
}

async function api(path, opts={}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "x-api-key": API_KEY, ...(opts.headers||{}) }
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  return res.json();
}

async function load() {
  document.getElementById("apiKey").value = API_KEY || "";
  const data = await api("/api/prerolls");
  const ul = document.getElementById("list");
  ul.innerHTML = "";
  for (const item of data.items) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <input type="checkbox" data-name="${item.name}" />
        <strong>${item.name}</strong>
        <span class="muted">(${Math.round(item.size/1024/1024)} MB)</span>
      </div>
      <div>
        <button class="btn" data-del="${item.name}">Delete</button>
      </div>
    `;
    ul.appendChild(li);
  }
  ul.addEventListener("click", async (e) => {
    if (e.target.dataset.del) {
      if (confirm(`Delete ${e.target.dataset.del}?`)) {
        await api(`/api/prerolls/${encodeURIComponent(e.target.dataset.del)}`, { method: "DELETE" });
        load();
      }
    }
  }, { once: true });
}

async function upload() {
  const f = document.getElementById("file").files[0];
  if (!f) return alert("Pick a video file");
  const fd = new FormData();
  fd.append("file", f);
  await fetch(`${BASE}/api/prerolls`, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: fd
  }).then(r => r.json());
  await load();
}

async function applySelected() {
  const boxes = [...document.querySelectorAll('input[type="checkbox"][data-name]:checked')];
  const names = boxes.map(b => b.dataset.name);
  if (!names.length) return alert("Select at least one preroll");
  await api("/api/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filenames: names })
  });
  alert("Applied!");
}

async function applyRandom(n=1) {
  await api("/api/apply/random", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count: n })
  });
  alert("Applied random!");
}

async function clearAll() {
  await api("/api/clear", { method: "POST" });
  alert("Cleared Plex prerolls.");
}

async function refresh() {
  await api("/api/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
  alert("Triggered Plex scan.");
}

load().catch(err => console.error(err));
