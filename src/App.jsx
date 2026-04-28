import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Claim from "./pages/Claim";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/doctor/:id" element={<Profile />} />
        <Route path="/claim" element={<Claim />} />
      </Routes>
    </BrowserRouter>
  );
}
