import { calculateMinimumTextWidth } from "./textUtils.js";
import { createNotification, removeNotification } from './notificationSystem.js'
import { defaultValues, powerUpIntervals } from "./constants.js";
import { generateItemButtons, updateItemPopUpText} from './itemButtonUtils.js'

const coinCountLabel = document.querySelector('.coin-count');
const coinsPerClickLabel = document.querySelector('#cpc-text');
const coinsPerSecondLabel = document.querySelector('#cps-text');
const critClickLabels = {
    chance: document.getElementById('critical-click-chance-text'),
    multi: document.getElementById('critical-click-multi-text')
}
const bigCoinImg = document.getElementById('big-coin-img');
const coinImgContainer = document.querySelector('.coin-img-container');
const popUpAnchor = document.querySelector('.pop-up-anchor');

const saveButton = document.getElementById('save-button');
const loadButton = document.getElementById('load-button');

const rightSection = document.querySelector('.right');

const upgradesNavButton = document.getElementById('upgrade-nav-button');
const skillsNavButton = document.getElementById('skills-nav-button');

const itemButtons ={
    upgrades: {
        cursor: undefined,
        pickaxe: undefined,
        machinery: undefined
    },

    buildings: {
        miner: undefined,
        factory: undefined
    }
}

// background music
let userInteracted = false
const bgm = new Audio('./assets/audio/bgm.mp3');
bgm.volume = 0.1;
bgm.loop = true;

// Initialize the coin amount
let coinCount = 0;
let coinsPerClick = 1;
let critClick = {
    chance: 0,
    multi: 1
}
let coinsPerSec = 0;

const upgradeStats = defaultValues.upgradeStats

const buildingStats = defaultValues.buildingStats

// Save and load functionality
function save(autoSave = false) {
    console.log(autoSave);
    if (!autoSave && !confirm('Are you sure you want to save?')) {
        return
    }

    localStorage.clear()

    const saveData = {
        coins: {
            amount: coinCount,
            cpc : coinsPerClick,
            criticalClick: {
                chance: critClick.chance,
                multiplier: critClick.multiplier
            }
        },
        upgrades: {

        },
        buildings: {

        }
    }

    upgradeStats.forEach((upgrade) => {
        const obj ={
            level: upgrade.level,
            increase: upgrade.increase,
            powerUpCount: upgrade.powerUpCount,
            cost: upgrade.cost // i'm honestly debating if it's even necessary, but I guess I might as well do it for now
        };

        saveData.upgrades[upgrade.name] = obj;
    })

    buildingStats.forEach((building) => {
        const obj = {
            amount: building.amount,
            production: building.production,
            cost: building.cost // same as above
        };

        saveData.buildings[building.name] = obj;
    })

    localStorage.setItem('saveData', JSON.stringify(saveData));

    createNotification(autoSave? 'Game autosaved' :'Game saved', null, autoSave? 1000 :3000)
}

function load() {

    const saveData = JSON.parse(localStorage.getItem('saveData'));
    console.log(saveData);

    if (saveData === null){
        createNotification('No save file detected.')
        return
    }

    setCoinsAmount(() => (saveData.coins.amount));
    setCoinsPerClick(() => (saveData.coins.cpc));

    // reset the critClick data and then 
    
    Object.keys(critClick).forEach((key) => {
        
        setCriticalClick(key, () => (defaultValues.critClickStats[key]));
    })
    

    if (saveData.criticalClick !== undefined){
        Object.keys(critClick).forEach((key) => {
            if (saveData.criticalClick[key] !== undefined){
                console.log('loading critClick ' + key);
                
                setCriticalClick(key, () => (saveData.criticalClick[key]));
            } else {
                console.warn(`Save data for critClick ${key} is missing`);
            }
        })
    } else {
        console.warn('Save data for critClick is missing');
    }

    upgradeStats.forEach((upgrade) => {
        let upgradeData;

        if (saveData.upgrades[upgrade.name] === undefined) {
            // The data for this upgrade is not present, 
            console.warn('Save data for ' + upgrade.name + ' is missing ');
            // Use the default values for the save data
            const defaultUpgrade = defaultValues.upgradeStats.find((element) => element.name === upgrade.name);
            
            upgradeData = {
                level: defaultUpgrade.level,
                powerUpCount: defaultUpgrade.powerUpCount,
                increase: defaultUpgrade.increase,
                cost: defaultUpgrade.cost,
            }
        } else {
            // The data for this upgrade is present, use that data 
            upgradeData = saveData.upgrades[upgrade.name]
            console.log(upgradeData);
            console.log('ASD' + saveData.upgrades[upgrade.name].powerUpCount);
            
        }

        upgrade.powerUpCount = upgradeData.powerUpCount
        upgrade.increase = upgradeData.increase;
        setUpgradeLevel(upgrade.name, () => (upgradeData.level))
    
        upgrade.cost = upgradeData.cost;
        updateItemCost('upgrade', upgrade.name);
    });

    buildingStats.forEach((building) => {
        let buildingData
        
        if (saveData.buildings[building.name] === undefined) {
            // The data for this building is not present, 
            console.warn('Save data for ' + building.name + ' is missing ');
            // Use the default values for the save data
            const defaultBuilding = defaultValues.buildingStats.find((element) => element.name === building.name);
            
            buildingData = {
                amount: defaultBuilding.amount,
                production: defaultBuilding.production,
                cost: defaultBuilding.cost,
            }
        } else {
            // The data for this building is present, use that data 
            buildingData = saveData.buildings[building.name]
        }

        setBuildingAmount(building.name, () => (buildingData.amount));
        setBuildingProduction(building.name, () => (buildingData.production));
        building.cost = buildingData.cost; // there is literally no point in this lol
        updateItemCost('building', building.name);
    });
    
    updateCoinsPerSecond();
    createNotification('Save file loaded', null, 3000)
}

