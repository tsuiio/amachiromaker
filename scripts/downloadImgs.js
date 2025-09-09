import axios from "axios";
import { execSync } from "child_process";
import { readFileSync, mkdirSync, createWriteStream } from "fs";
import { join, dirname } from "path";
import yargs from "yargs";
import { fileURLToPath, URL } from "url";
import PQueue from "p-queue";

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const argv = yargs(process.argv.slice(2))
  .options({
    threads: {
      alias: "t",
      description: "Number of concurrent threads",
      type: "number",
      default: 4,
    },
    assets: {
      alias: "a",
      description: "Download assets host",
      type: "string",
      default: "https://cdn.picrew.me",
    },
    help: {
      alias: "h",
      description: "Show help",
      type: "boolean",
    },
  })
  .help()
  .alias("help", "h").argv;

const IMG_LIST = JSON.parse(
  readFileSync(join(__dirname, "data", "imgs.json"), "utf-8")
);

async function downloadFile(url, outputPath) {
  const response = await axios({
    method: "get",
    url: url,
    responseType: "stream",
  });

  const directory = dirname(outputPath);
  mkdirSync(directory, { recursive: true });

  const writer = createWriteStream(outputPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function downloadImages() {
  const queue = new PQueue({
    concurrency: argv.threads,
    autoStart: true,
    retries: 10,
    interval: 1000,
    intervalCap: 100,
  });

  queue.on("error", (error) => {
    console.error(`${colors.red}Task error:${colors.reset}`, error);
  });

  const downloadTasks = IMG_LIST.map((img) => {
    return async () => {
      const url = new URL(img, argv.assets);
      const outputPath = join(__dirname, "..", "public", img);
      console.log(`${colors.yellow}Queuing download for ${url}${colors.reset}`);
      await downloadFile(url, outputPath);
      console.log(
        `${colors.green}Successfully downloaded ${url}${colors.reset}`
      );
    };
  });

  await queue.addAll(downloadTasks);

  await queue.onIdle().then(() => {
    console.log(
      `${colors.green}All download tasks have completed${colors.reset}`
    );
  });
}

function runScript(scriptPath) {
  try {
    execSync(`node ${scriptPath}`, { stdio: "inherit" });
  } catch (error) {
    console.error(
      `${colors.red}Error running script ${scriptPath}: ${error.message}${colors.reset}`
    );
  }
}

async function main() {
  await downloadImages();

  runScript(join(__dirname, "organizeData.js"));
  runScript(join(__dirname, "findDefaultCombination.js"));
}

main();
