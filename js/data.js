/* ============================================================
   SKYWARD AIRLINES — CENTRAL DATA LAYER
   Everything the site reads from lives here. Swap this file
   for real API calls later without touching UI code.
   ============================================================ */

// International format, no "+" and no leading zero — required by wa.me links.
// Update this single value to change the WhatsApp number used sitewide
// (Contact Us page and the booking flow's final step).
const WHATSAPP_NUMBER = "254755455919";

const AIRPORTS = [
  { code: "NBO", displayCode: "JKIA", name: "Jomo Kenyatta International Airport", city: "Nairobi" },
  { code: "WIL", name: "Wilson Airport", city: "Nairobi" },
  { code: "MBA", name: "Moi International Airport", city: "Mombasa" },
  { code: "MYD", name: "Malindi Airport", city: "Malindi" },
  { code: "LAU", name: "Lamu Airport (Manda)", city: "Lamu" },
  { code: "UKA", name: "Ukunda Airport", city: "Ukunda (Diani)" },
  { code: "VPG", name: "Vipingo Ridge Airstrip", city: "Vipingo Ridge" },
  { code: "LOK", name: "Lodwar Airport", city: "Lodwar" },
  { code: "EDL", name: "Eldoret International Airport", city: "Eldoret" },
  { code: "MGG", name: "Migori Airstrip", city: "Migori" },
  { code: "KIT", name: "Kitale Airport", city: "Kitale" },
  { code: "GAS", name: "Garissa Airport", city: "Garissa" },
  { code: "DAR", name: "Julius Nyerere International Airport", city: "Dar es Salaam" },
  { code: "KIS", name: "Kisumu International Airport", city: "Kisumu" },
  { code: "EBB", name: "Entebbe International Airport", city: "Entebbe" }
];

function airport(code) { return AIRPORTS.find(a => a.code === code); }

