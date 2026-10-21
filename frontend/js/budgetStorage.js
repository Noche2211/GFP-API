/*
    frontend/js/budgetStorage.js
    Propósito: Lógica de la aplicación y comportamiento del usuario para esta página.
*/
const BUDGET_STORAGE_KEY = 'gfpBudgets';

function getBudgetStorageKey() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return user?.id ? `${BUDGET_STORAGE_KEY}_${user.id}` : BUDGET_STORAGE_KEY;
    } catch {
        return BUDGET_STORAGE_KEY;
    }
}

function getBudgets() {
    return JSON.parse(localStorage.getItem(getBudgetStorageKey()) || '[]');
}

function saveBudgets(budgets) {
    localStorage.setItem(getBudgetStorageKey(), JSON.stringify(budgets));
}

async function loadRemoteBudgets() {
    if (typeof loadRemoteData !== 'function' || !currentUserId()) return getBudgets();
    const budgets = await loadRemoteData('budgets');
    saveBudgets(budgets);
    return budgets;
}

async function addBudget(budget) {
    if (typeof saveRemoteData === 'function') await saveRemoteData('budgets', budget);
    const budgets = getBudgets();
    budgets.unshift(budget);
    saveBudgets(budgets);
}

async function updateBudget(updatedBudget) {
    if (typeof saveRemoteData === 'function') await saveRemoteData('budgets', updatedBudget);
    const budgets = getBudgets().map(budget => budget.id === updatedBudget.id ? updatedBudget : budget);
    saveBudgets(budgets);
}

async function deleteBudget(id) {
    if (typeof deleteRemoteData === 'function' && currentUserId()) await deleteRemoteData('budgets', id);
    const budgets = getBudgets().filter(budget => budget.id !== id);
    saveBudgets(budgets);
}

function getBudgetById(id) {
    return getBudgets().find(budget => budget.id === id);
}

// Suma los gastos de la categoría del presupuesto dentro de su periodo vigente.
// Requiere movementStorage.js (getMovements, normalizeCategory y parseDateString).
function getBudgetSpent(budget) {
    const category = normalizeCategory(budget.categoria);
    const range = getBudgetPeriodRange(budget);

    return getMovements()
        .filter(movement => movement.type === 'expense')
        .filter(movement => normalizeCategory(movement.category) === category)
        .filter(movement => {
            if (!range) return true;
            const date = parseDateString(movement.date);
            return Boolean(date) && date >= range.start && date <= range.end;
        })
        .reduce((total, movement) => total + (Number(movement.amount) || 0), 0);
}

// Inicio y fin del periodo actual del presupuesto; null si no tiene fechas definidas
function getBudgetPeriodRange(budget) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    if (budget.periodo === 'Semanal') {
        // La semana va de domingo a sábado, igual que los totales del perfil
        const startDay = day - today.getDay();
        return { start: new Date(year, month, startDay), end: new Date(year, month, startDay + 6) };
    }

    if (budget.periodo === 'Quincenal') {
        return day <= 15
            ? { start: new Date(year, month, 1), end: new Date(year, month, 15) }
            : { start: new Date(year, month, 16), end: new Date(year, month + 1, 0) };
    }

    if (budget.periodo === 'Mensual') {
        return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0) };
    }

    if (budget.periodo === 'Anual') {
        return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
    }

    if (budget.periodo === 'Personalizado') {
        const start = parseDateString(budget.fechaInicio);
        const end = parseDateString(budget.fechaFin);
        return start && end ? { start, end } : null;
    }

    return null;
}

