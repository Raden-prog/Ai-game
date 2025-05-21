// --- Game State Variables ---
let scp = 0; // Social Credit Points
const SAVE_KEY = 'socialCreditSimSave';

// "Positive Impact Training" Upgrade
let positiveImpactLevel = 0;
const positiveImpactBaseCost = 10;
const positiveImpactCostIncreaseFactor = 1.15;
const positiveImpactBonusPerLevel = 1; 

// "Community Contribution Program" Upgrade
let communityProgramLevel = 0;
const communityProgramBaseCost = 25;
const communityProgramCostIncreaseFactor = 1.20;
const communityProgramSCPPerLevel = 1; 

// "Effective Propaganda Network" Upgrade
let propagandaNetworkLevel = 0;
const propagandaNetworkBaseCost = 100;
const propagandaNetworkCostIncreaseFactor = 1.25;
const propagandaNetworkBonusPerLevel = 0.1; 

// "System Optimization Initiative" Upgrade
let systemOptimizationLevel = 0;
const systemOptimizationBaseCost = 150;
const systemOptimizationCostIncreaseFactor = 1.30;
const systemOptimizationBonusPerLevel = 0.1; 

// Ad Boost
let isBoostActive = false;
let boostEndTime = 0;
const boostDuration = 30 * 1000;
const boostMultiplier = 2;

// Prestige System
let influencePoints = 0;
const prestigeBonusPerInfluence = 0.01; 
const baseScpNeededToPrestige = 1000000;

