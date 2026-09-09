/* ============================================================
   SKYWARD AIRLINES — SHARED CHROME (header, footer, mobile nav)
   Every page includes this file plus data.js, then calls
   renderHeader() / renderFooter() into their containers.
   ============================================================ */

// Builds a wa.me deep link that opens WhatsApp with a pre-filled message.
// Used in place of a payment/contact backend: there is no server here,
// so "sending" a message means handing the visitor off to WhatsApp with
// the details already typed in.
function buildWhatsAppLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// Opens a WhatsApp link in a new tab; if the browser blocks the popup
// (common when triggered outside a direct click, or in strict privacy
// modes), falls back to redirecting the current tab so the message is
// never silently lost.
function openWhatsApp(link) {
  // Note: window.open must NOT be called with the "noopener" feature here —
  // that flag makes window.open always return null per spec, which would
  // make every call look "blocked" and wrongly redirect the current tab.
  let win = null;
  try { win = window.open(link, "_blank"); } catch (err) { win = null; }
  if (win) { win.opener = null; } // sever the opener link manually instead
  if (!win) window.location.href = link;
}

const NAV = {
  about: {
    label: "About Us", href: "about.html",
    groups: [
      { title: "Company", links: [
        ["Our Services", "services.html"],
        ["Our Fleet", "fleet.html"],
        ["Our Careers", "careers.html"],
        ["CSR", "csr.html"],
        ["Why Book Direct", "why-book-direct.html"]
      ]},
      { title: "Explore", links: [
        ["Our Magazine", "magazine.html"],
        ["Lounge", "lounge.html"],
        ["Fly Easy", "fly-easy.html"],
        ["Latest News", "news.html"],
        ["Advertise With Us", "advertise.html"],
        ["FAQs", "faq.html"]
      ]}
    ]
  },
  destinations: {
    label: "Destinations", href: "destinations.html", wide: true,
    groups: [
      { title: "Kenya — Coast", links: DESTINATIONS.filter(d => d.region === "Coast").map(d => [d.name, "destination.html?id=" + d.id]) },
      { title: "Kenya — Highlands & North", links: DESTINATIONS.filter(d => ["Highlands","Rift Valley","Northern Kenya","North Eastern Kenya","Lake Victoria"].includes(d.region)).map(d => [d.name, "destination.html?id=" + d.id]) },
      { title: "International", links: DESTINATIONS.filter(d => d.region === "International").map(d => [d.name, "destination.html?id=" + d.id]) }
    ]
  },
  travel: {
    label: "Travel Information", href: "travel-info.html",
    groups: [
      { title: "Policies", links: [
        ["Applicable Service Fees", "service-fees.html"],
        ["Ticket Policies", "ticket-policies.html"],
        ["Baggage Policy", "baggage-policy.html"],
        ["Travel Requirements & Documentation", "travel-requirements.html"],
        ["Dangerous Goods Policy", "dangerous-goods.html"]
      ]},
      { title: "Travelling with us", links: [
        ["Unaccompanied Minors", "unaccompanied-minors.html"],
        ["Expectant Mothers", "expectant-mothers.html"],
        ["Passengers with Special Needs", "special-needs.html"],
        ["Pet Carriage Policy", "pet-policy.html"],
        ["Children & Infants", "children-infants.html"]
      ]}
    ]
  },
  contact: { label: "Contact Us", href: "contact.html" }
};

function renderHeader(active) {
  const el = document.getElementById("site-header");
  if (!el) return;
  const overlayClass = active === "home" ? " header-overlay" : "";
  el.innerHTML = `
  <header class="site-header${overlayClass}" id="header">
    <div class="header-inner">
      <a href="index.html" class="logo">${logoLockupSwap()}</a>
      <nav class="desktop-nav">
        ${navItemHtml("about", active)}
        ${navItemHtml("destinations", active)}
        ${navItemHtml("travel", active)}
        <a href="contact.html" class="nav-link">Contact Us</a>
      </nav>
      <div class="header-actions">
        <a href="booking.html#search" class="btn btn-primary btn-sm">Book Now</a>
        <button class="hamburger" id="hamburgerBtn" aria-label="Open menu">
          <span></span><span></span><span></span>
          <span class="bar-overlay"></span><span class="bar-overlay"></span><span class="bar-overlay"></span>
        </button>
      </div>
    </div>
  </header>
  ${mobileNavHtml()}
  `;
  wireHeaderInteractions();
}

function logoMark(variant = "navy") {
  const src = variant === "white" ? "images/logo-mark-white.png" : "images/logo-mark-navy.png";
  return `<img class="logo-mark" src="${src}" alt="Skyward Airlines" width="34" height="34">`;
}

