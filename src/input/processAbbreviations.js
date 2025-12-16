import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Excel file
const abbreviationsExcel = path.resolve(__dirname, "../data/abbreviations.xlsx");

function queryAbbreviation(abbreviation) {
  // Load the Excel file
  const workbook = xlsx.readFile(abbreviationsExcel);
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  // Convert the sheet into a JSON-structured array (raw rows)
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  console.log("✅ Loaded Rows:", rows);

  // Search for the abbreviation in rows
  for (const row of rows) {
    if (row.length === 3 && row[0]?.trim() === abbreviation) {
      console.log(`✅ Found Abbreviation: ${abbreviation}`);
      console.log(`Spanish: ${row[1]?.trim()}`);
      console.log(`English: ${row[2]?.trim()}`);
      return {
        abbreviation,
        spanish: row[1]?.trim(),
        english: row[2]?.trim()
      };
    }
  }

  console.log(`❌ Abbreviation "${abbreviation}" not found.`);
  return null;
}

// Example usage: Query the abbreviation "RWY"
const abbreviationResult = queryAbbreviation("RWY");
console.log(abbreviationResult);