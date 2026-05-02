import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NEIGHBORHOODS, ALL_LANGUAGES, COLORS as C } from "../data/doctors";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";




// ── SPECIALTY AUTOCOMPLETE ──────────────────────────────────────────────────
function SpecialtySearch({ value, onChange, onSelect, supabaseUrl, supabaseKey }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  async function fetchSuggestions(term) {
    if (!term || term.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/rpc/get_specialties`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ search_term: term }),
        }
      );
      const data = await res.json();
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (e) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  }

  function handleSelect(specialty) {
    onChange(specialty);
    setSuggestions([]);
    setShowSuggestions(false);
    onSelect(specialty);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setShowSuggestions(false); }
    if (e.key === 'Enter') { setShowSuggestions(false); onSelect(value); }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Type a specialty or condition..."
          style={{
            width: '100%', padding: '0.55rem 2rem 0.55rem 0.8rem',
            border: `1.5px solid ${C.sky}`, borderRadius: 8,
            fontFamily: 'inherit', fontSize: 13, outline: 'none',
            background: 'white', boxSizing: 'border-box',
          }}
        />
        {loading && (
          <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, border: `2px solid rgba(26,107,138,0.2)`, borderTopColor: C.ocean, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
          background: 'white', border: `1.5px solid ${C.border}`,
          borderRadius: 8, boxShadow: '0 8px 24px rgba(13,61,82,0.12)',
          marginTop: 4, maxHeight: 280, overflowY: 'auto',
        }}>
          {suggestions.map((s, i) => (
            <div key={i} onMouseDown={() => handleSelect(s.specialty)} style={{
              padding: '0.6rem 0.9rem', cursor: 'pointer', fontSize: 13,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: i < suggestions.length - 1 ? `1px solid ${C.border}` : 'none',
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f8fb'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <span style={{ color: C.deep, fontWeight: 500 }}>{s.specialty}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{s.count} providers</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

function Pill({ icon, text, green, red, blue }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500, background: green ? "#edfaf3" : red ? "#fff0f0" : blue ? "rgba(26,107,138,0.08)" : "#f0f8fb", color: green ? "#1a7a4a" : red ? "#c05050" : blue ? "#1a6b8a" : C.muted, border: `1px solid ${green ? "#b2e5cc" : red ? "#f5c0c0" : blue ? "rgba(26,107,138,0.2)" : C.border}`, whiteSpace: "nowrap" }}>{icon} {text}</span>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <div style={{ width: 38, height: 38, border: `3px solid rgba(26,107,138,0.15)`, borderTopColor: C.ocean, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: C.muted, fontSize: 14 }}>Searching San Diego providers…</p>
    </div>
  );
}

function DoctorCard({ doc, isMobile }) {
  const navigate = useNavigate();
  const initials = doc.name.replace(/Dr\.\s*/, "").split(" ").filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div onClick={() => navigate(`/doctor/${doc.npi}`, { state: { doc } })} style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: isMobile ? "1rem" : "1.1rem 1.3rem", marginBottom: "0.75rem", cursor: "pointer", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(13,61,82,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${C.sky}, ${C.ocean})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: C.deep, fontSize: isMobile ? 14 : 15, lineHeight: 1.3 }}>{doc.name}</div>
          <div style={{ color: C.ocean, fontSize: 12, fontWeight: 500, marginTop: 2 }}>{doc.specialty}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>📍 {doc.city}, CA{doc.phone && doc.phone !== "Call for number" && <> &nbsp;·&nbsp; 📞 {doc.phone}</>}</div>
        </div>
        {isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
            {doc.phone && doc.phone !== "Call for number" && <button onClick={e => { e.stopPropagation(); window.location = `tel:${doc.phone}`; }} style={{ background: C.ocean, color: "white", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📞 Call</button>}
            <button onClick={e => { e.stopPropagation(); navigate(`/doctor/${doc.npi}`, { state: { doc } }); }} style={{ background: "transparent", color: C.ocean, border: `1.5px solid ${C.ocean}`, padding: "5px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>Profile</button>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "0.7rem" }}>
        {doc.accepting === true && <Pill icon="✅" text="Accepting" green />}
        {doc.accepting === false && <Pill icon="❌" text="Not Accepting" red />}
        {doc.accepting === null && <Pill icon="❓" text="Not yet reported" />}
        {doc.telehealth === true && <Pill icon="💻" text="Telehealth" />}
        {doc.verified && <Pill icon="🏅" text="Verified" blue />}
        {doc.gender === "F" && <Pill icon="👩‍⚕️" text="Female" />}
        {doc.gender === "M" && <Pill icon="👨‍⚕️" text="Male" />}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.6rem" }}>
        <div style={{ fontSize: 10, color: "#9ab5bf" }}>📋 {doc.address}{doc.address && ", "}{doc.city} · NPI {doc.npi}</div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 6 }}>
            {doc.phone && doc.phone !== "Call for number" && <button onClick={e => { e.stopPropagation(); window.location = `tel:${doc.phone}`; }} style={{ background: C.ocean, color: "white", border: "none", padding: "5px 13px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>📞 Call</button>}
            <button onClick={e => { e.stopPropagation(); navigate(`/doctor/${doc.npi}`, { state: { doc } }); }} style={{ background: "transparent", color: C.ocean, border: `1.5px solid ${C.ocean}`, padding: "4px 11px", borderRadius: 7, fontSize: 11, cursor: "pointer" }}>Profile</button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPanel({ specialtySearch, setSpecialtySearch, neighborhood, setNeighborhood, gender, setGender, accepting, setAccepting, telehealth, setTelehealth, selectedLangs, setSelectedLangs, onClear, onApply, onSearch, isMobile }) {
  const sel = { width: "100%", padding: "0.5rem 0.7rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 13, background: "#f8fbfc", outline: "none", appearance: "none" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Specialty</div>
        <SpecialtySearch
          value={specialtySearch}
          onChange={setSpecialtySearch}
          onSelect={(s) => { setSpecialtySearch(s); onSearch(); }}
          supabaseUrl={SUPABASE_URL}
          supabaseKey={SUPABASE_ANON_KEY}
        />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Neighborhood</div>
        <select value={neighborhood} onChange={e => { setNeighborhood(e.target.value); }} style={sel}>{NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}</select>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Gender</div>
        <select value={gender} onChange={e => setGender(e.target.value)} style={sel}><option value="">Any</option><option value="F">Female</option><option value="M">Male</option></select>
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
            return <button key={lang} onClick={() => setSelectedLangs(active ? selectedLangs.filter(l => l !== lang) : [...selectedLangs, lang])} style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: active ? 600 : 400, background: active ? C.ocean : "white", color: active ? "white" : C.text, border: `1.5px solid ${active ? C.ocean : C.border}` }}>{lang}</button>;
          })}
        </div>
        {selectedLangs.length > 0 && <button onClick={() => setSelectedLangs([])} style={{ marginTop: 6, fontSize: 11, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>Clear languages</button>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {isMobile && <button onClick={() => { onSearch(); onApply(); }} style={{ flex: 1, background: C.ocean, color: "white", border: "none", padding: "0.65rem", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Show Results</button>}
        <button onClick={onClear} style={{ flex: isMobile ? 0 : 1, background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, padding: "0.6rem 1rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>Clear</button>
      </div>
    </div>
  );
}

export default function Search() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get("q") || "";
  const urlQuery = rawQuery.includes("object") ? "" : rawQuery;
  const [query, setQuery] = useState(urlQuery);
  const [neighborhood, setNeighborhood] = useState(searchParams.get("city") || "All of San Diego");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [gender, setGender] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [telehealth, setTelehealth] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const perPage = 10;

  const fetchDoctors = useCallback(async () => {
    setLoading(true); setError(""); setResults([]); setPage(1);
    const params = new URLSearchParams();
    const searchQuery = specialtySearch || (typeof query === "string" ? query.replace("[object Object]", "") : "");
    if (searchQuery) params.set("specialty", searchQuery);
    if (neighborhood && neighborhood !== "All of San Diego") params.set("city", neighborhood);
    params.set("limit", "500");
    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      let filtered = data.results || [];
      if (gender) filtered = filtered.filter(d => d.gender === gender);
      if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
      if (sort === "city") filtered.sort((a, b) => a.city.localeCompare(b.city));
      setResults(filtered);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, neighborhood, specialtySearch, gender, sort]);

  useEffect(() => { fetchDoctors(); }, []);

  const totalPages = Math.ceil(results.length / perPage);
  const pageData = results.slice((page - 1) * perPage, page * perPage);
  const activeFilterCount = [specialtySearch !== "", gender !== "", accepting, telehealth, neighborhood !== "All of San Diego", selectedLangs.length > 0].filter(Boolean).length;

  function clearAll() { setQuery(""); setSpecialtySearch(""); setNeighborhood("All of San Diego"); setGender(""); setAccepting(false); setTelehealth(false); setSelectedLangs([]); setPage(1); }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(253,250,245,0.97)", backdropFilter: "blur(12px)", borderBottom: `1px solid rgba(26,107,138,0.12)`, padding: isMobile ? "0.75rem 1rem" : "0.8rem 1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: isMobile ? "0.6rem" : 0 }}>
          <div onClick={() => navigate("/")} style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? 17 : 19, color: C.ocean, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Your Doctor <span style={{ color: C.dusk }}>SD</span></div>
          {!isMobile && (
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 15, color: C.muted, fontStyle: "italic", letterSpacing: "0.01em" }}>
                Finding care, made simple.
              </span>
            </div>
          )}
        </div>
        {isMobile && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchDoctors()} placeholder="Specialty or doctor name…" style={{ flex: 1, padding: "0.55rem 0.9rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 14, outline: "none", background: "white" }} />
            <button onClick={fetchDoctors} style={{ background: C.ocean, color: "white", border: "none", padding: "0.55rem 0.9rem", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🔍</button>
            <button onClick={() => setShowFilters(true)} style={{ background: activeFilterCount > 0 ? C.ocean : "white", color: activeFilterCount > 0 ? "white" : C.ocean, border: `1.5px solid ${activeFilterCount > 0 ? C.ocean : C.border}`, padding: "0.55rem 0.9rem", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              ⚙️{activeFilterCount > 0 && <span style={{ background: C.dusk, color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilterCount}</span>}
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

          <FilterPanel specialtySearch={specialtySearch} setSpecialtySearch={setSpecialtySearch} neighborhood={neighborhood} setNeighborhood={n => { setNeighborhood(n); setPage(1); }} gender={gender} setGender={setGender} accepting={accepting} setAccepting={setAccepting} telehealth={telehealth} setTelehealth={setTelehealth} selectedLangs={selectedLangs} setSelectedLangs={setSelectedLangs} onClear={() => { clearAll(); setShowFilters(false); }} onApply={() => setShowFilters(false)} onSearch={fetchDoctors} isMobile />
        </div>
      </>}

      <div style={{ maxWidth: 1050, margin: "0 auto", padding: isMobile ? "1rem" : "1.2rem 1.2rem 3rem", display: "flex", gap: "1.2rem", alignItems: "flex-start" }}>
        {!isMobile && (
          <aside style={{ width: 200, flexShrink: 0 }}>
            <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "1.1rem", position: "sticky", top: 72 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 14 }}>Filters</div>
              <FilterPanel specialtySearch={specialtySearch} setSpecialtySearch={setSpecialtySearch} neighborhood={neighborhood} setNeighborhood={n => { setNeighborhood(n); setPage(1); }} gender={gender} setGender={setGender} accepting={accepting} setAccepting={setAccepting} telehealth={telehealth} setTelehealth={setTelehealth} selectedLangs={selectedLangs} setSelectedLangs={setSelectedLangs} onClear={clearAll} onSearch={fetchDoctors} isMobile={false} />
              <button onClick={fetchDoctors} style={{ width: "100%", marginTop: 10, background: C.ocean, color: "white", border: "none", padding: "0.6rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Apply Filters</button>
            </div>
          </aside>
        )}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 13, color: C.muted }}>
              {loading ? "Searching NPI registry…" : error ? "" : results.length > 0
                ? <span>Showing <strong style={{ color: C.deep }}>{(page-1)*perPage+1}–{Math.min(page*perPage,results.length)}</strong> of <strong style={{ color: C.deep }}>{results.length}</strong> licensed San Diego providers</span>
                : "No providers found — try a different specialty"}
            </div>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ padding: "0.4rem 0.7rem", border: `1.5px solid ${C.border}`, borderRadius: 7, fontFamily: "inherit", fontSize: 12, background: "white", outline: "none", appearance: "none" }}>
              <option value="name">Sort: Name A–Z</option>
              <option value="city">Sort: City</option>
            </select>
          </div>

          {loading && <Spinner />}
          {error && (
            <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "3rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
              <div style={{ fontWeight: 700, color: C.deep, marginBottom: 6 }}>Search failed</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>{error}</div>
              <button onClick={fetchDoctors} style={{ background: C.ocean, color: "white", border: "none", padding: "0.6rem 1.4rem", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>Try Again</button>
            </div>
          )}
          {!loading && !error && results.length === 0 && (
            <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "3rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <div style={{ fontWeight: 700, color: C.deep, marginBottom: 6 }}>No doctors found</div>
              <div style={{ fontSize: 13, color: C.muted }}>Try a different specialty or neighborhood.</div>
              <button onClick={clearAll} style={{ marginTop: 14, background: C.ocean, color: "white", border: "none", padding: "0.6rem 1.4rem", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>Clear Filters</button>
            </div>
          )}
          {!loading && !error && pageData.map((doc, i) => <DoctorCard key={doc.npi || i} doc={doc} isMobile={isMobile} />)}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 20, flexWrap: "wrap" }}>
              <button onClick={() => { setPage(p => Math.max(1,p-1)); window.scrollTo(0,0); }} disabled={page===1} style={{ padding: "7px 14px", border: `1.5px solid ${C.border}`, borderRadius: 8, background: "white", cursor: page===1?"default":"pointer", opacity: page===1?0.4:1, fontSize: 13 }}>← Prev</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={() => { setPage(p); window.scrollTo(0,0); }} style={{ padding: "7px 13px", border: `1.5px solid ${p===page?C.ocean:C.border}`, borderRadius: 8, background: p===page?C.ocean:"white", color: p===page?"white":C.text, cursor: "pointer", fontSize: 13, fontWeight: p===page?600:400 }}>{p}</button>
              ))}
              <button onClick={() => { setPage(p => Math.min(totalPages,p+1)); window.scrollTo(0,0); }} disabled={page===totalPages} style={{ padding: "7px 14px", border: `1.5px solid ${C.border}`, borderRadius: 8, background: "white", cursor: page===totalPages?"default":"pointer", opacity: page===totalPages?0.4:1, fontSize: 13 }}>Next →</button>
            </div>
          )}
          {!loading && results.length > 0 && (
            <div style={{ fontSize: 11, color: "#9ab5bf", textAlign: "center", marginTop: 16 }}>Data sourced live from the National Provider Index (NPPES). NPI does not confirm licensure.</div>
          )}
        </main>
      </div>
    </div>
  );
}
