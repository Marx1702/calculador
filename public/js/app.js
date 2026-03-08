// ============================
// Calculador de Costos - Main App
// ============================

const API_BASE = window.location.origin;
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || '{}');

// Auth check
if (!token) {
  window.location.href = '/login';
}

// ============================
// State
// ============================
let materials = [];
let elements = [];
let budgets = [];
let allElements = [];
let currentFilter = '';

// ============================
// Toast System
// ============================
function showToast(message, type) {
  type = type || 'success';
  var container = document.getElementById('toastContainer');
  var icons = { success: '✅', error: '❌', warning: '⚠️', info: '💡' };
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = '<span class="toast-icon">' + (icons[type] || '💡') + '</span><span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('toast-out');
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 2500);
}

// ============================
// Custom Confirm Dialog
// ============================
function showConfirm(message, onConfirm) {
  var overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = '<div class="confirm-box">' +
    '<p>' + message + '</p>' +
    '<div class="confirm-actions">' +
    '<button class="btn-confirm-cancel">Cancelar</button>' +
    '<button class="btn-confirm-delete">Eliminar</button>' +
    '</div></div>';

  document.body.appendChild(overlay);

  overlay.querySelector('.btn-confirm-cancel').addEventListener('click', function() {
    document.body.removeChild(overlay);
  });

  overlay.querySelector('.btn-confirm-delete').addEventListener('click', function() {
    document.body.removeChild(overlay);
    onConfirm();
  });

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
}

// ============================
// API Helper
// ============================
function api(endpoint, options) {
  options = options || {};
  return fetch(API_BASE + endpoint, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: options.body || undefined
  }).then(function(res) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    return res.json().then(function(data) {
      if (!res.ok) throw new Error(data.error || 'Error del servidor');
      return data;
    });
  });
}

// ============================
// Initialize
// ============================
document.addEventListener('DOMContentLoaded', function() {
  initUser();
  initNavigation();
  initModals();
  initForms();
  initBudget();
  loadData();
});

// ============================
// User
// ============================
function initUser() {
  document.getElementById('userName').textContent = 'Hola, ' + (user.nombre || 'Usuario');
  document.getElementById('profileName').textContent = user.nombre || 'Usuario';
  document.getElementById('profileEmail').textContent = user.email || '';
  document.getElementById('profileAvatar').textContent = (user.nombre || 'U').charAt(0).toUpperCase();

  document.getElementById('btnLogout').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  });
}

// ============================
// Navigation
// ============================
function initNavigation() {
  var navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function(item) {
    item.addEventListener('click', function() {
      var sectionId = item.dataset.section;
      navItems.forEach(function(n) { n.classList.remove('active'); });
      item.classList.add('active');
      document.querySelectorAll('.app-section').forEach(function(s) { s.classList.remove('active'); });
      document.getElementById(sectionId).classList.add('active');
    });
  });
}

// ============================
// Modals
// ============================
function initModals() {
  document.getElementById('fabAddElement').addEventListener('click', function() {
    openElementModal();
  });
  document.getElementById('closeModalElement').addEventListener('click', function() {
    closeModal('modalElement');
  });
  document.getElementById('fabAddMaterial').addEventListener('click', function() {
    openModal('modalMaterial');
  });
  document.getElementById('closeModalMaterial').addEventListener('click', function() {
    closeModal('modalMaterial');
  });
  document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  });
}

function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function openElementModal(element) {
  var title = document.getElementById('modalElementTitle');
  var form = document.getElementById('elementForm');

  if (element) {
    title.textContent = 'Editar Elemento';
    document.getElementById('elementId').value = element.id;
    document.getElementById('elNombre').value = element.nombre;
    document.getElementById('elPrecio').value = element.precio_unitario;
    document.getElementById('elCantidad').value = element.cantidad;
    document.getElementById('elMaterial').value = element.material_id || '';
    updateElementSubtotal();
  } else {
    title.textContent = 'Nuevo Elemento';
    form.reset();
    document.getElementById('elementId').value = '';
    document.getElementById('elSubtotal').textContent = '$0.00';
  }

  openModal('modalElement');
}

