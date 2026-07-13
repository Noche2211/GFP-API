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

function formatMoney(value) {
    if (value === null || value === undefined || value === '') return '0,00';
    const normalized = String(value).replace(/\./g, '').replace(/,/g, '.');
    const amount = Number(normalized);
    if (Number.isNaN(amount)) return '0,00';
    const parts = amount.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
}

function formatMovementDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-CO');
}

function formatMovementCategory(value) {
    return value || 'Sin categoría';
}
