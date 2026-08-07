'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  getLicenseUrl,
  licenseDefinitions,
  seedCatalog,
  type CalmScene,
  type LicenseId,
  type MediaRef,
  type SceneCatalog,
} from '@calm/content';
import { CalmMark } from '@calm/ui/mark';

import { BrowserSceneRepository, type StorageReport } from '../../lib/content/browser-repository';

const WebExperience = dynamic(
  () => import('../components/WebExperience').then((module) => module.WebExperience),
  { ssr: false },
);

type FormState = {
  id: string;
  title: string;
  location: string;
  description: string;
  soundLabel: string;
  creator: string;
  sourceUrl: string;
  licenseId: LicenseId;
  changesMade: string;
  status: CalmScene['status'];
  sortOrder: number;
  video: MediaRef | null;
  poster: MediaRef | null;
  createdAt?: string;
};

const blankForm = (sortOrder = 4): FormState => ({
  id: '',
  title: '',
  location: '',
  description: '',
  soundLabel: '',
  creator: '',
  sourceUrl: '',
  licenseId: 'cc-by-4.0',
  changesMade:
    'Trimmed, cropped to portrait, transcoded to H.264 with AAC audio, and used to derive a poster frame.',
  status: 'draft',
  sortOrder,
  video: null,
  poster: null,
});

function formFromScene(scene: CalmScene): FormState {
  return {
    id: scene.id,
    title: scene.title,
    location: scene.location,
    description: scene.description,
    soundLabel: scene.soundLabel,
    creator: scene.attribution.creator,
    sourceUrl: scene.attribution.sourceUrl,
    licenseId: scene.attribution.licenseId,
    changesMade: scene.attribution.changesMade,
    status: scene.status,
    sortOrder: scene.sortOrder,
    video: scene.video,
    poster: scene.poster,
    createdAt: scene.createdAt,
  };
}

