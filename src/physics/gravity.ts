import { PHYSICS } from '../config/physics';
import { Asteroid, Vector2D } from '../types/GameObject';

/**
 * Apply gravitational forces between ship and asteroids
 */
export function applyShipAsteroidGravity(
    shipPosition: Vector2D,
    shipVelocity: Vector2D,
    shipMass: number,
    asteroids: Asteroid[],
    dt: number
): void {
    for (const asteroid of asteroids) {
        const dx = asteroid.gameObject.x - shipPosition.x;
        const dy = asteroid.gameObject.y - shipPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Skip if too far or too close
        if (distance < PHYSICS.MIN_GRAVITY_DISTANCE || distance > PHYSICS.MAX_GRAVITY_DISTANCE) {
            continue;
        }

        // Calculate gravitational force with single inverse
        const force = PHYSICS.G * shipMass * asteroid.mass / distance;

        // Normalize direction
        const nx = dx / distance;
        const ny = dy / distance;

        // Apply force to ship (attracted to asteroid)
        const shipAccelX = (force / shipMass) * nx;
        const shipAccelY = (force / shipMass) * ny;
        shipVelocity.x += shipAccelX * dt;
        shipVelocity.y += shipAccelY * dt;

        // Apply force to asteroid (attracted to ship)
        const asteroidAccelX = -(force / asteroid.mass) * nx;
        const asteroidAccelY = -(force / asteroid.mass) * ny;
        asteroid.velocity.x += asteroidAccelX * dt;
        asteroid.velocity.y += asteroidAccelY * dt;
    }
}

/**
 * Apply gravitational forces between asteroids
 */
export function applyAsteroidAsteroidGravity(asteroids: Asteroid[], dt: number): void {
    for (let i = 0; i < asteroids.length; i++) {
        for (let j = i + 1; j < asteroids.length; j++) {
            const a1 = asteroids[i];
            const a2 = asteroids[j];

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
