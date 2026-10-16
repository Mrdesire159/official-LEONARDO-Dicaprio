import { useEffect, useState } from 'react';
import { PageId } from '../types';

interface CinematicScrollProgressBarProps {
  activePage?: PageId;
}

export function CinematicScrollProgressBar({ activePage }: CinematicScrollProgressBarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const calculateScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      if (scrollHeight > 10) {
        const progress = Math.min(Math.max((scrollTop / scrollHeight) * 100, 0), 100);
        setScrollProgress(progress);
        setIsVisible(true);
      } else {
        setScrollProgress(0);
        setIsVisible(false);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(calculateScroll);
        ticking = true;
      }
    };

    // Initial calculation and listener
    calculateScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [activePage]);

  if (!isVisible && scrollProgress === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[2.5px] bg-black/60 backdrop-blur-xs overflow-visible"
      role="progressbar"
      aria-label="Cinematic Film Reel Scroll Progress"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Golden Film Reel Progress Fill */}
      <div
        className="h-full relative transition-[width] duration-100 ease-out will-change-[width]"
        style={{
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #92400e 0%, #d97706 25%, #f59e0b 60%, #fbbf24 85%, #fef08a 100%)',
          boxShadow: '0 0 10px rgba(245, 158, 11, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)',
        }}
      >
        {/* Leading Golden Aperture Glow (Film Reel Projector Tip) */}
        {scrollProgress > 0 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center">
            {/* Soft radiant aura */}
            <div className="h-3 w-3 rounded-full bg-amber-400 blur-[3px] opacity-80" />
            {/* Crisp center optic spark */}
            <div className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_#fde047]" />
          </div>
        )}
      </div>

      {/* Subtle Film Reel Frame Notch Indicators at 25%, 50%, 75% */}
      <div className="absolute inset-0 flex justify-between pointer-events-none opacity-25">
        <div className="w-[1px] h-full bg-amber-400/40 ml-[25%]" />
        <div className="w-[1px] h-full bg-amber-400/60 ml-[25%]" />
        <div className="w-[1px] h-full bg-amber-400/40 ml-[25%]" />
      </div>
    </div>
  );
}
