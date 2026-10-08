/**
 * Proxy serverless da Deezer API (Vercel).
 *
 * A Deezer não envia cabeçalhos CORS, então no browser não dá pra chamar
 * direto. No dev local usamos server/proxy.js; em produção esta function
 * faz o mesmo papel — só que roda na Vercel.
 *
 * Uso: GET /api/deezer?p=<path-encodeado>
 * Ex.: /api/deezer?p=%2Fsearch%3Fq%3Dbillie%2520jean
 */
const TARGET = "https://api.deezer.com";

module.exports = async (req, res) => {
  // CORS liberado (o cliente é o bundle estático servido pela Vercel)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const raw = typeof req.query.p === "string" ? req.query.p : "";

  // Só aceitamos caminhos relativos simples (evita open proxy)
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("..")) {
    res.status(400).json({ error: "bad_path", message: "p deve ser um caminho tipo /search?q=..." });
    return;
  }

  try {
    const upstream = await fetch(TARGET + raw, {
      headers: { Accept: "application/json", "User-Agent": "VibeMatch/1.0" },
      signal: AbortSignal.timeout(12000),
    });

    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json; charset=utf-8"
    );
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.send(body);
  } catch (err) {
    res.status(502).json({ error: "proxy_error", message: String(err && err.message) });
  }
};
