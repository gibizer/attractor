import { Game, Scene, GameObjects } from 'phaser';

// Physics constants
const PHYSICS = {
    G: 5,                         // Gravitational constant (increased for single inverse)
    DAMPING_WALL: 1,              // Wall bounce energy retention
    DAMPING_OBJECT: 0.01,            // Object collision energy retention
    MIN_GRAVITY_DISTANCE: 1,        // Prevents division by zero
    MAX_GRAVITY_DISTANCE: 6000,      // Maximum attraction distance (increased for longer range)
    MAX_VELOCITY: 500,              // Cap for stability
    SHIP_MASS: 10,
    SHIP_RADIUS: 20,
    ASTEROID_COUNT: 4,
    ASTEROID_SIZES: [
        { radius: 15, mass: 225 },
        { radius: 25, mass: 625 },
        { radius: 40, mass: 1600 }
    ]
};

interface Asteroid {
    gameObject: GameObjects.Circle;
    velocity: { x: number; y: number };
    mass: number;
    radius: number;
}

class GravityGameScene extends Scene {
    // Player
    private spaceship!: GameObjects.Graphics;
    private shipVelocity: { x: number; y: number } = { x: 0, y: 0 };
    private shipPosition: { x: number; y: number } = { x: 400, y: 300 };
    private shipMass: number = PHYSICS.SHIP_MASS;
    private shipRadius: number = PHYSICS.SHIP_RADIUS;
    private shipTrail: Array<{ x: number; y: number }> = [];
    private readonly MAX_TRAIL_LENGTH = 60;

    // Game objects
    private asteroids: Asteroid[] = [];
    private wallGraphics!: GameObjects.Graphics;
    private gravityTimeText!: GameObjects.Text;
    private velocityText!: GameObjects.Text;
    private fpsText!: GameObjects.Text;

    // Physics state
    private gravityEnabled: boolean = false;
    private gravityTimer: number = 0;

