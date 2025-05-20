// --- Game State Variables ---
let gold = 0;
const SAVE_KEY = 'goldClickerDeluxeSave';

// Stronger Clicks Upgrade
let strongerClicksLevel = 0;
const strongerClicksBaseCost = 10;
const strongerClicksCostIncreaseFactor = 1.15;
const strongerClicksBonusPerLevel = 1;

// Auto Miner Upgrade
let autoMinerLevel = 0;
const autoMinerBaseCost = 25;
const autoMinerCostIncreaseFactor = 1.20;
const autoMinerGPSPerLevel = 1; // This is now base GPS per miner level

// Click Amplifier Upgrade
let clickAmplifierLevel = 0;
const clickAmplifierBaseCost = 100;
const clickAmplifierCostIncreaseFactor = 1.25;
const clickAmplifierBonusPerLevel = 0.1;

// Auto Miner Efficiency Upgrade
let autoMinerEfficiencyLevel = 0;
const autoMinerEfficiencyBaseCost = 150;
const autoMinerEfficiencyCostIncreaseFactor = 1.30;
const autoMinerEfficiencyBonusPerLevel = 0.1; // Each level adds 0.1 (10%) to GPS multiplier

// Ad Boost
let isBoostActive = false;
let boostEndTime = 0;
const boostDuration = 30 * 1000;
const boostMultiplier = 2;


// --- DOM Element References ---
const goldCountDisplay = document.getElementById('goldCount');
const goldPerClickDisplay = document.getElementById('goldPerClickDisplay');
const goldPerSecondDisplay = document.getElementById('goldPerSecondDisplay');
const clickButton = document.getElementById('clickButton');

const strongerClicksLevelDisplay = document.getElementById('strongerClicksLevelDisplay');
const strongerClicksBonusDisplay = document.getElementById('strongerClicksBonusDisplay');
const strongerClicksCostDisplay = document.getElementById('strongerClicksCostDisplay');
const buyStrongerClicksButton = document.getElementById('buyStrongerClicksButton');

const autoMinerLevelDisplay = document.getElementById('autoMinerLevelDisplay');
const autoMinerOutputDisplay = document.getElementById('autoMinerOutputDisplay'); // Shows base output
const autoMinerCostDisplay = document.getElementById('autoMinerCostDisplay');
const buyAutoMinerButton = document.getElementById('buyAutoMinerButton');

const clickAmplifierLevelDisplay = document.getElementById('clickAmplifierLevelDisplay');
const clickAmplifierBonusDisplay = document.getElementById('clickAmplifierBonusDisplay');
const clickAmplifierCostDisplay = document.getElementById('clickAmplifierCostDisplay');
const buyClickAmplifierButton = document.getElementById('buyClickAmplifierButton');

const autoMinerEfficiencyLevelDisplay = document.getElementById('autoMinerEfficiencyLevelDisplay');
const autoMinerEfficiencyBonusDisplay = document.getElementById('autoMinerEfficiencyBonusDisplay');
const autoMinerEfficiencyCostDisplay = document.getElementById('autoMinerEfficiencyCostDisplay');
const buyAutoMinerEfficiencyButton = document.getElementById('buyAutoMinerEfficiencyButton');

const adBoostButton = document.getElementById('adBoostButton');
const boostStatusDisplay = document.getElementById('boostStatus');
const resetButton = document.getElementById('resetButton');

// --- Calculated Game Values ---
function getCurrentGoldPerClick() {
    let baseGPC = 1 + (strongerClicksLevel * strongerClicksBonusPerLevel);
    let gpcMultiplier = 1 + (clickAmplifierLevel * clickAmplifierBonusPerLevel);
    let gpc = baseGPC * gpcMultiplier;
    if (isBoostActive) {
        gpc *= boostMultiplier;
    }
    return gpc;
}

function getCurrentGoldPerSecond() {
    let baseGPS = autoMinerLevel * autoMinerGPSPerLevel; // GPS from number of miners
    let gpsMultiplier = 1 + (autoMinerEfficiencyLevel * autoMinerEfficiencyBonusPerLevel); // Multiplier from efficiency
    let gps = baseGPS * gpsMultiplier;
    if (isBoostActive) {
        gps *= boostMultiplier;
    }
    return gps;
}

function getStrongerClicksCost() {
    return Math.ceil(strongerClicksBaseCost * Math.pow(strongerClicksCostIncreaseFactor, strongerClicksLevel));
}

