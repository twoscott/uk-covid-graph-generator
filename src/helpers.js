/**
 * Capitalises the first character of a provided string
 * @param {string} text - String to capitalise the first character of
 * @returns {string} Capitalised string
 */
export function capitalise(text) {
    return text[0].toUpperCase() + text.slice(1);
}
    