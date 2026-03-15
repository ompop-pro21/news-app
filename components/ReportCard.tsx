import Link from 'next/link';

interface ReportCardProps {
    id: string;
    title: string;
    slug: string;
    modifiedTime: string;
    excerpt: string;
    index: number;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function ReportCard({
    id,
    title,
    slug,
    modifiedTime,
    excerpt,
    index,
}: ReportCardProps) {
    const colors = ['#ffe135', '#ff3c38', '#0033ff', '#00c853', '#ff6b35', '#c800ff'];
    const accentColor = colors[index % colors.length];

    return (
        <article
            className="brutal-card"
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderLeftWidth: '6px',
                borderLeftColor: accentColor,
            }}
        >
            {/* Accent bar */}
            <div
                style={{
                    background: accentColor,
                    borderBottom: '3px solid var(--black)',
                    padding: '0.4rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                }}
            >
                <span className="brutal-tag" style={{ background: 'var(--black)', color: accentColor }}>
                    #{String(index + 1).padStart(2, '0')}
                </span>
                <span
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--black)',
                    }}
                >
                    {formatDate(modifiedTime)}
                </span>
            </div>

            {/* Content */}
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h2
                    style={{
                        fontFamily: 'var(--font-body)',
                        fontWeight: 800,
                        fontSize: '1.125rem',
                        lineHeight: 1.3,
                        letterSpacing: '-0.01em',
                        margin: 0,
                    }}
                >
                    {title}
                </h2>

                <p
                    style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        color: '#444',
                        lineHeight: 1.6,
                        flex: 1,
                        margin: 0,
                    }}
                >
                    {excerpt || 'No preview available.'}
                </p>

                <Link
                    href={`/report/${id}/`}
                    className="brutal-btn"
                    style={{ background: accentColor, alignSelf: 'flex-start', fontSize: '0.8rem' }}
                    aria-label={`Read ${title}`}
                >
                    READ →
                </Link>
            </div>
        </article>
    );
}
