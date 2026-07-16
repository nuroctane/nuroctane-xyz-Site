import { useEffect } from 'react';
import { StandaloneNav } from './StandaloneNav';
import { MiniAudio } from '../components/hud/MiniAudio';

export default function OrbitVeilPage() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <main className="orbit-veil-page">
      <iframe
        className="orbit-veil-frame"
        src="/orbit-veil-runtime/index.html"
        title="Orbit Veil real-time satellite tracker"
        allow="fullscreen"
      />
      <StandaloneNav />
      <div className="orbit-veil-audio">
        <MiniAudio />
      </div>
    </main>
  );
}