// ============================
// Forms
// ============================
function initForms() {
  document.getElementById('elPrecio').addEventListener('input', updateElementSubtotal);
  document.getElementById('elCantidad').addEventListener('input', updateElementSubtotal);

  document.getElementById('elementForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var id = document.getElementById('elementId').value;
    var data = {
      nombre: document.getElementById('elNombre').value,
      precio_unitario: parseFloat(document.getElementById('elPrecio').value),
      cantidad: parseInt(document.getElementById('elCantidad').value),
      material_id: document.getElementById('elMaterial').value || null
    };

    var url = id ? '/api/elements/' + id : '/api/elements';
    var method = id ? 'PUT' : 'POST';

    api(url, { method: method, body: JSON.stringify(data) })
      .then(function() {
        closeModal('modalElement');
        showToast(id ? 'Elemento actualizado' : 'Elemento creado', 'success');
        return loadElements();
      })
      .then(function() {
        return loadAllElements();
      })
      .catch(function(err) {
        showToast(err.message, 'error');
      });
  });

  document.getElementById('materialForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var nombre = document.getElementById('matNombre').value;

    api('/api/materials', { method: 'POST', body: JSON.stringify({ nombre: nombre }) })
      .then(function() {
        closeModal('modalMaterial');
        document.getElementById('matNombre').value = '';
        showToast('Material creado', 'success');
        return loadMaterials();
      })
      .catch(function(err) {
        showToast(err.message, 'error');
      });
  });

  document.getElementById('filterMaterial').addEventListener('change', function(e) {
    currentFilter = e.target.value;
    loadElements();
  });
}

function updateElementSubtotal() {
  var precio = parseFloat(document.getElementById('elPrecio').value) || 0;
  var cantidad = parseInt(document.getElementById('elCantidad').value) || 0;
  document.getElementById('elSubtotal').textContent = formatCurrency(precio * cantidad);
}

// ============================
// Data Loading
// ============================
function loadData() {
  loadMaterials()
    .then(function() { return loadAllElements(); })
    .then(function() { return loadElements(); })
    .then(function() { return loadBudgets(); })
    .then(function() { updateProfile(); });
}

function loadAllElements() {
  return api('/api/elements').then(function(data) {
    allElements = data;
    renderBudgetElements();
  }).catch(function(err) {
    console.error('Error loading all elements:', err);
  });
}

function loadMaterials() {
  return api('/api/materials').then(function(data) {
    materials = data;
    renderMaterials();
    populateMaterialSelects();
  }).catch(function(err) {
    console.error('Error loading materials:', err);
  });
}

function loadElements() {
  var endpoint = '/api/elements';
  if (currentFilter) endpoint += '?material_id=' + currentFilter;
  return api(endpoint).then(function(data) {
    elements = data;
    renderElements();
  }).catch(function(err) {
    console.error('Error loading elements:', err);
  });
}

// ============================
// Rendering
// ============================
function renderElements() {
  var container = document.getElementById('elementsList');

  if (elements.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No hay elementos' +
      (currentFilter ? ' para este material' : '') + '</p>' +
      '<p class="empty-hint">Tocá + para agregar uno</p></div>';
    document.getElementById('elementsTotal').textContent = '$0.00';
    return;
  }

  var total = 0;
  container.innerHTML = elements.map(function(el, i) {
    var subtotal = parseFloat(el.precio_unitario) * parseInt(el.cantidad);
    total += subtotal;
    return '<div class="card" style="animation-delay: ' + (i * 0.05) + 's;">' +
      '<div class="card-header">' +
      '<span class="card-title">' + escapeHtml(el.nombre) + '</span>' +
      (el.material_nombre ? '<span class="card-badge">' + escapeHtml(el.material_nombre) + '</span>' : '') +
      '</div>' +
      '<div class="card-details">' +
      '<span class="card-detail-item">💰 ' + formatCurrency(el.precio_unitario) + ' c/u</span>' +
      '<span class="card-detail-item">📦 x' + el.cantidad + '</span>' +
      '</div>' +
      '<div class="card-amount">' + formatCurrency(subtotal) + '</div>' +
      '<div class="card-actions">' +
      '<button class="btn-card btn-edit" onclick="editElement(' + el.id + ')">✏️ Editar</button>' +
      '<button class="btn-card btn-delete" onclick="handleDeleteElement(' + el.id + ')">🗑️ Eliminar</button>' +
      '</div></div>';
  }).join('');

  document.getElementById('elementsTotal').textContent = formatCurrency(total);
}

