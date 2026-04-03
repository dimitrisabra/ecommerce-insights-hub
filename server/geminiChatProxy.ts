import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const MODEL_NAME = "gemini-2.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;
const SYSTEM_INSTRUCTION = `You are SalesIQ Copilot, the embedded AI assistant for an e-commerce analytics app.
Help users understand the site's dashboards, forecasting, KPIs, role-based features, and e-commerce workflows.
Keep answers concise, practical, and friendly.
Do not claim you changed data or performed actions inside the app unless the user explicitly sees that happen.
If a question is outside the app, still help when you can, but prefer guidance that fits an analytics or sales context.`;

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
  route?: string;
};

type GeminiPart = {
  text?: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiPart[];
  };
};

type GeminiErrorPayload = {
  error?: {
    message?: string;
  };
};

type GeminiResponsePayload = GeminiErrorPayload & {
  candidates?: GeminiCandidate[];
};

type NextFunction = () => void;

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readBody(req: IncomingMessage): Promise<string> {
  let body = "";

  for await (const chunk of req) {
    body += typeof chunk === "string" ? chunk : chunk.toString("utf8");
  }

  return body;
}

function mapMessages(messages: ChatMessage[] = []) {
  return messages
    .filter((message) => {
      return (message.role === "user" || message.role === "assistant") && message.content.trim().length > 0;
    })
    .slice(-12)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.trim() }],
    }));
}

function extractReply(data: GeminiResponsePayload) {
  const parts = data.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
}

function createMiddleware(apiKey?: string) {
  return async (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    if (req.method === "GET" && url.pathname === "/api/chat/health") {
      sendJson(res, 200, {
        ok: true,
        configured: Boolean(apiKey),
        model: MODEL_NAME,
      });
      return;
    }

    if (req.method !== "POST" || url.pathname !== "/api/chat") {
      next();
      return;
    }

    if (!apiKey) {
      sendJson(res, 500, {
        error: "Gemini API key is missing on the server. Set GEMINI_API_KEY in .env.local.",
      });
      return;
    }

    try {
      const rawBody = await readBody(req);
      const parsedBody = (rawBody ? JSON.parse(rawBody) : {}) as ChatRequestBody;
      const contents = mapMessages(parsedBody.messages);

      if (contents.length === 0) {
        sendJson(res, 400, { error: "At least one user message is required." });
        return;
      }

      const routeContext = parsedBody.route ? `Current app route: ${parsedBody.route}.` : "";
      const geminiResponse = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `${SYSTEM_INSTRUCTION}\n${routeContext}`.trim() }],
          },
          contents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 512,
          },
        }),
        signal: AbortSignal.timeout(20000),
      });

      const data = (await geminiResponse.json().catch(() => ({}))) as GeminiResponsePayload;

      if (!geminiResponse.ok) {
        const errorMessage =
          data?.error?.message || `Gemini request failed with status ${geminiResponse.status}.`;
        sendJson(res, geminiResponse.status, { error: errorMessage });
        return;
      }

      const reply = extractReply(data);

      if (!reply) {
        sendJson(res, 502, { error: "Gemini returned an empty response." });
        return;
      }

      sendJson(res, 200, { reply, model: MODEL_NAME });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected server error.";
      sendJson(res, 500, { error: message });
    }
  };
}

export function geminiChatProxy(apiKey?: string): Plugin {
  const middleware = createMiddleware(apiKey);

  return {
    name: "gemini-chat-proxy",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