saveButton.addEventListener('click', () => {save()}); // can't just do save as it has a parameter
loadButton.addEventListener('click', load);

// Add functionality to the big coin button
function handleClick(event) {
    let isCrit = false
    let coinsGained

    if (Math.random() < critClick.chance){
        isCrit = true
        coinsGained = coinsPerClick * critClick.multi;
    } else {
        coinsGained = coinsPerClick;
    }
    
    setCoinsAmount((prev) => (prev + coinsGained));

    // We create a little +___ effect that floats up and fades
    const x = event.offsetX;
    const y = event.offsetY;

    const clickEffectDiv = document.createElement('div');
    clickEffectDiv.innerHTML = `+${parseFloat(coinsGained.toFixed(2))}`;
    clickEffectDiv.className = 'click-effect' + (isCrit? ' critical': '');
    clickEffectDiv.style.top = `${y}px`;
    clickEffectDiv.style.left = `${x}px`;

    coinImgContainer.appendChild(clickEffectDiv);
    clickEffectDiv.classList.add('fade-up');

    setTimeout(() => {clickEffectDiv.remove()}, 1000);
    
    //play a clicking sound
    const clickingSound = new Audio('./assets/audio/click.wav');
    clickingSound.play()
}

function setCoinsAmount(callback) {
    coinCount = callback(coinCount);
    coinCountLabel.innerHTML = parseFloat(coinCount.toFixed(2));
}

function setCoinsPerClick(callback) {
    coinsPerClick = callback(coinsPerClick);
    coinsPerClickLabel.innerHTML = parseFloat(coinsPerClick.toFixed(2));
}

function setCriticalClick(property, callback){
    if (critClick[property] === undefined) {
        console.error('Invalid property for critClick: ' + property);
        return;
    }

    console.log(critClick[property]);
    
    critClick[property] = callback(critClick[property]); // tbh the callback with probably never have a
    console.log(critClick[property]);
    

    switch (property) {
        case 'chance':
            critClickLabels[property].innerHTML = parseFloat((critClick[property]*100).toFixed(2)); // we miltiply by 100 to give a percentage
            break;
        case 'multi':
            critClickLabels[property].innerHTML = parseFloat(critClick[property].toFixed(2));
            break;
        default:   // at this point I can only assume that it's a string and add it directly
            critClickLabels[property].innerHTML = critClick[property];
    }
    
}

function updateCoinsPerSecond() { // probably the best way of doing this ngl, might cause performance issues recalculating the Cps from scratch everytime
    let updatedCoinsPerSec = 0;

    buildingStats.forEach((building) => {
        updatedCoinsPerSec += building.production * building.amount
    })

    coinsPerSec = updatedCoinsPerSec;
    coinsPerSecondLabel.innerHTML = parseFloat(coinsPerSec.toFixed(2));coinsPerSec
}

// here is the logic for upgrades and buildings
function getUpgradeFromName(name) {
    return upgradeStats.find((element) => element.name === name);
}

