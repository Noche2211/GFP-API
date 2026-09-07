/*
 crearMeta.js
 Propósito: Controla la lógica de la página de crear metas.
 - `formatMoneda(input)`: añade formateo en vivo para campos de monto (separador de miles y dos decimales).
 - `validarFecha()`: valida que la fecha objetivo no sea anterior a hoy y muestra `errorNotification` si es inválida.
 - `hideError()`: oculta el mensaje de error.
*/

// Formateo de Montos (Puntos y Comas)
function formatMoneda(input) {
    if (input) {
        input.addEventListener('input', function (e) {
            let valor = this.value.replace(/[^0-9,]/g, '');
            const partes = valor.split(',');
            if (partes.length > 2) {
                partes.pop();
                valor = partes.join(',');
            }
            if (valor.startsWith(',')) valor = '0' + valor;
            let [entero, decimal] = valor.split(',');
            if (entero) {
                entero = entero.replace(/^0+(?=\d)/, '');
                entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            }
            if (decimal !== undefined) {
                decimal = decimal.substring(0, 2);
                this.value = entero + ',' + decimal;
            } else {
                this.value = entero || '';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const montoObjetivo = document.getElementById('monto-objetivo');
    const montoAhorrado = document.getElementById('monto-ahorrado');
    formatMoneda(montoObjetivo);
    formatMoneda(montoAhorrado);

    const fechaInput = document.getElementById('fecha');
    await loadRemoteGoals();
    initializeGoalEditMode();
});

function initializeGoalEditMode() {
    const goalId = new URLSearchParams(window.location.search).get('id');
    if (!goalId) return;

    const goal = getGoalById(goalId);
    if (!goal) return;

    const saveButton = document.querySelector('.btn-guardar');
    if (saveButton) saveButton.textContent = 'Actualizar';
    document.getElementById('nombre').value = goal.nombre || '';
    document.getElementById('monto-objetivo').value = formatGoalInput(goal.montoObjetivo);
    document.getElementById('monto-ahorrado').value = formatGoalInput(goal.montoAhorrado);
    document.getElementById('fecha').value = goal.fecha || '';
    document.getElementById('descripcion').value = goal.descripcion || '';

    const notification = document.querySelector('.toggles-container input[type="checkbox"]');
    if (notification) notification.checked = !!goal.notifReached;
}

function formatGoalInput(value) {
    return Number(value || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function validarFecha() {
    const fechaInput = document.getElementById('fecha');
    const errorNotif = document.getElementById('errorNotification');

    if (!fechaInput || !fechaInput.value) return;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [year, month, day] = fechaInput.value.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    dateObj.setHours(0, 0, 0, 0);

    if (dateObj < hoy) {
        if (errorNotif) errorNotif.classList.add('show');
    } else {
        if (await saveGoal()) window.location.href = 'metas.html?success=goal';
    }
}

async function saveGoal() {
    const name = document.getElementById('nombre')?.value.trim();
    const targetAmount = parseGoalAmount(document.getElementById('monto-objetivo')?.value);
    const savedAmount = parseGoalAmount(document.getElementById('monto-ahorrado')?.value);
    const date = document.getElementById('fecha')?.value;
    const description = document.getElementById('descripcion')?.value.trim() || '';
    const notification = document.querySelector('.toggles-container input[type="checkbox"]')?.checked ?? false;

    if (!name || !targetAmount || !date) {
        alert('Por favor completa el nombre, el monto objetivo y la fecha.');
        return false;
    }

    const goalId = new URLSearchParams(window.location.search).get('id');
    const goal = {
        id: goalId || Date.now().toString(),
        nombre: name,
        montoObjetivo: targetAmount,
        montoAhorrado: savedAmount,
        fecha: date,
        descripcion: description,
        notifReached: notification,
        updatedAt: new Date().toISOString(),
        createdAt: goalId ? (getGoalById(goalId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    try {
        if (goalId && getGoalById(goalId)) await updateGoal(goal);
        else await addGoal(goal);
        return true;
    } catch (error) {
        const message = error.message === 'Failed to fetch'
            ? 'No se pudo conectar con Render. Verifica que el servicio esté activo.'
            : error.message;
        alert(`No se pudo guardar la meta. ${message}`);
        return false;
    }
}

function hideError() {
    const el = document.getElementById('errorNotification');
    if (el) el.classList.remove('show');
}
