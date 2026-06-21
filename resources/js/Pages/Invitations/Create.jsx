import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function Create({ themes, categories }) {
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [previewTheme, setPreviewTheme] = useState(null);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setStep(2);
    };

    const handleThemeSelect = (theme) => {
        setSelectedTheme(theme);
        setStep(3);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setTitle(val);
        // Auto-generate slug from title
        const autoSlug = val
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
        setSlug(autoSlug);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !slug) return;

        router.get(route('invitations.editor'), {
            theme: selectedTheme.id,
            category_id: selectedCategory.id,
            title: title,
            slug: slug
        });
    };

    const filteredThemes = selectedCategory
        ? themes.filter(t => t.category.toLowerCase() === selectedCategory.slug.toLowerCase())
        : [];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-navy dark:text-white leading-tight">
                    Buat Undangan Baru
                </h2>
            }
        >
            <Head title="Buat Undangan Baru" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Progress Indicator */}
                    <div className="mb-12 flex justify-between items-center max-w-md mx-auto">
                        {[
                            { step: 1, label: 'Kategori Acara' },
                            { step: 2, label: 'Pilih Template' },
                            { step: 3, label: 'Informasi Dasar' }
                        ].map((s) => (
                            <div key={s.step} className="flex flex-col items-center flex-1 relative">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                                    step >= s.step 
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate'
                                }`}>
                                    {s.step}
                                </div>
                                <span className={`text-xs font-bold mt-2 transition-all ${
                                    step === s.step ? 'text-primary' : 'text-slate dark:text-slate-light'
                                }`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Choose Event Category */}
                    {step === 1 && (
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="text-center mb-8">
                                <h3 className="text-3xl font-extrabold text-navy dark:text-white">Jenis Acara Apa yang Ingin Kamu Buat?</h3>
                                <p className="text-slate dark:text-slate-light mt-2">Pilih kategori acara di bawah ini untuk memulai.</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat)}
                                        className="group p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 hover:border-primary dark:hover:border-primary bg-slate-50/50 dark:bg-slate-900/50 hover:bg-primary/5 dark:hover:bg-primary/5 text-center transition-all duration-300 hover:scale-[1.03]"
                                    >
                                        <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon || '🎉'}</span>
                                        <span className="font-extrabold text-navy dark:text-white text-lg">{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Choose Template */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="flex justify-between items-center">
                                <button onClick={handleBack} className="text-slate font-bold flex items-center gap-2 hover:text-primary transition-colors">
                                    &larr; Kembali ke Kategori
                                </button>
                                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                    Kategori: {selectedCategory?.name}
                                </span>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-700">
                                <div className="text-center mb-8">
                                    <h3 className="text-3xl font-extrabold text-navy dark:text-white">Pilih Template Undangan</h3>
                                    <p className="text-slate dark:text-slate-light mt-2">Pilih desain awal yang paling kamu sukai.</p>
                                </div>

                                {filteredThemes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <span className="text-5xl block mb-4">🎨</span>
                                        <p className="text-slate font-bold">Maaf, belum ada template khusus untuk kategori ini.</p>
                                        <button 
                                            onClick={() => handleThemeSelect({ id: 'modern-minimalist', name: 'Default Modern Theme' })}
                                            className="mt-4 bg-primary text-white px-6 py-2 rounded-full font-bold shadow-lg"
                                        >
                                            Gunakan Template Standar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {filteredThemes.map((theme) => {
                                            const isPremium = theme.id.includes('luxury') || theme.id.includes('modern');
                                            return (
                                                <div 
                                                    key={theme.id} 
                                                    onClick={() => setPreviewTheme(theme)}
                                                    className="group cursor-pointer bg-slate-50 dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-primary dark:hover:border-primary hover:scale-[1.02] transition-all duration-300"
                                                >
                                                    <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                                                        <img src={theme.preview} alt={theme.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute top-4 right-4 bg-navy/80 backdrop-blur text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                            {isPremium ? '💎 Premium' : '⭐ Gratis'}
                                                        </div>
                                                    </div>
                                                    <div className="p-6">
                                                        <h4 className="font-extrabold text-lg text-navy dark:text-white group-hover:text-primary transition-colors">{theme.name}</h4>
                                                        <p className="text-xs text-slate dark:text-slate-light mt-2 line-clamp-2">{theme.description}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Title & Slug Form */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <button onClick={handleBack} className="text-slate font-bold flex items-center gap-2 hover:text-primary transition-colors">
                                &larr; Kembali ke Template
                            </button>

                            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-700">
                                <div className="text-center mb-8">
                                    <h3 className="text-3xl font-extrabold text-navy dark:text-white">Sedikit Lagi Selesai!</h3>
                                    <p className="text-slate dark:text-slate-light mt-2">Beri judul undanganmu dan kustomisasi alamat URL-nya.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                                    <div>
                                        <label className="block text-sm font-bold text-navy dark:text-white mb-2">Judul Undangan</label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={handleTitleChange}
                                            placeholder="Misal: Pernikahan Budi & Siti"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-navy dark:text-white focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-navy dark:text-white mb-2">Link Undangan Kustom</label>
                                        <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-2xl px-4 py-1">
                                            <span className="text-slate font-medium text-sm select-none border-r border-slate-200 dark:border-slate-700 pr-3 mr-3 whitespace-nowrap">
                                                {window.location.host}/v/
                                            </span>
                                            <input
                                                type="text"
                                                required
                                                value={slug}
                                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                placeholder="budi-siti"
                                                className="w-full bg-transparent border-none p-3 pl-0 focus:ring-0 text-navy dark:text-white"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate mt-2 italic">Hanya huruf kecil, angka, dan tanda hubung (-).</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!title || !slug}
                                        className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/30 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                                    >
                                        Mulai Kustomisasi Detail &rarr;
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={previewTheme !== null} onClose={() => setPreviewTheme(null)} maxWidth="2xl">
                {previewTheme && (
                    <div className="p-6 bg-white dark:bg-slate-800 relative">
                        <button 
                            onClick={() => setPreviewTheme(null)} 
                            className="absolute top-4 right-4 text-slate hover:text-red-500 font-bold text-xl z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700"
                        >
                            &times;
                        </button>
                        <h3 className="text-2xl font-extrabold text-navy dark:text-white mb-2">{previewTheme.name}</h3>
                        <p className="text-slate dark:text-slate-light text-sm mb-4">{previewTheme.description}</p>
                        
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-6 flex justify-center">
                            <img 
                                src={previewTheme.preview} 
                                alt={previewTheme.name} 
                                className="w-auto max-w-full max-h-[60vh] object-contain shadow-lg" 
                            />
                        </div>
                        
                        <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                            <a 
                                href={route('theme.preview', previewTheme.id)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-6 py-2 rounded-full font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                Lihat Demo Langsung
                            </a>
                            <button 
                                onClick={() => setPreviewTheme(null)} 
                                className="px-6 py-2 rounded-full font-bold text-slate dark:text-slate-light hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={() => {
                                    handleThemeSelect(previewTheme);
                                    setPreviewTheme(null);
                                }} 
                                className="bg-primary text-white px-8 py-2 rounded-full font-bold shadow-lg hover:bg-primary-hover transition-colors"
                            >
                                Gunakan Template Ini
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
