'use client';
import { useState, useEffect, useRef } from 'react';

interface SearchEntry {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    modifiedTime: string;
}

export default function SearchClient() {
    const [query, setQuery] = useState('');
    const [entries, setEntries] = useState<SearchEntry[]>([]);
    const [results, setResults] = useState<SearchEntry[]>([]);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fetch the static search index once on mount
    useEffect(() => {
        fetch('/search-index.json')
            .then((r) => r.json())
            .then((data: SearchEntry[]) => setEntries(data))
            .catch(() => {/* no index yet — silently skip */ });
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Simple fuzzy filter (no lunr dependency needed for small sets)
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setOpen(false);
            return;
        }
        const lower = query.toLowerCase();
        const filtered = entries.filter(
            (e) =>
                e.title.toLowerCase().includes(lower) ||
                e.excerpt.toLowerCase().includes(lower)
        );
        setResults(filtered.slice(0, 6));
        setOpen(true);
    }, [query, entries]);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: '520px' }}>
            <div style={{ display: 'flex', gap: '0' }}>
                <input
                    type="search"
                    placeholder="SEARCH DOCUMENTS..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="brutal-input"
                    style={{ flex: 1, borderRight: 'none' }}
                    aria-label="Search documents"
                    id="doc-search"
                />
                <button
                    className="brutal-btn brutal-btn-black"
                    style={{ borderLeft: 'none', boxShadow: 'none' }}
                    aria-label="Submit search"
                >
                    ⌕
                </button>
            </div>

            {/* Results dropdown */}
            {open && results.length > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--white)',
                        border: '3px solid var(--black)',
                        boxShadow: 'var(--shadow-md)',
                        zIndex: 100,
                    }}
                >
                    {results.map((r) => (
                        <a
                            key={r.id}
                            href={`/report/${r.id}/`}
                            style={{
                                display: 'block',
                                padding: '0.75rem 1rem',
                                borderBottom: '2px solid var(--black)',
                                textDecoration: 'none',
                                color: 'var(--black)',
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLElement).style.background = 'var(--yellow)')
                            }
                            onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLElement).style.background = 'transparent')
                            }
                            onClick={() => setOpen(false)}
                        >
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                                {r.title}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#666' }}>
                                {r.excerpt.slice(0, 90)}…
                            </div>
                        </a>
                    ))}
                    {results.length === 0 && (
                        <div style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            NO RESULTS FOUND
                        </div>
                    )}
                </div>
            )}

            {open && results.length === 0 && query.length > 1 && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--white)',
                        border: '3px solid var(--black)',
                        boxShadow: 'var(--shadow-md)',
                        padding: '0.75rem 1rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        zIndex: 100,
                    }}
                >
                    NO RESULTS FOR &quot;{query.toUpperCase()}&quot;
                </div>
            )}
        </div>
    );
}
