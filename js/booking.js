/* ============================================================
   SKYWARD AIRLINES — BOOKING FUNNEL
   A single stateful flow: results -> details -> passengers ->
   seats -> extras -> summary -> enquiry -> confirmation.
   Nothing is sent to a server (per spec, payment/back-end is
   out of scope) — instead the flow ends with a WhatsApp handoff.

   Refresh safety: the whole `state` object is mirrored to
   sessionStorage on every change and restored on load, so
   reloading mid-flow (or the browser restoring the tab) resumes
   exactly where the visitor left off instead of resetting to
   step one. Storage access is wrapped in try/catch everywhere —
   if it's unavailable (private browsing, disabled storage) the
   flow still works, it just won't survive a refresh.
   ============================================================ */

const STEPS = ["results", "details", "passengers", "seats", "extras", "summary", "enquiry"];
const STEP_LABELS = ["Flights", "Details", "Passengers", "Seats", "Extras", "Review", "Contact Us"];
const STORAGE_KEY = "skywardBookingState";

const params = new URLSearchParams(window.location.search);
const state = {
  search: {
    from: params.get("from") || "NBO",
    to: params.get("to") || "MBA",
    dep: params.get("dep") || new Date(Date.now() + 3*86400000).toISOString().slice(0,10),
    ret: params.get("ret") || "",
    trip: params.get("trip") || "oneway",
    adults: parseInt(params.get("adults")) || 1,
    children: parseInt(params.get("children")) || 0,
    infants: parseInt(params.get("infants")) || 0,
    cabin: params.get("cabin") || "Economy"
  },
  filters: { morning: true, afternoon: true, evening: true, direct: true, aircraft: new Set(), maxPrice: 17000 },
  sort: "price",
  selectedFlight: null,
  selectedReturnFlight: null,
  // Only meaningful when search.trip === "return": which leg the results
  // step is currently letting the visitor choose.
  tripPhase: "outbound",
  passengers: [],
  seats: {}, // passengerIndex -> seatId
  occupiedSeats: [], // seats taken by other passengers, fixed once generated so it survives a refresh
  extras: { extraBags: 0, lounge: 0, parcel: false },
  step: "results",
  confRef: null,
  whatsappLink: null
};

let currentResults = [];
let currentReturnResults = [];

function paxTotal() { return state.search.adults + state.search.children + state.search.infants; }
function paxCount() { return state.search.adults + state.search.children; } // infants don't get seats

/* ---------------- Persistence (refresh-safety) ---------------- */
function saveState() {
  try {
    const snapshot = JSON.stringify(state, (k, v) => (v instanceof Set ? Array.from(v) : v));
    sessionStorage.setItem(STORAGE_KEY, snapshot);
  } catch (e) { /* storage unavailable — never let this break the flow */ }
}

function loadSavedState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearSavedState() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
}

function init() {
  renderHeader();
  renderFooter();
  buildAircraftFilter();

  const saved = loadSavedState();
  const isSameSearch = saved && saved.search &&
    saved.search.from === state.search.from &&
    saved.search.to === state.search.to &&
    saved.search.dep === state.search.dep;

  if (isSameSearch) {
    Object.assign(state, saved);
    state.filters.aircraft = new Set(saved.filters.aircraft || []);
    document.querySelectorAll("[data-filter-aircraft]").forEach(cb => {
      cb.checked = state.filters.aircraft.has(cb.dataset.filterAircraft);
    });
    document.getElementById("priceRange").value = state.filters.maxPrice;
    document.getElementById("priceRangeLabel").textContent = "Up to " + formatPrice(state.filters.maxPrice);
  } else {
    clearSavedState();
  }

  runSearch();
  wireGlobalHandlers();

  if (state.step === "confirmation" && state.confRef) {
    showConfirmation(state.confRef, state.whatsappLink);
  } else {
    goTo(state.step || "results");
  }
}

/* ---------------- Progress rail ---------------- */
function renderProgress() {
  const rail = document.getElementById("progressRail");
  const idx = STEPS.indexOf(state.step);
  rail.innerHTML = STEPS.map((s, i) => {
    const cls = i < idx ? "done" : i === idx ? "active" : "";
    const dot = i < idx ? "✓" : i + 1;
    return `<div class="progress-step ${cls}"><div class="progress-dot">${dot}</div><span class="progress-label">${STEP_LABELS[i]}</span></div>${i < STEPS.length-1 ? '<div class="progress-line"></div>' : ''}`;
  }).join("");
}

