import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cdnPrefix = "/app/image_maker/";

const cfList = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "cfList.json"), {
    encoding: "utf8",
    flag: "r",
  })
);

const imgList = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "imgList.json"), {
    encoding: "utf8",
    flag: "r",
  })
);

const imgUrls = [];

imgList.forEach((imgPath) => {
  imgUrls.push(`${cdnPrefix}${imgPath}`);
});

cfList.forEach((imgPath) => {
  imgUrls.push(`${cdnPrefix}${imgPath}`);
});

fs.writeFileSync(
  path.join(__dirname, "data", "imgs.json"),
  JSON.stringify(imgUrls, null, 2)
);
