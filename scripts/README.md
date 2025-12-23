# RAC PDF Scraping Scripts

This directory contains scripts for scraping RAC (Reglamentos Aeronáuticos de Colombia) regulation PDFs from the Aerocivil website and storing them in Cloudflare R2.

## Files

### Main Scripts

- **`scrape-rac-pdfs.mjs`** - Main scraper script that downloads RAC PDFs and uploads to R2
- **`upload-notams-r2.mjs`** - NOTAM upload script (existing)
- **`update-notam-status.mjs`** - NOTAM status update script (existing)

### Utilities

- **`utils/upload-to-r2.mjs`** - Reusable utility for uploading files to Cloudflare R2 with retry logic

### Database

- **`db/create-rac-tables.sql`** - SQL schema for RAC documents table
- **`db/setup-rac-tables.mjs`** - Script to execute SQL schema and setup database

## Usage

### 1. Setup Environment Variables

Copy `src/APIkeys.env.example` to `src/APIkeys.env` and fill in your credentials:

```bash
# Cloudflare R2 - RAC Documents Workflow
CF_ACCESS_KEY_ID_RAC=your_access_key_id_here
CF_SECRET_KEY_RAC=your_secret_key_here
CF_ENDPOINT_RAC=https://your-account-id.r2.cloudflarestorage.com
CF_BUCKET_NAME_RAC=wright-rac-documents

# Database connection (for setup-rac-tables.mjs)
DATABASE_URL=postgresql://user:password@host:port/database
```

### 2. Setup Database Tables

Run the database setup script to create the necessary tables:

```bash
npm run rac:setup-db
```

This will:
- Connect to your database using the `DATABASE_URL` environment variable
- Create the `rac_documents` table with indexes
- Verify the table structure

### 3. Scrape RAC PDFs

Run the scraper to download and upload RAC PDFs:

```bash
npm run rac:scrape
```

This will:
- Launch a headless browser and navigate to the Aerocivil RAC page
- Extract all RAC document metadata (code, title, description, publication date, PDF URL)
- Download each PDF
- Upload PDFs to Cloudflare R2 (skipping files that already exist)
- Generate a manifest file at `src/data/rac-manifest.json`
- Create a timestamped backup of the manifest
- Display a summary report

## Output

### Manifest File

The scraper generates `src/data/rac-manifest.json` with the following structure:

```json
{
  "lastUpdated": "2024-12-21T10:00:00Z",
  "sourceUrl": "https://www.aerocivil.gov.co/documentos/254/reglamentos-aeronauticos-de-colombia-rac/",
  "totalDocuments": 50,
  "documents": [
    {
      "racCode": "RAC 1",
      "title": "Definiciones y abreviaturas",
      "description": "Document description...",
      "pdfUrl": "https://www.aerocivil.gov.co/...",
      "r2Key": "rac-documents/RAC_1.pdf",
      "r2Url": "https://...r2.cloudflarestorage.com/rac-documents/RAC_1.pdf",
      "publicationDate": "2024-11-23",
      "fileSizeBytes": 1234567,
      "scrapedAt": "2024-12-21T10:00:00Z"
    }
  ]
}
```

### R2 Storage Structure

PDFs are stored in R2 with the following structure:

```
wright-rac-documents/
  rac-documents/
    RAC_1.pdf
    RAC_2.pdf
    RAC_43.pdf
    ...
```

## Features

- ✅ Headless browser scraping with Puppeteer
- ✅ Automatic pagination handling (show 100 results)
- ✅ PDF download with progress logging
- ✅ R2 upload with retry logic (3 attempts with exponential backoff)
- ✅ Skip already-uploaded files
- ✅ Generate JSON manifest with metadata
- ✅ Timestamped manifest backups
- ✅ Comprehensive error handling
- ✅ Summary report with statistics

## Error Handling

The scraper includes robust error handling:

- **Network errors**: Retries PDF downloads with exponential backoff
- **R2 upload failures**: Retries up to 3 times with increasing delays
- **Missing files**: Skips and logs errors, continues with remaining files
- **Invalid PDFs**: Logs error and continues with next document

## Dependencies

- `puppeteer` - Headless browser for web scraping
- `@aws-sdk/client-s3` - S3-compatible SDK for R2 uploads
- `@neondatabase/serverless` - Database client for Neon Postgres

## Troubleshooting

### Browser not installed

If you get "Browser not installed" errors, install Chrome for Puppeteer:

```bash
npx puppeteer browsers install chrome
```

### R2 connection errors

Verify your R2 credentials are correct in the `.env` file and that your R2 bucket exists.

### Database connection errors

Ensure your `DATABASE_URL` is correctly set and the database is accessible.

## Contributing

When modifying these scripts, please:

1. Maintain consistent error handling patterns
2. Add clear logging messages with emoji prefixes
3. Update this README if adding new features
4. Test scripts before committing
