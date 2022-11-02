const fs = require("fs");
const path = require("path");
const stream = require("stream");
const readline = require("readline");

const getCmdIds = (datFile) => {
  return new Promise((resolve) => {
    const instream = fs.createReadStream(datFile, "utf8");
    const outstream = new stream();
    const rl = readline.createInterface(instream, outstream);
    let menuIDs = {};
    rl.on("line", (line) => {
      if (line.match(/\$\$\$\/AE\/MenuID/)) {
        line = line.substring(line.lastIndexOf("/") + 1);
        const data = line.match(/[a-z|A-Z|0-9]*\_[0-9]*/);
        if (data) {
          const name = data[0].match(/[a-z|A-Z|0-9]*\_/)[0].slice(0, -1);
          const number = data[0].match(/\_[0-9]*/)[0].substr(1);
          if (number && name) {
            menuIDs[number] = name;
          }
        }
      }
    });
    rl.on("close", () => resolve(menuIDs));
  });
};

const version = 2023;
const datFile = `C:/Program Files/Adobe/Adobe After Effects ${version}/Support Files/Dictionaries/es_ES/after_effects_es_ES.dat`;

getCmdIds(datFile).then((res) => {
  console.log(`${Object.keys(res).length} Command IDs Found`);
  const txt = JSON.stringify(res, null, "\t");
  const outFile = path.join(__dirname, `${version}.json`);
  fs.writeFileSync(outFile, txt, {
    encoding: "utf-8",
  });
  console.log(`File written to: ${outFile}`);
});
