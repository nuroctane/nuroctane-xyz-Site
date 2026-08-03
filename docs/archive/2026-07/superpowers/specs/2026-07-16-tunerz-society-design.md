# TUNERZ SOCIETY — Design Spec & Claude Handoff

**Status:** Design handoff (brainstorm consolidated into one transcript)  
**Date:** 2026-07-16  
**Repo:** `nuroctane.xyz` (workspace root: `C:\Users\david\Laboratory\nuroctane.xyz`)  
**Owner context:** David is VP of ATX Tunerz Society; personal site is Digital Sea portfolio  
**Next agent:** Claude (or any implementer) — **do not freestyle past this spec**; resolve open decisions with user first, then write an implementation plan (`writing-plans`) before coding.

---

## 0. Original user prompt (verbatim transcript)

> i want to make another page for atx_tunerz_society called TUNERZ SOCIETY
>
> basicall this is our ig page:
>
> https//www.instagram.com/atx_tunerz_society/
>
> this is our most next eventE
>
> tally.so/r/kYxYB
>
> these are some assets for the clubE
>
> :\Workstation\ASSETs\Image Assets\Car Meets (the invitational is the one coming up)
>
> here are some of our logos, ignore the "testers" folder"
>
> E:\Workstation\ASSETs\Image Assets\Logos\Tunerz Logos
>
> we had a merch drop but no actual site for it, people dm'd to order, some of the assets are in ther tunerz shirts directory:
>
> https//www.instagram.com/p/DWu9YLgDHyp/?img_index=1
>
> i basically want it to be a 3d scroll experience through downtown austin texas using this as a framework:
>
> https//github.com/SNU-VGILab/Extend3D
>
> actually just brainstorm the plan into a spec with my original prompt in one transcscript so claude can take over

*(URLs in the original prompt omitted `:` after `https` — corrected below.)*

**Follow-up intent:** Stop multi-turn Q&A. Capture full brainstorm + research as a single handoff spec so Claude can continue (plan → implement).

---

## 1. Product goal

Build a branded **TUNERZ SOCIETY** destination page for the Austin car club that:

1. Feels like a **3D scroll / drive through downtown Austin** (immersive, night-energy, club culture — not a generic landing page).
2. Surfaces the **next event** (The Invitational) with clear CTA to the Tally form.
3. Links **Instagram** as the living community feed.
4. Showcases **merch** (previous drop was DM-only; site should at least present product visuals + order path).
5. Lives on **nuroctane.xyz** as a first-class route (same monorepo patterns as `/modkeys` and `/cli`), and becomes the destination for the existing Digital Sea node `atxtunerz`.

**Success criteria (draft):**

| Criterion | Measure |
|-----------|---------|
| Immersion | Scroll feels like moving through a city corridor; brand logo + event landmarks readable |
| Conversion | Primary CTA opens event signup (Tally); secondary CTA opens IG |
| Merch | Shirt/drop assets visible; clear “how to order” (even if still DM/IG for v1) |
| Performance | Mobile usable; desktop premium; lazy 3D; reduced-motion fallback |
| Integration | Sea node + OG/meta/analytics wired like other flagship pages |
| Ship path | Vercel deploy of digital-sea artifact; no dependency on local GPU at runtime |

---

## 2. Corrected links & external references

| Item | URL / path | Notes |
|------|------------|--------|
| Instagram | https://www.instagram.com/atx_tunerz_society/ | Official IG |
| Merch IG post | https://www.instagram.com/p/DWu9YLgDHyp/?img_index=1 | Prior merch drop (DM orders) |
| Next event form | https://tally.so/r/kYxYB | **Verify live** — fetch returned 404/generic Tally shell at research time; may be private, expired, or incomplete ID |
| Extend3D repo | https://github.com/SNU-VGILab/Extend3D | CVPR 2026 research — **not a web framework** |
| Extend3D project page | https://seungwoo-yoon.github.io/extend3d-page | Town-scale 3D generation from single image |
| Existing sea node | `artifacts/digital-sea/src/data/nodes.ts` → `id: 'atxtunerz'` | Currently points at IG only |

