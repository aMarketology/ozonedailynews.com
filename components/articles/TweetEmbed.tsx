'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

interface TweetEmbedProps {
  tweetId: string;
  handle?: string;
  mediaMaxWidth?: number;
}

/**
 * TweetEmbed — renders a Twitter/X embed blockquote and loads the Twitter
 * widget script so the tweet renders as a fully styled embed card.
 *
 * Usage:
 *   <TweetEmbed tweetId="2052445786651168849" handle="claudeai" />
 *
 * The TweetEmbed tag survives wiki:publish as a component tag in content_html.
 * ContentRenderer parses it and renders this component on the page.
 */
export function TweetEmbed({ tweetId, handle = 'i', mediaMaxWidth = 560 }: TweetEmbedProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.twttr?.widgets) {
      window.twttr.widgets.load();
      return;
    }
    if (document.querySelector('script[src*="widgets.js"]')) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://platform.twitter.com/widgets.js';
    script.charset = 'utf-8';
    document.body.appendChild(script);
  }, [tweetId]);

  const tweetUrl = `https://twitter.com/${handle}/status/${tweetId}?ref_src=twsrc%5Etfw`;

  return (
    <div className="my-6 flex justify-center not-prose">
      <blockquote
        className="twitter-tweet"
        data-media-max-width={String(mediaMaxWidth)}
        style={{ maxWidth: 550 }}
      >
        <a href={tweetUrl}>View tweet on X</a>
      </blockquote>
    </div>
  );
}
