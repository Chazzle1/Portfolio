/* ==========================================================================
   reveal.js — Portfolio interactivity

   This script is inlined into every page by _build/build.py.
   It handles:
     1. Active nav link highlighting (based on current page filename)
     2. Nav border that appears once you scroll down
     3. Mobile hamburger menu open/close
     4. Scroll-triggered reveal animations (.reveal → .is-visible)
     5. Count-up number animation for stats (data-count-to attribute)
     6. Subtle mouse-parallax on the hero glow blobs

   Everything runs after DOMContentLoaded so the page is fully parsed first.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. ACTIVE NAV LINK ───────────────────────────────────────────────
     Each nav link has a data-page="filename.html" attribute.
     We compare that to the current page's filename and add .active
     to the matching link. CSS then makes it appear white / highlighted.
     To add a new page to the nav, just add the link in _nav.html with
     the correct data-page value. No JS changes needed. */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === currentFile) {
      link.classList.add('active');
    }
  });


  /* ── 2. NAV SCROLL BORDER ─────────────────────────────────────────────
     The nav starts with a transparent bottom border.
     Once the page scrolls more than 8px, we add the .scrolled class
     which makes the border visible (see .nav.scrolled in the CSS).
     This makes the nav feel "attached" to the content below it once
     you've left the hero section. */
  const nav = document.querySelector('.nav');

  const updateNavOnScroll = () => {
    if (window.scrollY > 8) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', updateNavOnScroll, { passive: true });
  updateNavOnScroll(); // also run immediately on load


  /* ── 3. MOBILE MENU ───────────────────────────────────────────────────
     The hamburger button toggles the .open class on the .mobile-menu
     overlay, which slides it down from off-screen (see CSS section 4).
     We also:
       - Toggle aria-expanded for screen readers
       - Lock body scrolling while the menu is open
       - Auto-close the menu when any link inside it is tapped */
  const menuToggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      // Prevent the page from scrolling behind the menu
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close the menu automatically when a link is tapped
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  /* ── 4. SCROLL REVEAL ─────────────────────────────────────────────────
     Any element with class="reveal" starts invisible (opacity: 0,
     translated down 36px). IntersectionObserver fires when the element
     enters the viewport; we add .is-visible which transitions it to
     visible and y=0.

     Stagger delays (.reveal-delay-1 through .reveal-delay-4) let you
     offset sibling elements so they cascade in rather than all appearing
     at once.

     If IntersectionObserver isn't supported (very old browsers), we
     fall back to just making everything visible immediately. */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target); // only animate once
        }
      });
    }, {
      threshold: 0.18,         // 18% of the element must be visible to trigger
      rootMargin: '0px 0px -40px 0px' // start slightly before it hits the bottom
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: just show everything
    revealElements.forEach(el => el.classList.add('is-visible'));
  }


  /* ── 5. COUNT-UP NUMBERS ──────────────────────────────────────────────
     Any element with data-count-to="NUMBER" will animate from 0 to that
     number when it scrolls into view. Optionally add data-suffix=" hr"
     or data-suffix="+" to append text after the number.

     Example: <span data-count-to="40" data-suffix="+">0</span>
     Will animate: 0 → 1 → ... → 40+

     The easing uses a cubic "ease out" formula so it starts fast and
     decelerates as it approaches the target — feels natural. */
  const counterElements = document.querySelectorAll('[data-count-to]');

  const animateCounter = (element) => {
    const target   = parseInt(element.dataset.countTo, 10);
    const suffix   = element.dataset.suffix || '';
    const duration = 1200; // ms — increase for a slower count
    const startTime = performance.now();

    const step = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out: starts fast, slows to target
      const eased    = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && counterElements.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target); // only count up once
        }
      });
    }, { threshold: 0.6 }); // element must be 60% visible before counting

    counterElements.forEach(el => counterObserver.observe(el));
  } else {
    // Fallback: show final numbers immediately
    counterElements.forEach(el => {
      el.textContent = el.dataset.countTo + (el.dataset.suffix || '');
    });
  }


  /* ── 6. HERO GLOW PARALLAX ────────────────────────────────────────────
     On desktop (pointer: fine = mouse, not touch), the hero glow blobs
     very slightly follow the mouse cursor. This adds a subtle depth
     effect without being distracting.

     The movement is intentionally small — divide by a larger number
     (e.g. 48 instead of 24) if you want it more subtle, or remove
     this block entirely to disable the effect. */
  const heroGlow = document.querySelector('.hero__glow');

  if (heroGlow && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 24; // max ±12px
      const y = (e.clientY / window.innerHeight - 0.5) * 24;
      heroGlow.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
  }

}); // end DOMContentLoaded


