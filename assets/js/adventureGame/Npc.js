import GameEnv from "./GameEnv.js";
import Character from "./Character.js";
import Prompt from "./Prompt.js";

let levelData;
class Npc extends Character {
    constructor(data = null) {
        super(data);
        this.quiz = data?.quiz?.title; // Quiz title
        this.questions = Prompt.shuffleArray(data?.quiz?.questions || []); // Shuffle questions
        this.currentQuestionIndex = 0; // Start from the first question
        this.alertTimeout = null;
        
        // Add key tracking for each NPC
        this.keysReceived = 0;
        this.npcId = data?.id || Math.random().toString(36).substring(7);
        
        // Load previously saved key state
        this.loadNpcKeyState();
        
        levelData = data.level_data;
        
        // Bind event listeners directly in constructor
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Add event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }
    
    /**
     * Override the update method to draw the NPC.
     * This NPC is stationary, so the update method only calls the draw method.
     */
    update() {
        this.draw();
        this.collisionChecks();
    }
    
    /**
     * Handle keydown events for interaction.
     * @param {Object} event - The keydown event.
     */
    handleKeyDown(event) {
        const { key } = event;
        
        // Debug to console
        if (key === 'q') {
            console.log('Q key pressed - attempting to give key');
            
            // Check if player is in collision with this NPC directly from this NPC's state
            if (this.state.collisionEvents.length > 0) {
                // Find if any of the collision events is a player
                const collidingWithPlayer = this.state.collisionEvents.some(id => {
                    return id === "player" || id === "player2";
                });
                
                console.log('Player colliding with NPC:', collidingWithPlayer);
                
                if (collidingWithPlayer) {
                    this.giveKeyToNpc();
                }
            }
        }
        
        if (key === 'e' || key === 'u') {
            this.handleKeyInteract();
        }
    }
    
    /**
     * Handle keyup events to stop player actions.
     * @param {Object} event - The keyup event.
     */
    handleKeyUp(event) {
        const { key } = event;
        
        if (key === 'e' || key === 'u' || key === 'q') {
            // Clear any active timeouts when the interaction key is released
            if (this.alertTimeout) {
                clearTimeout(this.alertTimeout);
                this.alertTimeout = null;
            }
        }
    }
    
    /**
     * Handle giving a key to the NPC
     */
    giveKeyToNpc() {
        console.log('Attempting to give key to NPC');
        
        // Check if player has keys
        const playerKeyCount = levelData.getPlayerItem("key");
        console.log('Player key count:', playerKeyCount);
        
        if (playerKeyCount > 0 && this.keysReceived < 2) {
            // Give key to NPC
            this.keysReceived++;
            console.log(`NPC now has ${this.keysReceived} keys`);
            
            // Remove key from player inventory
            levelData.removePlayerItem("key");
            
            // Save NPC key state
            this.saveNpcKeyState();
            
            // Show confirmation message
            this.showMessage(`Key given! NPC has ${this.keysReceived}/2 keys`, "green");
            
            // Check if game should end
            this.checkGameEnd();
        } else if (playerKeyCount <= 0) {
            this.showMessage("You don't have any keys!", "red");
        } else if (this.keysReceived >= 2) {
            this.showMessage("This NPC already has 2 keys!", "orange");
        }
    }
    
