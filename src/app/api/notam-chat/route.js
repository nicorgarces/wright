import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

// Validate API key exists
if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY environment variable is not set");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Load airport status data
function loadAirportStatus() {
  try {
    const dataPath = path.join(process.cwd(), "src/data/airportStatus.json");
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading airportStatus.json:", error);
    return {};
  }
}

// Create system prompt with airport status data
function createSystemPrompt(airportStatus) {
  const airportData = JSON.stringify(airportStatus, null, 2);
  
  return `You are a NOTAM AI Assistant for Colombian aviation. You have access to real-time NOTAM data for Colombian airports.

Current airport status data:
${airportData}

Answer questions about:
- Airport operational status (operational, limited, closed)
- Specific restrictions and reasons
- NOTAMs affecting operations
- Which airports have issues

Use these emojis for status:
- 🟢 Operational
- 🟡 Limited operations
- 🔴 Closed

Be concise, professional, and aviation-focused. Always include the airport ICAO code and last updated date when relevant.

When listing multiple airports, format them clearly with bullet points or numbered lists.
When asked about specific airport issues, provide the exact reason from the NOTAM data.
Use clear, professional aviation terminology.`;
}

export async function POST(request) {
  try {
    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "GROQ_API_KEY is not configured. Please set the environment variable." 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Load airport status data
    const airportStatus = loadAirportStatus();

    // Create system message with airport data
    const systemMessage = {
      role: "system",
      content: createSystemPrompt(airportStatus),
    };

    // Filter out any existing system messages from frontend and add our system message
    const userMessages = messages.filter(msg => msg.role !== "system");
    const allMessages = [systemMessage, ...userMessages];

    // Create streaming chat completion
    const stream = await groq.chat.completions.create({
      messages: allMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: true,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Error in stream:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error in notam-chat API:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