function goTo(step) {
  state.step = step;
  document.querySelectorAll('[id^="step-"]').forEach(el => el.classList.add("hidden"));
  document.getElementById("step-" + step).classList.remove("hidden");
  renderProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
  const renderers = { results: renderResults, details: renderDetails, passengers: renderPassengers, seats: renderSeats, extras: renderExtras, summary: renderSummary, enquiry: renderEnquiry };
  if (renderers[step]) renderers[step]();
  saveState();
}

// Shows the confirmation screen directly — used both right after a fresh
// WhatsApp handoff and when a refresh restores a completed session.
function showConfirmation(ref, link) {
  document.querySelectorAll('[id^="step-"]').forEach(el => el.classList.add("hidden"));
  document.getElementById("step-confirmation").classList.remove("hidden");
  document.getElementById("confRef").textContent = ref;
  const waLink = document.getElementById("confWhatsappLink");
  if (waLink) waLink.href = link || "#";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------- STEP 1: RESULTS ---------------- */
function runSearch() {
  currentResults = routesBetween(state.search.from, state.search.to);
  currentReturnResults = state.search.trip === "return" ? routesBetween(state.search.to, state.search.from) : [];
}

// Whether the results step is currently showing the return leg (only
// possible for round trips, after the outbound flight has been chosen).
function onReturnLeg() { return state.search.trip === "return" && state.tripPhase === "return"; }
function activeRawResults() { return onReturnLeg() ? currentReturnResults : currentResults; }

function buildAircraftFilter() {
  const types = [...new Set(ROUTES.map(r => r.aircraft))];
  document.getElementById("aircraftFilterGroup").innerHTML = "<h5>Aircraft</h5>" + types.map(t =>
    `<label><input type="checkbox" data-filter-aircraft="${t}" checked> ${t}</label>`).join("");
  types.forEach(t => state.filters.aircraft.add(t));
  const maxP = Math.max(...ROUTES.map(r => r.price));
  document.getElementById("priceRange").max = maxP;
  document.getElementById("priceRange").value = maxP;
  state.filters.maxPrice = maxP;
  document.getElementById("priceRangeLabel").textContent = "Up to " + formatPrice(maxP);
}

function timeBand(t) {
  const h = parseInt(t.split(":")[0]);
  if (h < 12) return "morning"; if (h < 17) return "afternoon"; return "evening";
}

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// No direct flight for this pair — see if a same-day connection through the
// Nairobi hub works, allowing at least a 45-minute layover.
function findConnectionViaNairobi(from, to) {
  if (from === "NBO" || to === "NBO") return null;
  const legAOptions = routesBetween(from, "NBO").slice().sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  const legBOptions = routesBetween("NBO", to).slice().sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  if (!legAOptions.length || !legBOptions.length) return null;
  const MIN_CONNECTION_MINS = 45;
  for (const legA of legAOptions) {
    const legB = legBOptions.find(f => timeToMinutes(f.departureTime) >= timeToMinutes(legA.arrivalTime) + MIN_CONNECTION_MINS);
    if (legB) return { legA, legB };
  }
  return { legA: legAOptions[0], legB: legBOptions[0] }; // no same-day gap works out — offer earliest of each anyway
}

function flightCardHtml(r) {
  return `
    <div class="flight-card">
      <div class="flight-endpoints">
        <div><div class="fe-time">${r.departureTime}</div><div class="fe-code">${r.originAirport.city} (${r.origin})</div></div>
        <div class="fe-mid"><div>${r.duration}</div><div class="line"></div><div>Direct</div></div>
        <div><div class="fe-time">${r.arrivalTime}</div><div class="fe-code">${r.destinationAirport.city} (${r.destination})</div></div>
      </div>
      <div class="flight-meta">
        <div><strong>${r.flightNumber}</strong>Flight</div>
        <div><strong>${r.aircraft}</strong>Aircraft</div>
        <div><strong>5</strong>Seats left</div>
      </div>
      <div class="flight-price-col">
        <div class="fare-price">${formatPrice(r.price)}</div>
        <div class="muted" style="font-size:12px;margin-bottom:8px;">per passenger</div>
        <button class="btn btn-primary btn-sm" data-select="${r.id}">Select</button>
      </div>
    </div>`;
}

function wireSelectButtons() {
  document.querySelectorAll("[data-select]").forEach(btn => {
    btn.addEventListener("click", () => {
      const flight = ROUTES.find(r => r.id === btn.dataset.select);
      if (state.search.trip === "return" && state.tripPhase !== "return") {
        // Outbound leg chosen — now ask for the return leg before moving on.
        state.selectedFlight = flight;
        state.tripPhase = "return";
        saveState();
        renderResults();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (state.search.trip === "return") {
        state.selectedReturnFlight = flight;
      } else {
        state.selectedFlight = flight;
      }
      buildPassengerSkeleton();
      saveState();
      goTo("details");
    });
  });
}

function applyFiltersAndSort() {
  let list = activeRawResults().filter(r => {
    if (!state.filters[timeBand(r.departureTime)]) return false;
    if (!state.filters.aircraft.has(r.aircraft)) return false;
    if (r.price > state.filters.maxPrice) return false;
    return true;
  });
  list.sort((a, b) => {
    if (state.sort === "price") return a.price - b.price;
    if (state.sort === "departure") return a.departureTime.localeCompare(b.departureTime);
    if (state.sort === "duration") return a.duration.localeCompare(b.duration);
    return 0;
  });
  return list;
}

function renderResults() {
  const isReturnTrip = state.search.trip === "return";
  const onReturn = onReturnLeg();
  const legFrom = onReturn ? state.search.to : state.search.from;
  const legTo = onReturn ? state.search.from : state.search.to;
  const legDate = onReturn ? state.search.ret : state.search.dep;
  const o = airport(legFrom), d = airport(legTo);

  const heading = document.getElementById("resultsHeading");
  if (heading) heading.textContent = !isReturnTrip ? "Select Your Flight" : (onReturn ? "Select Your Return Flight" : "Select Your Outbound Flight");

  document.getElementById("searchSummaryText").textContent =
    `${o.city} (${o.code}) → ${d.city} (${d.code}) · ${formatDate(legDate)} · ${paxTotal()} passenger${paxTotal()>1?"s":""} · ${isReturnTrip ? "Round trip" : "One way"}${isReturnTrip ? (onReturn ? " · Return flight" : " · Outbound flight") : ""}`;

  document.getElementById("resultsSortBar").innerHTML = `
    <span class="muted" style="font-size:13px;font-weight:700;">Sort:</span>
    ${["price","departure","duration"].map(s => `<button class="btn btn-sm ${state.sort===s?'btn-navy':'btn-outline'}" data-sort="${s}">${s==='price'?'Price':s==='departure'?'Departure':'Duration'}</button>`).join("")}
  `;
  document.querySelectorAll("[data-sort]").forEach(b => b.addEventListener("click", () => { state.sort = b.dataset.sort; renderResults(); saveState(); }));

  const listEl = document.getElementById("resultsList");
  if (activeRawResults().length === 0) {
    const conn = findConnectionViaNairobi(legFrom, legTo);
    if (conn) {
      listEl.innerHTML = `
        <div class="callout amber">No direct flights for this route. Here's a suggested connection via Nairobi (NBO):</div>
        <p class="muted" style="font-size:13px;font-weight:700;margin:16px 0 8px;">Leg 1 · ${conn.legA.originAirport.city} → Nairobi</p>
        ${flightCardHtml(conn.legA)}
        <p class="muted" style="font-size:13px;font-weight:700;margin:16px 0 8px;">Leg 2 · Nairobi → ${conn.legB.destinationAirport.city}</p>
        ${flightCardHtml(conn.legB)}
      `;
    } else {
      listEl.innerHTML = `<div class="callout amber">No flights available for this route.</div>`;
    }
    wireSelectButtons();
    return;
  }
  const list = applyFiltersAndSort();
  if (list.length === 0) {
    listEl.innerHTML = `<div class="callout amber">No flights match your filters. Try widening your filter selection.</div>`;
    return;
  }
  listEl.innerHTML = list.map(flightCardHtml).join("");

  wireSelectButtons();

  document.querySelectorAll("[data-filter-time]").forEach(cb => cb.addEventListener("change", () => { state.filters[cb.dataset.filterTime] = cb.checked; renderResults(); saveState(); }));
  document.querySelectorAll("[data-filter-aircraft]").forEach(cb => cb.addEventListener("change", () => {
    if (cb.checked) state.filters.aircraft.add(cb.dataset.filterAircraft); else state.filters.aircraft.delete(cb.dataset.filterAircraft);
    renderResults();
    saveState();
  }));
  document.getElementById("priceRange").addEventListener("input", (e) => {
    state.filters.maxPrice = parseInt(e.target.value);
    document.getElementById("priceRangeLabel").textContent = "Up to " + formatPrice(state.filters.maxPrice);
    renderResults();
    saveState();
  });
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

/* ---------------- STEP 2: FLIGHT DETAILS ---------------- */
function flightCardBlock(flight, label) {
  return `
    ${label ? `<p class="muted" style="font-size:13px;font-weight:700;margin:0 0 8px;">${label}</p>` : ""}
    <div class="flight-card mb-24">
      <div class="flight-endpoints">
        <div><div class="fe-time">${flight.departureTime}</div><div class="fe-code">${flight.originAirport.city} (${flight.origin})</div></div>
        <div class="fe-mid"><div>${flight.duration}</div><div class="line"></div><div>Direct</div></div>
        <div><div class="fe-time">${flight.arrivalTime}</div><div class="fe-code">${flight.destinationAirport.city} (${flight.destination})</div></div>
      </div>
    </div>`;
}

function fareRowsBlock(flight, label) {
  return `
    ${label ? `<div class="summary-line" style="font-weight:800;color:var(--navy-dark);"><span>${label}</span><span></span></div>` : ""}
    <div class="summary-line"><span>${state.search.adults} Adult × ${formatPrice(flight.price)}</span><strong>${formatPrice(flight.price * state.search.adults)}</strong></div>
    ${state.search.children ? `<div class="summary-line"><span>${state.search.children} Child × ${formatPrice(flight.price)}</span><strong>${formatPrice(flight.price * state.search.children)}</strong></div>` : ""}
    ${state.search.infants ? `<div class="summary-line"><span>${state.search.infants} Infant × ${formatPrice(flight.price*0.1)}</span><strong>${formatPrice(flight.price*0.1*state.search.infants)}</strong></div>` : ""}
  `;
}

function renderDetails() {
  const r = state.selectedFlight;
  const rr = state.search.trip === "return" ? state.selectedReturnFlight : null;
  document.getElementById("detailsMain").innerHTML = `
    ${flightCardBlock(r, rr ? "Outbound" : "")}
    ${rr ? flightCardBlock(rr, "Return") : ""}
    <div class="card-grid grid-2 mb-24">
      <div class="promo-card"><h4>Flight</h4><p>${r.flightNumber}${rr ? " / " + rr.flightNumber : ""} · ${r.aircraft} · ${r.frequency}</p></div>
      <div class="promo-card"><h4>Baggage</h4><p>15kg checked, 5kg cabin included. Extra baggage available on the next steps.</p></div>
      <div class="promo-card"><h4>Fare Conditions</h4><p>Changes permitted for a fee plus fare difference. Refunds subject to fare rules.</p></div>
      <div class="promo-card"><h4>Available Extras</h4><p>Extra legroom seating, additional baggage and lounge access.</p></div>
    </div>
  `;
  document.getElementById("detailsFareBody").innerHTML = rr
    ? fareRowsBlock(r, "Outbound") + fareRowsBlock(rr, "Return")
    : fareRowsBlock(r, "");
  document.getElementById("detailsFareTotal").innerHTML = `<span>Total</span><span>${formatPrice(baseFareTotal())}</span>`;
}

// Fare for one flight leg, scaled by passenger mix (infants at 10% of the fare).
function legFareTotal(flight) {
  if (!flight) return 0;
  return flight.price * state.search.adults + flight.price * state.search.children + flight.price * 0.1 * state.search.infants;
}

function baseFareTotal() {
  let total = legFareTotal(state.selectedFlight);
  if (state.search.trip === "return") total += legFareTotal(state.selectedReturnFlight);
  return total;
}

/* ---------------- STEP 3: PASSENGERS ---------------- */
function buildPassengerSkeleton() {
  const total = paxTotal();
  state.passengers = Array.from({ length: total }, (_, i) => ({
    type: i < state.search.adults ? "Adult" : i < state.search.adults + state.search.children ? "Child" : "Infant",
    title: "", firstName: "", middleName: "", lastName: "", dob: "", gender: "", nationality: "", idNumber: "", phone: "", email: ""
  }));
}

function renderPassengers() {
  document.getElementById("passengerForms").innerHTML = state.passengers.map((p, i) => `
    <div class="passenger-form">
      <div class="flex-between"><h4 style="font-size:16px;">Passenger ${i+1} — ${p.type}</h4><span class="pill">${p.type}</span></div>
      <div class="form-grid">
        <div class="form-field"><label>Title (optional)</label>
          <select data-p="${i}" data-f="title">
            <option value="">Select</option><option>Mr</option><option>Mrs</option><option>Ms</option><option>Dr</option>${p.type!=='Adult'?'<option>Master</option><option>Miss</option>':''}
          </select></div>
        <div class="form-field"><label>First Name</label><input data-p="${i}" data-f="firstName" type="text"></div>
        <div class="form-field"><label>Middle Name (optional)</label><input data-p="${i}" data-f="middleName" type="text"></div>
        <div class="form-field"><label>Last Name</label><input data-p="${i}" data-f="lastName" type="text"></div>
        <div class="form-field"><label>Date of Birth (optional)</label><input data-p="${i}" data-f="dob" type="date"></div>
        <div class="form-field"><label>Gender</label>
          <select data-p="${i}" data-f="gender"><option value="">Select</option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></div>
        <div class="form-field"><label>Nationality (optional)</label><input data-p="${i}" data-f="nationality" type="text" placeholder="e.g. Kenyan"></div>
        <div class="form-field"><label>ID / Passport Number (optional)</label><input data-p="${i}" data-f="idNumber" type="text"></div>
        ${p.type === "Adult" ? `<div class="form-field"><label>Phone</label><input data-p="${i}" data-f="phone" type="tel"></div>` : ""}
        ${i === 0 ? `
        <div class="form-field"><label>Email (optional)</label><input data-p="${i}" data-f="email" type="email"></div>` : ""}
      </div>
    </div>`).join("");

  document.querySelectorAll("#passengerForms [data-p]").forEach(input => {
    input.addEventListener("input", () => {
      state.passengers[input.dataset.p][input.dataset.f] = input.value;
      input.closest(".form-field").classList.remove("error");
      renderSidebarSummary();
      saveState();
    });
  });
  renderSidebarSummary();
}

function renderSidebarSummary() {
  const r = state.selectedFlight;
  const rr = state.search.trip === "return" ? state.selectedReturnFlight : null;
  document.getElementById("sidebarSummary").innerHTML = `
    <div class="summary-head"><h4>Trip Summary</h4></div>
    <div class="summary-body">
      <div class="summary-line"><span>Route</span><strong>${r.origin} → ${r.destination}${rr ? " → " + rr.destination : ""}</strong></div>
      <div class="summary-line"><span>${rr ? "Outbound Date" : "Date"}</span><strong>${formatDate(state.search.dep)}</strong></div>
      <div class="summary-line"><span>${rr ? "Outbound Flight" : "Flight"}</span><strong>${r.flightNumber}</strong></div>
      ${rr ? `<div class="summary-line"><span>Return Date</span><strong>${formatDate(state.search.ret)}</strong></div>
      <div class="summary-line"><span>Return Flight</span><strong>${rr.flightNumber}</strong></div>` : ""}
      <div class="summary-line"><span>Passengers</span><strong>${paxTotal()}</strong></div>
    </div>
    <div class="summary-total"><span>Fare Total</span><span>${formatPrice(baseFareTotal())}</span></div>
  `;
}

function validatePassengers() {
  let ok = true;
  document.querySelectorAll("#passengerForms [data-p]").forEach(input => {
    const p = state.passengers[input.dataset.p];
    const f = input.dataset.f;
    // Only names, gender and (for adults) a phone number are required to
    // proceed — everything else is optional and can be completed later.
    const required = ["firstName","lastName","gender"].includes(f) || (f === "phone" && p.type === "Adult");
    if (required && !p[f]) { input.closest(".form-field").classList.add("error"); ok = false; }
  });
  return ok;
}

/* ---------------- STEP 4: SEATS ---------------- */
const ROWS = 18, COLS = ["A","B","C","D"];
let occupiedSeats = new Set();
function generateOccupied() {
  // Reuse the layout already generated for this booking, if any, so the
  // seat map doesn't reshuffle every time this renders — and so a page
  // refresh doesn't make a previously-selected seat look taken by someone else.
  if (state.occupiedSeats && state.occupiedSeats.length) {
    occupiedSeats = new Set(state.occupiedSeats);
    return;
  }
  occupiedSeats = new Set();
  const seedCount = 14;
  for (let i = 0; i < seedCount; i++) {
    const row = 1 + Math.floor(Math.random() * ROWS);
    const col = COLS[Math.floor(Math.random() * COLS.length)];
    occupiedSeats.add(row + col);
  }
  state.occupiedSeats = Array.from(occupiedSeats);
  saveState();
}

function seatType(row) {
  if (row === 1 || row === 2) return "premium";
  if (row === 3 || row === 4) return "extra";
  return "available";
}
function seatSurcharge(type) { return type === "premium" ? 2200 : type === "extra" ? 800 : 0; }

let activeSeatPax = 0;
function renderSeats() {
  generateOccupied();
  document.getElementById("seatPaxTabs").innerHTML = state.passengers.filter(p=>p.type!=="Infant").map((p,i) =>
    `<button class="${i===activeSeatPax?'active':''}" data-seatpax="${i}">Passenger ${i+1}${p.firstName?': '+p.firstName:''}</button>`).join("");
  document.querySelectorAll("[data-seatpax]").forEach(b => b.addEventListener("click", () => { activeSeatPax = parseInt(b.dataset.seatpax); renderSeats(); }));

  let html = "";
  for (let row = 1; row <= ROWS; row++) {
    html += `<div class="seat-row"><span class="row-num">${row}</span>`;
    COLS.forEach((col, ci) => {
      const seatId = row + col;
      const type = seatType(row);
      const isOccupied = occupiedSeats.has(seatId);
      const isSelectedByMe = state.seats[activeSeatPax] === seatId;
      const isSelectedByOther = Object.entries(state.seats).some(([k,v]) => v === seatId && parseInt(k) !== activeSeatPax);
      let cls = isOccupied || isSelectedByOther ? "occupied" : isSelectedByMe ? "selected" : type;
      html += `<button class="seat ${cls}" data-seat="${seatId}" ${isOccupied||isSelectedByOther?"disabled":""}>${seatId}</button>`;
      if (ci === 1) html += `<span class="aisle-gap"></span>`;
    });
    html += `</div>`;
  }
  document.getElementById("cabinMap").innerHTML = html;
  document.querySelectorAll("[data-seat]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.seats[activeSeatPax] = btn.dataset.seat;
      renderSeats();
      renderSeatSidebar();
      saveState();
    });
  });
  renderSeatSidebar();
}

