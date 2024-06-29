// organize original layer data to a more readable format

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import orderLayersByDepth from "./findDepth.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cf = JSON.parse(
  readFileSync(join(__dirname, "data", "cf.json"), {
    encoding: "utf8",
    flag: "r",
  })
);

const img = JSON.parse(
  readFileSync(join(__dirname, "data", "img.json"), {
    encoding: "utf8",
    flag: "r",
  })
);

const pList = cf.pList;
const cpList = cf.cpList;
const imgLst = img.lst;

pList.forEach((layer) => {
  // copy colors
  layer.colors = {};
  cpList[layer.cpId].forEach((color) => {
    Object.assign(layer.colors, { [color.cId]: color.cd });
  });

  layer.items.forEach((item) => {
    const originals = [];

    Object.keys(layer.colors).forEach((cId) => {
      if (imgLst?.[item.itmId]?.[layer.lyrs[0]]?.[cId]?.url) {
        originals.push({
          cId: Number(cId),
          url: imgLst[item.itmId][layer.lyrs[0]][cId].url,
        });
      }
    });

    item.originals = originals;
  });
});

const orderedPList = orderLayersByDepth(pList, cf.lyrList);

writeFileSync(
  join(__dirname, "..", "public", "orderedLayers.json"),
  JSON.stringify(orderedPList),
  { encoding: "utf8", flag: "w" }
);
