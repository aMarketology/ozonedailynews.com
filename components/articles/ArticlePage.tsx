import Link from "next/link";
import Image from "next/image";
import React from "react";
import ArticleViewTracker from '@/components/articles/ArticleViewTracker';
import ArticleFooter from '@/components/articles/ArticleFooter';

// =============================================================================
// TYPES
// =============================================================================

export interface InfoBoxItem {
  label: string;
  value: string | React.ReactNode;
}

export interface InfoBoxSection {
  heading: string;
  /** Key/value pairs (rendered as <dl>) */
  items?: InfoBoxItem[];
  /** Bullet list items */
  list?: string[];
  /** Link list items */
  links?: Array<{ href: string; label: string; external?: boolean }>;
  /** Plain text (e.g. website URL) */
  text?: string;
  /** External href for plain-text links */
  href?: string;
}

export interface InfoBoxProps {
  title?: string;
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
  /** Flat key/value items (simple mode) */
  items?: InfoBoxItem[];
  /** Grouped sections (rich mode — replaces or supplements items) */
  sections?: InfoBoxSection[];
}

export interface TableOfContentsItem {
  id: string;
  label: string;
  level?: 1 | 2;
}

export interface ArticleSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface RelatedLink {
  href: string;
  label?: string;
  text?: string; // alias for label (used by older pages)
  description?: string;
}

export interface ArticlePageProps {
  title: string;
  subtitle?: string;
  category?: string;
  lastUpdated?: string;
  infoBox?: InfoBoxProps;
  tableOfContents?: TableOfContentsItem[];
  children: React.ReactNode;
  relatedLinks?: RelatedLink[];
  backLink?: {
    href: string;
    label: string;
  };
  /** Breadcrumb trail — takes precedence over backLink. Stored in article_pages.breadcrumbs JSONB. */
  breadcrumbs?: Array<{ href: string; label: string }>;
  /** Article slug (unique DB key, e.g. "daddywellness") — drives likes, saves, view history, and comments. */
  slug?: string;
  /** Canonical URL path (e.g. "/influencer/daddywellness") — used for view-history records. */
  url?: string;
}

// =============================================================================
// INFO BOX COMPONENT (News-style sidebar)
// =============================================================================

