/*
 reportes.js
 Propósito: Controla el modal de exportación en la página de reportes.
 - `showExportModal`, `closeExportModal`, `exportData` están expuestas en `window` para ser llamadas desde el HTML.
 - Actualmente `exportData` simula la exportación con un `alert`; reemplazar por lógica real si hay backend.
 - Cierra el modal al hacer click fuera del mismo.
*/

document.addEventListener('DOMContentLoaded', () => {
    // Export modal functions
    const exportModal = document.getElementById('exportModal');

    window.showExportModal = function () {
        if (exportModal) exportModal.style.display = 'flex';
    }

    window.closeExportModal = function () {
        if (exportModal) exportModal.style.display = 'none';
    }

    window.exportData = function () {
        alert('Exportando datos...');
        closeExportModal();
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === exportModal) closeExportModal();
    });
});
