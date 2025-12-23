
class Particle {
    x: number;
    y: number;
    radius: number;
    velocity: { x: number; y: number };
    alpha: number;
    glow: boolean;
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;

    constructor(width: number, height: number, ctx: CanvasRenderingContext2D) {
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 2 + 0.5;
        this.velocity = {
            x: (Math.random() - 0.5) * 0.5,
            y: Math.random() * 1 + 0.5
        };
        this.alpha = Math.random() * 0.5 + 0.1;
        this.glow = Math.random() > 0.95;
    }

    draw() {
        if (!this.ctx) return;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (this.glow) {
            this.ctx.fillStyle = `rgba(100, 255, 218, ${this.alpha})`;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(100, 255, 218, 0.8)';
        } else {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            this.ctx.shadowBlur = 0;
        }

        this.ctx.fill();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.y > this.height) {
            this.y = -10;
            this.x = Math.random() * this.width;
        }
        if (this.x > this.width) this.x = 0;
        if (this.x < 0) this.x = this.width;
    }
}
