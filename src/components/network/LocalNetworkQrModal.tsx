import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import QRCode from 'qrcode';
import { 
  QrCode, Copy, Check, ExternalLink, Maximize2, Minimize2, X
} from 'lucide-react';

interface LocalNetworkQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalNetworkQrModal: React.FC<LocalNetworkQrModalProps> = ({ isOpen, onClose }) => {
  const { isRtl } = useApp();

  const defaultBaseUrl = typeof window !== 'undefined' 
    ? (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
        ? 'http://192.168.1.50:3000'
        : window.location.origin)
    : 'http://192.168.1.50:3000';

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mainQrDataUrl, setMainQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // URL to access the student page
  const targetStudentUrl = `${defaultBaseUrl.replace(/\/$/, '')}/?role=student`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(targetStudentUrl, {
      width: 420,
      margin: 2,
      color: {
        dark: '#13293a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then(url => {
        if (isMounted) setMainQrDataUrl(url);
      })
      .catch(err => console.error('Error generating QR:', err));

    return () => {
      isMounted = false;
    };
  }, [targetStudentUrl]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetStudentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in ${
      isFullscreen ? 'p-0' : ''
    }`}>
      <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col w-full transition-all ${
        isFullscreen ? 'w-full h-full rounded-none border-none' : 'max-w-md'
      }`}>
        {/* Header Bar */}
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold tracking-tight text-white">
              {isRtl ? 'عرض رمز QR لولوج التلاميذ' : 'Projeter le QR Code pour les Tablettes Élèves'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body: Only QR Code & Student URL */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-6">
          {/* QR Code */}
          <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-md inline-block">
            {mainQrDataUrl ? (
              <img 
                src={mainQrDataUrl} 
                alt="QR Code Espace Élève" 
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-2xl mx-auto"
              />
            ) : (
              <div className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center text-slate-400 text-xs">
                ...
              </div>
            )}
          </div>

          {/* Direct Student URL Box */}
          <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-2">
            <div className="text-left font-mono font-bold text-xs text-slate-800 truncate flex-1 px-2 select-all">
              {targetStudentUrl}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopyUrl}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Copier l'URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={targetStudentUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                title="Ouvrir la page élève"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

