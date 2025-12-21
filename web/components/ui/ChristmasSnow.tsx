'use client';

import React, { useEffect, useRef } from 'react';

export default function ChristmasSnow() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles: any[] = [];
        const particleCount = Math.min(width * 0.15, 150); // Balance performance

        class Particle {
            x: number;
            y: number;
            radius: number;
            velocity: { x: number; y: number };
            alpha: number;
            glow: boolean;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.radius = Math.random() * 2 + 0.5;
                this.velocity = {
                    x: (Math.random() - 0.5) * 0.5,
                    y: Math.random() * 1 + 0.5
                };
                this.alpha = Math.random() * 0.5 + 0.1;
                this.glow = Math.random() > 0.95; // 5% chance of being a "glowing" cyber-snowflake
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

                if (this.glow) {
                    ctx.fillStyle = `rgba(100, 255, 218, ${this.alpha})`; // Cyan/Green tint for cyber feel
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(100, 255, 218, 0.8)';
                } else {
                    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                    ctx.shadowBlur = 0;
                }

                ctx.fill();
            }

            update() {
                this.x += this.velocity.x;
                this.y += this.velocity.y;

                // Wrap around screen
                if (this.y > height) {
                    this.y = -10;
                    this.x = Math.random() * width;
                }
                if (this.x > width) this.x = 0;
                if (this.x < 0) this.x = width;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        let animationFrameId: number;

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[0]"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
