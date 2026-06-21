import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import axios from 'axios';

export default function Dashboard({ packages, activeSubscription, myRequests = [], stats = {}, recentInvitations = [] }) {
    
    useEffect(() => {
        // Load Midtrans Snap script
        const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
        
        const script = document.createElement('script');
        script.src = midtransScriptUrl;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleUpgrade = async (packageId) => {
        try {
            const response = await axios.post(route('payments.checkout'), { package_id: packageId });
            const { snap_token } = response.data;

            window.snap.pay(snap_token, {
                onSuccess: (result) => {
                    alert('Pembayaran Berhasil!');
                    window.location.reload();
                },
                onPending: (result) => {
                    alert('Menunggu Pembayaran...');
                },
                onError: (result) => {
                    alert('Pembayaran Gagal!');
                },
                onClose: () => {
                    alert('Anda menutup popup sebelum menyelesaikan pembayaran');
                }
            });
        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Terjadi kesalahan saat memproses pembayaran.');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-navy dark:text-white leading-tight">
                    Dashboard Pengguna
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    {/* Welcome Card */}
                    <div className="bg-primary rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold">Halo, Selamat Datang Kembali!</h3>
                            <p className="mt-2 text-primary-100 opacity-90">Sudah siap bikin undangan keren hari ini?</p>
                            <Link 
                                href={route('invitations.create')} 
                                className="mt-6 inline-block bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-slate-50 transition-all shadow-lg"
                            >
                                + Bikin Undangan Baru
                            </Link>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                            <span className="text-slate dark:text-slate-light font-semibold">Undangan Aktif / Dibuat</span>
                            <div className="text-3xl font-bold text-navy dark:text-white mt-1">{stats.total_invitations || 0}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                            <span className="text-slate dark:text-slate-light font-semibold">Total RSVP (Tamu Hadir)</span>
                            <div className="text-3xl font-bold text-navy dark:text-white mt-1">{stats.total_rsvps || 0}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                            <span className="text-slate dark:text-slate-light font-semibold">Paket Langganan Aktif</span>
                            <div className="text-xl font-bold text-primary mt-1">
                                {activeSubscription ? activeSubscription.package.name : 'Gratis'}
                            </div>
                        </div>
                    </div>

                    {/* Layanan Admin (Done-for-You) Section - Only for Gold/Emas users */}
                    {activeSubscription?.package.name === 'Emas' && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-800 dark:to-slate-900 rounded-[2.5rem] p-8 border border-amber-200 dark:border-slate-700 shadow-lg">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-navy dark:text-white flex items-center gap-2">
                                        ✨ Layanan Pembuatan Admin
                                    </h3>
                                    <p className="text-slate dark:text-slate-light mt-2">
                                        Sebagai member Emas, kamu bisa minta admin buatkan undanganmu secara gratis!
                                    </p>
                                </div>
                                <Link 
                                    href={route('requests.create')} 
                                    className="bg-navy dark:bg-primary text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all whitespace-nowrap"
                                >
                                    Minta Dibuatkan Sekarang
                                </Link>
                            </div>

                            {/* List of Requests */}
                            {myRequests.length > 0 && (
                                <div className="mt-8 space-y-4">
                                    <h4 className="font-bold text-navy dark:text-white uppercase text-xs tracking-widest">Status Permintaan Kamu</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {myRequests.map((req) => (
                                            <div key={req.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm">
                                                <div>
                                                    <div className="font-bold text-navy dark:text-white">{req.category?.name || 'Kategori'}</div>
                                                    <div className="text-xs text-slate">{new Date(req.created_at).toLocaleDateString('id-ID')}</div>
                                                </div>
                                                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                                                    req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    req.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                    req.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {req.status === 'pending' ? 'Menunggu' : 
                                                     req.status === 'processing' ? 'Diproses' : 
                                                     req.status === 'completed' ? 'Selesai' : 'Ditolak'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recent Invitations Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h4 className="text-xl font-bold text-navy dark:text-white mb-6">Undangan Terbaru Kamu</h4>
                        
                        {recentInvitations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl mb-4">
                                    📭
                                </div>
                                <p className="text-slate dark:text-slate-light font-bold">Wah, sepertinya kamu belum bikin undangan nih.</p>
                                <Link href={route('invitations.create')} className="text-primary font-bold mt-2 hover:underline">Yuk, mulai bikin sekarang!</Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-150 dark:divide-slate-700">
                                {recentInvitations.map((inv) => (
                                    <div key={inv.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">{inv.category?.icon || '✉️'}</span>
                                            <div>
                                                <h5 className="font-extrabold text-navy dark:text-white text-base leading-tight">{inv.title}</h5>
                                                <p className="text-xs text-slate mt-1">
                                                    URL: <a href={`/v/${inv.slug}`} target="_blank" className="text-primary hover:underline">/v/{inv.slug}</a>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                inv.is_active 
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-950/30' 
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30'
                                            }`}>
                                                {inv.is_active ? 'Terpublikasi' : 'Draft'}
                                            </span>
                                            
                                            <Link 
                                                href={route('invitations.edit', inv.id)} 
                                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-navy dark:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                            >
                                                Edit
                                            </Link>
                                            
                                            {inv.is_active && (
                                                <Link 
                                                    href={route('invitations.guests.index', inv.id)}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                                                >
                                                    👥 Kelola Tamu
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upgrade Section */}
                    <div className="bg-navy rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                         <div className="relative z-10 max-w-2xl">
                            <h3 className="text-3xl font-bold mb-4">Dapatkan Fitur Eksklusif!</h3>
                            <p className="opacity-80 mb-8 leading-relaxed">
                                Upgrade ke paket Premium atau Emas untuk menghilangkan logo Beyond Horizon, 
                                mengaktifkan musik latar, dan mengelola RSVP tamu tanpa batas.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {packages.map((pkg) => (
                                    <button
                                        key={pkg.id}
                                        onClick={() => handleUpgrade(pkg.id)}
                                        className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-primary/20"
                                    >
                                        Beli {pkg.name} - Rp {pkg.price.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                         </div>
                         <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full -mr-20 blur-3xl"></div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
