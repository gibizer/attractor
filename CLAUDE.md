# Project Overview

It is a flappy bird clone. A simple browser based 2D game.

## Technology Stack

- Language: TypeScript
- Framework: Phaser 4.0 RC
- Build Tool: Vite
- Package Manager: npm

## Project Structure

```
/
├── src/
│   └── main.ts          # Main game code with FlappyBirdScene
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

## Important Notes for Claude

- This is a minimal implementation using simple rectangles for graphics
- The game uses Phaser's built-in collision detection
- Game state is managed within the FlappyBirdScene class

## Key Files and Locations

- `src/main.ts` - Contains all game logic, bird physics, pipe spawning, and collision detection
- `index.html` - Main HTML entry point that loads the game