function getAutoMinerCost() {
    return Math.ceil(autoMinerBaseCost * Math.pow(autoMinerCostIncreaseFactor, autoMinerLevel));
}

function getClickAmplifierCost() {
    return Math.ceil(clickAmplifierBaseCost * Math.pow(clickAmplifierCostIncreaseFactor, clickAmplifierLevel));
}

function getAutoMinerEfficiencyCost() {
    return Math.ceil(autoMinerEfficiencyBaseCost * Math.pow(autoMinerEfficiencyCostIncreaseFactor, autoMinerEfficiencyLevel));
}

// --- Game Functions ---
function updateDisplay() {
    if (!goldCountDisplay || !goldPerClickDisplay || !goldPerSecondDisplay ||
        !strongerClicksLevelDisplay || !strongerClicksBonusDisplay || !strongerClicksCostDisplay || !buyStrongerClicksButton ||
        !autoMinerLevelDisplay || !autoMinerOutputDisplay || !autoMinerCostDisplay || !buyAutoMinerButton ||
        !clickAmplifierLevelDisplay || !clickAmplifierBonusDisplay || !clickAmplifierCostDisplay || !buyClickAmplifierButton ||
        !autoMinerEfficiencyLevelDisplay || !autoMinerEfficiencyBonusDisplay || !autoMinerEfficiencyCostDisplay || !buyAutoMinerEfficiencyButton ||
        !adBoostButton || !boostStatusDisplay || !resetButton) {
        console.error("One or more DOM elements are missing! Check IDs in HTML and JS.");
        return;
    }

    goldCountDisplay.textContent = Math.floor(gold);
    goldPerClickDisplay.textContent = getCurrentGoldPerClick().toFixed(1);
    goldPerSecondDisplay.textContent = getCurrentGoldPerSecond().toFixed(1);

    // Stronger Clicks Upgrade
    strongerClicksLevelDisplay.textContent = strongerClicksLevel;
    strongerClicksBonusDisplay.textContent = (strongerClicksLevel * strongerClicksBonusPerLevel);
    const currentStrongerClicksCost = getStrongerClicksCost();
    strongerClicksCostDisplay.textContent = currentStrongerClicksCost;
    buyStrongerClicksButton.disabled = gold < currentStrongerClicksCost;

    // Auto Miner Upgrade
    autoMinerLevelDisplay.textContent = autoMinerLevel;
    autoMinerOutputDisplay.textContent = (autoMinerLevel * autoMinerGPSPerLevel); // Show base GPS from miners
    const currentAutoMinerCost = getAutoMinerCost();
    autoMinerCostDisplay.textContent = currentAutoMinerCost;
    buyAutoMinerButton.disabled = gold < currentAutoMinerCost;

    // Click Amplifier Upgrade Display
    clickAmplifierLevelDisplay.textContent = clickAmplifierLevel;
    let currentClickMultiplier = 1 + (clickAmplifierLevel * clickAmplifierBonusPerLevel);
    clickAmplifierBonusDisplay.textContent = currentClickMultiplier.toFixed(1);
    const currentClickAmplifierCost = getClickAmplifierCost();
    clickAmplifierCostDisplay.textContent = currentClickAmplifierCost;
    buyClickAmplifierButton.disabled = gold < currentClickAmplifierCost;

    // Auto Miner Efficiency Upgrade Display
    autoMinerEfficiencyLevelDisplay.textContent = autoMinerEfficiencyLevel;
    let currentGPSMultiplier = 1 + (autoMinerEfficiencyLevel * autoMinerEfficiencyBonusPerLevel);
    autoMinerEfficiencyBonusDisplay.textContent = currentGPSMultiplier.toFixed(1);
    const currentAutoMinerEfficiencyCost = getAutoMinerEfficiencyCost();
    autoMinerEfficiencyCostDisplay.textContent = currentAutoMinerEfficiencyCost;
    buyAutoMinerEfficiencyButton.disabled = gold < currentAutoMinerEfficiencyCost;

    // Ad Boost
    if (isBoostActive) {
        const timeLeft = Math.ceil((boostEndTime - Date.now()) / 1000);
        boostStatusDisplay.textContent = `Boost Active! ${boostMultiplier}x Gold for ${Math.max(0, timeLeft)}s`;
        adBoostButton.disabled = true;
    } else {
        boostStatusDisplay.textContent = 'Boost Inactive';
        adBoostButton.disabled = false;
    }
}

function clickGold() {
    gold += getCurrentGoldPerClick();
    updateDisplay();
}