function getUpgradePowerUpIndex(name) {
    const targetUpgrade = getUpgradeFromName(name);

     // we detect if the upgrade is in the powerUpIntervals array
    let powerUpIndex = powerUpIntervals.indexOf(targetUpgrade.level);

    //console.log(targetUpgrade.powerUpCount);
    //console.log(targetUpgrade.powerUps.length - 1);
    //console.log(targetUpgrade.powerUpCount <= targetUpgrade.powerUps.length - 1);
    

    if (powerUpIndex !== -1 
        && targetUpgrade.powerUpCount < powerUpIndex + 1 
        && targetUpgrade.powerUpCount <= targetUpgrade.powerUps.length - 1) {  // if the level is a 'powerup' level AND we haven't already bought it AND the upgrade still has powerups, return the index, otherwise return -1
        return powerUpIndex
    } else {
        return -1
    }

}

function getBuildingFromName(name) {
    return buildingStats.find((element) => element.name === name);
}

function setUpgradeLevel(upgradeName, callback) { // this feels utterly bs that this is also the main updater for the button as a whole, but it's too cumbersome to bother with rn 
    const targetUpgrade = getUpgradeFromName(upgradeName);
    const upgradeButton = itemButtons.upgrades[upgradeName];

    targetUpgrade.level = callback(targetUpgrade.level);
    upgradeButton.querySelector('.upgrade-level').innerHTML = targetUpgrade.level;

    // add the stars to a
    upgradeButton.querySelector('.power-ups').innerHTML = '';
    for (let i = 0; i< targetUpgrade.powerUpCount; i++) {
        const star = document.createElement('i');

        star.classList.add('star');
        upgradeButton.querySelector('.power-ups').appendChild(star);
    }
    

     // we detect if the upgrade is in the powerUpIntervals array
    let powerUpIndex = getUpgradePowerUpIndex(targetUpgrade.name);

    if (powerUpIndex !== -1) {
        // then the upgrade button needs a new apperance
        upgradeButton.classList.add('power-up');

        // the title is replaced with the power up name
        upgradeButton.querySelector('.item-title').textContent = targetUpgrade.powerUps[powerUpIndex].name;

        updateItemPopUpText('upgrade', targetUpgrade, false, targetUpgrade.powerUps[powerUpIndex].description);

        updateItemInfoPopUpWidth(upgradeName);
        // and the repsective popUp
    } else { // this does feel unnecessary if the upgrade button wasn't already in a power up mode, but it should be fine...
        upgradeButton.classList.remove('power-up');

        // the title is replaced with the original name
        upgradeButton.querySelector('.item-title').textContent = targetUpgrade.name.replaceAll('_', ' ')
        
        // document.getElementById(upgradeName + '-pop-up').querySelector('p').innerHTML = 

        updateItemPopUpText('upgrade', targetUpgrade, true);

        updateItemInfoPopUpWidth(upgradeName);
    }
    
}

function setBuildingAmount(buildingName, callback) {
    const targetBuilding = getBuildingFromName(buildingName);

    targetBuilding.amount = callback(targetBuilding.amount);
    itemButtons.buildings[buildingName].querySelector('.building-amount').innerHTML = targetBuilding.amount;
}

function setBuildingProduction(buildingName, callback) {
    const targetBuilding = getBuildingFromName(buildingName);

    targetBuilding.production = callback(targetBuilding.production);
    document.getElementById(buildingName + '-pop-up').querySelector('.building-production').innerHTML = parseFloat(targetBuilding.production.toFixed(2));
    updateItemInfoPopUpWidth(buildingName);
}

function updateItemCost(type, itemName) {
    switch (type) {
        case 'upgrade':
            const targetUpgrade = getUpgradeFromName(itemName);

            targetUpgrade.cost = targetUpgrade.costScalingFunction(targetUpgrade.level);

            if (getUpgradePowerUpIndex(itemName) !== -1){ // if the upgrade is in the power up mode, it should be double the normal price
                targetUpgrade.cost *= 2;
            }

            itemButtons.upgrades[itemName].querySelector('.item-cost').innerHTML = parseFloat(targetUpgrade.cost.toFixed(2));
            break;
        case 'building':
            const targetBuilding = getBuildingFromName(itemName);

            targetBuilding.cost = targetBuilding.costScalingFunction(targetBuilding.amount);
            itemButtons.buildings[itemName].querySelector('.item-cost').innerHTML = parseFloat(targetBuilding.cost.toFixed(2));
            break;
        default:
            console.log('ERROR: invalid item type ' + type)
    }
}

