import rawRegistry from '@/content/static/media-registry.json';

// =============================================================================
// MEDIA REGISTRY — Types & Server Helpers
//
// Central catalog of topic-keyed media assets (YouTube videos + thumbnails).
// Used by <TopicMedia topic="gta-6" /> to auto-populate the default thumbnail
// and embed video for a given topic when writing articles.
//
// To add media: edit content/static/media-registry.json.
// =============================================================================

export interface MediaItem {
  /** Unique identifier within the registry, e.g. "gta6-trailer-2" */
  id: string;
  /** YouTube / Vimeo video ID */
  videoId: string;
  /** Full descriptive title for the iframe title attr and caption */
  title: string;
  /** Thumbnail image URL. For YouTube use the maxresdefault auto-URL. */
  thumbnailSrc: string;
  /** Alt text for the thumbnail */
  thumbnailAlt: string;
  /** Short human-readable description / date context */
  description?: string;
  provider?: 'youtube' | 'vimeo';
  tags?: string[];
}

export interface TopicMediaEntry {
  /** Human-readable label, e.g. "Grand Theft Auto VI" */
  label: string;
  /** ID of the default MediaItem to use for video embeds */
  defaultVideoId: string;
  /** ID of the default MediaItem to use for thumbnails */
  defaultThumbnailId: string;
  /** All available media items for this topic */
  media: MediaItem[];
}

export type MediaRegistry = Record<string, TopicMediaEntry>;

// ── Registry loader ───────────────────────────────────────────────────────────
// Uses a static JSON import — works in both server and client components.
// The _comment key is stripped at load time.

const { _comment: _omit, ...typedRegistry } = rawRegistry as unknown as {
  _comment?: unknown;
} & MediaRegistry;

export function getMediaRegistry(): MediaRegistry {
  return typedRegistry as MediaRegistry;
}

/**
 * Returns the full TopicMediaEntry for a topic key, or null if not found.
 * @param topic  e.g. "gta-6"
 */
export function getTopicMedia(topic: string): TopicMediaEntry | null {
  const registry = getMediaRegistry();
  return registry[topic] ?? null;
}

/**
 * Returns a specific MediaItem by topic + item id.
 */
export function getMediaItem(topic: string, mediaId: string): MediaItem | null {
  const entry = getTopicMedia(topic);
  if (!entry) return null;
  return entry.media.find((m) => m.id === mediaId) ?? null;
}

/**
 * Returns the default video MediaItem for a topic.
 */
export function getDefaultVideo(topic: string): MediaItem | null {
  const entry = getTopicMedia(topic);
  if (!entry) return null;
  return entry.media.find((m) => m.id === entry.defaultVideoId) ?? entry.media[0] ?? null;
}

/**
 * Returns the default thumbnail MediaItem for a topic.
 */
export function getDefaultThumbnail(topic: string): MediaItem | null {
  const entry = getTopicMedia(topic);
  if (!entry) return null;
  return entry.media.find((m) => m.id === entry.defaultThumbnailId) ?? entry.media[0] ?? null;
}

/**
 * Returns all registered topic keys.
 */
export function getAllTopicKeys(): string[] {
  return Object.keys(getMediaRegistry());
}
