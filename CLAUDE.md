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
│   └── main.ts          # Main game code with GravityGameScene
├── index.html           # Entry HTML file
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # Setup and usage instructions
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
- Keep game logic in scene classes
- Use ES modules

## Game Mechanics

### Controls
- **SPACEBAR (hold)**: Enable gravity - objects attract each other
- **SPACEBAR (release)**: Disable gravity - objects move with inertia only

### Physics
- **N-body Gravity**: All objects attract each other when gravity is enabled
  - Gravitational constant G = 100 (tuned for gameplay)
  - Force formula: F = G * m1 * m2 / distance²
  - Minimum distance threshold prevents extreme forces
  - Maximum distance cutoff for performance optimization
- **Collision Response**: Objects bounce off walls and each other
  - Wall bounces: 80% energy retention
  - Object collisions: 90% energy retention
  - Mass-based collision resolution
- **Velocity Capping**: Maximum velocity of 500 px/s for stability

### Game Objects
- **Spaceship**: Red triangle (mass: 10, radius: 20px) - player controlled
- **Asteroids**: Yellow circles in 3 sizes:
  - Small (15px radius, mass: 225)
  - Medium (25px radius, mass: 625)
  - Large (40px radius, mass: 1600)
- **Walls**: Light blue border that objects bounce off
- **Timer**: Tracks total time gravity has been active

## Important Notes for Claude

- Manual physics implementation (no Phaser physics engine)
- All physics calculations in the update loop
- Simple geometric shapes for game objects (Graphics API)
- State managed within the GravityGameScene class
- Physics constants tuned for gameplay, not realism

## Key Files and Locations

- `src/main.ts` - Contains all game logic: physics simulation, collision detection, rendering
- `index.html` - Main HTML entry point that loads the game

## Physics Implementation Details

### Update Loop Structure
1. Update gravity timer (if enabled)
2. Apply gravitational forces (if enabled)
3. Integrate velocities into positions
4. Check and resolve wall collisions
5. Check and resolve object-object collisions
6. Update visuals (rotate spaceship to face velocity)

### Key Physics Functions
- `applyGravitationalForces(dt)` - Calculates N-body gravitational attractions
- `updatePositions(dt)` - Integrates velocity into position with velocity capping
- `checkWallCollisions()` - Bounces objects off boundaries
- `checkObjectCollisions()` - Resolves circle-to-circle collisions with mass-based impulses
