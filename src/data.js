import fs from "fs";

export const config = JSON.parse(fs.readFileSync("./config.json"));
export const areas = JSON.parse(fs.readFileSync("./areas.json"));