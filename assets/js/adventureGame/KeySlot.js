// To build GameLevels, each contains GameObjects from below imports
import GameEnv from './GameEnv.js';
import Background from './Background.js';
import GameObject from './GameObject.js';
import Player from './Player.js';
import Character from './Character.js';
import { removeItemFromInventory } from './inventory.js';

// Define non-mutable constants as defaults
const SCALE_FACTOR = 25; // 1/nth of the height of the canvas
const STEP_FACTOR = 100; // 1/nth, or N steps up and across the canvas
const ANIMATION_RATE = 1; // 1/nth of the frame rate
const INIT_POSITION = { x: 0, y: 0 };


/**
 * Item is a dynamic class that manages the data and events for objects like player and NPCs.
 * 
 * The focus of this class is to handle the object's state, rendering, and key events.
 * 
 * This class uses a classic Java class pattern which is nice for managing object data and events.
 * 
 * The classic Java class pattern provides a structured way to define the properties and methods
 * associated with the object. This approach helps encapsulate the object's state and behavior,
 * making the code more modular and easier to maintain. By using this pattern, we can create
 * multiple instances of the Player class, each with its own state and behavior.
 * 
 * @property {Object} position - The current position of the object.
 * @property {Object} velocity - The current velocity of the object.
 * @property {Object} scale - The scale of the object based on the game environment.
 * @property {number} size - The size of the object.
 * @property {number} width - The width of the object.
 * @property {number} height - The height of the object.
 * @property {number} xVelocity - The velocity of the object along the x-axis.
 * @property {number} yVelocity - The velocity of the object along the y-axis.
 * @property {Image} spriteSheet - The sprite sheet image for the object.
 * @property {number} frameIndex - The current frame index for animation.
 * @property {number} frameCount - The total number of frames for each direction.
 * @property {Object} spriteData - The data for the sprite sheet.
 * @property {number} frameCounter - Counter to control the animation rate.
 * @method draw - Draws the object on the canvas.
 * @method update - Updates the object's position and ensures it stays within the canvas boundaries.
 * @method resize - Resizes the object based on the game environment.
 * @method destroy - Removes the object from the game environment.    
 */

let levelData; 

class KeySlot extends GameObject {
    