function updateItemInfoPopUpWidth(itemName) { // IMPORTANT: i just gotta make sure that there is NO upgrade with the same name as an building
    // get computed styles from the item-info pop-up
    const targetPopUp = popUpAnchor.querySelector('#' + itemName+ '-pop-up')
    const computedStyles = getComputedStyle(targetPopUp);
    // Extract the font-related properties
    const fontStyles = {
        fontWeight: computedStyles.fontWeight,
        fontSize: computedStyles.fontSize,
        fontFamily: computedStyles.fontFamily,
        lineHeight: computedStyles.lineHeight,
        letterSpacing: computedStyles.letterSpacing,
        padding: computedStyles.padding,
        textAlign : computedStyles.textAlign
    };

    const updatedWidth = calculateMinimumTextWidth(targetPopUp.textContent, fontStyles, 3, 100);

    targetPopUp.style.width = updatedWidth + 'px';
}

function playErrorAudio(){
    const errorSound = new Audio('./assets/audio/error.mp3');
    errorSound.currentTime = 0.4;
    errorSound.play();
}

function buyUpgrade(upgradeName) {
    
    const targetUpgrade = getUpgradeFromName(upgradeName);

    if (coinCount >= targetUpgrade.cost) {
        const isPowerUp = getUpgradePowerUpIndex(upgradeName) !== -1

        setCoinsAmount((prev) => (prev - targetUpgrade.cost));

        if (isPowerUp) {

            switch(upgradeName) {
                case 'cursor':
                    console.log(getUpgradePowerUpIndex(upgradeName));
                    
                    // for the cursor upgrade, there are different types of upgrades, 
                    if (targetUpgrade.powerUps[getUpgradePowerUpIndex(upgradeName)].multiplier !== undefined){
                        //console.log(targetUpgrade.powerUps)
                        setCoinsPerClick((prev) => (targetUpgrade.powerUps[getUpgradePowerUpIndex(upgradeName)].multiplier * prev));
                    }

                    if (targetUpgrade.powerUps[getUpgradePowerUpIndex(upgradeName)].critClick !== undefined){
                        //console.log(targetUpgrade.powerUps)
                        const critClickPowerUpInfo = targetUpgrade.powerUps[getUpgradePowerUpIndex(upgradeName)].critClick;

                        Object.keys(critClickPowerUpInfo).forEach((key) => {
                            
                            setCriticalClick(key, () => (critClickPowerUpInfo[key]));
                        })
                    }
                    
                    break;
                case 'pickaxe':
                    setBuildingProduction('miner', (prev) => (targetUpgrade.powerUps[getUpgradePowerUpIndex(upgradeName)].multiplier * prev));
                    
                    break;
                case 'machinery':
                    setBuildingProduction('factory', (prev) => (targetUpgrade.powerUps[getUpgradePowerUpIndex(upgradeName)].multiplier * prev));
                    
                    break;
                case 'spell_book':
                    setBuildingProduction('wizard_tower', (prev) => (targetUpgrade.powerUps[getUpgradePowerUpIndex(upgradeName)].multiplier * prev));
                    
                    break;
                default:
                    console.log('ERROR: invalid upgrade name ' + type);
            }
            
            targetUpgrade.powerUpCount++;
            setUpgradeLevel(upgradeName, (prev) => (prev));

            //play powerUp sound
            const powerUpSound = new Audio('./assets/audio/power_up.mp3');
            powerUpSound.volume = 0.3;
            powerUpSound.play();
        } else {
            switch(upgradeName) {
                case 'cursor':
                    setCoinsPerClick((prev) => (prev + targetUpgrade.increase));
                    targetUpgrade.increase = targetUpgrade.increase + 0.2;
                    
                    break;
                case 'pickaxe':
                    setBuildingProduction('miner', (prev) => (prev + targetUpgrade.increase));
                    targetUpgrade.increase = targetUpgrade.increase + 0.05;
                    
                    break;
                case 'machinery':
                    setBuildingProduction('factory', (prev) => (prev + targetUpgrade.increase));
                    targetUpgrade.increase = targetUpgrade.increase + 0.3;
                    
                    break;
                case 'spell_book':
                    setBuildingProduction('wizard_tower', (prev) => (prev + targetUpgrade.increase));
                    targetUpgrade.increase = targetUpgrade.increase + 1;
                    
                    break;
                default:
                    console.log('ERROR: invalid upgrade name ' + type);
            }

            setUpgradeLevel(upgradeName, (prev) => (prev + 1));

            //play upgrade sound
            const upgradeSound = new Audio('./assets/audio/upgrade.mp3');
            upgradeSound.volume = 0.3;
            upgradeSound.play();
        }
        updateItemCost('upgrade', upgradeName);
        
    } else {
        createNotification(`Can't afford upgrade: ${targetUpgrade.name}`, '#ff1010');
        console.log(`Can't afford upgrade: ${targetUpgrade.name}`);
        
        //play the error sound
        playErrorAudio()
    }
}

