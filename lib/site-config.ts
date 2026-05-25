// lib/site-config.ts
// All site identity values are driven by env vars.
// Override per Railway service via environment variables.
// Fallback to ozonedailynews.com flagship values.

export const SITE_CONFIG = {
  name:           process.env.NEXT_PUBLIC_SITE_NAME      ?? 'OzoneNews',
  legalName:      process.env.NEXT_PUBLIC_SITE_LEGAL     ?? 'Ozone Network News LLC',
  publisherName:  process.env.NEXT_PUBLIC_SITE_PUBLISHER ?? 'Ozone Network News',
  url:            process.env.NEXT_PUBLIC_SITE_URL       ?? 'https://www.ozonedailynews.com',
  logo:           process.env.NEXT_PUBLIC_SITE_LOGO      ?? 'https://www.ozonedailynews.com/ozonednews-logo.png',
  email:          process.env.NEXT_PUBLIC_SITE_EMAIL     ?? 'editorial@ozonedailynews.com',
  twitter:        process.env.NEXT_PUBLIC_SITE_TWITTER   ?? '@ozonedailynews',
  sameAs: [
    process.env.NEXT_PUBLIC_SITE_TWITTER_URL  ?? 'https://twitter.com/ozonedailynews',
    process.env.NEXT_PUBLIC_SITE_LINKEDIN_URL ?? 'https://www.linkedin.com/company/ozonedailynews',
  ],
  // Trust policy pages (all required for NewsMediaOrganization schema)
  publishingPrinciples:       '/editorial-standards',
  correctionsPolicy:          '/corrections',
  actionableFeedbackPolicy:   '/contact',
  ethicsPolicy:               '/editorial-standards#ethics',
  verificationFactCheckingPolicy: '/editorial-standards#verification',
  diversityPolicy:            '/editorial-standards#diversity',
  unnamedSourcesPolicy:       '/editorial-standards#unnamed-sources',
  masthead:                   '/about',
  ownershipFundingInfo:       '/about#ownership',
} as const;
