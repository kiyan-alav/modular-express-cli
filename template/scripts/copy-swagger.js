const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);

    const destPath = path.join(dest, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

const srcSwagger = path.join(__dirname, "..", "src", "swagger");
const destSwagger = path.join(__dirname, "..", "dist", "swagger");

// console.log("srcSwagger =>", srcSwagger);
// console.log("destSwagger =>", destSwagger);
copyDir(srcSwagger, destSwagger);

console.log("Swagger YAML files copied to dist/swagger.");
