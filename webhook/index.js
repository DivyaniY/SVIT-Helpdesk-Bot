// webhook/index.js
const express = require('express');
const cors = require('cors');
const { twiml: { MessagingResponse } } = require('twilio');

const app = express();

// ✅ CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

/* Menu Options */
const MENU = `
📌 *SVIT Helpdesk Menu*
Type a number to choose 👇

1️⃣ Admissions  
2️⃣ Courses  
3️⃣ Fees  
4️⃣ Placement  

Or type *menu* anytime ✅
`;

const MAIN = {
  "1": "📌 Admissions — Eligibility: 10+2 (PCM). Apply via ACPC/GUJCET or management quota.",
  "2": "🎓 Courses: IT, CE, EC, Mechanical, Civil, Electrical, Aeronautical, MCA, M.Tech.\nReply with branch name for details.",
  "3": "💰 Fees vary by branch & year; paid semester-wise. Contact accounts office for exact figures.",
  "4": "💼 Placement: Training & Placement cell arranges internships and campus drives."
};

const COURSES = {
  "it": "📘 IT — Software development, networking & cloud foundations.",
  "ce": "💻 CE — Algorithms, database, system design & software engineering.",
  "ec": "📡 EC — Communication, embedded systems & signal processing.",
  "civil": "🏗️ Civil — Structural engineering & construction.",
  "mechanical": "⚙️ Mechanical — CAD, thermodynamics & manufacturing."
};

// ✅ WhatsApp Response Logic
function getResponse(text){
  const t = text.toLowerCase();

  if(t === "hi" || t === "hello" || t === "menu"){
    return MENU;
  }

  if(MAIN[t]) return MAIN[t];

  for(const c in COURSES){
    if(t.includes(c)) return COURSES[c];
  }

  return "❓ I didn't get that.\nSend *menu* to see available options ✅";
}

/* ✅ Twilio WhatsApp Webhook Route */
app.post('/whatsapp', (req, res) => {
  const incoming = req.body.Body || "";
  
  const twiml = new MessagingResponse();
  twiml.message(getResponse(incoming));

  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
});

// ✅ Health Check
app.get('/', (req,res)=> res.send("✅ SVIT Helpdesk WhatsApp Webhook Running"));

app.listen(PORT, () => console.log(`🚀 Webhook Live at http://localhost:${PORT}`));
