// ------------------------------
// MODELO DE DATOS
// ------------------------------
let activities = {};
let nextId = 1;
let currentYear = 2026;
let currentMonth = 3; // abril

// Elementos DOM
const calendarBody = document.getElementById('calendarBody');
const monthSelect = document.getElementById('monthSelect');
const yearInput = document.getElementById('yearInput');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const todayBtn = document.getElementById('todayBtn');
const resetDataBtn = document.getElementById('resetDataBtn');
const importTextBtn = document.getElementById('importTextBtn');
const exportImageBtn = document.getElementById('exportImageBtn');

// Modal actividad
const modal = document.getElementById('activityModal');
const modalTitle = document.getElementById('modalTitle');
const modalDateInput = document.getElementById('modalDate');
const modalActivityId = document.getElementById('modalActivityId');
const activityTitleInput = document.getElementById('activityTitle');
const activityItemsTextarea = document.getElementById('activityItems');
const saveActivityBtn = document.getElementById('saveActivityBtn');
const deleteActivityBtn = document.getElementById('deleteActivityBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const closeSpan = document.querySelector('.close-modal');

// Modal importación
const importModal = document.getElementById('importModal');
const importTextarea = document.getElementById('importTextarea');
const doImportBtn = document.getElementById('doImportBtn');
const cancelImportBtn = document.getElementById('cancelImportBtn');
const closeImportSpan = document.querySelector('.close-import-modal');

let currentEditDate = null;

// ------------------------------
// UTILIDADES
// ------------------------------
function formatDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getTodayKey() {
    const today = new Date();
    return formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
}

function saveToLocalStorage() {
    const dataToStore = { activities, nextId, lastYear: currentYear, lastMonth: currentMonth };
    localStorage.setItem('strategicCalendar', JSON.stringify(dataToStore));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('strategicCalendar');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            activities = data.activities || {};
            nextId = data.nextId || 1;
            if (data.lastYear !== undefined) currentYear = data.lastYear;
            if (data.lastMonth !== undefined) currentMonth = data.lastMonth;
        } catch(e) { console.warn(e); initExampleData(); }
    } else {
        initExampleData();
    }
    updateMonthYearControls();
    renderCalendar();
}

function initExampleData() {
    activities = {};
    nextId = 1;
    const sample = [
        { day: 1, titulo: "Segmentación estratégica inicial", items: ["Clasificación por antigüedad y perfil de riesgo.", "Asignación prioritaria a gestores."] },
        { day: 2, titulo: "Intensificación multicanal", items: ["Campaña recordatorio WhatsApp.", "Llamada predictiva automatizada."] },
        { day: 3, titulo: "Convenios especiales", items: ["Ofertas de pago parcial con condonación de intereses.", "Dashboard de aceptación."] },
        { day: 4, titulo: "Seguimiento estratégico", items: ["de 8 AM a 12 MD"] },
        { day: 6, titulo: "Indicadores semanales", items: ["Análisis de efectividad primera semana.", "Reporte de gestión temprana."] },
        { day: 7, titulo: "Segmentación dinámica", items: ["Reclasificación por respuesta inicial.", "Perfiles de prioridad."] },
        { day: 11, titulo: "Seguimiento estratégico", items: ["de 8 AM a 12 MD"] },
        { day: 18, titulo: "Seguimiento estratégico", items: ["de 8 AM a 12 MD"] },
        { day: 25, titulo: "Seguimiento estratégico", items: ["de 8 AM a 12 MD"] },
        { day: 30, titulo: "Cierre + Reportes", items: ["Consolidación de resultados.", "Reconocimiento a mejores gestores.", "Plan de acción para mayo."] }
    ];
    const year = 2026, month = 3;
    sample.forEach(s => {
        const dateKey = formatDateKey(year, month, s.day);
        activities[dateKey] = { id: nextId++, titulo: s.titulo, items: s.items };
    });
}

function updateMonthYearControls() {
    monthSelect.innerHTML = '';
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    for (let i = 0; i < 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = monthNames[i];
        if (i === currentMonth) option.selected = true;
        monthSelect.appendChild(option);
    }
    yearInput.value = currentYear;
}

