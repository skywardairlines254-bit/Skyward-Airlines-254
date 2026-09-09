/* ============================================================
   SKYWARD AIRLINES — GENERIC INFO PAGE RENDERER
   Thin HTML files call renderInfoPage('slug') to build a
   consistent policy/about page from js/content.js data.
   ============================================================ */

function renderInfoPage(slug) {
  const data = INFO_PAGES[slug];
  if (!data) return;
  document.title = data.title + " | Skyward Airlines";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", data.intro || data.title);

  let bodyHtml = `<p style="font-size:17px;color:var(--muted);max-width:680px;">${data.intro || ""}</p>`;

  if (data.callout && !data.table && !data.accordions) {
    bodyHtml += `<div class="callout">${data.callout}</div>`;
  }

  if (data.table) {
    bodyHtml += `<table class="policy-table"><thead><tr>${data.table.headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${data.table.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    if (data.callout) bodyHtml += `<div class="callout">${data.callout}</div>`;
  }

  if (data.accordions) {
    bodyHtml += `<div style="max-width:760px;margin-top:${data.table ? '32px':'8px'};">` + data.accordions.map(item => `
      <div class="accordion-item">
        <button class="accordion-btn">${item.q}<span class="accordion-plus">+</span></button>
        <div class="accordion-panel"><p>${item.a}</p></div>
      </div>`).join("") + `</div>`;
    if (data.callout && data.table) bodyHtml += ``; // already shown above
    else if (data.callout) bodyHtml += `<div class="callout">${data.callout}</div>`;
  }

  if (data.cards) {
    bodyHtml += `<div class="card-grid grid-3" style="margin-top:24px;">` + data.cards.map(([t, d]) => `
      <div class="promo-card"><h4>${t}</h4><p>${d}</p></div>`).join("") + `</div>`;
    if (data.callout) bodyHtml += `<div class="callout">${data.callout}</div>`;
  }

  document.getElementById("app").innerHTML = `
    <div class="page-hero">
      <div class="container">
        <div class="breadcrumb"><a href="index.html">Home</a> / ${data.crumb} / ${data.title}</div>
        <h1 style="color:white;font-size:clamp(26px,4vw,38px);">${data.title}</h1>
      </div>
    </div>
    <section class="section">
      <div class="container">${bodyHtml}</div>
    </section>
  `;
  wireAccordions();
}
