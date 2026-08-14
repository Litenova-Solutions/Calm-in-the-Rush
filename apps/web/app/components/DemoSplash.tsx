import Image from 'next/image';

/** A brief visual handoff from the supplied brand mark to the live demo. */
export function DemoSplash() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-2.5 z-40 grid place-items-center overflow-hidden rounded-phone-screen bg-background motion-safe:animate-splash-curtain-exit motion-reduce:animate-splash-reduced-exit"
    >
      <Image
        src="/brand/rir-logo-large.svg"
        alt=""
        width={512}
        height={513}
        preload
        sizes="8rem"
        className="h-auto w-32 drop-shadow-sm motion-safe:animate-splash-logo-arrive"
      />
    </div>
  );
}
