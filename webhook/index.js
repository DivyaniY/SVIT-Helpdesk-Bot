// webhook/index.js
const express = require('express');
const cors = require('cors');
const { twiml: { MessagingResponse } } = require('twilio');

const app = express();

// ✅ CORS FIX
app.use(cors({
  origin: [
    "https://svit-helpdesk-bot.vercel.app",  // ✅ your deployed frontend
    "http://localhost:5500"
  ],
  methods: ["GET", "POST"]
}));

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
  contact: "☎️ Contact: Official contact details are on https://svitvasad.ac.in/contact-us"
};

const COURSES = {
  it: "📘 IT — Modern software development, data basics, networking & cloud foundations.",
  ce: "💻 CE — Computer systems, algorithms, software engineering & projects.",
  ec: "📡 EC — Analog & digital communications, embedded systems & signal processing basics.",
  mechanical: "⚙️ Mechanical — Thermodynamics, manufacturing, CAD & practical labs.",
  civil: "🏗️ Civil — Structural engineering, surveying & construction fundamentals.",
  electrical: "🔌 Electrical — Power systems, electrical machines & control systems.",
  aeronautical: "✈️ Aeronautical — Aerodynamics, propulsion basics & aircraft structures.",
  mca: "🎓 MCA — Advanced software development & applied computing (postgraduate).",
  "m.tech": "🎓 M.Tech — Postgraduate programs; check department pages for specializations."
};

/* Intent resolver */
function resolve(text){
  if(!text) return { reply: "Please type a question (Admissions, Courses, IT, Fees...)" };
  const t = text.toLowerCase();

  for(const k in COURSES) if(t.includes(k)) return { reply: COURSES[k] };
  for(const k in MAIN) if(t.includes(k.split('/')[0])) return { reply: MAIN[k] };

  if(/hi|hello|hey/.test(t)) return { reply: "👋 Hi! Ask about Admissions, Courses, Fees & more!" };

  return { reply: "I don't have this info yet. Try: Admissions, Courses, Hostel, Exams ✅" };
}

/* Routes */
app.get('/', (req,res)=> res.send("✅ SVIT Helpdesk Webhook Running"));

app.post('/webhook',(req,res)=>{
  const q = req.body.query || req.body.text || req.body.Body || "";
  res.json({ reply: resolve(q).reply });
});

/* WhatsApp Bot Route */
app.post('/whatsapp',(req,res)=>{
  const incoming = req.body.Body || "";
  const twiml = new MessagingResponse();
  twiml.message(resolve(incoming).reply);
  res.set('Content-Type','text/xml');
  res.send(twiml.toString());
});

app.listen(PORT, ()=> console.log(`✅ Webhook Live on http://localhost:${PORT}`));
