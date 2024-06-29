import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const orderedLayers = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "public", "orderedLayers.json"), {
    encoding: "utf8",
    flag: "r",
  })
);

const defaultCombination = [];

orderedLayers.forEach((layer) => {
  const defaultItem = layer.items.find((i) => i.itmId === layer.defItmId);

  defaultCombination.push({
    url: defaultItem?.originals?.[0]?.url || "",
    x: layer.x,
    y: layer.y,
    itmId: layer.defItmId,
    cId: defaultItem?.originals?.[0]?.cId || 0,
  });
});

fs.writeFileSync(
  path.join(__dirname, "..", "public", "defaultCombination.json"),
  JSON.stringify(defaultCombination),
  { encoding: "utf8", flag: "w" }
);
