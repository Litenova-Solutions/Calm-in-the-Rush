// Client boundary: the editor owns IndexedDB, device file selection, and confirmation dialogs.
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  ImageIcon,
  ImagePlus,
  Link2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Wind,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  createExperienceId,
  imageFileAccept,
  isGalleryScreen,
  seedExperience,
  type ExperienceConfig,
  type ExperienceScreen,
  type ExperienceTile,
  type GalleryScreen,
} from '@/lib/content/experience';
import { BrowserExperienceRepository, type StorageReport } from '@/lib/content/browser-repository';

type AdminSection = 'screens' | 'one-liner' | 'local-data';
type ScreenType = ExperienceScreen['type'];
type ScreenDraft = { mode: 'new' | 'edit'; screen: ExperienceScreen };
type TileDraft = {
  mode: 'new' | 'edit';
  screenId: string;
  tileId?: string;
  type: ExperienceTile['type'];
};
type PendingAction =
  | { type: 'screen'; screenId: string; title: string }
  | { type: 'tile'; screenId: string; tileId: string; title: string }
  | { type: 'reset' }
  | null;

const sections: { id: AdminSection; label: string }[] = [
  { id: 'screens', label: 'Screens' },
  { id: 'one-liner', label: 'One-liner' },
  { id: 'local-data', label: 'Local data' },
];

