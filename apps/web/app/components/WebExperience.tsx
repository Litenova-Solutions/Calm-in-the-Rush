// Client boundary: this surface owns browser-local content, visitor uploads, and the one-liner.
'use client';

import {
  type ChangeEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { Camera, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import {
  galleryUploadKey,
  imageFileAccept,
  isGalleryScreen,
  seedExperience,
  type ExperienceConfig,
  type ExperienceMedia,
  type ExperienceScreen,
  type ExperienceTile,
  type GalleryScreen,
  type VisitorUpload,
} from '@/lib/content/experience';
import { BrowserExperienceRepository } from '@/lib/content/browser-repository';

type UploadTarget = { screenId: string; tileId: string };

interface WebExperienceProps {
  repository?: BrowserExperienceRepository;
}

function uploadMap(uploads: readonly VisitorUpload[]): Map<string, VisitorUpload> {
  return new Map(
    uploads.map((upload) => [galleryUploadKey(upload.screenId, upload.tileId), upload]),
  );
}

function mediaSource(media: ExperienceMedia, localUrls: Record<string, string>): string {
  return media.kind === 'bundled' ? media.src : (localUrls[media.blobId] ?? '');
}

function coverTile(screen: GalleryScreen): Extract<ExperienceTile, { type: 'prefilled' }> | null {
  const tile = screen.tiles[0];
  return tile?.type === 'prefilled' ? tile : null;
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

function ExperienceImage({
  media,
  source,
  alt,
  preload = false,
  sizes,
}: {
  media: ExperienceMedia;
  source: string;
  alt: string;
  preload?: boolean;
  sizes: string;
}) {
  if (!source) return <div className="absolute inset-0 bg-muted" aria-hidden />;
  if (media.kind === 'local') {
    return (
      <img
        src={source}
        alt={alt}
        loading={preload ? 'eager' : 'lazy'}
        className="absolute inset-0 size-full object-cover"
      />
    );
  }
  return (
    <Image src={source} alt={alt} fill preload={preload} sizes={sizes} className="object-cover" />
  );
}

function BreathingPanel({
  screen,
  headingRef,
}: {
  screen: Extract<ExperienceScreen, { type: 'breathing' }>;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const reducedMotion = useReducedMotionPreference();
  const breathingWavePath =
    'M 16 132 C 42 132, 48 48, 80 48 S 118 132, 160 132 S 198 48, 240 48 S 278 132, 304 132';

  return (
    <div className="flex min-h-full flex-col items-center px-5 pb-24 pt-14 text-center">
      <div className="flex max-w-72 flex-col gap-2">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-normal tracking-tight outline-none"
        >
          {screen.title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{screen.description}</p>
      </div>
      <div
        className="mt-9 w-full max-w-80 overflow-hidden rounded-3xl border border-primary/15 shadow-inner"
        aria-hidden
      >
        <svg viewBox="0 0 320 180" className="block h-auto w-full">
          <defs>
            <linearGradient id="breathing-sky" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--breathing-sky-start)" />
              <stop offset="100%" stopColor="var(--breathing-sky-end)" />
            </linearGradient>
            <linearGradient id="breathing-orb" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--breathing-orb-start)" />
              <stop offset="100%" stopColor="var(--breathing-orb-end)" />
            </linearGradient>
            <filter id="breathing-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="320" height="180" rx="24" fill="url(#breathing-sky)" />
          <path
            d={breathingWavePath}
            fill="none"
            stroke="var(--breathing-wave)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {reducedMotion ? (
            <circle
              cx="16"
              cy="132"
              r="13"
              fill="url(#breathing-orb)"
              filter="url(#breathing-glow)"
            />
          ) : (
            <circle r="13" fill="url(#breathing-orb)" filter="url(#breathing-glow)">
              <animateMotion dur="12s" repeatCount="indefinite" path={breathingWavePath} />
            </circle>
          )}
        </svg>
      </div>
    </div>
  );
}

export function WebExperience({ repository }: WebExperienceProps) {
  const repo = useMemo(() => repository ?? new BrowserExperienceRepository(), [repository]);
  const [experience, setExperience] = useState<ExperienceConfig>(seedExperience);
  const [uploads, setUploads] = useState<VisitorUpload[]>([]);
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});
  const [oneLiner, setOneLiner] = useState('');
  const [oneLinerDraft, setOneLinerDraft] = useState('');
  const [screenIndex, setScreenIndex] = useState(0);
  const [showCover, setShowCover] = useState(true);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [message, setMessage] = useState('');
  const [savingOneLiner, setSavingOneLiner] = useState(false);
  const [ready, setReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [nextExperience, nextUploads, nextOneLiner] = await Promise.all([
        repo.readExperience(),
        repo.readVisitorUploads(),
        repo.readOneLiner(),
      ]);
      const localMedia = [
        ...nextExperience.screens.flatMap((screen) =>
          isGalleryScreen(screen)
            ? screen.tiles.flatMap((tile) =>
                tile.type === 'prefilled' && tile.media.kind === 'local' ? [tile.media] : [],
              )
            : [],
        ),
        ...nextUploads.map((upload) => upload.media),
      ];
      const urls: Record<string, string> = {};
      for (const media of localMedia) {
        const url = await repo.getObjectUrl(media);
        if (url) urls[media.blobId] = url;
      }
      setExperience(nextExperience);
      setUploads(nextUploads);
      setLocalUrls(urls);
      setOneLiner(nextOneLiner);
      setOneLinerDraft(nextOneLiner);
      setScreenIndex((current) =>
        Math.min(current, Math.max(0, nextExperience.screens.length - 1)),
      );
    } catch (error) {
      setExperience(seedExperience);
      setUploads([]);
      setMessage(
        error instanceof Error ? error.message : 'Your local experience could not be read.',
      );
    } finally {
      setReady(true);
    }
  }, [repo]);

  useEffect(() => {
    void refresh();
    return () => {
      if (!repository) repo.dispose();
    };
  }, [refresh, repo, repository]);

  useEffect(() => {
    if (!ready) return;
    headingRef.current?.focus();
  }, [ready, screenIndex, showCover]);

  const currentScreen = experience.screens[screenIndex];
  const currentUploads = useMemo(() => uploadMap(uploads), [uploads]);
  const currentCover =
    currentScreen && isGalleryScreen(currentScreen) ? coverTile(currentScreen) : null;
  const coverVisible = Boolean(
    screenIndex === 0 &&
    currentScreen &&
    isGalleryScreen(currentScreen) &&
    currentScreen.useFirstTileAsCover &&
    currentCover &&
    showCover,
  );
  const hasPrevious =
    screenIndex > 0 || (screenIndex === 0 && !coverVisible && Boolean(currentCover));
  const hasNext = screenIndex < experience.screens.length - 1;

  const navigate = (direction: 'back' | 'next') => {
    if (direction === 'back' && screenIndex === 0 && !coverVisible && currentCover) {
      setShowCover(true);
      return;
    }
    const target = direction === 'next' ? screenIndex + 1 : screenIndex - 1;
    if (target < 0 || target >= experience.screens.length) return;
    setScreenIndex(target);
    setShowCover(false);
  };

  const chooseUpload = (screenId: string, tileId: string) => {
    setUploadTarget({ screenId, tileId });
    fileInputRef.current?.click();
  };

  const saveUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    const target = uploadTarget;
    setUploadTarget(null);
    if (!file || !target) return;
    try {
      await repo.saveVisitorUpload(target.screenId, target.tileId, file);
      await refresh();
      setMessage('Your photo is saved in this browser.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Your photo could not be saved.');
    }
  };

  const saveOneLiner = async (value = oneLinerDraft) => {
    setSavingOneLiner(true);
    try {
      const saved = await repo.saveOneLiner(value);
      setOneLiner(saved);
      setOneLinerDraft(saved);
      setMessage(
        saved ? 'Your one-liner is saved in this browser.' : 'Your one-liner was cleared.',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Your one-liner could not be saved.');
    } finally {
      setSavingOneLiner(false);
    }
  };

  const renderGallery = (screen: GalleryScreen) => {
    const tiles = screen.tiles.filter(
      (_, index) =>
        !(
          screenIndex === 0 &&
          screen.useFirstTileAsCover &&
          !screen.repeatCoverInGallery &&
          index === 0
        ),
    );
    return (
      <div className="h-full">
        <h1 ref={headingRef} tabIndex={-1} className="sr-only outline-none">
          {screen.title}
        </h1>
        {tiles.length ? (
          <div className="grid h-full grid-cols-2 gap-0" aria-label={`${screen.title} photos`}>
            {tiles.map((tile) => {
              const upload =
                tile.type === 'upload'
                  ? currentUploads.get(galleryUploadKey(screen.id, tile.id))
                  : undefined;
              const media = tile.type === 'prefilled' ? tile.media : upload?.media;
              const source = media ? mediaSource(media, localUrls) : '';
              const alt = tile.type === 'prefilled' ? tile.alt : (upload?.media.fileName ?? '');
              if (media) {
                const image = (
                  <div className="relative size-full overflow-hidden bg-muted">
                    <ExperienceImage
                      media={media}
                      source={source}
                      alt={alt}
                      sizes="(max-width: 480px) 50vw, 13rem"
                    />
                  </div>
                );
                return tile.type === 'upload' ? (
                  <button
                    key={tile.id}
                    type="button"
                    className="block w-full text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    aria-label={`Replace ${tile.label}`}
                    onClick={() => chooseUpload(screen.id, tile.id)}
                  >
                    {image}
                  </button>
                ) : (
                  <div key={tile.id}>{image}</div>
                );
              }
              if (tile.type !== 'upload') return null;
              return (
                <Button
                  key={tile.id}
                  type="button"
                  variant="ghost"
                  className="h-full w-full whitespace-normal rounded-none bg-muted/70 p-0 hover:bg-muted"
                  aria-label={tile.label}
                  onClick={() => chooseUpload(screen.id, tile.id)}
                >
                  <span className="flex max-w-44 flex-col items-center gap-2 px-4 text-center whitespace-normal">
                    <Camera className="size-5 text-muted-foreground" aria-hidden />
                    <span className="text-sm leading-snug text-foreground">{tile.label}</span>
                    {tile.sentence ? (
                      <span className="text-xs leading-snug text-muted-foreground">
                        {tile.sentence}
                      </span>
                    ) : null}
                  </span>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-full place-items-center p-6 text-center text-sm text-muted-foreground">
            No photos are configured for this page yet.
          </div>
        )}
      </div>
    );
  };

  const renderGateway = (screen: Extract<ExperienceScreen, { type: 'gateway' }>) => (
    <div className="flex flex-1 flex-col items-center justify-center px-5 pb-24 pt-18 text-center">
      <Image
        src="/brand/rir-logo-large.svg"
        alt="RUST in de Reuring"
        width={256}
        height={257}
        sizes="10rem"
        className="h-auto w-36"
      />
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 text-2xl font-normal tracking-tight outline-none"
      >
        {screen.title}
      </h1>
      <p className="mt-2 max-w-72 text-sm leading-relaxed text-muted-foreground">
        {screen.description}
      </p>
      <div className="mt-7 flex w-full max-w-72 flex-col gap-2">
        {screen.links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            {link.label}
            <ExternalLink className="size-4" aria-hidden />
          </a>
        ))}
      </div>
      {experience.oneLiner.enabled && screenIndex === experience.screens.length - 1 ? (
        <>
          <Separator className="mt-8 w-full max-w-72" />
          <form
            className="mt-7 w-full max-w-72 text-left"
            onSubmit={(event) => {
              event.preventDefault();
              void saveOneLiner();
            }}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              {experience.oneLiner.prompt}
            </p>
            <Field className="mt-4">
              <FieldLabel htmlFor="visitor-one-liner" className="sr-only">
                Your reflection
              </FieldLabel>
              <Textarea
                id="visitor-one-liner"
                value={oneLinerDraft}
                rows={5}
                maxLength={160}
                placeholder={experience.oneLiner.placeholder}
                className="min-h-32 resize-y bg-background/40 text-base leading-relaxed"
                onChange={(event) => setOneLinerDraft(event.target.value)}
              />
            </Field>
            <div className="mt-3 flex items-center justify-between">
              {oneLiner ? (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0"
                  disabled={savingOneLiner}
                  onClick={() => {
                    setOneLinerDraft('');
                    void saveOneLiner('');
                  }}
                >
                  Clear
                </Button>
              ) : (
                <span />
              )}
              <Button type="submit" size="sm" disabled={savingOneLiner || !oneLinerDraft.trim()}>
                Save
              </Button>
            </div>
          </form>
        </>
      ) : null}
    </div>
  );

  return (
    <section
      aria-label="Calm in the Rush experience"
      className="relative size-full overflow-hidden rounded-phone-screen bg-background"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={imageFileAccept}
        tabIndex={-1}
        aria-label="Choose a photo from your device"
        className="sr-only"
        onChange={(event) => void saveUpload(event)}
      />
      <div
        aria-hidden
        className="absolute top-2.5 left-1/2 z-30 h-4 w-16 -translate-x-1/2 rounded-full bg-device-shell"
      />
      <div className="absolute inset-0 overflow-y-auto">
        {!ready ? (
          <div className="grid size-full place-items-center p-6 text-center text-sm text-muted-foreground">
            Preparing your calm moment...
          </div>
        ) : coverVisible && currentScreen && isGalleryScreen(currentScreen) && currentCover ? (
          <div className="relative size-full overflow-hidden bg-stage">
            <ExperienceImage
              media={currentCover.media}
              source={mediaSource(currentCover.media, localUrls)}
              alt={currentCover.alt}
              preload
              sizes="(max-width: 480px) 100vw, 27rem"
            />
            <div
              className="absolute inset-0 bg-linear-to-t from-scrim/70 via-transparent to-scrim/40"
              aria-hidden
            />
            <h1 ref={headingRef} tabIndex={-1} className="sr-only outline-none">
              {currentScreen.title}
            </h1>
            {currentCover.sentence ? (
              <p className="absolute top-12 left-5 z-10 max-w-64 animate-sentence-drift text-lg font-normal leading-relaxed text-stage-foreground/85 motion-reduce:animate-none">
                {currentCover.sentence}
              </p>
            ) : null}
          </div>
        ) : currentScreen?.type === 'gallery' ? (
          renderGallery(currentScreen)
        ) : currentScreen?.type === 'breathing' ? (
          <BreathingPanel screen={currentScreen} headingRef={headingRef} />
        ) : currentScreen?.type === 'gateway' ? (
          renderGateway(currentScreen)
        ) : (
          <div className="grid size-full place-items-center p-6 text-center">
            <div className="max-w-64">
              <h1 ref={headingRef} tabIndex={-1} className="text-xl font-normal outline-none">
                No screens yet
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Local administration can add the first screen for this experience.
              </p>
            </div>
          </div>
        )}
      </div>
      {coverVisible ? (
        <nav
          aria-label="Experience navigation"
          className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-end border-t border-border/25 bg-background/40 px-4 py-3 backdrop-blur-sm"
        >
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowCover(false)}>
            See More
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </nav>
      ) : currentScreen ? (
        <nav
          aria-label="Experience navigation"
          className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-border/25 bg-background/40 px-4 py-3 backdrop-blur-sm"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!hasPrevious}
            onClick={() => navigate('back')}
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </Button>
          <p aria-live="polite" className="text-xs text-muted-foreground">
            Page {screenIndex + 1} of {experience.screens.length}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!hasNext}
            onClick={() => navigate('next')}
          >
            Next
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </nav>
      ) : null}
      {message ? (
        <Alert className="absolute right-4 bottom-18 left-4 z-30 shadow-sm" aria-live="polite">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
