import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
} from 'lucide-react';

interface VideoPlayerProps {
  customVideoUrl?: string;
  onOpenSettings?: () => void;
  onTimeUpdate?: (time: number) => void;
  onAudioActivated?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  customVideoUrl,
  onOpenSettings,
  onTimeUpdate,
  onAudioActivated,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isResettingToStartRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isAudioActivated, setIsAudioActivated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffered, setBuffered] = useState(0);

  const defaultVideoUrl = encodeURI('/Será Cacau 2 (1).mp4');
  
  // Use uploaded 9:16 video by default or custom link if configured
  const activeVideoUrl = customVideoUrl && customVideoUrl.trim().length > 0 
    ? customVideoUrl.trim() 
    : defaultVideoUrl;

  const isYouTube = activeVideoUrl.includes('youtube.com') || activeVideoUrl.includes('youtu.be');
  const isVimeo = activeVideoUrl.includes('vimeo.com');

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    const videoId = match ? match[1] : '';
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&color=854d0e`;
  };

  // Autoplay video in background muted on mount (VTurb Smart Autoplay style)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      setIsMuted(true);
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log('Autoplay muted started or waiting for user interaction:', err);
        });
    }
  }, [activeVideoUrl]);

  // Hide controls after inactivity when playing with audio
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && isAudioActivated && showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 2600);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, isAudioActivated, showControls]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // VTurb Unmute action: Unmutes, resets to start (0:00) so user catches the full pitch, and starts playing with audio
  const handleActivateAudio = () => {
    if (!videoRef.current) return;
    isResettingToStartRef.current = true;
    
    // Pause briefly, rewind to the exact beginning, and unmute
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
    videoRef.current.muted = false;
    videoRef.current.volume = 1;

    videoRef.current
      .play()
      .then(() => {
        setIsMuted(false);
        setVolume(1);
        setIsAudioActivated(true);
        setIsPlaying(true);
        setShowControls(true);
        onAudioActivated?.();
        setTimeout(() => {
          isResettingToStartRef.current = false;
        }, 600);
      })
      .catch((err) => {
        console.error('Error playing with audio:', err);
        setIsMuted(false);
        setIsAudioActivated(true);
        onAudioActivated?.();
        setTimeout(() => {
          isResettingToStartRef.current = false;
        }, 600);
      });
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    isResettingToStartRef.current = true;
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsEnded(false);
    videoRef.current.muted = false;
    videoRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setShowControls(true);
        setTimeout(() => {
          isResettingToStartRef.current = false;
        }, 500);
      })
      .catch((err) => {
        console.error('Error restarting video:', err);
        setTimeout(() => {
          isResettingToStartRef.current = false;
        }, 500);
      });
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (!isAudioActivated) {
      handleActivateAudio();
      return;
    }

    if (isEnded) {
      handleRestart();
      return;
    }

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    onTimeUpdate?.(time);
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufferedEnd / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    if (!isAudioActivated) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  };

  // Prevent user from scrubbing or seeking forward/backward
  const handleSeeking = () => {
    if (!videoRef.current || isResettingToStartRef.current || !isAudioActivated) return;
    const diff = Math.abs(videoRef.current.currentTime - currentTime);
    if (diff > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 1;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = Number(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const togglePlaybackSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackRate(nextSpeed);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      id="vsl-video-container"
      className="relative w-full aspect-[9/16] bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-200/90 group select-none touch-manipulation cursor-pointer"
      onMouseMove={() => isAudioActivated && setShowControls(true)}
      onMouseLeave={() => isPlaying && isAudioActivated && setShowControls(false)}
      onClick={() => {
        if (!isAudioActivated) {
          handleActivateAudio();
        } else if (isEnded) {
          handleRestart();
        } else {
          togglePlay();
        }
      }}
    >
      {/* If it's a YouTube embed */}
      {isYouTube ? (
        <iframe
          src={getYouTubeEmbedUrl(activeVideoUrl)}
          title="Apresentação B2B Será Cacau"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : isVimeo ? (
        <iframe
          src={getVimeoEmbedUrl(activeVideoUrl)}
          title="Apresentação B2B Será Cacau"
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {/* HTML5 Native Video: plays muted & looped automatically until unmuted */}
          <video
            ref={videoRef}
            src={activeVideoUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop={!isAudioActivated}
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onSeeking={handleSeeking}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
              setIsEnded(true);
            }}
            onPlay={() => {
              setIsPlaying(true);
              setIsEnded(false);
            }}
            onPause={() => setIsPlaying(false)}
          />

          {/* ========================================================= */}
          {/* VTURB STYLE "SEU VÍDEO JÁ COMEÇOU! CLIQUE PARA OUVIR" OVERLAY */}
          {/* ========================================================= */}
          {!isAudioActivated && (
            <div
              id="vturb-unmute-overlay"
              onClick={(e) => {
                e.stopPropagation();
                handleActivateAudio();
              }}
              className="absolute inset-0 bg-neutral-950/25 hover:bg-neutral-950/35 transition-colors flex flex-col items-center justify-center p-4 z-30 cursor-pointer"
            >
              {/* Central VTurb Pulse Button */}
              <div className="relative flex flex-col items-center justify-center text-center max-w-[280px] sm:max-w-[320px]">
                {/* Expanding pulse radar rings */}
                <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
                <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-600/40 animate-pulse pointer-events-none" />

                {/* Primary Animated Unmute Button */}
                <div className="relative z-10 w-full bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 active:scale-95 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-amber-400/50 flex flex-col items-center gap-2.5 transition-all transform duration-150">
                  {/* Speaker Icon with Sound Wave Animation */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center shadow-inner">
                    <div className="relative flex items-center justify-center">
                      <Volume2 className="w-8 h-8 sm:w-9 sm:h-9 text-white animate-bounce" />
                    </div>
                  </div>

                  {/* VTurb Call to Action Copy */}
                  <div className="space-y-0.5">
                    <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-amber-200 uppercase">
                      SEU VÍDEO JÁ COMEÇOU!
                    </span>
                    <span className="block text-base sm:text-lg font-black tracking-tight text-white uppercase drop-shadow-xs">
                      CLIQUE PARA OUVIR
                    </span>
                  </div>

                  {/* Visual animated audio visualizer waves */}
                  <div className="flex items-center justify-center gap-1 h-3.5 pt-0.5">
                    <span className="w-1 h-2 bg-amber-200 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                    <span className="w-1 h-3.5 bg-amber-200 rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s]" />
                    <span className="w-1 h-2 bg-amber-200 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.2s]" />
                    <span className="w-1 h-3 bg-amber-200 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.15s]" />
                    <span className="w-1 h-1.5 bg-amber-200 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.25s]" />
                  </div>
                </div>

                <p className="mt-3 text-white/95 text-[11px] font-medium drop-shadow-md">
                  Toque em qualquer lugar para ativar o áudio
                </p>
              </div>
            </div>
          )}

          {/* Center Play Button Overlay (when paused after audio was already activated and not ended) */}
          {isAudioActivated && !isPlaying && !isEnded && (
            <div
              id="vsl-paused-overlay"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] flex items-center justify-center z-20 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-amber-700/90 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform">
                <Play className="w-8 h-8 ml-1 fill-current" />
              </div>
            </div>
          )}

          {/* Video Finished Screen Overlay with Restart Button */}
          {isEnded && (
            <div
              id="vsl-ended-overlay"
              onClick={(e) => {
                e.stopPropagation();
                handleRestart();
              }}
              className="absolute inset-0 bg-neutral-950/80 backdrop-blur-[3px] flex flex-col items-center justify-center p-6 z-30 cursor-pointer animate-fade-in-scale"
            >
              <div className="flex flex-col items-center gap-4 text-center max-w-[280px]">
                <button
                  type="button"
                  id="btn-restart-video-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestart();
                  }}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 active:scale-95 text-white flex items-center justify-center shadow-2xl transition-all duration-200 border-2 border-amber-400/60 group"
                  aria-label="Reiniciar vídeo"
                >
                  <RotateCcw className="w-8 h-8 sm:w-9 sm:h-9 group-hover:-rotate-45 transition-transform duration-300" />
                </button>
                <div className="space-y-2">
                  <span className="block text-base sm:text-lg font-black tracking-wide text-white uppercase">
                    Apresentação Concluída
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestart();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-xs sm:text-sm text-white font-bold tracking-wide transition-all border border-white/25 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reiniciar vídeo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Player Controls (visible when audio is active & controls shown) */}
          <div
            id="vsl-controls-bar"
            onClick={e => e.stopPropagation()}
            className={`absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 bg-gradient-to-t from-neutral-950/95 via-neutral-950/70 to-transparent transition-opacity duration-300 z-20 ${
              isAudioActivated && (showControls || !isPlaying || isEnded)
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Visual progress bar (strictly non-interactive: cannot scrub, seek, advance or rewind) */}
            <div className="relative w-full h-1.5 sm:h-2 mb-2 sm:mb-3 bg-neutral-800/80 rounded-full overflow-hidden pointer-events-none select-none">
              {/* Buffered progress */}
              <div
                className="absolute top-0 left-0 h-full bg-neutral-600/40 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              {/* Played progress */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-150"
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`
                }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between text-white text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-4">
                {/* Play / Pause */}
                <button
                  type="button"
                  id="btn-play-pause"
                  onClick={togglePlay}
                  className="p-2 rounded-lg hover:bg-neutral-800/80 active:bg-neutral-700 text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label={isEnded ? 'Reiniciar vídeo' : isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                >
                  {isEnded ? (
                    <RotateCcw className="w-4 h-4 sm:w-6 sm:h-6" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
                  )}
                </button>

                {/* Volume & Mute */}
                <div className="flex items-center gap-1 group/vol">
                  <button
                    type="button"
                    id="btn-volume-toggle"
                    onClick={toggleMute}
                    className="p-2 rounded-lg hover:bg-neutral-800/80 active:bg-neutral-700 text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-12 sm:w-20 h-1.5 bg-neutral-600 accent-amber-500 rounded-lg cursor-pointer hidden xs:block"
                    aria-label="Controle de volume"
                  />
                </div>

                {/* Time Display */}
                <div className="text-neutral-300 font-mono text-[10px] sm:text-xs">
                  <span>{formatTime(currentTime)}</span>
                  <span className="mx-0.5 sm:mx-1 text-neutral-500">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                {/* Speed Toggle */}
                <button
                  type="button"
                  id="btn-playback-speed"
                  onClick={togglePlaybackSpeed}
                  className="px-2 py-1 rounded bg-neutral-800/90 active:bg-neutral-700 hover:bg-neutral-700 text-neutral-200 text-[11px] sm:text-xs font-semibold tracking-wider transition-colors min-h-[32px] flex items-center justify-center"
                  aria-label={`Velocidade ${playbackRate}x`}
                  title="Velocidade de reprodução"
                >
                  {playbackRate}x
                </button>

                {/* Fullscreen */}
                <button
                  type="button"
                  id="btn-fullscreen"
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg hover:bg-neutral-800/80 active:bg-neutral-700 text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
