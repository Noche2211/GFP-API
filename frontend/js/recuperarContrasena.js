/*
 recuperarContrasena.js
 Propósito: Lógica para enviar enlace de recuperación desde la interfaz.
 - `sendRecoveryLink()` muestra una notificación simulada de envío y luego la oculta.
 - `hideNotification()` oculta el toast `recoveryNotification`.
*/

function sendRecoveryLink() {
    const notification = document.getElementById('recoveryNotification');
    if (notification) notification.classList.add('show');

    setTimeout(() => {
        hideNotification();
    }, 3000);
}

function hideNotification() {
    const el = document.getElementById('recoveryNotification');
    if (el) el.classList.remove('show');
}
