import { useNavigate } from "react-router-dom";
import { COLORS as C } from "../data/doctors";
import { useEffect, useState } from "react";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

export default function About() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: C.white, minHeight: "100vh", color: C.text }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(253,250,245,0.97)", backdropFilter: "blur(12px)", borderBottom: `1px solid rgba(26,107,138,0.12)`, padding: "0.8rem 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div onClick={() => navigate("/")} style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? 17 : 19, color: C.ocean, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          Your Doctor <span style={{ color: C.dusk }}>SD</span>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>← Back</button>
      </nav>

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${C.deep} 0%, ${C.ocean} 100%)`, color: "white", padding: isMobile ? "3rem 1.5rem 4rem" : "5rem 2rem 6rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle at 20% 80%, #4db8d4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a8d8bc 0%, transparent 50%)" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7, marginBottom: "1rem" }}>Our Story</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "2rem" : "3rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "1.2rem" }}>
            Built because finding the right doctor shouldn't be this hard.
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, lineHeight: 1.8, opacity: 0.85, fontWeight: 300 }}>
            Your Doctor SD is a free, community-driven directory of every licensed provider in San Diego — built by a San Diegan, for San Diegans.
          </p>
        </div>
      </div>

      {/* STORY */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: isMobile ? "2.5rem 1.5rem" : "4rem 2rem" }}>

        {/* Kyle's story */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${C.sky}, ${C.ocean})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 22, flexShrink: 0 }}>K</div>
            <div>
              <div style={{ fontWeight: 700, color: C.deep, fontSize: 16 }}>Kyle</div>
              <div style={{ fontSize: 13, color: C.muted }}>Founder · San Diego, CA</div>
            </div>
          </div>

          <div style={{ fontSize: 16, lineHeight: 1.9, color: C.text }}>
            <p style={{ marginBottom: "1.4rem" }}>
              When I moved to San Diego, one of the first things I had to figure out was finding a new doctor. I didn't know anyone here yet, and the process of searching through directories, checking insurance, and trying to figure out who was even accepting new patients felt completely overwhelming.
            </p>
            <p style={{ marginBottom: "1.4rem" }}>
              When I finally got an appointment, I left feeling worse than when I walked in — not because of the diagnosis, but because of the experience. Instead of feeling heard, I felt like I was sitting across from a salesperson. The doctor spent more time pushing services unrelated to the reason I came in than actually addressing my concerns. I left feeling like just another number.
            </p>
            <p style={{ marginBottom: "1.4rem" }}>
              That experience stuck with me. And I started wondering — how many other people in San Diego go through something similar? How many people avoid going to the doctor at all because the process of finding one feels too hard, too confusing, or too expensive?
            </p>
            <p style={{ marginBottom: "1.4rem" }}>
              I built Your Doctor SD because I believe finding a doctor you can trust should be simple, transparent, and free. Not hidden behind paywalls. Not influenced by who paid to rank higher. Just every licensed provider in San Diego — searchable, filterable, and honest.
            </p>
            <p style={{ color: C.deep, fontWeight: 500 }}>
              This site is free for patients. It will always be free for patients. Because healthcare is hard enough without the search for it being hard too.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${C.border}`, margin: "2.5rem 0" }} />

        {/* Values */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "1.6rem" : "2rem", color: C.deep, marginBottom: "2rem" }}>What we stand for</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[
              { icon: "🔍", title: "Radical transparency", body: "No doctor pays to appear higher in results. No hidden rankings. Every licensed San Diego provider is listed equally — what you see is what the data says, nothing more." },
              { icon: "🤝", title: "Community over commerce", body: "We make money through ethical means like ads and optional verified badges — never by selling patient data or charging doctors for better placement." },
              { icon: "❤️", title: "Patients first, always", body: "Every decision we make starts with one question: does this make it easier for a San Diego patient to find the right care? If the answer is no, we don't do it." },
              { icon: "✅", title: "Honesty about what we know", body: "If we don't have verified information about a doctor — whether they're accepting patients, what insurance they take — we say so. We'd rather show 'not yet reported' than show you something that might be wrong." },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ display: "flex", gap: "1.2rem", alignItems: "flex-start" }}>
                <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: C.deep, fontSize: 16, marginBottom: 5 }}>{title}</div>
                  <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.7 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${C.border}`, margin: "2.5rem 0" }} />

        {/* Data section */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "1.6rem" : "2rem", color: C.deep, marginBottom: "1rem" }}>Where does our data come from?</h2>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: C.muted, marginBottom: "1.2rem" }}>
            Provider information comes from the <strong style={{ color: C.text }}>National Provider Index (NPI)</strong> — a free, public federal database of every licensed healthcare provider in the United States. We download this data monthly and filter it to San Diego county, so you're always seeing current, government-verified provider information.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: C.muted }}>
            Information like insurance acceptance, telehealth availability, office hours, and languages spoken comes directly from providers who have <strong style={{ color: C.text }}>claimed their free listing</strong>. If a provider hasn't claimed their listing yet, we show those fields as "not yet reported" rather than guess.
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${C.border}`, margin: "2.5rem 0" }} />

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "1rem 0 2rem" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "1.6rem" : "2rem", color: C.deep, marginBottom: "1rem" }}>Ready to find your doctor?</h2>
          <p style={{ fontSize: 15, color: C.muted, marginBottom: "1.8rem", lineHeight: 1.7 }}>Browse 40,000+ licensed San Diego providers — free, unbiased, and always honest.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/search")} style={{ background: `linear-gradient(135deg, ${C.ocean}, ${C.deep})`, color: "white", border: "none", padding: "0.85rem 2rem", borderRadius: 25, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              🔍 Find a Doctor
            </button>
            <button onClick={() => navigate("/claim")} style={{ background: "transparent", color: C.ocean, border: `2px solid ${C.ocean}`, padding: "0.85rem 2rem", borderRadius: 25, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              🏥 Claim Your Listing
            </button>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ background: C.deep, color: "rgba(255,255,255,0.5)", padding: "2rem 1.5rem", textAlign: "center", fontSize: 13, lineHeight: 1.9 }}>
        <div>Made with ♥ for San Diego &nbsp;|&nbsp; <strong style={{ color: "rgba(255,255,255,0.8)" }}>Your Doctor SD</strong></div>
      </footer>
    </div>
  );
}
