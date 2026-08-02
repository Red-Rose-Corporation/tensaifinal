import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Tensai — Your Platform for Global Study, Caregiver & Work Visa';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Read the logo from disk instead of fetching our own domain — a self-fetch
  // from within this route's own server function was silently failing on
  // Vercel and produced an empty (0-byte) image response for every share.
  const logoData = await readFile(join(process.cwd(), 'public/tensai-logo.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  // No custom font: the Sora TTF fetched from GitHub fails to parse in this
  // satori version's font engine (throws inside ImageResponse's render step,
  // not the fetch itself, so a fetch-only try/catch never caught it). Falls
  // back to satori's built-in sans-serif, which renders fine.

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 50 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            width={64}
            height={64}
            style={{ borderRadius: 32 }}
          />
          <span style={{ fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>Tensai</span>
        </div>

        <div style={{ display: 'flex', fontSize: 50, fontWeight: 800, color: 'white', lineHeight: 1.2, maxWidth: 920 }}>
          Your Platform for Global Study, Caregiver &amp; Work Visa
        </div>

        <div style={{ display: 'flex', marginTop: 40 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 24px',
              borderRadius: 999,
              border: '1px solid rgba(34,197,94,0.35)',
              background: 'rgba(34,197,94,0.1)',
              color: '#4ade80',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            Free Guide
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
