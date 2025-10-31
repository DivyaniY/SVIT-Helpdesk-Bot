const express = require("express");
const cors = require("cors");
const { twiml: { MessagingResponse } } = require("twilio");

const app = express();

// ✅ Fix CORS fully
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// ✅ Knowledge Base
const MAIN = {
  admissions: "📌 Admissions — Eligibility: 10+2 (PCM). Apply via ACPC/GUJCET or management quota. Visit https://svitvasad.ac.in",
  courses: "🎓 Courses Offered: IT, CE, EC, Mechanical, Civil, Electrical, Aeronautical, MCA, M.Tech",
  fees: "💰 Fees vary by branch & year; contact accounts office for exact figures.",
  hostel: "🏠 Hostels available with Wi-Fi & mess facilities.",
  placement: "💼 Placement — Strong industry connect with internships & drives",
  events: "🎪 Events: Prakarsh (Tech), Vrund (Cultural), Workshops",
  transport: "🚌 College buses available from various routes",
  library: "📚 Library with books, e-journals & long hours",
  contact: "☎ Contact Office: Check https://svitvasad.ac.in/contact-us"
};

const COURSES = {
  it: "📘 IT — Software development, Data, Cloud basics",
  ce: "💻 CE — Algorithms, Systems, Web & Software Engineering",
  ec: "📡 EC — Communication, IoT & VLSI basics"
};

// ✅ Smart Reply Resolver
function resolve(text) {
  if (!text) return { reply: "Please ask about Admissions, Courses, Fees..." };

  const q = text.toLowerCase();

  if (q.match(/hi|hey|hello/)) {
    return { reply: "👋 Hi! Ask about Admissions, Courses, Fees & more!" };
  }

  for (const k in COURSES) {
    if (q.includes(k)) return { reply: COURSES[k] };
  }

  for (const k in MAIN) {
    if (q.includes(k)) return { reply: MAIN[k] };
  }

  return { reply: "I don't have that info yet. Try: *Admissions, Courses, Fees, Hostel* ✅" };
}

// ✅ Frontend Webhook API
app.post("/webhook", (req, res) => {
  const question = req.body.query || req.body.text || req.body.Body || "";
  const { reply } = resolve(question);
  return res.json({ reply });
});

// ✅ WhatsApp (Twilio) Webhook
app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const incoming = req.body.Body || "";
  const { reply } = resolve(incoming);

  twiml.message(reply + "\n\nType *menu* anytime ✅");

  res.set("Content-Type", "text/xml");
  return res.send(twiml.toString());
});

// ✅ Root
app.get("/", (_, res) => res.send("✅ SVIT Webhook Running!"));

app.listen(PORT, () => console.log(`✅ Running on ${PORT}`));
