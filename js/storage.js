// Gestión de datos, almacenamiento local y multi-restaurante

const DEFAULT_RESTAURANTS = [
  {
    id: 'milhojas',
    name: 'Pastelería & Café Milhojas',
    tagline: 'Tradición artesanal y momentos dulces',
    logo: 'https://cdn-icons-png.flaticon.com/512/992/992747.png',
    primaryColor: '#b45309', // Caramelo / Miel
    accentColor: '#f59e0b',
    googleMapsUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    rewardText: '🎁 ¡Postre artesanal de cortesía en tu semana de cumpleaños y beneficios VIP exclusivos!',
    hasImmediateReward: true,
    immediateRewardText: '☕ Muestra tu reseña al mesero y recibe hoy un café espresso de cortesía en tu mesa',
    sheetsWebhookUrl: '',
    whatsappContact: '+573001234567',
    questions: [
      { id: 'quality', label: 'Sabor y Calidad de la Pastelería', icon: '🍰' },
      { id: 'cleanliness', label: 'Aseo y Ambiente del Café', icon: '✨' },
      { id: 'service', label: 'Atención y Rapidez del Personal', icon: '☕' }
    ]
  },
  {
    id: 'burger-station',
    name: 'Burger & Smoke Station',
    tagline: 'Hamburguesas artesanales al carbón',
    logo: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
    primaryColor: '#dc2626', // Rojo fuego
    accentColor: '#f97316',
    googleMapsUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    rewardText: '🍔 ¡Combo 2x1 en tu cumpleaños y papas rústicas gratis en tu próxima compra!',
    hasImmediateReward: true,
    immediateRewardText: '🍟 Muestra tu reseña al mesero y recibe hoy una porción de papas rústicas de cortesía',
    sheetsWebhookUrl: '',
    whatsappContact: '+573109876543',
    questions: [
      { id: 'quality', label: 'Término de la Carne y Sabor', icon: '🍔' },
      { id: 'cleanliness', label: 'Limpieza y Música del Local', icon: '🎸' },
      { id: 'service', label: 'Velocidad de Entrega y Servicio', icon: '⚡' }
    ]
  }
];

const STORAGE_KEYS = {
  RESTAURANTS: 'qr_restaurants_config_v1',
  SUBMISSIONS: 'qr_submissions_cache_v1'
};

const StorageManager = {
  // Obtener lista completa de restaurantes
  getRestaurants() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error al leer de localStorage, usando predeterminados:', e);
    }
    // Si no hay datos, inicializamos con los predeterminados
    this.saveRestaurants(DEFAULT_RESTAURANTS);
    return DEFAULT_RESTAURANTS;
  },

  // Guardar lista completa
  saveRestaurants(restaurants) {
    try {
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
    } catch (e) {
      console.error('Error guardando restaurantes:', e);
    }
  },

  // Obtener un restaurante por slug / id
  getRestaurant(id) {
    const list = this.getRestaurants();
    return list.find(r => r.id.toLowerCase() === (id || '').toLowerCase()) || list[0];
  },

  // Guardar o actualizar un restaurante individual
  upsertRestaurant(restaurantData) {
    const list = this.getRestaurants();
    const index = list.findIndex(r => r.id.toLowerCase() === restaurantData.id.toLowerCase());
    
    if (index >= 0) {
      list[index] = { ...list[index], ...restaurantData };
    } else {
      list.push(restaurantData);
    }
    this.saveRestaurants(list);
    return list;
  },

  // Eliminar restaurante
  deleteRestaurant(id) {
    let list = this.getRestaurants();
    list = list.filter(r => r.id.toLowerCase() !== id.toLowerCase());
    this.saveRestaurants(list);
    return list;
  },

  // Obtener todas las respuestas registradas localmente (con autoreparación de datos de prueba)
  getSubmissions(restaurantId = null) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      let list = stored ? JSON.parse(stored) : [];

      // Autocorrección: si la calificación general fue 5 estrellas, el destino siempre fue Google Maps
      let modified = false;
      list = list.map(s => {
        if (parseInt(s.ratingOverall, 10) === 5 && !s.wentToGoogle) {
          s.wentToGoogle = true;
          modified = true;
        }
        return s;
      });
      if (modified) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
      }

      if (!restaurantId) return list;
      return list.filter(s => s.restaurantId.toLowerCase() === restaurantId.toLowerCase());
    } catch (e) {
      return [];
    }
  },

  // Actualizar una respuesta existente (ej. cuando el cliente solicita contacto)
  async updateSubmission(id, patch) {
    try {
      const list = this.getSubmissions();
      // Si no hay id, actualizar la más reciente
      const index = id ? list.findIndex(s => s.id === id) : 0;
      if (index >= 0 && list[index]) {
        list[index] = { ...list[index], ...patch };
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));

        // Si hay webhook de Google Sheets, enviar actualización
        if (list[index].sheetsWebhookUrl && list[index].sheetsWebhookUrl.trim().startsWith('http')) {
          try {
            await fetch(list[index].sheetsWebhookUrl.trim(), {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(list[index])
            });
          } catch (e) {}
        }
        return list[index];
      }
    } catch (e) {
      console.error('Error actualizando respuesta:', e);
    }
  },

  // Eliminar respuestas registradas (para pruebas o limpieza)
  clearSubmissions(restaurantId = null) {
    if (!restaurantId) {
      localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    } else {
      let list = this.getSubmissions();
      list = list.filter(s => s.restaurantId.toLowerCase() !== restaurantId.toLowerCase());
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
    }
  },

  // Guardar respuesta y enviarla a Google Sheets
  async saveSubmission(payload) {
    // 1. Guardar en memoria local primero (garantiza cero pérdida de datos)
    try {
      const list = this.getSubmissions();
      payload.id = 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      payload.createdAt = new Date().toISOString();
      list.unshift(payload);
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
    } catch (e) {
      console.error('Error guardando en caché local:', e);
    }

    // 2. Enviar a Google Sheets si hay webhook configurado
    if (payload.sheetsWebhookUrl && payload.sheetsWebhookUrl.trim().startsWith('http')) {
      try {
        await fetch(payload.sheetsWebhookUrl.trim(), {
          method: 'POST',
          mode: 'no-cors', // Evita problemas de CORS con Google Apps Script
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        console.log('✅ Enviado a Google Sheets exitosamente');
      } catch (err) {
        console.warn('⚠️ Fallo el envío directo a Google Sheets (queda respaldado localmente):', err);
      }
    }

    return payload;
  },

  // Estadísticas globales para el panel de administración
  getGlobalStats() {
    const submissions = this.getSubmissions();
    const currentMonth = new Date().getMonth() + 1; // 1 - 12

    let totalSurveys = submissions.length;
    let fiveStarCount = 0;
    let lowStarCount = 0;
    let birthdayThisMonth = 0;

    submissions.forEach(sub => {
      const rating = parseInt(sub.ratingOverall, 10);
      if (rating === 5) fiveStarCount++;
      if (rating <= 4) lowStarCount++;

      if (sub.customerBirthday) {
        const parts = sub.customerBirthday.split('/');
        if (parts.length >= 2) {
          const month = parseInt(parts[1], 10);
          if (month === currentMonth) birthdayThisMonth++;
        }
      }
    });

    return {
      totalSurveys,
      fiveStarCount,
      fiveStarPercent: totalSurveys > 0 ? Math.round((fiveStarCount / totalSurveys) * 100) : 0,
      lowStarCount,
      birthdayThisMonth
    };
  }
};

window.StorageManager = StorageManager;

