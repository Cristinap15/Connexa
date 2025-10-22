async function loadSidebar() {
    try{
        const response = await fetch("./data/sidebar.html");
        const menu = await response.json();

        const sidebar = document.createElement("aside");
        sidebar.className="sidebar";

        let html=`
        <div class="sidebar-header">
            <div class="logo">
                <p>Connexa</p>
                <button id="toggle-btn" title="Toggle Menu">
                    img src="./icons-menu/arrows.png" alt="Toggle Menu Icon"
                </button>
            </div>

        `;
    } 
    
}