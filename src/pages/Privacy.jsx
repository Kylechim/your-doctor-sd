import { useNavigate } from "react-router-dom";
import { COLORS as C } from "../data/doctors";
import Nav from "../components/Nav";
import { useState, useEffect } from "react";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

export default function Privacy() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const section = (title, content) => (
    <div style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.25rem", color: C.deep, marginBottom: "0.75rem" }}>{title}</h2>
      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85, fontWeight: 300 }}>{content}</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <Nav isMobile={isMobile} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: isMobile ? "2rem 1.2rem 4rem" : "4rem 1.5rem 6rem" }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.dusk, marginBottom: 8 }}>Legal</div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? "2rem" : "2.4rem", color: C.deep, lineHeight: 1.2, marginBottom: "0.5rem" }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: "2.5rem" }}>Last updated: May 2026</p>

        {section("What we collect", "Your Doctor SD does not require an account to use. We do not collect personal information such as your name, email, or health information when you search for doctors. If you submit a community report or claim a listing, we collect only the information you voluntarily provide (such as your name and email for provider claims).")}
        {section("How we use your information", "Information submitted for provider claims is used solely to verify and manage your listing on Your Doctor SD. Community reports are used to display helpful information to other users. We do not sell, rent, or share your personal information with third parties for marketing purposes.")}
        {section("Provider data", "All provider data displayed on Your Doctor SD is sourced from the National Provider Index (NPPES), a publicly available federal database maintained by the Centers for Medicare & Medicaid Services (CMS). This data is not user-submitted and is updated monthly.")}
        {section("Cookies and analytics", "We may use standard analytics tools (such as Google Analytics) to understand how users interact with our site. This data is aggregated and anonymous. We use session cookies to maintain basic site functionality.")}
        {section("Google Maps", "Our site uses the Google Maps API to display provider locations. Google's privacy policy applies to data processed through their Maps platform. You can review Google's privacy policy at policies.google.com.")}
        {section("Data security", "We take reasonable measures to protect the information submitted through our site. Provider claim information is stored securely in our database and is only accessible to authorized administrators.")}
        {section("Contact", "If you have questions about this privacy policy or how we handle data, please contact us at privacy@yourdoctorsd.com.")}

        <div style={{ borderTop: `1.5px solid ${C.border}`, paddingTop: "1.5rem", marginTop: "1rem" }}>
          <button onClick={() => navigate("/contact")} style={{ background: C.ocean, color: "white", border: "none", padding: "0.65rem 1.4rem", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Contact Us with Questions →
          </button>
        </div>
      </div>

      <footer style={{ background: C.deep, color: "rgba(255,255,255,0.5)", padding: "2rem 1.5rem", textAlign: "center", fontSize: 13, lineHeight: 1.9 }}>
        <div>Made with ♥ for San Diego &nbsp;|&nbsp; <strong style={{ color: "rgba(255,255,255,0.8)" }}>Your Doctor SD</strong></div>
        <div style={{ marginTop: 4 }}>
          {[["About", "/about"], ["Privacy", "/privacy"], ["Contact", "/contact"], ["For Providers", "/claim"]].map(([l, path], i) => (
            <span key={l}><span onClick={() => navigate(path)} style={{ color: C.sky, cursor: "pointer" }}>{l}</span>{i < 3 ? " · " : ""}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
