import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Setup RAC Documents Database Tables
 * Executes the SQL schema file to create necessary tables
 */

async function setupRacTables() {
  try {
    console.log("🚀 Setting up RAC documents database tables...");

    // Check for database connection string
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      console.error("❌ Database connection string not found.");
      console.log("Please set DATABASE_URL or POSTGRES_URL environment variable.");
      console.log("\nExample:");
      console.log("  export DATABASE_URL='postgresql://user:password@host:port/database'");
      process.exit(1);
    }

    // Read SQL file
    const sqlPath = path.join(__dirname, "create-rac-tables.sql");
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found: ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, "utf8");
    console.log("📄 SQL schema file loaded");

    // Connect to database using Neon
    console.log("🔌 Connecting to database...");
    const sql = neon(connectionString);
    console.log("✅ Connected to database");

    // Execute SQL (split into individual statements)
    console.log("🔧 Executing SQL schema...");
    
    // Split SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        await sql(statement);
      }
    }
    console.log("✅ RAC documents tables created successfully");

    // Verify table exists
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'rac_documents'
    `;

    if (result.length > 0) {
      console.log("✅ Verified: rac_documents table exists");
    } else {
      throw new Error("Table verification failed: rac_documents not found");
    }

    // Get column info
    const columnsResult = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'rac_documents'
      ORDER BY ordinal_position
    `;

    console.log("\n📋 Table structure:");
    columnsResult.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    console.log("\n✅ Database setup complete!");
  } catch (error) {
    console.error("\n❌ Failed to setup database:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

setupRacTables();
