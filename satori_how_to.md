# Satori Thumbnail System | How-To Guide

**Updated:** August 10, 2026
**Production URL:** `https://satori-neon.vercel.app/
**Token:** `satori_0c00f62203a65529f7dac2f75b74e684f3806484f23724a3`

---

## What Satori Does

Satori is a branded thumbnail generation server. For every article we publish it:

1. Finds a relevant Unsplash background photo matching the story topic
2. Renders a branded 1200×630 PNG (title, subtitle, logo, gradient overlay)
3. Returns the raw PNG bytes via `/api/v1/generate`

That PNG gets saved to `public/thumbnails/[slug].jpg` and set as `thumbnail_src` in the article JSON — a **static local file**, never a live CDN URL.

---

## The Golden Rule

> **Always download and save the PNG. Never store a live Satori URL in `thumbnail_src`.**

| Wrong | Correct |
|---|---|
| `"thumbnail_src": "https://www.fshot.one/api/v1/generate?..."` | `"thumbnail_src": "/thumbnails/my-slug.jpg"` |
| `"thumbnail_src": "https://www.ozonedailynews.com/api/og?slug=..."` | `"thumbnail_src": "/thumbnails/my-slug.jpg"` |
| Live render on every request | Static file served from `/public` |
| Breaks if Satori is down | Always works |
| Slow for social crawlers | Instant |

---

## The Correct Minting Method — Python urllib (Always)

**Never use `mint-thumbnails.ts` for individual articles.** That script calls Satori with bare defaults — no layout selection, no accent color, overlay always at 100 — and produces flat, dark thumbnails.

**Never use multi-line curl with shell variables.** Shell variable interpolation causes silent failures with special characters in titles.

**Always use Python `urllib`** with the full two-step flow below.

---

## The Two-Step Minting Flow

Every mint requires two API calls in order:

### Step 1 — `POST /api/v1/quick-generate`

Registers the article in the Satori DB and retrieves the best contextually matched Unsplash background photo. **Always run this first** — skipping it produces a generic or wrong photo.

### Step 2 — `GET /api/v1/generate`

Renders the final 1200×630 PNG with full parameter control: layout, accent color, overlay strength, and the `image_url` from Step 1.

---

## The Master Minting Template

Copy this block for every new article. Fill in the six variables at the top.

```python
import urllib.request, urllib.parse, json, os

SATORI_BASE = "https://www.fshot.one"   # local dev: http://localhost:3000
TOKEN       = "satori_0c00f62203a65529f7dac2f75b74e684f3806484f23724a3"
SLUG        = "category-article-slug-2026"
TITLE       = "Article Title | Specific Detail"
SUBTITLE    = "Short deck sentence — one or two lines max"
LAYOUT      = "cinematic"    # cinematic | breaking | standard | minimal
ACCENT      = "#00d4ff"      # hex — see accent guide below
OVERLAY     = "75"           # 0–100 — see overlay guide below
OUT_PATH    = f"public/thumbnails/{SLUG}.jpg"

# ── Step 1: Register + get contextual Unsplash photo ──────────────────────
payload = json.dumps({
    "network":  "ozone",
    "slug":     SLUG,
    "title":    TITLE,
    "subtitle": SUBTITLE,
    "layout":   LAYOUT,
}).encode()

req = urllib.request.Request(
    f"{SATORI_BASE}/api/v1/quick-generate",
    data=payload,
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"},
    method="POST"
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())

image_url = data.get("image_url", "")
print(f"image_url: {image_url[:80]}...")

# ── Step 2: Render PNG with full params ───────────────────────────────────
params = urllib.parse.urlencode({
    "network":   "ozone",
    "title":     TITLE,
    "subtitle":  SUBTITLE,
    "image_url": image_url,
    "layout":    LAYOUT,
    "accent":    ACCENT,
    "overlay":   OVERLAY,
})

req2 = urllib.request.Request(f"{SATORI_BASE}/api/v1/generate?{params}")
with urllib.request.urlopen(req2) as resp:
    png_bytes = resp.read()

os.makedirs("public/thumbnails", exist_ok=True)
with open(OUT_PATH, "wb") as f:
    f.write(png_bytes)

