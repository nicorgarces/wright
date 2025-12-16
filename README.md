# Wright - Colombian Aviation NOTAM Management System

Automated NOTAM (Notices to Airmen) data pipeline for Colombian airports with AI-powered chatbot assistance.

## Features

- 🔄 Automated NOTAM fetching every 5 minutes from Aerocivil
- ☁️ Cloud storage on Cloudflare R2
- 🛫 Airport operational status parsing and API
- 🤖 AI chatbot for natural language NOTAM questions
- 📊 Real-time status tracking for Colombian airports

## Prerequisites

- Node.js 20 or higher
- npm or bun package manager
- Cloudflare account (for R2 storage and Workers AI)

## Environment Variables

This project requires the following environment variables. Copy `src/APIkeys.env.example` to `src/APIkeys.env` and fill in your values:

### Cloudflare R2 - NOTAM Workflow
- `CF_ACCESS_KEY_ID_NOTAMS` - R2 access key ID for NOTAM storage
- `CF_SECRET_KEY_NOTAMS` - R2 secret access key
- `CF_ENDPOINT_NOTAMS` - R2 endpoint URL (e.g., `https://[account-id].r2.cloudflarestorage.com`)

### Cloudflare R2 - Airport Data Workflow
- `CF_ACCESS_KEY_ID_AIRPORTS` - R2 access key ID for airport data
- `CF_SECRET_KEY_AIRPORTS` - R2 secret access key
- `CF_ENDPOINT_AIRPORTS` - R2 endpoint URL

### Cloudflare Workers AI
- `CF_ACCOUNT_ID` - Your Cloudflare account ID
- `CF_API_TOKEN` - Cloudflare API token with AI permissions

## GitHub Secrets Setup

For automated GitHub Actions workflow, configure these secrets in your repository settings:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following repository secrets:
   - `CF_ACCESS_KEY_ID_NOTAMS`
   - `CF_SECRET_KEY_NOTAMS`
   - `CF_ENDPOINT_NOTAMS`
   - `CF_ACCOUNT_ID`
   - `CF_API_TOKEN`

## Installation

```bash
# Install dependencies
npm install

# Or using bun
bun install
```

## Usage

### Manual NOTAM Updates

```bash
# Fetch NOTAMs from Aerocivil
npm run notams:fetch

# Parse airport operational status
npm run notams:parse-status

# Upload to Cloudflare R2
npm run notams:upload

# Run all steps in sequence
npm run notams:update
```

### Automated Updates

The GitHub Actions workflow (`.github/workflows/update-notams.yml`) runs automatically every 5 minutes to:
1. Fetch latest NOTAMs
2. Parse airport statuses
3. Upload to R2
4. Commit updated data files

You can also trigger the workflow manually from the Actions tab.

## API Endpoints

### GET /api/notams/status
Returns operational status for all Colombian airports.

**Query Parameters:**
- `icao` (optional) - Filter by ICAO code (e.g., `?icao=SKBO`)

**Example Response:**
```json
{
  "metadata": {
    "generatedAt": "2025-12-16T17:00:00Z",
    "totalAirports": 15,
    "resultsCount": 15
  },
  "airports": [
    {
      "icao": "SKBO",
      "airportName": "Bogotá - El Dorado",
      "overallStatus": "operational",
      "activeNotamsCount": 3,
      "lastUpdate": "2025-12-16T17:00:00Z"
    }
  ]
}
```

### GET /api/notams/status/[icao]
Returns detailed NOTAM information for a specific airport.

**Example:** `/api/notams/status/SKBO`

**Example Response:**
```json
{
  "icao": "SKBO",
  "airportName": "Bogotá - El Dorado",
  "overallStatus": "limited",
  "lastUpdate": "2025-12-16T17:00:00Z",
  "activeNotams": [
    {
      "text": "TWY H BTN TWY H4 AND TWY L LTD...",
      "status": "limited",
      "restrictions": ["taxiway_limitations"],
      "validityPeriod": {
        "start": "2025-10-28T15:48:00Z",
        "end": "2025-12-23T23:59:00Z"
      },
      "sourceUrl": "https://..."
    }
  ],
  "summary": {
    "totalNotams": 3,
    "statusCounts": {
      "operational": 1,
      "limited": 2,
      "closed": 0
    }
  }
}
```

### POST /api/notams/ask
AI chatbot endpoint for natural language NOTAM questions.

**Request Body:**
```json
{
  "question": "Is SKBO runway 13L/31R open?"
}
```

**Example Response:**
```json
{
  "question": "Is SKBO runway 13L/31R open?",
  "answer": "Based on the current NOTAM data, SKBO (Bogotá - El Dorado) has limited operations...",
  "metadata": {
    "model": "@cf/meta/llama-3-8b-instruct",
    "timestamp": "2025-12-16T17:00:00Z"
  }
}
```

## File Structure

```
.
├── .github/
│   └── workflows/
│       └── update-notams.yml       # Automated pipeline
├── data/
│   ├── plain_texts/                # Plain text NOTAM files
│   └── notams.json                 # Consolidated NOTAM data
├── scripts/
│   ├── update-notam-status.mjs     # Fetch NOTAMs from Aerocivil
│   ├── parse-notam-status.mjs      # Parse airport operational status
│   └── upload-notams-r2.mjs        # Upload to Cloudflare R2
└── src/
    ├── app/api/notams/
    │   ├── status/route.js         # GET /api/notams/status
    │   ├── status/[icao]/route.js  # GET /api/notams/status/[icao]
    │   └── ask/route.js            # POST /api/notams/ask (AI chatbot)
    ├── data/
    │   ├── airportStatus.json      # Parsed airport status
    │   └── notamStatus.json        # Raw NOTAM data
    └── APIkeys.env.example         # Environment variables template
```

## Security

⚠️ **Important:** Never commit `src/APIkeys.env` or any files containing real API keys to version control. The `.gitignore` is configured to exclude `*.env` files (except `*.env.example`).

## Development

```bash
# Run in development mode
npm run dev

# Test NOTAM fetching
npm run notams:fetch

# Test status parsing
npm run notams:parse-status
```

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]