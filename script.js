// --- HTML Element References ---
const gameNarrativeElement = document.getElementById('output-area'); // Changed from 'game-narrative' to match HTML
const choicesArea = document.getElementById('choices-area');

const playerNameDisplay = document.getElementById('player-name');
const playerHpDisplay = document.getElementById('player-hp');
const playerAttackDisplay = document.getElementById('player-attack');
const playerLocationDisplay = document.getElementById('player-location');

console.log("HTML elements referenced.");

// --- Player Data ---
let player = {
    name: "Hero", // Default name
    hp: 100,
    maxHp: 100,
    attack: 10,
    currentScene: "start_village", // Starting scene ID
    inventory: [],
    // You can add more player attributes here that choices might affect
    // e.g., morality: 0, gold: 10, specific_quest_flags: {}
};

console.log("Player object created:", player);

// --- Game Scenes Data ---
// This is where your branching narrative lives. Each key is a scene ID.
const scenes = {
    "start_village": {
        name: "Starting Village", // For display in stats
        narrative: "You are in a quiet village. The morning air is crisp.<br>A well-worn path leads north out of the village. An old signboard points east towards a 'Mysterious Forest'.",
        choices: [
            { text: "Take the path north.", action: "go_north", leadsToScene: "north_path_clearing" },
            { text: "Head east towards the Mysterious Forest.", action: "go_east_forest", leadsToScene: "forest_entrance" },
            { text: "Look around the village.", action: "look_village", leadsToScene: "village_look_around" }
        ]
    },
    "village_look_around": {
        name: "Village Center",
        narrative: "You see a small, closed shop and a few quiet houses. An old woman is sweeping her porch. She eyes you curiously.",
        choices: [
            { text: "Try to talk to the old woman.", action: "talk_old_woman", leadsToScene: "talk_to_old_woman_scene" },
            { text: "Go back to the village crossroads.", action: "return_to_crossroads", leadsToScene: "start_village" }
        ]
    },
    "talk_to_old_woman_scene": {
        name: "Old Woman's Porch",
        narrative: () => { // Using a function for dynamic narrative
            if (player.inventory.includes("lost_locket")) {
                player.inventory.splice(player.inventory.indexOf("lost_locket"), 1); // Remove locket
                player.gold = (player.gold || 0) + 20; // Add gold
                return "\"Oh, my locket! You found it!\" she exclaims, her eyes wide with joy. \"Thank you, dear traveler! Please, take this for your trouble.\" (You receive 20 gold).";
            } else {
                return "\"Hmph. Another wanderer,\" she mutters. \"Be careful if you're heading into that forest. Strange things happen there.\"";
            }
        },
        choices: [
            { text: "Thank her and leave.", action: "leave_woman", leadsToScene: "village_look_around" },
            { text: "Ask about the forest.", action: "ask_forest_again", leadsToScene: "ask_forest_details"}
        ]
    },
    "ask_forest_details": {
        name: "Old Woman's Porch",
        narrative: "\"The forest?\" she says, lowering her voice. \"They say it shifts and changes. And sometimes... people don't come back the same. Or at all.\" She shivers.",
        choices: [
             { text: "Thank her for the warning.", action: "leave_woman_warned", leadsToScene: "village_look_around" }
        ]
    },
    "north_path_clearing": {
        name: "North Path - Clearing",
        narrative: "The path opens into a sunny clearing. You see some wildflowers and hear birds chirping. The path continues north.",
        choices: [
            { text: "Continue north.", action: "go_further_north", leadsToScene: "further_north_encounter" }, // Placeholder for future scene
            { text: "Pick some wildflowers.", action: "pick_flowers" }, // Example of choice without scene change (modifies player state)
            { text: "Return to the village.", action: "return_to_village_south", leadsToScene: "start_village" }
        ]
    },
    "forest_entrance": {
        name: "Mysterious Forest Entrance",
        narrative: "Tall, ancient trees loom before you, their branches intertwining to block out much of the sunlight. The air is still and a little eerie. You see a faint glimmer on the ground near a large oak tree.",
        choices: [
            { text: "Step into the forest.", action: "enter_forest", leadsToScene: "deep_forest_1" },
            { text: "Examine the glimmer.", action: "examine_glimmer", leadsToScene: "forest_glimmer_found" },
            { text: "Turn back to the village.", action: "return_to_village_west", leadsToScene: "start_village" }
        ]
    },
    "forest_glimmer_found": {
        name: "Mysterious Forest Entrance",
        narrative: "You approach the glimmer and find a small, silver locket half-buried in the leaves. It looks old but well-cared for. Perhaps it belongs to someone in the village?",
        onEnter: () => { // Action to perform when entering this scene
            if (!player.inventory.includes("lost_locket")) {
                player.inventory.push("lost_locket");
            }
        },
        choices: [
            { text: "Take the locket.", leadsToScene: "forest_entrance" }, // Re-render forest entrance, but now you have locket
            { text: "Leave it and step into the forest.", action: "enter_forest", leadsToScene: "deep_forest_1" },
            { text: "Leave it and turn back to the village.", action: "return_to_village_west", leadsToScene: "start_village" }
        ]
    },
    "deep_forest_1": {
        name: "Deep Forest",
        narrative: "The forest is darker here. Strange sounds echo around you. You feel a sense of unease.",
        choices: [
            // This is where you'd add choices for combat, puzzles, or further exploration
            { text: "You are lost! Go back to the village (for now).", action: "flee_forest", leadsToScene: "start_village" }
        ]
    },
     "further_north_encounter": {
        name: "Further North",
        narrative: "This area is not yet developed. Adventure awaits!",
        choices: [
            { text: "Return to the clearing.", leadsToScene: "north_path_clearing" }
        ]
    }
    // Add more scenes here to expand your game world!
};

