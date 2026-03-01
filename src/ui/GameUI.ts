import { Scene, GameObjects } from 'phaser';

/**
 * Manages all UI elements in the game
 */
export class GameUI {
    private gravityTimeText: GameObjects.Text;
    private velocityText: GameObjects.Text;
    private collisionText: GameObjects.Text;
    private fpsText: GameObjects.Text;

    constructor(scene: Scene) {
        // Create gravity timer text (top right)
        this.gravityTimeText = scene.add.text(750, 20, 'Gravity: 0.0s', {
            fontSize: '24px',
            color: '#ffffff'
        });
        this.gravityTimeText.setOrigin(1, 0);

        // Create velocity text (below gravity timer)
        this.velocityText = scene.add.text(750, 50, 'Velocity: 0', {
            fontSize: '24px',
            color: '#ffffff'
        });
        this.velocityText.setOrigin(1, 0);

        // Create collision counter (below velocity)
        this.collisionText = scene.add.text(750, 80, 'Collisions: 0', {
            fontSize: '24px',
            color: '#ffffff'
        });
        this.collisionText.setOrigin(1, 0);

        // Create FPS counter (top left)
        this.fpsText = scene.add.text(20, 20, 'FPS: 0', {
            fontSize: '24px',
            color: '#ffffff'
        });
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
