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
  // Preload all background images before starting carousel
  var loadedCount = 0;
  slides.forEach(function(slide, index) {
    var bg = slide.style.backgroundImage;
    if (bg && bg !== 'none') {
      var url = bg.replace(/url\(["']?/, '').replace(/["']?\)/, '');
      var tempImg = new Image();
      tempImg.onload = function() {
        loadedCount++;
        // Check orientation
        if (tempImg.naturalHeight > tempImg.naturalWidth) {
          slide.style.backgroundSize = 'contain';
          slide.style.backgroundColor = '#1B2A4A';
        } else {
          slide.style.backgroundSize = 'cover';
        }
        // Show first slide once loaded
        if (index === 0) {
          slide.classList.add('active');
          slide.style.opacity = '1';
        }
      };
      tempImg.src = url;
    } else {
      loadedCount++;
    }
  });
  function nextSlide() {
    slides.forEach(function(s) { s.classList.remove('active'); s.style.opacity = '0'; });
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
    slides[currentSlide].style.opacity = '1';
  }
  setInterval(nextSlide, 5000);
}

// === Gallery Filter ===
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
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

// === Contact Form ===
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    const originalBg = btn.style.background;
    btn.textContent = 'Message Sent!';
    btn.style.background = '#4CAF50';
    contactForm.reset();
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = originalBg;
    }, 3000);
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

// === Booking Form ===
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = bookingForm.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Request Submitted!';
    btn.style.background = '#4CAF50';
    bookingForm.reset();
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 3000);
  });
}
