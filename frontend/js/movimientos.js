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
    const movementsHistory = document.getElementById('movementsHistory');

    const selectionTitles = document.querySelectorAll('.selection-column h2');
    selectionTitles.forEach(title => {
        title.addEventListener('click', () => {
            selectionTitles.forEach(t => t.classList.remove('active'));
            title.classList.add('active');
        });
    });

    function updateHistoryVisibility() {
        if (!movementsHistory) return;
        if (selectionView && selectionView.style.display === 'flex') {
            movementsHistory.style.display = 'none';
        } else {
            movementsHistory.style.display = 'block';
        }
    }

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
            updateHistoryVisibility();
        });
    }

    updateHistoryVisibility();

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
            setTimeout(() => {
                hideNotification();
            }, 5000);
        }
    }

    renderMovements();
    updateHistoryVisibility();
});

function closeSelectionView() {
    const selectionView = document.getElementById('selectionView');
    const newMovementBtn = document.getElementById('newMovementBtn');

    if (selectionView) {
        selectionView.style.display = 'none';
    }
    if (newMovementBtn) {
        newMovementBtn.style.display = 'inline';
    }
    updateHistoryVisibility();
}

function updateHistoryVisibility() {
    const selectionView = document.getElementById('selectionView');
    const movementsHistory = document.getElementById('movementsHistory');
    if (!movementsHistory) return;
    if (selectionView && selectionView.style.display === 'flex') {
        movementsHistory.style.display = 'none';
    } else {
        movementsHistory.style.display = 'block';
    }
}


function renderMovements() {
    const movements = getMovements();
    const list = document.getElementById('movementsList');
    const noMessage = document.getElementById('noMovementsMessage');

    if (!list || !noMessage) return;

    list.innerHTML = '';

    if (!movements.length) {
        noMessage.style.display = 'block';
        return;
    }

    noMessage.style.display = 'none';

    movements.forEach(movement => {
        const item = document.createElement('div');
        item.className = `movement-item ${movement.type === 'expense' ? 'movement-expense' : 'movement-income'}`;
        item.innerHTML = `
            <div class="movement-icon">
                <img src="../img/${movement.type === 'expense' ? 'iconmenoshis.svg' : 'iconplushis.svg'}" alt="${movement.type === 'expense' ? 'Gasto' : 'Ingreso'}" />
            </div>
            <div class="movement-details">
                <div class="movement-meta">
                    <span class="movement-amount">$ ${formatMoney(movement.amount)}</span>
                    <span class="movement-category">${formatMovementCategory(movement.category)}</span>
                </div>
                <div class="movement-date">${formatMovementDate(movement.date)}</div>
                ${movement.description ? `<div class="movement-description">${movement.description}</div>` : ''}
            </div>
        `;
        list.appendChild(item);
    });
}

function hideNotification() {
    const successNotif = document.getElementById('successNotification');
    if (successNotif) {
        successNotif.classList.remove('show');
    }
}
