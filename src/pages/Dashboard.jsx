// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// ====== ROSTER (NIM -> NAMA) ======
const ROSTER = [
    ["110121112", "MUHAMMAD SYAFIQ RIZQ JIHAD"],
    ["110122318", "MUHAMMAD AKMAL"],
    ["110123021", "FAHMI HIBATULLAH"],
    ["110125003", "AIMAN AL MAJIID"],
    ["110125006", "GALIH SURYAHADI"],
    ["110125007", "MUHAMMAD ZIDNI FADHILAH"],
    ["110125008", "NINDYA AISYAH AINI"],
    ["110125009", "WARDAH HAMIDAH"],
    ["110125016", "AFIPAH NABILA"],
    ["110125019", "ANNISA NUR ROHMA"],
    ["110125020", "AHMAD FATHI AHLUL RAYAN"],
    ["110125024", "SAMUEL GUS SETYA PUTRA"],
    ["110125030", "AUDYA CANTIKA PURNOMO"],
    ["110125033", "MUHAMMAD HILMI"],
    ["110125034", "RAHEL MARHAENI"],
    ["110125035", "NUR ALYA NABILA"],
    ["110125036", "JUMRATUN"],
    ["110125037", "AFIFAH AFRA AZHARI SIREGAR"],
    ["110125040", "MUHAMMAD FAREL ZAGHLUL ARIFLI"],
    ["110125041", "RISQI EKA SAPUTRA"],
    ["110125042", "MUHAMMAD IBRAHIM"],
    ["110125044", "NAUFAL ZUHDI ROBBANI"],
    ["110125045", "NAYLA IBNATI QONITHA"],
    ["110125046", "ZALITA KHANSA ADILLA"],
    ["110125048", "HELMI WIRATA"],
    ["110125050", "AZRA PRAMADANY HASIBUAN"],
    ["110125051", "DUDE ERLANGGA WIDADI"],
    ["110125052", "MUHAMMAD RAIHAN MAULANA"],
    ["110125053", "NOFFAL ANGGI NUGROHO"],
    ["110125056", "ZIDAN NAUFAL AZIZ"],
    ["110125062", "MUFARID ADNAN"],
    ["110125063", "SITI AIDA RAHAYU"],
    ["110125064", "SELVIYA NURHUDA"],
    ["110125066", "NAILAH BILQIS TSABITA"],
    ["110125067", "SYIFA FAUZIA NURFAHIRA"],
    ["110125068", "NADIA AJENG SALSABILA SAFFA"],
    ["110125070", "UTARI DWI ARIYANTI"],
    ["110125073", "VIKA REVA NAVISA"],
    ["110125074", "ASKIRI SAIPUL ALAM"],
    ["110125081", "SAYYIDATUNNAJAH PERMANA"],
    ["110125082", "FATA RAMADHAN ILLIYYIIN"],
    ["110125084", "AWALINA RIZKI RAMADHANTI"],
    ["110125086", "NADINE DESVITA MAHARANI"],
    ["110125087", "FARHAN AKBAR"],
    ["110125089", "M RAFLI NAUFAL RAMADHAN"],
    ["110125090", "RIFALDI HIDAYAT"],
    ["110125092", "REVANA PUTRI CAHYA RANI"],
    ["110125094", "IZZATI NURUL RIADHI"],
    ["110125096", "NOOR IKHLAS ZAMANY"],
    ["110125097", "IRFAN MARDIANSYAH"],
    ["110125099", "ZHALSA CHUSNUL CHOTIMAH"],
    ["110125100", "NAZKA KHAULAH SYAHIDAH"],
    ["110125102", "HAFIZHA QOLBIYA SALIMA"],
    ["110125103", "FAKHITAH AZIZAH AZZAHRA"],
    ["110125104", "YULIANA DWISITI AZIZAH"],
    ["110125105", "ANGEL CINTA VIRGINNIA"],
    ["110125107", "AYU DIA ISNANI ARUN NISA"],
    ["110125109", "ZAULA ASMA SHOLIHAH"],
    ["110125110", "ANNIDA KAMILATUNNUHA AMALIA"],
    ["110125111", "OKTAVIANA WULANDARI"],
    ["110125114", "RANGGA EL RIEZAL BAHRES"],
    ["110125117", "AHMAD FARIS ABDILLAH"],
    ["110125118", "FAHRIZA MAKKIYAH AKBAR"],
    ["110125121", "ALVINA TRINURSALINDA"],
    ["110125122", "NURSYAMSIAH NAWAWI"],
    ["110125124", "RANGGA IBNU HAFIDZ"],
    ["110125127", "ZULFAHAN UMILLAH"],
    ["110125128", "AKMAL IKRAM KHAIRULLAH"],
    ["110125129", "TIARA ERSYA AULIA"],
    ["110125132", "LUQMAN NURHAKIM"],
    ["110125133", "HAYA MUTHIA ADIEN"],
    ["110125136", "AHMAD HANIYA HIBATULLAH"],
    ["110125138", "MUHAMMAD SYAMIL FATURRAHMAN"],
    ["110125139", "MUHAMMAD FAWWAZ ROBBANI"],
    ["110125142", "MAHMUDDIN"],
    ["110125143", "PUTRI RAMADHANI SILITONGA"],
    ["110125146", "SILVI RAMADANI TANJUNG"],
    ["110125147", "MAULAD ARDAFFA PUTRA"],
    ["110125150", "RICARD DIYAMOND HSB"],
    ["110125153", "RAHMAD RAMADHAN SIREGAR"]
];

