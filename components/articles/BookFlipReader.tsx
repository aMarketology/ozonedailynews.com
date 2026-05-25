'use client';

/**
 * BookFlipReader — JS proximity scroll-snap per H2, "reading chapters" feel.
 *
 * No visual animation. No fade-in. Just sticky scroll behavior:
 *  - As the user scrolls and stops near an H2 subheading, the page smoothly
 *    snaps that heading to the top of the viewport so they don't lose their
 *    place between sections.
 *  - Sticky-friendly: we do NOT use CSS `scroll-snap-type` on <html>, because
 *    that breaks `position: sticky` on the TOC in Chrome/Safari. The snap is
 *    implemented entirely in JS via a debounced scroll listener.
 *  - Respects `prefers-reduced-motion` — snap disabled.
 */

import { useEffect } from 'react';

const SNAP_SETTLE_MS = 180;        // wait this long after scroll stops before snapping
const SNAP_THRESHOLD_BELOW = 240;  // snap if an H2 is up to this many px BELOW viewport top
const SNAP_THRESHOLD_ABOVE = 48;   // snap UP only if you barely scrolled past (under ~2 lines)
const SNAP_DEADZONE = 12;          // already at the top within this many px — no snap

export default function BookFlipReader() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-article-body="true"]');
    if (!root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const h2s = Array.from(root.querySelectorAll<HTMLHeadingElement>('h2'));
    if (!h2s.length) return;

    // Ensure each H2 has scroll-margin so it clears the sticky nav on snap.
    h2s.forEach((h2) => {
      h2.style.scrollMarginTop = '5.5rem';
    });

    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    let isSnapping = false;
    let suppressUntil = 0; // unix ms — snap disabled until this timestamp

    // ArticleTOC dispatches this when a user clicks a TOC link. We pause our
    // proximity snap for ~1.1s so the click's smooth scroll can complete
    // without the two scroll animations fighting each other. After suppression
    // expires, normal proximity snap resumes from wherever the click landed.
    const onSuppress = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      const dur = typeof detail === 'number' ? detail : 1100;
      suppressUntil = Date.now() + dur;
    };
    window.addEventListener('book-flip:suppress-snap', onSuppress);

    const onScroll = () => {
      if (isSnapping || Date.now() < suppressUntil) return;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (Date.now() < suppressUntil) return;

        // Find the nearest H2 to the viewport top in EITHER direction.
        // - Below the top within SNAP_THRESHOLD_BELOW px → pull it up to the top.
        // - Above the top within SNAP_THRESHOLD_ABOVE px → pull it down to the top.
        // Pick whichever is closer by absolute distance.
        let closest: HTMLHeadingElement | null = null;
        let closestDist = Infinity;
        for (const h2 of h2s) {
          const top = h2.getBoundingClientRect().top;
          const inBelowWindow = top > SNAP_DEADZONE && top < SNAP_THRESHOLD_BELOW;
          const inAboveWindow = top < -SNAP_DEADZONE && top > -SNAP_THRESHOLD_ABOVE;
          if (!inBelowWindow && !inAboveWindow) continue;
          const dist = Math.abs(top);
          if (dist < closestDist) {
            closest = h2;
            closestDist = dist;
          }
        }
        if (!closest) return;
        isSnapping = true;
        closest.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { isSnapping = false; }, 900);
      }, SNAP_SETTLE_MS);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('book-flip:suppress-snap', onSuppress);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, []);

  return null;
}

