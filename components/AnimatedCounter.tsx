'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
    end: number | string;
    duration?: number;
    suffix?: string;
    prefix?: string;
}

export default function AnimatedCounter({ end, duration = 1500, suffix = '', prefix = '' }: Props) {
    const [value, setValue] = useState('0');
    const ref = useRef<HTMLSpanElement>(null);
    const animated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !animated.current) {
                    animated.current = true;
                    const numEnd = typeof end === 'number' ? end : parseInt(end);
                    
                    if (isNaN(numEnd)) {
                        // Non-numeric value like "∞" — just set it directly with a small delay
                        setTimeout(() => setValue(String(end)), 200);
                        return;
                    }

                    const startTime = performance.now();
                    const animate = (now: number) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease-out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.round(eased * numEnd);
                        setValue(String(current));
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [end, duration]);

    return (
        <span ref={ref} style={{ display: 'inline' }}>
            {prefix}{value}{suffix}
        </span>
    );
}
