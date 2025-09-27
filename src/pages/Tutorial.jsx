// src/pages/Tutorial.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";

/** Struktur data tutorial per pertemuan.
 * Tambah pertemuan baru tinggal push object di array ini.
 */
const MEETINGS = [
    {
        id: "p1",
        title: "Praktikum 01 — Pengantar",
        color: "bg-sky-600",
        videos: [
            { title: "Video 1 [Android] — Buat akun GitHub", href: "https://drive.google.com/file/d/1caq8CZsSyz4xcimOfoHalAGbqPM_qds3/view?usp=drive_link" },
            { title: "Video 2 [Android] — Buat repository", href: "https://drive.google.com/file/d/1PPHOH0RbwfeNPwo7weMQpwIn7A610TZM/view?usp=drive_link" },
            { title: "Video 3 [Android] — Setup text editor", href: "https://drive.google.com/file/d/1D0LwpX07fp9GHhicyxSqMJZXkyNsxAtd/view?usp=drive_link" },
            { title: "Video 4 [Android] — Upload latihan ke repo", href: "https://drive.google.com/file/d/1E2RslRgO4a7ZocEWe1_Ys2vlunMbmwQK/view?usp=drive_link" },
            { title: "Video 5 [Android] — Cara upload tugas 01", href: "https://drive.google.com/file/d/1hYsvXrZxwrLqBSEcfblZkRH3-ADQ3TGB/view?usp=drive_link" },
        ],
    },
    // Placeholder pertemuan berikutnya — tinggal ganti status & isi videos kalau siap
    { id: "p2", title: "Praktikum 02 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p3", title: "Praktikum 03 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p4", title: "Praktikum 04 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p5", title: "Praktikum 05 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p6", title: "Praktikum 06 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p7", title: "Praktikum 07 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p8", title: "Praktikum 08 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p9", title: "Praktikum 09 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p10", title: "Praktikum 10 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p11", title: "Praktikum 11 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p12", title: "Praktikum 12 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p13", title: "Praktikum 13 — Coming soon", color: "bg-sky-500", videos: [] },
    { id: "p14", title: "Praktikum 14 — Coming soon", color: "bg-sky-500", videos: [] },
];

export default function Tutorial() {
    const [open, setOpen] = useState(() => {
        // default: buka pertemuan pertama
        const init = {};
        MEETINGS.forEach((m) => (init[m.id] = false));
        return init;
    });

    const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="min-h-screen bg-white pb-[70px]">
            {/* Header */}
            <div className="border-b bg-gradient-to-r from-sky-50 to-white">
                <div className="max-w-3xl mx-auto px-5 py-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-xs font-semibold">
                        <i className="ri-folder-video-line" />
                        Tutorial Tugas Praktikum
                    </div>
                    <h1 className="mt-2 text-2xl font-extrabold text-sky-700">Video Panduan</h1>
                    <p className="text-sm text-gray-600">
                        Kumpulan video tiap pertemuan. Gunakan sebagai panduan sebelum mengerjakan tugas.
                    </p>
                </div>
            </div>

            {/* List Accordion */}
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
                {MEETINGS.map((m) => (
                    <section key={m.id} className="rounded-xl border border-sky-100 bg-white shadow-sm">
                        <button
                            type="button"
                            onClick={() => toggle(m.id)}
                            className="w-full flex items-center justify-between px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`size-10 grid place-items-center rounded-lg text-white ${m.color}`}>
                                    <i className="ri-folder-video-fill" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">{m.title}</div>
                                    <div className="text-xs text-gray-500">
                                        {m.videos.length > 0 ? `${m.videos.length} video` : "Belum ada video"}
                                    </div>
                                </div>
                            </div>
                            <i
                                className={`ri-arrow-right-s-line text-xl text-gray-500 transition-transform ${open[m.id] ? "rotate-90" : ""
                                    }`}
                            />
                        </button>

                        {open[m.id] && (
                            <div className="px-2 pb-3">
                                {m.videos.length > 0 ? (
                                    <ul className="space-y-1">
                                        {m.videos.map((v, i) => (
                                            <li key={i}>
                                                <DropItem href={v.href}>{v.title}</DropItem>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="mx-2 my-2 rounded-lg border bg-sky-50 text-sky-700 text-sm px-3 py-2">
                                        Konten sedang disiapkan. Stay tuned! ✨
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                ))}

                {/* Quick help */}
                <div className="text-xs text-gray-500 pt-2">
                    Tip: butuh panduan cepat? Cek juga menu <Link to="/tugas" className="text-sky-600 underline">Submit Tugas</Link>.
                </div>
            </div>

            <BottomNav />
        </div>
    );
}

function DropItem({ href, children, target }) {
    const isInternal = href?.startsWith("/");
    if (isInternal) {
        return (
            <Link
                to={href}
                className="block px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-gray-100 transition"
            >
                {children}
            </Link>
        );
    }
    return (
        <a
            href={href}
            target={target || "_blank"}
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-gray-100 transition"
        >
            <span className="truncate">{children}</span>
            <i className="ri-external-link-line text-gray-400" />
        </a>
    );
}
