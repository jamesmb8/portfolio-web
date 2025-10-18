// ===== helpers =====
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Year
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Reveal-on-scroll (if .reveal exists)
const revealEls = $$('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
}

// Parallax blobs
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced && $('#blob1') && $('#blob2')) {
  const lerp = (a,b,t)=>a+(b-a)*t; let y=0,x=0;
  const onScroll = () => {
    const s = window.scrollY || 0;
    const y1 = s*0.12, x1 = s*0.06;
    const y2 = -s*0.16, x2 = -s*0.08;
    y = lerp(y,y1,0.1); x = lerp(x,x1,0.1);
    $('#blob1').style.transform = `translate3d(${x}px,${y}px,0)`;
    $('#blob2').style.transform = `translate3d(${x2}px,${y2}px,0)`;
    requestAnimationFrame(onScroll);
  };
  requestAnimationFrame(onScroll);
}

// Nav marker (works on all pages using [data-nav])
const marker = $('#navMarker');
const current = document.querySelector('[data-nav][aria-current="page"]');
function moveMarker(el){
  if (!marker || !el) return;
  const r = el.getBoundingClientRect();
  const p = el.parentElement.getBoundingClientRect();
  marker.style.transform = `translateX(${r.left - p.left + 4}px)`;
  marker.style.width = `${r.width - 8}px`;
}
if (marker) {
  moveMarker(current);
  const navLinks = $$('.nav-links [data-nav]');
  navLinks.forEach(a=>{
    a.addEventListener('mouseenter',()=>moveMarker(a));
    a.addEventListener('mouseleave',()=>moveMarker(current));
  });
  addEventListener('resize',()=>moveMarker(current));
}

// Pinned horizontal scroller (Home only)
(function(){
  const section = $('#projects');
  const track = $('#projectsTrack');
  if (!section || !track) return;

  const compute = () => {
    const vh = innerHeight;
    const total = section.offsetHeight - vh;
    const rect = section.getBoundingClientRect();
    // How far through the pinned section are we?
    const scrolled = Math.min(Math.max(vh - rect.top - vh, 0), total);
    const panels = track.children.length;
    const maxX = (panels * innerWidth) - innerWidth;
    const progress = total > 0 ? scrolled / total : 0;
    track.style.transform = `translate3d(${-progress * maxX}px,0,0)`;
  };

  let ticking = false;
  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { compute(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  addEventListener('resize', compute);
  compute();
})();

// Modals (shared)
(function(){
  const openModal = id => {
    const m = document.getElementById(id);
    if (!m) return;
    m.setAttribute('open','');
    m.removeAttribute('aria-hidden');
    const first = m.querySelector('[data-close]') || m.querySelector('button,a');
    first && first.focus();
    document.body.style.overflow = 'hidden';
  };
  const closeModal = m => {
    m.removeAttribute('open');
    m.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  };
  $$('[data-open]').forEach(btn => btn.addEventListener('click', () => openModal(btn.getAttribute('data-open'))));
  $$('.modal [data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal'))));
  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) closeModal(m); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && m.hasAttribute('open')) closeModal(m); });
  });
})();

// ===== Scroll progress bar =====
(() => {
    const bar = document.getElementById('progressBar');
    if (!bar) return;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = `${p}%`;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();
  
  // ===== Scroll-spy for sticky subnav =====
  (() => {
    const links = [...document.querySelectorAll('.subnav [data-spy]')];
    if (!links.length) return;
    const ids = links.map(a => a.getAttribute('href')).filter(Boolean).map(h => h.slice(1));
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  
    const io = new IntersectionObserver(entries => {
      // pick the entry closest to viewport top
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      const id = visible.target.id;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
    }, { rootMargin: '-40% 0px -55% 0px', threshold: [0, .2, .6, 1] });
  
    sections.forEach(s => io.observe(s));
  })();
  
  // ===== Pinned marquee (vertical scroll -> horizontal move) =====
  (() => {
    const pin = document.querySelector('.marquee-pin');
    const track = document.getElementById('marqueeTrack');
    if (!pin || !track) return;
  
    const compute = () => {
      const rect = pin.getBoundingClientRect();
      const vh = innerHeight;
      const total = pin.offsetHeight - vh;
      const progressed = Math.min(Math.max(vh - rect.top - vh, 0), total);
      const t = total > 0 ? progressed / total : 0;
  
      // Move from left to right (and a bit more so it feels endless)
      const w = track.scrollWidth;
      const maxX = w * 0.35; // tweak for “distance”
      track.style.transform = `translate3d(${-t * maxX}px,0,0)`;
    };
  
    let ticking = false;
    addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => { compute(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    addEventListener('resize', compute);
    compute();
  })();
  