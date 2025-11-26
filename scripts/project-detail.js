// Load a single project by id from the list endpoint
(async function () {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id') || '0', 10) || null;

  function statusClass(status) {
    return status === 'Done' ? 'done' : (status === 'In Progress' ? 'in-progress' : 'not-started');
  }

  function statusPillColor(status) {
    if (status === 'Done') return { bg: '#e7f7ee', color: '#1f8f52' };
    if (status === 'In Progress') return { bg: '#e6e9ff', color: '#1c32a4' };
    return { bg: '#f7f2ff', color: '#5330b7' };
  }

  function progressFor(status) {
    if (status === 'Done') return 100;
    if (status === 'In Progress') return 70;
    return 30;
  }

  async function loadProject() {
    try {
      const res = await fetch('data/projects_list.php');
      const data = await res.json();
      const items = Array.isArray(data.projects) ? data.projects : [];
      let project = null;
      if (id) {
        project = items.find(p => String(p.id) === String(id));
      }
      if (!project && items.length) {
        project = items[0];
      }
      if (!project) {
        document.getElementById('project-title').textContent = 'Project not found';
        return;
      }

      const status = project.status || 'Not Started';
      const pct = progressFor(status);
      const { bg, color } = statusPillColor(status);

      document.getElementById('project-title').textContent = project.name || project.project_name || 'Project';
      document.getElementById('project-description').textContent = project.description || 'No description provided.';
      document.getElementById('project-status').textContent = status;
      const pill = document.getElementById('project-status');
      pill.style.background = bg;
      pill.style.color = color;

      document.getElementById('project-client').textContent = project.client_name || '';
      document.getElementById('project-due').textContent = project.due_date || '';
      document.getElementById('project-budget').textContent = `$${project.budget || 0}`;

      document.getElementById('project-progress').style.width = `${pct}%`;
      document.getElementById('project-progress-value').textContent = `${pct}%`;

      // Demo tasks/time entries (since there is no backend for these yet)
      const tasks = [
        { title: 'Research & Analysis', duration: '8h' },
        { title: 'Wireframing', duration: '12h' },
        { title: 'UI Design', duration: '14h' },
        { title: 'Frontend Development', duration: '7h' },
      ];
      const taskList = document.getElementById('task-list');
      if (taskList) {
        taskList.innerHTML = tasks.map(t => `
          <div class="task-item">
            <div class="task-left">
              <input type="checkbox" />
              <span>${t.title}</span>
            </div>
            <span class="task-duration">${t.duration}</span>
          </div>
        `).join('');
      }

      const entries = [
        { title: 'UI Design', hours: '4h', body: 'Worked on homepage layout', date: 'Dec 15, 2025' },
        { title: 'UI Design', hours: '4h', body: 'Worked on homepage layout', date: 'Dec 15, 2025' },
        { title: 'UI Design', hours: '4h', body: 'Worked on homepage layout', date: 'Dec 15, 2025' },
        { title: 'UI Design', hours: '4h', body: 'Worked on homepage layout', date: 'Dec 15, 2025' },
      ];
      const entryList = document.getElementById('entry-list');
      if (entryList) {
        entryList.innerHTML = entries.map(e => `
          <div class="entry-card">
            <div class="entry-title">
              <span>${e.title}</span><span>${e.hours}</span>
            </div>
            <div class="entry-body">${e.body}</div>
            <div class="entry-date">${e.date}</div>
          </div>
        `).join('');
      }
    } catch (e) {
      console.error('Failed to load project', e);
      document.getElementById('project-title').textContent = 'Project not found';
    }
  }

  loadProject();
})();
