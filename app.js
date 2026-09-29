/* ═══════════════════════════════════════════
   Face Consent Manager — app.js
   ═══════════════════════════════════════════ */

// ── Guest data ──────────────────────────────
const GUESTS = [
  {
    id: "guest042", name: "Unnamed guest",
    phone: null,
    time: "23/9/2026, 4:05:14 pm",
    status: "pending",
    photo: "C:/Users/Meenakshi/.gemini/antigravity-ide/brain/f52ca61d-410a-4ea2-aed2-4b927ec51cae/guest_avatar_1_1790666430361.jpg"
  },
  {
    id: "guest041", name: "Unnamed guest",
    phone: null,
    time: "23/9/2026, 1:46:17 pm",
    status: "pending",
    photo: "C:/Users/Meenakshi/.gemini/antigravity-ide/brain/f52ca61d-410a-4ea2-aed2-4b927ec51cae/guest_avatar_2_1790666449401.jpg"
  },
  {
    id: "guest040", name: "Priya Sharma",
    phone: "+91 98765 43210",
    time: "23/9/2026, 11:22:03 am",
    status: "optin",
    photo: null
  },
  {
    id: "guest039", name: "Rahul Verma",
    phone: "+91 87654 32109",
    time: "23/9/2026, 10:15:47 am",
    status: "optin",
    photo: null
  },
  {
    id: "guest038", name: "Ananya Iyer",
    phone: null,
    time: "23/9/2026, 9:44:32 am",
    status: "optout",
    photo: null
  },
  {
    id: "guest037", name: "Vikram Nair",
    phone: "+91 76543 21098",
    time: "22/9/2026, 7:30:00 pm",
    status: "optin",
    photo: null
  },
  {
    id: "guest036", name: "Unnamed guest",
    phone: null,
    time: "22/9/2026, 5:18:09 pm",
    status: "pending",
    photo: null
  },
  {
    id: "guest035", name: "Meena Pillai",
    phone: "+91 65432 10987",
    time: "22/9/2026, 3:55:22 pm",
    status: "optin",
    photo: null
  },
];

// ── State ────────────────────────────────────
let activeFilter = "all";
let searchQuery  = "";