/* ---------------- Destinations ---------------- */
const DESTINATIONS = [
  {
    id: "nairobi", name: "Nairobi", country: "Kenya", airportCode: "NBO",
    tagline: "The capital gateway", region: "Highlands",
    hero: "grad-navy", thumb: "grad-navy", image: "images/nairobi.jpg",
    description: "Kenya's capital and Skyward Airlines' home hub, Nairobi links the region's business centres with its coast, lakes and northern frontier. Skip the queues at JKIA with our dedicated regional check-in.",
    highlights: ["Regional hub with same-day connections", "Nairobi National Park minutes from the city", "Vibrant food, arts and business districts"],
    fareFrom: 0
  },
  {
    id: "mombasa", name: "Mombasa", country: "Kenya", airportCode: "MBA",
    tagline: "Coastal old town & beaches", region: "Coast",
    hero: "grad-sky", thumb: "grad-sky", image: "images/mombasa.jpg",
    description: "Kenya's second city blends Swahili heritage with palm-lined beaches. Skyward Airlines runs multiple daily flights between Nairobi and Mombasa, making a coastal weekend an easy add-on to any trip.",
    highlights: ["Historic Old Town and Fort Jesus", "Direct beach access along the south and north coast", "Multiple daily departures from Nairobi"],
    fareFrom: 6500
  },
  {
    id: "malindi", name: "Malindi", country: "Kenya", airportCode: "MYD",
    tagline: "Marine parks & Swahili charm", region: "Coast",
    hero: "grad-sky", thumb: "grad-sky", image: "images/malindi.jpg",
    description: "A laid-back coastal town known for its marine national park, coral reefs and Italian-influenced seafront. A short hop from Nairobi puts you on the sand by lunchtime.",
    highlights: ["Malindi Marine National Park", "Watamu reefs a short drive away", "Relaxed, low-key coastal pace"],
    fareFrom: 7850
  },
  {
    id: "lamu", name: "Lamu", country: "Kenya", airportCode: "LAU",
    tagline: "UNESCO island heritage", region: "Coast",
    hero: "grad-amber", thumb: "grad-amber", image: "images/lamu.jpg",
    description: "A UNESCO World Heritage island where dhows still outnumber cars. Skyward Airlines' Lamu route connects the archipelago to the mainland without the long coastal drive.",
    highlights: ["UNESCO-listed Lamu Old Town", "Traditional dhow sailing", "Car-free island streets"],
    fareFrom: 10010
  },
  {
    id: "ukunda", name: "Ukunda (Diani)", country: "Kenya", airportCode: "UKA",
    tagline: "Diani Beach access", region: "Coast",
    hero: "grad-sky", thumb: "grad-sky", image: "images/ukunda-diani.jpg",
    description: "The nearest airstrip to Diani Beach, one of East Africa's most awarded stretches of coastline. Ideal for resort transfers without the Mombasa road drive.",
    highlights: ["Closest airstrip to Diani Beach resorts", "Kite-surfing and reef diving", "Fast resort transfers"],
    fareFrom: 6500
  },
  {
    id: "vipingo-ridge", name: "Vipingo Ridge", country: "Kenya", airportCode: "VPG",
    tagline: "Golf estate & coastline", region: "Coast",
    hero: "grad-amber", thumb: "grad-amber", image: "images/vipingo-ridge.jpg",
    description: "Home to an award-winning golf estate above the Kenyan coast. Our Vipingo Ridge route is popular with golf and residential travellers seeking a private airstrip arrival.",
    highlights: ["Championship golf estate", "Private, low-traffic airstrip", "Coastal cliff-top scenery"],
    fareFrom: 15210
  },
  {
    id: "lodwar", name: "Lodwar", country: "Kenya", airportCode: "LOK",
    tagline: "Gateway to Turkana", region: "Northern Kenya",
    hero: "grad-terracotta", thumb: "grad-terracotta", image: "images/lodwar.jpg",
    description: "The main town of Turkana County and gateway to Lake Turkana, the world's largest desert lake. Skyward Airlines' northern route cuts a two-day road journey to under two hours.",
    highlights: ["Gateway to Lake Turkana", "Access to Sibiloi and South Island National Parks", "Cuts a two-day road trip to under two hours"],
    fareFrom: 11960
  },
  {
    id: "eldoret", name: "Eldoret", country: "Kenya", airportCode: "EDL",
    tagline: "Rift Valley highlands", region: "Rift Valley",
    hero: "grad-navy", thumb: "grad-navy", image: "images/eldoret.jpg",
    description: "The heart of Kenya's highland farming and athletics country, and a growing business and logistics centre for the North Rift.", 
    highlights: ["Home of Kenya's distance-running heritage", "Agricultural and trade hub", "Gateway to Kerio Valley and Cherangani Hills"],
    fareFrom: 6500
  },
  {
    id: "migori", name: "Migori", country: "Kenya", airportCode: "MGG",
    tagline: "Lake region trade town", region: "Lake Victoria",
    hero: "grad-terracotta", thumb: "grad-terracotta", image: "images/migori.jpg",
    description: "A fast-growing trade town near the Tanzanian border and the Lake Victoria basin, connected by Skyward Airlines to Nairobi and the wider regional network.",
    highlights: ["Cross-border trade hub", "Close to Lake Victoria", "Access to Migori's mining and agriculture belt"],
    fareFrom: 8970
  },
  {
    id: "kitale", name: "Kitale", country: "Kenya", airportCode: "KIT",
    tagline: "Highlands & Mount Elgon", region: "Rift Valley",
    hero: "grad-navy", thumb: "grad-navy", image: "images/kitale.jpg",
    description: "A fertile highland town at the foot of Mount Elgon, serving farming communities and travellers heading to Saiwa Swamp and Mount Elgon National Park.",
    highlights: ["Gateway to Mount Elgon National Park", "Saiwa Swamp National Park nearby", "Rich agricultural region"],
    fareFrom: 9000
  },
  {
    id: "garissa", name: "Garissa", country: "Kenya", airportCode: "GAS",
    tagline: "North Eastern hub", region: "North Eastern Kenya",
    hero: "grad-terracotta", thumb: "grad-terracotta", image: "images/garissa.jpg",
    description: "The principal town of North Eastern Kenya on the banks of the Tana River, served by Skyward Airlines as a vital link for trade, government and family travel.",
    highlights: ["Key North Eastern trade hub", "Tana River setting", "Vital regional connectivity link"],
    fareFrom: 9000
  },
  {
    id: "dar-es-salaam", name: "Dar es Salaam", country: "Tanzania", airportCode: "DAR",
    tagline: "Tanzania's commercial capital", region: "International",
    hero: "grad-sky", thumb: "grad-sky", image: "images/dar-es-salaam.jpg",
    description: "Tanzania's largest city and commercial hub on the Indian Ocean, connected to Nairobi by Skyward Airlines' flagship international route.",
    highlights: ["Tanzania's commercial and port capital", "Gateway to Zanzibar connections", "Flagship international route"],
    fareFrom: 16700
  },
  {
    id: "kisumu", name: "Kisumu", country: "Kenya", airportCode: "KIS",
    tagline: "Lake Victoria's lakeside city", region: "Lake Victoria",
    hero: "grad-sky", thumb: "grad-sky", image: "images/kisumu.jpg",
    description: "Kenya's third city, set on the shores of Lake Victoria, and a growing hub for business, culture and lake-region travel.",
    highlights: ["Lakefront city life", "Kisumu Impala Sanctuary", "Gateway to the wider lake basin"],
    fareFrom: 8580
  },
  {
    id: "entebbe", name: "Entebbe", country: "Uganda", airportCode: "EBB",
    tagline: "Uganda's lakeside gateway", region: "International",
    hero: "grad-amber", thumb: "grad-amber", image: "images/entebbe.jpg",
    description: "Set on the shores of Lake Victoria, Entebbe serves as Uganda's main international gateway. Skyward Airlines connects it daily to Nairobi.",
    highlights: ["Uganda's principal international gateway", "Lake Victoria shoreline setting", "Daily connections to Nairobi"],
    fareFrom: 18850
  }
];

