import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const abbreviationsExcel = path.resolve(__dirname, "../data/abbreviations.xlsx");
const cleanedExcelPath = path.resolve(__dirname, "../data/cleaned-abbreviations.xlsx");
const abbreviationsJsonPath = path.resolve(__dirname, "../data/abbreviations.json");

function extractFromMultipleSheets() {
  // Load the Excel workbook
  const workbook = xlsx.readFile(abbreviationsExcel);

  const cleanedRows = [];
  const abbreviationMap = {};

  console.log("✅ Processing subtabs (sheets)...");

  // Iterate through all sheets in the workbook
  workbook.SheetNames.forEach((sheetName) => {
    console.log(`🔍 Processing sheet: ${sheetName}`);

    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to raw rows

    // Debug raw rows
    console.log(`🔍 Raw rows from sheet ${sheetName}:`, rows);

    // Extract valid rows
    rows.forEach((row) => {
      // Flatten cells that might contain multiline rows
      const flattenedRow = row.map((cell) => {
        return cell?.toString().replace(/\n/g, " ").trim(); // Flatten multiline cells
      });

      // Ensure the row has at least 3 valid columns
      if (flattenedRow.length >= 3) {
        const abbreviation = flattenedRow[0]?.trim();
        const spanish = flattenedRow[1]?.trim();
        const english = flattenedRow[2]?.trim();

        if (abbreviation && spanish && english) {
          // Consolidate data
          cleanedRows.push([abbreviation, spanish, english]);
          abbreviationMap[abbreviation] = { spanish, english };
        }
      }
    });
  });

  console.log("✅ Consolidated Rows:", cleanedRows);

  // Create a new Excel file with the combined data
  const workbookOut = xlsx.utils.book_new();
  const sheetOut = xlsx.utils.aoa_to_sheet(cleanedRows);
  xlsx.utils.book_append_sheet(workbookOut, sheetOut, "ConsolidatedAbbreviations");
  xlsx.writeFile(workbookOut, cleanedExcelPath);
  console.log(`✅ Cleaned and consolidated Excel file saved: ${cleanedExcelPath}`);

  // Save the consolidated data as JSON
  fs.writeFileSync(abbreviationsJsonPath, JSON.stringify(abbreviationMap, null, 2), "utf8");
  console.log(`✅ Consolidated abbreviation map saved to JSON: ${abbreviationsJsonPath}`);
}

extractFromMultipleSheets();