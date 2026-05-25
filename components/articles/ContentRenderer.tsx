/**
 * ContentRenderer — Renders content_html strings that contain a mix of raw HTML
 * and embedded JSX component tags (e.g. <PrismTable>, <HighlightBox>, <Timeline>).
 *
 * When content is stored in Supabase via wiki:publish, JSX component tags survive
 * the extraction as literal strings. Using dangerouslySetInnerHTML drops them
 * because the browser's HTML parser treats unknown tags as opaque blocks.
 *
 * This component splits the HTML string on known component boundaries, renders
 * the HTML segments via dangerouslySetInnerHTML, and renders recognised component
 * tags as actual React components with parsed props.
 *
 * Usage (drop-in replacement for dangerouslySetInnerHTML):
 *   <ContentRenderer html={row.content_html ?? ''} />
 */

'use client';

import React from 'react';
import { PrismTable } from '@/components/articles/PrismTable';
import {
  HighlightBox,
  EmbedBox,
  Timeline,
  RelatedStories,
} from '@/components/articles/NewsArticle';
import {
  JackCallout,
  JackCard,
  JackCardGrid,
  JackIndicatorGrid,
  JackSection,
  JackSubheading,
  JackQuote,
  JackVideo,
  JackImage,
  JackSideBlock,
  JackCaseOverview,
  JackStats,
  JackProcess,
  ScienceCallout,
  FactList,
} from '@/components/articles/JackArticle';
import type { JackAccentColor } from '@/components/articles/JackArticle';
import {
  CreatorSection,
  CreatorCalloutBox,
  CreatorQuote,
  CreatorStat,
  CreatorTable,
  CreatorImageGallery,
} from '@/components/articles/CreatorArticle';
import type { CreatorCalloutColor, CreatorTableColumn, CreatorTableRow, CreatorGalleryImage } from '@/components/articles/CreatorArticle';
import { TweetEmbed } from '@/components/articles/TweetEmbed';
import FAQAccordion from '@/components/FAQAccordion';
import { SourcesInterlink } from '@/components/articles/SourcesInterlink';
import type { SourceItem, InternalLinkItem } from '@/components/articles/SourcesInterlink';
import { TopicMediaClientBridge } from '@/components/articles/TopicMediaClientBridge';

// ── Known component registry ────────────────────────────────────────────────

interface ComponentDef {
  render: (props: Record<string, unknown>) => React.ReactNode;
  selfClosing?: boolean;
}

