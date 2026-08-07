// Client boundary: the admin owns IndexedDB, file selection, and browser confirmation dialogs.
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
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
import {
  Box,
  Button,
  Card,
  CardContent,
  CheckboxField,
  FileInput,
  IconButton,
  Image,
  PaperText,
  Screen,
  SelectField,
  StatusMessage,
  TextInput,
  ButtonLink,
} from '@calm/ui';

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

  const licenseOptions = Object.entries(licenseDefinitions).map(([value, definition]) => ({
    value,
    label: definition.label,
  }));

  return (
    <Screen className="admin-page">
      <Box className="admin-header">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/demo" tone="secondary">
          Open demo
        </ButtonLink>
      </Box>
      <Box className="admin-content" accessibilityRole="main">
        <PaperText variant="labelLarge" tone="muted" className="eyebrow">
          Local administration
        </PaperText>
        <PaperText variant="displaySmall" accessibilityRole="header" accessibilityLevel={1}>
          Keep the scene shelf close.
        </PaperText>
        <PaperText variant="bodyLarge" tone="muted" className="section-lead">
          Add a private scene for this browser, preview it in the real phone surface, and decide
          whether it stays a draft or appears in the demo.
        </PaperText>
        <StatusMessage>
          Local demo admin. Changes stay in this browser and are not published to other people.
        </StatusMessage>
        <Box className="admin-layout">
          <Card className="admin-card">
            <CardContent>
              <PaperText variant="headlineSmall" accessibilityRole="header" accessibilityLevel={2}>
                Scene catalog
              </PaperText>
              <Box className="form-actions">
                <Button icon="plus" onPress={newScene}>
                  Add scene
                </Button>
                <Button icon="reset" tone="secondary" onPress={reset}>
                  Reset local edits
                </Button>
              </Box>
              <Box className="admin-list">
                {[...catalog.scenes]
                  .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
                  .map((scene, index, list) => (
                    <Box
                      className={`admin-row ${form.id === scene.id ? 'admin-row-selected' : ''}`}
                      key={scene.id}
                    >
                      <Image
                        source={
                          scene.poster.kind === 'bundled'
                            ? `/media/scenes/${scene.id}/poster.jpg`
                            : (posterUrls[scene.id] ?? '')
                        }
                        alt=""
                        className="admin-row-image"
                      />
                      <Box className="admin-row-copy">
                        <PaperText variant="titleSmall">{scene.title}</PaperText>
                        <PaperText variant="bodySmall" tone="muted">
                          {scene.status} - order {scene.sortOrder + 1}
                        </PaperText>
                      </Box>
                      <Box className="admin-row-actions">
                        <IconButton
                          icon="arrowUp"
                          accessibilityLabel={`Move ${scene.title} up`}
                          disabled={index === 0}
                          onPress={() => void move(scene, -1)}
                        />
                        <IconButton
                          icon="arrowDown"
                          accessibilityLabel={`Move ${scene.title} down`}
                          disabled={index === list.length - 1}
                          onPress={() => void move(scene, 1)}
                        />
                        <IconButton
                          icon="edit"
                          accessibilityLabel={`Edit ${scene.title}`}
                          onPress={() => selectScene(scene)}
                        />
                        <IconButton
                          icon="trash"
                          accessibilityLabel={`Delete ${scene.title}`}
                          onPress={() => void remove(scene)}
                        />
                      </Box>
                    </Box>
                  ))}
              </Box>
              <PaperText variant="bodySmall" tone="muted" className="storage">
                Used storage: {bytes(storage.usedBytes)}. Estimated quota:{' '}
                {bytes(storage.quotaBytes)}. Private mode or site-data clearing may remove edits.
              </PaperText>
            </CardContent>
          </Card>
          <Card className="admin-card">
            <CardContent>
              <PaperText variant="headlineSmall" accessibilityRole="header" accessibilityLevel={2}>
                {form.id ? 'Edit scene' : 'Add scene'}
              </PaperText>
              <Box className="form-grid">
                <FieldText
                  label="Title"
                  value={form.title}
                  maxLength={80}
                  onChangeText={(value) => update('title', value)}
                />
                <FieldText
                  label="Location"
                  value={form.location}
                  maxLength={100}
                  onChangeText={(value) => update('location', value)}
                />
                <FieldText
                  label="Description"
                  value={form.description}
                  maxLength={240}
                  multiline
                  className="form-field-full form-textarea"
                  onChangeText={(value) => update('description', value)}
                />
                <FieldText
                  label="Sound label"
                  value={form.soundLabel}
                  maxLength={80}
                  onChangeText={(value) => update('soundLabel', value)}
                />
                <FieldText
                  label="Creator"
                  value={form.creator}
                  maxLength={120}
                  onChangeText={(value) => update('creator', value)}
                />
                <FieldText
                  label="Source URL"
                  value={form.sourceUrl}
                  keyboardType="url"
                  className="form-field-full"
                  onChangeText={(value) => update('sourceUrl', value)}
                />
                <SelectField
                  label="License"
                  value={form.licenseId}
                  options={licenseOptions}
                  onChange={(value) => update('licenseId', value as LicenseId)}
                />
                <FieldText
                  label="Order"
                  value={String(form.sortOrder)}
                  keyboardType="numeric"
                  onChangeText={(value) => update('sortOrder', Number(value))}
                />
                <FieldText
                  label="Changes made"
                  value={form.changesMade}
                  maxLength={500}
                  multiline
                  className="form-field-full form-textarea"
                  onChangeText={(value) => update('changesMade', value)}
                />
                <FileInput
                  label="MP4 video"
                  accept="video/mp4"
                  hint={
                    form.video
                      ? `Current: ${form.video.kind === 'local' ? form.video.fileName : 'bundled scene'}`
                      : 'Required for a new scene.'
                  }
                  onChange={setVideoFile}
                />
                <FileInput
                  label="Poster"
                  accept="image/jpeg,image/png,image/webp"
                  hint={
                    form.poster
                      ? `Current: ${form.poster.kind === 'local' ? form.poster.fileName : 'bundled poster'}`
                      : 'Required for a new scene.'
                  }
                  onChange={setPosterFile}
                />
                <CheckboxField
                  className="form-field-full"
                  checked={audioConfirmed}
                  onChange={setAudioConfirmed}
                  label="I confirm that the uploaded video contains embedded audio. This demo does not accept a separate audio upload."
                />
              </Box>
              <Box className="form-actions">
                <Button tone="secondary" onPress={() => void save('draft')}>
                  Save draft
                </Button>
                <Button onPress={() => void save('published')}>Publish</Button>
              </Box>
              {message ? <StatusMessage>{message}</StatusMessage> : null}
              {error ? <StatusMessage error>{error}</StatusMessage> : null}
            </CardContent>
          </Card>
        </Box>
        <Card className="admin-card admin-preview-card">
          <CardContent>
            <PaperText variant="headlineSmall" accessibilityRole="header" accessibilityLevel={2}>
              Phone preview
            </PaperText>
            <Box className="admin-preview">
              <WebExperience repository={repo} compact />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Screen>
  );
}

function FieldText({
  label,
  className,
  ...props
}: ComponentProps<typeof TextInput> & { label: string; className?: string }) {
  return (
    <Box className={className}>
      <PaperText variant="labelLarge">{label}</PaperText>
      <TextInput {...props} accessibilityLabel={label} />
    </Box>
  );
}
