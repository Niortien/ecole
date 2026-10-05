import { ImageResponse } from 'next/og'

export const alt = 'Cartable, la gestion de votre école, claire comme une page de cahier'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Image de partage (WhatsApp, Facebook, LinkedIn) : le nom, la promesse, la couleur de l'ardoise. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#1f5b4a',
          color: '#fbf8f0',
          padding: 72,
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fbf8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 34, height: 28, background: '#1f5b4a', borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>Cartable</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, fontWeight: 700, maxWidth: 900 }}>La gestion de votre école, claire comme une page de cahier.</div>
          <div style={{ fontSize: 30, color: '#f2b705', fontFamily: 'sans-serif' }}>Notes, bulletins, présences, scolarité, cantine · Cocody, Abidjan</div>
        </div>
      </div>
    ),
    size
  )
}
