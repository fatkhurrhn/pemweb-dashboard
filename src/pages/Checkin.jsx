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
import { Link } from "react-router-dom";
import { db } from "../firebase";
import BottomNav from "../components/BottomNav";

function withinWindow(session) {
    if (!session?.startAt || !session?.endAt) return false;
    const now = new Date();
    const start = session.startAt.toDate();
    const end = session.endAt.toDate();
    return now >= start && now <= end;
}

function fmtHM(d) {
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function Checkin() {
    const [openSessions, setOpenSessions] = useState([]);
    const [sessionId, setSessionId] = useState("");
    const [session, setSession] = useState(null);

    const [nimQuery, setNimQuery] = useState("");
    const [picked, setPicked] = useState(null);
    const [message, setMessage] = useState("");
    const [done, setDone] = useState(false);

    const [loadingSessions, setLoadingSessions] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoadingSessions(true);
                const qOpen = query(collection(db, "presensi"), where("status", "==", "open"));
                const snap = await getDocs(qOpen);
                const arr = [];
                snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
                const valid = arr.filter(withinWindow);
                valid.sort((a, b) => (b.startAt?.toMillis?.() || 0) - (a.startAt?.toMillis?.() || 0));
                setOpenSessions(valid);
                if (valid.length === 1) {
                    setSessionId(valid[0].id);
                    setSession(valid[0]);
                } else {
                    setSessionId("");
                    setSession(null);
                }
            } catch (e) {
                console.error(e);
                setOpenSessions([]);
            } finally {
                setLoadingSessions(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!sessionId) {
            setSession(null);
            return;
        }
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

    const matches = useMemo(() => {
        const q = nimQuery.trim();
        if (!q) return [];
        return rosterArray.filter((r) => r.nim.endsWith(q)).slice(0, 8);
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
            setDone(true);
        } catch (err) {
            setMessage("Gagal menyimpan presensi. Coba lagi.");
        }
    }

    return (
        <div className="min-h-screen bg-white p-5">
            <div className="max-w-md mx-auto space-y-4">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <h1 className="text-xl font-extrabold text-sky-700">Check-in Kehadiran</h1>
                    <span className="w-16" />
                </header>

                {/* Konten */}
                {loadingSessions ? (
                    <div className="p-4 rounded-2xl border border-sky-100 bg-white shadow-sm text-sky-700">
                        Memuat data...
                    </div>
                ) : openSessions.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-sky-100 bg-white shadow-sm">
                        Saat ini tidak ada sesi presensi yang sedang <b className="text-sky-700">open</b> dan aktif waktunya.
                    </div>
                ) : done ? (
                    <div className="p-4 rounded-2xl border border-sky-100 bg-white shadow-sm text-center">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-sky-600 text-white grid place-items-center text-3xl shadow">
                            ✓
                        </div>
                        <h2 className="text-lg font-semibold mt-2 text-sky-700">Berhasil Presensi</h2>
                        <div className="text-sm text-gray-700 mt-1">
                            Sesi presensi: <b>{session?.title}</b>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Data kehadiranmu sudah tercatat sebagai <b>hadir</b>.
                        </p>
                        <p className="text-xs text-gray-500 mt-3">
                            Masyaallah, pekan depan jangan lupa hadir lagi yaa. Semangat!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Pilih sesi */}
                        {openSessions.length > 1 && (
                            <div className="p-3 rounded-2xl border border-sky-100 bg-white shadow-sm">
                                <label className="text-sm font-medium text-gray-800">Pilih Sesi</label>
                                <select
                                    className="mt-1 border rounded-xl w-full p-2 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-600"
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
                                    Menampilkan sesi berstatus <b className="text-sky-700">open</b> dan masih dalam rentang waktu.
                                </p>
                            </div>
                        )}

                        {/* Info sesi */}
                        {session && (
                            <div className="p-3 rounded-2xl border border-sky-100 bg-white shadow-sm flex items-center justify-between">
                                <div className="text-gray-700">
                                    <div className="font-semibold">{session.title}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        Waktu: <b>{fmtHM(session.startAt.toDate())}–{fmtHM(session.endAt.toDate())}</b>
                                    </div>
                                </div>
                                <span className="text-[11px] px-2 py-1 rounded-full bg-sky-600 text-white">Open</span>
                            </div>
                        )}

                        {/* Form NIM */}
                        <form onSubmit={handleSubmit} className="grid gap-3 p-3 rounded-2xl border border-sky-100 bg-white shadow-sm">
                            <label className="text-sm font-medium text-gray-800">
                                Masukkan 3 digit terakhir NIM
                                <input
                                    className="border rounded-xl w-full mt-1 p-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-600"
                                    placeholder="contoh: 019"
                                    value={nimQuery}
                                    onChange={(e) => {
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

                            {/* Suggestions */}
                            {nimQuery && (
                                <div className="rounded-xl border border-sky-100 overflow-hidden">
                                    {matches.length > 0 ? (
                                        <ul className="max-h-64 overflow-auto divide-y">
                                            {matches.map((m) => (
                                                <li key={m.nim}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPicked(m);
                                                            setNimQuery(m.nim.slice(-3));
                                                        }}
                                                        className="w-full flex items-center justify-between px-3 py-3 hover:bg-sky-50 transition"
                                                    >
                                                        <div>
                                                            <div className="text-sm text-left font-semibold tracking-wide text-sky-700">
                                                                {m.nim}
                                                            </div>
                                                            <div className="text-xs text-gray-600">{m.name}</div>
                                                        </div>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
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
                                <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/60 text-sm">
                                    <div>
                                        <b className="text-sky-700">NIM:</b> {picked.nim}
                                    </div>
                                    <div>
                                        <b className="text-sky-700">Nama:</b> {picked.name}
                                    </div>
                                    <div>
                                        <b className="text-sky-700">Status sekarang:</b> {picked.status}
                                    </div>
                                </div>
                            )}

                            <button
                                className="mt-1 px-4 py-3 rounded-xl text-base font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
                                disabled={!picked || !session}
                            >
                                Hadir dong
                            </button>

                            {message && <div className="text-sm text-red-600">{message}</div>}
                        </form>

                        <p className="text-xs text-gray-500 text-center">
                            *Halaman ini tidak memerlukan login. Pastikan NIM yang dipilih sudah benar.
                        </p>
                    </>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
