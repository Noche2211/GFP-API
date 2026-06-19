/*
 main.js
 Propósito: Contiene la lógica compartida de la interfaz usada por varias páginas.
 - Controla la apertura y cierre del menú lateral (`menuBtn`, `sideMenu`, `menuIcon`).
 - Marca los elementos activos del menú y la barra inferior.
 - Provee helpers para ocultar notificaciones por id.
 Este archivo debe ser incluido antes de los scripts específicos de página.
*/

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById("menuBtn");
    const menu = document.getElementById("sideMenu");
    const icon = document.getElementById("menuIcon");

    if (btn && menu && icon) {
        btn.addEventListener("click", () => {
            menu.classList.toggle("open");

            if (menu.classList.contains("open")) {
                icon.src = "../img/menuAbierto.svg";
            } else {
                icon.src = "../img/menuCerrado.svg";
            }
        });
    }

    const menuItems = document.querySelectorAll(".menu-options li");
    if (menuItems) {
        menuItems.forEach(item => {
            item.addEventListener("click", () => {
                menuItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");
            });
        });
    }

    const footerIcons = document.querySelectorAll(".bottom-bar .icon");
    if (footerIcons) {
        footerIcons.forEach(icon => {
            icon.addEventListener("click", () => {
                footerIcons.forEach(i => i.classList.remove("active"));
                icon.classList.add("active");
            });
        });
    }
});

function hideNotificationById(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
}

function hideNotification() {
    hideNotificationById('successNotification');
    hideNotificationById('loginNotification');
    hideNotificationById('recoveryNotification');
    hideNotificationById('backupNotification');
    hideNotificationById('errorNotification');
}
