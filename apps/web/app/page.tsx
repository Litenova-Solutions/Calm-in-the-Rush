import Link from 'next/link';

import { seedScenes } from '@calm/content';

import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';

const poster = (id: string) => `/media/scenes/${id}/poster.jpg`;

export default function LandingPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="hero">
          <div>
            <div className="eyebrow">Calm, without a checklist.</div>
            <h1>A quiet minute in the middle of everything.</h1>
            <p className="hero-copy">
              Open a real place and stay as long as you like. No account. No streak. Nothing to
              finish.
            </p>
            <div className="actions">
              <Link className="button button-primary" href="/demo">
                Open the demo
              </Link>
              <Link className="button button-secondary" href="/requirements">
                Read the plan
              </Link>
              <Link className="button button-secondary" href="/admin">
                Open admin
              </Link>
            </div>
          </div>
          <div className="phone-preview" aria-label="Static preview of the Lake McDonald scene">
            <img src={poster('lake')} alt="Mist above Lake McDonald" />
          </div>
        </section>
        <section className="section">
          <div className="eyebrow">A small pause</div>
          <h2>Make room for one quiet thing.</h2>
          <p className="section-lead">
            The experience keeps the choice small. Pick a real place and leave whenever you are
            ready.
          </p>
          <div className="principles">
            <article className="principle">
              <h3>Real places</h3>
              <p>Footage and ambient audio remain paired so each scene has a sense of place.</p>
            </article>
            <article className="principle">
              <h3>No pressure</h3>
              <p>No goals, timers, streaks, notifications, or progress to maintain.</p>
            </article>
            <article className="principle">
              <h3>Private by default</h3>
              <p>
                No accounts, analytics, cookies, or tracking. Local demo edits stay in this browser.
              </p>
            </article>
          </div>
        </section>
        <section className="section">
          <div className="eyebrow">The scene shelf</div>
          <h2>Four places to begin.</h2>
          <div className="gallery">
            {seedScenes.map((scene) => (
              <article className="scene-card" key={scene.id}>
                <img src={poster(scene.id)} alt={`${scene.title} poster`} />
                <div className="scene-card-copy">
                  <h3>{scene.title}</h3>
                  <p>{scene.location}</p>
                  <p>{scene.attribution.creator}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="section source-panel">
          <div className="source-card">
            <div className="eyebrow">Source-available project</div>
            <h2>Read the plan. See every boundary.</h2>
            <p>
              The repository includes the web demo, an Expo app, shared experience code, content
              provenance, and the checks that protect the privacy line.
            </p>
            <div className="actions">
              <a
                className="button button-primary"
                href="https://github.com/Litenova-Solutions/Calm-in-the-Rush"
              >
                View on GitHub
              </a>
              <Link className="button button-secondary" href="/requirements">
                Read requirements
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
