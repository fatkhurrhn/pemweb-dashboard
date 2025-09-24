// src/pages/Checkin.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    collection,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

function withinWindow(session) {
    if (!session?.startAt || !session?.endAt) return false;
    const now = new Date();
    const start = session.startAt.toDate();
    const end = session.endAt.toDate();
    return now >= start && now <= end;
}

function fmtHM(d) {
    // HH:mm (24h), leading zero
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function Checkin() {
    const [openSessions, setOpenSessions] = useState([]); // hanya status=open
    const [sessionId, setSessionId] = useState("");       // chosen session
    const [session, setSession] = useState(null);         // chosen session data

    const [nimQuery, setNimQuery] = useState("");
    const [picked, setPicked] = useState(null);           // { nim, name, status }
    const [message, setMessage] = useState("");
    const [done, setDone] = useState(false);              // after submit success

    // Fetch sessions with status == open (sekali; filter rentang waktu di client)
    useEffect(() => {
        (async () => {
            const qOpen = query(collection(db, "presensi"), where("status", "==", "open"));
            const snap = await getDocs(qOpen);
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            // filter yg dalam rentang waktu
            const valid = arr.filter(withinWindow);
            // kalau >1, user bisa pilih; kalau 1, auto pilih
            valid.sort((a, b) => (b.startAt?.toMillis?.() || 0) - (a.startAt?.toMillis?.() || 0));
            setOpenSessions(valid);
            if (valid.length === 1) {
                setSessionId(valid[0].id);
                setSession(valid[0]);
            }
        })();
    }, []);

    // kalau user pilih session
    useEffect(() => {
        if (!sessionId) return;
        const s = openSessions.find((x) => x.id === sessionId);
        setSession(s || null);
        setNimQuery("");
        setPicked(null);
        setMessage("");
        setDone(false);
    }, [sessionId, openSessions]);

    const rosterArray = useMemo(() => {
        if (!session?.attendances) return [];
        return Object.entries(session.attendances).map(([nim, v]) => ({
            nim,
            name: v?.name || "UNKNOWN",
            status: v?.status || "belum isi",
        }));
    }, [session?.attendances]);

    // 🔎 Cari hanya dari 3 digit terakhir NIM
    const matches = useMemo(() => {
        const q = nimQuery.trim(); // sudah disterilkan jadi digit saja di onChange
        if (!q) return [];
        return rosterArray
            .filter((r) => r.nim.endsWith(q)) // cocokkan suffix 3 digit
            .slice(0, 8);
    }, [nimQuery, rosterArray]);

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        if (!session) return setMessage("Belum ada sesi presensi yang terbuka.");
        if (!withinWindow(session)) return setMessage("Sesi ini di luar rentang waktu.");
        if (!picked?.nim) return setMessage("Pilih NIM terlebih dahulu.");

        const path = `attendances.${picked.nim}`;
        try {
            await updateDoc(doc(db, "presensi", session.id), {
                [`${path}.name`]: picked.name,
                [`${path}.status`]: "hadir",
                [`${path}.checkedInAt`]: serverTimestamp(),
                [`${path}.method`]: "self",
            });
            setDone(true); // tampilkan layar sukses
        } catch (err) {
            setMessage("Gagal menyimpan presensi. Coba lagi.");
        }
    }

    // Jika tidak ada sesi open dalam rentang waktu
    if (openSessions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-5 flex items-center">
                <div className="w-full max-w-md mx-auto space-y-4">
                    <header className="text-center">
                        <h1 className="text-2xl font-bold">Check-in Kehadiran</h1>
                        <p className="text-sm text-gray-600">Tidak ada sesi aktif saat ini</p>
                    </header>
                    <div className="p-4 border rounded-2xl bg-white shadow-sm">
                        Saat ini tidak ada sesi presensi yang sedang <b>open</b> dan aktif waktunya.
                    </div>
                </div>
            </div>
        );
    }

    // Layar sukses (ephemeral; refresh kembali ke form)
    if (done) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-5 flex items-center">
                <div className="w-full max-w-md mx-auto space-y-4 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-green-600 text-white grid place-items-center text-3xl shadow">
                        ✓
                    </div>
                    <h1 className="text-xl font-bold">Berhasil Presensi</h1>
                    <div className="p-4 border rounded-2xl bg-white shadow-sm">
                        <div className="text-sm text-gray-700">
                            Sesi presensi: <b>{session?.title}</b>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Data kehadiranmu sudah tercatat sebagai <b>hadir</b>.
                        </p>
                        <p className="text-xs text-gray-500 mt-3">
                            Laman ini tidak menyimpan data di perangkat—segarkan halaman untuk kembali ke formulir.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-5">
            <div className="max-w-md mx-auto space-y-4">
                {/* Header */}
                <header className="text-center">
                    <h1 className="text-2xl font-bold">Check-in Kehadiran</h1>
                    <p className="text-sm text-gray-600">Masukkan NIM kamu untuk presensi</p>
                </header>

                {/* Pilih sesi jika lebih dari 1 yang open */}
                {openSessions.length > 1 && (
                    <div className="p-3 border rounded-2xl bg-white shadow-sm">
                        <label className="text-sm font-medium">Pilih Sesi</label>
                        <select
                            className="border p-2 rounded-xl w-full mt-1"
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                        >
                            <option value="">— pilih —</option>
                            {openSessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.title} ({fmtHM(s.startAt.toDate())}–{fmtHM(s.endAt.toDate())})
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Hanya sesi <b>open</b> & dalam rentang waktu yang ditampilkan.
                        </p>
                    </div>
                )}

                {/* Info sesi */}
                {session && (
                    <div className="p-3 border rounded-2xl bg-white shadow-sm flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            <div className="font-semibold">{session.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                Waktu: <b>{fmtHM(session.startAt.toDate())}–{fmtHM(session.endAt.toDate())}</b>
                            </div>
                        </div>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-green-600 text-white">Open</span>
                    </div>
                )}

                {/* Form NIM */}
                <form onSubmit={handleSubmit} className="grid gap-3 p-3 border rounded-2xl bg-white shadow-sm">
                    <label className="text-sm">
                        Masukkan 3 digit terakhir NIM
                        <input
                            className="border p-3 rounded-xl w-full mt-1 text-base"
                            placeholder="contoh: 021"
                            value={nimQuery}
                            onChange={(e) => {
                                // hanya digit, max 3, simpan apa adanya agar leading zero ('021') tidak hilang
                                const onlyDigits = e.target.value.replace(/\D/g, "");
                                setNimQuery(onlyDigits.slice(0, 3));
                                setPicked(null);
                                setMessage("");
                            }}
                            inputMode="numeric"
                            maxLength={3}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </label>

                    {/* Suggestions: berdasarkan suffix 3 digit */}
                    {nimQuery && (
                        <div className="rounded-xl border overflow-hidden">
                            {matches.length > 0 ? (
                                <ul className="max-h-64 overflow-auto divide-y">
                                    {matches.map((m) => (
                                        <li key={m.nim}>
                                            <button
                                                type="button"
                                                onClick={() => { setPicked(m); setNimQuery(m.nim.slice(-3)); }}
                                                className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-50"
                                            >
                                                <div>
                                                    <div className="text-sm text-left font-semibold tracking-wide">{m.nim}</div>
                                                    <div className="text-xs text-gray-600">{m.name}</div>
                                                </div>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-800">
                                                    {m.status || "belum isi"}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-3 py-3 text-sm text-gray-500">NIM tidak ditemukan.</div>
                            )}
                        </div>
                    )}

                    {/* Selected info + tombol */}
                    {picked && (
                        <div className="p-3 rounded-xl border bg-gray-50 text-sm">
                            <div><b>NIM:</b> {picked.nim}</div>
                            <div><b>Nama:</b> {picked.name}</div>
                            <div><b>Status sekarang:</b> {picked.status}</div>
                        </div>
                    )}

                    <button
                        className="mt-1 px-4 py-3 bg-black text-white rounded-xl text-base font-semibold disabled:opacity-50"
                        disabled={!picked || !session}
                    >
                        Hadir cuy
                    </button>

                    {message && <div className="text-sm text-red-600">{message}</div>}
                </form>

                <p className="text-xs text-gray-500 text-center">
                    *Halaman ini tidak memerlukan login. Pastikan NIM yang dipilih sudah benar.
                </p>
            </div>
        </div>
    );
}
