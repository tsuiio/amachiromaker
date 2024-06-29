import axios from "axios";
import { execSync } from "child_process";
import { readFileSync, mkdirSync, createWriteStream } from "fs";
import { join, dirname } from "path";
import yargs from "yargs";
import { fileURLToPath } from "url";

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
  try {
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
  } catch (error) {
    console.error(`Error downloading ${url}: ${error.message}`);
  }
}

async function downloadImages() {
  const concurrentDownloads = argv.threads;
  let currentIndex = 0;

  const downloadNext = async () => {
    if (currentIndex >= IMG_LIST.length) {
      return Promise.resolve();
    }
    const img = IMG_LIST[currentIndex++];
    const url = `https://${img}`;
    const outputPath = join(__dirname, "..", "public", img);
    console.log(`Downloading ${img}`);
    await downloadFile(url, outputPath);
    return downloadNext();
  };

  const promises = [];
  for (let i = 0; i < concurrentDownloads; i++) {
    promises.push(downloadNext());
  }

  await Promise.all(promises);
}

function runScript(scriptPath) {
  try {
    execSync(`node ${scriptPath}`, { stdio: "inherit" });
  } catch (error) {
    console.error(`Error running script ${scriptPath}: ${error.message}`);
  }
}

async function main() {
  await downloadImages();

  runScript(join(__dirname, "organizeData.js"));
  runScript(join(__dirname, "findDefaultCombination.js"));
}

main();
