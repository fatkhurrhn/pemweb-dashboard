import React, { useEffect, useMemo, useState } from "react";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import { db } from "../firebase";

// Letter & warna untuk status
const STATUS_TO_LETTER = {
    "hadir": "H",
    "izin": "I",
    "sakit": "S",
    "alpha": "A",
    "belum isi": "",   // dikosongkan
    undefined: "",
    null: "",
};
const LETTER_CLASS = {
    "H": "bg-green-600 text-white",
    "I": "bg-amber-500 text-white",
    "S": "bg-blue-600 text-white",
    "A": "bg-red-600 text-white",
    "": "bg-gray-100 text-gray-400", // belum isi
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

    // Realtime semua sesi, urut waktu mulai (terlama -> terbaru) biar p1, p2, ...
    useEffect(() => {
        const qy = query(collection(db, "presensi"), orderBy("startAt", "asc"));
        const unsub = onSnapshot(qy, (snap) => {
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setSessions(arr);
            setLoading(false);
        });
        return unsub;
    }, []);

    // Kumpulkan roster (berdasar union NIM dari semua sesi)
    const roster = useMemo(() => {
        const m = new Map(); // nim -> name
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
    const columns = useMemo(() => {
        return sessions.map((s, i) => ({
            id: s.id,
            key: s.id,
            pLabel: toPLabel(s.title, i),
            title: s.title || "(tanpa judul)",
        }));
    }, [sessions]);

    // Filter berdasarkan nama (case-insensitive)
    const filteredRoster = useMemo(() => {
        const q = nameQuery.trim().toLowerCase();
        if (!q) return roster;
        return roster.filter((r) => r.name.toLowerCase().includes(q));
    }, [nameQuery, roster]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-5">
            <div className="mx-auto max-w-6xl space-y-4">
                {/* Header */}
                <header className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Rekap Presensi</h1>
                        <p className="text-sm text-gray-600">Ringkasan kehadiran per pertemuan</p>
                    </div>

                    {/* Search nama */}
                    <div className="w-full sm:w-72">
                        <label className="text-xs text-gray-600">Cari nama</label>
                        <div className="relative mt-1">
                            <input
                                className="w-full border rounded-xl p-3 pl-10"
                                placeholder="Ketik nama mahasiswa"
                                value={nameQuery}
                                onChange={(e) => setNameQuery(e.target.value)}
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
                        </div>
                    </div>
                </header>

                {/* Legend */}
                <div className="text-xs text-gray-600 flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 rounded-full bg-green-600 text-white">H = Hadir</span>
                    <span className="px-2 py-1 rounded-full bg-amber-500 text-white">I = Izin</span>
                    <span className="px-2 py-1 rounded-full bg-blue-600 text-white">S = Sakit</span>
                    <span className="px-2 py-1 rounded-full bg-red-600 text-white">A = Alpha</span>
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 border">kosong = Belum isi</span>
                </div>

                {/* Konten */}
                {loading ? (
                    <div className="p-4 border rounded-xl bg-white shadow-sm">Memuat…</div>
                ) : sessions.length === 0 ? (
                    <div className="p-4 border rounded-xl bg-white shadow-sm">Belum ada sesi presensi.</div>
                ) : roster.length === 0 ? (
                    <div className="p-4 border rounded-xl bg-white shadow-sm">Belum ada data mahasiswa.</div>
                ) : (
                    <div className="relative">
                        {/* Wrapper scroll horizontal */}
                        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        {/* Kolom nama sticky */}
                                        <th className="sticky left-0 z-20 bg-gray-50 border px-3 py-3 text-left font-semibold">
                                            Nama
                                        </th>
                                        {columns.map((c, idx) => (
                                            <th
                                                key={c.key}
                                                className="border px-3 py-3 text-center font-semibold"
                                                title={c.title}
                                            >
                                                {c.pLabel}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRoster.map((stu) => (
                                        <tr key={stu.nim} className="odd:bg-white even:bg-gray-50">
                                            {/* Nama sticky */}
                                            <td className="sticky left-0 z-10 bg-inherit border px-3 py-2 font-medium">
                                                {stu.name}
                                            </td>

                                            {/* Per sesi: tampilkan H/I/S/A atau kosong */}
                                            {columns.map((c) => {
                                                const status = sessions
                                                    .find((s) => s.id === c.id)
                                                    ?.attendances?.[stu.nim]?.status;
                                                const letter = STATUS_TO_LETTER[status];
                                                const cls = LETTER_CLASS[letter || ""];
                                                const title = status ? `${status.toUpperCase()} — ${c.title}` : `Belum isi — ${c.title}`;
                                                return (
                                                    <td key={c.key + "_" + stu.nim} className="border px-2 py-2 text-center" title={title}>
                                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${cls}`}>
                                                            {letter}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Info jumlah baris */}
                        <div className="text-xs text-gray-500 mt-2">
                            Menampilkan {filteredRoster.length} dari {roster.length} mahasiswa • {columns.length} pertemuan
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
