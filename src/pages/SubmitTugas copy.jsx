// src/pages/InputTugas.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    collection, doc, getDocs, query, updateDoc, where, serverTimestamp
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import ROSTER from "../data/roster";
import BottomNav from "../components/BottomNav";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function fmtDate(d) {
    if (!d) return "-";
    if (d?.toDate) return d.toDate().toLocaleDateString("id-ID");
    if (typeof d === "string") return d;
    return String(d);
}
function dateToMillis(d) {
    if (!d) return 0;
    if (d?.toMillis) return d.toMillis();
    if (typeof d === "string") return new Date(d).getTime() || 0;
    return 0;
}

export default function InputTugas() {
    const [openSessions, setOpenSessions] = useState([]);
    const [sessionId, setSessionId] = useState("");
    const [session, setSession] = useState(null);

    const [nimQuery, setNimQuery] = useState("");
    const [picked, setPicked] = useState(null);
    const [showSuggest, setShowSuggest] = useState(false);

    const [activeTab, setActiveTab] = useState("link");
    const [linkValue, setLinkValue] = useState("");
    const [file, setFile] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [done, setDone] = useState(false);

    // ⏳ Loading state untuk sesi (agar BottomNav tidak ikut ter-block)
    const [loadingSessions, setLoadingSessions] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoadingSessions(true);
                const qOpen = query(collection(db, "tugas"), where("status", "==", "open"));
                const snap = await getDocs(qOpen);
                const arr = [];
                snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
                arr.sort((a, b) => dateToMillis(b.date) - dateToMillis(a.date));
                setOpenSessions(arr);
                if (arr.length >= 1) { setSessionId(arr[0].id); setSession(arr[0]); }
                else { setSessionId(""); setSession(null); }
            } catch (e) {
                console.error(e);
                setMessage("Gagal memuat sesi tugas.");
            } finally {
                setLoadingSessions(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!sessionId) { setSession(null); return; }
        const s = openSessions.find((x) => x.id === sessionId);
        setSession(s || null);
        setNimQuery(""); setPicked(null); setShowSuggest(false);
        setActiveTab("link"); setLinkValue(""); setFile(null);
        setMessage(""); setDone(false);
    }, [sessionId, openSessions]);

    const rosterArray = useMemo(
        () => ROSTER.map(([nim, name]) => ({ nim, name })),
        []
    );

    const matches = useMemo(() => {
        const q = nimQuery.trim();
        if (!q) return [];
        return rosterArray.filter((r) => r.nim.endsWith(q)).slice(0, 8);
    }, [nimQuery, rosterArray]);

    async function uploadToCloudinary(file) {
        if (!cloudName || !uploadPreset) {
            throw new Error("Cloudinary env belum diset.");
        }
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        const res = await fetch(url, { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok || !data?.secure_url) throw new Error("Upload gagal.");
        return data.secure_url;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        if (!session) return setMessage("Pilih sesi tugas terlebih dahulu.");
        if (!picked?.nim) return setMessage("Pilih NIM dulu.");

        let repoLink = null, imageUrl = null, method = null;
        try {
            if (activeTab === "link") {
                if (!linkValue) return setMessage("Isi link repository.");
                repoLink = linkValue.trim(); method = "link";
            } else {
                if (!file) return setMessage("Pilih file gambar.");
                setUploading(true);
                imageUrl = await uploadToCloudinary(file); method = "file";
            }

            const path = `submissions.${picked.nim}`;
            await updateDoc(doc(db, "tugas", session.id), {
                [`${path}.name`]: picked.name,
                [`${path}.link`]: repoLink,
                [`${path}.imageUrl`]: imageUrl,
                [`${path}.submittedAt`]: serverTimestamp(),
                [`${path}.method`]: method,
            });
            setDone(true);
        } catch (err) {
            console.error(err);
            setMessage("Gagal submit, coba lagi.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="min-h-screen bg-white p-5">
            <div className="w-full max-w-md mx-auto space-y-4">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <h1 className="text-xl font-extrabold text-sky-700">Submit Tugas</h1>
                    <span className="w-16" />
                </header>

                {/* ====== KONTEN DENGAN LOADING ====== */}
                {loadingSessions ? (
                    <div className="p-4 rounded-2xl border border-sky-100 bg-white text-sky-700">
                        Memuat data...
                    </div>
                ) : done ? (
                    <div className="p-4 rounded-2xl border border-sky-100 bg-white text-center space-y-2">
                        <div className="mx-auto w-16 h-16 rounded-full bg-sky-600 text-white grid place-items-center text-3xl">✓</div>
                        <div className="font-semibold text-sky-700">Berhasil dikirim</div>
                        <div className="text-sm text-gray-600">{picked?.nim} — {picked?.name}</div>
                    </div>
                ) : openSessions.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-sky-100 bg-white">
                        Saat ini tidak ada sesi tugas yang <b className="text-sky-700">open</b>.
                    </div>
                ) : (
                    <>
                        {/* Pilih sesi */}
                        {openSessions.length > 1 && (
                            <div className="p-3 rounded-2xl border border-sky-100 bg-white">
                                <label className="text-sm font-medium text-gray-800">Pilih Sesi Tugas</label>
                                <select
                                    className="mt-1 border rounded-xl w-full p-2 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-600"
                                    value={sessionId}
                                    onChange={(e) => setSessionId(e.target.value)}
                                >
                                    {openSessions.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.title} — {fmtDate(s.date)}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Menampilkan sesi berstatus <b className="text-sky-700">open</b>.
                                </p>
                            </div>
                        )}

                        {/* Info sesi */}
                        {session && (
                            <div className="p-3 rounded-2xl border border-sky-100 bg-white">
                                <div className="font-semibold text-gray-800">{session.title}</div>
                                <div className="text-xs text-gray-500">Deadline: {fmtDate(session.date)} pukul 23:59</div>
                            </div>
                        )}

                        {/* Cari NIM */}
                        <div className="p-3 rounded-2xl border border-sky-100 bg-white">
                            <label className="text-sm font-medium text-gray-800">
                                Masukkan 3 digit terakhir NIM
                                <input
                                    className="border rounded-xl w-full mt-1 p-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-600"
                                    placeholder="contoh: 123"
                                    value={nimQuery}
                                    onChange={(e) => {
                                        const onlyDigits = e.target.value.replace(/\D/g, "");
                                        setNimQuery(onlyDigits.slice(0, 3));
                                        setPicked(null);
                                        setMessage("");
                                        setShowSuggest(true);
                                    }}
                                    onFocus={() => setShowSuggest(true)}
                                    inputMode="numeric"
                                    maxLength={3}
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                            </label>

                            {/* Suggestions */}
                            {showSuggest && nimQuery && (
                                <div className="mt-2 rounded-xl border border-sky-100 overflow-hidden">
                                    {matches.length > 0 ? (
                                        <ul className="max-h-64 overflow-auto divide-y">
                                            {matches.map((m) => (
                                                <li key={m.nim}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPicked(m);
                                                            setNimQuery(m.nim.slice(-3)); // isi input dg 3 digit
                                                            setShowSuggest(false);        // tutup saran
                                                        }}
                                                        className="w-full flex items-center justify-between px-3 py-3 hover:bg-sky-50 transition"
                                                    >
                                                        <div>
                                                            <div className="text-sm text-left font-semibold text-sky-700">{m.nim}</div>
                                                            <div className="text-xs text-gray-600">{m.name}</div>
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-3 py-3 text-sm text-gray-500">NIM tidak ditemukan.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Tabs + Form submit */}
                        {picked && session && (
                            <form onSubmit={handleSubmit} className="p-3 rounded-2xl border border-sky-100 bg-white space-y-3">
                                <div className="text-sm p-2 rounded border border-sky-100 bg-sky-50/60">
                                    <div><b className="text-sky-700">NIM:</b> {picked.nim}</div>
                                    <div><b className="text-sky-700">Nama:</b> {picked.name}</div>
                                </div>

                                <div className="flex gap-2 text-sm">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("link")}
                                        className={`px-3 py-1 rounded ${activeTab === "link" ? "bg-sky-600 text-white" : "bg-gray-100"}`}
                                    >
                                        Link Repo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("file")}
                                        className={`px-3 py-1 rounded ${activeTab === "file" ? "bg-sky-600 text-white" : "bg-gray-100"}`}
                                    >
                                        Upload Gambar
                                    </button>
                                </div>

                                {activeTab === "link" ? (
                                    <div>
                                        <label className="text-sm text-gray-800">Link repo/gdrive</label>
                                        <input
                                            type="url"
                                            placeholder="https://github.com/username/repo"
                                            className="border rounded w-full mt-1 p-2 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-600"
                                            value={linkValue}
                                            onChange={(e) => setLinkValue(e.target.value)}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-sm text-gray-800">File gambar (jpg/png)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="mt-1"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            required
                                        />
                                        {file && (
                                            <div className="mt-2 text-xs text-gray-600">
                                                File: <b>{file.name}</b> ({Math.round(file.size / 1024)} KB)
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-base font-semibold disabled:opacity-50 w-full"
                                    disabled={uploading}
                                >
                                    {uploading ? "Mengunggah..." : "Kirim Tugas"}
                                </button>

                                {message && <div className="text-sm text-red-600">{message}</div>}
                            </form>
                        )}

                        <p className="text-xs text-gray-500 text-center">
                            *Pastikan NIM kamu benar. Jangan sampai nim orang lain yang kamu gunakan wkwk.
                        </p>
                    </>
                )}
            </div>

            {/* Bottom nav SELALU tampil, tidak ikut loading */}
            <BottomNav />
        </div>
    );
}
