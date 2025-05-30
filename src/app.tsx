import * as React from "react";
const { useState } = React;

import manual from "../json/manual.json";

import cmds2025 from "../json/2025.json";
import cmds2024 from "../json/2024.json";
import cmds2023 from "../json/2023.json";
import cmds2022 from "../json/2022.json";
import cmds2021 from "../json/2021.json";
import cmds2020 from "../json/2020.json";
import cmds2019 from "../json/2019.json";
import cmds2018 from "../json/2018.json";
import cmds2017 from "../json/2017.json";
import cmds2015_3 from "../json/2015.3.json";
import cmds2015 from "../json/2015.json";
import nameOverrides from "../json/name-overrides.json";

import "./styles.scss";
import { Badge } from "./badge/badge";

interface DataByYear {
  [key: string]: string;
}
interface DataCommand {
  [key: string]: string;
}
interface DataByCommands {
  [key: string]: DataCommand;
}
interface FormatPair {
  obj: DataByYear;
  year: string;
}

const years = [
  "(manual)",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2015_3",
  "2015",
];
const cmdList: DataByCommands = {};

const overrideMatch = (key: string) => {
  const match = nameOverrides[key as keyof typeof nameOverrides];
  if (match) {
    console.log(`Override: ${key} -> ${match}`);
    return match;
  }
  return key;
};

const formatData = (data: FormatPair[]) => {
  data.map(({ obj, year }) => {
    Object.keys(obj).map((key) => {
      const cmd = overrideMatch(obj[key]) as keyof DataCommand;
      if (!cmdList[cmd]) {
        cmdList[cmd] = { [year]: key };
      } else {
        if (cmdList[cmd][year]) {
          console.warn(
            `Duplicate command found: ${cmd} for year ${year}. Existing key: ${cmdList[cmd][year]}, new key: ${key}.`
          );
          let i = 2;
          const freeCmdName = `${cmd} (${i})`;
          if (!cmdList[freeCmdName]) {
            console.log(`new cmd ${freeCmdName}`);
            cmdList[freeCmdName] = { [year]: key };
          } else {
            cmdList[freeCmdName][year] = key;
          }
        } else {
          cmdList[cmd][year] = key;
        }
      }
    });
  });
};

const dataObj = [
  { obj: manual, year: "(manual)", count: Object.keys(manual).length },
  { obj: cmds2025, year: "2025", count: Object.keys(cmds2025).length },
  { obj: cmds2024, year: "2024", count: Object.keys(cmds2024).length },
  { obj: cmds2023, year: "2023", count: Object.keys(cmds2023).length },
  { obj: cmds2022, year: "2022", count: Object.keys(cmds2022).length },
  { obj: cmds2021, year: "2021", count: Object.keys(cmds2021).length },
  { obj: cmds2020, year: "2020", count: Object.keys(cmds2020).length },
  { obj: cmds2019, year: "2019", count: Object.keys(cmds2019).length },
  { obj: cmds2018, year: "2018", count: Object.keys(cmds2018).length },
  { obj: cmds2017, year: "2017", count: Object.keys(cmds2017).length },
  { obj: cmds2015_3, year: "2015_3", count: Object.keys(cmds2015_3).length },
  { obj: cmds2015, year: "2015", count: Object.keys(cmds2015).length },
];

formatData(dataObj);

const isIframe = window.self != window.top;

export default () => {
  const [val, setVal] = useState("");
  return (
    <div className="main">
      <h2>After Effects Command IDs</h2>

      {!isIframe && <Badge />}

      <input
        className="searchbox"
        type="text"
        onChange={(e) => setVal(e.target.value)}
        value={val}
        spellCheck={false}
        placeholder="search..."
      />
      <table>
        <tbody>
          <tr className="result result-key result-header" key={-1}>
            <th key={0} className="result-name">
              Name
            </th>
            {years.map((year, i) => (
              <th
                key={i + 1}
                className="result-year"
                title={
                  year === "(manual)"
                    ? "Entry manually created, Version uncertain."
                    : year
                }
              >
                {year.replace("_", ".")}
                <sup>{dataObj.find((obj) => obj.year === year)?.count}</sup>
              </th>
            ))}
          </tr>
          {Object.keys(cmdList)
            .sort()

            .map(
              (cmd, i) =>
                cmd.toLowerCase().indexOf(val.toLowerCase()) > -1 && (
                  <tr className="result" key={i}>
                    <td className="result-name">{cmd}</td>
                    {years.map((year, ii) => (
                      <td
                        className={`result-year ${
                          !cmdList[cmd][year] && "result-na"
                        }`}
                        key={ii}
                      >
                        {cmdList[cmd][year] || "N/A"}
                      </td>
                    ))}
                  </tr>
                )
            )}
          {/* {Object.keys(manual)
            .sort()
            .map(
              (cmd, i) =>
                cmd.toLowerCase().indexOf(val.toLowerCase()) > -1 && (
                  <tr className="result" key={i}>
                    <td className="result-name">{cmd}</td>
                    {years.map((year, ii) => (
                      <td
                        className={`result-year ${
                          !cmdList[cmd][year] && "result-na"
                        }`}
                        key={ii}
                      >
                        {cmdList[cmd][year] || "N/A"}
                      </td>
                    ))}
                  </tr>
                )
            )} */}
        </tbody>
      </table>
    </div>
  );
};
