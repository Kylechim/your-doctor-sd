import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ALL_DOCTORS, COLORS as C } from "../data/doctors";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 660);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 660);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

const EXTENDED = {
  education: "UC San Diego School of Medicine",
  residency: "UCSD Medical Center",
  boardCertified: true,
  yearsExperience: 14,
  about: "A dedicated physician serving the San Diego community with compassionate, evidence-based care. Committed to preventive medicine, chronic disease management, and culturally sensitive treatment.",
  conditions: ["Diabetes Management", "Hypertension", "Preventive Care", "Women's Health", "Chronic Disease Management", "Mental Health Screening"],
  hours: [
    { day: "Monday", hours: "8:00 AM – 5:00 PM" },
    { day: "Tuesday", hours: "8:00 AM – 5:00 PM" },
    { day: "Wednesday", hours: "9:00 AM – 6:00 PM" },
    { day: "Thursday", hours: "8:00 AM – 5:00 PM" },
    { day: "Friday", hours: "8:00 AM – 3:00 PM" },
    { day: "Saturday", hours: "9:00 AM – 12:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
  insurance: ["Medicare", "Medi-Cal", "Blue Shield", "Anthem Blue Cross", "Aetna", "Cigna", "United Healthcare"],
  communityReports: [
    { text: "Still accepting new patients as of this month", date: "April 2026", helpful: 12 },
    { text: "Telehealth appointments available via MyChart", date: "March 2026", helpful: 8 },
    { text: "Wait time for new patient appointment is about 3 weeks", date: "February 2026", helpful: 15 },
  ],
};

const TODAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];

function Badge({ icon, text, green, red, blue }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 11px", borderRadius: 20, fontWeight: 500, background: green ? "#edfaf3" : red ? "#fff0f0" : blue ? "rgba(26,107,138,0.08)" : "#f0f8fb", color: green ? "#1a7a4a" : red ? "#c05050" : blue ? C.ocean : C.muted, border: `1px solid ${green ? "#b2e5cc" : red ? "#f5c0c0" : blue ? "rgba(26,107,138,0.2)" : C.border}` }}>
      {icon && <span>{icon}</span>}{text}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "1.4rem 1.5rem", marginBottom: "1rem" }}>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: C.deep, marginBottom: "1rem", paddingBottom: "0.7rem", borderBottom: `1px solid ${C.border}` }}>{title}</div>
      {children}
    </div>
  );
}

