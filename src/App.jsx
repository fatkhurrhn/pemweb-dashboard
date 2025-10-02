import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AutoToTop from "./components/AutoToTop";
import Checkin from "./pages/Checkin";
import Home from "./pages/Home";
import RekapPresensi from "./pages/RekapPresensi";
import DashboardTugas from "./pages/DashboardTugas";
import InputTugas from "./pages/SubmitTugas";
import DashboardPresensi from "./pages/DashboardPresensi";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import RekapTugas from "./pages/RekapTugas";
import Tutorial from "./pages/Tutorial";
import Tugas2 from "./pages/example/Tugas2";

// komponen proteksi route
function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
    <AutoToTop/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/example/t2" element={<Tugas2 />} />
        <Route path="/intruksi" element={<Tutorial />} />
        <Route path="/tugas" element={<InputTugas />} />
        <Route path="/rekap-presensi" element={<RekapPresensi />} />
        <Route path="/rekap-tugas" element={<RekapTugas />} />
        <Route path="/login" element={<Login />} />

        {/* halaman dashboard (dilindungi) */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
        <Route path="/dashboard-tugas"element={<PrivateRoute><DashboardTugas /></PrivateRoute>}/>
        <Route path="/dashboard-presensi" element={<PrivateRoute><DashboardPresensi /></PrivateRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
