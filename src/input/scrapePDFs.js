import puppeteer from "puppeteer";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the local_pdfs folder path
const pdfsFolder = path.resolve(__dirname, "../../data/local_pdfs");

async function scrapePDFs() {
  // Launch Puppeteer for scraping
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const NOTAM_PAGE_URL =
    "https://www.aerocivil.gov.co/publicaciones/3708/listas-de-verificacion-y-listas-de-notam-validos/";
  console.log(`Navigating to: ${NOTAM_PAGE_URL}`);
  await page.goto(NOTAM_PAGE_URL, { waitUntil: "networkidle2" });

  // Extract PDF links
  const pdfLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a"));
    const filteredLinks = [];

    const targetFiles = ["alfa1.pdf", "alfa2.pdf", "bravo1.pdf", "bravo2.pdf", "charlie1.pdf", "charlie2.pdf"];
    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const text = (link.textContent || "").trim();
      const lowerHref = href.toLowerCase();
      const lowerText = text.toLowerCase();

      const matchesTargetFile = targetFiles.some((fileName) => lowerHref.includes(fileName) || lowerText.includes(fileName));
      if (matchesTargetFile) {
        filteredLinks.push(new URL(href, document.baseURI).href);
      }
    });

    return filteredLinks;
  });

  await browser.close(); // Close the browser
  console.log(`📎 Found ${pdfLinks.length} NOTAM PDFs:`, pdfLinks);

  if (!fs.existsSync(pdfsFolder)) {
    fs.mkdirSync(pdfsFolder, { recursive: true });
    console.log(`📂 Created folder: ${pdfsFolder}`);
  }

  // Download each PDF using Axios
  for (const pdfUrl of pdfLinks) {
    const urlParams = new URL(pdfUrl).searchParams;
    const fileId = urlParams.get("idFile"); // Extract "idFile" from query parameters
    const fileName = `notam-idFile-${fileId}.pdf`;
    const filePath = path.join(pdfsFolder, fileName);

    try {
      console.log(`⬇️ Attempting download: ${pdfUrl}`);
      const response = await axios.get(pdfUrl, {
        responseType: "arraybuffer", // Retrieve the file as binary data
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
          Referer: NOTAM_PAGE_URL, // Simulate the originating page
        },
      });

      fs.writeFileSync(filePath, response.data); // Save the PDF locally
      console.log(`✅ Downloaded: ${fileName}`);
    } catch (error) {
      console.error(`❌ Failed to download ${fileName}: ${error.message}`);
    }
  }

  console.log("✅ PDF scraping complete.");
  return true;
}

export default scrapePDFs;