---

## 3. Project context (repo research)

### 3.1 Monorepo shape

- **Workspace:** pnpm monorepo (`artifacts/*`, `lib/*`, `scripts`)
- **Public site app:** `artifacts/digital-sea` — React + Vite + Tailwind + **Wouter**
- **3D already in stack:** `three@^0.184`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- **Flagship page patterns:**
  - `/modkeys` — heavy 3D / dual-shell, lazy-loaded page
  - `/cli` — branded product landing (NurCLI gold TUI)
- **Routing:** `artifacts/digital-sea/src/main.tsx` top-level path switch (`quotes`, `books`, `resume`, `modkeys`, `cli` → else Digital Sea `App`)
- **Analytics:** `lib/analytics.ts` top-route list
- **OG for bots:** edge `middleware.js` `PAGES` map + `/api/og`
- **Deploy:** Vercel; `vercel.json` output → `artifacts/digital-sea/dist/public`
- **Ship ritual:** `AGENTS.md` → `SHIP.md` / ship-deploy skill (commit → push main → 7z backup)

### 3.2 Existing ATX Tunerz integration

```ts
// nodes.ts (excerpt)
{
  id: 'atxtunerz',
  label: 'ATX Tunerz Society',
  handle: '@atx_tunerz_society',
  url: 'https://www.instagram.com/atx_tunerz_society/',
  // ...
  description: "the Austin, TX car club that im VP of.",
}
```

**Design decision for implementer:** Point `url` (and any secondary node links) to the new page (e.g. `/tunerz` or `/tunerz-society`) with IG as in-page secondary, **or** keep IG as external and add a second CTA — **recommend primary URL → new page**.

### 3.3 What Extend3D actually is (critical)

Extend3D is a **training-free offline pipeline** to generate a **town-scale 3D scene from a single image**, built on Trellis / Microsoft TRELLIS-image-large.

- **Requirements:** Linux x86-64, NVIDIA GPU ~**24GB VRAM**, CUDA ≥ 12.4, conda env
- **Outputs:** Gaussian splat video renders + **GLB** via postprocessing (`to_glb`)
- **Not:** a browser scroll library, React component, or Three.js template

**Implication for the site:** Extend3D can only be an **asset production tool** (optional offline pipeline). Runtime must be **Three.js / R3F** (already in digital-sea) consuming exported geometry/textures/video — same class of problem as Modkeys’ 3D page, not “import Extend3D into Vite.”

---

## 4. Local assets inventory (source of truth on disk)

