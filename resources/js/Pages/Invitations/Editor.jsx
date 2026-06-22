import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import MapPicker from '@/Components/MapPicker';

export default function Editor({ auth, theme, categories, invitation, musicLibrary = [] }) {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const isEdit = !!invitation;
    const initialCatId = invitation?.event_category_id || urlParams.get('category_id') || '1';
    const selectedThemeId = invitation?.theme_config?.theme_id || theme || urlParams.get('theme') || 'floral-romantic';
    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        event_category_id: initialCatId,
        title: invitation?.title || urlParams.get('title') || '',
        slug: invitation?.slug || urlParams.get('slug') || '',
        theme_config: {
            theme_id: selectedThemeId,
            mode: invitation?.theme_config?.mode || 'light',
            accent_color: invitation?.theme_config?.accent_color || '#F48C06',
        },
        cover_image: null,
        gallery: [],
        music_url: invitation?.music_url || '',
        is_active: invitation?.is_active ?? false,
        content: {
            salam_pembuka: invitation?.content?.salam_pembuka || 'Assalamu\'alaikum Warahmatullahi Wabarakatuh',
            teks_pembuka: invitation?.content?.teks_pembuka || 'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara kami.',
            teks_penutup: invitation?.content?.teks_penutup || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',

            // Mempelai Wanita
            bride_name: invitation?.content?.bride_name || '',
            bride_nickname: invitation?.content?.bride_nickname || '',
            bride_instagram: invitation?.content?.bride_instagram || '',
            bride_parents: invitation?.content?.bride_parents || '',
            bride_photo_url: invitation?.content?.bride_photo || null,
            bride_photo: null,
            // Mempelai Pria
            groom_name: invitation?.content?.groom_name || '',
            groom_nickname: invitation?.content?.groom_nickname || '',
            groom_instagram: invitation?.content?.groom_instagram || '',
            groom_parents: invitation?.content?.groom_parents || '',
            groom_photo_url: invitation?.content?.groom_photo || null,
            groom_photo: null,
            // Anak (Khusus Aqiqah/Khitanan/Birthday)
            child_name: invitation?.content?.child_name || '',
            child_nickname: invitation?.content?.child_nickname || '',
            child_parents: invitation?.content?.child_parents || '',
            child_photo_url: invitation?.content?.child_photo || null,
            child_photo: null,
            // Kisah Cinta / Agenda
            enable_love_story: invitation?.content?.enable_love_story ?? true,
            love_story_media_type: invitation?.content?.love_story_media_type || 'image',
            love_story_video_url: invitation?.content?.love_story_video_url || '',
            love_stories: invitation?.content?.love_stories || [
                { id: Date.now(), date: '2024-01-01', title: 'Pertemuan Pertama', story: 'Pertama kali bertemu', media_type: 'image', image: null, image_url: '', video_url: '' }
            ],
            // Harapan / Doa
            wish_groom: invitation?.content?.wish_groom || 'Semoga menjadi langkah berkah dalam ibadah.',
            wish_bride: invitation?.content?.wish_bride || 'Semoga Allah senantika membimbing langkah kita.',
            wish_family: invitation?.content?.wish_family || 'Semoga diberikan keturunan yang soleh dan solehah.',
            // Kirim Hadiah & Kado
            gifts: invitation?.content?.gifts || [
                { id: Date.now(), type: 'bank', bank_name: 'BCA', account_number: '', account_holder: '' }
            ],
            gift_address: invitation?.content?.gift_address || '',
            // Event Details (Acara Utama)
            events: invitation?.content?.events || [
                {
                    id: Date.now(),
                    name: invitation?.content?.event_name || 'Acara Utama',
                    date: invitation?.content?.event_date || '',
                    time: '09:00 - Selesai',
                    location: invitation?.content?.event_location || '',
                    address: invitation?.content?.event_address || '',
                    lat: invitation?.content?.event_lat || '-6.200000',
                    lng: invitation?.content?.event_lng || '106.816666',
                    zoom: invitation?.content?.event_zoom || '15'
                }
            ],

            // Hero / Background Image (setelah dibuka)
            hero_image_url: invitation?.content?.hero_image || null,
            hero_image: null,
            // Video Prewedding (Tema Monochrome 3D Cinema)
            prewedding_video_url: invitation?.content?.prewedding_video_url || '',

            // RPG Biker Caricature Character Image
            character_image_url: invitation?.content?.character_image || null,
            character_image: null,
        },
        existing_gallery: invitation?.gallery || [],
        cleared_gallery: false,
    });
    const [viewMode, setViewMode] = useState('edit');
    const [toastMessage, setToastMessage] = useState("");
    const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
    const [musicSearch, setMusicSearch] = useState('');
    const [previewingTrackId, setPreviewingTrackId] = useState(null);
    const previewAudioRef = useRef(null);
    const handlePlayPreview = (track) => {
        if (previewingTrackId === track.id) {
            previewAudioRef.current.pause();
            setPreviewingTrackId(null);
        } else {
            setPreviewingTrackId(track.id);
            if (previewAudioRef.current) {
                previewAudioRef.current.src = track.url;
                previewAudioRef.current.play().catch(err => console.log("Audio preview blocked:", err));
            }
        }
    };
    const handleSelectMusic = (track) => {
        setData('music_url', track.url);
        if (previewAudioRef.current) {
            previewAudioRef.current.pause();
        }
        setPreviewingTrackId(null);
        setIsMusicModalOpen(false);
    };
    useEffect(() => {
        if (!isMusicModalOpen && previewAudioRef.current) {
            previewAudioRef.current.pause();
            setPreviewingTrackId(null);
        }
    }, [isMusicModalOpen]);
    const [activeTab, setActiveTab] = useState('info');
    const [coverPreview, setCoverPreview] = useState(invitation?.cover_image ? `/storage/${invitation.cover_image}` : null);
    const [heroPreview, setHeroPreview] = useState(invitation?.content?.hero_image ? `/storage/${invitation.content.hero_image}` : null);
    const [bridePhotoPreview, setBridePhotoPreview] = useState(invitation?.content?.bride_photo ? `/storage/${invitation.content.bride_photo}` : null);
    const [groomPhotoPreview, setGroomPhotoPreview] = useState(invitation?.content?.groom_photo ? `/storage/${invitation.content.groom_photo}` : null);
    const [childPhotoPreview, setChildPhotoPreview] = useState(invitation?.content?.child_photo ? `/storage/${invitation.content.child_photo}` : null);
    const [characterImagePreview, setCharacterImagePreview] = useState(invitation?.content?.character_image ? `/storage/${invitation.content.character_image}` : null);
    const [loveStoryImagePreview, setLoveStoryImagePreview] = useState(invitation?.content?.love_story_image ? `/storage/${invitation.content.love_story_image}` : null);
    const selectedCategory = categories.find(c => c.id === parseInt(data.event_category_id));
    const catSlug = selectedCategory ? selectedCategory.slug.toLowerCase() : 'pernikahan';
    const isPernikahanOrSyukuran = catSlug === 'pernikahan' || catSlug === 'syukuran';
    const isCinemaTheme = selectedThemeId === 'monochrome-3d-cinema';
    const themeColor = isCinemaTheme ? '#D4AF37' : (data.theme_config.accent_color || '#F48C06');
    // File Preview Helpers
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('cover_image', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };
    const handleHeroChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleNestedPhotoChange('hero_image', file, setHeroPreview);
        }
    };
    const handleLoveStoryImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleNestedPhotoChange('love_story_image', file, setLoveStoryImagePreview);
        }
    };
    const handleNestedPhotoChange = (field, file, setPreview) => {
        if (file) {
            setData('content', {
                ...data.content,
                [field]: file
            });
            setPreview(URL.createObjectURL(file));
        }
    };
    const updateContent = (field, value) => {
        setData('content', {
            ...data.content,
            [field]: value
        });
    };
    // Dynamic Array Handlers
    const handleAddEvent = () => {
        const events = [...data.content.events, { id: Date.now(), name: 'Acara Baru', date: '', time: '', location: '', address: '', lat: '-6.200000', lng: '106.816666', zoom: '15' }];
        updateContent('events', events);
    };
    const handleEventChange = (index, key, value) => {
        const events = [...data.content.events];
        events[index][key] = value;
        updateContent('events', events);
    };
    const handleRemoveEvent = (index) => {
        const events = data.content.events.filter((_, idx) => idx !== index);
        updateContent('events', events);
    };
    const handleAddGift = () => {
        const gifts = [...data.content.gifts, { id: Date.now(), type: 'bank', bank_name: '', account_number: '', account_holder: '' }];
        updateContent('gifts', gifts);
    };
    const handleGiftChange = (index, key, value) => {
        const gifts = [...data.content.gifts];
        gifts[index][key] = value;
        updateContent('gifts', gifts);
    };
    const handleRemoveGift = (index) => {
        const gifts = data.content.gifts.filter((_, idx) => idx !== index);
        updateContent('gifts', gifts);
    };
    const handleAddStory = () => {
        const stories = [...data.content.love_stories, { id: Date.now(), date: '', title: '', story: '', media_type: 'image', image: null, image_url: '', video_url: '' }];
        updateContent('love_stories', stories);
    };
    const handleStoryChange = (index, key, value) => {
        const stories = [...data.content.love_stories];
        stories[index][key] = value;
        updateContent('love_stories', stories);
    };
    const handleStoryImageChange = (index, file) => {
        if (file) {
            const stories = [...data.content.love_stories];
            stories[index].image = file;
            stories[index].image_preview = URL.createObjectURL(file);
            updateContent('love_stories', stories);
        }
    };
    const handleRemoveStory = (index) => {
        const stories = data.content.love_stories.filter((_, idx) => idx !== index);
        updateContent('love_stories', stories);
    };
    const [submitTrigger, setSubmitTrigger] = useState(null);
    const triggerSave = (status) => {
        setData('is_active', status);
        setSubmitTrigger(status ? 'publish' : 'draft');
    };
    useEffect(() => {
        if (submitTrigger !== null) {
            const options = {
                preserveScroll: true,
                onSuccess: () => {
                    setToastMessage('Berhasil disimpan!');
                    setTimeout(() => setToastMessage(''), 3000);
                },
                onError: (errs) => {
                    setToastMessage('❌ Gagal menyimpan. Periksa isian form (Judul/Slug)!');
                    setTimeout(() => setToastMessage(''), 4000);
                    if (errs.title || errs.slug) {
                        setActiveTab('info');
                    }
                }
            };
            if (isEdit) {
                post(route('invitations.update', invitation.id), options);
            } else {
                post(route('invitations.store'), options);
            }
            setSubmitTrigger(null);
        }
    }, [data.is_active, submitTrigger]);
    const isPublishDisabled = !data.title || !data.slug || (!data.content.events?.[0]?.date && !data.content.event_date) || (!data.content.events?.[0]?.location && !data.content.event_location);
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                    <div>
                        <h2 className="text-2xl font-bold text-navy dark:text-white leading-tight">
                            {isEdit ? 'Edit Undangan' : 'Buat Undangan Detail'}: <span className="text-primary">{selectedThemeId.replace('-', ' ').toUpperCase()}</span>
                        </h2>
                        {isPublishDisabled && (
                            <p className="text-[10px] text-amber-600 font-bold mt-1">
                                ⚠️ Judul, Slug, Tanggal Acara, dan Tempat wajib diisi untuk mempublikasikan.
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        {isEdit && (
                            <a
                                href={route('invitations.show', invitation.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 md:flex-none bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-full font-bold shadow-md transition-all text-xs flex items-center justify-center gap-1.5"
                            >
                                👁️ Pratinjau Penuh
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => triggerSave(false)}
                            disabled={processing}
                            className="flex-1 md:flex-none bg-slate-200 hover:bg-slate-350 dark:bg-slate-700 text-slate dark:text-white px-6 py-3 rounded-full font-bold shadow-md transition-all text-xs"
                        >
                            {processing && submitTrigger === 'draft' ? 'Menyimpan...' : 'Simpan Sementara (Draft)'}
                        </button>
                        <button
                            type="button"
                            onClick={() => triggerSave(true)}
                            disabled={processing || isPublishDisabled}
                            className={`flex-1 md:flex-none text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all text-xs ${isPublishDisabled
                                    ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed shadow-none'
                                    : 'bg-primary hover:bg-primary-hover shadow-primary/20'
                                }`}
                        >
                            {processing && submitTrigger === 'publish' ? 'Memublikasikan...' : 'Publikasikan Sekarang'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Editor Detail Undangan" />
            <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row overflow-hidden">
                {/* View Mode Toggle for Mobile */}
                <div className="lg:hidden flex bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => setViewMode('edit')}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-center transition-all ${viewMode === 'edit' ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate'}`}
                    >
                        📝 Edit Data
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('preview')}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-center transition-all ${viewMode === 'preview' ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate'}`}
                    >
                        👁️ Preview Live
                    </button>
                </div>
                {/* LEFT SIDE: FORM EDITOR (SCROLLABLE) */}
                <div className={`w-full lg:w-3/5 xl:w-2/3 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 overflow-y-auto custom-scrollbar p-6 md:p-8 ${viewMode === 'edit' ? 'block' : 'hidden lg:block'}`}>

                    {/* Navigation Tabs */}
                    <div className="flex gap-4 mb-8 overflow-x-auto border-b border-slate-100 dark:border-slate-700 pb-4 scrollbar-none">
                        {[
                            { id: 'info', label: 'Informasi' },
                            { id: 'mempelai', label: isPernikahanOrSyukuran ? 'Mempelai' : 'Penerima' },
                            { id: 'kisah', label: isPernikahanOrSyukuran ? 'Kisah Cinta' : 'Agenda' },
                            { id: 'doa', label: 'Doa/Harapan' },
                            { id: 'acara', label: 'Acara & Peta' },
                            { id: 'galeri', label: 'Galeri & Kado' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-50 dark:bg-slate-900 text-slate hover:bg-slate-100'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-6 pb-20">
                        {/* Tab 1: Info & Cover */}
                        {activeTab === 'info' && (
                            <div className="space-y-6 animate-in slide-in-from-left duration-300">
                                <h4 className="font-extrabold text-navy dark:text-white text-lg">Informasi Dasar & Salam</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-1">Judul Undangan</label>
                                    <input
                                        type="text"
                                        className={`w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-3 ${errors.title ? 'border border-red-500' : 'border-none'}`}
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        placeholder="Pernikahan Budi & Siti"
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-1">Slug URL</label>
                                    <input
                                        type="text"
                                        className={`w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-3 ${errors.slug ? 'border border-red-500' : 'border-none'}`}
                                        value={data.slug}
                                        onChange={e => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="budi-siti"
                                    />
                                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-1">Foto Cover (Amplop Depan)</label>
                                    {coverPreview && (
                                        <img src={coverPreview} className="w-full h-40 object-cover rounded-xl mb-3 border border-slate-100" alt="Cover Preview" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full text-xs text-slate file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        onChange={handleCoverChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-1">Foto Halaman Utama (Hero)</label>
                                    {heroPreview && (
                                        <img src={heroPreview} className="w-full h-40 object-cover rounded-xl mb-3 border border-slate-100" alt="Hero Preview" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full text-xs text-slate file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        onChange={handleHeroChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-1">Salam Pembuka</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3"
                                        value={data.content.salam_pembuka}
                                        onChange={e => updateContent('salam_pembuka', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-1">Teks Pembuka</label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3"
                                        value={data.content.teks_pembuka}
                                        onChange={e => updateContent('teks_pembuka', e.target.value)}
                                        rows="3"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-1">Teks Penutup</label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3"
                                        value={data.content.teks_penutup}
                                        onChange={e => updateContent('teks_penutup', e.target.value)}
                                        rows="3"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-2">Musik Latar Belakang</label>

                                    {data.music_url ? (
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-3 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🎵</span>
                                                <div>
                                                    <p className="text-sm font-bold text-navy dark:text-white">
                                                        {musicLibrary.find(t => t.url === data.music_url)?.title || 'Musik Kustom'}
                                                    </p>
                                                    <p className="text-xs text-slate">
                                                        {musicLibrary.find(t => t.url === data.music_url)?.artist || 'Sumber luar / URL'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setData('music_url', '')}
                                                className="text-red-500 text-xs font-bold hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-2xl text-center mb-3">
                                            <span className="text-3xl block mb-2">🎵</span>
                                            <p className="text-xs text-slate mb-3">Belum ada musik latar belakang terpilih</p>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setIsMusicModalOpen(true)}
                                        className="w-full bg-primary/10 text-primary py-3 rounded-xl font-bold text-sm hover:bg-primary/20 transition-all text-center block"
                                    >
                                        🔍 Pilih dari Pustaka Musik
                                    </button>
                                    {/* Fallback Custom URL Input */}
                                    <div className="mt-4">
                                        <label className="block text-[10px] font-bold text-slate uppercase mb-1">Atau Gunakan URL Custom MP3</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-xs"
                                            value={data.music_url}
                                            onChange={e => setData('music_url', e.target.value)}
                                            placeholder="https://example.com/music.mp3"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Tab 2: Mempelai (Pernikahan) / Anak (Lainnya) */}
                        {activeTab === 'mempelai' && (
                            <div className="space-y-8 animate-in slide-in-from-left duration-300">
                                {selectedThemeId === 'rpg-touring' && (
                                    <div className="space-y-4 p-6 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 rounded-[1.5rem] mb-6">
                                        <h5 className="font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-xs border-b border-amber-500/20 pb-2 flex items-center gap-1.5">
                                            🎮 Kustomisasi Karakter Game (Karikatur)
                                        </h5>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate uppercase mb-1">Upload Gambar Karikatur Berboncengan (PNG Transparan)</label>
                                            {characterImagePreview && (
                                                <div className="bg-slate-900/5 dark:bg-slate-900/50 p-4 rounded-xl inline-block mb-2 border border-slate-200 dark:border-slate-800">
                                                    <img src={characterImagePreview} className="h-24 object-contain" alt="Karakter Karikatur" />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => handleNestedPhotoChange('character_image', e.target.files[0], setCharacterImagePreview)}
                                                className="w-full text-xs text-slate file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-amber-500/15 file:text-amber-700 dark:file:text-amber-400"
                                            />
                                            <p className="text-[10px] text-slate dark:text-slate-light mt-1.5 italic">
                                                *Opsional. Biarkan kosong untuk menggunakan karakter pengendara motor default untuk demo/preview. Format PNG transparan direkomendasikan.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {isPernikahanOrSyukuran ? (
                                    <>
                                        {/* MEMPELAI WANITA */}
                                        <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem]">
                                            <h5 className="font-extrabold text-navy dark:text-white uppercase tracking-wider text-xs border-b pb-2">Mempelai Wanita</h5>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Nama Lengkap</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                    value={data.content.bride_name}
                                                    onChange={e => updateContent('bride_name', e.target.value)}
                                                    placeholder="Siti Aminah"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Nama Panggilan</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                    value={data.content.bride_nickname}
                                                    onChange={e => updateContent('bride_nickname', e.target.value)}
                                                    placeholder="Siti"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Instagram (@Username)</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                    value={data.content.bride_instagram || ''}
                                                    onChange={e => updateContent('bride_instagram', e.target.value)}
                                                    placeholder="adinda_mawaria"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Putri dari Bapak & Ibu</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                    value={data.content.bride_parents}
                                                    onChange={e => updateContent('bride_parents', e.target.value)}
                                                    placeholder="Anak pertama dari Bpk. Ahmad & Ibu Fatimah"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Foto Mempelai Wanita</label>
                                                {bridePhotoPreview && (
                                                    <img src={bridePhotoPreview} className="w-24 h-24 object-cover rounded-full mb-2 border-2 border-primary" alt="Bride" />
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => handleNestedPhotoChange('bride_photo', e.target.files[0], setBridePhotoPreview)}
                                                    className="w-full text-xs text-slate file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary"
                                                />
                                            </div>
                                        </div>
                                        {/* MEMPELAI PRIA */}
                                        <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem]">
                                            <h5 className="font-extrabold text-navy dark:text-white uppercase tracking-wider text-xs border-b pb-2">Mempelai Pria</h5>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Nama Lengkap</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                    value={data.content.groom_name}
                                                    onChange={e => updateContent('groom_name', e.target.value)}
                                                    placeholder="Budi Santoso"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Nama Panggilan</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                    value={data.content.groom_nickname}
                                                    onChange={e => updateContent('groom_nickname', e.target.value)}
                                                    placeholder="Budi"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Instagram (@Username)</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                    value={data.content.groom_instagram || ''}
                                                    onChange={e => updateContent('groom_instagram', e.target.value)}
                                                    placeholder="budi_santoso"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Putra dari Bapak & Ibu</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                    value={data.content.groom_parents}
                                                    onChange={e => updateContent('groom_parents', e.target.value)}
                                                    placeholder="Anak kedua dari Bpk. Hartono & Ibu Indah"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Foto Mempelai Pria</label>
                                                {groomPhotoPreview && (
                                                    <img src={groomPhotoPreview} className="w-24 h-24 object-cover rounded-full mb-2 border-2 border-primary" alt="Groom" />
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => handleNestedPhotoChange('groom_photo', e.target.files[0], setGroomPhotoPreview)}
                                                    className="w-full text-xs text-slate file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* ANAK / PENERIMA ACARA */
                                    <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem]">
                                        <h5 className="font-extrabold text-navy dark:text-white uppercase tracking-wider text-xs border-b pb-2">Informasi Anak / Penerima Acara</h5>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate uppercase mb-1">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                value={data.content.child_name}
                                                onChange={e => updateContent('child_name', e.target.value)}
                                                placeholder="Ahmad Rafisqy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate uppercase mb-1">Nama Panggilan</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                value={data.content.child_nickname}
                                                onChange={e => updateContent('child_nickname', e.target.value)}
                                                placeholder="Rafisqy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate uppercase mb-1">Putra/Putri dari Bapak & Ibu</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                value={data.content.child_parents}
                                                onChange={e => updateContent('child_parents', e.target.value)}
                                                placeholder="Putra tercinta dari Bpk. Hermawan & Ibu Laras"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate uppercase mb-1">Foto Penerima Acara</label>
                                            {childPhotoPreview && (
                                                <img src={childPhotoPreview} className="w-24 h-24 object-cover rounded-full mb-2 border-2 border-primary" alt="Child" />
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => handleNestedPhotoChange('child_photo', e.target.files[0], setChildPhotoPreview)}
                                                className="w-full text-xs text-slate file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Tab 3: Kisah Cinta */}
                        {activeTab === 'kisah' && (
                            <div className="space-y-6 animate-in slide-in-from-left duration-300">
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <h4 className="font-extrabold text-navy dark:text-white text-sm">
                                        Gunakan Fitur {isPernikahanOrSyukuran ? 'Kisah Cinta' : 'Agenda'}
                                    </h4>
                                    <input
                                        type="checkbox"
                                        checked={data.content.enable_love_story !== false}
                                        onChange={e => updateContent('enable_love_story', e.target.checked)}
                                        className="rounded border-slate-300 text-primary focus:ring-primary w-5 h-5"
                                    />
                                </div>
                                {data.content.enable_love_story !== false && (
                                    <>
                                        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                                            <h4 className="font-extrabold text-navy dark:text-white text-md mb-4">Media {isPernikahanOrSyukuran ? 'Kisah Cinta' : 'Agenda'}</h4>
                                            <div className="flex gap-4 mb-3">
                                                <label className="flex items-center gap-2 text-xs font-bold text-slate cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="global_media_type"
                                                        value="image"
                                                        checked={data.content.love_story_media_type === 'image' || !data.content.love_story_media_type}
                                                        onChange={() => updateContent('love_story_media_type', 'image')}
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    Upload Foto
                                                </label>
                                                <label className="flex items-center gap-2 text-xs font-bold text-slate cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="global_media_type"
                                                        value="video"
                                                        checked={data.content.love_story_media_type === 'video'}
                                                        onChange={() => updateContent('love_story_media_type', 'video')}
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    Link Video (YouTube/Drive)
                                                </label>
                                            </div>

                                            {data.content.love_story_media_type === 'video' ? (
                                                <input
                                                    type="text"
                                                    value={data.content.love_story_video_url || ''}
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    onChange={e => updateContent('love_story_video_url', e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-xs"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    {(loveStoryImagePreview) && (
                                                        <img
                                                            src={loveStoryImagePreview}
                                                            className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                                                            alt="Preview"
                                                        />
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLoveStoryImageChange}
                                                        className="w-full text-xs text-slate file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-extrabold text-navy dark:text-white text-lg">
                                                Daftar {isPernikahanOrSyukuran ? 'Cerita' : 'Agenda'}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={handleAddStory}
                                                className="bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-xs hover:bg-primary/20 transition-all"
                                            >
                                                + Tambah Cerita
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {data.content.love_stories.map((story, index) => (
                                                <div key={story.id || index} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveStory(index)}
                                                        className="absolute top-2 right-2 text-slate hover:text-red-500 font-bold text-sm bg-white dark:bg-slate-800 w-8 h-8 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ✕
                                                    </button>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Tanggal / Waktu</label>
                                                                <input
                                                                    type="text"
                                                                    value={story.date}
                                                                    placeholder="Misal: Jan 2024"
                                                                    onChange={e => handleStoryChange(index, 'date', e.target.value)}
                                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-xs"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Judul Cerita</label>
                                                                <input
                                                                    type="text"
                                                                    value={story.title}
                                                                    placeholder="Awal Bertemu"
                                                                    onChange={e => handleStoryChange(index, 'title', e.target.value)}
                                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate uppercase mb-1">Isi Cerita</label>
                                                            <textarea
                                                                value={story.story}
                                                                placeholder="Ceritakan momen indah di waktu tersebut..."
                                                                onChange={e => handleStoryChange(index, 'story', e.target.value)}
                                                                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-xs"
                                                                rows="3"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {/* Tab 4: Harapan & Doa */}
                        {activeTab === 'doa' && (
                            <div className="space-y-6 animate-in slide-in-from-left duration-300">
                                <h4 className="font-extrabold text-navy dark:text-white text-lg">Doa & Harapan</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-1">Doa / Harapan Pria</label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3"
                                        value={data.content.wish_groom}
                                        onChange={e => updateContent('wish_groom', e.target.value)}
                                        rows="3"
                                    ></textarea>
                                </div>
                                {isPernikahanOrSyukuran && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate uppercase mb-1">Doa / Harapan Wanita</label>
                                        <textarea
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3"
                                            value={data.content.wish_bride}
                                            onChange={e => updateContent('wish_bride', e.target.value)}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-slate uppercase mb-1">Doa / Harapan Keluarga</label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3"
                                        value={data.content.wish_family}
                                        onChange={e => updateContent('wish_family', e.target.value)}
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>
                        )}
                        {/* Tab 5: Acara & Peta */}
                        {activeTab === 'acara' && (
                            <div className="space-y-6 animate-in slide-in-from-left duration-300">
                                <h4 className="font-extrabold text-navy dark:text-white text-lg">Rangkaian Acara</h4>

                                {data.content.events.map((event, index) => (
                                    <div key={event.id || index} className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] relative group">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <h5 className="font-extrabold text-navy dark:text-white text-xs uppercase tracking-widest">Acara {index + 1}</h5>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEvent(index)}
                                                className="text-red-500 hover:text-red-700 bg-red-100 px-3 py-1 rounded-full text-[10px] font-bold transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate uppercase mb-1">Nama Acara</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                value={event.name}
                                                onChange={e => handleEventChange(index, 'name', e.target.value)}
                                                placeholder="Akad Nikah / Resepsi"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Tanggal</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-xs"
                                                    value={event.date}
                                                    onChange={e => handleEventChange(index, 'date', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate uppercase mb-1">Waktu / Jam</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-xs"
                                                    value={event.time}
                                                    onChange={e => handleEventChange(index, 'time', e.target.value)}
                                                    placeholder="09:00 - Selesai"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate uppercase mb-1">Tempat / Gedung</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                                value={event.location}
                                                onChange={e => handleEventChange(index, 'location', e.target.value)}
                                                placeholder="Masjid Agung / Gedung Mawar"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate uppercase mb-1">Alamat Lengkap</label>
                                            <textarea
                                                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-xs"
                                                value={event.address}
                                                onChange={e => handleEventChange(index, 'address', e.target.value)}
                                                rows="2"
                                                placeholder="Jl. Raya No. 12"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate uppercase mb-1">Link Google Maps (URL)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-xs"
                                                value={event.map_url || ''}
                                                onChange={e => handleEventChange(index, 'map_url', e.target.value)}
                                                placeholder="https://maps.app.goo.gl/..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate uppercase mb-1 mt-4">Pilih Titik Lokasi Peta (Pin Merah)</label>
                                            <div className="text-[10px] text-slate-500 mb-2">Geser peta dan posisikan pin merah pada lokasi yang tepat. Ini akan menjadi tampilan default pada undangan.</div>
                                            <MapPicker
                                                defaultLat={event.lat}
                                                defaultLng={event.lng}
                                                onLocationSelect={(lat, lng) => {
                                                    handleEventChange(index, 'lat', lat);
                                                    handleEventChange(index, 'lng', lng);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddEvent}
                                    className="w-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 py-4 rounded-xl font-bold border border-dashed border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all text-xs"
                                >
                                    + Tambah Acara Lainnya
                                </button>
                            </div>
                        )}
                        {/* Tab 6: Galeri & Hadiah */}
                        {activeTab === 'galeri' && (
                            <div className="space-y-6 animate-in slide-in-from-left duration-300">
                                <h4 className="font-extrabold text-navy dark:text-white text-lg">Media & Hadiah Digital</h4>

                                <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem]">
                                    <h5 className="font-extrabold text-navy dark:text-white text-xs border-b pb-2 uppercase tracking-widest">Galeri Foto</h5>
                                    <div>
                                        <label className="block text-xs font-bold text-slate uppercase mb-1">Tambah Foto Galeri Baru (Bisa multiple)</label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={e => setData('gallery', [...data.gallery, ...Array.from(e.target.files)])}
                                            className="w-full text-xs text-slate file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary"
                                        />
                                        <p className="text-[10px] text-slate mt-1">Pilih beberapa foto sekaligus untuk ditambahkan ke galeri Anda.</p>
                                    </div>

                                    {data.gallery && data.gallery.length > 0 && (
                                        <div className="mt-4">
                                            <label className="block text-xs font-bold text-slate uppercase mb-2 text-green-600 dark:text-green-400">Foto Baru (Belum Disimpan)</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {data.gallery.map((file, index) => (
                                                    <div key={index} className="relative group rounded-xl overflow-hidden aspect-square border-2 border-green-400 dark:border-green-600">
                                                        <img src={URL.createObjectURL(file)} alt={`New Gallery ${index}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updatedGallery = data.gallery.filter((_, i) => i !== index);
                                                                setData('gallery', updatedGallery);
                                                            }}
                                                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-bold text-xs"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {data.existing_gallery && data.existing_gallery.length > 0 && (
                                        <div className="mt-4">
                                            <label className="block text-xs font-bold text-slate uppercase mb-2">Foto Galeri Saat Ini</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {data.existing_gallery.map((imgUrl, index) => (
                                                    <div key={index} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200">
                                                        <img src={`/storage/${imgUrl}`} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updatedGallery = data.existing_gallery.filter((_, i) => i !== index);
                                                                setData('existing_gallery', updatedGallery);
                                                                setData({
                                                                    ...data,
                                                                    existing_gallery: updatedGallery,
                                                                    cleared_gallery: updatedGallery.length === 0
                                                                });
                                                            }}
                                                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-bold text-xs"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem]">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h5 className="font-extrabold text-navy dark:text-white text-xs uppercase tracking-widest">Kirim Hadiah & Kado</h5>
                                    </div>

                                    <div className="space-y-4">
                                        {data.content.gifts.map((gift, index) => (
                                            <div key={gift.id || index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveGift(index)}
                                                    className="absolute top-2 right-2 text-slate hover:text-red-500 font-bold text-sm bg-white dark:bg-slate-800 w-8 h-8 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ✕
                                                </button>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate uppercase mb-1">Tipe</label>
                                                        <select
                                                            className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-xs"
                                                            value={gift.type}
                                                            onChange={e => handleGiftChange(index, 'type', e.target.value)}
                                                        >
                                                            <option value="bank">Rekening Bank</option>
                                                            <option value="ewallet">E-Wallet (Dana/Ovo/Gopay)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate uppercase mb-1">Nama Bank / E-Wallet</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-xs"
                                                            value={gift.bank_name}
                                                            onChange={e => handleGiftChange(index, 'bank_name', e.target.value)}
                                                            placeholder="BCA / DANA"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate uppercase mb-1">No. Rekening / No. HP</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-xs"
                                                            value={gift.account_number}
                                                            onChange={e => handleGiftChange(index, 'account_number', e.target.value)}
                                                            placeholder="1234567890"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate uppercase mb-1">Atas Nama</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-xs"
                                                            value={gift.account_holder}
                                                            onChange={e => handleGiftChange(index, 'account_holder', e.target.value)}
                                                            placeholder="Budi Santoso"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={handleAddGift}
                                            className="w-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 py-3 rounded-xl font-bold border border-dashed border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all text-xs"
                                        >
                                            + Tambah Rekening Lain
                                        </button>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <label className="block text-[10px] font-bold text-slate uppercase mb-1">Alamat Kirim Kado Fisik</label>
                                        <textarea
                                            className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3"
                                            value={data.content.gift_address}
                                            onChange={e => updateContent('gift_address', e.target.value)}
                                            rows="3"
                                            placeholder="Alamat lengkap penerima kado..."
                                        />
                                    </div>
                                    {data.theme_config.theme_id === 'monochrome-3d-cinema' && (
                                        <div className="pt-4 animate-in fade-in duration-300 border-t border-slate-100 dark:border-slate-800 mt-4">
                                            <label className="block text-xs font-bold text-slate uppercase mb-1">URL Video Prewedding (MP4 Direct Link)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-xs"
                                                value={data.content.prewedding_video_url}
                                                onChange={e => updateContent('prewedding_video_url', e.target.value)}
                                                placeholder="https://example.com/prewedding-video.mp4"
                                            />
                                            <p className="text-[10px] text-slate mt-1">Gunakan link langsung ke file .mp4. Kosongkan untuk menggunakan video default premium.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* RIGHT SIDE: LIVE PREVIEW (IPHONE MOCKUP) */}
                <div className={`w-full lg:w-2/5 xl:w-1/3 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 md:p-8 relative overflow-hidden ${viewMode === 'preview' ? 'flex h-[calc(100vh-190px)] lg:h-auto' : 'hidden lg:flex'}`}>
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-10 right-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 left-10 w-64 h-64 bg-navy rounded-full blur-3xl"></div>
                    </div>
                    {/* Smartphone Frame */}
                    <div className="relative h-[90%] max-h-[640px] aspect-[9/19] w-auto bg-white dark:bg-black rounded-[3rem] border-[8px] md:border-[10px] border-slate-800 dark:border-slate-950 shadow-2xl overflow-hidden animate-in zoom-in duration-500 flex flex-col">
                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 w-full h-8 flex justify-between items-center px-8 z-20">
                            <span className="text-[10px] font-bold dark:text-white">9:41</span>
                            <div className="flex gap-1">
                                <div className="w-4 h-2 bg-slate-400 rounded-sm"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                            </div>
                        </div>
                        {/* PREVIEW CONTENT AREA */}
                        <div className={`w-full h-full overflow-y-auto custom-scrollbar ${data.theme_config.mode === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-navy'}`}>

                            {/* COVER IMAGE */}
                            {coverPreview ? (
                                <div className="h-60 w-full relative">
                                    <img src={coverPreview} className="w-full h-full object-cover" alt="Cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-6">
                                        <div className="text-white">
                                            <span className="text-[10px] font-bold tracking-widest text-primary uppercase block" style={{ color: themeColor }}>
                                                {selectedCategory?.name}
                                            </span>
                                            <h2 className="text-xl font-extrabold">{data.title || 'Judul Undangan'}</h2>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 bg-slate-200 dark:bg-slate-900 flex items-center justify-center text-xs text-slate">
                                    Belum ada foto cover
                                </div>
                            )}
                            {/* MAIN SIMULATION CONTENT */}
                            <div className="p-6 text-center space-y-8">
                                <div>
                                    <p className="text-xs italic opacity-75">"{data.content.salam_pembuka}"</p>
                                    <p className="text-xs opacity-75 mt-2 max-w-xs mx-auto leading-relaxed whitespace-pre-line">{data.content.teks_pembuka}</p>
                                </div>
                                <div className="w-12 h-1 mx-auto rounded-full" style={{ backgroundColor: themeColor }}></div>
                                {/* NAMES SHOWCASE */}
                                {isPernikahanOrSyukuran ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col items-center">
                                            {bridePhotoPreview ? (
                                                <img src={bridePhotoPreview} className="w-16 h-16 object-cover rounded-full mb-2 shadow" alt="Bride" />
                                            ) : (
                                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 flex items-center justify-center text-xl">👩</div>
                                            )}
                                            {data.content.bride_instagram && (
                                                <span className="text-[9px] opacity-70 flex items-center gap-1 font-semibold tracking-wider uppercase mb-1">
                                                    📸 {data.content.bride_instagram}
                                                </span>
                                            )}
                                            <span className="font-extrabold text-sm" style={{ color: themeColor }}>{data.content.bride_name || 'Nama Mempelai Wanita'}</span>
                                            <span className="text-[10px] opacity-60 italic">{data.content.bride_parents || 'Putri Bpk. X & Ibu Y'}</span>
                                        </div>
                                        <div className="text-xs font-serif font-bold opacity-40">&</div>
                                        <div className="flex flex-col items-center">
                                            {groomPhotoPreview ? (
                                                <img src={groomPhotoPreview} className="w-16 h-16 object-cover rounded-full mb-2 shadow" alt="Groom" />
                                            ) : (
                                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 flex items-center justify-center text-xl">👨</div>
                                            )}
                                            {data.content.groom_instagram && (
                                                <span className="text-[9px] opacity-70 flex items-center gap-1 font-semibold tracking-wider uppercase mb-1">
                                                    📸 {data.content.groom_instagram}
                                                </span>
                                            )}
                                            <span className="font-extrabold text-sm" style={{ color: themeColor }}>{data.content.groom_name || 'Nama Mempelai Pria'}</span>
                                            <span className="text-[10px] opacity-60 italic">{data.content.groom_parents || 'Putra Bpk. A & Ibu B'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        {childPhotoPreview ? (
                                            <img src={childPhotoPreview} className="w-20 h-20 object-cover rounded-full mb-2 shadow" alt="Child" />
                                        ) : (
                                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 flex items-center justify-center text-2xl">👶</div>
                                        )}
                                        <span className="font-extrabold text-lg" style={{ color: themeColor }}>{data.content.child_name || 'Nama Anak'}</span>
                                        <span className="text-[10px] opacity-60 italic">{data.content.child_parents || 'Putra/i Bpk. X & Ibu Y'}</span>
                                    </div>
                                )}
                                {/* EVENT DETAILS */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-left space-y-2">
                                    <span className="font-extrabold text-[10px] text-slate uppercase block tracking-wider">{data.content.event_name}</span>
                                    <p className="text-[11px] font-bold">{data.content.event_date ? new Date(data.content.event_date).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : 'Tanggal Belum Set'}</p>
                                    <p className="text-[10px] opacity-75 font-semibold">{data.content.event_location}</p>
                                    <p className="text-[9px] opacity-60 leading-relaxed">{data.content.event_address}</p>
                                </div>
                                {/* NEXT EVENT IF ACTIVE */}
                                {data.content.next_event_active && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-left space-y-2">
                                        <span className="font-extrabold text-[10px] text-slate uppercase block tracking-wider">{data.content.next_event_name}</span>
                                        <p className="text-[11px] font-bold">{data.content.next_event_date ? new Date(data.content.next_event_date).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : 'Tanggal Belum Set'}</p>
                                        <p className="text-[10px] opacity-75 font-semibold">{data.content.next_event_location}</p>
                                    </div>
                                )}
                                {/* LOVE STORY */}
                                {data.content.love_stories.length > 0 && (
                                    <div className="text-left space-y-4">
                                        <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate text-center">{isPernikahanOrSyukuran ? 'Kisah Cinta Kami' : 'Agenda Acara'}</h5>
                                        <div className="border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-4">
                                            {data.content.love_stories.map((story, i) => (
                                                <div key={i} className="relative">
                                                    <div className="absolute w-2 h-2 rounded-full -left-[21px] top-1" style={{ backgroundColor: data.theme_config.accent_color }}></div>
                                                    <span className="text-[9px] font-extrabold block text-slate">{story.date || 'Waktu'}</span>
                                                    <p className="text-[10px] opacity-80 mt-1 leading-relaxed">{story.story || 'Cerita singkat'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* CLOSING TEXT */}
                                <div>
                                    <p className="text-[10px] opacity-75 max-w-xs mx-auto leading-relaxed mt-4 whitespace-pre-line">"{data.content.teks_penutup}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Music Library Selector Modal */}
                {isMusicModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-extrabold text-navy dark:text-white text-lg">Pustaka Musik Latar</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsMusicModalOpen(false)}
                                    className="text-slate hover:text-navy dark:hover:text-white font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                            {/* Search and Category filters */}
                            <div className="p-6 space-y-4">
                                <input
                                    type="text"
                                    value={musicSearch}
                                    onChange={e => setMusicSearch(e.target.value)}
                                    placeholder="Cari judul lagu, artis, atau kategori..."
                                    className="w-full bg-slate-100 dark:bg-slate-850 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary text-navy dark:text-white"
                                />
                                {/* Music List */}
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {musicLibrary.filter(track =>
                                        track.title.toLowerCase().includes(musicSearch.toLowerCase()) ||
                                        track.artist.toLowerCase().includes(musicSearch.toLowerCase()) ||
                                        track.category.toLowerCase().includes(musicSearch.toLowerCase())
                                    ).map((track) => (
                                        <div key={track.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handlePlayPreview(track)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow ${previewingTrackId === track.id
                                                            ? 'bg-primary text-white animate-pulse'
                                                            : 'bg-white dark:bg-slate-850 text-primary'
                                                        }`}
                                                >
                                                    {previewingTrackId === track.id ? '⏸️' : '▶️'}
                                                </button>
                                                <div className="text-left">
                                                    <h4 className="text-sm font-bold text-navy dark:text-white leading-tight">{track.title}</h4>
                                                    <p className="text-[10px] text-slate mt-1">{track.artist} • <span className="text-primary font-semibold">{track.category}</span></p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleSelectMusic(track)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${data.music_url === track.url
                                                        ? 'bg-green-500 text-white font-bold'
                                                        : 'bg-primary text-white hover:bg-primary-hover shadow-md'
                                                    }`}
                                            >
                                                {data.music_url === track.url ? '✓ Terpilih' : 'Gunakan'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Modal Footer */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900/50">
                                <button
                                    type="button"
                                    onClick={() => setIsMusicModalOpen(false)}
                                    className="bg-slate-200 dark:bg-slate-800 text-slate dark:text-white px-5 py-2 rounded-xl text-xs font-bold"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hidden audio element for preview playback */}
                <audio ref={previewAudioRef} />
            </div>
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white px-6 py-3 rounded-full shadow-2xl z-[200] animate-in slide-in-from-bottom-5 font-bold text-xs border border-white/10">
                    {toastMessage}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
