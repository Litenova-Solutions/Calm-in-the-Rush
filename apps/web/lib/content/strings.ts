export type ExperienceLocale = 'en' | 'nl';

export function resolveExperienceLocale(value: unknown): ExperienceLocale {
  return value === 'nl' ? 'nl' : 'en';
}

export interface FeedbackCopy {
  question: string;
  /** Five labels for equal stretches of the calm slider, from not calm to very calm and happy. */
  levels: readonly string[];
  hint: string;
  optional: string;
  feedbackSaved: string;
  feedbackCleared: string;
  feedbackFailed: string;
}

export interface InstallCopy {
  title: string;
  description: string;
  iosStepsBefore: string;
  iosStepsAfter: string;
  shareIcon: string;
  menuSteps: string;
  install: string;
  notNow: string;
  gotIt: string;
}

/**
 * What a tour step points at. The target also decides where the step happens:
 * bar controls on Home, a topic in the gallery, a photo or upload tile inside a topic.
 */
export type TourTarget = 'sound' | 'logo' | 'gallery' | 'topic' | 'photo' | 'upload';

export interface TourCopy {
  label: string;
  steps: readonly { title: string; body: string; target: TourTarget }[];
  skip: string;
  next: string;
  done: string;
  stepOf: (current: number, total: number) => string;
}

interface VisitorCopy {
  experienceLabel: string;
  preparing: string;
  choosePhotos: string;
  back: string;
  homeTitle: string;
  openAbout: string;
  openGallery: string;
  galleryTitle: string;
  aboutTitle: string;
  aboutDescription: string;
  feedback: FeedbackCopy;
  privacyNote: string;
  showTour: string;
  breathingKind: string;
  topicEmpty: string;
  topicPhotoCount: (count: number) => string;
  save: string;
  clear: string;
  keepIt: string;
  remove: string;
  uploadHint: string;
  muteSound: string;
  unmuteSound: string;
  noPhotos: string;
  removePhotoTitle: string;
  removePhotoDescription: string;
  experienceUnreadable: string;
  photoSaved: string;
  uploadSlotsFull: string;
  photosFailed: string;
  photoRemoved: string;
  photoRemoveFailed: string;
  galleryPhotos: (title: string) => string;
  showTile: (label: string) => string;
  showing: string;
  removeTile: (label: string) => string;
  photosSaved: (count: number) => string;
  photosPartial: (saved: number, total: number) => string;
  install: InstallCopy;
  tour: TourCopy;
}

interface RepositoryCopy {
  storageUnavailable: string;
  storageUnavailableShort: string;
  invalidImage: string;
  uploadGone: string;
}

