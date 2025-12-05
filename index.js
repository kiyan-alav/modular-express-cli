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

function ensureValidCwd() {
  try {
    const cwd = process.cwd();
    fs.accessSync(cwd, fs.constants.R_OK | fs.constants.W_OK);
  } catch (err) {
    console.error("\n❌  Current directory is invalid or inaccessible.");
    console.error(
      "➡️  Please navigate to a normal folder and run the CLI again.\n"
    );
    process.exit(1);
  }
}
ensureValidCwd();

async function renderTemplates(targetDir, data) {
  const exts = [".json", ".md", ".js", ".txt"];

  const walk = async (dir) => {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      const stat = await fs.stat(full);

      if (stat.isDirectory()) {
        await walk(full);
      } else {
        const ext = path.extname(full);
        if (exts.includes(ext)) {
          const content = await fs.readFile(full, "utf8");
          if (content.includes("<%")) {
            const rendered = ejs.render(content, data);
            await fs.writeFile(full, rendered, "utf8");
          }
        }
      }
    }
  };

  await walk(targetDir);
}

function initGit(targetDir) {
  try {
    execaCommandSync("git init -b main", {
      cwd: targetDir,
      stdio: "inherit",
      shell: true,
    });
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
    console.log(chalk.green("✔ Git initialized and first commit created.\n"));
  } catch (err) {
    console.log(chalk.yellow(`⚠ Git setup skipped: ${err.message}\n`));
  }
}

function detectPackageManager() {
  try {
    execaCommandSync("pnpm --version", { stdio: "ignore" });
    return "pnpm";
  } catch {
    return "npm";
  }
}

async function installDependencies(targetDir) {
  const pkg = detectPackageManager();
  console.log(chalk.gray(`Installing dependencies using ${pkg}...\n`));

  execaCommandSync(`${pkg} install`, {
    cwd: targetDir,
    stdio: "inherit",
  });
}

async function main() {
  console.log(chalk.cyan("🛠️  Modular Express CLI"));
  console.log("");

  const argName = process.argv[2];
  const { projectName } = argName
    ? { projectName: argName }
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
  console.log(chalk.gray("Copying project template..."));
  await fs.copy(templateDir, targetDir);

  const specialRenames = [
    ["_gitignore", ".gitignore"],
    ["_env", ".env"],
  ];

  for (const [from, to] of specialRenames) {
    const src = path.join(targetDir, from);
    const dest = path.join(targetDir, to);
    if (fs.existsSync(src)) {
      await fs.rename(src, dest);
    }
  }

  await renderTemplates(targetDir, { name: projectName });

  initGit(targetDir);

  const { install } = await inquirer.prompt([
    {
      type: "confirm",
      name: "install",
      message: "Install dependencies now?",
      default: false,
    },
  ]);

  if (install) {
    await installDependencies(targetDir);
  }

  console.log(chalk.blue("\nNext steps:\n"));
  console.log(`  cd ${projectName}`);
  console.log(`  ${install ? "" : "npm install && "}npm run dev\n`);
  console.log(chalk.green("🚀 All set! Happy coding!\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
