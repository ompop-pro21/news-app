'use client';
import Link from 'next/link';
import { useState } from 'react';
import MagneticButton from './MagneticButton';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav
            style={{
                borderBottom: '3px solid #0a0a0a',
                boxShadow: '0 3px 0 #0a0a0a',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: '#ffe135',
            }}
        >
            <div className="page-container flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <span
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            fontSize: '1.25rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: 'var(--black)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <span
                            style={{
                                display: 'inline-block',
                                background: 'var(--black)',
                                color: 'var(--yellow)',
                                padding: '0.1rem 0.45rem',
                                fontSize: '1rem',
                                fontWeight: 900,
                            }}
                        >
                            MY
                        </span>
                        REPORTS
                    </span>
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-2">
                    <MagneticButton as="link" href="/#documents" className="brutal-btn brutal-btn-black text-sm">
                        PUBLICATIONS
                    </MagneticButton>
                    <MagneticButton
                        as="link"
                        href="/contact"
                        className="brutal-btn text-sm"
                    >
                        CONTACT ↗
                    </MagneticButton>
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden"
                    aria-label="Toggle menu"
                    style={{
                        border: '2px solid var(--black)',
                        background: 'var(--black)',
                        color: 'var(--yellow)',
                        padding: '0.4rem 0.7rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'pointer',
                    }}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div
                    style={{
                        borderTop: '2px solid var(--black)',
                        background: 'var(--white)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}
                >
                    <Link href="/#documents" onClick={() => setMenuOpen(false)} className="brutal-btn brutal-btn-black" style={{ textDecoration: 'none' }}>
                        PUBLICATIONS
                    </Link>
                    <a
                        href="/contact"
                        className="brutal-btn"
                        style={{ textDecoration: 'none' }}
                    >
                        CONTACT ↗
                    </a>
                </div>
            )}
        </nav>
    );
}