**Ignore:** `E:\Workstation\ASSETs\Image Assets\Logos\Tunerz Logos\testers\`

### 4.1 Logos

`E:\Workstation\ASSETs\Image Assets\Logos\Tunerz Logos\`

| Asset | Path |
|-------|------|
| PSD master | `Tunerz Logos.psd` |
| Official jpg | `raw assets/tunerz logo official.jpg` |
| White PNG | `raw assets/tunerz society white.png` |
| Dark orange PNG | `raw assets/tunerz society dark orange.png` |
| Red PNG | `raw assets/tunerz society red.png` |
| Full color PNG | `raw assets/tunerz society.png` |
| SVG white | `raw assets/tunerz society white.svg` |
| SVG color | `raw assets/tunerz society.svg` |

**Mark language:** Brush/graffiti wordmark **“TUNERZ”** over softer script **“Society”** on a black block silhouette. Aggressive street-tuner energy; high contrast.

### 4.2 Merch

`E:\Workstation\ASSETs\Image Assets\Logos\Tunerz Logos\Tunerz Shirts\`

| Asset | Notes |
|-------|--------|
| `front top left.png` | Chest print: silver car silhouette + TUNERZ Society wordmark |
| `back.png` | Full back print (large file) |

Merch historically sold via **IG DMs**, no storefront.

### 4.3 Car meets / event creatives

`E:\Workstation\ASSETs\Image Assets\Car Meets\`

| Folder | Role |
|--------|------|
| **Staging The Invitational/** | **Next event** — flyer + PSD + `done/` exports |
| Staging CC Premeet/ | Past meet car grid (`sent/`) |
| Staging ON DISPLAY/ | Member car portraits |
| Staging Winter Whiplash/ | Past event staging |
| Flyers/ | Friendsgiving, Winter Whiplash finals |
| Cars for ALS/ | Charity collab flyers + partner logos |

**The Invitational (from flyer):**

- Title: **The Invitational** (with “The” script treatment)
- Co-brand: **G.O.T.A. — Garages of the Americas**, **TUNERZ Society**, **LEGACY**
- Date/time: **July 18**, **5PM – 9PM**
- Location: **13807 FM 812, Del Valle TX 78617**
- Visual: split black/white McLaren-style race car, chrome tunnel, RGB light streaks, high-gloss night garage energy

**Flyer font notes** (from local README in Invitational staging — for *other* Canva pieces; still useful brand system):

- Great Vibes, Abril Fatface, Anton, Montserrat (SIL OFL / Google Fonts)

### 4.4 Preview copies in repo (research only)

During brainstorming, previews were copied to:

`.nur/tunerz-preview/` (local agent cache — **do not ship**; re-import optimized assets into `public/` during implementation)

---

## 5. Brand / design tokens (from assets)

### 5.1 Palette

| Token | Approx | Use |
|-------|--------|-----|
| `--tz-black` | `#000000` / near-void | Page ground, logo block |
| `--tz-white` | `#FFFFFF` | Primary type, wordmark invert |
| `--tz-orange` | `#C45A1A`–`#E06A1F` (dark orange logo) | Accent, time callouts, CTA hover |
| `--tz-red` | `#FF0000`–`#E10600` | Aggression accent, limited highlights |
| `--tz-chrome` | cool grays `#A8B0B8`–`#E8EEF2` | Merch car chrome, UI chrome lines |
| `--tz-neon-rgb` | cyan / magenta / amber streaks | Motion / light bars (from Invitational flyer) |
| `--tz-blue-badge` | saturated blue (LEGACY / location globe) | Secondary info chips |

**Overall vibe:** Night garage + street graffiti + super-lap chrome. Not soft lifestyle. Not Code Lyoko Digital Sea aesthetic — **own brand skin** on the page (like `/cli` is gold TUI, not sea).

### 5.2 Type

| Role | Direction |
|------|-----------|
| Display / hero | Condensed industrial + custom wordmark image (logo SVG/PNG), not recreating graffiti in CSS |
| Event titles | High-contrast display (Abril Fatface / Anton energy) |
| Body / UI | Clean geometric sans (Montserrat or system Inter-like) |
| Script flourishes | Great Vibes-class only for “The” / small labels — sparingly |

### 5.3 Motion

- Scroll-linked camera path through city corridor (primary).
- Light streak / chromatic aberration / film grain optional (keep tasteful; respect `prefers-reduced-motion`).
- Section pins: Event → Gallery → Merch → Join / IG.
- Sound: optional later; Digital Sea has `AudioProvider` — **do not autoplay club audio without mute control**.

---

## 6. Approaches (2–3) + recommendation

### Approach A — Offline Extend3D asset → browser viewer

1. Generate downtown-Austin-like town scene offline with Extend3D (or TRELLIS-based pipeline) from a seed photo.
2. Export GLB / Gaussian (if web-splat support) / baked video path.
3. Build scroll-driven camera along a spline in R3F.

| Pros | Cons |
|------|------|
| Closest to user’s “using Extend3D” wording | 24GB GPU, Linux, research code; multi-day asset pipeline |
| Unique authentic town mesh | Assets huge; mobile hard; licensing/quality variance |
| | Not runnable on Vercel build agents |

### Approach B — Stylized Three.js “Austin drive” (runtime procedural / kitbash)

1. Build a **night city corridor** in R3F: extruded blocks, billboards, road, neon, landmark silhouettes (Capitol / skyline *suggestive*, not GIS-accurate).
2. Scroll maps to camera progress; HTML overlays for Event / Merch / IG.
3. Use club logos, flyer, car photos as **billboards and world props**.

