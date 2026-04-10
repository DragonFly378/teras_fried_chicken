/* eslint-disable no-unused-vars */
// ================================================
// Pesanan Module - Teras Fried Chicken (TFC)
// Sheet: Pesanan TFC | Spreadsheet: TFC (SPREADSHEET_ID)
// ================================================
// Schema kolom:
//   ID | Tanggal Pemesanan | Bulan | Pesanan | Jenis | Size | Qty
//   | Pembayaran | Harga Satuan | Harga Total | Total Modal
//   | Total Margin | Status | Owner | Deliver | Notes
//
// Catatan: file ini menggunakan global var SPREADSHEET_ID
// yang dideklarasikan di code.js (file utama) dan bergantung
// pada generateInvoiceId() yang dideklarasikan di invoiceModule.js.
// ================================================

var PESANAN_SHEET_NAME = "Pesanan TFC";

function postPesananTFC(data) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
    PESANAN_SHEET_NAME,
  );

  if (!sheet) {
    return {
      status: "error",
      message: 'Sheet "' + PESANAN_SHEET_NAME + '" tidak ditemukan.',
    };
  }

  var rows = data.rows;
  if (!rows || !rows.length) {
    return { status: "error", message: 'Field "rows" wajib diisi.' };
  }

  // Generate 1 invoice ID untuk semua row dalam cart ini
  var invoiceId = generateInvoiceId(sheet);

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    sheet.appendRow([
      invoiceId, // ID
      row.tanggalPemesanan, // Tanggal Pemesanan
      row.bulan, // Bulan
      row.pesanan, // Pesanan
      row.jenis, // Jenis
      row.size, // Size
      row.qty, // Qty
      row.pembayaran, // Pembayaran
      row.hargaSatuan, // Harga Satuan
      row.hargaTotal, // Harga Total
      row.totalModal, // Total modal
      row.totalMargin, // Total margin
      row.status, // Status
      row.owner, // Owner
      row.deliver, // Deliver
      row.notes || "", // Notes
    ]);
  }

  return {
    status: "success",
    count: rows.length,
    invoiceId: invoiceId,
  };
}
