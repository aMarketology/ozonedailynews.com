// lib/authors.ts
// ── THE AUTHOR ENTITY REGISTRY — single source of truth for E-E-A-T authorship ──
//
// Google ranks ENTITIES, not just URLs. Every article must resolve to a verifiable
// Person entity with a stable @id (their author page URL), a real bio, declared
// areas of expertise (knowsAbout), and external profiles (sameAs) that prove the
// byline is a recognised individual — not anonymous content-farm output.
//
// This registry is consumed by:
//   - app/authors/[slug]/page.tsx   → renders the public Person profile + Person JSON-LD
//   - components/SEOWrapper.tsx       → links each NewsArticle's author to this entity
//   - app/api/cms/publish/route.ts    → KNOWN_AUTHORS gate (no byline may publish unless registered)
//
// Adding a new journalist = add one entry here. Do NOT hand-build author pages.

import { SITE_CONFIG } from './site-config';

export interface AuthorEntity {
  slug: string;                 // URL segment: /authors/<slug>
  name: string;                 // Full display name (byline)
  jobTitle: string;
  /** True for the network owner/publisher. Drives ownership schema + footer. */
  isOwner?: boolean;
  /** Short one-line role shown under the name. */
  tagline: string;
  /** Full bio paragraphs (rendered in order on the profile page). */
  bio: string[];
  /** Editorial beats shown as tags. */
  beats: string[];
  /** schema.org knowsAbout — declared expertise for entity authority. */
  knowsAbout: string[];
  /** External profiles that PROVE the entity is real. Empty = not yet verified. */
  sameAs: string[];
  /** Initials for the avatar fallback. */
  initials: string;
  /** Optional avatar image URL (overrides initials). */
  avatarUrl?: string;
  /** Year the author began reporting for the network. */
  since?: string;
  /** Optional education credentials for schema.org alumniOf and E-E-A-T. */
  education?: Array<{
    institution: string;
    degree: string;
    year?: string;
    url?: string;
  }>;
}

// ─── Registry ────────────────────────────────────────────────────────────────
// Network owner: Max DeLeonardis.

