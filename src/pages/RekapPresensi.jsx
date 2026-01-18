// src/pages/RekapPresensi.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import Qna from "../components/qna";
import BottomNav from "../components/BottomNav";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

// Fungsi untuk mengubah letter status ke full text
function statusToText(letter) {
    switch (letter) {
        case 'H': return 'Hadir';
        case 'I': return 'Izin';
        case 'S': return 'Sakit';
        case 'A': return 'Alpha';
        default: return 'Belum Isi';
    }
}

export default function RekapPresensi() {
    const [sessions, setSessions] = useState([]); // [{id, title, attendances, ...}, ...]
    const [loading, setLoading] = useState(true);
    const [nameQuery, setNameQuery] = useState("");
    const [exporting, setExporting] = useState(false);
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
                if (!m.has(nim)) m.set(nim, { name: nm, nim });
            }
        }
        const arr = Array.from(m.values());
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
                index: i,
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

    // Fungsi untuk ekspor ke Excel
    const exportToExcel = () => {
        setExporting(true);

        try {
            // Data untuk sheet utama
            const dataForExcel = [];

            // Header row
            const headers = ['No', 'NIM', 'Nama Mahasiswa'];

            // Tambahkan kolom pertemuan
            columns.forEach(col => {
                headers.push(col.pLabel);
            });

            // Tambahkan kolom summary
            headers.push('Total Hadir');
            headers.push('Total Izin');
            headers.push('Total Sakit');
            headers.push('Total Alpha');
            headers.push('Total Belum Isi');
            headers.push('Persentase Kehadiran');

            dataForExcel.push(headers);

            // Data rows
            filteredRoster.forEach((student, index) => {
                const rowData = [
                    index + 1, // No
                    student.nim,
                    student.name
                ];

                let totalHadir = 0;
                let totalIzin = 0;
                let totalSakit = 0;
                let totalAlpha = 0;
                let totalBelumIsi = 0;

                // Data per pertemuan
                columns.forEach(col => {
                    const session = sessions.find(s => s.id === col.id);
                    const attendance = session?.attendances?.[student.nim];
                    const status = attendance?.status;
                    const letter = STATUS_TO_LETTER[status] || '';
                    const statusText = statusToText(letter);

                    rowData.push(statusText);

                    // Hitung summary
                    switch (letter) {
                        case 'H': totalHadir++; break;
                        case 'I': totalIzin++; break;
                        case 'S': totalSakit++; break;
                        case 'A': totalAlpha++; break;
                        default: totalBelumIsi++; break;
                    }
                });

                // Data summary
                const totalPertemuan = columns.length;
                const totalIsi = totalHadir + totalIzin + totalSakit + totalAlpha;
                const persentaseKehadiran = totalPertemuan > 0
                    ? ((totalHadir / totalPertemuan) * 100).toFixed(1) + '%'
                    : '0%';

                rowData.push(totalHadir);
                rowData.push(totalIzin);
                rowData.push(totalSakit);
                rowData.push(totalAlpha);
                rowData.push(totalBelumIsi);
                rowData.push(persentaseKehadiran);

                dataForExcel.push(rowData);
            });

            // Buat worksheet
            const ws = XLSX.utils.aoa_to_sheet(dataForExcel);

            // Atur lebar kolom
            const wscols = [
                { wch: 5 },  // No
                { wch: 15 }, // NIM
                { wch: 30 }, // Nama
            ];

            // Kolom pertemuan
            columns.forEach(() => {
                wscols.push({ wch: 10 });
            });

            // Kolom summary
            for (let i = 0; i < 6; i++) {
                wscols.push({ wch: 12 });
            }

            ws['!cols'] = wscols;

            // Style untuk header
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: 0, c: C });
                if (!ws[address]) continue;
                ws[address].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: "E3F2FD" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }

            // Buat workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Rekap Presensi");

            // Tambahkan sheet summary
            const summaryData = [
                ['REKAP PRESENSI - SUMMARY'],
                ['Dibuat pada', new Date().toLocaleString('id-ID')],
                ['Total Mahasiswa', filteredRoster.length],
                ['Total Pertemuan', columns.length],
                [''],
                ['STATISTIK PER STATUS'],
                ['Status', 'Jumlah', 'Persentase'],
            ];

            // Hitung total per status
            let totalStatusHadir = 0;
            let totalStatusIzin = 0;
            let totalStatusSakit = 0;
            let totalStatusAlpha = 0;
            let totalStatusBelumIsi = 0;

            filteredRoster.forEach(student => {
                columns.forEach(col => {
                    const session = sessions.find(s => s.id === col.id);
                    const attendance = session?.attendances?.[student.nim];
                    const status = attendance?.status;
                    const letter = STATUS_TO_LETTER[status] || '';

                    switch (letter) {
                        case 'H': totalStatusHadir++; break;
                        case 'I': totalStatusIzin++; break;
                        case 'S': totalStatusSakit++; break;
                        case 'A': totalStatusAlpha++; break;
                        default: totalStatusBelumIsi++; break;
                    }
                });
            });

            const totalSemuaStatus = totalStatusHadir + totalStatusIzin + totalStatusSakit + totalStatusAlpha + totalStatusBelumIsi;

            // Tambahkan data summary
            summaryData.push(['Hadir', totalStatusHadir, totalSemuaStatus > 0 ? ((totalStatusHadir / totalSemuaStatus) * 100).toFixed(1) + '%' : '0%']);
            summaryData.push(['Izin', totalStatusIzin, totalSemuaStatus > 0 ? ((totalStatusIzin / totalSemuaStatus) * 100).toFixed(1) + '%' : '0%']);
            summaryData.push(['Sakit', totalStatusSakit, totalSemuaStatus > 0 ? ((totalStatusSakit / totalSemuaStatus) * 100).toFixed(1) + '%' : '0%']);
            summaryData.push(['Alpha', totalStatusAlpha, totalSemuaStatus > 0 ? ((totalStatusAlpha / totalSemuaStatus) * 100).toFixed(1) + '%' : '0%']);
            summaryData.push(['Belum Isi', totalStatusBelumIsi, totalSemuaStatus > 0 ? ((totalStatusBelumIsi / totalSemuaStatus) * 100).toFixed(1) + '%' : '0%']);
            summaryData.push(['TOTAL', totalSemuaStatus, '100%']);

            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

            // Merge cell untuk judul
            wsSummary['!merges'] = [
                XLSX.utils.decode_range("A1:D1"),
                XLSX.utils.decode_range("A6:C6")
            ];

            // Style untuk sheet summary
            wsSummary['A1'].s = {
                font: { bold: true, sz: 16 },
                alignment: { horizontal: "center" }
            };

            wsSummary['A6'].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "FFF3E0" } }
            };

            XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

            // Generate file
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });

            // Nama file dengan timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            const filename = `rekap-presensi-${timestamp}.xlsx`;

            saveAs(blob, filename);

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Gagal mengekspor data. Silakan coba lagi.');
        } finally {
            setExporting(false);
        }
    };

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
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportToExcel}
                            disabled={exporting || sessions.length === 0 || filteredRoster.length === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${exporting || sessions.length === 0 || filteredRoster.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                                }`}
                        >
                            {exporting ? (
                                <>
                                    <i className="ri-loader-4-line animate-spin"></i>
                                    Mengekspor...
                                </>
                            ) : (
                                <>
                                    <i className="ri-file-excel-2-line"></i>
                                    Ekspor Excel
                                </>
                            )}
                        </button>
                        <Qna />
                    </div>
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

                {/* Legend dan Info Ekspor */}
                <div className="flex flex-wrap justify-between items-center gap-4">
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

                    <div className="text-xs text-gray-500">
                        {sessions.length > 0 && (
                            <span className="text-green-600">
                                <i className="ri-information-line mr-1"></i>
                                Data siap diekspor ({columns.length} pertemuan)
                            </span>
                        )}
                    </div>
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