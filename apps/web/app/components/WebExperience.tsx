// Client boundary: this surface owns browser-local content, visitor uploads, and the one-liner.
'use client';

import {
  type ChangeEvent,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import {
  galleryUploadKey,
  imageFileAccept,
  isGalleryScreen,
  seedExperience,
  seedExperienceNl,
  type ExperienceConfig,
  type ExperienceMedia,
  type ExperienceScreen,
  type ExperienceTile,
  type GalleryScreen,
  type VisitorUpload,
} from '@/lib/content/experience';
import { BrowserExperienceRepository } from '@/lib/content/browser-repository';
import {
  resolveExperienceLocale,
  visitorStrings,
  type ExperienceLocale,
} from '@/lib/content/strings';

import { CalmFace } from './CalmFace';
import { CalmSlider } from './CalmSlider';
import { InstallPrompt } from './InstallPrompt';

type UploadTarget = { screenId: string; tileId: string };

interface WebExperienceProps {
  repository?: BrowserExperienceRepository;
  locale?: ExperienceLocale;
}

/** How long the ambient sound takes to rise from silence when it starts. */
const ambientFadeMs = 1800;

/**
 * The events that count as a user activation, so `play()` with sound is allowed
 * inside their handlers. A touch `pointerdown` is not one of them; `pointerup`,
 * `touchend`, `click` and `keydown` are.
 */
const activationEvents = ['pointerup', 'touchend', 'click', 'keydown'] as const;

/** A horizontal swipe of at least this many CSS pixels moves between screens. */
const swipeMinDistance = 56;

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

/**
 * Bundled videos ship as WebM, which the Android app also packs, with an H.264
 * MP4 beside each one for iPhones and older browsers. The MP4 comes first: it
 * plays everywhere and is the smaller file. A browser that cannot load it moves
 * on to the WebM, so a configured video without an MP4 still plays.
 */
function videoSources(source: string): { src: string; type?: string }[] {
  if (!source.endsWith('.webm')) return [{ src: source }];
  return [
    { src: source.replace(/\.webm$/, '.mp4'), type: 'video/mp4' },
    { src: source, type: 'video/webm' },
  ];
}

/** Starts the ambient sound from silence and raises it over `ambientFadeMs`. */
function startAmbient(audio: HTMLAudioElement): Promise<void> {
  if (!audio.paused) return Promise.resolve();
  audio.volume = 0;
  return audio.play().then(() => {
    const start = performance.now();
    const rise = (now: number) => {
      // A frame time can be a little earlier than `start`, so clamp to the valid volume range.
      const progress = Math.min(1, Math.max(0, (now - start) / ambientFadeMs));
      audio.volume = progress;
      if (progress < 1 && !audio.paused) requestAnimationFrame(rise);
    };
    requestAnimationFrame(rise);
  });
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
      key={source}
      className="absolute inset-0 size-full object-cover"
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      disablePictureInPicture
      disableRemotePlayback
      preload={preload ? 'auto' : 'metadata'}
      role="img"
      aria-label={alt}
    >
      {videoSources(source).map((item) => (
        <source key={item.src} src={item.src} type={item.type} />
      ))}
    </video>
  );
}

/**
 * The brand face for an empty Relaxed Faces tile, drawn rather than an emoji so
 * it looks the same on every device. Even tiles are completely calm, with closed
 * eyes; odd tiles are very calm, with open eyes and a softer smile.
 */
