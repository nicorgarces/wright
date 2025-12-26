import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createR2Client, uploadToR2, fileExistsInR2 } from "./utils/upload-to-r2.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * RAC PDF Scraper
 * Scrapes RAC regulation PDFs from Aerocivil website and uploads to Cloudflare R2
 * Source: https://www.aerocivil.gov.co/normatividad/13-reglamentos-aeronauticos-de-colombia-rac
 */

const RAC_PAGE_URL = "https://www.aerocivil.gov.co/normatividad/13-reglamentos-aeronauticos-de-colombia-rac";

// Cloudflare R2 configuration
const R2_CONFIG = {
  accessKeyId: process.env.CF_ACCESS_KEY_ID_RAC,
  secretAccessKey: process.env.CF_SECRET_KEY_RAC,
  endpoint: process.env.CF_ENDPOINT_RAC,
  bucketName: process.env.CF_BUCKET_NAME_RAC || "wright-rac-documents",
};

/**
 * Sanitize filename to remove special characters
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Download PDF from URL
 */
async function downloadPdf(url) {
  console.log(`⬇️  Downloading PDF: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`❌ Failed to download PDF from ${url}:`, error.message);
    throw error;
  }
}

/**
 * Extract RAC documents from the Aerocivil page using Puppeteer
 */
async function scrapeRacDocuments() {
  console.log("🚀 Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    console.log(`🔗 Navigating to ${RAC_PAGE_URL}...`);
    
    await page.goto(RAC_PAGE_URL, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("⏳ Waiting for table to load...");
    
    // Wait for the table with RAC documents
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    console.log("🔍 Extracting RAC document information from table...");
    
    // Extract document data from table rows
    const documents = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      
      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        
        // Skip if not enough columns
        if (cells.length < 5) return null;
        
        // Column 0: RAC code (just number like "91", "135")
        const racCodeNum = cells[0]?.textContent.trim();
        
        // Column 1: Effective date (DD/MM/YYYY)
        const effectiveDate = cells[1]?.textContent.trim();
        
        // Column 2: Title
        const title = cells[2]?.textContent.trim();
        
        // Column 3: Issuing entity
        const issuingEntity = cells[3]?.textContent.trim();
        
        // Column 4: Download link (find <a> with title="Descargar")
        const downloadLink = cells[4]?.querySelector('a[title="Descargar"]');
        const pdfUrl = downloadLink?.getAttribute('href');
        
        // Skip if no valid data
        if (!racCodeNum || !pdfUrl) return null;
        
        return {
          racCode: `RAC ${racCodeNum}`,
          title: title || "Untitled Document",
          description: "", // Not available in new structure
          pdfUrl: new URL(pdfUrl, window.location.href).toString(),
          effectiveDate: effectiveDate || "",
          issuingEntity: issuingEntity || "",
        };
      }).filter(Boolean); // Remove null entries
    });

    console.log(`✅ Found ${documents.length} RAC documents`);
    
    return documents;
  } finally {
    await browser.close();
    console.log("🔒 Browser closed");
  }
}

/**
 * Process and upload RAC documents to R2
 */
async function processAndUploadDocuments() {
  try {
    console.log("🚀 Starting RAC PDF scraping and upload...");
    
    // Validate R2 configuration
    if (!R2_CONFIG.accessKeyId || !R2_CONFIG.secretAccessKey || !R2_CONFIG.endpoint) {
      throw new Error(
        "Missing required R2 configuration. Please set CF_ACCESS_KEY_ID_RAC, CF_SECRET_KEY_RAC, and CF_ENDPOINT_RAC environment variables."
      );
    }
    
    // Initialize R2 client
    const r2Client = createR2Client(R2_CONFIG);
    console.log("✅ R2 client initialized");
    
    // Scrape documents
    const documents = await scrapeRacDocuments();
    
    if (documents.length === 0) {
      console.warn("⚠️  No RAC documents found. Please check the page structure.");
      return;
    }
    
    // Process each document
    const manifestDocuments = [];
    const stats = {
      total: documents.length,
      successful: 0,
      failed: 0,
      skipped: 0,
    };
    
    console.log(`\n📦 Processing ${documents.length} documents...\n`);
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      console.log(`\n[${i + 1}/${documents.length}] Processing: ${doc.racCode} - ${doc.title}`);
      
      try {
        // Sanitize RAC code for filename
        const sanitizedCode = sanitizeFilename(doc.racCode.replace(/\s+/g, "_"));
        const r2Key = `rac-documents/${sanitizedCode}.pdf`;
        
        // Check if file already exists in R2
        const exists = await fileExistsInR2(r2Client, R2_CONFIG.bucketName, r2Key);
        if (exists) {
          console.log(`⏭️  Skipping existing file: ${r2Key}`);
          stats.skipped++;
          
          // Still add to manifest
          manifestDocuments.push({
            racCode: doc.racCode,
            title: doc.title,
            description: doc.description,
            pdfUrl: doc.pdfUrl,
            effectiveDate: doc.effectiveDate,
            issuingEntity: doc.issuingEntity,
            r2Key,
            r2Url: `${R2_CONFIG.endpoint}/${R2_CONFIG.bucketName}/${r2Key}`,
            fileSizeBytes: null,
            scrapedAt: new Date().toISOString(),
          });
          continue;
        }
        
        // Download PDF
        const pdfBuffer = await downloadPdf(doc.pdfUrl);
        const fileSizeBytes = pdfBuffer.length;
        console.log(`📄 Downloaded ${(fileSizeBytes / 1024).toFixed(2)} KB`);
        
        // Upload to R2
        const r2Url = await uploadToR2(r2Client, R2_CONFIG.bucketName, r2Key, pdfBuffer, {
          contentType: "application/pdf",
          metadata: {
            racCode: doc.racCode,
            title: doc.title,
            sourceUrl: doc.pdfUrl,
          },
        });
        
        console.log(`✅ Uploaded to R2: ${r2Key}`);
        stats.successful++;
        
        // Add to manifest
        manifestDocuments.push({
          racCode: doc.racCode,
          title: doc.title,
          description: doc.description,
          pdfUrl: doc.pdfUrl,
          effectiveDate: doc.effectiveDate,
          issuingEntity: doc.issuingEntity,
          r2Key,
          r2Url,
          fileSizeBytes,
          scrapedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`❌ Failed to process ${doc.racCode}:`, error.message);
        stats.failed++;
      }
    }
    
    // Create manifest
    const manifest = {
      lastUpdated: new Date().toISOString(),
      sourceUrl: RAC_PAGE_URL,
      totalDocuments: manifestDocuments.length,
      documents: manifestDocuments,
    };
    
    // Save manifest to src/data/rac-manifest.json
    const dataDir = path.resolve(__dirname, "../src/data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const manifestPath = path.join(dataDir, "rac-manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    console.log(`\n📋 Manifest saved to: ${manifestPath}`);
    
    // Create backup with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(dataDir, `rac-manifest-backup-${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(manifest, null, 2), "utf8");
    console.log(`📋 Backup saved to: ${backupPath}`);
    
    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY REPORT");
    console.log("=".repeat(60));
    console.log(`Total documents found:     ${stats.total}`);
    console.log(`Successfully uploaded:     ${stats.successful}`);
    console.log(`Skipped (already exists):  ${stats.skipped}`);
    console.log(`Failed:                    ${stats.failed}`);
    console.log("=".repeat(60));
    
    if (stats.failed > 0) {
      console.log("\n⚠️  Some documents failed to process. Check the logs above for details.");
      process.exit(1);
    } else {
      console.log("\n✅ All RAC documents processed successfully!");
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the scraper
processAndUploadDocuments();
