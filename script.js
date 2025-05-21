// --- Game State Variables ---
let scp = 0; // Social Credit Points, formerly gold
const SAVE_KEY = 'socialCreditSimSave'; // Updated save key

// "Positive Impact Training" Upgrade (formerly Stronger Clicks)
let positiveImpactLevel = 0;
const positiveImpactBaseCost = 10;
const positiveImpactCostIncreaseFactor = 1.15;
const positiveImpactBonusPerLevel = 1; // Base SCP per action bonus

// "Community Contribution Program" Upgrade (formerly Auto Miner)
let communityProgramLevel = 0;
const communityProgramBaseCost = 25;
const communityProgramCostIncreaseFactor = 1.20;
const communityProgramSCPPerLevel = 1; // Base SCP per second per level

// "Effective Propaganda Network" Upgrade (formerly Click Amplifier)
let propagandaNetworkLevel = 0;
const propagandaNetworkBaseCost = 100;
const propagandaNetworkCostIncreaseFactor = 1.25;
const propagandaNetworkBonusPerLevel = 0.1; // SCP per action multiplier bonus

// "System Optimization Initiative" Upgrade (formerly Auto Miner Efficiency)
let systemOptimizationLevel = 0;
const systemOptimizationBaseCost = 150;
const systemOptimizationCostIncreaseFactor = 1.30;
const systemOptimizationBonusPerLevel = 0.1; // SCP per second multiplier bonus

// Ad Boost
let isBoostActive = false;
let boostEndTime = 0;
const boostDuration = 30 * 1000;
const boostMultiplier = 2;

// Prestige System
let influencePoints = 0;
const prestigeBonusPerInfluence = 0.01; // Each influence point gives +1% bonus to SCP gain
const baseScpNeededToPrestige = 1000000; // Initial SCP needed to prestige for the first time


// --- DOM Element References ---
const scpCountDisplay = document.getElementById('scpCount');
const scpPerClickDisplay = document.getElementById('scpPerClickDisplay');
const scpPerSecondDisplay = document.getElementById('scpPerSecondDisplay');
const actionButton = document.getElementById('actionButton'); // Was clickButton
const clickFeedbackContainer = document.getElementById('clickFeedbackContainer');

// Positive Impact Training UI
const positiveImpactLevelDisplay = document.getElementById('positiveImpactLevelDisplay');
const positiveImpactBonusDisplay = document.getElementById('positiveImpactBonusDisplay');
const positiveImpactCostDisplay = document.getElementById('positiveImpactCostDisplay');
const buyPositiveImpactButton = document.getElementById('buyPositiveImpactButton');

// Community Contribution Program UI
const communityProgramLevelDisplay = document.getElementById('communityProgramLevelDisplay');
const communityProgramOutputDisplay = document.getElementById('communityProgramOutputDisplay');
const communityProgramCostDisplay = document.getElementById('communityProgramCostDisplay');
const buyCommunityProgramButton = document.getElementById('buyCommunityProgramButton');

// Effective Propaganda Network UI
const propagandaNetworkLevelDisplay = document.getElementById('propagandaNetworkLevelDisplay');
const propagandaNetworkBonusDisplay = document.getElementById('propagandaNetworkBonusDisplay');
const propagandaNetworkCostDisplay = document.getElementById('propagandaNetworkCostDisplay');
const buyPropagandaNetworkButton = document.getElementById('buyPropagandaNetworkButton');

// System Optimization Initiative UI
const systemOptimizationLevelDisplay = document.getElementById('systemOptimizationLevelDisplay');
const systemOptimizationBonusDisplay = document.getElementById('systemOptimizationBonusDisplay');
const systemOptimizationCostDisplay = document.getElementById('systemOptimizationCostDisplay');
const buySystemOptimizationButton = document.getElementById('buySystemOptimizationButton');

// Ad Boost UI
const adBoostButton = document.getElementById('adBoostButton');
const boostStatusDisplay = document.getElementById('boostStatus');

// Prestige UI
const influencePointsDisplay = document.getElementById('influencePointsDisplay');
const prestigeBonusDisplay = document.getElementById('prestigeBonusDisplay');
const scpForPrestigeDisplay = document.getElementById('scpForPrestigeDisplay');
const prestigeButton = document.getElementById('prestigeButton');

