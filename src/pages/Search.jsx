import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NEIGHBORHOODS, ALL_LANGUAGES, COLORS as C } from "../data/doctors";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";
const PAGE_SIZE = 20;

function makeDocSlug(doc) {
  const name = (doc.name || "").replace(/^Dr\.?\s*/i, "").replace(/,.*$/, "").trim();
  const raw = `${name} ${doc.specialty || ""} ${doc.city || ""} ${doc.npi}`;
  return raw.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

function Stars({ rating, size = 12 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ fontSize: size, color: s <= Math.round(rating) ? "#f5a623" : "#ddd", lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
}

const NEIGHBORHOOD_COORDS = {
  "All of San Diego": { lat: 32.8, lng: -117.1, zoom: 10 },
  "San Diego": { lat: 32.7157, lng: -117.1611, zoom: 12 },
  "Chula Vista": { lat: 32.6401, lng: -117.0842, zoom: 13 },
  "Oceanside": { lat: 33.1959, lng: -117.3795, zoom: 13 },
  "Escondido": { lat: 33.1192, lng: -117.0864, zoom: 13 },
  "El Cajon": { lat: 32.7948, lng: -116.9625, zoom: 13 },
  "Santee": { lat: 32.8384, lng: -116.9739, zoom: 13 },
  "La Mesa": { lat: 32.7678, lng: -117.0228, zoom: 13 },
  "National City": { lat: 32.6781, lng: -117.0992, zoom: 13 },
  "Poway": { lat: 32.9628, lng: -117.0359, zoom: 13 },
  "Vista": { lat: 33.2000, lng: -117.2425, zoom: 13 },
  "San Marcos": { lat: 33.1434, lng: -117.1661, zoom: 13 },
  "Carlsbad": { lat: 33.1581, lng: -117.3506, zoom: 13 },
  "Encinitas": { lat: 33.0369, lng: -117.2920, zoom: 13 },
  "Solana Beach": { lat: 32.9912, lng: -117.2712, zoom: 13 },
  "Del Mar": { lat: 32.9595, lng: -117.2653, zoom: 13 },
  "La Jolla": { lat: 32.8328, lng: -117.2713, zoom: 13 },
  "Pacific Beach": { lat: 32.7965, lng: -117.2358, zoom: 13 },
  "Mission Valley": { lat: 32.7674, lng: -117.1485, zoom: 13 },
  "Hillcrest": { lat: 32.7467, lng: -117.1600, zoom: 14 },
  "North Park": { lat: 32.7478, lng: -117.1298, zoom: 14 },
  "Kearny Mesa": { lat: 32.8200, lng: -117.1500, zoom: 13 },
  "Mira Mesa": { lat: 32.9120, lng: -117.1484, zoom: 13 },
  "Rancho Bernardo": { lat: 33.0120, lng: -117.0700, zoom: 13 },
  "Rancho Santa Fe": { lat: 33.0234, lng: -117.1987, zoom: 13 },
  "Spring Valley": { lat: 32.7448, lng: -116.9989, zoom: 13 },
  "Lemon Grove": { lat: 32.7248, lng: -117.0314, zoom: 13 },
  "Alpine": { lat: 32.8351, lng: -116.7664, zoom: 13 },
  "Lakeside": { lat: 32.8576, lng: -116.9225, zoom: 13 },
};

const geocodeCache = {};

function buildParams({ specialtySearch, nameSearch, query, neighborhood, offset }) {
  const params = new URLSearchParams();
  const searchQuery = specialtySearch || (typeof query === "string" ? query.replace("[object Object]", "") : "");
  const isNameSearch = searchQuery && !specialtySearch && (
    /^dr\.?\s/i.test(searchQuery) ||
    (searchQuery.includes(" ") && searchQuery.split(" ").length >= 2)
  );
  if (nameSearch) params.set("name", nameSearch);
  else if (isNameSearch) params.set("name", searchQuery);
  else if (searchQuery) params.set("specialty", searchQuery);
  if (neighborhood && neighborhood !== "All of San Diego") params.set("city", neighborhood);
  params.set("limit", String(PAGE_SIZE));
  params.set("offset", String(offset));
  return params;
}

function applyClientFilters(results, { gender, accepting, telehealth, selectedLangs }) {
  let filtered = results;
  if (gender) filtered = filtered.filter(d => d.gender === gender);
  if (accepting) filtered = filtered.filter(d => d.accepting === true);
  if (telehealth) filtered = filtered.filter(d => d.telehealth === true);
  if (selectedLangs.length > 0) filtered = filtered.filter(d => selectedLangs.some(l => d.languages?.includes(l)));
  return filtered;
}

function SpecialtySearch({ value, onChange, onSelect, supabaseUrl, supabaseKey }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  async function fetchSuggestions(term) {
    if (!term || term.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_specialties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        body: JSON.stringify({ search_term: term }),
      });
      const data = await res.json();
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (e) { setSuggestions([]); } finally { setLoading(false); }
  }

  function handleChange(e) {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  }

  function handleSelect(specialty) {
    onChange(specialty); setSuggestions([]); setShowSuggestions(false); onSelect(specialty);
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input value={value} onChange={handleChange}
          onKeyDown={e => { if (e.key === 'Escape') setShowSuggestions(false); if (e.key === 'Enter') { setShowSuggestions(false); onSelect(value); } }}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Specialty or condition..."
          style={{ width: '100%', padding: '0.55rem 2rem 0.55rem 0.8rem', border: `1.5px solid ${C.sky}`, borderRadius: 8, fontFamily: 'inherit', fontSize: 13, outline: 'none', background: 'white', boxSizing: 'border-box' }}
        />
        {loading && <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, border: `2px solid rgba(26,107,138,0.2)`, borderTopColor: C.ocean, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500, background: 'white', border: `1.5px solid ${C.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(13,61,82,0.12)', marginTop: 4, maxHeight: 280, overflowY: 'auto' }}>
          {suggestions.map((s, i) => (
            <div key={i} onMouseDown={() => handleSelect(s.specialty)}
              style={{ padding: '0.6rem 0.9rem', cursor: 'pointer', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < suggestions.length - 1 ? `1px solid ${C.border}` : 'none' }}
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

function Spinner({ small }) {
  return (
    <div style={{ textAlign: "center", padding: small ? "1rem" : "3rem" }}>
      <div style={{ width: small ? 24 : 38, height: small ? 24 : 38, border: `3px solid rgba(26,107,138,0.15)`, borderTopColor: C.ocean, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 0.5rem" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {!small && <p style={{ color: C.muted, fontSize: 14 }}>Searching San Diego providers…</p>}
    </div>
  );
}

function DoctorCard({ doc, isMobile, highlighted, onHover, cardRef }) {
  const navigate = useNavigate();
  return (
    <div ref={cardRef} onClick={() => navigate(`/doctor/${makeDocSlug(doc)}`, { state: { doc } })}
      onMouseEnter={() => onHover && onHover(doc.npi)}
      onMouseLeave={() => onHover && onHover(null)}
      style={{
        background: highlighted ? "#f0f8fb" : "white",
        border: `${highlighted ? "2px" : "1.5px"} solid ${highlighted ? C.ocean : C.border}`,
        borderRadius: 14,
        padding: isMobile ? "1rem" : "1.1rem 1.3rem",
        marginBottom: "0.75rem",
        cursor: "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s, background 0.15s, transform 0.15s",
        boxShadow: highlighted ? `0 6px 24px rgba(26,107,138,0.18)` : "none",
        transform: highlighted ? "translateX(4px)" : "none",
      }}
    >
      <div style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: highlighted ? `linear-gradient(135deg, ${C.ocean}, ${C.deep})` : `linear-gradient(135deg, ${C.sky}, ${C.ocean})`, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s", overflow: "hidden" }}>
          <svg viewBox="0 0 46 46" width="46" height="46" xmlns="http://www.w3.org/2000/svg">
            <circle cx="23" cy="17" r="8" fill="rgba(255,255,255,0.9)" />
            <ellipse cx="23" cy="38" rx="13" ry="10" fill="rgba(255,255,255,0.9)" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: highlighted ? C.ocean : C.deep, fontSize: isMobile ? 14 : 15, lineHeight: 1.3, transition: "color 0.15s" }}>{doc.name}</div>
          <div style={{ color: C.ocean, fontSize: 12, fontWeight: 500, marginTop: 2 }}>{doc.specialty}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>📍 {doc.city}, CA{doc.phone && doc.phone !== "Call for number" && <> &nbsp;·&nbsp; 📞 {doc.phone}</>}</div>
        </div>
        {isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
            {doc.phone && doc.phone !== "Call for number" && <button onClick={e => { e.stopPropagation(); window.location = `tel:${doc.phone}`; }} style={{ background: C.ocean, color: "white", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📞 Call</button>}
            <button onClick={e => { e.stopPropagation(); navigate(`/doctor/${makeDocSlug(doc)}`, { state: { doc } }); }} style={{ background: "transparent", color: C.ocean, border: `1.5px solid ${C.ocean}`, padding: "5px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>Profile</button>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "0.7rem" }}>
        {doc.accepting === true && <Pill icon="✅" text="Accepting" green />}
        {doc.accepting === false && <Pill icon="❌" text="Not Accepting" red />}
        {doc.telehealth === true && <Pill icon="💻" text="Telehealth" />}
        {doc.verified && <Pill icon="🏅" text="Verified" blue />}
        {doc.gender === "F" && <Pill icon="👩‍⚕️" text="Female" />}
        {doc.gender === "M" && <Pill icon="👨‍⚕️" text="Male" />}
        {doc.reportCount > 0 && <Pill icon="💬" text={`${doc.reportCount} report${doc.reportCount !== 1 ? "s" : ""}`} />}
        {doc.avgRating && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 600, background: "#fffbf0", color: "#9a6c00", border: "1px solid #f5d78e", whiteSpace: "nowrap" }}>
            <Stars rating={doc.avgRating} size={11} />&nbsp;{doc.avgRating}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.6rem" }}>
        <div style={{ fontSize: 10, color: "#9ab5bf" }}>📋 {doc.address}{doc.address && ", "}{doc.city} · NPI {doc.npi}</div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 6 }}>
            {doc.phone && doc.phone !== "Call for number" && <button onClick={e => { e.stopPropagation(); window.location = `tel:${doc.phone}`; }} style={{ background: C.ocean, color: "white", border: "none", padding: "5px 13px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>📞 Call</button>}
            <button onClick={e => { e.stopPropagation(); navigate(`/doctor/${makeDocSlug(doc)}`, { state: { doc } }); }} style={{ background: "transparent", color: C.ocean, border: `1.5px solid ${C.ocean}`, padding: "4px 11px", borderRadius: 7, fontSize: 11, cursor: "pointer" }}>Profile</button>
          </div>
        )}
      </div>
    </div>
  );
}

const SearchMap = memo(function SearchMap({ doctors, onPinClick, highlightFnRef, mapViewFnRef }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const prevNpiRef = useRef(null);

  highlightFnRef.current = (npi) => {
    if (!window.google?.maps) return;
    if (prevNpiRef.current) {
      const prev = markersRef.current.find(m => m._npi === prevNpiRef.current);
      if (prev) {
        prev.setIcon({ path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: C.ocean, fillOpacity: 1, strokeColor: "white", strokeWeight: 2.5 });
        prev.setZIndex(undefined);
      }
    }
    if (npi) {
      const next = markersRef.current.find(m => m._npi === npi);
      if (next) {
        next.setIcon({ path: window.google.maps.SymbolPath.CIRCLE, scale: 13, fillColor: "#e8622a", fillOpacity: 1, strokeColor: "white", strokeWeight: 3 });
        next.setZIndex(999);
      }
    }
    prevNpiRef.current = npi;
  };

  mapViewFnRef.current = ({ lat, lng, zoom }) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.panTo({ lat, lng });
    mapInstanceRef.current.setZoom(zoom);
  };

  useEffect(() => {
    function initMap() {
      if (!mapRef.current || !window.google?.maps) return;
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 10, center: { lat: 32.8, lng: -117.1 },
        mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
      });
      mapInstanceRef.current = map;
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }
    if (window.google?.maps) {
      initMap();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.maps) { clearInterval(interval); initMap(); }
        else if (attempts > 20) clearInterval(interval);
      }, 250);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps || !doctors.length) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    prevNpiRef.current = null;
    const geocoder = new window.google.maps.Geocoder();

    function placeMarker(doc, index, position) {
      const marker = new window.google.maps.Marker({
        map: mapInstanceRef.current, position, title: doc.name,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: C.ocean, fillOpacity: 1, strokeColor: "white", strokeWeight: 2.5 },
      });
      marker._npi = doc.npi;
      marker.addListener("click", () => {
        if (infoWindowRef.current && mapInstanceRef.current) {
          infoWindowRef.current.setContent(`
            <div style="font-family:system-ui,sans-serif;padding:4px;min-width:160px;">
              <div style="font-weight:700;color:#0d3d52;font-size:13px;margin-bottom:2px;">${doc.name}</div>
              <div style="color:#1a6b8a;font-size:12px;margin-bottom:4px;">${doc.specialty}</div>
              <div style="color:#6b8f99;font-size:11px;">${doc.address}, ${doc.city}</div>
              ${doc.accepting === true ? '<div style="color:#1a7a4a;font-size:11px;margin-top:4px;">✅ Accepting patients</div>' : ''}
            </div>
          `);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
        if (onPinClick) onPinClick(doc.npi);
      });
      markersRef.current.push(marker);
    }

    doctors.forEach((doc, index) => {
      if (!doc.address || !doc.city) return;
      const cacheKey = `${doc.address},${doc.city}`;
      if (geocodeCache[cacheKey]) { placeMarker(doc, index, geocodeCache[cacheKey]); return; }
      geocoder.geocode({ address: `${doc.address}, ${doc.city}, CA` }, (results, status) => {
        if (status !== "OK" || !results[0] || !mapInstanceRef.current) return;
        const position = results[0].geometry.location;
        geocodeCache[cacheKey] = position;
        placeMarker(doc, index, position);
      });
    });
  }, [doctors]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: 12 }} />;
});

function FilterPanel({ specialtySearch, setSpecialtySearch, nameSearch, setNameSearch, neighborhood, setNeighborhood, gender, setGender, accepting, setAccepting, telehealth, setTelehealth, selectedLangs, setSelectedLangs, onClear, onApply, onSearch, onNeighborhoodChange, isMobile }) {
  const sel = { width: "100%", padding: "0.5rem 0.7rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 13, background: "#f8fbfc", outline: "none", appearance: "none" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Doctor Name</div>
        <input value={nameSearch} onChange={e => setNameSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && onSearch()} placeholder="e.g. Smith, Dr. Johnson"
          style={{ width: "100%", padding: "0.55rem 0.8rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: 13, outline: "none", background: "white", boxSizing: "border-box" }} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Specialty</div>
        <SpecialtySearch value={specialtySearch} onChange={setSpecialtySearch} onSelect={(s) => { setSpecialtySearch(s); onSearch(); }} supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_ANON_KEY} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Neighborhood</div>
        <select value={neighborhood} onChange={e => { setNeighborhood(e.target.value); if (onNeighborhoodChange) onNeighborhoodChange(e.target.value); }} style={sel}>
          {NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}
        </select>
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

function smartSort(results) {
  return [...results].sort((a, b) => {
    if (a.verified && !b.verified) return -1;
    if (!a.verified && b.verified) return 1;
    if (a.accepting === true && b.accepting !== true) return -1;
    if (a.accepting !== true && b.accepting === true) return 1;
    return a.name.localeCompare(b.name);
  });
}

export default function Search() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get("q") || "";
  const urlQuery = rawQuery.includes("object") ? "" : rawQuery;

  const [query, setQuery] = useState(urlQuery);
  const [specialtySearch, setSpecialtySearch] = useState(urlQuery);
  const [nameSearch, setNameSearch] = useState("");
  const [neighborhood, setNeighborhood] = useState(searchParams.get("city") || "All of San Diego");
  const [gender, setGender] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [telehealth, setTelehealth] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [sort, setSort] = useState("smart");

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [mapDoctors, setMapDoctors] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [highlightedNpi, setHighlightedNpi] = useState(null);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const cardRefs = useRef({});
  const highlightFnRef = useRef(null);
  const mapViewFnRef = useRef(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true); setError(""); setResults([]); setTotal(0); setOffset(0); setHasMore(false);
    const params = buildParams({ specialtySearch, nameSearch, query, neighborhood, offset: 0 });
    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      const filtered = applyClientFilters(data.results || [], { gender, accepting, telehealth, selectedLangs });
      setResults(filtered);
      setMapDoctors(filtered.slice(0, PAGE_SIZE));
      setTotal(data.total || filtered.length);
      setOffset(PAGE_SIZE);
      setHasMore(filtered.length > PAGE_SIZE || data.hasMore || false);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, neighborhood, specialtySearch, nameSearch, gender, accepting, telehealth, selectedLangs]);

  async function loadMore() {
    setLoadingMore(true);
    const params = buildParams({ specialtySearch, nameSearch, query, neighborhood, offset });
    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      const filtered = applyClientFilters(data.results || [], { gender, accepting, telehealth, selectedLangs });
      setResults(prev => [...prev, ...filtered]);
      setMapDoctors(filtered);
      setOffset(prev => prev + PAGE_SIZE);
      setHasMore(data.hasMore || false);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => { fetchDoctors(); }, []);

  function handleHighlight(npi) {
    setHighlightedNpi(npi);
    if (highlightFnRef.current) highlightFnRef.current(npi);
  }

  function handlePinClick(npi) {
    handleHighlight(npi);
    setTimeout(() => {
      const el = cardRefs.current[npi];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  function handleNeighborhoodChange(name) {
    const coords = NEIGHBORHOOD_COORDS[name] || NEIGHBORHOOD_COORDS["All of San Diego"];
    setLoading(true); setError(""); setResults([]); setTotal(0); setOffset(0); setHasMore(false);
    const params = buildParams({ specialtySearch, nameSearch, query, neighborhood: name, offset: 0 });
    fetch(`/api/search?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        const filtered = applyClientFilters(data.results || [], { gender, accepting, telehealth, selectedLangs });
        setResults(filtered);
        setMapDoctors(filtered.slice(0, PAGE_SIZE));
        setTotal(data.total || 0);
        setOffset(PAGE_SIZE);
        setHasMore(data.hasMore || false);
        setTimeout(() => { if (mapViewFnRef.current) mapViewFnRef.current(coords); }, 100);
      })
      .catch(e => setError(e.message || "Something went wrong."))
      .finally(() => setLoading(false));
  }

  function clearAll() {
    navigate("/search", { replace: true });
    setQuery(""); setSpecialtySearch(""); setNameSearch(""); setNeighborhood("All of San Diego");
    setGender(""); setAccepting(false); setTelehealth(false); setSelectedLangs([]);
    setResults([]); setTotal(0); setOffset(0); setHasMore(false);
    if (mapViewFnRef.current) mapViewFnRef.current(NEIGHBORHOOD_COORDS["All of San Diego"]);
    setLoading(true); setError("");
    fetch(`/api/search?limit=${PAGE_SIZE}&offset=0`)
      .then(r => r.json())
      .then(data => {
        setResults(data.results || []);
        setMapDoctors((data.results || []).slice(0, PAGE_SIZE));
        setTotal(data.total || 0);
        setOffset(PAGE_SIZE);
        setHasMore(data.hasMore || false);
      })
      .catch(e => setError(e.message || "Something went wrong."))
      .finally(() => setLoading(false));
  }

  // Find closest SD neighborhood to given coordinates
  function findNearestNeighborhood(lat, lng) {
    let closest = "San Diego";
    let minDist = Infinity;
    for (const [name, coords] of Object.entries(NEIGHBORHOOD_COORDS)) {
      if (name === "All of San Diego") continue;
      const d = Math.sqrt(Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2));
      if (d < minDist) { minDist = d; closest = name; }
    }
    return closest;
  }

  // Neighborhoods that are sub-areas of San Diego city — NPI stores them as "San Diego"
  const SD_CITY_NEIGHBORHOODS = new Set([
    "Pacific Beach", "Mission Valley", "Hillcrest", "North Park", "Kearny Mesa", "Mira Mesa"
  ]);

  function handleNearMe() {
    if (!navigator.geolocation) return;
    setNearMeLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const nearest = findNearestNeighborhood(lat, lng);
        // If it's a San Diego sub-neighborhood, use "San Diego" as the city for NPI lookup
        const cityForSearch = SD_CITY_NEIGHBORHOODS.has(nearest) ? "San Diego" : nearest;
        setNeighborhood(nearest);
        setLoading(true); setError(""); setResults([]); setTotal(0); setOffset(0); setHasMore(false);
        const params = buildParams({ specialtySearch, nameSearch, query, neighborhood: cityForSearch, offset: 0 });
        fetch(`/api/search?${params.toString()}`)
          .then(r => r.json())
          .then(data => {
            const filtered = applyClientFilters(data.results || [], { gender, accepting, telehealth, selectedLangs });
            setResults(filtered);
            setMapDoctors(filtered.slice(0, PAGE_SIZE));
            setTotal(data.total || 0);
            setOffset(PAGE_SIZE);
            setHasMore(data.hasMore || false);
            // Zoom map to user's exact location
            setTimeout(() => { if (mapViewFnRef.current) mapViewFnRef.current({ lat, lng, zoom: 13 }); }, 100);
          })
          .catch(e => setError(e.message || "Something went wrong."))
          .finally(() => { setLoading(false); setNearMeLoading(false); });
      },
      () => {
        setNearMeLoading(false);
        alert("Could not get your location. Please enable location access in your browser.");
      },
      { timeout: 8000 }
    );
  }

  const sortedResults = useMemo(() => {
    if (sort === "smart") return smartSort(results);
    if (sort === "name") return [...results].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "city") return [...results].sort((a, b) => a.city.localeCompare(b.city));
    return results;
  }, [results, sort]);

  const stableMapDoctors = useMemo(() => mapDoctors, [mapDoctors]);
  const activeFilterCount = [specialtySearch !== "", nameSearch !== "", gender !== "", accepting, telehealth, neighborhood !== "All of San Diego", selectedLangs.length > 0].filter(Boolean).length;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <nav style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(253,250,245,0.97)", backdropFilter: "blur(12px)", borderBottom: `1px solid rgba(26,107,138,0.12)`, padding: isMobile ? "0.75rem 1rem" : "0.8rem 1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <div onClick={() => navigate("/")} style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? 17 : 19, color: C.ocean, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Your Doctor <span style={{ color: C.dusk }}>SD</span></div>
          {!isMobile && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => setShowMap(m => !m)} style={{ display: "flex", alignItems: "center", gap: 6, background: showMap ? C.ocean : "white", color: showMap ? "white" : C.ocean, border: `1.5px solid ${C.ocean}`, padding: "0.4rem 0.9rem", borderRadius: 8, fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                🗺️ {showMap ? "Hide Map" : "Show Map"}
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: isMobile ? "0.6rem" : 0 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchDoctors()} placeholder="Search by specialty or doctor name…" style={{ flex: 1, padding: "0.55rem 0.9rem", border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", fontSize: isMobile ? 14 : 13, outline: "none", background: "white", maxWidth: isMobile ? "none" : 340 }} />
          <button onClick={fetchDoctors} style={{ background: C.ocean, color: "white", border: "none", padding: "0.55rem 0.9rem", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🔍</button>
          <button
            onClick={handleNearMe}
            disabled={nearMeLoading}
            title="Find doctors near me"
            style={{ background: nearMeLoading ? "#e8f4f7" : "white", color: C.ocean, border: `1.5px solid ${C.border}`, padding: "0.55rem 0.75rem", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: nearMeLoading ? "default" : "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
          >
            {nearMeLoading ? "…" : "📍"}{!isMobile && <span style={{ fontSize: 12 }}>Near Me</span>}
          </button>
          {isMobile && <button onClick={() => setShowFilters(true)} style={{ background: activeFilterCount > 0 ? C.ocean : "white", color: activeFilterCount > 0 ? "white" : C.ocean, border: `1.5px solid ${activeFilterCount > 0 ? C.ocean : C.border}`, padding: "0.55rem 0.9rem", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            ⚙️{activeFilterCount > 0 && <span style={{ background: C.dusk, color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilterCount}</span>}
          </button>}
        </div>
      </nav>

      {isMobile && showFilters && <>
        <div onClick={() => setShowFilters(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300 }} />
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 400, background: "white", borderRadius: "20px 20px 0 0", padding: "1.5rem 1.2rem 2rem", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 -8px 30px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.deep }}>Filter Doctors</div>
            <button onClick={() => setShowFilters(false)} style={{ background: "#f0f4f5", border: "none", borderRadius: "50%", width: 32, height: 32, fontSize: 16, cursor: "pointer" }}>✕</button>
          </div>
          <FilterPanel specialtySearch={specialtySearch} setSpecialtySearch={setSpecialtySearch} nameSearch={nameSearch} setNameSearch={setNameSearch} neighborhood={neighborhood} setNeighborhood={setNeighborhood} gender={gender} setGender={setGender} accepting={accepting} setAccepting={setAccepting} telehealth={telehealth} setTelehealth={setTelehealth} selectedLangs={selectedLangs} setSelectedLangs={setSelectedLangs} onClear={() => { clearAll(); setShowFilters(false); }} onApply={() => setShowFilters(false)} onSearch={fetchDoctors} onNeighborhoodChange={handleNeighborhoodChange} isMobile />
        </div>
      </>}

      <div style={{ maxWidth: showMap && !isMobile ? 1400 : 1050, margin: "0 auto", padding: isMobile ? "1rem" : "1.2rem 1.2rem 3rem", display: "flex", gap: "1.2rem", alignItems: "flex-start" }}>
        {!isMobile && (
          <aside style={{ width: 200, flexShrink: 0 }}>
            <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "1.1rem", position: "sticky", top: 72 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 14 }}>Filters</div>
              <FilterPanel specialtySearch={specialtySearch} setSpecialtySearch={setSpecialtySearch} nameSearch={nameSearch} setNameSearch={setNameSearch} neighborhood={neighborhood} setNeighborhood={setNeighborhood} gender={gender} setGender={setGender} accepting={accepting} setAccepting={setAccepting} telehealth={telehealth} setTelehealth={setTelehealth} selectedLangs={selectedLangs} setSelectedLangs={setSelectedLangs} onClear={clearAll} onSearch={fetchDoctors} onNeighborhoodChange={handleNeighborhoodChange} isMobile={false} />
              <button onClick={fetchDoctors} style={{ width: "100%", marginTop: 10, background: C.ocean, color: "white", border: "none", padding: "0.6rem", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Apply Filters</button>
            </div>
          </aside>
        )}

        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 13, color: C.muted }}>
              {loading ? "Searching NPI registry…" : error ? "" : results.length > 0
                ? <span>Showing <strong style={{ color: C.deep }}>{results.length}</strong>{total > results.length ? <> of <strong style={{ color: C.deep }}>{total.toLocaleString()}</strong></> : ""} licensed San Diego providers</span>
                : "No providers found — try a different specialty or name"}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: "0.4rem 0.7rem", border: `1.5px solid ${C.border}`, borderRadius: 7, fontFamily: "inherit", fontSize: 12, background: "white", outline: "none", appearance: "none" }}>
              <option value="smart">Sort: Best Match</option>
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
              <div style={{ fontSize: 13, color: C.muted }}>Try a different specialty, name, or neighborhood.</div>
              <button onClick={clearAll} style={{ marginTop: 14, background: C.ocean, color: "white", border: "none", padding: "0.6rem 1.4rem", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>Clear Filters</button>
            </div>
          )}

          {!loading && !error && sortedResults.map((doc, i) => (
            <DoctorCard key={doc.npi || i} doc={doc} isMobile={isMobile} highlighted={highlightedNpi === doc.npi} onHover={handleHighlight} cardRef={el => cardRefs.current[doc.npi] = el} />
          ))}

          {!loading && !error && hasMore && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              {loadingMore ? <Spinner small /> : (
                <button onClick={loadMore} style={{ background: "white", color: C.ocean, border: `1.5px solid ${C.ocean}`, padding: "0.7rem 2rem", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Load More Providers
                </button>
              )}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div style={{ fontSize: 11, color: "#9ab5bf", textAlign: "center", marginTop: 16 }}>Data sourced live from the National Provider Index (NPPES). NPI does not confirm licensure.</div>
          )}
        </main>

        {!isMobile && showMap && (
          <div style={{ width: 420, flexShrink: 0, position: "sticky", top: 72, height: "calc(100vh - 90px)" }}>
            <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, overflow: "hidden", height: "100%" }}>
              <div style={{ padding: "0.7rem 1rem", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.deep }}>📍 {stableMapDoctors.length} providers on map</span>
                {hasMore && <span style={{ fontSize: 11, color: C.muted }}>Showing latest batch</span>}
              </div>
              <div style={{ height: "calc(100% - 44px)" }}>
                {!loading && stableMapDoctors.length > 0 ? (
                  <SearchMap doctors={stableMapDoctors} onPinClick={handlePinClick} highlightFnRef={highlightFnRef} mapViewFnRef={mapViewFnRef} />
                ) : (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.muted, gap: 8 }}>
                    <span style={{ fontSize: 32 }}>🗺️</span>
                    <span style={{ fontSize: 13 }}>{loading ? "Loading results…" : "Search to see providers on map"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
