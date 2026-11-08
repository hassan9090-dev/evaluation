import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  Sparkles, GraduationCap, ArrowRight, UserCheck, 
  Search, CheckCircle2, AlertCircle, KeyRound, ShieldCheck,
  Camera, QrCode
} from 'lucide-react';
import { StudentQrCameraScanner } from '../network/StudentQrCameraScanner';

export const StudentMassarLogin: React.FC = () => {
  const { lang, isRtl, students, studentLoginByMassar, setRole } = useApp();
  const t = translations[lang];

  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handleQrScanSuccess = (scannedCode: string) => {
    setInputCode(scannedCode);
    setErrorMsg(null);
    const res = studentLoginByMassar(scannedCode);
    if (!res.success) {
      setErrorMsg(
        isRtl 
          ? `رمز مسار "${scannedCode}" غير مسجل في لائحة القسم.`
          : `Le Code Massar "${scannedCode}" est introuvable.`
      );
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!inputCode.trim()) {
      setErrorMsg(isRtl ? 'يرجى إدخال رمز مسار للمتابعة.' : 'Veuillez saisir votre Code Massar.');
      return;
    }

    const res = studentLoginByMassar(inputCode);
    if (!res.success) {
      setErrorMsg(
        isRtl 
          ? `رمز مسار "${inputCode}" غير مسجل في لائحة القسم. يرجى التحقق أو اختيار رمزك من القائمة أسفله.`
          : `Le Code Massar "${inputCode}" est introuvable. Veuillez vérifier ou sélectionner votre code dans la liste ci-dessous.`
      );
    }
  };

  const handleSelectStudentCard = (code: string) => {
    setInputCode(code);
    setErrorMsg(null);
    studentLoginByMassar(code);
  };

  const filteredStudents = students.filter(st => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return st.studentCode.toLowerCase().includes(q) || st.displayPseudonym.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-2xl mx-auto my-6 space-y-6">
      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 text-3xl shadow-inner">
            🎓
          </div>

          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider inline-block mb-1">
            {isRtl ? 'فضاء المتعلم - المستوى الرابع' : 'Espace Élève 4AEP'}
          </span>

          <h2 className="text-2xl font-black text-slate-900 mt-1">
            {t.student.loginTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            {isRtl 
              ? 'مرحباً بك يا بطل! أدخل رمز مسار (Code Massar) الخاص بك للولوج إلى اختباراتك وأنشطة الدعم المقررة.'
              : 'Bienvenue ! Saisis ton Code Massar pour accéder à tes évaluations, tests et fiches de soutien.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-lg mx-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t.student.massarInputLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder={t.student.massarPlaceholder}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full py-3 px-4 font-mono font-bold text-base border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5">
              <span className="text-[11px] text-slate-400">
                {isRtl ? 'مثال: G134001 إلى G134025' : 'Format : G134001 à G134025'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setInputCode('G134001');
                  studentLoginByMassar('G134001');
                }}
                className="text-[11px] font-mono font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200 transition cursor-pointer"
              >
                G134001 (دخول سريع)
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-sm shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t.student.accessTestButton}</span>
              <ArrowRight className={`w-4 h-4 transition-transform ${isRtl ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="py-3.5 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs border border-indigo-200 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              title={isRtl ? 'مسح رمز QR للبطاقة بواسطة الكاميرا' : 'Scanner mon badge élève'}
            >
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>{isRtl ? 'مسح الرمز (QR)' : 'Scanner mon badge'}</span>
            </button>
          </div>
        </form>

        {/* Quick Clickable Massar List for 4AEP students */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isRtl ? 'أو انقر مباشرة على رمز مسار الخاص بك :' : 'Ou clique directement sur ton Code Massar :'}</span>
            </h4>

            {/* Quick Filter Search */}
            <div className="relative w-full sm:w-48">
              <Search className={`w-3 h-3 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
              <input
                type="text"
                placeholder={isRtl ? 'تصفية الرموز...' : 'Filtrer les codes...'}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className={`w-full py-1 text-[11px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isRtl ? 'pr-7 pl-2' : 'pl-7 pr-2'
                }`}
              />
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1 bg-slate-50/70 rounded-2xl border border-slate-100">
            {filteredStudents.map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectStudentCard(st.studentCode)}
                className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 transition flex items-center gap-2 text-left group shadow-2xs"
              >
                <span className="text-base shrink-0">{st.avatarIcon}</span>
                <div className="truncate">
                  <span className="font-mono font-bold text-xs text-indigo-700 group-hover:text-indigo-900 block truncate">
                    {st.studentCode}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {st.displayPseudonym}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Switch to Teacher Login */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 mb-1.5">
            {isRtl ? 'هل أنت الأستاذ وتريد إدارة المنصة؟' : 'Vous êtes l\'enseignant ?'}
          </p>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{isRtl ? 'الولوج لفضاء الأستاذ (كلمة المرور pass123)' : 'Accès Enseignant (mot de passe pass123)'}</span>
          </button>
        </div>
      </div>

      {/* Student QR Camera Scanner Modal */}
      <StudentQrCameraScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleQrScanSuccess}
        isRtl={isRtl}
      />
    </div>
  );
};