// Reset Button
const resetButton = document.getElementById('resetButton');

// --- Calculated Game Values ---
function getScpNeededToPrestige() {
    // For now, a fixed value, can be made dynamic later (e.g., increases with each prestige)
    return baseScpNeededToPrestige;
}

function calculateTotalPrestigeBonusMultiplier() {
    return 1 + (influencePoints * prestigeBonusPerInfluence);
}

function getCurrentScpPerAction() { // Was getCurrentGoldPerClick
    let baseSCPperAction = 1 + (positiveImpactLevel * positiveImpactBonusPerLevel);
    let actionMultiplier = 1 + (propagandaNetworkLevel * propagandaNetworkBonusPerLevel);
    let scpVal = baseSCPperAction * actionMultiplier;
    
    scpVal *= calculateTotalPrestigeBonusMultiplier(); // Apply prestige bonus

    if (isBoostActive) {
        scpVal *= boostMultiplier;
    }
    return scpVal;
}

function getCurrentScpPerSecond() { // Was getCurrentGoldPerSecond
    let baseSCPperSecond = communityProgramLevel * communityProgramSCPPerLevel;
    let passiveMultiplier = 1 + (systemOptimizationLevel * systemOptimizationBonusPerLevel);
    let scpVal = baseSCPperSecond * passiveMultiplier;

    scpVal *= calculateTotalPrestigeBonusMultiplier(); // Apply prestige bonus

    if (isBoostActive) {
        scpVal *= boostMultiplier;
    }
    return scpVal;
}

// Cost functions for re-themed upgrades
function getPositiveImpactCost() {
    return Math.ceil(positiveImpactBaseCost * Math.pow(positiveImpactCostIncreaseFactor, positiveImpactLevel));
}
function getCommunityProgramCost() {
    return Math.ceil(communityProgramBaseCost * Math.pow(communityProgramCostIncreaseFactor, communityProgramLevel));
}
function getPropagandaNetworkCost() {
    return Math.ceil(propagandaNetworkBaseCost * Math.pow(propagandaNetworkCostIncreaseFactor, propagandaNetworkLevel));
}
function getSystemOptimizationCost() {
    return Math.ceil(systemOptimizationBaseCost * Math.pow(systemOptimizationCostIncreaseFactor, systemOptimizationLevel));
}


// --- Game Functions ---
function showScpFeedback(amount) { // Was showClickFeedback
    if (!clickFeedbackContainer) return;
    const feedbackText = document.createElement('div');
    feedbackText.classList.add('click-feedback-text');
    const formattedAmount = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(1);
    feedbackText.textContent = `+${formattedAmount} SCP!`;
    clickFeedbackContainer.appendChild(feedbackText);
    feedbackText.addEventListener('animationend', () => feedbackText.remove());
}