| Pros | Cons |
|------|------|
| Ships in monorepo with existing Three stack | Not photoreal town from Extend3D |
| Mobile-tunable LOD | Needs art direction discipline |
| Matches `/modkeys` engineering culture | “Downtown Austin” is stylized, not surveyed |

### Approach C — Hybrid (recommended for v1)

1. **Hero experience:** scroll-driven 3D (Approach B) *or* high-quality pre-rendered path video as fallback layer.
2. **Content spine:** sticky/pinned sections — Next Event (Invitational + Tally), Meet Culture gallery (existing flyers/cars), Merch, Join (IG + future Discord if any).
3. **Optional later:** swap in Extend3D GLB when generated (same camera-spline interface).

| Pros | Cons |
|------|------|
| Ships without GPU lab | Extend3D becomes phase 2, not day-1 |
| Clear content + immersion | Two visual systems to keep cohesive |
| Upgrade path preserves architecture | Pre-render video needs production pass |

### Recommendation

**Ship Approach C with B as the default 3D engine.** Treat Extend3D as an **optional offline asset upgrade**, not a runtime dependency. Document an `AustinScene` interface so a future GLB can replace procedural city without rewriting page chrome.

**Do not** block the marketing page on running Extend3D successfully.

---

## 7. Proposed product design (sections)

### 7.1 Route & naming

| Item | Proposal |
|------|----------|
| Path | `/tunerz` (short) — alt `/tunerz-society` |
| Title | `TUNERZ SOCIETY` |
| Subtitle | Austin car culture · ATX Tunerz Society |
| Page name in code | `TunerzPage` / `tunerz-page.css` (scoped like `cli-page.css`) |

### 7.2 Information architecture (scroll story)

```
[0] Boot / logo sting          — black void, white/orange wordmark, “scroll to enter ATX”
[1] Downtown corridor scroll   — 3D drive; billboards with meet photos / logos
[2] NEXT EVENT pin             — The Invitational card (date, place, flyer, Tally CTA)
[3] Culture / archive          — past meets (Winter Whiplash, ON DISPLAY, ALS, etc.) grid
[4] Merch bay                  — shirt front/back; “DM to order” or Tally/link later
[5] Join the Society           — IG primary, optional copy about club
[6] Footer                     — credit G.O.T.A./partners if required; link back to Digital Sea
```

### 7.3 Primary CTAs

1. **RSVP / Enter The Invitational** → `https://tally.so/r/kYxYB` (confirm URL)
2. **Follow @atx_tunerz_society** → Instagram
3. **Merch** → IG post or DM instructions for v1 (full checkout out of scope unless user later wants Shopify/Stripe)

### 7.4 Content data model (static first)

```ts
// conceptual — implement as typed module under src/data/tunerz.ts
type TunerzEvent = {
  id: string;
  name: string;
  dateLabel: string;      // "July 18"
  timeLabel: string;      // "5PM – 9PM"
  venue: string;
  address: string;
  flyer: string;          // public asset path
  ctaUrl: string;         // Tally
  ctaLabel: string;
  partners?: { name: string; logo?: string }[];
};

type TunerzMerchItem = {
  id: string;
  name: string;
  images: string[];
  orderHint: string;      // "DM @atx_tunerz_society to order"
  orderUrl?: string;
};
```

YAGNI: no CMS, no cart, no auth for v1.

---

## 8. Technical architecture

### 8.1 Placement

```
artifacts/digital-sea/
  public/assets/tunerz/     # optimized logos, flyer, merch, optional glb/video
  src/pages/TunerzPage.tsx  # route entry (lazy)
  src/tunerz/               # isolated feature module
    scene/                  # R3F canvas, camera path, city, billboards
    sections/               # Event, Gallery, Merch, Join overlays
    data.ts
    tokens.css or tunerz-page.css
  src/main.tsx              # add top === 'tunerz'
  src/lib/analytics.ts      # '/tunerz'
  src/lib/pageMeta.ts       # title/description
middleware.js               # PAGES.tunerz OG
```

