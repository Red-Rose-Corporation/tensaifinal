import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Tensai — The Way of Global Career';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Read the logo from disk (not a self-fetch) — see the identical fix in
  // feed/opengraph-image.tsx and auth/register/opengraph-image.tsx.
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
          alignItems: 'center',
          backgroundColor: '#0d1117',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(34,197,94,0.28), transparent 55%), radial-gradient(circle at 85% 85%, rgba(20,184,166,0.18), transparent 50%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={140}
          height={140}
          style={{ borderRadius: 70, marginBottom: 36 }}
        />
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: 'white', letterSpacing: -1 }}>
          Tensai
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 22,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#4ade80',
          }}
        >
          The Way of Global Career
        </div>
      </div>
    ),
    { ...size }
  );
}
