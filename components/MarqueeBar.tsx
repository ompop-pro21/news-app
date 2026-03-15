const ITEMS = [
    '✦ MARKET RESEARCH',
    '★ STRATEGY JOURNALS',
    '✦ TECHNICAL REPORTS',
    '★ INDUSTRY ANALYSIS',
    '✦ CASE STUDIES',
    '★ THOUGHT LEADERSHIP',
    '✦ DATA INSIGHTS',
    '★ PROCESS OPTIMIZATION',
    '✦ SYSTEM ARCHITECTURE',
    '★ BUSINESS MECHANICS',
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
