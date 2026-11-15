# 🌟 Sistema Multi-Restaurante de Encuestas QR, Embudo Inteligente para Google Maps & CRM de Cumpleaños

Plataforma integral diseñada para restaurantes, cafeterías y comercios gastronómicos para:
1. **Blindar la reputación:** Filtrar y desviar reseñas negativas en privado sin que lleguen a Google Maps.
2. **Multiplicar reseñas de 5 estrellas:** Facilitar que clientes satisfechos copien su reseña y califiquen en Google Maps en 2 toques.
3. **Captura de base de datos VIP & Cumpleaños:** Registrar Nombre, WhatsApp, Cumpleaños y autorización legal (Habeas Data).
4. **Conexión en tiempo real a Google Sheets:** 100% gratuito, sin necesidad de APIs pagas ni bases de datos complejas.
5. **Estudio de Códigos QR y Habladores de Mesa imprimibles:** Generación instantánea en alta resolución lista para imprimir en acrílicos.

---

## 🚀 Inicio Rápido

### Opción 1: Servidor Local (Recomendado)
Abre una terminal en esta carpeta y ejecuta:
```bash
npm start
```
Luego abre tu navegador en:
* **Vista Cliente:** `http://localhost:3000/?r=milhojas`
* **Panel de Administración:** `http://localhost:3000/?admin=true`

### Opción 2: Abrir directamente sin servidor
Haz doble clic sobre el archivo `index.html` para abrirlo directamente en Google Chrome, Edge o Safari.

---

## 📱 Flujo del Cliente (La Magia del Embudo)

```
[Cliente escanea QR en la mesa]
                │
                ▼
      [Paso 1: Registro VIP]
  (Nombre, WhatsApp, Cumpleaños DD/MM,
      Consentimiento Habeas Data)
                │
                ▼
      [Paso 2: Encuesta Rápida]
   (Calidad, Aseo, Atención, 1-5★,
             Comentario)
                │
                ▼
      [Paso 3: Bifurcación]
         /              \
        /                \
  [5 Estrellas]      [1 a 4 Estrellas]
        │                     │
        ▼                     ▼
• Fiesta de Confeti 🎉   • Mensaje empático
• Copia comentario al    • Guardado interno en privado
  portapapeles           • Alerta a gerencia
• Abre Google Maps en 1  • Cero enlaces públicos
  clic para pegar
```

---

## ⚙️ Panel de Administración SuperAdmin

Desde `http://localhost:3000/?admin=true` podrás:
* **Crear nuevos restaurantes:** Asignar identificador único (`/r/nombre-restaurante`), logo, colores de marca, preguntas personalizadas y gancho promocional.
* **Estudio QR:** Descargar el código QR en PNG de alta calidad.
* **Hablador de Mesa Imprimible:** Vista previa en tamaño estándar (10x15 cm para acrílico de mesa) con botón de impresión directa (`Ctrl + P`).
* **Conector Google Sheets:** Obtener el código de Google Apps Script listo para copiar y pegar.
* **Métricas en tiempo real:** Encuestas totales, tasa de 5 estrellas, quejas blindadas y cumpleañeros del mes actual.

---

## 📊 Conexión con Google Sheets (2 Minutos)

1. Abre [Google Sheets](https://sheets.new) y crea una hoja en blanco.
2. En el menú superior ve a: **Extensiones → Apps Script**.
3. Borra el código existente y pega el código del conector (disponible en el botón **"📜 Conector Google Sheets"** del panel admin).
4. Clic en **Implementar → Nueva implementación**.
5. Selecciona tipo: **Aplicación web**.
   - Ejecutar como: **Yo** (tu cuenta).
   - Quién tiene acceso: **Cualquier usuario** (*Anyone*).
6. Clic en **Implementar**, concede los permisos y **copia la URL de la aplicación web**.
7. Pega esa URL en el campo Webhook del restaurante en el panel de administración. ¡Listo! Todas las respuestas entrarán automáticamente fila por fila.

---

## 💼 Cómo Comercializar este Servicio (Modelo de Negocio)

* **Plan Blindaje Básico:** $15 – $25 USD / mes (QR personalizado + filtro de reseñas + Google Sheets).
* **Plan Pro / Fidelización:** $35 – $50 USD / mes (Alertas WhatsApp + Lista mensual de cumpleañeros + Reporte mensual de servicio).
* **Costo de Operación para ti:** $0 USD (funciona con Google Sheets y hosting gratuito en Vercel, Netlify o GitHub Pages). Margen de ganancia superior al 95%.

