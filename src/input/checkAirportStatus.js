import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing NOTAM files
const notamDirectory = path.resolve(__dirname, "../data/notams/");

// Airport name (could be parameterized for dynamic use)
const airportName = "ABC Airport"; // Replace with the actual airport name

function checkAirportStatus() {
  const files = fs.readdirSync(notamDirectory).filter((file) => file.endsWith(".txt"));

  let airportStatus = "Open"; // Default status is "Open"

  for (const file of files) {
    const content = fs.readFileSync(path.join(notamDirectory, file), "utf8");
    if (content.includes(airportName) && content.includes("AD CLSD")) {
      airportStatus = "Closed";
      console.log(`🚫 Airport Status: Closed (Found "AD CLSD" in ${file})`);
      break; // Exit loop if status is determined
    }
  }

  if (airportStatus === "Open") {
    console.log(`✅ Airport Status: Open (No "AD CLSD" found in NOTAM files)`);
  }

  return airportStatus;
}

// Example usage
checkAirportStatus();