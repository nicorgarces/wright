import fs from "fs";
import path from "path";

// GET /api/notams/status - Returns operational status for all airports
// Supports query parameter ?icao=SKBO to filter by airport
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const icaoFilter = searchParams.get("icao");

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

    // Filter by ICAO if specified
    let airports = data.airports || [];
    if (icaoFilter) {
      const upperIcao = icaoFilter.toUpperCase();
      airports = airports.filter((a) => a.icao === upperIcao);
    }

    // Return response
    return new Response(
      JSON.stringify({
        metadata: {
          ...data.metadata,
          filteredBy: icaoFilter || null,
          resultsCount: airports.length,
        },
        airports: airports.map((airport) => ({
          icao: airport.icao,
          airportName: airport.airportName,
          overallStatus: airport.overallStatus,
          activeNotamsCount: airport.notams?.length || 0,
          lastUpdate: airport.lastUpdate,
        })),
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
    console.error("Error in /api/notams/status:", error);
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
