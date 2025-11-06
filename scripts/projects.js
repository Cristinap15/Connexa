
  const newProjectBtn = document.getElementById("new-project-btn");
  const popup = document.getElementById("projectFormPopup");
  const closePopup = document.getElementById("closePopup");
  const cancelBtn = document.getElementById("cancelBtn");
  const form = document.getElementById("newProjectForm");
  const dashboard = document.getElementById("dashboard-content");

  newProjectBtn.onclick = () => popup.style.display = "flex";
  closePopup.onclick = cancelBtn.onclick = () => popup.style.display = "none";
  window.onclick = (e) => { if (e.target === popup) popup.style.display = "none"; };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <div class="status-area">
        <button class="status-btn ${data.status.toLowerCase().replace(' ', '-')}">${data.status}</button>
        <button class="menu-btn">⋮</button>
        <div class="status-dropdown">
          <div class="status-option not-started">Not Started</div>
          <div class="status-option in-progress">In Progress</div>
          <div class="status-option done">Done</div>
        </div>
        <div class="menu-dropdown">
          <div class="menu-option delete">Delete</div>
        </div>
      </div>
      <h2>${data.project_name}</h2>
      <p>${data.description || "No description provided."}</p>
      <div class="project-info">
        <div class="info-item"><img src="./icons-menu/Organization-color.svg" class="info-icon" /> ${data.client_name}</div>
        <div class="info-item"><img src="./icons-menu/calendar-color.svg" class="info-icon" /> ${data.due_date}</div>
        <div class="info-item"><img src="./icons-menu/dolar-color.svg" class="info-icon" /> $${data.budget}</div>
        <div class="info-item"><img src="./icons-menu/clock-color.svg" class="info-icon" /> 0h</div>
      </div>
      <div class="progress-header">
        <span>Progress</span><span class="progress-value">0%</span>
      </div>
      <div class="progress-container">
        <div class="progress-bar"><div class="progress" style="width:0%"></div></div>
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

    card.querySelector(".menu-option.delete").addEventListener("click", () => {
      card.style.transition = "opacity 0.3s ease";
      card.style.opacity = "0";
      setTimeout(() => card.remove(), 300);
    });

    dashboard.appendChild(card);
    form.reset();
    popup.style.display = "none";
  });
