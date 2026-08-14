// Client boundary: this surface owns the local gallery, device media selection, and IndexedDB reads.
'use client';

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImagePlus, Images, Share2, X } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  galleryUploadKey,
  seedGallery,
  type GalleryConfig,
  type GalleryMedia,
  type GalleryPage,
  type GalleryUpload,
} from '@/lib/content/gallery';
import { BrowserGalleryRepository } from '@/lib/content/browser-repository';

type SelectedMedia = {
  pageId: string;
  tileId: string;
  title: string;
  media: GalleryMedia;
  alt: string;
};

type VisibleTile =
  | {
      type: 'media';
      id: string;
      title: string;
      media: GalleryMedia;
      alt: string;
    }
  | {
      type: 'upload';
      id: string;
      label: string;
    };

type UploadTarget = {
  pageId: string;
  tileId: string;
};

type PageDirection = 'forward' | 'backward';

const playbackControlsIdleMs = 3500;
const activeControlClass =
  'border border-stage-foreground/30 bg-scrim/70 text-stage-foreground shadow-sm backdrop-blur-md hover:bg-scrim/85';
const galleryGlassSurfaceClass =
  'rounded-xl border border-foreground/15 bg-background/80 shadow-md backdrop-blur-md';

interface WebExperienceProps {
  repository?: BrowserGalleryRepository;
}

function uploadMap(uploads: readonly GalleryUpload[]): Map<string, GalleryUpload> {
  return new Map(uploads.map((upload) => [galleryUploadKey(upload.pageId, upload.tileId), upload]));
}

function visibleTiles(page: GalleryPage, uploads: Map<string, GalleryUpload>): VisibleTile[] {
  let nextUploadShown = false;
  return page.tiles.flatMap((tile): VisibleTile[] => {
    if (tile.type === 'prefilled') {
      return [{ type: 'media', id: tile.id, title: tile.title, media: tile.media, alt: tile.alt }];
    }
    const upload = uploads.get(galleryUploadKey(page.id, tile.id));
    if (upload) {
      return [
        {
          type: 'media',
          id: tile.id,
          title: upload.media.fileName,
          media: upload.media,
          alt: upload.media.fileName,
        },
      ];
    }
    if (nextUploadShown) return [];
    nextUploadShown = true;
    return [{ type: 'upload', id: tile.id, label: tile.label }];
  });
}

function availableMedia(
  config: GalleryConfig,
  uploads: Map<string, GalleryUpload>,
): SelectedMedia[] {
  return config.pages.flatMap((page) =>
    visibleTiles(page, uploads).flatMap((tile): SelectedMedia[] => {
      if (tile.type !== 'media') return [];
      return [
        { pageId: page.id, tileId: tile.id, title: tile.title, media: tile.media, alt: tile.alt },
      ];
    }),
  );
}

function mediaSource(media: GalleryMedia, localUrls: Record<string, string>): string {
  return media.kind === 'bundled' ? media.src : (localUrls[media.blobId] ?? '');
}

function mediaPoster(media: GalleryMedia): string | undefined {
  return media.kind === 'bundled' && media.mediaType === 'video' ? media.poster : undefined;
}

