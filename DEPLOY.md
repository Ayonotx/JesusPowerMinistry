# Deploying & running the JPSMRC site

Two copies stay live:

| Copy | Host | How it updates |
|---|---|---|
| `https://jesuspowersmrc.org` | LiteSpeed / cPanel (IP `66.29.153.202`) | upload files via cPanel File Manager or FTP |
| `https://ayonotx.github.io/JesusPowerMinistry/` | GitHub Pages | `git push` to `main` |

The domain is the canonical site. It is the only copy that can run the admin panel,
because GitHub Pages cannot execute PHP.

---

## 1. What is in this release

**Public site**
- All 9 pages rebuilt on a new design system (`assets/css/style.css`).
- `assets/js/script.js` rewritten — the previous file had a syntax error that disabled
  every script on every page (mobile menu, gallery filter, lightbox, both forms, scroll-to-top).
- New **Admissions** page (`admissions.html`).
- New **Facilities** section on `retreat.html`.
- Events and the home-page calendar now render from `data/events.json`.
- Emoji icons replaced with an inline SVG icon set; the five pulsing social buttons replaced
  with one WhatsApp action; the rest moved to the footer.
- SEO: canonical tags, Open Graph image, `sitemap.xml`, `robots.txt`, JSON-LD, `404.html`.

**Admin panel** (`/admin`)
- Sign in, add/edit/delete events, upload and caption photographs, publish an announcement,
  change the password.
- Stores data as JSON in `data/` (no database, no Composer, no third-party account).
- Uploaded photographs go to `assets/img/uploads/`.

---

## 2. First deploy to cPanel (one time)

1. In cPanel open **File Manager** → `public_html` (or the folder the domain points at).
2. **Back up first**: select the current files → Compress → `backup-before-update.zip`, then
   download it.
3. Upload `deploy-JPSMRC-<date>.zip` and extract it in place, overwriting existing files.
4. Confirm these folders exist and are writable (permissions **755**, or **775** if the host
   runs PHP as a different user):
   - `data/`
   - `data/private/`
   - `assets/img/uploads/`
5. Open **`https://jesuspowersmrc.org/admin/health.php`**.
   Every row should be green. Fix anything red before continuing — usually a folder permission.
6. Open **`https://jesuspowersmrc.org/admin/setup.php`** and create the administrator account.
   Use a password of 12+ characters that is not used anywhere else.
   **This page disables itself once the account exists.**
7. Sign in at **`https://jesuspowersmrc.org/admin/`**.

### If `/admin/health.php` reports "not writable"
In File Manager, right-click the folder → **Change Permissions** → `755`. If that fails, ask
the host to confirm the PHP user and set `775`.

### If you see a 500 error
Check `data/private/php-error.log` (download it via File Manager). The most common cause is a
folder permission, or the host running a PHP version older than 7.4.

---

## 3. Everyday editing (for the ministry office)

Sign in at `https://jesuspowersmrc.org/admin/`.

**Add an event**
1. Events → *Add event*.
2. Enter a title. Add a date if there is one, otherwise put a short label such as
   “Community outreach”.
3. Optionally upload a photograph (JPEG/PNG/WebP, max 8 MB).
4. Tick **Published** → Save.

The event appears on `events.html` and the three most recent appear on the home page
immediately — no redeploy.

**Add photographs**
1. Photos → choose one or several images → optionally set a caption and category → Upload.
2. They are appended to the Gallery page.
3. Use the small form under each photo to fix a caption or hide it.

**Announcement strip**
1. Announcements → new title + message → tick *Show this announcement on the home page*.
2. Only one announcement is active at a time.

**Change the password**
Account → enter the current password and a new one (10+ characters).

### Security notes for staff
- Always sign in over `https://`.
- Sign out on shared computers. Sessions expire after two hours of inactivity.
- Five wrong passwords locks the account for 15 minutes.
- Uploads are validated by real file type and re-encoded when possible; only JPEG, PNG and
  WebP are accepted, and code files are refused.

---

## 4. Updating the GitHub Pages copy

```bash
git add -A
git commit -m "Update content"
git push origin main
```

GitHub Pages rebuilds automatically within a minute or two.

**Important:** content added through the admin panel lives only on the domain host. The
GitHub mirror shows whatever is committed in the repository. If you want a change mirrored,
re-download `data/events.json`, `data/gallery.json`, `data/announcements.json` and any new files
in `assets/img/uploads/`, commit them, and push.

**Videos:** the eleven files in `imges/videos/` exist on the domain only — they were never in
the repository (they are large). On GitHub Pages the video players show the “not available on
this copy” panel with a link to YouTube instead of a broken black box.

---

## 5. About the custom domain

`jesuspowersmrc.org` currently points at `66.29.153.202` (cPanel), **not** GitHub Pages — the
repository has no `CNAME` file.

- **Keep it as is** if you want the PHP admin. Nothing to do.
- **If you ever move the domain to GitHub Pages**, add a file named `CNAME` containing
  `jesuspowersmrc.org`, then in the DNS zone replace the `A` records with GitHub's four IPs
  (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`) and point `www` to
  `ayonotx.github.io`. **Do not add the `CNAME` file before the DNS is ready** — GitHub will
  start redirecting the `.github.io` URL to a domain that does not resolve, and the site goes
  down.

Also note: `https://www.jesuspowersmrc.org` currently fails its TLS handshake while the apex
domain works. Re-issue the certificate in cPanel so it covers both names.

---

## 6. Repository layout

```
/                     public pages + 404.html
/assets/css/style.css design system
/assets/js/script.js  site behaviour
/assets/img/uploads/  photographs uploaded through the admin
/data/                events.json, gallery.json, announcements.json (public read)
/data/private/        credentials, attempt log, php-error.log (web access denied)
/admin/               PHP admin panel
/BLUEPRINT.md         scope and decisions
/tools/               local build/refresh helpers (not used at runtime)
```
