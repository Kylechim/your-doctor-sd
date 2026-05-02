import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { COLORS as C } from "../data/doctors";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 660);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 660);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

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
      <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: C.deep, marginBottom: "1rem", paddingBottom: "0.7rem", borderBottom: `1px solid ${C.border}` }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ClaimNudge({ navigate }) {
  return (
    <div style={{ background: "rgba(26,107,138,0.04)", border: `1.5px dashed rgba(26,107,138,0.25)`, borderRadius: 10, padding: "1.2rem 1.4rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
      <div>
        <div style={{ fontWeight: 600, color: C.deep, fontSize: 14, marginBottom: 3 }}>Is this your practice?</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>Claim your free listing to add insurance, hours, telehealth availability and more.</div>
      </div>
      <button onClick={() => navigate("/claim")} style={{ background: C.ocean, color: "white", border: "none", padding: "0.6rem 1.3rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
        Claim Free Listing →
      </button>
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
  const location = useLocation();
  const isMobile = useIsMobile();
  const [photo, setPhoto] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [doc, setDoc] = useState(location.state?.doc || null);
  const [loading, setLoading] = useState(!doc);

  // If no doc passed via state, fetch from Supabase by NPI
  useEffect(() => {
    if (doc) return;
    async function fetchDoc() {
      try {
        const res = await fetch(`/api/search?name=${id}&limit=1`);
        const data = await res.json();
        if (data.results?.length > 0) setDoc(data.results[0]);
      } catch (e) {
        console.error('Failed to fetch doctor:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [id, doc]);

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  if (loading) return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: `3px solid rgba(26,107,138,0.15)`, borderTopColor: C.ocean, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: C.muted }}>Loading provider...</p>
      </div>
    </div>
  );

  if (!doc) return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div style={{ fontWeight: 700, color: C.deep, fontSize: 18, marginBottom: 8 }}>Provider not found</div>
        <button onClick={() => navigate("/search")} style={{ background: C.ocean, color: "white", border: "none", padding: "0.6rem 1.4rem", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>Back to Search</button>
      </div>
    </div>
  );

  const initials = doc.name.replace(/Dr\.\s*/, "").split(" ").filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const isVerified = doc.verified;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: C.bg, minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(253,250,245,0.97)", backdropFilter: "blur(12px)", borderBottom: `1px solid rgba(26,107,138,0.12)`, padding: "0.8rem 1.2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div onClick={() => navigate("/")} style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? 16 : 18, color: C.ocean, fontWeight: 700, cursor: "pointer" }}>
          Your Doctor <span style={{ color: C.dusk }}>SD</span>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>← Back to Search</button>
      </nav>

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${C.deep} 0%, ${C.ocean} 100%)`, color: "white", padding: isMobile ? "1.8rem 1.2rem 2.5rem" : "2.5rem 2rem 3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle at 20% 80%, #4db8d4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a8d8bc 0%, transparent 50%)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1, display: "flex", gap: isMobile ? "1rem" : "1.8rem", alignItems: "flex-start", flexWrap: isMobile ? "wrap" : "nowrap" }}>

          {/* Avatar with photo upload */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: isMobile ? 80 : 100, height: isMobile ? 80 : 100, borderRadius: "50%", overflow: "hidden", background: photo ? "transparent" : "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: isMobile ? 24 : 32, color: "white" }}>
              {photo ? <img src={photo} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
            </div>
            {isVerified && (
              <label title="Update photo" style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: C.dusk, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}>
                📷<input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
              </label>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 22 : 28, fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>{doc.name}</div>
            <div style={{ fontSize: isMobile ? 14 : 16, opacity: 0.85, marginBottom: 12 }}>{doc.specialty} · {doc.city}, CA</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {doc.accepting === true && <Badge icon="✅" text="Accepting New Patients" green />}
              {doc.accepting === false && <Badge icon="❌" text="Not Accepting" red />}
              {doc.accepting === null && <Badge icon="❓" text="Availability Not Reported" />}
              {doc.telehealth === true && <Badge icon="💻" text="Telehealth Available" blue />}
              {isVerified && <Badge icon="🏅" text="Verified Listing" blue />}
              {doc.gender === "F" && <Badge icon="👩‍⚕️" text="Female Provider" />}
              {doc.gender === "M" && <Badge icon="👨‍⚕️" text="Male Provider" />}
            </div>
          </div>

          {/* CTAs */}
          {!isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
              {doc.phone && doc.phone !== "Call for number" && (
                <a href={`tel:${doc.phone}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.dusk, color: "white", textDecoration: "none", padding: "0.7rem 1.4rem", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>📞 {doc.phone}</a>
              )}
              <button style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.3)", padding: "0.65rem 1.4rem", borderRadius: 10, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>
                📅 Request Appointment
              </button>
            </div>
          )}
        </div>

        {/* Mobile CTAs */}
        {isMobile && (
          <div style={{ maxWidth: 900, margin: "1.2rem auto 0", display: "flex", gap: 8 }}>
            {doc.phone && doc.phone !== "Call for number" && (
              <a href={`tel:${doc.phone}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.dusk, color: "white", textDecoration: "none", padding: "0.7rem", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>📞 Call</a>
            )}
            <button style={{ flex: 1, background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.3)", padding: "0.7rem", borderRadius: 10, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>📅 Appointment</button>
          </div>
        )}
      </div>

      {/* BODY */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "1rem" : "1.5rem 1.2rem 3rem", display: "flex", gap: "1.2rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Verified info OR claim nudge */}
          {isVerified ? (
            <>
              {doc.bio && (
                <Section title={`About ${doc.name.split(",")[0]}`}>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, margin: 0 }}>{doc.bio}</p>
                </Section>
              )}
              {doc.insurance?.length > 0 && (
                <Section title="Insurance Accepted">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {doc.insurance.map(ins => <span key={ins} style={{ fontSize: 13, padding: "5px 12px", borderRadius: 8, background: C.bg, color: C.text, border: `1px solid ${C.border}` }}>{ins}</span>)}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>⚠️ Always verify insurance directly with the practice before your visit.</div>
                </Section>
              )}
              {doc.languages?.length > 0 && (
                <Section title="Languages Spoken">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {doc.languages.map(l => <span key={l} style={{ fontSize: 13, padding: "5px 12px", borderRadius: 20, background: "rgba(26,107,138,0.07)", color: C.ocean, border: "1px solid rgba(26,107,138,0.15)" }}>{l}</span>)}
                  </div>
                </Section>
              )}
            </>
          ) : (
            <Section title="Practice Information">
              <div style={{ marginBottom: "1rem" }}>
                <ClaimNudge navigate={navigate} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Accepting New Patients", value: null },
                  { label: "Telehealth Available", value: null },
                  { label: "Insurance Accepted", value: null },
                  { label: "Languages Spoken", value: null },
                  { label: "Office Hours", value: null },
                ].map(({ label }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.7rem 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>Not yet reported</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Community Reports */}
          <Section title="Community Updates">
            <div style={{ fontSize: 13, color: C.muted, marginBottom: "0.8rem" }}>Real updates from San Diego patients — not paid reviews.</div>
            <div style={{ color: C.muted, fontSize: 13, fontStyle: "italic", padding: "1rem 0" }}>No community reports yet for this provider.</div>
            <div style={{ marginTop: "0.5rem" }}>
              {showReportForm
                ? <ReportForm onClose={() => setShowReportForm(false)} />
                : <button onClick={() => setShowReportForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", color: C.ocean, border: `1.5px solid ${C.ocean}`, padding: "0.6rem 1.2rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✏️ Share an Update</button>
              }
            </div>
          </Section>

          <div style={{ fontSize: 11, color: "#9ab5bf", textAlign: "center", padding: "0.5rem" }}>
            NPI #{doc.npi} · Data sourced from the National Provider Index (NPPES) · Provider data may not reflect current practice status.
          </div>
        </div>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside style={{ width: 240, flexShrink: 0 }}>
            <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "1.2rem", marginBottom: "1rem", position: "sticky", top: 72 }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: C.deep, marginBottom: "1rem", paddingBottom: "0.7rem", borderBottom: `1px solid ${C.border}` }}>Contact & Location</div>
              {doc.address && (
                <div style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                  <span style={{ flexShrink: 0 }}>📍</span>
                  <span>{doc.address}, {doc.city}, CA</span>
                </div>
              )}
              {doc.phone && doc.phone !== "Call for number" && (
                <div style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 13, color: C.text }}>
                  <span>📞</span><span>{doc.phone}</span>
                </div>
              )}
              <div style={{ background: `linear-gradient(135deg, rgba(26,107,138,0.08), rgba(77,184,212,0.12))`, border: `1px solid ${C.border}`, borderRadius: 10, height: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 12, marginTop: 8, gap: 6, cursor: "pointer" }}
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(`${doc.address}, ${doc.city}, CA`)}`, '_blank')}
              >
                <span style={{ fontSize: 28 }}>🗺️</span>
                <span>View on Maps</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>{doc.address}, {doc.city}</span>
              </div>

              {!isVerified && (
                <button onClick={() => navigate("/claim")} style={{ width: "100%", marginTop: "1rem", background: C.ocean, color: "white", border: "none", padding: "0.65rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  🏥 Claim This Listing
                </button>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Mobile sidebar info */}
      {isMobile && (
        <div style={{ padding: "0 1rem 2rem" }}>
          <Section title="Contact & Location">
            {doc.address && (
              <div style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 14 }}>
                <span>📍</span><span>{doc.address}, {doc.city}, CA</span>
              </div>
            )}
            {doc.phone && doc.phone !== "Call for number" && (
              <div style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 14 }}>
                <span>📞</span><span>{doc.phone}</span>
              </div>
            )}
            <div style={{ background: `linear-gradient(135deg, rgba(26,107,138,0.08), rgba(77,184,212,0.12))`, border: `1px solid ${C.border}`, borderRadius: 10, height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13, gap: 5, cursor: "pointer" }}
              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(`${doc.address}, ${doc.city}, CA`)}`, '_blank')}
            >
              <span style={{ fontSize: 26 }}>🗺️</span>
              <span>View on Maps</span>
            </div>
            {!isVerified && (
              <button onClick={() => navigate("/claim")} style={{ width: "100%", marginTop: "1rem", background: C.ocean, color: "white", border: "none", padding: "0.65rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                🏥 Claim This Listing
              </button>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
