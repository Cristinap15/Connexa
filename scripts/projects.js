const API = {
  list: 'data/projects_list.php',
  create: 'data/projects_create.php',
  update: 'data/projects_update.php',
  del: 'data/projects_delete.php'
};

  const newProjectBtn = document.getElementById("new-project-btn");
  const popup = document.getElementById("projectFormPopup");
  const closePopup = document.getElementById("closePopup");
  const cancelBtn = document.getElementById("cancelBtn");
  const form = document.getElementById("newProjectForm");
  // On projects.html, cards live inside the main grid with id `dashboard-content`
  const grid = document.getElementById("dashboard-content");

  if (newProjectBtn && popup) newProjectBtn.onclick = () => popup.style.display = "flex";
  if (closePopup && popup) closePopup.onclick = () => popup.style.display = "none";
  if (cancelBtn && popup) cancelBtn.onclick = () => popup.style.display = "none";
  window.onclick = (e) => { if (e.target === popup) popup.style.display = "none"; };

  function statusClass(status){
    const s = String(status);
    return s === 'Done' ? 'done' : (s === 'In Progress' ? 'in-progress' : 'not-started');
  }

  function progressFor(status){
    const s = String(status);
    if (s === 'Done') return 100;
    if (s === 'In Progress') return 50;
    return 0;
  }

  function buildCard(data){
    const name = data.project_name || data.name || '';
    const status = data.status || 'Not Started';
    const pct = progressFor(status);

    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <div class="status-area">
        <button class="status-btn ${statusClass(status)}">${status}</button>
        <button class="menu-btn"><img src="./icons-menu/3Dots.png" alt="menu icon"></button>
        <div class="status-dropdown">
          <div class="status-option not-started">Not Started</div>
          <div class="status-option in-progress">In Progress</div>
          <div class="status-option done">Done</div>
        </div>
        <div class="menu-dropdown">
          <div class="menu-option delete">Delete</div>
        </div>
      </div>
      <h2>${name}</h2>
      <p>${data.description || "No description provided."}</p>
      <div class="project-infoProjects">
        <div class="info-item"><img src="./icons-menu/Organization-color.svg" class="info-icon" /> ${data.client_name || ''}</div>
        <div class="info-item"><img src="./icons-menu/calendar-color.svg" class="info-icon" /> ${data.due_date || ''}</div>
        <div class="info-item"><img src="./icons-menu/dolar-color.svg" class="info-icon" /> $${data.budget || 0}</div>
        <div class="info-item"><img src="./icons-menu/clock-color.svg" class="info-icon" /> 0h</div>
      </div>
      <div class="progress-header">
        <span>Progress</span><span class="progress-value">${pct}%</span>
      </div>
      <div class="progress-containerProjects">
        <div class="progress-bar"><div class="progress" style="width:${pct}%"></div></div>
      </div>
      <div class="card-buttons">
        <button class="btn-details">View Details</button>
        <button class="btn-log">Log Time</button>
      </div>
    `;

    const statusBtn = card.querySelector(".status-btn");
    const statusDropdown = card.querySelector(".status-dropdown");
    const menuBtn = card.querySelector(".menu-btn");
    const menuDropdown = card.querySelector(".menu-dropdown");
    const progressBar = card.querySelector(".progress");
    const progressText = card.querySelector(".progress-value");

    statusBtn.addEventListener("click", () => {
      statusDropdown.style.display = statusDropdown.style.display === "flex" ? "none" : "flex";
    });

    menuBtn.addEventListener("click", () => {
      menuDropdown.style.display = menuDropdown.style.display === "flex" ? "none" : "flex";
    });

    card.querySelectorAll(".status-option").forEach(opt => {
      opt.addEventListener("click", () => {
        const newStatus = opt.textContent;
        statusBtn.textContent = newStatus;
        statusBtn.className = "status-btn " + opt.classList[1];
        statusDropdown.style.display = "none";

        if (newStatus === "Done") {
          progressBar.style.width = "100%";
          progressText.textContent = "100%";
        } else if (newStatus === "In Progress") {
          progressBar.style.width = "50%";
          progressText.textContent = "50%";
        } else {
          progressBar.style.width = "0%";
          progressText.textContent = "0%";
        }
      });
    });

    card.querySelector(".menu-option.delete").addEventListener("click", async () => {
      card.style.transition = "opacity 0.3s ease";
      card.style.opacity = "0";
      setTimeout(() => card.remove(), 300);
      // Optionally call backend delete if id exists
      if (data.id) {
        try {
          await fetch(API.del, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: data.id }) });
        } catch (_) { /* ignore UI-only delete errors */ }
      }
    });

    return card;
  }

  async function loadProjects(){
    if (!grid) return;
    try {
      const res = await fetch(API.list);
      const payload = await res.json();
      const items = Array.isArray(payload.projects) ? payload.projects : [];
      // Clear everything except the search bar (first child)
      const nodes = Array.from(grid.children).slice(1);
      nodes.forEach(n => n.remove());
      items.forEach(p => grid.appendChild(buildCard(p)));
    } catch (e) {
      console.error('Failed to load projects', e);
    }
  }



  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await fetch(API.create, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const dataText = await res.text();
        const data = dataText ? JSON.parse(dataText) : {};
        if (!res.ok || data.error) throw new Error(data.error || dataText || `HTTP ${res.status}`);
        const project = data.project || payload;
        if (grid) grid.appendChild(buildCard(project));
        form.reset();
        if (popup) popup.style.display = "none";
      } catch (err) {
        console.error('Failed to create project', err);
        alert('Failed to create project. ' + (err && err.message ? err.message : ''));
      }
    });
  }

  // Load existing projects on page load
  document.addEventListener('DOMContentLoaded', loadProjects);
