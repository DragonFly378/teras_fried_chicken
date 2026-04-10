/* eslint-disable no-unused-vars */
// ================================================
// Pricelist Module - Teras Fried Chicken (TFC)
// Sheet: Pricelist | Spreadsheet: TFC (SPREADSHEET_ID)
// ================================================
// Berisi handler untuk endpoint:
//   GET ?action=pricelist  -> master menu untuk Order POS
//
// Frontend (OrderForm.tsx) expect shape:
//   {
//     "status": "ok",
//     "data": [
//       { "Produk": "...", "Jenis": "...", "Ukuran": "...",
//         "Harga": 0, "Modal": 0, "Untung": 0, "Margin": 0 },
//       ...
//     ]
//   }
//
// Schema sheet "Pricelist":
//   A=Produk | B=Jenis | C=Ukuran | D=Harga | E=Modal | F=Untung | G=Margin
//
// Catatan: file ini menggunakan global var SPREADSHEET_ID
// yang dideklarasikan di code.js (file utama).
// ================================================

var PRICELIST_SHEET_NAME = "Pricelist";

function getPricelist() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
    PRICELIST_SHEET_NAME,
  );

  if (!sheet) {
    return {
      status: "error",
      message: 'Sheet "' + PRICELIST_SHEET_NAME + '" tidak ditemukan.',
    };
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      status: "ok",
      data: [],
    };
  }

  // Baca 7 kolom (A..G) mulai row 2
  var values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();

  var data = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var produk = row[0] ? row[0].toString().trim() : "";
    if (!produk) continue; // skip baris kosong

    data.push({
      Produk: produk,
      Jenis: row[1] ? row[1].toString().trim() : "",
      Ukuran: row[2] ? row[2].toString().trim() : "",
      Harga: Number(row[3]) || 0,
      Modal: Number(row[4]) || 0,
      Untung: Number(row[5]) || 0,
      Margin: Number(row[6]) || 0,
    });
  }

  return {
    status: "ok",
    action: "pricelist",
    total: data.length,
    data: data,
  };
}
