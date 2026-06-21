import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Guests({ invitation, guests }) {
    const [search, setSearch] = useState('');
    const [guestList, setGuestList] = useState(guests);
    const [waTemplate, setWaTemplate] = useState('');

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        // Set default template or load from localStorage
        const savedTemplate = localStorage.getItem(`wa_template_${invitation.id}`);
        if (savedTemplate) {
            setWaTemplate(savedTemplate);
        } else {
            const defaultTemplate = `Halo *{nama_tamu}*,\n\nKami mengundang Anda untuk menghadiri acara kami.\n\nSilakan buka tautan undangan resmi di bawah ini untuk melihat detail acara dan melakukan konfirmasi kehadiran (RSVP):\n{link_undangan}\n\nTerima kasih atas perhatiannya!`;
            setWaTemplate(defaultTemplate);
        }
    }, [invitation.id]);

    const saveTemplate = (text) => {
        setWaTemplate(text);
        localStorage.setItem(`wa_template_${invitation.id}`, text);
    };

    // Form for manual guest input
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        phone: '',
    });

    // Form for CSV upload
    const csvForm = useForm({
        file: null,
    });

    const handleAddGuest = (e) => {
        e.preventDefault();
        post(route('invitations.guests.store', invitation.id), {
            onSuccess: () => {
                reset();
                // Reload guests list
                router.reload({ only: ['guests'] });
            }
        });
    };

    const handleImportCSV = (e) => {
        e.preventDefault();
        if (!csvForm.data.file) return;

        csvForm.post(route('invitations.guests.import', invitation.id), {
            onSuccess: () => {
                csvForm.reset();
                router.reload({ only: ['guests'] });
            }
        });
    };

    const handleDeleteGuest = (guestId) => {
        if (confirm('Apakah Anda yakin ingin menghapus tamu ini?')) {
            router.delete(route('invitations.guests.destroy', [invitation.id, guestId]), {
                onSuccess: () => {
                    router.reload({ only: ['guests'] });
                }
            });
        }
    };

    useEffect(() => {
        setGuestList(guests);
    }, [guests]);

    const filteredGuests = guestList.filter(g => 
        g.name.toLowerCase().includes(search.toLowerCase()) || 
        (g.phone && g.phone.includes(search))
    );

    const getUniqueLink = (guest) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/v/${invitation.slug}?to=${encodeURIComponent(guest.name)}&code=${guest.code}`;
    };

    const copyMessage = (guest) => {
        const uniqueLink = getUniqueLink(guest);
        const message = waTemplate
            .replace(/{nama_tamu}/g, guest.name)
            .replace(/{link_undangan}/g, uniqueLink);
            
        navigator.clipboard.writeText(message);
        showToast(`Pesan untuk ${guest.name} berhasil disalin dan siap ditempel (paste)!`);
        
        // Mark as sent in DB using AJAX
        axios.post(route('guests.sent', guest.id))
            .then(() => {
                setGuestList(prev => prev.map(g => g.id === guest.id ? { ...g, is_sent: true } : g));
            }).catch(err => console.error('Gagal memperbarui status:', err));
    };

    const sendWhatsApp = async (guest) => {
        if (!guest.phone) {
            showToast('Nomor HP tamu tidak tersedia!', 'error');
            return;
        }

        const uniqueLink = getUniqueLink(guest);
        const message = waTemplate
            .replace(/{nama_tamu}/g, guest.name)
            .replace(/{link_undangan}/g, uniqueLink);

        // Format clean phone number
        let cleanPhone = guest.phone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '62' . cleanPhone.substring(1);
        }

        const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');

        // Mark as sent in DB using AJAX
        try {
            await axios.post(route('guests.sent', guest.id));
            // Update local state status
            setGuestList(prev => prev.map(g => g.id === guest.id ? { ...g, is_sent: true } : g));
        } catch (err) {
            console.error('Gagal memperbarui status kirim:', err);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <Link href={route('invitations.index')} className="text-slate font-bold text-sm hover:text-primary">&larr; Kembali ke Undangan</Link>
                        <h2 className="text-2xl font-bold text-navy dark:text-white leading-tight mt-1">
                            Kelola Tamu: {invitation.title}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Kelola Tamu" />

            <div className="py-12 w-full px-4 md:px-10 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: GUEST FORMS & WA TEMPLATE */}
                    <div className="space-y-8 lg:col-span-1">
                        
                        {/* Add Guest Manually */}
                        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="font-extrabold text-navy dark:text-white text-lg mb-4">Tambah Tamu Manual</h3>
                            <form onSubmit={handleAddGuest} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-1">Nama Tamu</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Contoh: Bapak Budi"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm text-navy dark:text-white"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-1">No HP / WhatsApp</label>
                                    <input 
                                        type="text" 
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="Contoh: 081234567890"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm text-navy dark:text-white"
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-hover shadow"
                                >
                                    Tambah Tamu
                                </button>
                            </form>
                        </div>

                        {/* Import CSV / Excel */}
                        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-extrabold text-navy dark:text-white text-lg">Impor via Excel / CSV</h3>
                                <a 
                                    href={route('invitations.guests.template', invitation.id)} 
                                    className="text-xs text-primary font-bold hover:underline"
                                >
                                    Download Template
                                </a>
                            </div>
                            <form onSubmit={handleImportCSV} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-2">Upload File CSV</label>
                                    <input 
                                        type="file" 
                                        accept=".csv,.txt"
                                        onChange={e => csvForm.setData('file', e.target.files[0])}
                                        className="w-full text-xs text-slate file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:font-semibold"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={csvForm.processing || !csvForm.data.file}
                                    className="w-full bg-navy text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-55"
                                >
                                    {csvForm.processing ? 'Mengimpor...' : 'Impor Daftar Tamu'}
                                </button>
                            </form>
                        </div>

                        {/* WhatsApp Custom Template */}
                        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="font-extrabold text-navy dark:text-white text-lg mb-2">Template Undangan WA</h3>
                            <p className="text-[10px] text-slate mb-4">
                                Gunakan tag <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded font-bold text-primary">{`{nama_tamu}`}</code> dan <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded font-bold text-primary">{`{link_undangan}`}</code> untuk diganti otomatis.
                            </p>
                            <textarea
                                value={waTemplate}
                                onChange={e => saveTemplate(e.target.value)}
                                rows="6"
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-xs text-navy dark:text-white leading-relaxed"
                            />
                        </div>

                    </div>

                    {/* RIGHT COLUMN: GUEST LIST TABLE */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h3 className="font-extrabold text-navy dark:text-white text-xl">Daftar Tamu ({filteredGuests.length})</h3>
                            <input 
                                type="text" 
                                placeholder="Cari nama tamu..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm text-navy dark:text-white"
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate uppercase">
                                        <th className="py-4 px-2">Nama Tamu</th>
                                        <th className="py-4 px-2">No WhatsApp</th>
                                        <th className="py-4 px-2">Link Unik</th>
                                        <th className="py-4 px-2">Status</th>
                                        <th className="py-4 px-2 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredGuests.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-slate text-sm">
                                                Belum ada data tamu. Silakan tambah manual atau impor file CSV.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredGuests.map((guest) => (
                                            <tr key={guest.id} className="text-sm">
                                                <td className="py-4 px-2 font-bold text-navy dark:text-white">{guest.name}</td>
                                                <td className="py-4 px-2 font-semibold opacity-85">{guest.phone || '-'}</td>
                                                <td className="py-4 px-2">
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(getUniqueLink(guest));
                                                            showToast('Link berhasil disalin!');
                                                        }}
                                                        className="text-xs text-primary font-bold hover:underline"
                                                    >
                                                        Salin Link 🔗
                                                    </button>
                                                </td>
                                                <td className="py-4 px-2">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        guest.is_sent 
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-950/30' 
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-900'
                                                    }`}>
                                                        {guest.is_sent ? 'Terkirim' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-2 text-right space-x-2">
                                                    {guest.phone && (
                                                        <button 
                                                            onClick={() => sendWhatsApp(guest)}
                                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                        >
                                                            Kirim WA 💬
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => copyMessage(guest)}
                                                        className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-navy dark:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                    >
                                                        Salin Pesan 📋
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteGuest(guest.id)}
                                                        className="text-red-500 hover:underline text-xs font-bold"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
                <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800 text-green-800 dark:text-green-100' : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800 text-red-800 dark:text-red-100'}`}>
                    <div className="text-xl">
                        {toast.type === 'success' ? '✅' : '⚠️'}
                    </div>
                    <div className="font-bold text-sm">
                        {toast.message}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
