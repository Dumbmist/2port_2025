import GameEnv from './GameEnv.js';
import GameObject from './GameObject.js';
import { removeItemFromInventory } from './Inventory.js';

// Define non-mutable constants as defaults
const SCALE_FACTOR = 25; // 1/nth of the height of the canvas
const STEP_FACTOR = 100; // 1/nth, or N steps up and across the canvas
const ANIMATION_RATE = 1; // 1/nth of the frame rate
const INIT_POSITION = { x: 0, y: 0 };

/**
 * KeySlot is a class that manages slots where keys can be placed to complete the game.
 * When all required keys are placed, it triggers a victory screen.
 */
let levelData;
let filledSlots = 0; // Track how many key slots have been filled
let totalRequiredSlots = 0; // Total number of slots that need to be filled

class KeySlot extends GameObject {
    /**
     * The constructor method is called when a new KeySlot object is created.
     * 
     * @param {Object|null} data - The sprite data for the object. If null, a default red square is used.
     */
    constructor(data = null) {
        super();
        this.state = {
            ...this.state,
            animation: 'idle',
            direction: 'right',
            isDying: false,
            isFinishing: false,
            isFilled: false, // Track if this specific slot has been filled
        }; // Object control data

        // Create canvas element
        this.canvas = document.createElement("canvas");
        this.canvas.id = data.id || "default";
        this.canvas.width = data.pixels?.width || 0;
        this.canvas.height = data.pixels?.height || 0;
        this.hitbox = data?.hitbox || {};
        this.ctx = this.canvas.getContext('2d');
        document.getElementById("gameContainer").appendChild(this.canvas);

        // Set initial object properties 
        this.x = 0;
        this.y = 0;
        this.frame = 0;
        
        // Initialize the object's scale based on the game environment
        this.scale = { width: GameEnv.innerWidth, height: GameEnv.innerHeight };
        
        // Check if sprite data is provided
        if (data && data.src) {
            this.scaleFactor = data.SCALE_FACTOR || SCALE_FACTOR;
            this.stepFactor = data.STEP_FACTOR || STEP_FACTOR;
            this.animationRate = data.ANIMATION_RATE || ANIMATION_RATE;
            this.position = data.INIT_POSITION || INIT_POSITION;
    
            // Load the sprite sheet
            this.spriteSheet = new Image();
            this.spriteSheet.src = data.src;

            // Initialize animation properties
            this.frameIndex = 0; // index reference to current frame
            this.frameCounter = 0; // count each frame rate refresh
            this.direction = 'down'; // Initial direction
            this.spriteData = data;
            
            // Initialize slot-specific properties
            this.slotIndex = data.slotIndex || 0;
            this.required_keys = data.required_keys || 1;
        } else {
            throw new Error('Sprite data is required');
        }

        // Initialize the object's position and velocity
        this.velocity = { x: 0, y: 0 };

        levelData = data.level_data;
        
        // Update total required slots on initialization
        if (!this.state.isFilled) {
            totalRequiredSlots = this.required_keys;
        }

        // Add this object to the gameLoop
        GameEnv.gameObjects.push(this);

        // Set the initial size and velocity of the object
        this.resize();

        this.bindEventListeners();
    }

    /**
     * Reset the slot counter (static method)
     */
    static resetSlots() {
        filledSlots = 0;
    }

