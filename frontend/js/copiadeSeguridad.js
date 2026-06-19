/*
 copiadeSeguridad.js
 Propósito: Funciones para generar y descargar copias de seguridad desde la interfaz.
 - `generateBackup()`: muestra notificación de generación de copia.
 - `downloadBackup(id)`: simula la descarga de una copia y muestra notificaciones de progreso.
 - Los cierres de notificación (`closeNotification`, `closeDownloadNotification`) ocultan los toasts.
*/

function generateBackup() {
    const notification = document.getElementById('backupNotification');
    if (notification) notification.classList.add('show');

    setTimeout(() => {
        closeNotification();
    }, 5000);
}

function closeNotification() {
    const notification = document.getElementById('backupNotification');
    if (notification) notification.classList.remove('show');
}

function downloadBackup(id) {
    const num = id < 10 ? '0' + id : id;
    const fileName = `Copia de seguridad ${num}`;
    const notification = document.getElementById('downloadNotification');
    const textElement = document.getElementById('downloadText');

    if (textElement) textElement.innerText = `La ${fileName} esta en proceso de descarga`;
    if (notification) notification.classList.add('show');

    setTimeout(() => {
        closeDownloadNotification();
    }, 5000);
}

function closeDownloadNotification() {
    const notification = document.getElementById('downloadNotification');
    if (notification) notification.classList.remove('show');
}