export function InfoBox({ title, image, items, sections }: InfoBoxProps) {
  return (
    <aside className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden sticky top-4 text-sm">
      {title && (
        <div className="bg-gray-100 p-3 border-b border-gray-200">
          <h2 className="font-bold text-center text-gray-900">{title}</h2>
        </div>
      )}

      {image && image.src && (
        <div className="bg-white border-b border-gray-200 p-4 text-center">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-auto mx-auto"
          />
          {image.caption && (
            <p className="text-xs text-gray-500 mt-2 italic">{image.caption}</p>
          )}
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Flat key/value items */}
        {items && items.length > 0 && (
          <dl className="space-y-2">
            {items.map((item, index) => (
              <div key={index}>
                <dt className="text-gray-500 text-xs">{item.label}</dt>
                <dd className="text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Grouped sections */}
        {sections && sections.map((section, i) => (
          <div key={i}>
            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">
              {section.heading}
            </h3>

            {/* Key/value pairs */}
            {section.items && section.items.length > 0 && (
              <dl className="space-y-2">
                {section.items.map((item, j) => (
                  <div key={j}>
                    <dt className="text-gray-500 text-xs">{item.label}</dt>
                    <dd className="text-gray-900">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Bullet list */}
            {section.list && section.list.length > 0 && (
              <ul className="space-y-1 text-xs">
                {section.list.map((entry, j) => (
                  <li key={j}>• {entry}</li>
                ))}
              </ul>
            )}

            {/* Link list */}
            {section.links && section.links.length > 0 && (
              <ul className="space-y-1">
                {section.links.map((link, j) => (
                  <li key={j}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-blue-600 hover:underline text-xs">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Plain text / external link */}
            {section.text && !section.href && (
              <p className="text-xs text-gray-900">{section.text}</p>
            )}
            {section.text && section.href && (
              <a
                href={section.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs"
              >
                {section.text}
              </a>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

// =============================================================================
// TABLE OF CONTENTS
// =============================================================================

export function TableOfContents({ items }: { items: TableOfContentsItem[] }) {
  return (
    <nav className="bg-gray-50 border border-gray-200 p-4 mb-8 rounded-lg">
      <h2 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">Contents</h2>
      <ol className="space-y-1 text-sm">
        {items.map((item, index) => (
          <li key={item.id} className={item.level === 2 ? "ml-4" : ""}>
            <a
              href={`#${item.id}`}
              className="text-blue-600 hover:underline"
            >
              {index + 1} {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// =============================================================================
// SECTION COMPONENT
// =============================================================================

export function Section({
  id,
  title,
  children,
  level = 2
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  level?: 2 | 3;
}) {
  const HeadingTag = level === 2 ? 'h2' : 'h3';
  const headingClass = level === 2
    ? "text-2xl font-serif border-b border-gray-200 pb-2 mb-4"
    : "text-lg font-semibold mb-3";

  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <HeadingTag className={headingClass}>{title}</HeadingTag>
      <div className="prose prose-lg prose-gray max-w-none">
        {children}
      </div>
    </section>
  );
}

// =============================================================================
// RELATED LINKS / SEE ALSO
// =============================================================================

export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  return (
    <section className="mt-10 pt-6 border-t border-gray-200">
      <h2 className="text-2xl font-serif border-b border-gray-200 pb-2 mb-4">See Also</h2>
      <ul className="space-y-1 text-sm">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.href}
              className="text-blue-600 hover:underline"
            >
              {link.label ?? link.text}
            </Link>
            {link.description && (
              <span className="text-gray-500 ml-1">,  {link.description}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// =============================================================================
// REFERENCES SECTION
// =============================================================================

export function References({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-8 pt-6 border-t border-gray-300">
      <h2 className="text-xl font-bold text-gray-900 mb-4">References</h2>
      <div className="text-sm text-gray-700">
        {children}
      </div>
    </section>
  );
}

// =============================================================================
// EXTERNAL LINKS
// =============================================================================

export function ExternalLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <section className="mt-8 pt-6 border-t border-gray-300">
      <h2 className="text-xl font-bold text-gray-900 mb-4">External Links</h2>
      <ul className="space-y-1">
        {links.map((link, index) => (
          <li key={index} className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <a 
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// =============================================================================
// QUOTE / BLOCKQUOTE
// =============================================================================

export function Quote({ 
  children, 
  source,
  text,
  author,
  context,
}: { 
  children?: React.ReactNode; 
  source?: string;
  // Legacy prop aliases used by older pages
  text?: string;
  author?: string;
  context?: string;
}) {
  const body = children ?? text;
  const footer = source ?? (author && context ? `${author}, ${context}` : author ?? context);
  return (
    <blockquote className="border-l-2 border-gray-300 pl-4 my-4 italic text-gray-700">
      {body}
      {footer && (
        <footer className="text-sm text-gray-500 mt-2 not-italic">,  {footer}</footer>
      )}
    </blockquote>
  );
}

// =============================================================================
// PAGE HEADER COMPONENT (Reusable Wikipedia-style header)
// =============================================================================

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  lastUpdated?: string;
  backLink?: {
    href: string;
    label: string;
  };
  breadcrumbs?: Array<{ href: string; label: string }>;
}

export function PageHeader({
  title,
  subtitle,
  category,
  lastUpdated,
  backLink,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <header className="border-b border-gray-200 pb-6 mb-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-3 text-sm text-gray-600">
            <ol className="flex items-center gap-2">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Link href={crumb.href} className="hover:underline">
                    {crumb.label}
                  </Link>
                  {index < breadcrumbs.length - 1 && <span className="text-gray-400">›</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Back Link (alternative to breadcrumbs) */}
        {backLink && !breadcrumbs && (
          <Link
            href={backLink.href}
            className="text-sm text-blue-600 hover:underline mb-3 inline-block"
          >
            ← {backLink.label}
          </Link>
        )}

        {/* Category Badge */}
        {category && (
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{category}</p>
        )}

        {/* Title */}
        <h1 className="text-4xl font-serif mb-2">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-gray-600 italic">{subtitle}</p>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-2">Last updated: {lastUpdated}</p>
        )}
      </div>
    </header>
  );
}

// =============================================================================
// MAIN ARTICLE PAGE LAYOUT
// =============================================================================

export function ArticlePage({
  title,
  subtitle,
  category,
  lastUpdated,
  infoBox,
  tableOfContents,
  children,
  relatedLinks,
  backLink,
  breadcrumbs,
  slug,
  url,
}: ArticlePageProps) {
  return (
    <main className="min-h-screen bg-white">
      {/* Record view in reading history for logged-in users */}
      {slug && url && (
        <ArticleViewTracker
          slug={slug}
          title={title}
          url={url}
          category={category}
        />
      )}

      {/* Use PageHeader component */}
      <PageHeader
        title={title}
        subtitle={subtitle ?? 'From OzoneNews, the verification-first intelligence platform'}
        category={category}
        lastUpdated={lastUpdated}
        backLink={backLink}
        breadcrumbs={breadcrumbs}
      />

      {/* Article Content */}
      <div className="container mx-auto px-4 max-w-6xl pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <article className="lg:col-span-8">
            {/* Main Content */}
            <div>
              {children}
            </div>

            {/* Related Links */}
            {relatedLinks && relatedLinks.length > 0 && (
              <RelatedLinks links={relatedLinks} />
            )}

            {/* Engagement stack — Tags, ReactionBar, Comments, Newsletter */}
            <ArticleFooter
              slug={slug ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
              title={title}
              url={url}
              category={category}
            />
          </article>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4">
            {/* Info Box */}
            {infoBox && <InfoBox {...infoBox} />}
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl text-center text-sm text-gray-600">
          <p>
            This article is part of{' '}
            <Link href="/" className="text-blue-600 hover:underline">OzoneNews</Link>'s coverage.
          </p>
        </div>
      </footer>
    </main>
  );
}

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

// Simple data table
export function DataTable({ 
  headers, 
  rows 
}: { 
  headers: string[]; 
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            {headers.map((header, i) => (
              <th key={i} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-gray-300 px-4 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Notice box (for warnings, notes, etc.)
export function Notice({ 
  type = 'note', 
  children 
}: { 
  type?: 'note' | 'warning' | 'info';
  children: React.ReactNode;
}) {
  const styles = {
    note: 'bg-blue-50 border-blue-300 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-900',
    info: 'bg-gray-50 border-gray-300 text-gray-900',
  };
  
  const icons = {
    note: 'ℹ️',
    warning: '⚠️',
    info: '📌',
  };

  return (
    <div className={`border rounded-sm p-4 my-4 ${styles[type]}`}>
      <span className="mr-2">{icons[type]}</span>
      {children}
    </div>
  );
}

// Image with caption
export function Figure({ 
  src, 
  alt, 
  caption,
  width = 'full'
}: { 
  src: string; 
  alt: string; 
  caption?: string;
  width?: 'full' | 'half' | 'third';
}) {
  const widthClasses = {
    full: 'w-full',
    half: 'w-full md:w-1/2',
    third: 'w-full md:w-1/3',
  };

  return (
    <figure className={`my-4 ${widthClasses[width]}`}>
      <img src={src} alt={alt} className="w-full h-auto border border-gray-300" />
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
