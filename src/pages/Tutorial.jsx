// src/pages/Tutorial.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";

const TASKS = [
    {
        id: "t1",
        code: "T1",
        title: "Introduction HTML",
        color: "bg-sky-600",
        instruction:
            "Buatlah akun github, install code editor versi mobile, dan buat satu file bernama tugas1.html yang isinya adalah stukrur html, kemudian up ke repo lalu kirimkan link repository atau ss code editornya lalu kirim!",

        videos: [
            // contoh bila sudah ada video
            { title: "[Android] - Buat akun github", href: "https://drive.google.com/file/d/1caq8CZsSyz4xcimOfoHalAGbqPM_qds3/view?usp=drive_link" },
            { title: "[Android] — Buat akun GitHub", href: "https://drive.google.com/file/d/1caq8CZsSyz4xcimOfoHalAGbqPM_qds3/view?usp=drive_link" },
            { title: "[Android] — Buat repository", href: "https://drive.google.com/file/d/1PPHOH0RbwfeNPwo7weMQpwIn7A610TZM/view?usp=drive_link" },
            { title: "[Android] — Setup text editor", href: "https://drive.google.com/file/d/1D0LwpX07fp9GHhicyxSqMJZXkyNsxAtd/view?usp=drive_link" },
            { title: "[Android] — Upload latihan ke repo", href: "https://drive.google.com/file/d/1E2RslRgO4a7ZocEWe1_Ys2vlunMbmwQK/view?usp=drive_link" },
            { title: "[Android] — Cara upload tugas 01", href: "https://drive.google.com/file/d/1hYsvXrZxwrLqBSEcfblZkRH3-ADQ3TGB/view?usp=drive_link" },

            { title: "[Desktop] — Buat akun GitHub", href: "https://drive.google.com/file/d/1AlqonUx-ua70RCU-WkNGs3EDR9gQomhf/view?usp=drive_link" },
            { title: "[Desktop] — Cara buat repository", href: "https://drive.google.com/file/d/18DrNjHajIX_LLzd1P8Q7yzkjcqBvsc16/view?usp=drive_link" },
            { title: "[Desktop] — Cara upload tugas ke repo", href: "https://drive.google.com/file/d/1VdkcBJ6LfnomlEYDd3uODigi_Z0Zy73i/view?usp=drive_link" },
        ],
    },
    {
        id: "t2",
        code: "T2",
        title: "HTML Basic",
        color: "bg-sky-600",
        instruction:
            "Buatlah sebuah halaman HTML yang menerapakan materi pertemuan dua dengan tampilan halamannya sebagai berikut.",
        reference: "https://exampllee.vercel.app/t2.html",
        videos: [],
    },
    {
        id: "t3",
        code: "T3",
        title: "HTML Images, Tables & Links",
        color: "bg-sky-600",
        instruction: "Buatlah sebuah halaman HTML seperti refrensi dibawah ini yang menerapakan materi pertemuan tiga. Tampilan/layout/bagian2nya harus sama, sedangkan narasinya boleh berbeda",
        reference: "https://exampllee.vercel.app/t3.html",
        videos: [],
    },
    {
        id: "t4",
        code: "T4",
        title: "HTML Div, Inframes & Layout",
        color: "bg-sky-600",

        instruction : "coming soon",

        // instruction: "Buatlah sebuah halaman html dengan menerapkan materi yang diberikan dan halamannya harus mirip dengan refrensi dibawah ini! JANGAN LUPA UNTUK MERUBAH VIEW TAMPILANNYA MENJADI VIEW DESKTOP!",
        // reference: "https://exampllee.vercel.app/t4.html",
        // videos: [],
    },
];

export default function Tutorial() {
    const [open, setOpen] = useState(() => {
        const init = {};
        TASKS.forEach((m) => (init[m.id] = false));
        return init;
    });

    const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="min-h-screen bg-white pb-[70px]">
            {/* Header */}
            <div className="border-b bg-gradient-to-r from-sky-50 to-white">
                <div className="max-w-3xl mx-auto px-5 py-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-xs font-semibold">
                        <i className="ri-task-line" />
                        Panduan Praktikum PemWeb01
                    </div>
                    <h1 className="mt-2 text-2xl font-extrabold text-sky-700">
                        Instruksi Tugas Per Pekan
                    </h1>
                    <p className="text-sm text-gray-600">
                        Baca instruksi, lalu kerjakan sesuai kode pekan (T1, T2, dst).
                        Untuk assets seperti foto dll bisa
                        <Link to="https://exampllee.vercel.app/" target="_blank">
                            <span className="underline text-blue font-bold"> klik link ini!!!</span>
                        </Link>
                    </p>
                </div>
            </div>

            {/* List Accordion */}
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
                {TASKS.map((t) => (
                    <section
                        key={t.id}
                        className="rounded-xl border border-sky-100 bg-white shadow-sm overflow-hidden"
                    >
                        <button
                            type="button"
                            onClick={() => toggle(t.id)}
                            className="w-full flex items-center justify-between px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`size-10 grid place-items-center rounded-lg text-white ${t.color}`}
                                >
                                    <span className="text-sm font-bold">{t.code}</span>
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">{t.title}</div>
                                    <div className="text-xs text-gray-500">
                                        {t.videos?.length > 0
                                            ? `${t.videos.length} video available`
                                            : "video not available"}
                                    </div>
                                </div>
                            </div>
                            <i
                                className={`ri-arrow-right-s-line text-xl text-gray-500 transition-transform ${open[t.id] ? "rotate-90" : ""
                                    }`}
                            />
                        </button>

                        {open[t.id] && (
                            <div className="px-4 pb-4">
                                {/* Instruction */}
                                <div className="rounded-lg border text-justify border-sky-100 bg-sky-50 text-sky-800 text-sm px-3 py-3 leading-relaxed">
                                    <span className="font-semibold">{t.code} — Instruksi:</span>{" "}
                                    <span>{t.instruction}</span>
                                </div>

                                {/* Reference link */}
                                {t.reference && (
                                    <div className="mt-3 text-sm">
                                        Tampilan Halaman:{" "}
                                        <a
                                            href={t.reference}
                                            rel="noopener noreferrer"
                                            className="text-sky-600 underline"
                                        >
                                            Klik di sini
                                        </a>
                                    </div>
                                )}

                                {/* Videos */}
                                {t.videos && t.videos.length > 0 && (
                                    <ul className="mt-3 space-y-1">
                                        {t.videos.map((v, i) => (
                                            <li key={i}>
                                                <DropItem href={v.href}>{v.title}</DropItem>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </section>
                ))}

                {/* Quick help */}
                {/* <div className="text-xs text-gray-500 pt-2">
                    Note p4:  <Link to="http://pemweb01.vercel.app/style-p4.css"><b>buka dan salin css ini</b></Link> 
                </div>
                <div className="text-xs text-gray-500 -pt-3">
                    Note t4:  <Link to="#"><b>coming soon</b></Link> 
                </div> */}
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
