/*
 configuracion.js
 Propósito: Controla el modal de cambio de contraseña en la página de configuración.
 - `openModal()` y `closeModal()` abren/cierra el modal identificado por `passwordModal`.
 - Cierra el modal al hacer click fuera de este.
*/

function openModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) modal.classList.remove('show');
}

window.addEventListener('click', function (event) {
    const modal = document.getElementById('passwordModal');
    if (modal && event.target === modal) closeModal();
});
