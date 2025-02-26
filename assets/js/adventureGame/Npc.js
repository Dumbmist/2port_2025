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
        this.bindInteractKeyListeners();

        levelData = data.level_data;
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
     * Bind key event listeners for proximity interaction.
     */
    bindInteractKeyListeners() {
        addEventListener('keydown', this.handleKeyDown.bind(this));
        addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    /**
     * Handle keydown events for interaction.
     * @param {Object} event - The keydown event.
     */
    handleKeyDown({ key }) {
        switch (key) {
            case 'e': // Player 1 interaction
            case 'u': // Player 2 interaction
                this.handleKeyInteract();
                break;
        }
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
            
            if (player) {
                // Force stop player movement
                player.velocity.x = 0;
                player.velocity.y = 0;
                player.isInteracting = true;
            }

            if(levelData.getPlayerItem() == 2){
                levelData.removePlayerItem("spoon");
                levelData.removePlayerItem("spoon");
                levelData.addKey();
                console.log("key");
            }
        }
    }

}
export default Npc;