// ------------------------------
// RENDERIZADO DEL CALENDARIO
// ------------------------------
function renderCalendar() {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let calendarRows = [];
    let row = [];
    for (let i = 0; i < startWeekday; i++) row.push({ type: 'empty', day: null });
    for (let d = 1; d <= daysInMonth; d++) {
        row.push({ type: 'day', day: d });
        if (row.length === 7) { calendarRows.push(row); row = []; }
    }
    if (row.length > 0) { while (row.length < 7) row.push({ type: 'empty', day: null }); calendarRows.push(row); }
    
    let tbodyHtml = '';
    for (let r of calendarRows) {
        let rowHtml = '<tr>';
        for (let cell of r) {
            if (cell.type === 'empty') {
                rowHtml += '<td class="empty-cell">—</td>';
            } else {
                const dateKey = formatDateKey(currentYear, currentMonth, cell.day);
                const activity = activities[dateKey];
                rowHtml += `<td class="calendar-cell" data-date="${dateKey}" data-day="${cell.day}">
                    <div class="date-header">
                        <span class="day-number">${cell.day}</span>
                        <button class="add-activity-btn" data-date="${dateKey}" title="Agregar actividad">+</button>
                    </div>`;
                if (activity) {
                    rowHtml += `<div class="activity-card" draggable="true" data-id="${activity.id}" data-date="${dateKey}">
                        <div class="activity-title">
                            <span>${escapeHtml(activity.titulo)}</span>
                            <button class="edit-icon" data-date="${dateKey}" data-id="${activity.id}">✏️</button>
                        </div>
                        <ul class="activity-items">`;
                    activity.items.forEach(item => { rowHtml += `<li>${escapeHtml(item)}</li>`; });
                    rowHtml += `</ul></div>`;
                } else {
                    rowHtml += `<div class="empty-day">Sin actividad</div>`;
                }
                rowHtml += `</td>`;
            }
        }
        rowHtml += '</tr>';
        tbodyHtml += rowHtml;
    }
    calendarBody.innerHTML = tbodyHtml;
    attachCellEvents();
    attachDragEvents();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function attachCellEvents() {
    document.querySelectorAll('.add-activity-btn').forEach(btn => {
        btn.removeEventListener('click', addClickHandler);
        btn.addEventListener('click', addClickHandler);
    });
    document.querySelectorAll('.edit-icon').forEach(editBtn => {
        editBtn.removeEventListener('click', editClickHandler);
        editBtn.addEventListener('click', editClickHandler);
    });
}

function addClickHandler(e) {
    e.stopPropagation();
    const date = this.getAttribute('data-date');
    if (activities[date]) { alert('Ya existe una actividad. Puedes editarla.'); return; }
    openModalForDate(date, null);
}

function editClickHandler(e) {
    e.stopPropagation();
    const date = this.getAttribute('data-date');
    const id = parseInt(this.getAttribute('data-id'));
    openModalForDate(date, id);
}

function openModalForDate(date, activityId) {
    currentEditDate = date;
    modalDateInput.value = date;
    if (activityId && activities[date] && activities[date].id === activityId) {
        const act = activities[date];
        modalActivityId.value = act.id;
        activityTitleInput.value = act.titulo;
        activityItemsTextarea.value = act.items.join('\n');
        modalTitle.innerText = 'Editar actividad';
        deleteActivityBtn.style.display = 'inline-block';
    } else {
        modalActivityId.value = '';
        activityTitleInput.value = '';
        activityItemsTextarea.value = '';
        modalTitle.innerText = 'Nueva actividad';
        deleteActivityBtn.style.display = 'none';
    }
    modal.style.display = 'block';
}

function closeModal() { modal.style.display = 'none'; currentEditDate = null; }

function saveActivity() {
    const date = modalDateInput.value;
    if (!date) return;
    const title = activityTitleInput.value.trim();
    if (!title) { alert('El título es obligatorio'); return; }
    let items = activityItemsTextarea.value.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (items.length === 0) items = ['Sin tareas definidas'];
    const existingId = modalActivityId.value ? parseInt(modalActivityId.value) : null;
    if (existingId && activities[date] && activities[date].id === existingId) {
        activities[date].titulo = title;
        activities[date].items = items;
    } else {
        const newId = nextId++;
        activities[date] = { id: newId, titulo: title, items: items };
    }
    saveToLocalStorage();
    renderCalendar();
    closeModal();
}

function deleteCurrentActivity() {
    const date = modalDateInput.value;
    if (date && activities[date]) { delete activities[date]; saveToLocalStorage(); renderCalendar(); }
    closeModal();
}

// ------------------------------
// DRAG & DROP
// ------------------------------
let dragSourceDate = null, dragSourceId = null;
function attachDragEvents() {
    document.querySelectorAll('.activity-card').forEach(dragEl => {
        dragEl.removeEventListener('dragstart', dragStartHandler);
        dragEl.removeEventListener('dragend', dragEndHandler);
        dragEl.addEventListener('dragstart', dragStartHandler);
        dragEl.addEventListener('dragend', dragEndHandler);
    });
    document.querySelectorAll('.calendar-cell').forEach(zone => {
        zone.removeEventListener('dragover', dragOverHandler);
        zone.removeEventListener('dragleave', dragLeaveHandler);
        zone.removeEventListener('drop', dropHandler);
        zone.addEventListener('dragover', dragOverHandler);
        zone.addEventListener('dragleave', dragLeaveHandler);
        zone.addEventListener('drop', dropHandler);
    });
}
function dragStartHandler(e) {
    const card = e.target.closest('.activity-card');
    if (!card) return;
    dragSourceDate = card.getAttribute('data-date');
    dragSourceId = parseInt(card.getAttribute('data-id'));
    e.dataTransfer.setData('text/plain', `${dragSourceDate}|${dragSourceId}`);
    e.dataTransfer.effectAllowed = 'move';
}
function dragEndHandler(e) {
    dragSourceDate = null;
    document.querySelectorAll('.calendar-cell').forEach(cell => cell.classList.remove('drop-over'));
}
function dragOverHandler(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; this.classList.add('drop-over'); }
function dragLeaveHandler(e) { this.classList.remove('drop-over'); }
function dropHandler(e) {
    e.preventDefault();
    this.classList.remove('drop-over');
    const targetDate = this.getAttribute('data-date');
    if (!targetDate) return;
    const dragData = e.dataTransfer.getData('text/plain');
    if (!dragData) return;
    const [sourceDate, sourceIdStr] = dragData.split('|');
    const sourceId = parseInt(sourceIdStr);
    if (!sourceDate || sourceId === undefined) return;
    if (sourceDate === targetDate) return;
    if (!activities[sourceDate] || activities[sourceDate].id !== sourceId) return;
    if (activities[targetDate]) {
        if (!confirm(`El día ${targetDate} ya tiene actividad. ¿Sobrescribir?`)) return;
    }
    activities[targetDate] = { ...activities[sourceDate] };
    delete activities[sourceDate];
    saveToLocalStorage();
    renderCalendar();
}

// ------------------------------
// IMPORTACIÓN DESDE TEXTO (LENGUAJE SIMPLE)
// ------------------------------
function parseMonthName(monthStr) {
    const months = {
        'enero':0, 'febrero':1, 'marzo':2, 'abril':3, 'mayo':4, 'junio':5,
        'julio':6, 'agosto':7, 'septiembre':8, 'octubre':9, 'noviembre':10, 'diciembre':11,
        'ene':0, 'feb':1, 'mar':2, 'abr':3, 'may':4, 'jun':5, 'jul':6, 'ago':7, 'sep':8, 'oct':9, 'nov':10, 'dic':11
    };
    const normalized = monthStr.toLowerCase().trim();
    return months[normalized] !== undefined ? months[normalized] : null;
}

function importFromText(text) {
    const lines = text.split(/\r?\n/);
    let currentYear = null;
    let currentMonth = null;
    let newActivities = {};
    let currentDay = null;
    let currentTitle = null;
    let currentItems = [];
    let pendingActivity = false;
    
    const monthYearRegex = /^\s*([A-Za-záéíóúüñ]+)\s+(\d{4})\s*$/i;
    const dayRegex = /^\s*DIA\s+(\d{1,2})\s*:?\s*(.*)$/i;
    const itemRegex = /^\s*-\s+(.*)$/;
    
    for (let line of lines) {
        line = line.trim();
        if (line === "") {
            if (pendingActivity && currentDay !== null && currentMonth !== null && currentYear !== null) {
                const dateKey = formatDateKey(currentYear, currentMonth, currentDay);
                newActivities[dateKey] = { id: 0, titulo: currentTitle, items: currentItems.length ? currentItems : ["Sin ítems"] };
                pendingActivity = false;
                currentDay = null; currentTitle = null; currentItems = [];
            }
            continue;
        }
        
        let match = line.match(monthYearRegex);
        if (match) {
            if (pendingActivity && currentDay !== null && currentMonth !== null && currentYear !== null) {
                const dateKey = formatDateKey(currentYear, currentMonth, currentDay);
                newActivities[dateKey] = { id: 0, titulo: currentTitle, items: currentItems.length ? currentItems : ["Sin ítems"] };
                pendingActivity = false;
                currentDay = null; currentTitle = null; currentItems = [];
            }
            const monthName = match[1];
            const yearNum = parseInt(match[2]);
            const monthIdx = parseMonthName(monthName);
            if (monthIdx !== null && !isNaN(yearNum)) {
                currentMonth = monthIdx;
                currentYear = yearNum;
            }
            continue;
        }
        
        match = line.match(dayRegex);
        if (match) {
            if (pendingActivity && currentDay !== null && currentMonth !== null && currentYear !== null) {
                const dateKey = formatDateKey(currentYear, currentMonth, currentDay);
                newActivities[dateKey] = { id: 0, titulo: currentTitle, items: currentItems.length ? currentItems : ["Sin ítems"] };
            }
            const dayNum = parseInt(match[1]);
            let title = match[2].trim();
            if (title === "") title = "Actividad sin título";
            currentDay = dayNum;
            currentTitle = title;
            currentItems = [];
            pendingActivity = true;
            continue;
        }
        
        match = line.match(itemRegex);
        if (match && pendingActivity) {
            currentItems.push(match[1].trim());
            continue;
        }
    }
    if (pendingActivity && currentDay !== null && currentMonth !== null && currentYear !== null) {
        const dateKey = formatDateKey(currentYear, currentMonth, currentDay);
        newActivities[dateKey] = { id: 0, titulo: currentTitle, items: currentItems.length ? currentItems : ["Sin ítems"] };
    }
    
    if (Object.keys(newActivities).length === 0) {
        alert("No se encontraron actividades en el texto. Revisa el formato.");
        return false;
    }
    
    for (let dateKey in newActivities) {
        const act = newActivities[dateKey];
        act.id = nextId++;
        activities[dateKey] = act;
    }
    saveToLocalStorage();
    renderCalendar();
    return true;
}

function showImportModal() {
    importTextarea.value = "";
    importModal.style.display = "block";
}
function closeImportModal() { importModal.style.display = "none"; }
function doImport() {
    const text = importTextarea.value;
    if (!text.trim()) { alert("Ingrese texto con el formato indicado."); return; }
    if (confirm("Esta acción agregará o reemplazará actividades en las fechas especificadas. ¿Continuar?")) {
        const success = importFromText(text);
        if (success) closeImportModal();
        else alert("Error en el formato. Use ej: ABRIL 2026\nDIA 1: Título\n- item1\n- item2");
    }
}

// ------------------------------
// EXPORTAR COMO IMAGEN
// ------------------------------
async function exportTableAsImage() {
    const wrapper = document.getElementById('calendarWrapper');
    if (!wrapper) return;
    
    // Mostrar un indicador de carga
    const originalBtnText = exportImageBtn.innerText;
    exportImageBtn.innerText = '⏳ Generando...';
    exportImageBtn.disabled = true;
    
    try {
        // Clonar el wrapper para no modificar el original
        const cloneWrapper = wrapper.cloneNode(true);
        
        // Ocultar los botones de agregar actividad (+) en el clon
        cloneWrapper.querySelectorAll('.add-activity-btn').forEach(btn => {
            btn.style.display = 'none';
        });
        
        // Ocultar los botones de editar (✏️) en el clon
        cloneWrapper.querySelectorAll('.edit-icon').forEach(btn => {
            btn.style.display = 'none';
        });
        
        // Ocultar el texto "Sin actividad" para una imagen más limpia
        cloneWrapper.querySelectorAll('.empty-day').forEach(el => {
            // se puede dejar o comentar para mantener el texto
            el.style.color = 'transparent';
        });
        
        // Aplicar estilos adicionales para la captura
        cloneWrapper.style.position = 'absolute';
        cloneWrapper.style.top = '-9999px';
        cloneWrapper.style.left = '-9999px';
        document.body.appendChild(cloneWrapper);
        
        // Usar html2canvas con opciones para alta calidad
        const canvas = await html2canvas(cloneWrapper, {
            scale: 2,              // Mejor resolución
            backgroundColor: document.body.classList.contains('dark-mode') ? '#121212' : '#ffffff',
            logging: false,
            useCORS: false,
            allowTaint: false
        });
        
        // Eliminar el clon del DOM
        document.body.removeChild(cloneWrapper);
        
        // Crear enlace de descarga
        const link = document.createElement('a');
        const fecha = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}`;
        link.download = `calendario_${fecha}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('Error al generar la imagen:', error);
        alert('Hubo un error al generar la imagen. Intente de nuevo.');
    } finally {
        exportImageBtn.innerText = originalBtnText;
        exportImageBtn.disabled = false;
    }
}