    constructor(data = null) {
        super();
        
        this.state = {
            ...this.state,
            keysInserted: 0,
            collisionEvents: []
        };
        
        this.canvas = document.createElement("canvas");
        this.canvas.id = data.id || "keySlot";
        this.canvas.width = data.pixels?.width || 0;
        this.canvas.height = data.pixels?.height || 0;
        this.ctx = this.canvas.getContext('2d');
        document.getElementById("gameContainer").appendChild(this.canvas);
        
        this.position = data.INIT_POSITION || { x: 0, y: 0 };
        this.spriteSheet = new Image();
        this.spriteSheet.src = data.src;
        
        this.isFilled = false;
        this.collisionData = { touchPoints: { other: { id: null } } };
        this.collidedPlayer = null;

        this.x = 0;
        this.y = 0;
        this.frame = 0;
        
        this.scale = { width: GameEnv.innerWidth, height: GameEnv.innerHeight };
        
        if (data && data.src) {
            this.scaleFactor = data.SCALE_FACTOR || SCALE_FACTOR;
            this.stepFactor = data.STEP_FACTOR || STEP_FACTOR;
            this.animationRate = data.ANIMATION_RATE || ANIMATION_RATE;
            this.position = data?.INIT_POSITION || INIT_POSITION;
    
            this.spriteSheet = new Image();
            this.spriteSheet.src = data.src;

            this.frameIndex = 0;
            this.frameCounter = 0;
            this.direction = 'down';
            this.spriteData = data;
        } else {
            throw new Error('Sprite data is required');
        }

        this.velocity = { x: 0, y: 0 };

        levelData = data.level_data;

        this.resize();

        GameEnv.gameObjects.push(this);

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));

        console.log("KeySlot initialized - id:", this.canvas.id, "position:", this.position);
    }

    /**
     * Adds a key to the keyslot from the player's inventory
     * @returns {boolean} - Whether the key was added successfully
     */
    addKey() {
        if (this.isFilled) {
            console.log("KeySlot already filled!");
            return false;
        }
        
        const inventoryItems = JSON.parse(localStorage.getItem("inventoryItems") || "[]");
        const hasKey = inventoryItems.includes("spoon");
        
        if (hasKey) {
            inventoryItems.splice(inventoryItems.indexOf("spoon"), 1);
            localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));
            removeItemFromInventory("spoon");
            this.isFilled = true;
            console.log("KeySlot filled!");
            return true;
        }
        
        console.log("No key in inventory!");
        return false;
    } 

    checkVictoryCondition() {
        if (GameEnv.victoryAchieved) return; // Stop checking if victory is already achieved
    
        const keyslots = GameEnv.gameObjects.filter(obj => obj instanceof KeySlot);
        const filledKeyslots = keyslots.filter(slot => slot.isFilled).length;
    
        console.log(`Filled keyslots: ${filledKeyslots}/${keyslots.length}`);
    
        if (filledKeyslots === keyslots.length && keyslots.length > 1) {
            GameEnv.victoryAchieved = true; // Mark victory as achieved
            GameEnv.paused = true; // Stop game logic
            this.showVictoryScreen();
        }
    }    
      
    showVictoryScreen() {
        const victoryScreen = document.createElement('div');
        Object.assign(victoryScreen.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000',
            fontSize: '3rem',
        });
    
        const victoryText = document.createElement('h1');
        victoryText.textContent = 'VICTORY!';
        victoryText.style.marginBottom = '2rem';
    
        const victoryDesc = document.createElement('p');
        victoryDesc.textContent = 'You have escaped the forest and saved ratGPT from the chest!'
    
        const restartButton = document.createElement('button');
        Object.assign(restartButton.style, {
            marginTop: '2rem',
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            cursor: 'pointer',
        });
        restartButton.textContent = 'Play Again';
        restartButton.onclick = () => location.reload();

        const PongButton = document.createElement('button');
        Object.assign(PongButton.style, {
            marginTop: '2rem',
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            cursor: 'pointer',
        });
        
        PongButton.textContent = 'Pong Game';
        PongButton.onclick = () => {
            window.location.href = 'pong.html';
            };
        
            const SnakeButton = document.createElement('button');
        Object.assign(SnakeButton.style, {
            marginTop: '2rem',
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            cursor: 'pointer',
        });

        SnakeButton.textContent = 'Snake Remix';
        SnakeButton.onclick = () => {
            window.location.href = 'pong.html';
            };

        victoryScreen.append(victoryText, victoryDesc, restartButton, PongButton, SnakeButton);
        document.body.appendChild(victoryScreen);
    
        clearTimeout(this.victoryScreenTimeout);
    };
    

    /**
     * Draws the object on the canvas.
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
    
            // Draw the current frame of the sprite sheet
            this.ctx.drawImage(
                this.spriteSheet,
                frameX, frameY, frameWidth, frameHeight, // Source rectangle
                0, 0, this.canvas.width, this.canvas.height // Destination rectangle
            );
    
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
     * Updates the object's position and ensures it stays within the canvas boundaries.
     */
    update() {
        // Update begins by drawing the object
        this.draw();
        
        // Check for collisions with players
        this.checkAllPlayerCollisions();
        
        if (GameEnv.victoryAchieved) return;

        this.checkVictoryCondition();
        
        // Visual indicator for collision if debugging
        if (GameEnv.debugging && this.collidedPlayer) {
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Check for collisions with all player objects in the game
     */
    checkAllPlayerCollisions() {
        // Get all players from game objects
        const players = GameEnv.gameObjects.filter(obj => 
            obj instanceof Player || 
            (obj.canvas && (obj.canvas.id === "player" || obj.canvas.id === "player2")));
        
        let collidingWithAnyPlayer = false;
        
        // Check collision with each player
        for (const player of players) {
            if (this.checkCollision(player)) {
                this.collidedPlayer = player;
                collidingWithAnyPlayer = true;
                break;
            }
        }
        
        // Clear collided player if not colliding with any player
        if (!collidingWithAnyPlayer) {
            this.collidedPlayer = null;
        }
    }

    /**
     * Handle keydown events for interaction.
     * @param {Object} event - The keydown event.
     */
    handleKeyDown(event) {
        // Debug keypress
        console.log(`Key pressed: ${event.key}`);
        
        if (event.key === 'q') {
            console.log("Q key pressed - checking for player collision");
            
            // Check if player is colliding with keyslot
            if (this.collidedPlayer) {
                console.log("Player is in range to use key");
                const success = this.addKey();
                
                if (!success && !this.isFilled) {
                    // Show a message to the player that they need a key
                    this.showMessage("You need a key to unlock this!");
                }
                
                return;
            } else {
                console.log("No player in range to interact with keyslot");
            }
        }
    }
    
    /**
     * Show a temporary message to the player
     * @param {string} message - The message to display
     */
    showMessage(message) {
        // Remove any existing message
        const existingMsg = document.getElementById("keyslot-message");
        if (existingMsg) {
            existingMsg.remove();
        }
        
        // Create a message element
        const msgElement = document.createElement("div");
        msgElement.id = "keyslot-message";
        msgElement.innerText = message;
        msgElement.style.position = "absolute";
        msgElement.style.top = `${this.position.y - 40}px`;
        msgElement.style.left = `${this.position.x}px`;
        msgElement.style.background = "rgba(0, 0, 0, 0.7)";
        msgElement.style.color = "white";
        msgElement.style.padding = "5px 10px";
        msgElement.style.borderRadius = "5px";
        msgElement.style.zIndex = "1000";
        document.body.appendChild(msgElement);
        
        // Remove the message after 2 seconds
        setTimeout(() => {
            const msg = document.getElementById("keyslot-message");
            if (msg) {
                msg.remove();
            }
        }, 2000);
    }

    /**
     * Handle keyup events
     * @param {Object} event - The keyup event.
     */
    handleKeyUp(event) {
        if (event.key === 'e' || event.key === 'u' || event.key === 'q') {
            // Clear any active timeouts when the interaction key is released
            if (this.alertTimeout) {
                clearTimeout(this.alertTimeout);
                this.alertTimeout = null;
            }
        }
    }
    
    /**
     * Check if an object is colliding with this keyslot
     * @param {Object} obj - The object to check collision with
     * @returns {boolean} - Whether a collision is occurring
     */
    checkCollision(obj) {
        // Make sure the object has a position and size
        if (!obj || !obj.position) {
            return false;
        }
        
        // Get width and height, with fallbacks
        const objWidth = obj.width || 30;
        const objHeight = obj.height || 30;
        
        // Simple AABB collision detection
        const collision = (
            obj.position.x < this.position.x + this.width &&
            obj.position.x + objWidth > this.position.x &&
            obj.position.y < this.position.y + this.height &&
            obj.position.y + objHeight > this.position.y
        );
        
        if (GameEnv.debugging && collision) {
            console.log(`Collision detected with ${obj.canvas?.id}`);
        }
        
        return collision;
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
    
    /**
     * Destroy Game Object
     * remove canvas element of object
     * remove object from GameEnv.gameObjects array
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        const index = GameEnv.gameObjects.indexOf(this);
        if (index !== -1) {
            // Remove the canvas from the DOM
            this.canvas.parentNode.removeChild(this.canvas);
            GameEnv.gameObjects.splice(index, 1);
        }
    }
}

export default KeySlot;