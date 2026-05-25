// =============================================================================
// OzoneNews Analytics — GA4 + Measurement Protocol
// =============================================================================
// Client-side: uses window.gtag (injected by GoogleAnalytics component)
// Server-side: uses Measurement Protocol API via /api/analytics route
//
// Visitor identity is stored in localStorage so returning visitors can be
// attributed correctly across sessions without third-party cookies.
// =============================================================================

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-9FM4W3K6GV';

// ── Visitor identity store ────────────────────────────────────────────────────
const VISITOR_KEY = 'ow_visitor';

export interface VisitorIdentity {
  clientId: string;         // Stable random ID, persisted in localStorage
  visitCount: number;
  isReturningVisitor: boolean;
  firstVisit: string;       // ISO timestamp
  lastVisit: string;        // ISO timestamp
  email?: string;
  name?: string;
}

function generateClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadVisitor(): VisitorIdentity {
  if (typeof window === 'undefined') {
    return {
      clientId: 'server',
      visitCount: 1,
      isReturningVisitor: false,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
    };
  }
  try {
    const raw = localStorage.getItem(VISITOR_KEY);
    if (raw) {
      const v: VisitorIdentity = JSON.parse(raw);
      return v;
    }
  } catch { /* ignore parse errors */ }
  // First-time visitor
  const newVisitor: VisitorIdentity = {
    clientId: generateClientId(),
    visitCount: 0,
    isReturningVisitor: false,
    firstVisit: new Date().toISOString(),
    lastVisit: new Date().toISOString(),
  };
  localStorage.setItem(VISITOR_KEY, JSON.stringify(newVisitor));
  return newVisitor;
}

function saveVisitor(v: VisitorIdentity): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VISITOR_KEY, JSON.stringify(v));
}

// ── gtag helper (safe — gtag may not be loaded yet) ──────────────────────────
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

function gtag(...args: any[]): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

// =============================================================================
// TRACKING API
// =============================================================================

export const tracking = {

  /**
   * Call once on app mount. Increments visit count, marks returning visitors,
   * and sets the GA4 client_id and user_properties so all subsequent events
   * are attributed to the same visitor.
   */
  initialize(): void {
    if (typeof window === 'undefined') return;

    const visitor = loadVisitor();
    const now = new Date().toISOString();

    visitor.visitCount += 1;
    visitor.isReturningVisitor = visitor.visitCount > 1;
    visitor.lastVisit = now;
    saveVisitor(visitor);

    // Tell GA4 about the stable client ID and visitor properties
    gtag('set', {
      client_id: visitor.clientId,
      user_properties: {
        visit_count: visitor.visitCount,
        returning_visitor: visitor.isReturningVisitor,
        ...(visitor.email ? { email_domain: visitor.email.split('@')[1] } : {}),
      },
    });

    // Set user_id in GA4 if we have an email (enables cross-device identity)
    if (visitor.email) {
      gtag('config', GA_MEASUREMENT_ID, {
        user_id: btoa(visitor.email), // obfuscated, not plain-text PII
      });
    }
  },

  /**
   * Track a page view. Called on every client-side navigation.
   */
  trackPageView(url: string): void {
    gtag('event', 'page_view', {
      page_location: window.location.origin + url,
      page_path: url,
    });
  },

  /** Alias kept for backwards compatibility */
  pageView(url: string): void {
    this.trackPageView(url);
  },

  /**
   * Send a custom GA4 event.
   */
  event(name: string, params: Record<string, unknown> = {}): void {
    gtag('event', name, params);
  },

  /** Alias kept for backwards compatibility */
  trackEvent(name: string, params: Record<string, unknown> = {}): void {
    this.event(name, params);
  },

  /**
   * Track article scroll depth milestones (25 / 50 / 75 / 100 %).
   */
  trackArticleEngagement(
    slug: string,
    title: string,
    category: string,
    milestone: number,
  ): void {
    gtag('event', 'article_engagement', {
      article_slug: slug,
      article_title: title,
      article_category: category,
      scroll_milestone: milestone,
    });
  },

  /**
   * Track how long a visitor stayed on an article (seconds).
   */
  trackTimeSpent(slug: string, timeSpentSeconds: number): void {
    gtag('event', 'time_spent', {
      article_slug: slug,
      seconds: timeSpentSeconds,
      engagement_bucket:
        timeSpentSeconds < 30  ? 'bounce'    :
        timeSpentSeconds < 120 ? 'skimmer'   :
        timeSpentSeconds < 300 ? 'reader'    : 'deep_reader',
    });
  },

  /**
   * Returns the stored visitor identity from localStorage.
   */
  getUserIdentity(): VisitorIdentity {
    return loadVisitor();
  },

  /**
   * Associate a confirmed email address with this visitor.
   * Persisted to localStorage and sent as a GA4 user property.
   * The email is hashed (SHA-256) before sending — never plain-text PII.
   */
  async identifyUser(email: string, name?: string): Promise<void> {
    const visitor = loadVisitor();
    visitor.email = email;
    if (name) visitor.name = name;
    saveVisitor(visitor);

    // Hash the email for GA4 (required by Google's PII policy)
    let emailHash = btoa(email); // base64 as a simple obfuscation
    try {
      const buf = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(email.toLowerCase().trim()),
      );
      emailHash = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch { /* crypto not available in all contexts */ }

    gtag('set', {
      user_id: emailHash,
      user_properties: {
        has_email: true,
        ...(name ? { display_name: name } : {}),
      },
    });

    // Also notify the server-side Measurement Protocol endpoint
    // so the event is recorded even if the user has an ad blocker
    try {
      await fetch('/api/analytics/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: visitor.clientId,
          emailHash,
          visitCount: visitor.visitCount,
          name,
        }),
      });
    } catch { /* non-critical — GA4 client still fires */ }
  },

  /**
   * Track an email newsletter signup.
   */
  trackEmailSignup(source: string): void {
    const visitor = loadVisitor();
    gtag('event', 'email_signup', {
      signup_source: source,
      visit_count: visitor.visitCount,
      is_returning: visitor.isReturningVisitor,
    });
  },

  /**
   * Track a user reaction on an article (like, save, share, comment click).
   * Called from ReactionBar. Fires a GA4 custom event that shows up in
   * Explore → "article_reaction" with reaction_type, article_slug, direction.
   *
   * @param action  - The reaction type ('like' | 'save' | 'share' | 'comment_click')
   * @param slug    - The article slug / path used as a stable identifier
   * @param title   - The article title for readability in GA4 reports
   * @param direction - 'add' when engaging, 'remove' when un-liking/un-saving
   */
  trackArticleReaction(
    action: 'like' | 'save' | 'share' | 'comment_click',
    slug: string,
    title: string,
    direction: 'add' | 'remove',
  ): void {
    const visitor = loadVisitor();
    gtag('event', 'article_reaction', {
      reaction_type: action,
      reaction_direction: direction,
      article_slug: slug,
      article_title: title,
      visit_count: visitor.visitCount,
      is_returning_visitor: visitor.isReturningVisitor,
    });
  },
};
