# Supabase | Headless Git CMS Reference
**Last updated:** May 29, 2026
**Repo:** `aMarketology/ozonedailynews.com`
**Lost project ID:** `tqmrcznkgoupcwhonbyy` (https://tqmrcznkgoupcwhonbyy.supabase.co)

---

## What Supabase Actually Does in This System

Supabase has exactly three jobs. The live site does not depend on any of them.

### 1. Editor Authentication
Supabase Auth powers the login at `/login`. The `/admin` layout checks for a valid session and redirects anyone without `is_editor = true` in the `profiles` table. Without a connected Supabase project, `/admin` redirects every request to `/login` and login always fails.

### 2. Draft Storage (private scratchpad only)
When you click Save in `/admin/articles/new` or `/admin/articles/edit/[slug]`, the article is written to a Supabase `articles` table as `status = draft`. This is a private staging area. **The live site never reads from it.**

### 3. Publish Bridge (status tracking only)
When you click Publish in the admin UI, the API route (`/api/cms/publish`):
1. Reads the draft from Supabase
2. Runs the E-E-A-T gate (word count, author, canonical, no em dashes, etc.)
3. Commits the static JSON directly to GitHub via the GitHub Contents API
4. Updates the Supabase row `status → published`

Step 4 is a bookkeeping write. The commit in step 3 is what actually makes an article live. Supabase never holds the source of truth.

---

## The Critical Fact

> **The live site reads zero from Supabase.**

Every article served to readers comes from static JSON files in `content/static/`. Losing Supabase access does not take down the site, break any live article, or affect the sitemap, RSS feed, or structured data. The 10 published articles already in `content/static/articles/` are live and will stay live regardless of what happens to the Supabase project.

---

## Can You Write Articles Without Supabase Connected?

**Yes, fully.** There are two paths:

### Path 1 | Write Static JSON Directly (no Supabase needed at all)

Create the JSON file manually in `content/static/articles/` following the schema, then register it:

```bash
# 1. Create the file
# content/static/articles/your-slug.json

# 2. Register it in the registry
npm run wiki:sync -- --write

# 3. Commit and push (Railway auto-deploys in ~60 seconds)
git add -A && git commit -m "publish: Article Title" && git push
```

Every quality gate (E-E-A-T, OStandard rules) still applies — they are enforced by convention and Copilot instructions, not only by the API gate.

**Use this path now while Supabase is disconnected.**

### Path 2 | Admin UI (requires Supabase)

The `/admin` form is the preferred editor workflow but it requires a live Supabase connection for auth and draft storage. This path is blocked until Supabase is reconnected.

---

## Reconnecting Supabase | Two Options

### Option A | Recover the Old Project (try first)

1. Go to [supabase.com](https://supabase.com)
2. Click **Sign In** and try **Forgot Password** with any email tied to `aMarketology`
3. If you recover access, the project `tqmrcznkgoupcwhonbyy` will appear in your dashboard
4. No env var changes needed — `.env` already has the correct keys

### Option B | New Supabase Project (if locked out permanently)

**Time to complete: ~15 minutes.**

#### Step 1 | Create the project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project
2. Note the new project URL and anon key from **Project Settings > API**

#### Step 2 | Run the schema
In the Supabase SQL Editor, run both files in order:
1. `supabase/schema.sql`
2. `supabase/cms-migration.sql`

#### Step 3 | Create your editor account
1. Go to **Authentication > Users** in the Supabase dashboard
2. Click **Invite User** and use your email
3. In the SQL Editor, run:
```sql
UPDATE profiles
SET is_editor = true, brand_slugs = '{ozone}'
WHERE email = 'your@email.com';
```

#### Step 4 | Update `.env`
Replace these four values with the new project's credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
```
`GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` are unchanged.

#### Step 5 | Backfill existing articles
```bash
npm run backfill
```
This imports all existing static JSONs from `content/static/articles/` into the new Supabase project as `status = published`.

#### Step 6 | Update Railway env vars
Set the same three env vars in the Railway dashboard so the deployed site also connects to the new project.

---

## Static JSON Article Schema (for Path 1 manual writes)

Minimum required fields for a valid `NewsArticleDB` article:

```json
{
  "slug": "your-article-slug",
  "url": "https://www.ozonedailynews.com/science/your-article-slug",
  "title": "Primary Keyword | Specific Detail",
  "subtitle": "One sentence summary of the article.",
  "category": "Science",
  "article_type": "news_article",
  "status": "published",
  "published_at": "2026-05-29T10:00:00-05:00",
  "publish_date": "May 29, 2026",
  "author_name": "Simon Alfred Minter",
  "author_slug": "simon-minter",
  "tags": ["Tag One", "Tag Two", "Tag Three", "Tag Four"],
  "thumbnail_src": "https://...",
  "thumbnail_alt": "Description of image",
  "metadata": {
    "title": "Primary Keyword | Specific Detail",
    "description": "130-155 character description with primary keyword in first 60 characters.",
    "keywords": [],
    "alternates": {
      "canonical": "https://www.ozonedailynews.com/science/your-article-slug"
    },
    "openGraph": {
      "title": "Primary Keyword | Specific Detail",
      "description": "Same as metadata description.",
      "url": "https://www.ozonedailynews.com/science/your-article-slug",
      "type": "article",
      "publishedTime": "2026-05-29T10:00:00-05:00",
      "section": "Science"
    }
  },
  "content_html": "<p>Article body here. Minimum 300 words. Must contain at least one &lt;h2&gt;.</p>"
}
```

---

## Current Status Summary

| System | Status |
|---|---|
| Live site (ozonedailynews.com) | Fully operational, unaffected |
| Static JSON articles (10 published) | Live and serving correctly |
| `/admin` editor UI | Blocked (no Supabase auth) |
| Manual JSON publishing (Path 1) | Available now, no Supabase needed |
| Supabase project `tqmrcznkgoupcwhonbyy` | Access lost, recovery pending |
