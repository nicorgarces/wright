import fs from "fs";
import path from "path";

// POST /api/notams/ask - AI chatbot for NOTAM questions using Cloudflare Workers AI
export async function POST(request) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid request. Please provide a 'question' field in the request body.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate Cloudflare credentials
    const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
    const CF_API_TOKEN = process.env.CF_API_TOKEN;

    if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
      return new Response(
        JSON.stringify({
          error: "AI service not configured. Missing CF_ACCOUNT_ID or CF_API_TOKEN environment variables.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Read airport status data for context
    const airportStatusPath = path.join(process.cwd(), "src/data/airportStatus.json");
    
    let notamContext = "No NOTAM data available.";
    if (fs.existsSync(airportStatusPath)) {
      const data = JSON.parse(fs.readFileSync(airportStatusPath, "utf8"));
      
      // Build a concise context string from NOTAM data
      const contextParts = [];
      contextParts.push(`Last updated: ${data.metadata?.generatedAt || "unknown"}`);
      contextParts.push(`Total airports: ${data.airports?.length || 0}\n`);
      
      // Add airport summaries
      data.airports?.slice(0, 20).forEach((airport) => {
        contextParts.push(
          `${airport.icao} (${airport.airportName}): ${airport.overallStatus.toUpperCase()} - ${airport.notams?.length || 0} active NOTAMs`
        );
        
        // Add first few NOTAM texts for this airport
        airport.notams?.slice(0, 2).forEach((notam) => {
          const shortText = notam.text.substring(0, 200).replace(/\n/g, " ");
          contextParts.push(`  - ${shortText}...`);
        });
      });
      
      notamContext = contextParts.join("\n");
    }

    // Build the prompt for the AI
    const systemPrompt = `You are a helpful aviation assistant specialized in Colombian NOTAMs (Notices to Airmen). 
Answer questions about airport operational status, runway closures, and other aviation restrictions based on the provided NOTAM data.
Be concise and accurate. If you don't have enough information, say so clearly.

Current NOTAM Data:
${notamContext}`;

    const userPrompt = question;

    // Call Cloudflare Workers AI
    const aiEndpoint = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`;
    
    const aiResponse = await fetch(aiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Cloudflare AI error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to get AI response",
          details: errorText,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const aiData = await aiResponse.json();
    
    // Extract the answer from the AI response
    const answer = aiData.result?.response || aiData.result?.content || "Unable to generate a response";

    return new Response(
      JSON.stringify({
        question,
        answer,
        metadata: {
          model: "@cf/meta/llama-3-8b-instruct",
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // Don't cache AI responses
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/notams/ask:", error);
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
