'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Mail, MessageSquare, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const FIELDS = [
    { id: 'name', label: 'Full Name', placeholder: 'Your name', icon: User, type: 'text' },
    { id: 'email', label: 'Email Address', placeholder: 'you@example.com', icon: Mail, type: 'email' },
];

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactPage() {
    const [focused, setFocused] = useState<string | null>(null);
    const [values, setValues] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<Status>('idle');
    const [hoverSend, setHoverSend] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValues(v => ({ ...v, [e.target.id]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const res = await fetch('https://formsubmit.co/ajax/destinyplayz2112@gmail.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    message: values.message,
                    _subject: `New message from ${values.name} — Om's Archive`,
                    _captcha: 'false',
                }),
            });

            if (res.ok) {
                setStatus('success');
                setValues({ name: '', email: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    const inputStyle = (id: string): React.CSSProperties => ({
        border: `3px solid ${focused === id ? 'var(--black)' : '#ccc'}`,
        boxShadow: focused === id ? '4px 4px 0 var(--black)' : '2px 2px 0 #ccc',
        background: focused === id ? 'var(--white)' : '#fafafa',
        width: '100%',
        padding: '0.85rem 0.85rem 0.85rem 2.8rem',
        fontFamily: 'var(--font-body)',
        fontSize: '1rem',
        fontWeight: 500,
        color: 'var(--black)',
        outline: 'none',
        transition: 'border 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
    });

    return (
        <>
            {/* ── Breadcrumb ─── */}
            <div style={{ borderBottom: '3px solid var(--black)', background: 'var(--cream2)', padding: '0.75rem 0' }}>
                <div className="page-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        <Link href="/" style={{ textDecoration: 'none', color: 'var(--black)', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <ArrowLeft size={12} /> HOME
                        </Link>
                        <span style={{ opacity: 0.3 }}>/</span>
                        <span style={{ opacity: 0.8 }}>CONTACT</span>
                    </div>
                </div>
            </div>

            {/* ── Hero ─── */}
            <section style={{ background: 'var(--yellow)', borderBottom: '5px solid var(--black)', padding: '4rem 0 3.5rem', position: 'relative', overflow: 'hidden' }}>
                {/* Grid bg */}
                <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <span style={{ display: 'inline-block', background: 'var(--black)', color: 'var(--yellow)', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0.3rem 0.8rem', marginBottom: '1.5rem' }}>
                            ╔══ GET IN TOUCH
                        </span>
                        <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.04em', lineHeight: 0.95, color: 'var(--black)', marginBottom: '1.5rem' }}>
                            SEND ME A
                            <br />
                            <span style={{ display: 'inline-block', background: 'var(--black)', color: 'var(--yellow)', padding: '0 0.25em' }}>MESSAGE.</span>
                        </h1>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', fontWeight: 500, color: '#333', maxWidth: '480px', lineHeight: 1.6 }}>
                            Have a question about a report, want to collaborate, or just want to say hello? I'd love to hear from you.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Form + Info ─── */}
            <section style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
                <div className="page-container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>

                        {/* Form card */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            style={{ border: '3px solid var(--black)', boxShadow: 'var(--shadow-lg)', background: 'var(--white)', overflow: 'hidden' }}
                        >
                            <div style={{ background: 'var(--black)', color: 'var(--yellow)', padding: '1rem 1.5rem', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                ╔══ COMPOSE MESSAGE
                            </div>

                            <AnimatePresence mode="wait">
                                {status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                                            style={{ background: 'var(--green)', color: 'var(--white)', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--black)', boxShadow: 'var(--shadow-sm)' }}
                                        >
                                            <CheckCircle size={36} />
                                        </motion.div>
                                        <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em' }}>MESSAGE SENT!</h2>
                                        <p style={{ color: '#555', lineHeight: 1.6 }}>Thanks for reaching out. I'll get back to you at <strong>{values.email || 'your email'}</strong> soon.</p>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            style={{ background: 'var(--black)', color: 'var(--white)', border: 'none', padding: '0.7rem 1.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}
                                        >
                                            SEND ANOTHER
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        ref={formRef}
                                        onSubmit={handleSubmit}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{ padding: '2rem' }}
                                    >
                                        {/* Name + Email fields */}
                                        {FIELDS.map(({ id, label, placeholder, icon: Icon, type }, i) => (
                                            <motion.div
                                                key={id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 * i }}
                                                style={{ marginBottom: '1.5rem' }}
                                            >
                                                <label htmlFor={id} style={{ display: 'block', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem', color: focused === id ? 'var(--black)' : '#888', transition: 'color 0.2s ease' }}>
                                                    {label}
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: focused === id ? 'var(--black)' : '#bbb', transition: 'color 0.2s ease', pointerEvents: 'none' }}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <input
                                                        id={id}
                                                        type={type}
                                                        required
                                                        placeholder={placeholder}
                                                        value={values[id as keyof typeof values]}
                                                        onChange={handleChange}
                                                        onFocus={() => setFocused(id)}
                                                        onBlur={() => setFocused(null)}
                                                        style={inputStyle(id)}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Message */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            style={{ marginBottom: '2rem' }}
                                        >
                                            <label htmlFor="message" style={{ display: 'block', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem', color: focused === 'message' ? 'var(--black)' : '#888', transition: 'color 0.2s ease' }}>
                                                Your Message
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', left: '0.85rem', top: '0.85rem', color: focused === 'message' ? 'var(--black)' : '#bbb', transition: 'color 0.2s ease', pointerEvents: 'none' }}>
                                                    <MessageSquare size={16} />
                                                </div>
                                                <textarea
                                                    id="message"
                                                    required
                                                    rows={6}
                                                    placeholder="Tell me what's on your mind..."
                                                    value={values.message}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocused('message')}
                                                    onBlur={() => setFocused(null)}
                                                    style={{ ...inputStyle('message'), resize: 'vertical', paddingTop: '0.85rem' }}
                                                />
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#aaa', textAlign: 'right', marginTop: '0.3rem', letterSpacing: '0.05em' }}>
                                                {values.message.length} chars
                                            </div>
                                        </motion.div>

                                        {/* Error state */}
                                        {status === 'error' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ background: '#fff0f0', border: '2px solid var(--red)', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem' }}
                                            >
                                                <AlertCircle size={16} /> Failed to send. Please try again.
                                            </motion.div>
                                        )}

                                        {/* Submit */}
                                        <motion.button
                                            type="submit"
                                            disabled={status === 'sending'}
                                            onMouseEnter={() => setHoverSend(true)}
                                            onMouseLeave={() => setHoverSend(false)}
                                            whileTap={{ scale: 0.97 }}
                                            style={{
                                                background: hoverSend ? '#222' : 'var(--black)',
                                                color: 'var(--yellow)',
                                                border: '3px solid var(--black)',
                                                boxShadow: hoverSend ? '6px 6px 0 var(--yellow)' : 'var(--shadow-md)',
                                                transform: hoverSend ? 'translate(-2px, -2px)' : 'none',
                                                padding: '0.9rem 2rem',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: 800,
                                                fontSize: '0.85rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.6rem',
                                                transition: 'all 0.15s var(--ease-bounce)',
                                                width: '100%',
                                                justifyContent: 'center',
                                                opacity: status === 'sending' ? 0.7 : 1,
                                            }}
                                        >
                                            {status === 'sending' ? (
                                                <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> SENDING...</>
                                            ) : (
                                                <><Send size={16} /> SEND MESSAGE</>
                                            )}
                                        </motion.button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Info panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            {/* About card */}
                            <div style={{ border: '3px solid var(--black)', boxShadow: 'var(--shadow-md)', background: 'var(--cream)', padding: '2rem' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', marginBottom: '1rem' }}>╔══ ABOUT ME</div>
                                <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Om Manoj Pophale</h2>
                                <p style={{ color: '#555', lineHeight: 1.7, fontSize: '0.95rem' }}>
                                    A researcher, writer, and strategist passionate about making complex ideas accessible. These reports and publications are my way of sharing knowledge with the world.
                                </p>
                            </div>

                            {/* Direct email card */}
                            <div style={{ border: '3px solid var(--yellow)', boxShadow: '6px 6px 0 var(--yellow)', background: 'var(--white)', padding: '1.5rem' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', marginBottom: '0.75rem' }}>DIRECT EMAIL</div>
                                <a
                                    href="mailto:destinyplayz2112@gmail.com"
                                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1rem', color: 'var(--black)', textDecoration: 'none', wordBreak: 'break-all', display: 'block', marginBottom: '0.5rem' }}
                                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                                >
                                    destinyplayz2112@gmail.com ↗
                                </a>
                                <div style={{ color: '#888', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>Usually responds within 24–48 hours.</div>
                            </div>

                            {/* Response time */}
                            <div style={{ border: '3px solid var(--black)', background: 'var(--black)', boxShadow: 'var(--shadow-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { icon: '📨', label: 'COLLABORATIONS', value: 'Open to new projects & writing partnerships' },
                                    { icon: '🔍', label: 'FEEDBACK', value: 'Report corrections or suggestions welcome' },
                                    { icon: '💡', label: 'TOPIC IDEAS', value: 'Have a research topic in mind? Let me know!' },
                                ].map(({ icon, label, value }) => (
                                    <div key={label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: '1.25rem', lineHeight: 1.2 }}>{icon}</span>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--yellow)', marginBottom: '0.2rem' }}>{label}</div>
                                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#aaa', lineHeight: 1.5 }}>{value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
}
