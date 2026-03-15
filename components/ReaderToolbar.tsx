'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    ZoomIn, ZoomOut, Moon, Sun, Maximize2, Minimize2,
    Copy, Printer, Type, BookOpen, Clock, Share2, Check
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Props {
    title: string;
    readingTime: number;
    wordCount: number;
}

// ── Highlight-to-share tooltip ─────────────────────────────────────────────
function HighlightShareTooltip() {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseUp = useCallback(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();
        if (!text || text.length < 5) { setTooltip(null); return; }

        const range = sel!.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setTooltip({
            x: rect.left + rect.width / 2 + window.scrollX,
            y: rect.top + window.scrollY - 52,
            text,
        });
        setCopied(false);
    }, []);

    const handleMouseDown = () => {
        setTooltip(null);
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [handleMouseUp]);

    const copyText = () => {
        if (!tooltip) return;
        navigator.clipboard.writeText(`"${tooltip.text}" — Om Manoj Pophale`);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setTooltip(null), 1500);
    };

    const shareText = () => {
        if (!tooltip) return;
        const tweet = `"${tooltip.text.slice(0, 200)}" — from Om Manoj Pophale's archive\n${window.location.href}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, '_blank');
    };

    if (!tooltip) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translateX(-50%)',
                zIndex: 9000,
                display: 'flex',
                gap: '2px',
                background: 'var(--black)',
                border: '2px solid var(--yellow)',
                boxShadow: '4px 4px 0 var(--yellow)',
                animation: 'slideUp 0.15s ease both',
            }}
        >
            <button
                onClick={copyText}
                title="Copy highlighted text"
                style={{
                    background: 'none', border: 'none', color: copied ? 'var(--green)' : 'var(--yellow)',
                    padding: '0.4rem 0.75rem', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    transition: 'color 0.2s ease',
                }}
            >
                {copied ? <><Check size={12} /> COPIED!</> : <><Copy size={12} /> COPY</>}
            </button>
            <div style={{ width: 1, background: '#333', margin: '0.25rem 0' }} />
            <button
                onClick={shareText}
                title="Share on X"
                style={{
                    background: 'none', border: 'none', color: 'var(--white)',
                    padding: '0.4rem 0.75rem', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}
            >
                <Share2 size={12} /> SHARE ON X
            </button>
        </div>
    );
}

// ── Reading Timer ──────────────────────────────────────────────────────────
function ReadingTimer({ expectedMinutes }: { expectedMinutes: number }) {
    const [seconds, setSeconds] = useState(0);
    const [active, setActive] = useState(true);

    useEffect(() => {
        if (!active) return;
        const id = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(id);
    }, [active]);

    // Pause when tab is hidden
    useEffect(() => {
        const onVis = () => setActive(!document.hidden);
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, []);

    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = (seconds % 60).toString().padStart(2, '0');
    const pct = Math.min(100, Math.round((seconds / (expectedMinutes * 60)) * 100));

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
            color: '#888', userSelect: 'none',
        }}>
            <Clock size={12} />
            <span>{mm}:{ss}</span>
            <div style={{ width: 40, height: 4, background: '#e5e5e5', border: '1px solid #ccc', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--green)' : 'var(--black)', transition: 'width 1s linear' }} />
            </div>
            <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{pct}%</span>
        </div>
    );
}

// ── Main Toolbar ───────────────────────────────────────────────────────────
export default function ReaderToolbar({ title, readingTime, wordCount }: Props) {
    const [fontSize, setFontSize] = useState(18); // px
    const [darkMode, setDarkMode] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    // Apply font size to article
    useEffect(() => {
        const article = document.getElementById('article-body');
        if (article) article.style.fontSize = `${fontSize}px`;
    }, [fontSize]);

    // Dark mode on article
    useEffect(() => {
        const article = document.getElementById('article-body');
        if (!article) return;
        article.style.background = darkMode ? '#1a1a1a' : 'var(--white)';
        article.style.color = darkMode ? '#e5e5e5' : 'var(--black)';
        // Prose vars
        const root = document.documentElement;
        root.style.setProperty('--reader-bg', darkMode ? '#1a1a1a' : '');
    }, [darkMode]);

    // Focus mode — hide navbar, sidebar, header
    useEffect(() => {
        const nav = document.querySelector('nav') as HTMLElement | null;
        const sidebar = document.querySelector('.reader-sidebar') as HTMLElement | null;
        const docHeader = document.querySelector('header') as HTMLElement | null;
        const footer = document.querySelector('footer') as HTMLElement | null;

        const els = [nav, sidebar, docHeader, footer];
        els.forEach(el => {
            if (!el) return;
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            el.style.opacity = focusMode ? '0' : '1';
            el.style.pointerEvents = focusMode ? 'none' : '';
        });
    }, [focusMode]);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const printDoc = () => window.print();

    const iconBtn = (
        onClick: () => void,
        icon: React.ReactNode,
        label: string,
        active?: boolean,
        highlight?: boolean,
    ) => (
        <button
            onClick={onClick}
            title={label}
            style={{
                background: active ? 'var(--black)' : highlight ? 'var(--yellow)' : 'transparent',
                color: active ? 'var(--white)' : active ? 'var(--yellow)' : 'var(--black)',
                border: '2px solid var(--black)',
                padding: '0.45rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s var(--ease-bounce)',
                boxShadow: active ? 'var(--shadow-sm)' : 'none',
            }}
            onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = '#f0f0f0';
            }}
            onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = 'transparent';
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
            {icon}
        </button>
    );

    return (
        <>
            {/* Highlight-to-share tooltip (absolute positioned) */}
            <HighlightShareTooltip />

            {/* Sticky toolbar strip */}
            <div
                style={{
                    position: 'sticky',
                    top: 64,
                    zIndex: 100,
                    background: focusMode ? 'rgba(250,247,240,0.92)' : 'var(--cream2)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '3px solid var(--black)',
                    padding: '0.5rem 0',
                    opacity: focusMode ? 0.3 : 1,
                    transition: 'opacity 0.4s ease',
                }}
                onMouseEnter={e => { if (focusMode) e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { if (focusMode) e.currentTarget.style.opacity = '0.3'; }}
            >
                <div
                    className="page-container"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                    }}
                >
                    {/* Left: reading timer & stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                            fontWeight: 700, color: '#888',
                        }}>
                            <BookOpen size={12} />
                            <span>{wordCount.toLocaleString()} words · {readingTime} min</span>
                        </div>
                        <ReadingTimer expectedMinutes={readingTime} />
                    </div>

                    {/* Right: control buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>

                        {/* Font size */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {iconBtn(() => setFontSize(f => Math.max(14, f - 1)), <ZoomOut size={15} />, 'Decrease font size')}
                            <div style={{
                                fontFamily: 'var(--font-mono)', fontWeight: 700,
                                fontSize: '0.65rem', color: '#666', minWidth: '2.2rem',
                                textAlign: 'center', border: '2px solid #ddd', padding: '0.4rem 0.25rem',
                            }}>
                                {fontSize}px
                            </div>
                            {iconBtn(() => setFontSize(f => Math.min(28, f + 1)), <ZoomIn size={15} />, 'Increase font size')}
                        </div>

                        <div style={{ width: 1, height: 24, background: '#ccc', margin: '0 0.25rem' }} />

                        {/* Dark Mode */}
                        {iconBtn(() => setDarkMode(d => !d), darkMode ? <Sun size={15} /> : <Moon size={15} />, darkMode ? 'Light mode' : 'Dark mode', darkMode)}

                        {/* Focus / Zen mode */}
                        {iconBtn(() => setFocusMode(f => !f), focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />, focusMode ? 'Exit Focus Mode' : 'Focus Mode (hides UI)', focusMode)}

                        <div style={{ width: 1, height: 24, background: '#ccc', margin: '0 0.25rem' }} />

                        {/* Copy link */}
                        {iconBtn(copyLink, linkCopied ? <Check size={15} /> : <Copy size={15} />, 'Copy link', false, linkCopied)}

                        {/* Print */}
                        {iconBtn(printDoc, <Printer size={15} />, 'Print / Save as PDF')}

                        {/* Font toggle: serif ↔ sans */}
                        <button
                            title="Toggle reading font"
                            onClick={() => {
                                const el = document.getElementById('article-body');
                                if (!el) return;
                                const isSerif = el.style.fontFamily.includes('Georgia');
                                el.style.fontFamily = isSerif
                                    ? 'var(--font-body)'
                                    : 'Georgia, "Times New Roman", serif';
                            }}
                            style={{
                                background: 'transparent', border: '2px solid var(--black)',
                                padding: '0.35rem 0.6rem', cursor: 'pointer', fontFamily: 'Georgia, serif',
                                fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)'; }}
                            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <Type size={13} /> Aa
                        </button>
                    </div>
                </div>
            </div>

            {/* Print styles */}
            <style>{`
                @media print {
                    nav, .reader-sidebar, header, #back-to-top,
                    [data-reader-toolbar], footer { display: none !important; }
                    #article-body { border: none !important; box-shadow: none !important; padding: 0 !important; }
                    body { background: white !important; }
                }
            `}</style>
        </>
    );
}
