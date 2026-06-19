/*
 movimientos.js
 Propósito: Lógica de la página de movimientos.
 - Controla el botón `+` (`newMovementBtn`) para mostrar la vista de selección entre Ingreso/Gasto.
 - Lee parámetros de la URL para mostrar notificaciones de éxito (`?success=income|expense`) o para abrir la vista de selección.
 - Provee `hideNotification()` local para ocultar toasts.
*/

document.addEventListener('DOMContentLoaded', () => {
    const newMovementBtn = document.getElementById('newMovementBtn');
    const selectionView = document.getElementById('selectionView');

    const selectionTitles = document.querySelectorAll('.selection-column h2');
    selectionTitles.forEach(title => {
        title.addEventListener('click', () => {
            selectionTitles.forEach(t => t.classList.remove('active'));
            title.classList.add('active');
        });
    });

    // Check for URL parameters on load
    const params = new URLSearchParams(window.location.search);

    // View selection if coming from a redirection that needs it
    if (params.get('view') === 'selection') {
        if (newMovementBtn && selectionView) {
            newMovementBtn.style.display = 'none';
            selectionView.style.display = 'flex';
        }
    }

    // Show selection view when clicking the + button
    if (newMovementBtn && selectionView) {
        newMovementBtn.addEventListener('click', () => {
            newMovementBtn.style.display = 'none';
            selectionView.style.display = 'flex';
        });
    }

    // Show success notification if present
    const successType = params.get('success');
    if (successType === 'income' || successType === 'expense') {
        const successNotif = document.getElementById('successNotification');
        if (successNotif) {
            const title = successNotif.querySelector('strong');
            if (successType === 'expense') {
                title.textContent = 'Gasto agregado';
            } else {
                title.textContent = 'Ingreso agregado';
            }

            successNotif.classList.add('show');
            // Auto-hide after 5 seconds
            setTimeout(() => {
                hideNotification();
            }, 5000);
        }
    }
});

function hideNotification() {
    const successNotif = document.getElementById('successNotification');
    if (successNotif) {
        successNotif.classList.remove('show');
    }
}
