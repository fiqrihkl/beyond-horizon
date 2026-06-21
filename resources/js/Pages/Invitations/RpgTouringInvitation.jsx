import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo } from 'react';

// Web Audio API Retro Synth Sound Generator
class SoundEffects {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Classic 8-bit coin pickup sound (two tones: low then high)
    playCoinSound() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(880.00, now + 0.08); // A5

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Classic retro alert beep
    playBeep() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Classic 8-bit horn honk
    playHonk() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'square';

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(445, now);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.2);
        osc2.stop(now + 0.2);
    }

    // Retro level completion / success tune
    playSuccessFanfare() {
        this.init();
        if (!this.ctx) return;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Arpeggio C
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.08, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.2);
        });
    }
}

// Low frequency continuous engine sound generator
class EngineSound {
    constructor() {
        this.ctx = null;
        this.osc = null;
        this.gain = null;
        this.filter = null;
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.osc = this.ctx.createOscillator();
            this.gain = this.ctx.createGain();
            this.filter = this.ctx.createBiquadFilter();

            this.osc.type = 'sawtooth';
            this.filter.type = 'lowpass';
            this.filter.frequency.setValueAtTime(140, this.ctx.currentTime); // filter harsh highs

            this.osc.connect(this.filter);
            this.filter.connect(this.gain);
            this.gain.connect(this.ctx.destination);

            this.osc.frequency.setValueAtTime(40, this.ctx.currentTime);
            this.gain.gain.setValueAtTime(0.0, this.ctx.currentTime); // Start silent
            this.osc.start(0);
        } catch (e) {
            console.error("Audio Context Init error: ", e);
        }
    }

    setSpeed(speedRatio, isMuted) {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        if (isMuted) {
            this.gain.gain.setTargetAtTime(0.0, now, 0.05);
            return;
        }

        const targetFreq = 40 + speedRatio * 90; // Hum pitch 40Hz to 130Hz
        const targetVol = 0.012 + speedRatio * 0.025; // Rumble volume

        this.osc.frequency.setTargetAtTime(targetFreq, now, 0.05);
        this.gain.gain.setTargetAtTime(targetVol, now, 0.05);
    }

    stop() {
        if (this.gain) {
            this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
    }
}

const sfx = new SoundEffects();
const engine = new EngineSound();

