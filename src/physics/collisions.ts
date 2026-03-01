import { PHYSICS, WORLD } from '../config/physics';
import { Asteroid, Vector2D } from '../types/GameObject';

/**
 * Check and resolve wall collisions for the ship
 */
export function checkShipWallCollisions(
    shipPosition: Vector2D,
    shipVelocity: Vector2D,
    shipRadius: number
): void {
    if (shipPosition.x - shipRadius < 0) {
        shipPosition.x = shipRadius;
        shipVelocity.x = Math.abs(shipVelocity.x) * PHYSICS.DAMPING_WALL;
    }
    if (shipPosition.x + shipRadius > WORLD.WIDTH) {
        shipPosition.x = WORLD.WIDTH - shipRadius;
        shipVelocity.x = -Math.abs(shipVelocity.x) * PHYSICS.DAMPING_WALL;
    }
    if (shipPosition.y - shipRadius < 0) {
        shipPosition.y = shipRadius;
        shipVelocity.y = Math.abs(shipVelocity.y) * PHYSICS.DAMPING_WALL;
    }
    if (shipPosition.y + shipRadius > WORLD.HEIGHT) {
        shipPosition.y = WORLD.HEIGHT - shipRadius;
        shipVelocity.y = -Math.abs(shipVelocity.y) * PHYSICS.DAMPING_WALL;
    }
}

/**
 * Check and resolve wall collisions for asteroids
 */
export function checkAsteroidWallCollisions(asteroids: Asteroid[]): void {
    for (const asteroid of asteroids) {
        if (asteroid.gameObject.x - asteroid.radius < 0) {
            asteroid.gameObject.x = asteroid.radius;
            asteroid.velocity.x = Math.abs(asteroid.velocity.x) * PHYSICS.DAMPING_WALL;
        }
        if (asteroid.gameObject.x + asteroid.radius > WORLD.WIDTH) {
            asteroid.gameObject.x = WORLD.WIDTH - asteroid.radius;
            asteroid.velocity.x = -Math.abs(asteroid.velocity.x) * PHYSICS.DAMPING_WALL;
        }
        if (asteroid.gameObject.y - asteroid.radius < 0) {
            asteroid.gameObject.y = asteroid.radius;
            asteroid.velocity.y = Math.abs(asteroid.velocity.y) * PHYSICS.DAMPING_WALL;
        }
        if (asteroid.gameObject.y + asteroid.radius > WORLD.HEIGHT) {
            asteroid.gameObject.y = WORLD.HEIGHT - asteroid.radius;
            asteroid.velocity.y = -Math.abs(asteroid.velocity.y) * PHYSICS.DAMPING_WALL;
        }
    }
}

/**
 * Check and resolve ship-to-asteroid collisions
 */
export function checkShipAsteroidCollisions(
    shipPosition: Vector2D,
    shipVelocity: Vector2D,
    shipMass: number,
    shipRadius: number,
    asteroids: Asteroid[]
): void {
    for (const asteroid of asteroids) {
        const dx = asteroid.gameObject.x - shipPosition.x;
        const dy = asteroid.gameObject.y - shipPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = shipRadius + asteroid.radius;

        if (distance < minDist) {
            // Normalize collision vector
            const nx = dx / distance;
            const ny = dy / distance;

            // Separate objects
            const overlap = minDist - distance;
            const totalMass = shipMass + asteroid.mass;
            const shipSeparation = (asteroid.mass / totalMass) * overlap;
            const asteroidSeparation = (shipMass / totalMass) * overlap;

            shipPosition.x -= nx * shipSeparation;
            shipPosition.y -= ny * shipSeparation;
            asteroid.gameObject.x += nx * asteroidSeparation;
            asteroid.gameObject.y += ny * asteroidSeparation;

            // Calculate relative velocity
            const dvx = asteroid.velocity.x - shipVelocity.x;
            const dvy = asteroid.velocity.y - shipVelocity.y;

            // Velocity along collision normal
            const dvn = dvx * nx + dvy * ny;

            // Don't resolve if objects are moving apart
            if (dvn < 0) {
                continue;
            }

            // Calculate impulse
            const impulse = (2 * dvn) / (1 / shipMass + 1 / asteroid.mass);

            // Apply impulse with damping
            shipVelocity.x += (impulse / shipMass) * nx * PHYSICS.DAMPING_OBJECT;
            shipVelocity.y += (impulse / shipMass) * ny * PHYSICS.DAMPING_OBJECT;
            asteroid.velocity.x -= (impulse / asteroid.mass) * nx * PHYSICS.DAMPING_OBJECT;
            asteroid.velocity.y -= (impulse / asteroid.mass) * ny * PHYSICS.DAMPING_OBJECT;
        }
    }
}

/**
 * Check and resolve asteroid-to-asteroid collisions
 */
export function checkAsteroidAsteroidCollisions(asteroids: Asteroid[]): void {
    for (let i = 0; i < asteroids.length; i++) {
        for (let j = i + 1; j < asteroids.length; j++) {
            const a1 = asteroids[i];
            const a2 = asteroids[j];

            const dx = a2.gameObject.x - a1.gameObject.x;
            const dy = a2.gameObject.y - a1.gameObject.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDist = a1.radius + a2.radius;

            if (distance < minDist) {
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

/**
 * Cap velocity to maximum value
 */
export function capVelocity(velocity: Vector2D): void {
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    if (speed > PHYSICS.MAX_VELOCITY) {
        velocity.x = (velocity.x / speed) * PHYSICS.MAX_VELOCITY;
        velocity.y = (velocity.y / speed) * PHYSICS.MAX_VELOCITY;
    }
}
