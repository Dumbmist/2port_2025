import GameEnv from './GameEnv.js';
import Character from './Character.js';
import Prompt from './Prompt.js';

// Define non-mutable constants as defaults
const SCALE_FACTOR = 25; // 1/nth of the height of the canvas
const STEP_FACTOR = 100; // 1/nth, or N steps up and across the canvas
const ANIMATION_RATE = 1; // 1/nth of the frame rate
const INIT_POSITION = { x: 0, y: 0 };

/**
 * Player is a dynamic class that manages the data and events for objects like a player 
 * 
 * This class uses a classic Java class pattern which is nice for managing object data and events.
 * 
 * @method bindEventListeners - Binds key event listeners to handle object movement.
 * @method handleKeyDown - Handles key down events to change the object's velocity.
 * @method handleKeyUp - Handles key up events to stop the object's velocity.
 */

let levelData;
const playerSpeed = 4;

class Player extends Character {
    /**
     * The constructor method is called when a new Player object is created.
     * 
     * @param {Object|null} data - The sprite data for the object. If null, a default red square is used.
     */
    constructor(data = null) {
        super(data);
        this.keypress = data?.keypress || {up: 87, left: 65, down: 83, right: 68};
        this.isInteracting = false;
        this.activeKeys = new Set();
        this.bindEventListeners();
        levelData = data.level_data;
    }

    /**
     * Binds key event listeners to handle object movement.
     * 
     * This method binds keydown and keyup event listeners to handle object movement.
     * The .bind(this) method ensures that 'this' refers to the object object.
     */
    bindEventListeners() {
        addEventListener('keydown', this.handleKeyDown.bind(this));
        addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown({ keyCode }) {
        // Add key to active keys
        this.activeKeys.add(keyCode);

        // Don't process movement if interacting
        if (Prompt.isOpen) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            return;
        }

        // Process movement normally
        switch (keyCode) {
            case this.keypress.up:
                this.velocity.y = this.normalizeMovement(-1*playerSpeed);
                this.direction = 'up';
                break;
            case this.keypress.left:
                this.velocity.x = this.normalizeMovement(-1 * playerSpeed);
                this.direction = 'left';
                break;
            case this.keypress.down:
                this.velocity.y = this.normalizeMovement(playerSpeed);
                this.direction = 'down';
                break;
            case this.keypress.right:
                this.velocity.x = this.normalizeMovement(playerSpeed);
                this.direction = 'right';
                break;
        }
    }

    handleKeyUp({ keyCode }) {
        // Remove key from active keys
        this.activeKeys.delete(keyCode);

        // Don't process movement if interacting
        if (Prompt.isOpen) {
            return;
        }

        // Only stop movement for the released key
        switch (keyCode) {
            case this.keypress.up:
                if (this.velocity.y < 0) this.velocity.y = 0;
                break;
            case this.keypress.left:
                if (this.velocity.x < 0) this.velocity.x = 0;
                break;
            case this.keypress.down:
                if (this.velocity.y > 0) this.velocity.y = 0;
                break;
            case this.keypress.right:
                if (this.velocity.x > 0) this.velocity.x = 0;
                break;
        }
    }

    normalizeMovement(speed){
        if(Math.abs(this.velocity.x == playerSpeed) && Math.abs(this.velocity.y) == playerSpeed){
            speed = Math.sqrt((this.velocity.x*this.velocity.x) + (this.velocity.y*this.velocity.y)) * Math.sign(speed);
        }

        return speed;
    }

    update() {
        // Only force stop if prompt is open
        if (Prompt.isOpen) {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
        super.update();
    }
}

export default Player;