print(f"Saved: {OUT_PATH} ({len(png_bytes)//1024} KB)")
```

After minting, always run:

```bash
npm run wiki:sync -- --write
```

---

## Layout Selection

The layout controls the overall visual composition of the thumbnail.

| Layout | Resolution | Use when | Examples |
|---|---|---|---|
| `cinematic` | 1200×630 | Science, space, archaeology, biology, deep-dive features | NASA missions, Euclid telescope, Cold Atom Lab, Neanderthal studies |
| `breaking` | 1200×630 | Breaking news, time-sensitive stories, funding rounds, launches | SpaceX launches, Blue Origin funding, explosions, policy announcements |
| `standard` | 1200×630 | General news, everyday articles with no strong visual category | Politics, world news, business updates |
| `minimal` | 1200×630 | Opinion, editorial, text-heavy content | Op-eds, analysis pieces |
| `youtube` | 1280×720 | YouTube video coverage, video essays, trailer reactions | Imported YouTube thumbnails as base layer |
| `social` | 1200×1200 | Instagram, LinkedIn, square-format social posts | Social-first content, quote cards |

---

## Accent Color Guide

The accent color tints the gradient band and logo glow. Match it to the story topic — this is what separates a polished thumbnail from a generic one.

| Story type | Color | Hex |
|---|---|---|
| Space / quantum / physics | Electric cyan | `#00d4ff` |
| Tech / AI / software / spacecraft | Vivid blue | `#2563eb` |
| Finance / crypto / funding rounds | Emerald green | `#10b981` |
| Breaking news / danger / explosions | Alert red | `#ef4444` |
| Science / biology / archaeology / atmosphere | Teal | `#0d9488` |
| Gaming | Violet | `#7c3aed` |
| Politics / world affairs | Rose | `#f43f5e` |
| No override needed | Omit `accent` param | — |

---

## Overlay Strength Guide

The overlay is the dark gradient between the background photo and the title text. **This is the single biggest quality lever.** The script default of 100 buries the photo entirely. Lowering it is what makes thumbnails look cinematic rather than flat.

| Value | Effect | Use when |
|---|---|---|
| `100` | Full black — photo invisible (script default) | Never — avoid |
| `85` | Slight darkening | Breaking news, critical legibility |
| `80` | Standard — photo visible, text clear | Most `breaking` articles |
| `75` | Photo detail shows through | `cinematic` science/space with dramatic backgrounds |
| `70` | Photo-forward | Strong landscapes where context adds value |
| Below `65` | Text legibility suffers | Avoid unless background is very dark |

---

## Per-Category Quick Reference

| Category | Layout | Accent | Overlay |
|---|---|---|---|
| Science — Space | `cinematic` | `#00d4ff` | `75` |
| Science — Biology / Earth | `cinematic` | `#0d9488` | `70` |
| Tech — AI / Software | `breaking` | `#2563eb` | `80` |
| Tech — Spacecraft / Rockets | `breaking` | `#2563eb` | `80` |
| Finance / Funding | `breaking` | `#10b981` | `80` |
| Breaking News | `breaking` | `#ef4444` | `85` |
| Gaming | `cinematic` | `#7c3aed` | `75` |
| Politics / World | `breaking` | `#f43f5e` | `80` |
| Opinion / Editorial | `minimal` | _(omit)_ | `80` |

---

## After Minting — Always Sync the Registry

`content_registry.json` is what the homepage, hub pages, and sitemaps read. Rebuild it after every mint:

```bash
npm run wiki:sync -- --write
```

Until you run this, the new thumbnail will not appear on:
- Homepage article cards
- Hub page article grids
- Related article sidebars
- Google News / sitemap image tags

---

## Fixing CDN Violations (Existing Articles)

If `thumbnail_src` in a JSON file starts with `https://` — pointing to `satori-neon.vercel.app`, `fshot.one`, or `ozonedailynews.com/api/og` — it is a Golden Rule violation. Fix pattern:

