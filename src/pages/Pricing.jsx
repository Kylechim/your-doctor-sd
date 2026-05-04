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

export default function Pricing() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const features = {
    verified: [
      "CA Medical Board license verification",
      "✅ Verified badge on your profile",
      "Add bio and practice description",
      "Upload a profile photo",
      "List insurance plans accepted",
      "Set office hours",
      "Add telehealth availability",
      "Add your booking link",
      "List languages spoken",
      "Appear in all search results",
    ],
    featured: [
      "Everything in Verified",
      "🌟 Featured badge on search cards",
      "Priority placement within your specialty",
      "Priority placement within your neighborhood",
      "Stand out from unverified listings",
      "Early access to new features",
    ],
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(253,250,245,0.97)", backdropFilter: "blur(12px)", borderBottom: `1px solid rgba(26,107,138,0.12)`, padding: "0.8rem 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div onClick={() => navigate("/")} style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? 17 : 19, color: C.ocean, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          Your Doctor <span style={{ color: C.dusk }}>SD</span>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>← Back</button>
      </nav>

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${C.deep} 0%, ${C.ocean} 100%)`, color: "white", padding: isMobile ? "3rem 1.5rem 4rem" : "4.5rem 2rem 5.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle at 20% 80%, #4db8d4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a8d8bc 0%, transparent 50%)" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Founding member badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(232,119,58,0.25)", border: "1px solid rgba(232,119,58,0.5)", borderRadius: 20, padding: "0.4rem 1rem", marginBottom: "1.2rem", fontSize: 13, fontWeight: 600, color: "#ffd4b0" }}>
            🚀 Founding Member Pricing — Limited Time
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "2rem" : "2.8rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem" }}>
            Take control of your listing.
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, lineHeight: 1.8, opacity: 0.85, fontWeight: 300 }}>
            Your practice is already in our directory. Claim it, verify it, and make sure San Diego patients can find the right information about you — before someone else fills in the gaps.
          </p>
        </div>
      </div>

      {/* PRICING CARDS */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "2rem 1.2rem" : "3.5rem 2rem" }}>

        {/* Founding member notice */}
        <div style={{ background: "rgba(232,119,58,0.08)", border: `1.5px solid rgba(232,119,58,0.25)`, borderRadius: 12, padding: "1rem 1.4rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: 24 }}>⏰</span>
          <div>
            <div style={{ fontWeight: 700, color: C.deep, fontSize: 15 }}>Founding member pricing — lock in your rate forever</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Sign up now and keep your founding rate permanently. Prices increase to $49/mo and $99/mo after our launch period ends.</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>

          {/* Verified Tier */}
          <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "2rem", position: "relative" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ocean, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Verified</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: "0.3rem" }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 48, fontWeight: 700, color: C.deep, lineHeight: 1 }}>$29</span>
              <span style={{ fontSize: 15, color: C.muted, marginBottom: 8 }}>/month</span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: "1.5rem" }}>
              <span style={{ textDecoration: "line-through" }}>$49/mo</span> after launch · cancel anytime
            </div>
            <button onClick={() => navigate("/claim")} style={{ width: "100%", background: `linear-gradient(135deg, ${C.ocean}, ${C.deep})`, color: "white", border: "none", padding: "0.85rem", borderRadius: 10, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: "1.8rem" }}>
              Get Started →
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {features.verified.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: C.text, lineHeight: 1.5 }}>
                  <span style={{ color: "#1a7a4a", flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Tier */}
          <div style={{ background: C.deep, border: `1.5px solid ${C.deep}`, borderRadius: 16, padding: "2rem", position: "relative", color: "white" }}>
            {/* Most popular badge */}
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: C.dusk, color: "white", fontSize: 12, fontWeight: 700, padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap" }}>
              MOST POPULAR
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Featured</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: "0.3rem" }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 48, fontWeight: 700, color: "white", lineHeight: 1 }}>$49</span>
              <span style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>/month</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem" }}>
              <span style={{ textDecoration: "line-through" }}>$99/mo</span> after launch · cancel anytime
            </div>
            <button onClick={() => navigate("/claim")} style={{ width: "100%", background: C.dusk, color: "white", border: "none", padding: "0.85rem", borderRadius: 10, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: "1.8rem" }}>
              Get Started →
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {features.featured.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                  <span style={{ color: "#a8d8bc", flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Free tier note */}
        <div style={{ textAlign: "center", marginTop: "1.5rem", padding: "1.2rem", background: "white", borderRadius: 12, border: `1.5px solid ${C.border}` }}>
          <div style={{ fontSize: 14, color: C.muted }}>
            <strong style={{ color: C.deep }}>Already in the directory for free.</strong> Every licensed San Diego provider appears in search results automatically — no payment required. Claiming your listing gives you control over your information.
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: "3rem" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "1.6rem" : "2rem", color: C.deep, marginBottom: "1.5rem", textAlign: "center" }}>Common questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { q: "What if I'm already showing up in search results?", a: "You are — every licensed San Diego provider is automatically listed using NPI registry data. Claiming your listing lets you verify your identity, update your information, and add details patients actually care about like insurance and hours." },
              { q: "How does license verification work?", a: "When you claim your listing, you'll provide your California Medical Board license number. We cross-reference it to confirm your license is active before issuing your Verified badge." },
              { q: "Can I cancel anytime?", a: "Yes. No contracts, no cancellation fees. If you cancel, your listing reverts to the basic NPI data — you'll still appear in search results, just without your claimed information." },
              { q: "Will my founding member rate really last forever?", a: "Yes. If you sign up during our launch period, your rate is locked in permanently regardless of future price increases. We reward the people who believe in us early." },
              { q: "Is this really free for patients?", a: "Always. Patients never pay to search, find, or contact a doctor through Your Doctor SD. That's a core commitment that will never change." },
            ].map(({ q, a }) => (
              <div key={q} style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "1.2rem 1.4rem" }}>
                <div style={{ fontWeight: 600, color: C.deep, fontSize: 15, marginBottom: 6 }}>{q}</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem", padding: "2.5rem 2rem", background: `linear-gradient(135deg, ${C.deep}, ${C.ocean})`, borderRadius: 16, color: "white" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "1.5rem" : "2rem", marginBottom: "0.8rem" }}>Ready to take control of your listing?</h2>
          <p style={{ fontSize: 15, opacity: 0.85, marginBottom: "1.5rem", lineHeight: 1.7 }}>Join San Diego providers who are making it easier for the right patients to find them.</p>
          <button onClick={() => navigate("/claim")} style={{ background: C.dusk, color: "white", border: "none", padding: "0.9rem 2.2rem", borderRadius: 25, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Claim Your Listing →
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: C.deep, color: "rgba(255,255,255,0.5)", padding: "2rem 1.5rem", textAlign: "center", fontSize: 13, lineHeight: 1.9 }}>
        <div>Made with ♥ for San Diego &nbsp;|&nbsp; <strong style={{ color: "rgba(255,255,255,0.8)" }}>Your Doctor SD</strong></div>
      </footer>
    </div>
  );
}
