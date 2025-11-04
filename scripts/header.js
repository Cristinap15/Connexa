async function loadHeader() {
    try{
        const response = await fetch("./data/getUser.php");
        const user = await response.json();
        const header = document.createElement("header");
        header.className = "dashboard-header";

        header.innerHTML=`
            <div class="header-tools">
                <div class="language-switch">
                    <span class="language-option active">ROM</span>
                    <span class="language-separator">|</span>
                    <span class="language-option">RUS</span>
                </div>
                <div class="header-icon">
                    <img src="./icons-menu/bell-icon.png" alt="Notifications">
                </div>
            </div>
            <div class="user-info">
                <img src="${user.avatar}" alt="User avatar" class="user-avatar">
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