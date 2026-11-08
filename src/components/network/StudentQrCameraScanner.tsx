import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface StudentQrCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedCode: string) => void;
  isRtl?: boolean;
}

export const StudentQrCameraScanner: React.FC<StudentQrCameraScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  isRtl = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedBadge, setDetectedBadge] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    let activeStream: MediaStream | null = null;
    let scanInterval: any = null;

    const startCamera = async () => {
      try {
        setErrorMsg(null);
        setIsScanning(true);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.error(e));
        }

        // Check if BarcodeDetector is supported
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code'],
          });

          scanInterval = setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const raw = barcodes[0].rawValue;
                handleCodeExtracted(raw);
              }
            } catch {
              // ignore frame detection error
            }
          }, 400);
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setErrorMsg(
          isRtl
            ? 'تعذر الوصول إلى الكاميرا. تأكد من منح الإذن لاستخدام الكاميرا على هذه اللوحة.'
            : 'Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès à l\'appareil photo.'
        );
        setIsScanning(false);
      }
    };

    startCamera();

    return () => {
      if (scanInterval) clearInterval(scanInterval);
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, isRtl]);

  const handleCodeExtracted = (rawText: string) => {
    if (!rawText) return;
    let foundCode = rawText.trim();

    // If it's a URL like http://.../?massar=G134005
    try {
      if (rawText.includes('?') || rawText.startsWith('http')) {
        const url = new URL(rawText);
        const massarParam = url.searchParams.get('massar') || url.searchParams.get('code');
        if (massarParam) foundCode = massarParam;
      }
    } catch {
      // ignore parsing error
    }

    setDetectedBadge(foundCode);
    setTimeout(() => {
      onScanSuccess(foundCode);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-w-md w-full flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">
                {isRtl ? 'مسح بطاقة التلميذ (QR Code)' : 'Scanner mon badge QR'}
              </h4>
              <p className="text-[11px] text-blue-100">
                {isRtl ? 'وجه الكاميرا نحو رمز QR على بطاقتك' : 'Pointe la caméra vers le code sur ta fiche'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-72 h-72 rounded-2xl overflow-hidden bg-slate-950 border-4 border-indigo-500 shadow-inner flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Target Sight Frame */}
            <div className="absolute inset-8 border-2 border-dashed border-white/80 rounded-xl pointer-events-none flex items-center justify-center">
              {/* Laser scanning bar */}
              {isScanning && !detectedBadge && (
                <div className="w-full h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-xs shadow-cyan-400" />
              )}
            </div>

            {/* Success Overlay if recognized */}
            {detectedBadge && (
              <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white p-4 animate-in zoom-in">
                <CheckCircle2 className="w-16 h-16 text-white mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Badge Reconnu !</span>
                <span className="font-mono text-lg font-black mt-1 bg-white/20 px-3 py-1 rounded-xl">
                  {detectedBadge}
                </span>
              </div>
            )}
          </div>

          {errorMsg ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <p className="text-xs text-center text-slate-500 font-medium">
              {isRtl 
                ? 'ثبت رمز QR داخل الإطار وسيتم تسجيل دخولك تلقائياً.' 
                : 'Maintiens le QR code bien droit devant la caméra pour te connecter.'}
            </p>
          )}

          {/* Fallback File Upload / Native Camera Capture */}
          <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <label className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold text-center cursor-pointer transition">
              <span>{isRtl ? 'اختيار صورة الرمز' : 'Prendre une photo du code'}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if ('BarcodeDetector' in window) {
                    try {
                      const img = new Image();
                      img.src = URL.createObjectURL(file);
                      img.onload = async () => {
                        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                        const codes = await detector.detect(img);
                        if (codes && codes[0]) {
                          handleCodeExtracted(codes[0].rawValue);
                        }
                      };
                    } catch (err) {
                      console.error(err);
                    }
                  }
                }}
              />
            </label>

            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
