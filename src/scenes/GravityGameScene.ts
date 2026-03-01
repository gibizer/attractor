import { Scene, GameObjects } from 'phaser';
import { PHYSICS, WORLD, TARGET } from '../config/physics';
import { Asteroid, Vector2D } from '../types/GameObject';
import {
    applyShipAsteroidGravityBox2D,
    applyAsteroidAsteroidGravityBox2D,
} from '../physics/gravity-box2d';
import {
    CollisionListener,
    capVelocityBox2D,
} from '../physics/collisions-box2d';
import { SpaceshipRenderer } from '../rendering/Spaceship';
import { GameUI } from '../ui/GameUI';

// @ts-ignore - Box2D module doesn't have TypeScript declarations
import {
    CreateWorld,
    b2DefaultWorldDef,
    CreateCircle,
    CreateBoxPolygon,
    b2CreateSegmentShape,
    b2CreateBody,
    b2DefaultBodyDef,
    b2DefaultShapeDef,
    b2World_GetContactEvents,
    b2World_Step,
    b2Body_SetLinearVelocity,
    b2Body_GetPosition,
    b2Body_GetLinearVelocity,
    b2Shape_EnableContactEvents,
    b2Vec2,
    STATIC,
} from '../PhaserBox2D.js';

export class GravityGameScene extends Scene {
    // Player
    private spaceshipRenderer!: SpaceshipRenderer;
    private shipVelocity: Vector2D = { x: 0, y: 0 };
    private shipPosition: Vector2D = {
        x: WORLD.WIDTH / 2,
        y: WORLD.HEIGHT * 0.9,
    };
    private shipMass: number = PHYSICS.SHIP_MASS;
    private shipRadius: number = PHYSICS.SHIP_RADIUS;
    private shipBody!: any; // Box2D Body

    // Game objects
    private asteroids: Asteroid[] = [];
    private wallGraphics!: GameObjects.Graphics;
    private targetGraphics!: GameObjects.Graphics;
    private targetBody!: any; // Box2D Body

    // UI
    private ui!: GameUI;

    // Physics
    private box2dWorld!: any; // Box2D World
    private collisionListener!: CollisionListener;
    private gravityEnabled: boolean = false;
    private gravityTimer: number = 0;

    // Input
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private pointerDown: boolean = false;

    constructor() {
        super({ key: 'GravityGameScene' });
    }

    create() {
        // Create Box2D world
        const worldDef = b2DefaultWorldDef();
        worldDef.gravity = new b2Vec2(0, 0); // No uniform gravity (N-body only)
        this.box2dWorld = CreateWorld({ worldDef });

        // Setup collision listener
        this.collisionListener = new CollisionListener();

        this.createWalls();
        this.createTarget();
        this.createSpaceship();
        this.createAsteroids();
        this.createUI();
        this.setupInput();
    }

    private createWalls(): void {
        // Visual representation
        this.wallGraphics = this.add.graphics();
        this.wallGraphics.lineStyle(4, 0xadd8e6);
        this.wallGraphics.strokeRect(2, 2, WORLD.WIDTH - 4, WORLD.HEIGHT - 4);

        // Box2D edge boundaries - create static body
        const bodyDef = b2DefaultBodyDef();
        bodyDef.type = STATIC;
        const wallBody = b2CreateBody(this.box2dWorld.worldId, bodyDef);

        // Create edge shapes forming boundary
        const shapeDef = b2DefaultShapeDef();
        shapeDef.restitution = PHYSICS.DAMPING_WALL;

        const edges = [
            // Top wall
            { p1: new b2Vec2(0, 0), p2: new b2Vec2(WORLD.WIDTH, 0) },
            // Right wall
            {
                p1: new b2Vec2(WORLD.WIDTH, 0),
                p2: new b2Vec2(WORLD.WIDTH, WORLD.HEIGHT),
            },
            // Bottom wall
            {
                p1: new b2Vec2(WORLD.WIDTH, WORLD.HEIGHT),
                p2: new b2Vec2(0, WORLD.HEIGHT),
            },
            // Left wall
            { p1: new b2Vec2(0, WORLD.HEIGHT), p2: new b2Vec2(0, 0) },
        ];

        for (const edge of edges) {
            const segment = { point1: edge.p1, point2: edge.p2 };
            b2CreateSegmentShape(wallBody, shapeDef, segment);
        }
    }

    private createTarget(): void {
        // Visual representation (green filled rectangle)
        this.targetGraphics = this.add.graphics();
        this.targetGraphics.fillStyle(TARGET.COLOR, 1.0);
        this.targetGraphics.fillRect(
            TARGET.X - TARGET.WIDTH / 2, // Graphics uses top-left corner
            TARGET.Y - TARGET.HEIGHT / 2,
            TARGET.WIDTH,
            TARGET.HEIGHT
        );

        // Box2D static body (uses center position)
        this.targetBody = CreateBoxPolygon({
            worldId: this.box2dWorld.worldId,
            type: STATIC,
            position: new b2Vec2(TARGET.X, TARGET.Y),
            size: new b2Vec2(TARGET.WIDTH / 2, TARGET.HEIGHT / 2), // half-extents
            restitution: PHYSICS.DAMPING_WALL, // Same bounce as walls
        });

        // Enable contact events for collision detection
        b2Shape_EnableContactEvents(this.targetBody.shapeId, true);

        // Register target body with collision listener
        this.collisionListener.setTargetBody(this.targetBody.bodyId);
    }

