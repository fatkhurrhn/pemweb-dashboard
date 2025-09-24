// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import { db } from "../firebase";

// ----- helpers presensi -----
function computeAttendanceStats(attendances = {}) {
    const counts = { total: 0, hadir: 0, izin: 0, sakit: 0, alpha: 0, "belum isi": 0 };
    for (const v of Object.values(attendances)) {
        const s = (v?.status || "belum isi");
        counts.total += 1;
        if (counts[s] !== undefined) counts[s] += 1;
    }
    return counts;
}

// ----- helpers tugas -----
function computeSubmissionStats(subs = {}) {
    let sudah = 0, belum = 0;
    for (const v of Object.values(subs)) {
        if (v?.status === "sudah") sudah++; else belum++;
    }
    return { total: sudah + belum, sudah, belum };
}

export default function Dashboard() {
    const navigate = useNavigate();

    // data presensi
    const [sessions, setSessions] = useState([]); // ordered desc by startAt
    // data tugas
    const [tasks, setTasks] = useState([]); // ordered desc by date

    // listen presensi (terbaru dulu)
    useEffect(() => {
        const qy = query(collection(db, "presensi"), orderBy("startAt", "desc"));
        const unsub = onSnapshot(qy, (snap) => {
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setSessions(arr);
        });
        return unsub;
    }, []);

    // listen tugas (terbaru dulu)
    useEffect(() => {
        const qy = query(collection(db, "tugas"), orderBy("date", "desc"));
        const unsub = onSnapshot(qy, (snap) => {
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setTasks(arr);
        });
        return unsub;
    }, []);

    // ----- ringkasan presensi -----
    const presensiCounts = useMemo(() => {
        const total = sessions.length;
        const draft = sessions.filter((s) => s.status === "draft").length;
        const open = sessions.filter((s) => s.status === "open").length;
        const closed = sessions.filter((s) => s.status === "closed").length;
        return { total, draft, open, closed };
    }, [sessions]);

    const latestSession = sessions[0] || null;
    const latestSessionStats = useMemo(() => {
        if (!latestSession) return null;
        // pakai field stats jika ada; fallback hitung dari attendances
        if (latestSession.stats) {
            const s = latestSession.stats;
            return {
                total: s.total ?? 0,
                hadir: s.hadir ?? 0,
                izin: s.izin ?? 0,
                sakit: s.sakit ?? 0,
                alpha: s.alpha ?? 0,
                "belum isi": s["belum isi"] ?? 0,
            };
        }
        return computeAttendanceStats(latestSession.attendances);
    }, [latestSession]);

    // ----- ringkasan tugas -----
    const tugasCounts = useMemo(() => {
        const total = tasks.length;
        const draft = tasks.filter((t) => t.status === "draft").length;
        const open = tasks.filter((t) => t.status === "open").length;
        const closed = tasks.filter((t) => t.status === "closed").length;
        return { total, draft, open, closed };
    }, [tasks]);

    const latestTask = tasks[0] || null;
    const latestTaskStats = useMemo(() => {
        if (!latestTask) return null;
        return computeSubmissionStats(latestTask.submissions);
    }, [latestTask]);

    // daftar kecil terbaru
    const recentSessions = useMemo(() => sessions.slice(0, 5), [sessions]);
    const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks]);

    function handleLogout() {
        localStorage.clear();
        navigate("/", { replace: true });
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-5">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-sm text-gray-600">Ringkasan Presensi & Tugas</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/rekap-presensi"
                            className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50"
                        >
                            Lihat Rekap Presensi
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2 rounded-lg bg-black text-white hover:opacity-90"
                            title="Logout"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Link to="/dashboard-presensi" className="group rounded-xl border bg-white p-4 hover:shadow-sm">
                        <div className="text-sm text-gray-500">Kelola</div>
                        <div className="text-lg font-semibold">Dashboard Presensi</div>
                        <div className="mt-2 text-xs text-gray-400 group-hover:text-gray-600">Buka & atur sesi</div>
                    </Link>
                    <Link to="/checkin" className="group rounded-xl border bg-white p-4 hover:shadow-sm">
                        <div className="text-sm text-gray-500">Form</div>
                        <div className="text-lg font-semibold">Check-in Presensi</div>
                        <div className="mt-2 text-xs text-gray-400 group-hover:text-gray-600">Halaman untuk mahasiswa</div>
                    </Link>
                    <Link to="/dashboard-tugas" className="group rounded-xl border bg-white p-4 hover:shadow-sm">
                        <div className="text-sm text-gray-500">Kelola</div>
                        <div className="text-lg font-semibold">Dashboard Tugas</div>
                        <div className="mt-2 text-xs text-gray-400 group-hover:text-gray-600">Buka & pantau tugas</div>
                    </Link>
                    <Link to="/tugas" className="group rounded-xl border bg-white p-4 hover:shadow-sm">
                        <div className="text-sm text-gray-500">Form</div>
                        <div className="text-lg font-semibold">Submit Tugas</div>
                        <div className="mt-2 text-xs text-gray-400 group-hover:text-gray-600">Halaman untuk mahasiswa</div>
                    </Link>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Presensi Overview */}
                    <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-lg">Presensi</h2>
                                <p className="text-xs text-gray-500">Status sesi & statistik terbaru</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-900 text-white">
                                {presensiCounts.total} sesi
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <StatPill label="Draft" value={presensiCounts.draft} className="bg-gray-200 text-gray-800" />
                            <StatPill label="Open" value={presensiCounts.open} className="bg-green-600 text-white" />
                            <StatPill label="Closed" value={presensiCounts.closed} className="bg-red-600 text-white" />
                        </div>

                        <div className="rounded-xl border p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <div className="font-semibold">Sesi Terbaru</div>
                                    <div className="text-gray-600">{latestSession?.title ?? "—"}</div>
                                    {latestSession && (
                                        <div className="text-xs text-gray-500">
                                            {latestSession.startAt?.toDate?.().toLocaleString()} —{" "}
                                            {latestSession.endAt?.toDate?.().toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[11px] px-2 py-1 rounded-full bg-gray-800 text-white">
                                    {latestSession?.status ?? "—"}
                                </span>
                            </div>

                            <div className="grid grid-cols-5 gap-2 mt-3 text-center">
                                <MiniBadge label="Hadir" value={latestSessionStats?.hadir ?? 0} className="bg-green-600 text-white" />
                                <MiniBadge label="Izin" value={latestSessionStats?.izin ?? 0} className="bg-amber-500 text-white" />
                                <MiniBadge label="Sakit" value={latestSessionStats?.sakit ?? 0} className="bg-blue-600 text-white" />
                                <MiniBadge label="Alpha" value={latestSessionStats?.alpha ?? 0} className="bg-red-600 text-white" />
                                <MiniBadge label="Belum" value={latestSessionStats?.["belum isi"] ?? 0} className="bg-gray-200 text-gray-800" />
                            </div>
                        </div>

                        {/* Recent sessions */}
                        <div>
                            <div className="text-sm font-semibold mb-2">Sesi Terakhir</div>
                            <div className="rounded-xl border overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left px-3 py-2 border">Judul</th>
                                            <th className="text-left px-3 py-2 border">Status</th>
                                            <th className="text-left px-3 py-2 border">Mulai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSessions.map((s) => (
                                            <tr key={s.id} className="odd:bg-white even:bg-gray-50">
                                                <td className="px-3 py-2 border">{s.title}</td>
                                                <td className="px-3 py-2 border">{s.status}</td>
                                                <td className="px-3 py-2 border">
                                                    {s.startAt?.toDate?.().toLocaleString?.() ?? "—"}
                                                </td>
                                            </tr>
                                        ))}
                                        {recentSessions.length === 0 && (
                                            <tr><td colSpan={3} className="px-3 py-3 text-center">—</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Tugas Overview */}
                    <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-lg">Tugas</h2>
                                <p className="text-xs text-gray-500">Status & progress submit terbaru</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-900 text-white">
                                {tugasCounts.total} tugas
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <StatPill label="Draft" value={tugasCounts.draft} className="bg-gray-200 text-gray-800" />
                            <StatPill label="Open" value={tugasCounts.open} className="bg-green-600 text-white" />
                            <StatPill label="Closed" value={tugasCounts.closed} className="bg-red-600 text-white" />
                        </div>

                        <div className="rounded-xl border p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <div className="font-semibold">Tugas Terbaru</div>
                                    <div className="text-gray-600">{latestTask?.title ?? "—"}</div>
                                    {latestTask && (
                                        <div className="text-xs text-gray-500">
                                            Deadline: {latestTask.date?.toDate?.().toLocaleDateString("id-ID")}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[11px] px-2 py-1 rounded-full bg-gray-800 text-white">
                                    {latestTask?.status ?? "—"}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                                <MiniBadge label="Sudah" value={latestTaskStats?.sudah ?? 0} className="bg-green-600 text-white" />
                                <MiniBadge label="Belum" value={latestTaskStats?.belum ?? 0} className="bg-red-600 text-white" />
                                <MiniBadge label="Total" value={latestTaskStats?.total ?? 0} className="bg-gray-900 text-white" />
                            </div>
                        </div>

                        {/* Recent tasks */}
                        <div>
                            <div className="text-sm font-semibold mb-2">Tugas Terakhir</div>
                            <div className="rounded-xl border overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left px-3 py-2 border">Judul</th>
                                            <th className="text-left px-3 py-2 border">Status</th>
                                            <th className="text-left px-3 py-2 border">Deadline</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTasks.map((t) => (
                                            <tr key={t.id} className="odd:bg-white even:bg-gray-50">
                                                <td className="px-3 py-2 border">{t.title}</td>
                                                <td className="px-3 py-2 border">{t.status}</td>
                                                <td className="px-3 py-2 border">
                                                    {t.date?.toDate?.().toLocaleDateString?.("id-ID") ?? "—"}
                                                </td>
                                            </tr>
                                        ))}
                                        {recentTasks.length === 0 && (
                                            <tr><td colSpan={3} className="px-3 py-3 text-center">—</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer nav hint */}
                <div className="text-xs text-gray-500">
                    Tips: gunakan menu “Dashboard Presensi” & “Dashboard Tugas” untuk aksi detail (ubah status, cek link tugas, dll).
                </div>
            </div>
        </div>
    );
}

// --- small UI pieces ---
function StatPill({ label, value, className = "" }) {
    return (
        <div className={`rounded-lg px-3 py-2 text-center ${className}`}>
            <div className="text-xs opacity-80">{label}</div>
            <div className="text-lg font-semibold">{value ?? 0}</div>
        </div>
    );
}

function MiniBadge({ label, value, className = "" }) {
    return (
        <div className={`rounded-lg px-2 py-2 text-center ${className}`}>
            <div className="text-[11px] opacity-80">{label}</div>
            <div className="text-base font-semibold">{value ?? 0}</div>
        </div>
    );
}
