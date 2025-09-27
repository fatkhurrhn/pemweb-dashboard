// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import ROSTER from "../data/roster";

// ===== Helpers Presensi =====
function computeAttendanceStats(attendances = {}) {
    const counts = { total: 0, hadir: 0, izin: 0, sakit: 0, alpha: 0, "belum isi": 0 };
    for (const v of Object.values(attendances)) {
        const s = v?.status || "belum isi";
        counts.total += 1;
        if (counts[s] !== undefined) counts[s] += 1;
    }
    return counts;
}

// ===== Helpers Tugas =====
// Selesai jika: link || imageUrl || method==="manual" || status==="sudah"
function computeSubmissionStats(subs = {}, rosterTotal = 0) {
    let sudah = 0;
    for (const v of Object.values(subs || {})) {
        const done = !!(v?.link || v?.imageUrl || v?.method === "manual" || v?.status === "sudah");
        if (done) sudah += 1;
    }
    const total = rosterTotal;
    const belum = Math.max(total - sudah, 0);
    return { total, sudah, belum };
}

// ===== UI bits =====
function KPI({ title, value, sub, className = "" }) {
    return (
        <div className={`rounded-2xl border border-sky-100 bg-white p-4 shadow-sm ${className}`}>
            <div className="text-xs uppercase tracking-wide text-sky-700 font-semibold">{title}</div>
            <div className="mt-1 text-2xl font-extrabold text-gray-800">{value}</div>
            {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
        </div>
    );
}
function Badge({ children, className = "" }) {
    return <span className={`text-[11px] px-2 py-1 rounded-full ${className}`}>{children}</span>;
}
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

export default function Dashboard() {
    const navigate = useNavigate();

    // presensi & tugas (desc)
    const [sessions, setSessions] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const qy = query(collection(db, "presensi"), orderBy("startAt", "desc"));
        const unsub = onSnapshot(qy, (snap) => {
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setSessions(arr);
        });
        return unsub;
    }, []);

    useEffect(() => {
        const qy = query(collection(db, "tugas"), orderBy("date", "desc"));
        const unsub = onSnapshot(qy, (snap) => {
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setTasks(arr);
        });
        return unsub;
    }, []);

    // Presensi summary
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

    // Tugas summary
    const tugasCounts = useMemo(() => {
        const total = tasks.length;
        const draft = tasks.filter((t) => t.status === "draft").length;
        const open = tasks.filter((t) => t.status === "open").length;
        const closed = tasks.filter((t) => t.status === "closed").length;
        return { total, draft, open, closed };
    }, [tasks]);

    const rosterTotal = ROSTER.length;
    const latestTask = tasks[0] || null;
    const latestTaskStats = useMemo(() => {
        if (!latestTask) return null;
        return computeSubmissionStats(latestTask.submissions, rosterTotal);
    }, [latestTask, rosterTotal]);

    // recent
    const recentSessions = useMemo(() => sessions.slice(0, 5), [sessions]);
    const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks]);

    function handleLogout() {
        localStorage.clear();
        navigate("/", { replace: true });
    }

    return (
        <div className="min-h-screen bg-white">
            {/* ===== Hero / Topbar ===== */}
            <div className="border-b bg-gradient-to-r from-sky-50 to-white">
                <div className="max-w-7xl mx-auto px-5 py-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-xs font-semibold">
                                <i className="ri-dashboard-2-line" /> Overview
                            </div>
                            <h1 className="mt-2 text-2xl font-extrabold text-sky-700">Dashboard</h1>
                            <p className="text-sm text-gray-600">Ringkasan Presensi & Tugas kelas</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/dashboard-presensi"
                                className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sky-700 hover:bg-sky-50"
                            >
                                <i className="ri-calendar-check-line" />
                                Presensi
                            </Link>
                            <Link
                                to="/dashboard-tugas"
                                className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sky-700 hover:bg-sky-50"
                            >
                                <i className="ri-task-line" />
                                Tugas
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 text-white px-3 py-2 hover:opacity-95"
                                title="Logout"
                            >
                                <i className="ri-logout-box-r-line" />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* KPI ring */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <KPI title="Total Sesi" value={presensiCounts.total} sub="Presensi" />
                        <KPI title="Sesi Open" value={presensiCounts.open} sub="Presensi" />
                        <KPI title="Total Tugas" value={tugasCounts.total} sub="Tugas" />
                        <KPI title="Tugas Open" value={tugasCounts.open} sub="Tugas" />
                    </div>
                </div>
            </div>

            {/* ===== Main 3-column layout (1-1/2-1/2 on xl) ===== */}
            <div className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                {/* Left: two big panels stacked */}
                <div className="space-y-6">
                    {/* Presensi Panel */}
                    <div className="rounded-2xl border border-sky-100 bg-white shadow-sm">
                        <div className="p-5 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-lg text-sky-700">Presensi</h2>
                                    <p className="text-xs text-gray-500">Status sesi & statistik terbaru</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-gray-100 text-gray-800">Draft {presensiCounts.draft}</Badge>
                                    <Badge className="bg-green-600 text-white">Open {presensiCounts.open}</Badge>
                                    <Badge className="bg-red-600 text-white">Closed {presensiCounts.closed}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 grid lg:grid-cols-[1fr,1fr] gap-5">
                            {/* Latest session card */}
                            <div className="rounded-xl border border-sky-100 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-800">Sesi Terbaru</div>
                                        <div className="text-gray-600">{latestSession?.title ?? "—"}</div>
                                        {latestSession && (
                                            <div className="text-xs text-gray-500">
                                                {latestSession.startAt?.toDate?.().toLocaleString()} —{" "}
                                                {latestSession.endAt?.toDate?.().toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                    <Badge className="bg-sky-700 text-white">{latestSession?.status ?? "—"}</Badge>
                                </div>

                                <div className="grid grid-cols-5 gap-2 mt-3 text-center">
                                    <MiniBadge label="Hadir" value={latestSessionStats?.hadir ?? 0} className="bg-green-600 text-white" />
                                    <MiniBadge label="Izin" value={latestSessionStats?.izin ?? 0} className="bg-amber-500 text-white" />
                                    <MiniBadge label="Sakit" value={latestSessionStats?.sakit ?? 0} className="bg-blue-600 text-white" />
                                    <MiniBadge label="Alpha" value={latestSessionStats?.alpha ?? 0} className="bg-red-600 text-white" />
                                    <MiniBadge label="Belum" value={latestSessionStats?.['belum isi'] ?? 0} className="bg-gray-100 text-gray-800" />
                                </div>
                            </div>

                            {/* Recent table */}
                            <div className="rounded-xl border border-sky-100 overflow-hidden">
                                <div className="px-4 py-3 bg-sky-50 text-sm font-semibold">Sesi Terakhir</div>
                                <table className="min-w-full text-sm">
                                    <thead className="bg-sky-50">
                                        <tr>
                                            <th className="text-left px-3 py-2 border border-sky-100">Judul</th>
                                            <th className="text-left px-3 py-2 border border-sky-100">Status</th>
                                            <th className="text-left px-3 py-2 border border-sky-100">Mulai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSessions.map((s) => (
                                            <tr key={s.id} className="odd:bg-white even:bg-sky-50/40">
                                                <td className="px-3 py-2 border border-sky-100">{s.title}</td>
                                                <td className="px-3 py-2 border border-sky-100">{s.status}</td>
                                                <td className="px-3 py-2 border border-sky-100">
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

                    {/* Tugas Panel */}
                    <div className="rounded-2xl border border-sky-100 bg-white shadow-sm">
                        <div className="p-5 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-lg text-sky-700">Tugas</h2>
                                    <p className="text-xs text-gray-500">Status & progress submit terbaru</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-gray-100 text-gray-800">Draft {tugasCounts.draft}</Badge>
                                    <Badge className="bg-green-600 text-white">Open {tugasCounts.open}</Badge>
                                    <Badge className="bg-red-600 text-white">Closed {tugasCounts.closed}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 grid lg:grid-cols-[1fr,1fr] gap-5">
                            {/* Latest task card */}
                            <div className="rounded-xl border border-sky-100 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-800">Tugas Terbaru</div>
                                        <div className="text-gray-600">{latestTask?.title ?? "—"}</div>
                                        {latestTask && (
                                            <div className="text-xs text-gray-500">
                                                Deadline: {latestTask.date?.toDate?.().toLocaleDateString("id-ID")}
                                            </div>
                                        )}
                                    </div>
                                    <Badge className="bg-sky-700 text-white">{latestTask?.status ?? "—"}</Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                                    <MiniBadge label="Sudah" value={latestTaskStats?.sudah ?? 0} className="bg-green-600 text-white" />
                                    <MiniBadge label="Belum" value={latestTaskStats?.belum ?? 0} className="bg-red-600 text-white" />
                                    <MiniBadge label="Total" value={latestTaskStats?.total ?? 0} className="bg-gray-900 text-white" />
                                </div>
                            </div>

                            {/* Recent tasks table */}
                            <div className="rounded-xl border border-sky-100 overflow-hidden">
                                <div className="px-4 py-3 bg-sky-50 text-sm font-semibold">Tugas Terakhir</div>
                                <table className="min-w-full text-sm">
                                    <thead className="bg-sky-50">
                                        <tr>
                                            <th className="text-left px-3 py-2 border border-sky-100">Judul</th>
                                            <th className="text-left px-3 py-2 border border-sky-100">Status</th>
                                            <th className="text-left px-3 py-2 border border-sky-100">Deadline</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTasks.map((t) => (
                                            <tr key={t.id} className="odd:bg-white even:bg-sky-50/40">
                                                <td className="px-3 py-2 border border-sky-100">{t.title}</td>
                                                <td className="px-3 py-2 border border-sky-100">{t.status}</td>
                                                <td className="px-3 py-2 border border-sky-100">
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

                {/* Right: Sidebar (Quick Actions + ringkas) */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-sky-100 bg-white shadow-sm p-5">
                        <div className="text-sm font-semibold text-sky-700">Quick Actions</div>
                        <div className="mt-3 grid gap-2">
                            <Link
                                to="/checkin"
                                className="flex items-center justify-between rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sky-700 hover:bg-sky-100"
                            >
                                <span className="text-sm font-medium">Form Check-in</span>
                                <i className="ri-arrow-right-s-line" />
                            </Link>
                            <Link
                                to="/tugas"
                                className="flex items-center justify-between rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sky-700 hover:bg-sky-100"
                            >
                                <span className="text-sm font-medium">Form Submit Tugas</span>
                                <i className="ri-arrow-right-s-line" />
                            </Link>
                            <Link
                                to="/rekap-presensi"
                                className="flex items-center justify-between rounded-lg border border-sky-100 bg-white px-3 py-2 hover:bg-sky-50"
                            >
                                <span className="text-sm">Rekap Presensi</span>
                                <i className="ri-external-link-line" />
                            </Link>
                            <Link
                                to="/rekap-tugas"
                                className="flex items-center justify-between rounded-lg border border-sky-100 bg-white px-3 py-2 hover:bg-sky-50"
                            >
                                <span className="text-sm">Rekap Tugas</span>
                                <i className="ri-external-link-line" />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-sky-100 bg-white shadow-sm p-5">
                        <div className="text-sm font-semibold text-sky-700">Ringkas Terakhir</div>
                        <div className="mt-3 space-y-3 text-sm">
                            <div>
                                <div className="text-gray-500">Sesi Presensi</div>
                                <div className="font-medium text-gray-800 truncate">{latestSession?.title ?? "—"}</div>
                                {latestSession && (
                                    <div className="text-xs text-gray-500">
                                        {latestSession.startAt?.toDate?.().toLocaleDateString?.("id-ID")} •{" "}
                                        <span className="lowercase">{latestSession?.status}</span>
                                    </div>
                                )}
                            </div>
                            <div className="h-px bg-sky-100" />
                            <div>
                                <div className="text-gray-500">Tugas</div>
                                <div className="font-medium text-gray-800 truncate">{latestTask?.title ?? "—"}</div>
                                {latestTask && (
                                    <div className="text-xs text-gray-500">
                                        Deadline {latestTask.date?.toDate?.().toLocaleDateString?.("id-ID")} •{" "}
                                        <span className="lowercase">{latestTask?.status}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Small status chips */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <StatPill label="Presensi Open" value={presensiCounts.open} className="bg-green-50 text-green-700" />
                            <StatPill label="Tugas Belum" value={latestTaskStats?.belum ?? 0} className="bg-red-50 text-red-700" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