function updateDisplay() {
    // Basic DOM element check (ensure critical ones are present)
     if (!scpCountDisplay || !scpPerClickDisplay || !scpPerSecondDisplay || !actionButton || 
        !buyPositiveImpactButton || !buyCommunityProgramButton || !buyPropagandaNetworkButton || !buySystemOptimizationButton ||
        !adBoostButton || !prestigeButton || !resetButton || !influencePointsDisplay || !prestigeBonusDisplay || !scpForPrestigeDisplay) { // Added prestige UI elements
        console.error("Core DOM elements missing! Check IDs in HTML and JS.");
        return;
    }

    scpCountDisplay.textContent = Math.floor(scp).toLocaleString(); // Format SCP with commas
    scpPerClickDisplay.textContent = getCurrentScpPerAction().toFixed(1);
    scpPerSecondDisplay.textContent = getCurrentScpPerSecond().toFixed(1);

    // "Positive Impact Training" Upgrade
    positiveImpactLevelDisplay.textContent = positiveImpactLevel;
    positiveImpactBonusDisplay.textContent = (positiveImpactLevel * positiveImpactBonusPerLevel);
    const currentPositiveImpactCost = getPositiveImpactCost();
    positiveImpactCostDisplay.textContent = currentPositiveImpactCost.toLocaleString();
    buyPositiveImpactButton.disabled = scp < currentPositiveImpactCost;

    // "Community Contribution Program" Upgrade
    communityProgramLevelDisplay.textContent = communityProgramLevel;
    communityProgramOutputDisplay.textContent = (communityProgramLevel * communityProgramSCPPerLevel);
    const currentCommunityProgramCost = getCommunityProgramCost();
    communityProgramCostDisplay.textContent = currentCommunityProgramCost.toLocaleString();
    buyCommunityProgramButton.disabled = scp < currentCommunityProgramCost;

    // "Effective Propaganda Network" Upgrade
    propagandaNetworkLevelDisplay.textContent = propagandaNetworkLevel;
    propagandaNetworkBonusDisplay.textContent = (1 + propagandaNetworkLevel * propagandaNetworkBonusPerLevel).toFixed(1);
    const currentPropagandaNetworkCost = getPropagandaNetworkCost();
    propagandaNetworkCostDisplay.textContent = currentPropagandaNetworkCost.toLocaleString();
    buyPropagandaNetworkButton.disabled = scp < currentPropagandaNetworkCost;

    // "System Optimization Initiative" Upgrade
    systemOptimizationLevelDisplay.textContent = systemOptimizationLevel;
    systemOptimizationBonusDisplay.textContent = (1 + systemOptimizationLevel * systemOptimizationBonusPerLevel).toFixed(1);
    const currentSystemOptimizationCost = getSystemOptimizationCost();
    systemOptimizationCostDisplay.textContent = currentSystemOptimizationCost.toLocaleString();
    buySystemOptimizationButton.disabled = scp < currentSystemOptimizationCost;

    // Ad Boost
    if (isBoostActive) {
        const timeLeft = Math.ceil((boostEndTime - Date.now()) / 1000);
        boostStatusDisplay.textContent = `Social Boost Active! ${boostMultiplier}x SCP for ${Math.max(0, timeLeft)}s`;
        adBoostButton.disabled = true;
    } else {
        boostStatusDisplay.textContent = 'Social Boost Inactive';
        adBoostButton.disabled = false;
    }

    // Prestige System
    influencePointsDisplay.textContent = influencePoints.toLocaleString();
    prestigeBonusDisplay.textContent = (influencePoints * prestigeBonusPerInfluence * 100).toFixed(0); // Display as percentage
    const scpRequired = getScpNeededToPrestige();
    scpForPrestigeDisplay.textContent = scpRequired.toLocaleString(); 
    prestigeButton.disabled = scp < scpRequired;
}

function performAction() { // Was clickGold
    let scpEarned = getCurrentScpPerAction();
    scp += scpEarned;
    showScpFeedback(scpEarned);
    updateDisplay();
}

// Buy functions for re-themed upgrades
function buyPositiveImpact() {
    const cost = getPositiveImpactCost();
    if (scp >= cost) { scp -= cost; positiveImpactLevel++; updateDisplay(); }
}
function buyCommunityProgram() {
    const cost = getCommunityProgramCost();
    if (scp >= cost) { scp -= cost; communityProgramLevel++; updateDisplay(); }
}
function buyPropagandaNetwork() {
    const cost = getPropagandaNetworkCost();
    if (scp >= cost) { scp -= cost; propagandaNetworkLevel++; updateDisplay(); }
}
function buySystemOptimization() {
    const cost = getSystemOptimizationCost();
    if (scp >= cost) { scp -= cost; systemOptimizationLevel++; updateDisplay(); }
}

function activateAdBoost() {
    if (!isBoostActive) {
        isBoostActive = true;
        boostEndTime = Date.now() + boostDuration;
        updateDisplay();
    }
}

function performPrestige() {
    const scpRequired = getScpNeededToPrestige();
    if (scp >= scpRequired) {
        if (confirm(`Are you sure you want to Prestige? \nYour current SCP and Enhancement levels will reset. \nYou will gain Influence based on your current SCP.`)) {
            // Calculate influence earned (example formula, can be adjusted)
            let influenceGained = Math.floor(Math.sqrt(scp / 100000)); // Adjusted divisor for potentially larger SCP values
            if (influenceGained < 1 && scp >= scpRequired) influenceGained = 1; // Guarantee at least 1 if condition met, even if formula yields 0

            influencePoints += influenceGained;

            // Reset game state (except influence)
            scp = 0;
            positiveImpactLevel = 0;
            communityProgramLevel = 0;
            propagandaNetworkLevel = 0;
            systemOptimizationLevel = 0;
            isBoostActive = false;
            boostEndTime = 0;
            
            console.log(`Prestiged! Gained ${influenceGained} Influence. Total Influence: ${influencePoints}`);
            saveGame(); // Save the new state with more influence and reset progress
            updateDisplay();
        }
    } else {
        alert("Not enough SCP to Prestige yet! You need " + getScpNeededToPrestige().toLocaleString() + " SCP.");
    }
}

