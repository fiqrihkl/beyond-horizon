import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState, useRef, useMemo } from 'react';
import RpgTouringInvitation from './RpgTouringInvitation';
import SyukuranPremiumInvitation from './SyukuranPremiumInvitation';
function TiltCard({ children, className = '', style = {}, themeColor }) {
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseMove = (e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setCoords({ x: x * 8, y: -y * 8 });
    };
    const handleMouseLeave = () => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
    };
    const tiltStyle = {
        transform: isHovered
            ? `perspective(1000px) rotateX(${coords.y}deg) rotateY(${coords.x}deg) scale3d(1.02, 1.02, 1.02)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s',
        transformStyle: 'preserve-3d',
        ...style
    };
    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
            className={`transition-all duration-500 ${className}`}
        >
            {children}
        </div>
    );
}
function PolaroidCard({ img, realIdx, totalIdx, innerRef, onClick }) {
    const [inView, setInView] = useState(false);
    const cardRef = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setInView(entry.isIntersecting);
            },
            {
                root: document.getElementById('gallery-scroll'),
                // A very narrow vertical strip in the exact center of the screen
                rootMargin: '0px -45% 0px -45%',
                threshold: 0
            }
        );
        if (cardRef.current) {
            observer.observe(cardRef.current);
        }
        return () => {
            if (cardRef.current) observer.unobserve(cardRef.current);
        };
    }, []);
    const tilts = ['-rotate-2 translate-y-1', 'rotate-3 -translate-y-1', '-rotate-3', 'rotate-2 translate-y-2'];
    const tiltClass = tilts[realIdx % tilts.length];
    return (
        <div
            onClick={onClick}
            ref={(el) => { cardRef.current = el; if (innerRef) innerRef(el); }}
            className={`cursor-pointer shrink-0 snap-center bg-white text-neutral-800 p-2 pb-6 md:p-4 md:pb-8 shadow-[0_15px_35px_rgba(0,0,0,0.6)] rounded-sm transform transition-all duration-700 w-[55vw] sm:w-[45vw] md:w-[30vw] max-w-[280px] ${tiltClass} ${inView ? 'scale-110 z-10 shadow-[0_25px_50px_rgba(0,0,0,0.8)]' : 'scale-90 opacity-50 blur-[1px]'}`}
        >
            <div className="aspect-[4/5] bg-neutral-100 overflow-hidden border border-neutral-200 shadow-inner">
                <img
                    src={img.startsWith('http') ? img : `/storage/${img}`}
                    className={`w-full h-full object-cover transition-all duration-700 ${inView ? 'grayscale-0' : 'grayscale filter'}`}
                    alt={`Polaroid ${realIdx}`}
                />
            </div>
            <div className="mt-3 md:mt-5 text-center font-script text-xl md:text-3xl text-neutral-700 tracking-wider">
                Our Love #{realIdx + 1}
            </div>
        </div>
    );
}
function getEmbedUrl(url) {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        let videoId = '';
        if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
            videoId = urlObj.searchParams.get('v');
        } else if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/shorts/')) {
            videoId = urlObj.pathname.split('/')[2];
        }
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {
        // Fallback
        if (url.includes('youtube.com/watch?v=')) {
            return `https://www.youtube.com/embed/${url.split('youtube.com/watch?v=')[1].split('&')[0]}`;
        }
        if (url.includes('youtu.be/')) {
            return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
        }
    }
    return url;
}
export default function Show({ invitation, guest }) {
    const { content = {}, theme_config = {}, category = {}, cover_image } = invitation;
    let { gallery = [], rsvps = [], music_url } = invitation;
    // --- DUMMY DATA INJECTION FOR PREVIEW ---
    if (!gallery || gallery.length === 0) {
        gallery = [
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80"
        ];
    }
    // Dummy Photos for Bride and Groom
    if (!content.bride_photo) {
        content.bride_photo = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"; // Elegant bride-like portrait
    }
    if (!content.groom_photo) {
        content.groom_photo = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"; // Elegant groom-like portrait
    }
    // Memaksa data dummy tampil meskipun sudah ada data di database - REMOVED
    // Fallback to dummy love stories only if none exist
    if (!content.love_stories || content.love_stories.length === 0) {
        content.love_stories = [
            { date: "14 Februari 2020", story: "Pertama kali kita bertemu di sebuah kedai kopi kecil di sudut kota. Sapaan sederhana yang menjadi awal dari segalanya." },
            { date: "20 Agustus 2022", story: "Setelah melewati banyak musim bersama, momen tak terlupakan terjadi saat lamaran romantis di bawah langit senja pantai." },
            { date: "10 Desember 2024", story: "Hari di mana dua keluarga besar bertemu, mengikat janji suci untuk merencanakan masa depan dan melangkah ke jenjang yang lebih serius." },
            { date: "20 Juni 2026", story: "Momen yang paling dinanti, saat kita berdua bersiap mengucap janji setia sehidup semati." }
        ];
    }
    if (!music_url) {
        music_url = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3"; // Beautiful in White (Acoustic dummy)
    }
    if (!content.wish_groom) {
        content.wish_groom = "Semoga langkah kita selalu diberkahi, saling melengkapi dalam suka dan duka, serta membangun keluarga yang penuh cinta dan kasih sayang selamanya.";
    }
    if (!content.wish_bride) {
        content.wish_bride = "Menjadi istri yang selalu mendampingi dengan sabar, menenun hari tua bersama, dan mengukir kisah manis hingga akhir hayat.";
    }
    if (!content.wish_family) {
        content.wish_family = "Berbahagialah selalu anak-anakku, arungi bahtera rumah tangga dengan penuh keikhlasan, kesabaran, dan selalu jadikan Tuhan sebagai nahkodanya.";
    }
    if (!content.gift_bank_account && !content.gift_ewallet_account) {
        content.gift_bank_name = "BCA";
        content.gift_bank_account = "1234567890";
        content.gift_bank_holder = "Mempelai Pria";
        content.gift_ewallet_name = "GoPay / OVO";
        content.gift_ewallet_account = "081234567890";
        content.gift_ewallet_holder = "Mempelai Wanita";
    }
    if (!content.event_lat || !content.event_lng) {
        content.event_lat = "-6.200000";
        content.event_lng = "106.816666"; // Jakarta coordinates
        content.event_zoom = "15";
    }
    // -----------------------------------------
    // Dummy RSVPs for preview
    if (!rsvps || rsvps.length === 0) {
        rsvps = [
            { id: 1, name: "Fiqri Haikal", attendance: "hadir", message: "Selamat ya! Semoga lancar sampai hari H dan bahagia selalu." }
        ];
    }
    const themeId = theme_config?.theme_id || 'floral-romantic';

    if (themeId === 'rpg-touring') {
        return <RpgTouringInvitation invitation={invitation} guest={guest} />;
    }
    if (themeId === 'syukuran-pernikahan-premium') {
        return <SyukuranPremiumInvitation invitation={invitation} guest={guest} />;
    }
    const isCinemaTheme = themeId === 'monochrome-3d-cinema';
    const isLuxuryTheme = themeId === 'luxury-wedding';
    const isBurgundyTheme = themeId === 'burgundies-vibes';
    const themeColor = isCinemaTheme
        ? '#D4AF37'
        : (isLuxuryTheme
            ? '#e5e5e5'
            : (isBurgundyTheme
                ? (theme_config?.accent_color && theme_config?.accent_color !== '#F48C06' ? theme_config.accent_color : '#cba93c')
                : (theme_config?.accent_color || '#F48C06')));
    const isPernikahan = category?.slug === 'pernikahan';
    const is3DTheme = themeId === 'glass-3d-elegant';
    const [isDark, setIsDark] = useState((isCinemaTheme || isLuxuryTheme) ? true : theme_config?.mode === 'dark');
    const [submitted, setSubmitted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showInvitation, setShowInvitation] = useState(false);
    const [isOpening, setIsOpening] = useState(false);
    const audioRef = useRef(null);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const autoScrollRef = useRef(null);
    useEffect(() => {
        if (!showInvitation) return;
        const handleScroll = () => {
            const scrollPos = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            setIsAtBottom(maxScroll > 0 && scrollPos >= maxScroll - 50);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();

        if (isAutoScrolling) {
            autoScrollRef.current = setInterval(() => {
                window.scrollBy({ top: 1, left: 0 });
                if (window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 5) {
                    setIsAutoScrolling(false);
                }
            }, 30);
        }
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        };
    }, [isAutoScrolling, showInvitation]);
    // Cache dust particles so they don't reset every second when the countdown timer triggers a re-render
    const dustParticles = useMemo(() => {
        return [...Array(30)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1.5}px`,
            height: `${Math.random() * 3 + 1.5}px`,
            duration: `${Math.random() * 18 + 12}s`,
            delay: `${Math.random() * 10}s`
        }));
    }, []);
    // Guest name query parameter ("sapaan tamu")
    const [guestName, setGuestName] = useState(guest?.name || '');
    useEffect(() => {
        if (typeof window !== 'undefined' && !guestName) {
            const urlParams = new URLSearchParams(window.location.search);
            setGuestName(urlParams.get('to') || '');
        }
    }, [guest]);
    // Toast Notification State
    const [toastMessage, setToastMessage] = useState("");
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setToastMessage("Berhasil salin nomor!");
        setTimeout(() => setToastMessage(""), 3000);
    };

    // RSVP Background Slideshow State
    const rsvpBgGallery = invitation.gallery && invitation.gallery.length > 0 ? invitation.gallery : [];
    const [rsvpBgIndex, setRsvpBgIndex] = useState(0);
    useEffect(() => {
        if (rsvpBgGallery.length > 0) {
            const interval = setInterval(() => {
                setRsvpBgIndex((prev) => (prev + 1) % rsvpBgGallery.length);
            }, 4000); // 4 seconds per slide
            return () => clearInterval(interval);
        }
    }, [rsvpBgGallery.length]);
    // Love Story 3D Carousel State
    const [activeStory, setActiveStory] = useState(0);
    const [touchStartX, setTouchStartX] = useState(null);
    const [storyInteracted, setStoryInteracted] = useState(false);
    // Gallery Auto-Scroll & Infinite Loop State
    const galleryScrollRef = useRef(null);
    const galleryItemRefs = useRef([]);
    const [isGalleryAutoScrolling, setIsGalleryAutoScrolling] = useState(true);
    const [galleryInitialized, setGalleryInitialized] = useState(false);
    const galleryResumeTimeoutRef = useRef(null);

    // Lightbox State
    const [lightbox, setLightbox] = useState({ isOpen: false, img: null, scale: 1 });
    const openLightbox = (img) => {
        setLightbox({ isOpen: true, img: img.startsWith('http') ? img : `/storage/${img}`, scale: 1 });
    };
    const closeLightbox = () => setLightbox({ isOpen: false, img: null, scale: 1 });
    const handleLightboxZoom = (e, amount) => {
        if (e) e.stopPropagation();
        setLightbox(prev => ({ ...prev, scale: Math.max(0.5, Math.min(prev.scale + amount, 4)) }));
    };
    const N = gallery?.length || 0;
    const extendedGallery = N > 0 ? Array(4).fill(gallery).flat() : [];
    // Initialize infinite scroll position
    useEffect(() => {
        if (!galleryInitialized && galleryScrollRef.current && galleryItemRefs.current[N]) {
            const container = galleryScrollRef.current;
            const target = galleryItemRefs.current[N];
            container.scrollLeft = target.offsetLeft + target.offsetWidth / 2 - container.clientWidth / 2;
            setGalleryInitialized(true);
        }
    }, [galleryInitialized, N]);
    const handleGalleryScroll = (e) => {
        if (!galleryInitialized) return;
        const container = e.target;
        if (N === 0 || !galleryItemRefs.current[N] || !galleryItemRefs.current[N * 2] || !galleryItemRefs.current[N * 3]) return;
        const jumpDistance = galleryItemRefs.current[N * 2].offsetLeft - galleryItemRefs.current[N].offsetLeft;
        // If scrolled deep into set 3, jump back to set 2
        if (container.scrollLeft >= galleryItemRefs.current[N * 3].offsetLeft - window.innerWidth / 2) {
            container.scrollLeft -= jumpDistance;
        }
        // If scrolled backward into set 0, jump forward to set 1
        else if (container.scrollLeft <= galleryItemRefs.current[N - 1].offsetLeft - window.innerWidth / 2) {
            container.scrollLeft += jumpDistance;
        }
    };
    useEffect(() => {
        if (!isGalleryAutoScrolling || !galleryScrollRef.current || !galleryInitialized) return;
        const interval = setInterval(() => {
            if (galleryScrollRef.current) {
                const itemWidth = galleryItemRefs.current[0] ? galleryItemRefs.current[0].offsetWidth : window.innerWidth * 0.4;
                // Scroll by roughly 1 item width; snapping will perfectly center it
                galleryScrollRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [isGalleryAutoScrolling, galleryInitialized]);
    const handleGalleryInteractionStart = () => {
        setIsGalleryAutoScrolling(false);
        if (galleryResumeTimeoutRef.current) clearTimeout(galleryResumeTimeoutRef.current);
    };
    const handleGalleryInteractionEnd = () => {
        galleryResumeTimeoutRef.current = setTimeout(() => setIsGalleryAutoScrolling(true), 4000);
    };
    // Harapan Slideshow State
    const [activeHarapanImage, setActiveHarapanImage] = useState(0);
    const harapanBgSlideshow = invitation.gallery && invitation.gallery.length > 0 
        ? invitation.gallery 
        : [content?.bride_photo, content?.groom_photo, cover_image].filter(Boolean);
        
    // Fallback just in case everything is empty
    const finalHarapanSlideshow = harapanBgSlideshow.length > 0 ? harapanBgSlideshow : [
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop"
    ];

    useEffect(() => {
        if (!isLuxuryTheme) return;
        const interval = setInterval(() => {
            setActiveHarapanImage(prev => (prev + 1) % finalHarapanSlideshow.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isLuxuryTheme, finalHarapanSlideshow.length]);
    useEffect(() => {
        const storiesCount = content?.love_stories?.length;
        if (!isLuxuryTheme || !storiesCount || storyInteracted) return;
        const interval = setInterval(() => {
            setActiveStory(prev => (prev + 1) % storiesCount);
        }, 5000);
        return () => clearInterval(interval);
    }, [isLuxuryTheme, content?.love_stories?.length, storyInteracted]);
    const handleStoryTouchStart = (e) => {
        setStoryInteracted(true);
        setTouchStartX(e.touches[0].clientX);
    };
    const handleStoryTouchEnd = (e) => {
        if (touchStartX === null || !content?.love_stories?.length) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (diff > 50) {
            setActiveStory(prev => (prev + 1) % content.love_stories.length); // Swipe Left -> Next
        } else if (diff < -50) {
            setActiveStory(prev => (prev - 1 + content.love_stories.length) % content.love_stories.length); // Swipe Right -> Prev
        }
        setTouchStartX(null);
    };
    // Unified Event Variables to support backward compatibility and the new `events` array
    const mainEventDate = content?.events?.[0]?.date || content?.event_date;
    const mainEventLocation = content?.events?.[0]?.location || content?.event_location;
    const mainEventAddress = content?.events?.[0]?.address || content?.event_address;
    const mainEventName = content?.events?.[0]?.name || content?.event_name || 'Acara Utama';
    // Countdown State
    const [timeLeft, setTimeLeft] = useState({ Hari: 0, Jam: 0, Menit: 0, Detik: 0 });
    const isEventPassed = mainEventDate ? new Date(mainEventDate).getTime() < new Date().getTime() : false;

    // Countdown Animation States
    const [scrambleTimeLeft, setScrambleTimeLeft] = useState({ Hari: 99, Jam: 23, Menit: 59, Detik: 59 });
    const [isScrambling, setIsScrambling] = useState(false);
    const [isCountdownVisible, setIsCountdownVisible] = useState(false);
    const countdownRef = useRef(null);

    useEffect(() => {
        if (!showInvitation) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsCountdownVisible(true);
                setIsScrambling(true);
                observer.disconnect();
            }
        }, { threshold: 0.3 });
        if (countdownRef.current) observer.observe(countdownRef.current);
        return () => observer.disconnect();
    }, [showInvitation]);

    useEffect(() => {
        if (isScrambling) {
            let count = 0;
            const interval = setInterval(() => {
                setScrambleTimeLeft({
                    Hari: Math.floor(Math.random() * 99),
                    Jam: Math.floor(Math.random() * 24),
                    Menit: Math.floor(Math.random() * 60),
                    Detik: Math.floor(Math.random() * 60)
                });
                count++;
                if (count >= 25) { // 25 * 50ms = 1250ms
                    clearInterval(interval);
                    setIsScrambling(false);
                }
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isScrambling]);

    const displayTimeLeft = isScrambling ? scrambleTimeLeft : timeLeft;
    const getGoogleCalendarUrl = (title, dateString, locationName, address) => {
        if (!dateString) return '#';
        try {
            const startDate = new Date(dateString);
            if (isNaN(startDate.getTime())) return '#';

            // Event duration: default 2 hours
            const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

            // Format date to UTC YYYYMMDDTHHmmSSZ
            const formatUTC = (date) => {
                return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };

            const dates = `${formatUTC(startDate)}/${formatUTC(endDate)}`;
            const location = `${locationName || ''}${locationName && address ? ', ' : ''}${address || ''}`;
            const details = `Undangan Digital: ${typeof window !== 'undefined' ? window.location.href : ''}\n\nTerima kasih atas kehadiran Anda.`;

            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
        } catch (e) {
            console.error(e);
            return '#';
        }
    };
    useEffect(() => {
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDark]);
    useEffect(() => {
        const targetDate = mainEventDate;
        if (targetDate) {
            const timer = setInterval(() => {
                const now = new Date().getTime();
                const eventTime = new Date(targetDate).getTime();
                const distance = eventTime - now;
                if (distance < 0) {
                    clearInterval(timer);
                } else {
                    setTimeLeft({
                        Hari: Math.floor(distance / (1000 * 60 * 60 * 24)),
                        Jam: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        Menit: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                        Detik: Math.floor((distance % (1000 * 60)) / 1000)
                    });
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [mainEventDate]);
    // Scroll Animation
    useEffect(() => {
        if (!showInvitation) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('scroll-animate-right') || entry.target.classList.contains('scroll-animate-left')) {
                        entry.target.classList.remove('opacity-0', 'translate-x-32', '-translate-x-32');
                        entry.target.classList.add('opacity-100', 'translate-x-0');
                    } else if (entry.target.classList.contains('scroll-animate-fast')) {
                        entry.target.classList.add('animate-in', 'fade-in', 'slide-in-from-bottom-8', 'duration-[800ms]');
                        entry.target.style.opacity = 1;
                    } else {
                        entry.target.classList.add('animate-in', 'fade-in', 'slide-in-from-bottom-8', 'duration-1000');
                        entry.target.style.opacity = 1;
                    }
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.scroll-animate, .scroll-animate-fast, .scroll-animate-right, .scroll-animate-left').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [showInvitation]);
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
    const { data, setData, post, processing, reset } = useForm({
        name: guestName || '',
        attendance: 'hadir',
        message: '',
    });
    useEffect(() => {
        if (guestName) {
            setData('name', guestName);
        }
    }, [guestName]);
    const submitRsvp = (e) => {
        e.preventDefault();
        post(route('rsvps.store', invitation.slug), {
            onSuccess: () => { reset(); setSubmitted(true); },
        });
    };
    const cardBgClass = isLuxuryTheme
        ? 'bg-white border border-neutral-300 shadow-xl shadow-neutral-900/5'
        : 'bg-[#491217]/50 border border-[#cba93c]/35';
    const photoBorderClass = isLuxuryTheme
        ? 'border-neutral-300'
        : 'border-[#cba93c]/30';
    const nameTextClass = isLuxuryTheme
        ? 'text-neutral-500 font-bold'
        : 'text-[#f0d78a]';
    const dividerLineClass = isLuxuryTheme
        ? 'bg-neutral-300'
        : 'bg-[#cba93c]/30';
    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleScroll = () => {
                setScrollY(window.scrollY);
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, []);
    const getCameraStyle = (direction) => {
        if (typeof window === 'undefined') return {};
        const sectionOffset = 450;
        const sectionHeight = 550;
        const progress = Math.max(0, Math.min(1, (scrollY - sectionOffset) / sectionHeight));

        const translateZ = (1 - progress) * -200;
        const translateX = (1 - progress) * (direction === 'left' ? -120 : (direction === 'right' ? 120 : 0));
        const rotateY = (1 - progress) * (direction === 'left' ? 20 : (direction === 'right' ? -20 : 0));
        const rotateX = (1 - progress) * 8;

        return {
            transform: `perspective(1000px) translate3d(${translateX}px, 0px, ${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
            opacity: progress,
            transition: 'transform 0.1s ease-out, opacity 0.1s ease-out'
        };
    };
    const getTimelineProgress = () => {
        if (!mainEventDate) return 0;
        const eventTime = new Date(mainEventDate).getTime();
        const now = new Date().getTime();
        const totalWindow = 90 * 24 * 60 * 60 * 1000;
        const timeRemaining = eventTime - now;
        if (timeRemaining < 0) return 100;
        const progress = Math.max(0, Math.min(100, ((totalWindow - timeRemaining) / totalWindow) * 100));
        return progress;
    };
    // Cover Page Render (Screen overlap)
    const renderCover = () => {
        if (themeId === 'luxury-wedding') {
            const evtDate = mainEventDate ? new Date(mainEventDate) : null;
            const dateStr = evtDate
                ? `${String(evtDate.getDate()).padStart(2, '0')} . ${String(evtDate.getMonth() + 1).padStart(2, '0')} . ${evtDate.getFullYear()}`
                : '30 . 06 . 2026';
            return (
                <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-start md:justify-center p-4 pt-16 pb-6 md:py-8 transition-all duration-[1200ms] ease-in-out overflow-y-auto font-sans ${isOpening ? 'scale-[2.0] opacity-0 blur-xl pointer-events-none' : 'scale-100 opacity-100'}`}>
                    <Head title={invitation.title}>
                        <link rel="preconnect" href="https://fonts.googleapis.com" />
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@400;750&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
                    </Head>
                    {/* Blurred Background Layer */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${cover_image ? `/storage/${cover_image}` : 'https://cdn-uploads.owlink.id/d57ca580-ab4e-11f0-aa4f-43153b9232d2.jpg'})`,
                            filter: 'blur(8px) brightness(0.5)',
                            transform: 'scale(1.1)'
                        }}
                    ></div>

                    {!invitation.is_active && (
                        <div className="fixed top-0 left-0 w-full bg-amber-500/95 backdrop-blur text-white text-xs font-bold text-center py-2.5 z-[200] shadow-md flex items-center justify-center gap-2">
                            <span>⚡ Mode Pratinjau: Undangan ini masih berstatus Draft.</span>
                        </div>
                    )}
                    {/* Main Dark Card */}
                    <div className="relative z-10 w-full max-w-[310px] xs:max-w-[340px] bg-[#121212]/60 p-6 xs:p-8 flex flex-col items-center shadow-2xl animate__animated animate__fadeInUp my-auto">
                        <p className="text-[10px] xs:text-[11px] tracking-[0.25em] font-medium uppercase text-white/80 mb-6 xs:mb-8">The Wedding Of</p>

                        <div className="relative w-40 h-40 xs:w-56 xs:h-56 md:w-64 md:h-64 aspect-square mb-8 xs:mb-10 md:mb-12 flex-shrink-0">
                            <img
                                src={cover_image ? `/storage/${cover_image}` : 'https://cdn-uploads.owlink.id/d57ca580-ab4e-11f0-aa4f-43153b9232d2.jpg'}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />

                            {/* Cursive Names Overlapping */}
                            <div className="absolute -bottom-6 xs:-bottom-8 left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
                                <h1
                                    className="text-4xl xs:text-5xl md:text-6xl text-white drop-shadow-md leading-[0.6]"
                                    style={{ fontFamily: "'Great Vibes', cursive", transform: "rotate(-5deg)", textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}
                                >
                                    <span className="block pr-8 xs:pr-12">{content?.groom_nickname || 'Romeo'} &</span>
                                    <span className="block pl-8 xs:pl-12 pt-1 xs:pt-2">{content?.bride_nickname || 'Juliet'}</span>
                                </h1>
                            </div>
                        </div>
                        <p className="text-[10px] xs:text-[11px] tracking-[0.4em] font-medium text-white/90 mb-6 xs:mb-8 md:mb-10">
                            {dateStr}
                        </p>
                        <div className="mb-6 xs:mb-8 md:mb-10 w-full text-center">
                            <p className="text-[8px] text-white/60 mb-1 tracking-widest uppercase">Kepada Yth.</p>
                            <h2 className="text-[10px] xs:text-[11px] font-bold text-white uppercase tracking-widest">{guestName || 'Tamu Undangan'}</h2>
                        </div>
                        <button
                            onClick={openInvitation}
                            className="bg-neutral-200 text-black hover:bg-white font-semibold px-6 xs:px-8 py-2.5 xs:py-3 tracking-[0.15em] text-[9px] xs:text-[10px] hover:brightness-110 active:scale-95 transition-all uppercase shadow-lg shadow-white/20"
                        >
                            Buka Undangan
                        </button>
                    </div>
                </div>
            );
        }
        if (isBurgundyTheme) {
            return (
                <div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-start md:justify-center text-center p-6 transition-all duration-1000 overflow-y-auto pt-16 pb-6 md:py-8 bg-[#2e0202] text-white font-serif"
                    style={{ backgroundImage: "url('https://cdn-uploads.owlink.id/d57ca580-ab4e-11f0-aa4f-43153b9232d2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                    <Head title={invitation.title}>
                        <link rel="preconnect" href="https://fonts.googleapis.com" />
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@400;750&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
                    </Head>
                    {!invitation.is_active && (
                        <div className="fixed top-0 left-0 w-full bg-amber-500/95 backdrop-blur text-white text-xs font-bold text-center py-2.5 z-[200] shadow-md flex items-center justify-center gap-2">
                            <span>⚡ Mode Pratinjau: Undangan ini masih berstatus Draft.</span>
                        </div>
                    )}
                    {/* Corner Ornaments */}
                    <img src="https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png" className="absolute top-0 left-0 w-24 h-24 md:w-36 md:h-36 opacity-35 pointer-events-none transform -scale-x-100 -scale-y-100 object-contain" alt="ornament" />
                    <img src="https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png" className="absolute top-0 right-0 w-24 h-24 md:w-36 md:h-36 opacity-35 pointer-events-none transform -scale-y-100 object-contain" alt="ornament" />
                    <img src="https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png" className="absolute bottom-0 left-0 w-24 h-24 md:w-36 md:h-36 opacity-35 pointer-events-none transform -scale-x-100 object-contain" alt="ornament" />
                    <img src="https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png" className="absolute bottom-0 right-0 w-24 h-24 md:w-36 md:h-36 opacity-35 pointer-events-none object-contain" alt="ornament" />
                    <div className="relative z-10 max-w-lg mx-auto flex flex-col justify-between min-h-[70vh] md:h-[80vh] py-8 my-auto">
                        <div className="space-y-4 mt-6 animate-in fade-in zoom-in duration-1000">
                            <span className="text-[10px] md:text-xs font-light tracking-[0.35em] uppercase text-[#f0d78a] block">
                                THE WEDDING OF
                            </span>
                            <div className="py-2">
                                <img src="https://cdn-uploads.owlink.id/4cd0a2c0-ad17-11f0-8490-6bb702a47ed0.png" className="w-24 md:w-32 mx-auto opacity-70" alt="divider" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-light tracking-wide uppercase font-serif py-4 text-[#f0d78a]">
                                {content?.groom_nickname || 'Groom'} <span className="font-serif italic text-2xl md:text-3xl font-thin text-white/50 lowercase">&</span> {content?.bride_nickname || 'Bride'}
                            </h1>
                            <span className="text-xs md:text-sm font-light tracking-[0.2em] text-white/80 block uppercase">
                                {mainEventDate ? new Date(mainEventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '17 JANUARI 2026'}
                            </span>
                        </div>
                        <div className="space-y-6 flex flex-col items-center">
                            <div className="bg-[#491217]/50 border border-[#cba93c]/35 p-5 rounded-2xl backdrop-blur-md px-10">
                                <span className="text-[9px] tracking-[0.3em] text-[#f0d78a]/70 block mb-1.5 uppercase font-medium">DEAR,</span>
                                <span className="text-lg md:text-xl font-light tracking-wide font-serif text-white">{guestName || 'Tamu Undangan'}</span>
                            </div>
                            <button
                                onClick={openInvitation}
                                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#cba93c] to-[#e5c158] hover:brightness-110 text-[#2e0202] px-8 py-3.5 rounded-xl font-medium tracking-[0.2em] text-xs transition-all hover:scale-105 uppercase shadow-xl"
                            >
                                ✉ BUKA UNDANGAN
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-start md:justify-center text-center p-6 transition-all duration-1000 overflow-y-auto pt-16 pb-6 md:py-8 ${isCinemaTheme ? 'bg-black text-white font-serif' : (is3DTheme ? (isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900') : (isDark ? 'bg-slate-950 text-white' : 'bg-[#FAF6F0] text-navy'))} ${isOpening ? 'scale-[1.5] opacity-0 blur-xl pointer-events-none' : 'scale-100 opacity-100'}`}>
                <Head title={invitation.title}>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@400;750&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
                </Head>
                {!invitation.is_active && (
                    <div className="fixed top-0 left-0 w-full bg-amber-500/95 backdrop-blur text-white text-xs font-bold text-center py-2.5 z-[200] shadow-md flex items-center justify-center gap-2">
                        <span>⚡ Mode Pratinjau: Undangan ini masih berstatus Draft.</span>
                    </div>
                )}
                {isCinemaTheme ? (
                    cover_image ? (
                        <div className="absolute inset-0 z-0">
                            <img src={`/storage/${cover_image}`} className="w-full h-full object-cover opacity-35 filter grayscale contrast-125 brightness-50" alt="Cover" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75"></div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 z-0 bg-neutral-950">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950"></div>
                        </div>
                    )
                ) : (
                    cover_image ? (
                        <div className="absolute inset-0 z-0">
                            <img src={`/storage/${cover_image}`} className="w-full h-full object-cover opacity-45 filter blur-sm" alt="Cover Blur" />
                            <div className={`absolute inset-0 ${isDark ? 'bg-slate-950/75' : 'bg-white/75'}`}></div>
                        </div>
                    ) : (
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <div className="absolute top-10 left-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
                            <div className="absolute bottom-10 right-10 w-96 h-96 bg-navy rounded-full blur-3xl"></div>
                        </div>
                    )
                )}
                {isCinemaTheme ? (
                    <div className="relative z-10 max-w-lg mx-auto flex flex-col justify-between min-h-[75vh] md:h-[85vh] py-8 text-white my-auto">
                        <div className="space-y-1 mt-6">
                            <span className="text-[10px] md:text-xs font-light tracking-[0.35em] uppercase text-white/60 block">
                                WE INVITE YOU TO OUR WEDDING
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extralight tracking-[0.1em] uppercase font-serif py-8 flex items-center justify-center gap-2">
                                {content?.groom_nickname || 'Groom'}
                                <span className="inline-flex items-center justify-center mx-2 text-white/50">
                                    <svg className="w-8 h-8 md:w-10 md:h-10 fill-current" viewBox="0 0 64 64">
                                        <path d="M24,12 C15.16,12 8,19.16 8,28 C8,36.84 15.16,44 24,44 C27.97,44 31.57,42.54 34.33,40.14 C36.96,43.76 41.2,46 46,46 C54.84,46 62,38.84 62,30 C62,21.16 54.84,14 46,14 C42.03,14 38.43,15.46 35.67,17.86 C33.04,14.24 28.8,12 24,12 Z M24,16 C28.16,16 31.75,18.33 33.52,21.75 C30.65,24.16 28,27.35 28,31 C28,34.65 30.65,37.84 33.52,40.25 C31.75,43.67 28.16,46 24,46 C17.38,46 12,40.62 12,34 C12,27.38 17.38,22 24,22 Z M46,18 C52.62,18 58,23.38 58,30 C58,36.62 52.62,42 46,42 C41.84,42 38.25,39.67 36.48,36.25 C39.35,33.84 42,30.65 42,27 C42,23.35 39.35,20.16 36.48,17.75 C38.25,14.33 41.84,12 46,12 Z" />
                                    </svg>
                                </span>
                                {content?.bride_nickname || 'Bride'}
                            </h1>
                            <span className="text-xs md:text-sm font-light tracking-[0.2em] text-white/70 block uppercase">
                                {mainEventDate ? new Date(mainEventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '17 JANUARI 2026'}
                            </span>
                        </div>
                        <div className="space-y-6 flex flex-col items-center">
                            <div>
                                <span className="text-[9px] tracking-[0.3em] text-white/40 block mb-2 uppercase font-medium">DEAR,</span>
                                <span className="text-lg md:text-xl font-light tracking-wide font-serif">{guestName || 'Tamu Undangan'}</span>
                            </div>
                            <button
                                onClick={openInvitation}
                                className="inline-flex items-center gap-2.5 border border-white/80 hover:bg-white hover:text-black text-white px-8 py-3.5 rounded-xl font-light tracking-[0.2em] text-xs transition-all hover:scale-105 uppercase"
                            >
                                ✉ LET'S OPEN
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={`relative z-10 max-w-lg mx-auto space-y-6 my-auto ${is3DTheme ? 'p-6 xs:p-10 rounded-[2.5rem] bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]' : ''}`}>
                        <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary" style={{ color: themeColor }}>
                            UNDANGAN {category?.name || 'ACARA'}
                        </span>
                        <h1 className={is3DTheme ? "text-4xl md:text-6xl font-extralight tracking-widest uppercase mb-4" : "text-4xl md:text-5xl font-extrabold tracking-tight"}>
                            {isPernikahan
                                ? (is3DTheme ? (
                                    <span className="flex flex-col items-center justify-center gap-1.5">
                                        <span className="font-light tracking-[0.2em]">{content?.groom_nickname || 'Groom'}</span>
                                        <span className="text-xl md:text-2xl font-serif text-slate-400 dark:text-slate-500 italic font-thin">&</span>
                                        <span className="font-light tracking-[0.2em]">{content?.bride_nickname || 'Bride'}</span>
                                    </span>
                                ) : `${content?.groom_nickname || 'Groom'} & ${content?.bride_nickname || 'Bride'}`)
                                : (content?.child_name || invitation.title)
                            }
                        </h1>
                        {guestName && (
                            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md p-5 xs:p-6 rounded-3xl border border-white/20 shadow-lg mt-6">
                                <span className="text-xs opacity-70 block mb-1">Kepada Yth. Bapak/Ibu/Saudara/i:</span>
                                <span className="text-lg font-bold">{guestName}</span>
                            </div>
                        )}
                        <button
                            onClick={openInvitation}
                            className="bg-primary text-white px-8 xs:px-10 py-3.5 xs:py-4 rounded-full font-bold text-base xs:text-lg shadow-2xl transition-all hover:scale-105"
                            style={{ backgroundColor: themeColor, boxShadow: `0 10px 25px -5px ${themeColor}60` }}
                        >
                            💌 Buka Undangan
                        </button>
                    </div>
                )}
            </div>
        );
    };
    return (
        <>
            {music_url && <audio ref={audioRef} src={music_url} loop />}
            {(!showInvitation || isOpening) && renderCover()}

            <div
                className={`min-h-screen transition-colors duration-700 relative overflow-hidden ${isLuxuryTheme
                    ? 'bg-[#0a0a0a] text-white font-sans'
                    : (isBurgundyTheme ? 'bg-[#2e0202] text-white font-serif' : (isCinemaTheme ? 'bg-neutral-950 text-white' : (is3DTheme ? (isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900') : (isDark ? 'bg-slate-900 text-white' : 'bg-[#FAF6F0] text-navy'))))
                    }`}
                style={
                    isLuxuryTheme
                        ? {}
                        : (isBurgundyTheme ? { backgroundImage: "url('https://cdn-uploads.owlink.id/d57ca580-ab4e-11f0-aa4f-43153b9232d2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : {})
                }
            >
                <Head title={invitation.title}>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@400;750&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
                </Head>
                {isCinemaTheme && (
                    <>
                        <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@400;750&display=swap');
                        @keyframes floatDust {
                            0% { transform: translateY(100vh) translateX(0) scale(1); opacity: 0; }
                            10% { opacity: 0.3; }
                            90% { opacity: 0.3; }
                            100% { transform: translateY(-10vh) translateX(50px) scale(0.5); opacity: 0; }
                        }
                        .animate-dust {
                            animation: floatDust linear infinite;
                        }
                        @keyframes float3DLeft {
                            0% { transform: perspective(1000px) rotateX(0.8deg) rotateY(1.2deg) translateZ(0); }
                            50% { transform: perspective(1000px) rotateX(-0.8deg) rotateY(-1.2deg) translateZ(6px); }
                            100% { transform: perspective(1000px) rotateX(0.8deg) rotateY(1.2deg) translateZ(0); }
                        }
                        @keyframes float3DRight {
                            0% { transform: perspective(1000px) rotateX(-0.8deg) rotateY(-1.2deg) translateZ(0); }
                            50% { transform: perspective(1000px) rotateX(0.8deg) rotateY(1.2deg) translateZ(6px); }
                            100% { transform: perspective(1000px) rotateX(-0.8deg) rotateY(-1.2deg) translateZ(0); }
                        }
                        .animate-3d-left {
                            animation: float3DLeft 14s ease-in-out infinite;
                            transform-style: preserve-3d;
                        }
                        .animate-3d-right {
                            animation: float3DRight 14s ease-in-out infinite;
                            transform-style: preserve-3d;
                        }
                    `}</style>
                        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-30">
                            {dustParticles.map((particle) => (
                                <div
                                    key={particle.id}
                                    className="absolute bg-white rounded-full animate-dust"
                                    style={{
                                        left: particle.left,
                                        bottom: `-10px`,
                                        width: particle.width,
                                        height: particle.height,
                                        animationDuration: particle.duration,
                                        animationDelay: particle.delay,
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
                {!invitation.is_active && (
                    <div className="fixed top-0 left-0 w-full bg-amber-500/95 backdrop-blur text-white text-xs font-bold text-center py-2.5 z-[200] shadow-md flex items-center justify-center gap-2">
                        <span>⚡ Mode Pratinjau: Undangan ini masih berstatus Draft.</span>
                    </div>
                )}
                {/* Glowing background circles for 3D Theme */}
                {is3DTheme && (
                    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
                        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
                        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-[#3B82F6]/15 blur-[150px] animate-pulse" style={{ animationDuration: '12s' }}></div>
                        <div className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full bg-primary/15 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>
                    </div>
                )}
                {/* Floating Action Buttons */}
                {showInvitation && (
                    <div className="fixed bottom-6 right-4 xs:right-6 z-[150] flex flex-col gap-3 transition-all duration-700 items-end">
                        {/* Back to Top */}
                        <div className={`transition-all duration-500 transform ${isAtBottom ? 'translate-x-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg hover:bg-white/20 hover:scale-110 transition-all"
                                title="Kembali ke atas"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                            </button>
                        </div>
                        {/* Auto Scroll */}
                        <button
                            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                            className={`w-8 h-8 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg hover:scale-110 transition-all ${isAutoScrolling ? 'bg-white/90 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            title={isAutoScrolling ? "Hentikan Scroll" : "Auto Scroll"}
                        >
                            {isAutoScrolling ? (
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                            )}
                        </button>
                        {/* Music */}
                        {music_url && (
                            <button
                                onClick={toggleMusic}
                                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border border-white/20 hover:scale-110 transition-all ${isPlaying ? 'bg-white/90 text-black animate-spin-slow' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                title={isPlaying ? "Mute" : "Play"}
                            >
                                <span className="text-[10px]">{isPlaying ? '🎵' : '🔇'}</span>
                            </button>
                        )}
                    </div>
                )}
                {/* Theme Toggle Button */}
                {(!isCinemaTheme && !isLuxuryTheme) && (
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/20 backdrop-blur-md shadow-lg border border-white/30"
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>
                )}
                {/* Hero Section */}
                {themeId === 'luxury-wedding' ? (
                    /* Custom Luxury Wedding Fullscreen Hero Section */
                    <section className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black text-white">
                        {/* Fullscreen Background Image */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src={content.hero_image ? `/storage/${content.hero_image}` : (cover_image ? `/storage/${cover_image}` : 'https://cdn-uploads.owlink.id/d57ca580-ab4e-11f0-aa4f-43153b9232d2.jpg')}
                                alt="Hero Fullscreen"
                                className="w-full h-full object-cover brightness-[0.55] contrast-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55"></div>
                        </div>

                        <style>{`
                        @keyframes floatDustLuxury {
                            0% { transform: translate3d(0, 10vh, 0) scale(0.8); opacity: 0; }
                            20% { opacity: 0.5; }
                            80% { opacity: 0.5; }
                            100% { transform: translate3d(40px, -120vh, 0) scale(1.2); opacity: 0; }
                        }
                        .animate-dust-luxury {
                            animation: floatDustLuxury ease-in-out infinite;
                            will-change: transform, opacity;
                        }
                        @keyframes swipeUpLuxury {
                            0%, 100% { transform: translateY(0); opacity: 0.5; }
                            50% { transform: translateY(-10px); opacity: 1; }
                        }
                        .animate-swipe-up-luxury {
                            animation: swipeUpLuxury 2s ease-in-out infinite;
                            will-change: transform, opacity;
                        }
                    `}</style>
                        {/* Dust Particles */}
                        <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
                            {dustParticles.map((particle) => (
                                <div
                                    key={particle.id}
                                    className="absolute bg-white rounded-full animate-dust-luxury"
                                    style={{
                                        left: particle.left,
                                        bottom: `-20px`,
                                        width: particle.width,
                                        height: particle.height,
                                        animationDuration: particle.duration,
                                        animationDelay: particle.delay,
                                        boxShadow: '0 0 6px rgba(255,255,255,0.6)'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Cursive Names on Surface of the Photo */}
                        <div className="relative z-10 scroll-animate-fast opacity-0 delay-[100ms]">
                            <h1
                                className="text-6xl xs:text-7xl md:text-9xl text-white leading-[0.8] text-center"
                                style={{
                                    fontFamily: "'Great Vibes', cursive",
                                    transform: "rotate(-4deg)",
                                    textShadow: '2px 4px 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.4)'
                                }}
                            >
                                <span className="block pr-12 xs:pr-16 text-white">{content?.groom_nickname || 'Romeo'} &</span>
                                <span className="block pl-12 xs:pl-16 pt-2 xs:pt-4 text-white">{content?.bride_nickname || 'Juliet'}</span>
                            </h1>
                        </div>
                        {/* Swipe Up Indicator */}
                        <div className="absolute bottom-8 xs:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20 animate-in fade-in duration-500 delay-[400ms]">
                            <div className="animate-swipe-up-luxury flex flex-col items-center">
                                <svg className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                </svg>
                                <svg className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-lg -mt-3 md:-mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                </svg>
                                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-medium mt-3 text-white drop-shadow-lg">Geser Ke Atas</span>
                            </div>
                        </div>
                    </section>
                ) : (
                    /* Standard Hero Section */
                    <section className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                        {isCinemaTheme ? (
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                <video
                                    src={content?.prewedding_video_url || "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-walking-in-a-forest-42588-large.mp4"}
                                    loop
                                    muted
                                    playsInline
                                    autoPlay
                                    className="w-full h-full object-cover filter grayscale contrast-125 brightness-[0.35]"
                                />
                                <div className="absolute inset-0 bg-black/40"></div>
                            </div>
                        ) : (
                            (content?.hero_image || cover_image) && (
                                <div className="absolute inset-0 z-0">
                                    <img src={`/storage/${content?.hero_image || cover_image}`} className="w-full h-full object-cover opacity-35" alt="Cover" />
                                    <div className={`absolute inset-0 ${isDark ? 'bg-slate-900/60' : 'bg-[#FAF6F0]/60'}`}></div>
                                </div>
                            )
                        )}
                        <div className="relative z-10 space-y-6 max-w-3xl scroll-animate-fast opacity-0">
                            <span className="text-sm font-bold tracking-[0.3em] uppercase block" style={{ color: themeColor }}>
                                UNDANGAN {category?.name}
                            </span>
                            <h1 className={(is3DTheme || isCinemaTheme || isBurgundyTheme) ? `text-5xl md:text-7xl font-extralight tracking-widest uppercase mb-4 ${isBurgundyTheme ? 'text-[#f0d78a]' : ''}` : "text-6xl md:text-8xl font-black tracking-tighter"}>
                                {isPernikahan
                                    ? ((is3DTheme || isCinemaTheme || isBurgundyTheme) ? (
                                        <span className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                                            <span className="font-light tracking-[0.2em]">{content?.groom_nickname}</span>
                                            <span className="text-3xl md:text-5xl font-serif text-slate-400 dark:text-slate-500 italic font-thin">&</span>
                                            <span className="font-light tracking-[0.2em]">{content?.bride_nickname}</span>
                                        </span>
                                    ) : `${content?.groom_nickname} & ${content?.bride_nickname}`)
                                    : content?.child_name
                                }
                            </h1>
                            <div className="w-24 h-1 mx-auto rounded-full mt-8 mb-4" style={{ backgroundColor: themeColor }}></div>

                            {/* Countdown */}
                            {mainEventDate && (
                                <div className="space-y-6 max-w-lg mx-auto py-4">
                                    <h2 className="text-xl md:text-2xl font-light tracking-[0.4em] uppercase opacity-90 mb-6">Save The Date</h2>
                                    {isEventPassed ? (
                                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-lg inline-block">
                                            <p className="text-xl font-bold tracking-wide">🎉 Acara Telah Berlangsung 🎉</p>
                                            <p className="text-xs opacity-75 mt-1">Terima kasih atas segala doa restu & kehadiran Anda.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-4 gap-2 xs:gap-4">
                                                {Object.entries(timeLeft).map(([unit, value]) => (
                                                    <div key={unit} className={`p-2 xs:p-4 rounded-2xl xs:rounded-3xl border shadow-lg ${isBurgundyTheme ? 'bg-[#491217]/60 border-[#cba93c]/30 text-white' : 'bg-white/10 backdrop-blur-md border-white/20'}`}>
                                                        <div className="text-xl xs:text-2xl md:text-4xl font-bold">{value}</div>
                                                        <div className="text-[8px] xs:text-[10px] uppercase tracking-widest opacity-60 font-bold">{unit}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {isCinemaTheme && (
                                                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden mt-6 mb-8 relative border border-white/5 shadow-inner">
                                                    <div
                                                        className="bg-white h-full transition-all duration-1000 shadow-[0_0_8px_#fff]"
                                                        style={{ width: `${getTimelineProgress()}%` }}
                                                    />
                                                    <div className="absolute top-3 left-0 right-0 flex justify-between text-[8px] uppercase tracking-[0.2em] text-neutral-500 font-sans px-1">
                                                        <span>H-90</span>
                                                        <span>MENUJU HARI H</span>
                                                        <span>HARI H</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="pt-2">
                                                <a
                                                    href={getGoogleCalendarUrl(
                                                        isPernikahan
                                                            ? `Pernikahan ${content?.groom_nickname} & ${content?.bride_nickname}`
                                                            : (content?.child_name || invitation.title),
                                                        mainEventDate,
                                                        mainEventLocation,
                                                        mainEventAddress
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm border shadow-lg transition-all hover:scale-105 ${isBurgundyTheme ? 'bg-[#cba93c] border-[#cba93c] text-[#2e0202] hover:brightness-110' : 'bg-white/20 hover:bg-white/35 backdrop-blur-md text-white border-white/30'}`}
                                                >
                                                    📅 Simpan di Google Calendar
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            <div className="w-24 h-1 mx-auto rounded-full mt-8" style={{ backgroundColor: themeColor }}></div>
                            <p className={`text-xl md:text-2xl opacity-80 max-w-2xl mx-auto italic mt-6 ${(isCinemaTheme || isBurgundyTheme) ? 'font-light tracking-wide' : 'font-medium'}`}>
                                "{content?.salam_pembuka}"
                            </p>
                        </div>
                        {/* General Swipe Up Indicator */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20 animate-bounce opacity-80">
                            <span className="text-[10px] tracking-widest uppercase font-bold mb-2 text-white drop-shadow-md">Scroll Ke Atas</span>
                            <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        </div>
                    </section>
                )}
                {/* Greeting & Countdown Section for Luxury Wedding */}
                {themeId === 'luxury-wedding' && (
                    <section className="py-16 md:py-24 text-center px-6 relative z-10 bg-[#0d0d0d] border-b border-white/10">
                        <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-1000">
                            {/* Salam / Greeting */}
                            <h3 className="text-sm md:text-lg font-light tracking-[0.1em] md:tracking-[0.15em] uppercase font-serif bg-clip-text text-transparent bg-gradient-to-r from-[#a3a3a3] via-[#ffffff] to-[#737373] font-bold mx-auto text-center">
                                {content?.salam_pembuka}
                            </h3>
                            {/* Countdown Grid */}
                            {mainEventDate && (
                                <div className="space-y-8 pt-4">
                                    {isEventPassed ? (
                                        <div className="bg-[#121212]/80 border border-[#a3a3a3]/30 p-6 rounded-3xl shadow-lg inline-block text-white">
                                            <p className="text-xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-[#a3a3a3] via-[#ffffff] to-[#737373]">🎉 Acara Telah Berlangsung 🎉</p>
                                            <p className="text-xs opacity-75 mt-1">Terima kasih atas segala doa restu & kehadiran Anda.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-4" ref={countdownRef}>
                                            {/* Save The Date text */}
                                            <h2
                                                className={`text-5xl md:text-6xl text-white drop-shadow-md pb-2 transition-all duration-1000 delay-500 ease-out transform ${isCountdownVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                                                style={{ fontFamily: "'Great Vibes', cursive", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
                                            >
                                                Save The Date
                                            </h2>

                                            {/* Slanted Date Banner */}
                                            <div className={`flex items-stretch justify-center shadow-2xl pb-2 transition-all duration-1000 ease-out transform ${isCountdownVisible ? 'opacity-100 translate-y-0 -skew-x-12' : 'opacity-0 translate-y-10 -skew-x-12'}`}>
                                                <div className="bg-neutral-600 text-white px-6 md:px-8 py-2 md:py-3 flex items-center justify-center border border-neutral-600">
                                                    <span className="block transform skew-x-12 font-bold italic text-lg md:text-xl tracking-wide">
                                                        {mainEventDate ? ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date(mainEventDate).getDay()] : 'Selasa'}
                                                    </span>
                                                </div>
                                                <div className="bg-white text-neutral-600 px-6 md:px-8 py-2 md:py-3 flex items-center justify-center border border-white">
                                                    <span className="block transform skew-x-12 font-bold italic text-lg md:text-xl tracking-wide">
                                                        {mainEventDate ? `${new Date(mainEventDate).getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][new Date(mainEventDate).getMonth()]} ${new Date(mainEventDate).getFullYear()}` : '23 Juni 2026'}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Dotted Line */}
                                            <div className={`w-full max-w-[280px] md:max-w-[360px] mx-auto border-b-[3px] border-dotted border-white/40 my-6 transition-all duration-1000 delay-300 ${isCountdownVisible ? 'opacity-100' : 'opacity-0'}`}></div>
                                            {/* Countdown Numbers */}
                                            <div className={`flex justify-center gap-6 md:gap-12 w-full pt-2 transition-all duration-1000 delay-700 ease-out transform ${isCountdownVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                                {Object.entries(displayTimeLeft).map(([unit, value]) => (
                                                    <div key={unit} className="flex flex-col items-center text-white">
                                                        <div className="text-3xl md:text-4xl font-black tracking-wider mb-1 drop-shadow-md min-w-[3rem] text-center">{value}</div>
                                                        <div className="text-xs md:text-sm uppercase tracking-widest font-bold opacity-90 drop-shadow-sm">{unit}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Save to Calendar Button */}
                                            <div className="pt-8">
                                                <a
                                                    href={getGoogleCalendarUrl(
                                                        isPernikahan
                                                            ? `Pernikahan ${content?.groom_nickname} & ${content?.bride_nickname}`
                                                            : (content?.child_name || invitation.title),
                                                        mainEventDate,
                                                        mainEventLocation,
                                                        mainEventAddress
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-lg transition-all hover:scale-105 bg-white text-black hover:bg-neutral-200"
                                                >
                                                    📅 Simpan di Google Calendar
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}
                {/* Opening / Introduction Section */}
                <section className={`py-12 md:py-24 ${isLuxuryTheme
                    ? 'bg-[#121212]/40 border-t border-[#a3a3a3]/15'
                    : (isBurgundyTheme ? 'bg-[#1f0101]/30 border-y border-[#cba93c]/15' : (isDark ? 'bg-slate-800/40' : 'bg-white/50'))
                    } scroll-animate opacity-0`}>
                    <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
                        <p className={`text-sm md:text-base leading-relaxed max-w-2xl mx-auto whitespace-pre-line ${isLuxuryTheme ? 'text-neutral-500 font-light' : (isBurgundyTheme ? 'text-[#f0d78a]/80' : 'opacity-80')}`}>{content?.teks_pembuka}</p>
                    </div>
                </section>
                {/* Split Text LOVE Transition */}
                {isLuxuryTheme && (
                    <div className="relative w-full overflow-hidden select-none z-10 -mb-2">
                        {/* Upper Half (Black Background) */}
                        <div className="bg-[#121212]/40 pt-12 pb-0 flex flex-col items-center justify-end">
                            <span
                                className="text-4xl md:text-5xl text-white mb-2"
                                style={{ fontFamily: "'Great Vibes', cursive" }}
                            >
                                Celebrating Our
                            </span>
                            <div
                                className="text-8xl md:text-[12rem] font-bold tracking-[0.15em] text-white leading-none translate-y-[15%] font-sans"
                                style={{ fontFamily: "'Cinzel', serif" }}
                            >
                                LO
                            </div>
                        </div>
                        {/* Lower Half (Ivory/Champagne Background) */}
                        <div className="bg-neutral-100 pt-0 pb-12 flex flex-col items-center justify-start">
                            <div
                                className="text-8xl md:text-[12rem] font-bold tracking-[0.15em] text-black leading-none -translate-y-[15%] font-sans"
                                style={{ fontFamily: "'Cinzel', serif" }}
                            >
                                VE
                            </div>
                            <span
                                className="text-4xl md:text-5xl text-neutral-500 mt-2"
                                style={{ fontFamily: "'Great Vibes', cursive" }}
                            >
                                With You
                            </span>
                        </div>
                    </div>
                )}
                {/* Profiling Section */}
                <section className={`py-12 md:py-24 scroll-animate opacity-0 relative z-10 overflow-hidden ${isLuxuryTheme
                    ? 'bg-neutral-100 text-black'
                    : (isBurgundyTheme ? 'bg-transparent z-10' : (isCinemaTheme ? 'bg-[#060606] z-10' : 'z-10'))
                    }`}>
                    <div className="max-w-5xl mx-auto px-6">
                        {isPernikahan ? (
                            <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center relative">
                                {isLuxuryTheme && (
                                    <div className="flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                                        <div className="scroll-animate opacity-0 delay-[800ms] flex items-center justify-center">
                                            <img src="/images/ring.png" alt="Rings" className="w-24 h-24 md:w-40 md:h-40 object-contain drop-shadow-2xl opacity-90" />
                                        </div>
                                    </div>
                                )}
                                {/* Mempelai Wanita */}
                                {isLuxuryTheme ? (
                                    <div className="flex flex-col items-center md:items-end text-center md:text-right mt-8 mb-12">
                                        <div className="relative w-full max-w-[280px] md:max-w-[320px] mx-auto md:mr-0 md:ml-auto mb-16 scroll-animate-right opacity-0 translate-x-32 transition-all duration-1000 ease-out">
                                            <div className="absolute top-6 left-6 right-[-1.5rem] bottom-[-1.5rem] bg-neutral-300 shadow-md"></div>
                                            <div className="relative w-full aspect-[2/3] bg-white shadow-lg overflow-hidden border border-neutral-200">
                                                {content?.bride_photo ? (
                                                    <img src={content.bride_photo.startsWith('http') ? content.bride_photo : `/storage/${content.bride_photo}`} className="w-full h-full object-cover" alt="Mempelai Wanita" />
                                                ) : (
                                                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-6xl text-neutral-300">👩</div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-12 left-0 right-0 text-center md:text-right pointer-events-none z-10 flex flex-col items-center md:items-end md:pr-4">
                                                <h3
                                                    className="text-7xl md:text-8xl text-black scroll-animate opacity-0 delay-[150ms]"
                                                    style={{ fontFamily: "'Great Vibes', cursive", textShadow: "0 4px 15px rgba(255,255,255,0.9), 0 0 5px rgba(255,255,255,0.8)" }}
                                                >
                                                    {content?.bride_nickname || 'Juliet'}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex flex-col items-center md:items-end space-y-1.5 relative z-20 px-4 text-center md:text-right">
                                            <h4 className="text-lg md:text-xl font-medium tracking-[0.2em] uppercase text-black font-sans scroll-animate opacity-0 delay-[300ms]">
                                                {content?.bride_name || 'JULIET VERNOICA'}
                                            </h4>
                                            <a href={`https://instagram.com/${(content?.bride_instagram || 'juliet.ve').replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-end gap-1.5 text-xs md:text-sm tracking-[0.15em] text-neutral-500 font-sans hover:text-black transition-colors uppercase scroll-animate opacity-0 delay-[450ms]">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                                {(content?.bride_instagram || 'juliet.ve').replace('@', '')}
                                            </a>
                                            <p className="text-xs md:text-sm text-neutral-600 italic mt-2 leading-relaxed scroll-animate opacity-0 delay-[600ms]">
                                                {content?.bride_parents || 'Putri dari Bapak ... & Ibu ...'}
                                            </p>
                                        </div>
                                    </div>
                                ) : isBurgundyTheme ? (
                                    <div>
                                        <TiltCard themeColor={themeColor} className={`${cardBgClass} rounded-[2.5rem] p-8 md:p-12 text-center space-y-4 shadow-2xl relative scroll-animate-right opacity-0 translate-x-32 transition-all duration-1000 ease-out`}>
                                            <div className="absolute top-4 left-4 w-12 h-12 opacity-35 bg-contain bg-no-repeat" style={{ filter: "grayscale(100%) brightness(1.5)", backgroundImage: "url('https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png')", transform: "scale(-1)" }}></div>
                                            <div className="absolute bottom-4 right-4 w-12 h-12 opacity-35 bg-contain bg-no-repeat" style={{ filter: "grayscale(100%) brightness(1.5)", backgroundImage: "url('https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png')" }}></div>
                                            {content?.bride_photo ? (
                                                <div className="relative w-44 h-44 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-[#cba93c]/30 transform-style-3d">
                                                    <img src={content.bride_photo.startsWith('http') ? content.bride_photo : `/storage/${content.bride_photo}`} className="w-full h-full object-cover" alt="Mempelai Wanita" />
                                                </div>
                                            ) : (
                                                <div className="w-44 h-44 bg-[#1f0101] rounded-full flex items-center justify-center text-6xl mx-auto shadow-inner border border-[#cba93c]/20">👩</div>
                                            )}
                                            <h3 className={`text-3xl font-light tracking-widest font-sans mt-4 text-[#f0d78a]`}>
                                                {content?.bride_name}
                                            </h3>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Nama Panggilan: {content?.bride_nickname}</p>
                                            <div className="w-12 h-[1px] bg-[#cba93c]/30 mx-auto"></div>
                                            <p className="text-xs max-w-xs mx-auto italic leading-relaxed text-white/80">{content?.bride_parents}</p>
                                        </TiltCard>
                                    </div>
                                ) : isCinemaTheme ? (
                                    <div style={getCameraStyle('left')} className="w-full flex justify-start">
                                        <div className="animate-3d-left w-full max-w-[420px] flex flex-col items-start text-left py-4">
                                            <div className="relative w-full max-w-[380px] aspect-square mb-6">
                                                {content?.bride_photo ? (
                                                    <img src={content.bride_photo.startsWith('http') ? content.bride_photo : `/storage/${content.bride_photo}`} className="w-full h-full object-cover filter grayscale contrast-115 shadow-2xl border border-white/10 rounded-sm" alt="Mempelai Wanita" />
                                                ) : (
                                                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-6xl shadow-inner border border-white/10 rounded-sm">👩</div>
                                                )}
                                                <div
                                                    className="absolute -right-6 xs:-right-8 md:-right-16 top-1/2 -translate-y-1/2 text-3xl xs:text-4xl md:text-5xl text-rose-700 italic select-none pointer-events-none whitespace-nowrap rotate-90 origin-center"
                                                    style={{ fontFamily: "'Great Vibes', cursive", textShadow: "0 0 10px rgba(0,0,0,0.8)" }}
                                                >
                                                    The Bride
                                                </div>
                                            </div>
                                            {content?.bride_instagram && (
                                                <div className="flex items-center gap-2 text-neutral-400 font-sans text-xs tracking-wider uppercase font-semibold mb-2">
                                                    <svg className="w-4 h-4 fill-current text-neutral-400" viewBox="0 0 24 24">
                                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                                    </svg>
                                                    @{content.bride_instagram}
                                                </div>
                                            )}
                                            <h3 className="text-4xl md:text-5xl font-light tracking-widest text-white leading-tight uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>{content?.bride_name}</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-2">Nama Panggilan: {content?.bride_nickname}</p>
                                            <div className="w-12 h-[1px] bg-white/10 my-3"></div>
                                            <p className="text-xs text-neutral-300 italic leading-relaxed">{content?.bride_parents}</p>
                                        </div>
                                    </div>
                                ) : is3DTheme ? (
                                    <TiltCard themeColor={themeColor} className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center space-y-4 shadow-xl scroll-animate-right opacity-0 translate-x-32 transition-all duration-1000 ease-out">
                                        {content?.bride_photo ? (
                                            <div className="relative w-44 h-44 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white/20 transform-style-3d">
                                                <img src={content.bride_photo.startsWith('http') ? content.bride_photo : `/storage/${content.bride_photo}`} className="w-full h-full object-cover" alt="Mempelai Wanita" />
                                            </div>
                                        ) : (
                                            <div className="w-44 h-44 bg-slate-200 dark:bg-slate-800/80 rounded-full flex items-center justify-center text-6xl mx-auto shadow-inner border border-white/10">👩</div>
                                        )}
                                        <h3 className="text-3xl font-extralight tracking-wider mt-4" style={{ color: themeColor }}>{content?.bride_name}</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-60">Nama Panggilan: {content?.bride_nickname}</p>
                                        <div className="w-12 h-[1px] bg-slate-200 dark:bg-white/20 mx-auto"></div>
                                        <p className="text-xs opacity-75 max-w-xs mx-auto italic">{content?.bride_parents}</p>
                                    </TiltCard>
                                ) : (
                                    <div className="text-center space-y-4 scroll-animate-right opacity-0 translate-x-32 transition-all duration-1000 ease-out">
                                        {content?.bride_photo ? (
                                            <img src={content.bride_photo.startsWith('http') ? content.bride_photo : `/storage/${content.bride_photo}`} className="w-48 h-48 rounded-full object-cover mx-auto shadow-2xl border-4 border-white" alt="Mempelai Wanita" />
                                        ) : (
                                            <div className="w-48 h-48 bg-slate-200 rounded-full flex items-center justify-center text-6xl mx-auto">👩</div>
                                        )}
                                        <h3 className="text-2xl font-bold" style={{ color: themeColor }}>{content?.bride_name}</h3>
                                        <p className="text-sm font-semibold opacity-60">Nama Panggilan: {content?.bride_nickname}</p>
                                        <p className="text-xs opacity-75 max-w-xs mx-auto italic">{content?.bride_parents}</p>
                                    </div>
                                )}

                                {/* Mempelai Pria */}
                                {isLuxuryTheme ? (
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left mt-8 mb-12">
                                        <div className="relative w-full max-w-[280px] md:max-w-[320px] mx-auto md:ml-0 md:mr-auto mb-16 scroll-animate-left opacity-0 -translate-x-32 transition-all duration-1000 ease-out delay-[200ms]">
                                            <div className="absolute top-6 left-[-1.5rem] right-6 bottom-[-1.5rem] bg-neutral-300 shadow-md"></div>
                                            <div className="relative w-full aspect-[2/3] bg-white shadow-lg overflow-hidden border border-neutral-200">
                                                {content?.groom_photo ? (
                                                    <img src={content.groom_photo.startsWith('http') ? content.groom_photo : `/storage/${content.groom_photo}`} className="w-full h-full object-cover" alt="Mempelai Pria" />
                                                ) : (
                                                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-6xl text-neutral-300">👨</div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-12 left-0 right-0 text-center md:text-left pointer-events-none z-10 flex flex-col items-center md:items-start md:pl-4">
                                                <h3
                                                    className="text-7xl md:text-8xl text-black scroll-animate opacity-0 delay-[350ms]"
                                                    style={{ fontFamily: "'Great Vibes', cursive", textShadow: "0 4px 15px rgba(255,255,255,0.9), 0 0 5px rgba(255,255,255,0.8)" }}
                                                >
                                                    {content?.groom_nickname || 'Romeo'}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex flex-col items-center md:items-start space-y-1.5 relative z-20 px-4 text-center md:text-left">
                                            <h4 className="text-lg md:text-xl font-medium tracking-[0.2em] uppercase text-black font-sans scroll-animate opacity-0 delay-[500ms]">
                                                {content?.groom_name || 'ROMEO MONTAGUE'}
                                            </h4>
                                            <a href={`https://instagram.com/${(content?.groom_instagram || 'romeo.mon').replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-start gap-1.5 text-xs md:text-sm tracking-[0.15em] text-neutral-500 font-sans hover:text-black transition-colors uppercase scroll-animate opacity-0 delay-[650ms]">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                                {(content?.groom_instagram || 'romeo.mon').replace('@', '')}
                                            </a>
                                            <p className="text-xs md:text-sm text-neutral-600 italic mt-2 leading-relaxed scroll-animate opacity-0 delay-[800ms]">
                                                {content?.groom_parents || 'Putra dari Bapak ... & Ibu ...'}
                                            </p>
                                        </div>
                                    </div>
                                ) : isBurgundyTheme ? (
                                    <div>
                                        <TiltCard themeColor={themeColor} className={`${cardBgClass} rounded-[2.5rem] p-8 md:p-12 text-center space-y-4 shadow-2xl relative scroll-animate-left opacity-0 -translate-x-32 transition-all duration-1000 ease-out`}>
                                            <div className="absolute top-4 left-4 w-12 h-12 opacity-35 bg-contain bg-no-repeat" style={{ filter: "grayscale(100%) brightness(1.5)", backgroundImage: "url('https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png')", transform: "scale(-1)" }}></div>
                                            <div className="absolute bottom-4 right-4 w-12 h-12 opacity-35 bg-contain bg-no-repeat" style={{ filter: "grayscale(100%) brightness(1.5)", backgroundImage: "url('https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png')" }}></div>
                                            {content?.groom_photo ? (
                                                <div className="relative w-44 h-44 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-[#cba93c]/30 transform-style-3d">
                                                    <img src={content.groom_photo.startsWith('http') ? content.groom_photo : `/storage/${content.groom_photo}`} className="w-full h-full object-cover" alt="Mempelai Pria" />
                                                </div>
                                            ) : (
                                                <div className="w-44 h-44 bg-[#1f0101] rounded-full flex items-center justify-center text-6xl mx-auto shadow-inner border border-[#cba93c]/20">👨</div>
                                            )}
                                            <h3 className={`text-3xl font-light tracking-widest font-sans mt-4 text-[#f0d78a]`}>
                                                {content?.groom_name}
                                            </h3>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Nama Panggilan: {content?.groom_nickname}</p>
                                            <div className="w-12 h-[1px] bg-[#cba93c]/30 mx-auto"></div>
                                            <p className="text-xs max-w-xs mx-auto italic leading-relaxed text-white/80">{content?.groom_parents}</p>
                                        </TiltCard>
                                    </div>
                                ) : isCinemaTheme ? (
                                    <div style={getCameraStyle('right')} className="w-full flex justify-end">
                                        <div className="animate-3d-right w-full max-w-[420px] flex flex-col items-end text-right py-4">
                                            <div className="relative w-full max-w-[380px] aspect-square mb-6">
                                                {content?.groom_photo ? (
                                                    <img src={content.groom_photo.startsWith('http') ? content.groom_photo : `/storage/${content.groom_photo}`} className="w-full h-full object-cover filter grayscale contrast-115 shadow-2xl border border-white/10 rounded-sm" alt="Mempelai Pria" />
                                                ) : (
                                                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-6xl shadow-inner border border-white/10 rounded-sm">👨</div>
                                                )}
                                                <div
                                                    className="absolute -left-6 xs:-left-8 md:-left-16 top-1/2 -translate-y-1/2 text-3xl xs:text-4xl md:text-5xl text-rose-700 italic select-none pointer-events-none whitespace-nowrap rotate-90 origin-center"
                                                    style={{ fontFamily: "'Great Vibes', cursive", textShadow: "0 0 10px rgba(0,0,0,0.8)" }}
                                                >
                                                    The Groom
                                                </div>
                                            </div>
                                            {content?.groom_instagram && (
                                                <div className="flex items-center gap-2 text-neutral-400 font-sans text-xs tracking-wider uppercase font-semibold mb-2 justify-end">
                                                    <svg className="w-4 h-4 fill-current text-neutral-400" viewBox="0 0 24 24">
                                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                                    </svg>
                                                    @{content.groom_instagram}
                                                </div>
                                            )}
                                            <h3 className="text-4xl md:text-5xl font-light tracking-widest text-white leading-tight uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>{content?.groom_name}</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-2">Nama Panggilan: {content?.groom_nickname}</p>
                                            <div className="w-12 h-[1px] bg-white/10 my-3"></div>
                                            <p className="text-xs text-neutral-300 italic leading-relaxed">{content?.groom_parents}</p>
                                        </div>
                                    </div>
                                ) : is3DTheme ? (
                                    <TiltCard themeColor={themeColor} className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center space-y-4 shadow-xl scroll-animate-left opacity-0 -translate-x-32 transition-all duration-1000 ease-out">
                                        {content?.groom_photo ? (
                                            <div className="relative w-44 h-44 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white/20 transform-style-3d">
                                                <img src={content.groom_photo.startsWith('http') ? content.groom_photo : `/storage/${content.groom_photo}`} className="w-full h-full object-cover" alt="Mempelai Pria" />
                                            </div>
                                        ) : (
                                            <div className="w-44 h-44 bg-slate-200 dark:bg-slate-800/80 rounded-full flex items-center justify-center text-6xl mx-auto shadow-inner border border-white/10">👨</div>
                                        )}
                                        <h3 className="text-3xl font-extralight tracking-wider mt-4" style={{ color: themeColor }}>{content?.groom_name}</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-60">Nama Panggilan: {content?.groom_nickname}</p>
                                        <div className="w-12 h-[1px] bg-slate-200 dark:bg-white/20 mx-auto"></div>
                                        <p className="text-xs opacity-75 max-w-xs mx-auto italic">{content?.groom_parents}</p>
                                    </TiltCard>
                                ) : (
                                    <div className="text-center space-y-4 scroll-animate-left opacity-0 -translate-x-32 transition-all duration-1000 ease-out">
                                        {content?.groom_photo ? (
                                            <img src={content.groom_photo.startsWith('http') ? content.groom_photo : `/storage/${content.groom_photo}`} className="w-48 h-48 rounded-full object-cover mx-auto shadow-2xl border-4 border-white" alt="Mempelai Pria" />
                                        ) : (
                                            <div className="w-48 h-48 bg-slate-200 rounded-full flex items-center justify-center text-6xl mx-auto">👨</div>
                                        )}
                                        <h3 className="text-2xl font-bold" style={{ color: themeColor }}>{content?.groom_name}</h3>
                                        <p className="text-sm font-semibold opacity-60">Nama Panggilan: {content?.groom_nickname}</p>
                                        <p className="text-xs opacity-75 max-w-xs mx-auto italic">{content?.groom_parents}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            (isBurgundyTheme || isLuxuryTheme) ? (
                                <div className="max-w-md mx-auto">
                                    <TiltCard themeColor={themeColor} className={`${cardBgClass} rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl relative`}>
                                        <div className="absolute top-4 left-4 w-12 h-12 opacity-35 bg-contain bg-no-repeat" style={{ filter: "grayscale(100%) brightness(1.5)", backgroundImage: "url('https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png')", transform: "scale(-1)" }}></div>
                                        <div className="absolute bottom-4 right-4 w-12 h-12 opacity-35 bg-contain bg-no-repeat" style={{ filter: "grayscale(100%) brightness(1.5)", backgroundImage: "url('https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png')" }}></div>
                                        {content?.child_photo ? (
                                            <div className={`relative w-44 h-44 mx-auto rounded-full overflow-hidden shadow-2xl border-4 ${photoBorderClass} transform-style-3d`}>
                                                <img src={content.child_photo.startsWith('http') ? content.child_photo : `/storage/${content.child_photo}`} className="w-full h-full object-cover" alt="Anak" />
                                            </div>
                                        ) : (
                                            <div className={`w-44 h-44 ${isLuxuryTheme ? 'bg-neutral-100' : 'bg-[#1f0101]'} rounded-full flex items-center justify-center text-6xl mx-auto shadow-inner border ${isLuxuryTheme ? 'border-neutral-300' : 'border-[#cba93c]/20'}`}>👶</div>
                                        )}
                                        <h3
                                            className={isLuxuryTheme ? `text-4xl md:text-5xl mt-3 ${nameTextClass}` : `text-3xl font-light tracking-widest font-serif mt-4 ${nameTextClass}`}
                                            style={isLuxuryTheme ? { fontFamily: "'Great Vibes', cursive" } : {}}
                                        >
                                            {content?.child_name}
                                        </h3>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isLuxuryTheme ? 'text-neutral-500' : 'text-white/70'}`}>Panggilan: {content?.child_nickname}</p>
                                        <div className={`w-12 h-[1px] ${dividerLineClass} mx-auto`}></div>
                                        <p className={`text-xs italic ${isLuxuryTheme ? 'text-neutral-700 font-medium' : 'text-white/80'}`}>{content?.child_parents}</p>
                                    </TiltCard>
                                </div>
                            ) : isCinemaTheme ? (
                                <div style={getCameraStyle('center')} className="max-w-md mx-auto">
                                    <TiltCard themeColor={themeColor} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl">
                                        {content?.child_photo ? (
                                            <div className="relative w-44 h-44 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white/20 transform-style-3d">
                                                <img src={content.child_photo.startsWith('http') ? content.child_photo : `/storage/${content.child_photo}`} className="w-full h-full object-cover filter grayscale contrast-115" alt="Anak" />
                                            </div>
                                        ) : (
                                            <div className="w-44 h-44 bg-neutral-900 rounded-full flex items-center justify-center text-6xl mx-auto shadow-inner border border-white/10">👶</div>
                                        )}
                                        <h3 className="text-3xl font-light tracking-widest font-serif mt-4 text-white">{content?.child_name}</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Panggilan: {content?.child_nickname}</p>
                                        <div className="w-12 h-[1px] bg-white/10 mx-auto"></div>
                                        <p className="text-xs text-neutral-300 italic leading-relaxed">{content?.child_parents}</p>
                                    </TiltCard>
                                </div>
                            ) : is3DTheme ? (
                                <TiltCard themeColor={themeColor} className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-10 text-center space-y-6 max-w-md mx-auto shadow-xl">
                                    {content?.child_photo ? (
                                        <div className="relative w-44 h-44 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white/20 transform-style-3d">
                                            <img src={content.child_photo.startsWith('http') ? content.child_photo : `/storage/${content.child_photo}`} className="w-full h-full object-cover" alt="Anak" />
                                        </div>
                                    ) : (
                                        <div className="w-44 h-44 bg-slate-200 dark:bg-slate-800/80 rounded-full flex items-center justify-center text-6xl mx-auto shadow-inner border border-white/10">👶</div>
                                    )}
                                    <h3 className="text-3xl font-extralight tracking-wider mt-4" style={{ color: themeColor }}>{content?.child_name}</h3>
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">Panggilan: {content?.child_nickname}</p>
                                    <div className="w-12 h-[1px] bg-slate-200 dark:bg-white/20 mx-auto"></div>
                                    <p className="text-xs opacity-75 italic">{content?.child_parents}</p>
                                </TiltCard>
                            ) : (
                                <div className="text-center space-y-6 max-w-md mx-auto">
                                    {content?.child_photo ? (
                                        <img src={content.child_photo.startsWith('http') ? content.child_photo : `/storage/${content.child_photo}`} className="w-48 h-48 rounded-full object-cover mx-auto shadow-2xl border-4 border-white" alt="Anak" />
                                    ) : (
                                        <div className="w-48 h-48 bg-slate-200 rounded-full flex items-center justify-center text-6xl mx-auto">👶</div>
                                    )}
                                    <h3 className="text-3xl font-bold" style={{ color: themeColor }}>{content?.child_name}</h3>
                                    <p className="text-sm font-semibold opacity-60">Panggilan: {content?.child_nickname}</p>
                                    <p className="text-xs opacity-75 italic">{content?.child_parents}</p>
                                </div>
                            )
                        )}
                    </div>
                </section>
                {/* Event Details (Main & Next Events) */}
                <section className={`py-12 md:py-24 ${isLuxuryTheme
                    ? 'bg-[#0d0d0d]/40 border-b border-white/15 pt-20 md:pt-32 -mt-[1px]'
                    : (isBurgundyTheme ? 'bg-[#1f0101]/30 border-y border-[#cba93c]/15' : (is3DTheme ? '' : (isDark ? 'bg-slate-800' : 'bg-white')))
                    } scroll-animate opacity-0 relative z-10`}>
                    {isLuxuryTheme && (
                        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-20">
                            <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-16 md:h-24 fill-neutral-100 rotate-180 transform -translate-y-[1px]">
                                <path d="M0,120 C480,0 960,120 1440,20 L1440,120 L0,120 Z"></path>
                            </svg>
                        </div>
                    )}
                    <div className="max-w-5xl mx-auto px-6 space-y-16 relative z-30">
                        <div className="text-center">
                            <h2 className={
                                isLuxuryTheme
                                    ? `text-4xl font-light tracking-[0.2em] uppercase font-sans text-neutral-400 font-bold`
                                    : ((isCinemaTheme || isBurgundyTheme) ? `text-4xl font-light tracking-[0.2em] uppercase font-serif ${isBurgundyTheme ? 'text-[#f0d78a]' : ''}` : "text-4xl font-extrabold")
                            }>Rangkaian Acara</h2>
                            <p className={`opacity-60 mt-2 ${(isCinemaTheme || isBurgundyTheme || isLuxuryTheme) ? 'font-light tracking-widest text-xs uppercase' : ''}`}>{isPernikahan ? 'Momen istimewa saksi perjalanan cinta kami' : 'Detail pelaksanaan momen bahagia kami'}</p>
                        </div>
                        {isLuxuryTheme ? (
                            <div className="max-w-xl mx-auto bg-transparent text-white pb-12 relative overflow-hidden">
                                {/* Calendar Header */}
                                <div className="text-center py-6">
                                    <h3 className="tracking-[0.3em] uppercase text-sm font-semibold text-neutral-400">
                                        {mainEventDate ? new Date(mainEventDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'JUNI 2026'}
                                    </h3>
                                </div>

                                {/* Calendar Days */}
                                <div className="flex justify-center items-center py-8 text-center">
                                    {/* Previous Day */}
                                    <div className="w-20 md:w-24 py-4 border border-neutral-700/50 opacity-20 blur-[1px] flex flex-col items-center justify-center pointer-events-none select-none -mr-[1px]">
                                        <div className="text-[8px] md:text-[10px] uppercase tracking-widest mb-2 font-semibold">
                                            {mainEventDate ? new Date(new Date(mainEventDate).getTime() - 86400000).toLocaleDateString('id-ID', { weekday: 'long' }) : 'SENIN'}
                                        </div>
                                        <div className="text-3xl md:text-4xl font-serif">
                                            {mainEventDate ? new Date(new Date(mainEventDate).getTime() - 86400000).getDate().toString().padStart(2, '0') : '29'}
                                        </div>
                                    </div>
                                    {/* Main Event Day */}
                                    <div className="w-28 md:w-36 py-8 border border-neutral-700/50 relative z-10 flex flex-col items-center justify-center bg-white/5 shadow-lg">
                                        {/* Red SVG Circle */}
                                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 md:w-44 md:h-44 text-[#a83232] opacity-90 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <style>
                                                {`
                                                @keyframes drawCircle {
                                                    0% { stroke-dashoffset: 400; opacity: 0; }
                                                    20% { opacity: 1; }
                                                    80% { stroke-dashoffset: 0; opacity: 1; }
                                                    100% { stroke-dashoffset: 0; opacity: 0; }
                                                }
                                                .animated-circle {
                                                    stroke-dasharray: 400;
                                                    animation: drawCircle 3s ease-in-out infinite;
                                                }
                                                .animated-circle-delay {
                                                    stroke-dasharray: 400;
                                                    animation: drawCircle 3s ease-in-out infinite;
                                                    animation-delay: 0.2s;
                                                }
                                            `}
                                            </style>
                                            <path className="animated-circle" d="M50,10 C80,10 95,30 90,60 C85,90 50,95 25,85 C5,75 5,40 25,20 C40,5 75,5 85,25" />
                                            <path className="animated-circle-delay" d="M52,12 C78,13 90,32 88,58 C84,86 52,93 28,82 C10,72 8,42 27,24 C41,12 73,12 82,28" />
                                        </svg>
                                        <div className="text-[10px] uppercase tracking-widest mb-2 font-semibold text-white">
                                            {mainEventDate ? new Date(mainEventDate).toLocaleDateString('id-ID', { weekday: 'long' }) : 'SELASA'}
                                        </div>
                                        <div className="text-5xl md:text-6xl font-serif text-white">
                                            {mainEventDate ? new Date(mainEventDate).getDate().toString().padStart(2, '0') : '30'}
                                        </div>
                                    </div>
                                    {/* Next Day */}
                                    <div className="w-20 md:w-24 py-4 border border-neutral-700/50 opacity-20 blur-[1px] flex flex-col items-center justify-center pointer-events-none select-none -ml-[1px]">
                                        <div className="text-[8px] md:text-[10px] uppercase tracking-widest mb-2 font-semibold">
                                            {mainEventDate ? new Date(new Date(mainEventDate).getTime() + 86400000).toLocaleDateString('id-ID', { weekday: 'long' }) : 'RABU'}
                                        </div>
                                        <div className="text-3xl md:text-4xl font-serif">
                                            {mainEventDate ? new Date(new Date(mainEventDate).getTime() + 86400000).getDate().toString().padStart(2, '0') : '01'}
                                        </div>
                                    </div>
                                </div>
                                {/* Save to Calendar Button (Moved) */}
                                {mainEventDate && (
                                    <div className="px-8 pb-10 flex justify-center mt-2">
                                        <a
                                            href={getGoogleCalendarUrl(
                                                `${mainEventName} - ${isPernikahan ? `${content?.groom_nickname} & ${content?.bride_nickname}` : (content?.child_name || invitation.title)}`,
                                                mainEventDate,
                                                mainEventLocation,
                                                mainEventAddress
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-3 px-6 py-3 rounded-none bg-neutral-800 text-white hover:bg-neutral-700 transition-colors w-full max-w-[320px] mx-auto group"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            <span className="text-[11px] tracking-[0.15em] uppercase font-bold text-center mt-[2px] leading-tight">Ingatkan di Google Calendar</span>
                                        </a>
                                    </div>
                                )}
                                {/* Events List */}
                                <div className="px-8 pb-8 flex flex-col items-center space-y-12 w-full">
                                    {content?.events?.map((event, idx) => (
                                        <div key={event.id || idx} className="text-center w-full max-w-sm mx-auto relative pt-8">
                                            {idx > 0 && (
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 border-t border-neutral-700/50"></div>
                                            )}
                                            <p className="text-xl md:text-2xl font-serif text-white font-bold tracking-wide">{event.name}</p>
                                            <p className="text-xs uppercase tracking-widest text-neutral-400 mt-2 font-bold">
                                                {event.date ? new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} {event.time ? `• ${event.time}` : ''}
                                            </p>
                                            <p className="text-sm mt-4 text-neutral-300 font-sans leading-relaxed">
                                                <span className="font-semibold text-white block mb-1">{event.location}</span>
                                                {event.address}
                                            </p>

                                            {event.map_url && (
                                                <div className="pt-4 pb-2">
                                                    <a
                                                        href={event.map_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest bg-white text-black hover:bg-neutral-200 transition-colors shadow-sm"
                                                    >
                                                        📍 Buka Google Maps
                                                    </a>
                                                </div>
                                            )}
                                            {/* Embedded Map for Event */}
                                            <div className="w-full h-40 border border-neutral-700/50 overflow-hidden shadow-sm mt-5 mx-auto">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    scrolling="no"
                                                    marginHeight="0"
                                                    marginWidth="0"
                                                    src={event.lat && event.lng ? `https://maps.google.com/maps?q=${event.lat},${event.lng}&output=embed` : `https://maps.google.com/maps?q=${encodeURIComponent((event.location || '') + ' ' + (event.address || ''))}&output=embed`}
                                                ></iframe>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-12">
                                {content?.events?.map((event, idx) => (
                                    <div key={event.id || idx} className="h-full">
                                        {is3DTheme ? (
                                            <TiltCard themeColor={themeColor} className="h-full space-y-6 p-8 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                                                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ color: themeColor, backgroundColor: `${themeColor}15` }}>
                                                    {event.name}
                                                </span>
                                                <div className="space-y-4 pt-4">
                                                    <p className="text-lg font-bold">
                                                        {event.date ? new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Segera Diumumkan'}
                                                        {event.time ? ` • ${event.time}` : ''}
                                                    </p>
                                                    <p className="font-semibold opacity-80">{event.location}</p>
                                                    <p className="text-sm opacity-60 leading-relaxed">{event.address}</p>
                                                    {event.date && (
                                                        <div className="pt-2">
                                                            <a
                                                                href={getGoogleCalendarUrl(
                                                                    `${event.name} - ${isPernikahan ? `${content?.groom_nickname} & ${content?.bride_nickname}` : (content?.child_name || invitation.title)}`,
                                                                    event.date,
                                                                    event.location,
                                                                    event.address
                                                                )}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs hover:scale-105 transition-all"
                                                                style={{ color: themeColor, backgroundColor: `${themeColor}15` }}
                                                            >
                                                                📅 Ingatkan di Google Calendar
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                                {event.map_url && (
                                                    <div className="pt-2">
                                                        <a
                                                            href={event.map_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs hover:scale-105 transition-all shadow-sm"
                                                            style={{ color: themeColor, backgroundColor: `${themeColor}15` }}
                                                        >
                                                            📍 Buka Google Maps
                                                        </a>
                                                    </div>
                                                )}
                                                {/* Embedded Map */}
                                                <div className="w-full h-48 rounded-2xl overflow-hidden mt-6 shadow border border-slate-200/50 dark:border-white/10">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        scrolling="no"
                                                        marginHeight="0"
                                                        marginWidth="0"
                                                        src={event.lat && event.lng ? `https://maps.google.com/maps?q=${event.lat},${event.lng}&output=embed` : `https://maps.google.com/maps?q=${encodeURIComponent((event.location || '') + ' ' + (event.address || ''))}&output=embed`}
                                                    ></iframe>
                                                </div>
                                            </TiltCard>
                                        ) : (
                                            <div className={`h-full space-y-6 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden ${isLuxuryTheme
                                                ? 'bg-[#121212]/80 border border-[#a3a3a3]/30 text-white'
                                                : (isBurgundyTheme
                                                    ? 'bg-[#491217]/40 border border-[#cba93c]/20 text-white'
                                                    : 'bg-slate-50 dark:bg-slate-900')
                                                }`}>
                                                <span
                                                    className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                                                    style={isLuxuryTheme ? { color: '#e5e5e5', backgroundColor: '#e5e5e515', border: '1px solid rgba(255, 255, 255, 0.3)' } : { color: themeColor, backgroundColor: `${themeColor}15` }}
                                                >
                                                    {event.name}
                                                </span>
                                                <div className="space-y-4 pt-4">
                                                    <p className="text-lg font-bold">
                                                        {event.date ? new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Segera Diumumkan'}
                                                        {event.time ? ` • ${event.time}` : ''}
                                                    </p>
                                                    <p className="font-semibold opacity-80">{event.location}</p>
                                                    <p className="text-sm opacity-60 leading-relaxed">{event.address}</p>
                                                    {event.date && (
                                                        <div className="pt-2">
                                                            <a
                                                                href={getGoogleCalendarUrl(
                                                                    `${event.name} - ${isPernikahan ? `${content?.groom_nickname} & ${content?.bride_nickname}` : (content?.child_name || invitation.title)}`,
                                                                    event.date,
                                                                    event.location,
                                                                    event.address
                                                                )}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs hover:scale-105 transition-all ${isLuxuryTheme
                                                                    ? 'bg-neutral-200 text-black hover:bg-white'
                                                                    : ''
                                                                    }`}
                                                                style={!isLuxuryTheme ? { color: themeColor, backgroundColor: `${themeColor}15` } : {}}
                                                            >
                                                                📅 Ingatkan di Google Calendar
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                                {event.map_url && (
                                                    <div className="pt-2 pb-4">
                                                        <a
                                                            href={event.map_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:scale-105 transition-all shadow-sm"
                                                        >
                                                            📍 Buka Google Maps
                                                        </a>
                                                    </div>
                                                )}
                                                {/* Embedded Map Fallback */}
                                                <div className="w-full h-48 rounded-2xl overflow-hidden mt-2 shadow border border-slate-200/50 dark:border-white/10">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        scrolling="no"
                                                        marginHeight="0"
                                                        marginWidth="0"
                                                        src={event.lat && event.lng ? `https://maps.google.com/maps?q=${event.lat},${event.lng}&output=embed` : `https://maps.google.com/maps?q=${encodeURIComponent((event.location || '') + ' ' + (event.address || ''))}&output=embed`}
                                                    ></iframe>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
                {/* Love Story / Agenda Section */}
                {content?.enable_love_story !== false && content?.love_stories && content.love_stories.length > 0 && (
                    <section className={`py-12 md:py-24 scroll-animate opacity-0 ${isCinemaTheme ? 'bg-black/20 border-y border-white/5' : ''}`}>
                        <div className={isCinemaTheme ? "max-w-6xl mx-auto px-6" : "max-w-7xl mx-auto px-6"}>
                            <div className="text-center mb-10 relative">
                                <h3 className="font-script text-4xl md:text-5xl text-white opacity-80 absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap z-0">Our Beloved</h3>
                                <h2 className="text-5xl md:text-6xl font-serif text-white tracking-widest uppercase relative z-10 mt-2">Story</h2>
                            </div>
                            {isCinemaTheme ? (
                                <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                                    {content.love_stories.map((story, idx) => (
                                        <div key={idx} className="min-w-[260px] md:min-w-[320px] snap-center bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl space-y-4 relative overflow-hidden backdrop-blur flex flex-col justify-between">
                                            <div className="absolute top-0 right-0 p-4 font-serif text-white/5 text-6xl select-none font-bold">
                                                {String(idx + 1).padStart(2, '0')}
                                            </div>
                                            <div className="space-y-2 relative z-10">
                                                <span className="inline-block px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-mono tracking-wider uppercase">{story.date}</span>
                                                <h4 className="text-lg font-serif text-white tracking-wide mt-2">Momen Istimewa</h4>
                                                <p className="text-xs text-neutral-300 leading-relaxed font-light">{story.story}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : isLuxuryTheme ? (
                                <div className="w-full max-w-md mx-auto relative rounded-md overflow-hidden bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-neutral-800/50">
                                    {/* Dynamic Media at top */}
                                    <div className="w-full h-[300px] md:h-[400px] relative overflow-hidden pointer-events-none bg-black">
                                        <div className="absolute top-1/2 left-1/2 w-[250%] md:w-[150%] h-[250%] md:h-[150%] -translate-x-1/2 -translate-y-1/2">
                                            {content?.love_story_media_type === 'video' && content?.love_story_video_url ? (
                                                <iframe
                                                    src={`${getEmbedUrl(content.love_story_video_url)}?autoplay=1&mute=1&loop=1&playlist=${getEmbedUrl(content.love_story_video_url).split('/').pop()}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                                                    className="w-full h-full"
                                                    frameBorder="0"
                                                    allow="autoplay; encrypted-media"
                                                ></iframe>
                                            ) : (content?.love_story_media_type === 'image' || !content?.love_story_media_type) && content?.love_story_image ? (
                                                <img
                                                    src={`/storage/${content.love_story_image}`}
                                                    className="w-full h-full object-cover"
                                                    alt="Love Story"
                                                />
                                            ) : (
                                                <img
                                                    src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"
                                                    className="w-full h-full object-cover filter grayscale"
                                                    alt="Love Story Placeholder"
                                                />
                                            )}
                                        </div>
                                        {/* Gradient overlay to seamlessly blend video into the text section */}
                                        <div className="absolute -inset-2 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                                    </div>

                                    {/* Sliding Text Section positioned at the bottom */}
                                    <div
                                        className="relative pb-12 -mt-16 overflow-hidden z-10"
                                        onTouchStart={handleStoryTouchStart}
                                        onTouchEnd={handleStoryTouchEnd}
                                    >
                                        <div
                                            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                                            style={{
                                                width: `${content.love_stories.length * 100}%`,
                                                transform: `translateX(-${activeStory * (100 / content.love_stories.length)}%)`
                                            }}
                                        >
                                            {content.love_stories.map((story, idx) => {
                                                const scriptTitles = ['The First Meet', 'The Proposal', 'The Engagement', 'Our Wedding'];
                                                const title = scriptTitles[idx % scriptTitles.length];
                                                return (
                                                    <div key={idx} className="shrink-0 px-8 text-left" style={{ width: `${100 / content.love_stories.length}%` }}>
                                                        <h4 className="font-script text-3xl md:text-4xl text-white mb-2 opacity-90">{title}</h4>
                                                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-3 font-bold">{story.date}</p>
                                                        <p className="text-sm md:text-base text-neutral-300 leading-relaxed font-sans">{story.story}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Instagram-style Progress Bars */}
                                        <div className="absolute bottom-4 left-8 right-8 flex gap-2">
                                            {content.love_stories.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`h-1 flex-1 rounded-full cursor-pointer transition-colors duration-500 ${idx === activeStory ? 'bg-white' : idx < activeStory ? 'bg-white/60' : 'bg-white/20'}`}
                                                    onClick={() => {
                                                        setActiveStory(idx);
                                                        setStoryInteracted(true);
                                                    }}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`pl-8 ml-4 space-y-12 border-l border-slate-200 dark:border-slate-800`}>
                                    {content.love_stories.map((story, idx) => (
                                        <div key={idx} className="relative">
                                            <div
                                                className={`absolute w-4 h-4 rounded-full -left-[40px] top-1.5 border-4 border-[#FAF6F0] dark:border-slate-900`}
                                                style={{ backgroundColor: themeColor }}
                                            ></div>
                                            <span className={`font-extrabold text-sm block mb-1 text-slate`}>{story.date}</span>
                                            <p className="opacity-80 leading-relaxed">{story.story}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}
                {/* Harapan & Doa Section */}
                {isLuxuryTheme ? (
                    <section className="relative py-24 md:py-32 w-full min-h-[70vh] flex items-center justify-center overflow-hidden">
                        {/* Slideshow Background */}
                        {finalHarapanSlideshow.map((img, idx) => (
                            <div
                                key={idx}
                                className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
                                style={{ opacity: idx === activeHarapanImage ? 0.3 : 0 }}
                            >
                                <img
                                    src={img.startsWith('http') ? img : `/storage/${img}`}
                                    alt="Slideshow Background"
                                    className="w-full h-full object-cover grayscale mix-blend-luminosity scale-105"
                                />
                            </div>
                        ))}
                        {/* Dark gradient overlay to blend top and bottom into black */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black"></div>
                        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                            <div className="mb-12 relative">
                                <h3 className="font-script text-4xl md:text-5xl text-neutral-500 opacity-60 absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap z-0">Our Wishes</h3>
                                <h2 className="text-3xl md:text-4xl font-serif text-white tracking-[0.2em] uppercase relative z-10 mt-2">Harapan & Doa</h2>
                            </div>

                            <div className={`grid gap-6 md:gap-8 ${isPernikahan ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
                                <div className="space-y-6 p-8 md:p-10 rounded-none bg-[#080808]/70 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    <h4 className="font-serif text-xl text-neutral-300 tracking-widest uppercase">Mempelai Pria</h4>
                                    <div className="w-12 h-[1px] bg-neutral-700 mx-auto"></div>
                                    <p className="opacity-90 italic font-sans text-neutral-400 leading-relaxed">"{content?.wish_groom}"</p>
                                </div>
                                {isPernikahan && (
                                    <div className="space-y-6 p-8 md:p-10 rounded-none bg-[#080808]/70 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        <h4 className="font-serif text-xl text-neutral-300 tracking-widest uppercase">Mempelai Wanita</h4>
                                        <div className="w-12 h-[1px] bg-neutral-700 mx-auto"></div>
                                        <p className="opacity-90 italic font-sans text-neutral-400 leading-relaxed">"{content?.wish_bride}"</p>
                                    </div>
                                )}
                                {isPernikahan && (
                                    <div className="space-y-6 p-8 md:p-10 rounded-none bg-[#080808]/70 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        <h4 className="font-serif text-xl text-neutral-300 tracking-widest uppercase">Keluarga</h4>
                                        <div className="w-12 h-[1px] bg-neutral-700 mx-auto"></div>
                                        <p className="opacity-90 italic font-sans text-neutral-400 leading-relaxed">"{content?.wish_family}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className={`py-12 md:py-24 ${isDark ? 'bg-slate-800/60' : 'bg-white/40'} scroll-animate opacity-0`}>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Harapan & Doa</h2>
                        </div>
                        <div className={`max-w-6xl mx-auto px-6 grid gap-12 text-center ${isPernikahan ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
                            <div className={`space-y-4 p-8 rounded-3xl border backdrop-blur ${isDark ? 'bg-white/20 dark:bg-white/5' : ''} hover:-translate-y-2 transition-transform duration-500 shadow-xl`}>
                                <h4 className="font-extrabold text-lg uppercase tracking-wider" style={{ color: themeColor }}>Mempelai Pria</h4>
                                <p className="opacity-80 italic font-medium">"{content?.wish_groom}"</p>
                            </div>
                            {isPernikahan && (
                                <>
                                    <div className={`space-y-4 p-8 rounded-3xl border backdrop-blur ${isDark ? 'bg-white/20 dark:bg-white/5' : ''} hover:-translate-y-2 transition-transform duration-500 shadow-xl`}>
                                        <h4 className="font-extrabold text-lg uppercase tracking-wider" style={{ color: themeColor }}>Mempelai Wanita</h4>
                                        <p className="opacity-80 italic font-medium">"{content?.wish_bride}"</p>
                                    </div>
                                    <div className={`space-y-4 p-8 rounded-3xl border backdrop-blur ${isDark ? 'bg-white/20 dark:bg-white/5' : ''} hover:-translate-y-2 transition-transform duration-500 shadow-xl`}>
                                        <h4 className="font-extrabold text-lg uppercase tracking-wider" style={{ color: themeColor }}>Keluarga</h4>
                                        <p className="opacity-80 italic font-medium">"{content?.wish_family}"</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                )}
                {/* Gallery Section */}
                {gallery && gallery.length > 0 && (
                    <section className="py-12 md:py-24 scroll-animate opacity-0">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center mb-12">
                                <h2 className={
                                    isLuxuryTheme
                                        ? `text-4xl font-light tracking-[0.2em] uppercase font-sans text-neutral-400 font-bold`
                                        : ((isCinemaTheme || isBurgundyTheme) ? `text-4xl font-light tracking-[0.2em] uppercase font-serif ${isBurgundyTheme ? 'text-[#f0d78a]' : ''}` : "text-4xl font-black")
                                }>Momen Berharga</h2>
                                <p className={`opacity-60 mt-2 ${(isCinemaTheme || isBurgundyTheme || isLuxuryTheme) ? 'font-light tracking-widest text-xs uppercase' : ''}`}>Jejak kenangan yang terukir abadi</p>
                            </div>
                            {(isCinemaTheme || isLuxuryTheme) ? (
                                <div className="w-full relative">
                                    <div
                                        id="gallery-scroll"
                                        ref={galleryScrollRef}
                                        onScroll={handleGalleryScroll}
                                        onMouseEnter={handleGalleryInteractionStart}
                                        onMouseLeave={handleGalleryInteractionEnd}
                                        onTouchStart={handleGalleryInteractionStart}
                                        onTouchEnd={handleGalleryInteractionEnd}
                                        className="flex overflow-x-auto gap-4 md:gap-8 py-16 px-[22.5vw] md:px-[35vw] snap-x snap-mandatory"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        <style dangerouslySetInnerHTML={{
                                            __html: `
                                        .flex::-webkit-scrollbar { display: none; }
                                    `}} />
                                        {extendedGallery.map((img, idx) => (
                                            <PolaroidCard
                                                key={idx}
                                                img={img}
                                                totalIdx={idx}
                                                realIdx={idx % gallery.length}
                                                innerRef={(el) => galleryItemRefs.current[idx] = el}
                                                onClick={() => openLightbox(img)}
                                            />
                                        ))}
                                    </div>

                                    {/* Fade edges to indicate scrollability with depth of field */}
                                    <div className="absolute top-0 left-0 w-12 md:w-32 h-full bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none"></div>
                                    <div className="absolute top-0 right-0 w-12 md:w-32 h-full bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {gallery.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-[1.5rem] overflow-hidden shadow-lg group cursor-pointer" onClick={() => openLightbox(img)}>
                                            <img src={img.startsWith('http') ? img : `/storage/${img}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={`Gallery ${idx}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}
                {/* RSVP Text natively in document flow */}
                {isLuxuryTheme && (
                    <div className="w-full flex justify-center relative z-20 pointer-events-none px-6">
                        <div className="flex flex-col items-center">
                            <h2
                                className="text-7xl md:text-9xl font-bold tracking-[0.15em] leading-[0.9] text-center"
                                style={{ fontFamily: "'Cinzel', serif" }}
                            >
                                <span className="text-white drop-shadow-md">RS</span><br />
                                <span className="text-black drop-shadow-sm">VP</span>
                            </h2>
                            <span
                                className="text-3xl md:text-4xl mt-1 md:mt-2 text-black drop-shadow-sm"
                                style={{ fontFamily: "'Great Vibes', cursive" }}
                            >
                                See u there
                            </span>
                        </div>
                    </div>
                )}
                {/* RSVP Form Section */}
                <section
                    id="rsvp"
                    className={`pt-40 pb-12 md:pt-48 md:pb-24 ${isLuxuryTheme
                        ? 'bg-white border-b border-neutral-200 text-black'
                        : (isBurgundyTheme ? 'bg-[#1f0101]/30 border-y border-[#cba93c]/15' : (isDark ? 'bg-slate-850' : 'bg-slate-50/50'))
                        } scroll-animate opacity-0 relative z-10 overflow-hidden`}
                    style={isLuxuryTheme ? { clipPath: 'polygon(0 6vw, 100% 0, 100% 100%, 0 100%)', marginTop: 'calc(-6vw - 7rem)' } : {}}
                >
                    {/* Background Slideshow */}
                    {rsvpBgGallery && rsvpBgGallery.length > 0 && (
                        <div className={`absolute inset-0 z-0 pointer-events-none ${isLuxuryTheme || (!isDark && !isBurgundyTheme && !isCinemaTheme) ? 'bg-white' : 'bg-neutral-950'}`}>
                            {rsvpBgGallery.map((img, idx) => (
                                <img 
                                    key={idx} 
                                    src={img.startsWith('http') ? img : `/storage/${img}`} 
                                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out ${rsvpBgIndex === idx ? 'opacity-20 scale-105' : 'opacity-0 scale-100'}`} 
                                    alt="Background" 
                                />
                            ))}
                            <div className={`absolute inset-0 bg-gradient-to-b ${isLuxuryTheme || (!isDark && !isBurgundyTheme && !isCinemaTheme) ? 'from-white via-transparent to-white' : 'from-black/80 via-transparent to-black/80'}`}></div>
                        </div>
                    )}
                    <div className="max-w-xl mx-auto px-6 relative z-10">
                        {is3DTheme ? (
                            <TiltCard themeColor={themeColor} className="p-8 md:p-12 rounded-[2.5rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-extralight tracking-wider">Konfirmasi Kehadiran</h2>
                                    <p className="opacity-60 text-sm mt-1">Beri tahu kami jika Anda berencana untuk hadir</p>
                                </div>
                                {submitted ? (
                                    <div className="text-center py-12 space-y-4">
                                        <div className="text-5xl">🎉</div>
                                        <h3 className="text-2xl font-bold" style={{ color: themeColor }}>Terima Kasih Banyak!</h3>
                                        <p className="opacity-75">Konfirmasi kehadiran dan doa restu Anda telah kami simpan.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={submitRsvp} className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold mb-2 opacity-70 uppercase">Nama Tamu</label>
                                            <input
                                                type="text"
                                                required
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                className={`w-full border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-navy'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-2 opacity-70 uppercase">Konfirmasi Kehadiran</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { id: 'hadir', label: 'Hadir' },
                                                    { id: 'ragu_ragu', label: 'Ragu-Ragu' },
                                                    { id: 'tidak_hadir', label: 'Tidak Hadir' }
                                                ].map((option) => (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => setData('attendance', option.id)}
                                                        className={`py-2 px-1 rounded-xl text-[10px] xs:text-xs font-bold border transition-all ${data.attendance === option.id
                                                            ? 'bg-primary border-primary text-white'
                                                            : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate hover:bg-slate-100'
                                                            }`}
                                                        style={data.attendance === option.id ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-2 opacity-70 uppercase">Ucapan & Doa Restu</label>
                                            <textarea
                                                value={data.message}
                                                onChange={e => setData('message', e.target.value)}
                                                placeholder="Tuliskan ucapan selamat..."
                                                rows="3"
                                                className={`w-full border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-navy'}`}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full text-white py-5 rounded-full font-bold text-lg shadow-xl transition-all"
                                            style={{ backgroundColor: themeColor, boxShadow: `0 10px 25px -5px ${themeColor}40` }}
                                        >
                                            Kirim RSVP & Ucapan
                                        </button>
                                    </form>
                                )}
                            </TiltCard>
                        ) : (
                            <div className={`p-8 md:p-12 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.05)] border ${isLuxuryTheme
                                ? 'bg-white border-neutral-200 text-black'
                                : (isBurgundyTheme ? 'bg-[#491217]/50 border-[#cba93c]/35 text-white' : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'))
                                }`}>
                                <div className="text-center mb-8">
                                    <h2 className={
                                        isLuxuryTheme
                                            ? `text-3xl font-light tracking-[0.2em] uppercase font-sans text-black font-bold`
                                            : ((isCinemaTheme || isBurgundyTheme) ? `text-3xl font-light tracking-[0.2em] uppercase font-serif ${isBurgundyTheme ? 'text-[#f0d78a]' : ''}` : "text-3xl font-extrabold")
                                    }>Konfirmasi Kehadiran</h2>
                                    <p className={`opacity-60 text-sm mt-1 ${(isCinemaTheme || isBurgundyTheme || isLuxuryTheme) ? 'font-light tracking-wide' : ''}`}>Beri tahu kami jika Anda berencana untuk hadir</p>
                                </div>
                                {submitted ? (
                                    <div className="text-center py-12 space-y-4">
                                        <div className="text-5xl">🎉</div>
                                        <h3 className="text-2xl font-bold text-neutral-400" style={!isLuxuryTheme ? { color: themeColor } : {}}>Terima Kasih Banyak!</h3>
                                        <p className="opacity-75">Konfirmasi kehadiran dan doa restu Anda telah kami simpan.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={submitRsvp} className="space-y-6">
                                        <div>
                                            <label className={`block text-xs mb-2 opacity-70 uppercase ${isLuxuryTheme
                                                ? 'font-light tracking-widest text-neutral-600'
                                                : (isBurgundyTheme ? 'font-light tracking-widest text-[#f0d78a]' : 'font-bold')
                                                }`}>Nama Tamu</label>
                                            <input
                                                type="text"
                                                required
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                className={`w-full rounded-2xl p-4 focus:ring-2 ${isLuxuryTheme
                                                    ? 'bg-neutral-50 border border-neutral-200 text-black focus:ring-black focus:border-black'
                                                    : (isBurgundyTheme
                                                        ? 'bg-[#1f0101] border border-[#cba93c]/25 text-white focus:ring-[#cba93c]'
                                                        : `border-none focus:ring-primary ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-navy'}`)
                                                    }`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs mb-2 opacity-70 uppercase ${isLuxuryTheme
                                                ? 'font-light tracking-widest text-neutral-600'
                                                : (isBurgundyTheme ? 'font-light tracking-widest text-[#f0d78a]' : 'font-bold')
                                                }`}>Konfirmasi Kehadiran</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { id: 'hadir', label: 'Hadir' },
                                                    { id: 'ragu_ragu', label: 'Ragu-Ragu' },
                                                    { id: 'tidak_hadir', label: 'Tidak Hadir' }
                                                ].map((option) => (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => setData('attendance', option.id)}
                                                        className={`py-2 px-1 rounded-xl text-[10px] xs:text-xs font-bold border transition-all ${data.attendance === option.id
                                                            ? (isLuxuryTheme
                                                                ? 'bg-black text-white border-black'
                                                                : (isBurgundyTheme ? 'bg-[#cba93c] border-[#cba93c] text-[#2e0202]' : 'bg-primary border-primary text-white'))
                                                            : (isLuxuryTheme
                                                                ? 'bg-transparent border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                                                : (isBurgundyTheme ? 'bg-transparent border-[#cba93c]/30 text-white hover:bg-white/5' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate hover:bg-slate-100'))
                                                            }`}
                                                        style={(!isBurgundyTheme && !isLuxuryTheme && data.attendance === option.id) ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-xs mb-2 opacity-70 uppercase ${isLuxuryTheme
                                                ? 'font-light tracking-widest text-neutral-600'
                                                : (isBurgundyTheme ? 'font-light tracking-widest text-[#f0d78a]' : 'font-bold')
                                                }`}>Ucapan & Doa Restu</label>
                                            <textarea
                                                value={data.message}
                                                onChange={e => setData('message', e.target.value)}
                                                placeholder="Tuliskan ucapan selamat..."
                                                rows="3"
                                                className={`w-full rounded-2xl p-4 focus:ring-2 ${isLuxuryTheme
                                                    ? 'bg-neutral-50 border border-neutral-200 text-black focus:ring-black focus:border-black'
                                                    : (isBurgundyTheme
                                                        ? 'bg-[#1f0101] border border-[#cba93c]/25 text-white focus:ring-[#cba93c]'
                                                        : `border-none focus:ring-primary ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-navy'}`)
                                                    }`}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`w-full py-5 rounded-full font-bold text-lg shadow-xl transition-all ${isLuxuryTheme
                                                ? 'bg-black text-white hover:bg-neutral-800 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]'
                                                : (isBurgundyTheme ? 'bg-gradient-to-r from-[#cba93c] to-[#e5c158] text-[#2e0202] hover:brightness-110' : 'text-white')
                                                }`}
                                            style={(!isBurgundyTheme && !isLuxuryTheme) ? { backgroundColor: themeColor, boxShadow: `0 10px 25px -5px ${themeColor}40` } : {}}
                                        >
                                            Kirim RSVP & Ucapan
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                        {/* Wishes Board feed */}
                        {rsvps && rsvps.length > 0 && (
                            <div className="mt-12 space-y-4">
                                <h4 className={
                                    isLuxuryTheme
                                        ? `font-light tracking-[0.2em] uppercase font-serif text-lg text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-black to-neutral-700 font-bold`
                                        : ((isCinemaTheme || isBurgundyTheme) ? `font-light tracking-[0.2em] uppercase font-serif text-lg text-center mb-6 ${isBurgundyTheme ? 'text-[#f0d78a]' : ''}` : "font-extrabold text-lg text-center mb-6")
                                }>Ucapan & Doa dari Tamu</h4>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {rsvps.map((rsvp) => (
                                        <div key={rsvp.id} className={`p-5 rounded-2xl border shadow-sm ${isLuxuryTheme
                                            ? 'bg-white border-neutral-200 text-black'
                                            : (isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100')
                                            }`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-extrabold text-sm">{rsvp.name}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${isLuxuryTheme || !isDark
                                                    ? (rsvp.attendance === 'hadir' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                        rsvp.attendance === 'tidak_hadir' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                            'bg-amber-100 text-amber-700 border border-amber-200')
                                                    : (rsvp.attendance === 'hadir' ? 'bg-green-900/40 text-green-400 border border-green-800/50' :
                                                        rsvp.attendance === 'tidak_hadir' ? 'bg-red-900/40 text-red-400 border border-red-800/50' :
                                                            'bg-amber-900/40 text-amber-400 border border-amber-800/50')
                                                    }`}>
                                                    {rsvp.attendance.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs opacity-80 leading-relaxed">"{rsvp.message || 'Hadir memeriahkan acara!'}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
                {/* Kirim Hadiah & Kado Section */}
                {((content?.gifts && content.gifts.length > 0) || content?.gift_address) && (
                    <section className="py-12 md:py-24 scroll-animate opacity-0">
                        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
                            <div>
                                <h2 className={
                                    isLuxuryTheme
                                        ? `text-3xl font-light tracking-[0.2em] uppercase font-sans text-neutral-400 font-bold`
                                        : ((isCinemaTheme || isBurgundyTheme) ? `text-3xl font-light tracking-[0.2em] uppercase font-serif ${isBurgundyTheme ? 'text-[#f0d78a]' : ''}` : "text-3xl font-extrabold")
                                }>Kirim Kado & Hadiah</h2>
                                <p className={`opacity-60 mt-2 ${(isCinemaTheme || isBurgundyTheme || isLuxuryTheme) ? 'font-light tracking-widest text-xs uppercase' : ''}`}>Dukungan kado digital atau fisik untuk membagikan kebahagiaan</p>
                            </div>
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 justify-center">
                                {content?.gifts?.map((gift, idx) => (
                                    <div key={gift.id || idx} className={`p-6 rounded-2xl shadow-2xl border flex flex-col justify-between text-left relative overflow-hidden group aspect-[1.58/1] w-full max-w-sm mx-auto transition-transform hover:-translate-y-2 duration-500 ${isLuxuryTheme
                                        ? 'bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border-neutral-700 text-white'
                                        : (isBurgundyTheme ? 'bg-gradient-to-br from-[#491217] via-[#2e0202] to-black border-[#cba93c]/35 text-[#f0d78a]' : 'bg-gradient-to-br from-slate-800 via-slate-900 to-black border-slate-700 text-white')
                                        }`}>
                                        {/* Glass reflection effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                                        <div className={`absolute ${gift.type === 'ewallet' ? '-bottom-24 -left-24' : '-top-24 -right-24'} w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none`}></div>

                                        <div className="flex justify-between items-start relative z-10">
                                            <div>
                                                <p className="text-[8px] uppercase tracking-[0.3em] opacity-60 mb-1">
                                                    {gift.type === 'ewallet' ? 'E-Wallet' : 'Bank Transfer'}
                                                </p>
                                                <h4 className="font-bold tracking-widest uppercase text-sm opacity-90">{gift.bank_name}</h4>
                                            </div>
                                            {/* Icon */}
                                            {gift.type === 'ewallet' ? (
                                                <svg className="w-6 h-6 opacity-60 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v20M17 5S14 12 17 19M7 5S10 12 7 19M22 8s-2 4-2 8M2 8s2 4 2 8" /></svg>
                                            ) : (
                                                <div className="w-10 h-8 rounded bg-gradient-to-br from-yellow-200 to-yellow-500 opacity-80 flex items-center justify-center border border-yellow-600/50">
                                                    <div className="w-6 h-4 border border-yellow-800/30 rounded-sm"></div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative z-10 mt-auto mb-4 md:mb-6">
                                            <p className="font-mono text-xl md:text-2xl tracking-[0.15em] drop-shadow-md opacity-90">{(gift.account_number || '').replace(/(.{4})/g, '$1 ')}</p>
                                        </div>

                                        <div className="flex justify-between items-end relative z-10">
                                            <div className="max-w-[60%]">
                                                <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Account Holder</p>
                                                <p className="font-bold tracking-wider text-xs md:text-sm uppercase truncate">{gift.account_holder}</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(gift.account_number)}
                                                className="px-4 py-2 rounded-full font-bold text-[9px] uppercase tracking-widest bg-white/10 hover:bg-white/20 backdrop-blur transition-all border border-white/20 shadow-lg shrink-0 ml-2"
                                            >
                                                Salin
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {content?.gift_address && (
                                    <div className={`p-8 rounded-[2rem] shadow-xl border flex flex-col justify-between items-center text-center space-y-4 w-full max-w-sm mx-auto ${isLuxuryTheme
                                        ? 'bg-[#121212]/80 border-white/30 text-white'
                                        : (isBurgundyTheme ? 'bg-[#491217]/50 border-[#cba93c]/35 text-white' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700')
                                        }`}>
                                        <span className="text-3xl">🎁</span>
                                        <h4 className="font-bold text-lg">Kado Fisik</h4>
                                        <p className="text-xs opacity-75 leading-relaxed text-center px-4">{content.gift_address}</p>
                                        <button
                                            onClick={() => copyToClipboard(content.gift_address)}
                                            className={`px-6 py-2 rounded-full font-bold text-xs transition-all ${isLuxuryTheme
                                                ? 'bg-neutral-200 text-black hover:bg-white'
                                                : (isBurgundyTheme ? 'bg-[#cba93c] text-[#2e0202] hover:brightness-110' : 'bg-primary/10 text-primary hover:bg-primary/20')
                                                }`}
                                            style={(!isBurgundyTheme && !isLuxuryTheme) ? { color: themeColor, backgroundColor: `${themeColor}15` } : {}}
                                        >
                                            Salin Alamat
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}
                {/* Closing Statement */}
                <section className={`py-16 md:py-32 scroll-animate opacity-0 ${isLuxuryTheme ? 'bg-neutral-50' : ''}`}>
                    <div className="max-w-2xl mx-auto px-6 text-center space-y-10">
                        <p className={`text-sm md:text-base leading-relaxed whitespace-pre-line ${isLuxuryTheme ? 'text-neutral-500 font-light' : (isBurgundyTheme ? 'text-[#f0d78a]/80' : 'opacity-80')}`}>
                            {content?.teks_penutup || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu. Atas kehadiran dan doa restunya, kami ucapkan terima kasih yang sebesar-besarnya.'}
                        </p>
                        <div className="space-y-4 pt-6">
                            <p className={`text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold ${isLuxuryTheme ? 'text-black' : (isBurgundyTheme ? 'text-[#cba93c]' : '')}`}>Hormat Kami,</p>
                            <h3 className={isLuxuryTheme ? "text-4xl md:text-5xl font-serif text-black" : (isBurgundyTheme ? "text-5xl md:text-6xl font-serif text-[#f0d78a] font-light" : "text-5xl md:text-6xl font-script")} style={(!isBurgundyTheme && !isLuxuryTheme) ? { color: themeColor } : {}}>
                                {content?.bride_nickname || 'Wanita'} <span className="font-sans text-xl md:text-2xl mx-2 font-light opacity-50">&</span> {content?.groom_nickname || 'Pria'}
                            </h3>
                        </div>
                    </div>
                </section>
                {/* Footer */}
                <footer className="py-12 md:py-24 text-center opacity-50 space-y-2">
                    <p className="text-[10px] md:text-xs font-light tracking-widest uppercase flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                        <span>Designed & Developed by</span>
                        <a href="https://instagram.com/f_haikal02" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-bold hover:opacity-70 transition-opacity">
                            Fiqri Haikal
                            <svg className="w-3.5 h-3.5 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                            f_haikal02
                        </a>
                    </p>
                    <p className="text-[9px] md:text-[10px] tracking-widest uppercase opacity-80">
                        Copyright &copy; 2026 BeyondHorizon
                    </p>
                </footer>
                {/* Toast Notification */}
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 pointer-events-none ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md border border-green-500/50">
                        <span className="text-xl">✓</span>
                        <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
                    </div>
                </div>

                {/* Fullscreen Lightbox */}
                {lightbox.isOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-opacity duration-300">
                        <button onClick={closeLightbox} className="absolute top-6 right-6 md:top-10 md:right-10 text-white hover:text-red-400 z-[160] bg-white/10 p-3 rounded-full backdrop-blur-md transition-all shadow-xl hover:scale-110">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        
                        <div className="w-full h-full flex items-center justify-center overflow-auto p-4 md:p-12 touch-pan-x touch-pan-y" onClick={closeLightbox}>
                            <img 
                                src={lightbox.img} 
                                alt="Fullscreen Preview" 
                                className="max-w-full max-h-full object-contain transition-transform duration-300 shadow-2xl rounded-sm"
                                style={{ transform: `scale(${lightbox.scale})`, cursor: lightbox.scale > 1 ? 'grab' : 'zoom-in' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (lightbox.scale === 1) handleLightboxZoom(e, 0.5);
                                }} 
                            />
                        </div>
                        
                        {/* Zoom Controls */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 z-[160] shadow-2xl">
                            <button onClick={(e) => handleLightboxZoom(e, -0.5)} className="text-white p-2 hover:bg-white/20 rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100" disabled={lightbox.scale <= 0.5}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path></svg>
                            </button>
                            <span className="text-white font-mono text-sm w-12 text-center font-bold tracking-widest">{Math.round(lightbox.scale * 100)}%</span>
                            <button onClick={(e) => handleLightboxZoom(e, 0.5)} className="text-white p-2 hover:bg-white/20 rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100" disabled={lightbox.scale >= 4}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}