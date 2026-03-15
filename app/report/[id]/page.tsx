import { listDocFiles, downloadDocBuffer } from '@/lib/google-drive';
import { parseDocx } from '@/lib/mammoth-parser';
import { slugify } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Prose from '@/components/Prose';
import ReadingProgress from '@/components/ReadingProgress';
import BackToTop from '@/components/BackToTop';
import Link from 'next/link';
import TextToSpeech from '@/components/TextToSpeech';
import MagneticButton from '@/components/MagneticButton';
import ReaderToolbar from '@/components/ReaderToolbar';
import TableOfContents from '@/components/TableOfContents';

export const revalidate = 60; // ISR
export const dynamicParams = true; // allow new documents not built at deploy time to be rendered on demand

export async function generateStaticParams(): Promise<{ id: string }[]> {
    try {
        const files = await listDocFiles();
        if (files.length === 0) return [{ id: 'demo-placeholder' }];
        return files.map((f) => ({ id: f.id }));
    } catch {
        return [{ id: 'demo-placeholder' }];
    }
}

interface PageProps {
    params: Promise<{ id: string }>;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
}

export default async function ReportPage({ params }: PageProps) {
    const { id } = await params;

    let title = 'Document';
    let modifiedTime = new Date().toISOString();
    let html = '';

    try {
        const files = await listDocFiles();
        const file = files.find((f) => f.id === id);
        if (!file) notFound();

        title = file.name.replace(/\.docx$/i, '');
        modifiedTime = file.modifiedTime;

        const slug = slugify(file.name);
        const buffer = await downloadDocBuffer(id);
        const parsed = await parseDocx(buffer, slug);
        html = parsed.html;
    } catch {
        notFound();
    }

    const wordCount = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 220));

    return (
        <>
            <ReadingProgress />
            <BackToTop />

            {/* ── Breadcrumb ────────────────────────────────────────────── */}
            <div style={{ borderBottom: '3px solid var(--black)', background: 'var(--cream2)', padding: '0.75rem 0' }}>
                <div className="page-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        <Link href="/" style={{ textDecoration: 'none', color: 'var(--black)', opacity: 0.5 }}>
                            ← LIBRARY
                        </Link>
                        <span style={{ opacity: 0.3 }}>/</span>
                        <span style={{ opacity: 0.8, maxWidth: '480px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {title.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Document Header ───────────────────────────────────────── */}
            <header style={{ borderBottom: '5px solid var(--black)', background: 'var(--yellow)', padding: '3.5rem 0 3rem' }}>
                <div className="page-container">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <span className="brutal-tag">PUBLICATION</span>
                        <span className="brutal-tag" style={{ background: 'var(--black)', color: 'var(--yellow)' }}>
                            ⏱ {readingTime} MIN READ
                        </span>
                        <span className="brutal-tag brutal-tag-yellow" style={{ border: '2px solid var(--black)' }}>
                            {wordCount.toLocaleString()} WORDS
                        </span>
                        <span className="brutal-tag" style={{ background: 'var(--blue)', color: 'var(--white)' }}>
                            BY OM MANOJ POPHALE
                        </span>
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-body)', fontWeight: 800,
                        fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
                        letterSpacing: '-0.03em', lineHeight: 1.1,
                        color: 'var(--black)', maxWidth: '900px', marginBottom: '1.5rem',
                    }}>
                        {title}
                    </h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.2rem' }}>
                                LAST UPDATED
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>
                                {formatDate(modifiedTime)}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <MagneticButton as="link" href="/" className="brutal-btn brutal-btn-black" style={{ fontSize: '0.78rem' }}>
                                ← BACK TO LIBRARY
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Reader Toolbar (sticky, all features) ─────────────────── */}
            <ReaderToolbar title={title} readingTime={readingTime} wordCount={wordCount} />

            {/* ── Reader Body ───────────────────────────────────────────── */}
            <section style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
                <div className="page-container">
                    <div className="reader-grid">
                        {/* Article */}
                        <article
                            id="article-body"
                            style={{
                                border: '3px solid var(--black)',
                                boxShadow: 'var(--shadow-md)',
                                background: 'var(--white)',
                                padding: 'clamp(1.5rem, 4vw, 3rem)',
                                transition: 'background 0.3s ease, color 0.3s ease, font-size 0.2s ease',
                                position: 'relative',
                            }}
                        >
                            {html ? (
                                <>
                                    {/* Listen to report */}
                                    <TextToSpeech text={html} />
                                    {/* Full article */}
                                    <Prose html={html} />

                                    {/* End-of-article footer */}
                                    <div style={{
                                        marginTop: '3rem',
                                        paddingTop: '2rem',
                                        borderTop: '3px solid var(--black)',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                    }}>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#aaa', marginBottom: '0.3rem' }}>WRITTEN BY</div>
                                            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '1rem' }}>Om Manoj Pophale</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <MagneticButton as="link" href="/" className="brutal-btn brutal-btn-black" style={{ fontSize: '0.78rem' }}>
                                                ← ALL PUBLICATIONS
                                            </MagneticButton>
                                            <MagneticButton as="link" href="/contact" className="brutal-btn" style={{ fontSize: '0.78rem' }}>
                                                SEND FEEDBACK ↗
                                            </MagneticButton>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#888', fontFamily: 'var(--font-mono)' }}>
                                    NO CONTENT FOUND IN THIS DOCUMENT.
                                </div>
                            )}
                        </article>

                        {/* Sidebar */}
                        <aside className="reader-sidebar">
                            <div className="sidebar-header">╔══ DOCUMENT INFO</div>
                            <div style={{ padding: '1.25rem' }}>
                                <dl style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        { label: 'TITLE', value: title },
                                        { label: 'AUTHOR', value: 'Om Manoj Pophale' },
                                        { label: 'WORDS', value: wordCount.toLocaleString() },
                                        { label: 'READ TIME', value: `~${readingTime} minutes` },
                                        { label: 'UPDATED', value: formatDate(modifiedTime) },
                                    ].map(({ label, value }) => (
                                        <div key={label} style={{ borderBottom: '2px solid var(--cream2)', paddingBottom: '0.75rem' }}>
                                            <dt style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '0.3rem' }}>
                                                {label}
                                            </dt>
                                            <dd style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.4, color: 'var(--black)' }}>
                                                {value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>

                                {html && <TableOfContents html={html} />}

                                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <MagneticButton as="link" href="/" className="brutal-btn brutal-btn-black" style={{ width: '100%', justifyContent: 'center', fontSize: '0.72rem' }}>
                                        ← BACK TO LIBRARY
                                    </MagneticButton>
                                    <MagneticButton as="link" href="/contact" className="brutal-btn" style={{ width: '100%', justifyContent: 'center', fontSize: '0.72rem' }}>
                                        CONTACT / FEEDBACK
                                    </MagneticButton>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
