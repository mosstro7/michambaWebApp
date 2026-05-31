import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils';

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const overflow = scrollWidth > clientWidth + 1;

    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(overflow && scrollLeft < maxScroll - 1);
    setHasOverflow(overflow);

    if (overflow && clientWidth > 0) {
      const tw = Math.max((clientWidth / scrollWidth) * clientWidth, 32);
      const maxOffset = clientWidth - tw;
      setThumbWidth(tw);
      setThumbOffset(maxScroll > 0 ? (scrollLeft / maxScroll) * maxOffset : 0);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [update]);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 180, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Scroll row with arrows */}
      <div className="relative">
        {/* Left arrow — desktop only */}
        <button
          tabIndex={-1}
          aria-hidden
          onClick={() => scroll(-1)}
          className={cn(
            'absolute left-0 inset-y-0 my-auto z-10 hidden md:flex w-7 h-7 items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm transition-opacity duration-200',
            canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          <ChevronLeft size={14} className="text-gray-600" />
        </button>

        {/* Scroll container — native touch on mobile, no arrows */}
        <div
          ref={scrollRef}
          onScroll={update}
          className={cn(
            'flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-9',
            className,
          )}
        >
          {children}
        </div>

        {/* Right arrow — desktop only */}
        <button
          tabIndex={-1}
          aria-hidden
          onClick={() => scroll(1)}
          className={cn(
            'absolute right-0 inset-y-0 my-auto z-10 hidden md:flex w-7 h-7 items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm transition-opacity duration-200',
            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          <ChevronRight size={14} className="text-gray-600" />
        </button>
      </div>

      {/* Custom scrollbar — always visible when content overflows */}
      {hasOverflow && (
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 h-full bg-teal-500 rounded-full"
            style={{
              width: thumbWidth,
              left: thumbOffset,
              transition: 'left 80ms ease-out, width 80ms ease-out',
            }}
          />
        </div>
      )}
    </div>
  );
}
