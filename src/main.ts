import { Game } from 'phaser';
import { GravityGameScene } from './scenes/GravityGameScene';
import { WORLD } from './config/physics';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: WORLD.WIDTH,
    height: WORLD.HEIGHT + 50, // Extra space for UI above game area
    parent: document.body,
    backgroundColor: '#000000',
    scene: GravityGameScene,
};

// Start the game
new Game(config);
