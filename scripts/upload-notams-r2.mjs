import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudflare R2 configuration from environment variables
const R2_ACCESS_KEY = process.env.CF_ACCESS_KEY_ID_NOTAMS;
const R2_SECRET_KEY = process.env.CF_SECRET_KEY_NOTAMS;
const R2_ENDPOINT = process.env.CF_ENDPOINT_NOTAMS;
const BUCKET_NAME = "notam-pdfs";

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

async function uploadFile(filePath, key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: key.endsWith(".json") ? "application/json" : "text/plain",
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);
    console.log(`✅ Uploaded: ${key}`);
  } catch (error) {
    console.error(`❌ Failed to upload ${key}:`, error.message);
    throw error;
  }
}

async function uploadNotamsToR2() {
  try {
    console.log("🚀 Starting NOTAM upload to Cloudflare R2...");

    // Validate environment variables
    if (!R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_ENDPOINT) {
      throw new Error(
        "Missing required environment variables: CF_ACCESS_KEY_ID_NOTAMS, CF_SECRET_KEY_NOTAMS, or CF_ENDPOINT_NOTAMS"
      );
    }

    // Upload plain text NOTAM files
    const plainTextsDir = path.resolve(__dirname, "../data/plain_texts");
    if (fs.existsSync(plainTextsDir)) {
      const files = fs.readdirSync(plainTextsDir).filter((file) => file.endsWith(".txt"));
      console.log(`📄 Found ${files.length} plain text files to upload`);

      for (const file of files) {
        const filePath = path.join(plainTextsDir, file);
        const key = `plain_texts/${file}`;
        await uploadFile(filePath, key);
      }
    } else {
      console.warn("⚠️ Plain texts directory not found:", plainTextsDir);
    }

    // Upload consolidated notams.json
    const notamStatusPath = path.resolve(__dirname, "../src/data/notamStatus.json");
    if (fs.existsSync(notamStatusPath)) {
      const notamData = JSON.parse(fs.readFileSync(notamStatusPath, "utf8"));
      
      // Create consolidated notams.json with metadata
      const consolidatedData = {
        metadata: {
          timestamp: new Date().toISOString(),
          sourceUrl: "https://www.aerocivil.gov.co/publicaciones/3708/listas-de-verificacion-y-listas-de-notam-validos/",
          totalNotams: notamData.length,
        },
        notams: notamData,
      };

      const consolidatedPath = path.resolve(__dirname, "../data/notams.json");
      fs.writeFileSync(consolidatedPath, JSON.stringify(consolidatedData, null, 2), "utf8");
      await uploadFile(consolidatedPath, "notams.json");
      console.log(`📦 Uploaded consolidated notams.json`);
    } else {
      console.warn("⚠️ NOTAM status file not found:", notamStatusPath);
    }

    // Upload airport status data if it exists
    const airportStatusPath = path.resolve(__dirname, "../src/data/airportStatus.json");
    if (fs.existsSync(airportStatusPath)) {
      await uploadFile(airportStatusPath, "airportStatus.json");
      console.log(`🛫 Uploaded airport status data`);
    }

    console.log("✅ All NOTAM data uploaded successfully to R2!");
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    process.exit(1);
  }
}

uploadNotamsToR2();
