import { GameObjects } from 'phaser';

export interface Vector2D {
    x: number;
    y: number;
}

export interface Asteroid {
    gameObject: GameObjects.Arc;
    velocity: Vector2D;
    mass: number;
    radius: number;
}

export interface PhysicsObject {
    position: Vector2D;
    velocity: Vector2D;
    mass: number;
    radius: number;
}
