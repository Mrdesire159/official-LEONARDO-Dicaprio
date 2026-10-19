import { useState, useEffect } from 'react';
import { PageId } from '../types';
import { ArrowLeft, Home } from 'lucide-react';

interface FloatingBackButtonProps {
  activePage: PageId;
  onGoBack: () => void;
  onSelectMainPage: () => void;
}

export function FloatingBackButton({
  activePage,
  onGoBack,
  onSelectMainPage,
}: FloatingBackButtonProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (activePage === 'home') {
    return null;
  }

  return (
    <div
      className={`fixed bottom-20 sm:bottom-22 left-5 sm:left-8 z-40 transition-all duration-300 ${
        scrolled ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-0'
      }`}
    >
      <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/85 backdrop-blur-md p-1 shadow-2xl">
        <button
          onClick={onGoBack}
          className="flex items-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black px-3.5 py-2 text-xs font-bold transition-transform active:scale-95 shadow-md cursor-pointer"
          title="Return back to previous page"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>
        <button
          onClick={onSelectMainPage}
          className="flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-medium transition-colors cursor-pointer"
          title="Return to Main Sanctuary Homepage"
        >
          <Home className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">Main Page</span>
        </button>
      </div>
    </div>
  );
}
