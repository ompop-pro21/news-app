import Link from 'next/link';

export default function NotFound() {
    return (
        <div
            style={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
            }}
        >
            <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                {/* Giant 404 */}
                <div
                    className="animate-shake"
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        fontSize: 'clamp(6rem, 20vw, 14rem)',
                        lineHeight: 0.85,
                        color: 'var(--black)',
                        letterSpacing: '-0.06em',
                        position: 'relative',
                        display: 'inline-block',
                    }}
                >
                    <span
                        style={{
                            position: 'absolute',
                            inset: 0,
                            color: 'var(--yellow)',
                            transform: 'translate(6px, 6px)',
                            zIndex: -1,
                            userSelect: 'none',
                            pointerEvents: 'none',
                        }}
                        aria-hidden
                    >
                        404
                    </span>
                    404
                </div>

                <div
                    style={{
                        border: '4px solid var(--black)',
                        boxShadow: '8px 8px 0 var(--black)',
                        background: 'var(--yellow)',
                        padding: '2rem 2.5rem',
                        marginTop: '2rem',
                    }}
                >
                    <h1
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontWeight: 800,
                            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                            letterSpacing: '-0.02em',
                            marginBottom: '0.75rem',
                        }}
                    >
                        DOCUMENT NOT FOUND
                    </h1>
                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontWeight: 500,
                            color: '#333',
                            lineHeight: 1.6,
                            marginBottom: '1.5rem',
                        }}
                    >
                        This document doesn&apos;t exist in the library — it may have been removed from Google Drive or the ID has changed.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/" className="brutal-btn brutal-btn-black">
                            ← BACK TO LIBRARY
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
