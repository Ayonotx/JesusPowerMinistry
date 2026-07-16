// === Mobile Navigation ===
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
}

// Close mobile menu on link click
if (navMenu) {
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// === Hero Carousel (index.html only) ===
const slides = document.querySelectorAll('.hero-slide');
if (slides.length > 0) {
  let currentSlide = 0;

  // Ensure all slides use 'cover' and fade in
  slides.forEach(function(slide) {
    slide.style.backgroundSize = 'cover';
  });

  function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }
  setInterval(nextSlide, 5000);
}

// === Gallery Filter ===
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

function applyFilter(filter) {
  galleryItems.forEach(item => {
    if (filter === 'all' || item.dataset.category === filter) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

// === Lightbox ===
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.querySelector('.lightbox-close');

if (lightbox) {
  document.querySelectorAll('.gallery-item, .retreat-photos img').forEach(el => {
    el.addEventListener('click', () => {
      const img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
      }
    });
  });

  lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('active');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.classList.remove('active');
  });
}

// === Contact Form - sends via email & WhatsApp ===
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = this.querySelector('[name="contact_name"]').value;
    const email = this.querySelector('[name="contact_email"]').value;
    const subject = this.querySelector('[name="subject"]').value || 'General Inquiry';
    const message = this.querySelector('[name="message"]').value;

    const body = 'Name: ' + name + '%0A' +
                 'Email: ' + email + '%0A' +
                 'Subject: ' + subject + '%0A' +
                 'Message: ' + message;

    const waMsg = 'Hello%2C%20I%20am%20' + encodeURIComponent(name) + '.%0A' +
                  encodeURIComponent('Email: ') + encodeURIComponent(email) + '%0A' +
                  encodeURIComponent('Subject: ') + encodeURIComponent(subject) + '%0A' +
                  encodeURIComponent('Message: ') + encodeURIComponent(message);

    // Show success banner with choices
    const btn = this.querySelector('button[type="submit"]');
    btn.textContent = 'Choose how to send:';
    btn.style.background = '#1B2A4A';

    // Create action buttons
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;';
    actions.innerHTML = '<a href="mailto:jpowercoldwater@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + body + '" class="btn btn-primary" style="background:var(--accent);text-decoration:none;text-align:center;">&#9993; Send via Email</a>' +
                        '<a href="https://wa.me/233556873055?text=' + waMsg + '" target="_blank" class="btn btn-primary" style="background:#25D366;text-decoration:none;text-align:center;">Send via WhatsApp</a>' +
                        '<button type="button" class="btn" style="background:#666;color:white;border:none;cursor:pointer;" onclick="this.parentElement.parentElement.innerHTML=\\'<p style=\\\\\\'color:var(--text-light);font-size:0.9rem;\\\\\\'>You can also email us directly at <a href=\\\\\\'mailto:jpowercoldwater@gmail.com\\\\\\'>jpowercoldwater@gmail.com</a> or WhatsApp <a href=\\\\\\'https://wa.me/233556873055\\\\\\'>+233 55 687 3055</a>.</p>\\\\\';">Cancel</button>';

    btn.parentNode.appendChild(actions);
  });
}

// === Scroll Animations ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .program-card, .lecturer-card').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});



// === Scroll to Top Button ===
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// === Booking Form - sends via email & WhatsApp ===
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = this.querySelector('[name="fullname"]').value;
    const email = this.querySelector('[name="email"]').value;
    const phone = this.querySelector('[name="phone"]').value;
    const bookingType = this.querySelector('[name="booking_type"]').value;
    const arrivalDate = this.querySelector('[name="arrival_date"]').value;
    const guests = this.querySelector('[name="guests"]').value;
    const requests = this.querySelector('[name="requests"]').value;

    const subject = 'Booking Request - Grace Centre Retreat';

    const body = 'New Booking Request%0A' +
                 '-----------------%0A' +
                 'Name: ' + name + '%0A' +
                 'Email: ' + email + '%0A' +
                 'Phone: ' + phone + '%0A' +
                 'Booking Type: ' + bookingType + '%0A' +
                 'Arrival Date: ' + arrivalDate + '%0A' +
                 'Number of Guests: ' + guests + '%0A' +
                 'Additional Requests: ' + requests;

    const waMsg = 'Hello%2C%20I%20would%20like%20to%20book%20the%20Grace%20Centre%20Retreat%20Center.%0A%0A' +
                  'Name: ' + encodeURIComponent(name) + '%0A' +
                  'Email: ' + encodeURIComponent(email) + '%0A' +
                  'Phone: ' + encodeURIComponent(phone) + '%0A' +
                  'Booking Type: ' + encodeURIComponent(bookingType) + '%0A' +
                  'Arrival Date: ' + encodeURIComponent(arrivalDate) + '%0A' +
                  'Guests: ' + encodeURIComponent(guests) + '%0A' +
                  'Requests: ' + encodeURIComponent(requests);

    // Show success banner with choices
    const btn = this.querySelector('button[type="submit"]');
    btn.textContent = 'Choose how to send:';
    btn.style.background = '#1B2A4A';

    // Create action buttons
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;';
    actions.innerHTML = '<a href="mailto:jpowercoldwater@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + body + '" class="btn btn-primary" style="background:var(--accent);text-decoration:none;text-align:center;">&#9993; Send via Email</a>' +
                        '<a href="https://wa.me/233556873055?text=' + waMsg + '" target="_blank" class="btn btn-primary" style="background:#25D366;text-decoration:none;text-align:center;">Send via WhatsApp</a>' +
                        '<button type="button" class="btn" style="background:#666;color:white;border:none;cursor:pointer;" onclick="this.parentElement.parentElement.innerHTML=\\'<p style=\\\\\\'color:var(--text-light);font-size:0.9rem;\\\\\\'>You can also email us directly at <a href=\\\\\\'mailto:jpowercoldwater@gmail.com\\\\\\'>jpowercoldwater@gmail.com</a> or WhatsApp <a href=\\\\\\'https://wa.me/233556873055\\\\\\'>+233 55 687 3055</a>.</p>\\\\\';">Cancel</button>';

    btn.parentNode.appendChild(actions);
  });
}
