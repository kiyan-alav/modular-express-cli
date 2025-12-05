#!/usr/bin/env node
import chalk from "chalk";
import ejs from "ejs";
import { execaCommandSync } from "execa";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const argvName = process.argv[2];

async function main() {
  console.log(chalk.cyan("🛠️  Modular Express CLI"));

  let { projectName } = argvName
    ? { projectName: argvName }
    : await inquirer.prompt([
        {
          name: "projectName",
          message: "Project name:",
          default: "my-express-app",
        },
      ]);

  const targetDir = path.join(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `Directory "${projectName}" already exists. Overwrite?`,
        default: false,
      },
    ]);
    if (!overwrite) {
      console.log(chalk.yellow("Cancelled."));
      process.exit(1);
    }
    await fs.remove(targetDir);
  }

  const templateDir = path.join(__dirname, "template");

  console.log(chalk.gray("Copying template..."));
  await fs.copy(templateDir, targetDir);

  const gitignorePath = path.join(targetDir, "_gitignore");
  if (fs.existsSync(gitignorePath)) {
    await fs.rename(gitignorePath, path.join(targetDir, ".gitignore"));
  }

  const renderExtensions = [".json", ".md", ".js", ".txt"];
  const walk = async (dir) => {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      const stat = await fs.stat(full);
      if (stat.isDirectory()) {
        await walk(full);
      } else {
        const ext = path.extname(full);
        if (renderExtensions.includes(ext)) {
          const content = await fs.readFile(full, "utf8");
          if (content.includes("<%")) {
            const rendered = ejs.render(content, { name: projectName });
            await fs.writeFile(full, rendered, "utf8");
          }
        }
      }
    }
  };
  await walk(targetDir);

  try {
    execaCommandSync("git init -b main", {
      cwd: targetDir,
      stdio: "inherit",
      shell: true,
    });
    console.log(chalk.green("Git repository initialized."));
  } catch (err) {
    console.log(chalk.yellow("Git init failed:", err.message));
  }

  try {
    execaCommandSync("git add .", {
      cwd: targetDir,
      stdio: "inherit",
      shell: true,
    });
    execaCommandSync('git commit -m "Initial commit"', {
      cwd: targetDir,
      stdio: "inherit",
      shell: true,
    });
    console.log(chalk.green("Initial commit done."));
  } catch (err) {
    console.log(chalk.yellow("Git commit skipped:", err.message));
  }

  const { install } = await inquirer.prompt([
    {
      type: "confirm",
      name: "install",
      message: "Install dependencies now?",
      default: false,
    },
  ]);

  if (install) {
    let pkgManager = "npm";

    try {
      execaCommandSync("pnpm --version", { stdio: "ignore" });
      pkgManager = "pnpm";
      console.log(chalk.gray("Detected pnpm"));
    } catch {
      console.log(chalk.gray("Using npm (pnpm not found)"));
    }

    console.log(chalk.gray(`Installing deps with ${pkgManager}...`));
    execaCommandSync(`${pkgManager} install`, {
      cwd: targetDir,
      stdio: "inherit",
    });
  }

  console.log(chalk.blue("\nAll done! Next steps:\n"));
  console.log(chalk.white(`  cd ${projectName}`));
  console.log(chalk.white(`  ${install ? "" : "npm install && "}npm run dev`));
  console.log(chalk.green("\nHappy coding! 🚀"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
