// scripts/build-airport-info.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ✅ Robust __dirname (works on Windows)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Where your AIP .txt files live
const AIP_ROOT =
  process.env.AIP_TEXT_ROOT ||
  "C:/Users/nicol/OneDrive/Desktop/AIPColombia/aip_text";

// ✅ Output folder & files inside this app
const DATA_DIR = path.join(__dirname, "..", "src", "data");
const OUTPUT_JSON = path.join(DATA_DIR, "airportInfo.json");
const OUTPUT_MJS = path.join(DATA_DIR, "airportInfo.mjs");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function walkTxtFiles(rootDir) {
  const out = [];
  const stack = [rootDir];

  while (stack.length) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && full.toLowerCase().endsWith(".txt")) {
        out.push(full);
      }
    }
  }

  return out;
}

function normalize(str) {
  return (str || "").replace(/\s+/g, " ").trim();
}

/**
 * Decide controlled/uncontrolled with the logic:
 *
 * 1. If "Servicios de Tránsito Aéreo (ATS)" value starts with "No" → uncontrolled.
 * 2. If airspace classification = NIL → uncontrolled.
 * 3. If airspace classification exists and is NOT NIL → controlled.
 * 4. If any ATC keyword (TWR/TORRE/APP/ACC/CTR/GND/TMA/RADAR/SUELO) appears → controlled.
 * 5. Else → uncontrolled.
 */
function deriveControlStatus({
  airspaceClassificationRaw,
  atsServicesRaw,
  hasATCKeyword,
}) {
  // 1) ATS line as the *primary* rule
  const ats = normalize(atsServicesRaw).toUpperCase();
  if (ats.startsWith("NO")) {
    // "No" / "No." / "NO", etc
    return false; // uncontrolled
  }

  // 2) Airspace classification
  const cls = normalize(airspaceClassificationRaw).toUpperCase();

  if (cls === "NIL") {
    return false; // uncontrolled
  }

  if (cls && cls !== "NIL") {
    return true; // controlled
  }

  // 3) ATC keywords in the text
  if (hasATCKeyword) {
    return true;
  }

  // 4) Default
  return false;
}

/**
 * Parse one AIP txt file and merge info into airportInfo map.
 */
