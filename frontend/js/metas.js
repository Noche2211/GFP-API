/*
 metas.js
 Propósito: Maneja notificaciones en la página de metas.
 - Detecta `?success=goal` en la URL y muestra un toast de éxito (`successNotification`).
 - `hideNotification()` oculta el toast.
*/

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'goal') {
        const successNotif = document.getElementById('successNotification');
        if (successNotif) {
            successNotif.classList.add('show');
            setTimeout(() => {
                hideNotification();
            }, 5000);
        }
    }

    await loadRemoteGoals();
    renderGoals();
});

function renderGoals() {
    const content = document.querySelector('main.content');
    if (!content) return;

    getGoals().forEach(goal => {
        const card = document.createElement('section');
        const progress = goal.montoObjetivo ? Math.min(100, (goal.montoAhorrado / goal.montoObjetivo) * 100) : 0;
        card.className = 'goal-card';
        card.innerHTML = `<h2>${goal.nombre}</h2><p>$ ${formatGoalMoney(goal.montoAhorrado)} de $ ${formatGoalMoney(goal.montoObjetivo)}</p><p>Fecha: ${goal.fecha}</p><div class="goal-progress"><span style="width: ${progress}%"></span></div>${goal.descripcion ? `<p>${goal.descripcion}</p>` : ''}<button type="button" class="goal-action edit" data-id="${goal.id}">Editar</button>`;
        card.querySelector('.goal-action.edit').addEventListener('click', () => {
            window.location.href = `crearMeta.html?id=${encodeURIComponent(goal.id)}`;
        });
        content.appendChild(card);
    });
}

function hideNotification() {
    const successNotif = document.getElementById('successNotification');
    if (successNotif) successNotif.classList.remove('show');
}
