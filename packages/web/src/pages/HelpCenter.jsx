import React from 'react';
import { MessageCircle, HelpCircle, FileText, ChevronRight } from 'lucide-react';

const HelpCenter = () => {
    const waLink = "https://wa.me/6281234567890"; // Example number

    const faqs = [
        { q: "Bagaimana cara membuat surat baru?", a: "Pergi ke menu 'Layanan Surat', pilih jenis surat yang diinginkan, isi form, dan klik 'Simpan' atau 'Download'." },
        { q: "Bagaimana cara menambahkan siswa?", a: "Masuk ke menu 'Data Siswa', klik tombol 'Tambah Siswa' di pojok kanan atas, dan isi data siswa." },
        { q: "Bagaimana cara mengatur margin surat?", a: "Pengaturan margin surat dapat dilakukan di menu 'Pengaturan' > 'Kop Surat & Layout'." },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">

                <div className="text-center py-8">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Pusat Bantuan</h1>
                    <p className="text-[#9795c6] text-lg">Kami siap membantu Anda mengelola sistem Sekolah.</p>
                </div>

                {/* Contact Support */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a href={waLink} target="_blank" rel="noreferrer" className="glass-panel p-6 rounded-2xl border border-[#272546] hover:border-green-500/50 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MessageCircle className="w-24 h-24 text-green-500" />
                        </div>
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">WhatsApp Support</h3>
                                <p className="text-[#9795c6] text-sm">Chat langsung dengan tim teknis kami untuk bantuan cepat.</p>
                            </div>
                            <span className="text-green-400 font-semibold text-sm flex items-center gap-1 mt-2">
                                Hubungi Sekarang <ChevronRight className="w-4 h-4" />
                            </span>
                        </div>
                    </a>

                    <div className="glass-panel p-6 rounded-2xl border border-[#272546] hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileText className="w-24 h-24 text-primary" />
                        </div>
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Panduan Penggunaan</h3>
                                <p className="text-[#9795c6] text-sm">Baca dokumentasi lengkap cara penggunaan aplikasi.</p>
                            </div>
                            <span className="text-primary font-semibold text-sm flex items-center gap-1 mt-2">
                                Baca Panduan <ChevronRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="flex flex-col gap-4 mt-4">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-[#9795c6]" />
                        Pertanyaan Umum
                    </h2>
                    <div className="glass-panel rounded-2xl border border-[#272546] overflow-hidden divide-y divide-[#272546]">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="p-6 hover:bg-[#1c1b2e] transition-colors">
                                <h4 className="text-white font-bold mb-2 text-lg">{faq.q}</h4>
                                <p className="text-[#9795c6] leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HelpCenter;
