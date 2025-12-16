import scrapePDFs from "../../input/scrapePDFs.js";
import parsePDFs from "../../process/parsePDFs.js";
import extractAirportStatus from "../../process/extractAirportStatus.js";

async function runWorkflow() {
  try {
    console.log("🚀 Starting NOTAM workflow...");

    console.log("🔍 Scraping NOTAM PDFs...");
    const success = await scrapePDFs();
    if (!success) {
      console.warn("⚠️ No PDFs downloaded. Exiting workflow.");
      return;
    }

    console.log("📝 Parsing PDFs...");
    parsePDFs();

    console.log("📊 Extracting airport statuses...");
    const statuses = extractAirportStatus();
    console.log("✅ Final Airport Statuses:", statuses);
  } catch (err) {
    console.error("❌ Workflow error:", err.message);
  }
}

runWorkflow();