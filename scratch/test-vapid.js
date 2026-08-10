const webpush = require("web-push");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf-8");

const env = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value.trim();
  }
});

const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = env.VAPID_PRIVATE_KEY;

console.log("Public Key:", publicKey);
console.log("Private Key:", privateKey);

try {
  webpush.setVapidDetails(
    "mailto:hello@tripnaari.com",
    publicKey,
    privateKey
  );
  console.log("VAPID keys are VALID and configured correctly!");
} catch (err) {
  console.error("VAPID validation failed:", err.message);
}