function parseAirportFromText(filePath, airportInfo) {
  const text = fs.readFileSync(filePath, "utf8");

  // 1️⃣ Try to get ICAO from folder name: AD2_SKBO
  const fromPath = filePath.match(/AD2_([A-Z]{4})/i);
  let icao = null;

  if (fromPath) {
    icao = fromPath[1].toUpperCase();
  } else {
    // 2️⃣ Fallback: search inside the text "AD 2 SKBO"
    const icaoMatch = text.match(/\bAD\s*2\s+([A-Z]{4})\b/);
    if (!icaoMatch) {
      return; // not an airport file, skip
    }
    icao = icaoMatch[1].toUpperCase();
  }

  // Create base object if first time we see this ICAO
  if (!airportInfo[icao]) {
    airportInfo[icao] = {
      icao,
      name: null,
      city: null,
      country: "Colombia",
      elevationFt: null,
      airspaceClassification: null,
      atsServices: null,
      hasATCKeyword: false,
      frequencies: [],
      summary: null,
      isControlled: false, // computed later
      operator: null,      // Explotador del AD
    };
  }

  const info = airportInfo[icao];

  // ── Aerodrome name & city from lines like:
  //    "SKAG - HACARITAMA"  or  "AD 2 SKAG - HACARITAMA" ────────────────
  if (!info.name || !info.city) {
    const nameLineRegex1 = new RegExp(
      `^\\s*${icao}\\s*[-–]\\s*([^\\r\\n]+)$`,
      "mi"
    );
    const nameLineRegex2 = new RegExp(
      `AD\\s*2\\s*${icao}\\s*[-–]\\s*([^\\r\\n]+)`,
      "mi"
    );

    let nameLineMatch = text.match(nameLineRegex1);
    if (!nameLineMatch) {
      nameLineMatch = text.match(nameLineRegex2);
    }

    if (nameLineMatch) {
      const rawFull = normalize(nameLineMatch[1]);
      if (rawFull && rawFull.toUpperCase() !== icao) {
        let city = null;
        let name = rawFull;

        // Try to split "CITY - NAME", "CITY / NAME", "CITY, NAME"
        const splitMatch = rawFull.match(/^([^\/\-\,]+)\s*[/\-\,]\s*(.+)$/);
        if (splitMatch) {
          city = normalize(splitMatch[1]);
          name = normalize(splitMatch[2]);
        }

        if (city && !info.city) {
          info.city = city;
        }
        if (name && !info.name) {
          info.name = name;
        }
        // Fallback: if we still don't have a name, keep full string
        if (!info.name) {
          info.name = rawFull;
        }
      }
    }
  }

  // --- Elevation: "Elevación: 8358 ft" / "Elevation: 8358 ft" ---
  const elevMatch =
    text.match(/Elev(?:ación)?\s*[:\-]?\s*([0-9]+)\s*ft/i) ||
    text.match(/Elevation\s*[:\-]?\s*([0-9]+)\s*ft/i);

  if (elevMatch && !info.elevationFt) {
    info.elevationFt = parseInt(elevMatch[1], 10);
  }

  // --- Explotador del AD (AD operator / operating hours line) ---
  // We just show the line right after "Explotador del AD"
  if (!info.operator) {
    const opMatch =
      text.match(/Explotador del AD\s*[\r\n]+([^\r\n]+)/i) ||
      text.match(/Aerodrome operator\s*[\r\n]+([^\r\n]+)/i);
    if (opMatch && opMatch[1]) {
      info.operator = normalize(opMatch[1]);
    }
  }

  // --- Airspace classification ---
  const airspaceMatch =
    text.match(
      /Clasificaci[oó]n del Espacio A[eé]reo\s*[\r\n]+([A-Z]+|NIL)/i
    ) ||
    text.match(/Airspace Classification\s*[\r\n]+([A-Z]+|NIL)/i);

  if (airspaceMatch && !info.airspaceClassification) {
    info.airspaceClassification = normalize(airspaceMatch[1]);
  }

  // --- Servicios de Tránsito Aéreo (ATS) line ---
  // We grab the first non-empty line after the header
  const atsBlockMatch = text.match(
    /Servicios de Tr[aá]nsito A[eé]reo\s*\(ATS\)\s*[:\s]*([\s\S]{0,120})/i
  );
  if (atsBlockMatch && !info.atsServices) {
    const firstLine = atsBlockMatch[1].split(/\r?\n/)[0];
    info.atsServices = normalize(firstLine);
  }

  // --- ATC keyword presence anywhere in text ---
  if (!info.hasATCKeyword) {
    const controlKeywordRegex =
      /\b(TWR|TORRE|APP|APROX|ACC|CTR|GND|SUELO|TMA|RADAR)\b/i;
    if (controlKeywordRegex.test(text)) {
      info.hasATCKeyword = true;
    }
  }

  // --- Frequencies (for UI list only) ---
  const freqRegex = /([0-9]{3}\.[0-9]{1,3})\s*MHZ[^\r\n]*/gi;
  let freqMatch;
  while ((freqMatch = freqRegex.exec(text))) {
    const line = freqMatch[0];
    const freq = freqMatch[1];

    const desc = line.replace(freq, "").replace(/MHZ/i, "");
    info.frequencies.push({
      freq: freq + " MHz",
      description: normalize(desc),
    });
  }

  // --- Summary (very rough) ---
  if (!info.summary) {
    const summaryMatch = text.match(/AD\s*2\.2[^\r\n]*\r?\n([\s\S]{0,800})/i);
    if (summaryMatch) {
      info.summary = normalize(summaryMatch[1]);
    }
  }
}

function main() {
  console.log("🔎 Scanning AIP text under:", AIP_ROOT);

  if (!fs.existsSync(AIP_ROOT)) {
    console.error("❌ AIP root folder not found:", AIP_ROOT);
    process.exit(1);
  }

  const files = walkTxtFiles(AIP_ROOT);
  console.log("📄 Found", files.length, ".txt files");

  const airportInfo = {};

  for (const file of files) {
    try {
      parseAirportFromText(file, airportInfo);
    } catch (err) {
      console.warn("⚠️ Failed parsing", file, err.message);
    }
  }

  // ✅ Now compute isControlled for each airport using the consolidated logic
  let controlledCount = 0;
  let uncontrolledCount = 0;

  for (const icao of Object.keys(airportInfo)) {
    const info = airportInfo[icao];

    info.isControlled = deriveControlStatus({
      airspaceClassificationRaw: info.airspaceClassification,
      atsServicesRaw: info.atsServices,
      hasATCKeyword: !!info.hasATCKeyword,
    });

    if (info.isControlled) controlledCount++;
    else uncontrolledCount++;
  }

  const sortedICAOs = Object.keys(airportInfo).sort();
  const ordered = {};
  for (const icao of sortedICAOs) {
    ordered[icao] = airportInfo[icao];
  }

  ensureDir(DATA_DIR);

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(ordered, null, 2), "utf8");
  fs.writeFileSync(
    OUTPUT_MJS,
    `// Auto-generated from build-airport-info.mjs\nexport default ${JSON.stringify(
      ordered,
      null,
      2
    )};\n`,
    "utf8"
  );

  console.log(
    `✅ Wrote ${OUTPUT_JSON} and ${OUTPUT_MJS} for ${sortedICAOs.length} airports`
  );
  console.log(
    `📊 Control stats → Controlled: ${controlledCount}, Uncontrolled: ${uncontrolledCount}`
  );
}
main();