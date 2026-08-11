import { ImageResponse } from 'next/og';

export const alt = 'Calm in the Rush';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#10252B',
        color: '#FAFBF7',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        height: '100%',
        justifyContent: 'space-between',
        padding: '72px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div style={{ color: '#B8CBBD', display: 'flex', fontSize: 26, fontWeight: 600 }}>
        CALM IN THE RUSH
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>
          A quiet minute
        </div>
        <div style={{ color: '#DDE5DE', display: 'flex', fontSize: 36 }}>
          in the middle of everything.
        </div>
      </div>
      <div style={{ color: '#B8CBBD', display: 'flex', fontSize: 24 }}>
        Real places. Ambient sound. No account.
      </div>
      <svg
        aria-hidden="true"
        height="190"
        style={{ position: 'absolute', right: 112, top: 214 }}
        viewBox="0 0 190 190"
        width="190"
      >
        <circle cx="95" cy="36" fill="#FAFBF7" r="28" />
        <path
          d="M24 92c36-52 106-52 142 0"
          fill="none"
          stroke="#FAFBF7"
          strokeLinecap="round"
          strokeWidth="20"
        />
        <path
          d="M52 144c22-32 64-32 86 0"
          fill="none"
          stroke="#B8CBBD"
          strokeLinecap="round"
          strokeWidth="14"
        />
      </svg>
    </div>,
    size,
  );
}
