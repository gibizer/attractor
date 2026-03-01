import { GameObjects } from 'phaser';

export interface Vector2D {
    x: number;
    y: number;
}

export interface Asteroid {
    gameObject: GameObjects.Image;
    body: any; // Box2D Body (using any due to module import issues)
    velocity: Vector2D; // Kept for UI display
    mass: number;
    radius: number;
}

export interface PhysicsObject {
    position: Vector2D;
    velocity: Vector2D;
    mass: number;
    radius: number;
}
