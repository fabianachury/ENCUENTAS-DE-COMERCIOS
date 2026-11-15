// Lógica del Panel de Control / SuperAdmin Multi-Restaurante

const AdminApp = {
  editingId: null,

  init() {
    this.renderStats();
    this.renderRestaurantsList();
    this.renderSubmissionsTable();
    this.setupEventListeners();
  },

  renderStats() {
    const stats = window.StorageManager.getGlobalStats();

    const totalEl = document.getElementById('stat-total-surveys');
    const fiveStarEl = document.getElementById('stat-five-stars');
    const lowStarEl = document.getElementById('stat-low-stars');
    const birthdaysEl = document.getElementById('stat-birthdays');

    if (totalEl) totalEl.textContent = stats.totalSurveys;
    if (fiveStarEl) fiveStarEl.textContent = `${stats.fiveStarCount} (${stats.fiveStarPercent}%)`;
    if (lowStarEl) lowStarEl.textContent = stats.lowStarCount;
    if (birthdaysEl) birthdaysEl.textContent = stats.birthdayThisMonth;
  },

  renderRestaurantsList() {
    const container = document.getElementById('restaurants-list-container');
    if (!container) return;

    const list = window.StorageManager.getRestaurants();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
          <p class="text-slate-500 mb-4">No tienes restaurantes configurados aún.</p>
          <button onclick="AdminApp.openModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow hover:bg-indigo-700 transition">
            + Crear Primer Restaurante
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(r => {
      const submissions = window.StorageManager.getSubmissions(r.id);
      const fiveStars = submissions.filter(s => parseInt(s.ratingOverall, 10) === 5).length;

      return `
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shadow-inner">
                  <img src="${r.logo || 'https://cdn-icons-png.flaticon.com/512/992/992747.png'}" alt="${r.name}" class="max-w-full max-h-full object-contain">
                </div>
                <div>
                  <h3 class="font-bold text-slate-800 text-lg">${r.name}</h3>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-600">
                      /r/${r.id}
                    </span>
                    <span class="w-3 h-3 rounded-full border border-white shadow-sm" style="background-color: ${r.primaryColor || '#b45309'}"></span>
                  </div>
                </div>
              </div>
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Activo
              </span>
            </div>

            <p class="text-xs text-slate-500 line-clamp-2 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              🎁 <strong>Gancho:</strong> ${r.rewardText || 'Sin beneficio asignado'}
            </p>

            <div class="grid grid-cols-2 gap-2 text-center text-xs text-slate-600 mb-5">
              <div class="bg-amber-50/60 p-2 rounded-xl border border-amber-100/60">
                <span class="block font-bold text-amber-700 text-base">${submissions.length}</span>
                <span>Encuestas</span>
              </div>
              <div class="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100/60">
                <span class="block font-bold text-emerald-700 text-base">${fiveStars}</span>
                <span>5★ a Google</span>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4 flex flex-wrap items-center gap-2">
            <a href="?r=${r.id}" target="_blank" class="flex-1 text-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition">
              📱 Ver Encuesta
            </a>
            <button onclick="window.QRStudio.openStudio('${r.id}')" class="flex-1 text-center px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-xl text-xs font-medium transition">
              🎯 QR & Hablador
            </button>
            <button onclick="AdminApp.editRestaurant('${r.id}')" class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition" title="Editar">
              ✏️
            </button>
            <button onclick="AdminApp.deleteRestaurant('${r.id}')" class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition" title="Eliminar">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  setupEventListeners() {
    // Modal de edición / creación
    const form = document.getElementById('restaurant-modal-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveModalData();
      });
    }

    // Color picker sincronizado
    const colorPicker = document.getElementById('modal-rest-color');
    const colorHex = document.getElementById('modal-rest-color-hex');
    if (colorPicker && colorHex) {
      colorPicker.addEventListener('input', () => {
        colorHex.value = colorPicker.value;
      });
      colorHex.addEventListener('input', () => {
        if (/^#[0-9A-F]{6}$/i.test(colorHex.value)) {
          colorPicker.value = colorHex.value;
        }
      });
    }
  },

  openModal(restaurant = null) {
    this.editingId = restaurant ? restaurant.id : null;
    const modal = document.getElementById('restaurant-edit-modal');
    const title = document.getElementById('modal-title');
    const slugInput = document.getElementById('modal-rest-slug');

    if (modal) modal.classList.remove('hidden');
    if (title) title.textContent = restaurant ? 'Editar Restaurante' : 'Nuevo Restaurante';
    if (slugInput) slugInput.disabled = !!restaurant;

    // Valores
    document.getElementById('modal-rest-name').value = restaurant ? restaurant.name : '';
    document.getElementById('modal-rest-slug').value = restaurant ? restaurant.id : '';
    document.getElementById('modal-rest-tagline').value = restaurant ? (restaurant.tagline || '') : '';
    document.getElementById('modal-rest-logo').value = restaurant ? (restaurant.logo || '') : '';
    document.getElementById('modal-rest-color').value = restaurant ? (restaurant.primaryColor || '#b45309') : '#b45309';
    document.getElementById('modal-rest-color-hex').value = restaurant ? (restaurant.primaryColor || '#b45309') : '#b45309';
    document.getElementById('modal-rest-google').value = restaurant ? (restaurant.googleMapsUrl || '') : '';
    document.getElementById('modal-rest-reward').value = restaurant ? (restaurant.rewardText || '') : '';
    document.getElementById('modal-rest-webhook').value = restaurant ? (restaurant.sheetsWebhookUrl || '') : '';

    // Gratificación Inmediata en Mesa
    const hasImmediate = restaurant ? !!restaurant.hasImmediateReward : false;
    const immediateCheckbox = document.getElementById('modal-rest-has-immediate');
    const immediateWrapper = document.getElementById('modal-immediate-reward-wrapper');
    const immediateInput = document.getElementById('modal-rest-immediate-text');

    if (immediateCheckbox) immediateCheckbox.checked = hasImmediate;
    if (immediateWrapper) {
      if (hasImmediate) immediateWrapper.classList.remove('hidden');
      else immediateWrapper.classList.add('hidden');
    }
    if (immediateInput) immediateInput.value = (restaurant && restaurant.immediateRewardText) ? restaurant.immediateRewardText : '';

    // Cargar Aspectos Dinámicos
    const container = document.getElementById('modal-aspects-list');
    if (container) {
      container.innerHTML = '';
      const questions = (restaurant && restaurant.questions && restaurant.questions.length > 0)
        ? restaurant.questions
        : [
            { id: 'aspect_1', label: 'Calidad y Sabor del Producto', icon: '🍰' },
            { id: 'aspect_2', label: 'Aseo de las Instalaciones', icon: '✨' },
            { id: 'aspect_3', label: 'Atención y Servicio del Personal', icon: '☕' }
          ];

      questions.forEach(q => this.addAspectRow(q.label, q.icon));
    }
  },

  addAspectRow(label = '', icon = '⭐') {
    const container = document.getElementById('modal-aspects-list');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'aspect-row flex items-center gap-2 animate-fadeIn';
    row.innerHTML = `
      <span class="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200 flex items-center justify-center text-[11px] flex-shrink-0">
        ${container.children.length + 1}
      </span>
      <input type="text" value="${label.replace(/"/g, '&quot;')}" placeholder="Ej. Tiempo de Espera, Presentación del Plato, Baños..." class="modal-aspect-input flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition">
      <button type="button" onclick="AdminApp.removeAspectRow(this)" class="w-7 h-7 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center text-xs font-bold transition flex-shrink-0" title="Eliminar este aspecto">
        ✕
      </button>
    `;
    container.appendChild(row);
    this.renumberAspectRows();
  },

  removeAspectRow(btn) {
    const container = document.getElementById('modal-aspects-list');
    if (!container) return;
    if (container.children.length <= 1) {
      alert('Debes mantener al menos 1 aspecto a evaluar.');
      return;
    }
    const row = btn.closest('.aspect-row');
    if (row) row.remove();
    this.renumberAspectRows();
  },

  renumberAspectRows() {
    const container = document.getElementById('modal-aspects-list');
    if (!container) return;
    Array.from(container.children).forEach((row, idx) => {
      const badge = row.querySelector('span');
      if (badge) badge.textContent = idx + 1;
    });
  },

  toggleImmediateRewardInput() {
    const checkbox = document.getElementById('modal-rest-has-immediate');
    const wrapper = document.getElementById('modal-immediate-reward-wrapper');
    if (checkbox && wrapper) {
      if (checkbox.checked) {
        wrapper.classList.remove('hidden');
        document.getElementById('modal-rest-immediate-text').focus();
      } else {
        wrapper.classList.add('hidden');
      }
    }
  },

  closeModal() {
    const modal = document.getElementById('restaurant-edit-modal');
    if (modal) modal.classList.add('hidden');
    this.editingId = null;
  },

  editRestaurant(id) {
    const r = window.StorageManager.getRestaurant(id);
    if (r) this.openModal(r);
  },

  deleteRestaurant(id) {
    if (confirm(`¿Estás seguro de que deseas eliminar este restaurante (${id})?`)) {
      window.StorageManager.deleteRestaurant(id);
      this.renderRestaurantsList();
      this.renderStats();
    }
  },

  saveModalData() {
    const name = document.getElementById('modal-rest-name').value.trim();
    let slug = document.getElementById('modal-rest-slug').value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const tagline = document.getElementById('modal-rest-tagline').value.trim();
    const logo = document.getElementById('modal-rest-logo').value.trim();
    const primaryColor = document.getElementById('modal-rest-color').value;
    const googleMapsUrl = document.getElementById('modal-rest-google').value.trim();
    const rewardText = document.getElementById('modal-rest-reward').value.trim();
    const sheetsWebhookUrl = document.getElementById('modal-rest-webhook').value.trim();

    const hasImmediateReward = document.getElementById('modal-rest-has-immediate').checked;
    const immediateRewardText = document.getElementById('modal-rest-immediate-text').value.trim();

    // Leer todos los aspectos dinámicos
    const aspectInputs = document.querySelectorAll('.modal-aspect-input');
    const questions = [];
    aspectInputs.forEach((inp, idx) => {
      const val = inp.value.trim();
      if (val) {
        questions.push({
          id: `aspect_${idx + 1}`,
          label: val,
          icon: '⭐'
        });
      }
    });

    if (questions.length === 0) {
      questions.push({ id: 'aspect_1', label: 'Calidad del Producto', icon: '⭐' });
    }

    if (!name) {
      alert('Por favor ingresa el nombre comercial del restaurante.');
      return;
    }
    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    const payload = {
      id: this.editingId || slug,
      name,
      tagline: tagline || 'Tu satisfacción es lo primero',
      logo: logo || 'https://cdn-icons-png.flaticon.com/512/992/992747.png',
      primaryColor,
      accentColor: primaryColor,
      googleMapsUrl: googleMapsUrl || 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
      rewardText: rewardText || '¡Regístrate para recibir beneficios exclusivos en tu cumpleaños!',
      hasImmediateReward,
      immediateRewardText: hasImmediateReward ? (immediateRewardText || '☕ Muestra tu reseña al mesero y recibe un café de cortesía hoy') : '',
      sheetsWebhookUrl,
      questions
    };

    window.StorageManager.upsertRestaurant(payload);
    this.closeModal();
    this.renderRestaurantsList();
    this.renderStats();
  },

  // Modal para ver y copiar el código de Google Apps Script
  openSheetsModal() {
    const modal = document.getElementById('sheets-code-modal');
    const codeEl = document.getElementById('apps-script-code-display');
    if (modal) modal.classList.remove('hidden');
    if (codeEl) codeEl.textContent = window.GOOGLE_APPS_SCRIPT_CODE;
  },

  closeSheetsModal() {
    const modal = document.getElementById('sheets-code-modal');
    if (modal) modal.classList.add('hidden');
  },

  copyAppsScriptCode() {
    navigator.clipboard.writeText(window.GOOGLE_APPS_SCRIPT_CODE).then(() => {
      const btn = document.getElementById('copy-script-btn');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ ¡Código Copiado al Portapapeles!';
        setTimeout(() => { btn.innerHTML = originalText; }, 2500);
      }
    });
  },

  // ====================================================
  // BANDEJA DE CLIENTES Y ENCUESTAS (CRM EN VIVO)
  // ====================================================
  // Obtener lista filtrada por restaurante, tipo y rango de fechas
  getFilteredSubmissions() {
    const filterRest = document.getElementById('table-filter-restaurant');
    const filterType = document.getElementById('table-filter-type');
    const startDateInput = document.getElementById('table-filter-start-date');
    const endDateInput = document.getElementById('table-filter-end-date');

    const selectedRest = filterRest ? filterRest.value : 'all';
    const selectedType = filterType ? filterType.value : 'all';
    const startDate = startDateInput ? startDateInput.value : '';
    const endDate = endDateInput ? endDateInput.value : '';

    let list = window.StorageManager.getSubmissions();
    const currentMonth = new Date().getMonth() + 1;

    // 1. Filtro por Restaurante
    if (selectedRest !== 'all') {
      list = list.filter(s => (s.restaurantId || '').toLowerCase() === selectedRest.toLowerCase());
    }

    // 2. Filtro por Tipo / Calificación
    if (selectedType === '5star') {
      list = list.filter(s => parseInt(s.ratingOverall, 10) === 5);
    } else if (selectedType === 'lowstar') {
      list = list.filter(s => parseInt(s.ratingOverall, 10) <= 4);
    } else if (selectedType === 'contact') {
      list = list.filter(s => s.requestedContact);
    } else if (selectedType === 'birthday') {
      list = list.filter(s => {
        if (!s.customerBirthday) return false;
        const parts = s.customerBirthday.split('/');
        return parts.length >= 2 && parseInt(parts[1], 10) === currentMonth;
      });
    }

    // 3. Filtro Fecha a Fecha (Desde ... Hasta ...)
    if (startDate) {
      const startTimestamp = new Date(startDate + 'T00:00:00').getTime();
      list = list.filter(s => {
        if (!s.createdAt) return false;
        return new Date(s.createdAt).getTime() >= startTimestamp;
      });
    }

    if (endDate) {
      const endTimestamp = new Date(endDate + 'T23:59:59.999').getTime();
      list = list.filter(s => {
        if (!s.createdAt) return false;
        return new Date(s.createdAt).getTime() <= endTimestamp;
      });
    }

    return list;
  },

  resetDateFilters() {
    const s = document.getElementById('table-filter-start-date');
    const e = document.getElementById('table-filter-end-date');
    if (s) s.value = '';
    if (e) e.value = '';
    this.renderSubmissionsTable();
  },

  renderSubmissionsTable() {
    const tableBody = document.getElementById('submissions-table-body');
    const filterRest = document.getElementById('table-filter-restaurant');
    const countBadge = document.getElementById('submissions-count-badge');

    if (!tableBody) return;

    // Actualizar opciones del selector de restaurantes si existe
    if (filterRest && filterRest.options.length <= 1) {
      const restList = window.StorageManager.getRestaurants();
      restList.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.name;
        filterRest.appendChild(opt);
      });
    }

    const list = this.getFilteredSubmissions();
    const currentMonth = new Date().getMonth() + 1;

    if (countBadge) countBadge.textContent = `${list.length} registros`;

    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="p-8 text-center text-slate-400 bg-slate-50/50">
            <span class="text-3xl block mb-2">📭</span>
            <p class="font-medium text-slate-600">No hay encuestas registradas bajo este filtro.</p>
            <p class="text-xs text-slate-400 mt-1">Escanea el QR o haz una prueba en la vista cliente para ver las respuestas aquí en tiempo real.</p>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = list.map(sub => {
      const date = sub.createdAt ? new Date(sub.createdAt).toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short'
      }) : 'Reciente';

      const isFiveStars = parseInt(sub.ratingOverall, 10) === 5;
      const cleanPhone = (sub.customerPhone || '').replace(/\D/g, '');
      const waLink = cleanPhone ? `https://wa.me/57${cleanPhone}?text=Hola%20${encodeURIComponent(sub.customerName || '')},%20te%20saludamos%20de%20${encodeURIComponent(sub.restaurantName || 'nuestro restaurante')}:` : '#';

      // Verificar si cumple años este mes
      let isBirthdayMonth = false;
      if (sub.customerBirthday) {
        const parts = sub.customerBirthday.split('/');
        if (parts.length >= 2 && parseInt(parts[1], 10) === currentMonth) {
          isBirthdayMonth = true;
        }
      }

      // Estrellas
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        starsHtml += `<span class="${i <= sub.ratingOverall ? 'text-amber-400' : 'text-slate-200'}">★</span>`;
      }

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition text-xs text-slate-700">
          <td class="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
            ${date}
          </td>
          <td class="p-3 font-semibold text-slate-800">
            <span class="inline-block max-w-[130px] truncate" title="${sub.restaurantName || sub.restaurantId}">
              ${sub.restaurantName || sub.restaurantId}
            </span>
          </td>
          <td class="p-3 font-bold text-slate-900">
            ${sub.customerName || 'Anónimo'}
          </td>
          <td class="p-3 whitespace-nowrap">
            <div class="flex items-center gap-1.5">
              <span class="font-mono text-slate-600">${sub.customerPhone || '-'}</span>
              ${cleanPhone ? `
                <a href="${waLink}" target="_blank" class="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-medium text-[11px] transition" title="Enviar WhatsApp">
                  💬 Chat
                </a>
              ` : ''}
            </div>
          </td>
          <td class="p-3 whitespace-nowrap">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${isBirthdayMonth ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300' : 'bg-slate-100 text-slate-600'}">
              ${isBirthdayMonth ? '🎂 ' : ''}${sub.customerBirthday || 'N/A'}
            </span>
          </td>
          <td class="p-3 whitespace-nowrap">
            <div class="text-sm tracking-tighter text-center">${starsHtml}</div>
            ${sub.aspects && sub.aspects.length > 0 ? `
              <div class="mt-1 text-[10px] text-slate-600 space-y-1 text-left bg-slate-50 p-1.5 rounded-lg border border-slate-200/70 max-w-[220px]">
                ${sub.aspects.map(a => `
                  <div class="leading-tight">
                    <span class="font-semibold text-slate-700">${a.label}:</span>
                    <span class="text-amber-600 font-bold">${a.rating}★</span>
                    ${a.note ? `<span class="block text-amber-800 bg-amber-100/80 px-1 py-0.5 rounded text-[10px] mt-0.5 italic">💬 "${a.note}"</span>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : `
              <span class="text-[10px] text-slate-400 block text-center">Cal: ${sub.ratingQuality || '-'} | Ase: ${sub.ratingCleanliness || '-'} | Ser: ${sub.ratingService || '-'}</span>
            `}
          </td>
          <td class="p-3 max-w-[200px]">
            <p class="truncate italic text-slate-600" title="${sub.comment || 'Sin comentario'}">
              "${sub.comment || 'Sin comentario'}"
            </p>
          </td>
          <td class="p-3 text-right whitespace-nowrap">
            ${isFiveStars ? `
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✅ 5★ a Google
              </span>
            ` : `
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                🛡️ Blindada (${sub.ratingOverall}★)
              </span>
            `}
            ${(sub.requestedContact === true || sub.requestedContact === 'true' || sub.requestedContact === 'SI' || sub.requestedContact === 'SÍ') ? `
              <span class="block text-[10px] text-rose-600 font-bold mt-1 animate-pulse">
                🚨 Solicita Contacto
              </span>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  },

  // Exportar a Excel Formateado Profesional (.xls)
  exportToExcel() {
    const list = this.getFilteredSubmissions();
    if (list.length === 0) {
      alert('No hay respuestas registradas bajo los filtros seleccionados para exportar.');
      return;
    }

    const rowsHtml = list.map((s, idx) => {
      const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short'
      }) : 'Reciente';

      const overall = parseInt(s.ratingOverall, 10);
      let ratingBg = '#f8fafc';
      let ratingColor = '#334155';
      if (overall === 5) {
        ratingBg = '#dcfce7'; // Verde suave
        ratingColor = '#166534';
      } else if (overall <= 3) {
        ratingBg = '#fee2e2'; // Rojo suave de alerta
        ratingColor = '#991b1b';
      }

      // Detalle de aspectos y notas sin comillas duplicadas
      let aspectsText = '';
      if (s.aspects && Array.isArray(s.aspects) && s.aspects.length > 0) {
        aspectsText = s.aspects.map(a => {
          const cleanNote = (a.note || '').replace(/^["']+|["']+$/g, '').trim();
          return `• <b>${a.label}:</b> ${a.rating}★ ${cleanNote ? `<i style="color:#b45309;">("${cleanNote}")</i>` : ''}`;
        }).join('<br>');
      } else {
        aspectsText = s.aspectsSummary || `Cal: ${s.ratingQuality || '-'} | Ase: ${s.ratingCleanliness || '-'} | Ser: ${s.ratingService || '-'}`;
      }

      const isWentToGoogle = (s.wentToGoogle === true || s.wentToGoogle === 'true' || s.wentToGoogle === 'SÍ (5★)' || overall === 5);
      const wentGoogleText = isWentToGoogle ? 'SÍ (5★ a Google Maps)' : 'NO (Blindada Interna)';
      const wentGoogleBg = isWentToGoogle ? '#ecfdf5' : '#fffbeb';
      const wentGoogleColor = isWentToGoogle ? '#047857' : '#b45309';

      const isRequestedContact = (s.requestedContact === true || s.requestedContact === 'true' || s.requestedContact === 'SI' || s.requestedContact === 'SÍ' || s.requestedContact === 'SÍ (Urgente)');
      const requestedContactText = isRequestedContact ? 'SÍ (Solicitó Contacto)' : 'No';
      const requestedContactBg = isRequestedContact ? '#ffe4e6' : '#ffffff';
      const requestedContactColor = isRequestedContact ? '#e11d48' : '#64748b';

      const cleanComment = (s.comment || '').replace(/^["']+|["']+$/g, '').trim() || 'Sin comentario';

      return `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">${idx + 1}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; font-family: monospace;">${dateStr}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; color: #1e293b;">${s.restaurantName || s.restaurantId || 'N/A'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: 500;">${s.customerName || 'Anónimo'}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; mso-number-format:'\\@';">${s.customerPhone || 'N/A'}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px;">${s.customerBirthday || 'N/A'}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; background-color: ${ratingBg}; color: ${ratingColor}; font-weight: bold; font-size: 13px;">
            ${overall} ★
          </td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">${aspectsText}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-style: italic; color: #475569;">"${cleanComment}"</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; background-color: ${wentGoogleBg}; color: ${wentGoogleColor}; font-weight: bold; font-size: 11px;">
            ${wentGoogleText}
          </td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; background-color: ${requestedContactBg}; color: ${requestedContactColor}; font-weight: bold; font-size: 11px;">
            ${requestedContactText}
          </td>
        </tr>
      `;
    }).join('');

    const template = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Informe de Encuestas</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th {
            background-color: #1e293b;
            color: #ffffff;
            font-weight: bold;
            text-align: center;
            border: 1px solid #0f172a;
            padding: 10px 8px;
            font-size: 11px;
            text-transform: uppercase;
          }
          td {
            font-size: 11px;
            vertical-align: middle;
          }
        </style>
      </head>
      <body>
        <div style="margin-bottom: 12px;">
          <h2 style="color: #1e293b; margin: 0; padding: 0; font-family: Calibri, sans-serif;">REPORTE DE SATISFACCIÓN Y AUDITORÍA DE CLIENTES</h2>
          <p style="color: #64748b; font-size: 11px; margin: 4px 0 10px 0; font-family: Calibri, sans-serif;">
            Generado el: ${new Date().toLocaleString('es-CO')} | Total de registros: ${list.length}
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 45px;">N°</th>
              <th style="width: 130px;">Fecha y Hora</th>
              <th style="width: 170px;">Restaurante</th>
              <th style="width: 150px;">Cliente</th>
              <th style="width: 120px;">WhatsApp</th>
              <th style="width: 90px;">Cumpleaños</th>
              <th style="width: 100px;">Calificación</th>
              <th style="width: 320px;">Aspectos y Observaciones</th>
              <th style="width: 250px;">Comentario General</th>
              <th style="width: 150px;">Destino</th>
              <th style="width: 140px;">Contacto Gerencial</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateFormatted = new Date().toISOString().slice(0, 10);
    link.download = `Reporte_Encuestas_Clientes_${dateFormatted}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Alias para mantener compatibilidad
  exportToCSV() {
    this.exportToExcel();
  },

  // Limpiar respuestas registradas de prueba
  clearTestSubmissions() {
    if (confirm('¿Estás seguro de que deseas borrar todas las respuestas registradas de prueba? (Esta acción no se puede deshacer)')) {
      window.StorageManager.clearSubmissions();
      this.renderStats();
      this.renderRestaurantsList();
      this.renderSubmissionsTable();
      alert('Respuestas de prueba eliminadas con éxito.');
    }
  }
};

window.AdminApp = AdminApp;

