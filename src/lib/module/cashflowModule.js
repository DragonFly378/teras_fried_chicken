/* eslint-disable no-unused-vars */
// ================================================
// Cashflow Module - Teras Fried Chicken (TFC)
// Sheet: Cashflow | Spreadsheet: TFC (SPREADSHEET_ID)
// ================================================
// Berisi handler untuk:
//   POST { action: "cashflow", ... }   -> postCashflowTFC
//   GET  ?action=cashflow&bulan=March  -> getCashflowBulanIni
//
// Kolom sheet Cashflow:
//   A=Tanggal | B=Bulan | C=Pemasukan | D=Pengeluaran | E=Post | F=Keterangan
//
// Catatan: file ini menggunakan global var SPREADSHEET_ID
// yang dideklarasikan di code.js (file utama).
// ================================================

var CASHFLOW_SHEET_NAME = "Cashflow";

var BULAN_NAMES = [
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

// ================================================
// POST: action=cashflow
// Menambahkan baris baru ke sheet Cashflow
// Body JSON:
// {
//   "action"      : "cashflow",
//   "tanggal"     : "2026-03-30",   // format YYYY-MM-DD atau DD/MM/YYYY
//   "bulan"       : "March",        // opsional, otomatis dari tanggal jika kosong
//   "pemasukan"   : 0,              // angka, 0 jika pengeluaran
//   "pengeluaran" : 150000,         // angka, 0 jika pemasukan
//   "post"        : "Bahan Baku",   // kategori post
//   "keterangan"  : "Restock kopi" // deskripsi transaksi
// }
// ================================================
function postCashflowTFC(data) {
  // Validasi field wajib
  if (!data.tanggal) {
    return { status: "error", message: 'Field "tanggal" wajib diisi.' };
  }
  if (data.pemasukan === undefined && data.pengeluaran === undefined) {
    return {
      status: "error",
      message: 'Field "pemasukan" atau "pengeluaran" wajib diisi.',
    };
  }
  if (!data.post) {
    return { status: "error", message: 'Field "post" wajib diisi.' };
  }

  var sheet =
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(CASHFLOW_SHEET_NAME);
  if (!sheet) {
    return { status: "error", message: 'Sheet "Cashflow" tidak ditemukan.' };
  }

  // Parse tanggal
  var tanggalRaw = data.tanggal;
  var tanggalObj = new Date(tanggalRaw);
  var tanggalFormatted = tanggalObj;

  // Tentukan bulan dari tanggal jika tidak disediakan
  var bulan = data.bulan || BULAN_NAMES[tanggalObj.getMonth()];

  var pemasukan = Number(data.pemasukan) || 0;
  var pengeluaran = Number(data.pengeluaran) || 0;
  var post = data.post || "";
  var keterangan = data.keterangan || "";

  // Append baris baru ke sheet Cashflow
  sheet.appendRow([
    tanggalFormatted,
    bulan,
    pemasukan,
    pengeluaran,
    post,
    keterangan,
  ]);

  return {
    status: "success",
    message: "Data cashflow berhasil ditambahkan.",
    data: {
      tanggal: tanggalRaw,
      bulan: bulan,
      pemasukan: pemasukan,
      pengeluaran: pengeluaran,
      post: post,
      keterangan: keterangan,
    },
  };
}

// ================================================
// GET ?action=cashflow&bulan=March
// Riwayat cashflow bulan tertentu dari sheet Cashflow
// ================================================
function getCashflowBulanIni(bulanParam) {
  var sheet =
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(CASHFLOW_SHEET_NAME);

  if (!sheet) {
    return { status: "error", message: 'Sheet "Cashflow" tidak ditemukan.' };
  }

  var now = new Date();
  var bulanIni = bulanParam || BULAN_NAMES[now.getMonth()];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      status: "success",
      bulan: bulanIni,
      totalPemasukan: 0,
      totalPengeluaran: 0,
      saldo: 0,
      total: 0,
      data: [],
    };
  }

  var allData = sheet.getRange(2, 1, lastRow - 1, 6).getValues();

  var hasil = [];
  var totalPemasukan = 0;
  var totalPengeluaran = 0;

  for (var i = 0; i < allData.length; i++) {
    var row = allData[i];
    var bulanRow = row[1] ? row[1].toString().trim() : "";

    if (bulanRow === bulanIni) {
      var tanggal = row[0];
      var pemasukan = Number(row[2]) || 0;
      var pengeluaran = Number(row[3]) || 0;
      var post = row[4] ? row[4].toString() : "";
      var keterangan = row[5] ? row[5].toString() : "";

      var tanggalStr = "";
      if (tanggal instanceof Date) {
        var d = tanggal.getDate();
        var m = tanggal.getMonth() + 1;
        var y = tanggal.getFullYear();
        tanggalStr =
          y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
      } else {
        tanggalStr = tanggal ? tanggal.toString() : "";
      }

      totalPemasukan += pemasukan;
      totalPengeluaran += pengeluaran;

      hasil.push({
        tanggal: tanggalStr,
        bulan: bulanRow,
        pemasukan: pemasukan,
        pengeluaran: pengeluaran,
        post: post,
        keterangan: keterangan,
      });
    }
  }

  return {
    status: "success",
    action: "cashflow",
    bulan: bulanIni,
    totalPemasukan: totalPemasukan,
    totalPengeluaran: totalPengeluaran,
    saldo: totalPemasukan - totalPengeluaran,
    total: hasil.length,
    data: hasil,
  };
}
