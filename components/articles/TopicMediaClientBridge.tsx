'use client';

// =============================================================================
// TOPIC MEDIA CLIENT BRIDGE
//
// Client-safe wrapper around the media registry used inside ContentRenderer
// (which is 'use client'). All rendering logic lives here so that TopicMedia
// server component can remain a pure server component.
//
// The registry is loaded from a static JSON import — no fs, safe in browsers.
// =============================================================================

import { useState } from 'react';
import Image from 'next/image';
import {
  getTopicMedia,
  getMediaItem,
  getDefaultVideo,
  getDefaultThumbnail,
} from '@/lib/media-registry';
import type { MediaItem, TopicMediaEntry } from '@/lib/media-registry';

interface Props {
  topic: string;
  variant?: 'both' | 'video' | 'thumbnail' | 'gallery';
  mediaId?: string;
  caption?: string;
}

// ── Video embed ───────────────────────────────────────────────────────────────

function VideoEmbed({ item, captionOverride }: { item: MediaItem; captionOverride?: string }) {
  const src =
    item.provider === 'vimeo'
      ? `https://player.vimeo.com/video/${item.videoId}`
      : `https://www.youtube.com/embed/${item.videoId}`;
  const caption = captionOverride ?? item.description ?? item.title;
  return (
    <div className="my-8 not-prose">
      <div
        className="relative w-full overflow-hidden rounded-xl shadow-lg"
        style={{ aspectRatio: '16/9' }}
      >
        <iframe
          className="absolute inset-0 w-full h-full"
          src={src}
          title={item.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {caption && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
          {caption}
        </p>
      )}
    </div>
  );
}

// ── Thumbnail ─────────────────────────────────────────────────────────────────

function ThumbnailBlock({ item, captionOverride }: { item: MediaItem; captionOverride?: string }) {
  const caption = captionOverride ?? item.description ?? item.title;
  return (
    <figure className="my-6 not-prose">
      <div
        className="relative w-full overflow-hidden rounded-xl shadow-md"
        style={{ aspectRatio: '16/9' }}
      >
        <Image
          src={item.thumbnailSrc}
          alt={item.thumbnailAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>
      {caption && (
        <figcaption className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Interactive gallery picker ────────────────────────────────────────────────

function GalleryPicker({
  entry,
  captionOverride,
}: {
  entry: TopicMediaEntry;
  captionOverride?: string;
}) {
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
      <div
        className="relative w-full overflow-hidden rounded-xl shadow-lg bg-black"
        style={{ aspectRatio: '16/9' }}
      >
        <iframe
          key={activeItem.videoId}
          className="absolute inset-0 w-full h-full"
          src={src}
          title={activeItem.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {caption && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 italic">{caption}</p>
      )}

      {entry.media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {entry.media.map((item) => {
            const isActive = item.id === activeItem.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item)}
                aria-label={`Switch to: ${item.title}`}
                className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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

// ── Main export ───────────────────────────────────────────────────────────────

export function TopicMediaClientBridge({ topic, variant = 'both', mediaId, caption }: Props) {
  const entry = getTopicMedia(topic);
  if (!entry) return null;

  if (variant === 'gallery') {
    return <GalleryPicker entry={entry} captionOverride={caption} />;
  }

  const videoItem = mediaId
    ? (getMediaItem(topic, mediaId) ?? getDefaultVideo(topic))
    : getDefaultVideo(topic);

  const thumbItem = mediaId
    ? (getMediaItem(topic, mediaId) ?? getDefaultThumbnail(topic))
    : getDefaultThumbnail(topic);

  return (
    <>
      {variant === 'thumbnail' && thumbItem && (
        <ThumbnailBlock item={thumbItem} captionOverride={caption} />
      )}
      {variant === 'video' && videoItem && (
        <VideoEmbed item={videoItem} captionOverride={caption} />
      )}
      {variant === 'both' && (
        <>
          {thumbItem && videoItem && thumbItem.id !== videoItem.id && (
            <ThumbnailBlock item={thumbItem} captionOverride={caption} />
          )}
          {videoItem && <VideoEmbed item={videoItem} captionOverride={caption} />}
        </>
      )}
    </>
  );
}
