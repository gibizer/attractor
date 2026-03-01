// Physics constants
export const PHYSICS = {
    G: 5,                            // Gravitational constant (increased for single inverse)
    DAMPING_WALL: 1,                 // Wall bounce energy retention
    DAMPING_OBJECT: 0.1,            // Object collision energy retention
    MIN_GRAVITY_DISTANCE: 5,         // Prevents division by zero
    MAX_GRAVITY_DISTANCE: 6000,      // Maximum attraction distance (increased for longer range)
    MAX_VELOCITY: 500,               // Cap for stability
    SHIP_MASS: 10,
    SHIP_RADIUS: 20,
    ASTEROID_COUNT: 2,
    ASTEROID_SIZES: [
        //{ radius: 15, mass: 225 },
        //{ radius: 25, mass: 625 },
        { radius: 40, mass: 1600 }
    ]
};

export const WORLD = {
    WIDTH: 800,
    HEIGHT: 600
};
