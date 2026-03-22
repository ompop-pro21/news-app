'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, SkipForward, Gauge } from 'lucide-react';

// ─── Split text into sentence-boundary chunks ────────────────
function chunkText(text: string, maxLen = 2500): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
        if ((current + sentence).length > maxLen && current.length > 0) {
            chunks.push(current.trim());
            current = sentence;
        } else {
            current += sentence;
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
}

// ─── Pick the best voice of a given gender ───────────────────
function categorizeVoices(voices: SpeechSynthesisVoice[]) {
    const english = voices.filter(v => v.lang.startsWith('en'));

    // Heuristic: female voice names typically contain these
    const femaleHints = ['female', 'zira', 'samantha', 'karen', 'fiona', 'moira', 'tessa', 'victoria', 'susan', 'hazel', 'kate', 'google uk english female'];
    const maleHints = ['male', 'david', 'daniel', 'james', 'george', 'mark', 'fred', 'alex', 'tom', 'google uk english male'];

    const isFemale = (v: SpeechSynthesisVoice) =>
        femaleHints.some(h => v.name.toLowerCase().includes(h));
    const isMale = (v: SpeechSynthesisVoice) =>
        maleHints.some(h => v.name.toLowerCase().includes(h));

    const female = english.filter(isFemale);
    const male = english.filter(isMale);
    // Voices that are unclassifiable go into "other"
    const other = english.filter(v => !isFemale(v) && !isMale(v));

    return { female, male, other, all: english };
}

function pickVoice(voices: SpeechSynthesisVoice[], gender: 'female' | 'male' | 'auto'): SpeechSynthesisVoice | null {
    const { female, male, all } = categorizeVoices(voices);

    // Prefer natural/neural voices
    const naturalKeywords = ['natural', 'neural', 'enhanced', 'premium', 'google'];
    const findNatural = (list: SpeechSynthesisVoice[]) => {
        for (const kw of naturalKeywords) {
            const match = list.find(v => v.name.toLowerCase().includes(kw));
            if (match) return match;
        }
        return list[0] || null;
    };

    if (gender === 'female') return findNatural(female) || findNatural(all);
    if (gender === 'male') return findNatural(male) || findNatural(all);
    return findNatural(all) || voices[0] || null;
}

const SPEED_OPTIONS = [
    { label: '0.5×', value: 0.5 },
    { label: '0.75×', value: 0.75 },
    { label: '1×', value: 1.0 },
    { label: '1.25×', value: 1.25 },
    { label: '1.5×', value: 1.5 },
    { label: '2×', value: 2.0 },
];

