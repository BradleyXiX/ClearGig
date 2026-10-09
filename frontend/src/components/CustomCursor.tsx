'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });

    const moveCursor = (e: MouseEvent) => {
      xTo(e.clientX - 10);
      yTo(e.clientY - 10);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        gsap.to(cursor, { scale: 2.5, duration: 0.3, ease: 'power2.out', backgroundColor: 'rgba(212, 255, 0, 0.2)', border: '1px solid #D4FF00' });
      } else {
        gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'power2.out', backgroundColor: '#D4FF00', border: 'none' });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-5 h-5 rounded-full pointer-events-none z-[9999]"
      style={{
        backgroundColor: '#D4FF00',
        mixBlendMode: 'difference',
        boxShadow: '0 0 15px rgba(212, 255, 0, 0.4)'
      }}
    />
  );
}
