async function loadHeader() {
    try{
        let user = null;
        try {
            const response = await fetch("./data/auth_me.php");
            if (response.ok) {
                const payload = await response.json();
                user = payload && payload.user ? payload.user : null;
            }
        } catch (_) { /* fall back to getUser.php */ }
        if (!user) {
            const response = await fetch("./data/getUser.php");
            user = await response.json();
        }
        const header = document.createElement("header");
        header.className = "dashboard-header";

        header.innerHTML=`
            <div class="header-tools">
                <div class="language-switch">
                    <span class="language-option active">RO</span>
                    <span class="language-separator">|</span>
                    <span class="language-option">RU</span>
                </div>
                <div class="header-icon">
                    <img src="./icons-menu/bell-icon.png" alt="Notifications">
                </div>
            </div>
            <div class="user-info">
                <div class="user-details">
                    <p class="user-name">${user.name}</p>
                    <p class="user-email">${user.email}</p>
                </div>
            </div>
        `;

        document.querySelector("#header-container").appendChild(header);

    }
    catch(error){
        console.error("Error loading header:", error);
    }
}
document.addEventListener("DOMContentLoaded", loadHeader);
