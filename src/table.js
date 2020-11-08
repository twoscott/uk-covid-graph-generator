import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import * as helpers from "./helpers.js";
import { config, areas } from "./data.js";

const htmlTemplate = fs.readFileSync("./html/graph_template.html", {encoding: 'utf8'});

/**
 * Generates rows to use in graph
 * @param {Array.<Object>} covidData - COVID-19 API data entries
 * @param {Array.<string>} columnTitles - Column names
 * @returns {Array.<Array.<*>>} Rows of COVID-19 data
 */
export function generateRows(covidData, columnTitles) {
    let rows = [];
    
    if (columnTitles.length == 1) {
        for (let entry of covidData) {
            rows.push([ entry.date, entry.dataCount ]);
        }
    } else if (columnTitles.length > 1) {
        let rowsByDate = {};

        let areaIndexes = {};
        for (let i = 0; i < columnTitles.length; i++) {
            areaIndexes[columnTitles[i].toLowerCase()] = i;
        }

        for (let i = 0; i < covidData.length; i++) {
            let entry = covidData[i];

            if (!rowsByDate[ entry.date ]) {
                rowsByDate[ entry.date ] = new Array(columnTitles.length);
            }
            
            let columnIndex = areaIndexes[entry.areaName.toLowerCase()];
            rowsByDate[entry.date][columnIndex] = entry.dataCount;
        }

        for (let [ date, dataCounts ] of Object.entries(rowsByDate)) {
            rows.push([ date, ...dataCounts ]);
        }
    }

    return rows.sort();
}

/**
 * Generates a graph of selected COVID-19 data and saves it to ./graphs/
 * @param {Array.<string>} rows - Rows of Dates and COVID-19 data counts 
 * @param {Object} options - Options
 * @param {Array.<string>} options.areaNames - Names of columns
 * @param {string} options.dataType - Type of data
 * @param {string} options.countType - Type of data count 
 * @returns {Promise<string>} Absolute path the graph was saved to
 */
export async function generateGraph(rows, { areaNames: columnTitles, dataType, countType }) {
    const { width, height, format, quality, directory } = config.screenshot;

    const browser = await puppeteer.launch({ headless: config.browser.headless });
    const page = await browser.newPage();
    await page.setViewport({ width, height });

    const html = getFormattedHtml(rows, columnTitles, dataType, countType);
    await page.goto(`data:text/html;charset=utf-8,${ html }`, { waitUntil: "load" });

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }

    const timehash = Date.now().toString(36).toUpperCase();
    const filename = `${ timehash }-${ helpers.capitalise(countType) }-${ helpers.capitalise(dataType) }-Graph.${ format.replace("jpeg", "jpg") }`;
    const relativePath = directory + path.sep + filename;

    const options = { type: format, path: relativePath };
    if (format.replace("jpg", "jpeg") == "jpeg") {
        options.quality = quality;
    }

    await page.screenshot(options);
    browser.close();

    return path.resolve(relativePath);
}

/**
 * Passes user-selected and pre-configured options to html file/script in order to generate the graph
 * @param {Array.<string>} columnTitles - Column names
 * @param {Array.Array<string|number>>} rows - Rows of COVID-19 data
 * @param {string} dataType - Type of data
 * @param {string} countType - Type of data count
 * @returns {string} Formatted html
 */
function getFormattedHtml(rows, columnTitles, dataType, countType) {
    return htmlTemplate
        .replace(/{columnTitles}/g, JSON.stringify([ { label: "Date", type: "date" } ].concat(columnTitles.map(c => { return { label: c, type: "number" }; }))))
        .replace(/{rows}/g, JSON.stringify(rows))
        .replace(/{dataType}/g, helpers.capitalise(dataType))
        .replace(/{countType}/g, helpers.capitalise(countType))
        .replace(/{width}/g, config.screenshot.width)
        .replace(/{height}/g, config.screenshot.height)
        .replace(/{lineWidth}/g, config.graph.lineWidth)
        .replace(/{pointShape}/g, config.graph.pointShape)
        .replace(/{pointSize}/g, config.graph.pointSize)
        .replace(/{trendlines}/g, config.graph.trendlines ? columnTitles.map((c, i) => `${ i }: { type: "polynomial", pointSize: 0, opacity: 0.2 }`).join(',') : '')
        .replace(/{maximised}/g, config.graph.maximised ? "maximized" : null)
        .replace(/{gridlines}/g, rows.length >= 180 ? 6 : rows.length >= 30 ? rows.length / 6 : 7);
}
