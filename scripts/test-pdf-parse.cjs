import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"; // Use ES Module path
import fs from "fs/promises";

// Path to the PDF file
const pdfPath = "C:\\Users\\nicol\\OneDrive\\Desktop\\AIPColombia\\API Tokens.pdf";

(async () => {
  try {
    // Read the PDF file as a buffer
    const pdfBuffer = await fs.readFile(pdfPath);

    // Load the PDF with the modern pdfjsLib
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;

    // Extract text from the first page
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    const extractedText = textContent.items.map((item) => item.str).join(" ");

    console.log("Extracted PDF Text:\n", extractedText);
  } catch (error) {
    console.error("Error parsing PDF:", error.message);
  }
})();