import * as cli from "./console.js";
import * as cov19 from "./covid_api.js";
import * as table from "./table.js";    

async function main() {
    let exit = false;
    cli.welcomeUser();

    while (!exit) {
        const userOptions = await cli.getUserOptions();
        // { areaNames, areaType, dataType, countType, timeframe }

        const filters = cov19.parseFilters(userOptions);
        const structure = cov19.parseStructure(userOptions);
        const covidData = await cov19.getCovidData(filters, structure);

        if (covidData.length > 0) {
            let rows = table.generateRows(covidData, userOptions.areaNames);
            if (userOptions.timeframe > 0) {
                rows = rows.slice(rows.length - userOptions.timeframe);
            }
            
            const ellipsisLoop = cli.ellipsisLoadingLoop("Generating COVID-19 Graph");
            let graphMsg;
            
            try {
                const graphPath = await table.generateGraph(rows, userOptions);
                graphMsg = `Graph generated successfully.\nSaved to "${ graphPath }"\n`;
            } catch(e) {
                console.error(e)
                graphMsg = "Error occurred generating graph.\n";
            }

            cli.stopLoadingLoop(ellipsisLoop);
            console.log(graphMsg);
        }

        exit = cli.getExitAnswer();
    }
}

await main();
