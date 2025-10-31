const express = require('express');
const cors = require('cors');
const { twiml: { MessagingResponse } } = require('twilio');

const app = express();

app.use(cors({
  origin: [
    "https://svit-helpdesk-bot.vercel.app",
    "http://localhost:5500"
  ],
  methods: ["GET", "POST"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

/* MAIN MENU CONTENT */
const MAIN = {
  admissions: "📌 *Admissions*\nEligibility: 10+2 (PCM)\nVia ACPC/GUJCET or Management Quota.\nApply at ✅ https://svitvasad.ac.in",
  fees: "💰 *College Fees*\nDepends on branch & year.\nPaid semester-wise.\nContact accounts office for accurate fee structure.",
  placement: "💼 *Placements*\n100+ companies visit yearly.\nTNP cell provides soft-skills, internships, mock interviews.\nAverage Package: 📈 Good!",
  hostel: "🏠 *Hostel Facilities*\nSeparate Boys & Girls hostels.\nIncludes mess & Wi-Fi.\nContact accommodation office for more info.",
  contact: "☎️ *Contact College*\nWebsite: https://svitvasad.ac.in/contact-us\nPhone: 📞 +91-0000000000"
};

/* COURSE SUBMENU DATA */
const COURSES = {
  it: "📘 *IT Engineering*\nSoftware Dev · Cloud · Cybersecurity · Data · ML",
  ce: "💻 *Computer Engineering*\nAlgorithms · DBMS · OS · AI · Web Tech",
  ec: "📡 *Electronics & Communication*\nVLSI · Embedded · Signal Processing",
  mechanical: "⚙️ *Mechanical Engineering*\nDesign · CAD/CAM · Manufacturing",
  civil: "🏗️ *Civil Engineering*\nSurveying · Structural · Construction",
  electrical: "🔌 *Electrical Engineering*\nMachines · Power Systems · Control",
  aeronautical: "✈️ *Aeronautical Engineering*\nAerodynamics · Aircraft Structures",
  mca: "🎓 *MCA*\nAdvanced Computing · Software Engineering",
  "m.tech": "🎓 *M.Tech*\nPG Specialized Engineering Courses"
};

/* HELPER FUNCTION */
function resolve(text) {
  const t = text.toLowerCase();

  if (COURSES[t]) return COURSES[t];
  if (MAIN[t]) return MAIN[t];

  if (/hi|hello|hey|menu|start/.test(t)) return "menu";

  return "unknown";
}

/* ✅ Frontend Webhook */
app.post('/webhook', (req, res) => {
  const q = req.body.query || req.body.text || "";
  const r = resolve(q);

  if (r === "menu") {
    return res.json({
      reply: "📌 Choose: Admissions, Courses, Fees, Placement, Hostel, Contact ✅"
    });
  }

  res.json({ reply: r === "unknown" ? "Type *menu* to see options ✅" : r });
});

/* ✅ WhatsApp Interactive Bot */
app.post("/whatsapp", (req, res) => {
  const incoming = (req.body.Body || "").toLowerCase();
  const response = resolve(incoming);
  const twiml = new MessagingResponse();

  /* ✅ MAIN MENU */
  if (response === "menu") {
    const msg = twiml.message("📌 SVIT Helpdesk\nSelect option 👇");

    msg.addInteractive({
      type: "button",
      body: { text: "How can I help you?" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "admissions", title: "Admissions" } },
          { type: "reply", reply: { id: "courses", title: "Courses" } },
          { type: "reply", reply: { id: "fees", title: "Fees" } },
          { type: "reply", reply: { id: "placement", title: "Placement" } }
        ]
      }
    });

  }

  /* ✅ COURSES SUBMENU */
  else if (incoming === "courses") {
    const msg = twiml.message("🎓 Choose a Branch 👇");

    msg.addInteractive({
      type: "button",
      body: { text: "Available Branches" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "it", title: "IT" } },
          { type: "reply", reply: { id: "ce", title: "CE" } },
          { type: "reply", reply: { id: "ec", title: "EC" } }
        ]
      }
    });
  }

  /* ✅ Respond to MAIN or SUB INFO */
  else if (response !== "unknown") {
    twiml.message(response + "\n\n👉 Type *menu* to go back");
  }

  /* Default Response */
  else {
    twiml.message("❓ I don't understand.\nType *menu* to see options ✅");
  }

  res.set("Content-Type", "text/xml");
  res.send(twiml.toString());
});

app.get("/", (req, res) => res.send("✅ SVIT Helpdesk Webhook Running"));

app.listen(PORT, () => console.log(`✅ Running at http://localhost:${PORT}`));
