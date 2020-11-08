import axios from "axios";

const cov19API = axios.create({
    baseURL: "https://api.coronavirus.data.gov.uk",
    timeout: 5000
});

/**
 * Creates filters to use in the COVID-19 API
 * @param {Object} options - Filter parameters
 * @param {string} options.areaType - Type of area
 * @param {string} options.areaNames - Names of areas
 * @returns {string} COVID-19 API Filters 
 */
export function parseFilters({ areaType, areaNames }) {
    let filters = `areaType=${ areaType }`;

    if (areaType != "overview" && areaNames.length == 1) {
        filters += `;areaName=${ areaNames[0] }`;
    }

    return filters;
}

/**
 * Creates a structure to use in the COVID-19 API
 * @param {Object} options - Structure parameters
 * @param {string} options.dataType - Type of data
 * @param {string} options.countType - Type of data count
 * @param {Array.<string>} options.areaNames - Names of areas
 * @returns {string} COVID-19 API Structure
 */
export function parseStructure({ dataType, countType, areaNames }) {
    let structure = { "date": "date" };
    
    switch (countType) {
        case "new":
            switch (dataType) {
                case "cases": structure.dataCount = "newCasesByPublishDate"; break;
                case "deaths": structure.dataCount = "newDeaths28DaysByPublishDate"; break;
                case "tests": structure.dataCount = "newTestsByPublishDate"; break;
                case "admissions": structure.dataCount = "newAdmissions"; break;
            }
            break;
        case "accumulative":
            switch (dataType) {
                case "cases": structure.dataCount = "cumCasesByPublishDate"; break;
                case "deaths": structure.dataCount = "cumDeaths28DaysByPublishDate"; break;
                case "tests": structure.dataCount = "cumTestsByPublishDate"; break;
                case "admissions": structure.dataCount = "cumAdmissions"; break;
            }
            break;
    }

    if (areaNames.length > 1) {
        structure.areaName = "areaName";
    }

    return JSON.stringify(structure);
}

/**
 * Retrieves COVID-19 data entries from API
 * @param {string} filters - COVID-19 API filters
 * @param {string} structure - COVID-19 API structure
 * @returns {Promise<Array.<Object>>} COVID-19 data entries
 */
export async function getCovidData(filters, structure) {
    let params = { filters, structure, page: 1 }
    let covidEntries = [];
    let next;

    do {
        try {
            let { data, status } = await cov19API.get('/v1/data', { params });
            
            switch (status) {
                case 200:
                    covidEntries.push(...data.data);
                    next = data.pagination.next;
                    if (next) {
                        params.page++;
                    }
                    break;
                case 204:
                    console.log("No data available from the selected parameters.");
                    break;
                default:
                    console.log("Unable to fetch COVID-19 data.");
                    break;
            }
        } catch(e) {
            console.log("Error occurred fetching COVID-19 data.");
            next = null;
        }
    } while (next);
    
    return covidEntries;
}
