export async function POST(request) {
  try {
    const { GROQ_API_KEY } = process.env;
    
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages } = await request.json();

    if (!messages || ! Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request:  messages array required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Simple fetch to Groq API instead of using the SDK
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a NOTAM AI Assistant for Colombian aviation.  Answer questions about airport status concisely.',
          },
          ... messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response. statusText}`);
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in notam-chat API:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}