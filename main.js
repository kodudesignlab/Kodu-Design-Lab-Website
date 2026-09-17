/* Kodu Design Lab — homepage intro, theme toggle, project page + transitions */
(function () {
  const html = document.documentElement;
  const body = document.body;
  const BASE = body.dataset.base || '';           // '' on the homepage, '../' inside /projects
  // Absolute site root, captured before any pushState changes the document base URL
  const SITE_ROOT = new URL(BASE || './', location.href).href;
  const siteUrl = (path) => new URL(path, SITE_ROOT).href;
  const PROJECTS = window.KODU_PROJECTS || {};
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header links: make them absolute so they survive pushState URL changes ----------
     (otherwise "about" resolves to /projects/about after opening a project from the homepage) */
  document.querySelectorAll('.brand__link, .nav__item').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && !/^(https?:|mailto:|#)/.test(href)) a.href = siteUrl(href);
  });

  /* ---------- Rolling hover text for brand + nav links ---------- */
  document.querySelectorAll('.brand__link, .nav__item, .roll-target').forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    el.classList.add('roll');
    ['roll__text', 'roll__text roll__text--clone'].forEach((cls) => {
      const line = document.createElement('span');
      line.className = cls;
      line.setAttribute('aria-hidden', 'true');
      // Letters grouped by word so text can only wrap at spaces on narrow screens
      let i = 0;
      text.split(' ').forEach((word, w, words) => {
        const group = document.createElement('span');
        group.className = 'roll__word';
        [...word].forEach((ch) => {
          const s = document.createElement('span');
          s.className = 'char';
          s.style.setProperty('--i', i++);
          s.textContent = ch;
          group.appendChild(s);
        });
        line.appendChild(group);
        if (w < words.length - 1) {
          const sp = document.createElement('span');
          sp.className = 'char';
          sp.style.setProperty('--i', i++);
          sp.textContent = ' ';
          line.appendChild(sp);
        }
      });
      el.appendChild(line);
    });
  });

  /* ---------- Tagline: "by Lachlan Sarv" ⇄ "Digital & Graphic Design" ----------
     A three-line track (A, B, A) slides up one line every few seconds; after the third
     line it snaps back to the top invisibly, so it reads as an endless upward loop. */
  const swap = document.querySelector('.brand__swap');
  if (swap && !reduceMotion) {
    let step = 0;
    setInterval(() => {
      step += 1;
      gsap.to(swap, {
        yPercent: -(100 / 3) * step,   // one line = a third of the three-line track
        duration: 0.7,
        ease: 'power3.inOut',
        onComplete() { if (step === 2) { step = 0; gsap.set(swap, { yPercent: 0 }); } },
      });
    }, 3500);
  }

  /* ---------- Theme toggle ---------- */
  const toggle = document.querySelector('.theme-toggle');
  function syncToggle() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  toggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncToggle();
  });
  syncToggle();

  /* ---------- Project page rendering ---------- */
  // How wide each image slot is on screen, so the browser can pick the sharpest variant
  // Below 700px every image is full width, so the browser should pick sizes accordingly
  const SIZES = {
    1: 'calc(100vw - 40px)',
    2: '(max-width: 699px) calc(100vw - 40px), calc(50vw - 30px)',
    3: '(max-width: 699px) calc(100vw - 40px), calc(33.33vw - 27px)',
  };
  function imageSrcset(img) {
    return img.widths.map((w) => `${siteUrl(img.src + '-' + w + '.jpg')} ${w}w`).join(', ');
  }
  function largestSrc(img) {
    return siteUrl(img.src + '-' + Math.max(...img.widths) + '.jpg');
  }

  function buildProjectPage(slug) {
    const data = PROJECTS[slug];
    const page = document.createElement('main');
    page.className = 'project-page';
    page.dataset.project = slug;
    if (!data) return page;
    data.images.forEach((img, i) => {
      const fig = document.createElement('figure');
      fig.className = 'project-image project-image--cols-' + (img.cols || 1);
      fig.style.aspectRatio = img.aspect || '16 / 10';
      if (i === 0) fig.classList.add('project-image--hero');
      const el = document.createElement('img');
      el.src = largestSrc(img);
      el.srcset = imageSrcset(img);
      el.sizes = SIZES[img.cols] || SIZES[1];
      el.alt = img.alt || '';
      el.loading = i < 3 ? 'eager' : 'lazy';
      el.decoding = 'async';
      fig.appendChild(el);
      page.appendChild(fig);
    });
    return page;
  }

  // Standalone project page (direct load / refresh): render and stop here
  const staticPage = document.querySelector('[data-project-page]');
  if (staticPage) {
    const slug = body.dataset.project;
    const built = buildProjectPage(slug);
    staticPage.replaceWith(built);
    if (PROJECTS[slug]) document.title = PROJECTS[slug].name + ' — Kodu Design Lab';
    html.classList.add('intro-done');
    return;
  }

  /* ---------- About page ---------- */
  if (body.dataset.view === 'about') {
    const brandLines = gsap.utils.toArray('.brand > *');
    const navItems = gsap.utils.toArray('.nav > *');
    const portrait = document.querySelector('.about__portrait');
    const eyebrows = gsap.utils.toArray('.about__eyebrow');
    const leads = gsap.utils.toArray('.about__lead');
    const listItems = gsap.utils.toArray('.about__list li');
    const linkItems = gsap.utils.toArray('.about__links li');

    // Split a paragraph into its rendered lines, each wrapped in a mask so it can rise into view.
    // Lines are measured from the real layout, so wrapping is identical to the plain text.
    function splitLines(el) {
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      el.dataset.text = text;
      el.textContent = '';
      const probes = text.split(' ').map((w) => {
        const s = document.createElement('span');
        s.textContent = w + ' ';
        el.appendChild(s);
        return s;
      });
      const lines = [];
      let top = null;
      probes.forEach((p) => {
        if (p.offsetTop !== top) { top = p.offsetTop; lines.push([]); }
        lines[lines.length - 1].push(p.textContent);
      });
      el.textContent = '';
      return lines.map((wordsInLine) => {
        const mask = document.createElement('span');
        mask.className = 'line';
        const inner = document.createElement('span');
        inner.textContent = wordsInLine.join('').trimEnd();
        mask.appendChild(inner);
        el.appendChild(mask);
        return inner;
      });
    }

    html.classList.add('is-loading');
    const ready = document.fonts ? document.fonts.ready : Promise.resolve();
    ready.then(() => {
      if (reduceMotion) { html.classList.remove('is-loading'); html.classList.add('intro-done'); return; }

      const lineSets = leads.map(splitLines);
      const lines = lineSets.flat();
      gsap.set(brandLines, { y: 14, opacity: 0 });
      gsap.set(navItems, { y: 14, opacity: 0 });
      gsap.set(portrait, { opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' });
      gsap.set(eyebrows, { opacity: 0, y: 10 });
      gsap.set(leads, { opacity: 1 });
      gsap.set(lines, { yPercent: 110 });
      gsap.set([listItems, linkItems], { opacity: 0, y: 12 });
      html.classList.remove('is-loading');

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete() {
          html.classList.add('intro-done');
          gsap.set([brandLines, navItems, eyebrows, leads, listItems, linkItems, portrait], { clearProps: 'transform,opacity,clipPath' });
          // Put the paragraphs back to plain text so they render as ordinary, crisp type
          leads.forEach((el) => { el.textContent = el.dataset.text; });
        },
      });
      window.koduIntro = tl;
      // Lines were measured at the current width — if the window resizes mid-intro, just finish
      addEventListener('resize', () => { if (tl.isActive()) tl.progress(1); }, { once: true });

      // Nav — top-left first, then the right side
      tl.to(brandLines, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, force3D: false }, 0.1)
        .to(navItems, { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, force3D: false }, 0.3);

      // Portrait wipes up into view
      tl.to(portrait, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power3.inOut' }, 0.25);

      // Each text row: eyebrow fades, then its paragraph rises line by line
      let at = 0.45;
      lineSets.forEach((set, i) => {
        tl.to(eyebrows[i], { opacity: 1, y: 0, duration: 0.6, force3D: false }, at)
          .to(set, { yPercent: 0, duration: 1.0, ease: 'power3.out', stagger: 0.09, force3D: false }, at + 0.1);
        at += 0.1 + set.length * 0.09 * 0.7; // next row starts while this one is still finishing
      });

      // Services list, then social links
      tl.to(eyebrows[lineSets.length], { opacity: 1, y: 0, duration: 0.6, force3D: false }, at)
        .to(listItems, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, force3D: false }, at + 0.1);
      at += 0.35;
      tl.to(eyebrows[lineSets.length + 1], { opacity: 1, y: 0, duration: 0.6, force3D: false }, at)
        .to(linkItems, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, force3D: false }, at + 0.1);
    });
    return;
  }

  /* ---------- Homepage ---------- */
  const brandLines = gsap.utils.toArray('.brand > *');
  const navItems = gsap.utils.toArray('.nav > *');
  const wrapper = document.querySelector('.project-wrapper');
  const container = document.querySelector('.project-container');
  const cards = gsap.utils.toArray('.project-card');
  const cardMeta = gsap.utils.toArray('.project-card__meta');
  const HOME_TITLE = document.title;
  const mobileMQ = matchMedia('(max-width: 699px)');   // the mobile carousel breakpoint
  html.classList.add('lock-scroll');                     // released when the intro completes

  html.classList.add('is-loading');

  // Warm the cache with each project's hero image so the card → hero transition never waits on
  // the network. Uses the same srcset/sizes as the real hero so the browser fetches the exact
  // variant it will later display. Runs when the browser is idle, after the intro.
  function preloadHeroes() {
    const run = () => Object.values(PROJECTS).forEach((p) => {
      const im = p.images && p.images[0];
      if (!im) return;
      const i = new Image();
      i.sizes = SIZES[1];
      i.srcset = imageSrcset(im);
      i.src = largestSrc(im);
    });
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 2000 }); else setTimeout(run, 500);
  }

  function runIntro() {
    if (reduceMotion || typeof gsap === 'undefined') {
      html.classList.remove('is-loading');
      html.classList.add('intro-done');
      html.classList.remove('lock-scroll');
      preloadHeroes();
      return;
    }

    // Where each card's centre sits in its final layout, relative to the container centre
    const cRect = container.getBoundingClientRect();
    const cx = cRect.left + cRect.width / 2;
    const cy = cRect.top + cRect.height / 2;
    const offsets = cards.map((card) => {
      const r = card.getBoundingClientRect();
      return { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) };
    });

    // Set initial states, then remove the CSS "hidden" class so GSAP owns opacity
    gsap.set(brandLines, { y: 14, opacity: 0 });
    gsap.set(navItems, { y: 14, opacity: 0 });
    gsap.set(cardMeta, { opacity: 0 });
    // Cards start stacked at the container centre but pushed fully below the viewport.
    // On mobile the stack sits at 80% so there's breathing room around it before it fans out.
    const belowViewport = window.innerHeight;
    const stackScale = mobileMQ.matches ? 0.8 : 1;
    cards.forEach((card, i) => {
      gsap.set(card, {
        x: offsets[i].x,
        y: offsets[i].y + belowViewport,
        scale: stackScale * 0.96,
        rotation: (i - (cards.length - 1) / 2) * 1.5,
        opacity: 1,
        zIndex: cards.length - i,
        transformOrigin: '50% 50%',
      });
    });
    html.classList.remove('is-loading');

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete() {
        html.classList.add('intro-done');
        html.classList.remove('lock-scroll');
        // Drop GSAP's inline transforms so text sits on whole pixels and renders crisp
        gsap.set([brandLines, navItems], { clearProps: 'transform,opacity' });
        preloadHeroes();
      },
    });
    window.koduIntro = tl; // handy for scrubbing in devtools

    // 1. Cards slide up from below the viewport and settle stacked in the centre (0 → ~1.25s)
    tl.to(cards, {
      y: (i) => offsets[i].y,
      scale: stackScale,
      duration: 1.0,
      ease: 'power3.out',
      stagger: 0.05,
    }, 0);

    // 2. Nav appears while the cards are mid-slide — top-left first, then the right side
    tl.to(brandLines, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, force3D: false }, 0.35)
      .to(navItems, { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, force3D: false }, 0.6);

    // 3. Spread starts while the slide-up is still settling so the two motions blend with no pause (1.05s → ~2.55s)
    tl.to(cards, {
      x: 0,
      y: 0,
      scale: 1,          // mobile: grow from the 80% stack to full size as they spread
      rotation: 0,
      duration: 1.3,
      ease: 'power3.inOut',
      stagger: { each: 0.04, from: 'center' },
      onComplete() {
        gsap.set(cards, { clearProps: 'transform,zIndex,opacity' });
      },
    }, 1.05);

    // 4. Card text fades in as the spread settles
    tl.to(cardMeta, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      stagger: { each: 0.04, from: 'center' },
      onComplete() {
        gsap.set(cardMeta, { clearProps: 'opacity' });
      },
    }, 1.9);
  }

  // Wait for fonts so measured card positions are final
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(runIntro);

  /* ---------- Card → project page transition (and back) ---------- */
  let currentPage = null;   // the .project-page element while a project is open
  let activeCard = null;    // the card that was clicked
  let busy = false;         // a transition is running
  let projectOpen = false;  // true from the moment a card is clicked until the close finishes
  let queued = null;        // 'close' | 'open' requested while busy — runs when the transition ends
  let queuedArgs = null;
  function runQueued() {
    const q = queued; queued = null;
    if (q === 'close') closeProject();
    else if (q === 'open' && queuedArgs) openProject(...queuedArgs);
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  history.replaceState({ view: 'home' }, '', location.href);

  // A fixed-position copy of an image that can travel between two rects
  function makeClone(imgSrc, rect) {
    const clone = document.createElement('div');
    clone.className = 'flip-clone';
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = '';
    clone.appendChild(img);
    gsap.set(clone, { top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    body.appendChild(clone);
    return clone;
  }

  function openProject(card, slug, pushUrl) {
    if (!PROJECTS[slug]) return;
    if (busy) { queued = 'open'; queuedArgs = [card, slug, pushUrl]; return; }
    // Clicked before the intro finished: jump the intro to its end so the two don't fight
    if (window.koduIntro && window.koduIntro.isActive()) window.koduIntro.progress(1);
    html.classList.remove('is-loading');
    html.classList.add('intro-done');
    html.classList.remove('lock-scroll');
    busy = true;
    projectOpen = true;
    activeCard = card;
    html.classList.add('is-transitioning');

    const media = card.querySelector('.project-card__media');
    const otherCards = cards.filter((c) => c !== card);
    const first = media.getBoundingClientRect();

    // Build the page now (hidden) so images start loading immediately
    const page = buildProjectPage(slug);
    const hero = page.querySelector('.project-image--hero');
    const rest = gsap.utils.toArray(page.querySelectorAll('.project-image:not(.project-image--hero)'));
    gsap.set(rest, { opacity: 0, y: 40 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete() {
        html.classList.remove('is-transitioning');
        busy = false;
        runQueued();
      },
    });
    window.koduTransition = tl;

    // 1. Other cards (and all card text) fade away
    tl.to(otherCards, { opacity: 0, y: 12, duration: 0.4, ease: 'power2.out', stagger: 0.02 }, 0)
      .to(card.querySelector('.project-card__meta'), { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0);

    // 2. Swap the DOM: card image → travelling clone → project hero
    const SWAP_AT = 0.2;
    tl.add(() => {
      // Start the clone from the card image that's already on screen (instant), then hand it the
      // hero's srcset so the browser upgrades to the hi-res variant as soon as it's available.
      // The <img> keeps showing the current bitmap until the new one has decoded, so no blank frame.
      const cardImg = media.querySelector('img');
      const heroData = PROJECTS[slug].images[0];
      const clone = makeClone(cardImg.currentSrc || cardImg.src, first);
      const cloneImg = clone.querySelector('img');
      cloneImg.sizes = SIZES[1];
      cloneImg.srcset = imageSrcset(heroData);
      gsap.set(media, { visibility: 'hidden' });
      gsap.set(hero, { visibility: 'hidden' });

      wrapper.hidden = true;
      body.appendChild(page);
      currentPage = page;
      window.scrollTo(0, 0);

      const last = hero.getBoundingClientRect();
      tl.to(clone, {
        top: last.top, left: last.left, width: last.width, height: last.height,
        duration: 1.3, ease: 'power3.inOut',
        onComplete() {
          // Keep the clone in place until the hero underneath has actually loaded
          const heroImg = hero.querySelector('img');
          const reveal = () => { gsap.set(hero, { clearProps: 'visibility' }); clone.remove(); };
          if (heroImg.complete && heroImg.naturalWidth) reveal();
          else {
            heroImg.addEventListener('load', reveal, { once: true });
            heroImg.addEventListener('error', reveal, { once: true });
          }
        },
      }, SWAP_AT);
      tl.to(rest, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, SWAP_AT + 0.55);
    }, SWAP_AT);

    if (pushUrl) history.pushState({ view: 'project', slug }, '', card.getAttribute('href'));
    document.title = PROJECTS[slug].name + ' — Kodu Design Lab';
  }

  function closeProject() {
    if (busy) { queued = 'close'; return; }
    if (!currentPage) { projectOpen = false; return; }
    busy = true;
    html.classList.add('is-transitioning');

    const page = currentPage;
    const card = activeCard;
    const media = card.querySelector('.project-card__media');
    const meta = card.querySelector('.project-card__meta');
    const otherCards = cards.filter((c) => c !== card);
    const hero = page.querySelector('.project-image--hero');
    const rest = gsap.utils.toArray(page.querySelectorAll('.project-image:not(.project-image--hero)'));

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete() {
        html.classList.remove('is-transitioning');
        busy = false;
        projectOpen = false;
        runQueued();
      },
    });
    window.koduTransition = tl;

    // 1. Other project images fade away
    tl.to(rest, { opacity: 0, y: 24, duration: 0.3, ease: 'power2.in', stagger: 0.015 }, 0);

    // 2. Hero → travelling clone → card image, while the other cards fade back in
    const SWAP_AT = 0.25;
    tl.add(() => {
      const first = hero.getBoundingClientRect();
      const heroImg = hero.querySelector('img');
      const clone = makeClone(heroImg.currentSrc || heroImg.src, first);

      page.remove();
      currentPage = null;
      gsap.set(otherCards, { opacity: 0, y: 12 });
      gsap.set(meta, { opacity: 0 });
      wrapper.hidden = false;
      window.scrollTo(0, 0);

      const last = media.getBoundingClientRect();
      tl.to(clone, {
        top: last.top, left: last.left, width: last.width, height: last.height,
        duration: 1.3, ease: 'power3.inOut',
        onComplete() {
          gsap.set(media, { clearProps: 'visibility' });
          clone.remove();
        },
      }, SWAP_AT);
      tl.to(otherCards, {
        opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.03,
        onComplete() { gsap.set(otherCards, { clearProps: 'transform,opacity' }); },
      }, SWAP_AT + 0.75);
      tl.to(meta, {
        opacity: 1, duration: 0.4, ease: 'power2.out',
        onComplete() { gsap.set(meta, { clearProps: 'opacity' }); },
      }, SWAP_AT + 0.95);
    }, SWAP_AT);

    document.title = HOME_TITLE;
  }

  // Card clicks: only cards with project data get the in-page transition
  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const slug = card.dataset.project;
      if (!slug || !PROJECTS[slug] || reduceMotion) return; // fall through to a normal navigation
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      openProject(card, slug, true);
    });
  });


  // Brand link acts as "back" while a project is open
  document.querySelector('.brand__link').addEventListener('click', (e) => {
    e.preventDefault();
    if (projectOpen) history.back();
    else window.scrollTo(0, 0);
  });

  // Browser back / forward
  window.addEventListener('popstate', (e) => {
    const state = e.state || { view: 'home' };
    if (state.view === 'home' && projectOpen) {
      closeProject();
    } else if (state.view === 'project' && !projectOpen) {
      const card = cards.find((c) => c.dataset.project === state.slug);
      if (card) openProject(card, state.slug, false);
    }
  });
})();
