import { GameObjects } from 'phaser';
import { Vector2D } from '../types/GameObject';

/**
 * Renders the spaceship with trail and bounding circle
 */
export class SpaceshipRenderer {
    private graphics: GameObjects.Graphics;
    private trail: Vector2D[] = [];
    private readonly MAX_TRAIL_LENGTH = 40;

    constructor(graphics: GameObjects.Graphics) {
        this.graphics = graphics;
    }

    /**
     * Update the trail with the current position
     */
    updateTrail(position: Vector2D): void {
        this.trail.push({ x: position.x, y: position.y });
        if (this.trail.length > this.MAX_TRAIL_LENGTH) {
            this.trail.shift();
        }
    }

    /**
     * Render the complete spaceship
     */
    render(
        position: Vector2D,
        velocity: Vector2D,
        radius: number,
        gravityEnabled: boolean
    ): void {
        this.graphics.clear();

        this.renderTrail(gravityEnabled);
        this.renderBoundingCircle(position, radius);
        this.renderTriangle(position, velocity, gravityEnabled);
    }

    /**
     * Render the motion trail
     */
    private renderTrail(gravityEnabled: boolean): void {
        if (this.trail.length < 2) return;

        for (let i = 0; i < this.trail.length - 1; i++) {
            const t = (i + 1) / this.trail.length;
            const alpha = Math.sqrt(t); // Square root for slower fade
            const width = 4 + alpha * 4; // Width from 4 to 8
            const trailColor = gravityEnabled ? 0xff8c00 : 0xff0000;
            this.graphics.lineStyle(width, trailColor, alpha * 0.8);
            this.graphics.lineBetween(
                this.trail[i].x,
                this.trail[i].y,
                this.trail[i + 1].x,
                this.trail[i + 1].y
            );
        }
    }

    /**
     * Render the dashed bounding circle
     */
    private renderBoundingCircle(position: Vector2D, radius: number): void {
        this.graphics.lineStyle(2, 0xadd8e6);
        const segments = 24; // Number of segments for dashed effect
        const dashLength = (Math.PI * 2) / segments;

        for (let i = 0; i < segments; i += 2) {
            const startAngle = i * dashLength;
            const endAngle = (i + 1) * dashLength;
            const startX = position.x + radius * Math.cos(startAngle);
            const startY = position.y + radius * Math.sin(startAngle);
            const endX = position.x + radius * Math.cos(endAngle);
            const endY = position.y + radius * Math.sin(endAngle);
            this.graphics.lineBetween(startX, startY, endX, endY);
        }
    }

    /**
     * Render the spaceship triangle
     */
    private renderTriangle(
        position: Vector2D,
        velocity: Vector2D,
        gravityEnabled: boolean
    ): void {
        // Draw spaceship triangle (red when gravity off, orange when gravity on)
        const shipColor = gravityEnabled ? 0xff8c00 : 0xff0000;
        this.graphics.fillStyle(shipColor);

        // Calculate rotation angle based on velocity
        let angle = 0;
        if (velocity.x !== 0 || velocity.y !== 0) {
            angle = Math.atan2(velocity.y, velocity.x);
        }

        // Draw triangle facing the velocity direction
        const size = 15;
        const points = [
            { x: size, y: 0 }, // Tip
            { x: -size, y: -size }, // Top back
            { x: -size, y: size }, // Bottom back
        ];

        // Rotate and translate points
        const rotatedPoints: Vector2D[] = [];
        for (const point of points) {
            const rotX = point.x * Math.cos(angle) - point.y * Math.sin(angle);
            const rotY = point.x * Math.sin(angle) + point.y * Math.cos(angle);
            rotatedPoints.push({
                x: rotX + position.x,
                y: rotY + position.y,
            });
        }

        this.graphics.fillTriangle(
            rotatedPoints[0].x,
            rotatedPoints[0].y,
            rotatedPoints[1].x,
            rotatedPoints[1].y,
            rotatedPoints[2].x,
            rotatedPoints[2].y
        );
    }
}
