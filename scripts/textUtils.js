/**
 * Measures minimum width for a block of text to wrap to a specified number of lines.
 * MAKE SURE THAT box-sizing is set to border-box
 * @param {string} text - The text content to measure.
 * @param {Object} fontStyles - An object with font-related CSS properties.
 * @param {number} maxLines - The maximum number of lines allowed for the text to cover.
 * @param {number} minWidth - The minimum width to start expanding from (in pixels).
 * 
 * @returns {number} The minimum width that results in max 3 lines of text.
 */

export function calculateMinimumTextWidth(text, fontStyles={}, maxLines=1, minWidth= 100){
    // create a hidden div
    const div = document.createElement("div");

    // apply styles
    Object.assign(div.style, {
        backgroundColor: "black",
        position: "absolute",
        visibility: "hidden",
        //width: minWidth + "px",
        width: 'min-content',
        overflowWrap: "normal",
        ...fontStyles,
        paddingTop: '0px', // make the vertical padding zero so it doesn't add to the client height
        paddingBottom: '0px'
    });

    div.textContent = text;

    document.body.appendChild(div);

    // compute rendered lines
    const lineHeight = parseFloat(getComputedStyle(div).lineHeight);
    //console.log(div.clientHeight);
    //console.log(getComputedStyle(div).lineHeight);
    //console.log(getComputedStyle(div).fontSize);
    let lines = Math.round(div.clientHeight / lineHeight);
    //console.log(lines);
    let width = Math.max(minWidth, div.clientWidth);
    //console.log('Width: ' + width);
    // here we re adjust just in case that the clientWidth was smaller than the minWidth
    div.style.width = width + "px";
    // we reset the min width if it is smaller than the width from the min-content width
    minWidth = width;

    // expand until the text takes <= the max number of lines
    //console.log('expanding')
    while (lines > maxLines) {
        width += 100;
        div.style.width = width + "px";
        //console.log(width);
        //console.log(div.clientHeight);
        
        lines = Math.round(div.clientHeight / lineHeight);
        //console.log(lines);
    }

    // then contract until right before the text takes up more than the max lines
    //console.log('contracting')
    while (lines <= maxLines && width >= minWidth) {
        width -= 5;
        div.style.width = width + "px";
        //console.log(width);
        //console.log(div.clientHeight);
        
        lines = Math.round(div.clientHeight / lineHeight);
        //console.log(lines);
    }

    div.remove();
    
    return width + 5 ; // +5 because the width was 5px too small from the last while loop
}