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
    const list = document.getElementById('goalsList');
    const emptyMessage = document.getElementById('noGoalsMessage');
    if (!list || !emptyMessage) return;

    list.innerHTML = '';
    const goals = getGoals();
    emptyMessage.hidden = goals.length > 0;
    list.hidden = goals.length === 0;

    goals.forEach(goal => {
        const card = document.createElement('article');
        const progress = goal.montoObjetivo ? Math.min(100, Math.max(0, (goal.montoAhorrado / goal.montoObjetivo) * 100)) : 0;
        card.className = 'goal-card';
        card.innerHTML = `
            <div class="goal-card-header">
                <div class="goal-title-wrap">
                    <span class="goal-star" aria-hidden="true">☆</span>
                    <div>
                        <h3>${escapeGoalText(goal.nombre)}</h3>
                        <span class="goal-date">Límite: ${formatGoalDate(goal.fecha)}</span>
                    </div>
                </div>
                <div class="goal-actions">
                    <button type="button" class="goal-action edit" data-id="${encodeURIComponent(goal.id)}">Editar</button>
                    <button type="button" class="goal-action delete" data-id="${encodeURIComponent(goal.id)}">Eliminar</button>
                </div>
            </div>
            <div class="goal-card-body">
                <div class="goal-amount-block">
                    <span class="goal-label">Monto objetivo</span>
                    <p class="goal-amount">$ ${formatGoalMoney(goal.montoObjetivo)}</p>
                </div>
                <div class="goal-progress-block">
                    <div class="goal-progress-label"><span>Monto ahorrado</span><span>$ ${formatGoalMoney(goal.montoAhorrado)} - $ ${formatGoalMoney(goal.montoObjetivo)}</span></div>
                    <div class="goal-progress-track" aria-label="${progress.toFixed(0)} por ciento completado"><span style="width: ${progress}%"></span></div>
                </div>
                ${goal.descripcion ? `<p class="goal-description">${escapeGoalText(goal.descripcion)}</p>` : ''}
            </div>`;
        card.querySelector('.goal-action.edit').addEventListener('click', () => {
            window.location.href = `crearMeta.html?id=${encodeURIComponent(goal.id)}`;
        });
        card.querySelector('.goal-action.delete').addEventListener('click', async () => {
            if (!confirm('¿Deseas eliminar esta meta?')) return;
            try {
                await deleteGoal(goal.id);
                await loadRemoteGoals();
                renderGoals();
            } catch (error) {
                alert(`No se pudo eliminar la meta. ${error.message}`);
            }
        });
        list.appendChild(card);
    });
}

function escapeGoalText(value) {
    const element = document.createElement('span');
    element.textContent = value || '';
    return element.innerHTML;
}

function formatGoalDate(value) {
    if (!value) return '-';
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
}

function hideNotification() {
    const successNotif = document.getElementById('successNotification');
    if (successNotif) successNotif.classList.remove('show');
}
