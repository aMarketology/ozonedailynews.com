# Git-Backed Headless CMS | William B Construction
**Document type:** Architecture + Admin User Guide
**Last updated:** May 28, 2026
**Applies to:** Any Next.js service-based website using this CMS pattern

---

## What This Is

A headless CMS where the database is GitHub itself. There is no WordPress, no Contentful, no Sanity subscription. Editors log in at `/admin`, make changes through a form, and click Save. That click writes a JSON file directly to the GitHub repository via the GitHub API. The Next.js site reads those JSON files and renders the page. The design never changes — only the content inside it.

```
Editor logs in at /admin
        ↓
Fills out form (text, photos, services, testimonials)
        ↓
Clicks "Save & Publish"
        ↓
Server validates the content (required fields, image URLs, etc.)
        ↓
GitHub API writes/overwrites the JSON file in the repo
        ↓
Railway/Vercel detects the new commit → auto-deploys in ~60 seconds
        ↓
Live site updated. Zero downtime. Full version history in Git.
```

---

## Why This Over WordPress or a Traditional CMS

| Factor | WordPress / Contentful | Git-Backed CMS |
|---|---|---|
| Monthly cost | $25-$300/mo for hosting + plugins | $0 (GitHub is free, hosting is already paid) |
| Security surface | Large (database, PHP, plugins, login bots) | Minimal (no database, no PHP, GitHub auth only) |
| Page speed | Slow by default, requires optimization plugins | Instant (static JSON, no database queries) |
| Version history | Plugin-dependent or nonexistent | Every edit is a Git commit — full history forever |
| Downtime risk | Database crashes take the site down | No database = nothing to crash |
| Editor experience | Familiar but bloated | Simple form — only the fields that exist on the site |

---

## Folder Structure

```
williamb-construction/
├── app/
│   ├── admin/
│   │   ├── layout.tsx            ← auth gate, blocks non-editors
│   │   ├── page.tsx              ← dashboard (quick links to all editable sections)
│   │   ├── login/
│   │   │   └── page.tsx          ← email + password login
│   │   └── content/
│   │       ├── page.tsx          ← list all editable content blocks
│   │       ├── new/page.tsx      ← create new project/testimonial/service
│   │       └── [slug]/page.tsx   ← edit existing content
│   ├── [...slug]/
│   │   └── page.tsx              ← catch-all route renders all content pages
│   └── layout.tsx                ← global layout (nav, footer — never touched by CMS)
│
├── content/
│   └── static/
│       ├── content_registry.json ← master index of all published content
│       ├── pages/
│       │   ├── home.json         ← homepage hero, tagline, CTA button text
│       │   ├── about.json        ← about section, owner bio, company story
│       │   └── contact.json      ← phone, email, address, hours
│       ├── services/
│       │   ├── general-contracting.json
│       │   ├── kitchen-remodeling.json
│       │   └── bathroom-renovation.json
│       ├── projects/
│       │   ├── oak-street-kitchen-2026.json
│       │   └── downtown-office-buildout-2026.json
│       └── testimonials/
│           ├── sarah-m-kitchen-remodel.json
│           └── james-r-bathroom-2026.json
│
├── lib/
│   ├── github-bridge.ts          ← GitHub API write function
│   ├── content-reader.ts         ← reads JSON files at build/request time
│   ├── editorial-gate.ts         ← validates content before committing
│   └── site-config.ts            ← site name, URL, contact info defaults
│
└── components/
    ├── ServiceCard.tsx            ← reads from services/*.json
    ├── ProjectGallery.tsx         ← reads from projects/*.json
    ├── TestimonialBlock.tsx       ← reads from testimonials/*.json
    └── HeroSection.tsx            ← reads from pages/home.json
```

---

## What an Editor Can Change (Without Touching Code)

Every item below is a field in a JSON file. The editor sees a labeled form field — they never see raw JSON.

### Homepage
- Hero headline (e.g. "Chicago's Most Trusted General Contractor")
- Hero subheadline
- CTA button text (e.g. "Get a Free Estimate")
- CTA button link
- Hero background photo (paste a URL or upload)
- Trust badges (licensed, insured, BBB rating — toggle on/off)

### About Section
- Owner name and title
- Owner headshot photo URL
- Company founding year
- Company story paragraph (freeform text)
- License numbers and certifications

### Services
Each service is its own JSON file with:
- Service name
- Short description (shown on homepage service cards)
- Full description (shown on the service detail page)
- Bullet list of what is included
- Starting price or price range (optional)
- Photo gallery (array of image URLs)
- CTA text specific to this service