function validateSeats() {
  const seatEligible = state.passengers.filter(p => p.type !== "Infant");
  const missing = seatEligible.some((p, i) => !state.seats[i]);
  return !missing;
}

function seatsFareTotal() {
  let sum = 0;
  Object.values(state.seats).forEach(seatId => {
    const row = parseInt(seatId);
    sum += seatSurcharge(seatType(row));
  });
  return sum;
}

function renderSeatSidebar() {
  const lines = state.passengers.filter(p=>p.type!=="Infant").map((p, i) => {
    const seat = state.seats[i];
    return `<div class="summary-line"><span>Passenger ${i+1}${p.firstName?': '+p.firstName:''}</span><strong>${seat || "Not selected"}</strong></div>`;
  }).join("");
  document.getElementById("seatSidebar").innerHTML = `
    <div class="summary-head"><h4>Seat Selection</h4></div>
    <div class="summary-body">${lines}
      <div class="summary-line"><span>Seat fees</span><strong>${formatPrice(seatsFareTotal())}</strong></div>
    </div>
    <div class="summary-total"><span>Running Total</span><span>${formatPrice(baseFareTotal() + seatsFareTotal())}</span></div>
  `;
}

/* ---------------- STEP 5: EXTRAS ---------------- */
function renderExtras() {
  document.getElementById("extrasList").innerHTML = `
    <div class="extra-row">
      <div class="extra-row-left"><div class="extra-icon">🧳</div><div><div class="extra-title">Extra Baggage</div><div class="extra-desc">KSh 1,200 per additional 5kg bag</div></div></div>
      <div class="qty-control"><button data-extra="extraBags" data-d="-1">–</button><span id="extraBagsCount">${state.extras.extraBags}</span><button data-extra="extraBags" data-d="1">+</button></div>
    </div>
    <div class="extra-row">
      <div class="extra-row-left"><div class="extra-icon">🛋</div><div><div class="extra-title">Lounge Access</div><div class="extra-desc">KSh 2,500 per passenger, per departure lounge visit</div></div></div>
      <div class="qty-control"><button data-extra="lounge" data-d="-1">–</button><span id="loungeCount">${state.extras.lounge}</span><button data-extra="lounge" data-d="1">+</button></div>
    </div>
    <div class="extra-row">
      <div class="extra-row-left"><div class="extra-icon">📦</div><div><div class="extra-title">Parcel Add-on</div><div class="extra-desc">Send a small parcel on this flight — KSh 1,500 flat fee</div></div></div>
      <label class="pill"><input type="checkbox" id="parcelToggle" ${state.extras.parcel?"checked":""}> Add parcel</label>
    </div>
  `;
  document.querySelectorAll("[data-extra]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.extra, d = parseInt(btn.dataset.d);
      state.extras[key] = Math.max(0, state.extras[key] + d);
      document.getElementById(key + "Count").textContent = state.extras[key];
      renderExtrasSidebar();
      saveState();
    });
  });
  document.getElementById("parcelToggle").addEventListener("change", (e) => { state.extras.parcel = e.target.checked; renderExtrasSidebar(); saveState(); });
  renderExtrasSidebar();
}

