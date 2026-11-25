import { useRouter } from 'next/navigation';
import GameButton from '@/components/Buttons/GameButton';

export default function GameOverDialogPlayDemo({ show, onClose, gameState }) {
  const router = useRouter();

  if (!show) return null;

  const handleViewScore = () => {
    router.push('/score');
  };

  const handleReset = () => {
    onClose();
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined ? process.env.NEXT_PUBLIC_BASE_PATH : '/EIS/admin';
    window.location.href = basePath || '/EIS/admin';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(500px, 90vw)',
          backgroundColor: '#f5f5f5',
          border: '3px solid #d4a017',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          fontFamily: 'Arial, sans-serif',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ backgroundColor: '#111', color: '#d4a017', padding: '16px 20px', fontWeight: 700, letterSpacing: '0.1em', textAlign: 'center', fontSize: 18 }}>
          PLAY DEMO OVER
        </div>

        <div style={{ padding: '24px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 16 }}>
            120 Days Completed
          </h2>
          
          <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, marginBottom: 20 }}>
            Your play demo has reached the 120-day limit. 
            View your final score and performance summary.
          </p>

          {gameState && (
            <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: 16, marginBottom: 20, borderRadius: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#666' }}>Total Days:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{gameState.currentDay}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#666' }}>Decisions Made:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{gameState.decisionCount || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#666' }}>Adopters:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
                  {gameState.managers?.filter(m => m.adopted > 0).length || 0}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <GameButton
              label="VIEW FINAL SCORE"
              onClick={handleViewScore}
              variant="default"
              size="lg"
              className="!py-3 !px-6"
            />
            
            <button
              onClick={handleReset}
              style={{
                background: 'none',
                border: '1px solid #999',
                padding: '12px 24px',
                fontSize: 13,
                fontWeight: 600,
                color: '#666',
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              Start New Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
