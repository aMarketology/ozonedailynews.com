'use client';

import { useEffect, useState } from 'react';

/**
 * ReadingProgress — Floating scroll tracker
 *
 * Renders a thin progress bar at the top of the viewport showing how far
 * the reader has scrolled through the article body.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const articleBody = document.querySelector('[data-article-body]');
      if (!articleBody) return;

      const rect = articleBody.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Calculate how much of the article has been scrolled past
      const scrolledPast = scrollTop - articleTop + viewportHeight * 0.3;
      const totalScrollable = articleHeight + viewportHeight * 0.3;
      const pct = Math.min(100, Math.max(0, (scrolledPast / totalScrollable) * 100));
      setProgress(pct);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-700">
      <div
        className="h-full bg-blue-600 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default ReadingProgress;