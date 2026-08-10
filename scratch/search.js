const fs = require("fs");
const path = require("path");

const searchDirs = ["app", "components", "public", "lib"];
const query = "fully supported";
const query2 = "VAPID keys";

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      search(fullPath);
    } else if (stat.isFile() && /\.(js|ts|tsx|jsx|html|json)$/.test(file)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (content.toLowerCase().includes(query.toLowerCase())) {
        console.log(`Match for "${query}" in: ${fullPath}`);
      }
      if (content.toLowerCase().includes(query2.toLowerCase())) {
        console.log(`Match for "${query2}" in: ${fullPath}`);
      }
    }
  }
}

for (const sDir of searchDirs) {
  const fullSDir = path.join(__dirname, "..", sDir);
  if (fs.existsSync(fullSDir)) {
    search(fullSDir);
  }
}
console.log("Search completed.");
