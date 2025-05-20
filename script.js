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
const autoMinerGPSPerLevel = 1;

// Ad Boost
let isBoostActive = false;
let boostEndTime = 0;
const boostDuration = 30 * 1000; // 30 seconds
const boostMultiplier = 2;


// --- DOM Element References ---
// It's good practice to ensure these are not null after assignment
const goldCountDisplay = document.getElementById('goldCount');
const goldPerClickDisplay = document.getElementById('goldPerClickDisplay');
const goldPerSecondDisplay = document.getElementById('goldPerSecondDisplay');
const clickButton = document.getElementById('clickButton');

const strongerClicksLevelDisplay = document.getElementById('strongerClicksLevelDisplay');
const strongerClicksBonusDisplay = document.getElementById('strongerClicksBonusDisplay');
const strongerClicksCostDisplay = document.getElementById('strongerClicksCostDisplay');
const buyStrongerClicksButton = document.getElementById('buyStrongerClicksButton');

const autoMinerLevelDisplay = document.getElementById('autoMinerLevelDisplay');
const autoMinerOutputDisplay = document.getElementById('autoMinerOutputDisplay');
const autoMinerCostDisplay = document.getElementById('autoMinerCostDisplay');
const buyAutoMinerButton = document.getElementById('buyAutoMinerButton');

const adBoostButton = document.getElementById('adBoostButton');
const boostStatusDisplay = document.getElementById('boostStatus');

const resetButton = document.getElementById('resetButton');

// --- Calculated Game Values ---
function getCurrentGoldPerClick() {
    let gpc = 1 + (strongerClicksLevel * strongerClicksBonusPerLevel);
    if (isBoostActive) {
        gpc *= boostMultiplier;
    }
    return gpc;
}