function CommunityReport({ report }) {
  const [helpful, setHelpful] = useState(report.helpful);
  const [voted, setVoted] = useState(false);
  return (
    <div style={{ padding: "0.9rem 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, marginBottom: 6 }}>"{report.text}"</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, flexWrap: "wrap" }}>
        <div style={{ fontSize: 11, color: C.muted }}>Reported by community · {report.date}</div>
        <button onClick={() => { if (!voted) { setHelpful(h => h + 1); setVoted(true); }}} style={{ display: "flex", alignItems: "center", gap: 5, background: voted ? "#edfaf3" : "white", border: `1px solid ${voted ? "#b2e5cc" : C.border}`, color: voted ? "#1a7a4a" : C.muted, padding: "3px 10px", borderRadius: 20, fontSize: 12, cursor: voted ? "default" : "pointer", fontFamily: "inherit" }}>
          👍 Helpful ({helpful})
        </button>
      </div>
    </div>
  );
}

function ReportForm({ onClose }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("accepting");
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div style={{ textAlign: "center", padding: "1.5rem" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🙏</div>
      <div style={{ fontWeight: 700, color: C.deep, fontSize: 16, marginBottom: 6 }}>Thank you!</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Your update helps the San Diego community find accurate care.</div>
      <button onClick={onClose} style={{ background: C.ocean, color: "white", border: "none", padding: "0.6rem 1.4rem", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>Done</button>
    </div>
  );
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 16, color: C.deep, marginBottom: 4 }}>Share an Update</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Help other San Diego patients with accurate, current info.</div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.deep, marginBottom: 5 }}>What are you reporting?</div>
        {[["accepting","Accepting / not accepting new patients"],["telehealth","Telehealth availability"],["hours","Office hours update"],["insurance","Insurance acceptance"],["other","Something else"]].map(([val,label]) => (
          <label key={val} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
            <input type="radio" name="category" value={val} checked={category===val} onChange={() => setCategory(val)} style={{ accentColor: C.ocean }} />{label}
          </label>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.deep, marginBottom: 5 }}>Details (optional)</div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="e.g. Called last week and confirmed they are accepting new patients…"
          style={{ width: "100%", padding: "0.6rem 0.8rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 13, resize: "vertical", minHeight: 80, outline: "none", boxSizing: "border-box" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setSubmitted(true)} style={{ flex: 1, background: C.ocean, color: "white", border: "none", padding: "0.65rem", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Submit Update</button>
        <button onClick={onClose} style={{ background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, padding: "0.6rem 1rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [photo, setPhoto] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);

  const doc = ALL_DOCTORS.find(d => d.id === parseInt(id)) || ALL_DOCTORS[0];
  const ext = EXTENDED;
  const initials = doc.name.replace(/Dr\.\s*/, "").split(" ").filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase();

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(253,250,245,0.97)", backdropFilter: "blur(12px)", borderBottom: `1px solid rgba(26,107,138,0.12)`, padding: "0.8rem 1.2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div onClick={() => navigate("/")} style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? 16 : 18, color: C.ocean, fontWeight: 700, cursor: "pointer" }}>Your Doctor <span style={{ color: C.dusk }}>SD</span></div>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>← Back to Search</button>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.deep} 0%, ${C.ocean} 100%)`, color: "white", padding: isMobile ? "1.8rem 1.2rem 2.5rem" : "2.5rem 2rem 3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle at 20% 80%, #4db8d4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a8d8bc 0%, transparent 50%)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1, display: "flex", gap: isMobile ? "1rem" : "1.8rem", alignItems: "flex-start", flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: isMobile ? 80 : 100, height: isMobile ? 80 : 100, borderRadius: "50%", overflow: "hidden", background: photo ? "transparent" : "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: isMobile ? 24 : 32, color: "white" }}>
              {photo ? <img src={photo} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
            </div>
            <label title="Upload photo" style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: C.dusk, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}>
              📷<input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 22 : 28, fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>{doc.name}</div>
            <div style={{ fontSize: isMobile ? 14 : 16, opacity: 0.85, marginBottom: 12 }}>{doc.specialty} · {doc.city}, CA</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {doc.accepting ? <Badge icon="✅" text="Accepting New Patients" green /> : <Badge icon="❌" text="Not Accepting" red />}
              {doc.telehealth && <Badge icon="💻" text="Telehealth Available" blue />}
              {ext.boardCertified && <Badge icon="🏅" text="Board Certified" blue />}
              {doc.languages.map(l => <Badge key={l} icon="🗣️" text={l} />)}
            </div>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
              <a href={`tel:${doc.phone}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.dusk, color: "white", textDecoration: "none", padding: "0.7rem 1.4rem", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>📞 {doc.phone}</a>
              <button style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.3)", padding: "0.65rem 1.4rem", borderRadius: 10, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>📅 Request Appointment</button>
            </div>
          )}
        </div>
        {isMobile && (
          <div style={{ maxWidth: 900, margin: "1.2rem auto 0", display: "flex", gap: 8 }}>
            <a href={`tel:${doc.phone}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.dusk, color: "white", textDecoration: "none", padding: "0.7rem", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>📞 Call</a>
            <button style={{ flex: 1, background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.3)", padding: "0.7rem", borderRadius: 10, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>📅 Appointment</button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "1rem" : "1.5rem 1.2rem 3rem", display: "flex", gap: "1.2rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Section title={`About ${doc.name.split(",")[0]}`}>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, margin: 0 }}>{ext.about}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.2rem", marginTop: "1.1rem" }}>
              {[["🎓","Medical School",ext.education],["🏥","Residency",ext.residency],["📅","Experience",`${ext.yearsExperience} years`]].map(([icon,label,value]) => (
                <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                    <div style={{ fontSize: 13, color: C.text, marginTop: 1 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Conditions & Services">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ext.conditions.map(c => <span key={c} style={{ fontSize: 13, padding: "5px 12px", borderRadius: 20, background: "rgba(26,107,138,0.07)", color: C.ocean, border: "1px solid rgba(26,107,138,0.15)" }}>{c}</span>)}
            </div>
          </Section>

          <Section title="Insurance Accepted">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ext.insurance.map(ins => <span key={ins} style={{ fontSize: 13, padding: "5px 12px", borderRadius: 8, background: C.bg, color: C.text, border: `1px solid ${C.border}` }}>{ins}</span>)}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>⚠️ Always verify insurance directly with the practice before your visit.</div>
          </Section>

          <Section title="Community Updates">
            <div style={{ fontSize: 13, color: C.muted, marginBottom: "0.8rem" }}>Real updates from San Diego patients — not paid reviews.</div>
            {ext.communityReports.map((r, i) => <CommunityReport key={i} report={r} />)}
            <div style={{ marginTop: "1rem" }}>
              {showReportForm ? <ReportForm onClose={() => setShowReportForm(false)} /> : (
                <button onClick={() => setShowReportForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", color: C.ocean, border: `1.5px solid ${C.ocean}`, padding: "0.6rem 1.2rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✏️ Share an Update</button>
              )}
            </div>
          </Section>

          <div style={{ fontSize: 11, color: "#9ab5bf", textAlign: "center", padding: "0.5rem" }}>NPI #{doc.npi} · Data sourced from the National Provider Index (NPPES)</div>
        </div>

        {!isMobile && (
          <aside style={{ width: 240, flexShrink: 0 }}>
            <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "1.2rem", marginBottom: "1rem", position: "sticky", top: 72 }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: C.deep, marginBottom: "1rem", paddingBottom: "0.7rem", borderBottom: `1px solid ${C.border}` }}>Contact & Location</div>
              {[["📍", doc.address + ", " + doc.city + ", CA"], ["📞", doc.phone], [doc.gender === "F" ? "👩‍⚕️" : "👨‍⚕️", doc.gender === "F" ? "Female Provider" : "Male Provider"]].map(([icon, label]) => (
                <div key={label} style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 13, color: C.text, lineHeight: 1.5 }}><span style={{ flexShrink: 0 }}>{icon}</span><span>{label}</span></div>
              ))}
              <div style={{ background: `linear-gradient(135deg, rgba(26,107,138,0.08), rgba(77,184,212,0.12))`, border: `1px solid ${C.border}`, borderRadius: 10, height: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 12, marginTop: 8, gap: 6, cursor: "pointer" }}>
                <span style={{ fontSize: 28 }}>🗺️</span><span>View on Maps</span><span style={{ fontSize: 10, opacity: 0.7 }}>{doc.address}, {doc.city}</span>
              </div>
            </div>
            <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "1.2rem" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: C.deep, marginBottom: "1rem", paddingBottom: "0.7rem", borderBottom: `1px solid ${C.border}` }}>Office Hours</div>
              {ext.hours.map(({ day, hours }) => (
                <div key={day} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, padding: "3px 6px", borderRadius: 6, background: day === TODAY ? "rgba(26,107,138,0.07)" : "transparent", fontWeight: day === TODAY ? 600 : 400 }}>
                  <span>{day}</span>
                  <span style={{ color: hours === "Closed" ? C.red : day === TODAY ? C.ocean : C.muted }}>{hours}</span>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {isMobile && (
        <div style={{ padding: "0 1rem 2rem" }}>
          <Section title="Office Hours">
            {ext.hours.map(({ day, hours }) => (
              <div key={day} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7, padding: "4px 8px", borderRadius: 6, background: day === TODAY ? "rgba(26,107,138,0.07)" : "transparent", fontWeight: day === TODAY ? 600 : 400 }}>
                <span>{day}</span><span style={{ color: hours === "Closed" ? C.red : day === TODAY ? C.ocean : C.muted }}>{hours}</span>
              </div>
            ))}
          </Section>
          <Section title="Contact & Location">
            {[["📍", doc.address + ", " + doc.city],["📞", doc.phone]].map(([icon, label]) => (
              <div key={label} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 14 }}><span>{icon}</span><span>{label}</span></div>
            ))}
            <div style={{ background: `linear-gradient(135deg, rgba(26,107,138,0.08), rgba(77,184,212,0.12))`, border: `1px solid ${C.border}`, borderRadius: 10, height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13, gap: 5, cursor: "pointer" }}>
              <span style={{ fontSize: 26 }}>🗺️</span><span>View on Maps</span>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
