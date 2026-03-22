'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, SkipForward } from 'lucide-react';

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

// ─── Pick the best natural-sounding voice ────────────────────
function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    // Prefer high-quality / natural voices (Google, Microsoft Neural, Apple)
    const naturalKeywords = ['natural', 'neural', 'enhanced', 'premium', 'google'];
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));

    // 1. Try to find a natural/neural voice
    for (const keyword of naturalKeywords) {
        const match = englishVoices.find(v => v.name.toLowerCase().includes(keyword));
        if (match) return match;
    }

    // 2. Prefer Google UK English Female or similar well-known voices
    const preferred = [
        'Google UK English Female',
        'Google US English',
        'Microsoft Zira',
        'Samantha',
        'Karen',
        'Daniel',
    ];
    for (const name of preferred) {
        const match = englishVoices.find(v => v.name.includes(name));
        if (match) return match;
    }

    // 3. Fallback to any English voice, preferring en-GB
    return englishVoices.find(v => v.lang === 'en-GB')
        || englishVoices.find(v => v.lang === 'en-US')
        || englishVoices[0]
        || voices[0]
        || null;
}

export default function TextToSpeech({ text }: { text: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [supported, setSupported] = useState(false);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);

    const chunksRef = useRef<string[]>([]);
    const currentIndexRef = useRef(0);
    const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isCancelledRef = useRef(false);

    useEffect(() => {
        setSupported(typeof window !== 'undefined' && !!window.speechSynthesis);
        return () => {
            stopAll();
        };
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
            // Finished all chunks
            stopAll();
            return;
        }

        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(chunks[index]);

        // Pick the best voice
        const voices = synth.getVoices();
        const voice = pickBestVoice(voices);
        if (voice) utterance.voice = voice;
        utterance.rate = 0.95;
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
            // Try next chunk on error
            if (!isCancelledRef.current) {
                speakChunk(chunks, index + 1);
            }
        };

        synth.speak(utterance);
    }, [stopAll]);

    const startSpeaking = useCallback(() => {
        if (!window.speechSynthesis) return;

        const synth = window.speechSynthesis;
        synth.cancel(); // Clear any prior

        const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!plainText) return;

        const chunks = chunkText(plainText);
        chunksRef.current = chunks;
        setTotalChunks(chunks.length);
        isCancelledRef.current = false;
        setIsPlaying(true);
        setIsPaused(false);

        // Chrome bug workaround: periodically call resume() to prevent auto-pause
        if (keepAliveRef.current) clearInterval(keepAliveRef.current);
        keepAliveRef.current = setInterval(() => {
            if (synth.speaking && !synth.paused) {
                synth.pause();
                synth.resume();
            }
        }, 10000);

        const trySpeak = () => {
            speakChunk(chunks, 0);
        };

        // Voices may not be loaded yet
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

    if (!supported) return null;

    return (
        <div
            style={{
                border: '3px solid var(--black)',
                background: isPlaying ? 'var(--yellow)' : 'var(--white)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '2rem',
                transition: 'background 0.3s ease',
            }}
        >
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
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🎙 Listen to this Report
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#555' }}>
                        {isPlaying && !isPaused
                            ? `▶ Playing section ${currentChunk}/${totalChunks}…`
                            : isPaused
                                ? `⏸ Paused (${currentChunk}/${totalChunks})`
                                : 'Browser Text-to-Speech (Natural Voice)'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={handleMainButton}
                    style={{
                        background: 'var(--black)',
                        color: 'var(--white)',
                        border: 'none',
                        padding: '0.5rem 1.1rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
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
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.12s ease',
                                minHeight: 36,
                                minWidth: 36,
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
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.12s ease',
                                minHeight: 36,
                                minWidth: 36,
                            }}
                            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <Square size={14} fill="currentColor" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
