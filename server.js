import http from "http";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function log(...args) {
  const time = new Date().toISOString();
  console.log(`[${time}]`, ...args);
}

const server = http.createServer(async (req, res) => {
  log("Incoming request:", req.method, req.url);

  if (req.url !== "/request" || req.method !== "POST") {
    log("404 - Not found");
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Not found");
  }

  let body = "";
  for await (const chunk of req) body += chunk;

  let payload;
  try {
    payload = JSON.parse(body);
  } catch (err) {
    log("Invalid JSON body");
    res.writeHead(400);
    return res.end("Invalid JSON");
  }

  const { method, url, headers, body: requestBody } = payload;

  log("Executing request: ", { method, url });

  const start = Date.now();

  try {
    const response = await fetch(url, {
      method,
      headers: headers || {},
      body: requestBody ? JSON.stringify(requestBody) : undefined,
      agent: new (await import("https")).Agent({
        rejectUnauthorized: false
      })
    });

    const text = await response.text();

    const duration = Date.now() - start;

    log("Response received: ", {
      status: response.status,
      duration: `${duration}ms`
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: text,
      durationMs: duration
    }));

  } catch (err) {
    log("Request failed: ", err);

    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err }));
  }
});

server.listen(3000, () => {
  log("Server running on http://localhost:3000");
});
