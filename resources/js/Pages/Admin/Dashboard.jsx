import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ stats }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-navy dark:text-white leading-tight">
                    Panel Kendali Admin
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Admin Greeting Banner */}
                    <div className="bg-navy rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold">Ringkasan Sistem</h3>
                            <p className="mt-2 text-slate-300 opacity-90">Selamat bekerja! Berikut adalah statistik terbaru performa platform Beyond Horizon.</p>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                    </div>

                    {/* Admin Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                            <div>
                                <span className="text-5xl block mb-2">👥</span>
                                <span className="text-slate dark:text-slate-light font-semibold text-sm">Total Pengguna</span>
                            </div>
                            <div className="text-3xl font-extrabold text-navy dark:text-white mt-4">{stats.total_users}</div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                            <div>
                                <span className="text-5xl block mb-2">✉️</span>
                                <span className="text-slate dark:text-slate-light font-semibold text-sm">Total Undangan</span>
                            </div>
                            <div className="text-3xl font-extrabold text-navy dark:text-white mt-4">{stats.total_invitations}</div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                            <div>
                                <span className="text-5xl block mb-2">💎</span>
                                <span className="text-slate dark:text-slate-light font-semibold text-sm">Langganan Aktif</span>
                            </div>
                            <div className="text-3xl font-extrabold text-navy dark:text-white mt-4">{stats.active_subscriptions}</div>
                        </div>

                        <div className="bg-amber-50 dark:bg-slate-800/40 p-6 rounded-[1.5rem] shadow-sm border border-amber-200 dark:border-slate-700 flex flex-col justify-between">
                            <div>
                                <span className="text-5xl block mb-2">✨</span>
                                <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">Permintaan Desain</span>
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-navy dark:text-white mt-4">{stats.pending_requests}</div>
                                <Link 
                                    href={route('admin.requests.index')} 
                                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline mt-2 inline-block font-bold"
                                >
                                    Kelola Antrean &rarr;
                                </Link>
                            </div>
                        </div>

                        <div className="bg-primary p-6 rounded-[1.5rem] shadow-lg shadow-primary/20 text-white flex flex-col justify-between">
                            <div>
                                <span className="text-5xl block mb-2">💰</span>
                                <span className="font-semibold opacity-90 text-sm">Pendapatan Bersih</span>
                            </div>
                            <div className="text-2xl font-black mt-4">
                                Rp {stats.total_revenue ? stats.total_revenue.toLocaleString('id-ID') : '0'}
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Management sections */}
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                            <span className="text-4xl block">🎨</span>
                            <h4 className="text-lg font-bold text-navy dark:text-white">Layanan Done-for-You</h4>
                            <p className="text-slate dark:text-slate-light text-xs leading-relaxed">
                                Proses pengajuan pembuatan undangan kustom dari pelanggan paket Emas.
                            </p>
                            <Link 
                                href={route('admin.requests.index')}
                                className="inline-block bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-primary-hover shadow"
                            >
                                Kelola Permintaan
                            </Link>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                            <span className="text-4xl block">🎵</span>
                            <h4 className="text-lg font-bold text-navy dark:text-white">Kelola Audio (Lagu)</h4>
                            <p className="text-slate dark:text-slate-light text-xs leading-relaxed">
                                Unggah dan kelola daftar lagu (.mp3) untuk digunakan pengguna di undangan mereka.
                            </p>
                            <Link 
                                href={route('admin.audios.index')}
                                className="inline-block bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-primary-hover shadow"
                            >
                                Kelola Audio
                            </Link>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 opacity-75">
                            <span className="text-4xl block">📊</span>
                            <h4 className="text-lg font-bold text-navy dark:text-white">Statistik & Log</h4>
                            <p className="text-slate dark:text-slate-light text-xs leading-relaxed">
                                Monitoring log pembayaran masuk, error webhook, dan rasio pendaftaran pengguna baru.
                            </p>
                            <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-slate bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                                Segera Hadir
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