function useReducedMotionPreference(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

function GalleryTileMedia({
  media,
  source,
  alt,
  reducedMotion,
}: {
  media: GalleryMedia;
  source: string;
  alt: string;
  reducedMotion: boolean;
}) {
  if (!source) return null;
  if (media.mediaType === 'video') {
    const poster = mediaPoster(media);
    if (reducedMotion && poster) {
      return (
        <Image
          src={poster}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 33vw, 9rem"
          unoptimized
          className="object-cover"
        />
      );
    }
    return (
      <video
        src={source}
        poster={poster}
        autoPlay={!reducedMotion}
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
    );
  }
  return (
    <Image
      src={source}
      alt={alt}
      fill
      sizes="(max-width: 1024px) 33vw, 9rem"
      unoptimized
      className="object-cover"
    />
  );
}

export function WebExperience({ repository }: WebExperienceProps) {
  const repo = useMemo(() => repository ?? new BrowserGalleryRepository(), [repository]);
  const [gallery, setGallery] = useState<GalleryConfig>(seedGallery);
  const [uploads, setUploads] = useState<GalleryUpload[]>([]);
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<SelectedMedia | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [sentenceRevision, setSentenceRevision] = useState(0);
  const [soundRequested, setSoundRequested] = useState(false);
  const [playbackRevision, setPlaybackRevision] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [pageDirection, setPageDirection] = useState<PageDirection>('forward');
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const galleryControlRef = useRef<HTMLButtonElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const controlTimerRef = useRef<number | undefined>(undefined);
  const reducedMotion = useReducedMotionPreference();

  const clearControlTimer = useCallback(() => {
    if (controlTimerRef.current === undefined) return;
    window.clearTimeout(controlTimerRef.current);
    controlTimerRef.current = undefined;
  }, []);

  const schedulePlaybackControlsHide = useCallback(() => {
    clearControlTimer();
    controlTimerRef.current = window.setTimeout(() => {
      if (stageRef.current?.contains(document.activeElement)) return;
      setControlsVisible(false);
    }, playbackControlsIdleMs);
  }, [clearControlTimer]);

  const revealPlaybackControls = useCallback(() => {
    if (galleryOpen || !selected) return;
    setControlsVisible(true);
    schedulePlaybackControlsHide();
  }, [galleryOpen, schedulePlaybackControlsHide, selected]);

  const refresh = useCallback(async () => {
    try {
      const [nextGallery, nextUploads] = await Promise.all([
        repo.readGallery(),
        repo.readGalleryUploads(),
      ]);
      const nextLocalUrls: Record<string, string> = {};
      const localMedia = [
        ...nextGallery.pages.flatMap((page) =>
          page.tiles.flatMap((tile) =>
            tile.type === 'prefilled' && tile.media.kind === 'local' ? [tile.media] : [],
          ),
        ),
        ...nextUploads.map((upload) => upload.media),
      ];
      for (const media of localMedia) {
        const url = await repo.getObjectUrl(media);
        if (url) nextLocalUrls[media.blobId] = url;
      }
      const nextUploadMap = uploadMap(nextUploads);
      const nextAvailableMedia = availableMedia(nextGallery, nextUploadMap);
      setGallery(nextGallery);
      setUploads(nextUploads);
      setLocalUrls(nextLocalUrls);
      setPageIndex((current) => Math.min(current, nextGallery.pages.length - 1));
      setSelected(
        (current) =>
          nextAvailableMedia.find(
            (candidate) =>
              candidate.pageId === current?.pageId && candidate.tileId === current?.tileId,
          ) ??
          nextAvailableMedia[0] ??
          null,
      );
    } catch {
      setMessage('Your local gallery could not be read. Showing the bundled gallery.');
      setGallery(seedGallery);
      setUploads([]);
    }
  }, [repo]);

  useEffect(() => {
    void refresh();
    return () => {
      if (!repository) repo.dispose();
    };
  }, [refresh, repo, repository]);

  useEffect(() => {
    if (galleryOpen || !selected) {
      clearControlTimer();
      setControlsVisible(true);
      return;
    }
    setControlsVisible(true);
    schedulePlaybackControlsHide();
    return clearControlTimer;
  }, [
    clearControlTimer,
    galleryOpen,
    schedulePlaybackControlsHide,
    selected?.pageId,
    selected?.tileId,
  ]);

  const currentPage = gallery.pages[pageIndex] ?? gallery.pages[0];
  const currentUploads = useMemo(() => uploadMap(uploads), [uploads]);
  const tiles = currentPage ? visibleTiles(currentPage, currentUploads) : [];
  const sentences = gallery.sentences;
  const selectedSource = selected ? mediaSource(selected.media, localUrls) : '';
  const selectedIsVideo = selected?.media.mediaType === 'video';
  const selectedPoster = selected ? mediaPoster(selected.media) : undefined;
  const isEmptyPage = tiles.length === 0;
  const isEmptyUploadPage =
    tiles.length === 1 &&
    tiles[0]?.type === 'upload' &&
    !tiles.some((tile) => tile.type === 'media');
  const tileRows = Math.max(1, Math.ceil(tiles.length / 3));
  const tileGridScrolls = tileRows > 4;
  const tileGridStyle = tileGridScrolls
    ? { gridAutoRows: 'minmax(7rem, 1fr)' }
    : { gridTemplateRows: `repeat(${tileRows}, minmax(0, 1fr))` };
  const previousPage = pageIndex > 0 ? gallery.pages[pageIndex - 1] : undefined;
  const nextPage = pageIndex < gallery.pages.length - 1 ? gallery.pages[pageIndex + 1] : undefined;

  const rotateSentence = () => {
    setSentenceIndex((current) => (current + 1) % sentences.length);
    setSentenceRevision((current) => current + 1);
  };

  useLayoutEffect(() => {
    if (!selectedIsVideo || !selectedSource || reducedMotion) return;
    const player = videoRef.current;
    if (!player) return;
    player.muted = !soundRequested;
    void player.play().catch(() => {
      if (soundRequested)
        setMessage('Sound could not start. Choose the video again to try once more.');
    });
  }, [playbackRevision, reducedMotion, selectedIsVideo, selectedSource, soundRequested]);

  const selectMedia = (tile: Extract<VisibleTile, { type: 'media' }>) => {
    if (!currentPage) return;
    setSelected({
      pageId: currentPage.id,
      tileId: tile.id,
      title: tile.title,
      media: tile.media,
      alt: tile.alt,
    });
    setSoundRequested(!reducedMotion && tile.media.mediaType === 'video');
    setPlaybackRevision((current) => current + 1);
    setGalleryOpen(false);
    setMessage('');
    rotateSentence();
  };

  const openGallery = () => {
    videoRef.current?.pause();
    setGalleryOpen(true);
    setMessage('');
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    window.setTimeout(() => galleryControlRef.current?.focus(), 0);
    if (selectedIsVideo && !reducedMotion) void videoRef.current?.play().catch(() => undefined);
  };

  const navigateGalleryPage = (nextPageIndex: number) => {
    setPageDirection(nextPageIndex > pageIndex ? 'forward' : 'backward');
    setPageIndex(nextPageIndex);
  };

  const chooseUpload = (tileId: string) => {
    if (!currentPage) return;
    setUploadTarget({ pageId: currentPage.id, tileId });
    photoInputRef.current?.click();
  };

  const saveUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    const target = uploadTarget;
    setUploadTarget(null);
    if (!file || !target) return;
    try {
      const upload = await repo.saveGalleryUpload(target.pageId, target.tileId, file);
      await refresh();
      setSelected({
        pageId: target.pageId,
        tileId: target.tileId,
        title: upload.media.fileName,
        media: upload.media,
        alt: upload.media.fileName,
      });
      setSoundRequested(!reducedMotion && upload.media.mediaType === 'video');
      setPlaybackRevision((current) => current + 1);
      setGalleryOpen(false);
      setMessage('');
      rotateSentence();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'The media could not be added.');
    }
  };

  const share = async () => {
    if (!selected) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: selected.title,
          text: 'A quiet minute in the middle of everything.',
          url: window.location.href,
        });
        setMessage('Shared.');
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setMessage('Link copied.');
        return;
      }
      const field = document.createElement('textarea');
      field.value = window.location.href;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      setMessage(copied ? 'Link copied.' : 'Sharing is not available here.');
    } catch {
      setMessage('Sharing is not available here.');
    }
  };

  return (
    <section
      ref={stageRef}
      aria-label="Calm gallery"
      className="relative size-full overflow-hidden rounded-phone-screen bg-stage"
      onPointerDown={revealPlaybackControls}
      onFocusCapture={revealPlaybackControls}
      onBlurCapture={schedulePlaybackControlsHide}
    >
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*,video/*"
        tabIndex={-1}
        aria-label="Choose a photo or video from your device"
        className="sr-only"
        onChange={(event) => void saveUpload(event)}
      />

      <div
        aria-hidden
        className="absolute top-2.5 left-1/2 z-30 h-4 w-16 -translate-x-1/2 rounded-full bg-device-shell"
      />

      {selectedSource ? (
        <div
          key={`${selected?.pageId ?? ''}-${selected?.tileId ?? ''}-${selectedSource}`}
          className="absolute inset-0 motion-safe:animate-media-arrive"
        >
          {selectedIsVideo && !reducedMotion ? (
            <video
              ref={videoRef}
              src={selectedSource}
              poster={selectedPoster}
              autoPlay
              loop
              muted={!soundRequested}
              playsInline
              preload="auto"
              aria-label={selected?.alt ?? 'Selected video'}
              className="absolute inset-0 size-full object-cover"
              onError={() => setMessage('The video could not load.')}
            >
              Your browser cannot play this video.
            </video>
          ) : selectedIsVideo && selected ? (
            selectedPoster ? (
              <Image
                src={selectedPoster}
                alt={selected.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 27rem"
                unoptimized
                className="object-cover"
                onError={() => setMessage('The selected media could not load.')}
              />
            ) : (
              <video
                src={selectedSource}
                muted
                playsInline
                preload="metadata"
                aria-label={selected.alt}
                className="absolute inset-0 size-full object-cover"
              />
            )
          ) : (
            <Image
              src={selectedSource}
              alt={selected?.alt ?? ''}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 27rem"
              unoptimized
              className="object-cover"
              onError={() => setMessage('The selected image could not load.')}
            />
          )}
        </div>
      ) : (
        <div className="flex size-full items-center justify-center p-8 text-center text-stage-foreground">
          <p>Open the gallery to add your first photo or video.</p>
        </div>
      )}

      {!galleryOpen && selected ? (
        <div className="pointer-events-none absolute inset-x-5 top-11 z-20">
          <p
            key={`${sentenceIndex}-${sentenceRevision}`}
            className="max-w-56 text-base leading-relaxed font-light tracking-normal text-stage-foreground mix-blend-difference drop-shadow-sm motion-safe:animate-sentence-arrive"
          >
            {sentences[sentenceIndex % sentences.length]}
          </p>
        </div>
      ) : null}

      {message && !galleryOpen ? (
        <Alert className="absolute inset-x-4 bottom-18 z-30 w-auto">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {!galleryOpen ? (
        <div
          className={cn(
            'absolute inset-x-4 bottom-4 z-30 flex justify-center gap-3 transition-opacity duration-300 ease-out motion-reduce:transition-none',
            controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <Button
            ref={galleryControlRef}
            variant="ghost"
            size="icon-lg"
            className={activeControlClass}
            aria-label="Open picture and video gallery"
            onClick={openGallery}
          >
            <Images />
          </Button>
          {selected ? (
            <Button
              variant="ghost"
              size="icon-lg"
              className={activeControlClass}
              aria-label="Share this calm moment"
              onClick={() => void share()}
            >
              <Share2 />
            </Button>
          ) : null}
        </div>
      ) : null}

      {galleryOpen && currentPage ? (
        <div
          className={cn(
            'absolute inset-0 z-40 text-foreground',
            isEmptyUploadPage ? 'bg-muted' : 'bg-background',
          )}
        >
          <header
            className={cn(
              'absolute inset-x-3 top-3 z-50 flex items-center gap-1.5 p-1',
              galleryGlassSurfaceClass,
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/90 hover:bg-background/55"
              aria-label="Close picture and video gallery"
              onClick={closeGallery}
            >
              <X />
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm leading-none font-medium">{currentPage.title}</h2>
            </div>
            <p aria-live="polite" className="mr-1 shrink-0 text-xs text-foreground/70">
              Page {pageIndex + 1} of {gallery.pages.length}
            </p>
          </header>

          <div
            key={currentPage.id}
            className={cn(
              'absolute inset-0',
              pageDirection === 'forward'
                ? 'motion-safe:animate-gallery-page-forward'
                : 'motion-safe:animate-gallery-page-backward',
            )}
          >
            {isEmptyPage ? (
              <div className="flex size-full items-center justify-center p-8 text-center">
                <p className="max-w-48 text-sm text-muted-foreground">
                  No tiles have been added to this page yet.
                </p>
              </div>
            ) : isEmptyUploadPage ? (
              <div className="flex size-full items-center justify-center p-8">
                {tiles[0]?.type === 'upload' ? (
                  <button
                    type="button"
                    onClick={() => chooseUpload(tiles[0].id)}
                    className="flex aspect-square w-2/3 max-w-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-foreground/25 bg-background/75 p-5 text-center text-sm font-medium shadow-sm backdrop-blur-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <ImagePlus className="size-8" aria-hidden />
                    {tiles[0].label}
                  </button>
                ) : null}
              </div>
            ) : (
              <div
                className={cn(
                  'grid size-full grid-cols-3 gap-px bg-border p-px',
                  tileGridScrolls ? 'content-start overflow-y-auto' : 'overflow-hidden',
                )}
                style={tileGridStyle}
              >
                {tiles.map((tile) =>
                  tile.type === 'media' ? (
                    <button
                      key={tile.id}
                      type="button"
                      aria-label={`Choose ${tile.title}`}
                      onClick={() => selectMedia(tile)}
                      className={cn(
                        'relative min-h-0 overflow-hidden bg-muted focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                        selected?.pageId === currentPage.id && selected.tileId === tile.id
                          ? 'ring-2 ring-primary ring-inset'
                          : '',
                      )}
                    >
                      <GalleryTileMedia
                        media={tile.media}
                        source={mediaSource(tile.media, localUrls)}
                        alt={tile.alt}
                        reducedMotion={reducedMotion}
                      />
                    </button>
                  ) : (
                    <button
                      key={tile.id}
                      type="button"
                      aria-label={tile.label}
                      onClick={() => chooseUpload(tile.id)}
                      className="flex min-h-0 flex-col items-center justify-center gap-2 bg-muted p-2 text-center text-xs font-medium focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <ImagePlus className="size-5" aria-hidden />
                      {tile.label}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {message ? (
            <Alert className="absolute inset-x-3 bottom-24 z-50 w-auto">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          <nav aria-label="Gallery pages" className="absolute inset-x-3 bottom-3 z-50">
            <div className={cn('flex gap-1.5 p-1', galleryGlassSurfaceClass)}>
              {previousPage ? (
                <Button
                  variant="ghost"
                  className="h-10 min-w-0 flex-1 justify-start bg-background/35 px-2 text-foreground hover:bg-background/55"
                  aria-label={`Previous page: ${previousPage.title}`}
                  onClick={() => navigateGalleryPage(Math.max(0, pageIndex - 1))}
                >
                  <ChevronLeft data-icon="inline-start" />
                  <span className="min-w-0 flex-1 truncate">{previousPage.title}</span>
                </Button>
              ) : null}
              {nextPage ? (
                <Button
                  variant="ghost"
                  className="h-10 min-w-0 flex-1 justify-start bg-foreground/10 px-2 text-foreground hover:bg-foreground/20"
                  aria-label={`Next page: ${nextPage.title}`}
                  onClick={() =>
                    navigateGalleryPage(Math.min(gallery.pages.length - 1, pageIndex + 1))
                  }
                >
                  <span className="min-w-0 flex-1 truncate">{nextPage.title}</span>
                  <ChevronRight data-icon="inline-end" />
                </Button>
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}
    </section>
  );
}
