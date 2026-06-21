import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Rsvps({ invitation, rsvps }) {
    // Stats
    const stats = {
        hadir: rsvps.filter(r => r.attendance === 'hadir').length,
        tidak_hadir: rsvps.filter(r => r.attendance === 'tidak_hadir').length,
        ragu_ragu: rsvps.filter(r => r.attendance === 'ragu_ragu').length,
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-navy dark:text-white leading-tight">
                            Manajemen RSVP
                        </h2>
                        <p className="text-sm text-slate dark:text-slate-light">{invitation.title}</p>
                    </div>
                    <Link
                        href={route('invitations.index')}
                        className="text-navy dark:text-white font-bold hover:underline"
                    >
                        ← Kembali
                    </Link>
                </div>
            }
        >
            <Head title={`RSVP - ${invitation.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border-l-8 border-green-500">
                            <span className="text-slate dark:text-slate-light font-bold text-sm uppercase tracking-wider">Hadir</span>
                            <div className="text-4xl font-bold text-navy dark:text-white mt-1">{stats.hadir}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border-l-8 border-rose-500">
                            <span className="text-slate dark:text-slate-light font-bold text-sm uppercase tracking-wider">Tidak Hadir</span>
                            <div className="text-4xl font-bold text-navy dark:text-white mt-1">{stats.tidak_hadir}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border-l-8 border-yellow-500">
                            <span className="text-slate dark:text-slate-light font-bold text-sm uppercase tracking-wider">Ragu-Ragu</span>
                            <div className="text-4xl font-bold text-navy dark:text-white mt-1">{stats.ragu_ragu}</div>
                        </div>
                    </div>

                    {/* Guest List Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-navy dark:text-white">Daftar Konfirmasi Tamu</h3>
                            <span className="bg-slate-100 dark:bg-slate-700 px-4 py-1 rounded-full text-sm font-bold">{rsvps.length} Tamu</span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase font-bold">
                                    <tr>
                                        <th className="px-8 py-4">Nama Tamu</th>
                                        <th className="px-8 py-4">Kehadiran</th>
                                        <th className="px-8 py-4">Pesan</th>
                                        <th className="px-8 py-4">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {rsvps.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-12 text-center text-slate-400">Belum ada tamu yang mengisi RSVP.</td>
                                        </tr>
                                    ) : (
                                        rsvps.map((rsvp) => (
                                            <tr key={rsvp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                                <td className="px-8 py-6 font-bold text-navy dark:text-white">{rsvp.name}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                                                        rsvp.attendance === 'hadir' ? 'bg-green-100 text-green-600' :
                                                        rsvp.attendance === 'tidak_hadir' ? 'bg-rose-100 text-rose-600' :
                                                        'bg-yellow-100 text-yellow-600'
                                                    }`}>
                                                        {rsvp.attendance.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-slate dark:text-slate-light italic max-w-xs truncate">
                                                    "{rsvp.message || '-'}"
                                                </td>
                                                <td className="px-8 py-6 text-sm text-slate-400">
                                                    {new Date(rsvp.created_at).toLocaleString('id-ID')}
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
        </AuthenticatedLayout>
    );
}
