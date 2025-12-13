import sql from "@/app/api/utils/sql";

// GET /api/airports/[icao] - Get airport by ICAO code with all details
export async function GET(request, { params }) {
  try {
    const { icao } = params;

    if (!icao) {
      return Response.json({ error: "ICAO code is required" }, { status: 400 });
    }

    // Get airport details
    const [airport] = await sql`
      SELECT * FROM airports 
      WHERE LOWER(icao_code) = LOWER(${icao})
    `;

    if (!airport) {
      return Response.json({ error: "Airport not found" }, { status: 404 });
    }

    // Get runways, frequencies, navigation aids, and documents
    const [runways, frequencies, navigationAids, documents] =
      await sql.transaction([
        sql`SELECT * FROM runways WHERE airport_id = ${airport.id} ORDER BY designation`,
        sql`SELECT * FROM frequencies WHERE airport_id = ${airport.id} ORDER BY service_name`,
        sql`SELECT * FROM navigation_aids WHERE airport_id = ${airport.id} ORDER BY nav_type, identifier`,
        sql`SELECT * FROM airport_documents WHERE airport_id = ${airport.id} ORDER BY is_primary DESC, sort_order ASC, title ASC`,
      ]);

    return Response.json({
      airport: {
        ...airport,
        runways,
        frequencies,
        navigation_aids: navigationAids,
        documents,
      },
    });
  } catch (error) {
    console.error("Error fetching airport:", error);
    return Response.json({ error: "Failed to fetch airport" }, { status: 500 });
  }
}

// PUT /api/airports/[icao] - Update airport
export async function PUT(request, { params }) {
  try {
    const { icao } = params;
    const updateData = await request.json();

    if (!icao) {
      return Response.json({ error: "ICAO code is required" }, { status: 400 });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    const allowedFields = [
      "name",
      "city",
      "region",
      "airport_type",
      "elevation_ft",
      "elevation_m",
      "coordinates_lat",
      "coordinates_lng",
      "coordinates_text",
      "eaip_url",
      "status",
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(updateData[field]);
      }
    }

    if (updateFields.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Add updated_at
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());

    // Add WHERE clause parameter
    paramCount++;
    updateValues.push(icao);

    const query = `
      UPDATE airports 
      SET ${updateFields.join(", ")} 
      WHERE LOWER(icao_code) = LOWER($${paramCount}) 
      RETURNING *
    `;

    const [airport] = await sql(query, updateValues);

    if (!airport) {
      return Response.json({ error: "Airport not found" }, { status: 404 });
    }

    return Response.json({ airport });
  } catch (error) {
    console.error("Error updating airport:", error);
    return Response.json(
      { error: "Failed to update airport" },
      { status: 500 },
    );
  }
}

// DELETE /api/airports/[icao] - Delete airport (will cascade delete related data)
export async function DELETE(request, { params }) {
  try {
    const { icao } = params;

    if (!icao) {
      return Response.json({ error: "ICAO code is required" }, { status: 400 });
    }

    const [deletedAirport] = await sql`
      DELETE FROM airports 
      WHERE LOWER(icao_code) = LOWER(${icao})
      RETURNING icao_code, name
    `;

    if (!deletedAirport) {
      return Response.json({ error: "Airport not found" }, { status: 404 });
    }

    return Response.json({
      message: "Airport deleted successfully",
      airport: deletedAirport,
    });
  } catch (error) {
    console.error("Error deleting airport:", error);
    return Response.json(
      { error: "Failed to delete airport" },
      { status: 500 },
    );
  }
}
