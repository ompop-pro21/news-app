import { listDocFiles } from '@/lib/google-drive';
import { slugify, excerptFromHtml, writeSearchIndex } from '@/lib/utils';
import { parseDocx, ParseResult } from '@/lib/mammoth-parser';
import { downloadDocBuffer } from '@/lib/google-drive';
import ReportCard from '@/components/ReportCard';
import SearchClient from '@/components/SearchClient';
import ScrollReveal from '@/components/ScrollReveal';
import MarqueeBar from '@/components/MarqueeBar';
import MagneticButton from '@/components/MagneticButton';
import AnimatedCounter from '@/components/AnimatedCounter';
import LiveClock from '@/components/LiveClock';
import { Search, TrendingUp, BarChart3, FileText } from 'lucide-react';

export const dynamic = 'force-static';

interface DocMeta {
  id: string;
  title: string;
  slug: string;
  modifiedTime: string;
  excerpt: string;
}

async function getAllDocs(): Promise<DocMeta[]> {
  try {
    const files = await listDocFiles();
    const docs: DocMeta[] = [];

    for (const file of files) {
      try {
        const slug = slugify(file.name);
        const buffer = await downloadDocBuffer(file.id);
        const parsed: ParseResult = await parseDocx(buffer, slug);
        const excerpt = excerptFromHtml(parsed.html, 180);
        const title = file.name.replace(/\.docx$/i, '');
        docs.push({ id: file.id, title, slug, modifiedTime: file.modifiedTime, excerpt });
      } catch {
        // Skip files that fail to parse
      }
    }

    writeSearchIndex(docs);
    return docs;
  } catch {
    // Return empty array when Drive credentials are not configured
    return [];
  }
}

