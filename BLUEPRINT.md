# BLUEPRINT — Jesus Power School of Ministry & Retreat Center

Status: **approved and implemented** (see DEPLOY.md for rollout)
Owner: Ayonotx
Repo: `github.com/Ayonotx/JesusPowerMinistry` (branch `main`)
Live: `https://jesuspowersmrc.org` (LiteSpeed/cPanel) + `https://ayonotx.github.io/JesusPowerMinistry/` (GitHub Pages mirror)

---

## 1. What we found

The site is a hand-written static site: 8 HTML pages, one `assets/css/style.css`, one
`assets/js/script.js`. There is no build step and no CMS.

### Blocking defects (verified against the live domain and repo)

| # | Defect | Impact |
|---|--------|--------|
| 1 | `assets/js/script.js:102` — `SyntaxError: Unexpected identifier 'style'` | **The whole script fails to parse.** Mobile menu, gallery filter, lightbox, contact form, booking form, scroll-to-top and reveal animations are all dead on **every page**. |
| 2 | Mobile hamburger does nothing (consequence of #1) | Site is unnavigable below 768 px. Confirmed by clicking it. |
| 3 | `videos.html` references 11 files in `imges/videos/` that are **not in the repo** | Dead players on GitHub Pages. They **do** exist on `jesuspowersmrc.org`, so the page is only broken on the mirror. |
| 4 | 5 stacked pulsing social buttons | Cover the hero headline on tablet/mobile. |
| 5 | Form handlers append a new button row on every submit, and do not URL-encode input | Broken/duplicate UI; `&`, `#`, newlines corrupt the `mailto:` link. |
| 6 | `.nav-menu` positioned at hardcoded `top: 56px`; navbar is ~59 px | Misaligned mobile menu. |
| 7 | Emoji used as icons (🏢 📖 📚 👤 💕 📍) | Inconsistent across OS/browser; main "vibe-coded" tell. |
| 8 | No `aria-expanded`, no focus-visible rings, lightbox not keyboard accessible | Fails accessibility basics. |
| 9 | Gallery items have no intrinsic aspect ratio; 113 images | Layout shift (CLS) and a 44 KB HTML page. |
| 10 | `jesuspowersmrc.org` in footer/`og:url` but no `CNAME` in repo; `www.` TLS cert invalid | Domain and repo are unrelated deployments. |

### Two copies, deliberately kept

* `jesuspowersmrc.org` — LiteSpeed shared hosting, **complete** (has the videos). This is where PHP can run.
* GitHub Pages — static mirror, **missing the videos**.

Per the owner's decision, **both stay live and in sync**. The admin panel can only run on
the cPanel host (GitHub Pages cannot execute PHP), so the domain is canonical for content.

---

## 2. Scope

### Phase 1 — Stabilise and redesign the public site

1. **Rewrite `assets/css/style.css`** as a proper design system:
   * Type scale with `clamp()`, 8 px spacing scale, one shadow ramp, consistent radii.
   * Palette tightened: navy `#14203A`, gold `#B08D4F`, cream `#FBF9F4`, ink `#1C2430`.
   * Breakpoints: 1200 / 992 / 768 / 576. No fixed `100vh` (use `100svh` + fallback).
   * `:focus-visible` rings, `prefers-reduced-motion`, `prefers-contrast` support.
   * Remove decorative gradients, pulse animations and hover-lift on every card.
2. **Rewrite `assets/js/script.js`** from scratch:
   * Accessible mobile nav (`aria-expanded`, Esc to close, body scroll lock, outside click).
   * Gallery filter + keyboard-accessible lightbox (`role="dialog"`, focus trap, Esc, arrows).
   * Contact/booking forms: single result panel, fully `encodeURIComponent`d, no duplicates.
   * `fetch` renderers for events/gallery JSON with graceful static fallback.
   * Scroll-to-top, reveal animations gated on `prefers-reduced-motion`.
3. **All 9 HTML pages updated** — consistent nav/footer, inline SVG icon set replacing emoji,
   real `alt` text, correct `aria`, `loading="lazy"` + `width`/`height` on images.
4. **New `admissions.html`** — who can apply, entry requirements, the two programmes,
   how to apply, fees, intake dates, CTA.
5. **New Facilities section** on `retreat.html` — dining hall, dormitories, executive rooms,
   prayer garden, library (photos already in the repo, currently unused).
6. **`videos.html`** — keep the existing paths (valid on the domain), add poster fallbacks
   and a clear "video unavailable" state so the mirror never shows a black box.
7. **SEO/technical** — `og:image`, `sitemap.xml`, `robots.txt`, `LocalBusiness`/`School`
   JSON-LD, canonical tags, `lang`, theme-color.

### Phase 2 — Admin CMS (`/admin`, PHP)

Purpose: staff log in from anywhere and (a) add/edit events, (b) upload/manage photos,
(c) update announcements and key site info — without touching code.

**Storage** (no database account needed, no Composer):
* `data/events.json`, `data/gallery.json`, `data/announcements.json` — public read, atomic
  writes via `flock()` + `rename()`.
* `assets/img/uploads/` — uploaded photos, re-encoded with GD when available.
* `data/private/` — password hash, attempt log. Denied by `.htaccess`.

**Screens**: login → dashboard → Events / Photos / Announcements / Site info / Account.

**Security (the "tight" part)**:
* `password_hash()` / `password_verify()` (bcrypt/argon), never stored plaintext.
* Session cookies `HttpOnly` + `Secure` + `SameSite=Strict`; `session_regenerate_id(true)` on login.
* CSRF token on every state-changing request.
* Login throttling: 5 attempts / 15 min per IP+user, exponential backoff, logged.
* Idle timeout 2 h.
* Uploads: `finfo` MIME check + `getimagesize()` + extension allowlist, 8 MB cap, random
  filenames, re-encode to strip EXIF, `Content-Disposition` headers, no PHP in upload dir.
* `display_errors=0`, security headers, `Options -Indexes`, deny `.json`/dotfiles where not needed.
* First-run setup page that creates the admin user, then **disables itself**.

**Public integration**: pages render events/gallery/announcements from the JSON files through
the existing JS renderers, so admin changes appear immediately with no redeploy.

### Phase 3 — Deploy both copies

* Push to GitHub `main` (Pages auto-builds).
* Produce `deploy-JPSMRC-<date>.zip` + `DEPLOY.md` for cPanel File Manager upload.
* `CNAME` and DNS are **not** touched without the owner's explicit go-ahead (adding `CNAME`
  while DNS is unconfigured would take the GitHub mirror offline).

---

## 3. Explicit non-goals

* No framework, no build step, no npm dependency in the shipped site.
* No WordPress, no Netlify, no third-party account.
* No database server.
* We do not migrate or delete the ~200 existing images in this pass.

---

## 4. Open items (owner action)

1. **New photos**: `JPSMRC WEB` is empty — nothing has been copied in yet. Owner to drop them
   into `incoming-photos/`. Until then Phase 1 uses the unused optimised photos already in the repo.
2. **cPanel access** for the domain (File Manager or FTP) to deploy Phase 2.
3. **PHP version** on the host — `/admin/health.php` will report it; code targets PHP 7.4+.

---

## 5. Definition of done

* Zero console errors on all 9 pages, desktop + 375 px mobile.
* Hamburger, filters, lightbox, both forms and scroll-to-top verified working in a real browser.
* Lighthouse accessibility ≥ 95, no horizontal scroll at 320–1440 px.
* Admin: login, brute-force lockout, CSRF rejection, image upload, event CRUD all verified.
* Both deployments serving the same content.
