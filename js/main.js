const EMAIL = "compagnonichiara01@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/chiara-compagnoni-748645275";
const INSTAGRAM = "https://www.instagram.com/cc.companions";

// Order used by the "Previous/Next project" links at the bottom of each case study
const PROJECTS = [
  { slug: "ramslab", title: "Virtual environments", cover: "assets/img/ramslab/cover.jpg" },
  { slug: "elettra", title: "Elettra", cover: "assets/img/cover-elettra.jpg" },
  { slug: "sliding-simulator", title: "Sliding Simulator", cover: "assets/img/cover-sliding.jpg" },
  { slug: "arera", title: "ARERA Smart", cover: "assets/img/cover-arera.jpg?v=5" },
  { slug: "exhoil", title: "EXHOIL", cover: "assets/img/cover-exhoil.webp" },
];

/* ---------- Shared header & footer ---------- */
function renderChrome() {
  const page = document.body.dataset.page;
  const current = (p) => (p === page ? ' aria-current="page"' : "");

  document.body.insertAdjacentHTML("afterbegin", `
    <a class="skip-link btn btn--primary" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="site-header__left">
        <a class="site-header__name" href="index.html#top">Hi, I'm Chiara</a>
        <a class="btn btn--primary" href="mailto:${EMAIL}">Let's talk! <span aria-hidden="true">↗</span></a>
      </div>
      <button class="btn btn--icon site-header__toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="site-nav"></button>
      <nav id="site-nav" aria-label="Main">
        <a class="u" href="index.html#work"${current("work")}>Work</a>
        <a class="u" href="about.html"${current("about")}>About</a>
        <a class="u" href="gallery.html"${current("gallery")}>Gallery</a>
      </nav>
    </header>`);

  document.body.insertAdjacentHTML("beforeend", `
    <footer class="site-footer">
      <div class="site-footer__row">
        <a class="site-footer__title display" href="mailto:${EMAIL}">Let's talk!</a>
        <div class="site-footer__links">
          <a href="mailto:${EMAIL}"><span class="small">Email /</span> <strong class="u">${EMAIL}</strong></a>
          <a href="${LINKEDIN}" target="_blank" rel="noopener"><span class="small">Linkedin /</span> <strong class="u">chiara-compagnoni</strong></a>
          <a href="${INSTAGRAM}" target="_blank" rel="noopener"><span class="small">Instagram /</span> <strong class="u">@cc.companions</strong></a>
        </div>
      </div>
      <p class="site-footer__copy small">© Chiara Compagnoni, ${new Date().getFullYear()}</p>
    </footer>`);
}

/* ---------- Case study: back link + previous/next project ---------- */
function renderProjectNav() {
  const slug = document.body.dataset.project;
  if (!slug) return;
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  if (i === -1) return;
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];

  const back = `<a class="p-back" href="index.html#work"><span aria-hidden="true">←</span> <span class="u">All projects</span></a>`;
  const hero = document.querySelector(".cs-hero");
  if (hero) hero.insertAdjacentHTML("afterbegin", back);
  else document.querySelector(".p-intro")?.insertAdjacentHTML("beforebegin", back);

  document.querySelector("main").insertAdjacentHTML("beforeend", `
    <nav class="project-nav" aria-label="Other projects">
      <a class="prev-project" href="${prev.slug}.html">
        <small class="label">Previous project</small>
        <strong class="title"><span class="arrow" aria-hidden="true">←</span> ${prev.title}</strong>
      </a>
      <a class="next-project" href="${next.slug}.html">
        <small class="label">Next project</small>
        <strong class="title">${next.title} <span class="arrow" aria-hidden="true">→</span></strong>
      </a>
    </nav>`);
}

/* ---------- Case study: table of contents + scroll spy ---------- */
function initToc() {
  const toc = document.querySelector(".cs-toc");
  const sections = [...document.querySelectorAll(".cs-section[id]")];
  if (!toc || !sections.length) return;

  toc.innerHTML = `<ol>${sections.map((s) =>
    `<li><a href="#${s.id}">${s.dataset.toc || s.id}</a></li>`).join("")}</ol>`;
  const links = new Map([...toc.querySelectorAll("a")].map((a) => [a.hash.slice(1), a]));

  // Current = last section whose top has passed 35% of the viewport
  const update = () => {
    const line = innerHeight * 0.35;
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
    links.forEach((a, id) => a.classList.toggle("is-current", id === current.id));
  };
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  update();
}