export default function RpgTouringInvitation({ invitation, guest }) {
    const { content = {}, theme_config = {}, category = [], cover_image, gallery = [], music_url } = invitation;

    const [isCoverOpen, setIsCoverOpen] = useState(true);
    const [posX, setPosX] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    const [moveDirection, setMoveDirection] = useState('forward');
    const [currentCheckpoint, setCurrentCheckpoint] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
    const [openedCheckpoints, setOpenedCheckpoints] = useState(new Set());
    const autoStoppedCheckpointsRef = useRef(new Set());

    // Welcome message visible for first 8 seconds
    const [showWelcomeMsg, setShowWelcomeMsg] = useState(true);
    useEffect(() => {
        if (!isCoverOpen) {
            const timer = setTimeout(() => {
                setShowWelcomeMsg(false);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [isCoverOpen]);

    // Traffic Light State & Cycle Effect
    const [trafficLight, setTrafficLight] = useState('red');
    useEffect(() => {
        if (isCoverOpen) return;

        const cycle = () => {
            setTrafficLight(prev => {
                if (prev === 'red') return 'green';
                if (prev === 'green') return 'yellow';
                return 'red';
            });
        };

        const getDuration = () => {
            if (trafficLight === 'red') return 2500;    // Red for 2.5s
            if (trafficLight === 'green') return 4000;  // Green for 4s
            return 1200;                                // Yellow for 1.2s
        };

        const timer = setTimeout(cycle, getDuration());
        return () => clearTimeout(timer);
    }, [trafficLight, isCoverOpen]);

    // Intro & Standing/Wheelie States
    const [bikerScreenX, setBikerScreenX] = useState(150);
    const [isStanding, setIsStanding] = useState(false);
    const [isIntroActive, setIsIntroActive] = useState(false);

    // BGM & Physics variables
    const bgMusicRef = useRef(null);
    const velocity = useRef(0);
    const isPressingForward = useRef(false);
    const isPressingBackward = useRef(false);

    // List of road checkpoints (re-aligned to prevent overlap)
    const checkpoints = [
        { id: 1, title: 'Profil Riders', pos: 1200, description: 'Pengendara & Pasangan', icon: '👤' },
        { id: 2, title: 'Jadwal Touring', pos: 2000, description: 'Waktu & Tempat Kopdar', icon: '📍' },
        { id: 3, title: 'Dokumentasi', pos: 2300, description: 'Galeri Foto Touring', icon: '📷' },
        { id: 4, title: 'Bensin & Rest Area', pos: 3800, description: 'Kas & Kado Digital', icon: '⛽' },
        { id: 5, title: 'Finish & RSVP', pos: 4800, description: 'Konfirmasi Kehadiran', icon: '🏆' }
    ];

    // Seeding road coins to collect (re-aligned to prevent overlap with checkpoints)
    const [coins, setCoins] = useState([
        { id: 1, pos: 650, collected: false },
        { id: 2, pos: 850, collected: false },
        { id: 3, pos: 1400, collected: false },
        { id: 4, pos: 1750, collected: false },
        { id: 5, pos: 2250, collected: false },
        { id: 6, pos: 2650, collected: false },
        { id: 7, pos: 3250, collected: false },
        { id: 8, pos: 3950, collected: false },
        { id: 9, pos: 4450, collected: false },
        { id: 10, pos: 4650, collected: false },
    ]);

    // Biker Friends waving on the side of the road
    const npcs = [
        { id: 1, pos: 650, name: 'Bro Andi', text: 'Congrats Classic Couple! 🏍️', image: '/images/cewe.png' },

        { id: 4, pos: 3550, name: 'Bro Jono', text: 'Semoga Samawa, salam Biker! 🤝' },
        { id: 5, pos: 4500, name: 'Club Classic', text: 'Respect & Solid Selamanya! 🏆' }
    ];

    const maxPos = 5000;
    const screenCenter = 150; // offset placement of biker on screen (px)

    // Road Profile (Tanjakan, Turunan, Jembatan, Belokan)
    const getRoadProfile = (x) => {
        let height = 0;
        let angle = 0;
        let thickness = 65; // default road width/thickness in px
        let scale = 1;
        let type = 'flat';

        // Slope 1 (Smooth Sine Tanjakan & Turunan): 800 - 1300
        if (x >= 800 && x < 1300) {
            const p = (x - 800) / 500;
            height = 50 * Math.sin(p * Math.PI);
            angle = 12 * Math.cos(p * Math.PI);
            type = 'slope';
        }

        // Sharp Turn (Belokan Tajam melengkung tinggi ke langit): 1500 - 2300
        else if (x >= 1500 && x < 2300) {
            const p = (x - 1500) / 800;
            height = 240 * Math.sin(p * Math.PI); // goes high up to 240px!
            thickness = 65 - 35 * Math.sin(p * Math.PI); // narrows for perspective depth
            scale = 1 - 0.45 * Math.sin(p * Math.PI); // character shrinks in distance
            angle = 30 * Math.cos(p * Math.PI); // steep climb and descent angle
            type = 'turn';
        }

        // Bridge (Jembatan): 2500 - 3200
        else if (x >= 2500 && x < 3200) {
            if (x >= 2500 && x < 2600) {
                const p = (x - 2500) / 100;
                height = 30 * Math.sin((p * Math.PI) / 2);
                angle = 6 * Math.cos((p * Math.PI) / 2);
                type = 'bridge-entry';
            } else if (x >= 2600 && x < 3100) {
                height = 30;
                angle = 0;
                type = 'bridge-flat';
            } else if (x >= 3100 && x < 3200) {
                const p = (x - 3100) / 100;
                height = 30 * Math.cos((p * Math.PI) / 2);
                angle = -6 * Math.sin((p * Math.PI) / 2);
                type = 'bridge-exit';
            }
        }

        // Slope 2 (Tanjakan Tinggi Smooth): 3600 - 4200
        else if (x >= 3600 && x < 4200) {
            const p = (x - 3600) / 600;
            height = 80 * Math.sin(p * Math.PI);
            angle = 16 * Math.cos(p * Math.PI);
            type = 'slope';
        }

        return { height, angle, thickness, scale, type };
    };

    // Keep a ref of posX to prevent re-registering keyboard events continuously
    const posXRef = useRef(0);
    useEffect(() => {
        posXRef.current = posX;
    }, [posX]);

    // Pre-generate SVG path coordinate points for the road
    const roadPaths = useMemo(() => {
        const SVG_HEIGHT = 400;
        const ROAD_BASELINE = 340; // top of road at height=0 (gives 400 - 340 = 60px flat road height)
        const step = 15;
        const topBorderPoints = [];
        const bottomBorderPoints = [];
        const centerLinePoints = [];
        const topSidewalkSurfacePoints = [];
        const topSidewalkFacePoints = [];
        const bottomSidewalkSurfacePoints = [];
        const bottomSidewalkFacePoints = [];

        for (let x = -500; x <= maxPos + 500; x += step) {
            const profile = getRoadProfile(x);
            const yTop = ROAD_BASELINE - profile.height;
            const yBottom = yTop + profile.thickness;
            const yCenter = yTop + profile.thickness / 2;

            topBorderPoints.push(`${x},${yTop}`);
            bottomBorderPoints.push(`${x},${yBottom}`);
            centerLinePoints.push(`${x},${yCenter}`);

            // 3D Trotoar offset
            topSidewalkFacePoints.push(`${x},${yTop - 3}`);
            topSidewalkSurfacePoints.push(`${x},${yTop - 18}`);

            bottomSidewalkFacePoints.push(`${x},${yBottom + 3}`);
            bottomSidewalkSurfacePoints.push(`${x},${yBottom + 18}`);
        }

        const topPath = topBorderPoints.join(' L ');
        const bottomPath = [...bottomBorderPoints].reverse().join(' L ');
        const asphalt = `M ${topBorderPoints[0]} L ${topPath} L ${bottomBorderPoints[bottomBorderPoints.length - 1]} L ${bottomPath} Z`;

        // Break ground and grass at the river (2550 to 3150)
        const leftGroundPoints = topBorderPoints.filter(p => parseFloat(p.split(',')[0]) <= 2550);
        const rightGroundPoints = topBorderPoints.filter(p => parseFloat(p.split(',')[0]) >= 3150);

        const ground1 = `M -500,${ROAD_BASELINE} L ${leftGroundPoints.join(' L ')} L 2550,${SVG_HEIGHT} L -500,${SVG_HEIGHT} Z`;
        const ground2 = `M 3150,${SVG_HEIGHT} L ${rightGroundPoints.join(' L ')} L ${maxPos + 500},${ROAD_BASELINE} L ${maxPos + 500},${SVG_HEIGHT} Z`;

        const buildBrokenPath = (points) => {
            let path = '';
            let isFirst = true;
            for (let i = 0; i < points.length; i++) {
                const pt = points[i];
                const x = parseFloat(pt.split(',')[0]);
                if (x > 2550 && x < 3150) {
                    isFirst = true;
                } else {
                    path += `${isFirst ? 'M' : ' L'} ${pt}`;
                    isFirst = false;
                }
            }
            return path;
        };

        return {
            asphalt,
            ground1,
            ground2,
            topBorder: `M ${topBorderPoints.join(' L ')}`,
            bottomBorder: `M ${bottomBorderPoints.join(' L ')}`,
            centerLine: `M ${centerLinePoints.join(' L ')}`,
            topSidewalkFace: buildBrokenPath(topSidewalkFacePoints),
            topSidewalkSurface: buildBrokenPath(topSidewalkSurfacePoints),
            bottomSidewalkFace: buildBrokenPath(bottomSidewalkFacePoints),
            bottomSidewalkSurface: buildBrokenPath(bottomSidewalkSurfacePoints)
        };
    }, []);

    // Physics constants
    const accel = 4.5; // px/frame acceleration (smoother/slower)
    const maxSpeed = 10; // max speed
    const friction = 0.85; // friction multiplier

    // Game loop for smooth physics movement & collision checks
    useEffect(() => {
        if (isCoverOpen) return;

        let animationFrameId;
        engine.init();

        const gameLoop = () => {
            // Calculate velocity
            if (isPressingForward.current) {
                velocity.current = Math.min(velocity.current + accel * 0.1, maxSpeed);
                setMoveDirection('forward');
            } else if (isPressingBackward.current) {
                velocity.current = Math.max(velocity.current - accel * 0.1, -maxSpeed);
                setMoveDirection('backward');
            } else {
                velocity.current *= friction;
            }

            // Update Position
            if (Math.abs(velocity.current) > 0.05) {
                setPosX(prev => {
                    let next = prev + velocity.current;

                    // Stop at traffic light if it is red
                    if (trafficLight === 'red' && prev <= 3200 && next > 3200) {
                        next = 3200;
                        velocity.current = 0; // stop acceleration
                    }

                    next = Math.max(0, Math.min(next, maxPos));

                    // Auto-stop at checkpoints
                    for (const cp of checkpoints) {
                        if (!autoStoppedCheckpointsRef.current.has(cp.id) && Math.abs(next - cp.pos) < 10) {
                            next = cp.pos;
                            velocity.current = 0;
                            isPressingForward.current = false;
                            isPressingBackward.current = false;
                            autoStoppedCheckpointsRef.current.add(cp.id);

                            // Auto open dialog
                            setCurrentCheckpoint(cp);
                            setDialogOpen(true);
                            sfx.playBeep();
                            setOpenedCheckpoints(prev => new Set(prev).add(cp.id));
                            break;
                        }
                    }

                    // Check Coin collisions
                    setCoins(prevCoins => {
                        let hit = false;
                        const updated = prevCoins.map(c => {
                            if (!c.collected && Math.abs(c.pos - next) < 55) {
                                hit = hit || true;
                                return { ...c, collected: true };
                            }
                            return c;
                        });
                        if (hit) {
                            sfx.playCoinSound();
                        }
                        return updated;
                    });

                    return next;
                });
                setIsMoving(true);
            } else {
                velocity.current = 0;
                setIsMoving(false);
            }

            // Sync engine BGM sound to speed ratio
            const speedRatio = Math.abs(velocity.current) / maxSpeed;
            engine.setSpeed(speedRatio, isMuted);

            if (!isIntroActive) {
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        };

        animationFrameId = requestAnimationFrame(gameLoop);
        return () => {
            cancelAnimationFrame(animationFrameId);
            engine.stop();
        };
    }, [isCoverOpen, isMuted, isIntroActive, trafficLight]);

    // Action handler
    const handleAction = () => {
        sfx.playHonk();
        const nearest = getNearestCheckpoint();
        if (nearest && Math.abs(nearest.pos - posXRef.current) < 300) {
            setCurrentCheckpoint(nearest);
            setDialogOpen(true);
            sfx.playBeep();
        }
    };

    // Helper to get nearest checkpoint
    const getNearestCheckpoint = () => {
        const currentX = posXRef.current;
        let nearest = checkpoints[0];
        let minDiff = Math.abs(checkpoints[0].pos - currentX);
        for (let i = 1; i < checkpoints.length; i++) {
            const diff = Math.abs(checkpoints[i].pos - currentX);
            if (diff < minDiff) {
                minDiff = diff;
                nearest = checkpoints[i];
            }
        }
        return nearest;
    };

    // Keyboard handlers
    useEffect(() => {
        if (isCoverOpen || isIntroActive) return;
        const handleKeyDown = (e) => {
            if (dialogOpen) {
                if (e.key === 'Escape') setDialogOpen(false);
                return;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                isPressingForward.current = true;
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                isPressingBackward.current = true;
            } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                handleAction();
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                isPressingForward.current = false;
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                isPressingBackward.current = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isCoverOpen, dialogOpen, isIntroActive]);

    const activeCp = getNearestCheckpoint();
    const isCloseToCp = Math.abs(activeCp.pos - posX) < 300;

    // RSVP Form Hooks
    const { data, setData, post, processing, reset } = useForm({
        name: guest?.name || '',
        attendance: 'hadir',
        message: '',
        additional_guests: 1
    });

    const submitRsvp = (e) => {
        e.preventDefault();
        post(route('rsvps.store', invitation.slug), {
            onSuccess: () => {
                setRsvpSubmitted(true);
                sfx.playSuccessFanfare();
            }
        });
    };

    const handleStart = () => {
        setIsCoverOpen(false);
        setIsIntroActive(true);
        setBikerScreenX(-200); // Start offscreen
        setIsStanding(true); // Pop a wheelie!
        if (bgMusicRef.current) {
            bgMusicRef.current.play().catch(err => console.log("Music blocked", err));
        }
    };

    // Biker Intro Wheelie Animation Effect
    useEffect(() => {
        if (!isIntroActive) return;

        let startX = -200;
        const targetX = 150;
        const speed = 6.5; // pixels per frame speed
        let frameId;

        // Roaring engine on startup standing wheelie
        engine.init();
        engine.setSpeed(1.0, isMuted);

        const animateIntro = () => {
            startX += speed;
            if (startX >= targetX) {
                setBikerScreenX(targetX);

                // Land wheel down smoothly and transition state
                setTimeout(() => {
                    setIsStanding(false);
                    setIsIntroActive(false);
                    engine.setSpeed(0, isMuted); // reset engine to idle hum
                }, 250);
            } else {
                setBikerScreenX(startX);
                frameId = requestAnimationFrame(animateIntro);
            }
        };

        frameId = requestAnimationFrame(animateIntro);
        return () => cancelAnimationFrame(frameId);
    }, [isIntroActive]);

    const toggleMute = () => {
        if (bgMusicRef.current) {
            bgMusicRef.current.muted = !isMuted;
        }
        setIsMuted(!isMuted);
    };

    const getCalendarUrl = () => {
        if (!content.event_date) return '#';
        const date = new Date(content.event_date);
        const formatUTC = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const start = formatUTC(date);
        const end = formatUTC(new Date(date.getTime() + 3 * 60 * 60 * 1000));
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(invitation.title)}&dates=${start}/${end}&details=Classic+Motor+Touring+Undangan&location=${encodeURIComponent(content.event_location + ', ' + content.event_address)}`;
    };

    const characterImage = content.character_image
        ? `/storage/${content.character_image}`
        : `/images/themes/rpg-touring-default-character.png`;

    const totalCoins = coins.length;
    const coinsCollected = coins.filter(c => c.collected).length;

    // Calculate opacities for the 4 time-of-day segments
    const getOpacity = (x) => {
        let sunrise = 0;
        let day = 0;
        let sunset = 0;
        let night = 0;

        if (x < 1000) {
            sunrise = 1;
        } else if (x >= 1000 && x < 1400) {
            const p = (x - 1000) / 400;
            sunrise = 1 - p;
            day = p;
        } else if (x >= 1400 && x < 2300) {
            day = 1;
        } else if (x >= 2300 && x < 2700) {
            const p = (x - 2300) / 400;
            day = 1 - p;
            sunset = p;
        } else if (x >= 2700 && x < 3500) {
            sunset = 1;
        } else if (x >= 3500 && x < 3900) {
            const p = (x - 3500) / 400;
            sunset = 1 - p;
            night = p;
        } else {
            night = 1;
        }

        return { sunrise, day, sunset, night };
    };

    const { sunrise: opacitySunrise, day: opacityDay, sunset: opacitySunset, night: opacityNight } = getOpacity(posX);

    const roadSigns = [
        { pos: 300, text: '🏁 PANTAI SUNRISE', desc: 'Awal Perjalanan Kita' },
        { pos: 1300, text: '🏞️ DANAU ASMARA', desc: 'Indah & Tenang' },
        { pos: 3280, text: '🚦 SIMPANG EMPAT', desc: 'Patuhi Lampu Merah' },
        { pos: 4150, text: '🌆 KOTA KENANGAN', desc: 'Menuju Masa Depan' }
    ];

    // Mobile controls helpers
    const startPressForward = (e) => {
        e.preventDefault();
        isPressingForward.current = true;
    };
    const endPressForward = () => {
        isPressingForward.current = false;
    };
    const startPressBackward = (e) => {
        e.preventDefault();
        isPressingBackward.current = true;
    };
    const endPressBackward = () => {
        isPressingBackward.current = false;
    };

    return (
        <div className="fixed inset-0 w-full h-full bg-[#0c0d14] text-white font-mono flex flex-col justify-between overflow-hidden select-none select-none-all">
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Outfit:wght@300;400;600;800&family=VT323&display=swap" rel="stylesheet" />
                <style>{`
                    .press-start { font-family: 'Press Start 2P', monospace; }
                    .vt-font { font-family: 'VT323', monospace; }
                    .outfit-font { font-family: 'Outfit', sans-serif; }
                    @keyframes wheelRotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes bikeBobSlow {
                        0% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-2px) rotate(0.2deg); }
                        100% { transform: translateY(0px) rotate(0deg); }
                    }
                    @keyframes bikeBobFast {
                        0% { transform: translateY(0px) rotate(0deg); }
                        25% { transform: translateY(-4px) rotate(0.8deg); }
                        50% { transform: translateY(0px) rotate(-0.3deg); }
                        75% { transform: translateY(-3px) rotate(0.6deg); }
                        100% { transform: translateY(0px) rotate(0deg); }
                    }
                    @keyframes exhaustPuff {
                        0% { transform: translate(0, 0) scale(0.6); opacity: 0.8; }
                        50% { opacity: 0.5; }
                        100% { transform: translate(-40px, -20px) scale(1.6); opacity: 0; }
                    }
                    @keyframes spinY {
                        0% { transform: rotateY(0deg) scale(1); }
                        50% { transform: rotateY(180deg) scale(1.1); }
                        100% { transform: rotateY(360deg) scale(1); }
                    }
                    @keyframes waveNpc {
                        0% { transform: rotate(0deg); }
                        50% { transform: rotate(10deg) translateY(-2px); }
                        100% { transform: rotate(0deg); }
                    }
                    .animate-wheel-fast { animation: wheelRotate 0.2s linear infinite; }
                    .animate-wheel-slow { animation: wheelRotate 0.6s linear infinite; }
                    .animate-bike-fast { animation: bikeBobFast 0.16s linear infinite; }
                    .animate-bike-slow { animation: bikeBobSlow 0.4s linear infinite; }
                    .animate-puff { animation: exhaustPuff 0.45s linear infinite; }
                    .animate-coin { animation: floatCoin 1.8s ease-in-out infinite; }
                    .animate-coin-3d { animation: spinY 1.4s linear infinite; transform-style: preserve-3d; }
                    .animate-npc { animation: waveNpc 1s ease-in-out infinite; }
                    .pixel-art { image-rendering: pixelated; }
                    .scanlines {
                        background: linear-gradient(
                            rgba(18, 16, 16, 0) 50%, 
                            rgba(0, 0, 0, 0.3) 50%
                        ), linear-gradient(
                            90deg,
                            rgba(255, 0, 0, 0.05),
                            rgba(0, 255, 0, 0.02),
                            rgba(0, 0, 255, 0.05)
                        );
                        background-size: 100% 4px, 6px 100%;
                    }
                `}</style>
            </Head>

            {/* BGM Music Player */}
            {music_url && (
                <audio
                    ref={bgMusicRef}
                    src={music_url}
                    loop
                    className="hidden"
                />
            )}

            {/* CRT overlay */}
            <div className="absolute inset-0 pointer-events-none z-50 scanlines opacity-25"></div>

            {/* SCREEN 1: COVER SCREEN */}
            {isCoverOpen ? (
                <div className="absolute inset-0 z-40 bg-[#0c0d14] flex flex-col items-center justify-between p-8 text-center bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(12,13,20,0.85), rgba(12,13,20,0.95)), url(${cover_image ? `/storage/${cover_image}` : 'https://cdn-uploads.owlink.id/d57ca580-ab4e-11f0-aa4f-43153b9232d2.jpg'})` }}>

                    {/* Header */}
                    <div className="mt-8 space-y-3">
                        <div className="inline-block px-3 py-1 border border-[#FFA500]/50 bg-[#FFA500]/10 rounded-md text-[10px] press-start text-[#FFA500] tracking-widest animate-pulse">
                            🏁 TOURING INVITATION
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold press-start tracking-tight text-[#ffc65d] drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] uppercase pt-4 leading-relaxed">
                            {content.groom_nickname || 'Rider 1'} <br />
                            <span className="text-sm vt-font text-[#FFA500] lowercase block my-1">&amp;</span>
                            {content.bride_nickname || 'Rider 2'}
                        </h1>
                        <p className="text-xs vt-font text-slate-350 tracking-wider max-w-md mx-auto text-lg leading-relaxed pt-2">
                            "KOPDAR AKBAR &amp; HARI H TOURING CINTA CLASSIC"
                        </p>
                    </div>

                    {/* Biker Karikatur Banner preview */}
                    <div className="my-6 relative flex flex-col items-center justify-center">
                        <div className="w-48 h-48 rounded-full border-4 border-dashed border-[#FFA500]/40 flex items-center justify-center p-2 bg-[#171926]">
                            <img
                                src={characterImage}
                                alt="Riders Caricature"
                                className="w-full h-full object-contain pixel-art animate-bounce"
                                style={{ mixBlendMode: 'screen' }}
                                onError={(e) => {
                                    e.target.src = '/images/themes/rpg-touring-default-character.png';
                                }}
                            />
                        </div>
                        <div className="absolute -bottom-3 px-3 py-0.5 bg-[#ff4a4a] text-[9px] press-start rounded-full uppercase border border-white text-white">
                            READY TO ROLL
                        </div>
                    </div>

                    {/* Start controls */}
                    <div className="mb-6 space-y-6 w-full max-w-sm">
                        {guest?.name && (
                            <div className="bg-[#171926] border-2 border-slate-700/80 p-3 rounded-xl">
                                <span className="text-[10px] uppercase text-[#FFA500] font-bold block mb-0.5">CO-PILOT (TAMU):</span>
                                <span className="text-sm font-extrabold Outfit font-sans text-white uppercase tracking-wider">{guest?.name}</span>
                            </div>
                        )}

                        <button
                            onClick={handleStart}
                            className="w-full py-4 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] hover:brightness-110 active:scale-95 transition-all rounded-2xl press-start text-xs text-black font-extrabold shadow-[0_6px_0_#995c00] border-2 border-black tracking-widest uppercase hover:-translate-y-0.5"
                        >
                            🔑 NGEGAS SEKARANG!
                        </button>
                        <p className="text-[10px] vt-font text-slate-450 tracking-widest text-lg">
                            GUNAKAN TOMBOL DI LAYAR ATAU TOMBOL PANAH KEYBOARD
                        </p>
                    </div>
                </div>
            ) : null}

            {/* SCREEN 2: GAMEPLAY ARENA */}
            <div className="relative flex-1 w-full overflow-hidden bg-[#0c0d14]">
                <style>{`
                    @keyframes sway-slow {
                        0%, 100% { transform: rotate(-3deg); }
                        50% { transform: rotate(3deg); }
                    }
                    @keyframes sway-fast {
                        0%, 100% { transform: rotate(-5deg); }
                        50% { transform: rotate(5deg); }
                    }
                    .animate-sway-slow { animation: sway-slow 4s ease-in-out infinite; }
                    .animate-sway-fast { animation: sway-fast 2.5s ease-in-out infinite; }
                `}</style>

                {/* 1. SKY LAYERS WITH SMOOTH OPACITY TRANSITIONS */}
                {/* Sunrise Beach Sky */}
                <div
                    className="absolute inset-0 bg-gradient-to-b from-[#ff7e5f] via-[#feb47b] to-[#fffcde] transition-opacity duration-300 pointer-events-none z-0"
                    style={{ opacity: opacitySunrise }}
                ></div>
                {/* Daytime Sky */}
                <div
                    className="absolute inset-0 bg-gradient-to-b from-[#4facfe] via-[#00f2fe] to-[#eef2f3] transition-opacity duration-300 pointer-events-none z-0"
                    style={{ opacity: opacityDay }}
                ></div>
                {/* Sunset Mountain Sky */}
                <div
                    className="absolute inset-0 bg-gradient-to-b from-[#f12711] via-[#f5af19] to-[#3a1c3a] transition-opacity duration-300 pointer-events-none z-0"
                    style={{ opacity: opacitySunset }}
                ></div>
                {/* Night Sky */}
                <div
                    className="absolute inset-0 bg-gradient-to-b from-[#0b0c16] via-[#121635] to-[#05060b] transition-opacity duration-300 pointer-events-none z-0"
                    style={{ opacity: opacityNight }}
                ></div>

                {/* Moving Sun (Follows motor) */}
                <div
                    className="absolute rounded-full shadow-[0_0_80px_#fde047] transition-all duration-100 pointer-events-none z-0"
                    style={{
                        width: '120px',
                        height: '120px',
                        background: 'radial-gradient(circle, #ffffff 20%, #fde047 60%, #fb923c 100%)',
                        left: `${10 + (posX / maxPos) * 80}%`, // 10% to 90%
                        top: `${80 - Math.sin((posX / maxPos) * Math.PI) * 60}%`, // Parabola curve
                        opacity: 1 - opacityNight // Fades out at night
                    }}
                />

                {/* Moving Moon (Follows motor at night) */}
                <div
                    className="absolute rounded-full shadow-[0_0_60px_#e2e8f0] transition-all duration-100 pointer-events-none z-0"
                    style={{
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, #ffffff 10%, #e2e8f0 70%, #94a3b8 100%)',
                        left: `${10 + (posX / maxPos) * 80}%`, // 10% to 90%
                        top: `${80 - Math.sin((posX / maxPos) * Math.PI) * 60}%`, // Parabola curve
                        opacity: opacityNight // Fades in at night
                    }}
                />

                {/* Day Clouds (Parallax 0.15) */}
                {posX >= 800 && posX < 2800 && (
                    <div
                        className="absolute top-10 inset-x-0 h-16 transition-transform duration-100 ease-out pointer-events-none z-1"
                        style={{ transform: `translateX(${-posX * 0.15}px)` }}
                    >
                        <div className="absolute left-[300px] w-16 h-6 bg-white/70 rounded-full blur-[1px]"></div>
                        <div className="absolute left-[750px] w-24 h-8 bg-white/65 rounded-full blur-[1px]"></div>
                        <div className="absolute left-[1200px] w-18 h-7 bg-white/75 rounded-full blur-[1px]"></div>
                    </div>
                )}

                {/* Night: Twinkling Stars */}
                {posX >= 3400 && (
                    <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-1"
                        style={{ opacity: opacityNight }}
                    >
                        <div className="absolute top-8 left-[15%] w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                        <div className="absolute top-16 left-[40%] w-1 h-1 bg-yellow-100 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
                        <div className="absolute top-6 left-[65%] w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
                        <div className="absolute top-24 left-[80%] w-1.5 h-1.5 bg-yellow-50 rounded-full animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '4s' }}></div>
                    </div>
                )}

                {/* 3. THE SCROLLING ROAD WORLD CONTAINER (1:1 Movement with Player) */}
                <div
                    className="absolute bottom-0 inset-x-0 h-[400px] transition-transform duration-100 ease-out pointer-events-none z-10"
                    style={{ transform: `translateX(${-posX + screenCenter}px)` }}
                >
                    {/* Beach & Ocean Scenery (Sunrise zone) */}
                    <div
                        className="absolute pointer-events-none z-1 bg-gradient-to-t from-yellow-100 via-blue-400 to-blue-500 border-t-2 border-yellow-250 flex flex-col justify-end"
                        style={{
                            left: '-500px',
                            width: '1700px',
                            height: '90px',
                            bottom: `${60 + getRoadProfile(0).height}px`,
                            WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                            maskImage: 'linear-gradient(to right, black 80%, transparent 100%)'
                        }}
                    >
                        {/* Waves animation */}
                        <div className="inset-x-0 bottom-2 text-[10px] text-white/20 animate-pulse text-center mb-1">
                            ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
                        </div>
                    </div>
                    {/* Cruise Ship on Sea */}
                    <div
                        className="absolute opacity-90 z-2 animate-sway-slow pointer-events-none"
                        style={{
                            left: `${500 + posX * 0.4}px`,
                            bottom: `${70 + 35}px`,
                            width: '150px',
                            height: '100px'
                        }}
                    >
                        <img src="/images/kapal.png" alt="Kapal Laut" className="w-full h-full object-contain drop-shadow-xl" />
                    </div>


                    {/* Rice Fields (Sawah Hijau) */}
                    <div
                        className="absolute bg-emerald-800/20 border-t-2 border-emerald-500/40 p-2 flex flex-col justify-between pointer-events-none z-1"
                        style={{
                            left: '2200px',
                            bottom: `${60 + getRoadProfile(2400).height}px`,
                            width: '600px',
                            height: '55px',
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
                            maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)'
                        }}
                    >
                        <div className="flex justify-around text-[50px] leading-none mb-2">
                            <span>🌾</span><span>🌾</span><span>🌾</span><span>🌾</span><span>🌾</span>
                        </div>
                        <div className="flex justify-around text-[60px] leading-none opacity-80 -mt-8">
                            <span>🌾</span><span>🌾</span><span>🌾</span><span>🌾</span><span>🌾</span>
                        </div>
                        <div className="absolute -right-10 -top-16 text-[100px] drop-shadow-xl">🏡</div>
                    </div>

                    {/* City Buildings Image (Kota Kenangan) */}
                    <div className="absolute flex gap-6 items-end pointer-events-none z-[5]" style={{ left: '4150px', bottom: `${60 + getRoadProfile(4150).height}px` }}>
                        <img src="/images/kota.png" alt="City Background" className="h-[400px] drop-shadow-2xl object-contain" />
                    </div>



                    {/* Road SVG Path (Asphalt & Markings) */}
                    <svg width={maxPos + 500} height="400" className="absolute bottom-0 left-0 overflow-visible z-10 pointer-events-none">
                        {/* Solid Ground Underneath Road (Broken at bridge) */}
                        <path d={roadPaths.ground1} fill="#11131e" />
                        <path d={roadPaths.ground2} fill="#11131e" />

                        {/* Top Grass Ground (Tanah Rumput) */}
                        <path d={roadPaths.topSidewalkSurface} stroke="#15803d" strokeWidth="24" fill="none" strokeLinecap="square" strokeLinejoin="round" />
                        <path d={roadPaths.topSidewalkSurface} stroke="#16a34a" strokeWidth="24" fill="none" strokeDasharray="10, 15" strokeLinecap="square" strokeLinejoin="round" />
                        <path d={roadPaths.topSidewalkFace} stroke="#14532d" strokeWidth="6" fill="none" strokeLinecap="square" strokeLinejoin="round" />

                        {/* Bottom Grass Ground (Tanah Rumput) */}
                        <path d={roadPaths.bottomSidewalkSurface} stroke="#15803d" strokeWidth="24" fill="none" strokeLinecap="square" strokeLinejoin="round" />
                        <path d={roadPaths.bottomSidewalkSurface} stroke="#16a34a" strokeWidth="24" fill="none" strokeDasharray="10, 15" strokeLinecap="square" strokeLinejoin="round" />
                        <path d={roadPaths.bottomSidewalkFace} stroke="#14532d" strokeWidth="6" fill="none" strokeLinecap="square" strokeLinejoin="round" />

                        {/* ======================================================== */}
                        {/* RIVER WATER (Drawn exactly under the bridge gap)         */}
                        {/* ======================================================== */}
                        <rect x="2500" y="375" width="700" height="25" fill="#0ea5e9" />
                        <rect x="2500" y="375" width="700" height="4" fill="#67e8f9" />
                        <text x="2600" y="390" fill="rgba(165,243,252,0.5)" fontSize="14" className="animate-pulse font-bold">~ ~ ~</text>
                        <text x="2800" y="380" fill="rgba(165,243,252,0.5)" fontSize="14" className="animate-pulse font-bold" style={{ animationDelay: '0.4s' }}>~ ~ ~</text>
                        <text x="3000" y="395" fill="rgba(165,243,252,0.5)" fontSize="14" className="animate-pulse font-bold" style={{ animationDelay: '0.8s' }}>~ ~ ~</text>

                        {/* Vertical Cross Road - Back Part */}
                        <polygon
                            points={`3280,${340 - getRoadProfile(3280).height} 3460,${340 - getRoadProfile(3460).height} 3440,${340 - getRoadProfile(3370).height - 250} 3300,${340 - getRoadProfile(3370).height - 250}`}
                            fill="#1b1e2c"
                        />
                        {/* Back Vertical Road Yellow Borders */}
                        <line x1="3280" y1={340 - getRoadProfile(3280).height} x2="3300" y2={340 - getRoadProfile(3370).height - 250} stroke="#ffb13b" strokeWidth="4" />
                        <line x1="3460" y1={340 - getRoadProfile(3460).height} x2="3440" y2={340 - getRoadProfile(3370).height - 250} stroke="#ffb13b" strokeWidth="4" />
                        {/* Back Vertical Road Center Dashed Line */}
                        <line x1="3370" y1={340 - getRoadProfile(3370).height} x2="3370" y2={340 - getRoadProfile(3370).height - 250} stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeDasharray="15,20" />

                        {/* Main Horizontal Asphalt Road Body */}
                        <path d={roadPaths.asphalt} fill="#1b1e2c" />

                        {/* Main Road Yellow Borders (Broken at Intersection 3280-3460) */}
                        <path d={roadPaths.topBorder} stroke="#ffb13b" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={roadPaths.bottomBorder} stroke="#ffb13b" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Intersection Dark Box (to cover the main road borders cleanly) */}
                        <polygon
                            points={`3280,${340 - getRoadProfile(3280).height - 4} 3460,${340 - getRoadProfile(3460).height - 4} 3460,${340 - getRoadProfile(3460).height + getRoadProfile(3460).thickness + 4} 3280,${340 - getRoadProfile(3280).height + getRoadProfile(3280).thickness + 4}`}
                            fill="#1b1e2c"
                        />

                        {/* Center White Dashed Line (Broken at Intersection) */}
                        <path d={roadPaths.centerLine} stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeDasharray="15,20" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                        {/* MAIN ROAD MARKINGS */}

                        {/* Vertical Cross Road - Front Part */}
                        <polygon
                            points={`3280,${340 - getRoadProfile(3280).height + getRoadProfile(3280).thickness} 3460,${340 - getRoadProfile(3460).height + getRoadProfile(3460).thickness} 3490,400 3250,400`}
                            fill="#1b1e2c"
                        />
                        {/* Front Vertical Road Yellow Borders */}
                        <line x1="3280" y1={340 - getRoadProfile(3280).height + getRoadProfile(3280).thickness} x2="3250" y2="400" stroke="#ffb13b" strokeWidth="4" />
                        <line x1="3460" y1={340 - getRoadProfile(3460).height + getRoadProfile(3460).thickness} x2="3490" y2="400" stroke="#ffb13b" strokeWidth="4" />
                        {/* Front Vertical Road Center Dashed Line */}
                        <line x1="3370" y1={340 - getRoadProfile(3370).height + getRoadProfile(3370).thickness} x2="3370" y2="400" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeDasharray="15,20" />
                    </svg>

                    {/* Steel Truss Bridge Overlay (Background z-[5]) */}
                    <div
                        className="absolute pointer-events-none z-[5]"
                        style={{ left: '2600px', width: '500px', height: '400px', bottom: '0px' }}
                    >
                        <svg width="500" height="400" viewBox="0 0 500 400" className="opacity-70">
                            {/* Bottom Main Steel Beam rests on yTop=310 */}
                            <rect x="0" y="300" width="500" height="10" fill="#1e293b" />
                            {/* Top Main Steel Beam */}
                            <rect x="0" y="140" width="500" height="10" fill="#1e293b" />

                            {/* Diagonal Beams (Warren Truss) */}
                            <path d="M 0,300 L 50,150 L 100,300 L 150,150 L 200,300 L 250,150 L 300,300 L 350,150 L 400,300 L 450,150 L 500,300" stroke="#1e293b" strokeWidth="8" strokeLinejoin="round" fill="none" />

                            {/* Vertical Beams */}
                            {[0, 100, 200, 300, 400, 500].map(x => (
                                <rect key={`vb-${x}`} x={x - 4} y="150" width="8" height="150" fill="#1e293b" />
                            ))}
                        </svg>
                    </div>



                    {/* Simpang Empat Image */}
                    <div className="absolute flex flex-col items-center pointer-events-none z-20 w-[150px] h-[150px]" style={{ left: '3370px', bottom: `${25 + getRoadProfile(3370).height}px`, transform: 'translateX(-50%)' }}>
                        <img src="/images/simpang.png" alt="Simpang Empat" className="w-full h-full drop-shadow-2xl object-contain origin-bottom" />
                    </div>

                    {/* Traffic Light Intersection */}
                    <div
                        className="absolute flex flex-col items-center pointer-events-none z-20"
                        style={{ left: '3260px', bottom: '70px' }}
                    >
                        {/* Traffic light housing */}
                        <div className="w-6 h-14 bg-slate-900 border-2 border-slate-700 rounded-lg p-1 flex flex-col justify-between items-center shadow-lg">
                            {/* Red Light */}
                            <div
                                className={`w-3.5 h-3.5 rounded-full border border-black transition-all ${trafficLight === 'red'
                                    ? 'bg-red-500 shadow-[0_0_12px_#ef4444]'
                                    : 'bg-red-950'
                                    }`}
                            />
                            {/* Yellow Light */}
                            <div
                                className={`w-3.5 h-3.5 rounded-full border border-black transition-all ${trafficLight === 'yellow'
                                    ? 'bg-yellow-400 shadow-[0_0_12px_#facc15]'
                                    : 'bg-yellow-950'
                                    }`}
                            />
                            {/* Green Light */}
                            <div
                                className={`w-3.5 h-3.5 rounded-full border border-black transition-all ${trafficLight === 'green'
                                    ? 'bg-green-500 shadow-[0_0_12px_#22c55e]'
                                    : 'bg-green-950'
                                    }`}
                            />
                        </div>
                        {/* Pole */}
                        <div className="w-1.5 h-16 bg-slate-600"></div>
                    </div>
                    {/* Masjid Image */}
                    <div className="absolute flex flex-col items-center pointer-events-none z-20 w-[300px] h-[300px]" style={{ left: '1250px', bottom: `${20 + getRoadProfile(1250).height}px` }}>
                        <img src="/images/masjid.png" alt="Masjid" className="w-full h-full drop-shadow-2xl object-contain origin-bottom" />
                    </div>

                    {/* Puncak Rindu Image */}
                    <div className="absolute flex flex-col items-center pointer-events-none z-[5] w-[350px] h-[350px]" style={{ left: '1710px', bottom: `${10 + getRoadProfile(1700).height}px` }}>
                        <img src="/images/puncak.png" alt="Puncak Rindu" className="w-full h-full drop-shadow-2xl object-contain origin-bottom" />
                    </div>

                    {/* Palm Trees at Beach */}
                    {[
                        { x: 180, yOffset: 70, animate: false },
                        { x: 850, yOffset: 88, animate: false } // Pohon kelapa kedua (yOffset bisa diubah, tanpa animasi)
                    ].map((tree, idx) => (
                        <div
                            key={`palm-${tree.x}-${idx}`}
                            className="absolute flex flex-col items-center pointer-events-none z-20"
                            style={{
                                left: `${tree.x}px`,
                                bottom: `${tree.yOffset + getRoadProfile(tree.x).height}px`,
                                transform: `scale(${getRoadProfile(tree.x).scale})`,
                                transformOrigin: 'bottom center'
                            }}
                        >
                            <div className={`w-[150px] h-[150px] ${tree.animate ? 'animate-sway-fast' : ''}`} style={tree.animate ? { animationDelay: `${(tree.x % 3) * 0.4}s` } : {}}>
                                <img src="/images/kelapa.png" alt="Pohon Kelapa" className="w-full h-full object-contain drop-shadow-xl origin-bottom" />
                            </div>
                        </div>
                    ))}

                    {/* Green Trees at Day Section */}
                    {[].map((treeX) => (
                        <div
                            key={`tree-${treeX}`}
                            className="absolute flex flex-col items-center pointer-events-none z-20"
                            style={{
                                left: `${treeX}px`,
                                bottom: `${60 + getRoadProfile(treeX).height}px`,
                                transform: `scale(${getRoadProfile(treeX).scale})`,
                                transformOrigin: 'bottom center'
                            }}
                        >
                            <span className="text-[100px] animate-sway-slow drop-shadow-xl" style={{ lineHeight: 1 }}>🌳</span>
                        </div>
                    ))}

                    {/* Pine Trees at Sunset Mountain Section */}
                    {[2550, 2800, 3150, 3500, 3700].map((treeX) => (
                        <div
                            key={`pine-${treeX}`}
                            className="absolute flex flex-col items-center pointer-events-none z-20"
                            style={{
                                left: `${treeX}px`,
                                bottom: `${60 + getRoadProfile(treeX).height}px`,
                                transform: `scale(${getRoadProfile(treeX).scale})`,
                                transformOrigin: 'bottom center'
                            }}
                        >
                            <div className="w-[150px] h-[150px] animate-sway-slow">
                                <img src="/images/pinus.png" alt="Pohon Pinus" className="w-full h-full object-contain drop-shadow-xl origin-bottom" />
                            </div>
                        </div>
                    ))}

                    {/* Informative Road Signs */}
                    {roadSigns.map((sign, idx) => (
                        <div
                            key={`sign-${idx}`}
                            className="absolute flex flex-col items-center pointer-events-none z-5"
                            style={{
                                left: `${sign.pos}px`,
                                bottom: `${60 + getRoadProfile(sign.pos).height}px`,
                                transform: `scale(${getRoadProfile(sign.pos).scale})`,
                                transformOrigin: 'bottom center'
                            }}
                        >
                            {/* Signboard */}
                            <div className="bg-[#242944] border-4 border-[#FFA500] p-2 rounded-xl text-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] w-48 relative z-10">
                                <div className="text-[10px] press-start text-[#FFA500] uppercase font-extrabold leading-relaxed mb-1">{sign.text}</div>
                                <div className="text-[9px] font-sans font-bold text-slate-300">{sign.desc}</div>
                            </div>
                            {/* Pole */}
                            <div className="w-3 h-16 bg-gradient-to-b from-slate-400 to-slate-600 border-x border-black shadow-lg -mt-2"></div>
                        </div>
                    ))}

                    {/* Coins */}
                    {coins.map((coin) => (
                        <div
                            key={`coin-${coin.id}`}
                            className="absolute flex items-center justify-center transition-all duration-300 z-10"
                            style={{
                                left: `${coin.pos}px`,
                                bottom: `${60 + 16 + getRoadProfile(coin.pos).height}px`,
                                opacity: coin.collected ? 0 : 1,
                                transform: `scale(${getRoadProfile(coin.pos).scale * (coin.collected ? 0 : 1)}) ${coin.collected ? 'translateY(-30px)' : 'none'}`
                            }}
                        >
                            <div className="w-8 h-8 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center text-[14px] font-bold text-black animate-coin-3d shadow-[0_2px_0_rgba(0,0,0,0.4)]">
                                🪙
                            </div>
                        </div>
                    ))}

                    {/* NPCs */}
                    {npcs.map((npc) => {
                        const isPlayerNear = Math.abs(npc.pos - posX) < 220;
                        return (
                            <div
                                key={`npc-${npc.id}`}
                                className={`absolute flex flex-col items-center ${npc.image ? 'z-20' : 'z-5'}`}
                                style={{
                                    left: `${npc.pos}px`,
                                    bottom: `${60 + getRoadProfile(npc.pos).height}px`,
                                    transform: `scale(${getRoadProfile(npc.pos).scale})`,
                                    transformOrigin: 'bottom center'
                                }}
                            >
                                {/* Speech Bubble Popup */}
                                <div
                                    className="px-3 py-1.5 rounded-xl bg-black border-2 border-[#FFA500] text-center w-40 mb-2 text-[10px] text-white relative shadow-lg transition-all duration-300 transform"
                                    style={{
                                        opacity: isPlayerNear ? 1 : 0,
                                        transform: isPlayerNear ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(10px)',
                                        transformOrigin: 'bottom center'
                                    }}
                                >
                                    <div className="font-extrabold text-[#FFA500] truncate">{npc.name}</div>
                                    <div className="mt-0.5 italic">{npc.text}</div>
                                    {/* Arrow pointer */}
                                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-black"></div>
                                </div>

                                {/* NPC Character */}
                                {npc.image ? (
                                    <div className="w-[100px] h-[100px] relative z-10">
                                        <img src={npc.image} alt={npc.name} className="w-full h-full object-contain drop-shadow-xl" />
                                    </div>
                                ) : (
                                    <div className="text-[80px] drop-shadow-xl animate-npc relative z-10" style={{ lineHeight: 1 }}>{npc.icon || '🧍‍♂️'}</div>
                                )}
                            </div>
                        );
                    })}

                    {/* Checkpoints */}
                    {checkpoints.map((cp) => {
                        const isPlayerNear = Math.abs(cp.pos - posX) < 160;
                        return (
                            <div
                                key={`cp-${cp.id}`}
                                className="absolute flex flex-col items-center z-5"
                                style={{
                                    left: `${cp.pos}px`,
                                    bottom: `${60 + getRoadProfile(cp.pos).height}px`,
                                    transform: `scale(${getRoadProfile(cp.pos).scale})`,
                                    transformOrigin: 'bottom center'
                                }}
                            >
                                {/* Active arrow indicator */}
                                {isPlayerNear && (
                                    <div className="text-[#FFA500] text-sm press-start animate-bounce mb-2 drop-shadow-lg">
                                        👇 ACTION
                                    </div>
                                )}

                                {/* Info Box over Signpost */}
                                <div className={`px-4 py-3 rounded-2xl bg-gradient-to-b from-slate-900 to-black border-4 ${isPlayerNear ? 'border-[#FFA500] shadow-[0_0_25px_#FFA500]' : 'border-slate-500 shadow-xl'} text-center w-56 mb-2 relative z-10 transition-all`}>
                                    <div className="font-extrabold text-[#FFA500] tracking-wider uppercase text-[10px] press-start mb-1">{cp.title}</div>
                                    <div className="text-[10px] font-sans font-bold text-slate-300">{cp.description}</div>
                                </div>

                                {/* Checkpoint Object representation */}
                                <div className="relative flex flex-col items-center -mt-6">
                                    <div className="text-[60px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] select-none z-10 relative">{cp.icon}</div>
                                    <div className="w-4 h-24 bg-gradient-to-b from-slate-500 to-slate-800 border-x-2 border-black mx-auto -mt-4 rounded-t-full"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 8.5 LEVEL FOREGROUND LAYER (Scrolling items in front of biker) */}
                <div className="absolute inset-0 pointer-events-none z-[25] transition-transform duration-100 ease-out" style={{ transform: `translateX(${-posX + screenCenter}px)` }}>
                    {/* Steel Truss Bridge Overlay (Foreground) */}
                    <div
                        className="absolute pointer-events-none"
                        style={{ left: '2600px', width: '500px', height: '400px', bottom: '0px' }}
                    >
                        <svg width="500" height="400" viewBox="0 0 500 400" className="drop-shadow-2xl">
                            {/* Concrete Pillars */}
                            <path d="M 0,375 L 30,375 L 40,400 L -10,400 Z" fill="#64748b" stroke="#334155" strokeWidth="2" />
                            <path d="M 470,375 L 500,375 L 510,400 L 460,400 Z" fill="#64748b" stroke="#334155" strokeWidth="2" />

                            {/* Bottom Main Steel Beam rests on yBottom=375 */}
                            <rect x="0" y="360" width="500" height="15" fill="#475569" stroke="#1e293b" strokeWidth="3" />
                            {/* Top Main Steel Beam */}
                            <rect x="0" y="150" width="500" height="15" fill="#475569" stroke="#1e293b" strokeWidth="3" />

                            {/* Diagonal Beams (Warren Truss) */}
                            <path d="M 0,360 L 50,165 L 100,360 L 150,165 L 200,360 L 250,165 L 300,360 L 350,165 L 400,360 L 450,165 L 500,360" stroke="#475569" strokeWidth="16" strokeLinejoin="round" fill="none" />
                            <path d="M 0,360 L 50,165 L 100,360 L 150,165 L 200,360 L 250,165 L 300,360 L 350,165 L 400,360 L 450,165 L 500,360" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" fill="none" strokeDasharray="6 6" />

                            {/* Vertical Beams */}
                            {[0, 100, 200, 300, 400, 500].map(x => (
                                <g key={`v-${x}`}>
                                    <rect x={x - 8} y="165" width="16" height="195" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                                    {/* Steel Rivets/Plates at joints */}
                                    <rect x={x - 14} y="150" width="28" height="20" fill="#334155" stroke="#0f172a" strokeWidth="2" rx="3" />
                                    <rect x={x - 14} y="350" width="28" height="20" fill="#334155" stroke="#0f172a" strokeWidth="2" rx="3" />
                                </g>
                            ))}
                            {[50, 150, 250, 350, 450].map(x => (
                                <g key={`vt-${x}`}>
                                    <rect x={x - 14} y="150" width="28" height="20" fill="#334155" stroke="#0f172a" strokeWidth="2" rx="3" />
                                    <rect x={x - 14} y="350" width="28" height="20" fill="#334155" stroke="#0f172a" strokeWidth="2" rx="3" />
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* Clean design, no excessive tutorial box needed */}

                {/* Traffic Light Warning Bubble (appears above Biker when approaching red light) */}
                {posX >= 3100 && posX <= 3360 && (
                    <div
                        className="absolute z-30 px-3 py-1.5 rounded-full bg-black/90 border-2 text-center text-[9px] press-start font-bold animate-bounce pointer-events-none"
                        style={{
                            left: `${bikerScreenX}px`,
                            bottom: `${190 + getRoadProfile(posX).height}px`,
                            transform: 'translateX(-50%)',
                            borderColor: trafficLight === 'red' ? '#ef4444' : (trafficLight === 'yellow' ? '#facc15' : '#22c55e'),
                            color: trafficLight === 'red' ? '#ef4444' : (trafficLight === 'yellow' ? '#facc15' : '#22c55e')
                        }}
                    >
                        {trafficLight === 'red' && '🔴 LAMPU MERAH! BERHENTI'}
                        {trafficLight === 'yellow' && '🟡 HATI-HATI! PELAN-PELAN'}
                        {trafficLight === 'green' && '🟢 LAMPU HIJAU! GASSS!'}
                    </div>
                )}

                {/* 9. THE BIKER SPRITE */}
                <div
                    className="absolute z-20 flex flex-col items-center"
                    style={{
                        left: `${bikerScreenX}px`,
                        bottom: `${60 + getRoadProfile(posX).height}px`,
                        transform: `translateX(-50%) scale(${getRoadProfile(posX).scale}) rotate(${(isStanding ? -18 : 0) -
                            getRoadProfile(posX).angle
                            }deg)`,
                        transition: isIntroActive ? 'none' : 'transform 0.1s ease-out'
                    }}
                >
                    {/* Smoke puffs from exhaust (More visible) */}
                    {isMoving && (
                        <div className="absolute right-8 bottom-4 w-4 h-4 bg-gray-100 rounded-full opacity-0 animate-puff pixel-art pointer-events-none mix-blend-screen blur-[1px]"></div>
                    )}

                    {/* Biker body with speed-dependent bounce animation */}
                    <div className={`w-36 h-28 relative flex items-end justify-center pointer-events-none ${isMoving ? 'animate-bike-fast' : 'animate-bike-slow'}`}>

                        {/* Headlight beam (automatically turns on at night, mirrors facing direction) */}
                        {posX > 3500 && (
                            <div
                                className="absolute pointer-events-none z-10"
                                style={{
                                    bottom: '22px',
                                    [moveDirection === 'forward' ? 'left' : 'right']: '85px',
                                    transform: `scaleX(${moveDirection === 'forward' ? 1 : -1})`,
                                    transformOrigin: 'left center'
                                }}
                            >
                                <div
                                    className="w-48 h-20 bg-gradient-to-r from-yellow-300/65 via-yellow-300/15 to-transparent animate-pulse"
                                    style={{
                                        clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)',
                                        mixBlendMode: 'screen',
                                        animationDuration: '2s'
                                    }}
                                />
                            </div>
                        )}

                        {/* Motor Classic Caricature PNG (Uploaded or fallback) */}
                        <img
                            src={characterImage}
                            alt="Custom Biker Caricature"
                            className="w-full h-full object-contain pixel-art drop-shadow-2xl"
                            style={{
                                transform: `translateY(16px) ${moveDirection === 'backward' ? 'scaleX(-1)' : ''}`
                            }}
                            onError={(e) => {
                                e.target.src = '/images/themes/rpg-touring-default-character.png';
                            }}
                        />
                    </div>
                </div>

                {/* HUD Overlay: KM Indicator, Coins Gauge */}
                <div className="absolute top-4 left-4 right-4 z-30 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">

                    <div className="flex items-center gap-3 w-max">
                        {/* Biker HUD */}
                        <div className="bg-black/80 border-2 border-slate-700/80 px-3 py-2 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FFA500] text-black text-sm flex items-center justify-center font-bold font-sans">🏍️</div>
                            <div>
                                <div className="text-[9px] press-start text-slate-450 tracking-wider">LEVEL: SOULMATES</div>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                                    <span>MILEAGE:</span>
                                    <span className="text-[#FFA500] font-mono font-bold">{Math.round(posX / 10)} km / 500 km</span>
                                </div>
                            </div>
                        </div>

                        {/* COINS HUD */}
                        <div className="bg-black/80 border-2 border-slate-700/80 px-3 py-2 rounded-xl flex items-center gap-2">
                            <span className="text-sm">🪙</span>
                            <span className="text-xs font-mono font-bold text-[#FFD700]">{coinsCollected} / {totalCoins}</span>
                        </div>
                    </div>

                    {/* Checkpoint Banner Notification */}
                    {isCloseToCp && (
                        <div className="bg-[#FFA500] text-black border-2 border-black px-4 py-2 rounded-2xl flex items-center gap-2 animate-bounce cursor-pointer shadow-lg hover:brightness-110" onClick={handleAction}>
                            <span className="text-sm">🔔</span>
                            <span className="text-[10px] press-start font-bold uppercase tracking-wider">Buka Checkpoint: {activeCp.title}</span>
                        </div>
                    )}

                    {/* Mute button */}
                    <button
                        onClick={toggleMute}
                        className="bg-black/80 border-2 border-slate-700 hover:border-white w-10 h-10 rounded-full flex items-center justify-center text-xs self-end sm:self-auto shadow-md"
                    >
                        {isMuted ? '🔇' : '🎵'}
                    </button>
                </div>
            </div>

            {/* SCREEN 3: GAME PAD INTERFACE (Sticky bottom control) */}
            <div className="bg-[#131520] border-t-4 border-slate-800 p-4 flex flex-col md:flex-row justify-between items-center gap-4 z-30 shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">

                {/* Controller Instruction text - Clean & Minimal */}
                <div className="text-slate-300 vt-font text-center md:text-left text-lg max-w-sm hidden md:block">
                    Jelajahi perjalanan cinta kami dengan menekan tombol arah untuk menuju Checkpoint berikutnya.
                </div>

                {/* RPG Console D-PAD UI Controls */}
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Mundur (Backward) Button */}
                    <button
                        onMouseDown={startPressBackward}
                        onTouchStart={startPressBackward}
                        onMouseUp={endPressBackward}
                        onTouchEnd={endPressBackward}
                        onMouseLeave={endPressBackward}
                        className="w-16 h-16 bg-[#21253b] border-4 border-black hover:bg-[#2e3352] active:bg-[#ff4a4a] text-white rounded-xl shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-none flex flex-col items-center justify-center font-bold transition-all touch-none select-none"
                    >
                        <span className="text-xl">◀</span>
                        <span className="text-[8px] press-start mt-1">MUNDUR</span>
                    </button>

                    {/* Enter / Aksi Button */}
                    <button
                        onClick={handleAction}
                        className="w-20 h-20 bg-[#FFA500] hover:bg-[#ffb633] active:bg-yellow-600 border-4 border-black text-black rounded-full shadow-[0_4px_0_#995c00] active:translate-y-1 active:shadow-none flex flex-col items-center justify-center font-bold transition-all select-none"
                    >
                        <span className="text-sm press-start">ACTION</span>
                        <span className="text-[8px] press-start font-bold mt-1.5">(ENTER)</span>
                    </button>

                    {/* Maju (Forward) Button */}
                    <button
                        onMouseDown={startPressForward}
                        onTouchStart={startPressForward}
                        onMouseUp={endPressForward}
                        onTouchEnd={endPressForward}
                        onMouseLeave={endPressForward}
                        className="w-16 h-16 bg-[#21253b] border-4 border-black hover:bg-[#2e3352] active:bg-[#ff4a4a] text-white rounded-xl shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-none flex flex-col items-center justify-center font-bold transition-all touch-none select-none"
                    >
                        <span className="text-xl">▶</span>
                        <span className="text-[8px] press-start mt-1">MAJU</span>
                    </button>
                </div>
            </div>

            {/* SCREEN 4: INTERACTIVE RETRO RPG DIALOGUE BOX (MODAL) */}
            {dialogOpen && currentCheckpoint !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                    <div
                        className="w-full max-w-2xl bg-[#1c2035] border-4 border-[#FFA500] rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[85vh] transition-transform duration-300"
                        style={{ transform: 'perspective(1000px) rotateX(4deg) rotateY(1deg)' }}
                    >

                        {/* Dialogue header */}
                        <div className="bg-[#FFA500] px-6 py-3 border-b-4 border-black flex justify-between items-center text-black">
                            <span className="text-xs press-start font-extrabold flex items-center gap-2">
                                <span>{currentCheckpoint.icon}</span>
                                <span>CHECKPOINT: {currentCheckpoint.title.toUpperCase()}</span>
                            </span>
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="w-8 h-8 rounded-full border-2 border-black font-extrabold flex items-center justify-center bg-[#ff4a4a] hover:bg-red-600 text-white shadow-[0_2px_0_#000] active:translate-y-0.5 active:shadow-none transition-all"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Dialogue Content */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar text-slate-100 outfit-font font-sans">

                            {/* CHECKPOINT 1: SALAM PEMBUKA */}
                            {currentCheckpoint.id === 0 && (
                                <div className="space-y-4 text-center animate-in zoom-in-95 duration-200">
                                    <div className="text-3xl font-serif text-[#ffc65d] italic">Bismillah &amp; Salam Hormat</div>
                                    <div className="w-16 h-1 bg-[#FFA500] mx-auto rounded-full"></div>
                                    <p className="text-sm leading-relaxed text-slate-350 italic press-start text-[9px] my-3">
                                        "{content.salam_pembuka}"
                                    </p>
                                    <p className="text-base md:text-lg text-slate-200 leading-relaxed font-light">
                                        {content.teks_pembuka || 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang rekan-rekan untuk menghadiri syukuran kami.'}
                                    </p>
                                </div>
                            )}

                            {/* CHECKPOINT 2: PROFIL RIDERS */}
                            {currentCheckpoint.id === 1 && (
                                <div className="space-y-8 animate-in zoom-in-95 duration-200">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-[#ffc65d]">Riders Profile (Mempelai)</h3>
                                        <p className="text-xs text-slate-450 mt-1">Daftar Pengendara Utama Perjalanan Cinta Ini</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Rider 1 (Groom) */}
                                        <div className="bg-[#242944] border-2 border-slate-700/80 p-5 rounded-3xl relative overflow-hidden">
                                            {content.groom_photo && (
                                                <div className="w-24 h-24 rounded-full border-4 border-[#FFA500] overflow-hidden mx-auto mb-4">
                                                    <img src={`/storage/${content.groom_photo}`} className="w-full h-full object-cover" alt="Groom Photo" />
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <h4 className="text-xl font-extrabold text-white">{content.groom_name || 'Rider Pria'}</h4>
                                                <p className="text-[#FFA500] text-xs font-bold font-mono uppercase tracking-wider mt-1">CLASS: GROOM / DRIVER</p>
                                                <div className="h-0.5 bg-slate-700/50 my-3"></div>
                                                <p className="text-xs text-slate-350 italic">{content.groom_parents || 'Putra dari Bapak & Ibu'}</p>

                                                {content.groom_instagram && (
                                                    <a href={`https://instagram.com/${content.groom_instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 text-xs bg-[#E1306C] text-white px-4 py-1.5 rounded-full font-bold">
                                                        📸 instagram
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Rider 2 (Bride) */}
                                        <div className="bg-[#242944] border-2 border-slate-700/80 p-5 rounded-3xl relative overflow-hidden">
                                            {content.bride_photo && (
                                                <div className="w-24 h-24 rounded-full border-4 border-[#FFA500] overflow-hidden mx-auto mb-4">
                                                    <img src={`/storage/${content.bride_photo}`} className="w-full h-full object-cover" alt="Bride Photo" />
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <h4 className="text-xl font-extrabold text-white">{content.bride_name || 'Rider Wanita'}</h4>
                                                <p className="text-[#FFA500] text-xs font-bold font-mono uppercase tracking-wider mt-1">CLASS: BRIDE / NAVIGATOR</p>
                                                <div className="h-0.5 bg-slate-700/50 my-3"></div>
                                                <p className="text-xs text-slate-350 italic">{content.bride_parents || 'Putri dari Bapak & Ibu'}</p>

                                                {content.bride_instagram && (
                                                    <a href={`https://instagram.com/${content.bride_instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 text-xs bg-[#E1306C] text-white px-4 py-1.5 rounded-full font-bold">
                                                        📸 instagram
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CHECKPOINT 3: JADWAL TOURING */}
                            {currentCheckpoint.id === 2 && (
                                <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
                                    <div className="text-2xl font-bold text-[#ffc65d]">Kopdar Akbar &amp; Acara Utama</div>
                                    <div className="w-16 h-1 bg-[#FFA500] mx-auto rounded-full mb-4"></div>

                                    <div className="bg-[#242944] border-2 border-[#FFA500]/30 p-6 rounded-3xl max-w-md mx-auto space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-[#FFA500] uppercase tracking-wider block">📅 Tanggal Acara:</span>
                                            <span className="text-lg font-bold text-white">
                                                {content.event_date ? new Date(content.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanggal Acara'}
                                            </span>
                                            <span className="text-sm text-slate-350 block">
                                                Jam: {content.event_date ? new Date(content.event_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Waktu'} WIB
                                            </span>
                                        </div>

                                        <div className="h-0.5 bg-slate-700/50 my-3"></div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-[#FFA500] uppercase tracking-wider block">📍 Lokasi Kopdar:</span>
                                            <span className="text-base font-bold text-white block">{content.event_location || 'Nama Tempat'}</span>
                                            <p className="text-xs text-slate-350">{content.event_address || 'Alamat Lengkap'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                                        {content.event_lat && content.event_lng && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${content.event_lat},${content.event_lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-[#FFA500] hover:bg-[#ffb633] text-black font-extrabold px-6 py-3 rounded-full text-sm transition-all text-center flex items-center justify-center gap-2"
                                            >
                                                🗺️ Buka Google Maps
                                            </a>
                                        )}
                                        <a
                                            href={getCalendarUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-slate-700 hover:bg-slate-650 text-white font-bold px-6 py-3 rounded-full text-sm transition-all text-center flex items-center justify-center gap-2 border border-slate-600"
                                        >
                                            📅 Simpan Agenda
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* CHECKPOINT 4: DOKUMENTASI */}
                            {currentCheckpoint.id === 3 && (
                                <div className="space-y-6 animate-in zoom-in-95 duration-200">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-[#ffc65d]">Dokumentasi Perjalanan</h3>
                                        <p className="text-xs text-slate-450 mt-1">Galeri Foto Kebersamaan &amp; Pra-Nikah</p>
                                    </div>

                                    {gallery.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {gallery.map((img, idx) => (
                                                <div key={idx} className="bg-white p-3 shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300 rounded border border-slate-200">
                                                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 rounded-sm mb-3">
                                                        <img src={`/storage/${img}`} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                                    </div>
                                                    <div className="text-center font-sans font-bold text-xs text-slate-800 tracking-wider">
                                                        PHOTO #{idx + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-[#242944] p-8 rounded-3xl border-2 border-dashed border-slate-700 text-center">
                                            <span className="text-4xl block mb-2">📷</span>
                                            <p className="text-slate-400 font-bold">Belum ada foto dokumentasi di galeri.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CHECKPOINT 5: BENSIN & REST AREA */}
                            {currentCheckpoint.id === 4 && (
                                <div className="space-y-6 animate-in zoom-in-95 duration-200">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-[#ffc65d]">Rest Area &amp; Pengisian Kado</h3>
                                        <p className="text-xs text-slate-450 mt-1">Pemberian Amplop &amp; Kado Digital</p>
                                    </div>

                                    <div className="bg-[#242944] border-2 border-[#FFA500]/30 p-6 rounded-3xl max-w-md mx-auto space-y-4">
                                        {content.gift_bank_name && (
                                            <div className="space-y-2 p-4 bg-black/30 rounded-2xl border border-slate-700/50">
                                                <span className="text-[10px] font-bold text-[#FFA500] uppercase tracking-wider block">💳 Transfer Bank / Dompet:</span>
                                                <div className="flex justify-between items-center bg-[#1c2035] p-3 rounded-xl border border-slate-700">
                                                    <div>
                                                        <span className="text-xs text-slate-400 block font-bold">{content.gift_bank_name}</span>
                                                        <span className="text-base font-extrabold text-white font-mono">{content.gift_bank_account}</span>
                                                        <span className="text-xs text-slate-450 block mt-0.5">a.n {content.gift_bank_holder}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(content.gift_bank_account);
                                                            alert('Nomor rekening berhasil disalin!');
                                                        }}
                                                        className="bg-[#FFA500] text-black font-bold text-xs px-3 py-1.5 rounded-lg hover:brightness-110 active:scale-95 transition-all"
                                                    >
                                                        Copy
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {content.gift_address && (
                                            <div className="space-y-2 p-4 bg-black/30 rounded-2xl border border-slate-700/50">
                                                <span className="text-[10px] font-bold text-[#FFA500] uppercase tracking-wider block">📦 Alamat Pengiriman Kado:</span>
                                                <p className="text-xs text-slate-200 leading-relaxed font-sans">{content.gift_address}</p>
                                            </div>
                                        )}

                                        {!content.gift_bank_name && !content.gift_address && (
                                            <p className="text-center text-xs text-slate-400 font-bold">Terima kasih atas segala ucapan dan doa tulus Anda.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CHECKPOINT 6: FINISH & RSVP */}
                            {currentCheckpoint.id === 5 && (
                                <div className="space-y-6 animate-in zoom-in-95 duration-200">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-[#ffc65d]">🏁 Checkpoint Akhir: Konfirmasi Kehadiran</h3>
                                        <p className="text-xs text-slate-450 mt-1">Mengisi Buku Tamu &amp; Status Boncengan / Jumlah Kehadiran</p>
                                    </div>

                                    {rsvpSubmitted ? (
                                        <div className="bg-[#242944] border-2 border-emerald-500/30 p-6 rounded-3xl text-center space-y-3 max-w-md mx-auto">
                                            <span className="text-4xl block">🏆</span>
                                            <h4 className="text-lg font-bold text-emerald-400">RSVP Berhasil Terkirim!</h4>
                                            <p className="text-xs text-slate-350 leading-relaxed">
                                                Terima kasih atas konfirmasi Anda. Sampai jumpa di jalanan touring kopdar kami! Safe Ride &amp; Respect!
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={submitRsvp} className="space-y-4 max-w-md mx-auto font-sans">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-350 uppercase mb-1">Nama Lengkap Tamu</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    className="w-full bg-black/40 border-2 border-slate-700 rounded-xl p-3 text-white focus:border-[#FFA500] focus:ring-0 text-sm"
                                                    placeholder="Nama Anda"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-350 uppercase mb-1">Status Kehadiran</label>
                                                    <select
                                                        value={data.attendance}
                                                        onChange={e => setData('attendance', e.target.value)}
                                                        className="w-full bg-[#1c2035] border-2 border-slate-700 rounded-xl p-3 text-white focus:border-[#FFA500] focus:ring-0 text-sm"
                                                    >
                                                        <option value="hadir">Hadir 🏍️</option>
                                                        <option value="tidak_hadir">Absen ❌</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-350 uppercase mb-1">Jumlah Personel (Bensin)</label>
                                                    <select
                                                        value={data.additional_guests}
                                                        onChange={e => setData('additional_guests', parseInt(e.target.value))}
                                                        className="w-full bg-[#1c2035] border-2 border-slate-700 rounded-xl p-3 text-white focus:border-[#FFA500] focus:ring-0 text-sm"
                                                    >
                                                        <option value={1}>1 Motor (1 Orang)</option>
                                                        <option value={2}>1 Motor (2 Orang/Bonceng)</option>
                                                        <option value={3}>3 Orang</option>
                                                        <option value={4}>4 Orang</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-350 uppercase mb-1">Pesan &amp; Doa Restu</label>
                                                <textarea
                                                    rows="3"
                                                    value={data.message}
                                                    onChange={e => setData('message', e.target.value)}
                                                    className="w-full bg-black/40 border-2 border-slate-700 rounded-xl p-3 text-white focus:border-[#FFA500] focus:ring-0 text-sm"
                                                    placeholder="Tuliskan ucapan selamat atau doa restu Anda..."
                                                ></textarea>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full py-3 bg-[#FFA500] hover:bg-[#ffb633] text-black font-extrabold rounded-xl transition-all font-mono tracking-widest text-xs uppercase"
                                            >
                                                {processing ? 'MENGIRIM...' : '🏁 KUNCI KONFIRMASI'}
                                            </button>
                                        </form>
                                    )}

                                    {/* Text Penutup */}
                                    <p className="text-center text-xs italic text-slate-450 mt-6 max-w-sm mx-auto">
                                        "{content.teks_penutup || 'Merupakan kehormatan bagi kami apabila Anda berkenan hadir dalam touring sakral kami.'}"
                                    </p>
                                </div>
                            )}

                        </div>

                        {/* Dialogue footer navigation */}
                        <div className="bg-[#131525] border-t-4 border-black p-4 flex justify-between gap-4">
                            <span className="text-[10px] text-slate-500 tracking-wider font-mono uppercase self-center">
                                KEYBOARD: ESC - KELUAR
                            </span>
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="px-6 py-2 bg-[#ff4a4a] text-white border-2 border-black rounded-xl text-xs font-bold shadow-[0_2px_0_#000] active:translate-y-0.5 active:shadow-none font-mono"
                            >
                                KELUAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