function buyStrongerClicks() {
    const cost = getStrongerClicksCost();
    if (gold >= cost) {
        gold -= cost;
        strongerClicksLevel++;
        updateDisplay();
    }
}

function buyAutoMiner() {
    const cost = getAutoMinerCost();
    if (gold >= cost) {
        gold -= cost;
        autoMinerLevel++;
        updateDisplay();
    }
}

function buyClickAmplifier() {
    const cost = getClickAmplifierCost();
    if (gold >= cost) {
        gold -= cost;
        clickAmplifierLevel++;
        updateDisplay();
    }
}

function buyAutoMinerEfficiency() {
    const cost = getAutoMinerEfficiencyCost();
    if (gold >= cost) {
        gold -= cost;
        autoMinerEfficiencyLevel++;
        updateDisplay();
    }
}

function activateAdBoost() {
    if (!isBoostActive) {
        isBoostActive = true;
        boostEndTime = Date.now() + boostDuration;
        updateDisplay();
    }
}

function gameLoop() {
    let goldEarnedThisTick = getCurrentGoldPerSecond() / 10;
    if (goldEarnedThisTick > 0) {
         gold += goldEarnedThisTick;
    }

    if (isBoostActive && Date.now() > boostEndTime) {
        isBoostActive = false;
        updateDisplay();
    }

    updateDisplay();
    saveGame();
}

// --- Saving and Loading ---
function saveGame() {
    try {
        const gameState = {
            gold: gold,
            strongerClicksLevel: strongerClicksLevel,
            autoMinerLevel: autoMinerLevel,
            clickAmplifierLevel: clickAmplifierLevel,
            autoMinerEfficiencyLevel: autoMinerEfficiencyLevel,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (e) {
        console.error("Error saving game:", e);
    }
}

function loadGame() {
    try {
        const savedGame = localStorage.getItem(SAVE_KEY);
        if (savedGame) {
            const gameState = JSON.parse(savedGame);
            gold = parseFloat(gameState.gold) || 0;
            strongerClicksLevel = parseInt(gameState.strongerClicksLevel) || 0;
            autoMinerLevel = parseInt(gameState.autoMinerLevel) || 0;
            clickAmplifierLevel = parseInt(gameState.clickAmplifierLevel) || 0;
            autoMinerEfficiencyLevel = parseInt(gameState.autoMinerEfficiencyLevel) || 0;
        } else {
            // Initialize if no save data for new fields, ensure others default to 0 if not present
            gold = gold || 0;
            strongerClicksLevel = strongerClicksLevel || 0;
            autoMinerLevel = autoMinerLevel || 0;
            clickAmplifierLevel = clickAmplifierLevel || 0;
            autoMinerEfficiencyLevel = autoMinerEfficiencyLevel || 0;
        }
    } catch (e) {
        console.error("Error loading game:", e);
        gold = 0;
        strongerClicksLevel = 0;
        autoMinerLevel = 0;
        clickAmplifierLevel = 0;
        autoMinerEfficiencyLevel = 0;
    }
}

function resetGameData() {
    if (confirm("Are you sure you want to reset all your game data? This cannot be undone!")) {
        try {
            localStorage.removeItem(SAVE_KEY);
            gold = 0;
            strongerClicksLevel = 0;
            autoMinerLevel = 0;
            clickAmplifierLevel = 0;
            autoMinerEfficiencyLevel = 0;
            isBoostActive = false;
            boostEndTime = 0;
            updateDisplay();
        } catch (e) {
            console.error("Error resetting game data:", e);
        }
    }
}


// --- Event Listeners ---
if (clickButton) clickButton.addEventListener('click', clickGold);
if (buyStrongerClicksButton) buyStrongerClicksButton.addEventListener('click', buyStrongerClicks);
if (buyAutoMinerButton) buyAutoMinerButton.addEventListener('click', buyAutoMiner);
if (buyClickAmplifierButton) buyClickAmplifierButton.addEventListener('click', buyClickAmplifier);
if (buyAutoMinerEfficiencyButton) buyAutoMinerEfficiencyButton.addEventListener('click', buyAutoMinerEfficiency);
if (adBoostButton) adBoostButton.addEventListener('click', activateAdBoost);
if (resetButton) resetButton.addEventListener('click', resetGameData);


// --- Initial Game Setup ---
console.log("Initializing game with Auto Miner Efficiency..."); // You can see this in browser console
loadGame();
updateDisplay();
setInterval(gameLoop, 100);

console.log("Gold Clicker Deluxe Initialized with Auto Miner Efficiency."); // You can see this in browser console
