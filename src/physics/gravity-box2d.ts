import { PHYSICS } from '../config/physics';
import { Asteroid } from '../types/GameObject';

// @ts-ignore
import {
    b2Body_GetPosition,
    b2Body_ApplyForceToCenter,
    b2Vec2
} from '../PhaserBox2D.js';

/**
 * Apply gravitational forces between ship and asteroids using Box2D
 */
export function applyShipAsteroidGravityBox2D(
    shipBody: any,  // Box2D Body wrapper
    shipMass: number,
    asteroids: Asteroid[]
): void {
    const shipPos = b2Body_GetPosition(shipBody.bodyId);

    for (const asteroid of asteroids) {
        const asteroidPos = b2Body_GetPosition(asteroid.body.bodyId);

        const dx = asteroidPos.x - shipPos.x;
        const dy = asteroidPos.y - shipPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Skip if too far or too close
        if (distance < PHYSICS.MIN_GRAVITY_DISTANCE || distance > PHYSICS.MAX_GRAVITY_DISTANCE) {
            continue;
        }

        // Calculate gravitational force with single inverse
        
        const force = PHYSICS.G * shipMass * asteroid.mass / Math.pow(distance, PHYSICS.G_DISTANCE_POW);

        // Normalize direction
        const nx = dx / distance;
        const ny = dy / distance;

        // Apply force to ship (attracted to asteroid)
        const shipForce = new b2Vec2(force * nx, force * ny);
        b2Body_ApplyForceToCenter(shipBody.bodyId, shipForce, true);

        // Apply force to asteroid (attracted to ship)
        const asteroidForce = new b2Vec2(-force * nx, -force * ny);
        b2Body_ApplyForceToCenter(asteroid.body.bodyId, asteroidForce, true);
    }
}

/**
 * Apply gravitational forces between asteroids using Box2D
 */
export function applyAsteroidAsteroidGravityBox2D(asteroids: Asteroid[]): void {
    for (let i = 0; i < asteroids.length; i++) {
        for (let j = i + 1; j < asteroids.length; j++) {
            const a1 = asteroids[i];
            const a2 = asteroids[j];

            const pos1 = b2Body_GetPosition(a1.body.bodyId);
            const pos2 = b2Body_GetPosition(a2.body.bodyId);

            const dx = pos2.x - pos1.x;
            const dy = pos2.y - pos1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Skip if too far or too close
            if (distance < PHYSICS.MIN_GRAVITY_DISTANCE || distance > PHYSICS.MAX_GRAVITY_DISTANCE) {
                continue;
            }

            // Calculate gravitational force with single inverse
            const force = PHYSICS.G * a1.mass * a2.mass / Math.pow(distance, PHYSICS.G_DISTANCE_POW);

            // Normalize direction
            const nx = dx / distance;
            const ny = dy / distance;

            // Apply force to both asteroids
            const force1 = new b2Vec2(force * nx, force * ny);
            b2Body_ApplyForceToCenter(a1.body.bodyId, force1, true);

            const force2 = new b2Vec2(-force * nx, -force * ny);
            b2Body_ApplyForceToCenter(a2.body.bodyId, force2, true);
        }
    }
}
