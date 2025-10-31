const express = require("express");
const cors = require("cors");
const { twiml: { MessagingResponse } } = require("twilio");

const app = express();

app.use(cors({
  origin: [
    "https://svit-helpdesk-bot.vercel.app",
    "https://svit-helpdesk-bot1.onrender.com",
    "http://localhost:5500",
    "http://localhost:3000"
  ]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

/* ✅ MAIN INFORMATION */
const MAIN = {
  admissions: "📌 Admissions:\nEligibility: 10+2 with PCM.\nApply via ACPC or Management Quota.\nVisit admission office for guidance.",
  fees: "💰 Fees vary each year.\nVisit Accounts Office for the latest structure.",
  placement: "💼 Training & Placement:\nInternships + campus recruitment support.\nTop IT, Core & Govt. companies visited.",
  hostel: "🏠 Hostel Facilities:\nSeparate Boys/Girls hostel.\nIncludes Wi-Fi, gym & mess facilities.",
  events: "🎪 Campus Life:\nTech Fest: Prakarsh\nCultural Fest: Vrund\nSports tournaments every year!",
  transport: "🚌 Transport:\nCollege buses available from major city routes.",
  library: "📚 Library:\nBooks, study spaces & e-resources available.",
  contact: "☎ Contact Details:\n📞 02692 274766\n📧 info@svitvasad.ac.in\n🌐 https://svitvasad.ac.in/contact-us",
  "exams/results": "📝 Exams & Results:\nGTU Portal:\n👉 https://www.gtu.ac.in"
};

/* ✅ COURSE INFORMATION — Medium Style */
const COURSES = {
  it: "💻 Information Technology (IT)\nFocus: Software Development, AI/ML, Cloud, Data.",
  ce: "🖥 Computer Engineering (CE)\nFocus: Systems, OS, Web, Cybersecurity, Databases.",
  ec: "📡 Electronics & Communication (EC)\nFocus: IoT, VLSI, Communication Systems.",
  mechanical: "⚙️ Mechanical Engineering\nFocus: Design, Manufacturing, CAD/CAM, Thermodynamics.",
  civil: "🏗 Civil Engineering\nFocus: Building Design, Planning, Surveying.",
  electrical: "🔌 Electrical Engineering\nFocus: Power Systems, Industrial Automation.",
  aeronautical: "✈️ Aeronautical Engineering\nFocus: Aircraft Structure, Aerodynamics.",
  mca: "🎓 MCA\nPostgraduate IT specialization with software development focus.",
  "m.tech": "🎓 M.Tech\nAdvanced postgraduate with specialization options."
};

/* ✅ Reply Resolver */
function getReply(text) {
  if (!text) return "Ask about: Admissions, Courses, Fees ✅";

  const q = text.toLowerCase();

  if (/hi|hello|hey/.test(q))
    return "👋 Hello! Ask about Admissions, Courses, Fees, Hostel, Placement ✅";

  for (const key in COURSES)
    if (q.includes(key)) return COURSES[key];

  for (const key in MAIN)
    if (q.includes(key.split("/")[0])) return MAIN[key];

  return "I don’t have that yet. Try: Admissions, Courses, Hostel, Placement ✅";
}

/* ✅ Web Frontend Webhook */
app.post("/webhook", (req, res) => {
  const query = req.body.query || "";
  const reply = getReply(query);
  res.json({ reply });
});

/* ✅ WhatsApp Webhook */
app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const reply = getReply(req.body.Body || "");
  twiml.message(reply + "\n\nSend *Menu* anytime ✅");
  res.type("text/xml");
  res.send(twiml.toString());
});

/* ✅ Test Route */
app.get("/", (_, res) => res.send("✅ SVIT Backend Running"));

app.listen(PORT, () => console.log(`✅ Backend Live → PORT ${PORT}`));