export default async function HomePage() {
  const docs = await getAllDocs();
  const hasCredentials =
    !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    !!process.env.GOOGLE_PRIVATE_KEY &&
    !!process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Compute dynamic stats from real data
  const latestYear = docs.length > 0
    ? new Date(docs.reduce((a, b) => a.modifiedTime > b.modifiedTime ? a : b).modifiedTime).getFullYear()
    : new Date().getFullYear();
  const totalWords = docs.reduce((sum, d) => sum + (d.excerpt ? d.excerpt.split(/\s+/).length * 12 : 0), 0);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        style={{
          borderBottom: '5px solid var(--black)',
          paddingTop: '5rem',
          paddingBottom: '4rem',
          background: 'var(--cream)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid pattern */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(var(--cream2) 1px, transparent 1px), linear-gradient(90deg, var(--cream2) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            opacity: 0.5,
          }}
        />

        <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Eyebrow */}
          <div className="animate-slide-up" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <span className="brutal-tag brutal-tag-yellow">✦ OM MANOJ POPHALE</span>
            <span className="brutal-tag">RESEARCHER</span>
            <span className="brutal-tag brutal-tag-red">WRITER</span>
          </div>

          {/* Main headline */}
          <h1 className="hero-headline animate-slide-up delay-100">
            EXPLORE
            <br />
            MY{' '}
            <span className="accent-block">REPORTS.</span>
            <br />
            READ MY
            <br />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                textDecoration: 'line-through',
                textDecorationThickness: '5px',
                textDecorationColor: 'var(--red)',
                opacity: 0.6,
                fontSize: '60%',
              }}
            >
              THOUGHTS.
            </span>
          </h1>

          {/* Sub-copy */}
          <p
            className="animate-slide-up delay-200"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              maxWidth: '560px',
              color: '#333',
              lineHeight: 1.65,
              marginTop: '2rem',
              marginBottom: '2.5rem',
            }}
          >
            Welcome to my personal archive. A curated collection of my research reports,
            publications, journals, and deep dives across various subjects — by{' '}
            <strong>Om Manoj Pophale</strong>. Open and free to read.
          </p>

          {/* CTA row */}
          <div className="animate-slide-up delay-300" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <MagneticButton as="link" href="#documents" className="brutal-btn" style={{ fontSize: '0.9rem', padding: '0.85rem 2rem' }}>
              ↓ BROWSE LIBRARY
            </MagneticButton>
            <MagneticButton
              as="link"
              href="/contact"
              className="brutal-btn brutal-btn-black"
              style={{ fontSize: '0.9rem', padding: '0.85rem 2rem' }}
            >
              CONTACT ME ↗
            </MagneticButton>
            <LiveClock />
          </div>

          {/* Stats */}
          <div
            className="animate-slide-up delay-400"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1px',
              marginTop: '4rem',
              border: '3px solid var(--black)',
              width: 'fit-content',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {[
              { n: `${docs.length}`, label: 'PUBLICATIONS' },
              { n: `${Math.max(docs.length, 3)}+`, label: 'TOPICS COVERED' },
              { n: `${latestYear}`, label: 'LATEST ENTRY' },
              { n: `${totalWords > 1000 ? Math.round(totalWords / 1000) + 'K' : totalWords}+`, label: 'WORDS WRITTEN' },
            ].map((s) => (
              <div
                key={s.label}
                className="stat-card"
                style={{ borderWidth: 0, borderRight: '3px solid var(--black)', minWidth: '120px' }}
              >
                <span className="stat-number">
                  <AnimatedCounter end={s.n} />
                </span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ticker ────────────────────────────────────────────────── */}
      <MarqueeBar />

      {/* ── Expertise strip ─────────────────────────── */}
      <section style={{ borderBottom: '3px solid var(--black)', background: 'var(--black)', padding: '2rem 0' }}>
        <div className="page-container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0',
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(0.65rem, 1.5vw, 0.85rem)',
              fontWeight: 700,
              color: 'var(--white)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {[
              { label: 'RESEARCH', icon: <Search size={16} />, color: '#ffe135' },
              { label: '•', icon: null, color: 'transparent' },
              { label: 'STRATEGY', icon: <TrendingUp size={16} />, color: '#ff6b35' },
              { label: '•', icon: null, color: 'transparent' },
              { label: 'ANALYSIS', icon: <BarChart3 size={16} />, color: '#0033ff' },
              { label: '•', icon: null, color: 'transparent' },
              { label: 'DOCUMENTATION', icon: <FileText size={16} />, color: '#00c853' },
            ].map(({ label, icon, color }, i) =>
              label === '•' ? (
                <span key={i} style={{ color: '#555', padding: '0 0.75rem', fontSize: '1.2rem' }}>•</span>
              ) : (
                <span
                  key={i}
                  style={{
                    border: `2px solid ${color}`,
                    padding: '0.5rem 0.9rem',
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {icon && <span>{icon}</span>}
                  {label}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Search + Documents ───────────────────────────────────── */}
      <section id="documents" style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
        <div className="page-container">
          {/* Section header */}
          <ScrollReveal style={{ position: 'relative', zIndex: 100 }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '1.5rem',
                marginBottom: '3rem',
                borderBottom: '5px solid var(--black)',
                paddingBottom: '1.5rem',
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: '#777',
                    marginBottom: '0.4rem',
                  }}
                >
                  ╔══ MY PUBLICATIONS
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 800,
                    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {docs.length > 0 ? `${docs.length} DOCS PUBLISHED` : 'DOCUMENT LIBRARY'}
                </h2>
              </div>
              <SearchClient />
            </div>
          </ScrollReveal>

          {/* Setup notice when no Drive credentials */}
          {!hasCredentials && (
            <ScrollReveal delay={1}>
              <div
                style={{
                  border: '3px solid var(--orange)',
                  background: '#fff8f0',
                  boxShadow: '6px 6px 0 var(--orange)',
                  padding: '1.5rem 2rem',
                  marginBottom: '3rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      background: 'var(--orange)',
                      color: 'var(--white)',
                      padding: '0.2rem 0.6rem',
                    }}
                  >
                    ⚙ SETUP REQUIRED
                  </span>
                </div>
                <p style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.25rem' }}>
                  Google Drive credentials not configured.
                </p>
                <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Copy <code style={{ fontFamily: 'var(--font-mono)', background: '#f0ece0', padding: '1px 6px', border: '1.5px solid #ccc' }}>.env.local.example</code> to <code style={{ fontFamily: 'var(--font-mono)', background: '#f0ece0', padding: '1px 6px', border: '1.5px solid #ccc' }}>.env.local</code> and fill in your Service Account credentials and Drive Folder ID, then rebuild.
                </p>
              </div>
            </ScrollReveal>
          )}

          {/* Document grid */}
          {docs.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {docs.map((doc, i) => (
                <ScrollReveal key={doc.id} delay={(i % 6) as 0 | 1 | 2 | 3 | 4 | 5}>
                  <ReportCard {...doc} index={i} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div
              style={{
                border: '3px solid var(--black)',
                boxShadow: 'var(--shadow-md)',
                background: 'var(--white)',
                padding: '4rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span className="animate-float" style={{ display: 'block', fontSize: '4rem' }}>📄</span>
              <h3
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 800,
                  fontSize: '1.75rem',
                  letterSpacing: '-0.02em',
                }}
              >
                NO DOCUMENTS YET
              </h3>
              <p style={{ color: '#555', maxWidth: '420px', lineHeight: 1.6 }}>
                There are currently no documents in the library. Check back soon for new publications.
              </p>
              <MagneticButton as="link" href="/contact" className="brutal-btn" style={{ marginTop: '0.5rem' }}>
                GET IN TOUCH ↗
              </MagneticButton>
            </div>
          )}
        </div>
      </section>

      {/* ── Content Categories ─────────────────────────────────────────── */}
      <section style={{ background: 'var(--black)', borderTop: '5px solid var(--black)', paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className="page-container">
          <ScrollReveal>
            <h2
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 800,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                letterSpacing: '-0.03em',
                color: 'var(--yellow)',
                marginBottom: '3rem',
                borderBottom: '3px solid #333',
                paddingBottom: '1rem',
              }}
            >
              AREAS OF EXPERTISE
            </h2>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: '01', title: 'MARKET RESEARCH', body: 'In-depth analysis of emerging trends, competitive landscapes, and future industry trajectories.', color: 'var(--yellow)' },
              { step: '02', title: 'TECHNICAL REPORTS', body: 'Detailed whitepapers and technical deep-dives into complex systems and architectures.', color: 'var(--green)' },
              { step: '03', title: 'STRATEGY JOURNALS', body: 'Ongoing journals documenting business strategy, growth mechanics, and operational efficiency.', color: 'var(--blue)' },
              { step: '04', title: 'CASE STUDIES', body: 'Real-world examinations of successful implementations, challenges overcome, and key takeaways.', color: 'var(--red)' },
            ].map(({ step, title, body, color }) => (
              <ScrollReveal key={step} delay={parseInt(step) as 0 | 1 | 2 | 3 | 4 | 5}>
                <div
                  style={{
                    border: `3px solid ${color}`,
                    boxShadow: `6px 6px 0 ${color}`,
                    background: '#141414',
                    padding: '1.75rem 1.5rem',
                    height: '100%',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 900,
                      fontSize: '2.5rem',
                      color,
                      lineHeight: 1,
                      display: 'block',
                      marginBottom: '1rem',
                    }}
                  >
                    {step}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--white)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.65 }}>{body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
