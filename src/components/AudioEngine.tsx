import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';

/**
 * Headless component that owns the single global <audio> element.
 * It mirrors imperative audio events into the Zustand player store and
 * applies store changes (play/pause, speed, seek, track switch) back onto
 * the element. Rendered once near the app root so audio survives navigation.
 */
export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSavedRef = useRef(0);

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const speed = usePlayerStore((s) => s.speed);
  const volume = usePlayerStore((s) => s.volume);
  const seekRequest = usePlayerStore((s) => s.seekRequest);

  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const next = usePlayerStore((s) => s.next);
  const clearSeekRequest = usePlayerStore((s) => s.clearSeekRequest);

  const pushRecent = useLibraryStore((s) => s.pushRecent);
  const saveProgress = useLibraryStore((s) => s.saveProgress);

  const current = currentIndex >= 0 ? queue[currentIndex] : null;

  // Load new source when the active track changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.src !== current.audioUrl) {
      audio.src = current.audioUrl;
      audio.load();

      // Resume from saved progress if available and not finished.
      const saved = useLibraryStore.getState().getProgress(current.id);
      const resumeAt = saved && saved.duration > 0 && saved.position < saved.duration - 10
        ? saved.position
        : 0;
      if (resumeAt > 0) {
        const onMeta = () => {
          audio.currentTime = resumeAt;
          audio.removeEventListener('loadedmetadata', onMeta);
        };
        audio.addEventListener('loadedmetadata', onMeta);
      }
      pushRecent(current.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  // Play / pause sync.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, current, setPlaying]);

  // Playback rate + volume.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Handle seek requests from the UI.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && seekRequest != null) {
      audio.currentTime = seekRequest;
      setCurrentTime(seekRequest);
      clearSeekRequest();
    }
  }, [seekRequest, setCurrentTime, clearSeekRequest]);

  // Media Session metadata for lock-screen / OS controls.
  useEffect(() => {
    if (!current || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.speaker,
      album: current.book,
    });
    navigator.mediaSession.setActionHandler('play', () => setPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
    navigator.mediaSession.setActionHandler('nexttrack', () => next());
    navigator.mediaSession.setActionHandler('previoustrack', () =>
      usePlayerStore.getState().previous(),
    );
  }, [current, setPlaying, next]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    setCurrentTime(audio.currentTime);

    // Throttle progress persistence to once every ~5s.
    const now = Date.now();
    if (now - lastSavedRef.current > 5000 && audio.duration > 0) {
      lastSavedRef.current = now;
      saveProgress({
        id: current.id,
        position: audio.currentTime,
        duration: audio.duration,
        updatedAt: now,
      });
    }
  };

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      onTimeUpdate={handleTimeUpdate}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onEnded={() => {
        if (current) {
          saveProgress({
            id: current.id,
            position: 0,
            duration: audioRef.current?.duration ?? 0,
            updatedAt: Date.now(),
          });
        }
        next();
      }}
    />
  );
}
