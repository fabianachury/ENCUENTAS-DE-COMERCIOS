// Lógica de la Encuesta del Cliente, Captura VIP y Embudo Inteligente

const SurveyApp = {
  restaurant: null,
  currentStep: 1,
  formData: {
    customerName: '',
    customerPhone: '',
    customerBirthday: '',
    ratingQuality: 5,
    ratingCleanliness: 5,
    ratingService: 5,
    ratingOverall: 5,
    comment: '',
    wentToGoogle: false,
    requestedContact: false
  },

  init() {
    this.loadRestaurant();
    this.renderHeader();
    this.renderDynamicAspects();
    this.setupEventListeners();
    this.showStep(1);
  },

  // Identificar el restaurante activo
  loadRestaurant() {
    const urlParams = new URLSearchParams(window.location.search);
    let slug = urlParams.get('r');

    if (!slug && window.location.hash) {
      const match = window.location.hash.match(/#\/r\/([^?&]+)/);
      if (match) slug = match[1];
    }

    this.restaurant = window.StorageManager.getRestaurant(slug || 'milhojas');

    // Aplicar variables de color de la marca
    document.documentElement.style.setProperty('--brand-primary', this.restaurant.primaryColor || '#b45309');
    document.documentElement.style.setProperty('--brand-accent', this.restaurant.accentColor || '#f59e0b');
  },

  renderHeader() {
    const logoEl = document.getElementById('restaurant-logo');
    const nameEl = document.getElementById('restaurant-name');
    const taglineEl = document.getElementById('restaurant-tagline');
    const rewardEl = document.getElementById('reward-text-display');

    if (logoEl) logoEl.src = this.restaurant.logo || 'https://cdn-icons-png.flaticon.com/512/992/992747.png';
    if (nameEl) nameEl.textContent = this.restaurant.name;
    if (taglineEl) taglineEl.textContent = this.restaurant.tagline || 'Tu satisfacción es lo primero';
    if (rewardEl) rewardEl.textContent = this.restaurant.rewardText || '¡Regístrate para recibir beneficios exclusivos!';
  },

  setupEventListeners() {
    // Paso 1: Formulario VIP
    const vipForm = document.getElementById('vip-form');
    if (vipForm) {
      vipForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('vip-name').value.trim();
        const phone = document.getElementById('vip-phone').value.trim();
        const birthDay = document.getElementById('birth-day').value;
        const birthMonth = document.getElementById('birth-month').value;
        const terms = document.getElementById('vip-terms').checked;

        if (!name) {
          alert('Por favor ingresa tu nombre.');
          return;
        }
        if (!phone || phone.length < 7) {
          alert('Por favor ingresa un número de WhatsApp válido.');
          return;
        }
        if (!birthDay || !birthMonth) {
          alert('Por favor selecciona el día y mes de tu cumpleaños.');
          return;
        }
        if (!terms) {
          alert('Debes autorizar el tratamiento de datos para recibir tus beneficios.');
          return;
        }

        this.formData.customerName = name;
        this.formData.customerPhone = phone;
        this.formData.customerBirthday = `${birthDay.padStart(2, '0')}/${birthMonth.padStart(2, '0')}`;

        this.showStep(2);
      });
    }

    // Paso 2: Selección de Estrellas Generales
    const starsContainer = document.getElementById('overall-stars-container');
    if (starsContainer) {
      const stars = starsContainer.querySelectorAll('.star-btn');
      stars.forEach(star => {
        star.addEventListener('click', (e) => {
          const val = parseInt(star.getAttribute('data-value'), 10);
          this.setOverallRating(val);
        });
      });
    }

    // Paso 2: Formulario de Encuesta
    const surveyForm = document.getElementById('survey-form');
    if (surveyForm) {
      surveyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        this.formData.comment = document.getElementById('survey-comment').value.trim();
        await this.submitSurvey();
      });
    }

    // Inicializar estrellas en 5 por defecto
    this.setOverallRating(5);
  },

  // Renderizar aspectos dinámicos configurados con su recuadro de observaciones
  renderDynamicAspects() {
    const container = document.getElementById('survey-dynamic-aspects-container');
    if (!container) return;

    const questions = (this.restaurant && this.restaurant.questions && this.restaurant.questions.length > 0)
      ? this.restaurant.questions
      : [
          { id: 'quality', label: 'Sabor y Calidad de la Comida / Producto', icon: '🍰' },
          { id: 'cleanliness', label: 'Aseo y Presentación de las Instalaciones', icon: '✨' },
          { id: 'service', label: 'Atención y Amabilidad del Personal', icon: '☕' }
        ];

    // Inicializar datos de aspectos
    this.formData.aspectsData = questions.map((q, idx) => ({
      id: q.id || `aspect_${idx + 1}`,
      label: q.label,
      rating: 5,
      note: ''
    }));

    const ratingLabels = {
      1: '1 - Malo',
      2: '2 - Regular',
      3: '3 - Aceptable',
      4: '4 - Bueno',
      5: '5 - Excelente'
    };

    container.innerHTML = questions.map((q, idx) => `
      <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm transition hover:border-slate-300">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span>${q.icon || '⭐'}</span> <span>${q.label}</span>
          </label>
          <span id="aspect-badge-${idx}" class="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            5 - Excelente
          </span>
        </div>

        <!-- Botones de Calificación 1 a 5 -->
        <div class="grid grid-cols-5 gap-1.5 text-center mb-2.5">
          <button type="button" data-aspect="${idx}" data-val="1" class="aspect-pill-${idx} rating-pill py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600">1</button>
          <button type="button" data-aspect="${idx}" data-val="2" class="aspect-pill-${idx} rating-pill py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600">2</button>
          <button type="button" data-aspect="${idx}" data-val="3" class="aspect-pill-${idx} rating-pill py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600">3</button>
          <button type="button" data-aspect="${idx}" data-val="4" class="aspect-pill-${idx} rating-pill py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600">4</button>
          <button type="button" data-aspect="${idx}" data-val="5" class="aspect-pill-${idx} rating-pill active-pill py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600">5</button>
        </div>

        <!-- Recuadro de Observación Específica por Ítem -->
        <div>
          <input type="text"
                 id="aspect-note-${idx}"
                 placeholder="¿Alguna observación sobre este punto? (Opcional)"
                 class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition">
        </div>
      </div>
    `).join('');

    // Asignar listeners a los botones y campos de texto
    questions.forEach((q, idx) => {
      const pills = container.querySelectorAll(`.aspect-pill-${idx}`);
      const badge = document.getElementById(`aspect-badge-${idx}`);
      const noteInput = document.getElementById(`aspect-note-${idx}`);

      pills.forEach(pill => {
        pill.addEventListener('click', () => {
          pills.forEach(p => p.classList.remove('active-pill'));
          pill.classList.add('active-pill');

          const val = parseInt(pill.getAttribute('data-val'), 10);
          this.formData.aspectsData[idx].rating = val;
          if (badge) badge.textContent = ratingLabels[val] || `${val} Estrellas`;
        });
      });

      if (noteInput) {
        noteInput.addEventListener('input', (e) => {
          this.formData.aspectsData[idx].note = e.target.value.trim();
        });
      }
    });
  },

  setOverallRating(value) {
    this.formData.ratingOverall = value;
    const starsContainer = document.getElementById('overall-stars-container');
    if (!starsContainer) return;

    const stars = starsContainer.querySelectorAll('.star-btn');
    const label = document.getElementById('overall-rating-label');

    stars.forEach(s => {
      const sVal = parseInt(s.getAttribute('data-value'), 10);
      if (sVal <= value) {
        s.classList.add('text-amber-400');
        s.classList.remove('text-slate-300');
      } else {
        s.classList.remove('text-amber-400');
        s.classList.add('text-slate-300');
      }
    });

    const labels = {
      5: '⭐ ¡Excelente experiencia!',
      4: '😊 Muy buena experiencia',
      3: '😐 Regular / Puede mejorar',
      2: '🙁 Insatisfecho',
      1: '😡 Muy mala experiencia'
    };
    if (label) label.textContent = labels[value] || '';
  },

  showStep(stepNumber) {
    this.currentStep = stepNumber;
    ['step-1', 'step-2', 'step-3'].forEach((id, idx) => {
      const el = document.getElementById(id);
      if (el) {
        if (idx + 1 === stepNumber) {
          el.classList.remove('hidden');
          el.classList.add('animate-fadeIn');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    // Desplazar suavemente arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  async submitSurvey() {
    const submitBtn = document.getElementById('submit-survey-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg> Guardando opinión...`;
    }

    const aspectsData = this.formData.aspectsData || [];

    // Construir resumen legible de aspectos y observaciones
    const aspectsSummary = aspectsData.map(a => {
      const noteStr = a.note ? ` ("${a.note}")` : '';
      return `${a.label}: ${a.rating}★${noteStr}`;
    }).join(' | ');

    // Campos retrocompatibles
    const ratingQuality = aspectsData[0] ? aspectsData[0].rating : 5;
    const ratingCleanliness = aspectsData[1] ? aspectsData[1].rating : 5;
    const ratingService = aspectsData[2] ? aspectsData[2].rating : 5;

    const isFiveStars = (parseInt(this.formData.ratingOverall, 10) === 5);
    this.formData.wentToGoogle = isFiveStars;

    const payload = {
      ...this.formData,
      restaurantId: this.restaurant.id,
      restaurantName: this.restaurant.name,
      sheetsWebhookUrl: this.restaurant.sheetsWebhookUrl || '',
      wentToGoogle: isFiveStars,
      requestedContact: false,
      aspects: aspectsData,
      aspectsSummary,
      ratingQuality,
      ratingCleanliness,
      ratingService
    };

    // Guardar local y enviar a Google Sheets
    const saved = await window.StorageManager.saveSubmission(payload);
    this.currentSubmissionId = saved ? saved.id : null;

    // Mostrar Paso 3: Bifurcación Inteligente
    this.showStep(3);
    this.renderResultBranch();
  },

  triggerEmojiCelebration() {
    const emojis = ['🎉', '⭐', '🎂', '✨', '🍰', '💛'];
    for (let i = 0; i < 20; i++) {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.position = 'fixed';
      el.style.left = Math.random() * 90 + 'vw';
      el.style.top = '-20px';
      el.style.fontSize = (Math.random() * 20 + 20) + 'px';
      el.style.zIndex = '9999';
      el.style.pointerEvents = 'none';
      el.style.transition = 'all 2s ease-out';
      document.body.appendChild(el);

      setTimeout(() => {
        el.style.top = (window.innerHeight + 50) + 'px';
        el.style.transform = `rotate(${Math.random() * 360}deg) scale(0.6)`;
        el.style.opacity = '0';
      }, 50);

      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 2200);
    }
  },

  renderResultBranch() {
    const isFiveStars = this.formData.ratingOverall === 5;
    const branchSuccess = document.getElementById('branch-google-success');
    const branchInternal = document.getElementById('branch-internal-feedback');

    if (isFiveStars) {
      if (branchSuccess) branchSuccess.classList.remove('hidden');
      if (branchInternal) branchInternal.classList.add('hidden');

      // Lanzar confeti festivo
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        // Fallback visual offline
        this.triggerEmojiCelebration();
      }

      // Nombre y comentario
      const clientNameEl = document.getElementById('success-client-name');
      const commentPreview = document.getElementById('comment-preview-box');
      const commentText = document.getElementById('comment-preview-text');

      if (clientNameEl) clientNameEl.textContent = this.formData.customerName;

      // Mostrar u ocultar Gratificación Inmediata si el restaurante la configuró
      const immediateCard = document.getElementById('immediate-reward-card');
      const immediateText = document.getElementById('immediate-reward-display');

      if (this.restaurant && this.restaurant.hasImmediateReward && this.restaurant.immediateRewardText && this.restaurant.immediateRewardText.trim()) {
        if (immediateCard) immediateCard.classList.remove('hidden');
        if (immediateText) immediateText.textContent = this.restaurant.immediateRewardText.trim();
      } else {
        if (immediateCard) immediateCard.classList.add('hidden');
      }

      if (this.formData.comment) {
        if (commentPreview) commentPreview.classList.remove('hidden');
        if (commentText) commentText.textContent = `"${this.formData.comment}"`;
      } else {
        if (commentPreview) commentPreview.classList.add('hidden');
      }

      // Botón de Google Maps con copia de texto
      const copyGoogleBtn = document.getElementById('copy-and-google-btn');
      if (copyGoogleBtn) {
        copyGoogleBtn.onclick = () => {
          if (this.formData.comment) {
            navigator.clipboard.writeText(this.formData.comment).then(() => {
              copyGoogleBtn.innerHTML = '✅ ¡Comentario copiado! Abriendo Google Maps...';
            }).catch(() => {
              console.log('Clipboard fallback');
            });
          }

          setTimeout(() => {
            window.open(this.restaurant.googleMapsUrl, '_blank');
          }, 400);
        };
      }

    } else {
      // 1 a 4 estrellas: Soporte interno, empatía, NO Google
      if (branchSuccess) branchSuccess.classList.add('hidden');
      if (branchInternal) branchInternal.classList.remove('hidden');

      const clientNameInternal = document.getElementById('internal-client-name');
      if (clientNameInternal) clientNameInternal.textContent = this.formData.customerName;

      const restNameInternal = document.getElementById('internal-rest-name');
      if (restNameInternal) restNameInternal.textContent = this.restaurant.name;

      // Botones de solicitud de contacto
      const contactYesBtn = document.getElementById('contact-yes-btn');
      const contactNoBtn = document.getElementById('contact-no-btn');
      const contactFeedbackEl = document.getElementById('contact-feedback-msg');

      if (contactYesBtn) {
        contactYesBtn.onclick = async () => {
          this.formData.requestedContact = true;
          contactYesBtn.parentElement.classList.add('hidden');
          if (contactFeedbackEl) {
            contactFeedbackEl.classList.remove('hidden');
            contactFeedbackEl.textContent = '✅ Solicitud enviada. La administración se comunicará contigo vía WhatsApp en breve.';
          }
          // Actualizar envío existente en almacenamiento y Google Sheets
          await window.StorageManager.updateSubmission(this.currentSubmissionId, {
            requestedContact: true
          });
        };
      }

      if (contactNoBtn) {
        contactNoBtn.onclick = () => {
          contactNoBtn.parentElement.classList.add('hidden');
          if (contactFeedbackEl) {
            contactFeedbackEl.classList.remove('hidden');
            contactFeedbackEl.textContent = 'Agradecemos tu honestidad. Trabajaremos en mejorar para tu próxima visita.';
          }
        };
      }
    }
  }
};

window.SurveyApp = SurveyApp;
