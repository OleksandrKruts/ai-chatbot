import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response("GROQ_API_KEY is not set", { status: 500 });
    }

    const { messages, system } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid request body", { status: 400 });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1024,
          stream: true,
          messages: [
            {
              role: "system",
              content:
                system ||
                "You are a helpful AI assistant. Be concise and clear.",
            },
            ...messages,
          ],
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return new Response(err, { status: response.status });
    }

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const lines = decoder.decode(value).split("\n");

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;

              const payload = line.slice(6).trim();
              if (payload === "[DONE]") {
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                return;
              }

              try {
                const parsed = JSON.parse(payload);
                const text = parsed?.choices?.[0]?.delta?.content ?? "";
                if (text) {
                  const data = JSON.stringify({
                    type: "content_block_delta",
                    delta: { type: "text_delta", text },
                  });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
              } catch {}
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Route error:", err);
    return new Response(String(err), { status: 500 });
  }
}
