// webhook/index.js
const express = require("express");
const cors = require("cors");
const { twiml: { MessagingResponse } } = require("twilio");

const app = express();

// ✅ Allow your frontend + Twilio requests
app.use(cors({
  origin: [
    "https://svit-helpdesk-bot.vercel.app",  // Vercel
    "https://svit-helpdesk-bot1.onrender.com", // Render frontend if needed
    "http://localhost:5500",
    "http://localhost:3000"
  ]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

/* ✅ MAIN INFORMATION */
const MAIN = {
  admissions: "📌 Admissions:\nEligibility: 10+2 (PCM)\nFill ACPC form or Management Quota\n📎 More Info: https://svitvasad.ac.in",
  fees: "💰 Fees vary every year.\n📎 Up-to-date fee details:\nhttps://svitvasad.ac.in/fee-structure",
  hostel: "🏠 Hostel Facilities:\nSeparate Boys/Girls Hostel\nWi-Fi & Mess Available\n📎 Details: https://svitvasad.ac.in",
  placement: "💼 Training & Placement Cell:\nIndustry internships & drives.\n📎 https://svitvasad.ac.in/training-placement",
  events: "🎪 Campus Events:\nTech: Prakarsh\nCulture: Vrund\nSports events every year!",
  transport: "🚌 Transport available across major routes.\nContact College Admin.",
  library: "📚 Library:\nBooks + e-Resources\nOpen Mon–Sat\n📎 https://svit-opac.lsie.in",
  contact: "☎ Contact:\n📞 02692 274766\n📧 info@svitvasad.ac.in\n🌐 https://svitvasad.ac.in/contact-us",
  "exams/results": "📝 Exams & Results:\nGTU official portal:\n👉 https://www.gtu.ac.in"
};

/* ✅ COURSE INFORMATION */
const COURSES = {
  it: "💻 **Information Technology (IT)**\nSoftware, AI/ML, Cloud & Data\n📎 https://svitvasad.ac.in/it",
  ce: "🖥 **Computer Engineering (CE)**\nAI, Cybersecurity, Databases\n📎 https://svitvasad.ac.in/cse",
  ec: "📡 **Electronics & Communication (EC)**\nIoT, VLSI, Communication Systems\n📎 https://svitvasad.ac.in/ec",
  mechanical: "⚙️ **Mechanical Engineering**\nCAD/CAM, Thermodynamics, Production\n📎 https://svitvasad.ac.in/mechanical",
  civil: "🏗 **Civil Engineering**\nConstruction, Planning, Surveying\n📎 https://svitvasad.ac.in/civil",
  electrical: "🔌 **Electrical Engineering**\nPower Systems, Automation\n📎 https://svitvasad.ac.in/electrical",
  aeronautical: "✈️ **Aeronautical Engineering**\nAircraft Structures & Design\n📎 https://svitvasad.ac.in/aero",
  mca: "🎓 **MCA** — Postgraduate Computing Program\n📎 https://svitvasad.ac.in/mca",
  "m.tech": "🎓 **M.Tech Programs**\nSpecializations available\n📎 https://svitvasad.ac.in"
};

/* ✅ Reply Resolver */
function getReply(text) {
  if (!text) return "Ask about: Admissions, Courses, Fees ✅";
  const q = text.toLowerCase();

  if (/hi|hello|hey/.test(q))
    return "👋 Hello! I can help with Admissions, Courses, Fees, Placements & more!";

  for (const key in COURSES)
    if (q.includes(key)) return COURSES[key];

  for (const key in MAIN)
    if (q.includes(key.split("/")[0])) return MAIN[key];

  return "I don’t have that yet 😅\nTry: *Admissions, Courses, Hostel, Placement* ✅";
}

/* ✅ Frontend Webhook */
app.post("/webhook", (req, res) => {
  const query = req.body.query || "";
  const reply = getReply(query);
  res.json({ reply });
});

/* ✅ WhatsApp Integration (optional now) */
app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const reply = getReply(req.body.Body || "");
  twiml.message(reply + "\n\nSend *Menu* to view options ✅");
  res.type("text/xml");
  res.send(twiml.toString());
});

/* ✅ Server Test */
app.get("/", (_, res) => res.send("✅ SVIT Backend Running Successfully"));

app.listen(PORT, () =>
  console.log(`✅ Backend Live → PORT: ${PORT}`)
);
