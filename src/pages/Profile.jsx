import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { COLORS as C } from "../data/doctors";

// Generate a SEO-friendly slug from doctor data
export function makeDocSlug(doc) {
  const name = (doc.name || "")
    .replace(/^Dr\.?\s*/i, "")
    .replace(/,.*$/, "")
    .trim();
  const specialty = doc.specialty || "";
  const city = doc.city || "";
  const raw = `${name} ${specialty} ${city} ${doc.npi}`;
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Extract NPI from slug — NPI is always the last segment
function npiFromSlug(slug) {
  if (!slug) return null;
  const parts = slug.split("-");
  const last = parts[parts.length - 1];
  return /^\d{10}$/.test(last) ? last : null;
}

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
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>Claim your listing to add insurance, hours, telehealth availability and more.</div>
      </div>
      <button onClick={() => navigate("/pricing")} style={{ background: C.ocean, color: "white", border: "none", padding: "0.6rem 1.3rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
        Claim Free Listing →
      </button>
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

function GoogleMap({ address, city }) {
  const mapRef = useRef(null);
  const fullAddress = `${address}, ${city}, CA`;
  const [mapError, setMapError] = useState(false);
  useEffect(() => {
    if (!address || !mapRef.current) return;
    function initMap() {
      if (!mapRef.current) return;
      if (!window.google || !window.google.maps) { setMapError(true); return; }
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: fullAddress }, (results, status) => {
          if (status === "OK" && results[0] && mapRef.current) {
            const map = new window.google.maps.Map(mapRef.current, {
              zoom: 15, center: results[0].geometry.location,
              mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
            });
            new window.google.maps.Marker({ map, position: results[0].geometry.location, title: fullAddress });
          } else { setMapError(true); }
        });
      } catch (e) { setMapError(true); }
    }
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google && window.google.maps) { clearInterval(interval); initMap(); }
      else if (attempts > 20) { clearInterval(interval); setMapError(true); }
    }, 250);
    return () => clearInterval(interval);
  }, [fullAddress]);

  if (mapError) return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, rgba(26,107,138,0.08), rgba(77,184,212,0.12))`, borderRadius: 10, gap: 6, cursor: "pointer", color: C.muted, fontSize: 12 }}
      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`, '_blank')}>
      <span style={{ fontSize: 26 }}>🗺️</span>
      <span>View on Google Maps</span>
    </div>
  );
  return <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: 10 }} />;
}

function DoctorAvatar({ size = 100, photo, name }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: photo ? "transparent" : "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {photo
        ? <img src={photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : (
          <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="38" r="22" fill="rgba(255,255,255,0.85)" />
            <ellipse cx="50" cy="85" rx="32" ry="22" fill="rgba(255,255,255,0.85)" />
          </svg>
        )
      }
    </div>
  );
}

function NearbyProviderCard({ doc, navigate }) {
  return (
    <div onClick={() => navigate(`/doctor/${makeDocSlug(doc)}`, { state: { doc } })}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.7rem", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "white", cursor: "pointer", transition: "border-color 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.sky}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${C.sky}, ${C.ocean})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        <svg viewBox="0 0 38 38" width="38" height="38" xmlns="http://www.w3.org/2000/svg">
          <circle cx="19" cy="14" r="8" fill="rgba(255,255,255,0.85)" />
          <ellipse cx="19" cy="32" rx="12" ry="8" fill="rgba(255,255,255,0.85)" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: C.deep, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div>
        <div style={{ fontSize: 11, color: C.ocean }}>{doc.specialty}</div>
      </div>
      <span style={{ fontSize: 12, color: C.muted }}>→</span>
    </div>
  );
}

