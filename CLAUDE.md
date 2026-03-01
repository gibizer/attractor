# Project Overview

A 2D gravity-based space game where players control a spaceship that can toggle gravitational forces on and off. Objects move with realistic N-body physics, bouncing off each other and walls.

## Technology Stack

- Language: TypeScript
- Framework: Phaser 4.0 RC6
- Build Tool: Vite
- Package Manager: npm

## Project Structure

```
/
├── src/
│   ├── config/
│   │   └── physics.ts          # Physics constants and world configuration
│   ├── types/
│   │   └── GameObject.ts       # Type definitions (Vector2D, Asteroid, etc.)
│   ├── physics/
│   │   ├── gravity.ts          # Gravitational force calculations
│   │   └── collisions.ts       # Collision detection and resolution
│   ├── rendering/
│   │   └── Spaceship.ts        # Spaceship rendering (trail, triangle, bounding circle)
│   ├── ui/
│   │   └── GameUI.ts           # UI elements (FPS, velocity, gravity timer, collisions)
│   ├── scenes/
│   │   └── GravityGameScene.ts # Main game scene orchestration
│   └── main.ts                 # Entry point (16 lines)
├── index.html                  # Entry HTML file
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Setup and usage instructions
```

## Development Setup

### Installation

```bash
npm install
```

### Running the Project

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Coding Conventions

- Use TypeScript strict mode
- Follow Phaser 4.0 RC APIs
- Modular architecture with separation of concerns
- Use ES modules
- Each module has a single clear responsibility

## Game Mechanics

### Controls

- **SPACEBAR (hold)**: Enable gravity - objects attract each other
- **SPACEBAR (release)**: Disable gravity - objects move with inertia only

### Physics

- **N-body Gravity**: All objects attract each other when gravity is enabled
    - Gravitational constant G = 5000 (tuned for single inverse falloff)
    - Force formula: **F = G _ m1 _ m2 / distance** (single inverse, not inverse-square)
    - Uses single inverse (1/r) instead of inverse-square (1/r²) for better long-range attraction
    - At 100px distance, single inverse provides 100x stronger forces than inverse-square
    - Minimum distance threshold (MIN_GRAVITY_DISTANCE = 1) prevents division by zero
    - Maximum distance (MAX_GRAVITY_DISTANCE = 6000) for performance optimization
    - Gentler falloff makes gravity more playable at typical gameplay distances (50-200px)

- **Collision Response**: Objects bounce off walls and each other
    - Wall bounces: 100% energy retention (DAMPING_WALL = 1.0)
    - Object collisions: 10% energy retention (DAMPING_OBJECT = 0.1)
    - Mass-based collision resolution (heavier objects move less)
    - Position-based separation prevents object penetration
    - Impulse calculation uses coefficient of restitution: `impulse = (1 + e) * dvn / (1/m1 + 1/m2)`

- **Velocity Capping**: Maximum velocity of 500 px/s for stability

### Game Objects

- **Spaceship**: Red/Orange triangle (mass: 10, radius: 20px) - player controlled
    - Red when gravity is disabled
    - Orange when gravity is enabled
    - Rotates to face velocity direction
    - Motion trail effect (60 frames, fading)
    - Dashed bounding circle visualization

- **Asteroids**: Yellow circles (configurable count and sizes)
    - Large (40px radius, mass: 1600) - primary size
    - Random initial velocities (20-60 px/s)
    - Spawn with minimum 100px spacing from ship and other asteroids

- **Walls**: Light blue border (800x600 world)
- **UI**: Top-right display shows:
    - Gravity timer (time gravity has been active)
    - Ship velocity (magnitude in px/s)
    - Collision counter (cumulative ship-to-asteroid collisions)
- **FPS Counter**: Top-left corner

## Architecture Overview

### Modular Design

The codebase follows a clean separation of concerns:

1. **Configuration** (`config/physics.ts`)
    - Single source of truth for all physics constants
    - World dimensions (WIDTH, HEIGHT)
    - Easy tuning without touching game logic

2. **Types** (`types/GameObject.ts`)
    - Shared interfaces (Vector2D, Asteroid, PhysicsObject)
    - Type safety across modules

3. **Physics** (`physics/`)
    - **gravity.ts**: Pure functions for gravitational force calculations
        - `applyShipAsteroidGravity()` - Ship ↔ asteroid forces
        - `applyAsteroidAsteroidGravity()` - Asteroid ↔ asteroid forces
    - **collisions.ts**: Collision detection and resolution
        - `checkShipWallCollisions()` - Ship boundary bouncing
        - `checkAsteroidWallCollisions()` - Asteroid boundary bouncing
        - `checkShipAsteroidCollisions()` - Ship-asteroid collision resolution (returns count)
        - `checkAsteroidAsteroidCollisions()` - Asteroid-asteroid collision resolution
        - `capVelocity()` - Velocity limiting utility

4. **Rendering** (`rendering/Spaceship.ts`)
    - `SpaceshipRenderer` class handles all visual aspects
    - Trail management and rendering
    - Triangle shape with rotation
    - Dashed bounding circle effect

5. **UI** (`ui/GameUI.ts`)
    - `GameUI` class manages HUD elements
    - Isolated from game logic
    - Methods: `updateFPS()`, `updateVelocity()`, `updateGravityTimer()`, `updateCollisions()`

6. **Game Scene** (`scenes/GravityGameScene.ts`)
    - Orchestrates all components
    - Clean update loop separated into:
        - `updateUI()` - UI updates
        - `updateInput()` - Input handling
        - `updatePhysics()` - Physics simulation
        - `updateVisuals()` - Rendering updates

