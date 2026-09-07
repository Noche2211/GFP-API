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
    if (typeof saveRemoteData === 'function' && currentUserId()) await saveRemoteData('budgets', budget);
    const budgets = getBudgets();
    budgets.unshift(budget);
    saveBudgets(budgets);
}

async function updateBudget(updatedBudget) {
    if (typeof saveRemoteData === 'function' && currentUserId()) await saveRemoteData('budgets', updatedBudget);
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

