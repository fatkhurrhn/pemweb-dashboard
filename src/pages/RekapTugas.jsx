// src/pages/RekapTugas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import ROSTER from "../data/roster";
import { Link } from "react-router-dom";
import QnA from "../components/qna";
import BottomNav from "../components/BottomNav";

// Helper kecil
function fmtDate(d) {
    if (!d) return "-";
    if (d?.toDate) return d.toDate().toLocaleDateString("id-ID");
    if (typeof d === "string") return d;
    return String(d);
}

export default function RekapTugas() {
    const [sessions, setSessions] = useState([]); // daftar dokumen 'tugas'
    const [search, setSearch] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);

    // Ambil semua sesi tugas, urut ASC biar P1..Pn ke kanan
    useEffect(() => {
        const qy = query(collection(db, "tugas"), orderBy("date", "asc"));
        const unsub = onSnapshot(qy, (snap) => {
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setSessions(arr);
        });
        return unsub;
    }, []);

    // Header kolom: P1, P2, ... + tooltip judul
    const columns = useMemo(() => {
        return sessions.map((s, idx) => ({
            id: s.id,
            key: s.id,
            label: `P${idx + 1}`,
            title: s.title || `Sesi ${idx + 1}`,
            date: fmtDate(s.date),
            submissions: s.submissions || {}, // map NIM -> {link, imageUrl, method, name, submittedAt}
        }));
    }, [sessions]);

    // Roster -> rows dasar + filter nama
    const rows = useMemo(() => {
        const base = ROSTER.map(([no, nim, name, githubUrl]) => ({ no, nim, name, githubUrl }));
        const q = search.trim().toLowerCase();
        if (!q) return base;
        return base.filter((r) => r.name.toLowerCase().includes(q));
    }, [search]);

    const totalMahasiswa = ROSTER.length;

    return (
        <div className="min-h-screen bg-white pb-16">
            <div className="px-4 max-w-6xl mx-auto space-y-5 pt-5">
                <header className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-extrabold text-sky-700">Rekap Tugas</h1>
                        <p className="text-sm text-gray-600">
                            Total Mahasiswa: <b>{totalMahasiswa}</b>
                        </p>
                    </div>
                    <QnA />
                </header>

                {/* Search */}
                <div className="relative">
                    <input
                        className="w-full border border-sky-100 rounded-xl p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-600"
                        placeholder="Ketik nama kamu"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <i className="ri-search-line absolute right-3 top-1/2 -translate-y-1/2 text-sky-600" />
                </div>

                {/* Legend */}
                <div className="text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1 mr-3">
                        <span className="inline-grid place-items-center w-6 h-6 rounded bg-green-600 text-white text-[13px]">✓</span>
                        Selesai
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="inline-grid place-items-center w-6 h-6 rounded bg-sky-50 text-sky-600 ring-1 ring-sky-100 text-[13px]">—</span>
                        Kosong
                    </span>
                </div>

                {/* Tabel Rekap — seluruh tabel bisa scroll ke kanan */}
                <div className="overflow-x-auto border border-sky-100 rounded-xl bg-white shadow-sm">
                    <table className="w-max min-w-full text-sm">
                        <thead className="bg-sky-50">
                            <tr>
                                <th className="border border-sky-100 px-3 py-3 text-left font-semibold text-sky-700 whitespace-nowrap">
                                    No
                                </th>
                                <th className="border border-sky-100 px-3 py-3 text-left font-semibold text-sky-700 whitespace-nowrap">
                                    NIM
                                </th>
                                <th className="border border-sky-100 px-3 py-3 text-left font-semibold text-sky-700 whitespace-nowrap">
                                    Nama Mahasiswa
                                </th>
                                {columns.map((c) => (
                                    <th
                                        key={c.key}
                                        className="border border-sky-100 px-3 py-3 text-center font-semibold text-sky-700 whitespace-nowrap"
                                        title={`${c.title} • ${c.date}`}
                                    >
                                        <div>{c.label}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.nim} className="odd:bg-white even:bg-sky-50/40">
                                    {/* No */}
                                    <td className="border border-sky-100 px-3 py-2 text-gray-800 whitespace-nowrap text-center">
                                        {r.no}
                                    </td>
                                    {/* NIM */}
                                    <td className="border border-sky-100 px-3 py-2 text-gray-800 whitespace-nowrap">
                                        {r.nim}
                                    </td>
                                    {/* Nama */}
                                    <td className="border border-sky-100 px-3 py-2 text-gray-800 whitespace-nowrap">
                                        {r.name}
                                    </td>

                                    {/* Sel per sesi */}
                                    {columns.map((c) => {
                                        const sub = c.submissions[r.nim] || {};
                                        // ✅ FIX: Anggap selesai jika ada link / imageUrl / method manual
                                        const has = !!(sub.link || sub.imageUrl || sub.method === "manual");
                                        const tooltipText = has 
                                            ? `Selesai • ${sub.method === "manual" ? "Manual" : "Upload"} • ${sub.submittedAt ? fmtDate(sub.submittedAt) : ""}`
                                            : "Belum mengumpulkan";
                                        
                                        return (
                                            <td
                                                key={c.key}
                                                className="border border-sky-100 px-2 py-1 text-center whitespace-nowrap"
                                                title={tooltipText}
                                            >
                                                <div
                                                    className={`inline-grid place-items-center w-7 h-7 rounded ${has ? "bg-green-600 text-white" : "bg-sky-50 text-sky-600 ring-1 ring-sky-100"
                                                        }`}
                                                >
                                                    {has ? "✓" : "—"}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={3 + columns.length} className="text-center p-6 text-gray-500">
                                        Tidak ada data (cek kata kunci pencarian).
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Info tambahan */}
                {/* <div className="text-xs text-gray-500 text-center">
                    <p>Keterangan: ✓ = Tugas selesai (upload link/gambar atau ditandai manual oleh asdos)</p>
                </div> */}

                {/* Modal Preview Gambar (disiapkan, if needed nanti tinggal panggil setPreviewUrl(url)) */}
                {previewUrl && (
                    <div
                        className="fixed inset-0 bg-black/70 z-50 grid place-items-center p-4"
                        onClick={() => setPreviewUrl(null)}
                    >
                        <div className="max-w-4xl max-h-[90vh]">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="rounded shadow max-h-[90vh] object-contain"
                            />
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}