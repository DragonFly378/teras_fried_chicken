/* eslint-disable */
// ================================================
// Settings Module — Profil Toko
// Sheet: "Profil Toko"
// Row 1 = header, Row 2 = data
// Kolom: A=Nama Toko | B=Alamat | C=Tagline | D=Instagram
//        E=Whatsapp | F=Email | G=Username Wifi | H=Password Wifi
// ================================================

var SETTINGS_SHEET_NAME = "Profil Toko";

// ── GET — baca profil toko ──────────────────────
function getProfilToko() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet || sheet.getLastRow() < 2) {
    return { status: "ok", data: null };
  }

  var row = sheet.getRange(2, 1, 1, 8).getValues()[0];

  return {
    status: "ok",
    data: {
      namaToko: row[0] || "",
      alamat: row[1] || "",
      tagline: row[2] || "",
      instagram: row[3] || "",
      whatsapp: row[4] || "",
      email: row[5] || "",
      usernameWifi: row[6] || "",
      passwordWifi: row[7] || "",
    },
  };
}

// ── POST — simpan profil toko ───────────────────
function postProfilToko(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS_SHEET_NAME);
    sheet.getRange(1, 1, 1, 8).setValues([
      [
        "Nama Toko",
        "Alamat",
        "Tagline",
        "Instagram",
        "Whatsapp",
        "Email",
        "Username Wifi",
        "Password Wifi",
      ],
    ]);
  }

  var row = [
    data.namaToko || "",
    data.alamat || "",
    data.tagline || "",
    data.instagram || "",
    data.whatsapp || "",
    data.email || "",
    data.usernameWifi || "",
    data.passwordWifi || "",
  ];

  // Selalu tulis di row 2 (satu toko saja)
  sheet.getRange(2, 1, 1, 8).setValues([row]);

  return { status: "ok", message: "Profil toko berhasil disimpan" };
}
