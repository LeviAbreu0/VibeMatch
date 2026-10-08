/**
 * Proxy local da Deezer API.
 *
 * A Deezer não envia cabeçalhos CORS, então no web não dá pra chamar direto.
 * Em vez de depender de proxies públicos (instáveis), sobe um proxy local
 * que repassa as requisições pro servidor — sem CORS porque é server-side.
 *
 * Uso: node server/proxy.js   →  http://localhost:3001/search?q=...
 */
const http = require("node:http");
const https = require("node:https");

const PORT = process.env.PROXY_PORT || 3001;
const TARGET = "https://api.deezer.com";

const server = http.createServer((req, res) => {
  // CORS liberado (o cliente é o Metro/webpack em localhost)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const targetUrl = TARGET + req.url;

  const proxyReq = https.get(
    targetUrl,
    { headers: { "User-Agent": "VibeMatch/1.0", Accept: "application/json" } },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, {
        "Content-Type": proxyRes.headers["content-type"] || "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (err) => {
    console.error("[proxy] erro:", err.message);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "application/json" });
    }
    res.end(JSON.stringify({ error: "proxy_error", message: err.message }));
  });

  proxyReq.setTimeout(15000, () => {
    proxyReq.destroy();
  });
});

server.listen(PORT, () => {
  console.log(`🎵 Deezer proxy rodando em http://localhost:${PORT}`);
});