function gameLoop() {
    let scpEarnedThisTick = getCurrentScpPerSecond() / 10;
    if (scpEarnedThisTick > 0) {
         scp += scpEarnedThisTick;
    }

    if (isBoostActive && Date.now() > boostEndTime) {
        isBoostActive = false;
        updateDisplay(); // Update display immediately when boost expires
    }

    updateDisplay(); // Regular display update for timers and button states
    saveGame(); // Save progress periodically
}

// --- Saving and Loading ---
function saveGame() {
    try {
        const gameState = {
            scp: scp,
            positiveImpactLevel: positiveImpactLevel,
            communityProgramLevel: communityProgramLevel,
            propagandaNetworkLevel: propagandaNetworkLevel,
            systemOptimizationLevel: systemOptimizationLevel,
            influencePoints: influencePoints, // Save Influence
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (e) { console.error("Error saving game:", e); }
}

function loadGame() {
    try {
        const savedGame = localStorage.getItem(SAVE_KEY);
        if (savedGame) {
            const gameState = JSON.parse(savedGame);
            scp = parseFloat(gameState.scp) || 0;
            positiveImpactLevel = parseInt(gameState.positiveImpactLevel) || 0;
            communityProgramLevel = parseInt(gameState.communityProgramLevel) || 0;
            propagandaNetworkLevel = parseInt(gameState.propagandaNetworkLevel) || 0;
            systemOptimizationLevel = parseInt(gameState.systemOptimizationLevel) || 0;
            influencePoints = parseInt(gameState.influencePoints) || 0; // Load Influence
        } else { // Initialize all if no save
            scp = 0;
            positiveImpactLevel = 0;
            communityProgramLevel = 0;
            propagandaNetworkLevel = 0;
            systemOptimizationLevel = 0;
            influencePoints = 0;
        }
    } catch (e) {
        console.error("Error loading game:", e);
        // Fallback to default values
        scp = 0; positiveImpactLevel = 0; communityProgramLevel = 0; propagandaNetworkLevel = 0; systemOptimizationLevel = 0; influencePoints = 0;
    }
}

function resetGameData() { // This is a HARD reset, including prestige
    if (confirm("Are you sure you want to HARD RESET all game data? This includes Influence and cannot be undone!")) {
        try {
            localStorage.removeItem(SAVE_KEY);
            scp = 0;
            positiveImpactLevel = 0;
            communityProgramLevel = 0;
            propagandaNetworkLevel = 0;
            systemOptimizationLevel = 0;
            influencePoints = 0; // Reset Influence too
            isBoostActive = false;
            boostEndTime = 0;
            updateDisplay();
            console.log("Game data has been HARD RESET.");
        } catch (e) { console.error("Error resetting game data:", e); }
    }
}


// --- Event Listeners ---
if (actionButton) actionButton.addEventListener('click', performAction);
if (buyPositiveImpactButton) buyPositiveImpactButton.addEventListener('click', buyPositiveImpact);
if (buyCommunityProgramButton) buyCommunityProgramButton.addEventListener('click', buyCommunityProgram);
if (buyPropagandaNetworkButton) buyPropagandaNetworkButton.addEventListener('click', buyPropagandaNetwork);
if (buySystemOptimizationButton) buySystemOptimizationButton.addEventListener('click', buySystemOptimization);
if (adBoostButton) adBoostButton.addEventListener('click', activateAdBoost);
if (prestigeButton) prestigeButton.addEventListener('click', performPrestige);
if (resetButton) resetButton.addEventListener('click', resetGameData);


// --- Initial Game Setup ---
console.log("Initializing Social Credit Simulator...");
loadGame();
updateDisplay();
setInterval(gameLoop, 100);

console.log("Social Credit Simulator Initialized.");
