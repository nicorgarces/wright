import sql from "@/app/api/utils/sql";
import { upload } from "@/app/api/utils/upload";

// GET /api/airports/[icao]/documents - Get all documents for an airport
export async function GET(request, { params }) {
  try {
    const { icao } = params;

    if (!icao) {
      return Response.json({ error: "ICAO code is required" }, { status: 400 });
    }

    // Get airport first
    const [airport] = await sql`
      SELECT id FROM airports WHERE LOWER(icao_code) = LOWER(${icao})
    `;

    if (!airport) {
      return Response.json({ error: "Airport not found" }, { status: 404 });
    }

    // Get documents
    const documents = await sql`
      SELECT * FROM airport_documents 
      WHERE airport_id = ${airport.id} 
      ORDER BY is_primary DESC, sort_order ASC, title ASC
    `;

    return Response.json({ documents });
  } catch (error) {
    console.error("Error fetching airport documents:", error);
    return Response.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

// POST /api/airports/[icao]/documents - Upload and save a document
export async function POST(request, { params }) {
  try {
    const { icao } = params;

    if (!icao) {
      return Response.json({ error: "ICAO code is required" }, { status: 400 });
    }

    // Get airport first
    const [airport] = await sql`
      SELECT id FROM airports WHERE LOWER(icao_code) = LOWER(${icao})
    `;

    if (!airport) {
      return Response.json({ error: "Airport not found" }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title");
    const document_type = formData.get("document_type") || "general";
    const description = formData.get("description") || "";
    const is_primary = formData.get("is_primary") === "true";

    if (!file) {
      return Response.json({ error: "File is required" }, { status: 400 });
    }

    if (!title || !title.trim()) {
      return Response.json(
        { error: "Document title is required" },
        { status: 400 },
      );
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return Response.json(
        {
          error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 50MB.`,
        },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to storage
    const { url: file_url } = await upload({ buffer });

    if (!file_url) {
      return Response.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // If this is being set as primary, unset all other primary documents
    if (is_primary) {
      await sql`
        UPDATE airport_documents 
        SET is_primary = false 
        WHERE airport_id = ${airport.id}
      `;
    }

    // Insert document record
    const [document] = await sql`
      INSERT INTO airport_documents (
        airport_id, title, document_type, file_url, file_size, 
        file_type, description, is_primary
      ) VALUES (
        ${airport.id}, ${title.trim()}, ${document_type}, ${file_url}, 
        ${file.size}, ${file.type || "application/pdf"}, ${description.trim()}, ${is_primary}
      ) RETURNING *
    `;

    return Response.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return Response.json(
      { error: "Failed to upload document" },
      { status: 500 },
    );
  }
}
