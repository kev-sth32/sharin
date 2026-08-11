const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const apiKey = "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";
const postData = JSON.stringify({
  model: "meta/llama-3.3-70b-instruct",
  messages: [{ role: "user", content: "Hello, reply with one word: 'Success'" }],
  max_tokens: 10
});

const start = Date.now();
const log = (msg) => console.log(`[+${Date.now() - start}ms] ${msg}`);

log("Initiating DNS resolution for integrate.api.nvidia.com...");
dns.lookup("integrate.api.nvidia.com", (err, address, family) => {
  if (err) {
    log(`DNS Lookup Failed: ${err.message}`);
    return;
  }
  log(`DNS Lookup Succeeded: IP = ${address}, Family = IPv${family}`);

  log("Starting HTTPS POST request...");
  const req = https.request({
    hostname: "integrate.api.nvidia.com",
    port: 443,
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "Content-Length": Buffer.byteLength(postData)
    }
  }, (res) => {
    log(`HTTPS Connection established. Status: ${res.statusMessage} (${res.statusCode})`);
    
    let body = "";
    res.setEncoding("utf8");
    res.on("data", (chunk) => body += chunk);
    res.on("end", () => {
      log(`Response completed. Body: ${body.trim()}`);
    });
  });

  req.on("socket", (socket) => {
    log("Socket allocated.");
    socket.on("lookup", () => log("Socket DNS lookup starting..."));
    socket.on("connect", () => log("Socket connected. Starting SSL Handshake..."));
    socket.on("secureConnect", () => log("Socket secured. SSL Handshake completed. Sending headers..."));
  });

  req.on("error", (e) => {
    log(`Request Error: ${e.message}`);
  });

  req.write(postData);
  req.end();
  log("Request headers and body sent. Waiting for server response...");
});
