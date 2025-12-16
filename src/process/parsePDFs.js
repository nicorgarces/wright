import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the local_pdfs and plain_texts folders
const pdfsFolder = path.resolve(__dirname, "../../data/local_pdfs");
const textsFolder = path.resolve(__dirname, "../../data/plain_texts");

function parsePDFs() {
  if (!fs.existsSync(pdfsFolder) || fs.readdirSync(pdfsFolder).length === 0) {
    console.error(`❌ No PDF files found in folder: ${pdfsFolder}`);
    return;
  }

  // Ensure the plain_texts folder exists
  if (fs.existsSync(textsFolder)) {
    if (!fs.lstatSync(textsFolder).isDirectory()) {
      console.error(`❌ Path exists but is not a directory: ${textsFolder}`);
      return;
    }
  } else {
    fs.mkdirSync(textsFolder, { recursive: true });
    console.log(`📂 Created folder: ${textsFolder}`);
  }

  const pdfFiles = fs.readdirSync(pdfsFolder).filter((file) => file.endsWith(".pdf"));

  pdfFiles.forEach((pdfFile) => {
    const inputPath = path.join(pdfsFolder, pdfFile);
    const outputPath = path.join(textsFolder, `${path.basename(pdfFile, ".pdf")}.txt`);

    exec(`pdftotext "${inputPath}" "${outputPath}"`, (error) => {
      if (error) {
        console.error(`❌ Failed to convert ${pdfFile}: ${error.message}`);
      } else {
        console.log(`📝 Converted: ${pdfFile} -> ${outputPath}`);
      }
    });
  });
}

export default parsePDFs;