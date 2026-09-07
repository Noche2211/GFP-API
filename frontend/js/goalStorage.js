const GOAL_STORAGE_KEY = 'gfpGoals';

function getStorageUserKey() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return user?.id ? `${GOAL_STORAGE_KEY}_${user.id}` : GOAL_STORAGE_KEY;
    } catch {
        return GOAL_STORAGE_KEY;
    }
}

function getGoals() {
    return JSON.parse(localStorage.getItem(getStorageUserKey()) || '[]');
}

function saveGoals(goals) {
    localStorage.setItem(getStorageUserKey(), JSON.stringify(goals));
}

async function loadRemoteGoals() {
    if (typeof loadRemoteData !== 'function' || !currentUserId()) return getGoals();
    const goals = await loadRemoteData('goals');
    saveGoals(goals);
    return goals;
}

async function addGoal(goal) {
    if (typeof saveRemoteData === 'function' && currentUserId()) await saveRemoteData('goals', goal);
    const goals = getGoals();
    goals.unshift(goal);
    saveGoals(goals);
}

async function updateGoal(updatedGoal) {
    if (typeof saveRemoteData === 'function' && currentUserId()) await saveRemoteData('goals', updatedGoal);
    const goals = getGoals().map(goal => goal.id === updatedGoal.id ? updatedGoal : goal);
    saveGoals(goals);
}

async function deleteGoal(id) {
    if (typeof deleteRemoteData === 'function' && currentUserId()) await deleteRemoteData('goals', id);
    saveGoals(getGoals().filter(goal => goal.id !== id));
}

function getGoalById(id) {
    return getGoals().find(goal => goal.id === id) || null;
}

function parseGoalAmount(value) {
    if (!value) return 0;
    return Number(String(value).replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
}

function formatGoalMoney(value) {
    return Number(value || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
