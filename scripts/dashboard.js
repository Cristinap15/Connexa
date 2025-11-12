// Dashboard-specific logic: show Active Projects and allow quick create

(function() {
    const API = {
      list: 'data/projects_list.php',
      create: 'data/projects_create.php'
    };
  
    function qs(sel) { return document.querySelector(sel); }
  
    const countEl = qs('#active-projects-count');
    const recentList = qs('.recentsProjects');
    const newProjectBtn = qs('#new-project-btn');
    const popup = qs('#projectFormPopup');
    const closePopup = qs('#closePopup');
    const cancelBtn = qs('#cancelBtn');
    const form = qs('#newProjectForm');
  
    function showPopup() { if (popup) popup.style.display = 'flex'; }
    function hidePopup() { if (popup) popup.style.display = 'none'; }
  
    async function refreshActiveCount() {
      if (!countEl) return;
      try {
        const res = await fetch(API.list);
        const data = await res.json();
        const projects = Array.isArray(data.projects) ? data.projects : [];
        const active = projects.filter(p => String(p.status) !== 'Done').length;
        countEl.textContent = String(active);
      } catch (e) {
        console.error('Failed to load active projects count', e);
      }
    }
  
    function statusPill(status) {
      const cls = status === 'Done' ? 'done' : (status === 'In Progress' ? 'in-progress' : 'not-started');
      return `<span class="pill ${cls}">${status}</span>`;
    }
  
    function statusClass(status) {
      return status === 'Done' ? 'done' : (status === 'In Progress' ? 'in-progress' : 'not-started');
    }

    function progressPercentFor(status) {
      if (status === 'Done') return 100;
      if (status === 'In Progress') return 70;
      return 30;
    }
  
    function renderRecentItem(p) {
      const pct = progressPercentFor(String(p.status));
      const statusCls = statusClass(String(p.status));
      return `
       <div class="project">
        <img src="./icons-menu/3Dots.png" alt="">
        <div class="project-info">
          <div class="project-header">
            <div>
              <h3 class="project-title">${p.name}</h3>
              <span class="status ${statusCls}">${p.status}</span>
            </div>
            <p class="client-name">${p.client_name}</p>
          </div>
          <div class="projects-footer">
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress" style="width:${pct}%"></div>
              </div>
              <span class="progress-value">${pct}%</span>
            </div>
            <span class="due-date">Due: ${p.due_date}</span>
          </div>
        </div>
      </div>`;
    }
  
    async function loadRecent() {
      if (!recentList) return;
      try {
        const res = await fetch(API.list);
        const data = await res.json();
        const projects = Array.isArray(data.projects) ? data.projects : [];
        const top = projects.slice(0, 4);
        if (top.length === 0) {
            recentList.innerHTML = `<p class="no-data">No recent projects to display.</p>`;
          } else {
            recentList.innerHTML = top.map(renderRecentItem).join('');
          }
        } catch (e) {
          console.error('Failed to load recent projects', e);
        }
    }
  
    async function createProject(payload) {
      const res = await fetch(API.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch (_) { /* non-JSON */ }
      if (!res.ok) {
        const msg = (json && (json.error || json.details)) || text || `HTTP ${res.status}`;
        throw new Error(String(msg));
      }
      return json || {};
    }
  
    document.addEventListener('DOMContentLoaded', () => {
      refreshActiveCount();
      loadRecent();
  
      newProjectBtn && (newProjectBtn.onclick = showPopup);
      closePopup && (closePopup.onclick = hidePopup);
      cancelBtn && (cancelBtn.onclick = hidePopup);
      window.addEventListener('click', (e) => { if (e.target === popup) hidePopup(); });
  
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = Object.fromEntries(new FormData(form).entries());
          try {
            const { project, error } = await createProject(formData);
            if (error) throw new Error(error);
            // Increment the counter only if the new project is considered active
            if (project && String(project.status) !== 'Done' && countEl) {
              const current = parseInt(countEl.textContent || '0', 10) || 0;
              countEl.textContent = String(current + 1);
            }
            // Prepend to recent list for immediate feedback
            if (project && recentList) {
                const noDataEl = recentList.querySelector('.no-data');
                if (noDataEl) noDataEl.remove();
                recentList.insertAdjacentHTML('afterbegin', renderRecentItem(project));
            }
            form.reset();
            hidePopup();
          } catch (err) {
            console.error('Create project failed:', err);
            alert(`Failed to create project. ${err && err.message ? err.message : 'Ensure the backend is running and DB is configured.'}`);
          }
        });
      }
    });
  })();
  
