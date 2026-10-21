/*
 reportes.js
 Propósito: Controla el modal de exportación en la página de reportes.
 - `showExportModal`, `closeExportModal`, `exportData` están expuestas en `window` para ser llamadas desde el HTML.
 - Actualmente `exportData` simula la exportación con un `alert`; reemplazar por lógica real si hay backend.
 - Cierra el modal al hacer click fuera del mismo.
*/

let reportDirectoryHandle = null;

document.addEventListener('DOMContentLoaded', async () => {
    clearStaticReports();
    try {
        await Promise.all([loadRemoteMovements(), loadRemoteBudgets(), loadRemoteGoals()]);
        renderReports();
    } catch (error) {
        renderReportError(error.message);
    }

    // Export modal functions
    const exportModal = document.getElementById('exportModal');

    window.showExportModal = function () {
        if (exportModal) exportModal.style.display = 'flex';
    }

    window.closeExportModal = function () {
        if (exportModal) exportModal.style.display = 'none';
    }

    window.chooseReportFolder = async function () {
        if (!window.showDirectoryPicker) {
            alert('Tu navegador no permite elegir carpetas. Se usará la carpeta de descargas.');
            return;
        }
        try {
            reportDirectoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            const savePath = document.getElementById('savePath');
            if (savePath) savePath.value = reportDirectoryHandle.name;
        } catch (error) {
            if (error.name !== 'AbortError') alert('No se pudo seleccionar la carpeta.');
        }
    }

    window.exportData = async function () {
        const format = document.getElementById('exportFormat')?.value || 'csv';
        const selectedTypes = [...document.querySelectorAll('input[name="reportType"]:checked')].map(input => input.value);
        const from = document.getElementById('reportDateFrom')?.value || '';
        const to = document.getElementById('reportDateTo')?.value || '';
        if (!selectedTypes.length) {
            alert('Selecciona al menos un tipo de reporte.');
            return;
        }
        if (from && to && from > to) {
            alert('La fecha inicial no puede ser posterior a la fecha final.');
            return;
        }
        const sections = buildReportExportSections(selectedTypes, from, to);

        function buildReportExportSections(selectedTypes, from, to) {
            const sections = {};
            if (selectedTypes.includes('movements')) {
                sections.movements = getMovements().filter(item => (!from || item.date >= from) && (!to || item.date <= to));
            }
            if (selectedTypes.includes('budgets')) sections.budgets = getBudgets();
            if (selectedTypes.includes('goals')) {
                sections.goals = getGoals().filter(item => (!from || item.fecha >= from) && (!to || item.fecha <= to));
            }
            return sections;
        }
        const fileName = `Reporte_${new Date().toISOString().slice(0, 10)}`;
        if (format === 'pdf') await downloadReportPdf(sections, fileName);
        else await downloadReportCsv(sections, fileName);
        closeExportModal();
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === exportModal) closeExportModal();
    });
});

async function downloadReportCsv(sections, fileName) {
    const lines = [];
    Object.entries(sections).forEach(([name, rows]) => {
        lines.push(name.toUpperCase());
        if (!rows.length) {
            lines.push('Sin registros', '');
            return;
        }
        const columns = Object.keys(rows[0]);
        lines.push(columns.join(','));
        rows.forEach(row => lines.push(columns.map(column => csvReportValue(row[column])).join(',')));
        lines.push('');
    });
    await downloadReportFile(lines.join('\n'), `${fileName}.csv`, 'text/csv;charset=utf-8');
}

