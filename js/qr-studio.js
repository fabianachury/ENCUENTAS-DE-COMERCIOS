// Estudio de Generación de Códigos QR y Habladores de Mesa Imprimibles

const QRStudio = {
  currentRestaurant: null,
  qrCanvas: null,

  openStudio(restaurantId) {
    this.currentRestaurant = window.StorageManager.getRestaurant(restaurantId);
    if (!this.currentRestaurant) return;

    const modal = document.getElementById('qr-studio-modal');
    if (modal) modal.classList.remove('hidden');

    this.renderStudio();
  },

  closeStudio() {
    const modal = document.getElementById('qr-studio-modal');
    if (modal) modal.classList.add('hidden');
  },

  renderStudio() {
    const r = this.currentRestaurant;
    
    // Configurar URL destino (soporta file://, localhost y dominios reales)
    const baseUrlInput = document.getElementById('qr-base-url-input');
    let origin = window.location.origin;
    if (!origin || origin === 'null' || window.location.protocol === 'file:') {
      origin = 'http://localhost:3000';
    }
    const defaultUrl = `${origin}/?r=${r.id}`;
    if (baseUrlInput) {
      if (!baseUrlInput.value || baseUrlInput.dataset.restId !== r.id) {
        baseUrlInput.value = defaultUrl;
        baseUrlInput.dataset.restId = r.id;
      }
    }

    const targetUrl = baseUrlInput ? baseUrlInput.value : defaultUrl;

    // Generar el código QR (Vista previa compacta y nítida)
    const qrContainer = document.getElementById('qr-preview-canvas');
    if (qrContainer) {
      qrContainer.innerHTML = '';
      const qr = new window.QRCode(qrContainer, {
        text: targetUrl,
        width: 170,
        height: 170,
        colorDark: r.primaryColor || '#000000',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H
      });
      this.qrCanvas = qrContainer.querySelector('canvas');
    }

    // Actualizar vista previa del Hablador de Mesa
    this.updateTableTentPreview(targetUrl);
  },

  updateTableTentPreview(targetUrl) {
    const r = this.currentRestaurant;
    const tentLogo = document.getElementById('tent-logo');
    const tentRestName = document.getElementById('tent-rest-name');
    const tentReward = document.getElementById('tent-reward-text');
    const tentQrTarget = document.getElementById('tent-qr-container');

    if (tentLogo) tentLogo.src = r.logo || 'https://cdn-icons-png.flaticon.com/512/992/992747.png';
    if (tentRestName) tentRestName.textContent = r.name;
    if (tentReward) tentReward.textContent = r.rewardText || '¡Regístrate para recibir beneficios exclusivos en tu cumpleaños!';

    if (tentQrTarget) {
      tentQrTarget.innerHTML = '';
      new window.QRCode(tentQrTarget, {
        text: targetUrl,
        width: 145,
        height: 145,
        colorDark: '#1e293b',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H
      });
    }

    // Aplicar color en el borde del hablador
    const tentCard = document.getElementById('printable-table-tent');
    if (tentCard) {
      tentCard.style.borderColor = r.primaryColor || '#b45309';
    }
  },

  downloadQR() {
    // Generar canvas de alta resolución (600x600 px) para impresión profesional
    const baseUrlInput = document.getElementById('qr-base-url-input');
    const targetUrl = baseUrlInput ? baseUrlInput.value : `${window.location.origin}/?r=${this.currentRestaurant.id}`;

    const tempDiv = document.createElement('div');
    const qr = new window.QRCode(tempDiv, {
      text: targetUrl,
      width: 600,
      height: 600,
      colorDark: this.currentRestaurant.primaryColor || '#000000',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.H
    });

    const canvas = tempDiv.querySelector('canvas');
    if (!canvas) {
      alert('Error generando QR en alta resolución.');
      return;
    }

    // Descargar imagen PNG de alta resolución
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR_${this.currentRestaurant.id}_AltaResolucion.png`;
    link.href = imageUri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  printTableTent() {
    // Abre el diálogo de impresión con el hablador de mesa optimizado
    window.print();
  }
};

window.QRStudio = QRStudio;
