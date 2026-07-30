import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Tensai — Verified Path to Study & Work Abroad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#0d1117',
          backgroundImage:
            'radial-gradient(circle at 12% 15%, rgba(34,197,94,0.28), transparent 55%), radial-gradient(circle at 88% 88%, rgba(20,184,166,0.16), transparent 50%)',
          padding: '80px 90px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 44 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              color: 'white',
            }}
          >
            T
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>Tensai</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#4ade80', letterSpacing: 3, textTransform: 'uppercase' }}>
              The Way of Global Career
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 52, fontWeight: 800, color: 'white', lineHeight: 1.15, maxWidth: 940 }}>
          Your Verified Path to Study &amp; Work Abroad
        </div>

        <div style={{ display: 'flex', fontSize: 23, color: 'rgba(255,255,255,0.55)', marginTop: 26, maxWidth: 780 }}>
          Zero fake profiles. OCR-verified documents. A transparent bridge to Japan — education &amp; healthcare careers.
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 46 }}>
          {['100% Verified', '0 Fake Profiles', 'BD → Japan'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                padding: '10px 20px',
                borderRadius: 999,
                border: '1px solid rgba(34,197,94,0.35)',
                background: 'rgba(34,197,94,0.1)',
                color: '#4ade80',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
