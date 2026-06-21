import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import InputError from '@/Components/InputError';

export default function Index({ audios }) {
    const [audioToPreview, setAudioToPreview] = useState(null);
    const audioRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        artist: '',
        category: 'Indo',
        file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.audios.store'), {
            onSuccess: () => reset(),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus lagu ini?')) {
            router.delete(route('admin.audios.destroy', id));
        }
    };

    const handlePlayPreview = (audio) => {
        if (audioToPreview?.id === audio.id) {
            setAudioToPreview(null);
            if (audioRef.current) {
                audioRef.current.pause();
            }
        } else {
            setAudioToPreview(audio);
            if (audioRef.current) {
                audioRef.current.src = `/storage/${audio.file_path}`;
                audioRef.current.play();
            }
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-navy dark:text-white leading-tight">
                    Kelola Audio Undangan
                </h2>
            }
        >
            <Head title="Kelola Audio" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Audio Preview Player */}
                    <audio ref={audioRef} className="hidden" onEnded={() => setAudioToPreview(null)} />

                    {/* Upload Section */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-navy dark:text-white mb-6">Unggah Lagu Baru</h3>
                        <form onSubmit={submit} className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-navy dark:text-white mb-2">Judul Lagu *</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary dark:text-white"
                                        placeholder="Cth: Sempurna"
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-navy dark:text-white mb-2">Artis / Penyanyi</label>
                                    <input
                                        type="text"
                                        value={data.artist}
                                        onChange={e => setData('artist', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary dark:text-white"
                                        placeholder="Cth: Andra and The BackBone"
                                    />
                                    <InputError message={errors.artist} className="mt-2" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-navy dark:text-white mb-2">Kategori *</label>
                                <select
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary dark:text-white"
                                    required
                                >
                                    <option value="Indo">Indonesia (Indo)</option>
                                    <option value="Barat">Barat / Internasional</option>
                                    <option value="Kpop">K-Pop / Asia</option>
                                    <option value="Instrumental">Instrumental / Klasik</option>
                                    <option value="Religi">Religi / Islami</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-navy dark:text-white mb-2">File Audio (.mp3) *</label>
                                <input
                                    type="file"
                                    accept=".mp3,audio/mpeg"
                                    onChange={e => setData('file', e.target.files[0])}
                                    className="w-full text-sm text-slate file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:font-bold hover:file:bg-primary/20 transition-all"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-2">Maksimal ukuran file: 10MB.</p>
                                <InputError message={errors.file} className="mt-2" />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30 disabled:opacity-50"
                                >
                                    {processing ? 'Mengunggah...' : 'Unggah Audio'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* List Section */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-navy dark:text-white mb-6">Daftar Audio</h3>
                        
                        {audios.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-500">Belum ada audio yang diunggah.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {audios.map((audio) => (
                                    <div key={audio.id} className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handlePlayPreview(audio)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shadow-md ${audioToPreview?.id === audio.id ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-hover'}`}
                                                >
                                                    {audioToPreview?.id === audio.id ? (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                                                    )}
                                                </button>
                                                <div>
                                                    <h4 className="font-bold text-navy dark:text-white text-sm line-clamp-1">{audio.title}</h4>
                                                    <p className="text-xs text-slate-500 line-clamp-1">{audio.artist || 'Unknown Artist'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                                                {audio.category}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(audio.id)}
                                                className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
