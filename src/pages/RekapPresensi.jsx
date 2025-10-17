// src/pages/RekapPresensi.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import Qna from "../components/qna";
import BottomNav from "../components/BottomNav";

// Letter & warna untuk status
const STATUS_TO_LETTER = {
    hadir: "H",
    izin: "I",
    sakit: "S",
    alpha: "A",
    "belum isi": "",
    undefined: "",
    null: "",
};
const LETTER_CLASS = {
    H: "bg-green-600 text-white",
    I: "bg-amber-500 text-white",
    S: "bg-yellow-600 text-white",
    A: "bg-red-600 text-white",
    "": "bg-sky-50 text-sky-600 ring-1 ring-sky-100", // kosong → lembut & sepalet
};

// Ambil label pN dari judul. Contoh: "Praktikum 1 - ..." => p1
function toPLabel(title, idx) {
    const m = (title || "").match(/(\d+)/);
    if (m) return `p${parseInt(m[1], 10)}`;
    return `p${idx + 1}`;
}

export default function RekapPresensi() {
    const [sessions, setSessions] = useState([]); // [{id, title, attendances, ...}, ...]
    const [loading, setLoading] = useState(true);
    const [nameQuery, setNameQuery] = useState("");
    const tableRef = useRef(null);

    // Realtime semua sesi, urut lama -> baru
    useEffect(() => {
        const qy = query(collection(db, "presensi"), orderBy("startAt", "asc")); // ASC untuk urutan normal
        const unsub = onSnapshot(qy, (snap) => {
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setSessions(arr);
            setLoading(false);
        });
        return unsub;
    }, []);

    // Kumpulkan roster (union NIM dari semua sesi)
    const roster = useMemo(() => {
        const m = new Map();
        for (const s of sessions) {
            const att = s.attendances || {};
            for (const [nim, v] of Object.entries(att)) {
                const nm = v?.name || "UNKNOWN";
                if (!m.has(nim)) m.set(nim, nm);
            }
        }
        const arr = Array.from(m.entries()).map(([nim, name]) => ({ nim, name }));
        arr.sort((a, b) => a.name.localeCompare(b.name, "id", { sensitivity: "base" }));
        return arr;
    }, [sessions]);

    // Kolom sesi (p-label + id + title)
    const columns = useMemo(
        () =>
            sessions.map((s, i) => ({
                id: s.id,
                key: s.id,
                pLabel: toPLabel(s.title, i),
                title: s.title || "(tanpa judul)",
            })),
        [sessions]
    );

    // Filter search nama
    const filteredRoster = useMemo(() => {
        const q = nameQuery.trim().toLowerCase();
        if (!q) return roster;
        return roster.filter((r) => r.name.toLowerCase().includes(q));
    }, [nameQuery, roster]);

    // Auto scroll ke kanan kalau ada sesi baru
    useEffect(() => {
        if (tableRef.current && sessions.length > 0) {
            tableRef.current.scrollLeft = tableRef.current.scrollWidth;
        }
    }, [sessions.length]);

    return (
        <div className="min-h-screen bg-white pb-16">
            <div className="px-4 max-w-6xl mx-auto space-y-5 pt-5">
                {/* Header */}
                <header className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-extrabold text-sky-700">Rekap Presensi</h1>
                        <p className="text-sm text-gray-600">
                            Total Mahasiswa: <b>{roster.length}</b>
                        </p>
                    </div>
                    <Qna />
                </header>

                {/* Search */}
                <div className="relative">
                    <input
                        className="w-full border border-sky-100 rounded-xl p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-600"
                        placeholder="Ketik nama kamu"
                        value={nameQuery}
                        onChange={(e) => setNameQuery(e.target.value)}
                    />
                    <i className="ri-search-line absolute right-3 top-1/2 -translate-y-1/2 text-sky-600" />
                </div>

                {/* Legend */}
                <div className="text-xs text-gray-600 flex flex-wrap gap-4">
                    <span className="inline-flex items-center gap-1">
                        <span className="inline-grid place-items-center w-6 h-6 rounded bg-green-600 text-white text-[13px] font-bold">H</span>
                        Hadir
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="inline-grid place-items-center w-6 h-6 rounded bg-amber-500 text-white text-[13px] font-bold">I</span>
                        Izin
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="inline-grid place-items-center w-6 h-6 rounded bg-yellow-600 text-white text-[13px] font-bold">S</span>
                        Sakit
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="inline-grid place-items-center w-6 h-6 rounded bg-red-600 text-white text-[13px] font-bold">A</span>
                        Alpha
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="inline-grid place-items-center w-6 h-6 rounded bg-sky-50 text-sky-600 ring-1 ring-sky-100 text-[13px]">—</span>
                        Belum Isi
                    </span>
                </div>

                {/* Tabel Rekap — scroll horizontal */}
                {loading ? (
                    <div className="p-8 text-center text-gray-500 border border-sky-100 rounded-xl bg-white shadow-sm">
                        Memuat data presensi...
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 border border-sky-100 rounded-xl bg-white shadow-sm">
                        Belum ada sesi presensi.
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div
                            ref={tableRef}
                            className="overflow-x-auto border border-sky-100 rounded-xl bg-white shadow-sm"
                        >
                            <table className="w-max min-w-full text-sm">
                                <thead className="bg-sky-50">
                                    <tr>
                                        <th className="border border-sky-100 px-3 py-3 text-left font-semibold text-sky-700 whitespace-nowrap">
                                            Nama Mahasiswa
                                        </th>
                                        {columns.map((c) => (
                                            <th
                                                key={c.key}
                                                className="border border-sky-100 px-3 py-3 text-center font-semibold text-sky-700 whitespace-nowrap"
                                                title={c.title}
                                            >
                                                <div>{c.pLabel}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRoster.map((stu, index) => (
                                        <tr key={stu.nim} className={index % 2 === 0 ? "bg-white" : "bg-sky-50/40"}>
                                            {/* Nama - ikut scroll horizontal */}
                                            <td className="border border-sky-100 px-3 py-2 text-gray-800 whitespace-nowrap">
                                                {stu.name}
                                            </td>

                                            {/* Sel per sesi */}
                                            {columns.map((c) => {
                                                const status = sessions.find((s) => s.id === c.id)?.attendances?.[stu.nim]?.status;
                                                const letter = STATUS_TO_LETTER[status];
                                                const cls = LETTER_CLASS[letter || ""];
                                                const tooltipText = status
                                                    ? `${status.toUpperCase()} — ${c.title}`
                                                    : `Belum isi — ${c.title}`;

                                                return (
                                                    <td
                                                        key={c.key + "_" + stu.nim}
                                                        className="border border-sky-100 px-2 py-2 text-center whitespace-nowrap"
                                                        title={tooltipText}
                                                    >
                                                        <div className={`inline-grid place-items-center w-7 h-7 rounded ${cls}`}>
                                                            {letter || "—"}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                    {filteredRoster.length === 0 && (
                                        <tr>
                                            <td colSpan={1 + columns.length} className="text-center p-6 text-gray-500">
                                                Tidak ada data (cek kata kunci pencarian).
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Info jumlah */}
                        <div className="text-xs text-gray-500 text-center">
                            Menampilkan {filteredRoster.length} dari {roster.length} mahasiswa • {columns.length} pertemuan
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}