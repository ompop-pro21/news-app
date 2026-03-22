'use client';

import { useEffect, useState } from 'react';

export default function LiveClock() {
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        function tick() {
            const now = new Date();
            setTime(
                now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                })
            );
            setDate(
                now.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })
            );
        }
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    if (!time) return null;

    return (
        <div
            style={{
                border: '3px solid var(--black)',
                background: 'var(--black)',
                color: 'var(--yellow)',
                padding: '0.75rem 1.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
                fontFamily: 'var(--font-mono)',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {time}
                </span>
                <span
                    style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        opacity: 0.6,
                    }}
                >
                    {date}
                </span>
            </div>
            <div
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    animation: 'blink 1.1s step-end infinite',
                    flexShrink: 0,
                }}
                title="Live"
            />
        </div>
    );
}
