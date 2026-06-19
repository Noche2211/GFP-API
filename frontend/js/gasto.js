/*
 gasto.js
 Propósito: Lógica para la página de registrar gastos.
 - Gestiona estilos de inputs, lógica de categoría personalizada y formateo del monto.
 - `validarFecha()` valida la fecha y redirige con `?success=expense` cuando corresponde.
 - `hideError()` oculta notificaciones de error.
*/

document.addEventListener('DOMContentLoaded', () => {
    // Placeholder logic
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

    // Custom Category Logic
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

    // Formateo de Monto
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

function validarFecha() {
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
        window.location.href = 'movimientos.html?success=expense';
    }
}

function hideError() {
    const el = document.getElementById('errorNotification');
    if (el) el.classList.remove('show');
}