export default function TextToSpeech({ text }: { text: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [supported, setSupported] = useState(false);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [speed, setSpeed] = useState(1.0);
    const [gender, setGender] = useState<'auto' | 'female' | 'male'>('auto');
    const [showControls, setShowControls] = useState(false);

    const chunksRef = useRef<string[]>([]);
    const currentIndexRef = useRef(0);
    const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isCancelledRef = useRef(false);
    const isPausedRef = useRef(false);
    const speedRef = useRef(1.0);
    const genderRef = useRef<'auto' | 'female' | 'male'>('auto');

    // Keep refs in sync with state
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    useEffect(() => { speedRef.current = speed; }, [speed]);
    useEffect(() => { genderRef.current = gender; }, [gender]);

    useEffect(() => {
        setSupported(typeof window !== 'undefined' && !!window.speechSynthesis);
        return () => { stopAll(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stopAll = useCallback(() => {
        isCancelledRef.current = true;
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (keepAliveRef.current) {
            clearInterval(keepAliveRef.current);
            keepAliveRef.current = null;
        }
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentChunk(0);
    }, []);

    const speakChunk = useCallback((chunks: string[], index: number) => {
        if (isCancelledRef.current || index >= chunks.length) {
            stopAll();
            return;
        }

        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(chunks[index]);

        const voices = synth.getVoices();
        const voice = pickVoice(voices, genderRef.current);
        if (voice) utterance.voice = voice;
        utterance.rate = speedRef.current;
        utterance.pitch = 1.0;

        currentIndexRef.current = index;
        setCurrentChunk(index + 1);

        utterance.onend = () => {
            if (!isCancelledRef.current) {
                speakChunk(chunks, index + 1);
            }
        };

        utterance.onerror = (e) => {
            if (e.error === 'interrupted' || e.error === 'canceled') return;
            if (!isCancelledRef.current) {
                speakChunk(chunks, index + 1);
            }
        };

        synth.speak(utterance);
    }, [stopAll]);

    const startSpeaking = useCallback(() => {
        if (!window.speechSynthesis) return;

        const synth = window.speechSynthesis;
        synth.cancel();

        const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!plainText) return;

        const chunks = chunkText(plainText);
        chunksRef.current = chunks;
        setTotalChunks(chunks.length);
        isCancelledRef.current = false;
        isPausedRef.current = false;
        setIsPlaying(true);
        setIsPaused(false);

        // Chrome keepalive — ONLY fires when NOT paused by user
        if (keepAliveRef.current) clearInterval(keepAliveRef.current);
        keepAliveRef.current = setInterval(() => {
            if (!isPausedRef.current && synth.speaking && !synth.paused) {
                synth.pause();
                synth.resume();
            }
        }, 10000);

        const trySpeak = () => speakChunk(chunks, 0);

        if (synth.getVoices().length > 0) {
            trySpeak();
        } else {
            synth.onvoiceschanged = () => {
                synth.onvoiceschanged = null;
                trySpeak();
            };
        }
    }, [text, speakChunk]);

    const togglePause = () => {
        if (!window.speechSynthesis) return;
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        } else {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const skipForward = () => {
        if (!window.speechSynthesis) return;
        const nextIdx = currentIndexRef.current + 1;
        if (nextIdx < chunksRef.current.length) {
            window.speechSynthesis.cancel();
            isCancelledRef.current = false;
            speakChunk(chunksRef.current, nextIdx);
        }
    };

    const handleMainButton = () => {
        if (!supported) return;
        if (isPlaying) {
            togglePause();
        } else {
            startSpeaking();
        }
    };

    // Restart with new voice when gender changes mid-play
    const changeGender = (g: 'auto' | 'female' | 'male') => {
        setGender(g);
        if (isPlaying) {
            const idx = currentIndexRef.current;
            window.speechSynthesis.cancel();
            isCancelledRef.current = false;
            // Small delay to let the new genderRef update
            setTimeout(() => speakChunk(chunksRef.current, idx), 50);
        }
    };

    // Restart with new speed when speed changes mid-play
    const changeSpeed = (s: number) => {
        setSpeed(s);
        if (isPlaying) {
            const idx = currentIndexRef.current;
            window.speechSynthesis.cancel();
            isCancelledRef.current = false;
            setTimeout(() => speakChunk(chunksRef.current, idx), 50);
        }
    };

    if (!supported) return null;

    const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em' };
    const chipStyle = (active: boolean): React.CSSProperties => ({
        ...mono,
        background: active ? 'var(--black)' : 'transparent',
        color: active ? 'var(--yellow)' : 'var(--black)',
        border: '2px solid var(--black)',
        padding: '0.25rem 0.5rem',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        fontSize: '0.6rem',
    });

    return (
        <div
            data-tts-section
            style={{
                border: '3px solid var(--black)',
                background: isPlaying ? 'var(--yellow)' : 'var(--white)',
                padding: '1rem',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '2rem',
                transition: 'background 0.3s ease',
            }}
        >
            {/* Top row: icon + label + buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                        style={{
                            background: 'var(--black)',
                            color: 'var(--white)',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isPlaying && !isPaused ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </div>
                    <div>
                        <div style={{ ...mono, fontSize: '0.75rem' }}>
                            🎙 Listen to this Report
                        </div>
                        <div style={{ ...mono, fontSize: '0.6rem', color: '#555', fontWeight: 600 }}>
                            {isPlaying && !isPaused
                                ? `▶ Playing section ${currentChunk}/${totalChunks} · ${speed}×`
                                : isPaused
                                    ? `⏸ Paused (${currentChunk}/${totalChunks})`
                                    : 'Text-to-Speech · Natural Voice'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleMainButton}
                        style={{
                            background: 'var(--black)',
                            color: 'var(--white)',
                            border: 'none',
                            padding: '0.5rem 1.1rem',
                            ...mono,
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'transform 0.12s ease, background 0.12s ease',
                            minHeight: 36,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--black)')}
                        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        {isPlaying && !isPaused ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
                    </button>

                    {isPlaying && (
                        <>
                            <button
                                onClick={skipForward}
                                title="Skip to next section"
                                style={{
                                    background: 'var(--blue)',
                                    color: 'var(--white)',
                                    border: 'none',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'transform 0.12s ease',
                                    minHeight: 36, minWidth: 36,
                                }}
                                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                <SkipForward size={14} fill="currentColor" />
                            </button>
                            <button
                                onClick={stopAll}
                                title="Stop"
                                style={{
                                    background: 'var(--red)',
                                    color: 'var(--white)',
                                    border: 'none',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'transform 0.12s ease',
                                    minHeight: 36, minWidth: 36,
                                }}
                                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                <Square size={14} fill="currentColor" />
                            </button>
                        </>
                    )}

                    {/* Settings toggle */}
                    <button
                        onClick={() => setShowControls(c => !c)}
                        title="Audio settings"
                        style={{
                            background: showControls ? 'var(--black)' : 'transparent',
                            color: showControls ? 'var(--yellow)' : 'var(--black)',
                            border: '2px solid var(--black)',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.12s ease',
                            minHeight: 36, minWidth: 36,
                        }}
                    >
                        <Gauge size={14} />
                    </button>
                </div>
            </div>

            {/* Expanded controls: speed + voice */}
            {showControls && (
                <div style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '2px solid var(--black)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    alignItems: 'center',
                }}>
                    {/* Speed */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ ...mono, fontSize: '0.6rem', opacity: 0.6, marginRight: '0.25rem' }}>SPEED</span>
                        {SPEED_OPTIONS.map(s => (
                            <button
                                key={s.value}
                                onClick={() => changeSpeed(s.value)}
                                style={chipStyle(speed === s.value)}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Voice gender */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ ...mono, fontSize: '0.6rem', opacity: 0.6, marginRight: '0.25rem' }}>VOICE</span>
                        {(['auto', 'female', 'male'] as const).map(g => (
                            <button
                                key={g}
                                onClick={() => changeGender(g)}
                                style={chipStyle(gender === g)}
                            >
                                {g === 'auto' ? '🔄 Auto' : g === 'female' ? '♀ Female' : '♂ Male'}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
