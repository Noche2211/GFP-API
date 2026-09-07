const MOVEMENT_STORAGE_KEY = 'gfpMovements';

function getMovementStorageKey() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return user?.id ? `${MOVEMENT_STORAGE_KEY}_${user.id}` : MOVEMENT_STORAGE_KEY;
    } catch {
        return MOVEMENT_STORAGE_KEY;
    }
}

function getMovements() {
    return JSON.parse(localStorage.getItem(getMovementStorageKey()) || '[]');
}

function saveMovements(movements) {
    localStorage.setItem(getMovementStorageKey(), JSON.stringify(movements));
}

async function loadRemoteMovements() {
    if (typeof loadRemoteData !== 'function' || !currentUserId()) return getMovements();
    const movements = await loadRemoteData('movements');
    saveMovements(movements);
    return movements;
}

async function addMovement(movement) {
    if (typeof saveRemoteData === 'function' && currentUserId()) await saveRemoteData('movements', movement);
    const movements = getMovements();
    movements.unshift(movement);
    saveMovements(movements);
}

function getMovementById(id) {
    return getMovements().find(movement => movement.id === id) || null;
}

async function updateMovement(id, movement) {
    if (typeof saveRemoteData === 'function' && currentUserId()) await saveRemoteData('movements', { ...movement, id });
    const movements = getMovements();
    const index = movements.findIndex(item => item.id === id);
    if (index === -1) return false;
    movements[index] = { ...movements[index], ...movement, id };
    saveMovements(movements);
    return true;
}

async function deleteMovement(id) {
    if (typeof deleteRemoteData === 'function' && currentUserId()) await deleteRemoteData('movements', id);
    const movements = getMovements();
    const filtered = movements.filter(item => item.id !== id);
    if (filtered.length === movements.length) return false;
    saveMovements(filtered);
    return true;
}

function getMovementTotals(period = 'month') {
    const movements = getMovements();
    const now = new Date();

    function normalizeDate(value) {
        const date = parseDateString(value);
        if (!date) return null;
        return date;
    }

    function isInPeriod(dateString) {
        const movementDate = normalizeDate(dateString);
        if (!movementDate) return false;

        const today = normalizeDate(now);
        if (!today) return false;

        if (period === 'day') {
            return movementDate.getTime() === today.getTime();
        }

        if (period === 'week') {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return movementDate >= startOfWeek && movementDate <= endOfWeek;
        }

        return (
            movementDate.getMonth() === today.getMonth() &&
            movementDate.getFullYear() === today.getFullYear()
        );
    }

    return movements.reduce(
        (totals, movement) => {
            if (!isInPeriod(movement.date)) return totals;
            const amount = Number(String(movement.amount).replace(/\./g, '').replace(/,/g, '.')) || 0;
            if (movement.type === 'expense') {
                totals.expense += amount;
            } else {
                totals.income += amount;
            }
            return totals;
        },
        { income: 0, expense: 0 }
    );
}

function formatMoney(value) {
    if (value === null || value === undefined || value === '') return '0,00';
    const normalized = String(value).replace(/\./g, '').replace(/,/g, '.');
    const amount = Number(normalized);
    if (Number.isNaN(amount)) return '0,00';
    const parts = amount.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
}

function parseDateString(value) {
    if (!value) return null;
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null;
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    if (typeof value === 'string') {
        const parts = value.split('-').map(Number);
        if (parts.length === 3 && parts.every(part => !Number.isNaN(part))) {
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    return null;
}

function formatMovementDate(dateString) {
    const date = parseDateString(dateString);
    if (!date) return dateString || '';
    return date.toLocaleDateString('es-CO');
}

function formatMovementCategory(value) {
    if (!value) return 'Sin categoría';
    return value.charAt(0).toUpperCase() + value.slice(1);
}
