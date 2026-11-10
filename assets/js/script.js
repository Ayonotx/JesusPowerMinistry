/* ==========================================================================
   Jesus Power School of Ministry & Retreat Center
   site.js — v2
   Vanilla JavaScript, no dependencies. Loaded with `defer`.
   --------------------------------------------------------------------------
   1.  Helpers
   2.  Navigation
   3.  Reveal on scroll
   4.  Gallery filter
   5.  Lightbox
   6.  Forms (contact + booking)
   7.  Scroll to top
   8.  Video fallbacks
   9.  Content loaders (events / gallery / announcements)
   ========================================================================== */

(function () {
  "use strict";

  /* 1. Helpers ------------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const WHATSAPP_NUMBER = "233556873055";
  const CONTACT_EMAIL = "jpowercoldwater@gmail.com";

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (key === "text") {
        node.textContent = value;
      } else if (key === "class") {
        node.className = value;
      } else if (key === "dataset") {
        Object.entries(value).forEach(([k, v]) => (node.dataset[k] = v));
      } else {
        node.setAttribute(key, value === true ? "" : value);
      }
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value + (value.length === 10 ? "T00:00:00" : ""));
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function createIcon(name) {
    const paths = {
      calendar:
        '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 9.5h18"/>',
      image:
        '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 17 5-5 4.5 4.5L17 13l3 3.5"/>',
      play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5-6-3.5Z"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
    };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = paths[name] || "";
    return svg;
  }

  /* 2. Navigation ---------------------------------------------------------- */
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");

  if (navToggle && navMenu) {
    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navMenu.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };

    navToggle.addEventListener("click", () => {
      setOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });

    navMenu.addEventListener("click", (event) => {
      if (event.target.closest(".nav-link")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
        setOpen(false);
        navToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!navMenu.classList.contains("is-open")) return;
      if (event.target.closest(".nav-menu") || event.target.closest("#navToggle")) return;
      setOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1100) setOpen(false);
    });
  }

  // Highlight the current page in the nav without hand-editing every file.
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $$(".nav-link").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("/").pop().toLowerCase();
    const isHome = (current === "" || current === "index.html") && href === "index.html";
    link.classList.toggle("active", isHome || href === current);
  });

  /* 2b. Hero carousel ----------------------------------------------------- */
  const hero = $(".hero");
  const heroSlides = $$(".hero-slide");

  if (hero && heroSlides.length > 1) {
    const dots = $$(".hero-dot");
    const arrows = $$(".hero-arrow");
    let index = 0;
    let timer = null;
    const DELAY = 6000;

    const show = (next) => {
      index = (next + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (reduceMotion) return;
      stop();
      timer = window.setInterval(() => show(index + 1), DELAY);
    };

    const restart = () => {
      stop();
      start();
    };

    show(0);
    start();

    arrows.forEach((arrow) => {
      arrow.addEventListener("click", () => {
        show(index + (arrow.dataset.dir === "next" ? 1 : -1));
        restart();
      });
    });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        show(i);
        restart();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", start);
  }

  /* 3. Reveal on scroll ---------------------------------------------------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const targets = $$(
      ".service-card, .program-card, .lecturer-card, .value-card, .facility-card, .event-card, .section-header"
    );

    if (targets.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );

      targets.forEach((node, index) => {
        node.classList.add("reveal");
        node.style.transitionDelay = `${Math.min(index % 4, 3) * 60}ms`;
        observer.observe(node);
      });
    }
  }

  /* 4. Gallery filter ------------------------------------------------------ */
  const filterButtons = $$(".filter-btn");
  const galleryGrid = $("#galleryGrid");

  function applyFilter(filter) {
    if (!galleryGrid) return;
    let visible = 0;
    $$(".gallery-item", galleryGrid).forEach((item) => {
      const match = filter === "all" || item.dataset.category === filter;
      item.hidden = !match;
      if (match) visible += 1;
    });
    const empty = $("#galleryEmpty");
    if (empty) empty.hidden = visible !== 0;
  }

  if (filterButtons.length && galleryGrid) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((other) => {
          other.classList.remove("active");
          other.setAttribute("aria-pressed", "false");
        });
        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");
        applyFilter(button.dataset.filter || "all");
      });
    });
  }

  /* 5. Lightbox ------------------------------------------------------------ */
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxCaption = $("#lightboxCaption");

  if (lightbox && lightboxImg) {
    const SELECTOR =
      ".gallery-item img, .retreat-photos img, .events-grid img, .photo-carousel img, .facility-card img, [data-lightbox]";
    let items = [];
    let index = 0;
    let lastFocused = null;

    const collect = () =>
      $$(SELECTOR).filter((node) => {
        const src = node.dataset.full || node.getAttribute("src");
        return Boolean(src) && !node.closest(".lightbox");
      });

    // Make non-button gallery tiles operable from the keyboard.
    $$(".gallery-item").forEach((item) => {
      if (!item.hasAttribute("tabindex")) item.setAttribute("tabindex", "0");
      if (!item.hasAttribute("role")) item.setAttribute("role", "button");
    });

    document.addEventListener("keydown", (event) => {
      const active = document.activeElement;
      if (!active || !active.classList || !active.classList.contains("gallery-item")) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const img = active.querySelector("img");
      if (img) open(img);
    });

    const show = (i) => {
      if (!items.length) return;
      index = (i + items.length) % items.length;
      const node = items[index];
      const src = node.dataset.full || node.getAttribute("src");
      const caption =
        node.dataset.caption ||
        node.getAttribute("alt") ||
        (node.closest("figure") && $("figcaption", node.closest("figure"))?.textContent) ||
        "";
      lightboxImg.src = src;
      lightboxImg.alt = caption || "Gallery image";
      if (lightboxCaption) {
        lightboxCaption.textContent = caption;
        lightboxCaption.hidden = !caption;
      }
    };

    const open = (node) => {
      items = collect();
      const i = items.indexOf(node);
      if (i === -1) return;
      lastFocused = node;
      show(i);
      lightbox.hidden = false;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
      ($(".lightbox-close", lightbox) || lightbox).focus();
    };

    const close = () => {
      lightbox.classList.remove("active");
      lightbox.hidden = true;
      document.body.style.overflow = "";
      lightboxImg.removeAttribute("src");
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    };

    document.addEventListener("click", (event) => {
      const node = event.target.closest(SELECTOR);
      if (!node || node.closest(".lightbox")) return;
      event.preventDefault();
      open(node);
    });

    $(".lightbox-close", lightbox)?.addEventListener("click", close);
    $(".lightbox-prev", lightbox)?.addEventListener("click", () => show(index - 1));
    $(".lightbox-next", lightbox)?.addEventListener("click", () => show(index + 1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) close();
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("active")) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") show(index + 1);
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "Tab") {
        const focusable = $$("button, [href], [tabindex]:not([tabindex='-1'])", lightbox);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* 6. Forms --------------------------------------------------------------- */
  function buildFormData(form) {
    const data = new FormData(form);
    const values = {};
    data.forEach((value, key) => {
      values[key] = typeof value === "string" ? value.trim() : value;
    });
    return values;
  }

  function toLines(pairs) {
    return pairs
      .filter(([, value]) => value !== "" && value !== undefined && value !== null)
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n");
  }

  function renderStatus(form, { subject, lines, intro }) {
    let status = $(".form-status", form) || $("#formStatus");
    if (!status) {
      status = el("div", { class: "form-status", id: "formStatus" });
      form.appendChild(status);
    }
    status.replaceChildren();

    const body = encodeURIComponent(`${intro}\n\n${lines}\n`);
    const waText = encodeURIComponent(`${intro}\n\n${lines}`);

    status.appendChild(el("h4", { text: "Your message is ready" }));
    status.appendChild(
      el("p", {
        text: "Choose how you would like to send it. Nothing is sent until you pick an option.",
      })
    );

    const actions = el("div", { class: "actions" }, [
      el("a", {
        class: "btn btn-secondary",
        href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`,
        text: "Send by email",
      }),
      el("a", {
        class: "btn btn-primary",
        href: `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`,
        target: "_blank",
        rel: "noopener",
        text: "Send on WhatsApp",
      }),
      el(
        "button",
        {
          class: "btn btn-outline",
          type: "button",
        },
        "Start over"
      ),
    ]);

    actions.lastChild.addEventListener("click", () => {
      form.reset();
      status.classList.remove("is-visible");
      status.replaceChildren();
      const submit = $("button[type='submit']", form);
      if (submit) submit.disabled = false;
    });

    status.appendChild(actions);
    status.classList.add("is-visible");
    status.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });

    const submit = $("button[type='submit']", form);
    if (submit) submit.disabled = true;
  }

  const contactForm = $("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      const values = buildFormData(contactForm);
      const name = values.contact_name || "Website visitor";
      const subject = values.subject || "General enquiry";
      const lines = toLines([
        ["Name", name],
        ["Email", values.contact_email],
        ["Phone", values.phone],
        ["Subject", subject],
        ["Message", values.message],
      ]);

      renderStatus(contactForm, {
        subject,
        lines,
        intro: "Message from the Jesus Power website",
      });
    });
  }

  const bookingForm = $("#bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!bookingForm.reportValidity()) return;

      const values = buildFormData(bookingForm);
      const lines = toLines([
        ["Name", values.fullname],
        ["Email", values.email],
        ["Phone", values.phone],
        ["Booking type", values.booking_type],
        ["Arrival date", values.arrival_date],
        ["Departure date", values.departure_date],
        ["Guests", values.guests],
        ["Requests", values.requests],
      ]);

      renderStatus(bookingForm, {
        subject: `Booking request — ${values.fullname || "Grace Centre"}`,
        lines,
        intro: "Booking request from the Jesus Power website",
      });
    });
  }

  const enquiryForm = $("#enquiryForm");
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!enquiryForm.reportValidity()) return;

      const values = buildFormData(enquiryForm);
      const lines = toLines([
        ["Name", values.fullname],
        ["Email", values.email],
        ["Phone", values.phone],
        ["Programme", values.programme],
        ["Preferred intake", values.intake],
        ["Questions", values.message],
      ]);

      renderStatus(enquiryForm, {
        subject: `Admissions enquiry — ${values.fullname || "Prospective student"}`,
        lines,
        intro: "Admissions enquiry from the Jesus Power website",
      });
    });
  }

  /* 7. Scroll to top -------------------------------------------------------- */
  const scrollTopBtn = $("#scrollTop");
  const socialStack = $(".floating-social");

  if (scrollTopBtn || socialStack) {
    let ticking = false;

    const update = () => {
      const past = window.scrollY > 480;
      if (scrollTopBtn) scrollTopBtn.classList.toggle("visible", past);
      // Keep the social stack off the hero so it never covers the headline or buttons.
      if (socialStack) socialStack.classList.toggle("is-visible", window.scrollY > 320);
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  }

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      const skip = $(".nav-logo");
      if (skip) skip.focus({ preventScroll: true });
    });
  }

  /* 8. Video fallbacks ----------------------------------------------------- */
  $$(".video-card video").forEach((video) => {
    const frame = video.closest(".video-frame") || video.parentElement;
    const markUnavailable = () => {
      if (!frame || $(".video-fallback", frame)) return;
      video.setAttribute("hidden", "");
      const fallback = el("div", { class: "video-fallback" }, [
        createIcon("play"),
        el("p", {
          text: "This video is not available on this copy of the site. Watch the full collection on our YouTube channel.",
        }),
        el("a", {
          class: "btn btn-outline btn-outline--light",
          href: "https://www.youtube.com/channel/UCecEIsB0-DePTvLw1ngC5IA",
          target: "_blank",
          rel: "noopener",
          text: "Open YouTube",
        }),
      ]);
      frame.appendChild(fallback);
    };

    video.addEventListener("error", markUnavailable);
    const source = $("source", video);
    if (source) source.addEventListener("error", markUnavailable);
  });

  /* 9. Content loaders ----------------------------------------------------- */
  const dataCache = {};

  async function loadJson(path) {
    if (dataCache[path]) return dataCache[path];
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    const json = await response.json();
    dataCache[path] = json;
    return json;
  }

  function eventCard(item) {
    const media = el("div", { class: "event-card__media" });
    if (item.image) {
      media.appendChild(
        el("img", {
          src: item.image,
          alt: item.title || "Event photo",
          loading: "lazy",
          decoding: "async",
        })
      );
    }
    const body = el("div", { class: "event-card__body" }, [
      (item.dateLabel || formatDate(item.date))
        ? el("span", {
            class: "event-card__date",
            text: item.dateLabel || formatDate(item.date),
          })
        : null,
      el("h3", { text: item.title || "Untitled event" }),
      item.description ? el("p", { text: item.description }) : null,
    ]);
    return el("article", { class: "event-card" }, [media, body]);
  }

  const upcomingList = $("#upcomingEvents");
  if (upcomingList) {
    loadJson("data/events.json")
      .then((payload) => {
        const items = (payload.events || [])
          .filter((item) => item.published !== false)
          .sort((a, b) => String(b.date).localeCompare(String(a.date)))
          .slice(0, Number(upcomingList.dataset.limit || 3));

        if (!items.length) return;
        upcomingList.replaceChildren(...items.map(eventCard));
        upcomingList.hidden = false;
        const empty = $("#upcomingEmpty");
        if (empty) empty.hidden = true;
      })
      .catch(() => {
        /* Leave any static markup in place. */
      });
  }

  const eventsList = $("#eventsList");
  if (eventsList) {
    loadJson("data/events.json")
      .then((payload) => {
        const items = (payload.events || [])
          .filter((item) => item.published !== false)
          .sort((a, b) => String(b.date).localeCompare(String(a.date)));

        if (!items.length) return;
        eventsList.replaceChildren(...items.map(eventCard));
        const empty = $("#eventsEmpty");
        if (empty) empty.hidden = true;
      })
      .catch(() => {
        const empty = $("#eventsEmpty");
        if (empty) empty.hidden = false;
      });
  }

  const galleryDataTarget = $("#galleryData");
  if (galleryDataTarget && galleryGrid) {
    loadJson("data/gallery.json")
      .then((payload) => {
        const items = (payload.items || []).filter((item) => item.published !== false);
        if (!items.length) return;

        const nodes = items.map((item) =>
          el(
            "button",
            {
              class: "gallery-item",
              type: "button",
              dataset: { category: item.category || "other", caption: item.caption || "" },
              "aria-label": `View: ${item.caption || "photo"}`,
            },
            [
              el("img", {
                src: item.src,
                alt: item.caption || "Jesus Power photo",
                loading: "lazy",
                decoding: "async",
                "data-full": item.src,
              }),
              item.caption ? el("span", { class: "gallery-overlay", text: item.caption }) : null,
            ]
          )
        );

        galleryGrid.append(...nodes);
        const activeFilter = $(".filter-btn.active");
        if (activeFilter) applyFilter(activeFilter.dataset.filter || "all");
      })
      .catch(() => {
        /* Static gallery markup stays. */
      });
  }

  const announcementSlot = $("#announcementSlot");
  if (announcementSlot) {
    loadJson("data/announcements.json")
      .then((payload) => {
        const item = (payload.items || []).find((entry) => entry.active);
        if (!item) return;
        announcementSlot.replaceChildren(
          el("div", { class: "notice" }, [
            el("strong", { text: `${item.title} — ` }),
            document.createTextNode(item.body || ""),
          ])
        );
        announcementSlot.hidden = false;
      })
      .catch(() => {
        /* Nothing to show. */
      });
  }
})();