7. **Entry Point** (`main.ts`)
    - Minimal 16-line file
    - Just game initialization

## Important Notes for Claude

- Manual physics implementation (no Phaser physics engine)
- All physics calculations use delta time (dt) for frame-rate independence
- Simple geometric shapes for game objects (Graphics API for spaceship, Arc for asteroids)
- State managed within the GravityGameScene class
- Physics constants tuned for gameplay, not realism
- **Modular architecture**: Each file has a single clear responsibility
- **Testable**: Physics functions are pure and can be tested in isolation
- **Maintainable**: Easy to locate and modify specific functionality

## Key Files and Locations

### Configuration

- `src/config/physics.ts` - All physics constants (G, damping, masses, world size)

### Core Game Logic

- `src/scenes/GravityGameScene.ts` - Main game scene (215 lines)
    - Orchestrates physics, rendering, UI
    - Main update loop
    - Asteroid spawning logic

### Physics Systems

- `src/physics/gravity.ts` - Gravity calculations (82 lines)
    - Single inverse force formula: F = G _ m1 _ m2 / distance
    - Separate functions for ship-asteroid and asteroid-asteroid gravity

- `src/physics/collisions.ts` - Collision system (174 lines)
    - Wall collision detection and bouncing
    - Circle-to-circle collision detection
    - Mass-based position separation
    - Impulse-based velocity resolution
    - Returns collision count for ship-asteroid collisions

### Rendering & UI

- `src/rendering/Spaceship.ts` - Spaceship visuals (125 lines)
    - Trail effect with fading
    - Rotating triangle
    - Dashed bounding circle

- `src/ui/GameUI.ts` - HUD elements (53 lines)
    - FPS counter
    - Velocity display
    - Gravity timer
    - Collision counter

### Types

- `src/types/GameObject.ts` - Shared type definitions (20 lines)
    - Vector2D, Asteroid, PhysicsObject interfaces

## Physics Implementation Details

### Update Loop Structure (in GravityGameScene.ts)

1. Update UI (FPS, velocity, collision count)
2. Update input (check spacebar state)
3. Update physics:
    - Update gravity timer (if enabled)
    - Apply gravitational forces (if enabled)
    - Integrate velocities into positions with velocity capping
    - Check and resolve wall collisions
    - Check and resolve ship-asteroid collisions (track count)
    - Check and resolve asteroid-asteroid collisions
4. Update visuals (trail + render spaceship)

### Gravity Implementation (physics/gravity.ts)

**Single Inverse Law**: More suitable for 2D gameplay than inverse-square

- Inverse-square (1/r²) has extremely steep falloff - forces only noticeable when very close
- Single inverse (1/r) has gentler falloff - forces felt across the screen
- Example at 100px: single inverse is 100x stronger than inverse-square

```typescript
// Force calculation
const force = (G * m1 * m2) / distance;

// Direction normalization
const nx = dx / distance;
const ny = dy / distance;

// Apply acceleration (F = ma, so a = F/m)
velocity.x += (force / mass) * nx * dt;
velocity.y += (force / mass) * ny * dt;
```

### Collision Resolution (physics/collisions.ts)

Two-phase collision response:

**Phase 1: Position Separation**

```typescript
// Calculate penetration depth
const overlap = radius1 + radius2 - distance;

// Mass-based separation (heavier objects move less)
const separation1 = (mass2 / (mass1 + mass2)) * overlap;
const separation2 = (mass1 / (mass1 + mass2)) * overlap;

// Push apart along collision normal
position1 -= normal * separation1;
position2 += normal * separation2;
```

**Phase 2: Velocity Resolution**

```typescript
// Relative velocity along collision normal
const dvn = relativeVelocity · normal;

// Skip if already separating
if (dvn < 0) return;

// Calculate impulse with coefficient of restitution
const impulse = (2 * dvn) / (1/m1 + 1/m2);

// Apply impulse with damping
velocity1 += (impulse / m1) * normal * damping;
velocity2 -= (impulse / m2) * normal * damping;
```

### Key Physics Parameters

From `config/physics.ts`:

```typescript
G: 5000; // Much larger than real physics due to single inverse
DAMPING_WALL: 1.0; // Perfect elastic wall bounces
DAMPING_OBJECT: 0.1; // 10% energy retention (90% loss per collision)
MIN_GRAVITY_DISTANCE: 1; // Prevents division by zero
MAX_GRAVITY_DISTANCE: 6000; // Long-range attraction enabled
MAX_VELOCITY: 500; // Prevents simulation instability
```

## Common Modifications

### Tuning Gravity Strength

Edit `src/config/physics.ts`:

- Increase `G` (try 6000-8000) for stronger gravity
- Decrease `G` (try 3000-4000) for weaker gravity
- Adjust `MAX_GRAVITY_DISTANCE` for range (400-800 recommended)

### Changing Collision Bounciness

Edit `src/config/physics.ts`:

- `DAMPING_WALL`: 0.0 (sticky) to 1.0 (perfectly elastic)
- `DAMPING_OBJECT`: 0.0 (objects stick together) to 1.0 (elastic)

### Adding More Asteroids

Edit `src/config/physics.ts`:

- Change `ASTEROID_COUNT` (2-20 recommended)
- Modify `ASTEROID_SIZES` array for different sizes/masses

### Adding New UI Elements

Edit `src/ui/GameUI.ts`:

- Add text field in constructor
- Add update method
- Call from `GravityGameScene.updateUI()`
