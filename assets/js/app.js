/* ═══════════════════════════════════════════════════
   James Briggs — Portfolio
   app.js
   ═══════════════════════════════════════════════════ */

   'use strict';

   /* ── Pages ── */
   const PAGES = ['home', 'about', 'projects', 'contact'];
   
   /**
    * Switch to a page by id.
    * Hides all others, shows the target, updates nav,
    * then triggers reveal animations.
    */
   function show(id) {
     PAGES.forEach(p => {
       const sec = document.getElementById(p);
       const link = document.getElementById('nl-' + p);
       sec.classList.remove('visible');
       link.classList.remove('active');
       // Reset all animated elements so they re-animate on next visit
       sec.querySelectorAll('.reveal, .reveal-left, .reveal-right')
          .forEach(el => el.classList.remove('in'));
     });
   
     const target = document.getElementById(id);
     const targetLink = document.getElementById('nl-' + id);
     target.classList.add('visible');
     targetLink.classList.add('active');
   
     window.scrollTo({ top: 0, behavior: 'smooth' });
   
     // Slight delay lets the section render before we animate
     setTimeout(() => triggerReveals(target), 80);
     if (id === 'home') setTimeout(() => runCountUp(target), 200);
   }
   
   /* ── Reveal helpers ── */
   
   /**
    * Immediately reveal all .reveal* elements inside a container,
    * staggered slightly so they cascade.
    */
   function triggerReveals(container) {
     const els = container.querySelectorAll('.reveal, .reveal-left, .reveal-right');
     els.forEach((el, i) => {
       setTimeout(() => el.classList.add('in'), i * 60);
     });
   }
   
   /**
    * IntersectionObserver — reveals elements as they scroll into view.
    * Used for longer pages (About, Projects) where content is below the fold.
    */
   const revealObserver = new IntersectionObserver((entries) => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         entry.target.classList.add('in');
       }
     });
   }, {
     threshold: 0.12,
     rootMargin: '0px 0px -40px 0px'
   });
   
   /** Re-observe all reveal elements in the currently visible section. */
   function observeCurrentSection() {
     const sec = document.querySelector('section.visible');
     if (!sec) return;
     sec.querySelectorAll('.reveal, .reveal-left, .reveal-right')
        .forEach(el => revealObserver.observe(el));
   }
   
   /* ── Scroll listener (reveal + nav shadow) ── */
   const navEl = document.getElementById('nav');
   let ticking = false;
   
   window.addEventListener('scroll', () => {
     navEl.classList.toggle('scrolled', window.scrollY > 10);
   
     if (!ticking) {
       requestAnimationFrame(() => {
         const sec = document.querySelector('section.visible');
         if (sec) {
           sec.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
             const rect = el.getBoundingClientRect();
             if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
               el.classList.add('in');
             }
           });
         }
         ticking = false;
       });
       ticking = true;
     }
   }, { passive: true });
   
   /* ── 3-D tilt on project cards ── */
   /* ── Magnetic buttons ── */
function bindMagnetic() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.12s ease';
    });
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.25;
      const y = (e.clientY - r.top  - r.height / 2) * 0.35;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      btn.style.transform = '';
    });
  });
}
bindMagnetic();
   
   /* ── Scrolling tech marquee ── */
   const SKILLS = [
    'Flutter', 'Dart', 'Firebase', 'Firestore', 'Auth', 'FCM',
    'C#', 'WPF', '.NET', 'Python', 'JavaScript', 'TypeScript',
    'HTML', 'CSS', 'REST APIs', 'Google Maps', 'TransportAPI',
    'OCR', 'iOS', 'TestFlight', 'Git', 'GitHub', 'SDLC',
    'Data viz', 'SQL', 'JSON', 'MVC', 'OOP', 'Agile'
  ];
   
   function buildMarquee() {
     const track = document.getElementById('mq');
     if (!track) return;
     // Double the list so the infinite-scroll loop is seamless
     const chips = [...SKILLS, ...SKILLS]
       .map(s => `<span class="m-chip"><span class="m-dot" aria-hidden="true"></span>${s}</span>`)
       .join('');
     track.innerHTML = chips;
   }
   
   /* ── Init ── */
   buildMarquee();
   show('home');
   setTimeout(() => runCountUp(document.getElementById('home')), 400);
   
   // After initial load, set up the observer for the home section
   setTimeout(observeCurrentSection, 200);
   
   // Re-observe whenever the user clicks a nav link
   document.querySelectorAll('.nav-links a').forEach(a => {
     a.addEventListener('click', () => setTimeout(observeCurrentSection, 300));
   });
   
   /* ── Custom cursor ── */
const cursorDot = document.getElementById('cursorDot');
if (cursorDot && window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', e => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top  = e.clientY + 'px';
  }, { passive: true });
  document.querySelectorAll('a, button, [role="button"], .teaser-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorDot.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursorDot.classList.remove('expand'));
  });
}

/* ── Scroll progress ── */
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  if (!progressBar) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
}, { passive: true });

/* ── Count-up ── */
function runCountUp(container) {
  container.querySelectorAll('.count-up[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const steps  = 40;
    const delay  = 900 / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      el.textContent = Math.round((step / steps) * target);
      if (step >= steps) { el.textContent = target; clearInterval(timer); }
    }, delay);
  });
}