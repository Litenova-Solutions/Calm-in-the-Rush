// Client boundary: the admin owns IndexedDB, file selection, cover capture, and
// confirmation dialogs.
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowDown, ArrowUp, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import {
  getLicenseUrl,
  seedCatalog,
  seedSentenceBank,
  type CalmScene,
  type MediaRef,
  type SceneCatalog,
  type SentenceBank,
} from '@calm/content';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { BrowserSceneRepository, type StorageReport } from '../../lib/content/browser-repository';

const WebExperience = dynamic(
  () => import('../components/WebExperience').then((module) => module.WebExperience),
  { ssr: false },
);

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MIN_SECONDS = 5;
const MAX_SECONDS = 120;

/**
 * A locally uploaded scene has no third-party source, so its provenance says so
 * rather than inventing a creator or a source URL.
 */
const localProvenance = {
  creator: 'Uploaded in this browser',
  licenseId: 'creator-owned' as const,
  changesMade: 'Uploaded through the local admin. The cover is the first frame of the video.',
};

const localSoundLabel = 'Original audio from the uploaded video';

type FormState = {
  id: string;
  title: string;
  status: CalmScene['status'];
  sortOrder: number;
  video: MediaRef | null;
  poster: MediaRef | null;
  createdAt?: string;
};

const blankForm = (sortOrder = 4): FormState => ({
  id: '',
  title: '',
  status: 'draft',
  sortOrder,
  video: null,
  poster: null,
});

function formFromScene(scene: CalmScene): FormState {
  return {
    id: scene.id,
    title: scene.title,
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

/** Loads the video once and returns its duration plus the first decoded frame. */
async function readVideo(file: File): Promise<{ duration: number; cover: File }> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error('The video could not be read.'));
    });

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration < MIN_SECONDS || duration > MAX_SECONDS)
      throw new Error(`Video duration must be between ${MIN_SECONDS} and ${MAX_SECONDS} seconds.`);

    // Seek a fraction in so the decoder has a painted frame to copy.
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error('The video could not be read.'));
      video.currentTime = Math.min(0.1, duration / 2);
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (!canvas.width || !canvas.height)
      throw new Error('The video has no picture to use as a cover.');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('The cover image could not be created.');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.82),
    );
    if (!blob) throw new Error('The cover image could not be created.');

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'scene';
    return {
      duration,
      cover: new File([blob], `${baseName}-cover.jpg`, { type: 'image/jpeg' }),
    };
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}

