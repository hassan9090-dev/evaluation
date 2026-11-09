import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  Sparkles, GraduationCap, ArrowRight, UserCheck, 
  Search, CheckCircle2, AlertCircle, KeyRound, ShieldCheck,
  Camera, QrCode, School, Users, Check, User
} from 'lucide-react';
import { StudentQrCameraScanner } from '../network/StudentQrCameraScanner';

export const StudentMassarLogin: React.FC = () => {
  const { lang, isRtl, classes, selectedClassId, setSelectedClassId, students, studentLoginByMassar, setRole } = useApp();
  const t = translations[lang];

  // Required: Selection of class
  const [chosenClassId, setChosenClassId] = useState<string>(selectedClassId || (classes[0] ? classes[0].id : ''));
  // Required: Student Massar code
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handleQrScanSuccess = (scannedCode: string) => {
    setInputCode(scannedCode);
    setErrorMsg(null);
    if (!chosenClassId) {
      setErrorMsg(
        isRtl 
          ? 'يرجى أولاً اختيار القسم قبل مسح أو تأكيد الرمز.' 
          : 'Veuillez sélectionner votre classe avant de valider votre code.'
      );
      return;
    }
    const res = studentLoginByMassar(scannedCode, chosenClassId);
    if (!res.success) {
      setErrorMsg(res.error || (isRtl ? 'رمز مسار غير صحيح لهذا القسم.' : 'Code Massar non valide pour cette classe.'));
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!chosenClassId) {
      setErrorMsg(
        isRtl 
          ? 'اختيار القسم إجباري! يرجى اختيار القسم الخاص بك للمتابعة.' 
          : 'Le choix de la classe est obligatoire ! Veuillez sélectionner votre classe.'
      );
      return;
    }

    if (!inputCode.trim()) {
      setErrorMsg(
        isRtl 
          ? 'رمز مسار إجباري! يرجى إدخال رمز مسار الخاص بك.' 
          : 'Le Code Massar est obligatoire ! Veuillez saisir votre identifiant.'
      );
      return;
    }

    const res = studentLoginByMassar(inputCode, chosenClassId);
    if (!res.success) {
      setErrorMsg(res.error || (isRtl ? 'تعذر تسجيل الدخول. تحقق من القسم والرمز.' : 'Connexion impossible. Vérifiez la classe et le code.'));
    }
  };

  const handleSelectStudentCard = (code: string) => {
    setInputCode(code);
    setErrorMsg(null);
    if (!chosenClassId) {
      setErrorMsg(
        isRtl 
          ? 'يرجى أولاً اختيار القسم.' 
          : 'Veuillez d\'abord choisir la classe.'
      );
      return;
    }
    studentLoginByMassar(code, chosenClassId);
  };

  // Only display students belonging to the chosen class
  const classStudents = students.filter(st => !chosenClassId || st.classId === chosenClassId);

  const filteredStudents = classStudents.filter(st => {
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
            {isRtl ? 'تسجيل الدخول الإجباري للمتعلم' : 'Identification Obligatoire Élève'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            {isRtl 
              ? 'لولوج الاختبارات، يتعين اختيار القسم أولاً ثم إدخال رمز مسار (Code Massar) الخاص بك.'
              : 'Pour accéder à tes évaluations, le choix de la classe et la saisie de ton Code Massar sont obligatoires.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-5 max-w-lg mx-auto">
          {/* STEP 1: Mandatory Class Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <School className="w-4 h-4 text-indigo-600" />
                <span>1. {isRtl ? 'اختيار القسم (إجباري) :' : 'Choix de la classe (Obligatoire) :'}</span>
              </span>
              <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider">
                {isRtl ? 'إلزامي *' : 'Requis *'}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {classes.map((cls) => {
                const isSelected = chosenClassId === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => {
                      setChosenClassId(cls.id);
                      setSelectedClassId(cls.id);
                      setErrorMsg(null);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-xs font-extrabold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {cls.name}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{cls.teacherName || 'Prof. 4AEP'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Mandatory Student Code Massar */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>2. {isRtl ? 'رمز مسار المتعلم (إجباري) :' : 'Code Massar Élève (Obligatoire) :'}</span>
              </span>
              <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider">
                {isRtl ? 'إلزامي *' : 'Requis *'}
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                required
                placeholder={isRtl ? 'مثال: G134001' : 'Ex : G134001'}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full py-3 px-4 font-mono font-bold text-base border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-[11px] text-slate-400">
                {chosenClassId 
                  ? (isRtl ? `تلاميذ ${classes.find(c => c.id === chosenClassId)?.name || ''}` : `Élèves de la classe sélectionnée`)
                  : (isRtl ? 'يرجى تحديد القسم أعلاه' : 'Sélectionnez une classe ci-dessus')}
              </span>
              {chosenClassId && classStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const sample = classStudents[0].studentCode;
                    setInputCode(sample);
                    studentLoginByMassar(sample, chosenClassId);
                  }}
                  className="text-[11px] font-mono font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200 transition cursor-pointer"
                >
                  {classStudents[0].studentCode} (دخول تجريبي)
                </button>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-sm shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isRtl ? 'تأكيد والدخول للاختبارات' : 'Valider et Accéder aux Tests'}</span>
              <ArrowRight className={`w-4 h-4 transition-transform ${isRtl ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="py-3.5 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs border border-indigo-200 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              title={isRtl ? 'مسح رمز QR للبطاقة بواسطة الكاميرا' : 'Scanner mon badge élève'}
            >
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>{isRtl ? 'مسح الرمز (QR)' : 'Scanner badge'}</span>
            </button>
          </div>
        </form>

        {/* Quick Clickable Massar List for the chosen Class */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {isRtl 
                  ? `لائحة رموز مسار للقسم المحدد (${classStudents.length} تلميذ) :` 
                  : `Liste des codes Massar de la classe (${classStudents.length} élèves) :`}
              </span>
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
                className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 transition flex items-center gap-2 text-left group shadow-2xs cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
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

        {/* Navigation to Teacher or Home */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setRole('home')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <span>{isRtl ? 'الصفحة الرئيسية' : 'Page d\'Accueil'}</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{isRtl ? 'الولوج لفضاء الأستاذ' : 'Accès Enseignant'}</span>
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