function bytes(value: number | null) {
  if (value === null) return 'unknown';
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function makeLocalRef(file: File): MediaRef {
  return {
    kind: 'local',
    blobId: globalThis.crypto?.randomUUID?.() ?? `blob-${Date.now()}`,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

function recoverableMessage(caught: unknown, fallback: string): string {
  if (caught instanceof DOMException && caught.name === 'QuotaExceededError')
    return 'Browser storage is full. Remove local scenes or reset the catalog, then try again.';
  if (caught instanceof Error) {
    const message = caught.message.toLowerCase();
    if (message.includes('quota'))
      return 'Browser storage is full. Remove local scenes or reset the catalog, then try again.';
    if (message.includes('at least one scene must be published'))
      return 'Keep at least one published scene in the catalog.';
  }
  return caught instanceof Error ? caught.message : fallback;
}

export default function AdminClient() {
  const repo = useMemo(() => new BrowserSceneRepository(), []);
  const [catalog, setCatalog] = useState<SceneCatalog>(seedCatalog);
  const [form, setForm] = useState<FormState>(blankForm());
  const [videoFile, setVideoFile] = useState<File | undefined>();
  const [posterFile, setPosterFile] = useState<File | undefined>();
  const [audioConfirmed, setAudioConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [storage, setStorage] = useState<StorageReport>({ usedBytes: 0, quotaBytes: null });
  const [posterUrls, setPosterUrls] = useState<Record<string, string>>({});

  const refresh = async () => {
    const next = await repo.readCatalog();
    setCatalog(next);
    const nextPosterUrls: Record<string, string> = {};
    for (const scene of next.scenes) {
      if (scene.poster.kind === 'local') {
        const url = await repo.getObjectUrl(scene.poster);
        if (url) nextPosterUrls[scene.id] = url;
      }
    }
    setPosterUrls(nextPosterUrls);
    const selected = form.id ? next.scenes.find((scene) => scene.id === form.id) : undefined;
    if (selected) setForm(formFromScene(selected));
    setStorage(await repo.getStorageReport());
  };

  useEffect(() => {
    void refresh();
    const unsubscribe = repo.subscribe(() => void refresh());
    return () => {
      unsubscribe();
      repo.dispose();
    };
  }, [repo]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const selectScene = (scene: CalmScene) => {
    setForm(formFromScene(scene));
    setVideoFile(undefined);
    setPosterFile(undefined);
    setAudioConfirmed(false);
    setMessage('');
    setError('');
  };

  const newScene = () => {
    setForm(
      blankForm(
        catalog.scenes.length ? Math.max(...catalog.scenes.map((scene) => scene.sortOrder)) + 1 : 0,
      ),
    );
    setVideoFile(undefined);
    setPosterFile(undefined);
    setAudioConfirmed(false);
    setMessage('');
    setError('');
  };

  const validateFile = (file: File | undefined, type: 'video' | 'poster') => {
    if (!file) return;
    const max = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    const accepted =
      type === 'video'
        ? file.type === 'video/mp4'
        : ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!accepted)
      throw new Error(
        type === 'video' ? 'Video must be an MP4 file.' : 'Poster must be JPEG, PNG, or WebP.',
      );
    if (file.size > max)
      throw new Error(`${type === 'video' ? 'Video' : 'Poster'} is larger than the allowed limit.`);
  };

  const validateDuration = async (file: File | undefined) => {
    if (!file) return;
    const duration = await new Promise<number>((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const cleanup = () => {
        video.onloadedmetadata = null;
        video.onerror = null;
        video.srcObject = null;
      };
      video.onloadedmetadata = () => {
        const value = video.duration;
        cleanup();
        resolve(value);
      };
      video.onerror = () => {
        cleanup();
        reject(new Error('Video metadata could not be read.'));
      };
      try {
        video.srcObject = file;
      } catch {
        cleanup();
        reject(new Error('Video metadata could not be read.'));
      }
    });
    if (!Number.isFinite(duration) || duration < 5 || duration > 120)
      throw new Error('Video duration must be between 5 and 120 seconds.');
  };

  const save = async (status: CalmScene['status']) => {
    setError('');
    setMessage('');
    try {
      validateFile(videoFile, 'video');
      validateFile(posterFile, 'poster');
      await validateDuration(videoFile);
      if ((videoFile || !form.video) && !audioConfirmed)
        throw new Error('Confirm that the uploaded video contains embedded audio.');
      if (!form.title.trim() || form.title.length > 80)
        throw new Error('Title must be between 1 and 80 characters.');
      if (
        form.location.length > 100 ||
        form.description.length > 240 ||
        form.soundLabel.length < 1 ||
        form.soundLabel.length > 80
      )
        throw new Error('Location, description, and sound label exceed their limits.');
      if (!form.creator.trim() || form.creator.length > 120)
        throw new Error('Creator must be between 1 and 120 characters.');
      const source = new URL(form.sourceUrl);
      if (!['http:', 'https:'].includes(source.protocol))
        throw new Error('Source URL must use HTTP or HTTPS.');
      const video = videoFile ? makeLocalRef(videoFile) : form.video;
      const poster = posterFile ? makeLocalRef(posterFile) : form.poster;
      if (!video || !poster) throw new Error('A video and poster are required for every scene.');
      await repo.saveScene(
        {
          id: form.id || undefined,
          title: form.title,
          location: form.location,
          description: form.description,
          soundLabel: form.soundLabel,
          video,
          poster,
          attribution: {
            creator: form.creator,
            sourceUrl: form.sourceUrl,
            licenseId: form.licenseId,
            licenseUrl: getLicenseUrl(form.licenseId),
            changesMade: form.changesMade,
          },
          status,
          sortOrder: form.sortOrder,
          createdAt: form.createdAt,
        },
        { video: videoFile, poster: posterFile },
      );
      setMessage(
        status === 'published'
          ? 'Scene published in this browser.'
          : 'Draft saved in this browser.',
      );
      await refresh();
      setVideoFile(undefined);
      setPosterFile(undefined);
      setAudioConfirmed(false);
    } catch (caught) {
      setError(recoverableMessage(caught, 'The scene could not be saved. Try again.'));
    }
  };

  const remove = async (scene: CalmScene) => {
    if (!window.confirm(`Delete ${scene.title} from this browser?`)) return;
    try {
      await repo.removeScene(scene.id);
      setMessage('Scene deleted from this browser.');
      newScene();
      await refresh();
    } catch (caught) {
      setError(recoverableMessage(caught, 'The scene could not be deleted.'));
    }
  };

  const move = async (scene: CalmScene, direction: -1 | 1) => {
    const ordered = [...catalog.scenes].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
    );
    const index = ordered.findIndex((item) => item.id === scene.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    await repo.reorderScenes(ordered.map((item) => item.id));
    await refresh();
  };

  const reset = async () => {
    if (!window.confirm('Reset local edits and restore the four bundled scenes?')) return;
    try {
      await repo.reset();
      setForm(blankForm());
      setMessage('Local edits were reset.');
      await refresh();
    } catch (caught) {
      setError(recoverableMessage(caught, 'The local catalog could not be reset.'));
    }
  };

  return (
    <div className="admin-page">
      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <CalmMark color="var(--paper)" size={22} />
          </span>
          <span>Calm in the Rush</span>
        </a>
        <a className="button button-primary" href="/demo">
          Open demo
        </a>
      </header>
      <main className="admin-content">
        <div className="eyebrow">Local administration</div>
        <h1>Keep the scene shelf close.</h1>
        <p className="section-lead">
          Add a private scene for this browser, preview it in the real phone surface, and decide
          whether it stays a draft or appears in the demo.
        </p>
        <p className="admin-banner" role="status">
          Local demo admin. Changes stay in this browser and are not published to other people.
        </p>
        <div className="admin-layout">
          <section className="admin-card" aria-labelledby="catalog-title">
            <h2 id="catalog-title">Scene catalog</h2>
            <div className="form-actions">
              <button className="button button-primary" type="button" onClick={newScene}>
                Add scene
              </button>
              <button className="button button-secondary" type="button" onClick={reset}>
                Reset local edits
              </button>
            </div>
            <div className="admin-list" style={{ marginTop: 16 }}>
              {[...catalog.scenes]
                .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
                .map((scene, index, list) => (
                  <div
                    className={`admin-row ${form.id === scene.id ? 'selected' : ''}`}
                    key={scene.id}
                  >
                    <img
                      src={
                        scene.poster.kind === 'bundled'
                          ? `/media/scenes/${scene.id}/poster.jpg`
                          : (posterUrls[scene.id] ?? '')
                      }
                      alt=""
                    />
                    <div>
                      <h3>{scene.title}</h3>
                      <p>
                        {scene.status} - order {scene.sortOrder + 1}
                      </p>
                    </div>
                    <div className="admin-row-actions">
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`Move ${scene.title} up`}
                        disabled={index === 0}
                        onClick={() => void move(scene, -1)}
                      >
                        Up
                      </button>
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`Move ${scene.title} down`}
                        disabled={index === list.length - 1}
                        onClick={() => void move(scene, 1)}
                      >
                        Down
                      </button>
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`Edit ${scene.title}`}
                        onClick={() => selectScene(scene)}
                      >
                        Edit
                      </button>
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`Delete ${scene.title}`}
                        onClick={() => void remove(scene)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            <p className="storage">
              Used storage: {bytes(storage.usedBytes)}. Estimated quota: {bytes(storage.quotaBytes)}
              . Private mode or site-data clearing may remove edits.
            </p>
          </section>
          <section className="admin-card" aria-labelledby="form-title">
            <h2 id="form-title">{form.id ? 'Edit scene' : 'Add scene'}</h2>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="scene-title">Title</label>
                <input
                  id="scene-title"
                  value={form.title}
                  onChange={(event) => update('title', event.target.value)}
                  maxLength={80}
                />
              </div>
              <div className="form-field">
                <label htmlFor="scene-location">Location</label>
                <input
                  id="scene-location"
                  value={form.location}
                  onChange={(event) => update('location', event.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="form-field full">
                <label htmlFor="scene-description">Description</label>
                <textarea
                  id="scene-description"
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  maxLength={240}
                />
              </div>
              <div className="form-field">
                <label htmlFor="scene-sound">Sound label</label>
                <input
                  id="scene-sound"
                  value={form.soundLabel}
                  onChange={(event) => update('soundLabel', event.target.value)}
                  maxLength={80}
                />
              </div>
              <div className="form-field">
                <label htmlFor="scene-creator">Creator</label>
                <input
                  id="scene-creator"
                  value={form.creator}
                  onChange={(event) => update('creator', event.target.value)}
                  maxLength={120}
                />
              </div>
              <div className="form-field full">
                <label htmlFor="scene-source">Source URL</label>
                <input
                  id="scene-source"
                  type="url"
                  value={form.sourceUrl}
                  onChange={(event) => update('sourceUrl', event.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="scene-license">License</label>
                <select
                  id="scene-license"
                  value={form.licenseId}
                  onChange={(event) => update('licenseId', event.target.value as LicenseId)}
                >
                  {Object.entries(licenseDefinitions).map(([id, definition]) => (
                    <option key={id} value={id}>
                      {definition.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="scene-order">Order</label>
                <input
                  id="scene-order"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(event) => update('sortOrder', Number(event.target.value))}
                />
              </div>
              <div className="form-field full">
                <label htmlFor="scene-changes">Changes made</label>
                <textarea
                  id="scene-changes"
                  value={form.changesMade}
                  onChange={(event) => update('changesMade', event.target.value)}
                  maxLength={500}
                />
              </div>
              <div className="form-field">
                <label htmlFor="scene-video">MP4 video</label>
                <input
                  id="scene-video"
                  type="file"
                  accept="video/mp4"
                  onChange={(event) => setVideoFile(event.target.files?.[0])}
                />
                <small>
                  {form.video
                    ? `Current: ${form.video.kind === 'local' ? form.video.fileName : 'bundled scene'}`
                    : 'Required for a new scene.'}
                </small>
              </div>
              <div className="form-field">
                <label htmlFor="scene-poster">Poster</label>
                <input
                  id="scene-poster"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setPosterFile(event.target.files?.[0])}
                />
                <small>
                  {form.poster
                    ? `Current: ${form.poster.kind === 'local' ? form.poster.fileName : 'bundled poster'}`
                    : 'Required for a new scene.'}
                </small>
              </div>
              <label className="checkbox-field full">
                <input
                  type="checkbox"
                  checked={audioConfirmed}
                  onChange={(event) => setAudioConfirmed(event.target.checked)}
                />
                <span>
                  I confirm that the uploaded video contains embedded audio. This demo does not
                  accept a separate audio upload.
                </span>
              </label>
            </div>
            <div className="form-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => void save('draft')}
              >
                Save draft
              </button>
              <button
                className="button button-primary"
                type="button"
                onClick={() => void save('published')}
              >
                Publish
              </button>
            </div>
            {message ? (
              <p className="message" role="status">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="message error" role="alert">
                {error}
              </p>
            ) : null}
          </section>
        </div>
        <section className="admin-card" style={{ marginTop: 22 }} aria-labelledby="preview-title">
          <h2 id="preview-title">Phone preview</h2>
          <div className="admin-preview">
            <WebExperience repository={repo} compact />
          </div>
        </section>
      </main>
    </div>
  );
}
