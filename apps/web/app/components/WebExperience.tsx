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
import { Camera, ChevronLeft, ChevronRight, ExternalLink, Volume2, VolumeX } from 'lucide-react';

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
  if (media.kind === 'local') return localUrls[media.blobId] ?? '';
  return media.src;
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

function ExperienceVideo({
  source,
  poster,
  alt,
  preload = false,
}: {
  source: string;
  poster: string;
  alt: string;
  preload?: boolean;
}) {
  const reducedMotion = useReducedMotionPreference();
  if (!source) return <div className="absolute inset-0 bg-muted" aria-hidden />;
  if (reducedMotion) {
    return (
      <img
        src={poster}
        alt={alt}
        loading={preload ? 'eager' : 'lazy'}
        className="absolute inset-0 size-full object-cover"
      />
    );
  }
  return (
    <video
      className="absolute inset-0 size-full object-cover"
      src={source}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload={preload ? 'auto' : 'metadata'}
      role="img"
      aria-label={alt}
    />
  );
}

function SoundToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={on}
      aria-label={on ? 'Turn ambient sound off' : 'Turn ambient sound on'}
      onClick={onToggle}
    >
      {on ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
    </Button>
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
          className="text-2xl font-normal lowercase tracking-tight outline-none"
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
  const [soundOn, setSoundOn] = useState(true);
  const [activeTile, setActiveTile] = useState<UploadTarget | null>(null);
  const [ready, setReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

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

  const activeScreen = experience.screens.find((screen) => screen.id === activeTile?.screenId);
  const activeViewTile =
    activeScreen && isGalleryScreen(activeScreen)
      ? activeScreen.tiles.find((tile) => tile.id === activeTile?.tileId)
      : undefined;
  const audibleAudio = ((): string | null => {
    if (activeViewTile?.type === 'prefilled' && activeViewTile.media.kind === 'bundled-video')
      return activeViewTile.media.audio ?? null;
    if (activeTile) return null;
    if (coverVisible && currentCover && currentCover.media.kind === 'bundled-video')
      return currentCover.media.audio ?? null;
    return null;
  })();
  const showSoundToggle = audibleAudio !== null;

  useEffect(() => {
    if (!activeTile) return;
    dialogRef.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveTile(null);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [activeTile]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    if (!soundOn || !audibleAudio) return;
    if (audio.getAttribute('src') !== audibleAudio) audio.setAttribute('src', audibleAudio);
    const unlock = () => {
      void audio.play().catch(() => undefined);
    };
    void audio.play().catch(() => window.addEventListener('pointerdown', unlock, { once: true }));
    return () => window.removeEventListener('pointerdown', unlock);
  }, [audibleAudio, soundOn]);

  const activeUpload =
    activeScreen && activeViewTile?.type === 'upload'
      ? currentUploads.get(galleryUploadKey(activeScreen.id, activeViewTile.id))
      : undefined;
  const activeMedia =
    activeViewTile?.type === 'prefilled' ? activeViewTile.media : activeUpload?.media;
  const activeTitle =
    activeViewTile?.type === 'prefilled' ? activeViewTile.title : (activeViewTile?.label ?? '');
  const activeSentence = activeViewTile?.type === 'prefilled' ? activeViewTile.sentence : '';
  const activeAlt =
    activeViewTile?.type === 'prefilled'
      ? activeViewTile.alt
      : (activeUpload?.media.fileName ?? '');

  const navigate = (direction: 'back' | 'next') => {
    setActiveTile(null);
    setMessage('');
    if (direction === 'back' && screenIndex === 0 && !coverVisible && currentCover) {
      setShowCover(true);
      return;
    }
    const target = direction === 'next' ? screenIndex + 1 : screenIndex - 1;
    if (target < 0 || target >= experience.screens.length) return;
    setScreenIndex(target);
    setShowCover(false);
  };

  const seeMore = () => {
    setActiveTile(null);
    setShowCover(false);
    setMessage('');
  };

  const chooseUpload = (screenId: string, tileId: string) => {
    setUploadTarget({ screenId, tileId });
    fileInputRef.current?.click();
  };

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (soundOn) {
      audio.pause();
      setSoundOn(false);
      return;
    }
    void audio
      .play()
      .then(() => setSoundOn(true))
      .catch(() => setSoundOn(false));
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
      <div className="relative h-full">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-5 pt-12">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="pointer-events-none rounded-full border border-border/40 bg-background/80 px-3 py-1 text-center text-xs font-normal lowercase tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm outline-none"
          >
            {screen.title}
          </h1>
        </div>
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
                const visual =
                  media.kind === 'bundled-video' ? (
                    <ExperienceVideo source={source} poster={media.poster} alt={alt} />
                  ) : (
                    <ExperienceImage
                      media={media}
                      source={source}
                      alt={alt}
                      sizes="(max-width: 480px) 50vw, 13rem"
                    />
                  );
                const image = (
                  <div className="relative size-full overflow-hidden bg-muted">{visual}</div>
                );
                const openLabel =
                  tile.type === 'upload' ? `Open ${tile.label}` : `Open ${tile.title}`;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    className="block h-full w-full text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    aria-label={openLabel}
                    onClick={() => setActiveTile({ screenId: screen.id, tileId: tile.id })}
                  >
                    {image}
                  </button>
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

  const renderGateway = (screen: Extract<ExperienceScreen, { type: 'gateway' }>) => {
    const isFinalOneLiner =
      experience.oneLiner.enabled && screenIndex === experience.screens.length - 1;
    const showLogo = !isFinalOneLiner;
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-5 pb-24 pt-18 text-center">
        {showLogo ? (
          <Image
            src="/brand/rir-logo-large.svg"
            alt="RUST in de Reuring"
            width={256}
            height={257}
            sizes="10rem"
            className="h-auto w-36"
          />
        ) : null}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className={
            showLogo
              ? 'mt-5 text-2xl font-normal lowercase tracking-tight outline-none'
              : 'text-2xl font-normal lowercase tracking-tight outline-none'
          }
        >
          {screen.title}
        </h1>
        {screen.description.trim() ? (
          <p className="mt-2 max-w-72 text-sm leading-relaxed text-muted-foreground">
            {screen.description}
          </p>
        ) : null}
        {screen.links.length ? (
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
        ) : null}
        {experience.oneLiner.enabled && screenIndex === experience.screens.length - 1 ? (
          <>
            {screen.links.length ? <Separator className="mt-8 w-full max-w-72" /> : null}
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
  };

  return (
    <section
      aria-label="Calm in the Rush experience"
      className="relative size-full overflow-hidden rounded-none bg-background sm:rounded-phone-screen"
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
      <audio ref={audioRef} loop preload="none" aria-hidden />
      <div
        aria-hidden
        className="absolute top-2.5 left-1/2 z-30 hidden h-4 w-16 -translate-x-1/2 rounded-full bg-device-shell sm:block"
      />
      <div className="absolute inset-0 overflow-y-auto">
        {!ready ? (
          <div className="grid size-full place-items-center p-6 text-center text-sm text-muted-foreground">
            Preparing your calm moment...
          </div>
        ) : coverVisible && currentScreen && isGalleryScreen(currentScreen) && currentCover ? (
          <div className="relative size-full overflow-hidden bg-stage">
            {currentCover.media.kind === 'bundled-video' ? (
              <ExperienceVideo
                source={mediaSource(currentCover.media, localUrls)}
                poster={currentCover.media.poster}
                alt={currentCover.alt}
                preload
              />
            ) : (
              <ExperienceImage
                media={currentCover.media}
                source={mediaSource(currentCover.media, localUrls)}
                alt={currentCover.alt}
                preload
                sizes="(max-width: 480px) 100vw, 27rem"
              />
            )}
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
      {activeViewTile && activeScreen && activeMedia ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-label={activeTitle}
          tabIndex={-1}
          className="absolute inset-0 z-10 overflow-hidden bg-stage outline-none"
        >
          {activeViewTile.type === 'upload' ? (
            <button
              type="button"
              className="absolute inset-0 block w-full cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              aria-label={`Replace ${activeViewTile.label}`}
              onClick={() => chooseUpload(activeScreen.id, activeViewTile.id)}
            >
              <ExperienceImage
                media={activeMedia}
                source={mediaSource(activeMedia, localUrls)}
                alt={activeAlt}
                preload
                sizes="(max-width: 480px) 100vw, 27rem"
              />
            </button>
          ) : activeMedia.kind === 'bundled-video' ? (
            <ExperienceVideo
              source={mediaSource(activeMedia, localUrls)}
              poster={activeMedia.poster}
              alt={activeAlt}
              preload
            />
          ) : (
            <ExperienceImage
              media={activeMedia}
              source={mediaSource(activeMedia, localUrls)}
              alt={activeAlt}
              preload
              sizes="(max-width: 480px) 100vw, 27rem"
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-scrim/70 via-transparent to-scrim/40"
            aria-hidden
          />
          {activeSentence ? (
            <p className="pointer-events-none absolute top-12 left-5 z-10 max-w-64 animate-sentence-drift text-lg font-normal leading-relaxed text-stage-foreground/85 motion-reduce:animate-none">
              {activeSentence}
            </p>
          ) : null}
        </div>
      ) : null}
      {coverVisible || activeTile ? (
        <nav
          aria-label="Experience navigation"
          className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-border/25 bg-background/40 px-4 py-3 backdrop-blur-sm"
        >
          {showSoundToggle ? (
            <SoundToggle on={soundOn} onToggle={toggleSound} />
          ) : (
            <span aria-hidden className="inline-block w-9" />
          )}
          <Button type="button" variant="ghost" size="sm" onClick={seeMore}>
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
          <div className="flex items-center gap-1">
            <p aria-live="polite" className="text-xs text-muted-foreground">
              Page {screenIndex + 1} of {experience.screens.length}
            </p>
          </div>
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
        <Alert
          className="absolute right-4 bottom-18 left-4 z-30 w-auto text-center shadow-sm"
          aria-live="polite"
        >
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
