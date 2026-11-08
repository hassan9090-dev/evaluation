import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import QRCode from 'qrcode';
import { 
  QrCode, Wifi, Monitor, Printer, Copy, Check, Download, 
  ExternalLink, Smartphone, AlertCircle, Info, Maximize2, 
  Minimize2, X, RefreshCw, BookOpen, UserCheck, Sparkles
} from 'lucide-react';

interface LocalNetworkQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalNetworkQrModal: React.FC<LocalNetworkQrModalProps> = ({ isOpen, onClose }) => {
  const { lang, isRtl, students, evaluations } = useApp();
  const t = translations[lang];

  // Current network origin or custom teacher IP
  const defaultBaseUrl = typeof window !== 'undefined' 
    ? (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
        ? 'http://192.168.1.50:3000'
        : window.location.origin)
    : 'http://192.168.1.50:3000';

  const [customServerUrl, setCustomServerUrl] = useState<string>(defaultBaseUrl);
  const [selectedEvalId, setSelectedEvalId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'projector' | 'badges' | 'guide'>('projector');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mainQrDataUrl, setMainQrDataUrl] = useState<string>('');
  const [studentQrCodes, setStudentQrCodes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Computed Target URL for general student entrance
  const targetStudentUrl = `${customServerUrl.replace(/\/$/, '')}/?role=student${
    selectedEvalId !== 'all' ? `&eval=${selectedEvalId}` : ''
  }`;

  // Generate Main QR Code for projector
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(targetStudentUrl, {
      width: 420,
      margin: 2,
      color: {
        dark: '#1e1b4b', // deep indigo
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

  // Generate Individual Student QR Codes for Badges Sheet
  useEffect(() => {
    if (activeTab !== 'badges') return;
    let isMounted = true;

    const generateAll = async () => {
      const generated: Record<string, string> = {};
      for (const st of students) {
        const studentUrl = `${customServerUrl.replace(/\/$/, '')}/?role=student&massar=${encodeURIComponent(st.studentCode)}`;
        try {
          const url = await QRCode.toDataURL(studentUrl, {
            width: 180,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' },
            errorCorrectionLevel: 'M',
          });
          generated[st.id] = url;
        } catch (e) {
          console.error(e);
        }
      }
      if (isMounted) setStudentQrCodes(generated);
    };

    generateAll();

    return () => {
      isMounted = false;
    };
  }, [activeTab, customServerUrl, students]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetStudentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!mainQrDataUrl) return;
    const link = document.createElement('a');
    link.download = `qrcode-suivi-pedagogique-4aep.png`;
    link.href = mainQrDataUrl;
    link.click();
  };

  const isLocalhost = customServerUrl.includes('localhost') || customServerUrl.includes('127.0.0.1');

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-in fade-in ${
      isFullscreen ? 'p-0' : ''
    }`}>
      <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col w-full max-h-[94vh] transition-all ${
        isFullscreen ? 'w-full h-full max-h-none rounded-none border-none' : 'max-w-4xl'
      }`}>
        {/* Header Bar */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-6 py-4 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-inner">
              <QrCode className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
                  {isRtl ? 'شبكة القسم المحلية' : 'Réseau Local & Wi-Fi'}
                </span>
                <span className="text-xs text-blue-200">
                  {isRtl ? 'ربط لوحات التلاميذ' : 'Connexion Tablettes 4AEP'}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white mt-0.5">
                {isRtl ? 'عرض ومشاركة رمز QR لربط أجهزة التلاميذ' : 'Projeter le QR Code pour les Tablettes Élèves'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title={isFullscreen ? 'Quitter plein écran' : 'Plein écran pour vidéoprojecteur'}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2 no-print overflow-x-auto">
          <button
            onClick={() => setActiveTab('projector')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all border-t-2 border-x-2 -mb-px ${
              activeTab === 'projector'
                ? 'bg-white text-indigo-700 border-slate-200 border-b-transparent shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-indigo-600" />
            <span>{isRtl ? 'شاشة العرض (Vidéoprojecteur)' : 'Mode Vidéoprojecteur'}</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all border-t-2 border-x-2 -mb-px ${
              activeTab === 'badges'
                ? 'bg-white text-indigo-700 border-slate-200 border-b-transparent shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>{isRtl ? 'بطاقات التلاميذ بالرمز (Badges QR)' : 'Planche Badges Élèves'}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all border-t-2 border-x-2 -mb-px ${
              activeTab === 'guide'
                ? 'bg-white text-indigo-700 border-slate-200 border-b-transparent shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Wifi className="w-4 h-4 text-blue-600" />
            <span>{isRtl ? 'دليل إعداد الشبكة بدون إنترنت' : 'Guide Réseau & Wi-Fi'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ===================== TAB 1: PROJECTOR MODE ===================== */}
          {activeTab === 'projector' && (
            <div className="space-y-6">
              {/* Configuration Bar (URL & Target) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 no-print">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isRtl ? 'عنوان خادم التطبيق (Adresse IP du PC Prof) :' : 'Adresse du PC Prof sur le réseau Wi-Fi :'}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customServerUrl}
                        onChange={(e) => setCustomServerUrl(e.target.value)}
                        placeholder="http://192.168.1.50:3000"
                        className="w-full px-3 py-1.5 font-mono text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomServerUrl(window.location.origin)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-600 shrink-0"
                        title="Rétablir l'adresse actuelle"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="sm:w-64">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isRtl ? 'توجيه التلاميذ إلى :' : 'Ouvrir directement :'}
                    </label>
                    <select
                      value={selectedEvalId}
                      onChange={(e) => setSelectedEvalId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">{isRtl ? 'بوابة التلاميذ العامة (جميع الاختبارات)' : 'Espace Élève (Tous les tests)'}</option>
                      {evaluations.map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {isRtl ? ev.titleAr : ev.titleFr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Localhost Warning Notice */}
                {isLocalhost && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        {isRtl ? 'تنبيه مهم للربط المحلي : ' : 'Conseil technique : '}
                      </span>
                      <span>
                        {isRtl 
                          ? 'استعمال كلمة "localhost" لا يعمل على الأجهزة الأخرى. يرجى كتابة عنوان IP الحقيقي لحاسوبك (مثال: http://192.168.1.50:3000) حتى تتمكن أجهزة التلاميذ من الاتصال.'
                          : 'Le mot "localhost" ne fonctionne que sur ce PC. Remplacez-le par l\'adresse IPv4 de votre PC sur le Wi-Fi (ex: http://192.168.1.50:3000) pour que les tablettes chargent la page.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Classroom Projection Card */}
              <div className="bg-linear-to-br from-indigo-50/70 via-white to-blue-50/70 rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 text-center flex flex-col items-center justify-center space-y-5 shadow-inner">
                {/* Visual Header */}
                <div className="max-w-lg space-y-1">
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-indigo-600 text-white uppercase tracking-wider inline-block">
                    {isRtl ? 'امسح الرمز بواسطة اللوحة الإلكترونية' : 'Scannez avec la tablette de classe'}
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {isRtl ? 'انضمام فوري إلى تقويمات القسم' : 'Rejoindre la session d\'évaluation'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {isRtl 
                      ? 'وجه كاميرا اللوحة نحو الرمز أسفله للولوج المباشر دون الحاجة لكتابة العنوان'
                      : 'Pointe l\'appareil photo de ta tablette vers ce QR code pour ouvrir directement l\'application.'}
                  </p>
                </div>

                {/* The QR Code Container */}
                <div className="p-4 bg-white rounded-3xl border-4 border-indigo-500 shadow-xl shadow-indigo-500/10 inline-block relative group">
                  {mainQrDataUrl ? (
                    <img 
                      src={mainQrDataUrl} 
                      alt="QR Code pour la classe" 
                      className="w-64 h-64 sm:w-80 sm:h-80 object-contain rounded-2xl mx-auto"
                    />
                  ) : (
                    <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center text-slate-400">
                      Génération du QR Code...
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 py-1 px-3 rounded-lg border border-indigo-100">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>4ème Année Primaire (4AEP)</span>
                  </div>
                </div>

                {/* Direct Link Box */}
                <div className="w-full max-w-md bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-2">
                  <div className="text-left font-mono font-bold text-xs text-slate-800 truncate flex-1 px-2 select-all">
                    {targetStudentUrl}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleCopyUrl}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                      title="Copier le lien"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={handleDownloadQr}
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition"
                      title="Télécharger l'image PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={targetStudentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                      title="Tester le lien dans un nouvel onglet"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Classroom Instruction Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-xs text-slate-600 pt-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 font-semibold flex items-center gap-2 text-left">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">1</span>
                    <span>{isRtl ? 'اتصل بشبكة Wi-Fi الخاصة بالقسم' : 'Connecte la tablette au Wi-Fi de la classe'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 font-semibold flex items-center gap-2 text-left">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0">2</span>
                    <span>{isRtl ? 'افتح الكاميرا وامسح الرمز الظاهر' : 'Ouvre l\'appareil photo et scanne le code'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 font-semibold flex items-center gap-2 text-left">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center shrink-0">3</span>
                    <span>{isRtl ? 'اختر اسمك أو أدخل رمز مسار وابدأ' : 'Saisis ton Code Massar ou choisis ton nom'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: PRINTABLE STUDENT BADGES ===================== */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-emerald-600" />
                    <span>{isRtl ? 'بطاقات التلاميذ بالرمز الفردي (Connexion Sans Saisie)' : 'Badges Individuels avec QR Code Personnel'}</span>
                  </h4>
                  <p className="text-xs text-emerald-800">
                    {isRtl
                      ? 'يمكن طباعة هذه البطاقات وقصها وتوزيعها على مقاعد التلاميذ. مسح الرمز يسجل دخول التلميذ فورا دون كتابة رمز مسار.'
                      : 'Chaque badge contient le Code Massar de l\'élève. Un simple scan connecte l\'élève instantanément sans saisie clavier.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isRtl ? 'طباعة بطاقات القسم' : 'Imprimer la planche'}</span>
                </button>
              </div>

              {/* Grid of Student Cards (Optimized for Screen and Print) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
                {students.map((st) => (
                  <div
                    key={st.id}
                    className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-2xs hover:border-indigo-400 transition flex flex-col items-center justify-between text-center space-y-3 print:border-black print:rounded-lg print:p-3 break-inside-avoid"
                  >
                    <div className="flex items-center justify-between w-full border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-mono">
                        {st.studentCode}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">4AEP</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{st.avatarIcon}</span>
                      <div className="text-left">
                        <div className="font-extrabold text-sm text-slate-900 leading-tight">
                          {st.displayPseudonym}
                        </div>
                        <div className="text-[10px] text-slate-400">Élève 4AEP</div>
                      </div>
                    </div>

                    {/* QR Code image for this student */}
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {studentQrCodes[st.id] ? (
                        <img
                          src={studentQrCodes[st.id]}
                          alt={`QR Code ${st.studentCode}`}
                          className="w-28 h-28 object-contain mx-auto"
                        />
                      ) : (
                        <div className="w-28 h-28 flex items-center justify-center text-[10px] text-slate-400">
                          Chargement...
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                      {isRtl ? 'امسح للولوج المباشر' : 'Scanner pour se connecter'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 3: STEP-BY-STEP LOCAL NETWORK GUIDE ===================== */}
          {activeTab === 'guide' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <h4 className="font-extrabold text-base text-blue-950 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-600" />
                  <span>{isRtl ? 'كيف يعمل التطبيق في حجرة الدرس بدون إنترنت؟' : 'Fonctionnement 100% Hors-Ligne en Classe'}</span>
                </h4>
                <p className="text-xs text-blue-900 leading-relaxed">
                  {isRtl
                    ? 'لا تحتاج إلى اشتراك إنترنت من اتصالات المغرب أو غيرها في قاعة الدرس. يكفي ربط حاسوب الأستاذ ولوحات التلاميذ بنفس شبكة Wi-Fi المحلية (Local Area Network).'
                    : 'Aucun abonnement Internet n\'est nécessaire. Il suffit que le PC de l\'enseignant et les tablettes des élèves soient connectés au même réseau Wi-Fi local (LAN).'}
                </p>
              </div>

              {/* Step by Step Timeline */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">1</span>
                    <h5 className="font-bold text-sm text-slate-900">
                      {isRtl ? 'تفعيل شبكة Wi-Fi بالقسم' : 'Créer ou activer le réseau Wi-Fi de la classe'}
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-10">
                    {isRtl 
                      ? 'استعمل راوتر Wi-Fi عادي (بدون كابل إنترنت) أو قم بتفعيل "نقطة اتصال الهواتف المحمولة / Mobile Hotspot" من حاسوبك الشخصي بنقرة زر في شريط المهام.'
                      : 'Utilisez un simple routeur Wi-Fi (même sans ligne ADSL/Fibre) ou activez le "Point d\'accès sans fil mobile" (Hotspot) directement depuis votre PC portable.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">2</span>
                    <h5 className="font-bold text-sm text-slate-900">
                      {isRtl ? 'معرفة عنوان IP لحاسوب الأستاذ (IP Address)' : 'Trouver l\'adresse IP de votre PC'}
                    </h5>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed pl-10 space-y-2">
                    <p>
                      Sous Windows, appuyez sur <code className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-800">Touche Windows + R</code>, tapez <code className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-800">cmd</code> puis appuyez sur Entrée.
                    </p>
                    <p>Dans la fenêtre noire, tapez la commande :</p>
                    <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs select-all">
                      ipconfig
                    </div>
                    <p>
                      Recherchez la ligne <strong>Adresse IPv4</strong> (ex: <code className="text-indigo-600 font-bold">192.168.1.50</code> ou <code className="text-indigo-600 font-bold">192.168.137.1</code>).
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">3</span>
                    <h5 className="font-bold text-sm text-slate-900">
                      {isRtl ? 'إدخال العنوان في هذه النافذة ثم الإسقاط بالمسلاط' : 'Coller l\'adresse et projeter le QR Code'}
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-10">
                    {isRtl 
                      ? 'الصق العنوان في خانة "عنوان خادم التطبيق" أعلاه (مثال: http://192.168.1.50:3000) وسيتم تحديث رمز QR تلقائياً ليكون جاهزا لمسحه من طرف جميع لوحات التلاميذ.'
                      : 'Indiquez cette adresse dans l\'onglet "Mode Vidéoprojecteur". Le QR Code se met à jour immédiatement et permet à toutes les tablettes d\'ouvrir la session sans saisie manuelle.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">4</span>
                    <h5 className="font-bold text-sm text-slate-900">
                      {isRtl ? 'تنبيه جدار الحماية (Pare-feu Windows)' : 'Autorisation Pare-feu Windows'}
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-10">
                    Lors du premier lancement de Node.js / Vite sur votre PC, Windows affiche une boîte de dialogue demandant l'accès réseau. Assurez-vous de cocher <strong>"Réseaux privés"</strong> pour autoriser les tablettes à se connecter.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {isRtl 
                ? 'متوافق مع جميع لوحات أندرويد و iPads وهواتف المعلمين' 
                : 'Compatible avec tablettes Android, iPads et navigateurs récents'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            {isRtl ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};
