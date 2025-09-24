import React, { useEffect, useMemo, useState } from "react";
import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    query,
    updateDoc,
    where,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

function withinDate(task) {
    if (!task?.date) return true;
    const today = new Date();
    const deadline = task.date.toDate();
    return today <= deadline;
}

export default function InputTugas() {
    const [openTasks, setOpenTasks] = useState([]);
    const [taskId, setTaskId] = useState("");
    const [task, setTask] = useState(null);

    const [nimQuery, setNimQuery] = useState("");
    const [picked, setPicked] = useState(null);
    const [link, setLink] = useState("");
    const [message, setMessage] = useState("");
    const [done, setDone] = useState(false);

    // Fetch daftar tugas yg status=open
    useEffect(() => {
        (async () => {
            const qOpen = query(collection(db, "tugas"), where("status", "==", "open"));
            const snap = await getDocs(qOpen);
            const arr = [];
            snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
            const valid = arr.filter(withinDate);
            setOpenTasks(valid);
            if (valid.length === 1) setTaskId(valid[0].id);
        })();
    }, []);

    // 🔹 Listen dokumen tugas aktif
    useEffect(() => {
        if (!taskId) return;
        const unsub = onSnapshot(doc(db, "tugas", taskId), (d) => {
            if (d.exists()) {
                setTask({ id: d.id, ...d.data() });
            } else {
                setTask(null);
            }
        });
        return () => unsub();
    }, [taskId]);

    // Roster submissions
    const rosterArray = useMemo(() => {
        if (!task?.submissions) return [];
        return Object.entries(task.submissions).map(([nim, v]) => ({
            nim,
            name: v?.name || "UNKNOWN",
            status: v?.status || "belum",
        }));
    }, [task?.submissions]);

    // Search hanya 3 digit terakhir NIM
    const matches = useMemo(() => {
        const q = nimQuery.trim();
        if (!q) return [];
        return rosterArray.filter((r) => r.nim.endsWith(q)).slice(0, 8);
    }, [nimQuery, rosterArray]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!task) return setMessage("Belum ada tugas aktif.");
        if (!picked?.nim) return setMessage("Pilih NIM dulu.");
        if (!link) return setMessage("Masukkan link tugas.");
        const path = `submissions.${picked.nim}`;
        try {
            await updateDoc(doc(db, "tugas", task.id), {
                [`${path}.name`]: picked.name,
                [`${path}.link`]: link,
                [`${path}.status`]: "sudah",
                [`${path}.submittedAt`]: serverTimestamp(),
            });
            setDone(true);
        } catch (err) {
            setMessage("Gagal submit. Coba lagi.");
        }
    }

    if (done) {
        return (
            <div className="p-5 max-w-md mx-auto space-y-4 text-center">
                <h1 className="text-xl font-bold"><i class="ri-arrow-left-line"></i>Submit Tugas</h1>
                <div className="p-4 border rounded bg-green-50">
                    <div className="text-3xl">✅</div>
                    <p className="mt-2 font-semibold">Berhasil! Tugasmu sudah terkirim.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 max-w-md mx-auto space-y-4">
            <Link to="/">
                <h1 className="text-xl font-bold"><i class="ri-arrow-left-line"></i> Submit Tugas</h1>
            </Link>

            {openTasks.length > 1 && (
                <div className="p-3 border rounded">
                    <label className="text-sm font-medium">Pilih Tugas</label>
                    <select
                        className="border p-2 rounded w-full mt-1"
                        value={taskId}
                        onChange={(e) => setTaskId(e.target.value)}
                    >
                        <option value="">— pilih —</option>
                        {openTasks.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {task && (
                <div className="p-3 border rounded bg-gray-50">
                    <div className="text-sm font-semibold">{task.title}</div>
                    <div className="text-xs text-gray-600">
                        Deadline: {task.date?.toDate?.().toLocaleDateString("id-ID")}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-3 p-3 border rounded">
                <label className="text-sm">
                    Masukkan 3 digit terakhir NIM
                    <input
                        className="border p-2 rounded w-full mt-1"
                        placeholder="misal: 021"
                        value={nimQuery}
                        onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/\D/g, "");
                            setNimQuery(onlyDigits.slice(0, 3));
                            setPicked(null);
                            setMessage("");
                        }}
                        maxLength={3}
                        inputMode="numeric"
                    />
                </label>

                {nimQuery && matches.length > 0 && (
                    <div className="border rounded divide-y">
                        {matches.map((m) => (
                            <button
                                type="button"
                                key={m.nim}
                                onClick={() => { setPicked(m); setNimQuery(m.nim.slice(-3)); }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                            >
                                <div className="text-sm font-semibold">{m.nim}</div>
                                <div className="text-xs text-gray-600">{m.name}</div>
                            </button>
                        ))}
                    </div>
                )}

                {picked && (
                    <div className="p-2 border rounded bg-gray-50 text-sm">
                        <div><b>NIM:</b> {picked.nim}</div>
                        <div><b>Nama:</b> {picked.name}</div>
                        <div><b>Status:</b> {picked.status}</div>
                    </div>
                )}

                {picked && (
                    <label className="text-sm">
                        Link Tugas
                        <input
                            className="border p-2 rounded w-full mt-1"
                            placeholder="paste link di sini"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    </label>
                )}

                <button
                    className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                    disabled={!picked || !link}
                >
                    Submit
                </button>

                {message && <div className="text-sm text-red-600">{message}</div>}
            </form>
        </div>
    );
}