// Music Player Variables
const playlist = [
    // IMPORTANT: Replace these with YOUR actual, working, royalty-free MP3 URLs!
    { name: "Placeholder Track 1 (Replace Me!)", url: "https://music.youtube.com/watch?v=W8x4m-qpmJ8&si=LTPqBrC0xnpZWIy2" },
    { name: "Placeholder Track 2 (Replace Me!)", url: "https://eta.123tokyo.xyz/get.php/4/bd/VKq2flvS7dw.mp3?n=%E8%B2%BB%E7%8E%89%E6%B8%85%20-%20%E4%B8%80%E7%BF%A6%E6%A2%85%20Yu-Ching%20Fei-%20Yi%20Jian%20Mei%20%28xue%20hua%20piao%20piao%20bei%20feng%20xiao%20xiao%29%5BOfficial%20Lyric%20Video%5D&uT=R&uN=ZHVieWE%3D&h=X5gkvTdVTQYQVcsV1bmGdg&s=1747828868&uT=R&uN=ZHVieWE%3D" },
    { name: "Placeholder Track 3 (Replace Me!)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];
let currentTrackIndex = 0;
let isMusicPlaying = false; 


// --- DOM Element References ---
const scpCountDisplay = document.getElementById('scpCount');
const scpPerClickDisplay = document.getElementById('scpPerClickDisplay');
const scpPerSecondDisplay = document.getElementById('scpPerSecondDisplay');
const actionButton = document.getElementById('actionButton'); 
const clickFeedbackContainer = document.getElementById('clickFeedbackContainer');

const positiveImpactLevelDisplay = document.getElementById('positiveImpactLevelDisplay');
const positiveImpactBonusDisplay = document.getElementById('positiveImpactBonusDisplay');
const positiveImpactCostDisplay = document.getElementById('positiveImpactCostDisplay');
const buyPositiveImpactButton = document.getElementById('buyPositiveImpactButton');

const communityProgramLevelDisplay = document.getElementById('communityProgramLevelDisplay');
const communityProgramOutputDisplay = document.getElementById('communityProgramOutputDisplay');
const communityProgramCostDisplay = document.getElementById('communityProgramCostDisplay');
const buyCommunityProgramButton = document.getElementById('buyCommunityProgramButton');

const propagandaNetworkLevelDisplay = document.getElementById('propagandaNetworkLevelDisplay');
const propagandaNetworkBonusDisplay = document.getElementById('propagandaNetworkBonusDisplay');
const propagandaNetworkCostDisplay = document.getElementById('propagandaNetworkCostDisplay');
const buyPropagandaNetworkButton = document.getElementById('buyPropagandaNetworkButton');

const systemOptimizationLevelDisplay = document.getElementById('systemOptimizationLevelDisplay');
const systemOptimizationBonusDisplay = document.getElementById('systemOptimizationBonusDisplay');
const systemOptimizationCostDisplay = document.getElementById('systemOptimizationCostDisplay');
const buySystemOptimizationButton = document.getElementById('buySystemOptimizationButton');

const adBoostButton = document.getElementById('adBoostButton');
const boostStatusDisplay = document.getElementById('boostStatus');

const influencePointsDisplay = document.getElementById('influencePointsDisplay');
const prestigeBonusDisplay = document.getElementById('prestigeBonusDisplay');
const scpForPrestigeDisplay = document.getElementById('scpForPrestigeDisplay');
const prestigeButton = document.getElementById('prestigeButton');

const resetButton = document.getElementById('resetButton');

const audioPlayer = document.getElementById('audioPlayer');
const playPauseButton = document.getElementById('playPauseButton');
const prevTrackButton = document.getElementById('prevTrackButton');
const nextTrackButton = document.getElementById('nextTrackButton');
const trackInfoDisplay = document.getElementById('trackInfo');


// --- Calculated Game Values ---
function getScpNeededToPrestige() {
    return baseScpNeededToPrestige;
}

function calculateTotalPrestigeBonusMultiplier() {
    return 1 + (influencePoints * prestigeBonusPerInfluence);
}

function getCurrentScpPerAction() { 
    let baseSCPperAction = 1 + (positiveImpactLevel * positiveImpactBonusPerLevel);
    let actionMultiplier = 1 + (propagandaNetworkLevel * propagandaNetworkBonusPerLevel);
    let scpVal = baseSCPperAction * actionMultiplier;
    
    scpVal *= calculateTotalPrestigeBonusMultiplier(); 

    if (isBoostActive) {
        scpVal *= boostMultiplier;
    }
    return scpVal;
}

function getCurrentScpPerSecond() { 
    let baseSCPperSecond = communityProgramLevel * communityProgramSCPPerLevel;
    let passiveMultiplier = 1 + (systemOptimizationLevel * systemOptimizationBonusPerLevel);
    let scpVal = baseSCPperSecond * passiveMultiplier;

    scpVal *= calculateTotalPrestigeBonusMultiplier(); 

    if (isBoostActive) {
        scpVal *= boostMultiplier;
    }
    return scpVal;
}

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
function showScpFeedback(amount) { 
    if (!clickFeedbackContainer) return;
    const feedbackText = document.createElement('div');
    feedbackText.classList.add('click-feedback-text');
    const formattedAmount = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(1);
    feedbackText.textContent = `+${formattedAmount} SCP!`;
    clickFeedbackContainer.appendChild(feedbackText);
    feedbackText.addEventListener('animationend', () => feedbackText.remove());
}

function updateDisplay() {
     if (!scpCountDisplay || !scpPerClickDisplay || !scpPerSecondDisplay || !actionButton || 
        !buyPositiveImpactButton || !buyCommunityProgramButton || !buyPropagandaNetworkButton || !buySystemOptimizationButton ||
        !adBoostButton || !prestigeButton || !resetButton || !influencePointsDisplay || !prestigeBonusDisplay || !scpForPrestigeDisplay ||
        !clickFeedbackContainer || !trackInfoDisplay || !playPauseButton || !prevTrackButton || !nextTrackButton ) { 
        console.error("UpdateDisplay: One or more DOM elements are missing! Check IDs in HTML and JS.");
        return;
    }

    scpCountDisplay.textContent = Math.floor(scp).toLocaleString(); 
    scpPerClickDisplay.textContent = getCurrentScpPerAction().toFixed(1);
    scpPerSecondDisplay.textContent = getCurrentScpPerSecond().toFixed(1);

    positiveImpactLevelDisplay.textContent = positiveImpactLevel;
    positiveImpactBonusDisplay.textContent = (positiveImpactLevel * positiveImpactBonusPerLevel);
    const currentPositiveImpactCost = getPositiveImpactCost();
    positiveImpactCostDisplay.textContent = currentPositiveImpactCost.toLocaleString();
    buyPositiveImpactButton.disabled = scp < currentPositiveImpactCost;

    communityProgramLevelDisplay.textContent = communityProgramLevel;
    communityProgramOutputDisplay.textContent = (communityProgramLevel * communityProgramSCPPerLevel);
    const currentCommunityProgramCost = getCommunityProgramCost();
    communityProgramCostDisplay.textContent = currentCommunityProgramCost.toLocaleString();
    buyCommunityProgramButton.disabled = scp < currentCommunityProgramCost;

    propagandaNetworkLevelDisplay.textContent = propagandaNetworkLevel;
    propagandaNetworkBonusDisplay.textContent = (1 + propagandaNetworkLevel * propagandaNetworkBonusPerLevel).toFixed(1);
    const currentPropagandaNetworkCost = getPropagandaNetworkCost();
    propagandaNetworkCostDisplay.textContent = currentPropagandaNetworkCost.toLocaleString();
    buyPropagandaNetworkButton.disabled = scp < currentPropagandaNetworkCost;

    systemOptimizationLevelDisplay.textContent = systemOptimizationLevel;
    systemOptimizationBonusDisplay.textContent = (1 + systemOptimizationLevel * systemOptimizationBonusPerLevel).toFixed(1);
    const currentSystemOptimizationCost = getSystemOptimizationCost();
    systemOptimizationCostDisplay.textContent = currentSystemOptimizationCost.toLocaleString();
    buySystemOptimizationButton.disabled = scp < currentSystemOptimizationCost;

    if (isBoostActive) {
        const timeLeft = Math.ceil((boostEndTime - Date.now()) / 1000);
        boostStatusDisplay.textContent = `Social Boost Active! ${boostMultiplier}x SCP for ${Math.max(0, timeLeft)}s`;
        adBoostButton.disabled = true;
    } else {
        boostStatusDisplay.textContent = 'Social Boost Inactive';
        adBoostButton.disabled = false;
    }

    influencePointsDisplay.textContent = influencePoints.toLocaleString();
    prestigeBonusDisplay.textContent = (influencePoints * prestigeBonusPerInfluence * 100).toFixed(0); 
    const scpRequired = getScpNeededToPrestige();
    scpForPrestigeDisplay.textContent = scpRequired.toLocaleString(); 
    prestigeButton.disabled = scp < scpRequired;

    // Music Player UI Update
    if (playlist.length > 0 && playlist[currentTrackIndex] && trackInfoDisplay && playPauseButton) {
        trackInfoDisplay.textContent = `${isMusicPlaying ? "Now Playing" : "Paused"}: ${playlist[currentTrackIndex].name}`;
        playPauseButton.textContent = isMusicPlaying ? "⏸️ Pause" : "▶️ Play";
        playPauseButton.disabled = false;
        if(prevTrackButton) prevTrackButton.disabled = false;
        if(nextTrackButton) nextTrackButton.disabled = false;
    } else if (trackInfoDisplay && playPauseButton) { // Ensure elements exist before modifying
        trackInfoDisplay.textContent = "No tracks loaded or available.";
        playPauseButton.textContent = "▶️ Play";
        playPauseButton.disabled = true;
        if(prevTrackButton) prevTrackButton.disabled = true;
        if(nextTrackButton) nextTrackButton.disabled = true;
    }
}

function performAction() { 
    let scpEarned = getCurrentScpPerAction();
    scp += scpEarned;
    showScpFeedback(scpEarned);
    updateDisplay();
}

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
            let influenceGained = Math.floor(Math.sqrt(scp / 100000)); 
            if (influenceGained < 1 && scp >= scpRequired) influenceGained = 1; 

            influencePoints += influenceGained;
            scp = 0;
            positiveImpactLevel = 0;
            communityProgramLevel = 0;
            propagandaNetworkLevel = 0;
            systemOptimizationLevel = 0;
            isBoostActive = false;
            boostEndTime = 0;
            
            console.log(`Prestiged! Gained ${influenceGained} Influence. Total Influence: ${influencePoints}`);
            saveGame(); 
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
        updateDisplay(); 
    }
    updateDisplay(); 
    saveGame(); 
}

