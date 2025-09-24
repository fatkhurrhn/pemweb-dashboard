import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Checkin from "./pages/Checkin";
import Home from "./pages/Home";
import RekapPresensi from "./pages/RekapPresensi";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/rekap-presensi" element={<RekapPresensi />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
