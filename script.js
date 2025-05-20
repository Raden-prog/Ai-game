// --- Game State Variables ---
let gold = 0;
const SAVE_KEY = 'goldClickerDeluxeSave';

// Stronger Clicks Upgrade
let strongerClicksLevel = 0;
const strongerClicksBaseCost = 10;
const strongerClicksCostIncreaseFactor = 1.15; // 15% increase
const strongerClicksBonusPerLevel = 1; // GPC bonus per level

// Auto Miner Upgrade
let autoMinerLevel = 0;
const autoMinerBaseCost = 25;
const autoMinerCostIncreaseFactor = 1.20; // 20% increase
const autoMinerGPSPerLevel = 1; // GPS bonus per level

// Ad Boost
let isBoostActive = false;
let boostEndTime = 0;
const boostDuration = 30 * 1000; // 30 seconds in milliseconds
const boostMultiplier = 2;


// --- DOM Element References ---
const goldCountDisplay = document.getElementById('goldCount');
const goldPerClickDisplay = document.getElementById('goldPerClickDisplay');
const goldPerSecondDisplay = document.getElementById('goldPerSecondDisplay');
const clickButton = document.getElementById('clickButton');

// Stronger Clicks UI
const strongerClicksLevelDisplay = document.getElementById('strongerClicksLevelDisplay');
const strongerClicksBonusDisplay = document.getElementById('strongerClicksBonusDisplay');
const strongerClicksCostDisplay = document.getElementById('strongerClicksCostDisplay');
const buyStrongerClicksButton = document.getElementById('buyStrongerClicksButton');

// Auto Miner UI
const autoMinerLevelDisplay = document.getElementById('autoMinerLevelDisplay');
const autoMinerOutputDisplay = document.getElementById('autoMinerOutputDisplay');
const autoMinerCostDisplay = document.getElementById('autoMinerCostDisplay');
const buyAutoMinerButton = document.getElementById('buyAutoMinerButton');

// Ad Boost UI
const adBoostButton = document.getElementById('adBoostButton');
const boostStatusDisplay = document.getElementById('boostStatus');

// Reset Button
const resetButton = document.getElementById('resetButton');


// --- Calculated Game Values ---
function getCurrentGoldPerClick() {
    let gpc = 1 + (strongerClicksLevel * strongerClicksBonusPerLevel); // Base 1 GPC
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

    // Ad Boost
    if (isBoostActive) {
        const timeLeft = Math.ceil((boostEndTime - Date.now()) / 1000);
        boostStatusDisplay.textContent = `Boost Active! ${boostMultiplier}x Gold for ${timeLeft}s`;
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

function activateAdBoost() {
    if (!isBoostActive) {
        // In a real game, you would trigger the ad SDK here.
        // For now, we just simulate the reward.
        console.log("Ad boost activated (simulated)!");
        isBoostActive = true;
        boostEndTime = Date.now() + boostDuration;
        updateDisplay(); // Update button state and status immediately
    }
}

function gameLoop() {
    // Add gold from auto miners
    gold += (getCurrentGoldPerSecond() / 10); // GPS is per second, loop is 100ms

    // Check if boost has expired
    if (isBoostActive && Date.now() > boostEndTime) {
        isBoostActive = false;
        console.log("Ad boost expired.");
    }

    updateDisplay();
    saveGame(); // Save progress periodically
}

// --- Saving and Loading ---
function saveGame() {
    const gameState = {
        gold: gold,
        strongerClicksLevel: strongerClicksLevel,
        autoMinerLevel: autoMinerLevel,
        // Note: Boost state is not saved, it's temporary.
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    // console.log("Game Saved!"); // Optional: for debugging
}

function loadGame() {
    const savedGame = localStorage.getItem(SAVE_KEY);
    if (savedGame) {
        const gameState = JSON.parse(savedGame);
        gold = gameState.gold || 0;
        strongerClicksLevel = gameState.strongerClicksLevel || 0;
        autoMinerLevel = gameState.autoMinerLevel || 0;
        console.log("Game Loaded!");
    } else {
        console.log("No saved game found, starting new game.");
    }
}

function resetGameData() {
    if (confirm("Are you sure you want to reset all your game data? This cannot be undone!")) {
        localStorage.removeItem(SAVE_KEY);
        // Reset variables to initial state
        gold = 0;
        strongerClicksLevel = 0;
        autoMinerLevel = 0;
        isBoostActive = false; // Ensure boost is also reset
        boostEndTime = 0;
        updateDisplay(); // Refresh the display to show the reset state
        console.log("Game data has been reset.");
    }
}


// --- Event Listeners ---
clickButton.addEventListener('click', clickGold);
buyStrongerClicksButton.addEventListener('click', buyStrongerClicks);
buyAutoMinerButton.addEventListener('click', buyAutoMiner);
adBoostButton.addEventListener('click', activateAdBoost);
resetButton.addEventListener('click', resetGameData);

// --- Initial Game Setup ---
loadGame();       // Load saved progress first
updateDisplay();  // Then update the display with loaded/initial values
setInterval(gameLoop, 100); // Run game loop every 100 milliseconds for smoother GPS and updates

console.log("Gold Clicker Deluxe Initialized!");