### Projects / Portfolio
Each project is its own JSON file with:
- Project name
- Location (city, neighborhood)
- Completion date
- Before photos (array of image URLs)
- After photos (array of image URLs)
- Short caption per photo
- Project description
- Service category (links back to the service page)
- Testimonial associated with this project (optional)

### Testimonials
Each testimonial is its own JSON file with:
- Client first name and last initial (e.g. "Sarah M.")
- Star rating (1-5)
- Review text
- Project type
- Date
- Photo of the completed work (optional)
- Source (Google, Yelp, direct — shown as badge)

### Contact Page
- Phone number
- Email address
- Service area description
- Business hours (per day)
- Google Maps embed URL
- License number display
- Insurance carrier (optional)

---

## How an Editor Logs In

1. Go to `https://www.williambconstruction.com/admin`
2. Enter your editor email and password
3. The server checks your credentials against Supabase Auth
4. If valid, a secure session cookie is set — you stay logged in for 7 days
5. Non-editors who try to access `/admin` are redirected to the homepage immediately

There is no "forgot password" guessing attack surface because the login page is not advertised anywhere on the public site. Only people who know the URL can find it.

---

## How Editing Works | Step by Step

### Editing an Existing Page (e.g. updating a phone number)

1. Log in at `/admin`
2. Click **"Site Pages"** in the dashboard
3. Click **"Contact"**
4. Update the phone number field
5. Click **"Save"**
6. The server writes the updated `content/static/pages/contact.json` to GitHub
7. Railway detects the new commit and redeploys — live in approximately 60 seconds
8. The old phone number is still visible in Git history if you ever need to revert

### Adding a New Project to the Portfolio

1. Log in at `/admin`
2. Click **"Projects"** then **"Add New Project"**
3. Fill in: project name, location, completion date, description
4. Paste in the before/after photo URLs (from Google Drive, Cloudinary, or any image host)
5. Select the service category from a dropdown
6. Click **"Publish"**
7. The server creates `content/static/projects/{slug}.json` in GitHub
8. The project appears on the portfolio page after the next deploy (~60 seconds)

### Replacing a Photo

Photos are stored as URLs, not uploaded files. To replace a photo:

1. Upload the new photo to your image host (Google Drive shared link, Cloudinary free tier, or even a public Dropbox link)
2. Copy the direct image URL
3. Go to `/admin`, open the relevant content item
4. Paste the new URL into the photo field
5. Save

The old photo URL is removed from the JSON. The file itself is not deleted from wherever it was hosted — just no longer referenced.

### Adding a Testimonial

1. Log in at `/admin`
2. Click **"Testimonials"** then **"Add New"**
3. Fill in: client name, star rating, review text, project type, date, source
4. Optionally attach a photo of the completed work
5. Click **"Publish"**
6. Testimonial appears on the site after the next deploy

---

## How the Site Reads Content

At build time and on page request, Next.js reads the JSON files directly from disk. There is no database query. This is what makes the site fast.

```typescript
// lib/content-reader.ts

import fs from 'fs'
import path from 'path'

export function getService(slug: string) {
  const filePath = path.join(process.cwd(), `content/static/services/${slug}.json`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

export function getAllServices() {
  const dir = path.join(process.cwd(), 'content/static/services')
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')))
}
```

The `ServiceCard` component calls `getAllServices()` and renders one card per file. The editor publishes a new service → a new JSON file appears → the card appears automatically on the next deploy. No code change needed.

---

## How the GitHub Bridge Works

When an editor clicks Save, this function runs on the server:

```typescript
// lib/github-bridge.ts

export async function writeFileToGitHub(
  filePath: string,   // e.g. "content/static/projects/oak-street-2026.json"
  content: string,    // the JSON string
  commitMessage: string
) {
  const apiUrl = `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${filePath}`

  // Step 1: Get the current file SHA (needed if the file already exists)
  const existing = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  })
  const sha = existing.ok ? (await existing.json()).sha : undefined

  // Step 2: Write (create or overwrite) the file
  await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
      branch: process.env.GITHUB_BRANCH ?? 'main',
      ...(sha && { sha }),  // include SHA only on updates, not creates
    }),
  })
}
```

That is the entire backend. Two GitHub API calls — one to check if the file exists, one to write it. No Express server. No Lambda. No database. The GitHub API IS the write layer.

---

## Validation Gate | What Gets Checked Before Committing

Nothing commits to GitHub unless it passes these checks:

```typescript
// lib/editorial-gate.ts

export function runGate(content: Record<string, unknown>) {
  const errors: string[] = []

  // Required fields
  if (!content.title)       errors.push("Title is required")
  if (!content.description) errors.push("Description is required")
  if (!content.slug)        errors.push("Slug is required")

  // Photo validation — must be a real URL, not a local path
  if (content.hero_image && !String(content.hero_image).startsWith('http')) {
    errors.push("Hero image must be a full URL (https://...)")
  }

  // No em dashes — they break structured data parsing
  const text = JSON.stringify(content)
  if (text.includes('—') || text.includes('–')) {
    errors.push("Em dashes and en dashes are not allowed. Use a comma or pipe instead.")
  }

  // Description length for SEO
  const desc = String(content.description ?? '')
  if (desc.length < 130 || desc.length > 155) {
    errors.push(`Description must be 130-155 characters (currently ${desc.length})`)
  }

  return errors.length === 0
    ? { ok: true }
    : { ok: false, errors }
}
```

If validation fails, the editor sees a clear error list on screen. Nothing goes to GitHub until all errors are fixed.

---

## Environment Variables Required

Set these in Railway (or Vercel) under the service environment settings. Never commit them to the repo.

```
# GitHub write access
GITHUB_TOKEN=github_pat_...        # Fine-grained PAT, contents:write on this repo only
GITHUB_REPO=username/repo-name     # e.g. aMarketology/williamb-construction
GITHUB_BRANCH=main

# Admin authentication
ADMIN_SECRET=some-long-random-string
# OR if using Supabase Auth:
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Site identity
NEXT_PUBLIC_SITE_NAME=William B Construction
NEXT_PUBLIC_SITE_URL=https://www.williambconstruction.com
```

---

## GitHub Personal Access Token | How to Create It

1. Go to GitHub.com → Settings → Developer Settings → Fine-grained tokens
2. Click **"Generate new token"**
3. Set expiration to 1 year
4. Under **Repository access**, select **"Only select repositories"** → pick the client repo
5. Under **Permissions → Contents**, set to **"Read and write"**
6. Everything else: **No access**
7. Click Generate, copy the token, paste it into Railway as `GITHUB_TOKEN`

The token can only write to that one repo. If it is ever leaked, it cannot touch anything else.

---

## What Triggers a Deploy

Railway (or Vercel) watches the GitHub repo for new commits. Every time an editor saves content through `/admin`, the GitHub Bridge commits a file. Railway detects that commit within seconds and starts a new build. The build takes approximately 45 to 90 seconds. During that time the old version stays live. When the build finishes, the new version goes live with zero downtime.

The editor does not need to do anything after clicking Save. The deploy is fully automatic.

---

## Reverting a Change

Because every save is a Git commit, every change is reversible.

1. Go to the GitHub repo → `content/static/` → find the file
2. Click **"History"** to see every version of that file
3. Click the commit you want to revert to → click the file → copy the content
4. Paste it back through the admin form and save, OR ask a developer to revert via `git revert`

This is better than WordPress revisions because it works for every content type, not just posts.

---

## What the Design Team Never Has to Touch

Once the components are built, the design team does not need to be involved in content changes. The JSON files drive the data. The components drive the design. They are completely separate:

- **Editor changes** `content/static/services/kitchen-remodeling.json` → new text and photos appear
- **Designer changes** `components/ServiceCard.tsx` → new layout applies to all services
- Neither touches the other's work

This is the core value of the headless architecture.

---

## Content Types for William B Construction

### `pages/{slug}.json` — Singleton pages
Used for: homepage, about, contact. There is exactly one of each.

### `services/{slug}.json` — Service pages
Used for: general contracting, kitchen remodeling, bathroom renovation, etc. One file per service. Adding a new file adds a new service page automatically.

### `projects/{slug}.json` — Portfolio entries
Used for: completed project showcase. One file per project. Photos, description, before/after.

### `testimonials/{slug}.json` — Client reviews
Used for: star ratings, review text, source badge (Google, Yelp, direct). Displayed in a testimonial grid or carousel.

---

## Summary | What Makes This Work

| Layer | Technology | Purpose |
|---|---|---|
| Editor UI | Next.js `/admin` forms | Human-friendly content editing |
| Auth | Supabase Auth or cookie secret | Keeps `/admin` private |
| Write layer | GitHub Contents API | Commits JSON to the repo |
| Validation | `editorial-gate.ts` | Prevents bad data from shipping |
| Storage | Git repo flat files | Source of truth, version history, free |
| Read layer | `fs.readFileSync` at build time | Zero DB queries, instant pages |
| Deploy | Railway/Vercel webhook on push | Automatic, zero-downtime |
| Design | React components | Completely separate from content |

The editor never sees code. The developer never has to deploy content. The design never breaks because of a content change. That is the system.
