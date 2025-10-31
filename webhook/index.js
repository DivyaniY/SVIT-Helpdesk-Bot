// webhook/index.js
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

/* ---------- DATA (HTML for web) ---------- */
const MAIN_HTML = {
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
• On-campus accommodation
  `,
  placement: `
💼 <b>Training & Placement</b><br><br>
• Internships + On-Campus Drives<br>
• IT + Core company recruitment<br>
• Career Guidance support<br><br>
🌐 <a class="bot-link" href="https://svitvasad.ac.in/placement-cell/" target="_blank">Placement Cell (website)</a>
  `,
  events: `
🎪 <b>Campus Events</b><br><br>
• Technical Fest – Prakarsh<br>
• Cultural Fest – Vrund<br>
• Sports competitions 🏆
  `,
  transport: `
🚌 <b>Transport</b><br><br>
• College buses available from major routes<br>
• Contact Transport Office for bus pass
  `,
  library: `
📚 <b>Library & Learning</b><br><br>
• Books + Digital Resources<br>
• Study space available Mon–Sat
  `,
  "exams/results": `
📝 <b>Exams & Results</b><br><br>
GTU Official Portal:<br>
👉 <a class="bot-link" href="https://www.gtu.ac.in" target="_blank">https://www.gtu.ac.in</a>
  `,
  contact: `
☎ <b>Contact SVIT</b><br><br>
📞 02692 274766<br>
📧 info@svitvasad.ac.in<br>
🌐 <a class="bot-link" href="https://svitvasad.ac.in/contact-us" target="_blank">svitvasad.ac.in/contact-us</a>
  `
};

const COURSES_HTML = {
  it: `💻 <b>Information Technology (IT)</b><br>Software, AI/ML, Data, Cloud`,
  ce: `🖥 <b>Computer Engineering (CE)</b><br>Systems, OS, Web, Cybersecurity`,
  ec: `📡 <b>Electronics & Communication (EC)</b><br>IoT, VLSI, Networking`,
  mechanical: `⚙️ <b>Mechanical Engineering</b><br>Design, CAD/CAM, Manufacturing`,
  civil: `🏗 <b>Civil Engineering</b><br>Construction, Planning, Survey`,
  electrical: `🔌 <b>Electrical Engineering</b><br>Power Systems, Automation`,
  aeronautical: `✈️ <b>Aeronautical Engineering</b><br>Aircraft Structure & Design`,
  mca: `🎓 <b>MCA</b><br>Advanced Computing & Software`,
  "m.tech": `🎓 <b>M.Tech</b><br>Postgraduate Specializations`
};

/* ---------- Plain text versions for WhatsApp (no HTML) ---------- */
function htmlToPlain(h) {
  // very small sanitizer: remove tags and keep URLs
  return h
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/a>/gi, '') // keep link text (the href will be added separately below if present)
    .replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, (m, url, text) => {
      // return "text - url"
      return `${text} — ${url}`;
    })
    .replace(/<[^>]+>/g, '') // remove other tags
    .replace(/\u00A0/g, ' ')
    .trim();
}

/* ---------- Matching utilities ---------- */
// use word boundary matching for keys (so 'ce' won't match 'placement')
function matchKeyWord(query, key) {
  const re = new RegExp(`\\b${escapeRegExp(key)}\\b`, 'i');
  return re.test(query);
}
function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/* ---------- reply resolver ---------- */
function getReplyVariants(text) {
  // returns { html: "...", text: "..." }
  const q = (text || '').toLowerCase().trim();
  if(!q){
    const html = `Ask about: <b>Admissions</b>, <b>Courses</b>, <b>Fees</b> ✅`;
    return { html, text: htmlToPlain(html) };
  }

  if (/\b(hi|hello|hey)\b/i.test(q)) {
    const html = `👋 Hello! Ask about <b>Admissions</b>, <b>Courses</b>, <b>Fees</b>, <b>Hostel</b>, <b>Placement</b> ✅`;
    return { html, text: htmlToPlain(html) };
  }

  // check courses first with word-boundary
  for (const k of Object.keys(COURSES_HTML)){
    if (matchKeyWord(q, k)) {
      const html = COURSES_HTML[k];
      return { html, text: htmlToPlain(html) };
    }
  }

  // check MAIN keys (keywords maybe like "exams", "results", "contact")
  for (const key of Object.keys(MAIN_HTML)) {
    // for keys with "/" (like "exams/results") match left part and right parts separately
    const kw = key.split("/")[0];
    if (matchKeyWord(q, kw) || key.includes(q)) {
      const html = MAIN_HTML[key];
      return { html, text: htmlToPlain(html) };
    }
    // also allow matching "results" or "exams"
    const parts = key.split("/");
    for (const p of parts){
      if (matchKeyWord(q, p)) {
        const html = MAIN_HTML[key];
        return { html, text: htmlToPlain(html) };
      }
    }
  }

  // fallback
  const html = `I don’t have that yet 😅\nTry: <b>Admissions</b>, <b>Courses</b>, <b>Hostel</b>, <b>Placement</b>`;
  return { html, text: htmlToPlain(html) };
}

/* ---------- Webhook (web UI) ---------- */
app.post("/webhook", (req, res) => {
  const query = (req.body.query || req.body.text || req.body.Body || "").toString();
  const v = getReplyVariants(query);
  // Return HTML-ready string (frontend already treats newline-><br> or uses innerHTML)
  return res.json({ reply: v.html });
});

/* ---------- WhatsApp (Twilio) ---------- */
app.post("/whatsapp", (req, res) => {
  const incoming = (req.body.Body || "").toString();
  const v = getReplyVariants(incoming);

  // Twilio/WhatsApp should receive plain text only (no HTML). Ensure URLs are full in text.
  const twiml = new MessagingResponse();
  let plain = v.text;

  // If the HTML had anchor tags that were converted previously, htmlToPlain preserves url after a dash — keep as-is.
  // Add short menu hint
  plain += "\n\nSend *Menu* to view options anytime.";

  twiml.message(plain);
  res.type("text/xml");
  res.send(twiml.toString());
});

/* ---------- sanity route ---------- */
app.get("/", (_, res) => res.send("✅ SVIT Backend Running"));

app.listen(PORT, () => console.log(`✅ Backend Live → PORT ${PORT}`));
