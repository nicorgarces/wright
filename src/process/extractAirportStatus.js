import fs from "fs";
import path from "path";
import abbreviations from "../data/abbreviations.json"; // Load the abbreviation map

const textsFolder = path.resolve(__dirname, "../../../data/plain_texts");

function extractAirportStatus() {
  const statuses = [];
  const runwayRegex = /RWY (\d+)/; // Regex to detect runway identifiers

  const files = fs.readdirSync(textsFolder).filter((file) => file.endsWith(".txt"));
  files.forEach((file) => {
    const content = fs.readFileSync(path.join(textsFolder, file), "utf8");

    const lines = content.split("\n"); // Break content into lines
    lines.forEach((line) => {
      const runwayMatch = runwayRegex.exec(line);
      if (runwayMatch) {
        const abbrMatch = Object.keys(abbreviations).find((abbr) => line.includes(abbr));
        if (abbrMatch) {
          statuses.push({
            runway: `RWY ${runwayMatch[1]}`,
            status: abbreviations[abbrMatch].english,
            extraDetails: abbreviations[abbrMatch], // Include Spanish meaning if needed
            details: line.trim(),
          });
        }
      }
    });
  });

  console.log("✅ Extracted airport statuses:", statuses);
  return statuses;
}

export default extractAirportStatus;