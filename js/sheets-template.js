// Plantilla y generador del script oficial de Google Apps Script
// para conectar la aplicación web con Google Sheets sin costo alguno.

const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================
 * CONECTOR OFICIAL: QR ENCUESTAS & REPUTACIÓN A GOOGLE SHEETS
 * ============================================================
 * Este script recibe automáticamente las encuestas y registros
 * de los clientes y los guarda en tiempo real en esta hoja.
 *
 * INSTRUCCIONES:
 * 1. Pega este código completo en: Extensiones > Apps Script.
 * 2. Clic en el botón "Implementar" (arriba a la derecha) > "Nueva implementación".
 * 3. Selecciona tipo: "Aplicación web".
 * 4. Configura:
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone)
 * 5. Clic en "Implementar", autoriza los permisos y COPIA la "URL de la aplicación web".
 * 6. Pega esa URL en el Panel de Administración de tu sistema QR.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Encuestas");

    // Si la hoja "Encuestas" no existe, la creamos
    if (!sheet) {
      sheet = ss.insertSheet("Encuestas");
    }

    // Si la hoja está vacía, creamos los encabezados formateados
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Fecha y Hora",
        "Restaurante",
        "Nombre del Cliente",
        "WhatsApp / Celular",
        "Cumpleaños (DD/MM)",
        "Calificación General",
        "Detalle Aspectos y Observaciones",
        "Comentario General",
        "¿Fue a Google Maps?",
        "¿Solicita Contacto Gerencial?"
      ];

      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]);
      headerRange.setBackground("#2c3e50");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Leer los datos recibidos
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    var timestamp = new Date();
    var formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    var row = [
      formattedDate,
      data.restaurantName || data.restaurantId || "Sin Nombre",
      data.customerName || "Anónimo",
      data.customerPhone || "N/A",
      data.customerBirthday || "N/A",
      data.ratingOverall || "-",
      data.aspectsSummary || ("Cal: " + (data.ratingQuality || "-") + " | Ase: " + (data.ratingCleanliness || "-") + " | Ser: " + (data.ratingService || "-")),
      data.comment || "Sin comentario",
      data.wentToGoogle ? "SÍ (5★)" : "NO (Interno)",
      data.requestedContact ? "SÍ (Urgente)" : "No"
    ];

    sheet.appendRow(row);

    var lastRow = sheet.getLastRow();
    var overallRating = parseInt(data.ratingOverall, 10);

    // Formato condicional visual rápido
    if (overallRating === 5) {
      sheet.getRange(lastRow, 6).setBackground("#d4edda").setFontColor("#155724"); // Verde suave
    } else if (overallRating <= 3) {
      sheet.getRange(lastRow, 6).setBackground("#f8d7da").setFontColor("#721c24"); // Rojo suave de alerta
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Encuesta guardada con éxito en Google Sheets"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Conector activo y listo para recibir encuestas"
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

window.GOOGLE_APPS_SCRIPT_CODE = GOOGLE_APPS_SCRIPT_CODE;