    /**
     * Display a message to the player
     * @param {string} text - Message text
     * @param {string} color - Message color (green, red, orange)
     */
    showMessage(text, color = "black") {
        // Remove any existing message
        const existingMessage = document.getElementById("npc-message");
        if (existingMessage) {
            document.body.removeChild(existingMessage);
        }
        
        // Color mapping
        const colorMap = {
            "green": "rgba(0, 128, 0, 0.8)",
            "red": "rgba(255, 0, 0, 0.8)",
            "orange": "rgba(255, 165, 0, 0.8)",
            "black": "rgba(0, 0, 0, 0.8)"
        };
        
        // Create new message
        const message = document.createElement("div");
        message.id = "npc-message";
        message.style.position = "fixed";
        message.style.bottom = "15%";
        message.style.left = "50%";
        message.style.transform = "translateX(-50%)";
        message.style.backgroundColor = colorMap[color] || colorMap.black;
        message.style.color = "white";
        message.style.padding = "10px 20px";
        message.style.borderRadius = "5px";
        message.style.zIndex = "1000";
        message.innerHTML = text;
        
        document.body.appendChild(message);
        
        // Remove message after 2 seconds
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 2000);
    }
 
    /**
     * Handle proximity interaction and share a quiz.
     */
    handleKeyInteract() {
        const players = GameEnv.gameObjects.filter(obj => obj.state.collisionEvents.includes(this.spriteData.id));
        const hasQuestions = this.questions.length > 0;
        
        if (players.length > 0 && hasQuestions) {
            players.forEach(player => {
                // Force stop player movement before opening prompt
                player.velocity.x = 0;
                player.velocity.y = 0;
                player.isInteracting = true;

                if (!Prompt.isOpen) {
                    Prompt.currentNpc = this;
                    Prompt.openPromptPanel(this, levelData);
                }
            });
        }
    }
    
    /**
     * Save NPC key state to localStorage
     */
    saveNpcKeyState() {
        // Get current NPC key states or initialize empty object
        const npcKeyStates = JSON.parse(localStorage.getItem("npcKeyStates") || "{}");
        
        // Update this NPC's key count
        npcKeyStates[this.npcId] = this.keysReceived;
        
        // Save back to localStorage
        localStorage.setItem("npcKeyStates", JSON.stringify(npcKeyStates));
        
        // Debug - log all NPC key states
        console.log("Current NPC key states:", npcKeyStates);
    }
    
    /**
     * Load NPC key state from localStorage
     */
    loadNpcKeyState() {
        const npcKeyStates = JSON.parse(localStorage.getItem("npcKeyStates") || "{}");
        if (npcKeyStates[this.npcId] !== undefined) {
            this.keysReceived = npcKeyStates[this.npcId];
            console.log(`Loaded key state for NPC ${this.npcId}: ${this.keysReceived} keys`);
        }
    }
    
    /**
     * Check if all NPCs have 2 keys and end the game if so
     */
    checkGameEnd() {
        // Get all NPCs in the game
        const allNpcs = GameEnv.gameObjects.filter(obj => obj instanceof Npc);
        
        console.log(`Checking game end. Found ${allNpcs.length} NPCs.`);
        
        // Check if all NPCs have 2 keys
        const allNpcsHaveKeys = allNpcs.every(npc => npc.keysReceived >= 2);
        const npcKeyCounts = allNpcs.map(npc => `${npc.npcId}: ${npc.keysReceived}`);
        console.log("NPC key counts:", npcKeyCounts);
        
        if (allNpcsHaveKeys && allNpcs.length >= 4) {
            console.log("All NPCs have 2 keys! Ending game.");
            // All NPCs have 2 keys - end the game
            this.endGame();
        }
    }
    
    /**
     * End the game with victory
     */
    endGame() {
        console.log("Game Completed: All NPCs have received their keys!");
        
        // Create victory screen
        const victoryScreen = document.createElement("div");
        victoryScreen.style.position = "fixed";
        victoryScreen.style.top = "0";
        victoryScreen.style.left = "0";
        victoryScreen.style.width = "100%";
        victoryScreen.style.height = "100%";
        victoryScreen.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        victoryScreen.style.color = "white";
        victoryScreen.style.display = "flex";
        victoryScreen.style.flexDirection = "column";
        victoryScreen.style.justifyContent = "center";
        victoryScreen.style.alignItems = "center";
        victoryScreen.style.zIndex = "2000";
        
        victoryScreen.innerHTML = `
            <h1>Victory!</h1>
            <p>All NPCs have received their 2 keys!</p>
            <p>The prison gates have opened and everyone is free!</p>
            <button id="restart-game" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">Play Again</button>
        `;
        
        document.body.appendChild(victoryScreen);
        
        // Add restart button functionality
        document.getElementById("restart-game").addEventListener("click", () => {
            // Clear NPC key states
            localStorage.removeItem("npcKeyStates");
            
            // Reload the game
            window.location.reload();
        });
    }

    collisionChecks() {
        let collisionDetected = false;

        for (var gameObj of GameEnv.gameObjects) {
            if (gameObj.canvas && this != gameObj) {
                this.isCollision(gameObj);
                if (this.collisionData.hit) {
                    collisionDetected = true;
                    this.handleCollisionEvent();
                }
            }
        }

        if (!collisionDetected) {
            this.state.collisionEvents = [];
        }
    }

    isCollision(other) {
        // Bounding rectangles from Canvas
        const thisRect = this.canvas.getBoundingClientRect();
        const otherRect = other.canvas.getBoundingClientRect();

        // Calculate hitbox constants for this object
        const thisWidthReduction = thisRect.width * (this.hitbox?.widthPercentage || 0.0);
        const thisHeightReduction = thisRect.height * (this.hitbox?.heightPercentage || 0.0);

        // Calculate hitbox constants for other object
        const otherWidthReduction = otherRect.width * (other.hitbox?.widthPercentage || 0.0);
        const otherHeightReduction = otherRect.height * (other.hitbox?.heightPercentage || 0.0);

        // Build hitbox by subtracting reductions from the left, right, and top
        const thisLeft = thisRect.left + thisWidthReduction;
        const thisTop = thisRect.top + thisHeightReduction;
        const thisRight = thisRect.right - thisWidthReduction;
        const thisBottom = thisRect.bottom;

        const otherLeft = otherRect.left + otherWidthReduction;
        const otherTop = otherRect.top + otherHeightReduction;
        const otherRight = otherRect.right - otherWidthReduction;
        const otherBottom = otherRect.bottom;

        // Determine hit and touch points of hit
        const hit = (
            thisLeft < otherRight &&
            thisRight > otherLeft &&
            thisTop < otherBottom &&
            thisBottom > otherTop
        );

        const touchPoints = {
            this: {
                id: this.canvas.id,
                greet: this.spriteData.greeting,
                top: thisBottom > otherTop && thisTop < otherTop,
                bottom: thisTop < otherBottom && thisBottom > otherBottom,
                left: thisRight > otherLeft && thisLeft < otherLeft,
                right: thisLeft < otherRight && thisRight > otherRight,
            },
            other: {
                id: other.canvas.id,
                greet: other.spriteData.greeting,
                top: otherBottom > thisTop && otherTop < thisTop,
                bottom: otherTop < thisBottom && otherBottom > thisBottom,
                left: otherRight > thisLeft && otherLeft < thisLeft,
                right: otherLeft < thisRight && otherRight > thisRight,
            },
        };

        this.collisionData = { hit, touchPoints };
    }

    /**
     * Update the collisions array when player is touching the object
     * @param {*} objectID 
     */
    handleCollisionEvent() {
        const objectID = this.collisionData.touchPoints.other.id;
    
        if (!this.state.collisionEvents.includes(objectID)) {
            this.state.collisionEvents.push(objectID);
            
            // Find the player object that collided
            const player = GameEnv.gameObjects.find(obj => obj.canvas?.id === objectID);
            
            if (player && (player.canvas.id === "player" || player.canvas.id === "player2")) {
                // Show NPC key status and instructions
                this.showNpcKeyStatus();
            }
        }
    }
    
    /**
     * Show NPC key status when player approaches
     */
    showNpcKeyStatus() {
        const statusElement = document.getElementById("npc-key-status");
        
        if (!statusElement) {
            const status = document.createElement("div");
            status.id = "npc-key-status";
            status.style.position = "fixed";
            status.style.bottom = "10%";
            status.style.left = "50%";
            status.style.transform = "translateX(-50%)";
            status.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            status.style.color = "white";
            status.style.padding = "10px";
            status.style.borderRadius = "5px";
            status.style.zIndex = "900";
            status.innerHTML = `${this.spriteData.greeting || "NPC"} has ${this.keysReceived}/2 keys. Press Q to give a key.`;
            
            document.body.appendChild(status);
            
            // Remove status after 3 seconds
            setTimeout(() => {
                if (document.body.contains(status)) {
                    document.body.removeChild(status);
                }
            }, 3000);
        }
    }
    
    /**
     * Clean up event listeners when this object is destroyed
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        
        // Call parent destroy if it exists
        if (super.destroy) {
            super.destroy();
        }
    }
}

export default Npc;