### 8.2 Runtime stack

- React 19 + Vite (existing)
- R3F + Drei + Three (existing deps — prefer reuse over new 3D stack)
- Framer Motion optional for HTML overlays (already cataloged)
- **No** Extend3D Python, CUDA, or conda in this repo

### 8.3 Scene interface (isolation)

```ts
// conceptual contract
interface AustinScrollSceneProps {
  progress: number; // 0..1 from scroll
  reducedMotion: boolean;
  billboards: { id: string; textureUrl: string; position: [number, number, number] }[];
  mode: 'procedural' | 'glb' | 'video-fallback';
  glbUrl?: string;
  videoUrl?: string;
}
```

HTML sections use `position: sticky` / scroll progress hooks; canvas is `position: fixed` full-viewport behind content (pattern common to 3D scroll landings).

### 8.4 Performance budget (targets)

| Device | Target |
|--------|--------|
| Desktop | 60fps on mid GPU; DPR cap 1.5–2 |
| Mobile | 30–60fps; lower poly, fewer lights, optional static poster + CSS parallax fallback |
| Initial JS | Lazy route; Three only loads with page |
| Assets | Compress PNG→WebP/AVIF where possible; flyer < 400KB web; logos SVG preferred |

### 8.5 Accessibility & resilience

- `prefers-reduced-motion: reduce` → static hero (flyer + logo), no camera scroll hijack
- Keyboard: skip link to Event CTA
- External links: `rel="noopener noreferrer"`
- If WebGL fails: show flyer-first landing with same content sections

### 8.6 Analytics & OG

Mirror `/cli` / `/modkeys`:

- Top page route `/tunerz`
- Events (suggested): `Tunerz Event CTA`, `Tunerz IG Click`, `Tunerz Merch Click`
- OG title: `TUNERZ SOCIETY — ATX Car Culture`
- OG image: branded card (logo + Invitational still or chrome car crop)

### 8.7 Sea node update

When page ships:

- `nodes.ts` `atxtunerz.url` → `https://www.nuroctane.xyz/tunerz` (or path-only `/tunerz` if internal router expects absolute — match existing node URL style; currently absolute external)
- Avatar can remain IG avatar or swap to official logo

---

## 9. Error handling & edge cases

| Case | Behavior |
|------|----------|
| Tally URL dead | Show event details + “check Instagram for RSVP”; do not 404 the whole page |
| WebGL unavailable | 2D fallback layout |
| Heavy GLB missing | Procedural city only |
| Missing merch order URL | Display DM instruction + IG deep link |
| July 18 event passes | Data-driven: mark “Past event” or swap next event in `data.ts` — no hardcode-only UI |

---

## 10. Testing strategy

| Layer | What |
|-------|------|
| Manual | Desktop + mobile Chrome; scroll full story; CTAs open correct tabs |
| Visual | Logo contrast on black; flyer legibility; merch crops |
| Route | Direct load `/tunerz`, refresh, OG bot user-agent sample |
| Perf | Lighthouse mobile; confirm Three not on homepage bundle |
| Regression | Digital Sea, `/modkeys`, `/cli` still route correctly |
| Typecheck | `pnpm` workspace typecheck/build smoke |

Automated unit tests not required for v1 static content unless adding non-trivial pure helpers (scroll progress clamp, etc.).

---

## 11. Phased delivery

### Phase 1 — MVP (ship)

- Route + CSS brand shell
- Import optimized logos, Invitational flyer, shirt images
- Event section + working Tally CTA (after URL confirm)
- IG + merch sections
- **Procedural / kitbash 3D scroll corridor** with billboards
- Reduced-motion + WebGL fallback
- Analytics + middleware OG + sea node URL

### Phase 2 — Polish

- Stronger Austin skyline silhouettes, neon, postprocessing
- Gallery of past meets from Car Meets folders
- Merch multi-item if more SKUs appear
- Sound design (muted default)