function logoLockup(variant = "navy") {
  const src = variant === "white" ? "images/logo-mark-white.png" : "images/logo-mark-navy.png";
  return `<span class="logo-stack ${variant}">
    <img class="logo-mark-stack" src="${src}" alt="Skyward Airlines" width="118" height="26">
    <span class="logo-text-stack">Skyward Airlines</span>
  </span>`;
}

// Renders both the navy and white logo lockups together; CSS shows whichever
// one fits the header's current state (transparent-over-hero vs. scrolled/solid).
function logoLockupSwap() {
  return `<span class="logo-solid">${logoLockup("navy")}</span><span class="logo-overlay">${logoLockup("white")}</span>`;
}

function navItemHtml(key, active) {
  const item = NAV[key];
  const isActive = active === key;
  return `
  <div class="nav-item">
    <button class="nav-link" type="button" aria-expanded="false" data-nav="${key}">
      ${item.label}<span class="caret"></span>
    </button>
    <div class="dropdown ${item.wide ? "wide" : ""}">
      ${item.groups.map(g => `
        <div>
          <div style="font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;padding:8px 12px 4px;">${g.title}</div>
          ${g.links.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
        </div>
      `).join("")}
    </div>
  </div>`;
}

function mobileNavHtml() {
  const sections = ["about", "destinations", "travel"].map(key => {
    const item = NAV[key];
    const allLinks = item.groups.flatMap(g => g.links);
    return `
    <div class="mobile-acc">
      <button class="mobile-acc-btn" data-macc>${item.label}<span class="accordion-plus">+</span></button>
      <div class="mobile-acc-panel">
        ${allLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
      </div>
    </div>`;
  }).join("");
  return `
  <div class="mobile-nav-panel" id="mobileNav">
    <div class="mobile-nav-head">
      <a href="index.html" class="logo">${logoLockup("navy")}</a>
      <button class="close-x" id="mobileNavClose" aria-label="Close menu">&times;</button>
    </div>
    <div class="mobile-nav-body">
      ${sections}
      <a href="contact.html" style="display:block;padding:16px 8px;font-weight:700;font-size:16px;color:var(--navy-dark);border-bottom:1px solid var(--border);">Contact Us</a>
    </div>
    <div class="mobile-nav-cta"><a href="booking.html#search" class="btn btn-primary btn-block">Book Now</a></div>
  </div>`;
}

function wireHeaderInteractions() {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = btn.closest(".nav-item");
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".nav-item.open").forEach(i => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
  document.addEventListener("click", () => document.querySelectorAll(".nav-item.open").forEach(i => i.classList.remove("open")));

  const hamburger = document.getElementById("hamburgerBtn");
  const mobileNav = document.getElementById("mobileNav");
  const closeBtn = document.getElementById("mobileNavClose");
  if (hamburger) hamburger.addEventListener("click", () => mobileNav.classList.add("open"));
  if (closeBtn) closeBtn.addEventListener("click", () => mobileNav.classList.remove("open"));
  document.querySelectorAll("[data-macc]").forEach(btn => {
    btn.addEventListener("click", () => btn.closest(".mobile-acc").classList.toggle("open"));
  });

  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 8) header.classList.add("scrolled"); else header.classList.remove("scrolled");
  });
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="index.html" class="logo">${logoLockup("white")}</a>
          <p>Skyward Airlines connects East Africa's cities, coastlines and frontier towns with reliable regional flying, straightforward fares and genuinely helpful service.</p>
          <div class="social-row">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Instagram">ig</a>
            <a href="#" aria-label="X">x</a>
            <a href="#" aria-label="LinkedIn">in</a>
          </div>
        </div>
        <div class="footer-cols">
          <div class="footer-col">
            <h5>Where We Fly</h5>
            ${DESTINATIONS.slice(0,6).map(d => `<a href="destination.html?id=${d.id}">${d.name}</a>`).join("")}
            <a href="destinations.html">View all destinations</a>
          </div>
          <div class="footer-col">
            <h5>Travel Information</h5>
            <a href="baggage-policy.html">Baggage Policy</a>
            <a href="ticket-policies.html">Ticket Policies</a>
            <a href="travel-requirements.html">Travel Requirements</a>
            <a href="special-needs.html">Special Assistance</a>
            <a href="faq.html">FAQs</a>
          </div>
          <div class="footer-col">
            <h5>Services</h5>
            <a href="lounge.html">Lounge Access</a>
            <a href="baggage-extra.html">Extra Baggage</a>
            <a href="parcels.html">Parcel Services</a>
            <a href="charter.html">Charter Services</a>
          </div>
          <div class="footer-col">
            <h5>About Us</h5>
            <a href="about.html">Our Story</a>
            <a href="fleet.html">Our Fleet</a>
            <a href="careers.html">Careers</a>
            <a href="csr.html">CSR</a>
            <a href="contact.html">Contact</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div><a href="terms.html">Terms & Conditions</a><a href="privacy.html">Privacy Policy</a><a href="careers.html">Careers</a><a href="contact.html">Travel Agency</a></div>
        <div>&copy; 2026 Skyward Airlines. All rights reserved.</div>
      </div>
    </div>
  </footer>`;
}

/* -------- Newsletter form (shared) -------- */
function wireNewsletter(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    form.innerHTML = `<span class="newsletter-success">You're subscribed — thank you for joining Skyward Airlines news.</span>`;
  });
}

