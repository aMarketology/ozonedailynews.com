'use client';

// components/admin/AdminArticleForm.tsx
// Full article editor form. Used by both /admin/articles/new and /admin/articles/edit/[slug].
// Saves draft to Supabase. Publish button calls the Git bridge API.

import { useState, useEffect } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'News', 'Tech', 'Finance', 'Entertainment', 'World',
  'Politics', 'Science', 'Sports', 'Culture', 'Crypto', 'Gaming',
];

const BRANDS = [
  { value: 'ozone',     label: 'OzoneDaily (master)' },
  { value: 'basil',     label: 'BasilNews (basil)' },
  { value: 'obsidian',  label: 'ObsidianPaper (obsidian)' },
  { value: 'honey',     label: 'HoneyNewspaper (honey)' },
  { value: 'onyx',      label: 'OnyxTimes (onyx)' },
  { value: 'clover',    label: 'CloverHeadlines (clover)' },
  { value: 'content',   label: 'ContentNewsNow (content)' },
  { value: 'objective', label: 'ObjectiveWire (objective)' },
];

const KNOWN_AUTHORS = [
  { name: 'Max DeLeonardis',         slug: 'max-deleonardis' },
  { name: 'Simon Alfred Minter',            slug: 'simon-minter' },
  { name: 'OzoneNews Editorial Team', slug: 'ozonedailynews-editorial-team' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function isoNow(): string {
  const now = new Date();
  const offset = -now.getTimezoneOffset();
  const sign   = offset >= 0 ? '+' : '-';
  const pad    = (n: number) => String(Math.abs(n)).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:00${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
}

function displayDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface InitialData {
  slug?:         string;
  title?:        string;
  subtitle?:     string;
  category?:     string;
  brand_slug?:   string;
  article_type?: string;
  author_name?:  string;
  author_slug?:  string;
  content_html?: string;
  tags?:         string[];
  thumbnail_src?: string;
  thumbnail_alt?: string;
  breaking?:     boolean;
  trending?:     boolean;
  exclusive?:    boolean;
  published_at?: string;
  metadata?: {
    title?:       string;
    description?: string;
    keywords?:    string[];
    alternates?:  { canonical?: string };
  };
}

interface Props {
  initialData?: InitialData;
  isEdit?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminArticleForm({ initialData, isEdit = false }: Props) {
  const [title,           setTitle]         = useState(initialData?.title ?? '');
  const [subtitle,        setSubtitle]      = useState(initialData?.subtitle ?? '');
  const [slug,            setSlug]          = useState(initialData?.slug ?? '');
  const [category,        setCategory]      = useState(initialData?.category ?? 'News');
  const [brandSlug,       setBrandSlug]     = useState(initialData?.brand_slug ?? 'ozone');
  const [articleType,     setArticleType]   = useState(initialData?.article_type ?? 'news_article');
  const [authorName,      setAuthorName]    = useState(initialData?.author_name ?? KNOWN_AUTHORS[0].name);
  const [authorSlug,      setAuthorSlug]    = useState(initialData?.author_slug ?? KNOWN_AUTHORS[0].slug);
  const [contentHtml,     setContentHtml]   = useState(initialData?.content_html ?? '');
  const [tags,            setTags]          = useState((initialData?.tags ?? []).join(', '));
  const [thumbnailSrc,    setThumbnailSrc]  = useState(initialData?.thumbnail_src ?? '');
  const [thumbnailAlt,    setThumbnailAlt]  = useState(initialData?.thumbnail_alt ?? '');
  const [breaking,        setBreaking]      = useState(initialData?.breaking ?? false);
  const [trending,        setTrending]      = useState(initialData?.trending ?? false);
  const [exclusive,       setExclusive]     = useState(initialData?.exclusive ?? false);
  const [publishedAt,     setPublishedAt]   = useState(initialData?.published_at ?? isoNow());
  const [metaTitle,       setMetaTitle]     = useState(initialData?.metadata?.title ?? '');
  const [metaDesc,        setMetaDesc]      = useState(initialData?.metadata?.description ?? '');
  const [metaCanonical,   setMetaCanonical] = useState(initialData?.metadata?.alternates?.canonical ?? '');
  const [metaKeywords,    setMetaKeywords]  = useState((initialData?.metadata?.keywords ?? []).join(', '));

  const [saving,          setSaving]        = useState(false);
  const [publishing,      setPublishing]    = useState(false);
  const [message,         setMessage]       = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Auto-generate slug from title (only if not editing and slug hasn't been manually set)
  const [slugLocked, setSlugLocked] = useState(isEdit);

  useEffect(() => {
    if (!slugLocked && title) {
      setSlug(titleToSlug(title));
    }
  }, [title, slugLocked]);

  // Auto-set canonical from slug
  useEffect(() => {
    if (slug && !isEdit) {
      setMetaCanonical(`https://www.ozonedailynews.com/${slug}`);
    }
  }, [slug, isEdit]);

  function buildPayload() {
    return {
      slug,
      title,
      subtitle,
      category,
      brand_slug:   brandSlug,
      article_type: articleType,
      author_name:  authorName,
      author_slug: authorSlug,
      content_html: contentHtml,
      tags:         tags.split(',').map((t) => t.trim()).filter(Boolean),
      thumbnail_src: thumbnailSrc,
      thumbnail_alt: thumbnailAlt,
      breaking,
      trending,
      exclusive,
      published_at:  publishedAt,
      publish_date:  displayDate(publishedAt),
      url:           metaCanonical,
      metadata: {
        title:       metaTitle || title,
        description: metaDesc,
        keywords:    metaKeywords.split(',').map((k) => k.trim()).filter(Boolean),
        alternates:  { canonical: metaCanonical },
        openGraph: {
          title:       metaTitle || title,
          description: metaDesc,
          images:      thumbnailSrc ? [{ url: thumbnailSrc, width: 1200, height: 675, alt: thumbnailAlt }] : [],
        },
      },
    };
  }

  async function handleSaveDraft() {
    if (!slug) return setMessage({ type: 'err', text: 'Slug is required.' });
    setSaving(true);
    setMessage(null);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url    = isEdit
        ? `/api/cms/articles/${slug}`
        : '/api/cms/articles';

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const json = await res.json() as { ok?: boolean; slug?: string; error?: string };

      if (res.ok) {
        setMessage({ type: 'ok', text: `Draft saved. Slug: ${json.slug ?? slug}` });
        if (!isEdit) {
          // Redirect to edit page after first save
          window.location.href = `/admin/articles/edit/${json.slug ?? slug}`;
        }
      } else {
        setMessage({ type: 'err', text: json.error ?? 'Save failed.' });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!slug) return setMessage({ type: 'err', text: 'Save the draft first.' });
    if (!confirm(`Publish "${title}" to GitHub? This will commit the article and trigger a site rebuild.`)) return;

    setPublishing(true);
    setMessage(null);

    // Save latest changes first
    await handleSaveDraft();

    try {
      const res  = await fetch('/api/cms/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const json = await res.json() as {
        ok?: boolean;
        error?: string;
        details?: string[];
        url?: string;
        message?: string;
      };

      if (json.ok) {
        setMessage({
          type: 'ok',
          text: `Published to GitHub. ${json.message ?? ''} Live URL: ${json.url ?? ''}`,
        });
      } else {
        const detail = json.details ? json.details.join('\n') : (json.error ?? 'Publish failed.');
        setMessage({ type: 'err', text: detail });
      }
    } finally {
      setPublishing(false);
    }
  }

  function selectAuthor(authorSlugVal: string) {
    const found = KNOWN_AUTHORS.find((a) => a.slug === authorSlugVal);
    if (found) {
      setAuthorName(found.name);
      setAuthorSlug(found.slug);
    }
  }

  const descLen = metaDesc.length;
  const descOk  = descLen >= 130 && descLen <= 155;

  return (
    <div className="max-w-4xl">
      {/* Feedback */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded text-sm whitespace-pre-wrap ${
          message.type === 'ok'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">

        {/* Section: Identity */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Identity</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title (no em dashes)"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Optional subtitle"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Slug *
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => setSlugLocked(!slugLocked)}
                    className="ml-2 text-blue-600 underline font-normal"
                  >
                    {slugLocked ? 'auto' : 'lock'}
                  </button>
                )}
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlugLocked(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }}
                disabled={isEdit}
                placeholder="auto-generated-from-title"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
              <select
                value={brandSlug}
                onChange={(e) => setBrandSlug(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {BRANDS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Content Type</label>
              <select
                value={articleType}
                onChange={(e) => setArticleType(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="news_article">News Article (Standard)</option>
                <option value="jack_article">Jack Article (Long-form / Investigation)</option>
                <option value="article_page">Article Page (Evergreen Guide)</option>
                <option value="creator_article">Creator Article (Influencer Profile)</option>
                <option value="wiki_article">Wiki Article (Glossary / Definition)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Author</label>
              <select
                value={authorSlug}
                onChange={(e) => selectAuthor(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {KNOWN_AUTHORS.map((a) => (
                  <option key={a.slug} value={a.slug}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Publish Date (ISO-8601 with TZ) *</label>
              <input
                type="text"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                placeholder="2026-05-26T14:00:00-05:00"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-end gap-4 pb-1">
              {[
                { label: 'Breaking', val: breaking, set: setBreaking },
                { label: 'Trending', val: trending, set: setTrending },
                { label: 'Exclusive', val: exclusive, set: setExclusive },
              ].map(({ label, val, set }) => (
                <label key={label} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => set(e.target.checked)}
                    className="rounded"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Media */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Thumbnail</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Thumbnail URL</label>
              <input
                type="url"
                value={thumbnailSrc}
                onChange={(e) => setThumbnailSrc(e.target.value)}
                placeholder="https://...supabase.../storage/v1/object/public/media/thumbnails/slug.webp"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Alt text</label>
              <input
                type="text"
                value={thumbnailAlt}
                onChange={(e) => setThumbnailAlt(e.target.value)}
                placeholder="Descriptive alt text for the image"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Section: Content */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            Content HTML
            <span className="ml-2 font-normal text-gray-400 normal-case">
              {contentHtml.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </h2>
          <p className="text-xs text-gray-500">
            Paste HTML with GEO components. Required: 300+ words, at least one &lt;h2&gt;,
            blue underlined links, no em dashes.
          </p>
          <textarea
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            rows={28}
            spellCheck
            className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 resize-y"
            placeholder={'<h2>Section Heading | Specific Detail</h2>\n<p>Body copy here...</p>'}
          />
        </section>

        {/* Section: Tags */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Tags</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tags (comma-separated, 4-8 proper nouns)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="NASA, James Webb Space Telescope, Hubble, SpaceX"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </section>

        {/* Section: SEO Metadata */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">SEO Metadata</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              metadata.title
              <span className={`ml-2 ${metaTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                {metaTitle.length}/60
              </span>
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Primary Keyword | Specific Detail (max 60 chars, no brand suffix)"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              metadata.description
              <span className={`ml-2 font-medium ${
                descOk
                  ? 'text-green-600'
                  : descLen < 130
                  ? 'text-yellow-600'
                  : 'text-red-500'
              }`}>
                {descLen} chars
                {descLen < 130 && ` (need ${130 - descLen} more)`}
                {descLen > 155 && ` (${descLen - 155} over limit)`}
                {descOk && ' ✓'}
              </span>
            </label>
            <textarea
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              rows={3}
              placeholder="Primary keyword in first 60 chars. 130-155 chars total. No AI boilerplate."
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none resize-none ${
                descOk ? 'border-green-400 focus:border-green-500' : 'border-gray-300 focus:border-blue-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Canonical URL</label>
            <input
              type="url"
              value={metaCanonical}
              onChange={(e) => setMetaCanonical(e.target.value)}
              placeholder="https://www.ozonedailynews.com/category/slug"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Keywords (comma-separated)</label>
            <input
              type="text"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="nasa news, james webb telescope, space exploration"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </section>

        {/* Action buttons */}
        <div className="flex items-center gap-4 pb-12">
          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-md disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={handlePublish}
            disabled={saving || publishing}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md disabled:opacity-50"
          >
            {publishing ? 'Publishing to GitHub...' : 'Publish to GitHub'}
          </button>

          <a
            href="/admin/articles"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}
