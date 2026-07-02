/*
    frontend/js/budgetStorage.js
    Propósito: Lógica de la aplicación y comportamiento del usuario para esta página.
*/
const BUDGET_STORAGE_KEY = 'gfpBudgets';

function getBudgets() {
    return JSON.parse(localStorage.getItem(BUDGET_STORAGE_KEY) || '[]');
}

function saveBudgets(budgets) {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
}

function addBudget(budget) {
    const budgets = getBudgets();
    budgets.unshift(budget);
    saveBudgets(budgets);
}

function updateBudget(updatedBudget) {
    const budgets = getBudgets().map(budget => budget.id === updatedBudget.id ? updatedBudget : budget);
    saveBudgets(budgets);
}

function deleteBudget(id) {
    const budgets = getBudgets().filter(budget => budget.id !== id);
    saveBudgets(budgets);
}

function getBudgetById(id) {
    return getBudgets().find(budget => budget.id === id);
}

