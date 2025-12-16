import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common Colombian airport ICAO codes
const COLOMBIAN_ICAO_CODES = [
  "SKBO", // Bogotá - El Dorado
  "SKCL", // Cali - Alfonso Bonilla Aragón
  "SKRG", // Rionegro - José María Córdova (Medellín)
  "SKCG", // Cartagena - Rafael Núñez
  "SKBQ", // Barranquilla - Ernesto Cortissoz
  "SKPE", // Pereira - Matecaña
  "SKSM", // Santa Marta - Simón Bolívar
  "SKBG", // Bucaramanga - Palonegro
  "SKAR", // Armenia - El Edén
  "SKLC", // Caucasia - Juan H. White
  "SKIB", // Ibagué - Perales
  "SKPV", // Providencia - El Embrujo
  "SKSP", // San Andrés - Gustavo Rojas Pinilla
  "SKMR", // Montelíbano
  "SKMU", // Montería - Los Garzones
  "SKVV", // Villavicencio - Vanguardia
  "SKNV", // Neiva - Benito Salas
  "SKPP", // Popayán - Guillermo León Valencia
  "SKLM", // Leticia - Alfredo Vásquez Cobo
  "SKLT", // La Mina
  "SKMD", // Puerto Carreño - Germán Olano
  "SKMG", // Mariquita
];

function extractICAOCode(text) {
  // Extract ICAO code from NOTAM text (e.g., "BOGOTÁ, D.C./BOGOTA - EL DORADO LUIS CARLOS (SKBO)")
  const icaoMatch = text.match(/\(([A-Z]{4})\)/);
  if (icaoMatch) {
    return icaoMatch[1];
  }
  
  // Try to find standalone ICAO codes
  for (const icao of COLOMBIAN_ICAO_CODES) {
    if (text.includes(icao)) {
      return icao;
    }
  }
  
  return null;
}

function extractAirportName(text) {
  // Extract airport name from lines like "BOGOTÁ, D.C./BOGOTA - EL DORADO LUIS CARLOS (SKBO)"
  const nameMatch = text.match(/^(.+?)\s*\([A-Z]{4}\)/m);
  if (nameMatch) {
    return nameMatch[1].trim();
  }
  return null;
}

function extractDateRange(text) {
  // Extract date range from NOTAM (e.g., "2510281548 2512232359")
  const dateMatch = text.match(/(\d{10})\s+(\d{10})/);
  if (dateMatch) {
    const startDate = parseDateString(dateMatch[1]);
    const endDate = parseDateString(dateMatch[2]);
    return { start: startDate, end: endDate };
  }
  return null;
}

function parseDateString(dateStr) {
  // Parse format: YYMMDDHHmm (e.g., 2510281548 = 2025-10-28 15:48 UTC)
  const NOTAM_DATE_STRING_LENGTH = 10;
  if (dateStr.length !== NOTAM_DATE_STRING_LENGTH) return null;
  
  const year = 2000 + parseInt(dateStr.substring(0, 2));
  const month = dateStr.substring(2, 4);
  const day = dateStr.substring(4, 6);
  const hour = dateStr.substring(6, 8);
  const minute = dateStr.substring(8, 10);
  
  return `${year}-${month}-${day}T${hour}:${minute}:00Z`;
}

function determineOperationalStatus(text) {
  const upperText = text.toUpperCase();
  
  // Check for closure keywords
  if (upperText.includes("CLSD") || upperText.includes("CLOSED") || upperText.includes("NOT AVBL")) {
    return "closed";
  }
  
  // Check for limitation keywords
  if (
    upperText.includes("LTD") ||
    upperText.includes("LIMITED") ||
    upperText.includes("RESTRICTIONS") ||
    upperText.includes("RESTRICTED") ||
    upperText.includes("WIP") ||
    upperText.includes("WORK IN PROGRESS")
  ) {
    return "limited";
  }
  
  return "operational";
}