function bytes(value: number | null): string {
  if (value === null) return 'unknown';
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function screenKindLabel(type: ScreenType): string {
  if (type === 'gallery') return 'Photo gallery';
  if (type === 'breathing') return 'Breathing';
  return 'RUST gateway';
}

function tileLabel(tile: ExperienceTile): string {
  return tile.type === 'prefilled' ? tile.title : tile.label;
}

function replaceScreen(config: ExperienceConfig, screen: ExperienceScreen): ExperienceConfig {
  return {
    ...config,
    screens: config.screens.map((candidate) => (candidate.id === screen.id ? screen : candidate)),
  };
}

function defaultScreen(type: ScreenType): ExperienceScreen {
  const id = createExperienceId('screen');
  if (type === 'gallery') {
    return {
      id,
      type,
      title: 'New gallery',
      description: 'A short introduction for this photo gallery.',
      useFirstTileAsCover: false,
      repeatCoverInGallery: false,
      tiles: [],
    };
  }
  if (type === 'breathing') {
    return {
      id,
      type,
      title: 'Take a Breath',
      description: 'Follow the gentle movement at your own pace.',
    };
  }
  return {
    id,
    type,
    title: 'RUST in de Reuring',
    description: 'Find more people and moments that make space for calm.',
    links: [],
  };
}

function duplicateScreen(screen: ExperienceScreen): ExperienceScreen {
  if (screen.type === 'gallery') {
    return {
      ...screen,
      id: createExperienceId('screen'),
      title: `${screen.title} copy`.slice(0, 60),
      tiles: screen.tiles.map((tile) => ({ ...tile, id: createExperienceId('tile') })),
    };
  }
  if (screen.type === 'gateway') {
    return {
      ...screen,
      id: createExperienceId('screen'),
      title: `${screen.title} copy`.slice(0, 60),
      links: screen.links.map((link) => ({ ...link, id: createExperienceId('link') })),
    };
  }
  return {
    ...screen,
    id: createExperienceId('screen'),
    title: `${screen.title} copy`.slice(0, 60),
  };
}

function updateScreenDraft(
  draft: ScreenDraft | null,
  setDraft: (draft: ScreenDraft | null) => void,
  patch: Partial<ExperienceScreen>,
) {
  if (!draft) return;
  setDraft({ ...draft, screen: { ...draft.screen, ...patch } as ExperienceScreen });
}

export default function AdminClient() {
  const repo = useMemo(() => new BrowserExperienceRepository(), []);
  const [experience, setExperience] = useState<ExperienceConfig>(seedExperience);
  const [section, setSection] = useState<AdminSection>('screens');
  const [screenDraft, setScreenDraft] = useState<ScreenDraft | null>(null);
  const [tileDraft, setTileDraft] = useState<TileDraft | null>(null);
  const [tileTitle, setTileTitle] = useState('');
  const [tileAlt, setTileAlt] = useState('');
  const [tileSentence, setTileSentence] = useState('');
  const [tileUploadLabel, setTileUploadLabel] = useState('');
  const [tileFile, setTileFile] = useState<File | null>(null);
  const [oneLinerDraft, setOneLinerDraft] = useState(seedExperience.oneLiner);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [storage, setStorage] = useState<StorageReport>({ usedBytes: 0, quotaBytes: null });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [nextExperience, nextStorage] = await Promise.all([
        repo.readExperience(),
        repo.getStorageReport(),
      ]);
      setExperience(nextExperience);
      setOneLinerDraft(nextExperience.oneLiner);
      setStorage(nextStorage);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Local experience data could not be read.',
      );
    } finally {
      setReady(true);
    }
  }, [repo]);

  useEffect(() => {
    void refresh();
    return () => repo.dispose();
  }, [refresh, repo]);

  const store = async (next: ExperienceConfig, successMessage: string): Promise<boolean> => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const saved = await repo.saveExperience(next);
      setExperience(saved);
      setOneLinerDraft(saved.oneLiner);
      setStorage(await repo.getStorageReport());
      setMessage(successMessage);
      return true;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'The local experience could not be saved.',
      );
      return false;
    } finally {
      setBusy(false);
    }
  };

  const moveScreen = async (screen: ExperienceScreen, direction: -1 | 1) => {
    const index = experience.screens.findIndex((candidate) => candidate.id === screen.id);
    const target = index + direction;
    if (target < 0 || target >= experience.screens.length) return;
    const screens = [...experience.screens];
    [screens[index], screens[target]] = [screens[target]!, screens[index]!];
    await store({ ...experience, screens }, 'Screen order saved in this browser.');
  };

  const openTileDraft = (screenId: string, type: ExperienceTile['type'], tile?: ExperienceTile) => {
    setTileDraft({ mode: tile ? 'edit' : 'new', screenId, tileId: tile?.id, type });
    setTileFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (tile?.type === 'prefilled') {
      setTileTitle(tile.title);
      setTileAlt(tile.alt);
      setTileSentence(tile.sentence);
      setTileUploadLabel('');
      return;
    }
    setTileTitle('');
    setTileAlt('');
    setTileSentence(tile?.sentence ?? '');
    setTileUploadLabel(tile?.type === 'upload' ? tile.label : 'Add a photo');
  };

  const closeTileDraft = () => {
    setTileDraft(null);
    setTileFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const saveScreen = async () => {
    if (!screenDraft) return;
    const title = screenDraft.screen.title.trim();
    if (!title) {
      setError('Every screen needs a title.');
      return;
    }
    const screen = { ...screenDraft.screen, title } as ExperienceScreen;
    const next =
      screenDraft.mode === 'new'
        ? { ...experience, screens: [...experience.screens, screen] }
        : replaceScreen(experience, screen);
    if (
      await store(
        next,
        screenDraft.mode === 'new'
          ? 'Screen added to this browser.'
          : 'Screen saved in this browser.',
      )
    ) {
      setScreenDraft(null);
    }
  };

  const saveTile = async () => {
    if (!tileDraft) return;
    const screen = experience.screens.find((candidate) => candidate.id === tileDraft.screenId);
    if (!screen || !isGalleryScreen(screen)) {
      setError('That gallery screen is no longer available.');
      closeTileDraft();
      return;
    }
    if (tileDraft.type === 'upload') {
      const label = tileUploadLabel.trim();
      const sentence = tileSentence.trim();
      if (!label) {
        setError('An upload tile needs visible instructions.');
        return;
      }
      if (sentence.length > 160) {
        setError('Assigned sentence must be 160 characters or fewer.');
        return;
      }
      const tiles =
        tileDraft.mode === 'new'
          ? [
              ...screen.tiles,
              { id: createExperienceId('tile'), type: 'upload' as const, label, sentence },
            ]
          : screen.tiles.map((tile) =>
              tile.id === tileDraft.tileId && tile.type === 'upload'
                ? { ...tile, label, sentence }
                : tile,
            );
      if (
        await store(
          replaceScreen(experience, { ...screen, tiles }),
          'Upload tile saved in this browser.',
        )
      ) {
        closeTileDraft();
      }
      return;
    }
    if (tileDraft.mode === 'new' && !tileFile) {
      setError('Choose a photo for the pre-filled tile.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const input = { title: tileTitle, alt: tileAlt, sentence: tileSentence };
      const saved =
        tileDraft.mode === 'new'
          ? await repo.addPrefilledTile(screen.id, input, tileFile!)
          : await repo.updatePrefilledTile(screen.id, tileDraft.tileId!, input, tileFile);
      setExperience(saved);
      setOneLinerDraft(saved.oneLiner);
      setStorage(await repo.getStorageReport());
      setMessage('Photo tile saved in this browser.');
      closeTileDraft();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The photo tile could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const moveTile = async (screen: GalleryScreen, tile: ExperienceTile, direction: -1 | 1) => {
    const index = screen.tiles.findIndex((candidate) => candidate.id === tile.id);
    const target = index + direction;
    if (target < 0 || target >= screen.tiles.length) return;
    const movingToCover = screen.useFirstTileAsCover && target === 0 && tile.type !== 'prefilled';
    if (movingToCover) {
      setError('The first tile must be a pre-filled photo while this gallery uses a cover.');
      return;
    }
    const tiles = [...screen.tiles];
    [tiles[index], tiles[target]] = [tiles[target]!, tiles[index]!];
    await store(
      replaceScreen(experience, { ...screen, tiles }),
      'Tile order saved in this browser.',
    );
  };

  const removeScreen = async (screenId: string) => {
    await store(
      { ...experience, screens: experience.screens.filter((screen) => screen.id !== screenId) },
      'Screen removed from this browser.',
    );
  };

  const removeTile = async (screenId: string, tileId: string) => {
    const screen = experience.screens.find((candidate) => candidate.id === screenId);
    if (!screen || !isGalleryScreen(screen)) return;
    const index = screen.tiles.findIndex((tile) => tile.id === tileId);
    if (screen.useFirstTileAsCover && index === 0) {
      setError('Turn off the cover setting or move another pre-filled photo first.');
      return;
    }
    await store(
      replaceScreen(experience, {
        ...screen,
        tiles: screen.tiles.filter((tile) => tile.id !== tileId),
      }),
      'Tile removed from this browser.',
    );
  };

  const confirmPendingAction = async () => {
    const action = pendingAction;
    setPendingAction(null);
    if (!action) return;
    if (action.type === 'screen') {
      await removeScreen(action.screenId);
      return;
    }
    if (action.type === 'tile') {
      await removeTile(action.screenId, action.tileId);
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await repo.reset();
      await refresh();
      setMessage('Local experience data was reset.');
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'The local experience could not be reset.',
      );
    } finally {
      setBusy(false);
    }
  };

  const saveOneLinerSettings = async () => {
    await store(
      { ...experience, oneLiner: oneLinerDraft },
      'One-liner settings saved in this browser.',
    );
  };

  const editedScreen = tileDraft
    ? experience.screens.find((screen) => screen.id === tileDraft.screenId)
    : undefined;
  const editedTile =
    tileDraft?.tileId && editedScreen && isGalleryScreen(editedScreen)
      ? editedScreen.tiles.find((tile) => tile.id === tileDraft.tileId)
      : undefined;
  const gatewayDraft = screenDraft?.screen.type === 'gateway' ? screenDraft.screen : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 py-3">
          <p className="text-sm font-medium">Local administration</p>
          <Link href="/" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Open demo
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-normal tracking-tight sm:text-3xl">Manage the experience</h1>
          <p className="max-w-2xl text-muted-foreground">
            Configure screens, photos, tile-specific sentences, and browser-only visitor data.
          </p>
        </div>
        <Alert className="mt-6">
          <AlertDescription>
            Local-only admin. Content, photos, and visitor one-liners stay in this browser.
          </AlertDescription>
        </Alert>
        <div aria-live="polite" className="mt-6 flex flex-col gap-2 empty:hidden">
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
        <nav
          aria-label="Administration sections"
          className="mt-6 flex flex-wrap gap-2 rounded-xl border border-border bg-card/70 p-1.5 shadow-xs"
        >
          {sections.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant={item.id === section ? 'default' : 'ghost'}
              size="sm"
              aria-pressed={item.id === section}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
        {section === 'screens' ? (
          <Card className="mt-6" data-ready={ready ? 'true' : undefined}>
            <CardHeader className="border-b border-border">
              <CardTitle>
                <h2>Screens and tiles</h2>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                The first pre-filled tile on the first gallery screen can act as the opening cover.
                Each tile owns its own sentence, so photo and copy always stay together.
              </p>
            </CardHeader>
            <CardContent className="gap-5">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setScreenDraft({ mode: 'new', screen: defaultScreen('gallery') })}
                >
                  <ImagePlus className="size-4" aria-hidden />
                  Add gallery
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setScreenDraft({ mode: 'new', screen: defaultScreen('breathing') })
                  }
                >
                  <Wind className="size-4" aria-hidden />
                  Add breathing screen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setScreenDraft({ mode: 'new', screen: defaultScreen('gateway') })}
                >
                  <Link2 className="size-4" aria-hidden />
                  Add RUST gateway
                </Button>
              </div>
              {experience.screens.length ? (
                <div className="flex flex-col gap-4">
                  {experience.screens.map((screen, screenIndex) => (
                    <section
                      key={screen.id}
                      aria-labelledby={`screen-${screen.id}`}
                      className="rounded-xl border border-border bg-background/50"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 id={`screen-${screen.id}`} className="text-base font-medium">
                              {screen.title}
                            </h3>
                            <Badge variant="secondary">{screenKindLabel(screen.type)}</Badge>
                            {screenIndex === 0 &&
                            screen.type === 'gallery' &&
                            screen.useFirstTileAsCover ? (
                              <Badge>Cover source</Badge>
                            ) : null}
                          </div>
                          {screen.description ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {screen.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={busy || screenIndex === 0}
                            aria-label={`Move ${screen.title} up`}
                            onClick={() => void moveScreen(screen, -1)}
                          >
                            <ArrowUp className="size-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={busy || screenIndex === experience.screens.length - 1}
                            aria-label={`Move ${screen.title} down`}
                            onClick={() => void moveScreen(screen, 1)}
                          >
                            <ArrowDown className="size-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${screen.title}`}
                            onClick={() => setScreenDraft({ mode: 'edit', screen })}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Duplicate ${screen.title}`}
                            onClick={() =>
                              void store(
                                {
                                  ...experience,
                                  screens: [...experience.screens, duplicateScreen(screen)],
                                },
                                'Screen duplicated in this browser.',
                              )
                            }
                          >
                            <Copy className="size-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Remove ${screen.title}`}
                            onClick={() =>
                              setPendingAction({
                                type: 'screen',
                                screenId: screen.id,
                                title: screen.title,
                              })
                            }
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </div>
                      {screen.type === 'gallery' ? (
                        <div className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openTileDraft(screen.id, 'prefilled')}
                            >
                              <ImageIcon className="size-4" aria-hidden />
                              Add photo tile
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openTileDraft(screen.id, 'upload')}
                            >
                              <Plus className="size-4" aria-hidden />
                              Add upload tile
                            </Button>
                          </div>
                          {screen.tiles.length ? (
                            <ol
                              className="mt-4 flex flex-col gap-2"
                              aria-label={`${screen.title} tiles`}
                            >
                              {screen.tiles.map((tile, tileIndex) => (
                                <li
                                  key={tile.id}
                                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/60 p-3"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-medium">{tileLabel(tile)}</p>
                                      <Badge variant="secondary">
                                        {tile.type === 'prefilled' ? 'Photo' : 'Visitor upload'}
                                      </Badge>
                                      {screen.useFirstTileAsCover && tileIndex === 0 ? (
                                        <Badge>Cover</Badge>
                                      ) : null}
                                    </div>
                                    {tile.sentence ? (
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        {tile.sentence}
                                      </p>
                                    ) : null}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      disabled={busy || tileIndex === 0}
                                      aria-label={`Move ${tileLabel(tile)} up`}
                                      onClick={() => void moveTile(screen, tile, -1)}
                                    >
                                      <ArrowUp className="size-4" aria-hidden />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      disabled={busy || tileIndex === screen.tiles.length - 1}
                                      aria-label={`Move ${tileLabel(tile)} down`}
                                      onClick={() => void moveTile(screen, tile, 1)}
                                    >
                                      <ArrowDown className="size-4" aria-hidden />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      aria-label={`Edit ${tileLabel(tile)}`}
                                      onClick={() => openTileDraft(screen.id, tile.type, tile)}
                                    >
                                      <Pencil className="size-4" aria-hidden />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      aria-label={`Remove ${tileLabel(tile)}`}
                                      onClick={() =>
                                        setPendingAction({
                                          type: 'tile',
                                          screenId: screen.id,
                                          tileId: tile.id,
                                          title: tileLabel(tile),
                                        })
                                      }
                                    >
                                      <Trash2 className="size-4" aria-hidden />
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p className="mt-4 text-sm text-muted-foreground">No tiles yet.</p>
                          )}
                        </div>
                      ) : screen.type === 'breathing' ? (
                        <div className="p-4 text-sm text-muted-foreground">
                          A slow, repeated visual cue with no playback controls or phase labels.
                        </div>
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground">
                          {screen.links.length} external{' '}
                          {screen.links.length === 1 ? 'link' : 'links'}.
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background/50 p-6 text-center text-sm text-muted-foreground">
                  No screens are configured. Add a gallery, breathing screen, or RUST gateway.
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
        {section === 'one-liner' ? (
          <Card className="mt-6">
            <CardHeader className="border-b border-border">
              <CardTitle>
                <h2>Visitor one-liner</h2>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                This prompt remains a browser-local visitor response, not a tile sentence.
              </p>
            </CardHeader>
            <CardContent>
              <form
                className="flex max-w-xl flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveOneLinerSettings();
                }}
              >
                <label
                  className="flex items-center gap-2 text-sm font-medium"
                  htmlFor="one-liner-enabled"
                >
                  <input
                    id="one-liner-enabled"
                    type="checkbox"
                    checked={oneLinerDraft.enabled}
                    onChange={(event) =>
                      setOneLinerDraft({ ...oneLinerDraft, enabled: event.target.checked })
                    }
                  />
                  Show the reflection prompt on the final RUST page
                </label>
                <Field>
                  <FieldLabel htmlFor="one-liner-prompt">Prompt</FieldLabel>
                  <Input
                    id="one-liner-prompt"
                    value={oneLinerDraft.prompt}
                    maxLength={200}
                    disabled={!oneLinerDraft.enabled}
                    onChange={(event) =>
                      setOneLinerDraft({ ...oneLinerDraft, prompt: event.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="one-liner-placeholder">Input placeholder</FieldLabel>
                  <Input
                    id="one-liner-placeholder"
                    value={oneLinerDraft.placeholder}
                    maxLength={100}
                    disabled={!oneLinerDraft.enabled}
                    onChange={(event) =>
                      setOneLinerDraft({ ...oneLinerDraft, placeholder: event.target.value })
                    }
                  />
                  <FieldDescription>
                    Visitor answers are always limited to 160 characters and saved only in this
                    browser.
                  </FieldDescription>
                </Field>
                <Button type="submit" className="self-start" disabled={busy}>
                  Save one-liner settings
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
        {section === 'local-data' ? (
          <Card className="mt-6">
            <CardHeader className="border-b border-border">
              <CardTitle>
                <h2>Local data</h2>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Photos, settings, and visitor one-liners do not leave this browser.
              </p>
            </CardHeader>
            <CardContent className="gap-5">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-background/50 p-3">
                  <dt className="text-muted-foreground">Media stored by this experience</dt>
                  <dd className="mt-1 text-base font-medium">{bytes(storage.usedBytes)}</dd>
                </div>
                <div className="rounded-lg border border-border bg-background/50 p-3">
                  <dt className="text-muted-foreground">Estimated browser quota</dt>
                  <dd className="mt-1 text-base font-medium">{bytes(storage.quotaBytes)}</dd>
                </div>
              </dl>
              <Button
                type="button"
                variant="destructive"
                className="self-start"
                disabled={busy}
                onClick={() => setPendingAction({ type: 'reset' })}
              >
                <RotateCcw className="size-4" aria-hidden />
                Reset local experience
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </main>
      <Dialog
        open={screenDraft !== null}
        onOpenChange={(open) => {
          if (!open) setScreenDraft(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {screenDraft?.mode === 'new'
                ? `Add ${screenDraft.screen.type === 'gallery' ? 'gallery' : screenKindLabel(screenDraft.screen.type).toLowerCase()} screen`
                : `Edit ${screenDraft?.screen.title ?? 'screen'}`}
            </DialogTitle>
            <DialogDescription>
              Screen order controls the visitor journey. A gallery cover always uses its first
              pre-filled photo.
            </DialogDescription>
          </DialogHeader>
          {screenDraft ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void saveScreen();
              }}
            >
              <Field>
                <FieldLabel htmlFor="screen-title">Title</FieldLabel>
                <Input
                  id="screen-title"
                  value={screenDraft.screen.title}
                  maxLength={60}
                  autoFocus
                  onChange={(event) =>
                    updateScreenDraft(screenDraft, setScreenDraft, { title: event.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="screen-description">Description</FieldLabel>
                <Input
                  id="screen-description"
                  value={screenDraft.screen.description}
                  maxLength={160}
                  onChange={(event) =>
                    updateScreenDraft(screenDraft, setScreenDraft, {
                      description: event.target.value,
                    })
                  }
                />
              </Field>
              {screenDraft.screen.type === 'gallery' ? (
                <>
                  <label
                    className="flex items-center gap-2 text-sm font-medium"
                    htmlFor="screen-cover"
                  >
                    <input
                      id="screen-cover"
                      type="checkbox"
                      checked={screenDraft.screen.useFirstTileAsCover}
                      onChange={(event) =>
                        updateScreenDraft(screenDraft, setScreenDraft, {
                          useFirstTileAsCover: event.target.checked,
                        })
                      }
                    />
                    Use the first tile as the opening cover
                  </label>
                  <label
                    className="flex items-center gap-2 text-sm font-medium"
                    htmlFor="screen-repeat-cover"
                  >
                    <input
                      id="screen-repeat-cover"
                      type="checkbox"
                      disabled={!screenDraft.screen.useFirstTileAsCover}
                      checked={screenDraft.screen.repeatCoverInGallery}
                      onChange={(event) =>
                        updateScreenDraft(screenDraft, setScreenDraft, {
                          repeatCoverInGallery: event.target.checked,
                        })
                      }
                    />
                    Repeat the cover photo in the gallery grid
                  </label>
                </>
              ) : null}
              {screenDraft.screen.type === 'breathing' ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The visitor sees the title, short description, and a fixed slow visual cue.
                </p>
              ) : null}
              {gatewayDraft ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">External links</p>
                  {gatewayDraft.links.map((link, index) => (
                    <div key={link.id} className="rounded-lg border border-border p-3">
                      <Field>
                        <FieldLabel htmlFor={`gateway-link-label-${link.id}`}>
                          Link label
                        </FieldLabel>
                        <Input
                          id={`gateway-link-label-${link.id}`}
                          value={link.label}
                          maxLength={60}
                          onChange={(event) => {
                            const links = [...gatewayDraft.links];
                            links[index] = { ...link, label: event.target.value };
                            updateScreenDraft(screenDraft, setScreenDraft, { links });
                          }}
                        />
                      </Field>
                      <Field className="mt-3">
                        <FieldLabel htmlFor={`gateway-link-url-${link.id}`}>HTTPS URL</FieldLabel>
                        <Input
                          id={`gateway-link-url-${link.id}`}
                          type="url"
                          value={link.url}
                          onChange={(event) => {
                            const links = [...gatewayDraft.links];
                            links[index] = { ...link, url: event.target.value };
                            updateScreenDraft(screenDraft, setScreenDraft, { links });
                          }}
                        />
                      </Field>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          updateScreenDraft(screenDraft, setScreenDraft, {
                            links: gatewayDraft.links.filter(
                              (candidate) => candidate.id !== link.id,
                            ),
                          })
                        }
                      >
                        Remove link
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() =>
                      updateScreenDraft(screenDraft, setScreenDraft, {
                        links: [
                          ...gatewayDraft.links,
                          { id: createExperienceId('link'), label: 'New link', url: 'https://' },
                        ],
                      })
                    }
                  >
                    <Plus className="size-4" aria-hidden />
                    Add link
                  </Button>
                </div>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setScreenDraft(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || !screenDraft.screen.title.trim()}>
                  Save screen
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={tileDraft !== null}
        onOpenChange={(open) => {
          if (!open) closeTileDraft();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tileDraft?.mode === 'new'
                ? `Add ${tileDraft.type === 'prefilled' ? 'photo' : 'upload'} tile`
                : `Edit ${editedTile ? tileLabel(editedTile) : 'tile'}`}
            </DialogTitle>
            <DialogDescription>
              Assigned sentences display only with this tile. They never rotate between photos.
            </DialogDescription>
          </DialogHeader>
          {tileDraft ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void saveTile();
              }}
            >
              {tileDraft.type === 'prefilled' ? (
                <>
                  <Field>
                    <FieldLabel htmlFor="tile-title">Tile title</FieldLabel>
                    <Input
                      id="tile-title"
                      value={tileTitle}
                      maxLength={60}
                      autoFocus
                      onChange={(event) => setTileTitle(event.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="tile-alt">Photo description</FieldLabel>
                    <Input
                      id="tile-alt"
                      value={tileAlt}
                      maxLength={160}
                      onChange={(event) => setTileAlt(event.target.value)}
                    />
                    <FieldDescription>
                      Used as alternative text for visitors using assistive technology.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="tile-sentence">Assigned sentence</FieldLabel>
                    <Input
                      id="tile-sentence"
                      value={tileSentence}
                      maxLength={160}
                      onChange={(event) => setTileSentence(event.target.value)}
                    />
                    <FieldDescription>Optional, up to 160 characters.</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="tile-file">
                      {tileDraft.mode === 'new' ? 'Photo' : 'Replace photo'}
                    </FieldLabel>
                    <Input
                      ref={fileInputRef}
                      id="tile-file"
                      type="file"
                      accept={imageFileAccept}
                      onChange={(event) => setTileFile(event.target.files?.[0] ?? null)}
                    />
                    <FieldDescription>
                      {tileFile
                        ? `Selected: ${tileFile.name}`
                        : tileDraft.mode === 'new'
                          ? 'Choose a JPEG, PNG, WebP, or AVIF image.'
                          : 'Leave empty to keep the current photo.'}
                    </FieldDescription>
                  </Field>
                </>
              ) : (
                <>
                  <Field>
                    <FieldLabel htmlFor="upload-label">Upload instructions</FieldLabel>
                    <Input
                      id="upload-label"
                      value={tileUploadLabel}
                      maxLength={90}
                      autoFocus
                      onChange={(event) => setTileUploadLabel(event.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="upload-sentence">Assigned sentence</FieldLabel>
                    <Input
                      id="upload-sentence"
                      value={tileSentence}
                      maxLength={160}
                      onChange={(event) => setTileSentence(event.target.value)}
                    />
                    <FieldDescription>
                      Shown with the uploaded photo when the visitor adds one.
                    </FieldDescription>
                  </Field>
                </>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" disabled={busy} onClick={closeTileDraft}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={busy || (tileDraft.type === 'prefilled' && !tileTitle.trim())}
                >
                  Save tile
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.type === 'reset'
                ? 'Reset local experience?'
                : pendingAction?.type === 'screen'
                  ? 'Remove this screen?'
                  : 'Remove this tile?'}
            </DialogTitle>
            <DialogDescription>
              {pendingAction?.type === 'reset'
                ? 'All v4 experience settings, local photos, visitor uploads, and visitor one-liners are removed. The previous v3 browser database is removed too. This cannot be undone.'
                : pendingAction?.type === 'screen'
                  ? `${pendingAction.title} and any visitor uploads attached to its tiles are removed from this browser. This cannot be undone.`
                  : pendingAction?.type === 'tile'
                    ? `${pendingAction.title} and its visitor upload, if any, are removed from this browser. This cannot be undone.`
                    : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingAction(null)}>
              Keep it
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => void confirmPendingAction()}
            >
              {pendingAction?.type === 'reset' ? 'Reset experience' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
