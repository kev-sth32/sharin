const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const apiKey = "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";

const req = https.request({
  hostname: "integrate.api.nvidia.com",
  port: 443,
  path: "/v1/models",
  method: "GET",
  headers: {
    "Authorization": `Bearer ${apiKey}`
  }
}, (res) => {
  console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
  let body = "";
  res.setEncoding("utf8");
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => {
    try {
      const data = JSON.parse(body);
      console.log("Available Models count:", data.data ? data.data.length : 0);
      if (data.data) {
        data.data.slice(0, 25).forEach(m => console.log(`- ${m.id}`));
      } else {
        console.log(body);
      }
    } catch {
      console.log("Raw response:", body);
    }
  });
});

req.on("error", (e) => console.error("Error:", e));
req.end();
