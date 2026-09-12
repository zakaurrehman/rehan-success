import { ImageResponse } from 'next/og'

export const runtime = 'edge'

/**
 * 1024×500 Google Play feature graphic for Rehan Success.
 * Open /feature-graphic in a browser and save the image.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'system-ui, sans-serif', background: 'linear-gradient(135deg, #0b3f3b 0%, #0b1020 65%, #070b16 100%)' }}>
        <div style={{ position: 'absolute', top: -220, right: -140, width: 620, height: 620, borderRadius: 620, display: 'flex', background: 'radial-gradient(circle, rgba(45,212,191,0.32) 0%, rgba(45,212,191,0) 62%)' }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26 }}>
            <Mark />
            <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, fontWeight: 700, letterSpacing: 3 }}>FOREX SIGNALS · EDUCATION</span>
          </div>
          <div style={{ display: 'flex', color: '#ffffff', fontSize: 84, fontWeight: 900, letterSpacing: -3, lineHeight: 1 }}>Rehan</div>
          <div style={{ display: 'flex', color: '#5eead4', fontSize: 84, fontWeight: 800, letterSpacing: -3, lineHeight: 1.05 }}>Success</div>
          <div style={{ display: 'flex', color: '#cbd5e1', fontSize: 24, marginTop: 18 }}>Disciplined trading. Lasting success.</div>
        </div>

        <div style={{ width: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: 56 }}>
          <div style={{ width: 300, display: 'flex', flexDirection: 'column', background: '#121a2b', border: '1px solid rgba(148,163,184,0.25)', borderRadius: 22, padding: 22, boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#7c8797', fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>SAMPLE SIGNAL</span>
                <span style={{ color: '#eef2f7', fontSize: 24, fontWeight: 800, marginTop: 2 }}>XAU/USD</span>
              </div>
              <div style={{ display: 'flex', background: '#16a34a', color: '#fff', fontWeight: 800, fontSize: 15, padding: '7px 16px', borderRadius: 999 }}>BUY</div>
            </div>
            <Row label="Entry" value="2,345.50" color="#eef2f7" />
            <Row label="Take profit" value="2,358.00" color="#4ade80" />
            <Row label="Stop loss" value="2,335.00" color="#f87171" />
          </div>
        </div>
      </div>
    ),
    { width: 1024, height: 500 }
  )
}

function Mark() {
  return (
    <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 5, padding: '0 0 11px', position: 'relative', background: 'linear-gradient(145deg, #14b8a6, #0f766e 55%, #0b3f3b)' }}>
      <div style={{ width: 8, height: 14, borderRadius: 3, background: 'rgba(255,255,255,0.62)', display: 'flex' }} />
      <div style={{ width: 8, height: 22, borderRadius: 3, background: 'rgba(255,255,255,0.82)', display: 'flex' }} />
      <div style={{ width: 8, height: 30, borderRadius: 3, background: '#ffffff', display: 'flex' }} />
    </div>
  )
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(148,163,184,0.08)', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
      <span style={{ color: '#a3adbe', fontSize: 14 }}>{label}</span>
      <span style={{ color, fontWeight: 700, fontSize: 14 }}>{value}</span>
    </div>
  )
}
