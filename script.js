// --- Game State Variables ---
let gold = 0;
let goldPerClick = 1; // Base GPC

// NEW: Variables for the "Stronger Clicks" upgrade
let strongerClicksLevel = 0; // How many times this upgrade has been bought
let strongerClicksBaseCost = 10; // Initial cost of the upgrade
let strongerClicksCost = 10;     // Current cost, will increase
let strongerClicksBonusPerLevel = 1; // How much GPC this upgrade adds per level

// --- DOM Element References ---
const goldCountDisplay = document.getElementById('goldCount');
const goldPerClickDisplay = document.getElementById('goldPerClickDisplay');
const clickButton = document.getElementById('clickButton');

// NEW: DOM Elements for "Stronger Clicks" upgrade
const strongerClicksBonusDisplay = document.getElementById('strongerClicksBonusDisplay');
const strongerClicksCostDisplay = document.getElementById('strongerClicksCostDisplay');
const buyStrongerClicksButton = document.getElementById('buyStrongerClicksButton');


// --- Game Functions ---

/**
 * Updates the displayed gold count and other stats on the HTML page.
 */
function updateDisplay() {
    goldCountDisplay.textContent = Math.floor(gold);
    
    // Calculate total Gold Per Click
    // Base GPC + GPC from strongerClicks upgrade
    let totalGoldPerClick = 1 + (strongerClicksLevel * strongerClicksBonusPerLevel);
    goldPerClickDisplay.textContent = totalGoldPerClick;

    // Update "Stronger Clicks" upgrade display
    strongerClicksBonusDisplay.textContent = (strongerClicksLevel * strongerClicksBonusPerLevel);
    strongerClicksCostDisplay.textContent = Math.ceil(strongerClicksCost); // Show whole numbers for cost

    // Disable upgrade button if player can't afford it
    if (gold >= strongerClicksCost) {
        buyStrongerClicksButton.disabled = false;
    } else {
        buyStrongerClicksButton.disabled = true;
    }
}

/**
 * Handles the action when the main click button is pressed.
 */
function clickGold() {
    // Calculate total GPC before adding to gold
    let totalGoldPerClick = 1 + (strongerClicksLevel * strongerClicksBonusPerLevel);
    gold += totalGoldPerClick;
    updateDisplay();
}

// NEW: Function to buy the "Stronger Clicks" upgrade
function buyStrongerClicks() {
    if (gold >= strongerClicksCost) {
        gold -= strongerClicksCost;                     // Subtract cost from gold
        strongerClicksLevel++;                          // Increase the level of the upgrade
        
        // goldPerClick is now calculated dynamically in updateDisplay/clickGold
        // So we don't need to directly modify goldPerClick here.
        // The bonus from the upgrade level will be automatically applied.

        // Increase the cost for the next purchase (e.g., 15% more expensive)
        strongerClicksCost *= 1.15; 
        
        updateDisplay();                                // Refresh all displays
    } else {
        // Optional: alert("Not enough gold!"); 
        // The button will be disabled anyway by updateDisplay()
    }
}


// --- Event Listeners ---
clickButton.addEventListener('click', clickGold);
// NEW: Event Listener for the "Stronger Clicks" upgrade button
buyStrongerClicksButton.addEventListener('click', buyStrongerClicks);


// --- Initial Game Setup ---
// Calculate initial cost based on level (though level is 0 initially)
strongerClicksCost = strongerClicksBaseCost * Math.pow(1.15, strongerClicksLevel);
updateDisplay();

console.log("Game initialized with Stronger Clicks upgrade!");
