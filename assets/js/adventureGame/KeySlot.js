import GameObject from './GameObject.js';
import GameEnv from './GameEnv.js';

class KeySlot extends GameObject {
    constructor(data = null) {
        // Extract only the properties that GameObject needs
        const gameObjectData = {
          id: data?.id || `KeySlot_${data?.slotIndex || 0}`,
          x: data?.x || 50,
          y: data?.y || 50,
          width: data?.width || 50,
          height: data?.height || 50,
          // Add any other properties that GameObject expects
          spriteSheet: data?.spriteSheet,
          canvas: data?.canvas,
          ctx: data?.ctx
        };
        
        // Pass the extracted data to super()
        super(gameObjectData);
        
        // Initialize KeySlot-specific properties
        this.slotIndex = data?.slotIndex || 0;
        this.filled = false;
        this.requiredKeys = data?.required_keys || 2;
        this.level_data = data?.level_data;
        
        // Track the number of filled slots across all instances
        if (!KeySlot.filledSlots) {
          KeySlot.filledSlots = 0;
        }
        
        // Add debugging info
        console.log(`KeySlot ${this.slotIndex} created at position (${this.x}, ${this.y}) with dimensions ${this.width}x${this.height}`);
      }

  // Override update method
  update() {
    super.update();
    this.playerInteraction();
    
    // Debug visualization
    if (GameEnv.debug && this.canvas && this.ctx) {
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this.x, this.y, this.width, this.height);
      
      // Add a colored center point to make sure the slot is visible
      this.ctx.fillStyle = 'red';
      this.ctx.beginPath();
      this.ctx.arc(this.x + this.width/2, this.y + this.height/2, 5, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  playerInteraction() {
    // Get the player from GameEnv
    const player = GameEnv.players.find(player => player.id === 'Player');
    if (!player) {
      console.log("Player not found in GameEnv.players");
      return;
    }

    // Check if player is near this key slot
    if (this.isPlayerNearby(player)) {
      console.log(`Player is near KeySlot ${this.slotIndex}`);
      
      if (!this.filled) {
        // Check if player has collected keys
        const itemsCollected = this.level_data.getPlayerItem();
        
        // Show prompt to place key if player has keys
        if (itemsCollected > 0) {
          GameEnv.setMessage("Press E to place a key");
          
          // Check if E key is pressed to place a key
          if (GameEnv.key_press["KeyE"]) {
            console.log("E key pressed near slot - attempting to fill");
            this.fillSlot(player);
            // Clear the key press to prevent multiple activations
            GameEnv.key_press["KeyE"] = false;
          }
        }
      }
    }
  }

  isPlayerNearby(player) {
    // Calculate centers for more accurate distance
    const slotCenterX = this.x + (this.width / 2);
    const slotCenterY = this.y + (this.height / 2);
    const playerCenterX = player.x + (player.width / 2);
    const playerCenterY = player.y + (player.height / 2);
    
    // Calculate distance between centers
    const dx = Math.abs(slotCenterX - playerCenterX);
    const dy = Math.abs(slotCenterY - playerCenterY);
    const range = 100; // Interaction range
    
    // Debug log distances when player is somewhat close
    if (dx < 200 && dy < 200) {
      console.log(`Distance to KeySlot ${this.slotIndex}: (${dx.toFixed(2)}, ${dy.toFixed(2)})`);
    }
    
    return dx < range && dy < range;
  }

  fillSlot(player) {
    if (this.filled) return;
    
    // Reduce player's key count
    const currentItems = this.level_data.getPlayerItem();
    console.log(`Filling slot ${this.slotIndex}. Current items: ${currentItems}`);
    
    this.level_data.setPlayerItem(currentItems - 1);
    
    // Mark this slot as filled
    this.filled = true;
    KeySlot.filledSlots++;
    
    console.log(`KeySlot ${this.slotIndex} filled. Total filled: ${KeySlot.filledSlots}/${this.requiredKeys}`);
    
    // Check if all slots are filled
    if (KeySlot.filledSlots >= this.requiredKeys) {
      this.completeGame();
    } else {
      GameEnv.setMessage(`Key placed! (${KeySlot.filledSlots}/${this.requiredKeys})`);
    }
  }

  // Override the draw method to show filled state
  draw() {
    // First draw the sprite using parent's draw method
    super.draw();
    
    // Then add visual indicator when the slot is filled
    if (this.filled && this.ctx) {
      this.ctx.fillStyle = 'rgba(255, 215, 0, 0.5)'; // Semi-transparent gold
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    // Always add a subtle highlight to make the slot more visible
    if (this.ctx) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }

  completeGame() {
    // Show victory message
    GameEnv.setMessage("Congratulations! You've escaped the prison!");
    
    // Create a victory overlay
    const victoryScreen = document.createElement('div');
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
    victoryScreen.style.zIndex = '1000';
    victoryScreen.style.color = 'white';
    victoryScreen.style.textAlign = 'center';
    
    victoryScreen.innerHTML = `
      <h1 style="font-size: 3rem; margin-bottom: 1rem; color: gold;">You've Escaped!</h1>
      <p style="font-size: 1.5rem; margin-bottom: 2rem;">Congratulations on finding the keys and unlocking the door!</p>
      <button id="restart-btn" style="background-color: #4CAF50; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 8px;">Play Again</button>
    `;
    
    document.body.appendChild(victoryScreen);
    
    // Add restart button functionality
    document.getElementById('restart-btn').addEventListener('click', () => {
      location.reload(); // Simple reload to restart the game
    });
    
    // Stop the game loop if available
    if (typeof GameEnv.stopGame === 'function') {
      GameEnv.stopGame();
    }
  }

  // Reset all slots (static method)
  static resetSlots() {
    KeySlot.filledSlots = 0;
  }
}

export default KeySlot;