```python
import urllib.request, urllib.parse, json, os

SATORI_BASE = "https://www.fshot.one"
TOKEN       = "satori_0c00f62203a65529f7dac2f75b74e684f3806484f23724a3"
JSON_PATH   = "content/static/articles/2026/05/my-article.json"

with open(JSON_PATH) as f:
    doc = json.load(f)

SLUG     = doc["slug"]
TITLE    = doc["title"]
SUBTITLE = doc.get("subtitle", "")
LAYOUT   = "cinematic"   # set correct layout for the article
ACCENT   = "#00d4ff"     # set correct accent
OVERLAY  = "75"

payload = json.dumps({"network":"ozone","slug":SLUG,"title":TITLE,"subtitle":SUBTITLE,"layout":LAYOUT}).encode()
req = urllib.request.Request(f"{SATORI_BASE}/api/v1/quick-generate", data=payload,
    headers={"Content-Type":"application/json","Authorization":f"Bearer {TOKEN}"}, method="POST")
with urllib.request.urlopen(req) as resp:
    image_url = json.loads(resp.read()).get("image_url","")

params = urllib.parse.urlencode({"network":"ozone","title":TITLE,"subtitle":SUBTITLE,
    "image_url":image_url,"layout":LAYOUT,"accent":ACCENT,"overlay":OVERLAY})
with urllib.request.urlopen(f"{SATORI_BASE}/api/v1/generate?{params}") as resp:
    png_bytes = resp.read()

out = f"public/thumbnails/{SLUG}.jpg"
os.makedirs("public/thumbnails", exist_ok=True)
with open(out,"wb") as f:
    f.write(png_bytes)

doc["thumbnail_src"] = f"/thumbnails/{SLUG}.jpg"
try:
    for img in doc["metadata"]["openGraph"]["images"]:
        img["url"] = f"https://www.ozonedailynews.com/thumbnails/{SLUG}.jpg"
except (KeyError, TypeError):
    pass

with open(JSON_PATH,"w") as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)

print(f"Fixed: {out} ({len(png_bytes)//1024} KB)")
```

Then run `npm run wiki:sync -- --write`.

---

## The Full New Article Workflow

```
1. Write static JSON  →  content/static/articles/YYYY/MM/{slug}.json
2. Mint thumbnail     →  Python urllib two-step (template above)
3. Sync registry      →  npm run wiki:sync -- --write
4. Verify locally     →  http://localhost:3000/[section]/[slug]
5. Commit
git add app/[section]/[slug]/page.tsx public/thumbnails/[slug].jpg lib/registry-data.json
git commit -m "feat: [slug] + thumbnail"
```

---

## Custom Thumbnails — Live Editor & Grok AI

The **Live Editor** is a browser-based Canva-style dashboard built directly into Satori. It lets you craft a thumbnail visually — no command line needed — and gives you access to every customization option including Grok-powered AI prompts.

Open it at:
```
http://localhost:3000
```
_(Satori must be running. Same `npm run dev` as above.)_

---

### Live Editor: Quick Start

1. Open `http://localhost:3001` in your browser
2. Either:
   - **Paste an article URL** into the URL import bar and click **Import** — Satori auto-fills title, subtitle, and finds a background photo
   - **Type a prompt** (flip toggle to ✨ Prompt mode) — e.g. `"Breaking: Spain wins Euro 2026"` — and Satori uses Grok to generate everything
3. Tweak any field in the sidebar
4. Click **Save to Satori** to register it in the DB

> The saved URL (`/api/v1/og?network=ozone&slug=...`) is what your minting script reads — the visual is locked in at that point.

---

### Game Articles — Grok-Powered Game Customization

For game coverage (reviews, previews, guides), the **Game Customization** panel unlocks a full set of game-specific options powered by the Grok AI.

Scroll to the **Game Customization** section in the sidebar and expand it.

#### Step 1 — Fill in the game details

| Field | What to enter | Example |
|---|---|---|
| Game Title | The exact title | `Elden Ring: Nightreign` |
| Franchise | Parent series if applicable | `Elden Ring` |
| Developer | Studio name | `FromSoftware` |
| Publisher | Publisher name | `Bandai Namco` |
| Genre | Pick from dropdown | `Soulslike` |

#### Step 2 — Select platforms

Toggle any platforms that apply. Each badge appears on the thumbnail corner:

| Badge | Colour |
|---|---|
| 🖥️ PC | Slate |
| 🎮 PS5 | Blue |
| 🎯 Xbox | Green |
| 🕹️ Switch | Red |
| 📱 Mobile | Grey |
| 🥽 VR | Purple |

#### Step 3 — Choose an overlay badge

Pick the label that stamps across your thumbnail banner:

