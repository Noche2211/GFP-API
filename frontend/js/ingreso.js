/*
 ingreso.js
 Propósito: Lógica para la página de registrar ingresos.
 - Gestiona estilos de inputs y formatea el campo de monto mientras el usuario escribe.
 - `hideNotification()` oculta notificaciones de éxito (`successNotification`).
*/

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const editMovementId = params.get('id');

    // Placeholder logic similar to gasto
    const inputs = document.querySelectorAll('.form-input, .textarea-input');
    function updateInputColor(input) {
        if (!input.value) {
            input.classList.add('placeholder-active');
        } else {
            input.classList.remove('placeholder-active');
        }
    }
    function refreshInputStyles() {
        inputs.forEach(input => updateInputColor(input));
    }
    inputs.forEach(input => {
        updateInputColor(input);
        input.addEventListener('change', () => updateInputColor(input));
        input.addEventListener('input', () => updateInputColor(input));
    });

    const categoriaSelect = document.getElementById('categoriaSelect');
    const categoriaPersonalizadaInput = document.getElementById('categoriaPersonalizadaInput');
    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', function () {
            if (this.value === 'personalizada') {
                if (categoriaPersonalizadaInput) {
                    categoriaPersonalizadaInput.style.display = 'block';
                    updateInputColor(categoriaPersonalizadaInput);
                }
            } else {
                if (categoriaPersonalizadaInput) {
                    categoriaPersonalizadaInput.style.display = 'none';
                    categoriaPersonalizadaInput.value = '';
                }
            }
        });
    }

    const montoInput = document.getElementById('montoInput');
    if (montoInput) {
        montoInput.addEventListener('input', function (e) {
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

    if (editMovementId) {
        const movement = getMovementById(editMovementId);
        if (movement) {
            const saveButton = document.querySelector('.btn-guardar');
            if (saveButton) saveButton.textContent = 'Actualizar';
            if (montoInput) montoInput.value = formatMoney(movement.amount);
            const dateInput = document.getElementById('fechaInput');
            if (dateInput) dateInput.value = movement.date || '';
            const categorySelect = document.getElementById('categoriaSelect');
            const customCategoryInput = document.getElementById('categoriaPersonalizadaInput');
            if (categorySelect && customCategoryInput) {
                const hasCategoryOption = Array.from(categorySelect.options).some(option => option.value === movement.category);
                if (hasCategoryOption) {
                    categorySelect.value = movement.category;
                    customCategoryInput.style.display = 'none';
                    customCategoryInput.value = '';
                } else {
                    categorySelect.value = 'personalizada';
                    customCategoryInput.style.display = 'block';
                    customCategoryInput.value = movement.category || '';
                }
            }
            const descriptionInput = document.querySelector('.textarea-input');
            if (descriptionInput) descriptionInput.value = movement.description || '';
            refreshInputStyles();
        }
    }
});

function saveIncomeMovement() {
    const amountInput = document.getElementById('montoInput');
    const dateInput = document.getElementById('fechaInput');
    const categorySelect = document.getElementById('categoriaSelect');
    const customCategoryInput = document.getElementById('categoriaPersonalizadaInput');
    const descriptionInput = document.querySelector('.textarea-input');

    if (!amountInput || !dateInput || !categorySelect) return;

    const amountRaw = amountInput.value.replace(/\./g, '').replace(/,/g, '.');
    const amount = Number(amountRaw);
    const date = dateInput.value;
    const category = categorySelect.value === 'personalizada' ? (customCategoryInput?.value || 'Personalizada') : categorySelect.value;
    const description = descriptionInput?.value || '';

    if (!amount || !date || !category) {
        alert('Por favor completa los campos de monto, fecha y categoría.');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const movementId = params.get('id');

    const movementData = {
        type: 'income',
        amount: amountRaw,
        date,
        category,
        description
    };

    if (movementId) {
        updateMovement(movementId, movementData);
        window.location.href = 'movimientos.html?success=incomeUpdated';
        return;
    }

    addMovement({
        id: Date.now().toString(),
        ...movementData
    });

    window.location.href = 'movimientos.html?success=income';
}

function parseDateInput(value) {
    if (!value) return null;
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && parts.every(part => !Number.isNaN(part))) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) return null;
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
}

function validarFechaIngreso() {
    const fechaInput = document.getElementById('fechaInput');
    const errorNotif = document.getElementById('errorNotification');

    if (!fechaInput || !fechaInput.value) return;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const dateObj = fechaInput.valueAsDate ? new Date(fechaInput.valueAsDate.getFullYear(), fechaInput.valueAsDate.getMonth(), fechaInput.valueAsDate.getDate()) : parseDateInput(fechaInput.value);
    if (!dateObj) return;

    if (dateObj > hoy) {
        if (errorNotif) errorNotif.classList.add('show');
    } else {
        saveIncomeMovement();
    }
}

function hideNotification() {
    const el = document.getElementById('successNotification');
    if (el) el.classList.remove('show');
}
