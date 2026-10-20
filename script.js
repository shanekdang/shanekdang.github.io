document.addEventListener('DOMContentLoaded', function () {
  /* ----- Constants ----- */
  const CLASS_ACTIVE = 'active';
  const CLASS_FLIPPED = 'flipped';
  const CLASS_SLIDE_LEFT = 'slide-left';
  const EMAIL = 'shanedang17@gmail.com';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ----- Elements ----- */
  const card = document.getElementById('businessCard');
  const cardFront = card.querySelector('.front');
  const cardBack = card.querySelector('.back');
  const cardScene = document.getElementById('cardScene');
  const cardTilt = document.getElementById('cardTilt');
  const cardView = document.getElementById('cardView');
  const portfolioSection = document.getElementById('portfolioSection');
  const sideToggle = document.querySelector('.side-toggle');
  const toggleButtons = document.querySelectorAll('.side-toggle button');
  const navLinks = document.querySelectorAll('.nav-links a');
  const homeLink = document.getElementById('homeLink');
  const aboutLink = document.getElementById('aboutLink');
  const portfolioLink = document.getElementById('portfolioLink');
  const brandLink = document.getElementById('brandLink');
  const backToCardBtn = document.getElementById('backToCardBtn');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const toast = document.getElementById('toast');
  const carLink = document.getElementById('carLink');
  const polaroid = document.getElementById('polaroid');
  let polaroidHideTimer; // declared up here because setSide() → setPolaroid() runs during startup

  // Portfolio folder (also declared up here: a #portfolio link opens it during startup)
  const projects = window.PROJECTS || [];
  const folder = document.getElementById('folder');
  const folderPages = document.getElementById('folderPages');
  const folderCount = document.getElementById('folderCount');
  const docViewer = document.getElementById('docViewer');
  const docSheet = document.getElementById('docSheet');
  const docContent = document.getElementById('docContent');
  const docClose = document.getElementById('docClose');
  let folderTimers = [];
  let openPage = null;

  /* ----- Nav Bar Active ----- */
  function setActiveLink(activeId) {
    navLinks.forEach(link => link.classList.toggle(CLASS_ACTIVE, link.id === activeId));
  }

  /* ----- Card side (front / back) ----- */
  function setSide(side, { updateUrl = true } = {}) {
    const isBack = side === 'back';
    card.classList.toggle(CLASS_FLIPPED, isBack);
    sideToggle.classList.toggle('is-back', isBack);
    cardScene.classList.toggle('is-back', isBack);
    // Keep keyboard focus and screen readers off the side that's facing away
    cardFront.inert = isBack;
    cardBack.inert = !isBack;
    if (!isBack) setPolaroid(false);
    toggleButtons.forEach(btn => {
      const active = btn.dataset.side === side;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    setActiveLink(isBack ? 'aboutLink' : 'homeLink');
    if (updateUrl) history.replaceState(null, '', isBack ? '?flip=back' : '?flip=front');
  }

  function flipCard() {
    setSide(card.classList.contains(CLASS_FLIPPED) ? 'front' : 'back');
  }

  /* ----- Portfolio view ----- */
  function showPortfolio() {
    cardView.classList.add(CLASS_SLIDE_LEFT);
    cardView.inert = true;
    portfolioSection.classList.add(CLASS_ACTIVE);
    portfolioSection.inert = false;
    setActiveLink('portfolioLink');
    history.replaceState(null, '', '#portfolio');
    openFolder();
  }

  function showCard(side) {
    closeProject({ instant: true });
    closeFolder();
    cardView.classList.remove(CLASS_SLIDE_LEFT);
    cardView.inert = false;
    portfolioSection.classList.remove(CLASS_ACTIVE);
    portfolioSection.inert = true;
    setSide(side);
  }

  renderFolderPages();

  /* ----- Initial state from URL ----- */
  const flipParam = new URLSearchParams(window.location.search).get('flip');
  setSide(flipParam === 'back' ? 'back' : 'front', { updateUrl: false });
  if (window.location.hash === '#portfolio') showPortfolio();

  /* ----- Card click / keyboard flip ----- */
  // Clicks on (or in the gaps between) these controls never flip the card
  const NO_FLIP = 'a, button, .hover-car, .actions, .photo-links, .back-footer';
  const INTERACTIVE = 'a, button, .hover-car';

  card.addEventListener('click', e => {
    if (e.target.closest(NO_FLIP)) return;
    // A tap that's only meant to tuck the polaroid away shouldn't also flip the card
    if (polaroid.classList.contains('is-out')) {
      setPolaroid(false);
      return;
    }
    if (window.getSelection().toString()) return; // don't flip while selecting text
    flipCard();
  });

  card.addEventListener('keydown', e => {
    if (e.target !== card) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flipCard();
    }
  });

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => setSide(btn.dataset.side));
  });

  /* ----- Nav ----- */
  [homeLink, brandLink].forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showCard('front');
    });
  });

  aboutLink.addEventListener('click', e => {
    e.preventDefault();
    showCard('back');
  });

  portfolioLink.addEventListener('click', e => {
    e.preventDefault();
    showPortfolio();
  });

  backToCardBtn.addEventListener('click', () => showCard('front'));

  /* ----- 3D tilt + glare (mouse only) ----- */
  if (finePointer && !reduceMotion) {
    const MAX_TILT = 5;   // degrees
    const EASE = 0.12;    // fraction of the remaining distance covered each frame
    const tilt = { rx: 0, ry: 0, targetRx: 0, targetRy: 0 };
    let frame = null;

    // Ease toward the target once per frame, so the card glides instead of restarting a transition on every mouse event
    function step() {
      tilt.rx += (tilt.targetRx - tilt.rx) * EASE;
      tilt.ry += (tilt.targetRy - tilt.ry) * EASE;
      cardTilt.style.setProperty('--rx', `${tilt.rx.toFixed(3)}deg`);
      cardTilt.style.setProperty('--ry', `${tilt.ry.toFixed(3)}deg`);

      const settled = Math.abs(tilt.targetRx - tilt.rx) < 0.01 && Math.abs(tilt.targetRy - tilt.ry) < 0.01;
      frame = settled ? null : requestAnimationFrame(step);
    }

    function animate() {
      if (!frame) frame = requestAnimationFrame(step);
    }

    const clamp01 = n => Math.min(1, Math.max(0, n));

    cardScene.addEventListener('pointermove', e => {
      const rect = cardScene.getBoundingClientRect();
      // Clamp so the polaroid sliding out past the card's edge can't over-tilt it
      const x = clamp01((e.clientX - rect.left) / rect.width);
      const y = clamp01((e.clientY - rect.top) / rect.height);

      cardTilt.classList.add('is-tracking');
      // The back's own rotateY(180deg) cancels the card's flip, so both sides use screen coordinates as-is
      cardTilt.style.setProperty('--gx', `${x * rect.width}px`);
      cardTilt.style.setProperty('--gy', `${y * rect.height}px`);

      // Hold the tilt (the card eases to a stop) while aiming at a link/button, so targets don't drift under the cursor
      if (e.target.closest(INTERACTIVE)) return;

      tilt.targetRx = (0.5 - y) * MAX_TILT * 2;
      tilt.targetRy = (x - 0.5) * MAX_TILT * 2;
      animate();
    });

    cardScene.addEventListener('pointerleave', () => {
      cardTilt.classList.remove('is-tracking');
      tilt.targetRx = 0;
      tilt.targetRy = 0;
      animate();
    });
  }

  /* ----- Miata polaroid ----- */
  function setPolaroid(out) {
    clearTimeout(polaroidHideTimer);
    polaroid.classList.toggle('is-out', out);
    polaroid.setAttribute('aria-expanded', out);
    carLink.setAttribute('aria-expanded', out);
  }

  // Short grace period so slipping off the edge (or moving between the link and the photo) doesn't snap it shut
  function hidePolaroidSoon() {
    clearTimeout(polaroidHideTimer);
    polaroidHideTimer = setTimeout(() => setPolaroid(false), 250);
  }

  [carLink, polaroid].forEach(el => {
    if (finePointer) {
      el.addEventListener('mouseenter', () => setPolaroid(true));
      el.addEventListener('mouseleave', hidePolaroidSoon);
      el.addEventListener('focus', () => setPolaroid(true));
      el.addEventListener('blur', hidePolaroidSoon);
    }
    el.addEventListener('click', e => {
      e.stopPropagation();
      // Mouse: hovering already shows it, so a click keeps it out. Touch: tap toggles.
      setPolaroid(finePointer || !polaroid.classList.contains('is-out'));
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#carLink, #polaroid')) setPolaroid(false);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setPolaroid(false);
  });

  /* ----- Portfolio folder ----- */
  // Small DOM helper; text always goes in via textContent, so project data can't inject HTML
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function renderFolderPages() {
    projects.forEach((project, i) => {
      const page = el('button', 'doc-page');
      page.type = 'button';
      page.setAttribute('aria-label', `Open project: ${project.title}`);
      page.style.setProperty('--i', i);
      page.style.setProperty('--z', i + 1);

      const head = el('div', 'doc-page-head');
      head.append(el('span', 'doc-page-num', `${pad(i + 1)} /`), el('span', 'doc-page-year', project.year || ''));
      page.append(head, el('h3', 'doc-page-title', project.title), el('p', 'doc-page-summary', project.summary || ''), el('span', 'doc-page-lines'));

      page.addEventListener('click', () => openProject(i, page));
      folderPages.append(page);
    });

    folderCount.textContent = `${pad(projects.length)} ${projects.length === 1 ? 'file' : 'files'}`;
    layoutFolderPages();
  }

  // Fan the pages out: spread them as far as the folder allows, tilt the outer ones, drop them slightly
  function layoutFolderPages() {
    const pages = [...folderPages.children];
    const n = pages.length;
    if (!n) return;

    const folderWidth = folder.offsetWidth;
    const pageWidth = pages[0].offsetWidth;
    const maxSpread = n > 1 ? ((folderWidth * 0.94) / pageWidth - 1) / (n - 1) : 0;
    const spread = Math.max(0, Math.min(0.7, maxSpread));
    const rotStep = n > 1 ? Math.min(6, 16 / (n - 1)) : 0;

    // Each page is overlapped on its right by the next one; keep its text inside the uncovered strip.
    // (Page padding is 8% of its width per side; the text box is the remaining 84%.)
    const textWidth = Math.min(1, Math.max(0.4, (spread - 0.08) / 0.84));

    pages.forEach((page, i) => {
      const offset = i - (n - 1) / 2;
      page.style.setProperty('--text-w', i < n - 1 ? `${textWidth * 100}%` : '100%');
      page.style.setProperty('--o', offset);
      page.style.setProperty('--spread', `${spread * 100}%`);
      page.style.setProperty('--r', `${offset * rotStep}deg`);
      page.style.setProperty('--fy', `${Math.abs(offset) * 4}%`);
    });
  }

  window.addEventListener('resize', layoutFolderPages);

  function openFolder() {
    closeFolder();
    layoutFolderPages();
    const pageCount = folderPages.children.length;
    // Let the portfolio slide in first, then pop the folder and fan out the pages
    folderTimers.push(setTimeout(() => folder.classList.add('is-open'), reduceMotion ? 0 : 350));
    folderTimers.push(setTimeout(() => folder.classList.add('is-ready'), reduceMotion ? 0 : 1400 + pageCount * 80));
  }

  function closeFolder() {
    folderTimers.forEach(clearTimeout);
    folderTimers = [];
    folder.classList.remove('is-open', 'is-ready');
  }

  /* ----- Project page (opens out of its folder page) ----- */
  function fillProject(project, index) {
    docContent.replaceChildren();

    const header = el('header', 'doc-header');
    header.append(el('p', 'mono-label', `// project ${pad(index + 1)}${project.year ? ` · ${project.year}` : ''}`));
    const title = el('h2', null, project.title);
    title.id = 'docTitle';
    header.append(title);
    if (project.summary) header.append(el('p', 'doc-summary', project.summary));
    if (project.tags?.length) {
      const tags = el('ul', 'focus-chips');
      project.tags.forEach(tag => tags.append(el('li', null, tag)));
      header.append(tags);
    }

    const hero = el('div', 'doc-hero');
    if (project.image) {
      const img = el('img');
      img.src = project.image;
      img.alt = project.title;
      hero.append(img);
    } else {
      hero.append(el('span', 'doc-hero-placeholder', '// project image'));
    }

    const body = el('div', 'doc-body');
    (project.sections || []).forEach(section => {
      const block = el('section', 'doc-section');
      block.append(el('h3', null, section.heading), el('p', null, section.text));
      body.append(block);
    });

    docContent.append(header, hero, body);

    if (project.links?.length) {
      const links = el('div', 'doc-links');
      project.links.forEach((link, i) => {
        const a = el('a', `btn ${i === 0 ? 'btn-primary' : 'btn-ghost'}`);
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener';
        if (link.icon) a.append(el('i', `bx ${link.icon}`));
        a.append(document.createTextNode(` ${link.label}`));
        links.append(a);
      });
      docContent.append(links);
    }

    docContent.scrollTop = 0;
  }

  // Transform that maps the full-size sheet onto the folder page it came from
  function sheetFromPage(page) {
    const from = page.getBoundingClientRect();
    const to = docSheet.getBoundingClientRect();
    const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
    const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
    const angle = page.style.getPropertyValue('--r') || '0deg';
    return `translate(${dx}px, ${dy}px) rotate(${angle}) scale(${from.width / to.width}, ${from.height / to.height})`;
  }

  const MORPH_EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

  function openProject(index, page) {
    fillProject(projects[index], index);
    openPage = page;

    docViewer.classList.remove('is-closing', 'is-settled');
    docViewer.classList.add('is-open');
    docViewer.setAttribute('aria-hidden', 'false');

    const settle = () => {
      docViewer.classList.add('is-settled');
      docClose.focus({ preventScroll: true });
    };

    if (reduceMotion || !docSheet.animate) {
      page.classList.add('is-lifted');
      settle();
      return;
    }

    const start = sheetFromPage(page); // measure before hiding the page
    page.classList.add('is-lifted');
    docSheet.animate(
      [{ transform: start, borderRadius: '12px' }, { transform: 'none', borderRadius: '20px' }],
      { duration: 620, easing: MORPH_EASE }
    ).onfinish = settle;
  }

  function closeProject({ instant = false } = {}) {
    if (!docViewer.classList.contains('is-open') || docViewer.classList.contains('is-closing')) return;
    const page = openPage;

    const finish = () => {
      docViewer.classList.remove('is-open', 'is-closing', 'is-settled');
      docViewer.setAttribute('aria-hidden', 'true');
      docSheet.getAnimations?.().forEach(a => a.cancel());
      if (page) {
        page.classList.remove('is-lifted');
        if (!instant) page.focus({ preventScroll: true });
      }
      openPage = null;
    };

    if (instant || reduceMotion || !docSheet.animate || !page) {
      finish();
      return;
    }

    docViewer.classList.remove('is-settled');
    docViewer.classList.add('is-closing');
    docSheet.animate(
      [{ transform: 'none', borderRadius: '20px' }, { transform: sheetFromPage(page), borderRadius: '12px' }],
      { duration: 480, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
    ).onfinish = finish;
  }

  docViewer.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeProject();
  });

  docViewer.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeProject();
      return;
    }
    // Keep keyboard focus inside the open project page
    if (e.key === 'Tab') {
      const focusable = [...docSheet.querySelectorAll('a[href], button')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ----- Copy email ----- */
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  copyEmailBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      copyEmailBtn.innerHTML = "<i class='bx bx-check'></i>";
      showToast('Email copied to clipboard');
      setTimeout(() => { copyEmailBtn.innerHTML = "<i class='bx bx-copy'></i>"; }, 2000);
    } catch {
      showToast(EMAIL);
    }
  });

  /* ----- Typewriter effect ----- */
  const words = ["DATA ENGINEER", "DATA SCIENTIST", "GIS ANALYST", "PROGRAMMER"];
  let wordIndex = 0;
  let charIndex = 0;
  const typeSpan = document.querySelector(".typewriter-text");

  function type() {
    if (charIndex < words[wordIndex].length) {
      typeSpan.textContent += words[wordIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, 90);
    } else {
      setTimeout(erase, 2000);
    }
  }

  function erase() {
    if (charIndex > 0) {
      typeSpan.textContent = words[wordIndex].substring(0, charIndex - 1);
      charIndex--;
      setTimeout(erase, 45);
    } else {
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(type, 400);
    }
  }

  if (typeSpan) {
    if (reduceMotion) {
      typeSpan.textContent = words[0];
    } else {
      setTimeout(type, 900);
    }
  }
});