DESTINATIONS.forEach(d => {
  d.airport = airport(d.airportCode);
  d.relatedDestinations = DESTINATIONS.filter(x => x.region === d.region && x.id !== d.id).slice(0, 3).map(x => x.id);
});
// second pass so relatedDestinations resolve after full array exists
DESTINATIONS.forEach(d => {
  d.relatedDestinations = DESTINATIONS.filter(x => x.region === d.region && x.id !== d.id).slice(0, 3).map(x => x.id);
});

function destination(id) { return DESTINATIONS.find(d => d.id === id); }

/* ---------------- Fleet ---------------- */
const FLEET = [
  {
    id: "dash8-400", name: "De Havilland Dash 8-400", capacity: 76, range: "2,040 km",
    speed: "667 km/h", cabin: "2–2 single-class regional cabin", image: "images/dash8-400.jpg",
    description: "The backbone of our coastal and highland network — fast turnarounds and short-runway performance."
  },
  {
    id: "atr72-600", name: "ATR 72-600", capacity: 68, range: "1,528 km",
    speed: "510 km/h", cabin: "2–2 single-class regional cabin", image: "images/atr72-600.jpg",
    description: "Efficient and quiet, our ATR 72s serve our northern frontier and lake-region routes."
  },
  {
    id: "embraer-e175", name: "Embraer E175", capacity: 88, range: "3,340 km",
    speed: "829 km/h", cabin: "2–2 configuration with 12 Skyward Plus seats", image: "images/embraer-e175.jpg",
    description: "Our flagship jet for international routes to Dar es Salaam and Entebbe."
  },
  {
    id: "cessna-caravan", name: "Cessna Grand Caravan EX", capacity: 12, range: "1,148 km",
    speed: "344 km/h", cabin: "Single-class, charter configuration", image: "images/cessna-caravan.jpg",
    description: "Used for charter, safari transfers and our lowest-volume airstrip routes."
  }
];

/* ---------------- Routes ---------------- */
// Aircraft used for a given route, keyed loosely by distance profile
function acFor(o, d) {
  const jet = ["DAR", "EBB"];
  if (jet.includes(o) || jet.includes(d)) return "Embraer E175";
  const remote = ["LOK", "GAS", "LAU"];
  if (remote.includes(o) || remote.includes(d)) return "ATR 72-600";
  return "De Havilland Dash 8-400";
}

// Every Nairobi route (in both directions) runs on the same standard set of
// 9 daily departure-time slots. Flight duration/price stay per-route; only
// the clock times are standardized.
const NAIROBI_DEPARTURE_TIMES = ["07:00", "08:30", "10:00", "11:30", "13:00", "14:30", "16:00", "18:00", "19:30"];