function extractRestrictions(text) {
  const restrictions = [];
  const upperText = text.toUpperCase();
  
  if (upperText.includes("RWY") || upperText.includes("RUNWAY")) {
    restrictions.push("runway_limitations");
  }
  if (upperText.includes("TWY") || upperText.includes("TAXIWAY")) {
    restrictions.push("taxiway_limitations");
  }
  if (upperText.includes("APRON")) {
    restrictions.push("apron_limitations");
  }
  if (upperText.includes("ILS")) {
    restrictions.push("ils_limitations");
  }
  if (upperText.includes("LIGHTING") || upperText.includes("LGT")) {
    restrictions.push("lighting_limitations");
  }
  
  return restrictions;
}

function parseNotamText(notamText, sourceUrl) {
  const lines = notamText.split("\n").filter((line) => line.trim());
  const notams = [];
  let currentNotam = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this line contains an ICAO code
    const icao = extractICAOCode(line);
    if (icao) {
      // Start a new NOTAM entry
      if (currentNotam) {
        notams.push(currentNotam);
      }
      
      currentNotam = {
        icao,
        airportName: extractAirportName(line) || icao,
        text: line,
        sourceUrl,
      };
    } else if (currentNotam) {
      // Continue building the current NOTAM
      currentNotam.text += "\n" + line;
    }
  }
  
  // Add the last NOTAM
  if (currentNotam) {
    notams.push(currentNotam);
  }
  
  return notams;
}

async function parseNotamStatus() {
  try {
    console.log("🔍 Parsing NOTAM status for airports...");
    
    const notamStatusPath = path.resolve(__dirname, "../src/data/notamStatus.json");
    if (!fs.existsSync(notamStatusPath)) {
      throw new Error("NOTAM status file not found. Run update-notam-status.mjs first.");
    }
    
    const notamData = JSON.parse(fs.readFileSync(notamStatusPath, "utf8"));
    const airportStatuses = {};
    
    // Process each NOTAM document
    for (const notamDoc of notamData) {
      const notams = parseNotamText(notamDoc.text, notamDoc.url);
      
      for (const notam of notams) {
        const icao = notam.icao;
        const dateRange = extractDateRange(notam.text);
        const status = determineOperationalStatus(notam.text);
        const restrictions = extractRestrictions(notam.text);
        
        // Initialize airport status if not exists
        if (!airportStatuses[icao]) {
          airportStatuses[icao] = {
            icao,
            airportName: notam.airportName,
            overallStatus: "operational",
            notams: [],
            lastUpdate: new Date().toISOString(),
          };
        }
        
        // Add NOTAM to airport
        airportStatuses[icao].notams.push({
          text: notam.text,
          status,
          restrictions,
          validityPeriod: dateRange,
          sourceUrl: notam.sourceUrl,
        });
        
        // Update overall status (most restrictive wins)
        if (status === "closed") {
          airportStatuses[icao].overallStatus = "closed";
        } else if (status === "limited" && airportStatuses[icao].overallStatus !== "closed") {
          airportStatuses[icao].overallStatus = "limited";
        }
      }
    }
    
    // Convert to array and sort by ICAO
    const airportStatusArray = Object.values(airportStatuses).sort((a, b) =>
      a.icao.localeCompare(b.icao)
    );
    
    // Save to file
    const outputPath = path.resolve(__dirname, "../src/data/airportStatus.json");
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalAirports: airportStatusArray.length,
        totalNotams: airportStatusArray.reduce((sum, a) => sum + a.notams.length, 0),
      },
      airports: airportStatusArray,
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");
    console.log(`✅ Parsed ${airportStatusArray.length} airports with NOTAMs`);
    console.log(`📄 Saved airport status to ${outputPath}`);
    
    // Print summary
    const statusCounts = { operational: 0, limited: 0, closed: 0 };
    airportStatusArray.forEach((a) => statusCounts[a.overallStatus]++);
    console.log(`\n📊 Status Summary:`);
    console.log(`   ✅ Operational: ${statusCounts.operational}`);
    console.log(`   ⚠️  Limited: ${statusCounts.limited}`);
    console.log(`   ❌ Closed: ${statusCounts.closed}`);
  } catch (error) {
    console.error("❌ Error parsing NOTAM status:", error.message);
    process.exit(1);
  }
}

parseNotamStatus();