export default function AdminClient() {
  const repo = useMemo(() => new BrowserSceneRepository(), []);
  const [catalog, setCatalog] = useState<SceneCatalog>(seedCatalog);
  const [sentenceBank, setSentenceBank] = useState<SentenceBank>(seedSentenceBank);
  const [form, setForm] = useState<FormState>(blankForm());
  const [videoFile, setVideoFile] = useState<File | undefined>();
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | undefined>();
  const [busy, setBusy] = useState(false);
  // The catalog is read on the client, so saving before it arrives would compute
  // an order from stale data.
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [storage, setStorage] = useState<StorageReport>({ usedBytes: 0, quotaBytes: null });
  const [posterUrls, setPosterUrls] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = useState<CalmScene | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [sentenceText, setSentenceText] = useState('');
  const [sentenceBusy, setSentenceBusy] = useState(false);
  const [sentenceMessage, setSentenceMessage] = useState('');
  const [sentenceError, setSentenceError] = useState('');

  const refresh = async () => {
    const [next, nextSentenceBank] = await Promise.all([
      repo.readCatalog(),
      repo.readSentenceBank(),
    ]);
    setCatalog(next);
    setSentenceBank(nextSentenceBank);
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
    setReady(true);
  };

  useEffect(() => {
    void refresh();
    return () => {
      repo.dispose();
    };
  }, [repo]);

  useEffect(
    () => () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    },
    [coverPreview],
  );

  const clearUpload = () => {
    setVideoFile(undefined);
    setCoverFile(undefined);
    setCoverPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return '';
    });
  };

  const selectScene = (scene: CalmScene) => {
    setForm(formFromScene(scene));
    clearUpload();
    setMessage('');
    setError('');
  };

  const newScene = () => {
    setForm(
      blankForm(
        catalog.scenes.length ? Math.max(...catalog.scenes.map((scene) => scene.sortOrder)) + 1 : 0,
      ),
    );
    clearUpload();
    setMessage('');
    setError('');
  };

  /** Validates the file, then derives the cover from its first frame. */
  const chooseVideo = async (file: File | undefined) => {
    setMessage('');
    setError('');
    clearUpload();
    if (!file) return;
    setBusy(true);
    try {
      if (file.type !== 'video/mp4') throw new Error('Video must be an MP4 file.');
      if (file.size > MAX_VIDEO_BYTES)
        throw new Error('Video is larger than the allowed limit of 50 MB.');
      const { cover } = await readVideo(file);
      setVideoFile(file);
      setCoverFile(cover);
      setCoverPreview(URL.createObjectURL(cover));
    } catch (caught) {
      setError(recoverableMessage(caught, 'The video could not be read. Try another file.'));
    } finally {
      setBusy(false);
    }
  };

  const save = async (status: CalmScene['status']) => {
    setError('');
    setMessage('');
    setBusy(true);
    try {
      if (!form.title.trim() || form.title.length > 80)
        throw new Error('Title must be between 1 and 80 characters.');
      const video = videoFile ? makeLocalRef(videoFile) : form.video;
      const poster = coverFile ? makeLocalRef(coverFile) : form.poster;
      if (!video || !poster) throw new Error('An MP4 video is required for every scene.');
      await repo.saveScene(
        {
          id: form.id || undefined,
          title: form.title,
          location: '',
          description: '',
          soundLabel: localSoundLabel,
          video,
          poster,
          attribution: {
            creator: localProvenance.creator,
            licenseId: localProvenance.licenseId,
            licenseUrl: getLicenseUrl(localProvenance.licenseId),
            changesMade: localProvenance.changesMade,
          },
          status,
          sortOrder: form.sortOrder,
          createdAt: form.createdAt,
        },
        { video: videoFile, poster: coverFile },
      );
      setMessage(
        status === 'published'
          ? "Scene added to this browser's experience."
          : 'Draft saved in this browser.',
      );
      await refresh();
      clearUpload();
    } catch (caught) {
      setError(recoverableMessage(caught, 'The scene could not be saved. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  const addSentence = async () => {
    const text = sentenceText.trim();
    setSentenceError('');
    setSentenceMessage('');
    setSentenceBusy(true);
    try {
      if (!text || text.length > 160)
        throw new Error('Sentence must be between 1 and 160 characters.');
      await repo.addSentence(text);
      setSentenceText('');
      setSentenceMessage('Sentence added to this browser.');
      await refresh();
    } catch (caught) {
      setSentenceError(recoverableMessage(caught, 'The sentence could not be saved. Try again.'));
    } finally {
      setSentenceBusy(false);
    }
  };

  const remove = async (scene: CalmScene) => {
    setPendingDelete(null);
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
    setResetOpen(false);
    try {
      await repo.reset();
      setForm(blankForm());
      clearUpload();
      setSentenceMessage('');
      setSentenceError('');
      setMessage('Local edits were reset.');
      await refresh();
    } catch (caught) {
      setError(recoverableMessage(caught, 'The local catalog could not be reset.'));
    }
  };

  const orderedScenes = [...catalog.scenes].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
  );

  const existingCover =
    form.video && !coverPreview
      ? form.poster?.kind === 'bundled'
        ? `/media/scenes/${form.id}/poster.jpg`
        : (posterUrls[form.id] ?? '')
      : '';

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <p className="text-sm font-medium">Local administration</p>
          <nav aria-label="Administration navigation" className="flex items-center gap-1">
            <Link href="/" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Back home
            </Link>
            <Link href="/demo" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Open demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-normal tracking-tight sm:text-3xl">
            Keep the scene shelf close.
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Give a scene a title and an MP4. Add the short lines the demo shows when a picture
            changes.
          </p>
        </div>

        <Alert className="mt-6">
          <AlertDescription>
            Local demo admin. Changes stay in this browser and are not published to other people.
          </AlertDescription>
        </Alert>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Scene catalog</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={newScene}>
                  <Plus data-icon="inline-start" />
                  Add scene
                </Button>
                <Button size="sm" variant="outline" onClick={() => setResetOpen(true)}>
                  <RotateCcw data-icon="inline-start" />
                  Reset local edits
                </Button>
              </div>

              <ul className="flex flex-col gap-2">
                {orderedScenes.map((scene, index) => (
                  <li
                    key={scene.id}
                    className={cn(
                      'flex items-center gap-3 rounded-md border p-2',
                      form.id === scene.id ? 'border-primary bg-muted' : 'border-border',
                    )}
                    aria-current={form.id === scene.id ? 'true' : undefined}
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {scene.poster.kind === 'bundled' || posterUrls[scene.id] ? (
                        <Image
                          src={
                            scene.poster.kind === 'bundled'
                              ? `/media/scenes/${scene.id}/poster.jpg`
                              : posterUrls[scene.id]
                          }
                          alt=""
                          fill
                          sizes="48px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate text-sm font-medium">{scene.title}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={scene.status === 'published' ? 'default' : 'secondary'}>
                          {scene.status}
                        </Badge>
                        order {scene.sortOrder + 1}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move ${scene.title} up`}
                        disabled={index === 0}
                        onClick={() => void move(scene, -1)}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move ${scene.title} down`}
                        disabled={index === orderedScenes.length - 1}
                        onClick={() => void move(scene, 1)}
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${scene.title}`}
                        onClick={() => selectScene(scene)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        aria-label={`Delete ${scene.title}`}
                        onClick={() => setPendingDelete(scene)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="text-sm text-muted-foreground">
                Used storage: {bytes(storage.usedBytes)}. Estimated quota:{' '}
                {bytes(storage.quotaBytes)}. Private mode or site-data clearing may remove edits.
              </p>
            </CardContent>
          </Card>

          <Card data-ready={ready ? 'true' : undefined}>
            <CardHeader>
              <CardTitle>
                <h2>{form.id ? 'Edit scene' : 'Add scene'}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="scene-title">Title</FieldLabel>
                <Input
                  id="scene-title"
                  value={form.title}
                  maxLength={80}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="scene-video">MP4 video</FieldLabel>
                <Input
                  id="scene-video"
                  type="file"
                  accept="video/mp4"
                  onChange={(event) => void chooseVideo(event.target.files?.[0])}
                />
                <FieldDescription>
                  {videoFile
                    ? `Selected: ${videoFile.name}`
                    : form.video
                      ? `Current: ${form.video.kind === 'local' ? form.video.fileName : 'bundled scene'}`
                      : `MP4 between ${MIN_SECONDS} and ${MAX_SECONDS} seconds, up to 50 MB. The cover is taken from the first frame.`}
                </FieldDescription>
              </Field>

              <div className="flex items-start gap-3">
                <div
                  data-testid="scene-cover-preview"
                  className="relative aspect-tile w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
                >
                  {coverPreview || existingCover ? (
                    <Image
                      src={coverPreview || existingCover}
                      alt="Cover taken from the first frame of the video"
                      fill
                      sizes="96px"
                      unoptimized
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {busy
                    ? 'Reading the video and taking the cover.'
                    : coverPreview
                      ? 'Cover taken from the first frame of the video.'
                      : existingCover
                        ? 'Current cover.'
                        : 'The cover appears here once a video is chosen.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy || !ready}
                  onClick={() => void save('draft')}
                >
                  Save draft
                </Button>
                <Button disabled={busy || !ready} onClick={() => void save('published')}>
                  Show in experience
                </Button>
              </div>

              <div aria-live="polite" className="flex flex-col gap-2 empty:hidden">
                {message ? (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                ) : null}
                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              <h2>Sentence bank</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              The demo chooses one nature sentence at random whenever a video or personal photo is
              selected.
            </p>
            <ul className="flex flex-col gap-2" aria-label="Nature sentence bank">
              {sentenceBank.sentences
                .filter((sentence) => sentence.section === 'nature')
                .map((sentence) => (
                  <li
                    key={sentence.id}
                    className="rounded-md border border-border px-3 py-2 text-sm"
                  >
                    {sentence.text}
                  </li>
                ))}
            </ul>
            <Field>
              <FieldLabel htmlFor="sentence-text">Add a sentence</FieldLabel>
              <Input
                id="sentence-text"
                value={sentenceText}
                maxLength={160}
                onChange={(event) => setSentenceText(event.target.value)}
              />
              <FieldDescription>
                Up to 160 characters. It stays in this browser until local edits are reset.
              </FieldDescription>
            </Field>
            <div>
              <Button
                disabled={sentenceBusy || !sentenceText.trim()}
                onClick={() => void addSentence()}
              >
                <Plus data-icon="inline-start" />
                Add sentence
              </Button>
            </div>
            <div aria-live="polite" className="flex flex-col gap-2 empty:hidden">
              {sentenceMessage ? (
                <Alert>
                  <AlertDescription>{sentenceMessage}</AlertDescription>
                </Alert>
              ) : null}
              {sentenceError ? (
                <Alert variant="destructive">
                  <AlertDescription>{sentenceError}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              <h2>Phone preview</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg">
              <WebExperience
                key={[
                  catalog.scenes.map((scene) => `${scene.id}:${scene.updatedAt}`).join('|'),
                  sentenceBank.sentences
                    .map((sentence) => `${sentence.id}:${sentence.text}`)
                    .join('|'),
                ].join('|')}
                repository={repo}
              />
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => (open ? undefined : setPendingDelete(null))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this scene?</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `${pendingDelete.title} is removed from this browser. This cannot be undone.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" nativeButton={false} render={<DialogClose />}>
              Keep the scene
            </Button>
            <Button
              variant="destructive"
              onClick={() => pendingDelete && void remove(pendingDelete)}
            >
              Delete scene
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset local edits?</DialogTitle>
            <DialogDescription>
              Local scenes and added sentences are removed. The four bundled scenes and default
              sentences are restored. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" nativeButton={false} render={<DialogClose />}>
              Keep my edits
            </Button>
            <Button variant="destructive" onClick={() => void reset()}>
              Reset catalog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