/* -------- Generic accordion wiring -------- */
function wireAccordions(selector = ".accordion-item") {
  document.querySelectorAll(selector).forEach(item => {
    const btn = item.querySelector(".accordion-btn");
    btn.addEventListener("click", () => item.classList.toggle("open"));
  });
}

/* -------- Hero decorative SVG (original generated imagery) -------- */
function heroSvg() {
  return `
  <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1D5D9B"/>
        <stop offset="55%" stop-color="#3E8FCC"/>
        <stop offset="100%" stop-color="#8FC3E8"/>
      </linearGradient>
      <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#C77D26"/>
        <stop offset="100%" stop-color="#8C4A2F"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="700" fill="url(#sky)"/>
    <circle cx="980" cy="140" r="70" fill="#F3D9A4" opacity="0.9"/>
    <ellipse cx="200" cy="620" rx="700" ry="140" fill="url(#land)" opacity="0.85"/>
    <ellipse cx="900" cy="660" rx="650" ry="120" fill="#0B2545" opacity="0.35"/>
    <g opacity="0.9">
      <path d="M300 260 L520 250 L560 235 L610 240 L570 258 L520 268 L440 300 L400 296 Z" fill="#F5F7FA"/>
      <path d="M470 252 L470 200 L500 246 Z" fill="#EAF3FB"/>
    </g>
    <g opacity="0.5">
      <ellipse cx="150" cy="150" rx="60" ry="18" fill="white"/>
      <ellipse cx="220" cy="165" rx="80" ry="20" fill="white"/>
      <ellipse cx="850" cy="330" rx="90" ry="22" fill="white"/>
    </g>
  </svg>`;
}

function destPhotoSvg(dest) {
  if (dest && dest.image) {
    return `<img class="photo-block" src="${dest.image}" alt="${dest.name || ""}" loading="lazy">`;
  }
  const gradClass = (dest && dest.thumb) || dest || "grad-navy";
  return `<div class="photo-block ${gradClass}"></div>`;
}

// -------- Homepage hero photo carousel --------
// Slides already exist in the markup (so the hero shows a photo immediately,
// even before this runs); this just cycles which one is active and builds
// clickable dots. Auto-advances every 5s and resets the timer on manual clicks.
function initHeroCarousel(intervalMs = 5000) {
  const root = document.getElementById("heroCarousel");
  const dotsEl = document.getElementById("heroDots");
  if (!root) return;
  const slides = Array.from(root.querySelectorAll(".hero-slide"));
  if (slides.length <= 1) return;
  let active = Math.max(0, slides.findIndex(s => s.classList.contains("active")));
  if (active === -1) active = 0;
  let timer = null;

  function show(i) {
    slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
    if (dotsEl) Array.from(dotsEl.children).forEach((d, idx) => d.classList.toggle("active", idx === i));
    active = i;
  }
  function next() { show((active + 1) % slides.length); }
  function restart() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, intervalMs);
  }

  if (dotsEl) {
    dotsEl.innerHTML = slides.map((_, i) => `<button aria-label="Show slide ${i+1}" class="${i===active?'active':''}"></button>`).join("");
    Array.from(dotsEl.children).forEach((d, i) => d.addEventListener("click", () => { show(i); restart(); }));
  }
  restart();
}

// Generic media block helper: renders a real photo when imagePath is given,
// otherwise falls back to the original gradient placeholder block.
function mediaBlock(imagePath, gradClass, alt, extraStyle) {
  const style = extraStyle ? ` style="${extraStyle}"` : "";
  if (imagePath) {
    return `<img class="photo-block" src="${imagePath}" alt="${alt || ""}" loading="lazy"${style}>`;
  }
  return `<div class="photo-block ${gradClass}"${style}></div>`;
}