// Music Player Functions
function loadTrack(trackIndex) {
    if (audioPlayer && playlist.length > 0 && playlist[trackIndex]) {
        audioPlayer.src = playlist[trackIndex].url;
        audioPlayer.load(); 
        currentTrackIndex = trackIndex;
        console.log("Loading track:", playlist[trackIndex].name);
        updateDisplay(); 
    } else {
        console.error("Cannot load track: Invalid index or empty playlist.");
        if (audioPlayer) audioPlayer.src = ""; // Clear src if track is invalid
        isMusicPlaying = false; // Ensure consistent state
        updateDisplay();
    }
}

function togglePlayPause() {
    if (!audioPlayer || playlist.length === 0 || !playlist[currentTrackIndex]?.url) {
        console.log("Music player: No track loaded or playlist empty.");
        updateDisplay(); // Ensure UI reflects disabled state if needed
        return;
    }

    if (audioPlayer.paused) { 
        audioPlayer.play()
            .then(() => {
                // isMusicPlaying = true; // Handled by 'play' event listener
                console.log("Attempting to play:", playlist[currentTrackIndex].name);
            })
            .catch(error => {
                console.error("Error playing audio:", error);
                isMusicPlaying = false; 
                if(trackInfoDisplay) trackInfoDisplay.textContent = "Playback error. Click play.";
                updateDisplay(); // Reflect that it didn't play
            });
    } else {
        audioPlayer.pause();
        // isMusicPlaying = false; // Handled by 'pause' event listener
        console.log("Music paused");
    }
    // updateDisplay(); // Let event listeners handle UI update for play/pause state
}

