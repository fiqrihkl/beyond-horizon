import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ invitations }) {
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedInv, setSelectedInv] = useState(null);
    const [guestName, setGuestName] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const openShare = (inv) => {
        setSelectedInv(inv);
        setGuestName('');
        setCopySuccess(false);
        setShowShareModal(true);
    };

    const getInvitationUrl = (inv) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/v/${inv.slug}`;
    };

    const getPersonalizedUrl = () => {
        const baseUrl = window.location.origin;
        if (guestName.trim()) {
            return `${baseUrl}/v/${selectedInv.slug}?to=${encodeURIComponent(guestName.trim())}`;
        }
        return `${baseUrl}/v/${selectedInv.slug}`;
    };

    const getShareMessage = () => {
        const url = getPersonalizedUrl();
        const salut = guestName.trim() ? `Halo ${guestName.trim()},\n\n` : '';
        return `${salut}Kami mengundang Anda untuk hadir di acara "${selectedInv?.title}".\n\nSilakan buka tautan berikut untuk melihat undangan digital kami:\n${url}\n\nTerima kasih atas doa restu Anda. 🙏`;
    };

    const getWhatsAppUrl = () => {
        return `https://wa.me/?text=${encodeURIComponent(getShareMessage())}`;
    };

    const handleCopyLink = () => {
        const message = getShareMessage();
        navigator.clipboard.writeText(message).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2500);
        });
    };

    const handleDelete = (inv) => {
        if (confirm(`Hapus undangan "${inv.title}"? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(route('invitations.destroy', inv.id));
        }
    };

    const getMissingFields = (inv) => {
        const missing = [];
        if (!inv.title) missing.push("Judul Undangan");
        if (!inv.slug) missing.push("Tautan / URL Undangan");
        
        const content = inv.content || {};
        
        // Cek Nama
        const isPernikahan = inv.category?.slug === 'pernikahan';
        if (isPernikahan) {
            if (!content.bride_name) missing.push("Nama Mempelai Wanita");
            if (!content.groom_name) missing.push("Nama Mempelai Pria");
        } else {
            if (!content.child_name && !content.bride_name && !content.hero_title) {
                missing.push("Nama Pemilik Acara");
            }
        }
        
        // Cek Events
        const events = content.events || [];
        if (events.length === 0) {
            missing.push("Data Acara (Belum ditambahkan)");
        } else {
            const mainEvent = events[0];
            if (!mainEvent.name) missing.push("Nama Acara Utama");
            if (!mainEvent.date) missing.push("Tanggal Acara Utama");
            if (!mainEvent.time) missing.push("Waktu Acara Utama");
            if (!mainEvent.location) missing.push("Lokasi Acara Utama");
        }
        
        return missing;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-navy dark:text-white">Undangan Saya</h2>
                    <Link
                        href={route('invitations.create')}
                        className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-105"
                    >
                        + Buat Undangan
                    </Link>
                </div>
            }
        >
            <Head title="Undangan Saya" />

            <div className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
                {invitations.length === 0 ? (
                    <div className="text-center py-24 space-y-4">
                        <div className="text-6xl">💌</div>
                        <h3 className="text-xl font-bold text-navy dark:text-white">Belum Ada Undangan</h3>
                        <p className="text-slate dark:text-slate-light text-sm">Mulai buat undangan digital pertama Anda sekarang.</p>
                        <Link href={route('invitations.create')}
                            className="inline-block mt-4 bg-primary text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-primary-hover transition-all">
                            Buat Undangan Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {invitations.map((inv) => (
                            <div key={inv.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all group">
                                {/* Cover */}
                                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                                    {inv.cover_image ? (
                                        <img src={`/storage/${inv.cover_image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={inv.title} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">💌</div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.is_active ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate dark:text-slate-light'}`}>
                                            {inv.is_active ? 'Aktif' : 'Draft'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <div>
                                        <h3 className="font-bold text-navy dark:text-white text-base leading-tight">{inv.title}</h3>
                                        <p className="text-xs text-slate dark:text-slate-light mt-1">/v/{inv.slug}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Link href={route('invitations.edit', inv.id)}
                                            className="flex items-center justify-center gap-1.5 bg-primary/10 text-primary py-2.5 rounded-2xl text-xs font-bold hover:bg-primary/20 transition-colors">
                                            ✏️ Edit
                                        </Link>
                                        <a href={`/v/${inv.slug}`} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900 text-slate dark:text-slate-light py-2.5 rounded-2xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            👁️ Preview
                                        </a>
                                        {(() => {
                                            const missing = getMissingFields(inv);
                                            if (missing.length === 0) {
                                                return (
                                                    <Link href={route('invitations.guests.index', inv.id)}
                                                        className="flex items-center justify-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-2.5 rounded-2xl text-xs font-bold hover:bg-green-100 transition-colors col-span-2">
                                                        🔗 Kirim Undangan
                                                    </Link>
                                                );
                                            } else {
                                                return (
                                                    <div className="col-span-2 space-y-2 mt-1">
                                                        <button disabled
                                                            className="w-full flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-2.5 rounded-2xl text-xs font-bold cursor-not-allowed">
                                                            ⚠️ Data undangan belum lengkap
                                                        </button>
                                                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-3 text-xs text-red-600 dark:text-red-400">
                                                            <p className="font-bold mb-1 flex items-center gap-1"><span className="text-base leading-none">📋</span> Data yang masih kosong:</p>
                                                            <ul className="list-disc pl-5 space-y-0.5 opacity-90">
                                                                {missing.map((item, idx) => (
                                                                    <li key={idx}>{item}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>

                                    <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
                                        <button onClick={() => handleDelete(inv)}
                                            className="w-full text-red-400 hover:text-red-600 text-xs font-bold py-2 transition-colors">
                                            Hapus Undangan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Share Modal */}
            {showShareModal && selectedInv && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-navy dark:text-white">Kirim Undangan</h3>
                            <button onClick={() => setShowShareModal(false)} className="text-slate hover:text-navy dark:hover:text-white font-bold text-xl">✕</button>
                        </div>

                        <div className="p-6 space-y-5">
                            <p className="text-slate dark:text-slate-light text-sm">Tulis nama tamu agar pesan terasa lebih personal.</p>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate mb-2">Nama Tamu (Opsional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary dark:text-white text-sm"
                                    placeholder="Contoh: Bapak Budi"
                                    value={guestName}
                                    onChange={e => setGuestName(e.target.value)}
                                />
                            </div>

                            {/* Preview Pesan */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                                <p className="text-[10px] font-bold uppercase text-slate mb-2 tracking-widest">Preview Pesan</p>
                                <p className="text-xs text-slate dark:text-slate-light leading-relaxed whitespace-pre-wrap break-all">{getShareMessage()}</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                {/* Salin Pesan */}
                                <button
                                    onClick={handleCopyLink}
                                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${copySuccess ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-200'}`}
                                >
                                    {copySuccess ? '✓ Disalin!' : '📋 Salin Pesan + Link'}
                                </button>

                                {/* WhatsApp */}
                                <a
                                    href={getWhatsAppUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-2xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200 dark:shadow-green-900/20"
                                >
                                    <span>📱</span> Kirim via WhatsApp
                                </a>
                            </div>

                            <p className="text-[10px] text-slate text-center opacity-60">
                                Link juga bisa dibagikan via DM Instagram, Telegram, Line, dll.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