| Badge | Use when… |
|---|---|
| ⭐ REVIEW | You're scoring the game |
| 🎮 GAMEPLAY | Hands-on / Let's Play |
| 👁️ FIRST LOOK | Early access / preview |
| 🔥 EXCLUSIVE | You have an exclusive angle |
| ⚡ BREAKING | News flash / announcement |
| 💭 OPINION | Op-ed / editorial |
| 📖 GUIDE | Walkthrough / tips |
| _(none)_ | Clean thumbnail, no badge |

#### Step 4 — Set a review score (optional)

Drag the **Review Score** slider (0–100). A colour-coded score badge appears:
- **80–100** → Gold (excellent)
- **60–79** → Green (good)
- **40–59** → Yellow (mixed)
- **0–39** → Red (poor)

Leave the slider off if this is not a scored review.

#### Step 5 — Generate a visual prompt with Grok

Click **🤖 Generate Game Visual with Grok**. The system sends your game details to `grok-3-mini` and gets back:

- A cinematic art-direction prompt for the background image
- Suggested Unsplash search keywords
- A colour palette suggestion
- An art style descriptor (e.g. `"Neon cyberpunk city streets with rain reflections"`)

The generated prompt auto-fills the **Enhance Image** text box. You can edit it before clicking **Mint Image**.

> **Grok API is live** — no extra setup needed. The `GROK_API_KEY` is already configured in the environment.

#### Full Game Review Example

```
Game Title:     Elden Ring: Nightreign
Franchise:      Elden Ring
Developer:      FromSoftware
Genre:          Soulslike
Platforms:      PS5, PC
Overlay Badge:  ⭐ REVIEW
Review Score:   88
```

→ Click **Generate Game Visual with Grok** → Edit prompt if needed → Click **Mint Image** → **Save to Satori**

---

### YouTube Thumbnails — Import Video Frames as Base Layer

Satori can now scrape YouTube video thumbnails and auto-generated frames. This is great for video essay coverage, trailer reactions, or any article about a specific YouTube video.

#### How it works

YouTube provides 5 free frame variants for every video — no API key needed:

| Frame | URL pattern | Resolution | Availability |
|---|---|---|---|
| Maxresdefault | `img.youtube.com/vi/{id}/maxresdefault.jpg` | 1280×720 | Most videos (not legacy) |
| HQ Default | `img.youtube.com/vi/{id}/hqdefault.jpg` | 480×360 | Always available |
| Auto frame 1 | `img.youtube.com/vi/{id}/1.jpg` | 320×180 | ~25% into video |
| Auto frame 2 | `img.youtube.com/vi/{id}/2.jpg` | 320×180 | ~50% into video |
| Auto frame 3 | `img.youtube.com/vi/{id}/3.jpg` | 320×180 | ~75% into video |

Metadata (title, channel name) is fetched from YouTube's free oEmbed endpoint — also no API key required.

#### Setup — no configuration needed

YouTube integration works out of the box. No API keys, no tokens, no environment variables. The endpoint uses:
- **YouTube oEmbed API** (`youtube.com/oembed`) — free, public, no auth
- **Direct `img.youtube.com` URLs** — public CDN, always available

#### Programmatic API — `POST /api/v1/fetch-youtube`

For scripts and automated workflows, use the dedicated endpoint:

```bash
curl -X POST "https://www.fshot.one/api/v1/fetch-youtube" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=sR6B5x6EAN8"}'
```

Returns:

```json
{
  "videoId": "sR6B5x6EAN8",
  "title": "Video Title Here",
  "channelName": "Channel Name",
  "channelUrl": "https://www.youtube.com/@channel",
  "thumbnailUrl": "https://img.youtube.com/vi/sR6B5x6EAN8/maxresdefault.jpg",
  "thumbnailFallbackUrl": "https://img.youtube.com/vi/sR6B5x6EAN8/hqdefault.jpg",
  "frames": {
    "maxres": "https://img.youtube.com/vi/sR6B5x6EAN8/maxresdefault.jpg",
    "sd": "https://img.youtube.com/vi/sR6B5x6EAN8/sddefault.jpg",
    "hq": "https://img.youtube.com/vi/sR6B5x6EAN8/hqdefault.jpg",
    "mq": "https://img.youtube.com/vi/sR6B5x6EAN8/mqdefault.jpg",
    "frame1": "https://img.youtube.com/vi/sR6B5x6EAN8/1.jpg",
    "frame2": "https://img.youtube.com/vi/sR6B5x6EAN8/2.jpg",
    "frame3": "https://img.youtube.com/vi/sR6B5x6EAN8/3.jpg"
  },
  "allFrameUrls": ["...", "...", "...", "...", "..."],
  "frameLabels": ["Thumbnail (HD)", "Thumbnail (HQ)", "Frame ~25%", "Frame ~50%", "Frame ~75%"]
}
```

