# After Effects Command IDs

### v2.0.1

[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/hyperbrew/after-effects-command-ids/blob/master/LICENSE)
[![Chat](https://img.shields.io/badge/chat-discord-7289da.svg)](https://discord.gg/PC3EvvuRbc)

Find and use Command IDs for scripting in Adobe After Effects across versions.

_Full blog post:_ https://hyperbrew.co/blog/after-effects-command-ids/

---

## Viewer

Open the viewer to quickly search and find the Command ID for your version of After Effects:

https://hyperbrew.github.io/after-effects-command-ids

![Viewer](./media/viewer.jpg)

---

## Usage

Use Command IDs in After Effects with `app.executeCommand();`

---

## JSON

Download the complete list of JSON file for each version of After Effects in the [`/json/`](./json) folder.

---

## Scanner

v2.0 adds a MacOS Menu Scanner to the process to capture even more Command IDs.

To run yourself:

- clone the repo on Mac
- install dependencies: `yarn`
- Launch the desired After Effects version
- Update the version variable in `parser\menu-scan-run.js` to your After Effects Version (e.g. `2024`, `2025`, etc)
- run the scanner: `yarn scan` (or just `yarn scan-post` if you already have generated the `1-results-raw-vvvv.txt` which takes several minues)
- wait several minutes for the process to complete
- results will printed to: `8-merged-results-vvvv.json`

See the scanner in [`/parser/menu-scan-run.js`](./parser/menu-scan-run.js) for more details

---

## Menu Develop Quickstart

- Install: `yarn`
- Develop: `yarn dev`
- Build: `yarn build`