    // Input
    private spaceKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'GravityGameScene' });
    }

    create() {
        // Create wall border
        this.wallGraphics = this.add.graphics();
        this.wallGraphics.lineStyle(4, 0xADD8E6);
        this.wallGraphics.strokeRect(2, 2, 796, 596);

        // Create spaceship (red triangle)
        this.spaceship = this.add.graphics();
        this.updateSpaceshipGraphics();

        // Create asteroids
        this.createAsteroids();

        // Create UI text
        this.gravityTimeText = this.add.text(750, 20, 'Gravity: 0.0s', {
            fontSize: '24px',
            color: '#ffffff'
        });
        this.gravityTimeText.setOrigin(1, 0);

        this.velocityText = this.add.text(750, 50, 'Velocity: 0', {
            fontSize: '24px',
            color: '#ffffff'
        });
        this.velocityText.setOrigin(1, 0);

        this.fpsText = this.add.text(20, 20, 'FPS: 0', {
            fontSize: '24px',
            color: '#ffffff'
        });

        // Setup input
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    createAsteroids() {
        const minSpacing = 100; // Minimum distance between asteroids and ship

        for (let i = 0; i < PHYSICS.ASTEROID_COUNT; i++) {
            let x: number, y: number;
            let validPosition = false;

            // Find a valid position with minimum spacing
            while (!validPosition) {
                x = Phaser.Math.Between(50, 750);
                y = Phaser.Math.Between(50, 550);

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

    updateSpaceshipGraphics() {
        this.spaceship.clear();

        // Draw trail (fading line behind ship)
        if (this.shipTrail.length > 1) {
            for (let i = 0; i < this.shipTrail.length - 1; i++) {
                const t = (i + 1) / this.shipTrail.length;
                const alpha = Math.sqrt(t); // Square root for slower fade
                const width = 4 + (alpha * 4); // Width from 4 to 8
                const trailColor = this.gravityEnabled ? 0xFF8C00 : 0xFF0000;
                this.spaceship.lineStyle(width, trailColor, alpha * 0.8);
                this.spaceship.lineBetween(
                    this.shipTrail[i].x,
                    this.shipTrail[i].y,
                    this.shipTrail[i + 1].x,
                    this.shipTrail[i + 1].y
                );
            }
        }

        // Draw bounding circle (dashed, light blue)
        this.spaceship.lineStyle(2, 0xADD8E6);
        const segments = 24; // Number of segments for dashed effect
        const dashLength = (Math.PI * 2) / segments;
        for (let i = 0; i < segments; i += 2) {
            const startAngle = i * dashLength;
            const endAngle = (i + 1) * dashLength;
            const startX = this.shipPosition.x + this.shipRadius * Math.cos(startAngle);
            const startY = this.shipPosition.y + this.shipRadius * Math.sin(startAngle);
            const endX = this.shipPosition.x + this.shipRadius * Math.cos(endAngle);
            const endY = this.shipPosition.y + this.shipRadius * Math.sin(endAngle);
            this.spaceship.lineBetween(startX, startY, endX, endY);
        }

        // Draw spaceship triangle (red when gravity off, orange when gravity on)
        const shipColor = this.gravityEnabled ? 0xFF8C00 : 0xFF0000;
        this.spaceship.fillStyle(shipColor);

        // Calculate rotation angle based on velocity
        let angle = 0;
        if (this.shipVelocity.x !== 0 || this.shipVelocity.y !== 0) {
            angle = Math.atan2(this.shipVelocity.y, this.shipVelocity.x);
        }

        // Draw triangle facing the velocity direction
        const size = 15;
        const points = [
            { x: size, y: 0 },      // Tip
            { x: -size, y: -size }, // Top back
            { x: -size, y: size }   // Bottom back
        ];

        // Rotate and translate points
        const rotatedPoints: { x: number; y: number }[] = [];
        for (const point of points) {
            const rotX = point.x * Math.cos(angle) - point.y * Math.sin(angle);
            const rotY = point.x * Math.sin(angle) + point.y * Math.cos(angle);
            rotatedPoints.push({
                x: rotX + this.shipPosition.x,
                y: rotY + this.shipPosition.y
            });
        }

        this.spaceship.fillTriangle(
            rotatedPoints[0].x, rotatedPoints[0].y,
            rotatedPoints[1].x, rotatedPoints[1].y,
            rotatedPoints[2].x, rotatedPoints[2].y
        );
    }

    update(time: number, delta: number) {
        const dt = delta / 1000; // Convert to seconds

        // Update FPS counter
        const fps = Math.round(1000 / delta);
        this.fpsText.setText(`FPS: ${fps}`);

        // Update velocity display
        const speed = Math.sqrt(this.shipVelocity.x ** 2 + this.shipVelocity.y ** 2);
        this.velocityText.setText(`Velocity: ${Math.round(speed)}`);

        // Update gravity state based on spacebar
        this.gravityEnabled = this.spaceKey.isDown;

        // Update gravity timer
        if (this.gravityEnabled) {
            this.gravityTimer += dt;
            this.gravityTimeText.setText(`Gravity: ${this.gravityTimer.toFixed(1)}s`);
        }

        // Apply gravitational forces if enabled
        if (this.gravityEnabled) {
            this.applyGravitationalForces(dt);
        }

        // Integrate velocities into positions
        this.updatePositions(dt);

        // Check and resolve collisions
        this.checkWallCollisions();
        this.checkObjectCollisions();

        // Update trail
        this.shipTrail.push({ x: this.shipPosition.x, y: this.shipPosition.y });
        if (this.shipTrail.length > this.MAX_TRAIL_LENGTH) {
            this.shipTrail.shift();
        }

        // Update visuals
        this.updateSpaceshipGraphics();
    }

    applyGravitationalForces(dt: number) {
        // Ship to asteroids
        for (const asteroid of this.asteroids) {
            const dx = asteroid.gameObject.x - this.shipPosition.x;
            const dy = asteroid.gameObject.y - this.shipPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Skip if too far or too close
            if (distance < PHYSICS.MIN_GRAVITY_DISTANCE || distance > PHYSICS.MAX_GRAVITY_DISTANCE) {
                continue;
            }

            // Calculate gravitational force with single inverse
            const force = PHYSICS.G * this.shipMass * asteroid.mass / distance;

            // Normalize direction
            const nx = dx / distance;
            const ny = dy / distance;

            // Apply force to ship (attracted to asteroid)
            const shipAccelX = (force / this.shipMass) * nx;
            const shipAccelY = (force / this.shipMass) * ny;
            this.shipVelocity.x += shipAccelX * dt;
            this.shipVelocity.y += shipAccelY * dt;

            // Apply force to asteroid (attracted to ship)
            const asteroidAccelX = -(force / asteroid.mass) * nx;
            const asteroidAccelY = -(force / asteroid.mass) * ny;
            asteroid.velocity.x += asteroidAccelX * dt;
            asteroid.velocity.y += asteroidAccelY * dt;
        }

        // Asteroid to asteroid
        for (let i = 0; i < this.asteroids.length; i++) {
            for (let j = i + 1; j < this.asteroids.length; j++) {
                const a1 = this.asteroids[i];
                const a2 = this.asteroids[j];

                const dx = a2.gameObject.x - a1.gameObject.x;
                const dy = a2.gameObject.y - a1.gameObject.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Skip if too far or too close
                if (distance < PHYSICS.MIN_GRAVITY_DISTANCE || distance > PHYSICS.MAX_GRAVITY_DISTANCE) {
                    continue;
                }

                // Calculate gravitational force with single inverse
                const force = PHYSICS.G * a1.mass * a2.mass / distance;

                // Normalize direction
                const nx = dx / distance;
                const ny = dy / distance;

                // Apply force to both asteroids
                const accel1X = (force / a1.mass) * nx;
                const accel1Y = (force / a1.mass) * ny;
                a1.velocity.x += accel1X * dt;
                a1.velocity.y += accel1Y * dt;

                const accel2X = -(force / a2.mass) * nx;
                const accel2Y = -(force / a2.mass) * ny;
                a2.velocity.x += accel2X * dt;
                a2.velocity.y += accel2Y * dt;
            }
        }
    }

    updatePositions(dt: number) {
        // Cap ship velocity for stability
        const shipSpeed = Math.sqrt(this.shipVelocity.x ** 2 + this.shipVelocity.y ** 2);
        if (shipSpeed > PHYSICS.MAX_VELOCITY) {
            this.shipVelocity.x = (this.shipVelocity.x / shipSpeed) * PHYSICS.MAX_VELOCITY;
            this.shipVelocity.y = (this.shipVelocity.y / shipSpeed) * PHYSICS.MAX_VELOCITY;
        }

        // Update ship position
        this.shipPosition.x += this.shipVelocity.x * dt;
        this.shipPosition.y += this.shipVelocity.y * dt;

        // Update asteroid positions
        for (const asteroid of this.asteroids) {
            // Cap asteroid velocity
            const speed = Math.sqrt(asteroid.velocity.x ** 2 + asteroid.velocity.y ** 2);
            if (speed > PHYSICS.MAX_VELOCITY) {
                asteroid.velocity.x = (asteroid.velocity.x / speed) * PHYSICS.MAX_VELOCITY;
                asteroid.velocity.y = (asteroid.velocity.y / speed) * PHYSICS.MAX_VELOCITY;
            }

            asteroid.gameObject.x += asteroid.velocity.x * dt;
            asteroid.gameObject.y += asteroid.velocity.y * dt;
        }
    }

    checkWallCollisions() {
        // Ship wall collision
        if (this.shipPosition.x - this.shipRadius < 0) {
            this.shipPosition.x = this.shipRadius;
            this.shipVelocity.x = Math.abs(this.shipVelocity.x) * PHYSICS.DAMPING_WALL;
        }
        if (this.shipPosition.x + this.shipRadius > 800) {
            this.shipPosition.x = 800 - this.shipRadius;
            this.shipVelocity.x = -Math.abs(this.shipVelocity.x) * PHYSICS.DAMPING_WALL;
        }
        if (this.shipPosition.y - this.shipRadius < 0) {
            this.shipPosition.y = this.shipRadius;
            this.shipVelocity.y = Math.abs(this.shipVelocity.y) * PHYSICS.DAMPING_WALL;
        }
        if (this.shipPosition.y + this.shipRadius > 600) {
            this.shipPosition.y = 600 - this.shipRadius;
            this.shipVelocity.y = -Math.abs(this.shipVelocity.y) * PHYSICS.DAMPING_WALL;
        }

        // Asteroid wall collisions
        for (const asteroid of this.asteroids) {
            if (asteroid.gameObject.x - asteroid.radius < 0) {
                asteroid.gameObject.x = asteroid.radius;
                asteroid.velocity.x = Math.abs(asteroid.velocity.x) * PHYSICS.DAMPING_WALL;
            }
            if (asteroid.gameObject.x + asteroid.radius > 800) {
                asteroid.gameObject.x = 800 - asteroid.radius;
                asteroid.velocity.x = -Math.abs(asteroid.velocity.x) * PHYSICS.DAMPING_WALL;
            }
            if (asteroid.gameObject.y - asteroid.radius < 0) {
                asteroid.gameObject.y = asteroid.radius;
                asteroid.velocity.y = Math.abs(asteroid.velocity.y) * PHYSICS.DAMPING_WALL;
            }
            if (asteroid.gameObject.y + asteroid.radius > 600) {
                asteroid.gameObject.y = 600 - asteroid.radius;
                asteroid.velocity.y = -Math.abs(asteroid.velocity.y) * PHYSICS.DAMPING_WALL;
            }
        }
    }

    checkObjectCollisions() {
        // Ship to asteroid collisions
        for (const asteroid of this.asteroids) {
            const dx = asteroid.gameObject.x - this.shipPosition.x;
            const dy = asteroid.gameObject.y - this.shipPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDist = this.shipRadius + asteroid.radius;

            if (distance < minDist) {
                // Collision detected - resolve it

                // Normalize collision vector
                const nx = dx / distance;
                const ny = dy / distance;

                // Separate objects
                const overlap = minDist - distance;
                const totalMass = this.shipMass + asteroid.mass;
                const shipSeparation = (asteroid.mass / totalMass) * overlap;
                const asteroidSeparation = (this.shipMass / totalMass) * overlap;

                this.shipPosition.x -= nx * shipSeparation;
                this.shipPosition.y -= ny * shipSeparation;
                asteroid.gameObject.x += nx * asteroidSeparation;
                asteroid.gameObject.y += ny * asteroidSeparation;

                // Calculate relative velocity
                const dvx = asteroid.velocity.x - this.shipVelocity.x;
                const dvy = asteroid.velocity.y - this.shipVelocity.y;

                // Velocity along collision normal
                const dvn = dvx * nx + dvy * ny;

                // Don't resolve if objects are moving apart
                if (dvn < 0) {
                    continue;
                }

                // Calculate impulse
                const impulse = (2 * dvn) / (1 / this.shipMass + 1 / asteroid.mass);

                // Apply impulse with damping
                this.shipVelocity.x += (impulse / this.shipMass) * nx * PHYSICS.DAMPING_OBJECT;
                this.shipVelocity.y += (impulse / this.shipMass) * ny * PHYSICS.DAMPING_OBJECT;
                asteroid.velocity.x -= (impulse / asteroid.mass) * nx * PHYSICS.DAMPING_OBJECT;
                asteroid.velocity.y -= (impulse / asteroid.mass) * ny * PHYSICS.DAMPING_OBJECT;
            }
        }

        // Asteroid to asteroid collisions
        for (let i = 0; i < this.asteroids.length; i++) {
            for (let j = i + 1; j < this.asteroids.length; j++) {
                const a1 = this.asteroids[i];
                const a2 = this.asteroids[j];

                const dx = a2.gameObject.x - a1.gameObject.x;
                const dy = a2.gameObject.y - a1.gameObject.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDist = a1.radius + a2.radius;

                if (distance < minDist) {
                    // Collision detected - resolve it

                    // Normalize collision vector
                    const nx = dx / distance;
                    const ny = dy / distance;

                    // Separate objects
                    const overlap = minDist - distance;
                    const totalMass = a1.mass + a2.mass;
                    const a1Separation = (a2.mass / totalMass) * overlap;
                    const a2Separation = (a1.mass / totalMass) * overlap;

                    a1.gameObject.x -= nx * a1Separation;
                    a1.gameObject.y -= ny * a1Separation;
                    a2.gameObject.x += nx * a2Separation;
                    a2.gameObject.y += ny * a2Separation;

                    // Calculate relative velocity
                    const dvx = a2.velocity.x - a1.velocity.x;
                    const dvy = a2.velocity.y - a1.velocity.y;

                    // Velocity along collision normal
                    const dvn = dvx * nx + dvy * ny;

                    // Don't resolve if objects are moving apart
                    if (dvn < 0) {
                        continue;
                    }

                    // Calculate impulse
                    const impulse = (2 * dvn) / (1 / a1.mass + 1 / a2.mass);

                    // Apply impulse with damping
                    a1.velocity.x += (impulse / a1.mass) * nx * PHYSICS.DAMPING_OBJECT;
                    a1.velocity.y += (impulse / a1.mass) * ny * PHYSICS.DAMPING_OBJECT;
                    a2.velocity.x -= (impulse / a2.mass) * nx * PHYSICS.DAMPING_OBJECT;
                    a2.velocity.y -= (impulse / a2.mass) * ny * PHYSICS.DAMPING_OBJECT;
                }
            }
        }
    }
}

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: document.body,
    backgroundColor: '#000000',
    scene: GravityGameScene
};

// Start the game
new Game(config);