export const visitorStrings: Record<ExperienceLocale, VisitorCopy> = {
  en: {
    experienceLabel: 'Calm in the Rush experience',
    preparing: 'Preparing your calm moment...',
    choosePhotos: 'Choose photos from your device',
    back: 'Back',
    homeTitle: 'Calm in the Rush',
    openAbout: 'About Calm in the Rush',
    openGallery: 'Open the gallery',
    galleryTitle: 'Gallery',
    aboutTitle: 'About Calm in the Rush',
    aboutDescription: 'A quiet minute in the middle of everything.',
    feedback: {
      question: 'How calm do you feel?',
      levels: ['Not calm', 'A bit tense', 'Okay', 'Calm', 'Very calm and happy'],
      hint: 'Slide the face to show how calm you feel.',
      optional: 'Optional',
      feedbackSaved: 'Thank you. Your feedback is saved on this device.',
      feedbackCleared: 'Your feedback was cleared.',
      feedbackFailed: 'Your feedback could not be saved.',
    },
    privacyNote: 'Your photos and words stay on this device.',
    showTour: 'Show the tour again',
    breathingKind: 'Breathing exercise',
    topicEmpty: 'Add your own photos',
    topicPhotoCount: (count) => (count === 1 ? '1 photo' : `${count} photos`),
    save: 'Save',
    clear: 'Clear',
    keepIt: 'Keep it',
    remove: 'Remove',
    uploadHint: 'Vertical format',
    muteSound: 'Mute ambient sound',
    unmuteSound: 'Unmute ambient sound',
    noPhotos: 'No photos are configured for this page yet.',
    removePhotoTitle: 'Remove this photo?',
    removePhotoDescription:
      'The photo is removed from this device. The empty slot stays, so a new photo can take its place.',
    experienceUnreadable: 'Your local experience could not be read.',
    photoSaved: 'Your photo is saved on this device.',
    uploadSlotsFull: 'No empty upload slots were available for those photos.',
    photosFailed: 'Your photos could not be saved.',
    photoRemoved: 'The photo was removed from this device.',
    photoRemoveFailed: 'The photo could not be removed.',
    galleryPhotos: (title) => `${title} photos`,
    showTile: (label) => `Show ${label}`,
    showing: 'Showing now',
    removeTile: (label) => `Remove ${label}`,
    photosSaved: (count) =>
      count === 1
        ? '1 photo is saved on this device.'
        : `${count} photos are saved on this device.`,
    photosPartial: (saved, total) => `${saved} of ${total} photos are saved on this device.`,
    install: {
      title: 'Add Calm in the Rush to your home screen',
      description: 'Open it full screen whenever you need a quiet minute.',
      iosStepsBefore: 'Tap',
      iosStepsAfter: 'then choose Add to Home Screen.',
      shareIcon: 'Share',
      menuSteps: 'Open the browser menu, then tap Add to Home screen.',
      install: 'Install',
      notNow: 'Not now',
      gotIt: 'Got it',
    },
    tour: {
      label: 'How to use Calm in the Rush',
      steps: [
        {
          title: 'Welcome to a quiet minute',
          body: 'Let the video play and breathe along. Tap the speaker to turn the sound off or on.',
          target: 'sound',
        },
        {
          title: 'About and feedback',
          body: 'The logo opens the story behind Calm in the Rush, and a place to tell us how calm you feel.',
          target: 'logo',
        },
        {
          title: 'Open the gallery',
          body: 'Everything to look at lives in the gallery. Tap Next to open it.',
          target: 'gallery',
        },
        {
          title: 'Pick a topic',
          body: 'Each topic is a small calm collection. Tap one to see its pictures.',
          target: 'topic',
        },
        {
          title: 'Choose a picture',
          body: 'Tap a picture to make it your calm screen, with its own sound and words.',
          target: 'photo',
        },
        {
          title: 'Add your own photos',
          body: 'Empty tiles are for your own photos. They stay on this device.',
          target: 'upload',
        },
      ],
      skip: 'Skip',
      next: 'Next',
      done: 'Start',
      stepOf: (current, total) => `Step ${current} of ${total}`,
    },
  },
  nl: {
    experienceLabel: 'Rust in de Drukte-ervaring',
    preparing: 'Je rustmoment wordt voorbereid...',
    choosePhotos: "Kies foto's van je apparaat",
    back: 'Terug',
    homeTitle: 'Rust in de Drukte',
    openAbout: 'Over Rust in de Drukte',
    openGallery: 'Galerij openen',
    galleryTitle: 'Galerij',
    aboutTitle: 'Over Rust in de Drukte',
    aboutDescription: 'Een rustige minuut te midden van alles.',
    feedback: {
      question: 'Hoe rustig voel je je?',
      levels: ['Niet rustig', 'Een beetje gespannen', 'Gaat wel', 'Rustig', 'Heel rustig en blij'],
      hint: 'Schuif het gezicht om te laten zien hoe rustig je je voelt.',
      optional: 'Optioneel',
      feedbackSaved: 'Dank je. Je feedback is opgeslagen op dit apparaat.',
      feedbackCleared: 'Je feedback is gewist.',
      feedbackFailed: 'Je feedback kon niet worden opgeslagen.',
    },
    privacyNote: "Je foto's en woorden blijven op dit apparaat.",
    showTour: 'Rondleiding opnieuw bekijken',
    breathingKind: 'Ademhalingsoefening',
    topicEmpty: "Voeg je eigen foto's toe",
    topicPhotoCount: (count) => (count === 1 ? '1 foto' : `${count} foto's`),
    save: 'Opslaan',
    clear: 'Wissen',
    keepIt: 'Bewaren',
    remove: 'Verwijderen',
    uploadHint: 'Verticaal formaat',
    muteSound: 'Omgevingsgeluid dempen',
    unmuteSound: 'Omgevingsgeluid inschakelen',
    noPhotos: "Voor deze pagina zijn nog geen foto's ingesteld.",
    removePhotoTitle: 'Deze foto verwijderen?',
    removePhotoDescription:
      'De foto wordt van dit apparaat verwijderd. De lege plek blijft, zodat je een nieuwe foto kunt toevoegen.',
    experienceUnreadable: 'Je lokale ervaring kon niet worden gelezen.',
    photoSaved: 'Je foto is opgeslagen op dit apparaat.',
    uploadSlotsFull: "Er zijn geen lege uploadplekken meer voor die foto's.",
    photosFailed: "Je foto's konden niet worden opgeslagen.",
    photoRemoved: 'De foto is verwijderd van dit apparaat.',
    photoRemoveFailed: 'De foto kon niet worden verwijderd.',
    galleryPhotos: (title) => `${title}-foto's`,
    showTile: (label) => `${label} tonen`,
    showing: 'Nu te zien',
    removeTile: (label) => `${label} verwijderen`,
    photosSaved: (count) =>
      count === 1
        ? '1 foto is opgeslagen op dit apparaat.'
        : `${count} foto's zijn opgeslagen op dit apparaat.`,
    photosPartial: (saved, total) =>
      `${saved} van ${total} foto's zijn opgeslagen op dit apparaat.`,
    install: {
      title: 'Zet Rust in de Drukte op je beginscherm',
      description: 'Open het schermvullend wanneer je een rustige minuut nodig hebt.',
      iosStepsBefore: 'Tik op',
      iosStepsAfter: 'en kies Zet op beginscherm.',
      shareIcon: 'Deel',
      menuSteps: 'Open het browsermenu en tik op Toevoegen aan startscherm.',
      install: 'Installeren',
      notNow: 'Niet nu',
      gotIt: 'Begrepen',
    },
    tour: {
      label: 'Zo gebruik je Rust in de Drukte',
      steps: [
        {
          title: 'Welkom bij een rustige minuut',
          body: 'Laat de video spelen en adem mee. Tik op de luidspreker om het geluid aan of uit te zetten.',
          target: 'sound',
        },
        {
          title: 'Over ons en feedback',
          body: 'Het logo opent het verhaal achter Rust in de Drukte, en een plek om te laten weten hoe rustig je je voelt.',
          target: 'logo',
        },
        {
          title: 'Open de galerij',
          body: 'Alles om naar te kijken staat in de galerij. Tik op Volgende om hem te openen.',
          target: 'gallery',
        },
        {
          title: 'Kies een onderwerp',
          body: "Elk onderwerp is een kleine, rustige verzameling. Tik erop om de foto's te zien.",
          target: 'topic',
        },
        {
          title: 'Kies een foto',
          body: 'Tik op een foto om hem je rustscherm te maken, met eigen geluid en woorden.',
          target: 'photo',
        },
        {
          title: "Voeg je eigen foto's toe",
          body: "Lege tegels zijn voor je eigen foto's. Ze blijven op dit apparaat.",
          target: 'upload',
        },
      ],
      skip: 'Overslaan',
      next: 'Volgende',
      done: 'Beginnen',
      stepOf: (current, total) => `Stap ${current} van ${total}`,
    },
  },
};

export const repositoryStrings: Record<ExperienceLocale, RepositoryCopy> = {
  en: {
    storageUnavailable: 'Browser storage is not available in this environment.',
    storageUnavailableShort: 'Browser storage is not available.',
    invalidImage: 'Choose a JPEG, PNG, WebP, or AVIF image.',
    uploadGone: 'That photo upload space is no longer available.',
  },
  nl: {
    storageUnavailable: 'Browseropslag is niet beschikbaar in deze omgeving.',
    storageUnavailableShort: 'Browseropslag is niet beschikbaar.',
    invalidImage: 'Kies een JPEG-, PNG-, WebP- of AVIF-afbeelding.',
    uploadGone: "Die uploadplek voor foto's is niet meer beschikbaar.",
  },
};
