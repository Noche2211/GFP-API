const profileState = {
    selectedPeriod: 'month'
};

document.addEventListener('DOMContentLoaded', async () => {
    initializePeriodSelector();
    await loadRemoteMovements();
    updateProfileTotals();
    window.addEventListener('storage', updateProfileTotals);
    window.addEventListener('focus', updateProfileTotals);
});

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
    const incomeFormatted = formatMoney(totals.income);
    const expenseFormatted = formatMoney(totals.expense);
    const balance = totals.income - totals.expense;
    const balanceFormatted = formatMoney(balance);

    incomeEl.textContent = `$ ${incomeFormatted}`;
    expenseEl.textContent = `$ ${expenseFormatted}`;
    balanceEl.textContent = `$ ${balanceFormatted}`;
}
