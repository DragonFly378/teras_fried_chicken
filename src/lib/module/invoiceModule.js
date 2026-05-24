/* eslint-disable no-unused-vars */
// ================================================
// Invoice Module - Teras Fried Chicken (TFC)
// ================================================
// Berisi:
//   - generateInvoiceId(sheet)              -> dipanggil pesananModule.postPesananTFC
//   - appendTransaksiPesanan(invoiceId,data) -> tulis 1 baris ringkasan ke "Transaksi Pesanan"
//   - getInvoiceHistoryBulanIni(bln)        -> riwayat invoice/pesanan bulan tertentu
//
// Function history membaca sheet PESANAN_SHEET_NAME (= "Pesanan TFC")
// dari spreadsheet SPREADSHEET_ID (global var dari code.js).
//
// Sheet "Transaksi Pesanan" schema:
//   A=id | B=tanggal | C=bulan | D=nama_pemesan | E=total_modal
//   F=total_price | G=discount_price | H=final_price | I=total_margin
//   J=metode_pembayaran | K=kembalian | L=status
// ================================================

var TRANSAKSI_SHEET_NAME = "Transaksi Pesanan";

var BULAN_NAMES_INVOICE = [
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

/**
 * Generate invoice ID untuk Teras Fried Chicken (TFC).
 * Format : INV-TFC-YYYYMMDDNNNN
 * Contoh : INV-TFC-202604060001 = invoice pertama tanggal 6 April 2026.
 *
 * NNNN = counter 4 digit, di-reset tiap hari.
 * Counter diambil dari sequence tertinggi pada kolom ID (col A)
 * yang prefix-nya sama dengan hari ini (WIB), lalu +1.
 *
 * @param {Sheet} sheet - Sheet target tempat invoice disimpan
 * @return {string} Invoice ID baru
 */
function generateInvoiceId(sheet) {
  // Gunakan timezone WIB (UTC+7) agar tanggal tidak bergeser di malam hari
  var now = new Date();
  var wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  var yyyy = wib.getUTCFullYear();
  var mm = ("0" + (wib.getUTCMonth() + 1)).slice(-2);
  var dd = ("0" + wib.getUTCDate()).slice(-2);
  var prefix = "INV-TFC-" + yyyy + mm + dd;

  var lastRow = sheet.getLastRow();
  var maxSeq = 0;

  if (lastRow > 1) {
    // Ambil semua ID (kolom A, mulai row 2)
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      var id = String(ids[i][0] || "");
      if (id.indexOf(prefix) === 0) {
        var seq = parseInt(id.substring(prefix.length), 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    }
  }

  var nextSeq = maxSeq + 1;
  var seqPadded = ("0000" + nextSeq).slice(-4); // 4 digit: 0001–9999
  return prefix + seqPadded;
}

// ================================================
// Append 1 baris ringkasan ke sheet "Transaksi Pesanan".
// Dipanggil dari postPesananTFC() setelah semua item
// berhasil ditulis ke sheet "Pesanan TFC".
//
// Schema sheet "Transaksi Pesanan":
//   A=id | B=tanggal | C=bulan | D=nama_pemesan | E=total_modal
//   F=total_price | G=discount_price | H=final_price | I=total_margin
//   J=metode_pembayaran | K=kembalian | L=status
//
// @param {string}  invoiceId - ID invoice yang sudah di-generate
// @param {Object}  data      - payload asli dari frontend
//   data.rows[]              - item pesanan
//   data.kembalian           - kembalian (opsional, hanya Cash)
//   data.discountPrice       - potongan diskon nominal (opsional, default 0)
// ================================================
function appendTransaksiPesanan(invoiceId, data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(TRANSAKSI_SHEET_NAME);

  // Auto-create sheet + header jika belum ada
  if (!sheet) {
    sheet = ss.insertSheet(TRANSAKSI_SHEET_NAME);
    sheet.appendRow([
      "id",
      "tanggal",
      "bulan",
      "nama_pemesan",
      "total_modal",
      "total_price",
      "discount_price",
      "final_price",
      "total_margin",
      "metode_pembayaran",
      "kembalian",
      "status",
    ]);
  }

  var rows = data.rows || [];
  if (!rows.length) return;

  var tanggal = rows[0].tanggalPemesanan || "";
  var bulan = rows[0].bulan || "";
  var namaPemesan = rows[0].owner || "";
  var metodePembayaran = rows[0].pembayaran || "";
  var status = rows[0].status || "";

  var totalPrice = 0;
  var totalModal = 0;
  for (var i = 0; i < rows.length; i++) {
    totalPrice += Number(rows[i].hargaTotal) || 0;
    totalModal += Number(rows[i].totalModal) || 0;
  }

  var discountPrice = Number(data.discountPrice) || 0;
  var finalPrice = totalPrice - discountPrice;
  var totalMargin = finalPrice - totalModal;

  var kembalian =
    metodePembayaran === "Cash" && data.kembalian != null
      ? Number(data.kembalian)
      : "";

  sheet.appendRow([
    invoiceId,        // id
    tanggal,          // tanggal
    bulan,            // bulan
    namaPemesan,      // nama_pemesan
    totalModal,       // total_modal
    totalPrice,       // total_price
    discountPrice,    // discount_price
    finalPrice,       // final_price
    totalMargin,      // total_margin
    metodePembayaran, // metode_pembayaran
    kembalian,        // kembalian
    status,           // status
  ]);
}

// ================================================
// GET ?action=history&bulan=April
// History pesanan/invoice bulan tertentu (default: bulan ini).
// Hasil di-group per Invoice ID karena 1 invoice = 1 cart
// yang bisa berisi banyak item.
//
// Schema sheet "Pesanan TFC":
//   A=ID | B=Tanggal Pemesanan | C=Bulan | D=Pesanan | E=Jenis | F=Size
//   G=Qty | H=Pembayaran | I=Harga Satuan | J=Harga Total | K=Diskon
//   L=Harga Final | M=Total Modal | N=Total Margin | O=Status | P=Owner
//   Q=Deliver | R=Notes
// ================================================
function getInvoiceHistoryBulanIni(bulanParam) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
    PESANAN_SHEET_NAME,
  );

  if (!sheet) {
    return {
      status: "error",
      message: 'Sheet "' + PESANAN_SHEET_NAME + '" tidak ditemukan.',
    };
  }

  var now = new Date();
  var bulanIni = bulanParam || BULAN_NAMES_INVOICE[now.getMonth()];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      status: "success",
      action: "history",
      bulan: bulanIni,
      totalInvoice: 0,
      totalQty: 0,
      totalOmzet: 0,
      totalModal: 0,
      totalMargin: 0,
      data: [],
    };
  }

  // Ambil 18 kolom (A..R)
  var allData = sheet.getRange(2, 1, lastRow - 1, 18).getValues();

  // Group rows by invoice ID
  var invoiceMap = {};
  var orderedIds = []; // jaga urutan munculnya invoice

  for (var i = 0; i < allData.length; i++) {
    var row = allData[i];
    var bulanRow = row[2] ? row[2].toString().trim() : "";

    if (bulanRow !== bulanIni) continue;

    var invoiceId = row[0] ? row[0].toString() : "";
    if (!invoiceId) continue;

    var qty = Number(row[6]) || 0;
    var hargaSatuan = Number(row[8]) || 0;
    var hargaTotal = Number(row[9]) || 0;
    var diskon = Number(row[10]) || 0;
    var hargaFinal = Number(row[11]) || hargaTotal;
    var totalModal = Number(row[12]) || 0;
    var totalMargin = Number(row[13]) || 0;

    if (!invoiceMap[invoiceId]) {
      invoiceMap[invoiceId] = {
        invoiceId: invoiceId,
        tanggalPemesanan: formatTanggalISO(row[1]),
        bulan: bulanRow,
        pembayaran: row[7] ? row[7].toString() : "",
        status: row[14] ? row[14].toString() : "",
        owner: row[15] ? row[15].toString() : "",
        deliver: row[16] ? row[16].toString() : "",
        notes: row[17] ? row[17].toString() : "",
        items: [],
        totalQty: 0,
        totalHarga: 0,
        totalDiskon: 0,
        totalModal: 0,
        totalMargin: 0,
      };
      orderedIds.push(invoiceId);
    }

    invoiceMap[invoiceId].items.push({
      pesanan: row[3] ? row[3].toString() : "",
      jenis: row[4] ? row[4].toString() : "",
      size: row[5] ? row[5].toString() : "",
      qty: qty,
      hargaSatuan: hargaSatuan,
      hargaTotal: hargaTotal,
    });

    invoiceMap[invoiceId].totalQty += qty;
    invoiceMap[invoiceId].totalHarga += hargaTotal;
    invoiceMap[invoiceId].totalDiskon += diskon;
    invoiceMap[invoiceId].totalModal += totalModal;
    invoiceMap[invoiceId].totalMargin += totalMargin;
  }

  // ── Baca "Transaksi Pesanan" untuk enrich kembalian & diskon ──
  // Schema: A=id(0) | B=tanggal(1) | C=bulan(2) | D=nama_pemesan(3)
  //         E=total_modal(4) | F=total_price(5) | G=discount_price(6)
  //         H=final_price(7) | I=total_margin(8) | J=metode_pembayaran(9)
  //         K=kembalian(10) | L=status(11)
  var transaksiMap = {};
  var transaksiSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
    TRANSAKSI_SHEET_NAME,
  );
  if (transaksiSheet && transaksiSheet.getLastRow() > 1) {
    var tData = transaksiSheet
      .getRange(2, 1, transaksiSheet.getLastRow() - 1, 12)
      .getValues();
    for (var t = 0; t < tData.length; t++) {
      var tId = tData[t][0] ? tData[t][0].toString() : "";
      if (tId) {
        transaksiMap[tId] = {
          discountPrice: tData[t][6] !== "" ? Number(tData[t][6]) : 0,
          kembalian: tData[t][10] !== "" ? Number(tData[t][10]) : null,
        };
      }
    }
  }

  // Konversi ke array, enrich kembalian + diskon, urutkan invoice terbaru di atas
  var hasil = [];
  for (var j = 0; j < orderedIds.length; j++) {
    var inv = invoiceMap[orderedIds[j]];
    var trx = transaksiMap[inv.invoiceId];
    if (trx) {
      if (trx.kembalian != null) {
        inv.kembalian = trx.kembalian;
      }
      if (trx.discountPrice > 0) {
        inv.discountPrice = trx.discountPrice;
      }
    }
    hasil.push(inv);
  }
  hasil.sort(function (a, b) {
    return b.invoiceId.localeCompare(a.invoiceId);
  });

  // Hitung total agregat untuk summary card
  var totalQty = 0;
  var totalOmzet = 0;
  var totalModal = 0;
  var totalMargin = 0;
  for (var k = 0; k < hasil.length; k++) {
    totalQty += hasil[k].totalQty;
    totalOmzet += hasil[k].totalHarga;
    totalModal += hasil[k].totalModal;
    totalMargin += hasil[k].totalMargin;
  }

  return {
    status: "success",
    action: "history",
    bulan: bulanIni,
    totalInvoice: hasil.length,
    totalQty: totalQty,
    totalOmzet: totalOmzet,
    totalModal: totalModal,
    totalMargin: totalMargin,
    data: hasil,
  };
}

// --- Helper: format Date object ke string YYYY-MM-DD ---
function formatTanggalISO(tanggal) {
  if (tanggal instanceof Date) {
    var d = tanggal.getDate();
    var m = tanggal.getMonth() + 1;
    var y = tanggal.getFullYear();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
  }
  return tanggal ? tanggal.toString() : "";
}
