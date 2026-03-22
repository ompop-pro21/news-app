'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    ZoomIn, ZoomOut, Moon, Sun, Maximize2, Minimize2,
    Copy, Printer, BookOpen, Clock, Share2, Check, Link2, Keyboard
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// HIGHLIGHT → SHARE TOOLTIP
// ─────────────────────────────────────────────────────────────
function HighlightShareTooltip({ title }: { title: string }) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hide = () => setTooltip(null);

    const handleMouseUp = useCallback(() => {
        setTimeout(() => {
            const sel = window.getSelection();
            const text = sel?.toString().trim() ?? '';
            if (text.length < 5) { hide(); return; }

            try {
                const range = sel!.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) { hide(); return; }
                setTooltip({
                    x: rect.left + rect.width / 2 + window.scrollX,
                    y: rect.top + window.scrollY - 58,
                    text,
                });
                setCopied(false);
            } catch { hide(); }
        }, 10);
    }, []);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseUp]);

    const copyText = async () => {
        if (!tooltip) return;
        const payload = `"${tooltip.text}"\n\n— Om Manoj Pophale\n${window.location.href}`;
        try {
            await navigator.clipboard.writeText(payload);
            setCopied(true);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(hide, 2000);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = payload;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            timerRef.current = setTimeout(hide, 2000);
        }
    };

    const shareOnX = () => {
        if (!tooltip) return;
        const tw = `"${tooltip.text.slice(0, 220)}"\n\n— Om Manoj Pophale\n${window.location.href}`;
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(tw)}`, '_blank', 'noopener,noreferrer');
    };

    if (!tooltip) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translateX(-50%)',
                zIndex: 9900,
                display: 'flex',
                background: '#0a0a0a',
                border: '2px solid var(--yellow)',
                boxShadow: '4px 4px 0 var(--yellow)',
                animation: 'slideUp 0.15s ease both',
                whiteSpace: 'nowrap',
            }}
            onMouseDown={e => e.preventDefault()}
        >
            <button
                onClick={copyText}
                style={tooltipBtnStyle(copied ? 'var(--green)' : 'var(--yellow)')}
            >
                {copied ? <><Check size={12} /> COPIED!</> : <><Copy size={12} /> COPY</>}
            </button>
            <div style={{ width: 1, background: '#333', margin: '4px 0' }} />
            <button onClick={shareOnX} style={tooltipBtnStyle('var(--white)')}>
                <Share2 size={12} /> SHARE ON X
            </button>
        </div>
    );
}

function tooltipBtnStyle(color: string): React.CSSProperties {
    return {
        background: 'none', border: 'none', color,
        padding: '0.4rem 0.8rem', cursor: 'pointer',
        fontFamily: 'var(--font-mono)', fontWeight: 700,
        fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em',
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        transition: 'opacity 0.15s ease',
    };
}

// ─────────────────────────────────────────────────────────────
// READING TIMER
// ─────────────────────────────────────────────────────────────
function ReadingTimer({ minutes }: { minutes: number }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            if (!document.hidden) setSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = (seconds % 60).toString().padStart(2, '0');
    const pct = Math.min(100, Math.round((seconds / (minutes * 60)) * 100));

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: '#888' }}>
            <Clock size={11} />
            <span style={{ letterSpacing: '0.05em' }}>{mm}:{ss}</span>
            <div title={`${pct}% of estimated read time`} style={{ width: 36, height: 4, background: '#ddd', border: '1.5px solid #bbb', borderRadius: 0, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--green)' : 'var(--black)', transition: 'width 1s linear, background 0.3s ease' }} />
            </div>
            <span style={{ fontSize: '0.58rem', opacity: 0.55 }}>{pct}%</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SCROLL PROGRESS HOOK
// ─────────────────────────────────────────────────────────────
function useScrollProgress(readingTime: number) {
    const [pctRead, setPctRead] = useState(0);

    useEffect(() => {
        function update() {
            const article = document.getElementById('article-body');
            if (!article) return;
            const { top, height } = article.getBoundingClientRect();
            const windowH = window.innerHeight;
            const total = height - windowH;
            const scrolled = -top;
            const pct = Math.min(100, Math.max(0, Math.round((scrolled / total) * 100)));
            setPctRead(pct);
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
        return () => window.removeEventListener('scroll', update);
    }, []);

    const minsLeft = Math.max(0, Math.ceil(readingTime * (1 - pctRead / 100)));
    return { pctRead, minsLeft };
}

// ─────────────────────────────────────────────────────────────
// MAIN TOOLBAR
// ─────────────────────────────────────────────────────────────
interface Props { title: string; readingTime: number; wordCount: number; }

export default function ReaderToolbar({ title, readingTime, wordCount }: Props) {
    const [fontSize, setFontSize] = useState(18);
    const [darkMode, setDarkMode] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const [isSerif, setIsSerif] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const { pctRead, minsLeft } = useScrollProgress(readingTime);

    // ── Font size via CSS variable ──────────────────────────
    useEffect(() => {
        const el = document.getElementById('article-body');
        if (el) el.style.setProperty('--reader-font-size', `${fontSize}px`);
    }, [fontSize]);

    // ── Dark mode via CSS class ─────────────────────────────
    useEffect(() => {
        const el = document.getElementById('article-body');
        if (!el) return;
        if (darkMode) {
            el.classList.add('dark-mode');
        } else {
            el.classList.remove('dark-mode');
        }
    }, [darkMode]);

    // ── Font family ─────────────────────────────────────────
    useEffect(() => {
        const el = document.getElementById('article-body');
        if (!el) return;
        el.style.fontFamily = isSerif
            ? 'Georgia, "Times New Roman", serif'
            : 'var(--font-body)';
    }, [isSerif]);

    // ── Focus mode ──────────────────────────────────────────
    useEffect(() => {
        const nav = document.querySelector('nav') as HTMLElement | null;
        const sidebar = document.querySelector('.reader-sidebar') as HTMLElement | null;
        const docHeader = document.querySelector('header') as HTMLElement | null;
        const footer = document.querySelector('footer') as HTMLElement | null;
        const breadcrumb = document.querySelector('[data-breadcrumb]') as HTMLElement | null;

        [nav, sidebar, docHeader, footer, breadcrumb].forEach(el => {
            if (!el) return;
            el.style.transition = 'opacity 0.4s ease, pointer-events 0s';
            el.style.opacity = focusMode ? '0' : '1';
            el.style.pointerEvents = focusMode ? 'none' : '';
        });
    }, [focusMode]);

    // ── Keyboard shortcuts ──────────────────────────────────
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            // Don't fire when typing in inputs
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            switch (e.key) {
                case '+':
                case '=':
                    e.preventDefault();
                    setFontSize(f => Math.min(28, f + 1));
                    break;
                case '-':
                case '_':
                    e.preventDefault();
                    setFontSize(f => Math.max(14, f - 1));
                    break;
                case 'd':
                case 'D':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        setDarkMode(d => !d);
                    }
                    break;
                case 'f':
                case 'F':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        setFocusMode(f => !f);
                    }
                    break;
                case 'Escape':
                    setFocusMode(false);
                    break;
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // ── Copy link ───────────────────────────────────────────
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = window.location.href;
            ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            document.execCommand('copy'); document.body.removeChild(ta);
        }
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const printDoc = () => window.print();

    // ─────────────────────────────────────────────────────────
    return (
        <>
            <HighlightShareTooltip title={title} />

            {/* ── Sticky toolbar ─────────────────────────────── */}
            <div
                data-reader-toolbar
                style={{
                    position: 'sticky',
                    top: 64,
                    zIndex: 200,
                    background: focusMode ? 'rgba(250,247,240,0.85)' : 'var(--cream2)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    borderBottom: '3px solid var(--black)',
                    padding: '0.45rem 0',
                    transition: 'opacity 0.4s ease',
                    opacity: focusMode ? 0.25 : 1,
                }}
                onMouseEnter={e => { if (focusMode) (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseLeave={e => { if (focusMode) (e.currentTarget as HTMLElement).style.opacity = '0.25'; }}
            >
                <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>

                    {/* Left — word count, timer, progress (hidden on mobile) */}
                    <div data-toolbar-left style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.63rem', fontWeight: 700, color: '#888' }}>
                            <BookOpen size={11} />
                            <span>{wordCount.toLocaleString()} words · ~{readingTime} min</span>
                        </div>
                        <ReadingTimer minutes={readingTime} />
                        {/* Scroll-based progress */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, color: '#888' }}>
                            <span>{pctRead}% read</span>
                            {minsLeft > 0 && <span style={{ opacity: 0.5 }}>· ~{minsLeft}m left</span>}
                        </div>
                    </div>

                    {/* Right controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>

                        {/* Font size */}
                        <TB onClick={() => setFontSize(f => Math.max(14, f - 1))} title="Decrease font size (-)"><ZoomOut size={14} /></TB>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.6rem', color: '#666', minWidth: '2rem', textAlign: 'center', border: '2px solid #ccc', padding: '0.35rem 0.2rem', letterSpacing: 0 }}>
                            {fontSize}
                        </div>
                        <TB onClick={() => setFontSize(f => Math.min(28, f + 1))} title="Increase font size (+)"><ZoomIn size={14} /></TB>

                        <Divider />

                        {/* Font family toggle */}
                        <TB onClick={() => setIsSerif(s => !s)} title={isSerif ? 'Switch to sans-serif' : 'Switch to serif'} active={isSerif}>
                            <span style={{ fontFamily: isSerif ? 'Georgia, serif' : 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700 }}>Aa</span>
                        </TB>

                        <Divider />

                        {/* Dark mode */}
                        <TB onClick={() => setDarkMode(d => !d)} title={darkMode ? 'Light mode (D)' : 'Dark mode (D)'} active={darkMode}>
                            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                        </TB>

                        {/* Focus / Zen mode */}
                        <TB onClick={() => setFocusMode(f => !f)} title={focusMode ? 'Exit focus (F / Esc)' : 'Focus mode (F)'} active={focusMode}>
                            {focusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </TB>

                        <Divider />

                        {/* Copy link */}
                        <TB onClick={copyLink} title="Copy link to this report" active={linkCopied}>
                            {linkCopied ? <Check size={14} /> : <Link2 size={14} />}
                        </TB>

                        {/* Print */}
                        <TB onClick={printDoc} title="Print / Save as PDF">
                            <Printer size={14} />
                        </TB>

                    </div>
                </div>
            </div>

            {/* ── Print styles + watermark ────────────────────── */}
            <style>{`
                @media print {
                    body::after {
                        content: 'Om Manoj Pophale — ommanojpophale.com';
                        position: fixed;
                        bottom: 40px;
                        right: 40px;
                        font-family: 'Space Grotesk', sans-serif;
                        font-size: 11pt;
                        font-weight: 700;
                        color: rgba(0, 0, 0, 0.10);
                        letter-spacing: 0.06em;
                        text-transform: uppercase;
                        pointer-events: none;
                        z-index: 9999;
                    }
                    body::before {
                        content: 'OM MANOJ POPHALE';
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-35deg);
                        font-family: 'Space Grotesk', sans-serif;
                        font-size: 52pt;
                        font-weight: 900;
                        color: rgba(0, 0, 0, 0.04);
                        pointer-events: none;
                        white-space: nowrap;
                        z-index: 9999;
                        letter-spacing: 0.1em;
                    }
                    nav,
                    [data-reader-toolbar],
                    [data-breadcrumb],
                    .reader-sidebar,
                    #back-to-top,
                    footer {
                        display: none !important;
                    }
                    #article-body {
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        max-width: 100% !important;
                        font-size: 12pt !important;
                        color: #000 !important;
                        background: #fff !important;
                    }
                    .reader-grid {
                        display: block !important;
                    }
                    header {
                        background: #fff !important;
                        border-bottom: 2px solid #000 !important;
                        padding: 1cm 0 0.5cm !important;
                    }
                    body { background: white !important; }
                    a { color: #000 !important; text-decoration: underline !important; }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </>
    );
}

// ── Small reusable button ────────────────────────────────────
function TB({
    onClick, title, children, active = false,
}: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    active?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                background: active ? 'var(--black)' : 'transparent',
                color: active ? 'var(--yellow)' : 'var(--black)',
                border: '2px solid var(--black)',
                padding: '0.38rem 0.45rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.12s var(--ease-bounce)',
                lineHeight: 1,
                minWidth: 32,
                minHeight: 32,
            }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = '#e8e8e8'; } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; } }}
            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.88)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div style={{ width: 1, height: 22, background: '#ccc', margin: '0 0.2rem' }} />;
}