export default function Profile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [photo, setPhoto] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [doc, setDoc] = useState(location.state?.doc || null);
  const [loading, setLoading] = useState(!doc);
  const [nearbyProviders, setNearbyProviders] = useState([]);

  // Extract NPI from slug
  const npi = npiFromSlug(slug);

  useEffect(() => {
    if (doc) return;
    async function fetchDoc() {
      try {
        // Use NPI from slug if available, otherwise fall back to full slug search
        const query = npi
          ? `/api/search?name=${npi}&limit=1`
          : `/api/search?name=${slug}&limit=1`;
        const res = await fetch(query);
        const data = await res.json();
        if (data.results?.length > 0) setDoc(data.results[0]);
      } catch (e) {
        console.error('Failed to fetch doctor:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [slug, npi, doc]);

  // Redirect to canonical SEO slug URL if we arrived via old NPI-only URL
  useEffect(() => {
    if (!doc) return;
    const canonicalSlug = makeDocSlug(doc);
    if (slug !== canonicalSlug) {
      navigate(`/doctor/${canonicalSlug}`, { replace: true, state: { doc } });
    }
  }, [doc, slug]);

  // Fetch providers at the same address
  useEffect(() => {
    if (!doc?.address || !doc?.city) return;
    async function fetchNearby() {
      try {
        const res = await fetch(`/api/search?city=${encodeURIComponent(doc.city)}&limit=20`);
        const data = await res.json();
        const others = (data.results || []).filter(p =>
          p.npi !== doc.npi &&
          p.address?.toLowerCase() === doc.address?.toLowerCase()
        );
        setNearbyProviders(others.slice(0, 6));
      } catch (e) { /* silently fail */ }
    }
    fetchNearby();
  }, [doc]);

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

  const isVerified = doc.verified;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: C.bg, minHeight: "100vh" }}>

      {/* SEO meta-like title update */}
      {doc && (typeof document !== "undefined") && (() => { document.title = `${doc.name} — ${doc.specialty} in ${doc.city}, CA | Your Doctor SD`; return null; })()}

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

          <div style={{ position: "relative", flexShrink: 0 }}>
            <DoctorAvatar size={isMobile ? 80 : 100} photo={photo} name={doc.name} />
            {isVerified && (
              <label title="Update photo" style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: C.dusk, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}>
                📷<input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
              </label>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 22 : 28, fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>{doc.name}</div>
            <div style={{ fontSize: isMobile ? 14 : 16, opacity: 0.85, marginBottom: 12 }}>{doc.specialty} · {doc.city}, CA</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {doc.accepting === true && <Badge icon="✅" text="Accepting New Patients" green />}
              {doc.accepting === false && <Badge icon="❌" text="Not Accepting" red />}
              {doc.telehealth === true && <Badge icon="💻" text="Telehealth Available" blue />}
              {isVerified && <Badge icon="🏅" text="Verified Listing" blue />}
              {doc.gender === "F" && <Badge icon="👩‍⚕️" text="Female Provider" />}
              {doc.gender === "M" && <Badge icon="👨‍⚕️" text="Male Provider" />}
            </div>
          </div>

          {!isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
              {doc.phone && doc.phone !== "Call for number" && (
                <a href={`tel:${doc.phone}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.dusk, color: "white", textDecoration: "none", padding: "0.7rem 1.4rem", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>📞 {doc.phone}</a>
              )}
              {!isVerified && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textAlign: "center", fontStyle: "italic" }}>
                  Provider: <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/pricing")}>add your booking link →</span>
                </div>
              )}
            </div>
          )}
        </div>

        {isMobile && (
          <div style={{ maxWidth: 900, margin: "1.2rem auto 0", display: "flex", gap: 8 }}>
            {doc.phone && doc.phone !== "Call for number" && (
              <a href={`tel:${doc.phone}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.dusk, color: "white", textDecoration: "none", padding: "0.7rem", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>📞 Call</a>
            )}
          </div>
        )}
      </div>

      {/* BODY */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "1rem" : "1.5rem 1.2rem 3rem", display: "flex", gap: "1.2rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>

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
                {["Accepting New Patients","Telehealth Available","Insurance Accepted","Languages Spoken","Office Hours"].map(label => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.7rem 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>Not yet reported</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {nearbyProviders.length > 0 && (
            <Section title="Other Providers at This Address">
              <div style={{ fontSize: 13, color: C.muted, marginBottom: "0.8rem" }}>
                Other licensed providers at {doc.address}, {doc.city}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0.6rem" }}>
                {nearbyProviders.map(p => (
                  <NearbyProviderCard key={p.npi} doc={p} navigate={navigate} />
                ))}
              </div>
            </Section>
          )}

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
              {doc.address && (
                <div style={{ height: 150, marginTop: 8, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
                  <GoogleMap address={doc.address} city={doc.city} />
                </div>
              )}
              <a href={`https://maps.google.com/?q=${encodeURIComponent(`${doc.address}, ${doc.city}, CA`)}`} target="_blank" rel="noreferrer"
                style={{ display: "block", textAlign: "center", fontSize: 12, color: C.ocean, marginTop: 8 }}>
                Open in Google Maps ↗
              </a>
              {!isVerified && (
                <button onClick={() => navigate("/pricing")} style={{ width: "100%", marginTop: "1rem", background: C.ocean, color: "white", border: "none", padding: "0.65rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  🏥 Claim This Listing
                </button>
              )}
            </div>
          </aside>
        )}
      </div>

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
            {doc.address && (
              <div style={{ height: 160, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
                <GoogleMap address={doc.address} city={doc.city} />
              </div>
            )}
            <a href={`https://maps.google.com/?q=${encodeURIComponent(`${doc.address}, ${doc.city}, CA`)}`} target="_blank" rel="noreferrer"
              style={{ display: "block", textAlign: "center", fontSize: 12, color: C.ocean, marginTop: 8 }}>
              Open in Google Maps ↗
            </a>
            {!isVerified && (
              <button onClick={() => navigate("/pricing")} style={{ width: "100%", marginTop: "1rem", background: C.ocean, color: "white", border: "none", padding: "0.65rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                🏥 Claim This Listing
              </button>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
