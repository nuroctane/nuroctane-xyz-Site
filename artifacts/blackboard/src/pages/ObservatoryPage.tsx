import { useEffect } from 'react';
import { StandaloneNav } from './StandaloneNav';
import { MiniAudio } from '../components/hud/MiniAudio';
import ObservatoryApp from '../observatory/ObservatoryApp';

export default function ObservatoryPage() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <main className="observatory-page">
      <ObservatoryApp />
      <StandaloneNav />
      <div className="observatory-audio">
        <MiniAudio />
      </div>
    </main>
  );
}
