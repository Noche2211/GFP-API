/*
 crearPresupuesto.js
 Propósito: Gestión de la interfaz para crear y editar presupuestos.
 - Formatea el campo de monto en vivo.
 - Muestra campos personalizados para periodo y categoría según selección.
 - Carga datos cuando se edita un presupuesto y guarda en localStorage.
*/

const MAX_BUDGET_AMOUNT = 2222222222222;

document.addEventListener('DOMContentLoaded', () => {
    initializeAmountFormatter();
    initializePeriodoSelect();
    initializeCategoriaSelect();
    initializeEditMode();
});

// Limita el monto a un máximo predefinido y aplica formato de miles/decimales al escribir
function initializeAmountFormatter() {
    const montoInput = document.getElementById('montoInput');
    if (!montoInput) return;

    montoInput.addEventListener('input', function () {
        const previousValue = this.dataset.previousValue || '';
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
            entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
        if (decimal !== undefined) {
            decimal = decimal.substring(0, 2);
            valor = entero + ',' + decimal;
        } else {
            valor = entero || '';
        }

        const rawDigits = valor.replace(/[^0-9]/g, '');
        const numericValue = parseAmount(valor);
        if (numericValue > MAX_BUDGET_AMOUNT || rawDigits.length > 13) {
            this.value = previousValue;
            return;
        }

        this.dataset.previousValue = valor;
        this.value = valor;
    });
}

// Alterna la visibilidad de los campos de fecha según el periodo seleccionado
function initializePeriodoSelect() {
    const periodoSelect = document.getElementById('periodo');
    const periodoPersonalizadoContainer = document.getElementById('periodoPersonalizadoContainer');
    if (!periodoSelect || !periodoPersonalizadoContainer) return;

    periodoSelect.addEventListener('change', function () {
        if (this.value === 'Personalizado') {
            periodoPersonalizadoContainer.style.display = 'flex';
        } else {
            periodoPersonalizadoContainer.style.display = 'none';
            const fi = document.getElementById('fechaInicio');
            const ff = document.getElementById('fechaFin');
            if (fi) fi.value = '';
            if (ff) ff.value = '';
        }
    });
}

// Gestiona la visibilidad y sugerencias de categorías personalizadas
function initializeCategoriaSelect() {
    const categoriaSelect = document.getElementById('categoria');
    const categoriaPersonalizadaContainer = document.getElementById('categoriaPersonalizadaContainer');
    const categoriaPersonalizadaInput = document.getElementById('categoriaPersonalizadaInput');
    const categoriaPersonalizadaSuggestions = document.getElementById('categoriaPersonalizadaSuggestions');
    if (!categoriaSelect || !categoriaPersonalizadaContainer || !categoriaPersonalizadaInput || !categoriaPersonalizadaSuggestions) return;

    categoriaSelect.addEventListener('change', function () {
        if (this.value === 'Personalizada') {
            categoriaPersonalizadaContainer.style.display = 'block';
            renderCustomCategorySuggestions(categoriaPersonalizadaInput.value);
        } else {
            categoriaPersonalizadaContainer.style.display = 'none';
            categoriaPersonalizadaInput.value = '';
            categoriaPersonalizadaSuggestions.innerHTML = '';
            categoriaPersonalizadaSuggestions.style.display = 'none';
        }
    });

    categoriaPersonalizadaInput.addEventListener('input', function () {
        renderCustomCategorySuggestions(this.value);
    });

    categoriaPersonalizadaInput.addEventListener('focus', function () {
        renderCustomCategorySuggestions(this.value);
    });

    categoriaPersonalizadaInput.addEventListener('blur', function () {
        setTimeout(() => {
            categoriaPersonalizadaSuggestions.style.display = 'none';
        }, 150);
    });
}

// Carga los datos del presupuesto desde localStorage si se detecta un ID en la URL
function initializeEditMode() {
    const params = new URLSearchParams(window.location.search);
    const budgetId = params.get('id');
    if (!budgetId) return;

    const existingBudget = getBudgetById(budgetId);
    if (!existingBudget) return;

    document.getElementById('budgetId').value = existingBudget.id;
    document.getElementById('nombre').value = existingBudget.nombre || '';
    document.getElementById('montoInput').value = formatMoney(existingBudget.monto);
    document.getElementById('periodo').value = existingBudget.periodo || '';

    if (existingBudget.periodo === 'Personalizado') {
        const periodoPersonalizadoContainer = document.getElementById('periodoPersonalizadoContainer');
        if (periodoPersonalizadoContainer) periodoPersonalizadoContainer.style.display = 'flex';
        document.getElementById('fechaInicio').value = existingBudget.fechaInicio || '';
        document.getElementById('fechaFin').value = existingBudget.fechaFin || '';
    }

    document.getElementById('categoria').value = existingBudget.categoria === 'Servicios' || existingBudget.categoria === 'Alimentacion' || existingBudget.categoria === 'Transporte'
        ? existingBudget.categoria
        : 'Personalizada';

    if (existingBudget.categoria !== 'Servicios' && existingBudget.categoria !== 'Alimentacion' && existingBudget.categoria !== 'Transporte') {
        const categoriaPersonalizadaContainer = document.getElementById('categoriaPersonalizadaContainer');
        const categoriaPersonalizadaInput = document.getElementById('categoriaPersonalizadaInput');
        if (categoriaPersonalizadaContainer && categoriaPersonalizadaInput) {
            categoriaPersonalizadaContainer.style.display = 'block';
            categoriaPersonalizadaInput.value = existingBudget.categoria || '';
        }
    }

    document.getElementById('descripcion').value = existingBudget.descripcion || '';
    document.getElementById('notifExceeded').checked = !!existingBudget.notifExceeded;
    document.getElementById('notifRisk').checked = !!existingBudget.notifRisk;
}

