const axios = require("axios");
const fs = require("fs");
const path = require("path");

const bucketName = "notams-data"; // Cloudflare R2 bucket name
const NOTAM_ACCESS_KEY = process.env.CF_ACCESS_KEY_ID_NOTAMS;
const NOTAM_SECRET_KEY = process.env.CF_SECRET_KEY_NOTAMS;
const NOTAM_ENDPOINT = process.env.CF_ENDPOINT_NOTAMS;

async function uploadToCloudflareR2() {
  const folderPath = path.resolve(__dirname, "../data/local_pdfs"); // Replace with actual local PDFs directory
  const files = fs.readdirSync(folderPath).filter((file) => file.endsWith(".pdf"));

  for (const file of files) {
    const filePath = path.join(folderPath, file);

    try {
      const response = await axios.put(`${NOTAM_ENDPOINT}/${bucketName}/${file}`, fs.readFileSync(filePath), {
        auth: {
          username: NOTAM_ACCESS_KEY,
          password: NOTAM_SECRET_KEY,
        },
        headers: {
          "Content-Type": "application/pdf",
        },
      });

      console.log(`Uploaded ${file} successfully to NOTAM bucket.`);
    } catch (err) {
      console.error(`Error uploading ${file}: ${err.message}`);
    }
  }
}

module.exports = uploadToCloudflareR2;