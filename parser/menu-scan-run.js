const fs = require("fs");
const child_process = require("child_process");
const path = require("path");

const stream = require("stream");
const readline = require("readline");

const version = 2025;

const scannerPath = path.join(__dirname, "scanner.scpt");

const stepsFolder = path.join(__dirname, "steps");
if (!fs.existsSync(stepsFolder)) fs.mkdirSync(stepsFolder);


const raw1Path = path.join(stepsFolder, `1-results-raw-${version}.txt`);
const fixed2Path = path.join(stepsFolder, `2-results-fixed-${version}.json`);
const flat3Path = path.join(stepsFolder, `3-results-flat-${version}.js`);
const clean4Path = path.join(stepsFolder, `4-results-clean-${version}.json`);
const jsx5Path = path.join(stepsFolder, `5-results-extend-script-${version}.jsx`);
const out6Path = path.join(stepsFolder, "6-results-filtered.json");
const dict7Path = path.join(stepsFolder, `7-dictionary-results-${version}.json`);
const merged8Path = path.join(stepsFolder, `8-merged-results-${version}.json`);

async function run() {


    //* 1. Run Scanner
    console.log("Running scanner (this will take several minutes) ...");
    fs.existsSync(raw1Path) && fs.unlinkSync(raw1Path);
    child_process.execSync(`osascript "${scannerPath}" > "${raw1Path}"`, {
        encoding: "utf-8",
    })


    const raw = fs.readFileSync(raw1Path, { encoding: 'utf-8' })

    //* 2. Fix Typos
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    let fixed = raw
        // .substring(1, raw.length - 1) // remove first and last quotes
        // .replace(/\\"/g, '"') // remove escaped quotes
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        // remove all new lines
        .replace(/\\n/g, '')
        .replace(/\\r/g, '')
        .replace(/\s+/g, '')
        .replace(emailRegex, '');

    // remove trailing commas
    fixed = fixed.replace(/,\}/g, '}');
    fs.existsSync(fixed2Path) && fs.unlinkSync(fixed2Path);
    fs.writeFileSync(fixed2Path, fixed);
    console.log(`File saved: ${path.basename(fixed2Path)}`);
    // console.log(fixed)

    let fixedObj = {};

    try {
        fixedObj = JSON.parse(fixed)
    }
    catch (e) {
        console.log('Error parsing JSON')
        console.log('Saving fixed string to: results-fixed.json')
        console.log(e)
    }

    //* 3. Flatten object
    const IGNORE_CATEGORIES = [
        "RecentItems",
        "Extensions",
        "OpenRecent",
        "RecentScriptFiles"
    ];
    const IGNORE_EXTENSIONS = [
        '.jsx',
        '.jsxbin',
        '.js',
    ];

    function extractStrings(obj) {
        let result = [];

        const traverse = (value) => {
            if (Array.isArray(value)) {
                value.forEach((item) => traverse(item));
            } else if (typeof value === "object" && value !== null) {
                Object.keys(value).forEach((key) => {
                    // console.log({ key })
                    const item = value[key];
                    if (IGNORE_CATEGORIES.includes(key)) return;
                    traverse(item)
                });
            } else if (typeof value === "string") {
                if (IGNORE_EXTENSIONS.find((ext) => value.includes(ext))) return;
                result.push(value);
            }
        };

        traverse(obj);

        return result;
    }

    const strings = extractStrings(fixedObj);
    fs.existsSync(flat3Path) && fs.unlinkSync(flat3Path);
    fs.writeFileSync(flat3Path, JSON.stringify(strings, null, 2));
    console.log(`File saved: ${path.basename(flat3Path)}`);

    //* 4. Clean up strings

    // Tidy Up
    const cleanStrings = strings.map((item) => {
        return item
            .replace(/….*/g, '')
            .replace(/\.\.\./g, '')
            .replace(/Can’t/g, '')
            .replace(/Show“.*”inFinder/g, '')
            .replace(/.*.app/, '')
    })

    const excludePatterns = [
        'dummy',
        'missingvalue',
        ''
    ];

    const filtered = cleanStrings.filter((item) => {
        return excludePatterns.indexOf(item) === -1;
    })

    const deduped = [...new Set(filtered)];

    const jsonList = JSON.stringify(deduped, null, 2);

    fs.existsSync(clean4Path) && fs.unlinkSync(clean4Path);
    fs.writeFileSync(clean4Path, jsonList);
    console.log(`File saved: ${path.basename(clean4Path)}`);

    //* 5. Run in ExtendScript to get command IDs

    // Run in ExtendScript to filter actual commands

    const esString = `var s = ${jsonList};    
    var res = {};
    
    for (var i = 0; i < s.length; i++) {
        var element = s[i];
        var elementSimple = element.replace(/\s/g, ''); // most command names work without spaces
        var cmd = app.findMenuCommandId(element)
        var cmdSimple = app.findMenuCommandId(elementSimple);
        if(cmdSimple){
            res[cmd] = elementSimple;
        }else{
            res[cmd] = element;
        }
        
    }
    JSON.stringify(res);
    file = new File("${out6Path}");
    file.open("w");
    file.write(JSON.stringify(res, null, 2));
    file.close();
    `;

    fs.existsSync(jsx5Path) && fs.unlinkSync(jsx5Path);
    fs.writeFileSync(jsx5Path, esString);
    console.log(`File saved: ${path.basename(jsx5Path)}`);

    fs.existsSync(out6Path) && fs.unlinkSync(out6Path);
    child_process.execSync(`osascript -l JavaScript -e 'ae = Application("Adobe After Effects ${version}"); ae.activate(); ae.doscriptfile("${jsx5Path}");'`);

    const filteredRaw = fs.readFileSync(out6Path, { encoding: 'utf-8' })
    let filteredObj = JSON.parse(filteredRaw);

    //* 7 Get Command IDs from Dictionary file

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


    // const datFileWin = `C:/Program Files/Adobe/Adobe After Effects ${version}/Support Files/Dictionaries/es_ES/after_effects_es_ES.dat`;
    const datFileMac = `/Applications/Adobe After Effects ${version}/Adobe After Effects ${version}.app/Contents/Dictionaries/es_ES/after_effects_es_ES.dat`;

    const dictionaryObj = await getCmdIds(datFileMac)
    const txt = JSON.stringify(dictionaryObj, null, "\t");

    fs.existsSync(dict7Path) && fs.unlinkSync(dict7Path);
    fs.writeFileSync(dict7Path, txt, { encoding: "utf-8", });
    console.log(`File saved: ${path.basename(dict7Path)}`);

    const merged = Object.assign({}, filteredObj);
    let overwriteCount = 0;
    Object.keys(dictionaryObj).map((key) => {
        if (filteredObj[key] && filteredObj[key] !== dictionaryObj[key]) {
            overwriteCount++;
            console.log(`Overwriting ${filteredObj[key]} with ${dictionaryObj[key]}`);
        }
        merged[key] = dictionaryObj[key];
    });
    console.log({
        menuCount: Object.keys(filteredObj).length,
        dictionaryCount: Object.keys(dictionaryObj).length,
        overwriteCount: overwriteCount,
        mergedCount: Object.keys(merged).length,
    });

    const mergedTxt = JSON.stringify(merged, null, "\t");
    fs.existsSync(merged8Path) && fs.unlinkSync(merged8Path);
    fs.writeFileSync(merged8Path, mergedTxt, { encoding: "utf-8", });
    console.log(`File saved: ${path.basename(merged8Path)}`);
}

run();