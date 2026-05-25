'use client';

// =============================================================================
// TOPIC MEDIA GALLERY — Interactive media picker (client component)
//
// Rendered by <TopicMedia topic="..." variant="gallery" />.
// Shows all media items for a topic as a thumbnail strip.
// Clicking a thumbnail switches the active video embed.
// =============================================================================

import { useState } from 'react';
import Image from 'next/image';
import type { TopicMediaEntry, MediaItem } from '@/lib/media-registry';

interface TopicMediaGalleryProps {
  topic: string;
  entry: TopicMediaEntry;
  captionOverride?: string;
}

export default function TopicMediaGallery({ entry, captionOverride }: TopicMediaGalleryProps) {
  const defaultItem =
    entry.media.find((m) => m.id === entry.defaultVideoId) ?? entry.media[0];

  const [activeItem, setActiveItem] = useState<MediaItem>(defaultItem);

  const src =
    activeItem.provider === 'vimeo'
      ? `https://player.vimeo.com/video/${activeItem.videoId}`
      : `https://www.youtube.com/embed/${activeItem.videoId}`;

  const caption = captionOverride ?? activeItem.description ?? activeItem.title;

  return (
    <div className="my-8 not-prose space-y-4">
      {/* Active video embed */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg bg-black" style={{ aspectRatio: '16/9' }}>
        <iframe
          key={activeItem.videoId}
          className="absolute inset-0 w-full h-full"
          src={src}
          title={activeItem.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Caption */}
      {caption && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 italic">
          {caption}
        </p>
      )}

      {/* Thumbnail strip — only shown when topic has more than one media item */}
      {entry.media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {entry.media.map((item) => {
            const isActive = item.id === activeItem.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item)}
                aria-label={`Switch to: ${item.title}`}
                className={`flex-shrink-0 group relative w-40 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'border-blue-500 shadow-md'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="relative w-40 h-[90px]">
                  <Image
                    src={item.thumbnailSrc}
                    alt={item.thumbnailAlt}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  {/* Active indicator overlay */}
                  {isActive && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Playing
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-white dark:bg-gray-900 text-left">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight line-clamp-2">
                    {item.title}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1 truncate">
                      {item.tags.slice(0, 3).join(' · ')}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
