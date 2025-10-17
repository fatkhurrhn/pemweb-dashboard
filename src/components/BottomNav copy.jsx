// src/components/BottomNav.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function BottomNav() {
    const [showSheet, setShowSheet] = useState(false);
    const location = useLocation();
    const path = location.pathname || "/";

    // helper: cek active exact/startsWith (kecuali "/")
    const isRouteActive = (base) => {
        if (base === "/") return path === "/";
        return path === base || path.startsWith(base + "/");
    };

    const navItems = [
        { name: "Home", path: "/", icon: "ri-home-3" },
        { name: "Presensi", path: "/checkin", icon: "ri-qr-scan-2" },
        { name: "Tugas", path: "/tugas", icon: "ri-upload-cloud-2" },
        { name: "Intruksi", path: "/intruksi", icon: "ri-folder-2" },
    ];

    // Rekap aktif untuk dua sub: /rekap-presensi, /rekap-tugas
    const rekapActive =
        path === "/rekap-presensi" ||
        path.startsWith("/rekap-presensi/") ||
        path === "/rekap-tugas" ||
        path.startsWith("/rekap-tugas/");

    // optional: lock scroll saat sheet terbuka
    useEffect(() => {
        if (!showSheet) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = prev);
    }, [showSheet]);

    return (
        <>
            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#fcfeff] border-t border-gray-200 shadow-md z-50 sm:hidden">
                <nav className="max-w-xl mx-auto flex justify-around items-center py-2">
                    {navItems.map((item) => {
                        const active = isRouteActive(item.path);
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className="flex flex-col items-center text-xs"
                                aria-current={active ? "page" : undefined}
                            >
                                <i
                                    className={`${item.icon}${active ? "-fill" : "-line"} ${active ? "text-sky-600" : "text-gray-400"
                                        } text-xl transition-colors`}
                                />
                                <span className={`${active ? "text-sky-600" : "text-gray-400"} text-[11px]`}>
                                    {item.name}
                                </span>
                            </NavLink>
                        );
                    })}

                    {/* Rekap (Others) */}
                    <button
                        onClick={() => setShowSheet(true)}
                        className="flex flex-col items-center text-xs focus:outline-none"
                        aria-expanded={showSheet}
                        aria-controls="rekap-sheet"
                    >
                        <i
                            className={`ri-apps-${rekapActive ? "fill" : "line"} ${rekapActive ? "text-sky-600" : "text-gray-400"
                                } text-xl transition-colors`}
                        />
                        <span className={`${rekapActive ? "text-sky-600" : "text-gray-400"} text-[11px]`}>
                            Rekap
                        </span>
                    </button>
                </nav>
            </div>

            {/* Bottom Sheet */}
            {showSheet && (
                <div
                    className="fixed inset-0 z-50 flex justify-center items-end bg-black/40"
                    onClick={() => setShowSheet(false)}
                >
                    <div
                        id="rekap-sheet"
                        className="bg-[#fcfeff] w-full max-w-xl rounded-t-2xl p-4 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300" />
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-semibold text-sky-600">More Rekap</h2>
                            <button
                                onClick={() => setShowSheet(false)}
                                className="text-xl text-gray-500 hover:text-[#4f90c6] transition"
                                aria-label="Tutup"
                            >
                                <i className="ri-close-line" />
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <NavLink
                                to="/rekap-presensi"
                                onClick={() => setShowSheet(false)}
                                className="flex flex-col items-center"
                            >
                                <i className="ri-file-list-3-line text-2xl text-[#4f90c6]" />
                                <span className="text-xs mt-1 text-gray-600">Presensi</span>
                            </NavLink>
                            <NavLink
                                to="/rekap-tugas"
                                onClick={() => setShowSheet(false)}
                                className="flex flex-col items-center"
                            >
                                <i className="ri-folder-upload-line text-2xl text-[#4f90c6]" />
                                <span className="text-xs mt-1 text-gray-600">Tugas</span>
                            </NavLink>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
