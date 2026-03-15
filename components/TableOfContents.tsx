'use client';

import { useEffect, useState, useRef } from 'react';

interface Heading { id: string; text: string; level: number; }

export default function TableOfContents({ html }: { html: string }) {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState('');
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Parse headings from the actual rendered DOM (not from html string)
    useEffect(() => {
        const article = document.getElementById('article-body');
        if (!article) return;

        const els = article.querySelectorAll('h1, h2, h3');
        const parsed: Heading[] = [];

        els.forEach((el, i) => {
            const id = `heading-${i}`;
            el.id = id;
            parsed.push({
                id,
                text: el.textContent?.trim() || '',
                level: parseInt(el.tagName[1]),
            });
        });

        setHeadings(parsed);

        // Intersection observer to highlight active heading
        observerRef.current?.disconnect();
        observerRef.current = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
        );

        els.forEach(el => observerRef.current!.observe(el));

        return () => observerRef.current?.disconnect();
    }, [html]);

    if (headings.length < 2) return null;

    const scrollToHeading = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 130;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
                background: 'var(--black)', color: 'var(--yellow)',
                padding: '0.65rem 1rem',
                fontFamily: 'var(--font-mono)', fontWeight: 800,
                fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
                ╔══ TABLE OF CONTENTS
            </div>
            <div style={{
                border: '3px solid var(--black)',
                borderTop: 'none',
                background: 'var(--cream)',
                maxHeight: 280,
                overflowY: 'auto',
                padding: '0.75rem 0',
            }}>
                {headings.map(h => (
                    <button
                        key={h.id}
                        onClick={() => scrollToHeading(h.id)}
                        style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            background: activeId === h.id ? 'var(--yellow)' : 'transparent',
                            border: 'none',
                            borderLeft: activeId === h.id ? '4px solid var(--black)' : '4px solid transparent',
                            padding: `0.4rem ${0.75 + (h.level - 1) * 0.75}rem`,
                            fontFamily: h.level === 1 ? 'var(--font-body)' : 'var(--font-body)',
                            fontWeight: h.level === 1 ? 800 : h.level === 2 ? 700 : 500,
                            fontSize: h.level === 1 ? '0.8rem' : h.level === 2 ? '0.78rem' : '0.73rem',
                            color: activeId === h.id ? 'var(--black)' : '#444',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            lineHeight: 1.4,
                        }}
                        onMouseEnter={e => {
                            if (activeId !== h.id) e.currentTarget.style.background = '#f0f0f0';
                        }}
                        onMouseLeave={e => {
                            if (activeId !== h.id) e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {h.level > 1 && (
                            <span style={{ marginRight: '0.35rem', opacity: 0.35, fontSize: '0.6rem' }}>
                                {'—'.repeat(h.level - 1)}
                            </span>
                        )}
                        {h.text}
                    </button>
                ))}
            </div>
        </div>
    );
}
