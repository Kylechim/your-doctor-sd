import { ALL_INSURANCES, ALL_LANGUAGES, DAYS, COLORS as C } from "../data/doctors";
import { useState } from "react";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

const STEPS = ["Find Practice", "Verify Identity", "Your Details", "Review & Submit"];

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useState(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  });
  return mobile;
}

function StepIndicator({ current, isMobile }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: "2rem" }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13,
              background: i < current ? "#1a7a4a" : i === current ? C.ocean : "white",
              color: i <= current ? "white" : C.muted,
              border: `2px solid ${i < current ? "#1a7a4a" : i === current ? C.ocean : C.border}`,
              transition: "all 0.3s", zIndex: 1,
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            {!isMobile && (
              <div style={{ fontSize: 11, color: i === current ? C.ocean : C.muted, fontWeight: i === current ? 600 : 400, whiteSpace: "nowrap" }}>
                {label}
              </div>
            )}
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ width: isMobile ? 30 : 60, height: 2, background: i < current ? "#1a7a4a" : C.border, margin: isMobile ? "0 4px" : "0 4px", marginBottom: isMobile ? 0 : 20, transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "1.8rem", ...style }}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: C.deep, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{children}</div>;
}

function Input({ value, onChange, placeholder, type = "text", style, onKeyDown }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
      style={{ width: "100%", padding: "0.65rem 0.9rem", border: `1.5px solid ${C.border}`, borderRadius: 9, fontFamily: "inherit", fontSize: 14, color: C.text, background: "#f8fbfc", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", ...style }}
      onFocus={e => e.target.style.borderColor = C.sky}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  );
}

function ToggleChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 13px", borderRadius: 20, fontSize: 13, cursor: "pointer",
      fontFamily: "inherit", fontWeight: active ? 600 : 400,
      background: active ? C.ocean : "white", color: active ? "white" : C.text,
      border: `1.5px solid ${active ? C.ocean : C.border}`, transition: "all 0.15s",
    }}>{label}</button>
  );
}