#### Python urllib — pull YouTube + mint in one script

```python
import urllib.request, urllib.parse, json, os

SATORI_BASE = "https://www.fshot.one"
YT_URL      = "https://www.youtube.com/watch?v=sR6B5x6EAN8"
SLUG        = "youtube-video-article-2026"
BRAND       = "ozone"
LAYOUT      = "youtube"
ACCENT      = "#00d4ff"
OVERLAY     = "80"
OUT_PATH    = f"public/thumbnails/{SLUG}.jpg"

# ── Step 1: Fetch YouTube metadata ────────────────────────────────────────
req = urllib.request.Request(
    f"{SATORI_BASE}/api/v1/fetch-youtube",
    data=json.dumps({"url": YT_URL}).encode(),
    headers={"Content-Type": "application/json"},
    method="POST"
)
with urllib.request.urlopen(req) as resp:
    yt = json.loads(resp.read())

title     = yt["title"]
image_url = yt["thumbnailUrl"]
print(f"📺 {title}")
print(f"🖼  {image_url}")

# ── Step 2: Render PNG with YouTube layout ────────────────────────────────
params = urllib.parse.urlencode({
    "network":   BRAND,
    "title":     title,
    "subtitle":  f"via {yt['channelName']} on YouTube",
    "image_url": image_url,
    "layout":    LAYOUT,
    "accent":    ACCENT,
    "overlay":   OVERLAY,
})

with urllib.request.urlopen(f"{SATORI_BASE}/api/v1/generate?{params}") as resp:
    png_bytes = resp.read()

os.makedirs("public/thumbnails", exist_ok=True)
with open(OUT_PATH, "wb") as f:
    f.write(png_bytes)

print(f"✅ Saved: {OUT_PATH} ({len(png_bytes)//1024} KB)")
```

#### Extracting the video ID from a URL

If you need to construct YouTube thumbnail URLs yourself without the API, use the `extractYoutubeId()` helper pattern:

```python
import re

YT_ID_RE = r'(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})'

def extract_youtube_id(url: str) -> str | None:
    m = re.search(YT_ID_RE, url)
    return m.group(1) if m else None

# Then build the URL directly:
# https://img.youtube.com/vi/{id}/maxresdefault.jpg
# https://img.youtube.com/vi/{id}/hqdefault.jpg
```

#### Importing a YouTube video via Quick Import

1. Copy any YouTube URL (watch, shorts, embed, or youtu.be)
2. Paste it into the **Quick Import** bar at the top of the Editor tab
3. Click **Import**
4. Satori automatically:
   - Sets the headline to the video title
   - Sets the subtitle to `"via Channel Name on YouTube"`
   - Switches the layout to **YouTube** (1280×720)
   - Creates a base layer from the best available thumbnail

#### Loading YouTube frames in the Content tab

For more control, use the Content tab:

1. Switch to **🎬 Content** tab
2. Paste the YouTube URL in the **Screenshot from URL** field
3. Click **Load**
4. All 5 frame variants appear in the image source grid below

#### Copyright note

> YouTube thumbnails are copyrighted by the video creator. Using them as-is in your article's OG image may constitute infringement. Satori encourages using them as a **base layer** for transformation — combine with text overlays, brand logo, gradient overlays, and FLUX enhancement to create a substantially new work.

---

### 🧅 Layered Image Editor — Drag-and-Drop Style Layer Stack

The Content tab now includes a layered image compositing system inspired by Canva and Photoshop. Instead of picking a single background image, you can stack multiple images as layers with per-layer opacity, visibility, and z-ordering.

#### Layer controls

Each layer in the stack has:

