// webhook/index.js
const express = require("express");
const cors = require("cors");

const app = express();

// Accept JSON + urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Allow cross-origin (open while developing)
app.use(cors());

const PORT = process.env.PORT || 3000;

/* ---------------- Knowledge base (updated & linked to svitvasad.ac.in) -----------
   NOTE: if your site uses different department slugs, update the URLs below.
   I used logical paths like /it, /cse etc. Replace them if your site uses another path.
-----------------------------------------------------------------------------*/
const SITE_BASE = "https://svitvasad.ac.in";

const MAIN = {
  admissions: `📌 <strong>Admissions</strong><br>
Eligibility: 10+2 (as per program). Apply via the college admission portal.<br>
🔗 <a class="bot-link" href="${SITE_BASE}/admission" target="_blank">Apply / Admission Info</a>`,

  fees: `💰 <strong>Fee & Payment</strong><br>
Fees vary by program & year. Use the college online fees system:<br>
🔗 <a class="bot-link" href="${SITE_BASE}/online-fees" target="_blank">Online Fees Payment</a>`,

  events: `🎪 <strong>Events & News</strong><br>
See latest events, fests & workshops on the site:<br>
🔗 <a class="bot-link" href="${SITE_BASE}/news" target="_blank">News & Events</a>`,

  hostel: `🏠 <strong>Hostel</strong><br>
Separate hostels for boys & girls with mess and Wi-Fi. For availability contact college administration.<br>
🔗 <a class="bot-link" href="${SITE_BASE}/facilities" target="_blank">Facilities & Hostels</a>`,

  transport: `🚌 <strong>Transport</strong><br>
College buses operate on specified routes — contact college admin for routes and timings.`,

  library: `📚 <strong>Library</strong><br>
SVIT library provides text/reference books and e-journals.<br>
🔗 <a class="bot-link" href="https://svit-opac.lsie.in" target="_blank">Library OPAC / e-resources</a>`,

  placement: `💼 <strong>Training & Placement</strong><br>
Training & Placement cell coordinates internships and campus placements.<br>
🔗 <a class="bot-link" href="${SITE_BASE}/training-placement" target="_blank">Placement & Career</a>`,

  "exams/results": `📝 <strong>Exams & Results</strong><br>
GTU/department result links and exam notices:<br>
🔗 <a class="bot-link" href="https://www.gtu.ac.in" target="_blank">GTU Portal (results)</a>`,

  contact: `☎️ <strong>Contact & Helpline</strong><br>
Phone: +91-9510782981<br>
Email: contact@svitvasad.ac.in<br>
Website: <a class="bot-link" href="${SITE_BASE}" target="_blank">${SITE_BASE}</a><br>
Direct contact page: <a class="bot-link" href="${SITE_BASE}/contact-us" target="_blank">${SITE_BASE}/contact-us</a>`
};

/* ---------------- Course pages (short summaries + links) ------------------ */
const COURSES = {
  it: `💻 <strong>Information Technology (IT)</strong><br>
Focus: Software engineering, data, networks, cloud & modern development workflows.<br>
🔗 <a class="bot-link" href="${SITE_BASE}/it" target="_blank">Department / IT</a>`,

  ce: `🖥 <strong>Computer Engineering (CE)</strong><br>
Focus: Systems, algorithms, OS, web, software engineering and projects.<br>
🔗 <a class="bot-link" href="${SITE_BASE}/cse" target="_blank">Department / Computer Engineering</a>`,

  ec: `📡 <strong>Electronics & Communication (EC)</strong><br>
Focus: Analog/digital comms, embedded systems, IoT, VLSI basics.<br>
🔗 <a class="bot-link" href="${SITE_BASE}/ec" target="_blank">Department / EC</a>`,

  mechanical: `⚙️ <strong>Mechanical Engineering</strong><br>
Focus: Thermodynamics, manufacturing, CAD/CAM, production labs.<br>
🔗 <a class="bot-link" href="${SITE_BASE}/mechanical" target="_blank">Department / Mechanical</a>`,

  civil: `🏗️ <strong>Civil Engineering</strong><br>
Focus: Structural design, surveying, construction management.<br>
🔗 <a class="bot-link" href="${SITE_BASE}/civil" target="_blank">Department / Civil</a>`,

  electrical: `🔌 <strong>Electrical Engineering</strong><br>
Focus: Electrical machines, power systems & control systems.<br>
🔗 <a class="bot-link" href="${SITE_BASE}/electrical" target="_blank">Department / Electrical</a>`,

  aeronautical: `✈️ <strong>Aeronautical Engineering</strong><br>
Focus: Aerodynamics, propulsion basics & aircraft structures.<br>
🔗 <a class="bot-link" href="${SITE_BASE}/aero" target="_blank">Department / Aeronautical</a>`,

  mca: `🎓 <strong>MCA</strong> — Postgraduate program in applied computing.<br>
🔗 <a class="bot-link" href="${SITE_BASE}/mca" target="_blank">MCA Dept / Info</a>`,

  "m.tech": `🎓 <strong>M.Tech</strong> — Postgraduate specializations (check department pages).<br>
🔗 <a class="bot-link" href="${SITE_BASE}" target="_blank">${SITE_BASE}</a>`
};

