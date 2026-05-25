// =============================================================================
// TOPIC MEDIA — Centralized media component
//
// Pulls the default thumbnail and/or video embed for a topic from the
// centralized media registry (content/static/media-registry.json).
//
// Usage in page.tsx (server component):
//   <TopicMedia topic="gta-6" />                    → thumbnail + embed
//   <TopicMedia topic="gta-6" variant="video" />    → embed only
//   <TopicMedia topic="gta-6" variant="thumbnail" /> → thumbnail only
//   <TopicMedia topic="gta-6" variant="gallery" />  → interactive picker
//
// Usage in content_html (via ContentRenderer):
//   <TopicMedia topic="gta-6" variant="both" />
//
// To override with a specific item from the registry, pass mediaId:
//   <TopicMedia topic="gta-6" mediaId="gta6-trailer-1" />
//
// =============================================================================

import Image from 'next/image';
import { getTopicMedia, getMediaItem, getDefaultVideo, getDefaultThumbnail } from '@/lib/media-registry';
import type { MediaItem } from '@/lib/media-registry';
import TopicMediaGallery from './TopicMediaGallery';

export interface TopicMediaProps {
  /** Registry topic key, e.g. "gta-6" */
  topic: string;
  /**
   * - "both"       default: thumbnail above + video embed below
   * - "video"      video embed only
   * - "thumbnail"  thumbnail image only
   * - "gallery"    interactive strip of all topic media (client component)
   */
  variant?: 'both' | 'video' | 'thumbnail' | 'gallery';
  /**
   * Override: use a specific media item from the registry instead of the default.
   * Value must match a media item's `id` field for this topic.
   */
  mediaId?: string;
  /** Override the auto-generated caption */
  caption?: string;
  className?: string;
}

// ── Embed sub-component (pure server, no interaction) ────────────────────────

function VideoEmbed({ item, captionOverride }: { item: MediaItem; captionOverride?: string }) {
  const src =
    item.provider === 'vimeo'
      ? `https://player.vimeo.com/video/${item.videoId}`
      : `https://www.youtube.com/embed/${item.videoId}`;

  const caption = captionOverride ?? item.description ?? item.title;

  return (
    <div className="my-8 not-prose">
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg" style={{ aspectRatio: '16/9' }}>
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

// ── Thumbnail sub-component ───────────────────────────────────────────────────

function ThumbnailBlock({ item, captionOverride }: { item: MediaItem; captionOverride?: string }) {
  const caption = captionOverride ?? item.description ?? item.title;

  return (
    <figure className="my-6 not-prose">
      <div className="relative w-full overflow-hidden rounded-xl shadow-md" style={{ aspectRatio: '16/9' }}>
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

// ── Main server component ─────────────────────────────────────────────────────

export default function TopicMedia({
  topic,
  variant = 'both',
  mediaId,
  caption,
  className,
}: TopicMediaProps) {
  const entry = getTopicMedia(topic);

  if (!entry) {
    // Fail gracefully — unknown topics just render nothing in production
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="my-6 p-4 border border-dashed border-orange-400 rounded-lg text-sm text-orange-600 not-prose">
          <strong>TopicMedia:</strong> No registry entry found for topic <code>{topic}</code>.
          Add it to <code>content/static/media-registry.json</code>.
        </div>
      );
    }
    return null;
  }

  // Gallery variant delegates entirely to client component
  if (variant === 'gallery') {
    return (
      <div className={className}>
        <TopicMediaGallery topic={topic} entry={entry} captionOverride={caption} />
      </div>
    );
  }

  // Resolve item: mediaId override → default
  const videoItem = mediaId
    ? (getMediaItem(topic, mediaId) ?? getDefaultVideo(topic))
    : getDefaultVideo(topic);

  const thumbItem = mediaId
    ? (getMediaItem(topic, mediaId) ?? getDefaultThumbnail(topic))
    : getDefaultThumbnail(topic);

  return (
    <div className={className}>
      {variant === 'thumbnail' && thumbItem && (
        <ThumbnailBlock item={thumbItem} captionOverride={caption} />
      )}

      {variant === 'video' && videoItem && (
        <VideoEmbed item={videoItem} captionOverride={caption} />
      )}

      {variant === 'both' && (
        <>
          {/* Only show thumbnail separately if it's a different item than the default video */}
          {thumbItem && videoItem && thumbItem.id !== videoItem.id && (
            <ThumbnailBlock item={thumbItem} captionOverride={caption} />
          )}
          {videoItem && <VideoEmbed item={videoItem} captionOverride={caption} />}
        </>
      )}
    </div>
  );
}

// Re-export types for convenience
export type { MediaItem } from '@/lib/media-registry';
export type { TopicMediaEntry } from '@/lib/media-registry';
