import { Scene, GameObjects } from 'phaser';
import { WORLD } from '../config/physics';

/**
 * Manages all UI elements in the game
 */
export class GameUI {
    private gravityTimeText: GameObjects.Text;
    private velocityText: GameObjects.Text;
    private collisionText: GameObjects.Text;
    private fpsText: GameObjects.Text;

    constructor(scene: Scene) {
        // Create gravity timer text (above game area, top right)
        this.gravityTimeText = scene.add.text(
            WORLD.WIDTH - 10,
            10,
            'Gravity: 0.0s',
            {
                fontSize: '18px',
                color: '#ffffff',
            }
        );
        this.gravityTimeText.setOrigin(1, 0);
        this.gravityTimeText.setScrollFactor(0); // Fixed to screen, not world

        // Create velocity text (above game area, middle)
        this.velocityText = scene.add.text(
            WORLD.WIDTH / 2 - 35,
            10,
            'Velocity: 0',
            {
                fontSize: '18px',
                color: '#ffffff',
            }
        );
        this.velocityText.setOrigin(0.5, 0);
        this.velocityText.setScrollFactor(0); // Fixed to screen, not world

        // Create collision counter (above game area, middle-right)
        this.collisionText = scene.add.text(
            WORLD.WIDTH / 2 - 30,
            30,
            'Collisions: 0',
            {
                fontSize: '18px',
                color: '#ffffff',
            }
        );
        this.collisionText.setOrigin(0.5, 0);
        this.collisionText.setScrollFactor(0); // Fixed to screen, not world

        // Create FPS counter (above game area, top left)
        this.fpsText = scene.add.text(10, 10, 'FPS: 0', {
            fontSize: '18px',
            color: '#ffffff',
        });
        this.fpsText.setScrollFactor(0); // Fixed to screen, not world
    }

    /**
     * Update the gravity timer display
     */
    updateGravityTimer(time: number): void {
        this.gravityTimeText.setText(`Gravity: ${time.toFixed(1)}s`);
    }

    /**
     * Update the velocity display
     */
    updateVelocity(speed: number): void {
        this.velocityText.setText(`Velocity: ${Math.round(speed)}`);
    }

    /**
     * Update the FPS counter
     */
    updateFPS(fps: number): void {
        this.fpsText.setText(`FPS: ${fps}`);
    }

    /**
     * Update the collision counter
     */
    updateCollisions(count: number): void {
        this.collisionText.setText(`Collisions: ${count}`);
    }
}
