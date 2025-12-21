import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

/**
 * Utility for uploading files to Cloudflare R2 storage
 * Uses AWS S3 SDK which is compatible with R2
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Sleep function for retry delays
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Initialize S3 client for R2
 * @param {Object} config - Configuration object
 * @param {string} config.accessKeyId - R2 access key ID
 * @param {string} config.secretAccessKey - R2 secret access key
 * @param {string} config.endpoint - R2 endpoint URL
 * @returns {S3Client} Configured S3 client
 */
export function createR2Client(config) {
  const { accessKeyId, secretAccessKey, endpoint } = config;

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("Missing required R2 configuration: accessKeyId, secretAccessKey, or endpoint");
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Check if a file exists in R2 bucket
 * @param {S3Client} client - S3 client instance
 * @param {string} bucketName - Name of the R2 bucket
 * @param {string} key - Object key in the bucket
 * @returns {Promise<boolean>} True if file exists, false otherwise
 */
export async function fileExistsInR2(client, bucketName, key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (error) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Upload a file to R2 with retry logic
 * @param {S3Client} client - S3 client instance
 * @param {string} bucketName - Name of the R2 bucket
 * @param {string} key - Object key in the bucket
 * @param {Buffer} body - File content as Buffer
 * @param {Object} options - Additional options
 * @param {string} options.contentType - MIME type of the file
 * @param {Object} options.metadata - Additional metadata
 * @param {number} options.retries - Number of retries (default: MAX_RETRIES)
 * @returns {Promise<string>} R2 URL of the uploaded file
 */
export async function uploadToR2(client, bucketName, key, body, options = {}) {
  const {
    contentType = "application/octet-stream",
    metadata = {},
    retries = MAX_RETRIES,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: {
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      });

      await client.send(command);

      // Construct R2 URL
      const endpoint = client.config.endpoint;
      let r2Url;
      
      if (typeof endpoint === "string") {
        r2Url = `${endpoint}/${bucketName}/${key}`;
      } else if (endpoint && typeof endpoint === "object") {
        // Handle endpoint as URL object or async function
        const endpointStr = await (typeof endpoint === "function" ? endpoint() : endpoint.url || endpoint.hostname);
        r2Url = `${endpointStr}/${bucketName}/${key}`;
      } else {
        r2Url = `https://${bucketName}.r2.cloudflarestorage.com/${key}`;
      }

      return r2Url;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        console.warn(
          `⚠️ Upload attempt ${attempt + 1}/${retries + 1} failed for ${key}. Retrying in ${delay}ms...`
        );
        await sleep(delay);
      }
    }
  }

  throw new Error(`Failed to upload ${key} after ${retries + 1} attempts: ${lastError.message}`);
}

/**
 * Upload multiple files to R2 with progress tracking
 * @param {S3Client} client - S3 client instance
 * @param {string} bucketName - Name of the R2 bucket
 * @param {Array<Object>} files - Array of file objects with {key, body, contentType, metadata}
 * @param {Object} options - Additional options
 * @param {boolean} options.skipExisting - Skip files that already exist in R2
 * @param {Function} options.onProgress - Callback function for progress updates
 * @returns {Promise<Object>} Summary of upload results
 */
export async function uploadBatchToR2(client, bucketName, files, options = {}) {
  const { skipExisting = false, onProgress } = options;

  const results = {
    successful: [],
    failed: [],
    skipped: [],
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const { key, body, contentType, metadata } = file;

    try {
      // Check if file exists and should be skipped
      if (skipExisting) {
        const exists = await fileExistsInR2(client, bucketName, key);
        if (exists) {
          console.log(`⏭️  Skipping existing file: ${key}`);
          results.skipped.push({ key });
          if (onProgress) onProgress({ current: i + 1, total: files.length, status: "skipped", key });
          continue;
        }
      }

      const r2Url = await uploadToR2(client, bucketName, key, body, {
        contentType,
        metadata,
      });

      console.log(`✅ Uploaded: ${key}`);
      results.successful.push({ key, r2Url });
      if (onProgress) onProgress({ current: i + 1, total: files.length, status: "success", key });
    } catch (error) {
      console.error(`❌ Failed to upload ${key}:`, error.message);
      results.failed.push({ key, error: error.message });
      if (onProgress) onProgress({ current: i + 1, total: files.length, status: "failed", key, error: error.message });
    }
  }

  return results;
}
