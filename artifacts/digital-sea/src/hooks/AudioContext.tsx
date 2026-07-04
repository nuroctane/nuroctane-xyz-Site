import { createContext, useContext, useRef, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

interface AudioCtxValue {
  audioRef:  React.MutableRefObject<HTMLAudioElement | null>;
  enabled:   boolean;
  volume:    number;
  setVolume: (v: number) => void;
  toggle:    () => void;
}

const Ctx = createContext<AudioCtxValue>(null!);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume]   = useState(0.5);

  useEffect(() => {
    const a = new Audio();
    a.volume = volume;
    a.loop   = true;
    audioRef.current = a;
    return () => { a.pause(); a.src = ''; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = volume;
  }, [volume]);

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      const a = audioRef.current;
      if (!a) return next;
      if (next) { a.muted = false; a.play().catch(() => {}); }
      else       { a.pause(); a.muted = true; }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ audioRef, enabled, volume, setVolume, toggle }), [enabled, volume, setVolume, toggle]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudioCtx() {
  return useContext(Ctx);
}
