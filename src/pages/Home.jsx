// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function Home() {

    // Label dinamis biar jelas statusnya
    return (
        <div className="min-h-screen w-full bg-white text-gray-900">
            {/* ===== NAVBAR ===== */}
            <nav className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
                <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
                        <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-sky-600 text-white">
                            <i className="ri-stack-fill"></i>
                        </span>
                        <span>Practix</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            to="https://exampllee.vercel.app/"
                            className="hidden sm:inline-flex px-3 py-2 rounded-lg border hover:bg-gray-50"
                        >
                            Login
                        </Link>
                        <Link
                            to="/checkin"
                            className="hidden sm:inline-flex px-3 py-2 rounded-lg border hover:bg-gray-50"
                        >
                            <i className="ri-qr-scan-2-line mr-2" /> Presensi
                        </Link>
                        <Link
                            to="/tugas"
                            className="hidden sm:inline-flex px-3 py-2 rounded-lg border hover:bg-gray-50"
                        >
                            <i className="ri-upload-cloud-2-line mr-2" /> Tugas
                        </Link>

                        

                        <Link
                            to="https://exampllee.vercel.app/"
                            className="inline-flex items-center px-3 py-2 rounded-lg 
             bg-white text-gray-900 border border-gray-300 
             hover:bg-gray-100 hover:border-gray-400 transition"
                        >
                            <i className="ri-book-marked-line mr-2" /> Assets
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none">
                    <div className="absolute -top-20 -right-16 w-[28rem] h-[28rem] rounded-full bg-sky-100 blur-3xl" />
                    <div className="absolute -bottom-24 -left-10 w-[24rem] h-[24rem] rounded-full bg-indigo-100 blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto px-5 py-12 md:py-16 grid md:grid-cols-2 gap-10">
                    <div className="flex flex-col justify-center">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 w-max text-sm border border-sky-100 mb-4">
                            <i className="ri-verified-badge-fill" /> STT Nurul Fikri — Pemrograman Web1
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                            Presensi & Tugas <span className="text-sky-600">lebih cepat</span> dan tertata
                        </h1>
                        <p className="mt-4 text-gray-600 max-w-xl">
                            All-in-one app untuk presensi, tugas, rekap, dan tutorial. Bikin pengalaman kuliah jadi lebih teratur dan simpel.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {/* --- Mobile Layout --- */}
                            {/* Tombol Install (SELALU ADA) */}
                            <Link to="/rekap-presensi"
                                className="inline-flex items-center justify-center gap-2 
               px-3 py-2 text-sm rounded-lg bg-sky-600 text-white 
               hover:opacity-90 flex-1 sm:hidden"
                            >
                                <i className="ri-user-follow-line" /> Rekap Presensi
                            </Link>

                            {/* Video Tutorial (ganti Pertanyaan) */}
                            <Link
                                to="/rekap-tugas"
                                className="inline-flex items-center justify-center gap-2 
               px-3 py-2 text-sm rounded-lg border hover:bg-gray-50 
               flex-1 sm:hidden"
                            >
                                <i className="ri-folder-upload-line" /> Rekap Tugas
                            </Link>

                            {/* --- Desktop Layout --- */}
                            {/* Video Tutorial (desktop) */}
                            <Link
                                to="/rekap-presensi"
                                className="hidden sm:inline-flex items-center justify-center gap-2 
               px-4 py-3 rounded-lg bg-sky-600 text-white 
               hover:opacity-90"
                            >
                                <i className="ri-folder-video-line" /> Rekap Presensi
                            </Link>

                            {/* Submit Tugas - hidden di mobile */}
                            <Link
                                to="/rekap-tugas"
                                className="hidden sm:inline-flex items-center gap-2 
               px-4 py-3 rounded-xl border hover:bg-gray-50"
                            >
                                <i className="ri-upload-cloud-2-line" /> Rekap Tugas
                            </Link>

                            {/* Pertanyaan (desktop) */}
                            <Link
                                to="https://t.me/fatkhurrhn"
                                rel="noopener noreferrer"
                                className="hidden sm:inline-flex items-center justify-center gap-2 
               px-4 py-3 rounded-lg border hover:bg-gray-50"
                            >
                                <i className="ri-question-answer-line" /> Pertanyaan
                            </Link>
                        </div>

                        <div className="mt-6 hidden sm:flex items-center gap-4 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1">
                                <i className="ri-shield-check-line text-green-600" /> Tanpa login untuk mahasiswa
                            </span>
                            <span className="hidden sm:inline h-4 w-px bg-gray-300" />
                            <span className="inline-flex items-center gap-1">
                                <i className="ri-smartphone-line" /> Optimasi mobile
                            </span>
                        </div>
                    </div>

                    <div className="md:pl-6">
                        <div className="relative p-4 md:p-6 rounded-2xl border bg-white shadow-sm">
                            <div className="absolute -top-3 -left-3 w-10 h-10 bg-sky-600 rounded-lg rotate-12 opacity-10" />
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Quick Links</h3>
                                <span className="text-xs text-gray-500">akses cepat</span>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <Link
                                    to="/checkin"
                                    className="group p-4 rounded-xl border hover:border-sky-300 hover:bg-sky-50/50 transition"
                                >
                                    <i className="ri-calendar-check-line text-2xl text-sky-600" />
                                    <div className="mt-2 font-semibold">Check-in</div>
                                    <p className="text-xs text-gray-600">
                                        Presensi dengan 3 digit NIM terakhir.
                                    </p>
                                </Link>
                                <Link
                                    to="/tugas"
                                    className="group p-4 rounded-xl border hover:border-indigo-300 hover:bg-indigo-50/50 transition"
                                >
                                    <i className="ri-task-line text-2xl text-indigo-600" />
                                    <div className="mt-2 font-semibold">Kirim Tugas</div>
                                    <p className="text-xs text-gray-600">
                                        Repo link atau upload gambar.
                                    </p>
                                </Link>
                                <Link
                                    to="/intruksi"
                                    className="group p-4 rounded-xl border hover:border-emerald-300 hover:bg-emerald-50/50 transition"
                                >
                                    <i className="ri-table-line text-2xl text-emerald-600" />
                                    <div className="mt-2 font-semibold">Intruksi</div>
                                    <p className="text-xs text-gray-600">
                                        Kumpulan intruksi tugas praktikum
                                    </p>
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className="group p-4 rounded-xl border hover:border-gray-300 hover:bg-gray-50/50 transition"
                                >
                                    <i className="ri-dashboard-3-line text-2xl text-gray-800" />
                                    <div className="mt-2 font-semibold">Dashboard</div>
                                    <p className="text-xs text-gray-600">Hanya Admin & Butuh login.</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section className="py-1">
                <div className="max-w-6xl mx-auto px-5">
                    <div className="grid md:grid-cols-3 gap-5">
                        <Feature
                            icon="ri-qr-scan-2-line"
                            title="Presensi anti ribet"
                            desc="Cari 3 digit terakhir NIM, klik hadir, selesai. Data langsung masuk dashboard."
                            tone="sky"
                        />
                        <Feature
                            icon="ri-upload-2-line"
                            title="Submit dua opsi"
                            desc="Kirim link repository atau upload gambar langsung — Cloudinary ready."
                            tone="indigo"
                        />
                        <Feature
                            icon="ri-bar-chart-2-line"
                            title="Rekap realtime"
                            desc="Admin bisa lihat rekap selesai/kosong, preview bukti, dan edit manual."
                            tone="emerald"
                        />
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-2">
                <div className="max-w-6xl mx-auto px-5">
                    <h2 className="text-2xl font-bold mb-6">Cara kerja</h2>
                    <ol className="grid md:grid-cols-3 gap-5 list-none counter-reset step">
                        <Step
                            title="Buka halaman"
                            desc="Pilih Presensi atau Submit Tugas dari beranda."
                        />
                        <Step
                            title="Cari NIM"
                            desc="Masukkan 3 digit terakhir NIM, pilih nama kamu."
                        />
                        <Step
                            title="Kirim"
                            desc="Klik Hadir / kirim link atau file. Muncul notifikasi sukses."
                        />
                    </ol>
                </div>
            </section>

            {/* ===== CTA STRIP ===== */}
            <section className="py-5">
                <div className="max-w-6xl mx-auto px-5">
                    <div className="rounded-2xl border p-6 md:p-8 bg-gradient-to-r from-sky-50 to-indigo-50">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold">Siap untuk mulai?</h3>
                                <p className="text-gray-600">Presensi dan tugas tinggal sekali klik.</p>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    to="/checkin"
                                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-sky-600 text-white hover:opacity-90"
                                >
                                    <i className="ri-qr-scan-2-line" /> Presensi
                                </Link>
                                <Link
                                    to="/tugas"
                                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border hover:bg-white"
                                >
                                    <i className="ri-upload-cloud-2-line" /> Submit
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="mt-1 border-t mb-[50px]">
                <div className="max-w-6xl mx-auto px-5 py-6 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="inline-grid place-items-center w-5 h-5 rounded-md bg-gray-900 text-white">
                            <i className="ri-code-s-slash-line text-[11px]"></i>
                        </div>
                        <span>
                            Develop by{" "}
                            <Link to="https://fatkhurrhn.vercel.app/">
                                <u>Fatkhurrhn</u>
                            </Link>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="tg://resolve?domain=fatkhurrhn"
                            rel="noopener noreferrer"
                            className="hover:text-gray-900"
                        >
                            <i className="ri-telegram-line"></i> Telegram (kak thur)
                        </Link>
                        <Link
                            to="https://wa.me/6281952441368"
                            rel="noopener noreferrer"
                            className="hover:text-gray-900"
                        >
                            <i className="ri-whatsapp-line"></i> Whatsapp (kak iyan)
                        </Link>
                    </div>
                </div>
            </footer>

            {/* Bottom navigation (selalu tampil) */}
            <BottomNav />
        </div>
    );
}

function Feature({ icon, title, desc, tone = "sky" }) {
    const tones = {
        sky: "text-sky-600 bg-sky-50",
        indigo: "text-indigo-600 bg-indigo-50",
        emerald: "text-emerald-600 bg-emerald-50",
        gray: "text-gray-700 bg-gray-100",
    };
    return (
        <div className="p-5 rounded-2xl border bg-white shadow-sm hover:shadow transition">
            <div
                className={`inline-grid place-items-center w-10 h-10 rounded-lg ${tones[tone] || tones.gray}`}
            >
                <i className={icon} />
            </div>
            <h3 className="mt-3 font-semibold text-lg">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{desc}</p>
        </div>
    );
}

function Step({ title, desc }) {
    return (
        <li className="relative p-5 rounded-2xl border bg-white shadow-sm">
            <div className="absolute -top-3 -left-3 w-9 h-9 rounded-lg bg-sky-600 text-white grid place-items-center text-sm">
                <i className="ri-check-line" />
            </div>
            <div className="font-semibold">{title}</div>
            <p className="text-sm text-gray-600 mt-1">{desc}</p>
        </li>
    );
}
