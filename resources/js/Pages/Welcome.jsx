import { Link, Head } from '@inertiajs/react';
import DarkModeToggle from '@/Components/DarkModeToggle';

export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300 font-sans">
            <Head title="Beyond Horizon - Undangan Digital Premium" />

            {/* Navbar */}
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20">
                        BH
                    </div>
                    <span className="text-2xl font-bold text-navy dark:text-white tracking-tight">
                        BEYOND <span className="text-primary">HORIZON-APP</span>
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-navy dark:text-slate-light hover:text-primary transition-colors font-medium">Fitur</a>
                    <a href="#categories" className="text-navy dark:text-slate-light hover:text-primary transition-colors font-medium">Kategori Acara</a>
                    <a href="#pricing" className="text-navy dark:text-slate-light hover:text-primary transition-colors font-medium">Harga</a>
                </div>

                <div className="flex items-center gap-4">
                    <DarkModeToggle />
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="bg-navy text-white px-6 py-2.5 rounded-full font-semibold hover:bg-navy-light transition-all shadow-lg shadow-navy/20"
                        >
                            Masuk Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="text-navy dark:text-white font-semibold">Masuk</Link>
                            <Link
                                href={route('register')}
                                className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                            >
                                Daftar Sekarang
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-12 pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl lg:text-6xl font-bold text-navy dark:text-white leading-[1.15]">
                            Bikin Momen Spesialmu Jadi <span className="text-primary underline decoration-4 underline-offset-8">Lebih Berkesan</span>
                        </h1>
                        <p className="mt-6 text-lg text-slate dark:text-slate-light leading-relaxed max-w-lg">
                            BEYOND HORIZON bantu kamu bikin undangan digital yang elegan dan interaktif buat segala macam acara. Simpel, keren, dan nggak pakai ribet!
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link href={route('register')} className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/30">
                                Mulai Gratis
                            </Link>
                            <button className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pr-6 rounded-full shadow-lg border border-slate-100 dark:border-slate-700">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                                <span className="font-semibold text-navy dark:text-white">Lihat Demo</span>
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="relative bg-background-warm dark:bg-slate-800/50 rounded-[2.5rem] p-8 shadow-2xl border-8 border-white dark:border-slate-700 rotate-2 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                            <div className="space-y-6 text-center">
                                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-4xl">📸</div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold text-navy dark:text-white">Aqiqah Baby Ahmad</h3>
                                    <p className="text-slate dark:text-slate-light">Minggu, 24 Mei 2026</p>
                                </div>
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-center">
                                    <div className="w-32 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">Buka Undangan</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section id="categories" className="py-24 bg-white dark:bg-background-dark transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-navy dark:text-white">Satu Aplikasi, <span className="text-primary">Semua Acara</span></h2>
                    <p className="mt-4 text-slate dark:text-slate-light">Pilih tema yang paling pas buat hari bahagia kamu</p>

                    <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-8">
                        {[
                            { name: 'Aqiqah', icon: '👶', color: 'bg-blue-50 text-blue-500' },
                            { name: 'Khitanan', icon: '☪️', color: 'bg-green-50 text-green-500' },
                            { name: 'Pernikahan', icon: '💍', color: 'bg-rose-50 text-rose-500' },
                            { name: 'Ulang Tahun', icon: '🎂', color: 'bg-yellow-50 text-yellow-500' },
                            { name: 'Syukuran', icon: '🕊️', color: 'bg-purple-50 text-purple-500' },
                        ].map((cat) => (
                            <div key={cat.name} className="p-8 rounded-[2rem] bg-background-light dark:bg-slate-800/50 shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-transparent hover:border-primary/20">
                                <div className={`w-16 h-16 mx-auto rounded-2xl ${cat.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                                    {cat.icon}
                                </div>
                                <h3 className="font-bold text-navy dark:text-white text-xl">{cat.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-background-warm dark:bg-slate-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-navy dark:text-white">Pilih <span className="text-primary">Paket Seru</span> Kamu</h2>
                        <p className="mt-4 text-slate dark:text-slate-light">Pilih yang paling sesuai sama kebutuhan acaramu</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col">
                            <h3 className="text-2xl font-bold text-navy dark:text-white">Gratis</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-extrabold text-navy dark:text-white">Rp 0</span>
                            </div>
                            <ul className="mt-8 space-y-4 text-slate dark:text-slate-light flex-1">
                                <li className="flex items-center gap-3">Tema Standar</li>
                                <li className="flex items-center gap-3">Logo Beyond Horizon</li>
                                <li className="flex items-center gap-3">Foto Terbatas</li>
                            </ul>
                            <button className="mt-10 w-full py-4 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">
                                Mulai Sekarang
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl border-4 border-primary relative transform scale-105 flex flex-col">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-1 rounded-full text-sm font-bold">PALING POPULER</div>
                            <h3 className="text-2xl font-bold text-navy dark:text-white">Premium</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-extrabold text-navy dark:text-white">Rp 99rb</span>
                            </div>
                            <ul className="mt-8 space-y-4 text-navy dark:text-white flex-1">
                                <li className="flex items-center gap-3 font-bold">✨ Tema Custom Mewah</li>
                                <li className="flex items-center gap-3">✨ Tanpa Logo BH</li>
                                <li className="flex items-center gap-3">✨ Manajemen RSVP</li>
                                <li className="flex items-center gap-3">✨ Musik Latar</li>
                            </ul>
                            <button className="mt-10 w-full py-4 rounded-full bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/30">
                                Pilih Premium
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col">
                            <h3 className="text-2xl font-bold text-navy dark:text-white">Emas</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-extrabold text-navy dark:text-white">Rp 199rb</span>
                            </div>
                            <ul className="mt-8 space-y-4 text-slate dark:text-slate-light flex-1">
                                <li className="flex items-center gap-3">Semua Fitur Premium</li>
                                <li className="flex items-center gap-3">Domain Custom</li>
                                <li className="flex items-center gap-3">Dukungan Prioritas</li>
                            </ul>
                            <button className="mt-10 w-full py-4 rounded-full border-2 border-navy text-navy dark:text-white dark:border-white font-bold hover:bg-navy dark:hover:bg-white dark:hover:text-navy hover:text-white transition-all">
                                Pilih Emas
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-navy py-12 text-white">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            BH
                        </div>
                        <span className="text-xl font-bold tracking-tight">BEYOND HORIZON</span>
                    </div>
                    <div className="flex gap-8 text-slate-light font-medium">
                        <a href="#">Privasi</a>
                        <a href="#">Syarat & Ketentuan</a>
                        <a href="#">Hubungi Kami</a>
                    </div>
                    <p className="text-slate-light">© 2026 Beyond Horizon. Bikin momenmu abadi.</p>
                </div>
            </footer>
        </div>
    );
}
