import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { VideoSettingsModal } from './components/VideoSettingsModal';

export default function App() {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [hasStartedWatching, setHasStartedWatching] = useState(false);
  const ctaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The 20-second countdown only begins when the user clicks the video to watch with audio
  const handleAudioActivated = () => {
    setHasStartedWatching(true);
    if (ctaTimerRef.current) clearTimeout(ctaTimerRef.current);
    ctaTimerRef.current = setTimeout(() => {
      setShowCta(true);
    }, 20000);
  };

  const handleTimeUpdate = (time: number) => {
    if (hasStartedWatching && time >= 20) {
      setShowCta(true);
    }
  };

  useEffect(() => {
    return () => {
      if (ctaTimerRef.current) clearTimeout(ctaTimerRef.current);
    };
  }, []);

  // Load saved video URL from localStorage if any
  useEffect(() => {
    const saved = localStorage.getItem('sera_cacau_vsl_video_url');
    if (saved) {
      setVideoUrl(saved);
    }
  }, []);

  const handleSaveVideoUrl = (newUrl: string) => {
    setVideoUrl(newUrl);
    localStorage.setItem('sera_cacau_vsl_video_url', newUrl);
  };

  const handleResetDefaultVideo = () => {
    setVideoUrl('');
    localStorage.removeItem('sera_cacau_vsl_video_url');
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
      {/* Top brand logo */}
      <header className="w-full pt-6 pb-2 sm:pt-10 sm:pb-4 text-center px-4 flex flex-col items-center justify-center">
        <img
          src="/logo.png"
          alt="Será Cacau"
          className="h-10 sm:h-14 md:h-16 w-auto object-contain max-w-[200px] sm:max-w-[240px]"
        />
      </header>

      {/* Main VSL Container */}
      <main className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 md:px-8 py-3 sm:py-6 flex-1 flex flex-col items-center">
        {/* HEADLINE */}
        <section className="w-full text-center max-w-4xl mx-auto mb-4 sm:mb-8">
          <h1
            id="vsl-headline"
            className="text-[21px] sm:text-3xl md:text-4xl lg:text-[40px] font-black text-neutral-950 tracking-tight leading-[1.32] sm:leading-[1.25] uppercase text-balance"
          >
            SE SUA OPERAÇÃO JÁ FATURA{' '}
            <span className="relative inline-block ml-1 mr-0.5 px-2 sm:px-3 py-0.5 text-black font-black z-0 whitespace-nowrap">
              <span className="relative z-10 text-black font-black drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                MAIS DE R$ 50 MIL/MÊS
              </span>
              {/* Organic yellow paintbrush stroke background */}
              <svg
                aria-hidden="true"
                viewBox="0 0 360 52"
                preserveAspectRatio="none"
                className="absolute -inset-x-2 -inset-y-1 w-[calc(100%+16px)] h-[calc(100%+8px)] -z-10 pointer-events-none -rotate-[0.5deg]"
              >
                <path
                  d="M 5,26 C 2,23 2,19 6,17 C 22,12 65,8 135,8 C 215,8 295,11 345,15 C 356,16 359,20 357,25 C 353,33 330,41 275,46 C 205,50 120,51 55,47 C 22,45 8,41 4,37 C 1,34 1,30 4,28 Z"
                  fill="#FACC15"
                />
                <path
                  d="M 12,28 C 35,16 95,12 175,13 C 255,14 320,18 348,23 C 355,25 354,30 347,35 C 322,43 252,48 175,47 C 105,46 38,43 12,37 C 8,35 8,30 12,28 Z"
                  fill="#FDE047"
                  opacity="0.8"
                />
              </svg>
            </span>, CONHEÇA UMA NOVA FORMA DE TRANSFORMAR CACAU 100% EM{' '}
            <span className="text-amber-900 underline decoration-amber-500 decoration-2 sm:decoration-4 underline-offset-4 sm:underline-offset-6 font-black inline">
              EXPERIÊNCIA,{' '}
              <span className="whitespace-nowrap">DIFERENCIAÇÃO E MARGEM</span>
            </span>
            
          </h1>
        </section>

        {/* SUBHEADLINE */}
        <section className="w-full text-center max-w-3xl mx-auto mb-6 sm:mb-8 px-1 sm:px-0">
          <p
            id="vsl-subheadline"
            className="text-[15px] sm:text-lg md:text-xl text-neutral-700 font-normal leading-[1.55] sm:leading-relaxed text-balance"
          >
           A Será Cacau conecta negócios a um cacau 100% brasileiro, de origem rastreável na Costa do Cacau, para revenda, bebidas, receitas e novas experiências.
          </p>
        </section>

        {/* VIDEO PLAYER SECTION (9:16) */}
        <section className="w-full flex justify-center mb-3 sm:mb-4 px-2">
          <div className="w-full max-w-[320px] xs:max-w-[350px] sm:max-w-[380px] md:max-w-[400px]">
            <VideoPlayer
              customVideoUrl={videoUrl}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onTimeUpdate={handleTimeUpdate}
              onAudioActivated={handleAudioActivated}
            />
          </div>
        </section>

        {/* MICROCOPY ABAIXO DO PLAYER */}
        <section className="w-full max-w-3xl mx-auto text-center mt-2 mb-4 px-2 sm:px-0">
          <p
            id="vsl-microcopy-bottom"
            className="text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed"
          >
            Assista à apresentação da Luna, nutricionista e embaixadora da Será Cacau, e entenda como funciona nossa parceria B2B.
          </p>
        </section>

        {/* DELAYED CALL TO ACTION (CTA) - Appears BELOW the copy 20 seconds AFTER clicking the video */}
        {showCta && (
          <section
            id="vsl-cta-section"
            className="w-full max-w-md mx-auto flex flex-col items-center justify-center my-3 sm:my-5 px-4 animate-fade-in-scale"
          >
            <a
              id="btn-quero-ser-parceiro"
              href="https://responda.seracacau.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-[360px] py-4 sm:py-4.5 px-6 rounded-xl sm:rounded-2xl text-white font-black text-base sm:text-lg tracking-wider uppercase bg-[#2D6A4F] hover:bg-[#245640] active:scale-[0.98] transition-all duration-200 animate-pulse-attention flex items-center justify-center gap-2.5 group cursor-pointer border border-[#40916C]/40 shadow-lg"
            >
              <span>QUERO SER PARCEIRO</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
            </a>
          </section>
        )}
      </main>

      {/* Clean minimal footer */}
      <footer className="w-full py-6 sm:py-8 text-center border-t border-neutral-100 text-xs text-neutral-400">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center">
          <p>© {new Date().getFullYear()} Será Cacau. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Video Settings Modal for custom YouTube / MP4 video link */}
      <VideoSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUrl={videoUrl}
        onSaveUrl={handleSaveVideoUrl}
        onResetDefault={handleResetDefaultVideo}
      />
    </div>
  );
}
