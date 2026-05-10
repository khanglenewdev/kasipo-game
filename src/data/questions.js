export const QUESTIONS = [
  // ROUND 1
  {
    round: 1, num: 1, total: 8,
    roundLabel: 'ROUND 1 - GAMBLE ROUND',
    roundColor: '#F5A623',
    tip: 'Place your bet before answering! DOUBLE DOWN = 2x risk & reward',
    q: 'What does PMS stand for?',
    opts: ['Payment Management Software', 'Property Management System', 'Personnel Management Service', 'Processing and Monitoring System'],
    ans: 1,
    why: 'PMS = Property Management System - the central software connecting all hotel departments.'
  },
  {
    round: 1, num: 2, total: 8,
    roundLabel: 'ROUND 1 - GAMBLE ROUND',
    roundColor: '#F5A623',
    tip: 'Place your bet before answering! DOUBLE DOWN = 2x risk & reward',
    q: 'What is a folio?',
    opts: ['A type of room key card', 'The running record of all charges during a guest\'s stay', 'The guest passport copy', 'A daily housekeeping report'],
    ans: 1,
    why: 'A folio is opened at check-in and records every charge until checkout.'
  },
  {
    round: 1, num: 3, total: 8,
    roundLabel: 'ROUND 1 - GAMBLE ROUND',
    roundColor: '#F5A623',
    tip: 'Place your bet before answering! DOUBLE DOWN = 2x risk & reward',
    q: 'Which module does a GSA use MOST?',
    opts: ['Revenue Management Module', 'Security Module', 'Front Desk / Registration Module', 'Housekeeping Module'],
    ans: 2,
    why: 'Front Desk/Registration Module handles check-in, room assignment, folio, and checkout.'
  },
  {
    round: 1, num: 4, total: 8,
    roundLabel: 'ROUND 1 - GAMBLE ROUND',
    roundColor: '#F5A623',
    tip: 'Place your bet before answering! DOUBLE DOWN = 2x risk & reward',
    q: 'What is the room status immediately after a guest checks out?',
    opts: ['Out of Order', 'Inspected', 'Occupied', 'Vacant / Dirty'],
    ans: 3,
    why: 'Vacant/Dirty signals housekeeping to clean the room.'
  },
  {
    round: 1, num: 5, total: 8,
    roundLabel: 'ROUND 1 - GAMBLE ROUND',
    roundColor: '#F5A623',
    tip: 'Place your bet before answering! DOUBLE DOWN = 2x risk & reward',
    q: 'How many core PMS modules are there?',
    opts: ['4', '5', '6', '8'],
    ans: 2,
    why: '6 modules: Reservations, Front Desk, Posting, Housekeeping, Revenue Management, Security.'
  },
  {
    round: 1, num: 6, total: 8,
    roundLabel: 'ROUND 1 - GAMBLE ROUND',
    roundColor: '#F5A623',
    tip: 'Place your bet before answering! DOUBLE DOWN = 2x risk & reward',
    q: 'What is the main purpose of the Reservations Module?',
    opts: ['Issue key cards', 'Manage all bookings from every channel in one place', 'Calculate staff wages', 'Track energy usage'],
    ans: 1,
    why: 'Consolidates bookings from all channels into one picture.'
  },
  {
    round: 1, num: 7, total: 8,
    roundLabel: 'ROUND 1 - GAMBLE ROUND',
    roundColor: '#F5A623',
    tip: 'Place your bet before answering! DOUBLE DOWN = 2x risk & reward',
    q: 'What is the "late charge problem"?',
    opts: ['Guest pays late', 'Charge posted after guest checked out and paid', 'Night audit runs late', 'Room rates updated too late'],
    ans: 1,
    why: 'A charge posted after checkout makes it hard to collect.'
  },
  {
    round: 1, num: 8, total: 8,
    roundLabel: 'ROUND 1 - GAMBLE ROUND',
    roundColor: '#F5A623',
    tip: 'Place your bet before answering! DOUBLE DOWN = 2x risk & reward',
    q: 'What does UPS stand for in a hotel context?',
    opts: ['Universal Payment System', 'Uninterruptible Power Supply - keeps PMS running during power outage', 'Unified Property Software', 'User Permission Settings'],
    ans: 1,
    why: 'A battery backup giving time to save data and switch to manual procedures.'
  },

  // ROUND 2
  {
    round: 2, num: 1, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'Which room status means cleaned AND supervisor approved?',
    opts: ['Vacant / Clean', 'Vacant / Dirty', 'Inspected', 'Out of Order'],
    ans: 2,
    why: 'Inspected = supervisor checked. Front desk can ONLY assign Inspected rooms.'
  },
  {
    round: 2, num: 2, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'What does "interfacing" mean in a PMS context?',
    opts: ['Visual design of the PMS screen', 'Ability of PMS to share data with other systems', 'Training staff on the system', 'Updating PMS software'],
    ans: 1,
    why: 'PMS connecting with other systems like POS, door locks, and CRS.'
  },
  {
    round: 2, num: 3, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'Which system automatically posts a restaurant charge to the guest folio?',
    opts: ['CRS', 'POS system', 'Energy Management', 'Marketing Database'],
    ans: 1,
    why: 'POS communicates with PMS. The charge posts the moment the guest signs the bill.'
  },
  {
    round: 2, num: 4, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'What does PMS-Energy Management integration automatically control?',
    opts: ['Room pricing', 'Air conditioning and lighting when a room becomes vacant', 'Housekeeping schedule', 'Mini-bar restocking'],
    ans: 1,
    why: 'Signals the energy system when a room is vacant to adjust climate and lights.'
  },
  {
    round: 2, num: 5, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'What is Step 2 of the Needs Analysis process?',
    opts: ['Map guest journey', 'Calculate payback period', 'Identify the bottlenecks', 'Request vendor proposals'],
    ans: 2,
    why: 'Step 1: Map journey. Step 2: Identify bottlenecks. Step 3: Build business case.'
  },
  {
    round: 2, num: 6, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'What are the three manual fallback tools when PMS goes offline?',
    opts: ['Walkie-talkie / Excel / email', 'Paper room status board + manual registration cards + pre-authorization slips', 'Printed folios / cash / phone calls', 'WhatsApp / PDF / supervisor chain'],
    ans: 1,
    why: 'Covers the three core jobs: room readiness, guest info, and payment security.'
  },
  {
    round: 2, num: 7, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'Which hotel uses facial recognition for the entire guest journey?',
    opts: ['Hilton (Connie)', 'Marriott (WeChat)', 'Alibaba FlyZoo Hotel', 'IHG Green Engage'],
    ans: 2,
    why: 'FlyZoo uses facial scans for the entire guest journey.'
  },
  {
    round: 2, num: 8, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'What is the main weakness of AI compared to humans in hospitality?',
    opts: ['Cannot process large data', 'Struggles with repetitive tasks', 'Lacks emotional intelligence and genuine human connection', 'Cannot integrate with hotel software'],
    ans: 2,
    why: 'AI excels at data but cannot empathize or build real human connections.'
  },
  {
    round: 2, num: 9, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'Alexa for Hospitality is an example of what technology?',
    opts: ['AI sentiment analysis', 'Facial recognition', 'Revenue management automation', 'IoT voice-activated guest service'],
    ans: 3,
    why: 'An IoT voice device routing guest requests to the right department.'
  },
  {
    round: 2, num: 10, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'What does the Security Module do when a guest checks out?',
    opts: ['Generates a new key card automatically', 'Deactivates the guest key card', 'Locks room for inspection', 'Sends access history to finance'],
    ans: 1,
    why: 'Deactivates the key card immediately - returned or not, it cannot be reused.'
  },
  {
    round: 2, num: 11, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'Which factor is NOT used by the Revenue Management Module for pricing?',
    opts: ['Historical occupancy data', 'Competitor pricing', 'Staff work schedules', 'Local events and demand'],
    ans: 2,
    why: 'Staff schedules are an HR concern, not a pricing input.'
  },
  {
    round: 2, num: 12, total: 12,
    roundLabel: 'ROUND 2 - POWER ROUND',
    roundColor: '#38bdf8',
    tip: 'Power Cards are active! Use 1 card per turn only',
    q: 'PMS operation depends on what two critical things?',
    opts: ['Wifi and mobile app', 'Electricity and the internet', 'Server room and IT staff', 'CRS connection and marketing database'],
    ans: 1,
    why: 'When either fails, the system goes down - manual fallback is essential.'
  },

  // FINAL ROUND
  {
    round: 3, num: 1, total: 10,
    roundLabel: 'FINAL ROUND - ALL IN',
    roundColor: '#ef4444',
    tip: 'ALL COINS ON THE LINE. Correct = double. Wrong = lose everything.',
    q: 'Which module prevents double booking across all channels?',
    opts: ['Posting Module', 'Security Module', 'Reservations Module', 'Housekeeping Module'],
    ans: 2,
    why: 'The Reservations Module manages real-time inventory across all channels.'
  },
  {
    round: 3, num: 2, total: 10,
    roundLabel: 'FINAL ROUND - ALL IN',
    roundColor: '#ef4444',
    tip: 'ALL COINS ON THE LINE. Correct = double. Wrong = lose everything.',
    q: 'What metric measures how long it takes PMS savings to cover its purchase cost?',
    opts: ['Gross Operating Profit', 'Return on Equity', 'Break-even Rate', 'Payback Period'],
    ans: 3,
    why: 'Payback period is the key metric for GM and finance controller investment decisions.'
  },
  {
    round: 3, num: 3, total: 10,
    roundLabel: 'FINAL ROUND - ALL IN',
    roundColor: '#ef4444',
    tip: 'ALL COINS ON THE LINE. Correct = double. Wrong = lose everything.',
    q: 'Why is interfacing a critical operational dependency?',
    opts: ['Makes PMS more expensive', 'One broken connection can fail entire check-in even when all other modules work', 'Allows more OTA connections', 'Replaces manual fallback procedures'],
    ans: 1,
    why: 'PMS-to-door-lock broken = guest cannot enter the room. One broken interface collapses the experience.'
  },
  {
    round: 3, num: 4, total: 10,
    roundLabel: 'FINAL ROUND - ALL IN',
    roundColor: '#ef4444',
    tip: 'ALL COINS ON THE LINE. Correct = double. Wrong = lose everything.',
    q: 'Connie (Hilton) and Marriott WeChat are both examples of what?',
    opts: ['Facial recognition systems', 'Revenue management tools', 'Intelligent chatbots for 24/7 guest support', 'IoT energy management'],
    ans: 2,
    why: 'Both are AI-powered chatbots providing round-the-clock guest support.'
  },
  {
    round: 3, num: 5, total: 10,
    roundLabel: 'FINAL ROUND - ALL IN',
    roundColor: '#ef4444',
    tip: 'ALL COINS ON THE LINE. Correct = double. Wrong = lose everything.',
    q: 'As AI takes over routine tasks, what is the new role of the GSA?',
    opts: ['Managing PMS servers', 'Shifting from processing procedures to designing guest experiences', 'Focusing exclusively on upselling', 'Taking over revenue decisions from management'],
    ans: 1,
    why: 'GSA value shifts to emotional intelligence and memorable experience creation.'
  },
  {
    round: 3, num: 6, total: 10,
    roundLabel: 'FINAL ROUND - ALL IN',
    roundColor: '#ef4444',
    tip: 'ALL COINS ON THE LINE. Correct = double. Wrong = lose everything.',
    q: 'How many minutes per room do smart housekeeping sensors save?',
    opts: ['5-10 minutes', '10-15 minutes', '20-30 minutes', '45-60 minutes'],
    ans: 2,
    why: 'IoT sensors reduce the checkout-to-readiness gap by 20-30 minutes per room.'
  },
  {
    round: 3, num: 7, total: 10,
    roundLabel: 'FINAL ROUND - ALL IN',
    roundColor: '#ef4444',
    tip: 'ALL COINS ON THE LINE. Correct = double. Wrong = lose everything.',
    q: 'What is the correct order of Needs Analysis steps?',
    opts: [
      'Build business case - Map guest journey - Identify bottlenecks',
      'Identify bottlenecks - Map guest journey - Build business case',
      'Map guest journey - Identify bottlenecks - Build business case',
      'Request vendor proposals - Map guest journey - Calculate ROI'
    ],
    ans: 2,
    why: 'Step 1: Map journey. Step 2: Identify bottlenecks. Step 3: Build business case.'
  },
  {
    round: 3, num: 8, total: 10,
    roundLabel: 'FINAL ROUND - ALL IN',
    roundColor: '#ef4444',
    tip: 'ALL COINS ON THE LINE. Correct = double. Wrong = lose everything.',
    q: 'Which green certifications does Front Office help hotels achieve?',
    opts: ['ISO 9001 and Six Sigma', 'LEED and Green Key', 'Forbes Five-Star and AAA Diamond', 'PCI-DSS and SOC 2'],
    ans: 1,
    why: 'LEED and Green Key are supported through paperless operations and energy tracking.'
  },
  {
    round: 3, num: 9, total: 10,
    roundLabel: 'FINAL ROUND - ALL IN',
    roundColor: '#ef4444',
    tip: 'ALL COINS ON THE LINE. Correct = double. Wrong = lose everything.',
    q: 'When is the Security Module key card access log consulted FIRST?',
    opts: ['Daily morning briefing', 'When a guest reports theft or a security incident', 'Monthly revenue audit', 'During new staff onboarding'],
    ans: 1,
    why: 'The log is evidentiary - it is the first place management looks when an incident occurs.'
  },
  {
    round: 3, num: 10, total: 10,
    roundLabel: 'FINAL ROUND - ALL IN',
    roundColor: '#ef4444',
    tip: 'ALL COINS ON THE LINE. Correct = double. Wrong = lose everything.',
    q: 'What does the course conclusion quote mean: "Technology handles operations but human empathy creates memorable experiences"?',
    opts: ['Invest less in technology', 'Technology handles operations but human empathy creates memorable experiences', 'Guests prefer manual check-in processes', 'Staff using technology will replace managers'],
    ans: 1,
    why: 'PMS, AI, and IoT make operations efficient but staff empathy creates lasting memories.'
  }
];
