/**
 * Smart JSS Readiness Checker — Google Apps Script v2
 * Receives POST from backend, saves image to Drive, logs row to Sheets.
 * Now includes GPS location columns.
 *
 * IMPORTANT: After updating this file, you must create a NEW deployment
 * in Apps Script (Deploy → New deployment), not just save.
 * Then update APPS_SCRIPT_URL in your HF Space secrets with the new URL.
 */

var FOLDER_ID = "1w6ks4JN6WIEv4_LWNgs1JUqB9qQgt3iz";
var SHEET_ID  = "1yKemIuyFZfkT6NCEbLKqkjLRaVO6HsNWVydgk6imgGM";
var SHEET_TAB = "Sheet1";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var driveUrl = "";
    try {
      var imageBlob = Utilities.newBlob(
        Utilities.base64Decode(data.image_data),
        data.image_mime,
        data.filename
      );
      var folder = DriveApp.getFolderById(FOLDER_ID);
      var file = folder.createFile(imageBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveUrl = file.getUrl();
    } catch (driveErr) {
      Logger.log("Drive upload error: " + driveErr.toString());
      driveUrl = "UPLOAD_FAILED: " + driveErr.toString().substring(0, 100);
    }

    var sheetStatus = "success";
    try {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName(SHEET_TAB);
      if (!sheet) { sheet = ss.getSheets()[0]; }

      var lastRow = sheet.getLastRow();
      if (lastRow === 0) {
        sheet.appendRow([
          "Timestamp", "PRM ID", "Filename",
          "Is Female", "Has Jio Jacket", "Has Laminated Jio Paper",
          "Female Confidence", "Jacket Confidence", "Paper Confidence",
          "Review Required", "Review Reason",
          "Image Width", "Image Height", "Image Mode",
          "Latitude", "Longitude", "Location Accuracy",
          "Drive File URL"
        ]);
        sheet.getRange(1, 1, 1, 18).setFontWeight("bold");
      }

      sheet.appendRow([
        data.timestamp || "",
        data.prm_id || "",
        data.filename || "",
        data.is_female || "False",
        data.has_jio_jacket || "False",
        data.has_laminated_jio_promotional_paper || "False",
        data.female_confidence || "0.0",
        data.jacket_confidence || "0.0",
        data.paper_confidence || "0.0",
        data.review_required || "True",
        data.review_reason || "",
        data.image_width || "",
        data.image_height || "",
        data.image_mode || "",
        data.latitude || "",
        data.longitude || "",
        data.location_accuracy || "",
        driveUrl
      ]);
    } catch (sheetErr) {
      Logger.log("Sheet error: " + sheetErr.toString());
      sheetStatus = "SHEET_FAILED: " + sheetErr.toString().substring(0, 100);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ "drive_file_url": driveUrl, "sheet_status": sheetStatus })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("General error: " + err.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ "drive_file_url": "", "sheet_status": "ERROR: " + err.toString().substring(0, 200) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function testSetup() {
  try {
    var folder = DriveApp.getFolderById(FOLDER_ID);
    Logger.log("Drive folder found: " + folder.getName());
  } catch (e) {
    Logger.log("Drive folder error: " + e.toString());
  }
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    Logger.log("Sheet found: " + ss.getName());
  } catch (e) {
    Logger.log("Sheet error: " + e.toString());
  }
}
