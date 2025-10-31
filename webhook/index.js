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

/* ✅ MAIN INFORMATION — ALL UPDATED */
const MAIN = {
  admissions: `
📌 <b>Admissions</b><br><br>
🎯 <b>ACPC (Merit-Based)</b><br>
• Requires 10+2 with PCM<br>
• GUJCET + Board marks considered<br>
• Online counselling through ACPC<br>
• Seats allotted as per merit<br><br>

🏫 <b>Management Quota</b><br>
• Direct admission available<br>
• Based on 10+2 eligibility<br>
• Contact college for seat availability<br><br>

📍 SVIT Admission Help Desk<br>
📞 02692 274766
`,

  fees: `
💰 <b>Fees</b><br><br>
• Fees differ every academic year<br>
• Contact Accounts Office for latest details<br><br>
📍 SVIT Campus Accounts Office
`,

  hostel: `
🏠 <b>Hostel Facilities</b><br><br>
• Separate Boys & Girls Hostels<br>
• Wi-Fi, Security, Mess facility<br>
• On-campus accommodation<br>
`,

  placement: `
💼 <b>Training & Placement</b><br><br>
• Internships + On-Campus Drives<br>
• IT + Core company recruitment<br>
• Career Guidance support<br>
`,

  events: `
🎪 <b>Campus Events</b><br><br>
• Technical Fest – Prakarsh<br>
• Cultural Fest – Vrund<br>
• Sports competitions 🏆<br>
`,

  transport: `
🚌 <b>Transport</b><br><br>
• College buses available from major routes<br>
• Contact Transport Office for bus pass<br>
`,

  library: `
📚 <b>Library & Learning</b><br><br>
• Books + Digital Resources<br>
• Study space available Mon–Sat<br>
`,

  "exams/results": `
📝 <b>Exams & Results</b><br><br>
View GTU Official Portal:<br>
👉 <a class="bot-link" href="https://www.gtu.ac.in" target="_blank">https://www.gtu.ac.in</a>
`,

  contact: `
☎ <b>Contact SVIT</b><br><br>
📞 02692 274766<br>
📧 info@svitvasad.ac.in<br>
🌐 <a class="bot-link" href="https://svitvasad.ac.in/contact-us" target="_blank">svitvasad.ac.in/contact-us</a>
`
};

/* ✅ COURSE INFORMATION — CLEAN (NO LINKS) */
const COURSES = {
  it: "💻 <b>Information Technology (IT)</b><br>Software, AI/ML, Data, Cloud",
  ce: "🖥 <b>Computer Engineering (CE)</b><br>Systems, OS, Web, Cybersecurity",
  ec: "📡 <b>Electronics & Communication (EC)</b><br>IoT, VLSI, Networking",
  mechanical: "⚙️ <b>Mechanical Engineering</b><br>Design, CAD/CAM, Manufacturing",
  civil: "🏗 <b>Civil Engineering</b><br>Construction, Planning, Survey",
  electrical: "🔌 <b>Electrical Engineering</b><br>Power Systems, Automation",
  aeronautical: "✈️ <b>Aeronautical Engineering</b><br>Aircraft Structure & Design",
  mca: "🎓 <b>MCA</b><br>Advanced Computing & Software",
  "m.tech": "🎓 <b>M.Tech</b><br>Postgraduate Specializations"
};

/* ✅ Reply Matching Logic */
function getReply(text) {
  if (!text) return "Ask about: Admissions, Courses, Fees ✅";
  const q = text.toLowerCase();

  if (/hi|hello|hey/.test(q))
    return "👋 Hello! Ask about Admissions, Courses, Fees, Hostel, Placement ✅";

  for (const key in COURSES)
    if (q.includes(key)) return COURSES[key];

  for (const key in MAIN)
    if (q.includes(key.split("/")[0])) return MAIN[key];

  return "I don’t have that yet 😅 Try: Admissions, Courses, Hostel, Placement ✅";
}

/* ✅ Web Chatbot Route */
app.post("/webhook", (req, res) => {
  const query = req.body.query || "";
  const reply = getReply(query);
  res.json({ reply });
});

/* ✅ WhatsApp Chat Route*/
app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const reply = getReply(req.body.Body || "");
  twiml.message(reply + "\n\nSend *Menu* anytime ✅");
  res.type("text/xml");
  res.send(twiml.toString());
});

/* ✅ Check Server */
app.get("/", (_, res) => res.send("✅ SVIT Backend Running Successfully"));

app.listen(PORT, () =>
  console.log(`✅ Backend Live → PORT: ${PORT}`)
);