const COMPONENTS: Record<string, ComponentDef> = {
  // ── NewsArticle components ────────────────────────────────────────────────
  PrismTable: {
    render: (props) => (
      <PrismTable
        accent={(props.accent as 'blue' | 'purple' | 'red' | 'green' | 'orange' | 'cyan' | 'yellow') ?? 'purple'}
        headers={props.headers as [string, string] | undefined}
        rows={(props.rows as [string, string][]) ?? []}
        caption={props.caption as string | undefined}
      />
    ),
    selfClosing: true,
  },
  HighlightBox: {
    render: (props) => (
      <HighlightBox
        type={(props.type as 'quote' | 'key-point' | 'stat') ?? 'quote'}
        color={(props.color as 'purple' | 'blue' | 'pink' | 'orange' | 'green') ?? 'purple'}
      >
        <ContentRenderer html={(props.__children as string) ?? ''} />
      </HighlightBox>
    ),
  },
  Timeline: {
    render: (props) => (
      <Timeline events={Array.isArray(props.events) ? (props.events as Array<{ time: string; title: string; description?: string }>) : []} />
    ),
    selfClosing: true,
  },
  // TagsSection removed from ContentRenderer — tags are rendered by ArticleFooter
  // from the Supabase `tags` column, preventing duplicates.
  EmbedBox: {
    render: (props) => (
      <EmbedBox
        platform={(props.platform as 'twitter' | 'instagram' | 'youtube' | 'tiktok') ?? 'twitter'}
        handle={(props.handle as string) ?? ''}
        description={props.description as string | undefined}
        link={props.link as string | undefined}
      />
    ),
    selfClosing: true,
  },
  RelatedStories: {
    render: (props) => (
      <RelatedStories
        stories={(props.stories as Array<{ href: string; title: string; category: string; image?: string; date?: string }>) ?? []}
      />
    ),
    selfClosing: true,
  },
  // ── JackArticle components ────────────────────────────────────────────────
  JackSection: {
    render: (props) => (
      <JackSection
        number={props.number as number | string | undefined}
        title={(props.title as string) ?? ''}
        accentColor={props.accentColor as JackAccentColor | undefined}
      >
        <ContentRenderer html={(props.__children as string) ?? ''} />
      </JackSection>
    ),
  },
  JackSubheading: {
    render: (props) => (
      <JackSubheading>
        <span dangerouslySetInnerHTML={{ __html: (props.__children as string) ?? '' }} />
      </JackSubheading>
    ),
  }, // plain text only — no nested components expected
  JackCallout: {
    render: (props) => (
      <JackCallout
        label={props.label as string | undefined}
        accentColor={props.accentColor as JackAccentColor | undefined}
      >
        <ContentRenderer html={(props.__children as string) ?? ''} />
      </JackCallout>
    ),
  },
  JackQuote: {
    render: (props) => (
      <JackQuote
        quote={(props.quote as string) ?? ''}
        author={props.author as string | undefined}
        title={props.title as string | undefined}
        accentColor={props.accentColor as JackAccentColor | undefined}
      />
    ),
    selfClosing: true,
  },
  JackCard: {
    render: (props) => (
      <JackCard
        title={(props.title as string) ?? ''}
        variant={props.variant as 'white' | 'gray' | undefined}
      >
        <ContentRenderer html={(props.__children as string) ?? ''} />
      </JackCard>
    ),
  },
  JackCardGrid: {
    render: (props) => (
      <JackCardGrid columns={props.columns as 2 | 3 | undefined}>
        <ContentRenderer html={(props.__children as string) ?? ''} />
      </JackCardGrid>
    ),
  },
  JackIndicatorGrid: {
    render: (props) => (
      <JackIndicatorGrid
        title={props.title as string | undefined}
        items={(props.items as Array<{ label: string; description: string }>) ?? []}
      />
    ),
    selfClosing: true,
  },
  JackVideo: {
    render: (props) => (
      <JackVideo
        videoId={(props.videoId as string) ?? ''}
        title={(props.title as string) ?? ''}
        caption={props.caption as string | undefined}
        provider={props.provider as 'youtube' | 'vimeo' | undefined}
      />
    ),
    selfClosing: true,
  },
  JackImage: {
    render: (props) => (
      <JackImage
        src={(props.src as string) ?? ''}
        alt={(props.alt as string) ?? ''}
        caption={props.caption as string | undefined}
        credit={props.credit as string | undefined}
      />
    ),
    selfClosing: true,
  },
  JackSideBlock: {
    render: (props) => (
      <JackSideBlock
        title={(props.title as string) ?? ''}
        accentColor={props.accentColor as JackAccentColor | undefined}
      >
        <ContentRenderer html={(props.__children as string) ?? ''} />
      </JackSideBlock>
    ),
  },
  JackCaseOverview: {
    render: (props) => (
      <JackCaseOverview
        title={props.title as string | undefined}
        items={(props.items as Array<{ label: string; value: string }>) ?? []}
        accentColor={props.accentColor as JackAccentColor | undefined}
      />
    ),
    selfClosing: true,
  },
  JackStats: {
    render: (props) => (
      <JackStats
        title={props.title as string | undefined}
        stats={(props.stats as Array<{ value: string; label: string }>) ?? []}
        accentColor={props.accentColor as JackAccentColor | undefined}
      />
    ),
    selfClosing: true,
  },
  JackProcess: {
    render: (props) => (
      <JackProcess
        title={(props.title as string) ?? ''}
        steps={(props.steps as Array<{ title: string; description: string }>) ?? []}
        accentColor={props.accentColor as JackAccentColor | undefined}
      />
    ),
    selfClosing: true,
  },
  ScienceCallout: {
    render: (props) => (
      <ScienceCallout type={props.type as 'key-finding' | 'clinical-data' | 'warning' | 'source' | 'definition' | undefined}>
        <span dangerouslySetInnerHTML={{ __html: (props.__children as string) ?? '' }} />
      </ScienceCallout>
    ),
  },
  FactList: {
    render: (props) => (
      <FactList
        title={props.title as string | undefined}
        items={(props.items as Array<{ label: string; value: string }>) ?? []}
      />
    ),
    selfClosing: true,
  },
  // ── CreatorArticle components ─────────────────────────────────────────────
  CreatorSection: {
    render: (props) => (
      <CreatorSection
        heading={(props.heading as string) ?? ''}
        prose={props.prose as boolean | undefined}
      >
        <span dangerouslySetInnerHTML={{ __html: (props.__children as string) ?? '' }} />
      </CreatorSection>
    ),
  },
  CreatorCalloutBox: {
    render: (props) => (
      <CreatorCalloutBox
        heading={(props.heading as string) ?? ''}
        items={(props.items as Array<{ label: string; detail: string }>) ?? []}
        color={(props.color as CreatorCalloutColor) ?? 'blue'}
      />
    ),
    selfClosing: true,
  },
  CreatorQuote: {
    render: (props) => (
      <CreatorQuote
        quote={(props.quote as string) ?? ''}
        attribution={props.attribution as string | undefined}
        role={props.role as string | undefined}
      />
    ),
    selfClosing: true,
  },
  CreatorStat: {
    render: (props) => (
      <CreatorStat
        value={(props.value as string) ?? ''}
        label={(props.label as string) ?? ''}
        sub={props.sub as string | undefined}
        color={(props.color as 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'gray') ?? 'blue'}
      />
    ),
    selfClosing: true,
  },
  CreatorTable: {
    render: (props) => (
      <CreatorTable
        columns={(props.columns as CreatorTableColumn[]) ?? []}
        rows={(props.rows as CreatorTableRow[]) ?? []}
        highlightKey={props.highlightKey as string | undefined}
        highlightValue={props.highlightValue as string | undefined}
      />
    ),
    selfClosing: true,
  },
  CreatorImageGallery: {
    render: (props) => (
      <CreatorImageGallery
        images={(props.images as CreatorGalleryImage[]) ?? []}
        heading={props.heading as string | undefined}
      />
    ),
    selfClosing: true,
  },
  TweetEmbed: {
    render: (props) => (
      <TweetEmbed
        tweetId={(props.tweetId as string) ?? ''}
        handle={props.handle as string | undefined}
        mediaMaxWidth={props.mediaMaxWidth as number | undefined}
      />
    ),
    selfClosing: true,
  },
  FAQAccordion: {
    render: (props) => (
      <FAQAccordion
        items={(props.items as Array<{ question: string; answer: string }>) ?? []}
        heading={props.heading as string | undefined}
        color={props.color as 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'gray' | undefined}
      />
    ),
    selfClosing: true,
  },
  SourcesInterlink: {
    render: (props) => (
      <SourcesInterlink
        sources={(props.sources as SourceItem[] | undefined) ?? []}
        internalLinks={(props.internalLinks as InternalLinkItem[] | undefined) ?? []}
        heading={props.heading as string | undefined}
        accentColor={props.accentColor as 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray' | undefined}
      />
    ),
    selfClosing: true,
  },
  // ── TopicMedia — centralized media registry component ─────────────────────
  TopicMedia: {
    render: (props) => (
      <TopicMediaClientBridge
        topic={(props.topic as string) ?? ''}
        variant={(props.variant as 'both' | 'video' | 'thumbnail' | 'gallery') ?? 'both'}
        mediaId={props.mediaId as string | undefined}
        caption={props.caption as string | undefined}
      />
    ),
    selfClosing: true,
  },
};
const COMPONENT_NAMES = Object.keys(COMPONENTS).join('|');

// ── JSX prop parser ─────────────────────────────────────────────────────────

/**
 * Strip JSX fragment/element wrappers from a string expression and collapse
 * to plain text. E.g. `<><span>Title</span><span>Sub</span></>` → `"Title Sub"`.
 */
function stripJsxToText(expr: string): string {
  return expr
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ')  // strip all HTML/JSX tags
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Try to evaluate a JS expression. If it contains JSX (angle brackets inside
 * array literals), strip the JSX to plain text and re-attempt.
 */
function evalExpression(expr: string): unknown {
  // Fast path: try direct evaluation (works for plain arrays/objects)
  try {
    // eslint-disable-next-line no-new-func
    return new Function(`return (${expr})`)();
  } catch {
    // If expression contains JSX-like syntax, strip tags and retry
    if (/<[A-Za-z>]/.test(expr)) {
      try {
        const cleaned = expr.replace(/<>([^<]*(?:<[^/][^>]*>[^<]*)*)<\/>/g, (_, inner) => {
          return `'${stripJsxToText(inner).replace(/'/g, "\\'")}'`;
        }).replace(/<([A-Za-z]\w*)[^>]*>([^<]*)<\/\1>/g, (_, _tag, text) => {
          return `'${text.trim().replace(/'/g, "\\'")}'`;
        });
        // eslint-disable-next-line no-new-func
        return new Function(`return (${cleaned})`)();
      } catch {
        // still failed
      }
    }
    return expr;
  }
}

/**
 * Parse a JSX-style props string into a Record.
 * Handles: prop="string", prop='string', prop={expression}, prop={true/false}
 * For expressions (arrays, objects), attempts JSON.parse with light normalisation.
 */
function parseProps(propsStr: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!propsStr || !propsStr.trim()) return result;

  // Match prop=value patterns
  const propRegex = /(\w+)=(?:"([^"]*)"|'([^']*)'|\{([\s\S]*?)\}(?=\s+\w+=|\s*\/?>|\s*$))/g;

  // For complex JSX expressions with nested braces, we need a smarter approach
  const str = propsStr.trim();
  let i = 0;

  while (i < str.length) {
    // Skip whitespace
    while (i < str.length && /\s/.test(str[i])) i++;
    if (i >= str.length) break;

    // Read prop name
    const nameStart = i;
    while (i < str.length && /[\w]/.test(str[i])) i++;
    const name = str.slice(nameStart, i);
    if (!name) { i++; continue; }

    // Skip whitespace
    while (i < str.length && /\s/.test(str[i])) i++;

    // Check for =
    if (str[i] !== '=') {
      // Boolean prop (e.g. `allowFullScreen`)
      result[name] = true;
      continue;
    }
    i++; // skip =

    // Skip whitespace
    while (i < str.length && /\s/.test(str[i])) i++;

    if (str[i] === '"') {
      // Double-quoted string
      i++;
      const start = i;
      while (i < str.length && str[i] !== '"') i++;
      result[name] = str.slice(start, i);
      i++; // skip closing quote
    } else if (str[i] === "'") {
      // Single-quoted string
      i++;
      const start = i;
      while (i < str.length && str[i] !== "'") i++;
      result[name] = str.slice(start, i);
      i++; // skip closing quote
    } else if (str[i] === '{') {
      // JSX expression — find matching closing brace
      let depth = 1;
      i++; // skip opening brace
      const start = i;
      while (i < str.length && depth > 0) {
        if (str[i] === '{') depth++;
        else if (str[i] === '}') depth--;
        if (depth > 0) i++;
      }
      const expr = str.slice(start, i).trim();
      i++; // skip closing brace

      // Try to parse the expression
      if (expr === 'true') {
        result[name] = true;
      } else if (expr === 'false') {
        result[name] = false;
      } else if (/^-?\d+(\.\d+)?$/.test(expr)) {
        result[name] = Number(expr);
      } else {
        // Use evalExpression to handle JS expressions including JSX fragments
        result[name] = evalExpression(expr);
      }
    } else {
      // Unquoted value — read until whitespace
      const start = i;
      while (i < str.length && !/\s/.test(str[i])) i++;
      result[name] = str.slice(start, i);
    }
  }

  return result;
}

