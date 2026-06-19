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

function hideNotification() {
    const el = document.getElementById('successNotification');
    if (el) el.classList.remove('show');
}
