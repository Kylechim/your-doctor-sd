import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS as C } from "../data/doctors";
import Nav from "../components/Nav";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

export default function Contact() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  }

  if (submitted) return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <Nav isMobile={isMobile} />
      <div style={{ maxWidth: 500, margin: "6rem auto", textAlign: "center", padding: "0 1.5rem" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🙏</div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.8rem", color: C.deep, marginBottom: 12 }}>Thanks for reaching out!</h2>
        <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.75, marginBottom: "1.5rem" }}>We'll get back to you as soon as we can. For urgent provider data issues, we typically respond within 1–2 business days.</p>
        <button onClick={() => navigate("/")} style={{ background: C.ocean, color: "white", border: "none", padding: "0.7rem 1.8rem", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Back to Home</button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <Nav isMobile={isMobile} />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: isMobile ? "2rem 1.2rem 4rem" : "4rem 1.5rem 6rem" }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.dusk, marginBottom: 8 }}>Get in touch</div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? "2rem" : "2.4rem", color: C.deep, lineHeight: 1.2, marginBottom: "0.75rem" }}>Contact Us</h1>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, marginBottom: "2.5rem", fontWeight: 300 }}>
          Have a question, found incorrect provider data, or want to partner with us? We'd love to hear from you.
        </p>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0.8rem", marginBottom: "2.5rem" }}>
          {[
            { icon: "🏥", title: "Claim your listing", sub: "Are you a provider?", action: () => navigate("/claim") },
            { icon: "⚠️", title: "Report incorrect data", sub: "Wrong address or info?", action: () => setForm(f => ({ ...f, subject: "data" })) },
            { icon: "💡", title: "Feature request", sub: "Have an idea?", action: () => setForm(f => ({ ...f, subject: "feature" })) },
            { icon: "🤝", title: "Partnership", sub: "Work with us", action: () => setForm(f => ({ ...f, subject: "partnership" })) },
          ].map(({ icon, title, sub, action }) => (
            <button key={title} onClick={action} style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "1rem", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              <span style={{ fontSize: "1.4rem" }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: C.deep, fontSize: 14 }}>{title}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Contact form */}
        <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 16, padding: isMobile ? "1.5rem" : "2rem" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.2rem", color: C.deep, marginBottom: "1.5rem" }}>Send us a message</h2>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                style={{ width: "100%", padding: "0.65rem 0.9rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com" type="email"
                style={{ width: "100%", padding: "0.65rem 0.9rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Subject</label>
            <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              style={{ width: "100%", padding: "0.65rem 0.9rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 14, outline: "none", appearance: "none", background: "white", boxSizing: "border-box" }}>
              <option value="general">General question</option>
              <option value="data">Incorrect provider data</option>
              <option value="feature">Feature request</option>
              <option value="partnership">Partnership inquiry</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Message</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Tell us what's on your mind…"
              rows={5}
              style={{ width: "100%", padding: "0.65rem 0.9rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleSubmit}
            disabled={!form.name || !form.email || !form.message}
            style={{ background: C.ocean, color: "white", border: "none", padding: "0.75rem 1.8rem", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: form.name && form.email && form.message ? "pointer" : "default", opacity: form.name && form.email && form.message ? 1 : 0.5 }}>
            Send Message
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