function renderMaterials() {
  var container = document.getElementById('materialsList');

  if (materials.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No hay materiales</p>' +
      '<p class="empty-hint">Tocá + para agregar uno</p></div>';
    return;
  }

  container.innerHTML = materials.map(function(mat, i) {
    var count = allElements.filter(function(el) { return el.material_id === mat.id; }).length;
    return '<div class="material-card" style="animation-delay: ' + (i * 0.05) + 's;">' +
      '<div class="material-info">' +
      '<span class="material-dot"></span>' +
      '<div><span class="material-name">' + escapeHtml(mat.nombre) + '</span>' +
      '<span class="material-count">' + count + ' elemento' + (count !== 1 ? 's' : '') + '</span></div>' +
      '</div>' +
      '<button class="btn-delete-sm" onclick="handleDeleteMaterial(' + mat.id + ')" title="Eliminar">🗑️</button>' +
      '</div>';
  }).join('');
}

function populateMaterialSelects() {
  var options = materials.map(function(m) {
    return '<option value="' + m.id + '">' + escapeHtml(m.nombre) + '</option>';
  }).join('');

  document.getElementById('filterMaterial').innerHTML = '<option value="">Todos los materiales</option>' + options;
  document.getElementById('filterMaterial').value = currentFilter;
  document.getElementById('elMaterial').innerHTML = '<option value="">Sin material</option>' + options;
}

function updateProfile() {
  document.getElementById('summaryElements').textContent = allElements.length;
  document.getElementById('summaryMaterials').textContent = materials.length;
  document.getElementById('summaryBudgets').textContent = budgets.length;
}

// ============================
// Budget Builder
// ============================
function renderBudgetElements() {
  var container = document.getElementById('budgetElementsList');

  if (allElements.length === 0) {
    container.innerHTML = '<p class="empty-hint">Cargá elementos primero en la sección Elementos</p>';
    return;
  }

  container.innerHTML = allElements.map(function(el) {
    var stock = parseInt(el.cantidad);
    return '<div class="budget-el-item">' +
      '<input type="checkbox" class="budget-el-check" data-id="' + el.id + '" ' +
      'data-price="' + el.precio_unitario + '" data-stock="' + stock + '" onchange="onBudgetCheckChange(this)">' +
      '<div class="budget-el-info">' +
      '<div class="budget-el-name">' + escapeHtml(el.nombre) + '</div>' +
      '<div class="budget-el-price">' + formatCurrency(el.precio_unitario) + ' c/u · Stock: ' + stock +
      (el.material_nombre ? ' · ' + escapeHtml(el.material_nombre) : '') + '</div>' +
      '</div>' +
      '<input type="number" class="budget-el-qty" data-id="' + el.id + '" ' +
      'value="1" min="1" max="' + stock + '" step="1" disabled oninput="enforceBudgetQty(this, ' + stock + ')">' +
      '<span class="budget-el-subtotal" data-id="' + el.id + '">$0.00</span>' +
      '</div>';
  }).join('');
}

