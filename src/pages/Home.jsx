import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { COLORS as C } from "../data/doctors";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

const SLIDES = [
  { heading: <>Find <em>your</em> doctor right here in <span style={{ color: C.dusk }}>San Diego.</span></>, sub: "Every licensed provider in San Diego — free to search, no paywalls, no paid rankings." },
  { heading: <>Search by <em>insurance,</em> language, or <span style={{ color: C.dusk }}>neighborhood.</span></>, sub: "Filter by the things that actually matter — not just name and specialty." },
  { heading: <>Built for <em>our</em> community. Always <span style={{ color: C.dusk }}>free.</span></>, sub: "No hidden fees. No doctor pays to rank higher. Just honest results for San Diego." },
];

// Animated count-up hook
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [slide, setSlide] = useState(0);
  const [query, setQuery] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [touchStart, setTouchStart] = useState(null);
  const count = useCountUp(80000, 2200);

  useEffect(() => {
    if (!isMobile) return;
    const timer = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 3500);
    return () => clearInterval(timer);
  }, [isMobile]);

  function handleSearch(overrideQuery) {
    const params = new URLSearchParams();
    const q = overrideQuery || query;
    if (q) params.set("q", q);
    if (neighborhood && neighborhood !== "All of San Diego") params.set("city", neighborhood);
    navigate(`/search?${params.toString()}`);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: C.white, minHeight: "100vh" }}>
      <Nav isMobile={isMobile} />

      {/* HERO */}
      <section style={{
        minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: isMobile ? "3rem 1.2rem 5rem" : "6rem 2rem 4rem",
        position: "relative", overflow: "hidden", textAlign: "center",
        background: "linear-gradient(175deg, #e8f6f9 0%, #fdfaf5 50%, #fef3e2 100%)",
      }}>
        {/* Orbs */}
        {[
          { w: 300, h: 300, bg: C.sky, top: "5%", left: "-8%", delay: "0s" },
          { w: 200, h: 200, bg: "#a8d8bc", top: "15%", right: "-5%", delay: "-3s" },
          { w: 180, h: 180, bg: C.sand, bottom: "15%", left: "30%", delay: "-5s" },
        ].map((o, i) => (
          <div key={i} style={{
            position: "absolute", borderRadius: "50%", filter: "blur(55px)", opacity: 0.3,
            width: o.w, height: o.h, background: o.bg,
            top: o.top, left: o.left, right: o.right, bottom: o.bottom,
            animation: `drift 8s ease-in-out ${o.delay} infinite`,
          }} />
        ))}

        <style>{`
          @keyframes drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(12px,-18px)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        `}</style>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 700, width: "100%" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(26,107,138,0.08)", border: "1px solid rgba(26,107,138,0.2)", color: C.ocean, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.4rem 1rem", borderRadius: 20, marginBottom: isMobile ? "1rem" : "1.6rem", animation: "fadeUp 0.6s ease both" }}>
            <span style={{ width: 7, height: 7, background: C.dusk, borderRadius: "50%", display: "inline-block", animation: "pulse 2s ease infinite" }} />
            San Diego's Free Doctor Finder
          </div>

          {/* Desktop heading */}
          {!isMobile && (
            <>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2.6rem,5.5vw,4.4rem)", lineHeight: 1.1, color: C.deep, marginBottom: "1.2rem", animation: "fadeUp 0.6s 0.1s ease both" }}>
                Find <em>your</em> doctor<br />right here in <span style={{ color: C.dusk }}>San Diego.</span>
              </h1>
              <p style={{ fontSize: "1.05rem", fontWeight: 300, color: C.muted, lineHeight: 1.75, maxWidth: 500, margin: "0 auto 1.6rem", animation: "fadeUp 0.6s 0.2s ease both" }}>
                No paywalls. No paid rankings. Just every doctor in San Diego — searchable by specialty, insurance, language, and more.
              </p>

              {/* 80K stat — sits between subtext and search card */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "white", border: `1.5px solid ${C.border}`, borderRadius: 50, padding: "0.5rem 1.4rem 0.5rem 0.6rem", marginBottom: "1.6rem", boxShadow: "0 4px 16px rgba(13,61,82,0.08)", animation: "fadeUp 0.6s 0.25s ease both" }}>
                <div style={{ background: `linear-gradient(135deg, ${C.ocean}, ${C.deep})`, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>🏥</span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: C.deep, lineHeight: 1 }}>
                    {count >= 80000 ? "80,000+" : count.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>licensed San Diego providers</div>
                </div>
              </div>
            </>
          )}

          {/* Mobile carousel */}
          {isMobile && (
            <div
              onTouchStart={e => setTouchStart(e.touches[0].clientX)}
              onTouchEnd={e => {
                const diff = touchStart - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) setSlide(s => (s + (diff > 0 ? 1 : -1) + SLIDES.length) % SLIDES.length);
              }}
              style={{ marginBottom: "1rem" }}
            >
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2rem", lineHeight: 1.2, color: C.deep, marginBottom: "0.8rem" }}>
                {SLIDES[slide].heading}
              </h1>
              <p style={{ fontSize: "0.95rem", fontWeight: 300, color: C.muted, lineHeight: 1.7 }}>{SLIDES[slide].sub}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: "0.9rem" }}>
                {SLIDES.map((_, i) => (
                  <div key={i} onClick={() => setSlide(i)} style={{ width: 7, height: 7, borderRadius: "50%", background: i === slide ? C.ocean : "rgba(26,107,138,0.2)", cursor: "pointer", transition: "background 0.2s" }} />
                ))}
              </div>
            </div>
          )}

          {/* Mobile 80K stat */}
          {isMobile && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "white", border: `1.5px solid ${C.border}`, borderRadius: 50, padding: "0.45rem 1.2rem 0.45rem 0.5rem", marginBottom: "1.2rem", boxShadow: "0 4px 16px rgba(13,61,82,0.08)" }}>
              <div style={{ background: `linear-gradient(135deg, ${C.ocean}, ${C.deep})`, borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 14 }}>🏥</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: C.deep, lineHeight: 1 }}>
                  {count >= 80000 ? "80,000+" : count.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: C.muted }}>licensed San Diego providers</div>
              </div>
            </div>
          )}

          {/* Search card */}
          <div style={{ background: "white", borderRadius: "1.1rem", padding: isMobile ? "1.1rem" : "1.5rem", boxShadow: "0 8px 36px rgba(13,61,82,0.11)", animation: "fadeUp 0.6s 0.3s ease both", textAlign: "left" }}>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: 140, display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted }}>Specialty or Doctor</label>
                <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. Primary Care, Dr. Smith…"
                  style={{ padding: "0.7rem 1rem", border: `1.5px solid ${C.border}`, borderRadius: "0.65rem", fontFamily: "inherit", fontSize: 14, outline: "none", background: "#f8fbfc" }} />
              </div>
              <div style={{ flex: 1, minWidth: 130, display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted }}>Neighborhood</label>
                <select value={neighborhood} onChange={e => setNeighborhood(e.target.value)}
                  style={{ padding: "0.7rem 0.9rem", border: `1.5px solid ${C.border}`, borderRadius: "0.65rem", fontFamily: "inherit", fontSize: 14, outline: "none", appearance: "none", background: "#f8fbfc" }}>
                  <option value="">All of San Diego</option>
                  {["La Jolla","Chula Vista","Encinitas","Oceanside","El Cajon","Escondido","National City","Santee","Poway"].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <button onClick={handleSearch} style={{ alignSelf: "flex-end", background: `linear-gradient(135deg, ${C.ocean}, ${C.deep})`, color: "white", border: "none", padding: "0.75rem 1.6rem", borderRadius: "0.65rem", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                🔍 Find Doctors
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: "0.8rem" }}>
              <span style={{ fontSize: 12, color: C.muted }}>Popular:</span>
              {["Primary Care","Pediatrics","Spanish-speaking","Accepting Patients","Telehealth"].map(tag => (
                <button key={tag} onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "rgba(26,107,138,0.07)", color: C.ocean, border: "1px solid rgba(26,107,138,0.15)", cursor: "pointer", fontFamily: "inherit" }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <svg style={{ position: "absolute", bottom: -2, left: 0, right: 0, width: "100%" }} viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path d="M0,35 C360,70 1080,0 1440,35 L1440,70 L0,70 Z" fill={C.deep} />
        </svg>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 1050, margin: "0 auto", padding: "4.5rem 1.5rem" }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.dusk, marginBottom: 6 }}>Simple by design</div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", color: C.deep, marginBottom: "0.9rem" }}>Finding care shouldn't be hard.</h2>
        <p style={{ color: C.muted, fontSize: 15, fontWeight: 300, maxWidth: 460, lineHeight: 1.75, marginBottom: "2.5rem" }}>A no-nonsense tool for San Diego residents — search, filter, and connect with the right doctor in minutes.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "1.2rem" }}>
          {[
            { n: "01", icon: "🔍", title: "Search your needs", body: "Specialty, condition, or name. Filter by neighborhood, insurance, language, or availability." },
            { n: "02", icon: "📋", title: "Browse real listings", body: "Every licensed provider in San Diego County — not just the ones who paid to be here." },
            { n: "03", icon: "📞", title: "Connect directly", body: "Call, book, or visit the practice directly. No middleman, no upsells." },
            { n: "04", icon: "⭐", title: "Help the community", body: "Leave a quick update — are they accepting new patients? Neighbors help neighbors." },
          ].map(({ n, icon, title, body }) => (
            <div key={n} style={{ background: "white", borderRadius: 12, padding: "1.6rem", border: `1.5px solid ${C.border}` }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.6rem", color: "rgba(26,107,138,0.1)", fontWeight: 700, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: "1.6rem", margin: "0.6rem 0" }}>{icon}</div>
              <div style={{ fontWeight: 600, color: C.deep, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SPECIALTIES */}
      <div style={{ background: "linear-gradient(135deg,#f0f9fb,#fdfaf5)", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.dusk, marginBottom: 6 }}>Browse by specialty</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.6rem,3vw,2.4rem)", color: C.deep, marginBottom: "2rem" }}>What kind of care are you looking for?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "0.9rem" }}>
            {[["🩺","Primary Care"],["👶","Pediatrics"],["🦷","Dentistry"],["👁️","Optometry"],["🧠","Mental Health"],["❤️","Cardiology"],["🦴","Orthopedics"],["🤰","OB-GYN"],["🧪","Dermatology"],["💊","Oncology"],["🫁","Pulmonology"],["➕","View All"]].map(([icon, label]) => (
              <div key={label} onClick={() => navigate(`/search?q=${label}`)}
                style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: "0.85rem", padding: "1.1rem 0.8rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer", textAlign: "center", transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.sky}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <span style={{ fontSize: "1.7rem" }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.deep }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROVIDER CALLOUT */}
      <div style={{ background: `linear-gradient(135deg, ${C.ocean}, ${C.deep})`, color: "white", padding: "3.5rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", marginBottom: "0.9rem" }}>Are you a San Diego provider?</h2>
          <p style={{ fontSize: 15, fontWeight: 300, opacity: 0.85, lineHeight: 1.75, marginBottom: "1.8rem" }}>Claim your listing and make sure patients can find you. No fees. No ranking games.</p>
          <button onClick={() => navigate("/claim")} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.dusk, color: "white", border: "none", padding: "0.85rem 2rem", borderRadius: 25, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            🏥 Claim Your Listing
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: C.deep, color: "rgba(255,255,255,0.5)", padding: "2rem 1.5rem", textAlign: "center", fontSize: 13, lineHeight: 1.9 }}>
        <div>Made with ♥ for San Diego &nbsp;|&nbsp; <strong style={{ color: "rgba(255,255,255,0.8)" }}>Your Doctor SD</strong></div>
        <div style={{ marginTop: 4 }}>
          {["About","Privacy","Contact","For Providers"].map((l, i) => (
            <span key={l}><span style={{ color: C.sky, cursor: "pointer" }}>{l}</span>{i < 3 ? " · " : ""}</span>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, opacity: 0.55 }}>Provider data sourced from the National Provider Index (NPI) and CMS public datasets. Always verify insurance directly with your provider.</div>
      </footer>
    </div>
  );
}
