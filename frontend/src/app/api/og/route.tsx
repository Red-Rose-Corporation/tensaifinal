import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextRequest } from 'next/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Per-page subtitle shown under the wordmark. Keys match the `?page=` value
// each page's metadata() passes in (see about/team/contact/branches/gallery/
// terms/privacy/page.tsx and page.tsx for the homepage).
const SUBTITLES: Record<string, string> = {
  home: 'The Way of Global Career',
  about: 'About Tensai',
  team: 'Our Team',
  contact: 'Contact Us',
  branches: 'Our Branches',
  gallery: 'Student Gallery',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
};

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get('page') ?? 'home';
  const subtitle = SUBTITLES[page] ?? SUBTITLES.home;

  // Read the logo from disk (not a self-fetch) — same fix applied in
  // opengraph-image.tsx and feed/opengraph-image.tsx.
  const logoData = await readFile(join(process.cwd(), 'public/tensai-logo.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  // No custom font: the Sora TTF fetched from GitHub fails to parse in this
  // satori version's font engine. Falls back to satori's built-in sans-serif.

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
          {subtitle}
        </div>
      </div>
    ),
    { ...size }
  );
}