export const AUTHORS: Record<string, AuthorEntity> = {
  'max-deleonardis': {
    slug: 'max-deleonardis',
    name: 'Max DeLeonardis',
    jobTitle: 'Founder & Publisher',
    isOwner: true,
    tagline: 'Founder & Publisher, Ozone Network News',
    bio: [
      'Max DeLeonardis is the founder, publisher, and owner of Ozone Network News LLC, the independent media company that operates OzoneNews and the broader ONN network of digital news brands covering science, technology, climate, finance, and global affairs.',
      'He earned his undergraduate degree and his Ph.D. from North Carolina State University, completing his doctoral work in Biomedical Engineering in 2024. His Ph.D. was completed through the prestigious joint graduate program in Biomedical Engineering, a collaboration between NC State and the University of North Carolina at Chapel Hill, one of the oldest and most respected inter-institutional biomedical engineering programs in the United States.',
      'His scientific training in biomedical engineering, which spans quantitative data analysis, research methodology, and peer-reviewed scientific literature, directly informs his editorial oversight of OzoneNews science and technology coverage. He built the network to deliver fast, fact-checked, sourced reporting for a scientifically literate audience, operating under a strict editorial standards policy with named authorship required on every article, verified external sources, and a published corrections policy.',
    ],
    beats: ['Science', 'Technology', 'Climate', 'Space', 'Biomedical Engineering', 'Publishing'],
    knowsAbout: [
      'Biomedical Engineering',
      'Scientific Research',
      'Peer-Reviewed Literature',
      'Science Journalism',
      'Space Exploration',
      'Climate Science',
      'Atmospheric Science',
      'Technology',
      'Digital Media',
      'Editorial Standards',
    ],
    sameAs: [
      'https://www.linkedin.com/in/maximillion-deleonardis/',
      'https://x.com/ozonedailynews',
      'https://www.facebook.com/don.deleonardis/',
    ],
    initials: 'MD',
    since: '2026',
    education: [
      {
        institution: 'North Carolina State University',
        degree: 'Ph.D. in Biomedical Engineering',
        year: '2024',
        url: 'https://www.bme.ncsu.edu/',
      },
      {
        institution: 'North Carolina State University',
        degree: 'B.S.',
        url: 'https://www.ncsu.edu/',
      },
    ],
  },

  'simon-minter': {
    slug: 'simon-minter',
    name: 'Anderea Redwood',
    jobTitle: 'Energy Correspondent',
    tagline: 'Energy Correspondent, OzoneNews',
    bio: [
      'Anderea Redwood is an energy correspondent for OzoneNews. She covers renewable energy, agricultural technology, climate policy, and the intersection of infrastructure and environmental science, drawing directly on primary sources including industry announcements, peer-reviewed research, and government data.',
      'Her reporting focuses on translating complex energy and agricultural developments into clear, sourced news coverage — from renewable natural gas facilities and grid infrastructure to climate mitigation strategies and rural economic development.',
    ],
    beats: ['Energy', 'Agriculture', 'Climate Policy', 'Infrastructure', 'Technology'],
    knowsAbout: [
      'Renewable Energy',
      'Renewable Natural Gas',
      'Agricultural Technology',
      'Climate Policy',
      'Energy Infrastructure',
      'Methane Capture',
      'Biofuels',
      'Rural Economic Development',
    ],
    sameAs: [],
    initials: 'AR',
    since: '2026',
  },

  'ozonedailynews-editorial-team': {
    slug: 'ozonedailynews-editorial-team',
    name: 'OzoneNews Editorial Team',
    jobTitle: 'Editorial Desk',
    tagline: 'The OzoneNews Editorial Team',
    bio: [
      'The OzoneNews Editorial Team byline is used for collaboratively reported, desk-edited, or wire-assisted coverage that does not carry a single named author. All work published under this byline is reviewed by a named editor and follows the same editorial standards, sourcing, and corrections policy as individually bylined reporting.',
    ],
    beats: ['Science', 'Technology', 'Climate', 'Space'],
    knowsAbout: ['Science Journalism', 'Breaking News', 'Editorial Review'],
    sameAs: [],
    initials: 'ON',
    since: '2026',
  },

  'kaustubh-madiraju': {
    slug: 'kaustubh-madiraju',
    name: 'Kaustubh Madiraju',
    jobTitle: 'Contributing Reporter',
    tagline: 'Contributing Reporter, OzoneNews',
    bio: [
      'Kaustubh Madiraju is a contributing reporter for OzoneNews, covering technology, science, and the people and companies shaping them. His reporting follows the network editorial standards: named sourcing, independent verification, and a published corrections policy.',
    ],
    beats: ['Technology', 'Science', 'Innovation'],
    knowsAbout: ['Technology', 'Science', 'Innovation', 'Reporting'],
    sameAs: [
      'https://www.linkedin.com/in/kmmadiraju',
      'https://www.instagram.com/kaustubhkm/',
      'https://www.facebook.com/kaustubh.madiraju/',
    ],
    initials: 'KM',
    since: '2026',
  },

  'josh-donnelly': {
    slug: 'josh-donnelly',
    name: 'Josh Donnelly',
    jobTitle: 'Contributing Writer',
    tagline: 'Contributing Writer, OzoneNews',
    bio: [
      'Josh Donnelly is the founder and owner of the Josh\u2019s Hope Foundation, a 501(c)(3) nonprofit in Hillsborough, North Carolina that provides personal support and on-the-job training to young adults living with mental health challenges.',
      'He contributes to OzoneNews on community impact, mental health, and the nonprofit sector, writing under the network editorial standards with named sourcing and a published corrections policy.',
    ],
    beats: ['Community', 'Mental Health', 'Nonprofit', 'Human Interest'],
    knowsAbout: [
      'Mental Health',
      'Nonprofit Leadership',
      'Community Support',
    ],
    sameAs: [],
    initials: 'JD',
    since: '2026',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const KNOWN_AUTHOR_SLUGS: string[] = Object.keys(AUTHORS);

export function getAuthor(slug: string | undefined | null): AuthorEntity | null {
  if (!slug) return null;
  return AUTHORS[slug] ?? null;
}

export function authorUrl(slug: string): string {
  return `${SITE_CONFIG.url}/authors/${slug}`;
}

/** Build schema.org Person JSON-LD for an author entity. */
export function authorPersonSchema(author: AuthorEntity) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': authorUrl(author.slug),
    name: author.name,
    url: authorUrl(author.slug),
    jobTitle: author.jobTitle,
    description: author.bio[0],
    knowsAbout: author.knowsAbout,
    ...(author.sameAs.length > 0 && { sameAs: author.sameAs }),
    ...(author.education && author.education.length > 0 && {
      alumniOf: author.education.map((edu) => ({
        '@type': 'EducationalOrganization',
        name: edu.institution,
        ...(edu.url && { url: edu.url }),
        ...(edu.degree && { department: { '@type': 'EducationalOrganization', name: edu.degree } }),
      })),
    }),
    worksFor: {
      '@type': 'NewsMediaOrganization',
      name: SITE_CONFIG.publisherName,
      url: SITE_CONFIG.url,
      publishingPrinciples: `${SITE_CONFIG.url}${SITE_CONFIG.publishingPrinciples}`,
      contactPoint: {
        '@type': 'ContactPoint',
        email: SITE_CONFIG.email,
        contactType: 'editorial',
      },
    },
  };
}