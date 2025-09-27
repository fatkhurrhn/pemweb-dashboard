import React, { useState } from 'react';

function Qna() {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <div>
            {/* Icon QnA */}
            <i
                className="ri-question-answer-line text-[23px] text-sky-700 cursor-pointer"
                onClick={openModal}
            ></i>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-lg w-80 relative">
                        {/* Tombol Close */}
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            ✖
                        </button>

                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Hubungi Kami
                        </h2>
                        <p className="text-sm text-gray-600 text-center mb-4">
                            Pilih salah satu platform untuk menghubungi kami.
                        </p>

                        {/* Tombol WhatsApp */}
                        <a
                            href="https://wa.me/6281952441368"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-green-500 text-white text-center py-2 rounded-lg hover:bg-green-600 mb-3"
                        >
                            WhatsApp Kak Iyan
                        </a>

                        {/* Tombol Telegram */}
                        <a
                            href="tg://resolve?domain=fatkhurrhn"
                            className="block w-full bg-blue-500 text-white text-center py-2 rounded-lg hover:bg-blue-600"
                        >
                            Telegram Kak Thur
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Qna;
