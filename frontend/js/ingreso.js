/*
 ingreso.js
 Propósito: Lógica para la página de registrar ingresos.
 - Gestiona estilos de inputs y formatea el campo de monto mientras el usuario escribe.
 - `hideNotification()` oculta notificaciones de éxito (`successNotification`).
*/

document.addEventListener('DOMContentLoaded', () => {
    // Placeholder logic similar to gasto
    const inputs = document.querySelectorAll('.form-input, .textarea-input');
    function updateInputColor(input) {
        if (!input.value) {
            input.classList.add('placeholder-active');
        } else {
            input.classList.remove('placeholder-active');
        }
    }
    inputs.forEach(input => {
        updateInputColor(input);
        input.addEventListener('change', () => updateInputColor(input));
        input.addEventListener('input', () => updateInputColor(input));
    });

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

    addMovement({
        id: Date.now().toString(),
        type: 'income',
        amount: amountRaw,
        date,
        category,
        description
    });

    window.location.href = 'movimientos.html?success=income';
}

function validarFechaIngreso() {
    const fechaInput = document.getElementById('fechaInput');
    const errorNotif = document.getElementById('errorNotification');

    if (!fechaInput || !fechaInput.value) return;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [year, month, day] = fechaInput.value.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    dateObj.setHours(0, 0, 0, 0);

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