    private createSpaceship(): void {
        const graphics = this.add.graphics();
        this.spaceshipRenderer = new SpaceshipRenderer(graphics);

        // Create Box2D body for ship
        this.shipBody = CreateCircle({
            worldId: this.box2dWorld.worldId,
            type: 2, // DYNAMIC
            position: new b2Vec2(this.shipPosition.x, this.shipPosition.y),
            radius: this.shipRadius,
            density:
                this.shipMass / (Math.PI * this.shipRadius * this.shipRadius),
            restitution: PHYSICS.DAMPING_OBJECT,
        });

        // Enable contact events for collision detection
        b2Shape_EnableContactEvents(this.shipBody.shapeId, true);

        // Register ship body ID with collision listener
        this.collisionListener.setShipBody(this.shipBody.bodyId);
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

            // Create visual representation
            const asteroidGraphics = this.add.circle(
                x,
                y,
                sizeData.radius,
                0xffff00
            );

            // Random initial velocity
            const speed = Phaser.Math.FloatBetween(20, 60);
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            // Create Box2D body
            const body = CreateCircle({
                worldId: this.box2dWorld.worldId,
                type: 2, // DYNAMIC
                position: new b2Vec2(x, y),
                radius: sizeData.radius,
                density:
                    sizeData.mass /
                    (Math.PI * sizeData.radius * sizeData.radius),
                restitution: PHYSICS.DAMPING_OBJECT,
            });

            // Set initial velocity
            b2Body_SetLinearVelocity(body.bodyId, new b2Vec2(vx, vy));

            // Enable contact events for collision detection
            b2Shape_EnableContactEvents(body.shapeId, true);

            const asteroid: Asteroid = {
                gameObject: asteroidGraphics,
                body: body,
                velocity: { x: vx, y: vy }, // Kept for UI display
                mass: sizeData.mass,
                radius: sizeData.radius,
            };

            this.asteroids.push(asteroid);

            // Register asteroid body ID with collision listener
            this.collisionListener.addAsteroidBody(body.bodyId);
        }
    }

    private createUI(): void {
        this.ui = new GameUI(this);
    }

    private setupInput(): void {
        this.spaceKey = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        // Add pointer/touch support for mobile
        this.input.on('pointerdown', () => {
            this.pointerDown = true;
        });

        this.input.on('pointerup', () => {
            this.pointerDown = false;
        });
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

        const speed = Math.sqrt(
            this.shipVelocity.x ** 2 + this.shipVelocity.y ** 2
        );
        this.ui.updateVelocity(speed);

        this.ui.updateCollisions(this.collisionListener.getCollisionCount());

        if (this.gravityEnabled) {
            this.ui.updateGravityTimer(this.gravityTimer);
        }
    }

    private updateInput(): void {
        this.gravityEnabled = this.spaceKey.isDown || this.pointerDown;
    }

    private updatePhysics(dt: number): void {
        // Update gravity timer
        if (this.gravityEnabled) {
            this.gravityTimer += dt;
        }

        // Apply gravitational forces if enabled (still manual N-body!)
        if (this.gravityEnabled) {
            applyShipAsteroidGravityBox2D(
                this.shipBody,
                this.shipMass,
                this.asteroids
            );
            applyAsteroidAsteroidGravityBox2D(this.asteroids);
        }

        // Cap velocities for stability
        capVelocityBox2D(this.shipBody);
        for (const asteroid of this.asteroids) {
            capVelocityBox2D(asteroid.body);
        }

        // Step the Box2D world
        b2World_Step(this.box2dWorld.worldId, dt, 4);

        // Process contact events for collision counting
        const contactEvents = b2World_GetContactEvents(
            this.box2dWorld.worldId
        );
        this.collisionListener.processContactEvents(contactEvents);

        // Check if ship hit target and restart if so
        if (this.collisionListener.checkShipTargetCollision()) {
            this.scene.restart();
            return; // Exit early, scene will be recreated
        }

        // Sync Box2D body positions to sprite positions
        this.syncSprites();
    }

    private syncSprites(): void {
        // Sync ship position and velocity from Box2D body
        const shipPos = b2Body_GetPosition(this.shipBody.bodyId);
        const shipVel = b2Body_GetLinearVelocity(this.shipBody.bodyId);

        this.shipPosition.x = shipPos.x;
        this.shipPosition.y = shipPos.y;
        this.shipVelocity.x = shipVel.x;
        this.shipVelocity.y = shipVel.y;

        // Sync asteroid positions and velocities from Box2D bodies
        for (const asteroid of this.asteroids) {
            const pos = b2Body_GetPosition(asteroid.body.bodyId);
            const vel = b2Body_GetLinearVelocity(asteroid.body.bodyId);

            asteroid.gameObject.x = pos.x;
            asteroid.gameObject.y = pos.y;
            asteroid.velocity.x = vel.x;
            asteroid.velocity.y = vel.y;
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
