import { Scene, GameObjects } from 'phaser';
import { PHYSICS, WORLD } from '../config/physics';
import { Asteroid, Vector2D } from '../types/GameObject';
import { applyShipAsteroidGravity, applyAsteroidAsteroidGravity } from '../physics/gravity';
import {
    checkShipWallCollisions,
    checkAsteroidWallCollisions,
    checkShipAsteroidCollisions,
    checkAsteroidAsteroidCollisions,
    capVelocity
} from '../physics/collisions';
import { SpaceshipRenderer } from '../rendering/Spaceship';
import { GameUI } from '../ui/GameUI';

export class GravityGameScene extends Scene {
    // Player
    private spaceshipRenderer!: SpaceshipRenderer;
    private shipVelocity: Vector2D = { x: 0, y: 0 };
    private shipPosition: Vector2D = { x: 400, y: 300 };
    private shipMass: number = PHYSICS.SHIP_MASS;
    private shipRadius: number = PHYSICS.SHIP_RADIUS;

    // Game objects
    private asteroids: Asteroid[] = [];
    private wallGraphics!: GameObjects.Graphics;

    // UI
    private ui!: GameUI;

    // Physics state
    private gravityEnabled: boolean = false;
    private gravityTimer: number = 0;

    // Input
    private spaceKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'GravityGameScene' });
    }

    create() {
        this.createWalls();
        this.createSpaceship();
        this.createAsteroids();
        this.createUI();
        this.setupInput();
    }

    private createWalls(): void {
        this.wallGraphics = this.add.graphics();
        this.wallGraphics.lineStyle(4, 0xADD8E6);
        this.wallGraphics.strokeRect(2, 2, WORLD.WIDTH - 4, WORLD.HEIGHT - 4);
    }

    private createSpaceship(): void {
        const graphics = this.add.graphics();
        this.spaceshipRenderer = new SpaceshipRenderer(graphics);
    }

    private createAsteroids(): void {
        const minSpacing = 100; // Minimum distance between asteroids and ship

        for (let i = 0; i < PHYSICS.ASTEROID_COUNT; i++) {
            let x = 0;
            let y = 0;
            let validPosition = false;

            // Find a valid position with minimum spacing
            while (!validPosition) {
                x = Phaser.Math.Between(50, WORLD.WIDTH - 50);
                y = Phaser.Math.Between(50, WORLD.HEIGHT - 50);

                validPosition = true;

                // Check distance from ship
                const distToShip = Math.sqrt(
                    (x - this.shipPosition.x) ** 2 +
                    (y - this.shipPosition.y) ** 2
                );
                if (distToShip < minSpacing) {
                    validPosition = false;
                    continue;
                }

                // Check distance from other asteroids
                for (const asteroid of this.asteroids) {
                    const distToAsteroid = Math.sqrt(
                        (x - asteroid.gameObject.x) ** 2 +
                        (y - asteroid.gameObject.y) ** 2
                    );
                    if (distToAsteroid < minSpacing) {
                        validPosition = false;
                        break;
                    }
                }
            }

            // Random size
            const sizeData = Phaser.Math.RND.pick(PHYSICS.ASTEROID_SIZES);

            // Create asteroid
            const asteroid = this.add.circle(x, y, sizeData.radius, 0xFFFF00);

            // Random initial velocity
            const speed = Phaser.Math.FloatBetween(20, 60);
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

            this.asteroids.push({
                gameObject: asteroid,
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                mass: sizeData.mass,
                radius: sizeData.radius
            });
        }
    }

    private createUI(): void {
        this.ui = new GameUI(this);
    }

    private setupInput(): void {
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update(time: number, delta: number) {
        const dt = delta / 1000; // Convert to seconds

        this.updateUI(delta);
        this.updateInput();
        this.updatePhysics(dt);
        this.updateVisuals();
    }

    private updateUI(delta: number): void {
        const fps = Math.round(1000 / delta);
        this.ui.updateFPS(fps);

        const speed = Math.sqrt(this.shipVelocity.x ** 2 + this.shipVelocity.y ** 2);
        this.ui.updateVelocity(speed);

        if (this.gravityEnabled) {
            this.ui.updateGravityTimer(this.gravityTimer);
        }
    }

    private updateInput(): void {
        this.gravityEnabled = this.spaceKey.isDown;
    }

    private updatePhysics(dt: number): void {
        // Update gravity timer
        if (this.gravityEnabled) {
            this.gravityTimer += dt;
        }

        // Apply gravitational forces if enabled
        if (this.gravityEnabled) {
            applyShipAsteroidGravity(
                this.shipPosition,
                this.shipVelocity,
                this.shipMass,
                this.asteroids,
                dt
            );
            applyAsteroidAsteroidGravity(this.asteroids, dt);
        }

        // Integrate velocities into positions
        this.updatePositions(dt);

        // Check and resolve collisions
        checkShipWallCollisions(this.shipPosition, this.shipVelocity, this.shipRadius);
        checkAsteroidWallCollisions(this.asteroids);
        checkShipAsteroidCollisions(
            this.shipPosition,
            this.shipVelocity,
            this.shipMass,
            this.shipRadius,
            this.asteroids
        );
        checkAsteroidAsteroidCollisions(this.asteroids);
    }

    private updatePositions(dt: number): void {
        // Cap ship velocity for stability
        capVelocity(this.shipVelocity);

        // Update ship position
        this.shipPosition.x += this.shipVelocity.x * dt;
        this.shipPosition.y += this.shipVelocity.y * dt;

        // Update asteroid positions
        for (const asteroid of this.asteroids) {
            // Cap asteroid velocity
            capVelocity(asteroid.velocity);

            asteroid.gameObject.x += asteroid.velocity.x * dt;
            asteroid.gameObject.y += asteroid.velocity.y * dt;
        }
    }

    private updateVisuals(): void {
        // Update spaceship trail and render
        this.spaceshipRenderer.updateTrail(this.shipPosition);
        this.spaceshipRenderer.render(
            this.shipPosition,
            this.shipVelocity,
            this.shipRadius,
            this.gravityEnabled
        );
    }
}
