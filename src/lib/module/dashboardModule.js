/* eslint-disable */
// ================================================
// Dashboard Module - Teras Fried Chicken (TFC)
// Sheet: Summary Monthly | Tabel: Laporan Bulanan
// ================================================
// Berisi handler untuk endpoint:
//   ?action=kpi                  -> KPI Scorecard bulan berjalan
//                                   (sheet "Summary Monthly")
//   ?action=tren                 -> Data tren bulanan untuk chart
//                                   (sheet "Summary Monthly")
//   ?action=topmenu&bulan=April  -> Top 5 menu terlaris per bulan
//                                   (sheet "Pesanan TFC")
//
// Semua endpoint baca dari spreadsheet yang sama (SPREADSHEET_ID),
// hanya nama sheet-nya yang beda.
//
// Catatan: file ini menggunakan global var SPREADSHEET_ID
// yang dideklarasikan di code.js (file utama).
// Di Google Apps Script, semua file .gs dalam satu project
// share global scope, jadi tidak perlu import/export.
// eslint-disable diperlukan karena getKPI/getTren/getTopMenuBulanIni
// dipanggil dari file lain via global scope (bukan import).
// ================================================

var DASHBOARD_SHEET_NAME = "Summary Monthly";
var DASHBOARD_PESANAN_SHEET_NAME = "Pesanan TFC";

var BULAN_NAMES_DASH = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// --- Helper: Baca semua baris data ---
// Sheet "Summary Monthly" schema:
//   A=Bulan | B=Pendapatan | C=HPP | D=Margin | E=Pengeluaran Operasional
//   F=Pengeluaran Bahan Baku | G=Sisa Bahan Baku | H=Profit
function readRows() {
  var sheet =
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      DASHBOARD_SHEET_NAME,
    );
  return sheet.getRange(2, 1, 12, 8).getValues();
}

// ================================================
// ENDPOINT 1: GET ?action=kpi
// KPI Scorecard bulan berjalan
// ================================================
function getKPI() {
  var rows = readRows();
  var bulanBerjalan = null;

  // Cari bulan terakhir yang punya data (pendapatan > 0)
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][1] > 0) bulanBerjalan = rows[i];
  }

  if (!bulanBerjalan) {
    return { status: "error", message: "Belum ada data pendapatan di sheet." };
  }

  var pendapatan = Number(bulanBerjalan[1]) || 0;
  var hpp = Number(bulanBerjalan[2]) || 0;
  var margin = Number(bulanBerjalan[3]) || 0;
  var opex = Number(bulanBerjalan[4]) || 0;
  var bahanBaku = Number(bulanBerjalan[5]) || 0;
  var profit = Number(bulanBerjalan[7]) || 0;

  var grossMarginPct =
    pendapatan > 0 ? Math.round((margin / pendapatan) * 10000) / 100 : 0;

  var totalPengeluaran = opex + bahanBaku;

  return {
    status: "success",
    action: "kpi",
    bulan: bulanBerjalan[0],
    scorecard: {
      totalPendapatan: pendapatan,
      totalProfit: profit,
      grossMarginPersen: grossMarginPct,
      totalPengeluaran: totalPengeluaran,
      rincianPengeluaran: {
        operasional: opex,
        bahanBaku: bahanBaku,
      },
      statusProfit: profit > 0 ? "PROFIT" : "RUGI",
      // Detail tambahan (tidak dipakai frontend saat ini tapi berguna untuk debug/extension)
      hpp: hpp,
      margin: margin,
    },
  };
}

// ================================================
// ENDPOINT: GET ?action=topmenu&bulan=April
// Top 5 menu terlaris bulan tertentu, diambil dari
// sheet "Pesanan TFC" di spreadsheet TFC
// (SPREADSHEET_ID yang sama dengan KPI/Tren).
// Schema sheet Pesanan TFC:
//   A=ID | B=Tanggal | C=Bulan | D=Pesanan | E=Jenis | F=Size
//   G=Qty | H=Pembayaran | I=Harga Satuan | J=Harga Total | ...
// ================================================
function getTopMenuBulanIni(bulanParam) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
    DASHBOARD_PESANAN_SHEET_NAME,
  );

  if (!sheet) {
    return {
      status: "error",
      message:
        'Sheet "' + DASHBOARD_PESANAN_SHEET_NAME + '" tidak ditemukan.',
    };
  }

  var now = new Date();
  var bulanIni = bulanParam || BULAN_NAMES_DASH[now.getMonth()];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      status: "success",
      action: "topmenu",
      bulan: bulanIni,
      totalMenu: 0,
      data: [],
    };
  }

  // Baca 10 kolom (A..J): kita butuh C (Bulan), D (Pesanan), G (Qty), J (Harga Total)
  var allData = sheet.getRange(2, 1, lastRow - 1, 10).getValues();

  var menuMap = {};
  for (var i = 0; i < allData.length; i++) {
    var row = allData[i];
    var bulanRow = row[2] ? row[2].toString().trim() : "";
    if (bulanRow !== bulanIni) continue;

    var nama = row[3] ? row[3].toString().trim() : "";
    if (!nama) continue;

    var qty = Number(row[6]) || 0;
    var hargaTotal = Number(row[9]) || 0;

    if (!menuMap[nama]) {
      menuMap[nama] = {
        namaMenu: nama,
        jumlahOrderan: 0,
        pendapatan: 0,
      };
    }
    menuMap[nama].jumlahOrderan += qty;
    menuMap[nama].pendapatan += hargaTotal;
  }

  // Konversi ke array, sort by jumlahOrderan desc, ambil top 5
  var list = [];
  for (var key in menuMap) {
    list.push(menuMap[key]);
  }
  list.sort(function (a, b) {
    if (b.jumlahOrderan !== a.jumlahOrderan) {
      return b.jumlahOrderan - a.jumlahOrderan;
    }
    return b.pendapatan - a.pendapatan;
  });

  var top5 = list.slice(0, 5);

  return {
    status: "success",
    action: "topmenu",
    bulan: bulanIni,
    totalMenu: list.length,
    data: top5,
  };
}

// ================================================
// ENDPOINT 2: GET ?action=tren
// Data tren bulanan: Pendapatan, HPP, Profit
// ================================================
function getTren() {
  var rows = readRows();
  var labels = [];
  var pendapatanSeries = [];
  var hppSeries = [];
  var profitSeries = [];

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var bulan = row[0];
    var pendapatan = row[1] || 0;
    var hpp = row[2] || 0;
    var profit = row[7] || 0;
    var hasData = pendapatan > 0;

    labels.push(bulan);
    pendapatanSeries.push(hasData ? pendapatan : null);
    hppSeries.push(hasData ? hpp : null);
    profitSeries.push(hasData ? profit : null);
  }

  return {
    status: "success",
    action: "tren",
    chartData: {
      labels: labels,
      datasets: [
        { label: "Pendapatan", data: pendapatanSeries, color: "#4CAF50" },
        { label: "HPP", data: hppSeries, color: "#FF9800" },
        { label: "Profit", data: profitSeries, color: "#2196F3" },
      ],
    },
    catatan: "null = bulan belum ada data. Profit negatif = RUGI.",
  };
}
