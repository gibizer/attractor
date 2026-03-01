// Physics constants
export const PHYSICS = {
    G: 4000, // Gravitational constant (increased for single inverse)
    G_DISTANCE_POW: 2, // The invers dstance relation of gravity
    DAMPING_WALL: 0.0001, // Wall bounce energy retention
    DAMPING_OBJECT: 0.8, // Object collision energy retention
    MIN_GRAVITY_DISTANCE: 1, // Prevents division by zero
    MAX_GRAVITY_DISTANCE: 6000, // Maximum attraction distance (increased for longer range)
    MAX_VELOCITY: 500, // Cap for stability
    SHIP_MASS: 40,
    SHIP_RADIUS: 15,
    ASTEROID_COUNT: 4,
    ASTEROID_SIZES: [
        { radius: 10, mass: 40 },
        { radius: 30, mass: 120 },
        { radius: 50, mass: 200 },
    ],
};

// Visual constants
export const VISUAL = {
    SHIP_TRIANGLE_SIZE: PHYSICS.SHIP_RADIUS * 0.75, // Triangle size relative to radius
};

export const WORLD = {
    WIDTH: 400,
    HEIGHT: 680,
};

export const TARGET = {
    WIDTH: 40, // Full width in pixels
    HEIGHT: 20, // Full height in pixels
    X: WORLD.WIDTH / 2, // Centered horizontally (200px)
    Y: 30, // Near top of screen
    COLOR: 0x00ff00, // Green
};
