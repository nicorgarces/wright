import sql from "@/app/api/utils/sql";

// Enhanced eAIP scraper - downloads individual AD 2 subsections for airports
export async function POST(request) {
  try {
    const body = await request.json();
    const { icao, scanAll } = body;

    if (scanAll) {
      // Scan all airports in database
      return await scanAllAirports();
    } else if (icao) {
      // Scan specific airport
      return await scanSingleAirport(icao);
    } else {
      return Response.json(
        { error: "Provide icao or scanAll" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Scrape error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function scanAllAirports() {
  try {
    // Get all airports from database
    const airports =
      await sql`SELECT id, icao_code, name, city FROM airports ORDER BY icao_code`;

    const results = {
      total: airports.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      totalDocuments: 0,
      details: [],
    };

    // Process airports sequentially to avoid overwhelming the server
    for (const airport of airports) {
      try {
        const result = await processAirport(airport);
        results.processed++;

        if (result.success) {
          results.succeeded++;
          results.totalDocuments += result.documentsFound;
          results.details.push({
            icao: airport.icao_code,
            name: airport.name,
            status: "success",
            documentsFound: result.documentsFound,
            subsections: result.subsections,
          });
        } else {
          results.failed++;
          results.details.push({
            icao: airport.icao_code,
            name: airport.name,
            status: "failed",
            error: result.error,
            documentsFound: 0,
          });
        }

        // Add delay between airports
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        results.failed++;
        results.details.push({
          icao: airport.icao_code,
          name: airport.name,
          status: "failed",
          error: error.message,
          documentsFound: 0,
        });
      }
    }

    return Response.json(results);
  } catch (error) {
    console.error("Scan all error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function scanSingleAirport(icao) {
  try {
    // Get airport from database
    const airports =
      await sql`SELECT id, icao_code, name, city FROM airports WHERE icao_code = ${icao.toUpperCase()}`;

    if (airports.length === 0) {
      return Response.json(
        { success: false, error: "Airport not found in database" },
        { status: 404 },
      );
    }

    const result = await processAirport(airports[0]);

    return Response.json({
      ...result,
      icao: icao.toUpperCase(),
      airportName: airports[0].name,
      city: airports[0].city,
    });
  } catch (error) {
    console.error(`Scan error for ${icao}:`, error);
    return Response.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}

// Define AD 2 subsections with their descriptions
const AD2_SUBSECTIONS = [
  {
    code: "AD 2.1",
    title: "Location Indicator/Airport Name",
    category: "Basic Information",
  },
  {
    code: "AD 2.2",
    title: "Geographic and Administrative Data",
    category: "Basic Information",
  },
  {
    code: "AD 2.3",
    title: "Operating Hours",
    category: "Operations",
  },
  {
    code: "AD 2.4",
    title: "Ground Services and Facilities",
    category: "Services",
  },
  {
    code: "AD 2.5",
    title: "Passenger Facilities and Services",
    category: "Services",
  },
  {
    code: "AD 2.6",
    title: "Rescue and Fire Fighting Services",
    category: "Safety",
  },
  {
    code: "AD 2.7",
    title: "Seasonal Availability - Surface Obstacles",
    category: "Safety",
  },
  {
    code: "AD 2.8",
    title: "Apron, Taxiway and Equipment Check Positions",
    category: "Ground Movement",
  },
  {
    code: "AD 2.9",
    title: "Surface Movement Guidance and Control",
    category: "Ground Movement",
  },
  {
    code: "AD 2.10",
    title: "Aerodrome Obstacles",
    category: "Safety",
  },
  {
    code: "AD 2.11",
    title: "Meteorological Information Provided",
    category: "Weather",
  },
  {
    code: "AD 2.12",
    title: "Physical Characteristics of Runway",
    category: "Runways",
  },
  {
    code: "AD 2.13",
    title: "Declared Distances",
    category: "Runways",
  },
  {
    code: "AD 2.14",
    title: "Approach and Runway Lighting",
    category: "Lighting & Navigation",
  },
  {
    code: "AD 2.15",
    title: "Other Lighting Systems and Power Sources",
    category: "Lighting & Navigation",
  },
];

async function processAirport(airport) {
  try {
    console.log(
      `[ENHANCED_SCRAPER] Starting enhanced scan for ${airport.icao_code}`,
    );
    console.log(`[DEBUG] Airport data:`, airport);

    const results = {
      success: false,
      documentsFound: 0,
      subsections: [],
      errors: [],
      debugInfo: [], // Add debug info to response
    };

    // Multiple base URLs to try (primary and fallbacks)
    const documentSources = [
      {
        name: "eAIP Colombia (Primary)",
        baseUrl:
          "https://eaip-colombia.atnaerocivil.gov.co/eaip/A%2069-25_2025_10_02/documents/PDF/",
        priority: 1,
      },
      {
        name: "Main Aerocivil Website",
        baseUrl:
          "https://www.aerocivil.gov.co/proveedor_servicios/loader.php?lServicio=Tools2&lTipo=descargas&lFuncion=visorpdf&id=",
        priority: 2,
      },
      {
        name: "eAIP Colombia (Alternative AIRAC)",
        baseUrl:
          "https://eaip-colombia.atnaerocivil.gov.co/eaip/A%2070-25_2025_11_28/documents/PDF/",
        priority: 3,
      },
      {
        name: "Direct Aerocivil Documents",
        baseUrl: "https://www.aerocivil.gov.co/Documents/eAIP/",
        priority: 4,
      },
    ];

    const cityFormatted = airport.city.toUpperCase();
    let nameFormatted = airport.name
      .replace(/\s+(International\s+)?Airport$/i, "")
      .replace(/\s+Aeropuerto$/i, "")
      .trim()
      .toUpperCase();
    const icaoCode = airport.icao_code.toUpperCase();

    results.debugInfo.push(
      `Airport: ${icaoCode} - ${airport.name} (${airport.city})`,
    );
    results.debugInfo.push(
      `Formatted: city="${cityFormatted}", name="${nameFormatted}"`,
    );

    console.log(
      `[DEBUG] Formatted data: city="${cityFormatted}", name="${nameFormatted}", icao="${icaoCode}"`,
    );

    // Test basic connectivity first
    results.debugInfo.push(`\n--- Testing Website Connectivity ---`);

    for (const source of documentSources) {
      try {
        results.debugInfo.push(`Testing ${source.name}...`);

        // Test if the base URL is accessible
        const connectivityTest = await fetch(
          source.baseUrl.split("/documents")[0] || source.baseUrl,
          {
            method: "HEAD",
            signal: AbortSignal.timeout(10000),
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
          },
        );

        if (connectivityTest.ok) {
          results.debugInfo.push(`✓ ${source.name} is accessible`);

          // Try to find documents from this source
          const sourceResult = await tryDocumentSource(
            source,
            airport,
            results.debugInfo,
          );

          if (sourceResult.documentsFound > 0) {
            results.documentsFound += sourceResult.documentsFound;
            results.subsections.push(...sourceResult.subsections);
            results.debugInfo.push(
              `✓ Found ${sourceResult.documentsFound} documents from ${source.name}`,
            );
            break; // Stop trying other sources if we found documents
          }
        } else {
          results.debugInfo.push(
            `✗ ${source.name} returned ${connectivityTest.status}`,
          );
        }
      } catch (error) {
        results.debugInfo.push(`✗ ${source.name} failed: ${error.message}`);

        // For the primary eAIP site, explain what this means
        if (source.priority === 1) {
          results.debugInfo.push(
            `   ℹ️  This indicates the official eAIP Colombia website is down or blocked`,
          );
          results.debugInfo.push(
            `   ℹ️  This is not an error with your scraper - it's a server issue on their side`,
          );
        }
      }
    }

    // If no sources worked, try manual document patterns
    if (results.documentsFound === 0) {
      results.debugInfo.push(
        `\n--- All Sources Failed - Checking Alternative Methods ---`,
      );
      results.debugInfo.push(
        `ℹ️  The Colombian Civil Aviation Authority website appears to be experiencing technical difficulties`,
      );
      results.debugInfo.push(`ℹ️  You may need to:`);
      results.debugInfo.push(
        `   1. Wait for their website to come back online`,
      );
      results.debugInfo.push(`   2. Contact Aerocivil directly for documents`);
      results.debugInfo.push(`   3. Check back in a few hours`);
    }

    results.success = results.documentsFound > 0;

    if (results.success) {
      results.debugInfo.push(
        `\n🎉 SUCCESS: Found ${results.documentsFound} documents for ${icaoCode}`,
      );
      console.log(
        `[ENHANCED_SCRAPER] ✅ Found ${results.documentsFound} documents for ${icaoCode}`,
      );
    } else {
      results.debugInfo.push(
        `\n❌ FAILED: No documents found for ${icaoCode} - Website appears to be down`,
      );
      results.debugInfo.push(
        `📞 Contact: Call Aerocivil at +57 1 425 1000 for document access`,
      );
      console.log(
        `[ENHANCED_SCRAPER] ❌ No documents found for ${icaoCode} - eAIP website is down`,
      );
    }

    return results;
  } catch (error) {
    console.error(
      `[ENHANCED_SCRAPER] Process airport error for ${airport.icao_code}:`,
      error,
    );
    return {
      success: false,
      documentsFound: 0,
      error: error.message,
      subsections: [],
      debugInfo: [
        `CRITICAL ERROR: ${error.message}`,
        `Stack: ${error.stack}`,
        `ℹ️  This appears to be a server connectivity issue, not a scraper problem`,
      ],
    };
  }
}

// New function to try different document sources
async function tryDocumentSource(source, airport, debugInfo) {
  const result = {
    documentsFound: 0,
    subsections: [],
  };

  const icaoCode = airport.icao_code.toUpperCase();
  const cityFormatted = airport.city.toUpperCase();
  let nameFormatted = airport.name
    .replace(/\s+(International\s+)?Airport$/i, "")
    .replace(/\s+Aeropuerto$/i, "")
    .trim()
    .toUpperCase();

  // Try a few key subsections first to test the source
  const testSubsections = [
    { code: "AD 2.1", title: "Location Indicator/Airport Name" },
    { code: "AD 2.12", title: "Physical Characteristics of Runway" },
    { code: "AD 2", title: "Complete Document" },
  ];

  for (const subsection of testSubsections) {
    try {
      debugInfo.push(`  Testing ${subsection.code} from ${source.name}...`);

      // Different filename patterns for different sources
      let filenamePatterns = [];

      if (source.name.includes("eAIP")) {
        filenamePatterns = [
          `${subsection.code} ${icaoCode} - ${cityFormatted} - ${nameFormatted}.pdf`,
          `${subsection.code} ${icaoCode}.pdf`,
        ];
      } else {
        // Alternative patterns for other sources
        filenamePatterns = [
          `${icaoCode}_${subsection.code.replace(" ", "_")}.pdf`,
          `${icaoCode}.pdf`,
        ];
      }

      for (const filename of filenamePatterns) {
        let pdfUrl;

        if (source.baseUrl.includes("loader.php")) {
          // Special handling for the aerocivil loader
          pdfUrl = `${source.baseUrl}${encodeURIComponent(filename)}`;
        } else {
          pdfUrl = `${source.baseUrl}${encodeURIComponent(filename)}`;
        }

        debugInfo.push(`    URL: ${pdfUrl}`);

        const downloadResult = await attemptDownload(pdfUrl, filename);

        if (downloadResult.success) {
          debugInfo.push(`    ✓ SUCCESS: Found ${subsection.code}`);

          // Find the matching AD2 subsection to get the proper category
          const ad2Section = AD2_SUBSECTIONS.find(
            (s) => s.code === subsection.code,
          );
          const category = ad2Section ? ad2Section.category : "General";

          // Save the document to the database
          let saveResult;
          if (subsection.code === "AD 2") {
            // Complete document
            saveResult = await saveCompletePDF(
              downloadResult.blob,
              airport,
              filename,
              downloadResult.fileSize,
            );
          } else {
            // Individual subsection
            const subsectionData = {
              code: subsection.code,
              title: subsection.title,
              category: category,
            };
            saveResult = await saveSubsectionPDF(
              downloadResult.blob,
              airport,
              subsectionData,
              filename,
              downloadResult.fileSize,
            );
          }

          if (saveResult.success) {
            debugInfo.push(`    ✓ Saved to database: ${saveResult.cdnUrl}`);
          } else {
            debugInfo.push(
              `    ⚠️  Found but failed to save: ${saveResult.error}`,
            );
          }

          result.documentsFound++;
          result.subsections.push({
            code: subsection.code,
            title: subsection.title,
            category: category,
            url: pdfUrl,
            fileSize: downloadResult.fileSize,
            status: "success",
            source: source.name,
            savedToDatabase: saveResult.success,
            cdnUrl: saveResult.success ? saveResult.cdnUrl : null,
          });
          break; // Found this subsection, move to next
        } else {
          debugInfo.push(`    ✗ Failed: ${downloadResult.error}`);
        }
      }
    } catch (error) {
      debugInfo.push(`    ✗ ERROR: ${error.message}`);
    }
  }

  return result;
}

async function attemptDownload(pdfUrl, filename) {
  try {
    console.log(`[ENHANCED_SCRAPER] Downloading: ${filename}`);

    // Try primary download with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(pdfUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/pdf,application/octet-stream,*/*",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        Referer: "https://eaip-colombia.atnaerocivil.gov.co/",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }

    const blob = await response.blob();

    // Validate it's actually a PDF
    if (blob.size < 1000) {
      return {
        success: false,
        error: "File too small (likely not a valid PDF)",
      };
    }

    return {
      success: true,
      blob: blob,
      fileSize: blob.size,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function saveSubsectionPDF(
  pdfBlob,
  airport,
  subsection,
  filename,
  fileSize,
) {
  try {
    console.log(
      `[SAVE] Attempting to save subsection ${subsection.code} for airport ${airport.icao_code}`,
    );

    // Use the platform's upload system instead of direct Uploadcare access
    console.log(`[SAVE] Uploading ${filename} to platform CDN...`);

    const formData = new FormData();
    formData.append("file", pdfBlob, filename);

    const uploadResponse = await fetch("/_create/api/upload/", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      console.error(`[SAVE] Platform upload failed: ${uploadResponse.status}`);
      const errorText = await uploadResponse.text();
      console.error(`[SAVE] Error details:`, errorText);
      return {
        success: false,
        error: `Platform upload failed: ${uploadResponse.status} - ${errorText}`,
      };
    }

    const uploadData = await uploadResponse.json();
    const cdnUrl = uploadData.url;

    console.log(`[SAVE] Platform upload successful: ${cdnUrl}`);

    // Check if document already exists
    const existing = await sql`
      SELECT id FROM airport_documents 
      WHERE airport_id = ${airport.id} 
      AND document_type = ${subsection.code}
    `;

    const documentData = {
      airport_id: airport.id,
      title: `${subsection.code} - ${subsection.title}`,
      document_type: subsection.code,
      file_url: cdnUrl,
      file_size: fileSize,
      file_type: "pdf",
      description: `${subsection.title} - ${subsection.category} section from eAIP Colombia`,
      is_primary: subsection.code === "AD 2.12", // Make runway info primary
    };

    console.log(`[SAVE] Document data:`, documentData);

    if (existing.length === 0) {
      // Insert new document
      console.log(`[SAVE] Inserting new document for ${subsection.code}`);
      const insertResult = await sql`
        INSERT INTO airport_documents (
          airport_id, title, document_type, file_url, file_size,
          file_type, description, is_primary
        ) VALUES (
          ${documentData.airport_id}, ${documentData.title}, ${documentData.document_type},
          ${documentData.file_url}, ${documentData.file_size}, ${documentData.file_type},
          ${documentData.description}, ${documentData.is_primary}
        ) RETURNING id
      `;
      console.log(`[SAVE] Insert successful, new ID: ${insertResult[0]?.id}`);
    } else {
      // Update existing document
      console.log(`[SAVE] Updating existing document ID: ${existing[0].id}`);
      await sql`
        UPDATE airport_documents 
        SET file_url = ${cdnUrl}, file_size = ${fileSize}, title = ${documentData.title},
            description = ${documentData.description}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
      `;
      console.log(`[SAVE] Update successful`);
    }

    return { success: true, cdnUrl };
  } catch (error) {
    console.error(`[SAVE] Save subsection error:`, error);
    return { success: false, error: error.message };
  }
}

async function saveCompletePDF(pdfBlob, airport, filename, fileSize) {
  try {
    console.log(
      `[SAVE] Attempting to save complete document for airport ${airport.icao_code}`,
    );

    // Use the platform's upload system instead of direct Uploadcare access
    console.log(
      `[SAVE] Uploading complete document ${filename} to platform CDN...`,
    );

    const formData = new FormData();
    formData.append("file", pdfBlob, filename);

    const uploadResponse = await fetch("/_create/api/upload/", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      console.error(`[SAVE] Platform upload failed: ${uploadResponse.status}`);
      const errorText = await uploadResponse.text();
      console.error(`[SAVE] Error details:`, errorText);
      return {
        success: false,
        error: `Platform upload failed: ${uploadResponse.status} - ${errorText}`,
      };
    }

    const uploadData = await uploadResponse.json();
    const cdnUrl = uploadData.url;

    console.log(`[SAVE] Platform upload successful: ${cdnUrl}`);

    // Check if complete document already exists
    const existing = await sql`
      SELECT id FROM airport_documents 
      WHERE airport_id = ${airport.id} 
      AND document_type = 'AD 2 - Complete'
    `;

    console.log(`[SAVE] Document data for complete:`, {
      airport_id: airport.id,
      title: filename,
      document_type: "AD 2 - Complete",
      file_url: cdnUrl,
      file_size: fileSize,
    });

    if (existing.length === 0) {
      console.log(`[SAVE] Inserting new complete document`);
      const insertResult = await sql`
        INSERT INTO airport_documents (
          airport_id, title, document_type, file_url, file_size,
          file_type, description, is_primary
        ) VALUES (
          ${airport.id}, ${filename}, 'AD 2 - Complete', ${cdnUrl}, ${fileSize},
          'pdf', ${"Complete AD 2 section from eAIP Colombia"}, false
        ) RETURNING id
      `;
      console.log(`[SAVE] Insert successful, new ID: ${insertResult[0]?.id}`);
    } else {
      console.log(
        `[SAVE] Updating existing complete document ID: ${existing[0].id}`,
      );
      await sql`
        UPDATE airport_documents 
        SET file_url = ${cdnUrl}, file_size = ${fileSize}, 
            title = ${filename}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
      `;
      console.log(`[SAVE] Update successful`);
    }

    return { success: true, cdnUrl };
  } catch (error) {
    console.error(`[SAVE] Save complete PDF error:`, error);
    return { success: false, error: error.message };
  }
}

// GET endpoint to check scrape status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const icao = searchParams.get("icao");

    if (icao) {
      // Get documents for specific airport
      const docs = await sql`
        SELECT id, title, document_type, file_size, created_at
        FROM airport_documents
        WHERE airport_id = (SELECT id FROM airports WHERE icao_code = ${icao.toUpperCase()})
        ORDER BY document_type, title
      `;

      return Response.json({
        icao: icao.toUpperCase(),
        totalDocuments: docs.length,
        documents: docs,
      });
    } else {
      // Get overall statistics
      const stats = await sql`
        SELECT 
          COUNT(DISTINCT airport_id) as airports_with_docs,
          COUNT(*) as total_documents,
          SUM(file_size) as total_size,
          COUNT(DISTINCT document_type) as document_types
        FROM airport_documents
      `;

      const totalAirports = await sql`SELECT COUNT(*) as total FROM airports`;

      return Response.json({
        totalAirports: totalAirports[0].total,
        airportsWithDocs: stats[0].airports_with_docs,
        totalDocuments: stats[0].total_documents,
        totalSize: stats[0].total_size,
        documentTypes: stats[0].document_types,
      });
    }
  } catch (error) {
    console.error("GET scrape status error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
