/**
 * Returns the section of the template/text in between the left most <!-- {keyword} Begin --> and the right most <!-- {keyword} End --> strings
 * marker strings are case sensitive and whitspace doesn't matter
 * @param {string} text - The text content to measure.
 * @param {Object} fontStyles - An object with font-related CSS properties.
 * @param {number} maxLines - The maximum number of lines allowed for the text to cover.
 * @param {number} minWidth - The minimum width to start expanding from (in pixels).
 * 
 * @returns {number} The minimum width that results in max 3 lines of text.
 */

export function getTemplateWithinInterval(templateString, keyword) { 
    const beginRegex = new RegExp(`<!--\\s*${keyword}\\s*Begin\\s*-->`);
    const endRegex = new RegExp(`<!--\\s*${keyword}\\s*End\\s*-->`, 'g');

    const beginMatch = beginRegex.exec(templateString);

    if (beginMatch !== null) {
        templateString = templateString.slice(beginMatch.index + beginMatch[0].length);
    }

    let lastIndex = -1;
    let match;

    while ((match = endRegex.exec(templateString)) !== null) {
        lastIndex = match.index
    }

    //console.log(lastIndex)

    if (lastIndex !== -1) {
        templateString = templateString.slice(0, lastIndex);
    }

    return templateString;

}