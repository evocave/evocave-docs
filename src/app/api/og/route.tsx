// src/app/api/og/route.tsx

import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.evocave.com'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') ?? 'Documentation'
  const topic = searchParams.get('topic') ?? 'Evocave Docs'
  const breadcrumb = searchParams.get('breadcrumb')

  const logo = readFileSync(join(process.cwd(), 'public/logo.png'))
  const logoBase64 = `data:image/png;base64,${logo.toString('base64')}`
  const fontRegular = readFileSync(join(process.cwd(), 'public/fonts/Geist-Regular.ttf'))
  const fontBold = readFileSync(join(process.cwd(), 'public/fonts/Geist-Bold.ttf'))

  const breadcrumbText = breadcrumb ? `${topic} / ${breadcrumb}` : topic

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        fontFamily: 'Geist',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoBase64} width={252} height={40} alt="Evocave" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            color: '#ffffff',
            fontSize: '56px',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>
        <div style={{ color: '#666', fontSize: '20px', fontWeight: 400 }}>{breadcrumbText}</div>
      </div>

      <div style={{ color: '#444', fontSize: '16px' }}>{BASE_URL}</div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Geist', data: fontRegular, weight: 400 },
        { name: 'Geist', data: fontBold, weight: 700 },
      ],
    },
  )
}
