'use client';
import { useEffect } from 'react';

export default function ReadingProgress() {
    useEffect(() => {
        const bar = document.getElementById('reading-progress');
        if (!bar) return;

        function update() {
            const article = document.getElementById('article-body');
            if (!article) return;

            const { top, height } = article.getBoundingClientRect();
            const windowH = window.innerHeight;
            const total = height - windowH;
            const scrolled = -top;
            const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
            bar!.style.width = `${pct}%`;
        }

        window.addEventListener('scroll', update, { passive: true });
        update();
        return () => window.removeEventListener('scroll', update);
    }, []);

    return <div id="reading-progress" aria-hidden />;
}