function extrasFareTotal() {
  return state.extras.extraBags * 1200 + state.extras.lounge * 2500 + (state.extras.parcel ? 1500 : 0);
}

function renderExtrasSidebar() {
  document.getElementById("extrasSidebar").innerHTML = `
    <div class="summary-head"><h4>Extras</h4></div>
    <div class="summary-body">
      <div class="summary-line"><span>Extra baggage × ${state.extras.extraBags}</span><strong>${formatPrice(state.extras.extraBags*1200)}</strong></div>
      <div class="summary-line"><span>Lounge access × ${state.extras.lounge}</span><strong>${formatPrice(state.extras.lounge*2500)}</strong></div>
      <div class="summary-line"><span>Parcel add-on</span><strong>${state.extras.parcel ? formatPrice(1500) : "—"}</strong></div>
    </div>
    <div class="summary-total"><span>Running Total</span><span>${formatPrice(baseFareTotal() + seatsFareTotal() + extrasFareTotal())}</span></div>
  `;
}

/* ---------------- STEP 6: SUMMARY ---------------- */
function renderSummary() {
  const r = state.selectedFlight;
  const rr = state.search.trip === "return" ? state.selectedReturnFlight : null;
  document.getElementById("summaryMain").innerHTML = `
    <div class="summary-card mb-24">
      <div class="summary-head flex-between"><h4>Trip Details</h4><button class="btn-ghost" data-edit="results">Edit Flight</button></div>
      <div class="summary-body">
        <div class="summary-line"><span>Route</span><strong>${r.originAirport.city} → ${r.destinationAirport.city}${rr ? " (round trip)" : ""}</strong></div>
        <div class="summary-line"><span>${rr ? "Outbound Flight" : "Flight"}</span><strong>${r.flightNumber} · ${r.aircraft}</strong></div>
        <div class="summary-line"><span>${rr ? "Outbound Date" : "Date"}</span><strong>${formatDate(state.search.dep)}, ${r.departureTime}–${r.arrivalTime}</strong></div>
        ${rr ? `
        <div class="summary-line"><span>Return Flight</span><strong>${rr.flightNumber} · ${rr.aircraft}</strong></div>
        <div class="summary-line"><span>Return Date</span><strong>${formatDate(state.search.ret)}, ${rr.departureTime}–${rr.arrivalTime}</strong></div>` : ""}
      </div>
    </div>
    <div class="summary-card mb-24">
      <div class="summary-head flex-between"><h4>Passenger Details</h4><button class="btn-ghost" data-edit="passengers">Edit Passengers</button></div>
      <div class="summary-body">
        ${state.passengers.map((p,i) => `<div class="summary-line"><span>Passenger ${i+1} (${p.type})</span><strong>${p.title} ${p.firstName} ${p.lastName}</strong></div>`).join("")}
      </div>
    </div>
    <div class="summary-card mb-24">
      <div class="summary-head flex-between"><h4>Seats</h4><button class="btn-ghost" data-edit="seats">Edit Seats</button></div>
      <div class="summary-body">
        ${state.passengers.filter(p=>p.type!=="Infant").map((p,i) => `<div class="summary-line"><span>${p.firstName || "Passenger " + (i+1)}</span><strong>${state.seats[i] || "Not selected"}</strong></div>`).join("")}
      </div>
    </div>
    <div class="summary-card">
      <div class="summary-head flex-between"><h4>Baggage & Extras</h4><button class="btn-ghost" data-edit="extras">Edit Extras</button></div>
      <div class="summary-body">
        <div class="summary-line"><span>Included baggage</span><strong>15kg per passenger</strong></div>
        <div class="summary-line"><span>Extra baggage</span><strong>${state.extras.extraBags} × 5kg</strong></div>
        <div class="summary-line"><span>Lounge access</span><strong>${state.extras.lounge}</strong></div>
        <div class="summary-line"><span>Parcel add-on</span><strong>${state.extras.parcel ? "Yes" : "No"}</strong></div>
      </div>
    </div>
  `;
  document.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => {
    // Re-editing the flight on a round trip starts the picker over from the
    // outbound leg, so both legs can be reconsidered together.
    if (b.dataset.edit === "results" && state.search.trip === "return") state.tripPhase = "outbound";
    goTo(b.dataset.edit);
  }));

  document.getElementById("summarySidebar").innerHTML = `
    <div class="summary-head"><h4>Fare Breakdown</h4></div>
    <div class="summary-body">
      <div class="summary-line"><span>Base fare</span><strong>${formatPrice(baseFareTotal())}</strong></div>
      <div class="summary-line"><span>Seat fees</span><strong>${formatPrice(seatsFareTotal())}</strong></div>
      <div class="summary-line"><span>Extras</span><strong>${formatPrice(extrasFareTotal())}</strong></div>
      <div class="summary-line"><span>Taxes & fees (included)</span><strong>${formatPrice(0)}</strong></div>
    </div>
    <div class="summary-total"><span>Total</span><span>${formatPrice(grandTotal())}</span></div>
  `;
}

