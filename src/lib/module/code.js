/* eslint-disable */
// ================================================
// Teras Fried Chicken (TFC) - Main API Router
// ================================================
// ENDPOINTS:
//   GET  ?action=kpi                    -> dashboardModule.js -> getKPI
//   GET  ?action=tren                   -> dashboardModule.js -> getTren
//   GET  ?action=topmenu&bulan=April    -> dashboardModule.js -> getTopMenuBulanIni
//   GET  ?action=cashflow&bulan=March   -> cashflowModule.js  -> getCashflowBulanIni
//   GET  ?action=history&bulan=April    -> invoiceModule.js   -> getInvoiceHistoryBulanIni
//   GET  ?action=pricelist              -> pricelistModule.js -> getPricelist
//   GET  ?action=settings               -> settingsModule.js  -> getProfilToko
//   POST { action: "cashflow", ... }    -> cashflowModule.js  -> postCashflowTFC
//   POST { action: "settings", ... }    -> settingsModule.js  -> postProfilToko
//   POST { rows: [...] }                -> pesananModule.js   -> postPesananTFC
//                                             (pakai invoiceModule.js -> generateInvoiceId)
//
// Spreadsheet target (fix, satu untuk semua modul):
//   https://docs.google.com/spreadsheets/d/1tduQBKA0LykMkIaOBoO5hBmHpjm88XPthObcdXO1tcI
// Sheet yang dipakai:
//   - Pricelist         (master menu, belum dipakai modul API)
//   - Pesanan TFC       (pesananModule + invoiceModule + dashboard topmenu)
//   - Cashflow          (cashflowModule)
//   - Summary Monthly   (dashboardModule: KPI & Tren)
// ================================================

var SPREADSHEET_ID = "1tduQBKA0LykMkIaOBoO5hBmHpjm88XPthObcdXO1tcI";

// --- Main Handler ---
function doGet(e) {
  var action = e.parameter.action || "kpi";
  var output;

  if (action === "kpi") {
    output = getKPI(); // dari dashboardModule.js
  } else if (action === "tren") {
    output = getTren(); // dari dashboardModule.js
  } else if (action === "topmenu") {
    output = getTopMenuBulanIni(e.parameter.bulan); // dashboardModule.js
  } else if (action === "cashflow") {
    output = getCashflowBulanIni(e.parameter.bulan); // cashflowModule.js
  } else if (action === "history") {
    output = getInvoiceHistoryBulanIni(e.parameter.bulan); // invoiceModule.js
  } else if (action === "pricelist") {
    output = getPricelist(); // pricelistModule.js
  } else if (action === "settings") {
    output = getProfilToko(); // settingsModule.js
  } else {
    output = {
      status: "error",
      message:
        "Gunakan ?action=kpi, ?action=tren, ?action=topmenu&bulan=April, ?action=cashflow&bulan=March, ?action=history&bulan=April, atau ?action=pricelist",
    };
  }

  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// ================================================
// POST HANDLER - doPost (UNIFIED ROUTER)
// Routing berdasarkan field "action" pada body JSON:
//   action == "cashflow" -> postCashflowTFC
//   action == "order" / lainnya -> postPesananTFC (default)
// ================================================
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "";
    var output;

    if (action === "cashflow") {
      output = postCashflowTFC(data);
    } else if (action === "settings") {
      output = postProfilToko(data);
    } else {
      // Default: handler order/pesanan TFC
      output = postPesananTFC(data);
    }

    return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: "Gagal memproses request: " + err.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// ================================================
// Semua handler endpoint dipisah ke modul terpisah:
//   - dashboardModule.js -> getKPI, getTren, getTopMenuBulanIni
//   - cashflowModule.js  -> postCashflowTFC, getCashflowBulanIni
//   - pesananModule.js   -> postPesananTFC + konstanta sheet
//   - invoiceModule.js   -> generateInvoiceId, getInvoiceHistoryBulanIni
//   - pricelistModule.js -> getPricelist
//   - settingsModule.js  -> getProfilToko, postProfilToko
//
// Di Google Apps Script semua file .gs share global scope,
// jadi router doGet/doPost di atas bisa langsung memanggil
// fungsi-fungsi tersebut tanpa import.
// File utama ini hanya berisi: SPREADSHEET_ID, doGet, doPost.
// ================================================
