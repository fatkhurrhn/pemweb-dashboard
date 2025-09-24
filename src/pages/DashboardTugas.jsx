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
import { Link } from "react-router-dom";

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

// Build default submissions
function buildDefaultSubs() {
    const map = {};
    for (const [nim, name] of ROSTER) {
        map[nim] = {
            name,
            link: null,
            submittedAt: null,
            status: "belum",
        };
    }
    return map;
}

function computeStats(subs = {}) {
    let sudah = 0,
        belum = 0;
    for (const v of Object.values(subs)) {
        if (v?.status === "sudah") sudah++;
        else belum++;
    }
    return { total: sudah + belum, sudah, belum };
}

export default function DashboardTugas() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeId, setActiveId] = useState("");
    const [active, setActive] = useState(null);

    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState("draft");

    // listen semua tugas
    useEffect(() => {
        const q = query(collection(db, "tugas"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            setTasks(arr);
            setLoading(false);
            if (!activeId && arr.length) setActiveId(arr[0].id);
        });
        return unsub;
    }, []);

    // listen tugas aktif
    useEffect(() => {
        if (!activeId) return;
        const unsub = onSnapshot(doc(db, "tugas", activeId), (d) => {
            if (d.exists()) setActive({ id: d.id, ...d.data() });
            else setActive(null);
        });
        return unsub;
    }, [activeId]);

    // create tugas
    async function createTask(e) {
        e.preventDefault();
        if (!title || !date) return alert("Lengkapi judul & tanggal.");
        const dt = Timestamp.fromDate(new Date(date));
        const data = {
            title,
            date: dt,
            status,
            createdAt: serverTimestamp(),
            submissions: buildDefaultSubs(),
        };
        const ref = await addDoc(collection(db, "tugas"), data);
        setTitle(""); setDate(""); setStatus("draft");
        setActiveId(ref.id);
    }

    async function updateStatus(newStatus) {
        if (!active) return;
        await updateDoc(doc(db, "tugas", active.id), { status: newStatus });
    }

    const subsList = useMemo(() => {
        if (!active?.submissions) return [];
        return Object.entries(active.submissions)
            .map(([nim, v]) => ({ nim, ...v }))
            .sort((a, b) => a.nim.localeCompare(b.nim));
    }, [active?.submissions]);

    const stats = useMemo(() => computeStats(active?.submissions), [active?.submissions]);

    return (
        <div className="p-4 max-w-6xl mx-auto space-y-8">
            <div>
                <Link to="/dashboard">
                    <h1 className="text-2xl font-bold"><i class="ri-arrow-left-line"></i> Dashboard Presensi</h1>
                </Link>
                <p className="text-sm text-gray-500">Pantau kehadiran mahasiswa secara realtime</p>
            </div>

            {/* Create Task */}
            <form onSubmit={createTask} className="grid gap-3 p-4 border rounded">
                <h2 className="font-semibold">Buat Tugas</h2>
                <input
                    className="border p-2 rounded"
                    placeholder="Judul tugas"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <label className="text-sm">
                    Tanggal
                    <input
                        type="date"
                        className="border p-2 rounded w-full"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </label>
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
                    <button className="px-4 py-2 bg-black text-white rounded">
                        Buat
                    </button>
                </div>
            </form>

            {/* Pilih tugas */}
            <div className="p-4 border rounded space-y-3">
                <h2 className="font-semibold">Pilih Tugas</h2>
                {loading ? (
                    <div>Loading…</div>
                ) : tasks.length === 0 ? (
                    <div>Belum ada tugas.</div>
                ) : (
                    <select
                        className="border p-2 rounded w-full"
                        value={activeId}
                        onChange={(e) => setActiveId(e.target.value)}
                    >
                        {tasks.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.title} — {s.status}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Detail Tugas */}
            {active && (
                <div className="p-4 border rounded space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold">{active.title}</h3>
                            <p className="text-sm text-gray-600">
                                Deadline: {active.date?.toDate?.().toLocaleDateString("id-ID")}
                            </p>
                            <p className="text-sm">Status: <b>{active.status}</b></p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => updateStatus("draft")} className="px-3 py-2 border rounded">
                                Draft
                            </button>
                            <button onClick={() => updateStatus("open")} className="px-3 py-2 border rounded bg-green-600 text-white">
                                Open
                            </button>
                            <button onClick={() => updateStatus("closed")} className="px-3 py-2 border rounded bg-red-600 text-white">
                                Closed
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="p-3 border rounded">
                        <h4 className="font-semibold mb-2">Statistik</h4>
                        <div className="flex gap-4 text-sm">
                            <div className="px-3 py-1 rounded bg-green-100">Sudah submit: {stats.sudah}</div>
                            <div className="px-3 py-1 rounded bg-red-100">Belum submit: {stats.belum}</div>
                            <div className="px-3 py-1 rounded bg-gray-100">Total: {stats.total}</div>
                        </div>
                    </div>

                    {/* Table submissions */}
                    <div className="overflow-auto">
                        <table className="min-w-full text-sm border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border px-2 py-1 text-left">NIM</th>
                                    <th className="border px-2 py-1 text-left">Nama</th>
                                    <th className="border px-2 py-1 text-left">Status</th>
                                    <th className="border px-2 py-1 text-left">Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subsList.map((a) => (
                                    <tr key={a.nim}>
                                        <td className="border px-2 py-1">{a.nim}</td>
                                        <td className="border px-2 py-1">{a.name}</td>
                                        <td className="border px-2 py-1">{a.status}</td>
                                        <td className="border px-2 py-1">
                                            {a.link ? (
                                                <a
                                                    href={a.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline"
                                                >
                                                    Buka
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
