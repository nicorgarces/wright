// apps/web/scripts/build-notam-status.mjs
import fs from "fs";
import path from "path";
import url from "url";

// --- Resolve paths ---
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const NOTAM_DIR = path.join(DATA_DIR, "notams_raw");
const OUTPUT_FILE = path.join(DATA_DIR, "notamStatus.json");

// --- Load known ICAOs from airportInfo.json (already built from AIP) ---
let airportInfo = {};
try {
  const airportInfoPath = path.join(DATA_DIR, "airportInfo.json");
  const raw = fs.readFileSync(airportInfoPath, "utf8");
  airportInfo = JSON.parse(raw);
  console.log(
    `✅ Loaded airportInfo.json with ${Object.keys(airportInfo).length} airports`
  );
} catch (err) {
  console.error("❌ Could not load airportInfo.json:", err.message);
  process.exit(1);
}

const allIcaos = Object.keys(airportInfo);

// --- Ensure NOTAM directory exists ---
if (!fs.existsSync(NOTAM_DIR)) {
  console.error(
    `❌ NOTAM folder not found: ${NOTAM_DIR}\nCreate this folder and put .txt NOTAM dumps inside it.`
  );
  process.exit(1);
}

const notamFiles = fs
  .readdirSync(NOTAM_DIR)
  .filter((f) => f.toLowerCase().endsWith(".txt"));

if (notamFiles.length === 0) {
  console.warn(
    `⚠️ No .txt files found under ${NOTAM_DIR}. All airports will be treated as UNKNOWN.`
  );
}

// --- Helper: classify a NOTAM text for a single ICAO ---
function classifyStatusForIcao(icao, textUpper) {
  // Very simple heuristics; you can adjust keywords as needed.
  // We look for patterns like "SKBO ... AD CLSD" anywhere in the text.
  const closedPattern = new RegExp(`${icao}\\s+[A-Z0-9/\\s]*AD\\s+CLSD`, "i");
  const adClosed2 = new RegExp(`AD\\s+${icao}\\s+CLSD`, "i");
  const partialPattern = new RegExp(
    `${icao}.*(RWY|TWY|APRON).*CLSD`,
    "i"
  );

  if (closedPattern.test(textUpper) || adClosed2.test(textUpper)) {
    return { status: "CLOSED", reason: "NOTAM indicates aerodrome closed (AD CLSD)" };
  }

  if (partialPattern.test(textUpper)) {
    return {
      status: "PARTIAL",
      reason: "NOTAM indicates partial closure (runway/taxiway/apron)",
    };
  }

  // You can add more custom rules here if needed (works in progress, etc.)

  return null; // no clear info
}

// --- Main aggregation ---
const statusByIcao = {};
let filesProcessed = 0;

for (const file of notamFiles) {
  const fullPath = path.join(NOTAM_DIR, file);
  const raw = fs.readFileSync(fullPath, "utf8");
  const upper = raw.toUpperCase();

  filesProcessed++;

  // For each airport, see if this NOTAM file mentions it as closed / partial.
  for (const icao of allIcaos) {
    const classification = classifyStatusForIcao(icao, upper);
    if (!classification) continue;

    // If we already had a status, decide if this one is "worse".
    const existing = statusByIcao[icao];
    if (!existing) {
      statusByIcao[icao] = classification;
    } else {
      // Priority: CLOSED > PARTIAL > others
      const priority = { CLOSED: 2, PARTIAL: 1, UNKNOWN: 0 };
      if (priority[classification.status] > priority[existing.status]) {
        statusByIcao[icao] = classification;
      }
    }
  }
}

console.log(`📄 Processed ${filesProcessed} NOTAM file(s).`);
console.log(
  `🟢 Found explicit NOTAM status for ${Object.keys(statusByIcao).length} airport(s).`
);

// For airports with no NOTAM, mark as UNKNOWN (you might treat as OPEN by default in UI)
const output = {};
for (const icao of allIcaos) {
  const info = statusByIcao[icao];
  if (info) {
    output[icao] = info;
  } else {
    output[icao] = {
      status: "UNKNOWN",
      reason: "No closure NOTAM detected in scanned files",
    };
  }
}

// Write JSON
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf8");
console.log(`✅ Wrote NOTAM status to ${OUTPUT_FILE}`);