function buyBuilding(buildingName) {
    const targetBuilding = getBuildingFromName(buildingName);

    if (coinCount >= targetBuilding.cost) {
        setCoinsAmount((prev) => (prev - targetBuilding.cost));
        setBuildingAmount(buildingName, (prev) => (prev + 1));
        updateItemCost('building', buildingName);

        //play building sound
        const buildingSound = new Audio('./assets/audio/building.mp3');
        buildingSound.volume = 0.3;
        buildingSound.play();
    } else {
        createNotification(`Can't afford building: ${targetBuilding.name}`, '#ff1010');
        console.log(`Can't afford building: ${targetBuilding.name}`);

        //play the error sound
        playErrorAudio()
    }

}

// I'll set the initial coin stats here so that it is rendered on the website
setCoinsAmount(()=> (coinCount));
setCoinsPerClick(()=> (coinsPerClick));
updateCoinsPerSecond()
Object.keys(critClick).forEach((key) => {
        
    setCriticalClick(key, () => (defaultValues.critClickStats[key]));
})

//Attach the click listener to the big coin button
bigCoinImg.addEventListener('mousedown', handleClick);

// Below is the setup for the item buttons

function setupUpgradeButton(upgradeName) {
    const upgradeButton = itemButtons.upgrades[upgradeName]

    upgradeButton.addEventListener('click', () => {buyUpgrade(upgradeName);updateCoinsPerSecond()});
    upgradeButton.addEventListener('mouseenter', () => {togglePopup(upgradeName, true)});
    upgradeButton.addEventListener('mouseleave', () => {togglePopup(upgradeName, false)});
    
    // adjust the width of the iteminfo in js as doing it with css feels like a pain
    updateItemInfoPopUpWidth(upgradeName);

}

function setupBuildingButton(buildingName) {
    const buildingButton = itemButtons.buildings[buildingName]

    buildingButton.addEventListener('click', () => {buyBuilding(buildingName);updateCoinsPerSecond()});
    buildingButton.addEventListener('mouseenter', () => {togglePopup(buildingName, true)});
    buildingButton.addEventListener('mouseleave', () => {togglePopup(buildingName, false)});
    
    // adjust the width of the iteminfo in js as doing it with css feels like a pain
    updateItemInfoPopUpWidth(buildingName);

}

function togglePopup(item, visible) {
    const targetPopUp = popUpAnchor.querySelector('#'+ item + '-pop-up');

    if (visible) {
        targetPopUp.style.display = 'block';
    } else {
        targetPopUp.style.display = 'none';
    }
}

// Track the popUpAnchor to the cursor
document.addEventListener("mousemove", (event) => {
    popUpAnchor.style.left = event.clientX + 'px';
    popUpAnchor.style.top = event.clientY + 'px';
})

// we setup the nav buttons
function changeTopPage(pageName){

    var sections = rightSection.querySelector('.upper-half').children;
    for (var i = 0; i < sections.length; i++) {
        if (sections[i].classList.contains(`${pageName}-section`)){
            sections[i].classList.remove('closed')
        } else {
            sections[i].classList.add('closed')
        }

    }

}

upgradesNavButton.addEventListener('click', () => changeTopPage('upgrades'))
skillsNavButton.addEventListener('click', () => changeTopPage('skills'));

// now we create all the item buttons

generateItemButtons('upgrade', upgradeStats);
generateItemButtons('building', buildingStats);

upgradeStats.forEach((upgrade) => {

    itemButtons.upgrades[upgrade.name] = document.getElementById(`${upgrade.name}-upgrade`);  

    setupUpgradeButton(upgrade.name);
    setUpgradeLevel(upgrade.name, () => (upgrade.level));
})

buildingStats.forEach((building) => {

    itemButtons.buildings[building.name] = document.getElementById(`${building.name}-building`); 

    setupBuildingButton(building.name);
    setBuildingAmount(building.name, () => (building.amount));
});

// we load the save if it is there

if (JSON.parse(localStorage.getItem('saveData')) !== null){
    load()
}

setInterval(() => {
    setCoinsAmount((prev) => (prev + coinsPerSec/10));

    if (bgm.paused && userInteracted) {
        try {
            bgm.play();
        }
        catch(err) {
            console.log(err.message);
        }
    }
    
}, 100);
// setInterval(setCoinsAmount, 100, (prev) => (prev + coinsPerSec/10));

//setInterval(save, 60000, true)

document.addEventListener('click', () => {
   userInteracted = true;
}, { once: true }); // Only need to do this once