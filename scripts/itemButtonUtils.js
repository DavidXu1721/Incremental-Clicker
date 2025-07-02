import { getTemplateWithinInterval } from './templateUtils.js'

const upgradesSection = document.querySelector('.upgrades-section');
const buildingsSection = document.querySelector('.buildings-section');

const popUpAnchor = document.querySelector('.pop-up-anchor');

export function generateItemButtons(type, itemStats) { // this just creates the html elements for the upgrade buttons and the respective popup
    let targetSection

    switch (type){
        case 'upgrade':
            targetSection = upgradesSection;
            break;
        case 'building':
            targetSection = buildingsSection;
            break;
        default:
            console.log('ERROR: invalid item type ' + type)
    }
    //console.log(document.getElementById(`${type}-button-template`));
    //console.log(document.getElementById(`${type}-pop-up-template`));
    
    
    const buttonTemplate = document.getElementById(`${type}-button-template`).textContent;
    const popUpTemplate = document.getElementById(`${type}-pop-up-template`).textContent;

    let sectionHtml = '';
    let popUpsHtml = '';

    itemStats.forEach((item) => {

        let buttonHtml = buttonTemplate;
        let popUpHtml = popUpTemplate;

        Object.keys(item).forEach((key) => {
            if (item[key] instanceof Function || item[key] instanceof Array) {
                return;
            }

            let subValue

            if (typeof item[key] == "string"){
                subValue = item[key].replaceAll('_', ' ') // basically it would really help (in element IDs) to have no spaces in the name, so we need to remove them for the titles and stuff
            } else{
                subValue = item[key]
            }

            const regex = new RegExp(`{{${key}}}`, 'g');
            const regexLit = new RegExp(`{{&${key}}}`, 'g'); // this is a special key to specify that it doesnt' want any 'sanitizing' of the value
            buttonHtml = buttonHtml.replace(regex, subValue);
            buttonHtml = buttonHtml.replace(regexLit, item[key]);

            popUpHtml = popUpHtml.replace(regex, subValue);
            popUpHtml = popUpHtml.replace(regexLit, item[key]);
        })

        sectionHtml += buttonHtml;
        popUpsHtml += popUpHtml;
    })

    targetSection.innerHTML = sectionHtml;
    popUpAnchor.querySelector(`.${type}-pop-ups`).innerHTML = popUpsHtml;
}

export function updateItemPopUpText(type, item, useDefault, customPopUpTextHTML = '') {

    if (useDefault) {

        let popUpTextHTML = getTemplateWithinInterval(document.getElementById(`${type}-pop-up-template`).textContent, 'Text');
        
        Object.keys(item).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, 'g');

            if (item[key] instanceof Function || item[key] instanceof Array) {
                return;
            } else if (typeof item[key] === 'number'){
                popUpTextHTML = popUpTextHTML.replace(regex, parseFloat(item[key].toFixed(2)));
            } else {
                popUpTextHTML = popUpTextHTML.replace(regex, item[key]);
            }
            
        })
        
        document.getElementById(`${item.name}-pop-up`).querySelector('p').innerHTML = popUpTextHTML
    } else {
        document.getElementById(`${item.name}-pop-up`).querySelector('p').innerHTML = customPopUpTextHTML
    }
    
}