/* ---------- Live clock (Milan time) ---------- */
function initMenu() {
  const header = document.querySelector(".site-header");
  const toggle = header.querySelector(".site-header__toggle");
  const setOpen = (open) => {
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open);
  };
  toggle.addEventListener("click", () => setOpen(!header.classList.contains("is-open")));
  header.querySelector("nav").addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("click", (e) => {
    if (!header.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

function initStickerDrag() {
  const sticker = document.querySelector(".hero__sticker");
  if (!sticker) return;
  const hero = sticker.closest(".hero");
  let dx = 0, dy = 0, start = null;

  // Moves the sticker, keeping all of it inside the hero
  const moveTo = (x, y) => {
    const maxX = Math.max(0, (hero.clientWidth - sticker.offsetWidth) / 2);
    const maxY = Math.max(0, (hero.clientHeight - sticker.offsetHeight) / 2);
    dx = Math.max(-maxX, Math.min(maxX, x));
    dy = Math.max(-maxY, Math.min(maxY, y));
    sticker.style.setProperty("--dx", `${dx}px`);
    sticker.style.setProperty("--dy", `${dy}px`);
  };

  sticker.addEventListener("pointerdown", (e) => {
    start = { x: e.clientX - dx, y: e.clientY - dy };
    sticker.setPointerCapture(e.pointerId);
    sticker.classList.add("is-dragging");
  });
  sticker.addEventListener("pointermove", (e) => {
    if (start) moveTo(e.clientX - start.x, e.clientY - start.y);
  });
  const stop = () => {
    start = null;
    sticker.classList.remove("is-dragging");
  };
  sticker.addEventListener("pointerup", stop);
  sticker.addEventListener("pointercancel", stop);

  const keys = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] };
  sticker.addEventListener("keydown", (e) => {
    if (!keys[e.key]) return;
    e.preventDefault();
    moveTo(dx + keys[e.key][0], dy + keys[e.key][1]);
  });

  // New screen width: back to the centre (height changes too when a phone's URL bar hides on scroll)
  let width = innerWidth;
  window.addEventListener("resize", () => {
    if (innerWidth !== width) moveTo(0, 0);
    width = innerWidth;
  });
}

function initClock() {
  const el = document.querySelector("[data-clock]");
  if (!el) return;
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Rome" });
  const tick = () => (el.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 10_000);
}

/* ---------- Hero sticker tilt ---------- */
function initSticker() {
  const sticker = document.querySelector(".hero__sticker");
  if (!sticker || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.addEventListener("pointermove", (e) => {
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    sticker.style.setProperty("--ry", `${x * 24}deg`);
    sticker.style.setProperty("--rx", `${-y * 24}deg`);
    sticker.style.setProperty("--rz", `${-4 + x * 6}deg`);
  });
}

/* ---------- Lightbox: shared by the gallery and the case studies ----------
   items: [{ src, alt, meta (HTML for the caption) }], back(i): element that gets the focus on close */
function lightbox(items, back) {
  let box = document.querySelector(".lightbox");
  if (!box) {
    box = document.createElement("dialog");
    box.className = "lightbox";
    box.setAttribute("aria-label", "Image viewer");
    box.innerHTML = `
      <figure class="lightbox__figure">
        <img class="lightbox__img" alt="">
        <figcaption class="lightbox__caption">
          <span class="lightbox__meta"></span>
          <span class="lightbox__count small"></span>
        </figcaption>
      </figure>
      <button class="btn btn--icon lightbox__close" type="button" aria-label="Close">✕</button>
      <button class="btn btn--icon lightbox__prev" type="button" aria-label="Previous image">←</button>
      <button class="btn btn--icon lightbox__next" type="button" aria-label="Next image">→</button>`;
    document.body.append(box);
  }
  const img = box.querySelector(".lightbox__img");
  const metaEl = box.querySelector(".lightbox__meta");
  const count = box.querySelector(".lightbox__count");
  const many = items.length > 1;
  box.querySelectorAll(".lightbox__prev, .lightbox__next").forEach((b) => (b.hidden = !many));
  let index = 0;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const p = items[index];
    img.classList.add("is-swapping");
    const next = new Image();
    next.src = p.src;
    next.onload = () => {
      img.src = next.src;
      img.alt = p.alt || "";
      img.classList.remove("is-swapping");
    };
    metaEl.innerHTML = p.meta || "";
    count.textContent = many ? `${String(index + 1).padStart(2, "0")} / ${items.length}` : "";
  };

  box.querySelector(".lightbox__close").addEventListener("click", () => box.close());
  box.querySelector(".lightbox__prev").addEventListener("click", () => show(index - 1));
  box.querySelector(".lightbox__next").addEventListener("click", () => show(index + 1));
  box.addEventListener("click", (e) => { if (!e.target.closest(".lightbox__img, .btn")) box.close(); });
  // On the document: in Safari a click can leave the focus outside the dialog
  document.addEventListener("keydown", (e) => {
    if (!box.open || !many) return;
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
  box.addEventListener("close", () => back(index)?.focus());

  // Swipe on touch screens
  let x0 = null;
  box.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  box.addEventListener("touchend", (e) => {
    if (x0 === null || !many) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  return (i) => { show(i); box.showModal(); };
}

/* ---------- Gallery grid ---------- */
function initGallery() {
  const grid = document.querySelector(".gallery");
  const photos = window.GALLERY;
  if (!grid || !photos) return;

  const meta = (p) => [
    p.place && `<span class="tag">${p.place}</span>`,
    p.year && `<span class="tag">${p.year}</span>`,
  ].filter(Boolean).join("");

  grid.innerHTML = photos.map((p, i) => `
    <figure class="${p.wide ? "wide" : ""}">
      <button type="button" data-index="${i}" aria-label="Open photo${p.place ? ": " + p.place : ""}${p.year ? ", " + p.year : ""}">
        <img src="assets/gallery/${p.src}" alt="${p.alt || ""}" loading="lazy">
      </button>
      ${meta(p) ? `<figcaption>${meta(p)}</figcaption>` : ""}
    </figure>`).join("");

  const open = lightbox(
    photos.map((p) => ({ src: `assets/gallery/${p.src}`, alt: p.alt, meta: meta(p) })),
    (i) => grid.querySelector(`[data-index="${i}"]`)
  );
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-index]");
    if (btn) open(Number(btn.dataset.index));
  });
}

/* ---------- Case studies: every image in the body opens large ----------
   Left out: before/after sliders (they drag), persona portraits, material spheres and images inside links or buttons */
function initZoom() {
  const imgs = [...document.querySelectorAll(".cs-body img")]
    .filter((img) => !img.closest(".cs-compare, .cs-persona, .cs-materials, a, button, .hud, [data-no-zoom]"));
  if (!imgs.length) return;

  const caption = (img) => {
    const fig = img.closest("figure");
    const cap = fig && fig.querySelector(":scope > figcaption");
    return cap && !cap.classList.contains("cs-egg") ? `<span class="small">${cap.textContent.trim()}</span>` : "";
  };
  const open = lightbox(
    imgs.map((img) => ({ src: img.currentSrc || img.src, alt: img.alt, meta: caption(img) })),
    (i) => imgs[i]
  );
  imgs.forEach((img, i) => {
    img.classList.add("zoomable");
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `Enlarge image${img.alt ? ": " + img.alt : ""}`);
    img.addEventListener("click", () => open(i));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
    });
  });
}

