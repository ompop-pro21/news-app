'use client';
import { useEffect } from 'react';

export default function BackToTop() {
    useEffect(() => {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;

        function onScroll() {
            btn!.classList.toggle('visible', window.scrollY > 500);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <button
            id="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="brutal-btn brutal-btn-black"
            style={{ padding: '0.6rem 0.9rem', fontSize: '1rem' }}
            aria-label="Back to top"
        >
            ↑
        </button>
    );
}
