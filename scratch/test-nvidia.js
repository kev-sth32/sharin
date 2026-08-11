const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const apiKey = "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";
const apiUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

async function test() {
  console.log("Starting test call to Nvidia NIM API...");
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: "Hello, reply with one word: 'Success'" }],
        max_tokens: 10
      })
    });
    console.log("Response Status:", res.status);
    console.log("Response OK:", res.ok);
    const data = await res.json();
    console.log("Response Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

test();
