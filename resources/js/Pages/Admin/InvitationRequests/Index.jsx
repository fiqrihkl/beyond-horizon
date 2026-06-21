import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ requests }) {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const { data, setData, patch, processing } = useForm({
        status: '',
        admin_notes: '',
    });

    const openModal = (req) => {
        setSelectedRequest(req);
        setData({
            status: req.status,
            admin_notes: req.admin_notes || '',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('admin.requests.update', selectedRequest.id), {
            onSuccess: () => setSelectedRequest(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-navy dark:text-white leading-tight">
                    Kelola Permintaan Undangan
                </h2>
            }
        >
            <Head title="Admin: Permintaan Undangan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Data Acara</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-navy dark:text-white">{req.user.name}</div>
                                            <div className="text-xs text-slate">{req.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xl mr-2">{req.category.icon}</span>
                                            <span className="text-sm font-semibold">{req.category.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-navy dark:text-white line-clamp-1">
                                                {req.data.groom_name} & {req.data.bride_name}
                                            </div>
                                            <div className="text-xs text-slate italic">
                                                {new Date(req.data.event_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                req.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                req.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => openModal(req)}
                                                className="bg-navy dark:bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90"
                                            >
                                                Detail & Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Simple Update Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl">
                        <h3 className="text-xl font-bold text-navy dark:text-white mb-6">Update Permintaan</h3>
                        
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl mb-6 text-sm">
                            <p className="font-bold">Detail Data:</p>
                            <ul className="mt-2 space-y-1 opacity-80">
                                <li>Mempelai: {selectedRequest.data.groom_name} & {selectedRequest.data.bride_name}</li>
                                <li>Lokasi: {selectedRequest.data.location}</li>
                                <li>Info: {selectedRequest.data.additional_info || '-'}</li>
                            </ul>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate mb-2">Status</label>
                                <select 
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate mb-2">Catatan Admin</label>
                                <textarea 
                                    value={data.admin_notes}
                                    onChange={(e) => setData('admin_notes', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl"
                                    placeholder="Tulis pesan ke user jika perlu..."
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setSelectedRequest(null)}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold text-slate hover:bg-slate-100 transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-hover transition-all"
                                >
                                    {processing ? 'Menyimpan...' : 'Update Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
