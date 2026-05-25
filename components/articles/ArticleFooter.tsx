/**
 * ArticleFooter — Standardized article bottom section
 *
 * Renders in this exact order:
 *  1. Tags
 *  2. ReactionBar (Like / Comment / Save)
 *  3. DiscordComments
 *  4. Author card
 *
 * Also broadcasts the author into FooterAuthorContext so the global
 * site footer (layout.tsx) can display it dynamically.
 *
 * Newsletter signup has moved to the global site footer.
 *
 * Used by NewsArticle, ArticlePage, and JackArticle so the engagement
 * stack is always identical across every article type.
 */

'use client';

import Link from 'next/link';
import ReactionBar from '@/components/engagement/ReactionBar';
import DiscordComments from '@/components/engagement/discord-comments';
import FooterAuthorBroadcast from '@/components/authors/FooterAuthorBroadcast';

export interface ArticleFooterAuthor {
  name: string;
  role?: string;
  avatar?: string;
  twitter?: string;
  authorSlug?: string;
  bio?: string;
}

export interface ArticleFooterProps {
  slug: string;
  title: string;
  url?: string;
  image?: string;
  category?: string;
  tags?: string[];
  author?: ArticleFooterAuthor;
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------
function TagsSection({ tags }: { tags: string[] }) {
  return (
    <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Filed under</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <Link
            key={i}
            href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-black hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white dark:hover:text-black transition-all duration-150 border border-transparent hover:border-black dark:hover:border-white"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Author Card
// ---------------------------------------------------------------------------
function AuthorCard({ author }: { author: ArticleFooterAuthor }) {
  return (
    <div className="flex items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
      {author.avatar ? (
        <img
          src={author.avatar}
          alt={author.name}
          className="w-16 h-16 rounded-full object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shrink-0">
          {author.name.charAt(0)}
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Written by</p>
        {author.authorSlug ? (
          <Link
            href={`/authors/${author.authorSlug}`}
            className="font-bold text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            {author.name}
          </Link>
        ) : (
          <p className="font-bold text-gray-900 dark:text-gray-100">{author.name}</p>
        )}
        {author.role && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{author.role}</p>
        )}
        {author.twitter && (
          <a
            href={`https://twitter.com/${author.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-600 hover:underline"
          >
            @{author.twitter}
          </a>
        )}
        {author.bio && (
          <p className="text-sm text-gray-500 mt-1">{author.bio}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ArticleFooter (main export)
// ---------------------------------------------------------------------------
export default function ArticleFooter({
  slug,
  title,
  url,
  image,
  category,
  tags,
  author,
}: ArticleFooterProps) {
  return (
    <>
      {/* Broadcast author to global footer */}
      <FooterAuthorBroadcast author={author ?? null} />

      {/* 1. Tags */}
      {tags && tags.length > 0 && <TagsSection tags={tags} />}

      {/* 2. ReactionBar */}
      <ReactionBar
        slug={slug}
        title={title}
        url={url}
        image={image}
        category={category}
      />

      {/* 3. Discord Comments */}
      <DiscordComments slug={slug} articleTitle={title} />

      {/* 4. Author Card */}
      {author && <AuthorCard author={author} />}
    </>
  );
}