// ------------------------------
// EVENTOS DE CONTROLES
// ------------------------------
prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));
todayBtn.addEventListener('click', goToToday);
resetDataBtn.addEventListener('click', resetExampleData);
importTextBtn.addEventListener('click', showImportModal);
exportImageBtn.addEventListener('click', exportTableAsImage);
monthSelect.addEventListener('change', (e) => { currentMonth = parseInt(e.target.value); renderCalendar(); saveToLocalStorage(); });
yearInput.addEventListener('change', (e) => { let ny = parseInt(e.target.value); if (!isNaN(ny) && ny>=2020 && ny<=2030) currentYear=ny; yearInput.value=currentYear; renderCalendar(); saveToLocalStorage(); });

function changeMonth(delta) {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    else if (newMonth > 11) { newMonth = 0; newYear++; }
    currentMonth = newMonth; currentYear = newYear;
    updateMonthYearControls(); renderCalendar(); saveToLocalStorage();
}
function goToToday() { const d = new Date(); currentYear = d.getFullYear(); currentMonth = d.getMonth(); updateMonthYearControls(); renderCalendar(); saveToLocalStorage(); }
function resetExampleData() { if (confirm('Restaurar ejemplo de abril 2026')) { initExampleData(); currentYear=2026; currentMonth=3; updateMonthYearControls(); saveToLocalStorage(); renderCalendar(); } }

// Modal handlers actividad
saveActivityBtn.addEventListener('click', saveActivity);
deleteActivityBtn.addEventListener('click', deleteCurrentActivity);
cancelModalBtn.addEventListener('click', closeModal);
closeSpan.addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); if (e.target === importModal) closeImportModal(); });
cancelImportBtn.addEventListener('click', closeImportModal);
closeImportSpan.addEventListener('click', closeImportModal);
doImportBtn.addEventListener('click', doImport);

// Inicialización
loadFromLocalStorage();

// --- Modo oscuro ---
const darkModeBtn = document.getElementById('darkModeBtn');

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Guardar preferencia en localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        darkModeBtn.textContent = '☀️ Modo claro';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        darkModeBtn.textContent = '🌙 Modo oscuro';
    }
}

// Cargar preferencia guardada
function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeBtn.textContent = '☀️ Modo claro';
    } else {
        document.body.classList.remove('dark-mode');
        darkModeBtn.textContent = '🌙 Modo oscuro';
    }
}

// Añadir el evento al botón
if (darkModeBtn) {
    darkModeBtn.addEventListener('click', toggleDarkMode);
}

// Llamar a la función al cargar la página
loadDarkModePreference();