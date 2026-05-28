import { NextRequest, NextResponse } from 'next/server';

const BEEHIIV_API_KEY        = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.NEXT_PUBLIC_BEEHIIV_PUBLICATION_ID;
const BEEHIIV_API_BASE       = 'https://api.beehiiv.com/v2';

export async function POST(req: NextRequest) {
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    return NextResponse.json({ error: 'Newsletter not configured.' }, { status: 503 });
  }

  let email: string;
  try {
    const body = await req.json();
    email = (body.email ?? '').toString().trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 422 });
  }

  const utmSource   = 'ozonedailynews.com';
  const utmMedium   = req.headers.get('referer')?.includes('/newsletter') ? 'newsletter_page' : 'footer';
  const utmCampaign = 'ozone_dispatch_signup';

  try {
    const res = await fetch(
      `${BEEHIIV_API_BASE}/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          utm_source:           utmSource,
          utm_medium:           utmMedium,
          utm_campaign:         utmCampaign,
          reactivate_existing:  true,
          send_welcome_email:   true,
        }),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('[beehiiv] subscription error', res.status, data);
      return NextResponse.json(
        { error: 'Could not subscribe. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[beehiiv] fetch error', err);
    return NextResponse.json(
      { error: 'Network error. Please try again.' },
      { status: 502 }
    );
  }
}