// [destination code, duration, price] — every route is Nairobi <-> this city
const BASE_ROUTES = [
  ["MBA", "1h 05m", 6500],
  ["MYD", "1h 15m", 7850],
  ["LAU", "1h 30m", 10010],
  ["UKA", "1h 10m", 6500],
  ["VPG", "1h 05m", 15210],
  ["LOK", "1h 40m", 11960],
  ["EDL", "0h 45m", 6500],
  ["MGG", "1h 20m", 8970],
  ["KIT", "1h 10m", 9000],
  ["GAS", "1h 00m", 9000],
  ["DAR", "1h 35m", 16700],
  ["KIS", "0h 50m", 8580],
  ["EBB", "1h 20m", 18850]
];

function parseDurationMinutes(d) {
  const m = d.match(/(\d+)h\s*(\d+)m/);
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0;
}

function addMinutesToTime(hhmm, mins) {
  const [h, m] = hhmm.split(":").map(Number);
  let total = ((h * 60 + m + mins) % 1440 + 1440) % 1440;
  const hh = Math.floor(total / 60), mm = total % 60;
  return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
}

function makeRoute(seq, o, d, dep, duration, price) {
  return {
    id: "SB" + seq,
    flightNumber: "SB " + seq,
    origin: o, destination: d,
    originAirport: airport(o), destinationAirport: airport(d),
    departureTime: dep, arrivalTime: addMinutesToTime(dep, parseDurationMinutes(duration)), duration,
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    frequency: "Daily",
    price, status: "On schedule",
    aircraft: acFor(o, d),
    stops: 0
  };
}

// Not every departure slot charges the base fare — a handful of flights spread
// across morning, afternoon and evening run KSh 600-1000 more, keyed by the
// slot's position in NAIROBI_DEPARTURE_TIMES (0=07:00 ... 8=19:30).
const SLOT_PREMIUMS = { 1: 650, 3: 800, 5: 950, 7: 700 };

const ROUTES = [];
let _seq = 300;
BASE_ROUTES.forEach(([code, duration, price]) => {
  NAIROBI_DEPARTURE_TIMES.forEach((t, i) => ROUTES.push(makeRoute(_seq++, "NBO", code, t, duration, price + (SLOT_PREMIUMS[i] || 0))));
  NAIROBI_DEPARTURE_TIMES.forEach((t, i) => ROUTES.push(makeRoute(_seq++, code, "NBO", t, duration, price + (SLOT_PREMIUMS[i] || 0))));
});

// Mombasa <-> Dar es Salaam — a direct coastal route that doesn't run through
// the Nairobi hub. Uses the same 9 daily departure slots and the same
// slot-premium pattern as every other route on the network.
const MBA_DAR_DURATION = "1h 15m";
const MBA_DAR_BASE_PRICE = 15500;
NAIROBI_DEPARTURE_TIMES.forEach((t, i) => ROUTES.push(makeRoute(_seq++, "MBA", "DAR", t, MBA_DAR_DURATION, MBA_DAR_BASE_PRICE + (SLOT_PREMIUMS[i] || 0))));
NAIROBI_DEPARTURE_TIMES.forEach((t, i) => ROUTES.push(makeRoute(_seq++, "DAR", "MBA", t, MBA_DAR_DURATION, MBA_DAR_BASE_PRICE + (SLOT_PREMIUMS[i] || 0))));

function routesBetween(o, d) {
  return ROUTES.filter(r => r.origin === o && r.destination === d);
}

/* ---------------- Services ---------------- */
const SERVICES = [
  { id: "lounge", title: "Lounge Access", icon: "lounge", desc: "A quiet departures lounge with refreshments, Wi-Fi and priority boarding calls." },
  { id: "baggage", title: "Extra Baggage", icon: "baggage", desc: "Pre-purchase additional baggage allowance at a lower rate than airport check-in." },
  { id: "seats", title: "Legroom & Seat Selection", icon: "seat", desc: "Choose your seat in advance, including extra-legroom rows on jet services." },
  { id: "parcels", title: "Parcel Services", icon: "parcel", desc: "Same-day parcel carriage between Skyward Airlines destinations for time-sensitive shipments." },
  { id: "charter", title: "Charter Services", icon: "charter", desc: "Private and corporate charters, safari transfers and group travel on request." }
];

/* ---------------- Offers ---------------- */
const OFFERS = [
  { id: "off1", label: "SMART FARE", originId: "nairobi", destinationId: "mombasa", price: 5900, desc: "Book 14 days ahead and save on our best-selling coastal route." },
  { id: "off2", label: "NEW ROUTE", originId: "nairobi", destinationId: "lodwar", price: 10900, desc: "Introductory fares on our newest northern frontier route." },
  { id: "off3", label: "WEEKEND ESCAPE", originId: "nairobi", destinationId: "lamu", price: 9800, desc: "Friday–Sunday return fares to the island, limited seats." },
  { id: "off4", label: "REGIONAL FARE", originId: "nairobi", destinationId: "entebbe", price: 12500, desc: "Cross-border fares to Entebbe, taxes included." }
];