    /**
     * Draw the object on the canvas
     */
    draw() {
        if (this.spriteSheet) {
            // Sprite Sheet frame size: pixels = total pixels / total frames
            const frameWidth = this.spriteData.pixels.width / this.spriteData.orientation.columns;
            const frameHeight = this.spriteData.pixels.height / this.spriteData.orientation.rows;
    
            // Sprite Sheet direction data source (e.g., front, left, right, back)
            const directionData = this.spriteData[this.direction];
    
            // Sprite Sheet x and y declarations to store coordinates of current frame
            let frameX, frameY;
            // Sprite Sheet x and y current frame: coordinate = (index) * (pixels)
            frameX = (directionData.start + this.frameIndex) * frameWidth;
            frameY = directionData.row * frameHeight;
    
            // Set up the canvas dimensions and styles
            this.canvas.width = frameWidth;
            this.canvas.height = frameHeight;
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;
            this.canvas.style.position = 'absolute';
            this.canvas.style.left = `${this.position.x}px`;
            this.canvas.style.top = `${GameEnv.top+this.position.y}px`;
    
            // Clear the canvas before drawing
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
            // Draw the current frame of the sprite sheet with modifications if filled
            if (this.state.isFilled) {
                // Draw with green tint for filled slots
                this.ctx.drawImage(
                    this.spriteSheet,
                    frameX, frameY, frameWidth, frameHeight, // Source rectangle
                    0, 0, this.canvas.width, this.canvas.height // Destination rectangle
                );
                
                // Add green overlay for filled state
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            } else {
                // Draw normal sprite
                this.ctx.drawImage(
                    this.spriteSheet,
                    frameX, frameY, frameWidth, frameHeight, // Source rectangle
                    0, 0, this.canvas.width, this.canvas.height // Destination rectangle
                );
            }
    
            // Update the frame index for animation at a slower rate
            this.frameCounter++;
            if (this.frameCounter % this.animationRate === 0) {
                this.frameIndex = (this.frameIndex + 1) % directionData.columns;
            }
        } else {
            // Draw default red square
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Update method called on each game loop
     */
    update() {
        // Update begins by drawing the object
        this.draw();
        this.collisionChecks();
    }

    bindEventListeners() {
        addEventListener('keydown', this.handleKeyDown.bind(this));
        addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    /**
     * Handle keydown events for interaction.
     * @param {Object} event - The keydown event.
     */
    // In the KeySlot.js file, update the handleKeyDown method:
    handleKeyDown({ key }) {
        switch (key) {
            case 'e':  
                // Check if player has a key and is colliding with this slot
                if(this.hasCollided("Hello, please help me escape this prison.") && !this.state.isFilled) {
                    // Check if player has a key
                    if(levelData.getPlayerItem() > 0 && levelData.hasItem("key")) {
                        // Remove one key from player inventory in both data and UI
                        levelData.removePlayerItem("key");
                        
                        // This is the missing line - update the UI inventory
                        removeItemFromInventory("key");
                        
                        // Mark this slot as filled
                        this.state.isFilled = true;
                        filledSlots++;
                        
                        // Check if all slots are filled
                        if (filledSlots >= totalRequiredSlots) {
                            this.showVictoryScreen();
                        }
                    }
                }
                break;
        }
    }

    /**
     * Shows the victory screen when all keys are placed
     */
    showVictoryScreen() {
        // Create the victory screen overlay
        const victoryScreen = document.createElement('div');
        victoryScreen.id = 'victoryScreen';
        victoryScreen.style.position = 'fixed';
        victoryScreen.style.top = '0';
        victoryScreen.style.left = '0';
        victoryScreen.style.width = '100%';
        victoryScreen.style.height = '100%';
        victoryScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        victoryScreen.style.display = 'flex';
        victoryScreen.style.flexDirection = 'column';
        victoryScreen.style.justifyContent = 'center';
        victoryScreen.style.alignItems = 'center';
        victoryScreen.style.zIndex = '9999';
        victoryScreen.style.color = 'white';
        victoryScreen.style.fontFamily = 'Arial, sans-serif';
        
        // Create title
        const title = document.createElement('h1');
        title.innerText = 'VICTORY!';
        title.style.fontSize = '4rem';
        title.style.marginBottom = '2rem';
        title.style.textShadow = '0 0 10px gold, 0 0 20px gold';
        title.style.animation = 'pulse 2s infinite';
        
        // Create message
        const message = document.createElement('p');
        message.innerText = 'You have successfully escaped the prison!';
        message.style.fontSize = '2rem';
        message.style.marginBottom = '3rem';
        
        // Create restart button
        const restartButton = document.createElement('button');
        restartButton.innerText = 'Play Again';
        restartButton.style.padding = '1rem 2rem';
        restartButton.style.fontSize = '1.5rem';
        restartButton.style.backgroundColor = 'gold';
        restartButton.style.color = 'black';
        restartButton.style.border = 'none';
        restartButton.style.borderRadius = '5px';
        restartButton.style.cursor = 'pointer';
        restartButton.onclick = () => {
            // Reload page to restart game
            location.reload();
        };
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            #victoryScreen button:hover {
                background-color: white;
                transform: scale(1.1);
                transition: all 0.2s;
            }
        `;
        
        // Add elements to victory screen
        victoryScreen.appendChild(title);
        victoryScreen.appendChild(message);
        victoryScreen.appendChild(restartButton);
        document.head.appendChild(style);
        document.body.appendChild(victoryScreen);
        
        // Play victory sound if available
        const victorySound = new Audio();
        victorySound.src = "/images/gamify/victory.mp3"; // Add an actual path to your victory sound
        victorySound.volume = 0.5;
        victorySound.play().catch(err => console.log("Audio couldn't play: ", err));
    }

    /**
     * Handle keyup events to stop player actions.
     * @param {Object} event - The keyup event.
     */
    handleKeyUp({ key }) {
        if (key === 'e' || key === 'u') {
            // Clear any active timeouts when the interaction key is released
            if (this.alertTimeout) {
                clearTimeout(this.alertTimeout);
                this.alertTimeout = null;
            }
        }
    }

    hasCollided(expectedGreeting) {
        for (let id of this.state.collisionEvents) {
            // Find the object that this item collided with
            const collidedObj = GameEnv.gameObjects.find(obj => obj.canvas?.id === id);
            
            // Check if the collided object has the expected greeting
            if (collidedObj && 
                ((collidedObj.spriteData && collidedObj.spriteData.greeting === expectedGreeting) || 
                (typeof collidedObj.getGreeting === 'function' && 
                collidedObj.getGreeting() === expectedGreeting))) {
                return true;
            }
        }
        return false;
    }

    // Handle collision events
    handleCollisionEvent() {
        const objectID = this.collisionData.touchPoints.other.id;
        
        // Only handle each collision once
        if (!this.state.collisionEvents.includes(objectID)) {
            this.state.collisionEvents.push(objectID);
            
            // Find the collided object (likely the player)
            const collidedObj = GameEnv.gameObjects.find(obj => obj.canvas?.id === objectID);
            
            // If it's a player collision, show a hint
            if (collidedObj && (collidedObj.canvas.id === "player" || collidedObj.canvas.id === "player2")) {
                // Show hint text or highlight effect to indicate interaction possibility
                this.showHint();
            }
        }
    }
    
    /**
     * Shows a hint to the player that this slot can be interacted with
     */
    showHint() {
        // Only show hint if slot isn't filled yet
        if (!this.state.isFilled) {
            // Show hint about pressing 'e' to place key
            // You could add a visual indicator or floating text here
            console.log("Press Q to place a key in the slot");
            
            // Example: Create a temporary hint text
            if (!this.hintElement) {
                this.hintElement = document.createElement('div');
                this.hintElement.innerText = 'Press Q to place key';
                this.hintElement.style.position = 'absolute';
                this.hintElement.style.left = `${this.position.x}px`;
                this.hintElement.style.top = `${GameEnv.top + this.position.y - 30}px`;
                this.hintElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                this.hintElement.style.color = 'white';
                this.hintElement.style.padding = '5px';
                this.hintElement.style.borderRadius = '5px';
                this.hintElement.style.fontSize = '12px';
                this.hintElement.style.zIndex = '1000';
                document.getElementById("gameContainer").appendChild(this.hintElement);
                
                // Remove hint after a few seconds
                setTimeout(() => {
                    if (this.hintElement && this.hintElement.parentNode) {
                        this.hintElement.parentNode.removeChild(this.hintElement);
                        this.hintElement = null;
                    }
                }, 3000);
            }
        }
    }

    /**
     * Resizes the object based on the game environment.
     */
    resize() {
        // Calculate the new scale resulting from the window resize
        const newScale = { width: GameEnv.innerWidth, height: GameEnv.innerHeight };

        // Adjust the object's position proportionally
        this.position.x = (this.position.x / this.scale.width) * newScale.width;
        this.position.y = (this.position.y / this.scale.height) * newScale.height;

        // Update the object's scale to the new scale
        this.scale = newScale;

        // Recalculate the object's size based on the new scale
        this.size = this.scale.height / this.scaleFactor; 

        // Recalculate the object's velocity steps based on the new scale
        this.xVelocity = this.scale.width / this.stepFactor;
        this.yVelocity = this.scale.height / this.stepFactor;

        // Set the object's width and height to the new size (object is a square)
        this.width = this.size;
        this.height = this.size;
    }
    
    /* Destroy Game Object
     * remove canvas element of object
     * remove object from GameEnv.gameObjects array
     */
    destroy() {
        const index = GameEnv.gameObjects.indexOf(this);
        if (index !== -1) {
            // Remove hint element if it exists
            if (this.hintElement && this.hintElement.parentNode) {
                this.hintElement.parentNode.removeChild(this.hintElement);
            }
            
            // Remove the canvas from the DOM
            this.canvas.parentNode.removeChild(this.canvas);
            GameEnv.gameObjects.splice(index, 1);
        }
    }
}

export default KeySlot;
import GameEnv from './GameEnv.js';
import GameLevelWater from './GameLevelWater.js';
import GameLevelPrison from './GameLevelPrison.js';
import GameLevelishan from './GameLevelishan.js';
import GameLevelForest from './GameLevelForest.js';
import { getStats } from "./StatsManager.js";
import { addItemToInventory } from "./Inventory.js";
import { removeItemFromInventory } from './Inventory.js';


class Data {
    constructor() {
        this.playerItem = 0; // Track number of items
        this.inventory = []; // Track specific items
    }

    getPlayerItem() {
        return this.playerItem;
    }
    
    setPlayerItem() {
        this.playerItem++;
        this.inventory.push("key"); // Add key to inventory
        console.log("Player now has " + this.playerItem + " keys");
    }
    
    removePlayerItem(itemType) {
        if (this.playerItem > 0) {
            this.playerItem--;
            
            // Remove specific item type if specified
            if (itemType && this.inventory.includes(itemType)) {
                const index = this.inventory.indexOf(itemType);
                if (index !== -1) {
                    this.inventory.splice(index, 1);
                }
            } else {
                // Remove the last item if no specific type
                this.inventory.pop();
            }
            
            console.log("Item removed. Player now has " + this.playerItem + " items");
            return true;
        }
        return false;
    }
    
    addKey() {
        this.playerItem++;
        this.inventory.push("key");
        console.log("Key added. Player now has " + this.playerItem + " items");
    }
    
    hasItem(itemType) {
        return this.inventory.includes(itemType);
    }
    
    getInventory() {
        return this.inventory;
    }
}

export default Data;

