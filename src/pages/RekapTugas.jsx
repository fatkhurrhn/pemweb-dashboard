// src/pages/RekapTugas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import ROSTER from "../data/roster";

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
            submissions: s.submissions || {}, // map NIM -> {link, imageUrl, method}
        }));
    }, [sessions]);

    // Roster -> rows dasar + filter nama
    const rows = useMemo(() => {
        const base = ROSTER.map(([nim, name]) => ({ nim, name }));
        const q = search.trim().toLowerCase();
        if (!q) return base;
        return base.filter((r) => r.name.toLowerCase().includes(q));
    }, [search]);

    const totalMahasiswa = ROSTER.length;
    const totalSesi = sessions.length;

    return (
        <div className="p-4 max-w-6xl mx-auto space-y-6">
            <header className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Rekap Tugas</h1>
                    <p className="text-sm text-gray-600">
                        Total Mahasiswa: <b>{totalMahasiswa}</b> • Total Sesi: <b>{totalSesi}</b>
                    </p>
                </div>
                <a
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <i className="ri-arrow-left-line"></i> Kembali
                </a>
            </header>

            {/* Search */}
            <div className="p-3 border rounded bg-white">
                <label className="text-sm">
                    Cari nama mahasiswa
                    <input
                        className="border p-2 rounded w-full mt-1"
                        placeholder="ketik nama…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </label>
            </div>

            {/* Legend */}
            <div className="text-xs text-gray-600">
                <span className="inline-flex items-center gap-1 mr-3">
                    <span className="inline-grid place-items-center w-6 h-6 rounded bg-green-600 text-white text-[13px]">✓</span>
                    Selesai
                </span>
                <span className="inline-flex items-center gap-1">
                    <span className="inline-grid place-items-center w-6 h-6 rounded bg-gray-200 text-gray-800 text-[13px]">—</span>
                    Kosong
                </span>
            </div>

            {/* Tabel Rekap — seluruh tabel bisa scroll ke kanan */}
            <div className="overflow-x-auto border rounded">
                <table className="w-max min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border px-2 py-2 text-left">Nama Mahasiswa</th>
                            {columns.map((c) => (
                                <th key={c.key} className="border px-2 py-2 text-center whitespace-nowrap">
                                    <div className="font-semibold">{c.label}</div>
                                    <div
                                        className="text-[11px] text-gray-500 truncate max-w-[120px]"
                                        title={`${c.title} • ${c.date}`}
                                    >
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.nim} className="odd:bg-white even:bg-gray-50">
                                {/* Nama (ikut scroll) */}
                                <td className="border px-2 py-2">
                                    <div className="font-normal whitespace-nowrap">{r.name}</div>
                                </td>

                                {/* Sel per sesi */}
                                {columns.map((c) => {
                                    const sub = c.submissions[r.nim] || {};
                                    // ✅ Anggap selesai jika ada link / imageUrl / manual
                                    const has = !!(sub.link || sub.imageUrl || (sub.method === "manual"));
                                    return (
                                        <td key={c.key} className="border px-2 py-1 text-center whitespace-nowrap">
                                            <div
                                                className={`inline-grid place-items-center w-7 h-7 rounded ${has ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
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
                                <td colSpan={1 + columns.length} className="text-center p-6 text-gray-500">
                                    Tidak ada data (cek kata kunci pencarian).
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Preview Gambar */}
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
    );
}
