/*
 perfil.js
 Propósito: Resumen financiero de la página de perfil.
 - `updateProfileTotals()` muestra ingresos, gastos y balance del periodo elegido (mes, semana o día).
 - `updateGoalsProgress()` muestra una barra con el progreso real de cada meta de ahorro.
 - `updateBudgetsProgress()` muestra lo gastado en el periodo actual de cada presupuesto.
*/

// Porcentaje del presupuesto a partir del cual se considera en riesgo de excederse
const BUDGET_RISK_PERCENT = 80;

const profileState = {
    selectedPeriod: 'month'
};

document.addEventListener('DOMContentLoaded', async () => {
    initializePeriodSelector();
    await Promise.all([
        loadRemoteMovements(),
        loadRemoteGoals().catch(() => getGoals()),
        loadRemoteBudgets().catch(() => getBudgets())
    ]);
    refreshProfile();
    window.addEventListener('storage', refreshProfile);
    window.addEventListener('focus', refreshProfile);
});

function refreshProfile() {
    updateProfileTotals();
    updateGoalsProgress();
    updateBudgetsProgress();
}

function initializePeriodSelector() {
    const selector = document.getElementById('periodSelector');
    if (!selector) return;

    const buttons = selector.querySelectorAll('.period-option');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            profileState.selectedPeriod = button.dataset.period || 'month';
            updateProfileTotals();
        });
    });
}

function updateProfileTotals() {
    const incomeEl = document.getElementById('totalIncomeValue');
    const expenseEl = document.getElementById('totalExpenseValue');
    const balanceEl = document.getElementById('balanceAmountValue');

    if (!incomeEl || !expenseEl || !balanceEl) return;

    const totals = getMovementTotals(profileState.selectedPeriod);
    const balance = totals.income - totals.expense;
    const movedTotal = totals.income + totals.expense;

    incomeEl.textContent = `$ ${formatMoney(totals.income)}`;
    expenseEl.textContent = `$ ${formatMoney(totals.expense)}`;
    balanceEl.textContent = `$ ${formatMoney(balance)}`;

    // Las barras muestran la participación de ingresos y gastos y el porcentaje del ingreso que queda disponible
    setProgressWidth('incomeProgressFill', movedTotal ? (totals.income / movedTotal) * 100 : 0);
    setProgressWidth('expenseProgressFill', movedTotal ? (totals.expense / movedTotal) * 100 : 0);
    setProgressWidth(
        'balanceProgressFill',
        totals.income ? (Math.max(0, balance) / totals.income) * 100 : 0
    );
}

function updateGoalsProgress() {
    const goals = getGoals().filter(goal => toPositiveAmount(goal.montoObjetivo) > 0);
    const placeholder = document.getElementById('goalsPlaceholder');
    if (placeholder) placeholder.hidden = goals.length > 0;

    // Una barra de progreso por cada meta registrada
    renderProgressList(
        'goalsProgressList',
        'noGoalsMessage',
        goals.map(goal => {
            const target = toPositiveAmount(goal.montoObjetivo);
            return {
                title: goal.nombre || 'Meta sin nombre',
                percent: Math.min(100, (toPositiveAmount(goal.montoAhorrado) / target) * 100),
                detail: `$ ${formatMoney(goal.montoAhorrado)} de $ ${formatMoney(target)}`
            };
        })
    );
}

function updateBudgetsProgress() {
    const budgets = getBudgets().filter(budget => toPositiveAmount(budget.monto) > 0);

    renderProgressList(
        'budgetsProgressList',
        'noBudgetsMessage',
        budgets.map(budget => {
            const amount = toPositiveAmount(budget.monto);
            const spent = getBudgetSpent(budget);
            const percent = (spent / amount) * 100;
            const status = getBudgetStatus(percent);
            const statusText = { risk: ' · En riesgo', exceeded: ' · Excedido' }[status] || '';
            return {
                title: budget.nombre || 'Presupuesto sin nombre',
                percent,
                detail: `$ ${formatMoney(spent)} de $ ${formatMoney(amount)} · ${budget.periodo || 'Sin periodo'}${statusText}`,
                status
            };
        })
    );
}

function renderProgressList(listId, emptyMessageId, items) {
    const list = document.getElementById(listId);
    const emptyMessage = document.getElementById(emptyMessageId);
    if (!list) return;

    const hasItems = items.length > 0;
    list.hidden = !hasItems;
    if (emptyMessage) emptyMessage.hidden = hasItems;
    list.replaceChildren(...items.map(createProgressItem));
}

// Crea una fila con nombre, porcentaje, barra y detalle; se usa para metas y presupuestos
function createProgressItem({ title, percent, detail, status }) {
    const roundedPercent = Math.round(percent);

    const item = document.createElement('li');
    item.className = status ? `progress-item is-${status}` : 'progress-item';

    const header = document.createElement('div');
    header.className = 'progress-item-header';
    const name = document.createElement('span');
    name.className = 'progress-item-name';
    name.textContent = title;
    const percentEl = document.createElement('span');
    percentEl.className = 'progress-item-percent';
    percentEl.textContent = `${roundedPercent}%`;
    header.append(name, percentEl);

    const track = document.createElement('div');
    track.className = 'progress-item-track';
    track.setAttribute('aria-label', `${roundedPercent} por ciento`);
    const fill = document.createElement('span');
    fill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    track.appendChild(fill);

    const detailEl = document.createElement('p');
    detailEl.className = 'progress-item-detail';
    detailEl.textContent = detail;

    item.append(header, track, detailEl);
    return item;
}

function getBudgetStatus(percent) {
    if (percent > 100) return 'exceeded';
    if (percent >= BUDGET_RISK_PERCENT) return 'risk';
    return '';
}

// Los montos se guardan como número; se valida por si llegan vacíos o como texto
function toPositiveAmount(value) {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function setProgressWidth(id, percent) {
    const element = document.getElementById(id);
    if (element) element.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}