// ── Render ───────────────────────────────────
function render() {
  const list = document.getElementById("guest-list");
  list.innerHTML = "";

  const filtered = GUESTS.filter(g => {
    const matchFilter =
      activeFilter === "all"     ? true :
      activeFilter === "optin"   ? g.status === "optin"   :
      activeFilter === "optout"  ? g.status === "optout"  :
      activeFilter === "pending" ? g.status === "pending" : true;

    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      g.name.toLowerCase().includes(q) ||
      g.id.toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="#9ca3af">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <p>No guests found</p>
      </div>`;
    return;
  }

  filtered.forEach((g, i) => {
    const card = document.createElement("div");
    card.className = "guest-card";
    card.style.animationDelay = `${i * 50}ms`;
    card.setAttribute("data-id", g.id);
    card.innerHTML = buildCard(g);
    list.appendChild(card);
  });
}

function buildCard(g) {
  const photoHtml = g.photo
    ? `<img class="guest-photo" src="${g.photo}" alt="Guest photo" onclick="handleReplacePhoto('${g.id}')" title="Click to replace photo" style="cursor:pointer" onerror="this.replaceWith(makePlaceholder())" />`
    : `<div class="guest-photo-placeholder" onclick="handleReplacePhoto('${g.id}')" title="Click to upload photo" style="cursor:pointer">
         <svg width="34" height="34" viewBox="0 0 24 24" fill="#6366f1">
           <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
         </svg>
       </div>`;

  const phoneHtml = g.phone
    ? `<div class="guest-meta">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
         ${g.phone}
       </div>`
    : `<div class="guest-meta">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
         No phone
       </div>`;

  const statusBadge = {
    pending: `<span class="badge badge-pending">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                PENDING
              </span>`,
    optin:   `<span class="badge badge-optin">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                OPT IN
              </span>`,
    optout:  `<span class="badge badge-optout">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                OPT OUT
              </span>`,
  }[g.status] || "";

  return `
    <div class="card-header">
      ${photoHtml}
      <div class="card-info">
        <div class="card-name-row">
          <span class="guest-name">${g.name}</span>
          <span class="guest-id">#${g.id}</span>
        </div>
        ${phoneHtml}
        <div class="guest-time">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          ${g.time}
        </div>
        ${statusBadge}
      </div>
    </div>

    <div class="card-actions-row1">
      <button class="btn btn-optin"   id="optin-${g.id}"   onclick="handleOptIn('${g.id}')"   aria-label="Opt In ${g.id}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        Opt In
      </button>
      <button class="btn btn-optout"  id="optout-${g.id}"  onclick="handleOptOut('${g.id}')"  aria-label="Opt Out ${g.id}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="2"/><path d="M8 8l8 8M16 8l-8 8" stroke="white" stroke-width="2"/></svg>
        Opt Out
      </button>
      <button class="btn btn-history" id="history-${g.id}" onclick="handleHistory('${g.id}')" aria-label="History ${g.id}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        History
      </button>
    </div>

    <div class="card-actions-row2">
      <button class="btn btn-photo" id="photo-${g.id}" onclick="handleReplacePhoto('${g.id}')" aria-label="Photo ${g.id}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M12 12c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-4.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
        Photo
      </button>
      <button class="btn btn-merge" id="merge-${g.id}" onclick="handleMerge('${g.id}')" aria-label="Merge ${g.id}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17 20.41 18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z"/></svg>
        Merge
      </button>
      <button class="btn btn-table"  id="table-${g.id}"  onclick="handleTable('${g.id}')"  aria-label="Table ${g.id}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z"/></svg>
        Table
      </button>
    </div>
  `;
}

// ── Filters ──────────────────────────────────
function setTab(btn, filter) {
  document.querySelectorAll(".tab").forEach(t => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
  });
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");
  activeFilter = filter;
  render();
}

function filterGuests() {
  searchQuery = document.getElementById("search-input").value;
  render();
}

// ── Actions ──────────────────────────────────
function handleOptIn(id) {
  const g = GUESTS.find(x => x.id === id);
  if (!g) return;
  if (g.status === "optin") { showToast("Already opted in!"); return; }
  g.status = "optin";
  showToast(`✅ ${g.name} opted IN`);
  render();
}

function handleOptOut(id) {
  const g = GUESTS.find(x => x.id === id);
  if (!g) return;
  if (g.status === "optout") { showToast("Already opted out!"); return; }
  g.status = "optout";
  showToast(`🚫 ${g.name} opted OUT`);
  render();
}

function handleHistory(id) {
  showToast(`📋 Viewing history for #${id}`);
}

function handleReplacePhoto(id) {
  const g = GUESTS.find(x => x.id === id);
  if (!g) return;
  if (g.status === "optout") {
    showToast("⚠️ Guest has opted out. Photo cannot be stored.");
    return;
  }
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      g.photo = reader.result;
      showToast(`📸 Photo updated for ${g.name}`);
      render();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function handleMerge(id) {
  showToast(`🔀 Merge profile for #${id}`);
}

function handleTable(id) {
  showToast(`📊 Table view for #${id}`);
}

// ── Bottom Nav ───────────────────────────────
function setNav(btn) {
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  btn.classList.add("active");
}

// ── Sync button ───────────────────────────────
document.getElementById("sync-btn").addEventListener("click", function () {
  this.classList.add("spinning");
  showToast("🔄 Syncing guests…");
  setTimeout(() => {
    this.classList.remove("spinning");
    showToast("✅ Synced • 30 guests");
  }, 1400);
});

// ── Toast ─────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ── Init ──────────────────────────────────────
render();
