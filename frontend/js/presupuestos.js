/*
 presupuestos.js
 Propósito: Código específico de la página de presupuestos.
 - Muestra notificación en caso de `?success=budget`.
 - Añade comportamiento al botón `+` (`newBudgetBtn`) para redirigir a `crearPresupuesto.html`.
 - `hideNotification()` oculta el toast de éxito.
*/

let budgetToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('success') === 'budget') {
        const successNotif = document.getElementById('successNotification');
        if (successNotif) {
            successNotif.classList.add('show');
            setTimeout(() => {
                hideNotification();
            }, 5000);
        }
    }

    const newBudgetBtn = document.getElementById('newBudgetBtn');
    if (newBudgetBtn) {
        newBudgetBtn.addEventListener('click', () => {
            window.location.href = 'crearPresupuesto.html';
        });
    }

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (!budgetToDeleteId) return;
            deleteBudget(budgetToDeleteId);
            budgetToDeleteId = null;
            closeDeleteConfirm();
            renderBudgets();
        });
    }

    renderBudgets();
});

function renderBudgets() {
    const budgets = getBudgets();
    const budgetList = document.getElementById('budgetList');
    const noBudgetsMessage = document.getElementById('noBudgetsMessage');

    if (!budgetList || !noBudgetsMessage) return;

    budgetList.innerHTML = '';

    if (!budgets.length) {
        noBudgetsMessage.style.display = 'block';
        return;
    }

    noBudgetsMessage.style.display = 'none';

    budgets.forEach((budget) => {
        const card = document.createElement('div');
        card.className = 'budget-card';
        card.innerHTML = `
            <div class="budget-card-header">
                <div>
                    <h2>${budget.nombre || 'Sin nombre'}</h2>
                    <span class="budget-category">${budget.categoria || 'General'}</span>
                </div>
                <div class="budget-actions">
                    <button type="button" class="budget-action edit" data-id="${budget.id}">Editar</button>
                    <button type="button" class="budget-action delete" data-id="${budget.id}">Eliminar</button>
                </div>
            </div>
            <div class="budget-card-body">
                <p class="budget-amount">$ ${formatMoney(budget.monto)}</p>
                <p class="budget-period ${budget.periodo === 'Personalizado' ? 'budget-period-custom' : ''}">
                    Periodo: ${budget.periodo || 'No definido'}${budget.periodo === 'Personalizado' ? ` (${budget.fechaInicio || '-'} al ${budget.fechaFin || '-'})` : ''}
                </p>
                ${budget.descripcion ? `<p class="budget-description">${budget.descripcion}</p>` : ''}
                <div class="budget-notifications">
                    <span class="${budget.notifExceeded ? 'alert-active' : 'alert-inactive'}">${budget.notifExceeded ? 'Alerta de exceso' : 'Sin alerta de exceso'}</span>
                    <span class="${budget.notifRisk ? 'alert-active' : 'alert-inactive'}">${budget.notifRisk ? 'Alerta de riesgo' : 'Sin alerta de riesgo'}</span>
                </div>
            </div>
        `;

        const editButton = card.querySelector('.budget-action.edit');
        const deleteButton = card.querySelector('.budget-action.delete');

        if (editButton) {
            editButton.addEventListener('click', () => {
                window.location.href = `crearPresupuesto.html?id=${budget.id}`;
            });
        }

        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                openDeleteConfirm(budget.id);
            });
        }

        budgetList.appendChild(card);
    });
}

function openDeleteConfirm(id) {
    budgetToDeleteId = id;
    const dialog = document.getElementById('deleteConfirm');
    if (dialog) dialog.classList.add('open');
}

function closeDeleteConfirm() {
    const dialog = document.getElementById('deleteConfirm');
    if (dialog) dialog.classList.remove('open');
    budgetToDeleteId = null;
}

function hideNotification() {
    const successNotif = document.getElementById('successNotification');
    if (successNotif) successNotif.classList.remove('show');
}

function formatMoney(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '0,00';
    const amount = Number(value).toFixed(2);
    const parts = amount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
}
