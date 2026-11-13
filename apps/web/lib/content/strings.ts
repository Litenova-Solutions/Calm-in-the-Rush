export type ExperienceLocale = 'en' | 'nl';

export function resolveExperienceLocale(value: unknown): ExperienceLocale {
  return value === 'nl' ? 'nl' : 'en';
}

export interface InstallCopy {
  title: string;
  description: string;
  iosStepsBefore: string;
  iosStepsAfter: string;
  shareIcon: string;
  menuSteps: string;
  inAppSteps: string;
  install: string;
  notNow: string;
  gotIt: string;
}

interface VisitorCopy {
  experienceLabel: string;
  navigationLabel: string;
  preparing: string;
  choosePhotos: string;
  share: string;
  seeMore: string;
  back: string;
  next: string;
  save: string;
  clear: string;
  keepIt: string;
  remove: string;
  reflectionLabel: string;
  uploadHint: string;
  muteSound: string;
  unmuteSound: string;
  noPhotos: string;
  noScreensTitle: string;
  noScreensDescription: string;
  removePhotoTitle: string;
  removePhotoDescription: string;
  experienceUnreadable: string;
  photoSaved: string;
  uploadSlotsFull: string;
  photosFailed: string;
  photoRemoved: string;
  photoRemoveFailed: string;
  oneLinerSaved: string;
  oneLinerCleared: string;
  oneLinerFailed: string;
  pageOf: (current: number, total: number) => string;
  galleryPhotos: (title: string) => string;
  openTile: (label: string) => string;
  removeTile: (label: string) => string;
  replaceTile: (label: string) => string;
  photosSaved: (count: number) => string;
  photosPartial: (saved: number, total: number) => string;
  install: InstallCopy;
  calm: CalmCopy;
}

/** The calm slider on the final reflection screen. */
export interface CalmCopy {
  question: string;
  hint: string;
  /** Level words from not calm to completely calm, one per equal stretch of the slider. */
  levels: readonly string[];
  saved: string;
  failed: string;
}

export interface RepositoryCopy {
  storageUnavailable: string;
  storageUnavailableShort: string;
  invalidImage: string;
  galleryGone: string;
  tileGone: string;
  uploadGone: string;
  titleLength: string;
  altLength: string;
  sentenceLength: string;
}