/* ==========================================================================
   7. SKILL PROFICIENCY BARS
   Each .skill-bar-fill has a data-pct attribute (e.g. data-pct="85%").
   When the bar scrolls into view, we set the --pct CSS variable and add
   .animated, which triggers the CSS width transition.
   ========================================================================== */
const skillBars = document.querySelectorAll('.skill-bar-fill[data-pct]');

if ('IntersectionObserver' in window && skillBars.length) {
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.setProperty('--pct', bar.dataset.pct);
        // Tiny delay so the transition is visible after paint
        requestAnimationFrame(() => bar.classList.add('animated'));
        barObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });

  skillBars.forEach(bar => barObserver.observe(bar));
} else {
  skillBars.forEach(bar => {
    bar.style.setProperty('--pct', bar.dataset.pct);
    bar.classList.add('animated');
  });
}


/* ==========================================================================
   8. LIGHTBOX
   Intercepts clicks on .gallery-tile elements and opens a full-screen
   overlay with the image or video. Close via ×, clicking the backdrop,
   or pressing Escape.
   ========================================================================== */
(function () {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<button class="lightbox__close" aria-label="Close">&times;</button><div class="lightbox__media"></div>';
  document.body.appendChild(lb);

  const media    = lb.querySelector('.lightbox__media');
  const closeBtn = lb.querySelector('.lightbox__close');

  function openLb(tile) {
    media.innerHTML = '';
    const vidEl = tile.querySelector('video');
    if (vidEl) {
      const v = document.createElement('video');
      v.src      = vidEl.src;
      v.controls = true;
      v.autoplay = true;
      v.style.cssText = 'max-width:92vw;max-height:88vh;border-radius:10px;display:block;';
      media.appendChild(v);
    } else {
      const imgEl = tile.querySelector('img');
      if (!imgEl) return;
      const img = document.createElement('img');
      img.src = imgEl.src;
      img.alt = imgEl.alt || '';
      media.appendChild(img);
    }
    lb.classList.add('lb-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLb() {
    lb.classList.remove('lb-open');
    media.innerHTML = '';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('lb-open')) closeLb(); });

  document.addEventListener('click', e => {
    const tile = e.target.closest('.gallery-tile');
    if (tile) openLb(tile);
  });
})();

/* ==========================================================================
   9. CARD CAROUSEL
   Single-item slideshow for .card-carousel elements on the Older Projects
   page. Prev/next buttons cycle through .carousel-slide children.
   ========================================================================== */
(function () {
  document.querySelectorAll('.card-carousel').forEach(function (car) {
    const slides = Array.from(car.querySelectorAll('.carousel-slide'));
    const dots   = Array.from(car.querySelectorAll('.carousel-dot'));
    const prev   = car.querySelector('.carousel-prev');
    const next   = car.querySelector('.carousel-next');
    if (slides.length <= 1) {
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
      return;
    }
    let idx = 0;
    function goTo(n) {
      const oldVid = slides[idx].querySelector('video');
      if (oldVid) oldVid.pause();
      slides[idx].classList.remove('active');
      if (dots[idx]) dots[idx].classList.remove('active');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('active');
      if (dots[idx]) dots[idx].classList.add('active');
      const newVid = slides[idx].querySelector('video');
      if (newVid) { newVid.currentTime = 0; newVid.play(); }
    }
    if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); goTo(idx - 1); });
    if (next) next.addEventListener('click', function (e) { e.stopPropagation(); goTo(idx + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function (e) { e.stopPropagation(); goTo(i); }); });
  });
})();


/* ==========================================================================
   9. CONTACT FORM (Formspree / mailto fallback)
   Intercepts the form submit, sends via fetch to Formspree (if configured),
   and shows a thank-you message. If Formspree isn't set up yet, falls back
   to opening the user's mail client.

   TO CONFIGURE FORMSPREE:
     1. Sign up at formspree.io (free tier allows 50 submissions/month).
     2. Create a new form and copy your endpoint URL.
     3. Update the FORMSPREE_URL constant below.
     4. Remove the mailto fallback once it's working.
   ========================================================================== */
const FORMSPREE_URL = 'https://formspree.io/f/xwvdappa';

const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = new FormData(contactForm);

    if (FORMSPREE_URL) {
      // Send to Formspree
      try {
        const res = await fetch(FORMSPREE_URL, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          contactForm.style.display = 'none';
          if (formStatus) {
            formStatus.textContent = "Message sent — I'll get back to you soon.";
            formStatus.style.color = 'var(--yellow)';
          }
        } else {
          if (formStatus) {
            formStatus.textContent = 'Something went wrong. Try emailing directly.';
            formStatus.style.color = 'var(--text-dim)';
          }
        }
      } catch {
        if (formStatus) {
          formStatus.textContent = 'Network error. Try emailing directly.';
        }
      }
    } else {
      // Fallback: open mailto with prefilled subject/body
      const name    = data.get('name')    || '';
      const message = data.get('message') || '';
      const subject = encodeURIComponent(`Portfolio contact from ${name}`);
      const body    = encodeURIComponent(message);
      window.location.href = `mailto:csteinman@vt.edu?subject=${subject}&body=${body}`;
    }
  });
}