function getCurrentGoldPerSecond() {
    let gps = autoMinerLevel * autoMinerGPSPerLevel;
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

// --- Game Functions ---
function updateDisplay() {
    // console.log("updateDisplay called. Gold:", gold, "isBoostActive:", isBoostActive); // General check

    if (!goldCountDisplay || !goldPerClickDisplay || !goldPerSecondDisplay ||
        !strongerClicksLevelDisplay || !strongerClicksBonusDisplay || !strongerClicksCostDisplay || !buyStrongerClicksButton ||
        !autoMinerLevelDisplay || !autoMinerOutputDisplay || !autoMinerCostDisplay || !buyAutoMinerButton ||
        !adBoostButton || !boostStatusDisplay) {
        console.error("One or more DOM elements are missing! Check IDs in HTML and JS.");
        return; // Stop if critical elements are missing
    }

    goldCountDisplay.textContent = Math.floor(gold);
    goldPerClickDisplay.textContent = getCurrentGoldPerClick();
    goldPerSecondDisplay.textContent = getCurrentGoldPerSecond();

    // Stronger Clicks Upgrade
    strongerClicksLevelDisplay.textContent = strongerClicksLevel;
    strongerClicksBonusDisplay.textContent = (strongerClicksLevel * strongerClicksBonusPerLevel);
    const currentStrongerClicksCost = getStrongerClicksCost();
    strongerClicksCostDisplay.textContent = currentStrongerClicksCost;
    buyStrongerClicksButton.disabled = gold < currentStrongerClicksCost;

    // Auto Miner Upgrade
    autoMinerLevelDisplay.textContent = autoMinerLevel;
    autoMinerOutputDisplay.textContent = (autoMinerLevel * autoMinerGPSPerLevel);
    const currentAutoMinerCost = getAutoMinerCost();
    autoMinerCostDisplay.textContent = currentAutoMinerCost;
    buyAutoMinerButton.disabled = gold < currentAutoMinerCost;
    // console.log(`AutoMiner - Gold: ${gold}, Cost: ${currentAutoMinerCost}, Button Disabled: ${buyAutoMinerButton.disabled}`);


    // Ad Boost
    if (isBoostActive) {
        const timeLeft = Math.ceil((boostEndTime - Date.now()) / 1000);
        boostStatusDisplay.textContent = `Boost Active! ${boostMultiplier}x Gold for ${Math.max(0, timeLeft)}s`;
        adBoostButton.disabled = true;
    } else {
        boostStatusDisplay.textContent = 'Boost Inactive';
        adBoostButton.disabled = false;
    }
    // console.log("updateDisplay finished.");
}

function clickGold() {
    gold += getCurrentGoldPerClick();
    updateDisplay();
}

function buyStrongerClicks() {
    const cost = getStrongerClicksCost();
    // console.log(`buyStrongerClicks attempt. Gold: ${gold}, Cost: ${cost}`);
    if (gold >= cost) {
        gold -= cost;
        strongerClicksLevel++;
        // console.log(`Stronger Clicks bought. New Level: ${strongerClicksLevel}, Gold Left: ${gold}`);
        updateDisplay();
    }
}

function buyAutoMiner() {
    const cost = getAutoMinerCost();
    console.log(`buyAutoMiner attempt. Gold: ${gold}, Cost: ${cost}, autoMinerLevel before: ${autoMinerLevel}`);
    if (gold >= cost) {
        gold -= cost;
        autoMinerLevel++;
        console.log(`Auto Miner bought. New Level: ${autoMinerLevel}, Gold Left: ${gold}`);
        updateDisplay();
    } else {
         console.log(`Not enough gold for Auto Miner. Gold: ${gold}, Cost: ${cost}`);
    }
}

function activateAdBoost() {
    console.log("activateAdBoost called. Current isBoostActive:", isBoostActive);
    if (!isBoostActive) {
        isBoostActive = true;
        boostEndTime = Date.now() + boostDuration;
        console.log("Ad boost activated. New isBoostActive:", isBoostActive, "End time:", new Date(boostEndTime).toLocaleString());
        updateDisplay(); // Update display immediately
    } else {
        console.log("activateAdBoost called, but boost already active or button should be disabled.");
    }
}

function gameLoop() {
    let goldEarnedThisTick = getCurrentGoldPerSecond() / 10; // GPS is per second, loop is 100ms (10 times per sec)
    if (goldEarnedThisTick > 0) {
         gold += goldEarnedThisTick;
    }

    if (isBoostActive && Date.now() > boostEndTime) {
        console.log("Boost expired in gameLoop. End time was:", new Date(boostEndTime).toLocaleString(), "Current time:", new Date(Date.now()).toLocaleString());
        isBoostActive = false;
        updateDisplay(); // FIX: Ensure display updates immediately when boost expires
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
            // Boost state (isBoostActive, boostEndTime) is intentionally not saved as it's temporary.
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
        // console.log("Game Saved!", gameState);
    } catch (e) {
        console.error("Error saving game:", e);
    }
}

function loadGame() {
    try {
        const savedGame = localStorage.getItem(SAVE_KEY);
        if (savedGame) {
            const gameState = JSON.parse(savedGame);
            gold = parseFloat(gameState.gold) || 0; // Ensure gold is a number
            strongerClicksLevel = parseInt(gameState.strongerClicksLevel) || 0;
            autoMinerLevel = parseInt(gameState.autoMinerLevel) || 0;
            console.log("Game Loaded:", gameState);
        } else {
            console.log("No saved game found, starting new game.");
        }
    } catch (e) {
        console.error("Error loading game:", e);
        // Fallback to default values if loading fails
        gold = 0;
        strongerClicksLevel = 0;
        autoMinerLevel = 0;
    }
}

function resetGameData() {
    if (confirm("Are you sure you want to reset all your game data? This cannot be undone!")) {
        console.log("Resetting game data...");
        try {
            localStorage.removeItem(SAVE_KEY);
            gold = 0;
            strongerClicksLevel = 0;
            autoMinerLevel = 0;
            isBoostActive = false;
            boostEndTime = 0;
            console.log(`Data reset internally. Gold: ${gold}, SC Lvl: ${strongerClicksLevel}, AM Lvl: ${autoMinerLevel}, Boost: ${isBoostActive}`);
            updateDisplay();
            // The gameLoop will call saveGame() shortly, saving the reset state.
            console.log("Game data reset and display updated. The next save will persist this reset state.");
        } catch (e) {
            console.error("Error resetting game data:", e);
        }
    }
}


// --- Event Listeners ---
// Ensure buttons exist before adding listeners
if (clickButton) clickButton.addEventListener('click', clickGold);
if (buyStrongerClicksButton) buyStrongerClicksButton.addEventListener('click', buyStrongerClicks);
if (buyAutoMinerButton) buyAutoMinerButton.addEventListener('click', buyAutoMiner);
if (adBoostButton) adBoostButton.addEventListener('click', activateAdBoost);
if (resetButton) resetButton.addEventListener('click', resetGameData);


// --- Initial Game Setup ---
console.log("Initializing game...");
loadGame();
updateDisplay();
setInterval(gameLoop, 100); // Run game loop every 100 milliseconds

console.log("Gold Clicker Deluxe Initialized with debugging.");
