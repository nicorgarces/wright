import sql from "@/app/api/utils/sql";

// GET /api/airports - List airports with search and filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const region = searchParams.get("region") || "";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = "SELECT * FROM airports WHERE 1=1";
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(icao_code) LIKE LOWER($${paramCount}) OR 
        LOWER(name) LIKE LOWER($${paramCount}) OR 
        LOWER(city) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    if (region) {
      paramCount++;
      query += ` AND LOWER(region) = LOWER($${paramCount})`;
      params.push(region);
    }

    query += ` ORDER BY name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const airports = await sql(query, params);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) FROM airports WHERE 1=1";
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (
        LOWER(icao_code) LIKE LOWER($${countParamCount}) OR 
        LOWER(name) LIKE LOWER($${countParamCount}) OR 
        LOWER(city) LIKE LOWER($${countParamCount})
      )`;
      countParams.push(`%${search}%`);
    }

    if (region) {
      countParamCount++;
      countQuery += ` AND LOWER(region) = LOWER($${countParamCount})`;
      countParams.push(region);
    }

    const [countResult] = await sql(countQuery, countParams);
    const total = parseInt(countResult.count);

    return Response.json({
      airports,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching airports:", error);
    return Response.json(
      { error: "Failed to fetch airports" },
      { status: 500 },
    );
  }
}

// POST /api/airports - Create new airport
export async function POST(request) {
  try {
    const {
      icao_code,
      name,
      city,
      region,
      airport_type = "Public",
      elevation_ft,
      elevation_m,
      coordinates_lat,
      coordinates_lng,
      coordinates_text,
      eaip_url,
      status = "Active",
    } = await request.json();

    if (!icao_code || !name || !city || !region) {
      return Response.json(
        {
          error: "Missing required fields: icao_code, name, city, region",
        },
        { status: 400 },
      );
    }

    const [airport] = await sql`
      INSERT INTO airports (
        icao_code, name, city, region, airport_type, 
        elevation_ft, elevation_m, coordinates_lat, coordinates_lng, 
        coordinates_text, eaip_url, status
      ) VALUES (
        ${icao_code}, ${name}, ${city}, ${region}, ${airport_type},
        ${elevation_ft}, ${elevation_m}, ${coordinates_lat}, ${coordinates_lng},
        ${coordinates_text}, ${eaip_url}, ${status}
      ) RETURNING *
    `;

    return Response.json({ airport }, { status: 201 });
  } catch (error) {
    console.error("Error creating airport:", error);
    if (error.code === "23505") {
      // Unique constraint violation
      return Response.json(
        {
          error: "Airport with this ICAO code already exists",
        },
        { status: 409 },
      );
    }
    return Response.json(
      { error: "Failed to create airport" },
      { status: 500 },
    );
  }
}