function playNextTrack() {
    if (playlist.length === 0) return;
    let newIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(newIndex);
    if (isMusicPlaying) { 
        audioPlayer.play().catch(e => console.error("Autoplay to next track might be blocked.", e));
    }
    // updateDisplay() will be called by loadTrack and play/pause events
}

function playPrevTrack() {
    if (playlist.length === 0) return;
    let newIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(newIndex);
     if (isMusicPlaying) {
        audioPlayer.play().catch(e => console.error("Autoplay to prev track might be blocked.", e));
    }
    // updateDisplay() will be called by loadTrack and play/pause events
}


// --- Saving and Loading ---
function saveGame() { 
    try { 
        const gameState = { scp, positiveImpactLevel, communityProgramLevel, propagandaNetworkLevel, systemOptimizationLevel, influencePoints }; 
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
            influencePoints = parseInt(gameState.influencePoints) || 0; 
        } else { 
            scp = 0; positiveImpactLevel = 0; communityProgramLevel = 0; propagandaNetworkLevel = 0; systemOptimizationLevel = 0; influencePoints = 0;
        }
    } catch (e) { 
        console.error("Error loading game:", e); 
        scp = 0; positiveImpactLevel = 0; communityProgramLevel = 0; propagandaNetworkLevel = 0; systemOptimizationLevel = 0; influencePoints = 0;
    }
}

function resetGameData() { 
    if (confirm("Are you sure you want to HARD RESET all game data? This includes Influence and cannot be undone!")) { 
        try { 
            localStorage.removeItem(SAVE_KEY); 
            scp = 0; positiveImpactLevel = 0; communityProgramLevel = 0; propagandaNetworkLevel = 0; systemOptimizationLevel = 0; influencePoints = 0; 
            isBoostActive = false; boostEndTime = 0; 
            // Reset music player state if needed (e.g., stop music, reset to first track)
            if(audioPlayer) audioPlayer.pause();
            currentTrackIndex = 0;
            isMusicPlaying = false;
            if (playlist.length > 0) loadTrack(currentTrackIndex); // Reload first track visuals

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

if (playPauseButton) playPauseButton.addEventListener('click', togglePlayPause);
if (nextTrackButton) nextTrackButton.addEventListener('click', playNextTrack);
if (prevTrackButton) prevTrackButton.addEventListener('click', playPrevTrack);

if (audioPlayer) {
    audioPlayer.addEventListener('ended', playNextTrack); 
    audioPlayer.addEventListener('play', () => { 
        isMusicPlaying = true; 
        console.log("Audio event: play");
        updateDisplay(); 
    });
    audioPlayer.addEventListener('pause', () => { 
        isMusicPlaying = false; 
        console.log("Audio event: pause");
        updateDisplay(); 
    });
    audioPlayer.addEventListener('error', (e) => {
        console.error("Audio Player Error:", e);
        if(trackInfoDisplay) trackInfoDisplay.textContent = "Error loading track.";
        isMusicPlaying = false;
        updateDisplay();
    });
}


// --- Initial Game Setup ---
console.log("Initializing Social Credit Simulator with Music Player...");
loadGame();
if (playlist.length > 0 && audioPlayer) { // Check audioPlayer existence
    loadTrack(currentTrackIndex); // Load track but don't autoplay
}
updateDisplay();
setInterval(gameLoop, 100);

console.log("Social Credit Simulator Initialized with Music Player.");