/* ---------------- News / Announcements ---------------- */
const ANNOUNCEMENTS = [
  { tag: "NEW ROUTE", title: "Lodwar joins the Skyward network", body: "Twice-daily service to Turkana begins this quarter.", cta: "Learn more" },
  { tag: "DAILY SERVICE", title: "Nairobi–Kisumu now twice daily", body: "A new evening departure has been added to our lake-region schedule.", cta: "View schedule" },
  { tag: "SPECIAL FARE", title: "Coastal fares from KSh 5,900", body: "Advance-purchase fares to Mombasa, Malindi and Diani.", cta: "See fares" }
];

const NEWS = [
  { id: "n1", date: "2026-07-14", category: "Company News", title: "Skyward Airlines adds fourth Embraer E175 to fleet", excerpt: "The new aircraft expands capacity on our Dar es Salaam and Entebbe routes ahead of the peak season.", image: "images/fourth-embraer-e175.jpg" },
  { id: "n2", date: "2026-06-02", category: "Route News", title: "Introductory fares announced for Lodwar route", excerpt: "Skyward Airlines' newest route cuts the Nairobi–Turkana journey from two days by road to under two hours by air.", image: "images/lodwar-route-launch.jpg" },
  { id: "n3", date: "2026-05-18", category: "Sustainability", title: "Skyward Airlines launches community aviation scholarship", excerpt: "The programme will fund technical aviation training for students from our northern route communities.", image: "images/aviation-scholarship.jpg" },
  { id: "n4", date: "2026-04-09", category: "Travel", title: "Five reasons to fly into Diani via Ukunda", excerpt: "Our short guide to making the most of Kenya's award-winning south coast beach.", image: "images/ukunda-diani.jpg" }
];

/* ---------------- FAQs ---------------- */
const FAQS = [
  { cat: "Bookings", q: "How do I make a booking?", a: "Search your route on our homepage, select a flight and complete the passenger and seat steps. Since we don't process payment online, your itinerary is sent to our reservations team to confirm and issue tickets." },
  { cat: "Bookings", q: "Can I book for someone else?", a: "Yes. Enter the travelling passenger's details during the passenger information step, and use your own contact details for booking confirmation." },
  { cat: "Baggage", q: "What is the standard baggage allowance?", a: "Economy fares include 15kg checked baggage and 5kg hand baggage. Additional baggage can be pre-purchased on the extras step." },
  { cat: "Baggage", q: "What about oversized items?", a: "Sports equipment, musical instruments and similar items can usually be carried for an additional fee — contact our reservations team ahead of travel." },
  { cat: "Check-in", q: "When should I arrive for check-in?", a: "We recommend arriving 90 minutes before departure for domestic flights and 2 hours before departure for Dar es Salaam and Entebbe services." },
  { cat: "Travel documents", q: "What documents do I need to travel?", a: "A valid national ID is sufficient for domestic Kenyan routes. A valid passport is required for Dar es Salaam and Entebbe." },
  { cat: "Children", q: "Can children travel alone?", a: "Unaccompanied minors aged 5–11 may travel with our unaccompanied minor service. See our Unaccompanied Minors policy for details and fees." },
  { cat: "Special assistance", q: "Do you support passengers with reduced mobility?", a: "Yes — please notify us at least 48 hours before travel so we can arrange assistance at the airport and on board." },
  { cat: "Pets", q: "Can I travel with my pet?", a: "Small pets may travel in the cabin or hold on most routes, subject to our Pet Carriage Policy and advance notice." },
  { cat: "Payments", q: "How do I pay for my booking?", a: "Once your enquiry is submitted, our reservations team will call, email or WhatsApp you with payment options including mobile money and bank transfer." },
  { cat: "Changes/cancellations", q: "Can I change my flight?", a: "Most fares allow changes for a fee plus any fare difference. Contact our reservations team with your booking reference to make changes." }
];

const CURRENCY = "KSh";
function formatPrice(n) { return CURRENCY + " " + n.toLocaleString(); }