function RelaxedFacePlaceholder({ variant = 0 }: { variant?: number }) {
  return <CalmFace value={variant % 2 === 0 ? 100 : 75} className="size-24 drop-shadow-sm" />;
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
    <div className="flex min-h-full flex-col items-center justify-center px-5 pt-overlay pb-screen text-center">
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
        className="mt-10 w-full max-w-sm overflow-hidden rounded-3xl shadow-lg ring-1 shadow-primary/10 ring-primary/10"
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
          <rect width="320" height="180" fill="url(#breathing-sky)" />
          <path
            d={breathingWavePath}
            fill="none"
            stroke="var(--breathing-wave)"
            strokeOpacity="0.85"
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

function SoundToggle({
  audible,
  waiting,
  muteLabel,
  unmuteLabel,
  onToggle,
}: {
  audible: boolean;
  waiting: boolean;
  muteLabel: string;
  unmuteLabel: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={audible}
      aria-label={audible ? muteLabel : unmuteLabel}
      onClick={onToggle}
      className={cn(
        'absolute top-control right-3 z-10 flex size-11 items-center justify-center rounded-full bg-background/60 text-foreground backdrop-blur-sm outline-none hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring/50',
        waiting && 'animate-sound-hint motion-reduce:animate-none',
      )}
    >
      {audible ? (
        <Volume2 className="size-5" aria-hidden />
      ) : (
        <VolumeX className="size-5" aria-hidden />
      )}
    </button>
  );
}

export function WebExperience({ repository, locale }: WebExperienceProps) {
  const activeLocale = resolveExperienceLocale(locale ?? repository?.locale);
  const copy = visitorStrings[activeLocale];
  const fallbackSeed = activeLocale === 'nl' ? seedExperienceNl : seedExperience;
  const repo = useMemo(
    () => repository ?? new BrowserExperienceRepository({ locale: activeLocale }),
    [repository, activeLocale],
  );
  const [experience, setExperience] = useState<ExperienceConfig>(fallbackSeed);
  const [uploads, setUploads] = useState<VisitorUpload[]>([]);
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});
  const [oneLiner, setOneLiner] = useState('');
  const [oneLinerDraft, setOneLinerDraft] = useState('');
  // The calm slider: the value under the visitor's finger, the value last saved, and a
  // short "Saved" note that replaces the level word for a moment after each save.
  const [calm, setCalm] = useState<number | null>(null);
  const [savedCalm, setSavedCalm] = useState<number | null>(null);
  const [calmNote, setCalmNote] = useState<string | null>(null);
  const [screenIndex, setScreenIndex] = useState(0);
  const [showCover, setShowCover] = useState(true);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [removalTarget, setRemovalTarget] = useState<UploadTarget | null>(null);
  const [message, setMessage] = useState('');
  const [savingOneLiner, setSavingOneLiner] = useState(false);
  // soundOn is the visitor's choice; soundBlocked means the browser is holding the
  // sound until the first tap or key press, as autoplay policies require.
  const [soundOn, setSoundOn] = useState(true);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [activeTile, setActiveTile] = useState<UploadTarget | null>(null);
  const [ready, setReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const swipeStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [nextExperience, nextUploads, nextOneLiner, nextCalm] = await Promise.all([
        repo.readExperience(fallbackSeed),
        repo.readVisitorUploads(),
        repo.readOneLiner(),
        repo.readCalm(),
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
      setCalm(nextCalm);
      setSavedCalm(nextCalm);
      setScreenIndex((current) =>
        Math.min(current, Math.max(0, nextExperience.screens.length - 1)),
      );
    } catch (error) {
      setExperience(fallbackSeed);
      setUploads([]);
      setMessage(error instanceof Error ? error.message : copy.experienceUnreadable);
    } finally {
      setReady(true);
    }
  }, [repo, fallbackSeed, copy]);

  useEffect(() => {
    void refresh();
    return () => {
      if (!repository) repo.dispose();
    };
  }, [refresh, repo, repository]);

  useEffect(() => {
    if (!ready) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [ready, screenIndex, showCover]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!calmNote) return;
    const timer = window.setTimeout(() => setCalmNote(null), 2200);
    return () => window.clearTimeout(timer);
  }, [calmNote]);

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
  const isFinalOneLiner =
    experience.oneLiner.enabled && screenIndex === experience.screens.length - 1;

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
  const soundAudible = soundOn && !soundBlocked;

  useEffect(() => {
    if (!activeTile) return;
    dialogRef.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveTile(null);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [activeTile]);

  // Ambient sound starts with the media it belongs to. A browser that blocks sound
  // before any interaction gets it on the visitor's first tap or key press anywhere,
  // and a tab that returns from the background picks the sound up again.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!soundOn || !audibleAudio) {
      audio.pause();
      return;
    }
    if (audio.getAttribute('src') !== audibleAudio) audio.setAttribute('src', audibleAudio);
    let active = true;
    const stopListening = () => {
      for (const name of activationEvents) window.removeEventListener(name, unlock, true);
    };
    const unlock = () => {
      startAmbient(audio)
        .then(() => {
          stopListening();
          if (active) setSoundBlocked(false);
        })
        .catch(() => undefined);
    };
    startAmbient(audio)
      .then(() => {
        if (active) setSoundBlocked(false);
      })
      .catch((error: unknown) => {
        if (!active || !(error instanceof DOMException) || error.name !== 'NotAllowedError') return;
        setSoundBlocked(true);
        for (const name of activationEvents) window.addEventListener(name, unlock, true);
      });
    const resume = () => {
      if (document.visibilityState === 'visible') void startAmbient(audio).catch(() => undefined);
    };
    document.addEventListener('visibilitychange', resume);
    return () => {
      active = false;
      stopListening();
      document.removeEventListener('visibilitychange', resume);
      audio.pause();
    };
  }, [audibleAudio, soundOn]);

  const activeUpload =
    activeScreen && activeViewTile?.type === 'upload'
      ? currentUploads.get(galleryUploadKey(activeScreen.id, activeViewTile.id))
      : undefined;
  const activeMedia =
    activeViewTile?.type === 'prefilled' ? activeViewTile.media : activeUpload?.media;
  const activeTitle =
    activeViewTile?.type === 'prefilled' ? activeViewTile.title : (activeViewTile?.label ?? '');
  const activeSentence =
    activeScreen?.id === 'quiet-moments' && activeViewTile?.type === 'prefilled'
      ? activeViewTile.sentence
      : '';
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
    if (soundAudible) {
      audio.pause();
      setSoundOn(false);
      return;
    }
    setSoundOn(true);
    startAmbient(audio)
      .then(() => setSoundBlocked(false))
      .catch(() => undefined);
  };

  // Phones move through the flow with a horizontal swipe as well as the buttons.
  // A swipe that starts in a text field is left alone, so text selection still works.
  const startSwipe = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' || !event.isPrimary) return;
    if (
      event.target instanceof Element &&
      event.target.closest('textarea, input, [role=alertdialog]')
    )
      return;
    swipeStart.current = { x: event.clientX, y: event.clientY, time: event.timeStamp };
  };

  const endSwipe = (event: ReactPointerEvent<HTMLElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || removalTarget) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < swipeMinDistance || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (event.timeStamp - start.time > 900) return;
    if (activeTile) {
      setActiveTile(null);
      return;
    }
    if (coverVisible) {
      if (dx < 0) seeMore();
      return;
    }
    if (dx < 0 && hasNext) navigate('next');
    if (dx > 0 && hasPrevious) navigate('back');
  };

  const saveUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = '';
    const target = uploadTarget;
    setUploadTarget(null);
    if (files.length === 0 || !target) return;
    try {
      const saved = await repo.saveVisitorUploadBatch(target.screenId, target.tileId, files);
      await refresh();
      if (saved.length === 1) {
        setMessage(copy.photoSaved);
      } else if (saved.length === 0) {
        setMessage(copy.uploadSlotsFull);
      } else if (saved.length < files.length) {
        setMessage(copy.photosPartial(saved.length, files.length));
      } else {
        setMessage(copy.photosSaved(saved.length));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.photosFailed);
    }
  };

  const confirmRemoval = async () => {
    const target = removalTarget;
    setRemovalTarget(null);
    if (!target) return;
    try {
      await repo.clearVisitorUpload(target.screenId, target.tileId);
      await refresh();
      setMessage(copy.photoRemoved);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.photoRemoveFailed);
    }
  };

  const saveCalm = async (value: number) => {
    setCalm(value);
    if (value === savedCalm) return;
    try {
      const saved = await repo.saveCalm(value);
      setSavedCalm(saved);
      setCalmNote(copy.calm.saved);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.calm.failed);
    }
  };

  const saveOneLiner = async (value = oneLinerDraft) => {
    setSavingOneLiner(true);
    try {
      const saved = await repo.saveOneLiner(value);
      setOneLiner(saved);
      setOneLinerDraft(saved);
      setMessage(saved ? copy.oneLinerSaved : copy.oneLinerCleared);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.oneLinerFailed);
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
      <div className="relative min-h-full">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-5 pt-overlay">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="pointer-events-none rounded-full border border-border/40 bg-background/80 px-3 py-1 text-center text-xs font-normal tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm outline-none"
          >
            {screen.title}
          </h1>
        </div>
        {tiles.length ? (
          <div
            className="gallery-rows grid grid-cols-2 gap-0 pb-nav-space"
            style={{ '--gallery-rows': Math.ceil(tiles.length / 2) } as CSSProperties}
            aria-label={copy.galleryPhotos(screen.title)}
          >
            {tiles.map((tile, tileIndex) => {
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
                const openLabel = copy.openTile(tile.type === 'upload' ? tile.label : tile.title);
                return (
                  <div key={tile.id} className="relative h-full">
                    <button
                      type="button"
                      className="block h-full w-full text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      aria-label={openLabel}
                      onClick={() => setActiveTile({ screenId: screen.id, tileId: tile.id })}
                    >
                      {image}
                    </button>
                    {tile.type === 'upload' ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={copy.removeTile(tile.label)}
                        onClick={(event) => {
                          event.stopPropagation();
                          setRemovalTarget({ screenId: screen.id, tileId: tile.id });
                        }}
                        className="absolute top-2 left-2 z-10 size-10 rounded-full bg-background/70 text-foreground backdrop-blur-sm hover:bg-background/90 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    ) : null}
                  </div>
                );
              }
              if (tile.type !== 'upload') return null;
              const isFacesScreen = screen.id === 'friendly-faces';
              return (
                <Button
                  key={tile.id}
                  type="button"
                  variant="ghost"
                  className={cn(
                    'h-full w-full rounded-none border-0 bg-muted/70 p-0 whitespace-normal hover:bg-muted',
                    isFacesScreen && 'items-start',
                  )}
                  aria-label={tile.label}
                  onClick={() => chooseUpload(screen.id, tile.id)}
                >
                  <span
                    className={cn(
                      'flex max-w-44 flex-col items-center gap-2 px-4 py-6 text-center whitespace-normal',
                      // The first row clears the floating screen title.
                      isFacesScreen && tileIndex < 2 && 'pt-overlay-title',
                    )}
                  >
                    {isFacesScreen ? (
                      <span className="mb-2">
                        <RelaxedFacePlaceholder variant={tileIndex} />
                      </span>
                    ) : (
                      <Camera className="size-5 text-muted-foreground" aria-hidden />
                    )}
                    <span className="text-sm leading-snug text-foreground">{tile.label}</span>
                    {tile.sentence ? (
                      <span className="text-xs leading-snug text-muted-foreground">
                        {tile.sentence}
                      </span>
                    ) : null}
                    <span className="text-xs leading-snug text-muted-foreground/70">
                      {copy.uploadHint}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-full place-items-center p-6 text-center text-sm text-muted-foreground">
            {copy.noPhotos}
          </div>
        )}
      </div>
    );
  };

  const renderGateway = (screen: Extract<ExperienceScreen, { type: 'gateway' }>) => {
    const showLogo = !isFinalOneLiner;
    const isLogoGateway = screen.id === 'calm-logo';
    const logo = {
      src: activeLocale === 'nl' ? '/brand/rir-logo-large.svg' : '/brand/calm-logo-large.png',
      alt: activeLocale === 'nl' ? 'RUST in de Reuring' : 'CALM in the rush',
    };
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-5 pt-overlay pb-screen text-center">
        {showLogo ? (
          <Image
            src={logo.src}
            alt={logo.alt}
            width={480}
            height={480}
            sizes="16rem"
            className="h-auto w-64 drop-shadow-sm"
          />
        ) : null}
        {isLogoGateway ? (
          <h1 ref={headingRef} tabIndex={-1} className="sr-only outline-none">
            {screen.title}
          </h1>
        ) : (
          <h1
            ref={headingRef}
            tabIndex={-1}
            className={
              showLogo
                ? 'mt-5 text-2xl font-normal tracking-tight outline-none'
                : 'text-2xl font-normal tracking-tight outline-none'
            }
          >
            {screen.title}
          </h1>
        )}
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
                className={cn(buttonVariants({ variant: 'outline' }), 'h-11 w-full')}
              >
                {link.label}
                <ExternalLink className="size-4" aria-hidden />
              </a>
            ))}
          </div>
        ) : null}
        {isFinalOneLiner ? (
          <>
            {screen.links.length ? <Separator className="mt-8 w-full max-w-72" /> : null}
            <div className="mt-7 w-full max-w-80">
              <CalmSlider
                value={calm}
                question={copy.calm.question}
                hint={copy.calm.hint}
                levels={copy.calm.levels}
                note={calmNote}
                onChange={(value) => {
                  setCalm(value);
                  setCalmNote(null);
                }}
                onCommit={(value) => void saveCalm(value)}
              />
            </div>
            <form
              className="mt-7 w-full max-w-80 text-left"
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
                  {copy.reflectionLabel}
                </FieldLabel>
                <Textarea
                  id="visitor-one-liner"
                  value={oneLinerDraft}
                  rows={4}
                  maxLength={160}
                  enterKeyHint="done"
                  placeholder={experience.oneLiner.placeholder}
                  className="min-h-28 resize-none rounded-xl bg-background/40 text-base leading-relaxed"
                  onChange={(event) => setOneLinerDraft(event.target.value)}
                />
              </Field>
              <div className="mt-3 flex items-center justify-between">
                {oneLiner ? (
                  <Button
                    type="button"
                    variant="link"
                    className="h-11 px-0"
                    disabled={savingOneLiner}
                    onClick={() => {
                      setOneLinerDraft('');
                      void saveOneLiner('');
                    }}
                  >
                    {copy.clear}
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  type="submit"
                  className="h-11 rounded-full px-6"
                  disabled={savingOneLiner || !oneLinerDraft.trim()}
                >
                  {copy.save}
                </Button>
              </div>
            </form>
          </>
        ) : null}
      </div>
    );
  };

  const screenKey = !ready ? 'preparing' : coverVisible ? 'cover' : `screen-${screenIndex}`;
  // The install invitation waits for the logo screen: a calm brand moment with no
  // active media, no breathing cue and no form for the card to cover.
  const installAllowed =
    ready && !activeTile && currentScreen?.type === 'gateway' && !isFinalOneLiner;
  const overMedia = coverVisible || Boolean(activeTile);

  return (
    <section
      aria-label={copy.experienceLabel}
      lang={activeLocale}
      onPointerDown={startSwipe}
      onPointerUp={endSwipe}
      onPointerCancel={() => {
        swipeStart.current = null;
      }}
      className="relative size-full touch-pan-y touch-pinch-zoom overflow-hidden rounded-none bg-background framed:rounded-phone-screen"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={imageFileAccept}
        multiple
        tabIndex={-1}
        aria-label={copy.choosePhotos}
        className="sr-only"
        onChange={(event) => void saveUpload(event)}
      />
      <audio ref={audioRef} loop preload="auto" aria-hidden />
      <div
        aria-hidden
        className="absolute top-2.5 left-1/2 z-30 hidden h-4 w-16 -translate-x-1/2 rounded-full bg-device-shell framed:block"
      />
      <div
        key={screenKey}
        className="no-scrollbar screen-container absolute inset-0 animate-screen-in overflow-y-auto overscroll-contain motion-reduce:animate-none"
      >
        {!ready ? (
          <div className="grid size-full place-items-center p-6 text-center text-sm text-muted-foreground">
            {copy.preparing}
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
              <p className="absolute top-overlay left-5 z-10 max-w-64 animate-sentence-drift text-lg leading-relaxed font-normal text-stage-foreground/90 drop-shadow-sm motion-reduce:animate-none">
                {currentCover.sentence}
              </p>
            ) : null}
            {showSoundToggle ? (
              <SoundToggle
                audible={soundAudible}
                waiting={soundOn && soundBlocked}
                muteLabel={copy.muteSound}
                unmuteLabel={copy.unmuteSound}
                onToggle={toggleSound}
              />
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
                {copy.noScreensTitle}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {copy.noScreensDescription}
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
          className="absolute inset-0 z-10 animate-screen-in overflow-hidden bg-stage outline-none motion-reduce:animate-none"
        >
          {activeViewTile.type === 'upload' ? (
            <button
              type="button"
              className="absolute inset-0 block w-full cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              aria-label={copy.replaceTile(activeViewTile.label)}
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
            <p className="pointer-events-none absolute top-overlay left-5 z-10 max-w-64 animate-sentence-drift text-lg leading-relaxed font-normal text-stage-foreground/90 drop-shadow-sm motion-reduce:animate-none">
              {activeSentence}
            </p>
          ) : null}
          {showSoundToggle ? (
            <SoundToggle
              audible={soundAudible}
              waiting={soundOn && soundBlocked}
              muteLabel={copy.muteSound}
              unmuteLabel={copy.unmuteSound}
              onToggle={toggleSound}
            />
          ) : null}
        </div>
      ) : null}
      {overMedia ? (
        <nav
          aria-label={copy.navigationLabel}
          className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-end px-4 pt-3 pb-nav"
        >
          <Button
            type="button"
            variant="ghost"
            onClick={seeMore}
            className="h-11 rounded-full bg-scrim/35 pr-3 pl-5 text-stage-foreground backdrop-blur-md hover:bg-scrim/50 hover:text-stage-foreground"
          >
            {copy.seeMore}
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </nav>
      ) : currentScreen ? (
        <nav
          aria-label={copy.navigationLabel}
          className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-border/25 bg-background/60 px-2 pt-2 pb-nav backdrop-blur-md"
        >
          <Button
            type="button"
            variant="ghost"
            className="h-11 px-3"
            disabled={!hasPrevious}
            onClick={() => navigate('back')}
          >
            <ChevronLeft className="size-4" aria-hidden />
            {copy.back}
          </Button>
          <p aria-live="polite" className="text-xs text-muted-foreground tabular-nums">
            {copy.pageOf(screenIndex + 1, experience.screens.length)}
          </p>
          <Button
            type="button"
            variant="ghost"
            className="h-11 px-3"
            disabled={!hasNext}
            onClick={() => navigate('next')}
          >
            {copy.next}
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </nav>
      ) : null}
      <InstallPrompt
        copy={copy.install}
        allowed={installAllowed}
        iconSrc={activeLocale === 'nl' ? '/icons/nl-icon-192.png' : '/icons/icon-192.png'}
      />
      {message ? (
        <Alert
          className="absolute right-4 bottom-above-nav left-4 z-30 w-auto text-center shadow-sm"
          aria-live="polite"
        >
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      <Dialog
        open={removalTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemovalTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.removePhotoTitle}</DialogTitle>
            <DialogDescription>{copy.removePhotoDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => setRemovalTarget(null)}
            >
              {copy.keepIt}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-11"
              onClick={() => void confirmRemoval()}
            >
              {copy.remove}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
