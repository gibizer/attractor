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
    ASTEROID_COUNT: 8,
    ASTEROID_SIZES: [
        { radius: 10, mass: 40 },
        { radius: 40, mass: 160 },
        { radius: 60, mass: 240 },
    ],
};

// Visual constants
export const VISUAL = {
    SHIP_TRIANGLE_SIZE: PHYSICS.SHIP_RADIUS * 0.75, // Triangle size relative to radius
};

export const WORLD = {
    WIDTH: 800,
    HEIGHT: 600,
};
