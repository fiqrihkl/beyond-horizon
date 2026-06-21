import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { Head, Link, useForm } from '@inertiajs/react';
import DarkModeToggle from '@/Components/DarkModeToggle';
import { useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            <Head title="Daftar Akun" />

            {/* Decorative Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy/5 rounded-full -ml-48 -mb-48 blur-3xl animate-pulse"></div>

            <div className="fixed top-8 right-8">
                <DarkModeToggle />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
                            BH
                        </div>
                        <span className="text-2xl font-bold text-navy dark:text-white tracking-tight">
                            BEYOND <span className="text-primary">HORIZON</span>
                        </span>
                    </Link>
                    <h1 className="text-3xl font-bold text-navy dark:text-white">Ayo Bergabung!</h1>
                    <p className="text-slate dark:text-slate-light mt-2 italic">Mulai buat undangan pertamamu dalam hitungan menit.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-navy dark:text-white mb-2 ml-1">Nama Lengkap</label>
                            <input
                                type="text"
                                value={data.name}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary dark:text-white transition-all"
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Joko Susilo"
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-navy dark:text-white mb-2 ml-1">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary dark:text-white transition-all"
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nama@email.com"
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-navy dark:text-white mb-2 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-primary dark:text-white transition-all"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-navy dark:text-white mb-2 ml-1">Konfirmasi</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={data.password_confirmation}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-primary dark:text-white transition-all"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <InputError message={errors.password} className="mt-2" />

                        <div className="flex items-center ml-1">
                            <Checkbox
                                name="terms"
                                checked={data.terms}
                                onChange={(e) => setData('terms', e.target.checked)}
                                required
                            />
                            <span className="ms-2 text-sm text-slate dark:text-slate-light">
                                Saya setuju dengan <Link className="text-primary font-bold hover:underline">Syarat & Ketentuan</Link>
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.terms}
                            className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/30 disabled:opacity-50 mt-4"
                        >
                            {processing ? 'Mendaftar...' : 'Daftar Sekarang'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-50 dark:border-slate-700">
                        <p className="text-sm text-slate dark:text-slate-light">
                            Sudah punya akun?{' '}
                            <Link href={route('login')} className="text-primary font-bold hover:underline">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