### Phase 3 — Extend3D upgrade (optional)

- Offline generate town-scale mesh from Austin seed image
- Export GLB; plug into `mode: 'glb'`
- Only if someone has the GPU pipeline and accepts asset weight

---

## 12. Explicit non-goals (v1)

- Full e-commerce checkout / inventory
- Member login / gated society portal
- Live Instagram API feed (static embeds / outbound links only)
- Running Extend3D in CI or browser
- Pixel-perfect GIS map of Austin
- Touching Handmade-by-Casimir or other isolated repos

---

## 13. Open decisions for Claude / user (resolve before heavy build)

1. **Route slug:** `/tunerz` vs `/tunerz-society`?
2. **Tally form:** Confirm final live URL and that July 18 details still match flyer.
3. **3D fidelity for MVP:** procedural corridor (faster) vs wait for custom GLB?
4. **Merch order path:** DM-only copy vs temporary Tally vs future store?
5. **Partner credit:** Must G.O.T.A. / LEGACY logos appear on site for The Invitational?
6. **Sea node:** Replace IG URL with new page, or dual-link?
7. **Domain framing:** Page is clearly part of nuroctane.xyz (portfolio project) vs “official club site” tone?

**Nur recommendation if user is unavailable:**

1. `/tunerz`  
2. Keep flyer facts; soft-fail CTA if Tally 404  
3. Procedural 3D MVP  
4. DM/IG merch  
5. Text credit partners; logos if rights clear  
6. Sea node → `/tunerz`  
7. Official club energy, small “on nuroctane.xyz” footer credit  

---

## 14. Implementation notes for Claude

1. **Invoke `writing-plans`** after any open decisions are closed (or after accepting defaults above).
2. Follow monorepo patterns from `CliPage` / `ModkeysPage` for lazy route + scoped CSS.
3. Copy assets from `E:\Workstation\...` into `artifacts/digital-sea/public/assets/tunerz/` with **web-optimized** derivatives — never commit multi-hundred-MB PSDs.
4. Ignore `testers` logo folder.
5. Do not add Extend3D Python deps to this repo.
6. When user says ship/push/deploy: follow `AGENTS.md` → `SHIP.md`.
7. Keep feature isolated under `src/tunerz/` so Digital Sea stays clean.
8. Brand is **black / white / orange / red graffiti chrome**, not Digital Sea blue/terminal.

### Suggested first implementation plan tasks (for writing-plans)

1. Scaffold route + empty `TunerzPage` + meta/analytics/middleware  
2. Asset pipeline (logo SVG, flyer WebP, merch WebP)  
3. Static sections (Event, Merch, Join) without 3D  
4. R3F scroll scene v1 (corridor + camera path)  
5. Billboards + brand props  
6. Fallbacks (reduced motion, no WebGL)  
7. Wire sea node + QA mobile  
8. Ship  

---

## 15. Spec self-review (inline)

| Check | Result |
|-------|--------|
| Placeholders | Open decisions listed explicitly; defaults provided |
| Consistency | Extend3D offline-only; runtime = R3F; matches monorepo |
| Scope | Single page + wiring; merch checkout & Extend3D GPU deferred |
| Ambiguity | Route/Tally/3D mode called out; recommendations given |
| Original prompt | Captured in §0 |

---

## 16. Handoff message (paste for Claude)

```
Continue TUNERZ SOCIETY from docs/superpowers/specs/2026-07-16-tunerz-society-design.md.

Context: ATX Tunerz Society club page on nuroctane.xyz — 3D scroll through downtown Austin energy,
event (The Invitational) + Tally, IG, merch. Extend3D is offline asset gen only, NOT a web framework.
Use existing digital-sea R3F/Three stack. Assets on E:\Workstation\ASSETs\... (see spec inventory).

User asked for brainstorm→spec handoff; open decisions in §13 (use §13 recommendations if blocked).
Next: writing-plans → implement Phase 1 MVP. Do not start Extend3D GPU work for v1.
```

---

*End of design spec.*
