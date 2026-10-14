import { useEffect, useState } from 'react';
import { LuxuryTheme } from '../types';

interface CursorGlowProps {
  theme: LuxuryTheme;
  reducedMotion: boolean;
}

export function CursorGlow({ theme, reducedMotion }: CursorGlowProps) {
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [reducedMotion, isVisible]);

  if (reducedMotion || !isVisible) return null;

  const getGlowColor = (t: LuxuryTheme) => {
    switch (t) {
      case 'emerald':
        return 'rgba(16, 185, 129, 0.12)';
      case 'sapphire':
        return 'rgba(59, 130, 246, 0.12)';
      case 'ruby':
        return 'rgba(239, 68, 68, 0.12)';
      case 'platinum':
        return 'rgba(226, 232, 240, 0.12)';
      case 'gold':
      default:
        return 'rgba(212, 175, 55, 0.14)';
    }
  };

  return (
    <div
      className="pointer-events-none fixed z-30 transition-transform duration-75 ease-out hidden lg:block"
      style={{
        transform: `translate3d(${position.x - 200}px, ${position.y - 200}px, 0)`,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${getGlowColor(theme)} 0%, transparent 70%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
}
