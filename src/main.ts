import { Game, Scene, GameObjects } from 'phaser';

class FlappyBirdScene extends Scene {
    private bird!: GameObjects.Rectangle;
    private pipes: GameObjects.Rectangle[] = [];
    private score: number = 0;
    private scoreText!: GameObjects.Text;
    private gameOver: boolean = false;

    private birdVelocity: number = 0;
    private gravity: number = 0.5;
    private jumpStrength: number = -10;
    private pipeGap: number = 150;
    private pipeSpeed: number = 3;

    constructor() {
        super({ key: 'FlappyBirdScene' });
    }

    create() {
        // Create bird (simple rectangle)
        this.bird = this.add.rectangle(100, 300, 30, 30, 0xFFD700);

        // Score text
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '32px',
            color: '#fff'
        });

        // Input handling
        this.input.on('pointerdown', () => this.jump());
        this.input.keyboard?.on('keydown-SPACE', () => this.jump());

        // Start spawning pipes
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnPipe,
            callbackScope: this,
            loop: true
        });
    }

    jump() {
        if (!this.gameOver) {
            this.birdVelocity = this.jumpStrength;
        } else {
            // Restart game
            this.scene.restart();
            this.gameOver = false;
            this.score = 0;
            this.birdVelocity = 0;
            this.pipes = [];
        }
    }

    spawnPipe() {
        if (this.gameOver) return;

        const gapY = Phaser.Math.Between(100, 400);

        // Top pipe
        const topPipe = this.add.rectangle(
            800,
            gapY - this.pipeGap / 2,
            50,
            gapY - this.pipeGap / 2,
            0x00AA00
        );
        topPipe.setOrigin(0.5, 1);

        // Bottom pipe
        const bottomPipe = this.add.rectangle(
            800,
            gapY + this.pipeGap / 2,
            50,
            600 - (gapY + this.pipeGap / 2),
            0x00AA00
        );
        bottomPipe.setOrigin(0.5, 0);

        this.pipes.push(topPipe, bottomPipe);
    }

    update() {
        if (this.gameOver) return;

        // Apply gravity
        this.birdVelocity += this.gravity;
        this.bird.y += this.birdVelocity;

        // Rotate bird based on velocity
        this.bird.rotation = Math.min(Math.max(this.birdVelocity / 20, -0.5), 1);

        // Move pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;

            // Remove off-screen pipes
            if (pipe.x < -50) {
                pipe.destroy();
                this.pipes.splice(i, 1);

                // Increment score when passing a pipe pair
                if (i % 2 === 0) {
                    this.score++;
                    this.scoreText.setText('Score: ' + this.score);
                }
            }

            // Check collision
            if (this.checkCollision(this.bird, pipe)) {
                this.endGame();
            }
        }

        // Check if bird hits ground or ceiling
        if (this.bird.y > 600 || this.bird.y < 0) {
            this.endGame();
        }
    }

    checkCollision(bird: GameObjects.Rectangle, pipe: GameObjects.Rectangle): boolean {
        const birdBounds = bird.getBounds();
        const pipeBounds = pipe.getBounds();

        return Phaser.Geom.Intersects.RectangleToRectangle(birdBounds, pipeBounds);
    }

    endGame() {
        this.gameOver = true;

        const gameOverText = this.add.text(400, 250, 'GAME OVER', {
            fontSize: '64px',
            color: '#ff0000'
        });
        gameOverText.setOrigin(0.5);

        const restartText = this.add.text(400, 330, 'Click or press SPACE to restart', {
            fontSize: '24px',
            color: '#fff'
        });
        restartText.setOrigin(0.5);
    }
}

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: document.body,
    backgroundColor: '#87CEEB',
    scene: FlappyBirdScene
};

// Start the game
new Game(config);
