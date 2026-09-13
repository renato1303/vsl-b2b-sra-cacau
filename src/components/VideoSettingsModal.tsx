import React, { useState } from 'react';
import { X, Check, Film, RefreshCw, Link as LinkIcon } from 'lucide-react';

interface VideoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSaveUrl: (newUrl: string) => void;
  onResetDefault: () => void;
}

export const VideoSettingsModal: React.FC<VideoSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onSaveUrl,
  onResetDefault
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(inputUrl);
    onClose();
  };

  return (
    <div
      id="video-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 text-neutral-900"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Configurar Vídeo da VSL</h3>
              <p className="text-xs text-neutral-500">Insira a URL do vídeo de apresentação da Luna</p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="video-url-input"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5"
            >
              Link do Vídeo (MP4, YouTube ou Vimeo)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                id="video-url-input"
                type="url"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                placeholder="https://... (.mp4, YouTube ou Vimeo)"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
              Suporta links diretos de arquivo MP4 ou links de vídeo do YouTube e Vimeo.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              id="btn-reset-video"
              onClick={() => {
                onResetDefault();
                onClose();
              }}
              className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restaurar padrão</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-video"
                className="px-4 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Vídeo</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
