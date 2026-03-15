const ITEMS = [
    '✦ SERVERLESS PUBLISHING',
    '★ GOOGLE DRIVE AS CMS',
    '✦ NEXT.JS STATIC EXPORT',
    '★ O(1) SERVE TIME',
    '✦ MAMMOTH.JS PARSING',
    '★ FIREBASE EDGE CDN',
    '✦ ZERO MAINTENANCE',
    '★ NEO-BRUTALIST DESIGN',
    '✦ AUTO CI/CD PIPELINE',
    '★ INSTANT SEARCH',
];

export default function MarqueeBar() {
    const doubled = [...ITEMS, ...ITEMS];

    return (
        <div
            style={{
                borderBottom: '3px solid var(--black)',
                borderTop: '3px solid var(--black)',
                background: 'var(--black)',
                color: 'var(--yellow)',
                overflow: 'hidden',
                padding: '0.65rem 0',
            }}
            aria-hidden
        >
            <div className="marquee-track">
                {doubled.map((item, i) => (
                    <span
                        key={i}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            paddingRight: '3rem',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
