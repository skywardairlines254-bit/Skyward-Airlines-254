/* ============================================================
   SKYWARD AIRLINES — INFO PAGE CONTENT
   Structured content for Travel Information & About Us pages,
   rendered by js/template.js via a shared layout.
   ============================================================ */

const INFO_PAGES = {
  "service-fees": {
    title: "Applicable Service Fees", crumb: "Travel Information",
    intro: "A summary of the fees that may apply in addition to your base fare.",
    table: { headers: ["Service", "Fee"], rows: [
      ["Seat selection — standard", "Free"],
      ["Seat selection — extra legroom", "KSh 800"],
      ["Seat selection — Skyward Plus", "KSh 2,200"],
      ["Extra checked baggage (per 5kg)", "KSh 1,200"],
      ["Lounge access", "KSh 2,500"],
      ["Date change", "KSh 2,000 + fare difference"],
      ["Name correction", "KSh 1,000"],
      ["Unaccompanied minor service", "KSh 1,500"]
    ]},
    callout: "Fees are reviewed periodically. The fee shown at the time of booking is the fee that applies to your itinerary."
  },
  "ticket-policies": {
    title: "Ticket Policies", crumb: "Travel Information",
    intro: "How our fare types work, and what's included.",
    accordions: [
      { q: "What fare types are available?", a: "Economy fares are our standard fare class. Skyward Plus fares include extra-legroom seating, priority boarding and additional baggage allowance on jet services." },
      { q: "Are tickets refundable?", a: "Refundability depends on fare type. Economy Saver fares are non-refundable but changeable for a fee. Fully flexible fares can be refunded up to 24 hours before departure." },
      { q: "Can I change the date of my flight?", a: "Yes, subject to a change fee plus any fare difference, and seat availability on the new date." },
      { q: "How long is my ticket valid for?", a: "Standard tickets are valid for travel within 12 months of issue unless otherwise stated." }
    ]
  },
  "baggage-policy": {
    title: "Baggage Policy", crumb: "Travel Information",
    intro: "Standard allowances and what to expect at check-in.",
    table: { headers: ["Fare", "Checked Baggage", "Cabin Baggage"], rows: [
      ["Economy", "15kg", "5kg"],
      ["Skyward Plus", "23kg", "7kg"],
      ["Infant (under 2)", "10kg + collapsible stroller", "—"]
    ]},
    accordions: [
      { q: "What happens if I exceed my allowance?", a: "Excess baggage can be paid for at check-in, or pre-purchased online at a lower rate via the Extras step during booking." },
      { q: "Are there restricted items?", a: "Yes — see our Dangerous Goods Policy for a full list of items that cannot be carried by air." },
      { q: "Can I carry sports equipment?", a: "Golf bags, surfboards and similar items can usually be carried for an additional fee. Contact our reservations team ahead of travel to confirm space." }
    ]
  },
  "travel-requirements": {
    title: "Travel Requirements & Documentation", crumb: "Travel Information",
    intro: "What you'll need to bring to travel with Skyward Airlines.",
    table: { headers: ["Route Type", "Accepted Documents"], rows: [
      ["Domestic Kenya routes", "Valid national ID or passport"],
      ["Dar es Salaam (Tanzania)", "Valid passport, minimum 6 months validity"],
      ["Entebbe (Uganda)", "Valid passport, minimum 6 months validity"],
      ["Minors (all routes)", "Birth certificate or passport"]
    ]},
    callout: "Requirements can change with little notice. Please confirm current entry requirements with the relevant embassy or high commission before travel."
  },
  "dangerous-goods": {
    title: "Dangerous Goods Policy", crumb: "Travel Information",
    intro: "Items that cannot be carried in checked or cabin baggage.",
    accordions: [
      { q: "What items are prohibited?", a: "Explosives, compressed gases, flammable liquids and solids, oxidising substances, toxic and infectious substances, radioactive material, and corrosives may not be carried." },
      { q: "What about lithium batteries?", a: "Spare lithium batteries must be carried in cabin baggage only, and are limited in size and quantity. Devices containing batteries should be carried in cabin baggage where possible." },
      { q: "Can I carry a power bank?", a: "Small power banks are permitted in cabin baggage only, within standard watt-hour limits." }
    ],
    callout: "This is a summary only. Contact our reservations team if you are unsure whether an item can be carried."
  },
  "unaccompanied-minors": {
    title: "Unaccompanied Minors", crumb: "Travel Information",
    intro: "How children travelling alone are cared for on Skyward Airlines flights.",
    accordions: [
      { q: "What ages are eligible?", a: "Children aged 5 to 11 travelling without an accompanying adult must use our unaccompanied minor service. Ages 12–17 may travel independently but the service is available on request." },
      { q: "What does the service include?", a: "A dedicated cabin crew member checks in on the child throughout the flight, and handover to an authorised adult is confirmed at arrival." },
      { q: "How do I book this service?", a: "Select the passenger as a child during booking and contact our reservations team to arrange the unaccompanied minor service before travel." }
    ]
  },
  "expectant-mothers": {
    title: "Expectant Mothers", crumb: "Travel Information",
    intro: "Guidance for travelling with Skyward Airlines during pregnancy.",
    table: { headers: ["Stage of Pregnancy", "Requirement"], rows: [
      ["Up to 27 weeks", "No documentation required"],
      ["28–35 weeks", "Medical certificate confirming fitness to fly, dated within 7 days of travel"],
      ["36 weeks and beyond", "Travel not permitted on Skyward Airlines flights"]
    ]},
    callout: "Please carry your medical certificate with you at check-in if travelling after 28 weeks."
  },
  "special-needs": {
    title: "Passengers with Special Needs", crumb: "Travel Information",
    intro: "Support available for passengers who need extra assistance.",
    accordions: [
      { q: "What assistance can I request?", a: "Wheelchair assistance, priority boarding, help with connections, and support for passengers with visual, hearing or cognitive disabilities." },
      { q: "How much notice do you need?", a: "We ask for at least 48 hours' notice so we can arrange assistance at the airport and on board." },
      { q: "Can I travel with a mobility device?", a: "Yes, most mobility devices are carried free of charge in addition to your standard baggage allowance. Battery-powered devices may need advance notice." }
    ]
  },
  "pet-policy": {
    title: "Pet Carriage Policy", crumb: "Travel Information",
    intro: "How to travel with a pet on Skyward Airlines.",
    table: { headers: ["Pet Type", "Where Carried"], rows: [
      ["Small cats and dogs (under 8kg with carrier)", "In-cabin, under the seat in front of you"],
      ["Larger dogs and cats", "In the temperature-controlled hold"],
      ["Exotic or restricted species", "Not accepted"]
    ]},
    callout: "Pet carriage must be booked in advance and is subject to space availability and destination import rules."
  },
  "children-infants": {
    title: "Children & Infants", crumb: "Travel Information",
    intro: "Fares and requirements for younger travellers.",
    table: { headers: ["Age", "Fare", "Seat"], rows: [
      ["Infant (under 2)", "10% of adult fare", "On accompanying adult's lap"],
      ["Child (2–11)", "Full fare, child baggage allowance applies", "Own seat"],
      ["Unaccompanied minor (5–11)", "Full fare + service fee", "Own seat, supervised by crew"]
    ]}
  },
  "why-book-direct": {
    title: "Why Book Direct", crumb: "About Us",
    intro: "Benefits of booking directly with Skyward Airlines rather than a third party.",
    cards: [
      ["Direct support", "Speak directly with our reservations team for any change or question — no middleman."],
      ["Flexible assistance", "We can help with date changes, name corrections and special requests faster when you book with us."],
      ["Transparent fares", "The price you see during booking is the price you pay — no hidden agent mark-ups."],
      ["Special offers", "Smart Deals and route launch fares are only available through our own booking channels."],
      ["Easy communication", "Your booking reference connects straight to our systems for faster resolution."]
    ]
  },
  "fly-easy": {
    title: "Fly Easy", crumb: "About Us",
    intro: "Our commitment to making regional travel straightforward, from booking to arrival.",
    cards: [
      ["Simple booking", "A clear, step-by-step booking flow with no surprise charges."],
      ["Fast check-in", "Regional airports mean shorter queues and quicker boarding."],
      ["Clear communication", "Our reservations team confirms every detail directly with you."],
      ["Consistent schedules", "Daily and near-daily frequencies on our core routes."]
    ]
  },
  "advertise": {
    title: "Advertise With Us", crumb: "About Us",
    intro: "Reach regional travellers across our digital and in-flight channels.",
    cards: [
      ["Website placements", "Featured positions across our homepage and destination pages."],
      ["In-flight media", "Seat-back cards and cabin announcements on select routes."],
      ["Newsletter", "Reach subscribers who follow our fares and route news."]
    ],
    callout: "For rates and availability, contact our commercial team via the Contact Us page."
  }
};