/* ---------------- resolver ---------------- */
function getReply(text){
  if(!text) return "Please ask about Admissions, Courses, Fees, Hostel, Placement, or type 'Courses' to see departments.";

  const q = text.toString().trim().toLowerCase();

  // greetings
  if(/^(hi|hello|hey|hii|good morning|good afternoon|good evening)\b/.test(q)) {
    return `👋 Hello! I can help with Admissions, Courses, Fees, Events & more. Type a topic or choose from suggestions. Type <strong>Courses</strong> to open the departments menu.`;
  }

  // courses (exact match or includes department name)
  for(const k of Object.keys(COURSES)){
    if(q === k || q.includes(k) || q.includes(k.replace(".",""))){
      return COURSES[k];
    }
  }

  // main mapping
  for(const k of Object.keys(MAIN)){
    const keyword = k.split("/")[0]; // "exams" from "exams/results"
    if(q.includes(keyword) || q === keyword){
      return MAIN[k];
    }
  }

  // direct keyword checks
  if(/admission|apply|admissions/.test(q)) return MAIN.admissions;
  if(/fee|fees|tuition/.test(q)) return MAIN.fees;
  if(/hostel/.test(q)) return MAIN.hostel;
  if(/placement|internship|training/.test(q)) return MAIN.placement;
  if(/exam|result|gtu/.test(q)) return MAIN["exams/results"];
  if(/library/.test(q)) return MAIN.library;
  if(/contact|phone|email/.test(q)) return MAIN.contact;

  // fallback
  return `I don't have that detail yet. Try one of: <strong>Admissions</strong>, <strong>Courses</strong>, <strong>Fees</strong>, <strong>Placement</strong>.`;
}

/* ----------- frontend webhook (JSON) ---------- */
app.post("/webhook", (req, res) => {
  const query = (req.body.query || req.body.text || req.body.Body || "").toString();
  const reply = getReply(query);
  // return plain text (frontend converts \n to <br>)
  res.json({ reply });
});

/* ----------- WhatsApp/Twilio webhook (TwiML) ----------
   We return XML manually (no twilio lib) so no package mismatch during deploy.
   Twilio expects application/xml or text/xml with <Response><Message>text</Message></Response>
--------------------------------------------------*/
app.post("/whatsapp", (req, res) => {
  const incoming = (req.body.Body || "").toString();
  const reply = getReply(incoming);
  // TwiML with escaped content: Twilio will treat text, not HTML.
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message><![CDATA[${stripHtmlForWhatsApp(reply)}]]></Message></Response>`;
  res.type("text/xml");
  res.send(twiml);
});

// helper: remove HTML tags for WhatsApp responses (Twilio / WhatsApp should receive plain text)
function stripHtmlForWhatsApp(html){
  // keep link text + URL separately
  let text = html.replace(/<br\s*\/?>/ig, "\n");
  // replace anchor tags with "title — url"
  text = text.replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/ig, (m, href, title) => `${title} — ${href}`);
  // remove remaining tags
  text = text.replace(/<\/?[^>]+(>|$)/g, "");
  return text;
}

/* ----------- root ping ---------- */
app.get("/", (_, res) => res.send("✅ SVIT Helpdesk webhook running"));

app.listen(PORT, ()=> console.log(`✅ Running on port ${PORT}`));

