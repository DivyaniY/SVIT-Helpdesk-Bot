const express = require("express");
const cors = require("cors");
const { twiml: { MessagingResponse } } = require("twilio");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// ✅ Submenu Knowledge
const INFO = {
  admissions: {
    eligibility: "✅ Eligibility → 10+2 (PCM)\nAdmission via GUJCET / ACPC",
    documents: "📄 Required Docs → 10th/12th Marksheet, Aadhar ID, Photos",
    process: "📝 Fill ACPC form → Attend counselling → Seat allotment",
    dates: "📅 Dates vary yearly. Check https://svitvasad.ac.in"
  },
  fees: {
    branches: "💰 Branch-wise Fees → CE/IT: ₹80K per semester approx",
    hostel: "🏠 Hostel Fees → ₹70K yearly incl. mess",
    transport: "🚌 Transport Fees → ₹25K approx depending route"
  },
  placement: {
    recruiters: "🏢 Recruiters → TCS, Wipro, E-infochips, L&T, Tata",
    stats: "📊 Avg Package → 3.8 LPA\nHighest → 7 LPA",
    training: "🧑‍🏫 Aptitude + Soft Skill + Technical Training provided"
  },
  exams: {
    internal: "📘 Two internal exams each semester",
    gtu: "🔹 GTU external exam schedule on https://www.gtu.ac.in",
    backlogs: "♻ Allowed to reappear in backlog subjects"
  },
  hostel: {
    facilities: "🛏️ WiFi, Hot Water, CCTV, Mess included",
    rules: "📌 10PM entry deadline, no outside stay without permission"
  },
  transport: {
    routes: "🚌 Buses available from Anand, Vadodara & nearby villages"
  },
  library: {
    hours: "⌛ Mon–Sat: 8AM–8PM",
    eResources: "💻 Online journal access available"
  },
  contact: {
    location: "📍 SVIT, Vasad, Gujarat",
    phone: "☎ +91 12345 67890"
  }
};

// ✅ Smart Resolver
function resolve(text) {
  if (!text) return "Ask anything from menu 🙂";
  const q = text.toLowerCase();

  // Identify main category
  for (const cat in INFO) {
    if (q.includes(cat)) return "Select one: " + Object.keys(INFO[cat]).join(", ");
  }

  // Identify submenu selection
  for (const cat in INFO) {
    for (const sub in INFO[cat]) {
      if (q.includes(sub)) return INFO[cat][sub];
    }
  }

  return "Try using menu buttons ✅";
}

// ✅ Webhook for Website UI
app.post("/webhook", (req, res) => {
  const q = req.body.query || req.body.text || "";
  const reply = resolve(q);
  return res.json({ reply });
});

// ✅ WhatsApp Webhook
app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const q = req.body.Body || "";
  const reply = resolve(q);
  twiml.message(reply + "\n\nType *menu* anytime ✅");
  res.set("Content-Type", "text/xml");
  return res.send(twiml.toString());
});

app.get("/", (_, res) => res.send("✅ SVIT Webhook OK"));
app.listen(PORT, () => console.log(`✅ Running @ ${PORT}`));
