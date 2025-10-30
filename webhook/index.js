// webhook/index.js
const express = require('express');
const cors = require('cors');
const { twiml: { MessagingResponse } } = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

/* Knowledge */
const MAIN = {
  admissions: "📌 Admissions — Eligibility: 10+2 (PCM). Apply via ACPC/GUJCET or management quota. Documents: 10th & 12th marksheets, ID proof, passport-size photos. Visit https://svitvasad.ac.in for updates.",
  courses: "🎓 Courses Offered: IT, CE, EC, Mechanical, Civil, Electrical, Aeronautical, MCA, M.Tech. Select a department for brief details.",
  fees: "💰 Fees: Varies by branch & year; paid semester-wise. Contact accounts office for exact figures.",
  events: "🎪 Events: Prakarsh (Tech Fest), Vrund (Cultural) and workshops throughout the year.",
  hostel: "🏠 Hostels: Separate boys & girls hostels with mess & Wi-Fi; contact accommodation office for availability.",
  transport: "🚌 Transport: College buses run on city routes; contact transport office for routes & timings.",
  library: "📚 Library: Textbooks, reference books & e-resources. Open Mon–Sat.",
  placement: "💼 Placement: Training & Placement cell arranges internships, soft-skill training and campus drives.",
  "exams/results": "📝 Exams & Results: Conducted per GTU schedule; results on GTU/college portals.",
  contact: "☎️ Contact: Official contact details are on https://svitvasad.ac.in/contact-us",
  campus: "🌳 Campus Life: Clubs, technical societies, sports and cultural activities.",
  scholarships: "🎓 Scholarships: Merit & government scholarships are available; check accounts office.",
  facilities: "🏫 Facilities: Labs, workshops, library, Wi-Fi, canteen and medical room."
};

const COURSES = {
  it: "📘 IT — Modern software development, data basics, networking & cloud foundations.",
  ce: "💻 CE — Computer systems, algorithms, software engineering & projects.",
  ec: "📡 EC — Analog & digital comms, embedded systems and signal processing basics.",
  mechanical: "⚙️ Mechanical — Thermodynamics, manufacturing, CAD and practical labs.",
  civil: "🏗️ Civil — Structural engineering, surveying and construction fundamentals.",
  electrical: "🔌 Electrical — Power systems, electrical machines & control systems.",
  aeronautical: "✈️ Aeronautical — Aerodynamics, propulsion basics & aircraft structures.",
  mca: "🎓 MCA — Advanced software development & applied computing (postgraduate).",
  "m.tech": "🎓 M.Tech — Postgraduate programs; check department pages for specializations."
};

/* Intent resolver */
function resolve(text){
  if(!text) return { reply: "Please type a question (Admissions, Courses, IT, Fees...)" };
  const t = text.toString().trim().toLowerCase();

  // branches exact
  for(const k of Object.keys(COURSES)){
    if(t === k || t.includes(k)) return { reply: COURSES[k] };
  }
  // synonyms
  if(t === 'it' || t.includes('information technology')) return { reply: COURSES['it'] };
  if(t.includes('computer') || t === 'ce' || t === 'cse') return { reply: COURSES['ce'] };
  if(t.includes('electro') || t === 'ec') return { reply: COURSES['ec'] };
  if(t.includes('mechanical') || t === 'mech') return { reply: COURSES['mechanical'] };
  if(t.includes('civil') || t === 'cv') return { reply: COURSES['civil'] };
  if(t.includes('electrical') || t === 'ee') return { reply: COURSES['electrical'] };
  if(t.includes('aero') || t.includes('aeronaut')) return { reply: COURSES['aeronautical'] };
  if(t.includes('mca')) return { reply: COURSES['mca'] };
  if(t.includes('m.tech') || t.includes('mtech')) return { reply: COURSES['m.tech'] };

  // main mapping
  for(const k of Object.keys(MAIN)){
    if(t.includes(k.split('/')[0])) return { reply: MAIN[k] };
  }

  // direct keywords
  if(/admission/.test(t)) return { reply: MAIN.admissions };
  if(/course|branch/.test(t)) return { reply: MAIN.courses };
  if(/fee|tuition/.test(t)) return { reply: MAIN.fees };
  if(/event|prakarsh|vrund/.test(t)) return { reply: MAIN.events };
  if(/hostel/.test(t)) return { reply: MAIN.hostel };
  if(/transport|bus/.test(t)) return { reply: MAIN.transport };
  if(/library|book/.test(t)) return { reply: MAIN.library };
  if(/place|placement|internship/.test(t)) return { reply: MAIN.placement };
  if(/exam|result|gtu/.test(t)) return { reply: MAIN["exams/results"] };
  if(/contact|phone|email/.test(t)) return { reply: MAIN.contact };

  // greeting
  if(/^(hi|hello|hey|hii)$/i.test(t)) return { reply: "👋 Hi! I can help with Admissions, Courses, Fees and more. Tap a suggestion or type your question." };

  return { reply: "Sorry, I don't have that info right now. Try: Admissions, Courses, Fees, Hostel, Library or Exams." };
}

/* routes */
app.get('/', (req,res) => res.send('SVIT webhook running'));
app.post('/webhook',(req,res)=>{
  const q = (req.body.query || req.body.text || req.body.Body || '').toString();
  const r = resolve(q);
  res.json({ reply: r.reply });
});

/* Twilio WhatsApp endpoint */
app.post('/whatsapp',(req,res)=>{
  const incoming = (req.body.Body || '').toString();
  const r = resolve(incoming);
  const twiml = new MessagingResponse();
  twiml.message(r.reply);
  res.set('Content-Type','text/xml');
  res.send(twiml.toString());
});

app.listen(PORT, ()=> console.log(`SVIT webhook listening on http://localhost:${PORT}`));
