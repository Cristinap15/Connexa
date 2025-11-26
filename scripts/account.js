// Populate account page with logged-in user info
(async function () {
  async function fetchUser() {
    try {
      const res = await fetch('data/auth_me.php');
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data && data.user ? data.user : null;
    } catch (_) {
      try {
        const res = await fetch('data/getUser.php');
        const data = await res.json();
        return data || null;
      } catch (_) {
        return null;
      }
    }
  }

  function setText(sel, value) {
    const el = document.querySelector(sel);
    if (el) el.textContent = value || '';
  }

  function setInput(sel, value) {
    const el = document.querySelector(sel);
    if (el) el.value = value || '';
  }

  const user = await fetchUser();
  if (!user) return;

  const initials = (user.name || '')
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  setText('.avatar-initials', initials);
  setText('.profile-name', user.name);
  setText('.profile-role', user.role ? user.role : 'Member');
  setText('.profile-badge', user.role ? user.role : 'User');

  setInput('input[name="full_name"]', user.name);
  setInput('input[name="email"]', user.email);
  setInput('input[name="phone"]', user.phone || '');
  setInput('input[name="company"]', user.company || '');

  const memberSinceEl = document.querySelector('.member-info span');
  if (memberSinceEl && user.created_at) {
    const d = new Date(user.created_at);
    const fmt = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    memberSinceEl.textContent = `Member since ${fmt}`;
  }

  // Activity stats
  async function fetchProjectsCount() {
    try {
      const res = await fetch('data/projects_list.php');
      const data = await res.json();
      const items = Array.isArray(data.projects) ? data.projects : [];
      return items.length;
    } catch (_) { return 0; }
  }

  async function fetchClientsCount() {
    try {
      const res = await fetch('data/clients_list.php');
      const data = await res.json();
      const items = Array.isArray(data.clients) ? data.clients : [];
      return items.length;
    } catch (_) { return 0; }
  }

  try {
    const [projectsCount, clientsCount] = await Promise.all([
      fetchProjectsCount(),
      fetchClientsCount(),
    ]);
    setText('#stat-projects', String(projectsCount));
    setText('#stat-clients', String(clientsCount));
    setText('#stat-success', '100%');
  } catch (_) {
    setText('#stat-projects', '0');
    setText('#stat-clients', '0');
    setText('#stat-success', '100%');
  }
})();
