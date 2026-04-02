import { ImageResponse } from 'next/og';

const width = 1200;
const height = 630;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative',
          backgroundColor: '#020617',
          color: '#f8fafc',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 18% 18%, rgba(59, 130, 246, 0.35), transparent 34%), radial-gradient(circle at 82% 80%, rgba(16, 185, 129, 0.18), transparent 30%), linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 1))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 36,
            borderRadius: 32,
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            padding: '72px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 76,
                  height: 76,
                  borderRadius: 22,
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  fontSize: 38,
                  fontWeight: 700,
                }}
              >
                T
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', fontSize: 34, fontWeight: 700 }}>TreasuryOS</div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#93c5fd',
                  }}
                >
                  Institutional Solana Treasury
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
              }}
            >
              {['Compliance-first', 'Governance-ready', 'Pilot launch'].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 18px',
                    borderRadius: 999,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#cbd5e1',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              maxWidth: 900,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 72,
                lineHeight: 1.04,
                fontWeight: 700,
                letterSpacing: '-0.04em',
              }}
            >
              Compliance-first treasury operations for institutional teams.
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                lineHeight: 1.4,
                color: '#cbd5e1',
              }}
            >
              Governance, reporting, and phased digital-asset operations that move institutions
              onto Solana without losing control.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    },
  );
}
