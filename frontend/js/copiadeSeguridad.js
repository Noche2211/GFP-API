document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('backupForm')?.addEventListener('submit', handleBackupSubmit);
    try {
        await Promise.all([loadRemoteMovements(), loadRemoteBudgets(), loadRemoteGoals(), loadRemoteBackups()]);
        renderBackups();
    } catch (error) {
        showBackupError(error.message);
    }
});

function openBackupDialog() {
    document.getElementById('backupDialog')?.removeAttribute('hidden');
}

function closeBackupDialog() {
    document.getElementById('backupDialog')?.setAttribute('hidden', '');
}

async function handleBackupSubmit(event) {
    event.preventDefault();
    const selectedTypes = [...document.querySelectorAll('input[name="backupType"]:checked')].map(input => input.value);
    if (!selectedTypes.length) {
        showBackupError('Selecciona al menos un tipo de dato.');
        return;
    }

    const notification = document.getElementById('backupNotification');
    notification?.classList.add('show');
    try {
        const format = document.getElementById('backupFormat').value;
        const sections = buildBackupSections(selectedTypes);
        const payload = format === 'csv' ? buildCsv(sections) : JSON.stringify({ generatedAt: new Date().toISOString(), sections });
        const number = getBackups().length + 1;
        const backup = {
            id: `backup-${Date.now()}`,
            label: `Copia de seguridad ${String(number).padStart(2, '0')}`,
            createdAt: new Date().toISOString(),
            format,
            payload,
            summary: selectedTypes.map(type => `${type}: ${sections[type].length}`).join(' | ')
        };
        await saveBackup(backup);
        closeBackupDialog();
        renderBackups();
        showToast('Copia de seguridad guardada', `Tu archivo ${format.toUpperCase()} está listo para descargar.`);
    } catch (error) {
        showBackupError(error.message);
    } finally {
        closeNotification();
    }
}

function buildBackupSections(types) {
    const from = document.getElementById('backupDateFrom').value;
    const to = document.getElementById('backupDateTo').value;
    if (from && to && from > to) throw new Error('La fecha inicial no puede ser posterior a la fecha final.');
    const sections = {};
    if (types.includes('movements')) {
        sections.movements = getMovements().filter(item => (!from || item.date >= from) && (!to || item.date <= to));
    }
    if (types.includes('budgets')) sections.budgets = getBudgets();
    if (types.includes('goals')) sections.goals = getGoals();
    return sections;
}

function buildCsv(sections) {
    const lines = [];
    Object.entries(sections).forEach(([name, rows]) => {
        lines.push(name.toUpperCase());
        if (!rows.length) {
            lines.push('Sin registros', '');
            return;
        }
        const columns = Object.keys(rows[0]);
        lines.push(columns.join(','));
        rows.forEach(row => lines.push(columns.map(column => csvEscape(row[column])).join(',')));
        lines.push('');
    });
    return lines.join('\n');
}

function csvEscape(value) {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function renderBackups() {
    const list = document.getElementById('backupList');
    const empty = document.getElementById('noBackupsMessage');
    if (!list || !empty) return;
    const backups = getBackups();
    list.innerHTML = '';
    empty.hidden = backups.length > 0;
    backups.forEach(backup => {
        const item = document.createElement('article');
        item.className = 'backup-item';
        const format = (backup.format || 'csv').toUpperCase();
        item.innerHTML = `<div class="backup-info"><strong>${escapeBackupText(backup.label)}</strong><span>${formatBackupDate(backup.createdAt)}</span><small>${escapeBackupText(backup.summary || 'Respaldo guardado')} · ${format}</small></div><button class="download-btn" type="button" aria-label="Descargar ${escapeBackupText(backup.label)}">Descargar</button>`;
        item.querySelector('.download-btn').addEventListener('click', () => downloadBackup(backup.id));
        list.appendChild(item);
    });
}

function downloadBackup(id) {
    const backup = getBackups().find(item => item.id === id);
    if (!backup) return;
    const format = backup.format || 'csv';
    if (format === 'pdf') {
        downloadPdfBackup(backup);
        return;
    }
    const mime = format === 'json' ? 'application/json;charset=utf-8' : 'text/csv;charset=utf-8';
    const blob = new Blob([backup.payload], { type: mime });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${backup.label.replace(/\s+/g, '_')}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
    showToast('Descarga iniciada', `${backup.label} se está descargando.`);
}

function downloadPdfBackup(backup) {
    if (!window.jspdf?.jsPDF || typeof window.jspdf.jsPDF.API.autoTable !== 'function') {
        showBackupError('No se pudo cargar el generador PDF. Revisa tu conexión e inténtalo de nuevo.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const report = JSON.parse(backup.payload);
    const document = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const purple = [79, 55, 138];
    const lightPurple = [240, 232, 255];

    document.setFillColor(...purple);
    document.rect(0, 0, 842, 76, 'F');
    document.setTextColor(255, 255, 255);
    document.setFontSize(22);
    document.setFont(undefined, 'bold');
    document.text('Copia de seguridad', 42, 38);
    document.setFontSize(10);
    document.setFont(undefined, 'normal');
    document.text('Gestor de Finanzas Personales', 42, 56);
    document.text(formatBackupDate(backup.createdAt), 800, 42, { align: 'right' });

    let y = 108;
    Object.entries(report.sections).forEach(([name, rows]) => {
        const columns = rows.length ? Object.keys(rows[0]) : ['Información'];
        const body = rows.length ? rows.map(row => columns.map(column => row[column] ?? '')) : [['Sin registros']];
        document.setTextColor(...purple);
        document.setFontSize(15);
        document.setFont(undefined, 'bold');
        document.text(sectionTitle(name), 42, y);
        document.autoTable({
            startY: y + 10,
            margin: { left: 42, right: 42 },
            head: [columns.map(formatColumnName)],
            body,
            theme: 'grid',
            headStyles: { fillColor: purple, textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: lightPurple },
            styles: { fontSize: 8, cellPadding: 6, textColor: [45, 38, 64] },
            didDrawPage: data => {
                document.setFontSize(9);
                document.setTextColor(120, 112, 128);
                document.text(`Página ${data.pageNumber}`, 800, 570, { align: 'right' });
            }
        });
        y = document.lastAutoTable.finalY + 30;
    });

    document.save(`${backup.label.replace(/\s+/g, '_')}.pdf`);
    showToast('Descarga iniciada', `${backup.label} se está descargando.`);
}

function sectionTitle(value) {
    return { movements: 'Movimientos', budgets: 'Presupuestos', goals: 'Metas' }[value] || value;
}

function formatColumnName(value) {
    return value.replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase());
}

function formatBackupDate(value) {
    return new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

function escapeBackupText(value) {
    const element = document.createElement('span');
    element.textContent = value || '';
    return element.innerHTML;
}

function showToast(title, subtitle) {
    const notification = document.getElementById('downloadNotification');
    if (!notification) return;
    notification.querySelector('.notification-title').textContent = title;
    notification.querySelector('.notification-subtitle').textContent = subtitle;
    notification.classList.add('show');
    setTimeout(closeDownloadNotification, 5000);
}

function showBackupError(message) {
    showToast('No se pudo guardar la copia', message);
}

function closeNotification() {
    const notification = document.getElementById('backupNotification');
    if (notification) notification.classList.remove('show');
}

function closeDownloadNotification() {
    const notification = document.getElementById('downloadNotification');
    if (notification) notification.classList.remove('show');
}
