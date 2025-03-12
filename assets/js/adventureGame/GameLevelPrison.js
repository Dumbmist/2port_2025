import GameEnv from './GameEnv.js';
import Background from './Background.js';
import GameObject from './GameObject.js';
import Player from './Player.js';
import Item from './Item.js';
import Data from './Data.js';
import Npc from './Npc.js';
import KeySlot from './KeySlot.js';

class GameLevelPrison {
  constructor(path) {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    // Values dependent on GameEnv.create()
    let width = GameEnv.innerWidth;
    let height = GameEnv.innerHeight;

    const levelData = new Data();

    // Background data
    const image_src_dungeon = path + "/images/gamify/forest.png";
    const image_data_dungeon = {
        name: 'dungeon',
        greeting: "Welcome to the dungeon! Get 2 keys to escape.",
        src: image_src_dungeon,
        pixels: {height: 1134, width: 2088}
    };

    // Player data for Chillguy
    const sprite_src_player = path + "/images/gamify/Dora.png";
    const PLAYER_SCALE_FACTOR = 4;
    const sprite_data_player = {
        id: 'Player',
        greeting: "Hello, please help me escape this prison.",
        src: sprite_src_player,
        SCALE_FACTOR: PLAYER_SCALE_FACTOR,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 12,
        INIT_POSITION: { x: 0, y: height - (height/PLAYER_SCALE_FACTOR) }, 
        pixels: {height: 256, width: 192},
        orientation: {rows: 4, columns: 3 },
        down: {row: 0, start: 0, columns: 3 },
        left: {row: 3, start: 0, columns: 3 },
        right: {row: 2, start: 0, columns: 3 },
        up: {row: 1, start: 0, columns: 3 },
        hitbox: { widthPercentage: 0.4, heightPercentage: 0.5 },
        keypress: { up: 87, left: 65, down: 83, right: 68 }, // W, A, S, D
        level_data: levelData
    };

    // NPC data for Questgiver
    const sprite_src_questgiver = path + "/images/gamify/bots.png";
    const sprite_data_questgiver = {
      id: 'Questgiver',
      greeting: "I am boots! Find a key nearby and pick it up... Maybe go and ask that map thing over there! Quick before ratGPT comes for us!",
      getGreeting() {
          const itemsCollected = levelData.getPlayerItem();
          if (itemsCollected >= 2) {
              return "Thank you for finding both items! Now place them in the key slots to escape!";
          }
          return this.greeting;
      },
      src: sprite_src_questgiver,
      SCALE_FACTOR: 4,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 50,
      pixels: { height: 512, width: 2048 },
      INIT_POSITION: { x: (width / 3 ), y: (height / 10 ) },
      orientation: { rows: 1, columns: 4 },
      down: { row: 0, start: 0, columns: 3 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.6 },
      quest: {
        title: "New Adventure",
        description: "A tickler is near, please help!",
        reward: "30 gold"
      },
      level_data: levelData
    };
    
    // NPC data for Tux 
    const sprite_src_map = path + "/images/gamify/Map.png";
    const sprite_data_map = {
        id: 'Map',
        greeting: "Hi I am Map. Use the e key when next to a key to pick it up. Game designers these days - not telling you everything huh. Go back to boots after.",
        src: sprite_src_map,
        SCALE_FACTOR: 8,
        ANIMATION_RATE: 50,
        pixels: {height: 64, width: 256},
        INIT_POSITION: { x: (width / 2), y: (height / 2)},
        orientation: {rows: 1, columns: 4 },
        down: {row: 0, start: 0, columns: 3 },
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
        quiz: { 
          title: "Linux Command Quiz",
          questions: [
            "How many skibdi ohio asiasjdkjakhs?"
          ] 
        },
        level_data: levelData,
    };

    // data for item 1
    const spriteItem1 = path + "/images/gamify/koy.png";
    const scaleItem1 = 10;
    const spriteDataItem1 = {
        id: 'Item',
        greeting: "none",
        src: spriteItem1,
        SCALE_FACTOR: scaleItem1,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 50,
        INIT_POSITION: { x: 200, y: height - (height/scaleItem1) - 100}, 
        pixels: {height: 64, width: 64},
        orientation: {rows: 1, columns: 1 },
        down: {row: 0, start: 0, columns: 1 },
        left: {row: 1, start: 0, columns: 1 },
        right: {row: 1, start: 0, columns: 1 },
        up: {row: 1, start: 0, columns: 1 },
        hitbox: { widthPercentage: 0.4, heightPercentage: 0.4 },
        level_data: levelData,
    };

    // data for item 2
    const spriteItem2 = path + "/images/gamify/koy.png";
    const scaleItem2 = 10;
    const spriteDataItem2 = {
        id: 'Item',
        greeting: "none",
        src: spriteItem2,
        SCALE_FACTOR: scaleItem2,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 50,
        INIT_POSITION: { x: 400, y: height - (height/scaleItem2) - 300}, 
        pixels: {height: 64, width: 64},
        orientation: {rows: 1, columns: 1 },
        down: {row: 0, start: 0, columns: 1 },
        left: {row: 1, start: 0, columns: 1 },
        right: {row: 1, start: 0, columns: 1 },
        up: {row: 1, start: 0, columns: 1 },
        hitbox: { widthPercentage: 0.2, heightPercentage: 0.2 },
        level_data: levelData
    };

    const spriteItem3 = path + "/images/gamify/koy.png";
    const scaleItem3 = 10;
    const spriteDataItem3 = {
        id: 'Item',
        greeting: "none",
        src: spriteItem3,
        SCALE_FACTOR: scaleItem3,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 50,
        INIT_POSITION: { x: 700, y: height - (height/scaleItem3) - 100
        }, 
        pixels: {height: 64, width: 64},
        orientation: {rows: 1, columns: 1 },
        down: {row: 0, start: 0, columns: 1 },
        left: {row: 1, start: 0, columns: 1 },
        right: {row: 1, start: 0, columns: 1 },
        up: {row: 1, start: 0, columns: 1 },
        hitbox: { widthPercentage: 0.2, heightPercentage: 0.2 },
        level_data: levelData
    };

    const spriteItem4 = path + "/images/gamify/koy.png";
    const scaleItem4 = 10;
    const spriteDataItem4 = {
        id: 'Item',
        greeting: "none",
        src: spriteItem4,
        SCALE_FACTOR: scaleItem4,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 50,
        INIT_POSITION: { x: 1000, y: height - (height/scaleItem3) - 400
        }, 
        pixels: {height: 64, width: 64},
        orientation: {rows: 1, columns: 1 },
        down: {row: 0, start: 0, columns: 1 },
        left: {row: 1, start: 0, columns: 1 },
        right: {row: 1, start: 0, columns: 1 },
        up: {row: 1, start: 0, columns: 1 },
        hitbox: { widthPercentage: 0.2, heightPercentage: 0.2 },
        level_data: levelData
    };

    

 
    const sprite_src_keyslot1 = path + "/images/gamify/keyslot.png";
    const sprite_data_keyslot1 = {
        id: 'Keyslot',
        greeting: "You have encountered a keyslot, a random key on your keyboard provides the key slot with the key and removes it from your inventory. MAYBE BOOTS KNOWS - THE MONKEY.",
        src: sprite_src_keyslot1,
        SCALE_FACTOR: 6,
        ANIMATION_RATE: 50,
        pixels: {height: 64, width: 256},
        INIT_POSITION: { x: (width / 3 * 2), y: (height / 3 * 2)},
        orientation: {rows: 1, columns: 4 },
        down: {row: 0, start: 0, columns: 3 },
        hitbox: { widthPercentage: 0.2, heightPercentage: 0.5 },
        level_data: levelData,
    };
    
    const sprite_src_keyslot2 = path + "/images/gamify/keyslot.png";
    const sprite_data_keyslot2 = {
        id: 'Keyslot',
        greeting: "You have encountered a keyslot, a random key on your keyboard provides the key slot with the key and removes it from your inventory.",
        src: sprite_src_keyslot2,
        SCALE_FACTOR: 6,
        ANIMATION_RATE: 50,
        pixels: {height: 64, width: 256},
        INIT_POSITION: { x: (width / 15 * 12), y: (height / 12 * 2)},
        orientation: {rows: 1, columns: 4 },
        down: {row: 0, start: 0, columns: 3 },
        hitbox: { widthPercentage: 0.2, heightPercentage: 0.5 },
        level_data: levelData,
    };
    

    this.objects = [
      { class: Background, data: image_data_dungeon },
      { class: Player, data: sprite_data_player },  
      { class: Item, data: spriteDataItem1 },
      { class: Item, data: spriteDataItem2 },
      { class: Item, data: spriteDataItem3 },
      {class: Item, data: spriteDataItem4},
      { class: Npc, data: sprite_data_questgiver },
      { class: Npc, data: sprite_data_map },
      { class: KeySlot, data: sprite_data_keyslot1 },
      { class: KeySlot, data: sprite_data_keyslot2 }
    ];
    
  }
}

export default GameLevelPrison;