| Control | What it does |
|---|---|
| 👁 Visibility toggle | Show or hide the layer without deleting it |
| Opacity slider | 0–100% — fade layers in/out for blends |
| ▲ Move up | Send the layer forward (higher z-index) |
| ▼ Move down | Send the layer backward (lower z-index) |
| ✕ Delete | Remove the layer from the stack |
| Thumbnail | Visual preview at current opacity |

#### Building a composite

1. Switch to the **🎬 Content** tab
2. Load images via YouTube URL, **Find Images** search, or game screenshots
3. Click any image in the **Image Sources** grid — it becomes a new layer
4. In the **🧅 Layers** panel:
   - Drag opacity sliders to blend layers together
   - Use ▲/▼ to reorder (top of stack = frontmost)
   - Toggle visibility on/off
5. The first layer added is set as the main `image_url` — subsequent layers are composited on top
6. Switch back to the **Editor** tab to see your composite in the live preview

#### Layer states

| Badge | Meaning |
|---|---|
| 🟣 Purple "L" badge | Image is in the layer stack |
| 🟢 Cyan checkmark | Image is the current base layer |
| Greyed-out text | Layer is hidden (visibility off) |

#### Clear all layers

Click **Clear all layers** at the bottom of the layer stack to reset. This also resets `image_url` to empty.

> **Note:** The layer compositing happens client-side in the editor. When you click **Publish Thumbnail** or **Save Override**, only the base `image_url` is sent to the Satori renderer. For true multi-layer PNG output, use the Mint/Enhance (FLUX) button to bake all layers into a single image first.

---

### Custom Accent Colour

Every brand has a default accent colour but you can override it per-thumbnail in the **Advanced** section of the sidebar.

1. Scroll to **Advanced** at the bottom of the sidebar
2. Click the **colour swatch** (or type a hex code like `#e53e3e`) in the **Accent Color** field
3. Choose from the six preset swatches or pick any colour
4. The live preview updates in real time

The accent colour affects the gradient overlay band and the logo text glow. Use this when:
- Covering a game with a strong brand colour (e.g. PlayStation blue `#003087`)
- Matching a sponsor or event's palette
- Creating a series of thumbnails with a consistent look

> Accent colour is saved with the thumbnail via `custom_accent` in the Supabase DB. The `/api/v1/generate?accent=%23e53e3e` parameter accepts any 6-digit hex.

---

### Overlay Strength

Control how dark the image gradient overlay appears — useful when the background photo has important detail you don't want to obscure.

1. In the **Advanced** section, drag the **Overlay Strength** slider
2. `100` = full overlay (default — best readability)
3. `50` = semi-transparent overlay (photo detail shows through)
4. `0` = no overlay (photo only — use with caution, text may be hard to read)

> The overlay is the dark gradient that sits between the background photo and the title text. Reducing it makes photos more visible but can hurt headline legibility on bright images. A value of `70–85` works well for most game screenshots.

---

### Uploading Original Media (Screenshots & Photos)

For first-hand game screenshots, press photos, or event photography — upload the original file directly into Satori instead of relying on Unsplash.

1. Scroll to **Original Media** in the sidebar
2. Either **drag-and-drop** a file onto the upload zone, or click to **browse**
3. Supported formats: JPEG, PNG, WebP, GIF (max 10 MB)
4. Satori uploads the file to secure storage and sets it as the background image

Once uploaded, a coloured **source badge** appears below the image URL:

| Badge | Meaning |
|---|---|
| 🟢 Original Upload | Your first-hand media — highest E-E-A-T value |
| 🔵 Unsplash | Stock photo pulled by the AI |
| 🟣 AI Generated | FLUX/Replicate-generated image |
| 🟠 External URL | Image linked from another site |

> **E-E-A-T tip:** Google rewards original, first-hand images. An "Original Upload" badge means the image is credited as `"Original — First-hand Media"` in the DB. Aim for at least 20% original media across your articles.

#### Accepted uploads

- Press-kit screenshots provided by the developer/publisher ✅
- Your own gameplay captures ✅
- Event photography you took yourself ✅
- Images scraped from another outlet ❌ (use Unsplash instead)

---

### Putting It All Together — Custom Game Thumbnail Workflow

