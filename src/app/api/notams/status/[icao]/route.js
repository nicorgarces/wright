import fs from "fs";
import path from "path";

// GET /api/notams/status/[icao] - Returns detailed NOTAM information for a specific airport
export async function GET(request, { params }) {
  try {
    // Extract ICAO from route parameters
    const icao = params.icao?.toUpperCase();

    if (!icao || icao.length !== 4) {
      return new Response(
        JSON.stringify({
          error: "Invalid ICAO code. Must be a 4-letter code (e.g., SKBO)",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Read airport status data
    const airportStatusPath = path.join(process.cwd(), "src/data/airportStatus.json");
    
    if (!fs.existsSync(airportStatusPath)) {
      return new Response(
        JSON.stringify({
          error: "Airport status data not available. Please run the NOTAM update process first.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = JSON.parse(fs.readFileSync(airportStatusPath, "utf8"));

    // Find the specific airport
    const airport = data.airports?.find((a) => a.icao === icao);

    if (!airport) {
      return new Response(
        JSON.stringify({
          error: `Airport ${icao} not found in NOTAM database`,
          availableAirports: data.airports?.map((a) => a.icao) || [],
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return detailed information
    return new Response(
      JSON.stringify({
        icao: airport.icao,
        airportName: airport.airportName,
        overallStatus: airport.overallStatus,
        lastUpdate: airport.lastUpdate,
        activeNotams: airport.notams || [],
        summary: {
          totalNotams: airport.notams?.length || 0,
          statusCounts: airport.notams?.reduce(
            (acc, notam) => {
              acc[notam.status] = (acc[notam.status] || 0) + 1;
              return acc;
            },
            { operational: 0, limited: 0, closed: 0 }
          ),
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    console.error(`Error in /api/notams/status/[icao]:`, error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