/* ---------- Elettra: live head-up display, "Flow 2" in Figma (starts at node 1076:14) ---------- */
function initHud() {
  const hud = document.querySelector(".hud");
  if (!hud) return;
  const speed = hud.querySelector(".hud__speed");
  const label = hud.querySelector(".hud__label");
  // ms = transition into the state (Figma smart animate), hold = pause on it. bar and zone = % of their track, zone null = hidden
  const states = [
    { state: "power", label: "Power", speed: 76, bar: 52.9, zone: null, ms: 2000, hold: 500 },
    { state: "optimal", label: "Brake recuperation", speed: 75, bar: 52.6, zone: 43.3, ms: 300, hold: 0 },
    { state: "optimal", label: "Brake recuperation", speed: 49, bar: 39.6, zone: 29.9, ms: 1000, hold: 0, linear: true },
    { state: "optimal", label: "Brake recuperation", speed: 38, bar: 28.1, zone: 18.2, ms: 1000, hold: 500, linear: true },
    { state: "power", label: "Power", speed: 76, bar: 52.9, zone: null, ms: 1500, hold: 0 },
    { state: "optimal", label: "Brake recuperation", speed: 75, bar: 52.6, zone: 43.3, ms: 500, hold: 0, linear: true },
    { state: "improvable", label: "Brake", speed: 27, bar: 19.5, zone: 34.4, ms: 1500, hold: 1200 },
    { state: "improvable", label: "", speed: 0, bar: 0, zone: null, ms: 1000, hold: 500 },
  ];
  const draw = (s, text, labelOpacity, v, bar, zone, zoneOpacity) => {
    hud.dataset.state = s;
    label.textContent = text;
    label.style.opacity = labelOpacity;
    speed.textContent = Math.round(v);
    hud.style.setProperty("--bar", bar + "%");
    hud.style.setProperty("--zone", zone + "%");
    hud.style.setProperty("--zone-opacity", zoneOpacity);
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return draw("optimal", "Brake recuperation", 1, 38, 28.1, 18.2, 1);
  const easeOut = (k) => 1 - (1 - k) ** 2.4;
  const total = states.reduce((sum, s) => sum + s.ms + s.hold, 0);
  const frame = (time) => {
    let at = time, i = 0;
    for (; at >= states[i].ms + states[i].hold; i++) at -= states[i].ms + states[i].hold;
    const to = states[i], from = states[(i + states.length - 1) % states.length];
    const k = Math.min(at / to.ms, 1), e = to.linear ? k : easeOut(k);
    const lerp = (a, b) => a + (b - a) * e;
    const changed = from.label !== to.label; // the old label fades out, then the new one fades in
    const text = changed && k < 0.2 ? from.label : to.label;
    const labelOpacity = changed ? Math.abs(k - 0.2) / (k < 0.2 ? 0.2 : 0.3) : 1;
    const zone = to.zone !== null && from.zone !== null ? lerp(from.zone, to.zone) : to.zone ?? from.zone ?? 0;
    const zoneOpacity = to.zone === null ? (from.zone === null ? 0 : 1 - e) : from.zone === null ? e : 1;
    draw(to.state, text, Math.min(labelOpacity, 1), lerp(from.speed, to.speed), lerp(from.bar, to.bar), zone, zoneOpacity);
  };
  // Runs only while on screen, and starts from 0 the first time it is seen
  let clock = 0, last = 0, visible = false;
  frame(total - 1);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0.4 }).observe(hud);
  const loop = (t) => {
    if (visible) { clock = (clock + Math.min(t - last, 100)) % total; frame(clock); }
    last = t;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- ARERA: interface list + video ---------- */
function initFlows() {
  document.querySelectorAll("[data-flows]").forEach((root) => {
    const video = root.querySelector("video");
    const items = [...root.querySelectorAll(".cs-flows__item")];
    let current = 0;
    const show = (n) => {
      current = n;
      items.forEach((i, k) => {
        i.classList.toggle("is-active", k === n);
        i.setAttribute("aria-pressed", k === n);
      });
      video.src = items[n].dataset.video;
      video.setAttribute("aria-label", items[n].dataset.label);
      video.play().catch(() => {});
    };
    // sections play one after the other; a click jumps to that one and the sequence goes on from there
    video.addEventListener("ended", () => show((current + 1) % items.length));
    items.forEach((item, n) => item.addEventListener("click", () => show(n)));
  });
}

/* ---------- Draggable before/after ---------- */
function initCompare() {
  document.querySelectorAll("[data-compare]").forEach((root) => {
    const box = root.querySelector(".cs-compare__box");
    const input = root.querySelector("input");
    input.addEventListener("input", () => box.style.setProperty("--pos", input.value + "%"));
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("is-in"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  els.forEach((e) => io.observe(e));
}

renderChrome();
initMenu();
renderProjectNav();
initToc();
initClock();
initSticker();
initStickerDrag();
initGallery();
initZoom();
initHud();
initFlows();
initCompare();
initReveal();
