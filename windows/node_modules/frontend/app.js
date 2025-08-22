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
  
  // Check if response is JSON
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  } else {
    // If not JSON, try to parse as JSON anyway (for backward compatibility)
    try {
      return await res.json();
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Server returned invalid response format');
    }
  }
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
  
  if (!API_KEY) {
    alert("Please set your API key first!");
    return;
  }
  
  const uploadBtn = document.getElementById("uploadBtn");
  const statusDiv = document.getElementById("uploadStatus");
  
  // Show upload status
  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";
  statusDiv.style.display = "block";
  statusDiv.className = "status info";
  statusDiv.textContent = `Uploading ${f.name} (${Math.round(f.size/1024/1024)} MB)...`;
  
  try {
    const fd = new FormData();
    fd.append("file", f);
    
    console.log('Sending API key:', API_KEY);
    const response = await fetch(`${BASE}/api/prerolls`, {
      method: "POST",
      headers: { "x-api-key": API_KEY },
      body: fd
    });
    
    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', response.headers);
    
    if (!response.ok) {
      let errorText;
      try {
        const errorResponse = await response.text();
        // Try to parse as JSON first
        try {
          const errorJson = JSON.parse(errorResponse);
          errorText = errorJson.error || errorResponse;
        } catch {
          errorText = errorResponse;
        }
      } catch {
        errorText = `Upload failed: ${response.status}`;
      }
      console.error('Upload error response:', errorText);
      throw new Error(errorText);
    }
    
    let result;
    try {
      result = await response.json();
      console.log('Upload success result:', result);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Server returned invalid response format');
    }
    
    // Show success
    statusDiv.className = "status success";
    statusDiv.textContent = `Successfully uploaded ${result.filename || f.name}!`;
    
    // Clear file input
    document.getElementById("file").value = "";
    
    // Reload the list
    try {
      await load();
    } catch (loadError) {
      console.warn('Failed to reload list, but upload was successful:', loadError);
      // Show success message anyway
      statusDiv.className = "status success";
      statusDiv.textContent = `Successfully uploaded ${result.filename || f.name}! (List refresh failed)`;
    }
    
  } catch (error) {
    console.error("Upload error:", error);
    statusDiv.className = "status error";
    statusDiv.textContent = `Upload failed: ${error.message}`;
  } finally {
    // Reset button
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
    
    // Clear status after 5 seconds
    setTimeout(() => {
      statusDiv.style.display = "none";
    }, 5000);
  }
}

async function applySelected() {
  const boxes = [...document.querySelectorAll('input[type="checkbox"][data-name]:checked')];
  const names = boxes.map(b => b.dataset.name);
  if (!names.length) return alert("Select at least one preroll");
  
  try {
    await api("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filenames: names })
    });
    alert(`Successfully applied ${names.length} preroll(s) to Plex!`);
  } catch (error) {
    alert(`Failed to apply prerolls: ${error.message}`);
  }
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
