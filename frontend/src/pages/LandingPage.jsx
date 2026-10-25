/**
 * LandingPage.jsx — Minimalist, scroll-driven 3D storytelling experience for ResumeIQ.
 *
 * Requirements:
 * - Five-chapter story through one persistent, transforming 3D paper resume sculpture.
 * - Palette: Warm off-white (#F3F1EC), Charcoal (#242523), Sage (#DDE1D4), Stone (#D4D2CA).
 * - Scoped styles and complete isolation from dashboard and auth routes.
 * - Bounded pointer tilt on hover-capable devices (disabled on reduced motion).
 * - Mobile responsive: single-column with static chapter illustration cards.
 * - Preserves existing authentication, upload, analysis routes, and branding.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StoryHeader from '../components/landing/StoryHeader';
import StoryProgress from '../components/landing/StoryProgress';
import Resume3DScene from '../components/landing/Resume3DScene';
import ChapterContent from '../components/landing/ChapterContent';
import MobileChapterCard from '../components/landing/MobileChapterCard';
import '../styles/story.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Active chapter index (0..4)
  const [activeChapter, setActiveChapter] = useState(0);

  // Accessible motion preference
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Mobile viewport detection (< 960px)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 960;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 960);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // IntersectionObserver to detect which chapter is currently in focus
  useEffect(() => {
    const chapterIds = ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5'];
    const elements = chapterIds.map((id) => document.getElementById(id)).filter(Boolean);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-chapter-index'));
            if (!isNaN(index)) {
              setActiveChapter(index);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-30% 0px -40% 0px',
        threshold: 0.15,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [isMobile]);

  // CTA navigation handler connecting to existing verified routes
  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/analyze');
    } else {
      navigate('/login');
    }
  };

  // Smooth scroll to chapter
  const handleScrollToChapter = (chapterIndex) => {
    const target = document.getElementById(`chapter-${chapterIndex + 1}`);
    if (target) {
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <div
      className={`story-wrapper ${reducedMotion ? 'reduced-motion' : ''}`}
      data-chapter={activeChapter}
    >
      {/* ── Fixed Header ── */}
      <StoryHeader
        motionEnabled={!reducedMotion}
        onToggleMotion={() => setReducedMotion((prev) => !prev)}
        onCtaClick={handleCtaClick}
      />

      {/* ── Main Story Container ── */}
      <main
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isMobile ? '24px 20px 80px' : '0 28px 120px',
          position: 'relative',
        }}
      >
        {isMobile ? (
          /* Mobile Single-Column Layout: Story copy interleaved with static cards */
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Chapter 1 */}
            <section id="chapter-1" data-chapter-index="0" style={{ padding: '40px 0 20px' }}>
              <span className="story-chapter-label">01 / POTENTIAL</span>
              <h1 className="story-chapter-title">
                Big potential.
                Wrong frame.
              </h1>
              <p className="story-chapter-desc">
                The projects. The late nights. The things you figured out. You have a story worth telling. Let’s give it a clearer shape.
              </p>
              <MobileChapterCard chapterIndex={0} />
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleScrollToChapter(1)}
                  style={{
                    background: 'var(--story-btn-primary, #292C27)',
                    color: 'var(--story-btn-text, #FFFEF9)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Explore the story ↓
                </button>
                <button
                  type="button"
                  onClick={handleCtaClick}
                  style={{
                    background: 'transparent',
                    color: '#242523',
                    border: '1px solid #D4D2CA',
                    borderRadius: '8px',
                    padding: '12px 18px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Analyze resume
                </button>
              </div>
            </section>

            {/* Chapter 2 */}
            <section id="chapter-2" data-chapter-index="1" style={{ padding: '60px 0 20px' }}>
              <span className="story-chapter-label">02 / CLARITY</span>
              <h2 className="story-chapter-title">
                Less noise.
                More you.
              </h2>
              <p className="story-chapter-desc">
                Start with what your resume actually says. Review the extracted text. Keep the details that matter. Correct what got lost in translation.
              </p>
              <MobileChapterCard chapterIndex={1} />
            </section>

            {/* Chapter 3 */}
            <section id="chapter-3" data-chapter-index="2" style={{ padding: '60px 0 20px' }}>
              <span className="story-chapter-label">03 / EVIDENCE</span>
              <h2 className="story-chapter-title">
                Don’t guess.
                Show why.
              </h2>
              <p className="story-chapter-desc">
                Unpack the experience, projects, and skills behind the words. Connect recommendations to evidence—not just an unexplained number.
              </p>
              <MobileChapterCard chapterIndex={2} />
            </section>

            {/* Chapter 4 */}
            <section id="chapter-4" data-chapter-index="3" style={{ padding: '60px 0 20px' }}>
              <span className="story-chapter-label">04 / REWRITE</span>
              <h2 className="story-chapter-title">
                Sharper words.
                Same truth.
              </h2>
              <p className="story-chapter-desc">
                Make your contribution easier to understand. Review, edit, and tailor each suggestion to your actual experience. Nothing invented. Nothing silently added.
              </p>
              <MobileChapterCard chapterIndex={3} />
            </section>

            {/* Chapter 5 */}
            <section id="chapter-5" data-chapter-index="4" style={{ padding: '60px 0 40px' }}>
              <span className="story-chapter-label">05 / YOUR CHAPTER</span>
              <h2 className="story-chapter-title">
                Your story.
                Ready to go.
              </h2>
              <p className="story-chapter-desc">
                A clearer resume. A version you understand. A starting point for what comes next—not a promise of a hiring decision.
              </p>
              <MobileChapterCard chapterIndex={4} />
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={handleCtaClick}
                  style={{
                    background: 'var(--story-btn-primary, #292C27)',
                    color: 'var(--story-btn-text, #FFFEF9)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '13px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Analyze my resume →
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollToChapter(0)}
                  style={{
                    background: 'transparent',
                    color: '#696A65',
                    border: '1px solid #D4D2CA',
                    borderRadius: '8px',
                    padding: '13px 18px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  ↺ Replay
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#8E9185', lineHeight: 1.5, margin: 0 }}>
                ResumeIQ feedback helps present your documented achievements clearly; it does not predict or guarantee an employer’s hiring decision.
              </p>
            </section>
          </div>
        ) : (
          /* Desktop Split Layout: Left editorial copy (~43%), Right persistent sticky 3D sculpture */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '43% 57%',
              gap: '40px',
              position: 'relative',
              alignItems: 'start',
            }}
          >
            {/* Left Column: Normal Document Scrolling Content */}
            <ChapterContent
              onCtaClick={handleCtaClick}
              onScrollToChapter={handleScrollToChapter}
            />

            {/* Right Column: Persistent Sticky 3D Scene */}
            <div
              style={{
                position: 'sticky',
                top: '90px',
                alignSelf: 'start',
                height: 'calc(100vh - 120px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
              }}
            >
              <Resume3DScene
                activeChapter={activeChapter}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
        )}
      </main>

      {/* ── Floating Story Progress Indicator ── */}
      <StoryProgress activeChapter={activeChapter} />

      {/* ── Quiet Editorial Footer ── */}
      <footer
        style={{
          borderTop: '1px solid var(--story-border-stone, #D4D2CA)',
          background: 'rgba(255, 254, 249, 0.65)',
          padding: '48px 28px',
          color: 'var(--story-text-secondary, #696A65)',
          fontSize: '13px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#292C27', color: '#FFFEF9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>
                IQ
              </div>
              <strong style={{ color: '#242523' }}>ResumeIQ</strong>
              <span>— Minimalist, evidence-backed career intelligence.</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#8E9185' }}>
              © 2026 ResumeIQ. Documents processed securely with zero data sharing.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '13px' }}>
            <Link to="/login" style={{ color: '#242523', textDecoration: 'none', fontWeight: 500 }}>
              Log in
            </Link>
            <Link to="/register" style={{ color: '#242523', textDecoration: 'none', fontWeight: 500 }}>
              Sign up
            </Link>
            <Link to="/analyze" style={{ color: '#242523', textDecoration: 'none', fontWeight: 500 }}>
              Analyze resume
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
