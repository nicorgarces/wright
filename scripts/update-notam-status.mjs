import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Import CommonJS dependencies using `require`
const cheerio = require("cheerio");

// Fix for pdf-parse
import pdfParse from "pdf-parse";

import fs from "fs"; // Native ESModule

const NOTAM_PAGE_URL =
  "https://www.aerocivil.gov.co/publicaciones/3708/listas-de-verificacion-y-listas-de-notam-validos/";

async function fetchText(url) {
  const response = await fetch(url); // Use globally available fetch
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.statusText}`);
  }
  return await response.text();
}

// Function to fetch PDFs as buffer
async function fetchPdfBuffer(url) {
  console.log(`⬇️ Downloading: ${url}`);
  const response = await fetch(url); // Use globally available fetch

  if (!response.ok) {
    throw new Error(`Failed to fetch PDF from ${url}: ${response.statusText}`);
  }

  // Return the file content as a buffer
  const pdfBuffer = await response.arrayBuffer();

  // Optionally save locally for debugging
  try {
    const fileName = url.split("?").slice(-1)[0]; // Extract identifier from URL
    fs.writeFileSync(`debug-${fileName}.pdf`, Buffer.from(pdfBuffer)); // Save locally
    console.log(`📄 Saved debug PDF: debug-${fileName}.pdf`);
  } catch (e) {
    console.warn(`⚠️ Failed to save debug PDF: ${e.message}`);
  }

  return Buffer.from(pdfBuffer);
}

// Function to process PDFs using pdf-parse
async function processPdf(url) {
  try {
    const pdfBuffer = await fetchPdfBuffer(url); // Fetch the PDF file buffer
    const pdfData = await pdfParse(pdfBuffer); // Extract text from PDF
    console.log(`📄 Extracted Text: ${pdfData.text}`); // Log extracted text
    return pdfData.text;
  } catch (err) {
    console.error(`⚠️ Error processing PDF ${url}:`, err.message);
    return null; // Handle errors gracefully
  }
}

// Function to scrape and find NOTAM PDF links
async function findNotamPdfUrls() {
  console.log(`🔗 Fetching NOTAM page at ${NOTAM_PAGE_URL}...`);
  const html = await fetchText(NOTAM_PAGE_URL);

  // Optional: keep a copy of the fetched HTML for debugging
  try {
    fs.writeFileSync("debug-page.html", html, "utf8");
    console.log("⚠️ Saved raw HTML for inspection: debug-page.html");
  } catch (e) {
    console.warn("Could not save debug-page.html:", e.message);
  }

  const $ = cheerio.load(html);
  const pdfUrls = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href"); // Extract the link URL
    const text = ($(el).text() || "").trim();

    // Debugging output
    console.log("Found link:", href, `(text: ${text})`);

    if (!href) return;

    const lowerHref = href.toLowerCase();
    const lowerText = text.toLowerCase();

    const isPdf =
      lowerHref.endsWith(".pdf") ||
      lowerHref.includes(".pdf?") ||
      lowerText.endsWith(".pdf");

    if (!isPdf) return;

    // Filter links related to NOTAM PDFs by aerodrome (heuristic)
    const looksLikeByAerodrome =
      lowerHref.includes("alfa2") ||
      lowerHref.includes("bravo2") ||
      lowerHref.includes("charlie2") ||
      lowerText.includes("alfa2") ||
      lowerText.includes("bravo2") ||
      lowerText.includes("charlie2");

    if (!looksLikeByAerodrome) return;

    const absoluteUrl = new URL(href, NOTAM_PAGE_URL).toString(); // Resolve relative links
    pdfUrls.push(absoluteUrl);
  });

  if (pdfUrls.length === 0) {
    console.warn("⚠️ No NOTAM PDFs found on the page.");
  } else {
    console.log("📎 Found NOTAM PDFs:", pdfUrls);
  }

  return pdfUrls;
}

// Main function to scrape, download, and process NOTAM PDFs
async function main() {
  try {
    const notamPdfUrls = await findNotamPdfUrls();
    const notamStatuses = [];

    for (const url of notamPdfUrls) {
      const pdfText = await processPdf(url); // Process each PDF
      if (pdfText) {
        notamStatuses.push({ url, text: pdfText });
      }
    }

    // Save the NOTAM statuses to a JSON file
    const outputPath = "./src/data/notamStatus.json";
    fs.writeFileSync(outputPath, JSON.stringify(notamStatuses, null, 2), "utf8");
    console.log(`✅ Wrote NOTAM status for ${notamStatuses.length} aerodromes to ${outputPath}`);
  } catch (err) {
    console.error("❌ Uncaught error:", err.message);
  }
}

main().catch((err) => console.error("❌ Error occurred:", err.message));