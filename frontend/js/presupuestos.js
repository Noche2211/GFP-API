/*
 presupuestos.js
 Propósito: Código específico de la página de presupuestos.
 - Muestra notificación en caso de `?success=budget`.
 - Añade comportamiento al botón `+` (`newBudgetBtn`) para redirigir a `crearPresupuesto.html`.
 - `hideNotification()` oculta el toast de éxito.
*/

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'budget') {
        const successNotif = document.getElementById('successNotification');
        if (successNotif) {
            successNotif.classList.add('show');
            setTimeout(() => {
                hideNotification();
            }, 5000);
        }
    }
    const newBudgetBtn = document.getElementById('newBudgetBtn');
    if (newBudgetBtn) {
        newBudgetBtn.addEventListener('click', () => {
            window.location.href = 'crearPresupuesto.html';
        });
    }
});

function hideNotification() {
    const successNotif = document.getElementById('successNotification');
    if (successNotif) successNotif.classList.remove('show');
}
