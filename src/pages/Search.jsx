import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Nav from "../components/Nav";
import { ALL_DOCTORS, SPECIALTIES, NEIGHBORHOODS, ALL_LANGUAGES, COLORS as C } from "../data/doctors";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

function Pill({ icon, text, green, red }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500,
      background: green ? "#edfaf3" : red ? "#fff0f0" : "#f0f8fb",
      color: green ? "#1a7a4a" : red ? "#c05050" : C.muted,
      border: `1px solid ${green ? "#b2e5cc" : red ? "#f5c0c0" : C.border}`,
      whiteSpace: "nowrap",
    }}>{icon} {text}</span>
  );
}

function DoctorCard({ doc, isMobile }) {
  const navigate = useNavigate();
  const initials = doc.name.replace(/Dr\.\s*/, "").split(" ").filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div onClick={() => navigate(`/doctor/${doc.id}`)} style={{
      background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14,
      padding: isMobile ? "1rem" : "1.1rem 1.3rem", marginBottom: "0.75rem",
      cursor: "pointer", transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(13,61,82,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${C.sky}, ${C.ocean})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: C.deep, fontSize: isMobile ? 14 : 15, lineHeight: 1.3 }}>{doc.name}</div>
          <div style={{ color: C.ocean, fontSize: 12, fontWeight: 500, marginTop: 2 }}>{doc.specialty}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>📍 {doc.city}, CA &nbsp;·&nbsp; 📞 {doc.phone}</div>
        </div>
        {isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
            <button onClick={e => { e.stopPropagation(); window.location = `tel:${doc.phone}`; }} style={{ background: C.ocean, color: "white", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📞 Call</button>
            <button onClick={e => { e.stopPropagation(); navigate(`/doctor/${doc.id}`); }} style={{ background: "transparent", color: C.ocean, border: `1.5px solid ${C.ocean}`, padding: "5px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>Profile</button>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "0.7rem" }}>
        {doc.accepting ? <Pill icon="✅" text="Accepting" green /> : <Pill icon="❌" text="Not Accepting" red />}
        {doc.telehealth && <Pill icon="💻" text="Telehealth" />}
        <Pill icon={doc.gender === "F" ? "👩‍⚕️" : "👨‍⚕️"} text={doc.gender === "F" ? "Female" : "Male"} />
        <Pill icon="🗣️" text={doc.languages.join(", ")} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.6rem" }}>
        <div style={{ fontSize: 10, color: "#9ab5bf" }}>📋 {doc.address}, {doc.city} · NPI {doc.npi}</div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={e => { e.stopPropagation(); window.location = `tel:${doc.phone}`; }} style={{ background: C.ocean, color: "white", border: "none", padding: "5px 13px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>📞 Call</button>
            <button onClick={e => { e.stopPropagation(); navigate(`/doctor/${doc.id}`); }} style={{ background: "transparent", color: C.ocean, border: `1.5px solid ${C.ocean}`, padding: "4px 11px", borderRadius: 7, fontSize: 11, cursor: "pointer" }}>Profile</button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPanel({ specialty, setSpecialty, gender, setGender, accepting, setAccepting, telehealth, setTelehealth, selectedLangs, setSelectedLangs, onClear, onApply, isMobile }) {
  const sel = { width: "100%", padding: "0.5rem 0.7rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 13, background: "#f8fbfc", outline: "none", appearance: "none" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Specialty</div>
        <select value={specialty} onChange={e => setSpecialty(e.target.value)} style={sel}>{SPECIALTIES.map(s => <option key={s}>{s}</option>)}</select>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Gender</div>
        <select value={gender} onChange={e => setGender(e.target.value)} style={sel}>
          <option value="">Any</option><option value="F">Female</option><option value="M">Male</option>
        </select>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Availability</div>
        {[["✅ Accepting new patients", accepting, setAccepting], ["💻 Telehealth available", telehealth, setTelehealth]].map(([label, val, set]) => (
          <label key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginBottom: 8 }}>
            <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} style={{ accentColor: C.ocean, width: 16, height: 16 }} />{label}
          </label>
        ))}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Language Spoken</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ALL_LANGUAGES.map(lang => {
            const active = selectedLangs.includes(lang);
            return (
              <button key={lang} onClick={() => setSelectedLangs(active ? selectedLangs.filter(l => l !== lang) : [...selectedLangs, lang])}
                style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: active ? 600 : 400, background: active ? C.ocean : "white", color: active ? "white" : C.text, border: `1.5px solid ${active ? C.ocean : C.border}` }}>
                {lang}
              </button>
            );
          })}
        </div>
        {selectedLangs.length > 0 && <button onClick={() => setSelectedLangs([])} style={{ marginTop: 6, fontSize: 11, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>Clear languages</button>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {isMobile && <button onClick={onApply} style={{ flex: 1, background: C.ocean, color: "white", border: "none", padding: "0.65rem", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Show Results</button>}
        <button onClick={onClear} style={{ flex: isMobile ? 0 : 1, background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, padding: "0.6rem 1rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>Clear</button>
      </div>
    </div>
  );
}

export default function Search() {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [neighborhood, setNeighborhood] = useState(searchParams.get("city") || "All of San Diego");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [gender, setGender] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [telehealth, setTelehealth] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 10;

  const activeFilterCount = [specialty !== "All Specialties", gender !== "", accepting, telehealth, neighborhood !== "All of San Diego", selectedLangs.length > 0].filter(Boolean).length;

  const filtered = useMemo(() => {
    let data = [...ALL_DOCTORS];
    if (query.trim()) { const q = query.toLowerCase(); data = data.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.city.toLowerCase().includes(q)); }
    if (specialty !== "All Specialties") data = data.filter(d => d.specialty === specialty);
    if (neighborhood !== "All of San Diego") data = data.filter(d => d.city === neighborhood);
    if (gender) data = data.filter(d => d.gender === gender);
    if (accepting) data = data.filter(d => d.accepting);
    if (telehealth) data = data.filter(d => d.telehealth);
    if (selectedLangs.length > 0) data = data.filter(d => selectedLangs.every(l => d.languages.includes(l)));
    if (sort === "name") data.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "city") data.sort((a, b) => a.city.localeCompare(b.city));
    return data;
  }, [query, specialty, neighborhood, gender, accepting, telehealth, selectedLangs, sort]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);
  const r = setter => val => { setter(val); setPage(1); };

  function clearAll() { setQuery(""); setSpecialty("All Specialties"); setNeighborhood("All of San Diego"); setGender(""); setAccepting(false); setTelehealth(false); setSelectedLangs([]); setPage(1); }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(253,250,245,0.97)", backdropFilter: "blur(12px)", borderBottom: `1px solid rgba(26,107,138,0.12)`, padding: isMobile ? "0.75rem 1rem" : "0.8rem 1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: isMobile ? "0.6rem" : 0 }}>
          <div onClick={() => window.location.href = "/"} style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? 17 : 19, color: C.ocean, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Your Doctor <span style={{ color: C.dusk }}>SD</span></div>
          {!isMobile && <>
            <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} onKeyDown={e => e.key === "Enter" && setPage(1)} placeholder="Search by specialty, name, or city…"
              style={{ flex: 1, padding: "0.5rem 0.9rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 13, outline: "none", background: "white" }} />
            <select value={neighborhood} onChange={e => r(setNeighborhood)(e.target.value)} style={{ padding: "0.5rem 0.8rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 13, background: "white", outline: "none", appearance: "none" }}>
              {NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}
            </select>
          </>}
        </div>
        {isMobile && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Specialty, doctor, or city…"
              style={{ flex: 1, padding: "0.55rem 0.9rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 14, outline: "none", background: "white" }} />
            <button onClick={() => setShowFilters(true)} style={{ background: activeFilterCount > 0 ? C.ocean : "white", color: activeFilterCount > 0 ? "white" : C.ocean, border: `1.5px solid ${activeFilterCount > 0 ? C.ocean : C.border}`, padding: "0.55rem 0.9rem", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              ⚙️ Filters {activeFilterCount > 0 && <span style={{ background: C.dusk, color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilterCount}</span>}
            </button>
          </div>
        )}
      </nav>

      {isMobile && showFilters && <>
        <div onClick={() => setShowFilters(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300 }} />
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 400, background: "white", borderRadius: "20px 20px 0 0", padding: "1.5rem 1.2rem 2rem", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 -8px 30px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.deep }}>Filter Doctors</div>
            <button onClick={() => setShowFilters(false)} style={{ background: "#f0f4f5", border: "none", borderRadius: "50%", width: 32, height: 32, fontSize: 16, cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Neighborhood</div>
            <select value={neighborhood} onChange={e => r(setNeighborhood)(e.target.value)} style={{ width: "100%", padding: "0.5rem 0.7rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 13, background: "#f8fbfc", outline: "none", appearance: "none" }}>
              {NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <FilterPanel specialty={specialty} setSpecialty={r(setSpecialty)} gender={gender} setGender={r(setGender)} accepting={accepting} setAccepting={r(setAccepting)} telehealth={telehealth} setTelehealth={r(setTelehealth)} selectedLangs={selectedLangs} setSelectedLangs={r(setSelectedLangs)} onClear={() => { clearAll(); setShowFilters(false); }} onApply={() => setShowFilters(false)} isMobile />
        </div>
      </>}

      <div style={{ maxWidth: 1050, margin: "0 auto", padding: isMobile ? "1rem" : "1.2rem 1.2rem 3rem", display: "flex", gap: "1.2rem", alignItems: "flex-start" }}>
        {!isMobile && (
          <aside style={{ width: 200, flexShrink: 0 }}>
            <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "1.1rem", position: "sticky", top: 72 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 14 }}>Filters</div>
              <FilterPanel specialty={specialty} setSpecialty={r(setSpecialty)} gender={gender} setGender={r(setGender)} accepting={accepting} setAccepting={r(setAccepting)} telehealth={telehealth} setTelehealth={r(setTelehealth)} selectedLangs={selectedLangs} setSelectedLangs={r(setSelectedLangs)} onClear={clearAll} isMobile={false} />
            </div>
          </aside>
        )}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 13, color: C.muted }}>
              {filtered.length > 0 ? <span>Showing <strong style={{ color: C.deep }}>{(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)}</strong> of <strong style={{ color: C.deep }}>{filtered.length}</strong> providers</span> : "No providers match your search"}
            </div>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ padding: "0.4rem 0.7rem", border: `1.5px solid ${C.border}`, borderRadius: 7, fontFamily: "inherit", fontSize: 12, background: "white", outline: "none", appearance: "none" }}>
              <option value="name">Sort: Name A–Z</option>
              <option value="city">Sort: City</option>
            </select>
          </div>
          {filtered.length === 0
            ? <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "3rem 2rem", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                <div style={{ fontWeight: 700, color: C.deep, marginBottom: 6 }}>No doctors found</div>
                <div style={{ fontSize: 13, color: C.muted }}>Try a different search or clear your filters.</div>
                <button onClick={clearAll} style={{ marginTop: 14, background: C.ocean, color: "white", border: "none", padding: "0.6rem 1.4rem", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>Clear Filters</button>
              </div>
            : pageData.map(doc => <DoctorCard key={doc.id} doc={doc} isMobile={isMobile} />)
          }
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 20, flexWrap: "wrap" }}>
              <button onClick={() => { setPage(p => Math.max(1,p-1)); window.scrollTo(0,0); }} disabled={page===1} style={{ padding: "7px 14px", border: `1.5px solid ${C.border}`, borderRadius: 8, background: "white", cursor: page===1?"default":"pointer", opacity: page===1?0.4:1, fontSize: 13 }}>← Prev</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={() => { setPage(p); window.scrollTo(0,0); }} style={{ padding: "7px 13px", border: `1.5px solid ${p===page?C.ocean:C.border}`, borderRadius: 8, background: p===page?C.ocean:"white", color: p===page?"white":C.text, cursor: "pointer", fontSize: 13, fontWeight: p===page?600:400 }}>{p}</button>
              ))}
              <button onClick={() => { setPage(p => Math.min(totalPages,p+1)); window.scrollTo(0,0); }} disabled={page===totalPages} style={{ padding: "7px 14px", border: `1.5px solid ${C.border}`, borderRadius: 8, background: "white", cursor: page===totalPages?"default":"pointer", opacity: page===totalPages?0.4:1, fontSize: 13 }}>Next →</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
