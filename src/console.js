import readline from "readline-sync";
import { areas } from "./data.js";

/**
 * Briefs user on instructions
 */
export function welcomeUser() {
    console.log(
        "Welcome to the UK COVID-19 Graph generator.\n" +
        "Please answer the following queries using numbers where prompted to choose an option, and entering direct answers where necessary.\n" +
        "If you'd like to enter multiple answers, separate them by commas.\n"
    );
}

/**
 * Ask user for details about the graph they want to generate
 * @returns {Object} User chosen options - { areaNames, areaType, dataType, countType, timeframe }
 */
export function getUserOptions() {
    let areaNames = [ "United Kingdom" ];
    let dataType = "cases";
    let countType = "new";
    let areaType = "overview";
    let timeframe = 0;

    dataType = getDataType();
    countType = getCountType();
    areaType = getAreaType();

    switch(areaType) {
        case "overview": areaNames = [ "United Kingdom" ]; break;
        case "nation": areaNames = getNationNames(); break;
        case "region": areaNames = getRegionNames(); break;
    }

    timeframe = getTimeframe();

    return { areaNames, areaType, dataType, countType, timeframe };
}

/**
 * Animates loading ellipsis
 * @param {string} message - Loading message to send
 * @param {number} [rate=250] - Time to wait between loading steps {ms}
 * @returns {Timeout} Timeout for loading task
 */
export function ellipsisLoadingLoop(message, rate=250) {
    const ellipsis = ['.  ', '.. ', '...'];
    let progress = 0;

    process.stdout.write(`\r${ message }...`);
    return setInterval(() => {
        process.stdout.write(`\r${ message }${ ellipsis[progress++] } `);
        progress %= 3;
    }, rate);
}

/**
 * Stops loading loop and resets cursor position to a new line
 * @param {Timeout} timeout - Timeout returned from loading loop
 */
export function stopLoadingLoop(timeout) {
    clearInterval(timeout);
    console.log(); // reset cursor position to new line
}

/**
 * Returns whether the user wants to exit the program or not
 * @returns {boolean} Exit
 */
export function getExitAnswer() {
    const validExitAnswers = [
        "y", "ye", "yes", "yeah",
        "n", "no", "nah", "nope"
    ];
    let input;

    input = readline.question("Would you like to generate another graph? (y/n): ").toLowerCase();
    while (!validExitAnswers.find(a => a.toLowerCase() == input)) {
        input = readline.question(`Please enter a valid answer (yes or no): `);
    }
    
    console.log();
    return input.startsWith("n");
}

/**
 * Prompts user to choose area type
 * @returns {string} Area type
 */
function getAreaType() {
    const validAreaTypes = [
        "overview",
        "nation",
        "region"
    ];
    let input;

    console.log(
        "Please choose the type of area you would like to generate data for:\n" +
        "1) Overview (United Kingdom)\n" +
        "2) Nation (England, Scotland, Wales, Northern Ireland)\n" +
        "3) Region (London, East Midlands, etc.)"
    );
    input = readline.question(`Option: `).toLowerCase();

    let intInput = parseInt(input);
    while (!intInput || intInput < 1 || intInput > 3) {
        input = readline.question(`Please enter an option between 1 and 3: `);
        intInput = parseInt(input);
    }

    console.log();
    return validAreaTypes[intInput-1];
}

/**
 * Prompts user to enter nation names
 * @returns {string} Nation names
 */
function getNationNames() {
    let inputs;
    let nations;

    console.log("Please enter the name of the nation(s) you would like to generate data for (or \"all\"):");
    inputs = readline.question(`Option: `).toLowerCase().split(/\s*,\s*/);

    if (inputs[0] == "all" && inputs.length == 1) {
        nations = areas.validNations;
    } else {
        while (inputs.find(e => !areas.validNations.find(n => n.toLowerCase() == e))) {
            console.log(`Please enter valid nations:\n${ areas.validNations.join('\n') }`);
            inputs = readline.question(`Option: `);
        }
        nations = inputs.map(a => areas.validNations.find(n => n.toLowerCase() == a));
    }

    console.log();
    return nations;
}

/**
 * Prompts user to enter region names
 * @returns {string} Region names
 */
function getRegionNames() {
    let inputs;
    let regions;

    console.log("Please enter the name of the region(s) you would like to generate data for (or \"all\"):");
    inputs = readline.question(`Option: `).toLowerCase().split(/\s*,\s*/);

    if (inputs[0] == "all" && inputs.length == 1) {
        regions = areas.validRegions;
    } else {
        while (inputs.find(e => !areas.validRegions.find(r => r.toLowerCase() == e))) {
            console.log(`Please enter valid regions:\n${ areas.validRegions.join('\n') }`);
            inputs = readline.question(`Option: `);
        }
        regions = inputs.map(a => areas.validRegions.find(r => r.toLowerCase() == a));
    }

    console.log();
    return regions;
}

/**
 * Prompts user to choose data type
 * @returns {string} Data type
 */
function getDataType() {
    const validDataTypes = [
        "cases",
        "deaths",
        "tests",
        "admissions"
    ];
    let input;

    console.log(
        "Please choose the type of data you would like to generate:\n" +
        "1) Cases\n" +
        "2) Deaths\n" +
        "3) Tests\n" +
        "4) Admissions"
    );
    input = readline.question(`Option: `).toLowerCase();

    let intInput = parseInt(input);
    while (!intInput || intInput < 1 || intInput > 4) {
        input = readline.question(`Please enter an option between 1 and 3: `);
        intInput = parseInt(input);
    }

    console.log();
    return validDataTypes[intInput-1];
}

/**
 * Prompts user to choose data count type
 * @returns {string} Data count type
 */
function getCountType() {
    const validCountTypes = [
        "new",
        "accumulative"
    ];
    let input;

    console.log(
        "Please choose the type of data you would like to generate:\n" +
        "1) New/Daily Data\n" +
        "2) Accumulative Data"
    );
    input = readline.question(`Option: `).toLowerCase();

    let intInput = parseInt(input);
    while (!intInput || intInput < 1 || intInput > 2) {
        input = readline.question(`Please enter an option between 1 and 2: `);
        intInput = parseInt(input);
    }

    console.log();
    return validCountTypes[intInput-1];
}

/**
 * Prompts user to choose a graph timeframe
 * @returns {string} Timeframe {days}
 */
function getTimeframe() {
    const validTimeframes = [ 0, 180, 90, 30, 7 ]; // number of days
    let input;

    console.log(
        "Please choose the timeframe you would like to generate data for:\n" +
        "1) All Time\n" +
        "2) 6 Months\n" +
        "3) 3 Months\n" +
        "4) 1 Month\n" +
        "5) 1 Week"
    );
    input = readline.question(`Option: `).toLowerCase();

    let intInput = parseInt(input);
    while (!intInput || intInput < 1 || intInput > 5) {
        input = readline.question(`Please enter an option between 1 and 5: `);
        intInput = parseInt(input);
    }

    console.log();
    return validTimeframes[intInput-1];
}
