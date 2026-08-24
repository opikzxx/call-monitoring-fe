import { createServer } from "node:http";
import { VALID_EMAIL, VALID_PASSWORD } from "./fixtures.mjs";

const PORT = 8080;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/auth/login") {
    const raw = await readBody(req);
    const { email, password } = raw ? JSON.parse(raw) : {};

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      sendJson(res, 200, {
        accessToken: "mock-access-token",
        tokenType: "Bearer",
        expiresInMs: 3600000,
      });
      return;
    }

    sendJson(res, 401, {
      timestamp: new Date().toISOString(),
      status: 401,
      error: "Unauthorized",
      message: "Email atau password salah.",
    });
    return;
  }

  // Fallback for any other API call made by unrelated features (e.g. dashboard
  // widgets) so the app doesn't hang or error out during auth-focused e2e runs.
  sendJson(res, 200, {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
});

server.listen(PORT, () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
});
