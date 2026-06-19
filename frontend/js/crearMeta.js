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

document.addEventListener('DOMContentLoaded', () => {
    const montoObjetivo = document.getElementById('monto-objetivo');
    const montoAhorrado = document.getElementById('monto-ahorrado');
    formatMoneda(montoObjetivo);
    formatMoneda(montoAhorrado);

    const fechaInput = document.getElementById('fecha');
});

function validarFecha() {
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
        window.location.href = 'metas.html?success=goal';
    }
}

function hideError() {
    const el = document.getElementById('errorNotification');
    if (el) el.classList.remove('show');
}