// ====== STATUS & WARNA BADGE ======
const STATUSES = ["belum isi", "hadir", "izin", "sakit", "alpha"];
const STATUS_BADGE = {
    "belum isi": "bg-gray-200 text-gray-800",
    "hadir": "bg-green-600 text-white",
    "izin": "bg-amber-500 text-white",
    "sakit": "bg-blue-600 text-white",
    "alpha": "bg-red-600 text-white",
};

// Build attendances map default (status: "belum isi")
function buildDefaultAttendances() {
    const map = {};
    for (const [nim, name] of ROSTER) {
        map[nim] = {
            name,
            status: "belum isi",
            checkedInAt: null,
            method: null,
        };
    }
    return map;
}

function computeStats(attendances = {}) {
    const counts = { total: 0, "belum isi": 0, hadir: 0, izin: 0, sakit: 0, alpha: 0, lainnya: 0 };
    for (const row of Object.values(attendances)) {
        counts.total += 1;
        const s = row?.status || "belum isi";
        if (s in counts) counts[s] += 1;
        else counts.lainnya += 1;
    }
    return counts;
}

function shallowEqual(a = {}, b = {}) {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (a[k] !== b[k]) return false;
    return true;
}

// Helpers datetime-local
function toInputValue(ts) {
    if (!ts?.toDate) return "";
    const d = ts.toDate();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function toTimestamp(str) {
    return Timestamp.fromDate(new Date(str));
}

export default function Dashboard() {
    // daftar sesi
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    // sesi aktif
    const [activeId, setActiveId] = useState("");
    const [active, setActive] = useState(null); // snapshot dokumen aktif

    // form create (dipakai di modal)
    const [title, setTitle] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [status, setStatus] = useState("draft");

    // modal states
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    // form edit (dipakai di modal edit)
    const [editTitle, setEditTitle] = useState("");
    const [editStart, setEditStart] = useState("");
    const [editEnd, setEditEnd] = useState("");
    const [editStatus, setEditStatus] = useState("draft");

    // listen koleksi presensi
    useEffect(() => {
        const q = query(collection(db, "presensi"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setSessions(arr);
            setLoading(false);
            if (!activeId && arr.length) setActiveId(arr[0].id);
        });
        return unsub;
    }, []);

    // listen dokumen aktif
    useEffect(() => {
        if (!activeId) return;
        const unsub = onSnapshot(doc(db, "presensi", activeId), (d) => {
            if (d.exists()) setActive({ id: d.id, ...d.data() });
            else setActive(null);
        });
        return unsub;
    }, [activeId]);

    // stats realtime (dan simpan ke dokumen)
    const stats = useMemo(() => computeStats(active?.attendances), [active?.attendances]);
    useEffect(() => {
        if (!active) return;
        const next = {
            total: stats.total,
            "belum isi": stats["belum isi"],
            hadir: stats.hadir,
            izin: stats.izin,
            sakit: stats.sakit,
            alpha: stats.alpha,
            lainnya: stats.lainnya,
        };
        const latest = active.stats || {};
        if (!shallowEqual(latest, next)) {
            updateDoc(doc(db, "presensi", active.id), {
                stats: next,
                statsUpdatedAt: serverTimestamp(),
            }).catch(() => { });
        }
    }, [active?.id, stats.total, stats["belum isi"], stats.hadir, stats.izin, stats.sakit, stats.alpha, stats.lainnya]);

    // actions (LOGIKA TETAP SAMA)
    async function createSession(e) {
        e.preventDefault();
        if (!title || !startAt || !endAt) return alert("Lengkapi judul & waktu.");
        const startTs = Timestamp.fromDate(new Date(startAt));
        const endTs = Timestamp.fromDate(new Date(endAt));
        const data = {
            title,
            startAt: startTs,
            endAt: endTs,
            status,
            createdAt: serverTimestamp(),
            attendances: buildDefaultAttendances(),
            stats: null,
            statsUpdatedAt: null,
        };
        const ref = await addDoc(collection(db, "presensi"), data);
        setTitle(""); setStartAt(""); setEndAt(""); setStatus("draft");
        setShowCreate(false);
        setActiveId(ref.id);
    }

    async function updateStatus(newStatus) {
        if (!active) return;
        await updateDoc(doc(db, "presensi", active.id), { status: newStatus });
    }

    async function setManual(nim, newStatus) {
        if (!active) return;
        const path = `attendances.${nim}`;
        const payload = {
            [`${path}.status`]: newStatus,
            [`${path}.checkedInAt`]: newStatus === "hadir" ? serverTimestamp() : null,
            [`${path}.method`]: "manual",
        };
        await updateDoc(doc(db, "presensi", active.id), payload);
    }

    async function submitEdit(e) {
        e.preventDefault();
        if (!active) return;
        if (!editTitle || !editStart || !editEnd) return alert("Lengkapi judul & waktu.");
        await updateDoc(doc(db, "presensi", active.id), {
            title: editTitle,
            startAt: toTimestamp(editStart),
            endAt: toTimestamp(editEnd),
            status: editStatus,
        });
        setShowEdit(false);
    }

    function openEditModal() {
        if (!active) return;
        setEditTitle(active.title || "");
        setEditStart(toInputValue(active.startAt));
        setEditEnd(toInputValue(active.endAt));
        setEditStatus(active.status || "draft");
        setShowEdit(true);
    }

    const attendList = useMemo(() => {
        if (!active?.attendances) return [];
        return Object.entries(active.attendances)
            .map(([nim, a]) => ({ nim, ...a }))
            .sort((a, b) => a.nim.localeCompare(b.nim));
    }, [active?.attendances]);

    const checkinUrl = `${window.location.origin}/checkin`;

    return (
        <div className="p-4 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Presensi</h1>
                    <p className="text-sm text-gray-500">Pantau kehadiran mahasiswa secara realtime</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white shadow hover:opacity-90"
                >
                    <span className="text-lg">＋</span> Add Session
                </button>
            </div>

            {/* Pilih sesi */}
            <div className="p-4 border rounded-xl bg-white/60 backdrop-blur">
                <h2 className="font-semibold mb-2">Pilih Sesi</h2>
                {loading ? (
                    <div>Loading…</div>
                ) : sessions.length === 0 ? (
                    <div>Belum ada sesi.</div>
                ) : (
                    <select
                        className="border p-2 rounded w-full"
                        value={activeId}
                        onChange={(e) => setActiveId(e.target.value)}
                    >
                        {sessions.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.title} — {s.status}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Detail Sesi Aktif */}
            {active && (
                <div className="p-4 border rounded-xl bg-white/60 backdrop-blur space-y-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold">{active.title}</h3>
                            <p className="text-sm text-gray-600">
                                {active.startAt?.toDate?.().toLocaleString()} —{" "}
                                {active.endAt?.toDate?.().toLocaleString()}
                            </p>
                            <p className="text-sm">
                                Status sesi:{" "}
                                <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-900 text-white">
                                    {active.status}
                                </span>
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => updateStatus("draft")} className="px-3 py-2 border rounded-lg hover:bg-gray-50">
                                Draft
                            </button>
                            <button onClick={() => updateStatus("open")} className="px-3 py-2 border rounded-lg bg-green-600 text-white hover:opacity-90">
                                Open
                            </button>
                            <button onClick={() => updateStatus("closed")} className="px-3 py-2 border rounded-lg bg-red-600 text-white hover:opacity-90">
                                Closed
                            </button>
                            <button onClick={openEditModal} className="px-3 py-2 border rounded-lg hover:bg-gray-50">
                                Edit
                            </button>
                        </div>
                    </div>

                    {/* Kartu: Public Check-in URL + Stats */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                            <div className="text-sm font-semibold mb-1">Public Check-in URL</div>
                            <div className="text-xs break-all">{checkinUrl}</div>
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={async () => { await navigator.clipboard.writeText(checkinUrl); alert("Link disalin ✔"); }}
                                    className="px-2 py-1 border rounded text-sm hover:bg-gray-50"
                                >
                                    Copy link
                                </button>
                                <button
                                    onClick={() => window.open(checkinUrl, "_blank", "noopener,noreferrer")}
                                    className="px-2 py-1 border rounded text-sm hover:bg-gray-50"
                                >
                                    Buka
                                </button>
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                                *Mahasiswa bisa check-in di link ini saat status <b>open</b> & waktu masih dalam rentang.
                            </div>
                        </div>

                        {/* Stats Realtime */}
                        <div className="p-3 border rounded-lg">
                            <h4 className="font-semibold mb-2">Statistik Realtime</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                <StatChip label="Belum isi" value={stats["belum isi"]} className={STATUS_BADGE["belum isi"]} />
                                <StatChip label="Hadir" value={stats.hadir} className={STATUS_BADGE.hadir} />
                                <StatChip label="Izin" value={stats.izin} className={STATUS_BADGE.izin} />
                                <StatChip label="Sakit" value={stats.sakit} className={STATUS_BADGE.sakit} />
                                <StatChip label="Alpha" value={stats.alpha} className={STATUS_BADGE.alpha} />
                                <StatChip label="Total" value={stats.total} className="bg-black text-white" />
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                                *Stat juga tersimpan di field <code>stats</code>.
                            </div>
                        </div>
                    </div>

                    {/* Tabel Kehadiran + Edit Manual */}
                    <div className="overflow-auto">
                        <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border px-2 py-2 text-left">NIM</th>
                                    <th className="border px-2 py-2 text-left">Nama</th>
                                    <th className="border px-2 py-2 text-left">Status</th>
                                    <th className="border px-2 py-2 text-left">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendList.map((a) => (
                                    <tr key={a.nim} className="hover:bg-gray-50">
                                        <td className="border px-2 py-2">{a.nim}</td>
                                        <td className="border px-2 py-2">{a.name}</td>
                                        <td className="border px-2 py-2">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[a.status || "belum isi"]}`}>
                                                {a.status || "belum isi"}
                                            </span>
                                        </td>
                                        <td className="border px-2 py-2">
                                            <div className="flex flex-wrap gap-2">
                                                {STATUSES.map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setManual(a.nim, s)}
                                                        className={`px-2 py-1 border rounded ${STATUS_BADGE[s]} ${s === "belum isi" ? "border-gray-300" : ""} hover:opacity-90`}
                                                        title={`Set ${s}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {attendList.length === 0 && (
                                    <tr><td colSpan={4} className="text-center p-4">Belum ada data.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ===== Modal: Create Session ===== */}
            {showCreate && (
                <Modal onClose={() => setShowCreate(false)} title="Add Session">
                    <form onSubmit={createSession} className="grid gap-3">
                        <input
                            className="border p-2 rounded"
                            placeholder="Judul (mis. Pertemuan 5 – PW1)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="text-sm">
                                Mulai
                                <input
                                    type="datetime-local"
                                    className="border p-2 rounded w-full"
                                    value={startAt}
                                    onChange={(e) => setStartAt(e.target.value)}
                                />
                            </label>
                            <label className="text-sm">
                                Selesai
                                <input
                                    type="datetime-local"
                                    className="border p-2 rounded w-full"
                                    value={endAt}
                                    onChange={(e) => setEndAt(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="flex gap-3">
                            <select
                                className="border p-2 rounded"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="draft">draft</option>
                                <option value="open">open</option>
                                <option value="closed">closed</option>
                            </select>
                            <div className="flex-1" />
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded">
                                Batal
                            </button>
                            <button className="px-4 py-2 bg-black text-white rounded">
                                Simpan
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            *Roster di-seed otomatis dengan status <b>belum isi</b>.
                        </p>
                    </form>
                </Modal>
            )}

            {/* ===== Modal: Edit Session ===== */}
            {showEdit && (
                <Modal onClose={() => setShowEdit(false)} title="Edit Session">
                    <form onSubmit={submitEdit} className="grid gap-3">
                        <input
                            className="border p-2 rounded"
                            placeholder="Judul"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            autoFocus
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="text-sm">
                                Mulai
                                <input
                                    type="datetime-local"
                                    className="border p-2 rounded w-full"
                                    value={editStart}
                                    onChange={(e) => setEditStart(e.target.value)}
                                />
                            </label>
                            <label className="text-sm">
                                Selesai
                                <input
                                    type="datetime-local"
                                    className="border p-2 rounded w-full"
                                    value={editEnd}
                                    onChange={(e) => setEditEnd(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="flex gap-3">
                            <select
                                className="border p-2 rounded"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                            >
                                <option value="draft">draft</option>
                                <option value="open">open</option>
                                <option value="closed">closed</option>
                            </select>
                            <div className="flex-1" />
                            <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 border rounded">
                                Batal
                            </button>
                            <button className="px-4 py-2 bg-black text-white rounded">
                                Update
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

// ---------- Small components ----------
function StatChip({ label, value, className = "" }) {
    return (
        <div className={`rounded px-2 py-2 text-center ${className}`}>
            <div className="text-xs opacity-80">{label}</div>
            <div className="text-lg font-semibold">{value ?? 0}</div>
        </div>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-[101] w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">✕</button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}