// ── Segment splitter ────────────────────────────────────────────────────────

interface HtmlSegment {
  type: 'html';
  content: string;
}

interface ComponentSegment {
  type: 'component';
  name: string;
  props: Record<string, unknown>;
  children?: string;
}

type Segment = HtmlSegment | ComponentSegment;

/**
 * Split an HTML string into segments of raw HTML and component blocks.
 *
 * Uses a cursor-based parser instead of a single regex to correctly handle
 * nested component tags (e.g. JackSection containing JackStats />).
 * The old regex `<Component(props?)\\s*\\/>` matched inner self-closing tags
 * as the outer component's closing, swallowing children.
 */
function splitIntoSegments(html: string): Segment[] {
  const segments: Segment[] = [];
  const componentSet = new Set(COMPONENT_NAMES.split('|'));

  // Regex to find the START of any known component tag
  const tagStartPattern = new RegExp(`<(${COMPONENT_NAMES})[\\s/>]`, 'g');

  let lastIndex = 0;
  let startMatch: RegExpExecArray | null;

  while ((startMatch = tagStartPattern.exec(html)) !== null) {
    const tagPos = startMatch.index;
    const name = startMatch[1];

    // Find the end of the opening tag — we need to handle JSX props
    // with nested braces, quotes, etc.
    let i = tagPos + 1 + name.length; // position right after `<ComponentName`
    let isSelfClosing = false;
    let propsEnd = -1;

    // Walk forward to find `>` or `/>` that closes the opening tag,
    // skipping over quoted strings and brace expressions in props
    while (i < html.length) {
      const ch = html[i];
      if (ch === '"') {
        // Skip double-quoted string
        i++;
        while (i < html.length && html[i] !== '"') i++;
        i++; // skip closing quote
      } else if (ch === "'") {
        // Skip single-quoted string
        i++;
        while (i < html.length && html[i] !== "'") i++;
        i++; // skip closing quote
      } else if (ch === '{') {
        // Skip brace expression (handles nested braces)
        let depth = 1;
        i++;
        while (i < html.length && depth > 0) {
          if (html[i] === '{') depth++;
          else if (html[i] === '}') depth--;
          else if (html[i] === '"') { i++; while (i < html.length && html[i] !== '"') i++; }
          else if (html[i] === "'") { i++; while (i < html.length && html[i] !== "'") i++; }
          i++;
        }
      } else if (ch === '/' && html[i + 1] === '>') {
        // Self-closing tag
        isSelfClosing = true;
        propsEnd = i;
        i += 2; // skip />
        break;
      } else if (ch === '>') {
        // Open tag (with children)
        propsEnd = i;
        i++; // skip >
        break;
      } else {
        i++;
      }
    }

    if (propsEnd === -1) break; // malformed — stop

    const propsStr = html.slice(tagPos + 1 + name.length, propsEnd).trim();

    // Add HTML before this component
    if (tagPos > lastIndex) {
      const htmlContent = html.slice(lastIndex, tagPos).trim();
      if (htmlContent) {
        segments.push({ type: 'html', content: htmlContent });
      }
    }

    if (isSelfClosing) {
      segments.push({
        type: 'component',
        name,
        props: parseProps(propsStr),
      });
      lastIndex = i;
    } else {
      // Find the matching closing tag, accounting for same-name nesting
      const closingTag = `</${name}>`;
      let depth = 1;
      let searchPos = i;
      while (depth > 0 && searchPos < html.length) {
        const nextOpen = html.indexOf(`<${name}`, searchPos);
        const nextClose = html.indexOf(closingTag, searchPos);

        if (nextClose === -1) break; // no closing tag found

        if (nextOpen !== -1 && nextOpen < nextClose) {
          // Check if this is actually the same component (not a substring match)
          const charAfterOpen = html[nextOpen + 1 + name.length];
          if (charAfterOpen === ' ' || charAfterOpen === '>' || charAfterOpen === '/') {
            depth++;
          }
          searchPos = nextOpen + 1;
        } else {
          depth--;
          if (depth === 0) {
            const children = html.slice(i, nextClose);
            const props = parseProps(propsStr);
            props.__children = children;
            segments.push({
              type: 'component',
              name,
              props,
            });
            lastIndex = nextClose + closingTag.length;
          } else {
            searchPos = nextClose + closingTag.length;
          }
        }
      }

      if (depth > 0) {
        // Couldn't find closing tag — treat as raw HTML
        segments.push({ type: 'html', content: html.slice(tagPos, i) });
        lastIndex = i;
      }
    }

    // Reset regex lastIndex to continue after current match
    tagStartPattern.lastIndex = lastIndex;
  }

  // Add remaining HTML
  if (lastIndex < html.length) {
    const remaining = html.slice(lastIndex).trim();
    if (remaining) {
      segments.push({ type: 'html', content: remaining });
    }
  }

  return segments;
}