async function downloadReportFile(content, fileName, mime) {
    const blob = new Blob([content], { type: mime });
    if (reportDirectoryHandle) {
        const fileHandle = await reportDirectoryHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        alert(`Archivo guardado en ${reportDirectoryHandle.name}.`);
        return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

function csvReportValue(value) {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function sectionTitle(value) {
    return { movements: 'Movimientos', budgets: 'Presupuestos', goals: 'Metas' }[value] || value;
}

function formatColumnName(value) {
    return value.replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase());
}

async function downloadReportPdf(sections, fileName) {
    if (!window.jspdf?.jsPDF || typeof window.jspdf.jsPDF.API.autoTable !== 'function') {
        alert('No se pudo cargar el generador PDF. Revisa tu conexión e inténtalo de nuevo.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const document = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const purple = [79, 55, 138];
    document.setFillColor(...purple);
    document.rect(0, 0, 842, 76, 'F');
    document.setTextColor(255, 255, 255);
    document.setFontSize(22);
    document.setFont(undefined, 'bold');
    document.text('Reporte financiero', 42, 38);
    document.setFontSize(10);
    document.setFont(undefined, 'normal');
    document.text('Gestor de Finanzas Personales', 42, 56);

    let y = 108;
    Object.entries(sections).forEach(([name, rows]) => {
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
            headStyles: { fillColor: purple, textColor: 255 },
            alternateRowStyles: { fillColor: [240, 232, 255] },
            styles: { fontSize: 8, cellPadding: 6, textColor: [45, 38, 64] }
        });
        y = document.lastAutoTable.finalY + 30;
    });
    const blob = document.output('blob');
    if (reportDirectoryHandle) {
        const fileHandle = await reportDirectoryHandle.getFileHandle(`${fileName}.pdf`, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        alert(`Archivo guardado en ${reportDirectoryHandle.name}.`);
    } else {
        document.save(`${fileName}.pdf`);
    }
}

function renderReports() {
    const movements = getMovements();
    const budgets = getBudgets();
    const goals = getGoals();
    const movementsColumn = document.getElementById('movementsReportColumn');
    const budgetsColumn = document.getElementById('budgetsReportColumn');
    const goalsColumn = document.getElementById('goalsReportColumn');

    if (movementsColumn) {
        const incomes = movements.filter(item => item.type === 'income');
        const expenses = movements.filter(item => item.type === 'expense');
        movementsColumn.innerHTML = `<h2 class="column-title">Movimientos</h2>${renderMovementSection('Ingresos', incomes, 'income')}${renderMovementSection('Gastos', expenses, 'expense')}`;
    }

    if (budgetsColumn) {
        budgetsColumn.innerHTML = `<h2 class="column-title">Presupuestos</h2>${budgets.length ? budgets.map(renderBudget).join('') : emptyReport('No hay presupuestos registrados.')}`;
    }

    if (goalsColumn) {
        goalsColumn.innerHTML = `<h2 class="column-title">Metas</h2>${goals.length ? goals.map(renderGoal).join('') : emptyReport('No hay metas registradas.')}`;
    }
}

function clearStaticReports() {
    const sections = [
        ['movementsReportColumn', 'Movimientos'],
        ['budgetsReportColumn', 'Presupuestos'],
        ['goalsReportColumn', 'Metas']
    ];
    sections.forEach(([id, title]) => {
        const column = document.getElementById(id);
        if (column) column.innerHTML = `<h2 class="column-title">${title}</h2>`;
    });
}

function renderMovementSection(title, movements, type) {
    return `<h3 class="section-title">${title}</h3>${movements.length ? movements.map(movement => `<div class="report-item"><span class="report-movement-icon ${type}">${type === 'expense' ? '-' : '+'}</span><div class="details"><div class="amount">$ ${formatMoney(movement.amount)}</div><div class="description">${escapeReportText(movement.category)}${movement.description ? `<br>${escapeReportText(movement.description)}` : ''}</div></div><div class="date">${formatReportDate(movement.date)}</div></div>`).join('') : emptyReport(`No hay ${title.toLowerCase()} registrados.`)}`;
}

function renderBudget(budget) {
    const spent = getBudgetSpent(budget);
    return `<div class="budget-item"><span class="report-symbol">$</span><div class="info"><div class="title">$ ${formatMoney(budget.monto)} | ${escapeReportText(budget.nombre)}</div><div class="subtitle">${escapeReportText(budget.descripcion || 'Sin descripción')}</div><div class="frequency">${escapeReportText(budget.categoria || 'General')}</div><span class="category">${escapeReportText(budget.periodo || 'Sin periodo')}</span><div class="budget-spent">Gastado: $ ${formatMoney(spent)} de $ ${formatMoney(budget.monto)}</div></div></div>`;
}

function renderGoal(goal) {
    const progress = goal.montoObjetivo ? Math.min(100, Math.max(0, (Number(goal.montoAhorrado) / Number(goal.montoObjetivo)) * 100)) : 0;
    return `<div class="goal-item"><span class="report-symbol">☆</span><div class="info"><div class="title">${escapeReportText(goal.nombre)}</div><div class="frequency">Límite: ${formatReportDate(goal.fecha)}</div><div class="progress-info">Monto ahorrado: $ ${formatMoney(goal.montoAhorrado)} - $ ${formatMoney(goal.montoObjetivo)}</div><div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div></div></div>`;
}

function emptyReport(message) {
    return `<p class="empty-report">${message}</p>`;
}

function parseReportAmount(value) {
    return Number(value) || 0;
}

function formatReportDate(value) {
    if (!value) return '-';
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
}

function escapeReportText(value) {
    const element = document.createElement('span');
    element.textContent = value || '';
    return element.innerHTML;
}

function renderReportError(message) {
    ['movementsReportColumn', 'budgetsReportColumn', 'goalsReportColumn'].forEach(id => {
        const column = document.getElementById(id);
        if (column) column.insertAdjacentHTML('beforeend', `<p class="empty-report">No se pudieron cargar los reportes: ${escapeReportText(message)}</p>`);
    });
}
