const API = {
  list: 'data/clients_list.php',
  create: 'data/clients_create.php',
  update: 'data/clients_update.php',
};

const grid = document.getElementById('clients-grid');
const searchInput = document.getElementById('clients-search');
const newClientBtn = document.getElementById('new-project-btn');
const popup = document.getElementById('clientFormPopup');
const closePopup = document.getElementById('closeClientPopup');
const cancelBtn = document.getElementById('cancelClientBtn');
const form = document.getElementById('newClientForm');
const popupTitle = popup ? popup.querySelector('h2') : null;
const saveBtn = form ? form.querySelector('button[type="submit"]') : null;

let clients = [];
let editingId = null;

function showPopup() { if (popup) popup.style.display = 'flex'; }
function hidePopup() {
  if (popup) popup.style.display = 'none';
  if (form) form.reset();
  editingId = null;
  if (popupTitle) popupTitle.textContent = 'New Client';
  if (saveBtn) saveBtn.textContent = 'Add Client';
}

function statusClass(status) {
  return (status && status.toLowerCase() === 'active') ? 'active' : 'inactive';
}

function buildCard(c) {
  const company = c.company || 'No company';
  const email = c.email || 'No email';
  const phone = c.phone || 'No phone';
  const projects = Number(c.projects_count || 0);
  const total = Number(c.total_value || 0).toFixed(2);
  const card = document.createElement('div');
  card.className = 'client-card';
  card.innerHTML = `
    <div class="client-header">
      <h2 class="client-name">${c.name}</h2>
      <div class="status-area">
        <button class="status-btn ${statusClass(c.status)}">${c.status || 'Active'}</button>
      </div>
    </div>
    <div class="client-content">
      <div class="client-contact-info">
        <div class="info-item">
          <img src="./icons-menu/Organization-color.svg" class="info-icon" alt="">
          <p>${company}</p>
        </div>
        <div class="info-item">
          <img src="./icons-menu/Letter.png" class="info-icon" alt="">
          <p>${email}</p>
        </div>
        <div class="info-item">
          <img src="./icons-menu/Phone.png" class="info-icon" alt="">
          <p>${phone}</p>
        </div>
      </div>
      <hr>
      <div class="client-project-stats">
        <div class="stats-row">
          <span>Projects:</span>
          <span class="projects_number">${projects}</span>
        </div>
        <div class="stats-row">
          <span>Total value:</span>
          <span class="value">$${total}</span>
        </div>
      </div>
    </div>
    <div class="card-buttons">
      <button class="btn-contact">Edit</button>
      <button class="btn-view-projects">View Projects</button>
    </div>
  `;

  const contactBtn = card.querySelector('.btn-contact');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      editingId = c.id;
      if (popupTitle) popupTitle.textContent = 'Edit Client';
      if (saveBtn) saveBtn.textContent = 'Update Client';
      if (form) {
        const setValue = (name, value) => {
          if (form.elements[name]) form.elements[name].value = value || '';
        };
        setValue('full_name', c.name || '');
        setValue('company_name', c.company || '');
        setValue('email', c.email || '');
        setValue('phone', c.phone || '');
        setValue('address', c.address || '');
        setValue('notes', c.notes || '');
        setValue('status', c.status || 'Active');
      }
      showPopup();
    });
  }

  const viewBtn = card.querySelector('.btn-view-projects');
  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      if (c.name) {
        const url = new URL('projects.html', window.location.href);
        url.searchParams.set('client', c.name);
        window.location.href = url.toString();
      } else {
        window.location.href = 'projects.html';
      }
    });
  }

  return card;
}

function renderClients(list) {
  if (!grid) return;
  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML = `<p class="no-data">No clients yet. Create one to get started.</p>`;
    return;
  }
  list.forEach(c => grid.appendChild(buildCard(c)));
}

async function loadClients() {
  if (!grid) return;
  try {
    const res = await fetch(API.list);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) {
      console.error('Invalid JSON from clients_list.php:', text);
      throw new Error(`Invalid server response: ${text.slice(0, 200)}`);
    }
    if (!res.ok || (data && data.error)) {
      const msg = (data && (data.error || data.details)) || text || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    clients = Array.isArray(data.clients) ? data.clients : [];
    renderClients(clients);
  } catch (e) {
    console.error('Failed to load clients', e);
    grid.innerHTML = `<p class="no-data">Failed to load clients. ${e && e.message ? e.message : ''}</p>`;
  }
}

function applySearch(term) {
  const q = term.trim().toLowerCase();
  if (!q) return renderClients(clients);
  const filtered = clients.filter(c =>
    [c.name, c.company, c.email, c.phone].some(
      val => val && String(val).toLowerCase().includes(q)
    )
  );
  renderClients(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  loadClients();

  if (newClientBtn) newClientBtn.onclick = showPopup;
  if (closePopup) closePopup.onclick = hidePopup;
  if (cancelBtn) cancelBtn.onclick = hidePopup;
  window.addEventListener('click', (e) => { if (e.target === popup) hidePopup(); });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(form).entries());
      const mapped = {
        name: formData.full_name || formData.client_name || '',
        client_name: formData.full_name || formData.client_name || '',
        company: formData.company_name || formData.company || '',
        company_name: formData.company_name || formData.company || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        notes: formData.notes || '',
        status: formData.status || 'Active'
      };
      const isEdit = !!editingId;
      try {
        const target = isEdit ? API.update : API.create;
        const payload = { ...mapped };
        if (isEdit) payload.id = editingId;
        const res = await fetch(target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const text = await res.text();
        let json = null;
        try { json = text ? JSON.parse(text) : null; } catch (parseErr) {
          console.error('Invalid JSON from clients_create/update:', text);
        }
        if (!res.ok || (json && json.error)) {
          const msg = json
            ? [json.error, json.details].filter(Boolean).join(': ')
            : (text || `HTTP ${res.status}`);
          throw new Error(msg);
        }
        const client = json && json.client ? json.client : mapped;
        client.projects_count = client.projects_count || 0;
        client.total_value = client.total_value || 0;
        if (isEdit) {
          client.id = editingId;
          clients = clients.map(c => c.id === editingId ? { ...c, ...client } : c);
        } else {
          clients.unshift(client);
        }
        renderClients(clients);
        form.reset();
        hidePopup();
      } catch (err) {
        console.error('Failed to create client', err);
        alert((isEdit ? 'Failed to update client. ' : 'Failed to create client. ') + (err && err.message ? err.message : ''));
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => applySearch(e.target.value));
  }
});
