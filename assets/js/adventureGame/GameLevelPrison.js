// To build GameLevels, each contains GameObjects from below imports
import GameEnv from './GameEnv.js';
import Background from './Background.js';
import GameObject from './GameObject.js';
import Player from './Player.js';
import Item from './Item.js';
import Data from './Data.js';
import Npc from './Npc.js';

class GameLevelPrison {
  constructor(path) {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    // Values dependent on GameEnv.create()
    let width = GameEnv.innerWidth;
    let height = GameEnv.innerHeight;

    const levelData = new Data();


    // Background data
    const image_src_dungeon = path + "/images/gamify/rpgBackground.png"; // be sure to include the path
    const image_data_dungeon = {
        name: 'dungeon',
        greeting: "Welcome to the dungeon! Get 2 keys to escape.",
        src: image_src_dungeon,
        pixels: {height: 1135, width: 2490}
    };


    // Player data for Chillguy
    const sprite_src_player = path + "/images/gamify/playerSprites.png"; // be sure to include the path
    const PLAYER_SCALE_FACTOR = 12;
    const sprite_data_player = {
        id: 'Player',
        greeting: "Hello, please help me escape this prison.",
        src: sprite_src_player,
        SCALE_FACTOR: PLAYER_SCALE_FACTOR,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 12,
        INIT_POSITION: { x: 0, y: height - (height/PLAYER_SCALE_FACTOR) }, 
        pixels: {height: 512, width: 512},
        orientation: {rows: 4, columns: 4 },
        down: {row: 0, start: 0, columns: 4 },
        left: {row: 2, start: 0, columns: 4 },
        right: {row: 1, start: 0, columns: 4 },
        up: {row: 3, start: 0, columns: 4 },
        hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
        keypress: { up: 87, left: 65, down: 83, right: 68 }, // W, A, S, D
        level_data: levelData
    };

    // NPC data  
    
     // NPC data for Questgiver
     const sprite_src_questgiver = path + "/images/gamify/questGiverNPC.png";
     const sprite_data_questgiver = {
       id: 'Questgiver',
       // Store the base greeting as a regular property
       greeting: "Please help me, I am stuck here and starving. There may be a key nearby...",
       // Use a method instead of a getter
       getGreeting() {
           const itemsCollected = levelData.getPlayerItem();
           if (itemsCollected >= 2) {
               return "Thank you for finding both items! You are now free to leave.";
           }
           return this.baseGreeting;
       },
       src: sprite_src_questgiver,
       SCALE_FACTOR: 10,
       STEP_FACTOR: 1000,
       ANIMATION_RATE: 50,
       pixels: { height: 128, width: 128 },
       INIT_POSITION: { x: (width/3 ), y: (height/3 ) },
       orientation: { rows: 1, columns: 1 },
       down: { row: 0, start: 0, columns: 1 },
       hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
       quest: {
         title: "New Adventure",
         description: "A tickler is near, please help!",
         reward: "30 gold"
       },
       level_data: levelData
     };
      

    
    // NPC data for Tux 
    const sprite_src_tux = path + "/images/gamify/tux.png"; // be sure to include the path
    const sprite_data_tux = {
        id: 'Tux',
        greeting: "Hi I am Tux, the Linux mascot.  I am very happy to spend some linux shell time with you!",
        src: sprite_src_tux,
        SCALE_FACTOR: 8,  // Adjust this based on your scaling needs
        ANIMATION_RATE: 50,
        pixels: {height: 256, width: 352},
        INIT_POSITION: { x: (width / 2), y: (height / 2)},
        orientation: {rows: 8, columns: 11 },
        down: {row: 5, start: 0, columns: 3 },  // This is the stationary npc, down is default 
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
        // Linux command quiz
        quiz: { 
          title: "Linux Command Quiz",
          questions: [
            "How many skibdi ohio asiasjdkjakhs?"
          ] 
        },
        level_data: levelData,
      };
    // data for item
    const spriteItem1 = path + "/images/gamify/spoon.png"; // be sure to include the path
    const scaleItem1 = 20;
    const spriteDataItem1 = {
        id: 'Item',
        greeting: "none",
        src: spriteItem1,
        SCALE_FACTOR: scaleItem1,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 50,
        INIT_POSITION: { x: 200, y: height - (height/scaleItem1) - 100}, 
        pixels: {height: 32, width: 32},
        orientation: {rows: 1, columns: 1 },
        down: {row: 0, start: 0, columns: 1 },
        left: {row: 1, start: 0, columns: 1 },
        right: {row: 1, start: 0, columns: 1 },
        up: {row: 1, start: 0, columns: 1 },
        hitbox: { widthPercentage: 0.2, heightPercentage: 0.2 },
        level_data: levelData,
        
    };


    // data for item
    const spriteItem2 = path + "/images/gamify/spoon.png"; // be sure to include the path
    const scaleItem2 = 20;
    const spriteDataItem2 = {
        id: 'Item',
        greeting: "none",
        src: spriteItem2,
        SCALE_FACTOR: scaleItem2,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 50,
        INIT_POSITION: { x: 400, y: height - (height/scaleItem2) - 300}, 
        pixels: {height: 32, width: 32},
        orientation: {rows: 1, columns: 1 },
        down: {row: 0, start: 0, columns: 1 },
        left: {row: 1, start: 0, columns: 1 },
        right: {row: 1, start: 0, columns: 1 },
        up: {row: 1, start: 0, columns: 1 },
        hitbox: { widthPercentage: 0.2, heightPercentage: 0.2 },
        level_data: levelData
    };


    // List of objects defnitions for this level
    this.objects = [
      { class: Background, data: image_data_dungeon },
      { class: Player, data: sprite_data_player },  
      { class: Item, data: spriteDataItem1 },
      { class: Item, data: spriteDataItem2},
      { class: Npc, data: sprite_data_questgiver },
      
      { class: Npc, data: sprite_data_tux }
    ];
  }

}

export default GameLevelPrison;