/* ==========================================================================
   10. WIP STRIP — DRAG TO SCRUB
   The "currently working on" ticker (.wip-strip / .wip-track) auto-scrolls
   left on its own, but can also be grabbed and dragged (mouse or touch) —
   it tracks the pointer 1:1 while dragging, then resumes auto-scrolling
   from wherever it was released. Position is a single `x` value (the
   track's translateX in px) driven every frame by requestAnimationFrame,
   so dragging and auto-scroll are just two ways of changing the same
   number instead of fighting each other.
   ========================================================================== */
(function () {
  const strip = document.querySelector('.wip-strip');
  const track = document.querySelector('.wip-track');
  if (!strip || !track) return;

  const LOOP_SECONDS = 28; // matches the old CSS animation's duration
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let x = 0;              // current translateX, always <= 0
  let dragging = false;
  let hovering = false;
  let dragStartX = 0;
  let dragStartPos = 0;
  let lastFrameTime = null;

  const halfWidth = () => track.scrollWidth / 2; // the two halves are identical, so this is one loop
  const pixelsPerSecond = () => halfWidth() / LOOP_SECONDS;

  // Keep x inside (-halfWidth, 0] no matter how far a drag pushes it,
  // so the seamless loop never runs out of duplicated content.
  const wrap = () => {
    const hw = halfWidth();
    if (hw <= 0) return;
    x = ((x % hw) + hw) % hw;
    if (x > 0) x -= hw;
  };

  const render = () => { track.style.transform = `translateX(${x}px)`; };

  const tick = (time) => {
    if (lastFrameTime === null) lastFrameTime = time;
    const dt = (time - lastFrameTime) / 1000;
    lastFrameTime = time;

    if (!dragging && !hovering && !reducedMotion) {
      x -= pixelsPerSecond() * dt;
      wrap();
      render();
    }

    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  strip.addEventListener('mouseenter', () => { hovering = true; });
  strip.addEventListener('mouseleave', () => { hovering = false; });

  strip.addEventListener('pointerdown', (e) => {
    dragging = true;
    dragStartX = e.clientX;
    dragStartPos = x;
    strip.classList.add('is-dragging');
    strip.setPointerCapture(e.pointerId);
  });

  strip.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    x = dragStartPos + (e.clientX - dragStartX);
    wrap();
    render();
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    strip.classList.remove('is-dragging');
    if (e && strip.hasPointerCapture(e.pointerId)) strip.releasePointerCapture(e.pointerId);
  };
  strip.addEventListener('pointerup', endDrag);
  strip.addEventListener('pointercancel', endDrag);
})();

/* ==========================================================================
   11. PHOTO CAROUSEL (project detail pages)
   Powers .photo-carousel — a large single-slide viewer used in place of a
   grid of small thumbnails on pages with a lot of process photos. A page
   can have several of these (one per section), so this loops over every
   .photo-carousel instance and wires each one up independently: prev/next
   buttons, dot navigation, autoplay with pause-on-hover, and touch swipe.
   ========================================================================== */
document.querySelectorAll('.photo-carousel').forEach((carousel) => {
  const track  = carousel.querySelector('.pc-track');
  const slides = carousel.querySelectorAll('.pc-slide');
  const dotsEl = carousel.querySelector('.pc-dots');
  const btnPrev = carousel.querySelector('.pc-btn--prev');
  const btnNext = carousel.querySelector('.pc-btn--next');
  if (!track || slides.length <= 1) return;

  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'pc-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  // "3 / 12" style counter in the corner — with a dozen+ photos in some of
  // these galleries, counting dots one by one isn't practical.
  const counter = document.createElement('div');
  counter.className = 'pc-counter';
  carousel.appendChild(counter);
  const updateCounter = () => { counter.textContent = (current + 1) + ' / ' + slides.length; };
  updateCounter();

  function goTo(idx) {
    slides[current].querySelector('video')?.pause();
    current = (idx + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dotsEl.querySelectorAll('.pc-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
    updateCounter();
    const vid = slides[current].querySelector('video');
    if (vid) { vid.currentTime = 0; vid.play(); }
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 4500);
  }

  if (btnPrev) btnPrev.addEventListener('click', () => goTo(current - 1));
  if (btnNext) btnNext.addEventListener('click', () => goTo(current + 1));

  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', resetTimer);

  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  resetTimer();
});