// ── Fix iframes ─────────────────────────────────────────────────────────────

/**
 * Fix self-closing iframe tags (valid in JSX but invalid in HTML5).
 * <iframe ... /> → <iframe ...></iframe>
 */
function fixIframes(html: string): string {
  return html.replace(/<iframe\s([^>]*?)\/>/gi, '<iframe $1></iframe>');
}

// ── Main component ──────────────────────────────────────────────────────────

export function ContentRenderer({ html }: { html: string }) {
  if (!html) return null;

  // Fix self-closing iframes before processing
  const fixed = fixIframes(html);

  // Check if content has any known component tags
  const hasComponents = new RegExp(`<(${COMPONENT_NAMES})[\\s/>]`).test(fixed);

  // Fast path — no components, just use dangerouslySetInnerHTML
  if (!hasComponents) {
    return <div dangerouslySetInnerHTML={{ __html: fixed }} />;
  }

  // Split into segments and render
  const segments = splitIntoSegments(fixed);

  return (
    <>
      {segments.map((segment, i) => {
        if (segment.type === 'html') {
          return <div key={i} dangerouslySetInnerHTML={{ __html: segment.content }} />;
        }

        const def = COMPONENTS[segment.name];
        if (!def) {
          // Unknown component — render as raw HTML
          return null;
        }

        return <React.Fragment key={i}>{def.render(segment.props)}</React.Fragment>;
      })}
    </>
  );
}

export default ContentRenderer;
