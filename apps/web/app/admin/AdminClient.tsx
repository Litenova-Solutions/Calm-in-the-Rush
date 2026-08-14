// Client boundary: the admin owns IndexedDB, device file selection, and confirmation dialogs.
'use client';

import { type DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImageIcon,
  ImagePlus,
  MoveRight,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Video,
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
import { cn } from '@/lib/utils';

import {
  seedGallery,
  type GalleryConfig,
  type GalleryPage,
  type GalleryTile,
} from '@/lib/content/gallery';
import { BrowserGalleryRepository, type StorageReport } from '@/lib/content/browser-repository';

type PendingAction =
  | { type: 'page'; pageId: string; title: string }
  | { type: 'tile'; pageId: string; tileId: string; title: string }
  | { type: 'reset' }
  | null;

type AdminSection = 'gallery' | 'sentences' | 'storage';
type TileComposerMode = 'choose' | 'upload' | 'prefilled';

type TileComposer = {
  pageId: string;
  mode: TileComposerMode;
};

type TileEditor = {
  pageId: string;
  tileId: string;
};

type TileMover = {
  pageId: string;
  tileId: string;
};

type DraggedTile = {
  pageId: string;
  tileId: string;
};

const adminSections: { id: AdminSection; label: string }[] = [
  { id: 'gallery', label: 'Gallery' },
  { id: 'sentences', label: 'Sentences' },
  { id: 'storage', label: 'Local data' },
];

function bytes(value: number | null): string {
  if (value === null) return 'unknown';
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function updatePage(config: GalleryConfig, page: GalleryPage): GalleryConfig {
  return {
    ...config,
    pages: config.pages.map((candidate) => (candidate.id === page.id ? page : candidate)),
  };
}

function tileLabel(tile: GalleryTile): string {
  return tile.type === 'prefilled' ? tile.title : tile.label;
}

function tileKindLabel(tile: GalleryTile): string {
  if (tile.type === 'upload') return 'Visitor upload';
  return tile.media.mediaType === 'video' ? 'Video' : 'Image';
}

function tileCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'tile' : 'tiles'}`;
}

function draggedTileFromTransfer(value: string): DraggedTile | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof (parsed as DraggedTile).pageId !== 'string' ||
      typeof (parsed as DraggedTile).tileId !== 'string'
    )
      return null;
    return parsed as DraggedTile;
  } catch {
    return null;
  }
}

export default function AdminClient() {
  const repo = useMemo(() => new BrowserGalleryRepository(), []);
  const [gallery, setGallery] = useState<GalleryConfig>(seedGallery);
  const [activeSection, setActiveSection] = useState<AdminSection>('gallery');
  const [draggedTile, setDraggedTile] = useState<DraggedTile | null>(null);
  const [addingPage, setAddingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState('');
  const [tileComposer, setTileComposer] = useState<TileComposer | null>(null);
  const [composerUploadLabel, setComposerUploadLabel] = useState('Add a photo or video');
  const [composerTitle, setComposerTitle] = useState('');
  const [composerAlt, setComposerAlt] = useState('');
  const [composerFile, setComposerFile] = useState<File | null>(null);
  const [tileEditor, setTileEditor] = useState<TileEditor | null>(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorAlt, setEditorAlt] = useState('');
  const [editorUploadLabel, setEditorUploadLabel] = useState('');
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [tileMover, setTileMover] = useState<TileMover | null>(null);
  const [sentenceText, setSentenceText] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [storage, setStorage] = useState<StorageReport>({ usedBytes: 0, quotaBytes: null });
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const composerFileInputRef = useRef<HTMLInputElement | null>(null);
  const editorFileInputRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [nextGallery, nextStorage] = await Promise.all([
        repo.readGallery(),
        repo.getStorageReport(),
      ]);
      setGallery(nextGallery);
      setStorage(nextStorage);
      setReady(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Local gallery data could not be read.');
      setReady(true);
    }
  }, [repo]);

  useEffect(() => {
    void refresh();
    return () => repo.dispose();
  }, [refresh, repo]);

  const store = async (next: GalleryConfig, successMessage: string): Promise<boolean> => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const saved = await repo.saveGallery(next);
      setGallery(saved);
      setStorage(await repo.getStorageReport());
      setMessage(successMessage);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The gallery could not be saved.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const clearTileComposer = () => {
    setTileComposer(null);
    setComposerUploadLabel('Add a photo or video');
    setComposerTitle('');
    setComposerAlt('');
    setComposerFile(null);
    if (composerFileInputRef.current) composerFileInputRef.current.value = '';
  };

  const openTileComposer = (pageId: string) => {
    clearTileComposer();
    setTileEditor(null);
    setTileMover(null);
    setTileComposer({ pageId, mode: 'choose' });
  };

  const selectComposerMode = (mode: TileComposerMode) => {
    setTileComposer((current) => (current ? { ...current, mode } : current));
  };

  const addPage = async () => {
    const title = newPageTitle.trim();
    if (!title) {
      setError('Enter a page name before adding it.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const next = await repo.addPage(title);
      setGallery(next);
      setNewPageTitle('');
      setAddingPage(false);
      setStorage(await repo.getStorageReport());
      setMessage('Gallery page added to this browser.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The gallery page could not be added.');
    } finally {
      setBusy(false);
    }
  };

  const beginPageEdit = (page: GalleryPage) => {
    setEditingPageId(page.id);
    setEditingPageTitle(page.title);
  };

  const savePageTitle = async (page: GalleryPage) => {
    const title = editingPageTitle.trim();
    if (!title) {
      setError('A gallery page needs a name.');
      return;
    }
    if (
      await store(
        updatePage(gallery, {
          ...page,
          title,
        }),
        'Page name saved in this browser.',
      )
    )
      setEditingPageId(null);
  };

  const movePage = async (page: GalleryPage, direction: -1 | 1) => {
    const index = gallery.pages.findIndex((candidate) => candidate.id === page.id);
    const target = index + direction;
    if (target < 0 || target >= gallery.pages.length) return;
    const pages = [...gallery.pages];
    [pages[index], pages[target]] = [pages[target]!, pages[index]!];
    await store({ ...gallery, pages }, 'Gallery page order saved in this browser.');
  };

  const addUploadTile = async (pageId: string) => {
    const page = gallery.pages.find((candidate) => candidate.id === pageId);
    const label = composerUploadLabel.trim();
    if (!page) {
      setError('The selected gallery page no longer exists.');
      return;
    }
    if (!label) {
      setError('Enter the prompt shown for this upload tile.');
      return;
    }
    const tileId = globalThis.crypto?.randomUUID?.() ?? `upload-${Date.now()}`;
    if (
      await store(
        updatePage(gallery, {
          ...page,
          tiles: [...page.tiles, { id: tileId, type: 'upload', label }],
        }),
        'Upload tile added to this browser.',
      )
    )
      clearTileComposer();
  };

  const addPrefilledTile = async (pageId: string) => {
    if (!composerFile) {
      setError('Choose an image or video for the pre-filled tile.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const next = await repo.addPrefilledTile(pageId, composerTitle, composerAlt, composerFile);
      setGallery(next);
      setStorage(await repo.getStorageReport());
      setMessage('Pre-filled media added to this browser.');
      clearTileComposer();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'The pre-filled media could not be added.',
      );
    } finally {
      setBusy(false);
    }
  };

  const beginTileEdit = (pageId: string, tile: GalleryTile) => {
    setTileComposer(null);
    setTileMover(null);
    setTileEditor({ pageId, tileId: tile.id });
    setEditorFile(null);
    if (editorFileInputRef.current) editorFileInputRef.current.value = '';
    if (tile.type === 'prefilled') {
      setEditorTitle(tile.title);
      setEditorAlt(tile.alt);
      setEditorUploadLabel('');
      return;
    }
    setEditorTitle('');
    setEditorAlt('');
    setEditorUploadLabel(tile.label);
  };

  const closeTileEditor = () => {
    setTileEditor(null);
    setEditorTitle('');
    setEditorAlt('');
    setEditorUploadLabel('');
    setEditorFile(null);
    if (editorFileInputRef.current) editorFileInputRef.current.value = '';
  };

  const saveTileEdit = async () => {
    if (!tileEditor) return;
    const page = gallery.pages.find((candidate) => candidate.id === tileEditor.pageId);
    const tile = page?.tiles.find((candidate) => candidate.id === tileEditor.tileId);
    if (!page || !tile) {
      setError('That tile is no longer available.');
      closeTileEditor();
      return;
    }

    if (tile.type === 'upload') {
      const label = editorUploadLabel.trim();
      if (!label) {
        setError('Enter the prompt shown for this upload tile.');
        return;
      }
      if (
        await store(
          updatePage(gallery, {
            ...page,
            tiles: page.tiles.map((candidate) =>
              candidate.id === tile.id ? { ...candidate, label } : candidate,
            ),
          }),
          'Upload tile saved in this browser.',
        )
      )
        closeTileEditor();
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');
    try {
      const next = await repo.updatePrefilledTile(
        page.id,
        tile.id,
        editorTitle,
        editorAlt,
        editorFile,
      );
      setGallery(next);
      setStorage(await repo.getStorageReport());
      setMessage('Pre-filled tile saved in this browser.');
      closeTileEditor();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'The pre-filled tile could not be saved.',
      );
    } finally {
      setBusy(false);
    }
  };

  const addSentence = async () => {
    const sentence = sentenceText.trim();
    if (!sentence) {
      setError('Enter a sentence before adding it.');
      return;
    }
    if (gallery.sentences.length >= 24) {
      setError('The gallery can contain up to 24 sentences.');
      return;
    }
    if (
      await store(
        { ...gallery, sentences: [...gallery.sentences, sentence] },
        'Sentence added to this browser.',
      )
    )
      setSentenceText('');
  };

  const removeSentence = async (index: number) => {
    if (gallery.sentences.length <= 1) {
      setError('Keep at least one gallery sentence.');
      return;
    }
    await store(
      { ...gallery, sentences: gallery.sentences.filter((_, candidate) => candidate !== index) },
      'Sentence removed from this browser.',
    );
  };

  const moveTileWithinPage = async (page: GalleryPage, tile: GalleryTile, direction: -1 | 1) => {
    const index = page.tiles.findIndex((candidate) => candidate.id === tile.id);
    const target = index + direction;
    if (target < 0 || target >= page.tiles.length) return;
    const tiles = [...page.tiles];
    [tiles[index], tiles[target]] = [tiles[target]!, tiles[index]!];
    await store(updatePage(gallery, { ...page, tiles }), 'Tile order saved in this browser.');
  };

  const moveTileToPage = async (
    sourcePageId: string,
    tileId: string,
    targetPageId: string,
    targetIndex: number,
  ) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const next = await repo.moveTile(sourcePageId, tileId, targetPageId, targetIndex);
      setGallery(next);
      setStorage(await repo.getStorageReport());
      setMessage('Tile position saved in this browser.');
      setTileMover(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The tile could not be moved.');
    } finally {
      setBusy(false);
      setDraggedTile(null);
    }
  };

  const startTileDrag = (event: DragEvent<HTMLLIElement>, pageId: string, tileId: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify({ pageId, tileId }));
    setDraggedTile({ pageId, tileId });
  };

  const dropTile = (event: DragEvent<HTMLElement>, targetPageId: string, targetIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    const source = draggedTile ?? draggedTileFromTransfer(event.dataTransfer.getData('text/plain'));
    if (!source || busy) return;
    void moveTileToPage(source.pageId, source.tileId, targetPageId, targetIndex);
  };

  const removePage = async (pageId: string) => {
    if (gallery.pages.length <= 1) {
      setError('Keep at least one gallery page.');
      return;
    }
    await store(
      { ...gallery, pages: gallery.pages.filter((page) => page.id !== pageId) },
      'Gallery page removed from this browser.',
    );
  };

  const removeTile = async (pageId: string, tileId: string) => {
    const page = gallery.pages.find((candidate) => candidate.id === pageId);
    if (!page) {
      setError('That tile is no longer available.');
      return;
    }
    await store(
      updatePage(gallery, { ...page, tiles: page.tiles.filter((tile) => tile.id !== tileId) }),
      'Tile removed from this browser.',
    );
  };

  const reset = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await repo.reset();
      setGallery(seedGallery);
      setStorage({ usedBytes: 0, quotaBytes: null });
      await refresh();
      setMessage('Local gallery edits were reset.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The local gallery could not be reset.');
    } finally {
      setBusy(false);
    }
  };

  const confirmPendingAction = async () => {
    const action = pendingAction;
    setPendingAction(null);
    if (!action) return;
    if (action.type === 'page') {
      await removePage(action.pageId);
      return;
    }
    if (action.type === 'tile') {
      await removeTile(action.pageId, action.tileId);
      return;
    }
    await reset();
  };

  const composerPage = tileComposer
    ? gallery.pages.find((page) => page.id === tileComposer.pageId)
    : undefined;
  const editorPage = tileEditor
    ? gallery.pages.find((page) => page.id === tileEditor.pageId)
    : undefined;
  const editedTile = tileEditor
    ? editorPage?.tiles.find((tile) => tile.id === tileEditor.tileId)
    : undefined;
  const moveSourcePage = tileMover
    ? gallery.pages.find((page) => page.id === tileMover.pageId)
    : undefined;
  const movedTile = tileMover
    ? moveSourcePage?.tiles.find((tile) => tile.id === tileMover.tileId)
    : undefined;

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
          <h1 className="text-2xl font-normal tracking-tight sm:text-3xl">Manage the gallery</h1>
          <p className="max-w-2xl text-muted-foreground">
            Pages and tiles stay in the same ordered view that visitors use. Add, move, and edit
            content in place.
          </p>
        </div>

        <Alert className="mt-6">
          <AlertDescription>
            Local demo admin. Page setup and every selected image or video stay in this browser.
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
          {adminSections.map((section) => (
            <Button
              key={section.id}
              type="button"
              variant={section.id === activeSection ? 'default' : 'ghost'}
              size="sm"
              aria-pressed={section.id === activeSection}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </nav>

        {activeSection === 'gallery' ? (
          <Card className="mt-6" data-ready={ready ? 'true' : undefined}>
            <CardHeader className="border-b border-border">
              <CardTitle>
                <h2>Gallery editor</h2>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Each page contains the exact tiles it can show. There is no fixed tile limit: the
                number of tiles on a page is the number available to visitors.
              </p>
            </CardHeader>
            <CardContent className="gap-4">
              <p className="text-sm text-muted-foreground">
                Drag a tile to reorder it or place it under another page. Use the Move action when a
                keyboard or a precise destination is more convenient.
              </p>

              <div className="flex flex-col gap-4" aria-label="Gallery page and tile editor">
                {gallery.pages.map((page, pageIndex) => (
                  <section
                    key={page.id}
                    aria-label={`${page.title} page`}
                    className={cn(
                      'overflow-hidden rounded-lg border border-border bg-background/45 transition-colors',
                      draggedTile ? 'border-dashed' : '',
                    )}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => dropTile(event, page.id, page.tiles.length)}
                  >
                    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start sm:justify-between">
                      {editingPageId === page.id ? (
                        <form
                          className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end"
                          onSubmit={(event) => {
                            event.preventDefault();
                            void savePageTitle(page);
                          }}
                        >
                          <Field className="min-w-0 flex-1">
                            <FieldLabel htmlFor={`page-title-${page.id}`}>Page name</FieldLabel>
                            <Input
                              id={`page-title-${page.id}`}
                              value={editingPageTitle}
                              maxLength={60}
                              autoFocus
                              onChange={(event) => setEditingPageTitle(event.target.value)}
                            />
                          </Field>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={busy || !editingPageTitle.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => setEditingPageId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Page {pageIndex + 1}
                          </p>
                          <h3 className="truncate text-base font-medium">{page.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {tileCountLabel(page.tiles.length)}
                          </p>
                        </div>
                      )}

                      {editingPageId !== page.id ? (
                        <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => beginPageEdit(page)}
                          >
                            <Pencil data-icon="inline-start" />
                            Edit page
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Move ${page.title} up`}
                            title={`Move ${page.title} up`}
                            disabled={busy || pageIndex === 0}
                            onClick={() => void movePage(page, -1)}
                          >
                            <ArrowUp />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Move ${page.title} down`}
                            title={`Move ${page.title} down`}
                            disabled={busy || pageIndex === gallery.pages.length - 1}
                            onClick={() => void movePage(page, 1)}
                          >
                            <ArrowDown />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            aria-label={`Remove ${page.title}`}
                            title={`Remove ${page.title}`}
                            disabled={busy || gallery.pages.length === 1}
                            onClick={() =>
                              setPendingAction({ type: 'page', pageId: page.id, title: page.title })
                            }
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    <div className="border-t border-border">
                      {page.tiles.length > 0 ? (
                        <ol
                          className="flex flex-col divide-y divide-border"
                          aria-label={`${page.title} tiles`}
                        >
                          {page.tiles.map((tile, tileIndex) => (
                            <li
                              key={tile.id}
                              draggable={!busy}
                              className={cn(
                                'flex flex-wrap items-center gap-2 bg-background/30 p-3 transition-colors',
                                draggedTile?.pageId === page.id && draggedTile.tileId === tile.id
                                  ? 'opacity-50'
                                  : 'hover:bg-muted/55',
                              )}
                              onDragStart={(event) => startTileDrag(event, page.id, tile.id)}
                              onDragEnd={() => setDraggedTile(null)}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => dropTile(event, page.id, tileIndex)}
                            >
                              <GripVertical
                                className="size-4 shrink-0 text-muted-foreground"
                                aria-hidden
                              />
                              <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                {tile.type === 'prefilled' && tile.media.kind === 'bundled' ? (
                                  tile.media.mediaType === 'video' ? (
                                    <video
                                      src={tile.media.src}
                                      poster={tile.media.poster}
                                      muted
                                      playsInline
                                      preload="metadata"
                                      aria-hidden
                                      className="absolute inset-0 size-full object-cover"
                                    />
                                  ) : (
                                    <Image
                                      src={tile.media.src}
                                      alt=""
                                      fill
                                      sizes="40px"
                                      unoptimized
                                      className="object-cover"
                                    />
                                  )
                                ) : tile.type === 'prefilled' &&
                                  tile.media.mediaType === 'video' ? (
                                  <Video className="size-4 text-muted-foreground" aria-hidden />
                                ) : tile.type === 'prefilled' ? (
                                  <ImageIcon className="size-4 text-muted-foreground" aria-hidden />
                                ) : (
                                  <ImagePlus className="size-4 text-muted-foreground" aria-hidden />
                                )}
                              </div>
                              <div className="min-w-32 flex-1">
                                <p className="truncate text-sm font-medium">{tileLabel(tile)}</p>
                                <Badge
                                  variant={tile.type === 'prefilled' ? 'default' : 'secondary'}
                                >
                                  {tileKindLabel(tile)}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  disabled={busy}
                                  onClick={() => beginTileEdit(page.id, tile)}
                                >
                                  <Pencil data-icon="inline-start" />
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  disabled={busy || gallery.pages.length === 1}
                                  onClick={() => {
                                    setTileComposer(null);
                                    setTileEditor(null);
                                    setTileMover({ pageId: page.id, tileId: tile.id });
                                  }}
                                >
                                  <MoveRight data-icon="inline-start" />
                                  Move
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  aria-label={`Move ${tileLabel(tile)} up`}
                                  title={`Move ${tileLabel(tile)} up`}
                                  disabled={busy || tileIndex === 0}
                                  onClick={() => void moveTileWithinPage(page, tile, -1)}
                                >
                                  <ArrowUp />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  aria-label={`Move ${tileLabel(tile)} down`}
                                  title={`Move ${tileLabel(tile)} down`}
                                  disabled={busy || tileIndex === page.tiles.length - 1}
                                  onClick={() => void moveTileWithinPage(page, tile, 1)}
                                >
                                  <ArrowDown />
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon-xs"
                                  aria-label={`Remove ${tileLabel(tile)}`}
                                  title={`Remove ${tileLabel(tile)}`}
                                  disabled={busy}
                                  onClick={() =>
                                    setPendingAction({
                                      type: 'tile',
                                      pageId: page.id,
                                      tileId: tile.id,
                                      title: tileLabel(tile),
                                    })
                                  }
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <div className="p-3 text-sm text-muted-foreground">
                          No tiles yet. Add the first tile below, or drag one here from another
                          page.
                        </div>
                      )}

                      <div
                        className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/35 p-3"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => dropTile(event, page.id, page.tiles.length)}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => openTileComposer(page.id)}
                        >
                          <Plus data-icon="inline-start" />
                          Add tile
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Drop a tile here to place it last.
                        </p>
                      </div>
                    </div>
                  </section>
                ))}
              </div>

              {addingPage ? (
                <form
                  className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/35 p-3 sm:flex-row sm:items-end"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void addPage();
                  }}
                >
                  <Field className="min-w-0 flex-1">
                    <FieldLabel htmlFor="new-page-title">New page name</FieldLabel>
                    <Input
                      id="new-page-title"
                      value={newPageTitle}
                      maxLength={60}
                      autoFocus
                      onChange={(event) => setNewPageTitle(event.target.value)}
                    />
                  </Field>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={busy || !newPageTitle.trim()}>
                      Add page
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => {
                        setAddingPage(false);
                        setNewPageTitle('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setAddingPage(true)}
                  >
                    <Plus data-icon="inline-start" />
                    Add page
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {activeSection === 'sentences' ? (
          <Card className="mt-6 max-w-2xl">
            <CardHeader>
              <CardTitle>
                <h2>Sentences</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                One sentence appears over selected media and changes with each new selection.
              </p>
              <ul className="flex flex-col gap-2" aria-label="Gallery sentences">
                {gallery.sentences.map((sentence, index) => (
                  <li
                    key={`${sentence}-${index}`}
                    className="flex items-center gap-2 rounded-md border border-border p-2"
                  >
                    <span className="min-w-0 flex-1 text-sm">{sentence}</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      aria-label={`Remove sentence ${index + 1}`}
                      title={`Remove sentence ${index + 1}`}
                      disabled={busy || gallery.sentences.length === 1}
                      onClick={() => void removeSentence(index)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
              <form
                className="flex flex-col gap-3 sm:flex-row sm:items-end"
                onSubmit={(event) => {
                  event.preventDefault();
                  void addSentence();
                }}
              >
                <Field className="min-w-0 flex-1">
                  <FieldLabel htmlFor="gallery-sentence">New sentence</FieldLabel>
                  <Input
                    id="gallery-sentence"
                    value={sentenceText}
                    maxLength={160}
                    onChange={(event) => setSentenceText(event.target.value)}
                  />
                </Field>
                <Button type="submit" disabled={busy || !sentenceText.trim()}>
                  <Plus data-icon="inline-start" />
                  Add sentence
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {activeSection === 'storage' ? (
          <Card className="mt-6 max-w-2xl">
            <CardHeader>
              <CardTitle>
                <h2>Local data</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Used storage: {bytes(storage.usedBytes)}. Estimated quota:{' '}
                {bytes(storage.quotaBytes)}. Private mode or site-data clearing may remove these
                edits.
              </p>
              <div>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy}
                  onClick={() => setPendingAction({ type: 'reset' })}
                >
                  <RotateCcw data-icon="inline-start" />
                  Reset local gallery
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>

      <Dialog
        open={tileComposer !== null}
        onOpenChange={(open) => {
          if (!open) clearTileComposer();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {composerPage ? `Add tile to ${composerPage.title}` : 'Add tile'}
            </DialogTitle>
            <DialogDescription>
              Choose whether visitors upload their own media or the page opens pre-filled media.
            </DialogDescription>
          </DialogHeader>

          {composerPage && tileComposer?.mode === 'choose' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-auto min-h-28 items-start justify-start px-4 py-4 text-left whitespace-normal"
                onClick={() => selectComposerMode('upload')}
              >
                <ImagePlus className="mt-0.5 size-5" aria-hidden />
                <span className="flex flex-col gap-1">
                  <span>Visitor upload</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Add a space where a visitor chooses a photo or video.
                  </span>
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto min-h-28 items-start justify-start px-4 py-4 text-left whitespace-normal"
                onClick={() => selectComposerMode('prefilled')}
              >
                <ImageIcon className="mt-0.5 size-5" aria-hidden />
                <span className="flex flex-col gap-1">
                  <span>Pre-filled media</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Choose the image or video visitors can select immediately.
                  </span>
                </span>
              </Button>
            </div>
          ) : null}

          {composerPage && tileComposer?.mode === 'upload' ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void addUploadTile(composerPage.id);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Visitor upload</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => selectComposerMode('choose')}
                >
                  Choose another type
                </Button>
              </div>
              <Field>
                <FieldLabel htmlFor="composer-upload-label">Upload prompt</FieldLabel>
                <Input
                  id="composer-upload-label"
                  value={composerUploadLabel}
                  maxLength={60}
                  autoFocus
                  onChange={(event) => setComposerUploadLabel(event.target.value)}
                />
                <FieldDescription>
                  Visitors see this text before choosing their media.
                </FieldDescription>
              </Field>
              <DialogFooter>
                <Button type="button" variant="outline" disabled={busy} onClick={clearTileComposer}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || !composerUploadLabel.trim()}>
                  Add upload tile
                </Button>
              </DialogFooter>
            </form>
          ) : null}

          {composerPage && tileComposer?.mode === 'prefilled' ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void addPrefilledTile(composerPage.id);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Pre-filled media</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => selectComposerMode('choose')}
                >
                  Choose another type
                </Button>
              </div>
              <Field>
                <FieldLabel htmlFor="composer-title">Tile title</FieldLabel>
                <Input
                  id="composer-title"
                  value={composerTitle}
                  maxLength={60}
                  autoFocus
                  onChange={(event) => setComposerTitle(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="composer-alt">Media description</FieldLabel>
                <Input
                  id="composer-alt"
                  value={composerAlt}
                  maxLength={160}
                  onChange={(event) => setComposerAlt(event.target.value)}
                />
                <FieldDescription>Used as alternative text in the phone gallery.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="composer-media">Image or video</FieldLabel>
                <Input
                  ref={composerFileInputRef}
                  id="composer-media"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(event) => setComposerFile(event.target.files?.[0] ?? null)}
                />
                <FieldDescription>
                  {composerFile
                    ? `Selected: ${composerFile.name}`
                    : 'Choose an image or video file.'}
                </FieldDescription>
              </Field>
              <DialogFooter>
                <Button type="button" variant="outline" disabled={busy} onClick={clearTileComposer}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || !composerTitle.trim() || !composerFile}>
                  Add media
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={tileEditor !== null}
        onOpenChange={(open) => {
          if (!open) closeTileEditor();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editedTile ? `Edit ${tileLabel(editedTile)}` : 'Edit tile'}</DialogTitle>
            <DialogDescription>
              Update the information visitors see. Replacing pre-filled media keeps this tile in the
              same position.
            </DialogDescription>
          </DialogHeader>

          {editedTile?.type === 'upload' ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void saveTileEdit();
              }}
            >
              <Field>
                <FieldLabel htmlFor="editor-upload-label">Upload prompt</FieldLabel>
                <Input
                  id="editor-upload-label"
                  value={editorUploadLabel}
                  maxLength={60}
                  autoFocus
                  onChange={(event) => setEditorUploadLabel(event.target.value)}
                />
                <FieldDescription>
                  Visitors see this before choosing a photo or video.
                </FieldDescription>
              </Field>
              <DialogFooter>
                <Button type="button" variant="outline" disabled={busy} onClick={closeTileEditor}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || !editorUploadLabel.trim()}>
                  Save tile
                </Button>
              </DialogFooter>
            </form>
          ) : editedTile?.type === 'prefilled' ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void saveTileEdit();
              }}
            >
              <Field>
                <FieldLabel htmlFor="editor-title">Tile title</FieldLabel>
                <Input
                  id="editor-title"
                  value={editorTitle}
                  maxLength={60}
                  autoFocus
                  onChange={(event) => setEditorTitle(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="editor-alt">Media description</FieldLabel>
                <Input
                  id="editor-alt"
                  value={editorAlt}
                  maxLength={160}
                  onChange={(event) => setEditorAlt(event.target.value)}
                />
                <FieldDescription>Used as alternative text in the phone gallery.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="editor-media">Replace image or video</FieldLabel>
                <Input
                  ref={editorFileInputRef}
                  id="editor-media"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(event) => setEditorFile(event.target.files?.[0] ?? null)}
                />
                <FieldDescription>
                  {editorFile
                    ? `Selected: ${editorFile.name}`
                    : 'Leave empty to keep the current media.'}
                </FieldDescription>
              </Field>
              <DialogFooter>
                <Button type="button" variant="outline" disabled={busy} onClick={closeTileEditor}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || !editorTitle.trim()}>
                  Save tile
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={tileMover !== null}
        onOpenChange={(open) => {
          if (!open) setTileMover(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{movedTile ? `Move ${tileLabel(movedTile)}` : 'Move tile'}</DialogTitle>
            <DialogDescription>
              Choose the destination page. The tile is added at the end; drag it afterwards when a
              different position is needed.
            </DialogDescription>
          </DialogHeader>

          {moveSourcePage && movedTile ? (
            <div className="flex flex-col gap-2">
              {gallery.pages
                .filter((page) => page.id !== moveSourcePage.id)
                .map((page) => (
                  <Button
                    key={page.id}
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    disabled={busy}
                    onClick={() =>
                      void moveTileToPage(
                        moveSourcePage.id,
                        movedTile.id,
                        page.id,
                        page.tiles.length,
                      )
                    }
                  >
                    {page.title}
                  </Button>
                ))}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setTileMover(null)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => (open ? undefined : setPendingAction(null))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.type === 'reset'
                ? 'Reset local gallery?'
                : pendingAction?.type === 'page'
                  ? 'Remove this gallery page?'
                  : 'Remove this tile?'}
            </DialogTitle>
            <DialogDescription>
              {pendingAction?.type === 'reset'
                ? 'All local page setup and uploaded media are removed. The three default pages are restored. This cannot be undone.'
                : pendingAction?.type === 'page'
                  ? `${pendingAction.title} and its local media are removed from this browser. This cannot be undone.`
                  : pendingAction?.type === 'tile'
                    ? `${pendingAction.title} is removed from this browser. This cannot be undone.`
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
              {pendingAction?.type === 'reset' ? 'Reset gallery' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
