/*
 metas.js
 Propósito: Maneja notificaciones en la página de metas.
 - Detecta `?success=goal` en la URL y muestra un toast de éxito (`successNotification`).
 - `hideNotification()` oculta el toast.
*/

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'goal') {
        const successNotif = document.getElementById('successNotification');
        if (successNotif) {
            successNotif.classList.add('show');
            setTimeout(() => {
                hideNotification();
            }, 5000);
        }
    }
});

function hideNotification() {
    const successNotif = document.getElementById('successNotification');
    if (successNotif) successNotif.classList.remove('show');
}
