import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';

// --- SVG Icons (Minimalist, Thin Lines) ---
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="1" ry="1"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const EnvelopeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);

const MusicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
    </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="1" ry="1"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

export default function SyukuranPremiumInvitation({ invitation, guest }) {
    const { content = {}, theme_config = {}, category = {}, cover_image } = invitation;
    const guestName = guest?.name || new URLSearchParams(window.location.search).get('to') || 'Tamu Kehormatan';
    
    // Fallback data
    const mainEventDate = content?.events?.[0]?.date || content?.event_date || new Date().toISOString();
    const mainEventLocation = content?.events?.[0]?.location || content?.event_location || 'Gedung Serbaguna';
    const mainEventAddress = content?.events?.[0]?.address || content?.event_address || 'Jl. Jenderal Sudirman No. 1, Jakarta';
    const mainEventTime = content?.events?.[0]?.time || content?.event_time || '10:00 - Selesai';
    const musicUrl = invitation.music_url || "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3";
    let gallery = invitation.gallery && invitation.gallery.length > 0 ? invitation.gallery : [
        "https://placehold.co/600x800/eaeaea/a0a0a0?font=playfair-display&text=Momen+Bahagia+1",
        "https://placehold.co/800x600/eaeaea/a0a0a0?font=playfair-display&text=Momen+Bahagia+2",
        "https://placehold.co/600x800/eaeaea/a0a0a0?font=playfair-display&text=Momen+Bahagia+3",
        "https://placehold.co/800x600/eaeaea/a0a0a0?font=playfair-display&text=Momen+Bahagia+4"
    ];

    const [isOpening, setIsOpening] = useState(false);
    const [showInvitation, setShowInvitation] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const audioRef = useRef(null);

    const { data, setData, post, processing, reset } = useForm({
        name: guestName,
        attendance: 'hadir',
        message: '',
    });

    const openInvitation = () => {
        setIsOpening(true);
        setIsPlaying(true);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play().catch(err => console.log("Playback blocked:", err));
            }
        }, 300);
        setTimeout(() => {
            setShowInvitation(true);
            window.scrollTo(0, 0);
        }, 1200);
    };

    const toggleMusic = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setToastMessage("Nomor berhasil disalin");
        setTimeout(() => setToastMessage(""), 3000);
    };

    const submitRsvp = (e) => {
        e.preventDefault();
        post(route('rsvps.store', invitation.slug), {
            onSuccess: () => { reset(); setSubmitted(true); },
        });
    };

    // Scroll Animations and Auto Scroll
    useEffect(() => {
        if (!showInvitation) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('opacity-0', 'translate-y-12', 'scale-95');
                    entry.target.classList.add('opacity-100', 'translate-y-0', 'scale-100');
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
        
        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [showInvitation]);

    useEffect(() => {
        let scrollInterval;
        if (isAutoScrolling && showInvitation) {
            scrollInterval = setInterval(() => {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
                    setIsAutoScrolling(false);
                } else {
                    window.scrollBy(0, 1);
                }
            }, 30);
        }
        return () => clearInterval(scrollInterval);
    }, [isAutoScrolling, showInvitation]);

    // Detect user scroll to stop auto-scroll if they manually scroll up
    useEffect(() => {
        const handleWheel = () => {
            if (isAutoScrolling) setIsAutoScrolling(false);
        };
        const handleTouch = () => {
            if (isAutoScrolling) setIsAutoScrolling(false);
        };
        window.addEventListener('wheel', handleWheel);
        window.addEventListener('touchstart', handleTouch);
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouch);
        };
    }, [isAutoScrolling]);

    const renderCover = () => (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] bg-[#FAFAFA] text-[#111] font-sans overflow-hidden ${isOpening ? '-translate-y-full opacity-0 pointer-events-none blur-sm' : 'translate-y-0 opacity-100 blur-0'}`}>
            {/* Blurred Background Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={cover_image ? `/storage/${cover_image}` : "https://placehold.co/1080x1920/eaeaea/a0a0a0?font=playfair-display&text=Foto+Cover"}
                    alt="Cover Background"
                    className="w-full h-full object-cover grayscale opacity-30 blur-lg scale-110"
                />
                <div className="absolute inset-0 bg-white/60"></div>
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply z-0"></div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 relative z-10 max-w-sm w-full mx-auto">
                <div className="uppercase tracking-[0.4em] text-[10px] text-gray-500 font-light pb-2 px-4 border-b border-gray-300">
                    Syukuran Pernikahan
                </div>
                
                <div className="relative w-52 h-72 shadow-2xl p-2 bg-white">
                    <img 
                        src={cover_image ? `/storage/${cover_image}` : "https://placehold.co/600x800/eaeaea/a0a0a0?font=playfair-display&text=Foto+Cover"} 
                        alt="Cover" 
                        className="w-full h-full object-cover grayscale brightness-110 contrast-90"
                    />
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl uppercase tracking-widest font-serif font-light text-black">
                        {content?.groom_nickname || 'Groom'} <span className="font-sans font-extralight text-2xl mx-1 text-gray-400">&</span> {content?.bride_nickname || 'Bride'}
                    </h1>
                </div>

                <div className="pt-8 w-full flex flex-col items-center">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-gray-500 mb-3">Kepada Yth.</p>
                    <h2 className="text-sm font-semibold uppercase tracking-widest bg-gray-100 px-6 py-2">{guestName}</h2>
                </div>

                <button 
                    onClick={openInvitation}
                    className="group border border-[#111] bg-[#111] text-white hover:bg-white hover:text-[#111] uppercase tracking-[0.2em] text-[10px] py-4 px-10 transition-all duration-500 w-full mt-4 flex justify-center items-center gap-3"
                >
                    <EnvelopeIcon /> Buka Undangan
                </button>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen bg-[#FAFAFA] text-[#111] font-sans antialiased relative selection:bg-[#111] selection:text-white ${!showInvitation ? 'h-screen overflow-hidden' : ''}`}>
            {(!showInvitation || isOpening) && renderCover()}
            <Head title={invitation.title}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@200..800&display=swap" rel="stylesheet" />
            </Head>

            {/* Subtle Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply z-0"></div>

            {/* Audio Element */}
            <audio ref={audioRef} src={musicUrl} loop />

            {/* Floating Actions */}
            {showInvitation && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                    <button 
                        onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                        className={`p-3 rounded-full border hover:scale-110 transition-all shadow-lg flex items-center justify-center ${isAutoScrolling ? 'bg-[#111] text-white border-[#111]' : 'bg-white/80 backdrop-blur text-[#111] border-gray-200 hover:bg-[#111] hover:text-white'}`}
                        aria-label="Toggle Auto Scroll"
                    >
                        {isAutoScrolling ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>
                        )}
                    </button>
                    <button 
                        onClick={toggleMusic}
                        className="p-3 rounded-full border border-gray-200 bg-white/80 backdrop-blur text-[#111] hover:scale-110 hover:bg-[#111] hover:text-white transition-all shadow-lg flex items-center justify-center"
                        aria-label="Toggle Music"
                    >
                        {isPlaying ? <MusicIcon /> : <PauseIcon />}
                    </button>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-white border border-gray-200 shadow-xl text-[#111] px-6 py-3 uppercase tracking-widest text-[10px] rounded-full animate-fade-in">
                    {toastMessage}
                </div>
            )}

            {/* Hero Section */}
            <section className="min-h-[100vh] flex flex-col justify-center items-center relative p-6 md:p-12 z-10 overflow-hidden">
                {/* Hero Background */}
                <div className="absolute inset-0 z-[-1]">
                    <img 
                        src={content?.hero_image ? `/storage/${content?.hero_image}` : (cover_image ? `/storage/${cover_image}` : "https://placehold.co/1920x1080/eaeaea/a0a0a0?font=playfair-display&text=Foto+Latar+Hero")}
                        className="w-full h-full object-cover opacity-15 grayscale"
                        alt="Hero Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA]/50 via-[#FAFAFA]/80 to-[#FAFAFA]"></div>
                </div>

                <div className="text-center max-w-3xl mx-auto flex flex-col items-center fade-up opacity-0 translate-y-12 transition-all duration-[1500ms] ease-out">
                    <span className="uppercase tracking-[0.4em] text-[10px] md:text-xs mb-10 border-b border-gray-300 pb-2 px-8 text-gray-500 font-light">
                        Syukuran Pernikahan
                    </span>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif uppercase tracking-widest mb-10 leading-[1.2]">
                        <span className="block font-light">{content?.groom_nickname || 'Groom'}</span>
                        <span className="block text-2xl md:text-4xl font-sans font-extralight my-6 text-gray-400 italic">&</span>
                        <span className="block font-light">{content?.bride_nickname || 'Bride'}</span>
                    </h1>
                    
                    <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-gray-500">
                        {new Date(mainEventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 opacity-60">
                    <span className="text-[8px] uppercase tracking-[0.3em] text-gray-400">Scroll</span>
                    <div className="w-[1px] h-16 bg-gradient-to-b from-gray-400 to-transparent"></div>
                </div>
            </section>

            {/* Profile Section (Mempelai) */}
            <section className="py-32 px-6 bg-white relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20 fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out">
                        <span className="uppercase tracking-[0.4em] text-[10px] text-gray-400 pb-2">
                            Mempelai
                        </span>
                        <div className="w-12 h-[1px] bg-gray-300 mx-auto mt-4 mb-10"></div>
                        <p className="text-sm md:text-base leading-loose max-w-2xl mx-auto font-light text-gray-600">
                            {content?.teks_pembuka || "Dengan memohon rahmat dan ridho Allah SWT, kami menyelenggarakan syukuran pernikahan putra-putri kami."}
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-24">
                        <div className="flex flex-col items-center text-center fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out delay-100">
                            <div className="w-56 h-72 md:w-64 md:h-80 bg-gray-50 p-2 shadow-xl mb-8 transform -rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                                <img src={content?.groom_photo ? `/storage/${content?.groom_photo}` : "https://placehold.co/600x800/eaeaea/a0a0a0?font=playfair-display&text=Foto+Pria"} alt="Groom" className="w-full h-full object-cover grayscale opacity-90 hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-widest mb-3 font-light">{content?.groom_name || 'Nama Pria'}</h2>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Putra dari</p>
                            <p className="text-sm font-light text-gray-600">{content?.groom_parents || 'Bapak & Ibu'}</p>
                        </div>
                        
                        <div className="hidden md:block text-4xl font-serif font-light text-gray-200">&</div>
                        
                        <div className="flex flex-col items-center text-center fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out delay-300">
                            <div className="w-56 h-72 md:w-64 md:h-80 bg-gray-50 p-2 shadow-xl mb-8 transform rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                                <img src={content?.bride_photo ? `/storage/${content?.bride_photo}` : "https://placehold.co/600x800/eaeaea/a0a0a0?font=playfair-display&text=Foto+Wanita"} alt="Bride" className="w-full h-full object-cover grayscale opacity-90 hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-widest mb-3 font-light">{content?.bride_name || 'Nama Wanita'}</h2>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Putri dari</p>
                            <p className="text-sm font-light text-gray-600">{content?.bride_parents || 'Bapak & Ibu'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Details Section */}
            <section className="py-32 px-6 bg-[#FAFAFA] relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-20 fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out">
                        <span className="uppercase tracking-[0.4em] text-[10px] text-gray-400 pb-2">
                            Waktu & Tempat
                        </span>
                        <div className="w-12 h-[1px] bg-gray-300 mx-auto mt-4"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Event Details Card */}
                        <div className="bg-white p-12 shadow-sm border border-gray-100 flex flex-col items-center fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out delay-100">
                            <h3 className="text-xl font-serif uppercase tracking-[0.3em] mb-10 text-center font-light">Syukuran</h3>
                            
                            <div className="space-y-10 w-full">
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4 text-gray-300"><CalendarIcon /></div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#111]">
                                        {new Date(mainEventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4 text-gray-300"><ClockIcon /></div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#111]">{mainEventTime}</p>
                                </div>
                                
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4 text-gray-300"><MapPinIcon /></div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-2 text-[#111]">{mainEventLocation}</p>
                                    <p className="text-[11px] text-gray-500 font-light max-w-[200px] leading-relaxed">{mainEventAddress}</p>
                                </div>
                            </div>
                        </div>

                        {/* Map & Actions */}
                        <div className="bg-[#111] text-white p-12 flex flex-col items-center justify-center fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out delay-300">
                            <p className="text-[11px] tracking-[0.2em] uppercase mb-12 text-gray-400 text-center leading-loose font-light">
                                Kehadiran dan doa restu Anda adalah anugerah terindah bagi kami.
                            </p>
                            
                            <div className="w-full flex flex-col gap-4">
                                <a 
                                    href={`https://maps.google.com/?q=${content?.event_lat || '-6.200000'},${content?.event_lng || '106.816666'}`}
                                    target="_blank" rel="noreferrer"
                                    className="flex items-center justify-center gap-3 bg-white text-[#111] py-4 uppercase tracking-[0.2em] text-[10px] font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Buka Google Maps
                                </a>
                                
                                <a 
                                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Syukuran+Pernikahan+${content?.groom_nickname || 'Groom'}+%26+${content?.bride_nickname || 'Bride'}&dates=${new Date(mainEventDate).toISOString().replace(/-|:|\.\d+/g, '')}/${new Date(mainEventDate).toISOString().replace(/-|:|\.\d+/g, '')}&location=${mainEventLocation}`}
                                    target="_blank" rel="noreferrer"
                                    className="flex items-center justify-center gap-3 border border-gray-700 text-white py-4 uppercase tracking-[0.2em] text-[10px] font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    Simpan ke Kalender
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            {gallery && gallery.length > 0 && (
                <section className="py-32 px-6 bg-white relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-20 fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out">
                            <span className="uppercase tracking-[0.4em] text-[10px] text-gray-400 pb-2">
                                Momen Bahagia
                            </span>
                            <div className="w-12 h-[1px] bg-gray-300 mx-auto mt-4 mb-10"></div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {gallery.slice(0, 8).map((img, idx) => (
                                <div key={idx} className={`fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out bg-gray-50 p-2 shadow-sm ${idx % 2 !== 0 ? 'mt-8 md:mt-12' : ''}`} style={{ transitionDelay: `${idx * 100}ms` }}>
                                    <div className="aspect-[3/4] overflow-hidden">
                                        <img src={img.startsWith('http') ? img : `/storage/${img}`} alt={`Gallery ${idx+1}`} className="w-full h-full object-cover grayscale opacity-90 hover:opacity-100 transition-all duration-700 hover:scale-105" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Gift Section */}
            {(content?.gift_bank_account || content?.gift_ewallet_account) && (
                <section className="py-32 px-6 bg-white relative z-10">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="mb-16 fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out">
                            <div className="flex justify-center mb-6 text-gray-300"><EnvelopeIcon /></div>
                            <h3 className="text-xl font-serif uppercase tracking-[0.3em] mb-6 font-light">Tanda Kasih</h3>
                            <div className="w-12 h-[1px] bg-gray-300 mx-auto mb-8"></div>
                            <p className="text-[13px] font-light text-gray-500 leading-loose">
                                Doa restu Anda merupakan karunia yang sangat berarti. Namun jika Anda hendak memberikan tanda kasih, Anda dapat mengirimkannya melalui fitur di bawah ini:
                            </p>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-6">
                            {content?.gift_bank_account && (
                                <div className="bg-[#FAFAFA] border border-gray-100 p-8 text-center flex flex-col justify-between fade-up opacity-0 translate-y-12 scale-95 transition-all duration-[1200ms] ease-out delay-100">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">{content?.gift_bank_name || 'Bank Transfer'}</p>
                                        <p className="text-xl tracking-widest mb-4 font-serif text-[#111]">{content?.gift_bank_account}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">A.n. {content?.gift_bank_holder}</p>
                                    </div>
                                    <button 
                                        onClick={() => copyToClipboard(content?.gift_bank_account)}
                                        className="mt-8 flex items-center justify-center gap-2 border border-gray-200 bg-white text-[#111] py-3 text-[9px] uppercase tracking-widest hover:border-[#111] transition-all shadow-sm"
                                    >
                                        <CopyIcon /> Salin Rekening
                                    </button>
                                </div>
                            )}
                            
                            {content?.gift_ewallet_account && (
                                <div className="bg-[#FAFAFA] border border-gray-100 p-8 text-center flex flex-col justify-between fade-up opacity-0 translate-y-12 scale-95 transition-all duration-[1200ms] ease-out delay-300">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">{content?.gift_ewallet_name || 'E-Wallet'}</p>
                                        <p className="text-xl tracking-widest mb-4 font-serif text-[#111]">{content?.gift_ewallet_account}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">A.n. {content?.gift_ewallet_holder}</p>
                                    </div>
                                    <button 
                                        onClick={() => copyToClipboard(content?.gift_ewallet_account)}
                                        className="mt-8 flex items-center justify-center gap-2 border border-gray-200 bg-white text-[#111] py-3 text-[9px] uppercase tracking-widest hover:border-[#111] transition-all shadow-sm"
                                    >
                                        <CopyIcon /> Salin Nomor
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* RSVP Section */}
            <section className="py-32 px-6 bg-[#FAFAFA] relative z-10">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-16 fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out">
                        <span className="uppercase tracking-[0.4em] text-[10px] text-gray-400 pb-2">
                            Kehadiran
                        </span>
                        <div className="w-12 h-[1px] bg-gray-300 mx-auto mt-4"></div>
                    </div>

                    {!submitted ? (
                        <form onSubmit={submitRsvp} className="bg-white border border-gray-100 p-10 md:p-16 shadow-sm fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out delay-100">
                            <div className="space-y-10">
                                <div>
                                    <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-2">Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-[#111] focus:ring-0 px-0 py-2 text-sm transition-colors rounded-none placeholder-gray-300" 
                                        placeholder="Tulis nama Anda"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-2">Konfirmasi</label>
                                    <select 
                                        value={data.attendance}
                                        onChange={e => setData('attendance', e.target.value)}
                                        className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-[#111] focus:ring-0 px-0 py-2 text-sm transition-colors rounded-none text-[#111]"
                                    >
                                        <option value="hadir">Ya, Saya akan hadir</option>
                                        <option value="tidak_hadir">Maaf, saya tidak bisa hadir</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-2">Pesan & Doa</label>
                                    <textarea 
                                        required 
                                        rows="4"
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-[#111] focus:ring-0 px-0 py-2 text-sm transition-colors rounded-none resize-none placeholder-gray-300" 
                                        placeholder="Berikan ucapan terbaik Anda..."
                                    ></textarea>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full bg-[#111] text-white py-4 uppercase tracking-[0.2em] text-[10px] font-semibold hover:bg-black transition-colors disabled:opacity-50 mt-4"
                                >
                                    {processing ? 'Mengirim...' : 'Kirim Konfirmasi'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-white border border-gray-100 p-16 text-center fade-up opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out delay-100 shadow-sm">
                            <h4 className="text-xl font-serif uppercase tracking-widest mb-4 font-light text-[#111]">Terima Kasih</h4>
                            <p className="text-[13px] font-light text-gray-500 leading-relaxed">Konfirmasi kehadiran dan ucapan Anda telah kami terima.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white text-[#111] py-20 text-center border-t border-gray-100 relative z-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-serif uppercase tracking-widest font-light">
                        {content?.groom_nickname || 'G'} <span className="text-gray-300 mx-2">&</span> {content?.bride_nickname || 'B'}
                    </h2>
                </div>
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-2">
                    Created with <span className="font-bold text-[#111]">BEYOND HORIZON</span>
                </p>
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400">
                    Developed by <a href="https://instagram.com/f_haikal02" target="_blank" rel="noreferrer" className="font-bold text-[#111] hover:text-gray-600 transition-colors">Fiqri Haikal</a>
                </p>
            </footer>
        </div>
    );
}
