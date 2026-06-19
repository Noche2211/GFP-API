/*
 crearPresupuesto.js
 Propósito: Gestión de la interfaz para crear presupuestos.
 - Formatea el campo de monto en vivo.
 - Muestra campos personalizados para periodo y categoría según selección.
 - `validarPeriodo()` valida el periodo seleccionado y redirige con `?success=budget`.
*/

document.addEventListener('DOMContentLoaded', () => {
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

    const periodoSelect = document.getElementById('periodo');
    const periodoPersonalizadoContainer = document.getElementById('periodoPersonalizadoContainer');
    if (periodoSelect) {
        periodoSelect.addEventListener('change', function () {
            if (this.value === 'Personalizado') {
                if (periodoPersonalizadoContainer) periodoPersonalizadoContainer.style.display = 'flex';
            } else {
                if (periodoPersonalizadoContainer) periodoPersonalizadoContainer.style.display = 'none';
                const fi = document.getElementById('fechaInicio');
                const ff = document.getElementById('fechaFin');
                if (fi) fi.value = '';
                if (ff) ff.value = '';
            }
        });
    }

    const categoriaSelect = document.getElementById('categoria');
    const categoriaPersonalizadaInput = document.getElementById('categoriaPersonalizadaInput');
    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', function () {
            if (this.value === 'Personalizada') {
                if (categoriaPersonalizadaInput) categoriaPersonalizadaInput.style.display = 'block';
            } else {
                if (categoriaPersonalizadaInput) {
                    categoriaPersonalizadaInput.style.display = 'none';
                    categoriaPersonalizadaInput.value = '';
                }
            }
        });
    }
});

function validarPeriodo() {
    const periodoSelect = document.getElementById('periodo');
    const errorNotif = document.getElementById('errorNotification');

    if (!periodoSelect || !periodoSelect.value) {
        if (errorNotif) errorNotif.classList.add('show');
    } else {
        window.location.href = 'presupuestos.html?success=budget';
    }
}

function hideError() {
    const el = document.getElementById('errorNotification');
    if (el) el.classList.remove('show');
}
