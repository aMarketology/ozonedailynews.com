import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import './globals.css';
import { SITE_CONFIG } from '@/lib/site-config';
import { BeehiivSignup } from '@/components/newsletter/BeehiivSignup';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-merriweather', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} | Objective News Network`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: 'Objective, sourced, verified news from the Ozone Network News.',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: SITE_CONFIG.name,
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
};

// NewsMediaOrganization JSON-LD — site-level trust signal for E-E-A-T
const newsOrgSchema = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: SITE_CONFIG.publisherName,
  legalName: SITE_CONFIG.legalName,
  url: SITE_CONFIG.url,
  logo: {
    '@type': 'ImageObject',
    url: SITE_CONFIG.logo,
    width: 600,
    height: 60,
  },
  sameAs: SITE_CONFIG.sameAs,
  contactPoint: {
    '@type': 'ContactPoint',
    email: SITE_CONFIG.email,
    contactType: 'editorial',
  },
  publishingPrinciples:           `${SITE_CONFIG.url}${SITE_CONFIG.publishingPrinciples}`,
  correctionsPolicy:              `${SITE_CONFIG.url}${SITE_CONFIG.correctionsPolicy}`,
  actionableFeedbackPolicy:       `${SITE_CONFIG.url}${SITE_CONFIG.actionableFeedbackPolicy}`,
  ethicsPolicy:                   `${SITE_CONFIG.url}${SITE_CONFIG.ethicsPolicy}`,
  verificationFactCheckingPolicy: `${SITE_CONFIG.url}${SITE_CONFIG.verificationFactCheckingPolicy}`,
  diversityPolicy:                `${SITE_CONFIG.url}${SITE_CONFIG.diversityPolicy}`,
  unnamedSourcesPolicy:           `${SITE_CONFIG.url}${SITE_CONFIG.unnamedSourcesPolicy}`,
  masthead:                       `${SITE_CONFIG.url}${SITE_CONFIG.masthead}`,
  ownershipFundingInfo:           `${SITE_CONFIG.url}${SITE_CONFIG.ownershipFundingInfo}`,
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newsOrgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <link rel="alternate" type="application/rss+xml" title={`${SITE_CONFIG.name} RSS Feed`} href="/rss.xml" />
      </head>
      <body className="min-h-full flex flex-col ozone-canvas ozone-ink">
        {children}

        {/* ── Global footer – Journalistic Trust Anchor (OStandard) ── */}
        <footer className="mt-auto border-t-2 border-ozone-accent bg-ozone-footer text-ozone-footer-text">

          {/* Network nameplate */}
          <div className="border-b border-ozone-footer-divider py-3 px-4">
            <p className="text-center text-[10px] font-mono tracking-[0.2em] uppercase text-ozone-footer-muted select-none">
              ━━━━━━━━━━━━━━━━━━━━━━ THE OZONE NETWORK ━━━━━━━━━━━━━━━━━━━━━━
            </p>
          </div>

          {/* Three-column trust grid */}
          <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">

            {/* Column 1 — Mission & Ethics */}
            <div>
              <h3 className="footer-col-heading">Mission &amp; Ethics</h3>
              <ul className="footer-link-list">
                <li><a href="/about" className="footer-link">About Ozone Network</a></li>
                <li><a href="/editorial-standards" className="footer-link">Editorial Standards</a></li>
                <li><a href="/corrections" className="footer-link">Corrections Policy</a></li>
                <li><a href="/privacy" className="footer-link">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Column 2 — Editorial Team */}
            <div>
              <h3 className="footer-col-heading">Editorial Team</h3>
              <ul className="footer-link-list">
                <li><span className="footer-name">Jack Sterling</span></li>
                <li><span className="footer-name">Tina Boyle</span></li>
                <li><span className="footer-name">Max DeLeonardis</span></li>
                <li><a href="/contact" className="footer-link">Contact / Press</a></li>
              </ul>
            </div>

            {/* Column 3 — Transparency & Trust */}
            <div>
              <h3 className="footer-col-heading">Transparency &amp; Trust</h3>
              <ul className="footer-link-list">
                <li>
                  <a href="/editorial-standards#jti" className="footer-link">
                    <span className="trust-badge">JTI</span> Transparency Report
                  </a>
                </li>
                <li>
                  <a href="/editorial-standards#ai-policy" className="footer-link">
                    <span className="trust-badge">AI</span> Policy &amp; Attribution
                  </a>
                </li>
                <li>
                  <a href="/editorial-standards#verification" className="footer-link">
                    <span className="trust-badge trust-badge--check">&#10003;</span> Fact-Checking Protocol
                  </a>
                </li>
                <li>
                  <a href="https://www.trustproject.org" target="_blank" rel="noopener noreferrer" className="footer-link">
                    Verify via Trust Project &#8599;
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter signup row */}
          <div className="border-b border-ozone-footer-divider py-8 px-4">
            <div className="max-w-md mx-auto">
              <BeehiivSignup variant="footer" />
            </div>
          </div>

          {/* Copyright bar */}
          <div className="border-t border-ozone-footer-divider py-4 px-4">
            <p className="text-center text-[11px] font-mono tracking-wide text-ozone-footer-muted">
              &copy; {new Date().getFullYear()} Ozone Network News. All Rights Reserved.
              &nbsp;&nbsp;|&nbsp;&nbsp;Legal Entity: {SITE_CONFIG.legalName}
            </p>
          </div>

        </footer>
      </body>
    </html>
  );
}
