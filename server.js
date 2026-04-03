import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");
const indexPath = path.join(distDir, "index.html");
const DEFAULT_PORT = 3001;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;
const SYSTEM_INSTRUCTION = `You are SalesIQ Copilot, the embedded AI assistant for an e-commerce analytics app.
Help users understand the site's dashboards, forecasting, KPIs, role-based features, and e-commerce workflows.
Keep answers concise, practical, and friendly.
Do not claim you changed data or performed actions inside the app unless the user explicitly sees that happen.
If a question is outside the app, still help when you can, but prefer guidance that fits an analytics or sales context.`;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

loadEnvFile(path.join(__dirname, ".env.local"));
loadEnvFile(path.join(__dirname, ".env"));

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();

    if (!key || process.env[key]) {
      continue;
    }

    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += typeof chunk === "string" ? chunk : chunk.toString("utf8");

      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function mapMessages(messages = []) {
  return messages
    .filter((message) => {
      return (
        (message?.role === "user" || message?.role === "assistant") &&
        typeof message?.content === "string" &&
        message.content.trim().length > 0
      );
    })
    .slice(-12)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.trim() }],
    }));
}

function extractReply(data) {
  const parts = data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
}

function serveFile(req, res, filePath) {
  const contentType = getContentType(filePath);
  const stats = statSync(filePath);
  const headers = {
    "Content-Type": contentType,
    "Content-Length": stats.size,
  };

  if (contentType.startsWith("text/html")) {
    headers["Cache-Control"] = "no-store";
  } else {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  }

  res.writeHead(200, headers);

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  createReadStream(filePath).pipe(res);
}

function resolveStaticPath(urlPathname) {
  const decodedPath = decodeURIComponent(urlPathname);
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = path.join(distDir, normalizedPath);
  const relativePath = path.relative(distDir, requestedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return requestedPath;
}

async function handleChatRequest(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/chat/health") {
    sendJson(res, 200, {
      ok: true,
      configured: Boolean(process.env.GEMINI_API_KEY),
      model: MODEL_NAME,
    });
    return true;
  }

  if (req.method !== "POST" || url.pathname !== "/api/chat") {
    return false;
  }

  if (!process.env.GEMINI_API_KEY) {
    sendJson(res, 500, {
      error: "Gemini API key is missing on the server. Set GEMINI_API_KEY.",
    });
    return true;
  }

  try {
    const rawBody = await readRequestBody(req);
    const parsedBody = rawBody ? JSON.parse(rawBody) : {};
    const contents = mapMessages(parsedBody.messages);

    if (!contents.length) {
      sendJson(res, 400, { error: "At least one user message is required." });
      return true;
    }

    const routeContext = parsedBody.route ? `Current app route: ${parsedBody.route}.` : "";
    const geminiResponse = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
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

    const data = await geminiResponse.json().catch(() => ({}));

    if (!geminiResponse.ok) {
      sendJson(res, geminiResponse.status, {
        error:
          data?.error?.message ||
          `Gemini request failed with status ${geminiResponse.status}.`,
      });
      return true;
    }

    const reply = extractReply(data);

    if (!reply) {
      sendJson(res, 502, { error: "Gemini returned an empty response." });
      return true;
    }

    sendJson(res, 200, { reply, model: MODEL_NAME });
    return true;
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
    return true;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (await handleChatRequest(req, res, url)) {
    return;
  }

  if (!existsSync(indexPath)) {
    sendJson(res, 500, {
      error: "Build output not found. Run `npm run build` before starting the server.",
    });
    return;
  }

  const staticPath = resolveStaticPath(url.pathname);

  if (staticPath && existsSync(staticPath) && statSync(staticPath).isFile()) {
    serveFile(req, res, staticPath);
    return;
  }

  if (url.pathname === "/" || !path.extname(url.pathname)) {
    serveFile(req, res, indexPath);
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

const port = Number(process.env.PORT || DEFAULT_PORT);

server.listen(port, () => {
  console.log(`SalesIQ server listening on http://localhost:${port}`);
});
