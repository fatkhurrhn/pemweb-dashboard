import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Checkin from "./pages/Checkin";
import Home from "./pages/Home";
import RekapPresensi from "./pages/RekapPresensi";
import DashboardTugas from "./pages/DashboardTugas";
import InputTugas from "./pages/InputTugas";
import DashboardPresensi from "./pages/DashboardPresensi";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

// komponen proteksi route
function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/tugas" element={<InputTugas />} />
        <Route path="/rekap-presensi" element={<RekapPresensi />} />
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