export const visitorStrings: Record<ExperienceLocale, VisitorCopy> = {
  en: {
    experienceLabel: 'Calm in the Rush experience',
    navigationLabel: 'Experience navigation',
    preparing: 'Preparing your calm moment...',
    choosePhotos: 'Choose photos from your device',
    share: 'Share',
    seeMore: 'See More',
    back: 'Back',
    next: 'Next',
    save: 'Save',
    clear: 'Clear',
    keepIt: 'Keep it',
    remove: 'Remove',
    reflectionLabel: 'Your reflection',
    uploadHint: 'Vertical format',
    muteSound: 'Mute ambient sound',
    unmuteSound: 'Unmute ambient sound',
    noPhotos: 'No photos are configured for this page yet.',
    noScreensTitle: 'No screens yet',
    noScreensDescription: 'Local administration can add the first screen for this experience.',
    removePhotoTitle: 'Remove this photo?',
    removePhotoDescription:
      'The photo is removed from this browser. The empty slot stays, so a new photo can take its place.',
    experienceUnreadable: 'Your local experience could not be read.',
    photoSaved: 'Your photo is saved in this browser.',
    uploadSlotsFull: 'No empty upload slots were available for those photos.',
    photosFailed: 'Your photos could not be saved.',
    photoRemoved: 'The photo was removed from this browser.',
    photoRemoveFailed: 'The photo could not be removed.',
    oneLinerSaved: 'Your one-liner is saved in this browser.',
    oneLinerCleared: 'Your one-liner was cleared.',
    oneLinerFailed: 'Your one-liner could not be saved.',
    calm: {
      question: 'How calm do you feel right now?',
      hint: 'Slide the face to answer',
      levels: ['Not calm', 'A little calm', 'Calm', 'Very calm', 'Completely calm'],
      saved: 'Saved in this browser',
      failed: 'Your answer could not be saved.',
    },
    pageOf: (current, total) => `Page ${current} of ${total}`,
    galleryPhotos: (title) => `${title} photos`,
    openTile: (label) => `Open ${label}`,
    removeTile: (label) => `Remove ${label}`,
    replaceTile: (label) => `Replace ${label}`,
    photosSaved: (count) =>
      count === 1
        ? '1 photo is saved in this browser.'
        : `${count} photos are saved in this browser.`,
    photosPartial: (saved, total) => `${saved} of ${total} photos are saved in this browser.`,
    install: {
      title: 'Install Calm in the Rush',
      description: 'Open it full screen whenever you need a quiet minute.',
      iosStepsBefore: 'Tap',
      iosStepsAfter: 'then choose Add to Home Screen.',
      shareIcon: 'Share',
      menuSteps: 'Open the browser menu and choose Install app or Add to Home screen.',
      inAppSteps: 'Open this page in Safari or Chrome, then add it to your home screen.',
      install: 'Install app',
      notNow: 'Not now',
      gotIt: 'Got it',
    },
  },
  nl: {
    experienceLabel: 'RUST in de Reuring-ervaring',
    navigationLabel: 'Ervaringsnavigatie',
    preparing: 'Je rustmoment wordt voorbereid...',
    choosePhotos: "Kies foto's van je apparaat",
    share: 'Delen',
    seeMore: 'Bekijk meer',
    back: 'Terug',
    next: 'Volgende',
    save: 'Opslaan',
    clear: 'Wissen',
    keepIt: 'Bewaren',
    remove: 'Verwijderen',
    reflectionLabel: 'Jouw reflectie',
    uploadHint: 'Verticaal formaat',
    muteSound: 'Omgevingsgeluid dempen',
    unmuteSound: 'Omgevingsgeluid inschakelen',
    noPhotos: "Voor deze pagina zijn nog geen foto's ingesteld.",
    noScreensTitle: 'Nog geen schermen',
    noScreensDescription:
      'Via lokaal beheer kan het eerste scherm voor deze ervaring worden toegevoegd.',
    removePhotoTitle: 'Deze foto verwijderen?',
    removePhotoDescription:
      'De foto wordt uit deze browser verwijderd. De lege plek blijft, zodat je een nieuwe foto kunt toevoegen.',
    experienceUnreadable: 'Je lokale ervaring kon niet worden gelezen.',
    photoSaved: 'Je foto is opgeslagen in deze browser.',
    uploadSlotsFull: "Er zijn geen lege uploadplekken meer voor die foto's.",
    photosFailed: "Je foto's konden niet worden opgeslagen.",
    photoRemoved: 'De foto is verwijderd uit deze browser.',
    photoRemoveFailed: 'De foto kon niet worden verwijderd.',
    oneLinerSaved: 'Je oneliner is opgeslagen in deze browser.',
    oneLinerCleared: 'Je oneliner is gewist.',
    oneLinerFailed: 'Je oneliner kon niet worden opgeslagen.',
    calm: {
      question: 'Hoe rustig voel je je nu?',
      hint: 'Schuif het gezicht om te antwoorden',
      levels: ['Niet rustig', 'Een beetje rustig', 'Rustig', 'Heel rustig', 'Helemaal rustig'],
      saved: 'Opgeslagen in deze browser',
      failed: 'Je antwoord kon niet worden opgeslagen.',
    },
    pageOf: (current, total) => `Pagina ${current} van ${total}`,
    galleryPhotos: (title) => `${title}-foto's`,
    openTile: (label) => `${label} openen`,
    removeTile: (label) => `${label} verwijderen`,
    replaceTile: (label) => `${label} vervangen`,
    photosSaved: (count) =>
      count === 1
        ? '1 foto is opgeslagen in deze browser.'
        : `${count} foto's zijn opgeslagen in deze browser.`,
    photosPartial: (saved, total) =>
      `${saved} van ${total} foto's zijn opgeslagen in deze browser.`,
    install: {
      title: 'Installeer RUST in de Reuring',
      description: 'Open het schermvullend wanneer je een rustige minuut nodig hebt.',
      iosStepsBefore: 'Tik op',
      iosStepsAfter: 'en kies Zet op beginscherm.',
      shareIcon: 'Deel',
      menuSteps: 'Open het browsermenu en kies App installeren of Toevoegen aan startscherm.',
      inAppSteps: 'Open deze pagina in Safari of Chrome en zet hem daarna op je beginscherm.',
      install: 'Installeer app',
      notNow: 'Niet nu',
      gotIt: 'Begrepen',
    },
  },
};

export const repositoryStrings: Record<ExperienceLocale, RepositoryCopy> = {
  en: {
    storageUnavailable: 'Browser storage is not available in this environment.',
    storageUnavailableShort: 'Browser storage is not available.',
    invalidImage: 'Choose a JPEG, PNG, WebP, or AVIF image.',
    galleryGone: 'That gallery screen is no longer available.',
    tileGone: 'That pre-filled tile is no longer available.',
    uploadGone: 'That photo upload space is no longer available.',
    titleLength: 'Tile title must be between 1 and 60 characters.',
    altLength: 'Image description must be between 1 and 160 characters.',
    sentenceLength: 'Assigned sentence must be 160 characters or fewer.',
  },
  nl: {
    storageUnavailable: 'Browseropslag is niet beschikbaar in deze omgeving.',
    storageUnavailableShort: 'Browseropslag is niet beschikbaar.',
    invalidImage: 'Kies een JPEG-, PNG-, WebP- of AVIF-afbeelding.',
    galleryGone: 'Dat galerijscherm is niet meer beschikbaar.',
    tileGone: 'Die vooraf ingevulde tegel is niet meer beschikbaar.',
    uploadGone: "Die uploadplek voor foto's is niet meer beschikbaar.",
    titleLength: 'De tegeltitel moet tussen 1 en 60 tekens lang zijn.',
    altLength: 'De fotobeschrijving moet tussen 1 en 160 tekens lang zijn.',
    sentenceLength: 'De bijbehorende zin mag maximaal 160 tekens lang zijn.',
  },
};
