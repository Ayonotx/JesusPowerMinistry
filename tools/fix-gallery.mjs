import { readFile, writeFile } from "node:fs/promises";

const LIGHTBOX = `<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" hidden>
    <button class="lightbox-close" type="button" aria-label="Close image viewer">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
    </button>
    <button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
    </button>
    <figure class="lightbox-figure">
      <img class="lightbox-img" id="lightboxImg" alt="">
      <figcaption class="lightbox-caption" id="lightboxCaption" hidden></figcaption>
    </figure>
    <button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
    </button>
  </div>`;

let html = await readFile("gallery.html", "utf8");

// Wrap page content in <main>
if (!html.includes('<main id="main">')) {
  html = html.replace(/(<\/nav>)/, `$1\n\n  <main id="main">`);
  html = html.replace(/(\s*<footer class="footer">)/, `\n  </main>\n$1`);
}

// Replace the old lightbox
html = html.replace(/<div class="lightbox"[\s\S]*?<\/div>\s*(?=<footer)/, `${LIGHTBOX}\n\n  `);

// Filter buttons: expose state to assistive tech
html = html.replace(/<button class="filter-btn active" data-filter="([^"]+)">/g, '<button class="filter-btn active" data-filter="$1" aria-pressed="true" type="button">');
html = html.replace(/<button class="filter-btn" data-filter="([^"]+)">/g, '<button class="filter-btn" data-filter="$1" aria-pressed="false" type="button">');

// Marker so the admin-managed items are appended to the static gallery
if (!html.includes('id="galleryData"')) {
  html = html.replace(/(<div class="gallery-grid" id="galleryGrid">)/, `<div id="galleryData" hidden></div>\n\n      $1`);
}

// Empty state for filters that match nothing
if (!html.includes('id="galleryEmpty"')) {
  html = html.replace(
    /(\s*<\/div>\s*<\/div>\s*<\/section>)/,
    `
      </div>
      <div class="events-empty" id="galleryEmpty" hidden>
        <h3>No photos in this category yet</h3>
        <p>New photographs are added regularly. Try another category.</p>
      </div>
    </div>
  </section>`
  );
}

// Grid semantics
html = html.replace('<div class="gallery-grid" id="galleryGrid">', '<div class="gallery-grid" id="galleryGrid" role="list">');

// Images need intrinsic size to avoid layout shift
html = html.replace(/<img loading="lazy" src="([^"]+)" alt="([^"]*)">/g, '<img loading="lazy" decoding="async" width="600" height="450" src="$1" alt="$2">');

await writeFile("gallery.html", html);
console.log("gallery.html updated");