function onBudgetCheckChange(cb) {
  var id = cb.dataset.id;
  var stock = parseInt(cb.dataset.stock);
  var qty = document.querySelector('.budget-el-qty[data-id="' + id + '"]');
  qty.disabled = !cb.checked;
  if (cb.checked) {
    qty.value = 1;
    qty.max = stock;
  }
  if (!cb.checked) {
    document.querySelector('.budget-el-subtotal[data-id="' + id + '"]').textContent = '$0.00';
  }
  recalcBudget();
}

function enforceBudgetQty(input, maxStock) {
  var val = parseInt(input.value);
  if (val > maxStock) {
    input.value = maxStock;
    showToast('Máximo disponible: ' + maxStock, 'warning');
  }
  if (val < 1 && input.value !== '') {
    input.value = 1;
  }
  recalcBudget();
}

function initBudget() {
  document.getElementById('budgetCostoHora').addEventListener('input', recalcBudget);
  document.getElementById('budgetHoras').addEventListener('input', recalcBudget);

  var pctSlider = document.getElementById('budgetPorcentaje');
  var pctNum = document.getElementById('budgetPorcentajeNum');

  pctSlider.addEventListener('input', function() {
    pctNum.value = pctSlider.value;
    recalcBudget();
  });

  pctNum.addEventListener('input', function() {
    pctSlider.value = Math.min(pctNum.value, 200);
    recalcBudget();
  });

  document.getElementById('btnSaveBudget').addEventListener('click', saveBudget);
}

function recalcBudget() {
  var costoMateriales = 0;
  var checks = document.querySelectorAll('.budget-el-check:checked');
  checks.forEach(function(cb) {
    var id = cb.dataset.id;
    var price = parseFloat(cb.dataset.price);
    var qty = parseInt(document.querySelector('.budget-el-qty[data-id="' + id + '"]').value) || 0;
    var subtotal = price * qty;
    document.querySelector('.budget-el-subtotal[data-id="' + id + '"]').textContent = formatCurrency(subtotal);
    costoMateriales += subtotal;
  });

  var costoHora = parseFloat(document.getElementById('budgetCostoHora').value) || 0;
  var horas = parseFloat(document.getElementById('budgetHoras').value) || 0;
  var costoTiempo = costoHora * horas;

  var pct = parseFloat(document.getElementById('budgetPorcentajeNum').value) || 0;
  var subtotal = costoMateriales + costoTiempo;
  var ganancia = subtotal * (pct / 100);
  var precioFinal = subtotal + ganancia;

  document.getElementById('budgetCostoMateriales').textContent = formatCurrency(costoMateriales);
  document.getElementById('budgetCostoTiempo').textContent = formatCurrency(costoTiempo);
  document.getElementById('budgetGanancia').textContent = formatCurrency(ganancia);
  document.getElementById('budgetSubtotal').textContent = formatCurrency(subtotal);
  document.getElementById('budgetPrecioFinal').textContent = formatCurrency(precioFinal);
}

function saveBudget() {
  var nombre = document.getElementById('budgetNombre').value.trim();
  if (!nombre) {
    showToast('Ingresá un nombre para el presupuesto', 'warning');
    return;
  }

  var items = [];
  document.querySelectorAll('.budget-el-check:checked').forEach(function(cb) {
    var id = parseInt(cb.dataset.id);
    var qty = parseInt(document.querySelector('.budget-el-qty[data-id="' + id + '"]').value) || 1;
    items.push({ elemento_id: id, cantidad: qty });
  });

  var data = {
    nombre: nombre,
    costo_hora: parseFloat(document.getElementById('budgetCostoHora').value) || 0,
    horas_estimadas: parseFloat(document.getElementById('budgetHoras').value) || 0,
    porcentaje_ganancia: parseFloat(document.getElementById('budgetPorcentajeNum').value) || 0,
    items: items
  };

  api('/api/budgets', { method: 'POST', body: JSON.stringify(data) })
    .then(function() {
      document.getElementById('budgetNombre').value = '';
      document.querySelectorAll('.budget-el-check').forEach(function(cb) {
        cb.checked = false;
        var id = cb.dataset.id;
        document.querySelector('.budget-el-qty[data-id="' + id + '"]').disabled = true;
        document.querySelector('.budget-el-qty[data-id="' + id + '"]').value = 1;
        document.querySelector('.budget-el-subtotal[data-id="' + id + '"]').textContent = '$0.00';
      });
      document.getElementById('budgetCostoHora').value = '';
      document.getElementById('budgetHoras').value = '';
      recalcBudget();
      showToast('Presupuesto guardado', 'success');
      return loadBudgets();
    })
    .catch(function(err) {
      showToast(err.message, 'error');
    });
}

