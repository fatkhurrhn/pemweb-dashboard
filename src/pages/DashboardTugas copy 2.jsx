// src/pages/DashboardTugas.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    addDoc,
    collection,
    deleteField,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import ROSTER from "../data/roster";
import { Link } from "react-router-dom";

// warna badge status tugas
const STATUS_BADGE = {
    kosong: "bg-gray-200 text-gray-800",
    selesai: "bg-green-600 text-white",
};

// helper format tanggal
function fmtDate(d) {
    if (!d) return "-";
    if (d?.toDate) return d.toDate().toLocaleDateString("id-ID");
    if (typeof d === "string") return d;
    return String(d);
}

export default function DashboardTugas() {
    const [sessions, setSessions] = useState([]);
    const [activeId, setActiveId] = useState("");
    const [active, setActive] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ title: "", date: "", status: "draft" });

    const [previewUrl, setPreviewUrl] = useState(null);

    // --- BUGFIX: jaga activeId agar tidak loncat saat snapshot reorder ---
    const firstLoadDone = useRef(false);

    // listen semua sesi (urut terbaru dulu)
    useEffect(() => {
        const qy = query(collection(db, "tugas"), orderBy("date", "desc"));
        const unsub = onSnapshot(qy, (snap) => {
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setSessions(arr);

            setActiveId((prev) => {
                // kalau belum pernah set sama sekali (first load) → pakai pertama
                if (!firstLoadDone.current) {
                    firstLoadDone.current = true;
                    return prev || (arr[0]?.id || "");
                }
                // kalau sebelumnya sudah ada dan masih ada di list → pertahankan
                if (prev && arr.some((s) => s.id === prev)) return prev;
                // kalau sesi sebelumnya hilang (mis: dihapus) → fallback ke pertama
                return arr[0]?.id || "";
            });
        });
        return unsub;
    }, []);

    // listen sesi aktif
    useEffect(() => {
        if (!activeId) return;
        const unsub = onSnapshot(doc(db, "tugas", activeId), (d) => {
            if (d.exists()) setActive({ id: d.id, ...d.data() });
            else setActive(null);
        });
        return unsub;
    }, [activeId]);

    // create/edit sesi
    async function handleSave(e) {
        e.preventDefault();
        if (!form.title || !form.date) return alert("Isi semua field");

        if (editMode && active) {
            await updateDoc(doc(db, "tugas", active.id), {
                title: form.title,
                date: form.date,
                status: form.status,
            });
        } else {
            const ref = await addDoc(collection(db, "tugas"), {
                title: form.title,
                date: form.date,
                status: form.status,
                createdAt: serverTimestamp(),
                submissions: {},
            });
            // set aktif ke sesi baru yang barusan dibuat
            setActiveId(ref.id);
        }

        setForm({ title: "", date: "", status: "draft" });
        setEditMode(false);
        setShowModal(false);
    }

    async function updateStatus(newStatus) {
        if (!active) return;
        await updateDoc(doc(db, "tugas", active.id), { status: newStatus });
    }

    // ====== Aksi manual per mahasiswa ======
    async function setSelesaiManual(nim, name) {
        if (!active) return;
        const path = `submissions.${nim}`;
        await updateDoc(doc(db, "tugas", active.id), {
            [`${path}.name`]: name,
            [`${path}.link`]: null,
            [`${path}.imageUrl`]: null,
            [`${path}.submittedAt`]: serverTimestamp(),
            [`${path}.method`]: "manual",
        });
    }

    async function setKosong(nim) {
        if (!active) return;
        const path = `submissions.${nim}`;
        // hapus seluruh node submissions.NIM agar kembali "kosong"
        await updateDoc(doc(db, "tugas", active.id), {
            [path]: deleteField(),
        });
    }

    // gabungkan roster + submissions
    const submissions = useMemo(() => {
        const map = active?.submissions || {};
        return ROSTER.map(([nim, name]) => {
            const data = map[nim] || {};
            const has =
                !!data.link || !!data.imageUrl || (data.method && data.method === "manual");
            return {
                nim,
                name,
                link: data.link || null,
                imageUrl: data.imageUrl || null,
                method: data.method || null,
                status: has ? "selesai" : "kosong",
            };
        });
    }, [active?.submissions]);

    const total = submissions.length;
    const selesai = submissions.filter((s) => s.status === "selesai").length;
    const kosong = total - selesai;

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-6">
            {/* Header + Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <Link to="/dashboard">
                        <h1 className="text-2xl font-bold"><i class="ri-arrow-left-line"></i> Dashboard Tugas</h1>
                    </Link>
                    <p className="text-sm text-gray-600">Kelola sesi tugas & pantau submission mahasiswa</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setEditMode(false);
                            setForm({ title: "", date: "", status: "draft" });
                            setShowModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-black text-white shadow hover:opacity-90"
                    >
                        + Tambah Sesi
                    </button>
                </div>
            </div>

            {/* Selector Sesi + Aksi Status */}
            <div className="p-4 border rounded-2xl bg-white shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex-1 flex gap-2">
                        <select
                            className="border p-2 rounded-xl w-full"
                            value={activeId}
                            onChange={(e) => setActiveId(e.target.value)}
                        >
                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.title} — {fmtDate(s.date)}
                                </option>
                            ))}
                        </select>
                        {active && (
                            <button
                                onClick={() => {
                                    setEditMode(true);
                                    setForm({
                                        title: active.title || "",
                                        date: typeof active.date === "string" ? active.date : "",
                                        status: active.status || "draft",
                                    });
                                    setShowModal(true);
                                }}
                                className="px-3 py-2 rounded-xl bg-sky-600 text-white hover:opacity-90"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {active && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateStatus("draft")}
                                className={`px-3 py-2 rounded-full text-sm ${active.status === "draft"
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-800"
                                    }`}
                                title="Set Draft"
                            >
                                Draft
                            </button>
                            <button
                                onClick={() => updateStatus("open")}
                                className={`px-3 py-2 rounded-full text-sm ${active.status === "open"
                                    ? "bg-green-600 text-white"
                                    : "bg-green-100 text-green-800"
                                    }`}
                                title="Set Open"
                            >
                                Open
                            </button>
                            <button
                                onClick={() => updateStatus("closed")}
                                className={`px-3 py-2 rounded-full text-sm ${active.status === "closed"
                                    ? "bg-red-600 text-white"
                                    : "bg-red-100 text-red-800"
                                    }`}
                                title="Set Closed"
                            >
                                Closed
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Sesi + Rekap */}
            {active && (
                <div className="p-4 border rounded-2xl bg-white shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-semibold">{active.title}</h2>
                            <div className="text-sm text-gray-600">Deadline: {fmtDate(active.date)}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                                Total <b>{total}</b>
                            </span>
                            <span className="px-3 py-1 rounded-full bg-green-600 text-white text-sm">
                                Selesai <b>{selesai}</b>
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-400 text-white text-sm">
                                Kosong <b>{kosong}</b>
                            </span>
                            <span
                                className={`px-3 py-1 rounded-full text-sm ${active.status === "open"
                                    ? "bg-green-100 text-green-800"
                                    : active.status === "closed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                Status sesi: <b>{active.status}</b>
                            </span>
                        </div>
                    </div>

                    {/* Tabel */}
                    <div className="overflow-auto rounded-lg border">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border px-3 py-2 text-left">NIM</th>
                                    <th className="border px-3 py-2 text-left">Nama</th>
                                    <th className="border px-3 py-2 text-left">Status</th>
                                    <th className="border px-3 py-2 text-left">Link Github</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((s, idx) => (
                                    <tr key={s.nim} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                        <td className="border px-3 py-2">{s.nim}</td>
                                        <td className="border px-3 py-2">{s.name}</td>
                                        <td className="border px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                {/* Status Badge */}
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[s.status]}`}
                                                >
                                                    {s.status}
                                                </span>

                                                {/* Tombol di sisi kanan */}
                                                <div className="flex items-center gap-2 ml-auto">
                                                    <button
                                                        onClick={() => setSelesaiManual(s.nim, s.name)}
                                                        className="px-2 py-1 text-xs rounded-lg bg-emerald-500 text-white shadow hover:bg-emerald-600"
                                                        title="Tandai Selesai (manual)"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => setKosong(s.nim)}
                                                        className="px-2 py-1 text-xs rounded-lg bg-rose-500 text-white shadow hover:bg-rose-600"
                                                        title="Set Kosong"
                                                    >
                                                        x
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border px-3 py-2 space-x-2">
                                            link github mereka
                                        </td>
                                    </tr>
                                ))}
                                {submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center p-6 text-gray-500">
                                            Belum ada data submission
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-[11px] text-gray-500">
                        *Klik <b>Selesai</b> untuk menandai manual, atau <b>Kosong</b> untuk reset.
                    </p>
                </div>
            )}

            {/* modal add/edit sesi */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 grid place-items-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 shadow-lg">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg">
                                {editMode ? "Edit Sesi Tugas" : "Tambah Sesi Tugas"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-900"
                                title="Tutup"
                            >
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-3">
                            <label className="text-sm">
                                Judul Tugas
                                <input
                                    type="text"
                                    placeholder="mis. P1 - HTML Dasar"
                                    className="border rounded-lg p-2 w-full mt-1"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                />
                            </label>

                            <label className="text-sm">
                                Tanggal (deadline)
                                <input
                                    type="date"
                                    className="border rounded-lg p-2 w-full mt-1"
                                    value={form.date}
                                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                                />
                            </label>

                            <label className="text-sm">
                                Status
                                <select
                                    className="border rounded-lg p-2 w-full mt-1"
                                    value={form.status}
                                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </label>

                            <div className="flex justify-between items-center">
                                {/* tombol status sesi tetap ada di modal (seperti request-mu sebelumnya) */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Quick status:</span>
                                    <button
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, status: "draft" }))}
                                        className={`px-2 py-1 rounded-full text-xs ${form.status === "draft"
                                            ? "bg-gray-900 text-white"
                                            : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        Draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, status: "open" }))}
                                        className={`px-2 py-1 rounded-full text-xs ${form.status === "open"
                                            ? "bg-green-600 text-white"
                                            : "bg-green-100 text-green-800"
                                            }`}
                                    >
                                        Open
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, status: "closed" }))}
                                        className={`px-2 py-1 rounded-full text-xs ${form.status === "closed"
                                            ? "bg-red-600 text-white"
                                            : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        Closed
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-3 py-2 border rounded-lg"
                                    >
                                        Batal
                                    </button>
                                    <button type="submit" className="px-3 py-2 bg-black text-white rounded-lg">
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* modal preview image */}
            {previewUrl && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div className="max-w-3xl max-h-[90vh]">
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
