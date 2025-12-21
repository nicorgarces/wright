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
 * Source: https://www.aerocivil.gov.co/documentos/254/reglamentos-aeronauticos-de-colombia-rac/
 */

const RAC_PAGE_URL = "https://www.aerocivil.gov.co/documentos/254/reglamentos-aeronauticos-de-colombia-rac/";

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

    console.log("⏳ Waiting for page content to load...");
    
    // Try to select "Show 100" results per page if pagination exists
    try {
      // Look for pagination dropdown/button
      const paginationSelector = 'select[name*="length"], button:contains("100"), a:contains("100")';
      await page.waitForSelector('table, .document-list, .file-list, a[href*=".pdf"]', { timeout: 10000 });
      
      // Try to click "Show 100" if available
      const show100Button = await page.$('button:contains("100"), a:contains("100")');
      if (show100Button) {
        console.log("📄 Setting pagination to show 100 results...");
        await show100Button.click();
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log("ℹ️  No pagination control found or not needed");
    }

    console.log("🔍 Extracting RAC document information...");
    
    // Extract document data from the page
    const documents = await page.evaluate(() => {
      const docs = [];
      
      // Look for PDF links on the page
      const links = Array.from(document.querySelectorAll('a[href*=".pdf"], a[href*="descargar"]'));
      
      links.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href) return;
        
        // Get absolute URL
        const url = new URL(href, window.location.href).toString();
        
        // Skip if not a PDF or download link
        if (!url.toLowerCase().includes(".pdf") && !url.toLowerCase().includes("descargar")) {
          return;
        }
        
        // Extract text content and metadata from the link or parent elements
        const linkText = link.textContent.trim();
        const parentRow = link.closest("tr, .document-item, .file-item, li, div[class*='document']");
        
        let racCode = "";
        let title = linkText;
        let description = "";
        let publicationDate = "";
        
        // Try to extract RAC code from link text or nearby elements
        const racMatch = linkText.match(/RAC\s*(\d+)/i) || 
                        (parentRow ? parentRow.textContent.match(/RAC\s*(\d+)/i) : null);
        if (racMatch) {
          racCode = `RAC ${racMatch[1]}`;
        }
        
        // Try to get title from parent row or nearby elements
        if (parentRow) {
          const cells = parentRow.querySelectorAll("td, .title, .document-title, h3, h4");
          if (cells.length > 0) {
            title = Array.from(cells).map(cell => cell.textContent.trim()).filter(Boolean)[0] || linkText;
          }
          
          // Look for description
          const descElements = parentRow.querySelectorAll(".description, .summary, p");
          if (descElements.length > 0) {
            description = Array.from(descElements).map(el => el.textContent.trim()).filter(Boolean).join(" ");
          }
          
          // Look for date
          const dateMatch = parentRow.textContent.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
          if (dateMatch) {
            publicationDate = dateMatch[1];
          }
        }
        
        // If no RAC code found yet, try to extract from URL or title
        if (!racCode) {
          const urlRacMatch = url.match(/RAC[_\s-]*(\d+)/i);
          if (urlRacMatch) {
            racCode = `RAC ${urlRacMatch[1]}`;
          }
        }
        
        docs.push({
          racCode: racCode || "RAC Unknown",
          title: title || "Untitled Document",
          description: description,
          pdfUrl: url,
          publicationDate: publicationDate,
        });
      });
      
      return docs;
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
            r2Key,
            r2Url: `${R2_CONFIG.endpoint}/${R2_CONFIG.bucketName}/${r2Key}`,
            publicationDate: doc.publicationDate,
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
          r2Key,
          r2Url,
          publicationDate: doc.publicationDate,
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