function loadBudgets() {
  return api('/api/budgets').then(function(data) {
    budgets = data;
    renderBudgets();
    updateProfile();
  }).catch(function(err) {
    console.error('Error loading budgets:', err);
  });
}

function renderBudgets() {
  var container = document.getElementById('budgetsList');

  if (budgets.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No hay presupuestos guardados</p></div>';
    return;
  }

  container.innerHTML = budgets.map(function(b, i) {
    return '<div class="card" style="animation-delay: ' + (i * 0.05) + 's;">' +
      '<div class="card-header">' +
      '<span class="card-title">' + escapeHtml(b.nombre) + '</span>' +
      '<span class="card-badge">' + b.porcentaje_ganancia + '%</span>' +
      '</div>' +
      '<div class="budget-card-breakdown">' +
      '<span class="budget-card-tag">📦 Mat: ' + formatCurrency(b.costo_materiales) + '</span>' +
      '<span class="budget-card-tag">⏱ Tiempo: ' + formatCurrency(b.costo_tiempo) + '</span>' +
      '<span class="budget-card-tag">📈 Ganancia: ' + formatCurrency(b.ganancia) + '</span>' +
      '</div>' +
      '<div class="budget-card-final">' + formatCurrency(b.precio_final) + '</div>' +
      '<div class="card-details" style="margin-top:4px;flex-wrap:wrap;">' +
      b.items.map(function(it) {
        return '<span class="card-detail-item">' + escapeHtml(it.elemento_nombre) + ' x' + it.cantidad + '</span>';
      }).join('') +
      '</div>' +
      '<div class="card-actions">' +
      '<button class="btn-card btn-delete" onclick="handleDeleteBudget(' + b.id + ')" style="flex:1;">🗑️ Eliminar</button>' +
      '</div></div>';
  }).join('');
}

// ============================
// Delete Actions (with confirm dialog)
// ============================
function handleDeleteElement(id) {
  showConfirm('¿Eliminar este elemento?', function() {
    api('/api/elements/' + id, { method: 'DELETE' })
      .then(function() {
        showToast('Elemento eliminado', 'success');
        return loadElements();
      })
      .then(function() { return loadAllElements(); })
      .then(function() { updateProfile(); })
      .catch(function(err) {
        showToast(err.message, 'error');
      });
  });
}

function handleDeleteMaterial(id) {
  showConfirm('¿Eliminar este material?', function() {
    api('/api/materials/' + id, { method: 'DELETE' })
      .then(function() {
        showToast('Material eliminado', 'success');
        return loadMaterials();
      })
      .then(function() { return loadElements(); })
      .then(function() { return loadAllElements(); })
      .then(function() { updateProfile(); })
      .catch(function(err) {
        showToast(err.message, 'error');
      });
  });
}

function handleDeleteBudget(id) {
  showConfirm('¿Eliminar este presupuesto?', function() {
    api('/api/budgets/' + id, { method: 'DELETE' })
      .then(function() {
        showToast('Presupuesto eliminado', 'success');
        return loadBudgets();
      })
      .catch(function(err) {
        showToast(err.message, 'error');
      });
  });
}

// Keep old names for backward compat
function editElement(id) {
  var el = allElements.find(function(e) { return e.id === id; }) ||
           elements.find(function(e) { return e.id === id; });
  if (el) openElementModal(el);
}

// ============================
// Utilities
// ============================
function formatCurrency(amount) {
  return '$' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
