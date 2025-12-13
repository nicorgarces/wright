import sql from "@/app/api/utils/sql";

// POST /api/airports/bulk-import - Import multiple airports with runways and frequencies
export async function POST(request) {
  try {
    const { airports } = await request.json();

    if (!airports || !Array.isArray(airports)) {
      return Response.json(
        {
          error: "Invalid data format. Expected an array of airports.",
        },
        { status: 400 },
      );
    }

    if (airports.length === 0) {
      return Response.json(
        {
          error: "No airports provided for import.",
        },
        { status: 400 },
      );
    }

    // Validate required fields for each airport
    const requiredFields = ["icao_code", "name", "city", "region"];
    const invalidAirports = airports.filter(
      (airport) => !requiredFields.every((field) => airport[field]),
    );

    if (invalidAirports.length > 0) {
      return Response.json(
        {
          error: `${invalidAirports.length} airports missing required fields: icao_code, name, city, region`,
          invalid: invalidAirports.map((a) => a.icao_code || "Unknown ICAO"),
        },
        { status: 400 },
      );
    }

    let imported = 0;
    let updated = 0;
    let errors = [];

    for (const airportData of airports) {
      try {
        // Try to upsert airport
        const [airport] = await sql`
          INSERT INTO airports (
            icao_code, name, city, region, airport_type, 
            elevation_ft, elevation_m, coordinates_lat, coordinates_lng, 
            coordinates_text, eaip_url, status
          ) VALUES (
            ${airportData.icao_code}, 
            ${airportData.name}, 
            ${airportData.city}, 
            ${airportData.region}, 
            ${airportData.airport_type || "Public"},
            ${airportData.elevation_ft || null}, 
            ${airportData.elevation_m || null}, 
            ${airportData.coordinates_lat || null}, 
            ${airportData.coordinates_lng || null},
            ${airportData.coordinates_text || null}, 
            ${airportData.eaip_url || null}, 
            ${airportData.status || "Active"}
          ) ON CONFLICT (icao_code) DO UPDATE SET
            name = EXCLUDED.name,
            city = EXCLUDED.city,
            region = EXCLUDED.region,
            airport_type = EXCLUDED.airport_type,
            elevation_ft = EXCLUDED.elevation_ft,
            elevation_m = EXCLUDED.elevation_m,
            coordinates_lat = EXCLUDED.coordinates_lat,
            coordinates_lng = EXCLUDED.coordinates_lng,
            coordinates_text = EXCLUDED.coordinates_text,
            eaip_url = EXCLUDED.eaip_url,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *, 
            CASE 
              WHEN created_at = updated_at THEN 'inserted'
              ELSE 'updated'
            END as operation
        `;

        if (airport.operation === "inserted") {
          imported++;
        } else {
          updated++;
        }

        // Import runways if provided
        if (airportData.runways && Array.isArray(airportData.runways)) {
          // First, clear existing runways for this airport
          await sql`DELETE FROM runways WHERE airport_id = ${airport.id}`;

          // Insert new runways
          for (const runway of airportData.runways) {
            if (runway.designation) {
              await sql`
                INSERT INTO runways (
                  airport_id, designation, length_m, width_m, surface, lighting
                ) VALUES (
                  ${airport.id}, 
                  ${runway.designation}, 
                  ${runway.length_m || null}, 
                  ${runway.width_m || null}, 
                  ${runway.surface || null}, 
                  ${runway.lighting || false}
                )
              `;
            }
          }
        }

        // Import frequencies if provided
        if (airportData.frequencies && Array.isArray(airportData.frequencies)) {
          // First, clear existing frequencies for this airport
          await sql`DELETE FROM frequencies WHERE airport_id = ${airport.id}`;

          // Insert new frequencies
          for (const freq of airportData.frequencies) {
            if (freq.service_name && freq.frequency) {
              await sql`
                INSERT INTO frequencies (
                  airport_id, service_name, frequency, callsign, hours
                ) VALUES (
                  ${airport.id}, 
                  ${freq.service_name}, 
                  ${freq.frequency}, 
                  ${freq.callsign || null}, 
                  ${freq.hours || "24/7"}
                )
              `;
            }
          }
        }

        // Import navigation aids if provided
        if (
          airportData.navigation_aids &&
          Array.isArray(airportData.navigation_aids)
        ) {
          // First, clear existing navigation aids for this airport
          await sql`DELETE FROM navigation_aids WHERE airport_id = ${airport.id}`;

          // Insert new navigation aids
          for (const navaid of airportData.navigation_aids) {
            if (navaid.nav_type) {
              await sql`
                INSERT INTO navigation_aids (
                  airport_id, nav_type, identifier, frequency, runway
                ) VALUES (
                  ${airport.id}, 
                  ${navaid.nav_type}, 
                  ${navaid.identifier || null}, 
                  ${navaid.frequency || null}, 
                  ${navaid.runway || null}
                )
              `;
            }
          }
        }
      } catch (airportError) {
        console.error(
          `Error importing airport ${airportData.icao_code}:`,
          airportError,
        );
        errors.push({
          icao: airportData.icao_code,
          error: airportError.message,
        });
      }
    }

    return Response.json(
      {
        message: "Bulk import completed",
        summary: {
          total: airports.length,
          imported,
          updated,
          errors: errors.length,
        },
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in bulk import:", error);
    return Response.json(
      {
        error: "Failed to process bulk import",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// GET /api/airports/bulk-import - Get import template/example
export async function GET() {
  const exampleAirports = [
    {
      icao_code: "SKBO",
      name: "El Dorado International Airport",
      city: "Bogotá",
      region: "Cundinamarca",
      airport_type: "International",
      elevation_ft: 8361,
      elevation_m: 2548,
      coordinates_lat: 4.701944,
      coordinates_lng: -74.146944,
      coordinates_text: "04°42'07\"N 074°08'45\"W",
      eaip_url:
        "https://eaip-colombia.atnaerocivil.gov.co/eaip/A%2069-25_2025_10_02/SKBO.html",
      status: "Active",
      runways: [
        {
          designation: "13R/31L",
          length_m: 3800,
          width_m: 45,
          surface: "Asphalt",
          lighting: true,
        },
        {
          designation: "13L/31R",
          length_m: 3800,
          width_m: 45,
          surface: "Asphalt",
          lighting: true,
        },
      ],
      frequencies: [
        {
          service_name: "Tower",
          frequency: "118.1",
          hours: "24/7",
        },
        {
          service_name: "Ground",
          frequency: "121.9",
          hours: "24/7",
        },
        {
          service_name: "ATIS",
          frequency: "127.85",
          hours: "24/7",
        },
      ],
      navigation_aids: [
        {
          nav_type: "ILS",
          identifier: "ISKB",
          frequency: "108.10",
          runway: "13R",
        },
        {
          nav_type: "VOR",
          identifier: "BOG",
          frequency: "116.20",
        },
      ],
    },
    {
      icao_code: "SKCL",
      name: "Alfonso Bonilla Aragón International Airport",
      city: "Cali",
      region: "Valle del Cauca",
      airport_type: "International",
      elevation_ft: 3162,
      elevation_m: 964,
      coordinates_text: "03°32'32\"N 076°22'51\"W",
      eaip_url:
        "https://eaip-colombia.atnaerocivil.gov.co/eaip/A%2069-25_2025_10_02/SKCL.html",
      status: "Active",
      runways: [
        {
          designation: "01/19",
          length_m: 3500,
          width_m: 45,
          surface: "Asphalt",
          lighting: true,
        },
      ],
      frequencies: [
        {
          service_name: "Tower",
          frequency: "118.3",
        },
        {
          service_name: "Ground",
          frequency: "121.7",
        },
      ],
    },
  ];

  return Response.json({
    message: "Example format for bulk airport import",
    required_fields: ["icao_code", "name", "city", "region"],
    optional_fields: [
      "airport_type",
      "elevation_ft",
      "elevation_m",
      "coordinates_lat",
      "coordinates_lng",
      "coordinates_text",
      "eaip_url",
      "status",
    ],
    example_format: {
      airports: exampleAirports,
    },
  });
}
