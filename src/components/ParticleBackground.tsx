import { useEffect, useRef } from 'react';
import { LuxuryTheme } from '../types';

interface ParticleBackgroundProps {
  theme: LuxuryTheme;
  reducedMotion: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
}

export function ParticleBackground({ theme, reducedMotion }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; radius: number }>({ x: -1000, y: -1000, radius: 140 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const getThemeColors = (t: LuxuryTheme) => {
      // Warm gold & yellow ambient palette mixed into background
      const goldYellowHues = ['#d4af37', '#f59e0b', '#fbbf24', '#fef08a', '#ffd700'];
      switch (t) {
        case 'emerald':
          return ['#10b981', '#34d399', '#059669', '#6ee7b7', ...goldYellowHues];
        case 'sapphire':
          return ['#3b82f6', '#60a5fa', '#1d4ed8', '#93c5fd', ...goldYellowHues];
        case 'ruby':
          return ['#ef4444', '#f87171', '#dc2626', '#fca5a5', ...goldYellowHues];
        case 'platinum':
          return ['#e2e8f0', '#cbd5e1', '#94a3b8', '#f8fafc', ...goldYellowHues];
        case 'gold':
        default:
          return ['#d4af37', '#f59e0b', '#fbbf24', '#fef08a', '#e2e8f0', '#ffd700', '#facc15'];
      }
    };

    const colors = getThemeColors(theme);
    const particleCount = Math.min(width < 768 ? 40 : 85, 90);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.45,
        speedY: (Math.random() - 0.5) * 0.45 - 0.15,
        opacity: Math.random() * 0.6 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      if (reducedMotion) {
        // Static gentle glow points if reduced motion is requested
        particles.slice(0, 30).forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.25;
          ctx.fill();
        });
        return;
      }

      particles.forEach((p) => {
        p.x += p.speedX * (dt * 60);
        p.y += p.speedY * (dt * 60);
        p.pulsePhase += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse repelling/swirl
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRef.current.radius) {
          const force = (1 - dist / mouseRef.current.radius) * 1.5;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }

        const currentOpacity = Math.max(0.08, p.opacity + Math.sin(p.pulsePhase) * 0.2);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentOpacity;
        ctx.shadowBlur = p.size > 1.8 ? 10 : 4;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      // Draw subtle orbital connections between nearby particles
      ctx.shadowBlur = 0;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (d < 85) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = (1 - d / 85) * 0.12;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ opacity: 0.85 }}
    />
  );
}
