import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        event_category_id: '',
        data: {
            groom_name: '',
            bride_name: '',
            event_date: '',
            location: '',
            additional_info: '',
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('requests.store'));
    };

    const updateDataField = (field, value) => {
        setData('data', {
            ...data.data,
            [field]: value,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-navy dark:text-white leading-tight">
                    Minta Dibuatkan Undangan
                </h2>
            }
        >
            <Head title="Minta Dibuatkan Undangan" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-navy dark:text-white">Layanan Done-for-You</h3>
                            <p className="text-slate dark:text-slate-light mt-2">
                                Isi data di bawah ini, dan tim admin kami akan membuatkan undangan digital terbaik untuk Anda.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Kategori Acara */}
                            <div>
                                <label className="block text-sm font-bold text-navy dark:text-white mb-2">Pilih Jenis Acara</label>
                                <select
                                    value={data.event_category_id}
                                    onChange={(e) => setData('event_category_id', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all text-navy dark:text-white"
                                    required
                                >
                                    <option value="">Pilih Kategori...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                    ))}
                                </select>
                                {errors.event_category_id && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.event_category_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nama Mempelai Pria */}
                                <div>
                                    <label className="block text-sm font-bold text-navy dark:text-white mb-2">Nama Mempelai Pria</label>
                                    <input
                                        type="text"
                                        value={data.data.groom_name}
                                        onChange={(e) => updateDataField('groom_name', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all text-navy dark:text-white"
                                        placeholder="Contoh: Budi Santoso"
                                        required
                                    />
                                </div>

                                {/* Nama Mempelai Wanita */}
                                <div>
                                    <label className="block text-sm font-bold text-navy dark:text-white mb-2">Nama Mempelai Wanita</label>
                                    <input
                                        type="text"
                                        value={data.data.bride_name}
                                        onChange={(e) => updateDataField('bride_name', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all text-navy dark:text-white"
                                        placeholder="Contoh: Siti Aminah"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Tanggal Acara */}
                            <div>
                                <label className="block text-sm font-bold text-navy dark:text-white mb-2">Tanggal & Waktu Acara</label>
                                <input
                                    type="datetime-local"
                                    value={data.data.event_date}
                                    onChange={(e) => updateDataField('event_date', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all text-navy dark:text-white"
                                    required
                                />
                            </div>

                            {/* Lokasi */}
                            <div>
                                <label className="block text-sm font-bold text-navy dark:text-white mb-2">Lokasi / Alamat Lengkap</label>
                                <textarea
                                    value={data.data.location}
                                    onChange={(e) => updateDataField('location', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all text-navy dark:text-white"
                                    rows="3"
                                    placeholder="Nama Gedung, Jalan, Kota..."
                                    required
                                ></textarea>
                            </div>

                            {/* Info Tambahan */}
                            <div>
                                <label className="block text-sm font-bold text-navy dark:text-white mb-2">Informasi Tambahan (Opsional)</label>
                                <textarea
                                    value={data.data.additional_info}
                                    onChange={(e) => updateDataField('additional_info', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all text-navy dark:text-white"
                                    rows="3"
                                    placeholder="Misal: Mohon pakai tema warna pastel, atau lampirkan link foto..."
                                ></textarea>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                >
                                    {processing ? 'Mengirim...' : 'Kirim Permintaan Ke Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
