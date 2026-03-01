import { PHYSICS } from '../config/physics';

// @ts-ignore
import {
    b2Body_GetLinearVelocity,
    b2Body_SetLinearVelocity,
    b2Shape_GetBody,
    b2Vec2,
} from '../PhaserBox2D.js';

/**
 * Collision tracker for ship-asteroid collisions
 */
export class CollisionListener {
    private collisionCount: number = 0;
    private shipBodyId: any = null;
    private asteroidBodyIds: Set<any> = new Set();
    private targetBodyId: any = null;
    private shipHitTarget: boolean = false;

    setShipBody(bodyId: any): void {
        this.shipBodyId = bodyId;
    }

    addAsteroidBody(bodyId: any): void {
        this.asteroidBodyIds.add(bodyId);
    }

    setTargetBody(bodyId: any): void {
        this.targetBodyId = bodyId;
    }

    getCollisionCount(): number {
        return this.collisionCount;
    }

    resetCollisionCount(): void {
        this.collisionCount = 0;
    }

    checkShipTargetCollision(): boolean {
        return this.shipHitTarget;
    }

    resetShipTargetCollision(): void {
        this.shipHitTarget = false;
    }

    /**
     * Process contact events from Box2D world
     */
    processContactEvents(contactEvents: any): void {
        // contactEvents.beginEvents contains all new contacts this step
        const beginEvents = contactEvents.beginEvents || [];

        for (const event of beginEvents) {
            // Get body IDs from shape IDs
            const bodyA = event.shapeIdA
                ? b2Shape_GetBody(event.shapeIdA)
                : null;
            const bodyB = event.shapeIdB
                ? b2Shape_GetBody(event.shapeIdB)
                : null;

            if (!bodyA || !bodyB) continue;

            // Check if this is a ship-asteroid collision
            const aIsShip = this.bodyIdsEqual(bodyA, this.shipBodyId);
            const bIsShip = this.bodyIdsEqual(bodyB, this.shipBodyId);
            const aIsAsteroid = this.isAsteroidBody(bodyA);
            const bIsAsteroid = this.isAsteroidBody(bodyB);
            const aIsTarget = this.bodyIdsEqual(bodyA, this.targetBodyId);
            const bIsTarget = this.bodyIdsEqual(bodyB, this.targetBodyId);

            // Ship-asteroid collision
            if ((aIsShip && bIsAsteroid) || (bIsShip && aIsAsteroid)) {
                this.collisionCount++;
            }

            // Ship-target collision
            if ((aIsShip && bIsTarget) || (bIsShip && aIsTarget)) {
                this.shipHitTarget = true;
            }
        }
    }

    private bodyIdsEqual(id1: any, id2: any): boolean {
        if (!id1 || !id2) return false;
        return id1.index1 === id2.index1 && id1.world0 === id2.world0;
    }

    private isAsteroidBody(bodyId: any): boolean {
        for (const asteroidId of this.asteroidBodyIds) {
            if (this.bodyIdsEqual(bodyId, asteroidId)) {
                return true;
            }
        }
        return false;
    }

    destroy(): void {
        this.asteroidBodyIds.clear();
        this.shipBodyId = null;
        this.targetBodyId = null;
    }
}

/**
 * Cap velocity to maximum value for Box2D bodies
 */
export function capVelocityBox2D(body: any): void {
    const vel = b2Body_GetLinearVelocity(body.bodyId);
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);

    if (speed > PHYSICS.MAX_VELOCITY) {
        const scale = PHYSICS.MAX_VELOCITY / speed;
        const newVel = new b2Vec2(vel.x * scale, vel.y * scale);
        b2Body_SetLinearVelocity(body.bodyId, newVel);
    }
}
