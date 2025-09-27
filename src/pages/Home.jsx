// src/pages/Home.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
    // satu state untuk semua dropdown
    const [open, setOpen] = useState({ c1: false, c3: false });

    const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="min-h-screen w-full bg-white text-gray-900 dark:bg-zinc-900 dark:text-zinc-100">
            <div className="w-full max-w-[700px] px-5 py-10 pt-8 mx-auto flex flex-col items-center gap-5">
                {/* Header / Profile */}
                <div className="flex flex-col items-center gap-4 mt-6">
                    <div className="relative w-44 h-44">
                        <img
                            src="https://punca.id/wp-content/uploads/2024/07/8f3392322c445bc654c1d8b73018a12b.jpg"
                            alt="Fatkhurrhn's profile"
                            className="w-full h-full object-cover rounded-full ring-4 ring-sky-400/90"
                            onError={(e) => {
                                e.currentTarget.src =
                                    "https://punca.id/wp-content/uploads/2024/07/8f3392322c445bc654c1d8b73018a12b.jpg";
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-2xl sm:text-3xl font-bold -mb-4">
                        PemWeb01
                        <span className="text-sky-500 text-2xl">
                            <i className="ri-verified-badge-fill"></i>
                        </span>
                    </div>

                    <Link
                        to="https://pemweb01.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-500 text-sm sm:text-base hover:underline"
                    >
                        https://pemweb01.vercel.app/
                    </Link>

                    <p className="text-center text-sm sm:text-base -mt-2 px-6">
                        santai aja gasih, cuma koding kok, pasti kamu bisa, pasti bisaaa :{"v"}
                    </p>
                </div>

                {/* Pills / Badges */}
                <div className="flex flex-wrap justify-center gap-2.5 mb-3">
                    <Pill
                        href="https://wa.me/6281952441368"
                        icon="ri-whatsapp-line"
                        label="whatsapp (kak iyan)"
                    />
                    <Pill
                        href="https://wa.me/6282285512813"
                        icon="ri-whatsapp-line"
                        label="whatsapp (kak thur)"
                    />
                </div>

                {/* Cards + Dropdowns */}
                <div className="w-full flex flex-col gap-3">
                    {/* Card 1 */}
                    <button
                        type="button"
                        onClick={() => toggle("c1")}
                        className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 shadow-sm hover:shadow transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 grid place-items-center rounded-lg text-white text-lg bg-zinc-700">
                                <i className="ri-stack-fill"></i>
                            </div>
                            <div className="font-semibold text-sm sm:text-base text-gray-800 dark:text-zinc-100">
                                Presensi + Rekap
                            </div>
                        </div>
                        <i
                            className={`ri-arrow-right-s-line text-lg text-zinc-500 transition-transform ${open.c1 ? "rotate-90" : ""
                                }`}
                        ></i>
                    </button>

                    {open.c1 && (
                        <div className="mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 shadow-sm">
                            <DropItem href="/checkin">Check-in Presensi</DropItem>
                            <DropItem href="/rekap-presensi">Rekap Presensi</DropItem>
                        </div>
                    )}

                    {/* Card 2 (link langsung, tanpa dropdown) */}
                    <Link
                        to="/tugas"
                        className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 shadow-sm hover:shadow transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 grid place-items-center rounded-lg text-white text-lg bg-orange-500">
                                <i className="ri-upload-cloud-2-fill"></i>
                            </div>
                            <div className="font-semibold text-sm sm:text-base text-gray-800 dark:text-zinc-100">
                                Submit Tugas
                            </div>
                        </div>
                        <i className="ri-arrow-right-s-line text-lg text-zinc-500"></i>
                    </Link>

                    {/* Card 3 */}
                    <button
                        type="button"
                        onClick={() => toggle("c3")}
                        className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 shadow-sm hover:shadow transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 grid place-items-center rounded-lg text-white text-lg bg-blue-700">
                                <i className="ri-folder-video-fill"></i>
                            </div>
                            <div className="font-semibold text-sm sm:text-base text-gray-800 dark:text-zinc-100">
                                Tutorial Praktikum 01
                            </div>
                        </div>
                        <i
                            className={`ri-arrow-right-s-line text-lg text-zinc-500 transition-transform ${open.c3 ? "rotate-90" : ""
                                }`}
                        ></i>
                    </button>

                    {open.c3 && (
                        <div className="mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 shadow-sm">
                            {/* contoh isi dropdown card 3 */}
                            <DropItem href="https://drive.google.com/file/d/1caq8CZsSyz4xcimOfoHalAGbqPM_qds3/view?usp=drive_link">
                                Video 1 [android] — cara buat akun github
                            </DropItem>
                            <DropItem href="https://drive.google.com/file/d/1PPHOH0RbwfeNPwo7weMQpwIn7A610TZM/view?usp=drive_link">
                                Video 2 [android] — cara buat repository
                            </DropItem>
                            <DropItem href="https://drive.google.com/file/d/1D0LwpX07fp9GHhicyxSqMJZXkyNsxAtd/view?usp=drive_link">
                                Video 3 [android] — setup text editor
                            </DropItem>
                            <DropItem href="https://drive.google.com/file/d/1E2RslRgO4a7ZocEWe1_Ys2vlunMbmwQK/view?usp=drive_link">
                                Video 4 [android] — upload latihan ke repository
                            </DropItem>
                            <DropItem href="https://drive.google.com/file/d/1hYsvXrZxwrLqBSEcfblZkRH3-ADQ3TGB/view?usp=drive_link">
                                Video 5 [android] — cara upload tugas 01
                            </DropItem>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Pill({ href, icon, label }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-2xl text-xs sm:text-[13px] font-medium transition hover:bg-gray-200 hover:shadow dark:hover:bg-zinc-700"
        >
            <i className={icon}></i> {label}
        </a>
    );
}

function DropItem({ href, children, target }) {
    // gunakan <Link> kalau href internal (diawali '/'), selain itu pakai <a>
    const isInternal = href?.startsWith("/");
    if (isInternal) {
        return (
            <Link
                to={href}
                className="block px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
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
            className="block px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
        >
            {children}
        </a>
    );
}
