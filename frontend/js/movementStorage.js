const MOVEMENT_STORAGE_KEY = 'gfpMovements';

function getMovements() {
    return JSON.parse(localStorage.getItem(MOVEMENT_STORAGE_KEY) || '[]');
}

function saveMovements(movements) {
    localStorage.setItem(MOVEMENT_STORAGE_KEY, JSON.stringify(movements));
}

function addMovement(movement) {
    const movements = getMovements();
    movements.unshift(movement);
    saveMovements(movements);
}

function getMovementById(id) {
    return getMovements().find(movement => movement.id === id) || null;
}

function updateMovement(id, movement) {
    const movements = getMovements();
    const index = movements.findIndex(item => item.id === id);
    if (index === -1) return false;
    movements[index] = { ...movements[index], ...movement, id };
    saveMovements(movements);
    return true;
}

function deleteMovement(id) {
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
