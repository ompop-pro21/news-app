'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';

export default function TextToSpeech({ text }: { text: string }) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        setSupported(typeof window !== 'undefined' && !!window.speechSynthesis);
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const speak = () => {
        if (!window.speechSynthesis) return;

        // Cancel any prior speech first to avoid onerror 'interrupted'
        window.speechSynthesis.cancel();

        const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!plainText) return;

        const utterance = new SpeechSynthesisUtterance(plainText);

        // Pick the best English voice available
        const trySpeak = () => {
            const voices = window.speechSynthesis.getVoices();
            const voice =
                voices.find(v => v.lang === 'en-GB') ||
                voices.find(v => v.lang === 'en-US') ||
                voices.find(v => v.lang.startsWith('en')) ||
                voices[0];
            if (voice) utterance.voice = voice;
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        };

        utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
        utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
        utterance.onpause = () => { setIsPaused(true); };
        utterance.onresume = () => { setIsPaused(false); };
        utterance.onerror = (e) => {
            // 'interrupted' fires whenever we call cancel() — silently ignore it
            if (e.error === 'interrupted') return;
            setIsSpeaking(false);
            setIsPaused(false);
        };

        // getVoices() may not be populated immediately
        if (window.speechSynthesis.getVoices().length > 0) {
            trySpeak();
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.onvoiceschanged = null;
                trySpeak();
            };
        }
    };

    const toggleSpeech = () => {
        if (!supported) return;
        if (isSpeaking) {
            if (isPaused) {
                window.speechSynthesis.resume();
            } else {
                window.speechSynthesis.pause();
            }
        } else {
            speak();
        }
    };

    const stopSpeech = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    if (!supported) return null;

    return (
        <div
            style={{
                border: '3px solid var(--black)',
                background: isSpeaking ? 'var(--yellow)' : 'var(--white)',
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
                    {isSpeaking && !isPaused ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </div>
                <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🎙 Listen to this Report
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#555' }}>
                        {isSpeaking && !isPaused ? '▶ Playing…' : isPaused ? '⏸ Paused' : 'Browser Text-to-Speech'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={toggleSpeech}
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
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#333')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--black)')}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {isSpeaking && !isPaused ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
                </button>

                {isSpeaking && (
                    <button
                        onClick={stopSpeech}
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
                        }}
                        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                        title="Stop"
                    >
                        <Square size={14} fill="currentColor" />
                    </button>
                )}
            </div>
        </div>
    );
}