// Valida campos del formulario, organiza la data y guarda el presupuesto (crear o actualizar)
function saveBudget() {
    const budgetData = collectBudgetFormData();
    if (!budgetData) return;

    if (!validateBudgetData(budgetData)) {
        showError('Por favor completa los campos obligatorios y verifica las fechas.');
        return;
    }

    if (getBudgetById(budgetData.id)) {
        updateBudget(budgetData);
    } else {
        addBudget(budgetData);
    }

    window.location.href = 'presupuestos.html?success=budget';
}

// Reúne y estructura los valores del formulario en un objeto presupuesto
function collectBudgetFormData() {
    const budgetId = document.getElementById('budgetId').value || generateId();
    const nombre = document.getElementById('nombre').value.trim();
    const monto = parseAmount(document.getElementById('montoInput').value);
    const periodo = document.getElementById('periodo').value;
    const categoria = document.getElementById('categoria').value;
    const categoriaPersonalizadaInput = document.getElementById('categoriaPersonalizadaInput').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    if (categoria === 'Personalizada' && categoriaPersonalizadaInput) {
        registerCustomCategory(categoriaPersonalizadaInput);
    }
    const notifExceeded = document.getElementById('notifExceeded').checked;
    const notifRisk = document.getElementById('notifRisk').checked;
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;

    return {
        id: budgetId,
        nombre,
        monto,
        periodo,
        fechaInicio: periodo === 'Personalizado' ? fechaInicio : '',
        fechaFin: periodo === 'Personalizado' ? fechaFin : '',
        categoria: categoria === 'Personalizada' ? (categoriaPersonalizadaInput || 'Personalizada') : categoria,
        descripcion,
        notifExceeded,
        notifRisk,
        updatedAt: new Date().toISOString(),
        createdAt: getBudgetById(budgetId)?.createdAt || new Date().toISOString(),
    };
}

// Verifica campos obligatorios y coherencia en las fechas
function validateBudgetData(data) {
    if (!data.nombre || !data.monto || !data.periodo || !data.categoria) {
        return false;
    }

    if (data.monto > MAX_BUDGET_AMOUNT) {
        return false;
    }

    if (data.periodo === 'Personalizado') {
        if (!data.fechaInicio || !data.fechaFin) return false;
        if (data.fechaInicio > data.fechaFin) return false;
    }

    return true;
}

function parseAmount(value) {
    if (!value) return 0;
    const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
    return parseFloat(normalized) || 0;
}

function formatMoney(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '';
    const amount = Number(value).toFixed(2);
    const parts = amount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
}

function formatAmountWithoutThousands(value) {
    const amount = Number(value).toFixed(2);
    return amount.replace('.', ',');
}

// Gestiona el autocompletado y registro de nuevas categorías personalizadas
function renderCustomCategorySuggestions(query) {
    const suggestionsContainer = document.getElementById('categoriaPersonalizadaSuggestions');
    const input = document.getElementById('categoriaPersonalizadaInput');
    if (!suggestionsContainer || !input) return;

    const matches = getMatchingCustomCategories(query);
    suggestionsContainer.innerHTML = '';

    if (!matches.length) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    suggestionsContainer.style.display = 'block';
    matches.forEach((name) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = name;
        button.addEventListener('click', () => {
            input.value = name;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
        });
        suggestionsContainer.appendChild(button);
    });
}

function getMatchingCustomCategories(query) {
    const normalized = (query || '').trim().toLowerCase();
    const customCategories = getCustomCategories();
    if (!normalized) {
        return customCategories.slice(0, 5);
    }

    return customCategories.filter((name) => name.toLowerCase().includes(normalized)).slice(0, 5);
}

// Recupera categorías guardadas y añade las nuevas encontradas en presupuestos previos
function getCustomCategories() {
    const storedCategories = JSON.parse(localStorage.getItem('gfpCustomCategories') || '[]');
    const builtInCategories = ['Servicios', 'Alimentacion', 'Transporte', 'Personalizada'];
    const fromBudgets = getBudgets()
        .map((budget) => budget.categoria)
        .filter(Boolean)
        .filter((category) => !builtInCategories.includes(category));

    const categories = [...new Set([...storedCategories, ...fromBudgets])].filter(Boolean);
    if (categories.length !== storedCategories.length || categories.some((category, index) => category !== storedCategories[index])) {
        localStorage.setItem('gfpCustomCategories', JSON.stringify(categories));
    }

    return categories;
}

function registerCustomCategory(name) {
    const normalizedName = (name || '').trim();
    if (!normalizedName) return;

    const categories = getCustomCategories();
    if (!categories.some((category) => category.toLowerCase() === normalizedName.toLowerCase())) {
        categories.push(normalizedName);
        localStorage.setItem('gfpCustomCategories', JSON.stringify(categories));
    }
}

function generateId() {
    return 'budget-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
}

function showError(message) {
    const errorNotif = document.getElementById('errorNotification');
    if (!errorNotif) return;
    const text = errorNotif.querySelector('.notification-text p');
    if (text) text.textContent = message;
    errorNotif.classList.add('show');
}

function hideError() {
    const el = document.getElementById('errorNotification');
    if (el) el.classList.remove('show');
}