```bash
# 1. Start Satori
cd ~/path/to/satori && npm run dev

# 2. Open the editor
#    http://localhost:3001

# 3. Paste the article URL or type a prompt → Import

# 4. In Game Customization:
#    - Fill in game title, genre, platforms
#    - Pick overlay badge (REVIEW / GAMEPLAY / etc.)
#    - Set review score if applicable
#    - Click "Generate Game Visual with Grok"

# 5. In Original Media:
#    - Drag in your screenshot or press-kit image (optional but recommended)

# 6. In Advanced:
#    - Set accent colour to match the game's brand (see accent guide)
#    - Set overlay to 75 for cinematic, 80 for breaking

# 7. Click "Save to Satori"

# 8. Run the Python two-step template to download the PNG
```

---

## Satori API Reference

**Production:** `https://www.fshot.one`
**Local dev:** `http://localhost:3000`

### Health check
```bash
curl https://www.fshot.one/api/health
```

### Step 1 — Register + get Unsplash image
```
POST /api/v1/quick-generate
Authorization: Bearer <token>
Content-Type: application/json

{ "network": "ozone", "slug": "...", "title": "...", "subtitle": "...", "layout": "..." }
```
Returns: `{ "image_url": "https://images.unsplash.com/..." }`

### Step 2 — Render PNG
```
GET /api/v1/generate?network=ozone&title=...&subtitle=...&image_url=...&layout=...&accent=...&overlay=...
```
Returns: raw PNG bytes (save to `public/thumbnails/{slug}.jpg`)

### `generate` Parameters

| Param | Required | Notes |
|---|---|---|
| `network` | Yes | Always `ozone` for this project |
| `title` | Yes | URL-encoded headline |
| `subtitle` | — | URL-encoded deck text |
| `image_url` | — | URL from `quick-generate` Step 1 |
| `layout` | — | `cinematic`, `breaking`, `standard`, `minimal`, `youtube`, `social` |
| `accent` | — | 6-digit hex e.g. `%2300d4ff` (URL-encode the `#`) |
| `overlay` | — | `0`–`100`, default `100` — use `75`–`85` |

### Look up a saved thumbnail
```bash
curl "https://www.fshot.one/api/v1/og?network=ozone&slug=my-article-slug"
```

### Fetch YouTube video metadata + frames
```
POST /api/v1/fetch-youtube
Content-Type: application/json

{ "url": "https://www.youtube.com/watch?v=sR6B5x6EAN8" }
```
Returns: `{ videoId, title, channelName, thumbnailUrl, frames: { maxres, hq, sd, mq, frame1, frame2, frame3 }, allFrameUrls, frameLabels }`

No authentication required. Uses YouTube's free oEmbed API and direct `img.youtube.com` URLs.

### Preview in browser
```
https://www.fshot.one/api/v1/generate?network=ozone&title=My+Title&layout=cinematic&accent=%2300d4ff&overlay=75
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Connection refused` on localhost:3000 | Satori is not running — start it with `npm run dev` in the Satori repo |
| `HTTP 308` from fshot.one | Use `https://www.fshot.one` — bare `fshot.one` permanently redirects |
| `HTTP 502` from any Satori URL | `satori-neon.vercel.app` is decommissioned — always use `www.fshot.one` |
| Thumbnail not showing on homepage | Run `npm run wiki:sync -- --write` then hard-refresh (`Cmd+Shift+R`) |
| Article header shows flat color | `thumbnail_src` is missing or a CDN URL — re-mint and fix the JSON field |
| Photo is wrong / generic | Run `quick-generate` Step 1 first — it fetches a topic-matched Unsplash photo |
| Thumbnail is too dark | Lower `overlay` from 100 to 75–80 |
| Wrong domain showing as `objectwire.org` | Run global domain fix: `grep -r "objectwire\.org" --include="*.json" -l | grep -v node_modules | xargs sed -i '' 's/objectwire\.org/objectivewire\.com/g'` then `npm run wiki:sync -- --write` |

---

## Never Do

- **Never** call `satori-neon.vercel.app` — returns 502
- **Never** call bare `fshot.one` — returns 308 redirect to `www.`
- **Never** store a live URL in `thumbnail_src` — always save the PNG first
- **Never** use multi-line curl with shell variables — use Python urllib
- **Never** use `mint-thumbnails.ts` for individual articles — bare defaults, overlay=100, no accent
- **Never** skip `npm run wiki:sync -- --write` after minting