// ── STEP 1: Find Practice — searches real database ──
function Step1({ data, setData, onNext }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);

  async function doSearch() {
    if (search.trim().length < 2) return;
    setSearching(true);
    setSearched(false);
    try {
      // Search by name or NPI
      const isNpi = /^\d+$/.test(search.trim());
      let url;
      if (isNpi) {
        url = `/api/search?name=${encodeURIComponent(search.trim())}&limit=10`;
      } else {
        url = `/api/search?name=${encodeURIComponent(search.trim())}&limit=10`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
      setSearched(true);
    } catch (e) {
      setResults([]);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: C.deep, marginBottom: 6 }}>Find Your Practice</h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>Search by your name or NPI number to find your listing in our directory.</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.2rem" }}>
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Your name or NPI number…"
          onKeyDown={e => e.key === "Enter" && doSearch()}
          style={{ flex: 1 }}
        />
        <button onClick={doSearch} disabled={searching}
          style={{ background: C.ocean, color: "white", border: "none", padding: "0 1.2rem", borderRadius: 9, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: searching ? "default" : "pointer", whiteSpace: "nowrap", opacity: searching ? 0.7 : 1 }}>
          {searching ? "..." : "Search"}
        </button>
      </div>

      {searched && (
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
            {results.length > 0 ? `Found ${results.length} results for "${search}"` : `No results found for "${search}"`}
          </div>
          {results.map((r, i) => (
            <div key={i} onClick={() => setSelected(r)} style={{
              border: `1.5px solid ${selected?.npi === r.npi ? C.ocean : C.border}`,
              borderRadius: 12, padding: "1rem 1.1rem", marginBottom: "0.7rem",
              cursor: "pointer",
              background: selected?.npi === r.npi ? "rgba(26,107,138,0.04)" : "white",
              transition: "border-color 0.15s, background 0.15s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, color: C.deep, fontSize: 15, marginBottom: 2 }}>{r.name}</div>
                  <div style={{ fontSize: 13, color: C.ocean, marginBottom: 3 }}>{r.specialty}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>📍 {r.address}, {r.city}, CA</div>
                  <div style={{ fontSize: 11, color: "#aac4ce", marginTop: 2 }}>NPI {r.npi}</div>
                </div>
                <div>
                  {selected?.npi === r.npi
                    ? <span style={{ fontSize: 18 }}>✅</span>
                    : <span style={{ fontSize: 12, color: C.ocean, fontWeight: 500 }}>Select →</span>
                  }
                </div>
              </div>
            </div>
          ))}

          {results.length === 0 && (
            <div style={{ marginTop: "1rem", padding: "0.9rem", background: "rgba(26,107,138,0.04)", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, color: C.muted }}>
              🤔 Don't see your practice? Try searching by your NPI number, or contact us at <span style={{ color: C.ocean }}>hello@yourdoctorsd.com</span>
            </div>
          )}
        </div>
      )}

      <button onClick={() => { if (selected) { setData({ ...data, practice: selected }); onNext(); } }}
        disabled={!selected}
        style={{
          width: "100%", marginTop: "1.5rem",
          background: selected ? C.ocean : C.border,
          color: selected ? "white" : C.muted,
          border: "none", padding: "0.8rem", borderRadius: 10,
          fontFamily: "inherit", fontSize: 15, fontWeight: 600,
          cursor: selected ? "pointer" : "default", transition: "all 0.2s",
        }}>
        Continue →
      </button>
    </div>
  );
}

// ── STEP 2: Verify Identity ──
function Step2({ data, setData, onNext, onBack }) {
  const [npiConfirm, setNpiConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [licenseFile, setLicenseFile] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const canContinue = npiConfirm === data.practice?.npi && email.includes("@") && agreed;

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🔐</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: C.deep, marginBottom: 6 }}>Verify Your Identity</h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>This keeps our directory trustworthy. Your info is never shared publicly.</p>
      </div>

      <div style={{ background: "rgba(26,107,138,0.05)", border: `1px solid rgba(26,107,138,0.15)`, borderRadius: 10, padding: "0.9rem 1rem", marginBottom: "1.4rem", fontSize: 13 }}>
        <div style={{ fontWeight: 600, color: C.deep }}>{data.practice?.name}</div>
        <div style={{ color: C.muted, marginTop: 2 }}>{data.practice?.address}, {data.practice?.city}, CA</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
        <div>
          <Label>Confirm Your NPI Number</Label>
          <Input value={npiConfirm} onChange={e => setNpiConfirm(e.target.value)} placeholder="Enter your 10-digit NPI…" />
          {npiConfirm.length > 0 && npiConfirm !== data.practice?.npi && (
            <div style={{ fontSize: 12, color: "#c05050", marginTop: 4 }}>⚠️ NPI doesn't match our records for this listing</div>
          )}
          {npiConfirm === data.practice?.npi && (
            <div style={{ fontSize: 12, color: "#1a7a4a", marginTop: 4 }}>✅ NPI verified</div>
          )}
        </div>

        <div>
          <Label>Professional Email Address</Label>
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@practice.com" type="email" />
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>We'll use this to contact you about your listing.</div>
        </div>

        <div>
          <Label>Upload Medical License (optional but recommended)</Label>
          <div onClick={() => document.getElementById('licenseUpload').click()} style={{
            border: `2px dashed ${licenseFile ? "#1a7a4a" : C.border}`, borderRadius: 10,
            padding: "1.4rem", textAlign: "center", cursor: "pointer",
            background: licenseFile ? "#edfaf3" : "#fafcfd", transition: "all 0.2s",
          }}>
            {licenseFile
              ? <div style={{ color: "#1a7a4a", fontWeight: 600, fontSize: 14 }}>✅ {licenseFile.name}</div>
              : <>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                  <div style={{ fontSize: 13, color: C.muted }}>Tap to upload your license</div>
                  <div style={{ fontSize: 11, color: "#aac4ce", marginTop: 3 }}>PDF, JPG, or PNG · Max 10MB</div>
                </>
            }
            <input id="licenseUpload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }}
              onChange={e => setLicenseFile(e.target.files[0])} />
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: C.text, lineHeight: 1.6 }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: C.ocean, marginTop: 2, width: 16, height: 16, flexShrink: 0 }} />
          I confirm that I am the provider listed above, and that all information I submit is accurate and up to date. I agree to the <span style={{ color: C.ocean, textDecoration: "underline" }}>Terms of Use</span>.
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: "1.5rem" }}>
        <button onClick={onBack} style={{ background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, padding: "0.75rem 1.2rem", borderRadius: 10, fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>← Back</button>
        <button onClick={() => { setData({ ...data, email }); onNext(); }} disabled={!canContinue}
          style={{ flex: 1, background: canContinue ? C.ocean : C.border, color: canContinue ? "white" : C.muted, border: "none", padding: "0.8rem", borderRadius: 10, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: canContinue ? "pointer" : "default", transition: "all 0.2s" }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ── STEP 3: Your Details ──
function Step3({ data, setData, onNext, onBack }) {
  const [photo, setPhoto] = useState(null);
  const [about, setAbout] = useState("");
  const [accepting, setAccepting] = useState(true);
  const [telehealth, setTelehealth] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState([]);
  const [selectedLangs, setSelectedLangs] = useState(["English"]);
  const [hours, setHours] = useState(
    DAYS.map(d => ({ day: d, open: d !== "Sunday", from: "08:00", to: "17:00" }))
  );

  function toggleInsurance(ins) {
    setSelectedInsurance(s => s.includes(ins) ? s.filter(i => i !== ins) : [...s, ins]);
  }
  function toggleLang(lang) {
    setSelectedLangs(s => s.includes(lang) ? s.filter(l => l !== lang) : [...s, lang]);
  }
  function updateHours(idx, field, val) {
    setHours(h => h.map((row, i) => i === idx ? { ...row, [field]: val } : row));
  }
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  const sectionHead = (title) => (
    <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: C.deep, margin: "1.6rem 0 0.9rem", paddingTop: "1.2rem", borderTop: `1px solid ${C.border}` }}>{title}</div>
  );

  const initials = (data.practice?.name || "").replace(/^Dr\.?\s*/i, "").split(" ").filter(w => /^[A-Z]/.test(w)).slice(0,2).map(w=>w[0]).join("").toUpperCase() || "DR";

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: C.deep, marginBottom: 6 }}>Your Practice Details</h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>This is what patients will see on your listing. You can update it anytime.</p>
      </div>

      {/* Photo */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "0.5rem" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: photo ? "transparent" : `linear-gradient(135deg, ${C.sky}, ${C.ocean})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 24, color: "white", border: `2px solid ${C.border}` }}>
          {photo ? <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
        </div>
        <div>
          <Label>Profile Photo</Label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", background: "white", border: `1.5px solid ${C.border}`, padding: "6px 14px", borderRadius: 8, fontSize: 13, color: C.text, fontFamily: "inherit" }}>
            📷 {photo ? "Change Photo" : "Upload Photo"}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
          </label>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>JPG or PNG · Recommended 400×400px</div>
        </div>
      </div>

      {sectionHead("About You")}
      <Label>Bio</Label>
      <textarea value={about} onChange={e => setAbout(e.target.value)}
        placeholder="Tell patients about your background, approach to care, and what makes your practice unique…"
        style={{ width: "100%", padding: "0.65rem 0.9rem", border: `1.5px solid ${C.border}`, borderRadius: 9, fontFamily: "inherit", fontSize: 14, resize: "vertical", minHeight: 100, outline: "none", boxSizing: "border-box", color: C.text }} />

      {sectionHead("Availability")}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "0.8rem" }}>
        {[
          { label: "✅ Accepting New Patients", val: accepting, set: setAccepting },
          { label: "💻 Telehealth Available", val: telehealth, set: setTelehealth },
        ].map(({ label, val, set }) => (
          <button key={label} onClick={() => set(!val)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: val ? 600 : 400, background: val ? C.ocean : "white", color: val ? "white" : C.text, border: `1.5px solid ${val ? C.ocean : C.border}` }}>{label}</button>
        ))}
      </div>

      {sectionHead("Office Hours")}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {hours.map((row, i) => (
          <div key={row.day} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", minWidth: 110 }}>
              <input type="checkbox" checked={row.open} onChange={e => updateHours(i, "open", e.target.checked)} style={{ accentColor: C.ocean }} />
              <span style={{ fontSize: 13, fontWeight: row.open ? 600 : 400, color: row.open ? C.text : C.muted }}>{row.day}</span>
            </label>
            {row.open
              ? <>
                  <input type="time" value={row.from} onChange={e => updateHours(i, "from", e.target.value)} style={{ padding: "4px 8px", border: `1.5px solid ${C.border}`, borderRadius: 7, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
                  <span style={{ fontSize: 12, color: C.muted }}>to</span>
                  <input type="time" value={row.to} onChange={e => updateHours(i, "to", e.target.value)} style={{ padding: "4px 8px", border: `1.5px solid ${C.border}`, borderRadius: 7, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
                </>
              : <span style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>Closed</span>
            }
          </div>
        ))}
      </div>

      {sectionHead("Insurance Accepted")}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {ALL_INSURANCES.map(ins => <ToggleChip key={ins} label={ins} active={selectedInsurance.includes(ins)} onClick={() => toggleInsurance(ins)} />)}
      </div>

      {sectionHead("Languages Spoken")}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {ALL_LANGUAGES.map(lang => <ToggleChip key={lang} label={lang} active={selectedLangs.includes(lang)} onClick={() => toggleLang(lang)} />)}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: "2rem" }}>
        <button onClick={onBack} style={{ background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, padding: "0.75rem 1.2rem", borderRadius: 10, fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>← Back</button>
        <button onClick={() => { setData({ ...data, photo, about, accepting, telehealth, insurance: selectedInsurance, languages: selectedLangs, hours }); onNext(); }}
          style={{ flex: 1, background: C.ocean, color: "white", border: "none", padding: "0.8rem", borderRadius: 10, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          Review & Submit →
        </button>
      </div>
    </div>
  );
}

// ── STEP 4: Review & Submit — saves to Supabase ──
function Step4({ data, onBack, onSubmit }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const doc = data.practice;
  const openDays = (data.hours || []).filter(h => h.open);

  const Row = ({ label, value }) => (
    <div style={{ display: "flex", gap: 12, paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 100 }}>{label}</div>
      <div style={{ fontSize: 13, color: C.text, flex: 1 }}>{value}</div>
    </div>
  );

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      // Save to claimed_listings table — verified: false until you manually approve
      const payload = {
        npi: doc.npi,
        verified: false, // you manually set this to true after review
        accepting_patients: data.accepting ?? true,
        telehealth: data.telehealth ?? false,
        languages: data.languages || ["English"],
        insurance: data.insurance || [],
        hours: data.hours || null,
        bio: data.about || null,
        photo_url: null, // photo upload to storage would go here
        contact_email: data.email,
        submitted_at: new Date().toISOString(),
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/claimed_listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Submission failed");
      }

      onSubmit();
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again or email us at hello@yourdoctorsd.com");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: C.deep, marginBottom: 6 }}>Review Your Listing</h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>Make sure everything looks right before submitting. We'll review within 1–2 business days.</p>
      </div>

      <div style={{ background: `linear-gradient(135deg, ${C.deep}, ${C.ocean})`, borderRadius: 14, padding: "1.3rem", marginBottom: "1.2rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 20, color: "white", flexShrink: 0 }}>
          {data.photo ? <img src={data.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "DR"}
        </div>
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "white" }}>{doc?.name}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{doc?.specialty}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>📍 {doc?.address}, {doc?.city}, CA</div>
        </div>
      </div>

      <Row label="Email" value={data.email || "—"} />
      <Row label="NPI" value={doc?.npi} />
      <Row label="Accepting" value={data.accepting ? "✅ Yes, accepting new patients" : "❌ Not currently accepting"} />
      <Row label="Telehealth" value={data.telehealth ? "💻 Available" : "Not offered"} />
      <Row label="Insurance" value={data.insurance?.length > 0 ? data.insurance.join(", ") : "None selected"} />
      <Row label="Languages" value={data.languages?.join(", ") || "English"} />
      <Row label="Open Days" value={openDays.map(h => `${h.day} ${h.from}–${h.to}`).join(", ") || "Not set"} />
      {data.about && <Row label="Bio" value={data.about} />}

      <div style={{ background: "rgba(26,107,138,0.05)", border: `1px solid rgba(26,107,138,0.15)`, borderRadius: 10, padding: "0.9rem 1rem", marginBottom: "1.2rem", fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
        🔍 Our team will review your submission and activate your verified listing within <strong style={{ color: C.deep }}>1–2 business days</strong>. You'll receive a confirmation at <strong style={{ color: C.deep }}>{data.email}</strong>.
      </div>

      {error && <div style={{ fontSize: 13, color: "#c05050", marginBottom: 12, padding: "0.7rem 1rem", background: "#fff0f0", borderRadius: 8, border: "1px solid #f5c0c0" }}>{error}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onBack} disabled={submitting} style={{ background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, padding: "0.75rem 1.2rem", borderRadius: 10, fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>← Edit</button>
        <button onClick={handleSubmit} disabled={submitting}
          style={{ flex: 1, background: submitting ? C.border : C.dusk, color: submitting ? C.muted : "white", border: "none", padding: "0.8rem", borderRadius: 10, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: submitting ? "default" : "pointer" }}>
          {submitting ? "Submitting…" : "🚀 Submit Listing"}
        </button>
      </div>
    </div>
  );
}

// ── SUCCESS ──
function Success({ email }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: C.deep, marginBottom: 10 }}>You're all set!</h2>
      <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 380, margin: "0 auto 1.5rem" }}>
        Thank you for claiming your listing on <strong>Your Doctor SD</strong>. We'll review your submission and activate it within 1–2 business days.
      </p>
      <div style={{ background: "#edfaf3", border: `1px solid #b2e5cc`, borderRadius: 12, padding: "1rem 1.2rem", marginBottom: "1.5rem", fontSize: 13, color: "#1a7a4a", maxWidth: 380, margin: "0 auto 1.5rem" }}>
        📬 We'll be in touch at <strong>{email}</strong> once your listing is verified.
      </div>
      <button onClick={() => window.location.href = "/"} style={{ background: C.ocean, color: "white", border: "none", padding: "0.75rem 2rem", borderRadius: 10, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
        ← Back to Your Doctor SD
      </button>
    </div>
  );
}

// ── MAIN ──
export default function ClaimListing() {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({});

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(253,250,245,0.97)", backdropFilter: "blur(12px)", borderBottom: `1px solid rgba(26,107,138,0.12)`, padding: "0.8rem 1.2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div onClick={() => window.location.href = "/"} style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? 16 : 18, color: C.ocean, fontWeight: 700, cursor: "pointer" }}>
          Your Doctor <span style={{ color: C.dusk }}>SD</span>
        </div>
        {!submitted && <div style={{ fontSize: 13, color: C.muted }}>Claim Your Free Listing</div>}
      </nav>

      {!submitted && step === 0 && (
        <div style={{ background: `linear-gradient(135deg, ${C.deep}, ${C.ocean})`, color: "white", padding: isMobile ? "1.8rem 1.2rem" : "2.2rem 2rem", textAlign: "center" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ fontSize: isMobile ? 20 : 24, fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: 8 }}>Claim Your Free Listing on Your Doctor SD</div>
            <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>Help San Diego patients find you with accurate, up-to-date information. No fees. No paid rankings.</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1.2rem", flexWrap: "wrap" }}>
              {["Free forever", "Verified badge", "You control your info"].map(t => (
                <div key={t} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 5, opacity: 0.9 }}>
                  <span style={{ color: "#a8d8bc" }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 620, margin: "0 auto", padding: isMobile ? "1.2rem 1rem 3rem" : "2rem 1.2rem 4rem" }}>
        {submitted ? <Success email={data.email} /> : (
          <Card>
            <StepIndicator current={step} isMobile={isMobile} />
            {step === 0 && <Step1 data={data} setData={setData} onNext={() => setStep(1)} />}
            {step === 1 && <Step2 data={data} setData={setData} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
            {step === 2 && <Step3 data={data} setData={setData} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <Step4 data={data} onBack={() => setStep(2)} onSubmit={() => setSubmitted(true)} />}
          </Card>
        )}
      </div>
    </div>
  );
}