function grandTotal() { return baseFareTotal() + seatsFareTotal() + extrasFareTotal(); }

/* ---------------- STEP 7: ENQUIRY ---------------- */
function renderEnquiry() {
  const r = state.selectedFlight;
  const rr = state.search.trip === "return" ? state.selectedReturnFlight : null;
  document.getElementById("enquiryBookingRecap").innerHTML = `
    <div class="summary-head"><h4>Booking Request</h4></div>
    <div class="summary-body">
      <div class="summary-line"><span>Passenger</span><strong>${state.passengers[0].firstName || ""} ${state.passengers[0].lastName || ""}</strong></div>
      <div class="summary-line"><span>${rr ? "Outbound Route" : "Route"}</span><strong>${r.originAirport.city} (${r.origin}) → ${r.destinationAirport.city} (${r.destination})</strong></div>
      <div class="summary-line"><span>${rr ? "Outbound Date / Flight" : "Date / Flight"}</span><strong>${formatDate(state.search.dep)} · ${r.flightNumber}</strong></div>
      ${rr ? `
      <div class="summary-line"><span>Return Route</span><strong>${rr.originAirport.city} (${rr.origin}) → ${rr.destinationAirport.city} (${rr.destination})</strong></div>
      <div class="summary-line"><span>Return Date / Flight</span><strong>${formatDate(state.search.ret)} · ${rr.flightNumber}</strong></div>` : ""}
      <div class="summary-line"><span>Passengers</span><strong>${paxTotal()}</strong></div>
      <div class="summary-line"><span>Seats (${Object.keys(state.seats).length})</span><strong>${Object.values(state.seats).join(", ") || "Not selected"}</strong></div>
      <div class="summary-line"><span>Baggage / Extras</span><strong>${state.extras.extraBags} extra bag(s), ${state.extras.lounge} lounge</strong></div>
      <div class="summary-line"><span>Cargo / Parcel</span><strong>${state.extras.parcel ? "1 parcel" : "0 parcels"}</strong></div>
    </div>
    <div class="summary-total"><span>Total</span><span>${formatPrice(grandTotal())}</span></div>
  `;
  const form = document.getElementById("enquiryForm");
  form.onsubmit = (e) => {
    e.preventDefault();
    const name = form.querySelector('input[type="text"]').value;
    const phone = form.querySelector('input[type="tel"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;
    const contactMethod = (form.querySelector('input[name="contactMethod"]:checked') || {}).value || "WhatsApp";
    const ref = "SB-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    const lines = [
      "New booking request — Skyward Airlines",
      `Reference: ${ref}`,
      "",
      `Passenger: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Preferred contact: ${contactMethod}`,
      "",
      `${rr ? "Outbound" : "Route"}: ${r.originAirport.city} (${r.origin}) -> ${r.destinationAirport.city} (${r.destination})`,
      `${rr ? "Outbound Date / Flight" : "Date / Flight"}: ${formatDate(state.search.dep)} · ${r.flightNumber}`,
      ...(rr ? [
        `Return: ${rr.originAirport.city} (${rr.origin}) -> ${rr.destinationAirport.city} (${rr.destination})`,
        `Return Date / Flight: ${formatDate(state.search.ret)} · ${rr.flightNumber}`
      ] : []),
      `Passengers: ${paxTotal()}`,
      `Seats: ${Object.values(state.seats).join(", ") || "Not selected"}`,
      `Extras: ${state.extras.extraBags} extra bag(s), ${state.extras.lounge} lounge`,
      `Cargo / Parcels: ${state.extras.parcel ? 1 : 0}`,
      "",
      `Booking totals — Passengers: ${paxTotal()}, Seats: ${Object.keys(state.seats).length}, Cargo/Parcels: ${state.extras.parcel ? 1 : 0}`,
      `Total: ${formatPrice(grandTotal())}`
    ];
    if (message) lines.push("", `Message: ${message}`);

    const link = buildWhatsAppLink(lines.join("\n"));

    state.confRef = ref;
    state.whatsappLink = link;
    state.step = "confirmation";
    saveState();

    openWhatsApp(link);
    showConfirmation(ref, link);
  };
}

/* ---------------- Global nav handlers ---------------- */
function wireGlobalHandlers() {
  document.getElementById("continueToPassengers").addEventListener("click", () => goTo("passengers"));
  document.getElementById("continueToSeats").addEventListener("click", () => {
    if (!validatePassengers()) { alert("Please complete all required passenger fields."); return; }
    goTo("seats");
  });
  document.getElementById("continueToExtras").addEventListener("click", () => {
    if (!validateSeats()) { alert("Please select a seat for every passenger before continuing."); return; }
    goTo("extras");
  });
  document.getElementById("continueToSummary").addEventListener("click", () => goTo("summary"));
  document.getElementById("continueToEnquiry").addEventListener("click", () => goTo("enquiry"));
  document.getElementById("editSearchBtn").addEventListener("click", () => { clearSavedState(); window.location.href = "index.html#search"; });
}

init();
