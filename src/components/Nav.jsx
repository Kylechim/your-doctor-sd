import { useNavigate, useLocation } from "react-router-dom";
import { COLORS as C } from "../data/doctors";

export default function Nav({ isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(253,250,245,0.97)", backdropFilter: "blur(12px)",
      borderBottom: `1px solid rgba(26,107,138,0.12)`,
      padding: isMobile ? "0.75rem 1rem" : "0.8rem 1.5rem",
      display: "flex", alignItems: "center", gap: "1rem",
    }}>
      <div
        onClick={() => navigate("/")}
        style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 17 : 19, color: C.ocean, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
      >
        Your Doctor <span style={{ color: C.dusk }}>SD</span>
      </div>

      {!isMobile && (
        <div style={{ display: "flex", gap: "1.5rem", marginLeft: "auto", alignItems: "center" }}>
          <button onClick={() => navigate("/search")} style={{
            background: "transparent", border: "none",
            color: location.pathname === "/search" ? C.ocean : C.muted,
            fontFamily: "inherit", fontSize: 14, fontWeight: location.pathname === "/search" ? 600 : 400,
            cursor: "pointer", padding: 0,
          }}>Search</button>
          <button onClick={() => navigate("/about")} style={{
            background: "transparent", border: "none",
            color: location.pathname === "/about" ? C.ocean : C.muted,
            fontFamily: "inherit", fontSize: 14, fontWeight: location.pathname === "/about" ? 600 : 400,
            cursor: "pointer", padding: 0,
          }}>About</button>
          <button onClick={() => navigate("/pricing")} style={{
            background: "transparent", border: "none",
            color: location.pathname === "/pricing" ? C.ocean : C.muted,
            fontFamily: "inherit", fontSize: 14, fontWeight: location.pathname === "/pricing" ? 600 : 400,
            cursor: "pointer", padding: 0,
          }}>Pricing</button>
          <button onClick={() => navigate("/claim")} style={{
            background: C.ocean, color: "white", border: "none",
            padding: "0.45rem 1.1rem", borderRadius: 20,
            fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>For Providers</button>
        </div>
      )}

      {location.pathname !== "/" && isMobile && (
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
          ← Back
        </button>
      )}
    </nav>
  );
}