// --- Core Game Functions ---

function updatePlayerStatsDisplay() {
    playerNameDisplay.textContent = player.name;
    playerHpDisplay.textContent = player.hp + " / " + player.maxHp;
    playerAttackDisplay.textContent = player.attack;
    const currentSceneData = scenes[player.currentScene];
    playerLocationDisplay.textContent = currentSceneData ? currentSceneData.name : player.currentScene;
    console.log("Player stats display updated.");
}

function displayNarrative(text) {
    // Clear previous narrative for a cleaner look per scene
    gameNarrativeElement.innerHTML = ''; 
    const newParagraph = document.createElement('p');
    newParagraph.innerHTML = text; // Use innerHTML to allow <br> tags for line breaks
    gameNarrativeElement.appendChild(newParagraph);
    gameNarrativeElement.scrollTop = gameNarrativeElement.scrollHeight; // Scroll to bottom
    console.log("Narrative displayed.");
}

function displayChoices(choices) {
    choicesArea.innerHTML = ""; // Clear previous choices

    if (!choices || choices.length === 0) {
        const noChoiceMessage = document.createElement('p');
        noChoiceMessage.textContent = "There are no further actions at this time. The story ends here (for now).";
        choicesArea.appendChild(noChoiceMessage);
        return;
    }

    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.classList.add('choice-button');
        // Pass the entire choice object to handleChoice for more flexibility
        button.addEventListener('click', () => handleChoice(choice));
        choicesArea.appendChild(button);
    });
    console.log("Choices displayed:", choices);
}

function handleChoice(choice) {
    console.log("Choice made:", choice);

    // 1. Execute any immediate action defined in the choice itself (optional)
    if (choice.action) {
        // Example: Simple action handling within handleChoice
        if (choice.action === "pick_flowers") {
            if (!player.inventory.includes("wildflowers")) {
                player.inventory.push("wildflowers");
                displayNarrative("You picked some beautiful wildflowers. They are now in your inventory.");
                console.log("Player inventory:", player.inventory);
            } else {
                displayNarrative("You already have wildflowers.");
            }
            // Update stats if inventory display is more detailed or if it affects something
            updatePlayerStatsDisplay(); 
            // Re-display choices for current scene, or an updated narrative may have different choices
             const currentSceneData = scenes[player.currentScene];
             displayChoices(currentSceneData.choices); // Re-render choices for current scene
            return; // Stop further processing if it's a non-scene-changing action for this example
        }
        // Add more specific action handlers here if needed,
        // or call dedicated functions for complex actions (like combat)
    }

    // 2. Transition to a new scene if 'leadsToScene' is defined
    if (choice.leadsToScene) {
        if (scenes[choice.leadsToScene]) {
            player.currentScene = choice.leadsToScene;
            renderScene(); // Render the new scene
        } else {
            console.error("Error: Scene '" + choice.leadsToScene + "' not found!");
            displayNarrative("Error: That path seems to lead nowhere (scene not found).");
        }
    } else if (!choice.action) {
        // If no leadsToScene and no specific action handled above, it might be an oversight
        // or a choice that should have just displayed text (which should be part of the narrative logic)
        console.warn("Choice made with no 'leadsToScene' and no specific 'action' handled:", choice);
    }
    
    // Always update player stats display after any action or scene change
    updatePlayerStatsDisplay();
}

function renderScene() {
    const currentSceneData = scenes[player.currentScene];

    if (!currentSceneData) {
        console.error("Error: Current scene '" + player.currentScene + "' data not found!");
        displayNarrative("<b>Error: The fabric of reality unravels... (current scene data missing)</b>");
        choicesArea.innerHTML = ""; // Clear choices if scene is broken
        return;
    }

    // Execute onEnter action if defined for the scene
    if (currentSceneData.onEnter && typeof currentSceneData.onEnter === 'function') {
        currentSceneData.onEnter();
    }
    
    // Display narrative (can be string or function)
    let narrativeText = "";
    if (typeof currentSceneData.narrative === 'function') {
        narrativeText = currentSceneData.narrative();
    } else {
        narrativeText = currentSceneData.narrative;
    }
    displayNarrative(narrativeText);
    
    // Display choices
    displayChoices(currentSceneData.choices);

    // Update player stats (especially for location name)
    updatePlayerStatsDisplay();
    console.log("Scene '" + player.currentScene + "' rendered.");
}

// --- Game Initialization ---
function initializeGame() {
    renderScene(); // Start by rendering the initial scene
    console.log("Game initialized.");
}

// Start the game when the script loads
initializeGame();
