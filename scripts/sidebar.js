async function loadSidebar() {
    try {
      const response = await fetch("./data/menu.json");
      const menu = await response.json();
  
      const sidebar = document.createElement("aside");
      sidebar.className = "sidebar";
  
      // Creează conținutul HTML al meniului
      let html = `
        <div class="sidebar-header">
          <div class="logo">Connexa</div>
          <button id="toggle-btn" title="Toggle Menu">
            <img id="toggle-icon" src="./icons-menu/arrows-left.png" alt="Toggle Menu Icon">
          </button>
        </div>
        <nav>
          <ul class="menu-top">
            ${menu.top
              .map(
                (item) => `
              <li>
                <a href="${item.link}">
                  <img src="${item.icon}" alt="${item.label} icon">
                  <span>${item.label}</span>
                </a>
              </li>`
              )
              .join("")}
          </ul>
          <ul class="menu-bottom">
            ${menu.bottom
              .map(
                (item) => `
              <li>
                <a href="${item.link}">
                  <img src="${item.icon}" alt="${item.label} icon">
                  <span>${item.label}</span>
                </a>
              </li>`
              )
              .join("")}
          </ul>
        </nav>
      `;
  
      sidebar.innerHTML = html;
      document.querySelector("#sidebar-container").appendChild(sidebar);
  
      // Active page highlighting
      const currentPage = window.location.pathname.split("/").pop();
      sidebar.querySelectorAll("a").forEach((link) => {
        if (link.getAttribute("href") === currentPage) link.classList.add("active");
      });
  
      // Toggle sidebar
      const toggleBtn = sidebar.querySelector("#toggle-btn");
      const toggleIcon = sidebar.querySelector("#toggle-icon");
  
      // Verifică dacă există o stare salvată
      const isCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
      if (isCollapsed) sidebar.classList.add("collapsed");
  
      // Setează iconița corectă la încărcare
      toggleIcon.src = isCollapsed ? "./icons-menu/arrows-right.png" : "./icons-menu/arrows-left.png";
  
      toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        const collapsed = sidebar.classList.contains("collapsed");
        localStorage.setItem("sidebar-collapsed", collapsed);
        toggleIcon.src = collapsed ? "./icons-menu/arrows-right.png" : "./icons-menu/arrows-left.png";
      });
  
    } catch (error) {
      console.error("Error loading sidebar:", error);
    }
  }
  
  document.addEventListener("DOMContentLoaded", loadSidebar);
  