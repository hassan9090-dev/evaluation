import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  Lock, KeyRound, Eye, EyeOff, ShieldCheck, GraduationCap, 
  ArrowRight, Sparkles, CheckCircle2, AlertCircle 
} from 'lucide-react';

export const TeacherLogin: React.FC = () => {
  const { lang, isRtl, teacherLogin, setRole, resetTeacherPasswordToDefault } = useApp();
  const t = translations[lang];

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const success = teacherLogin(password.trim());
    if (!success) {
      setErrorMsg(
        isRtl 
          ? 'كلمة المرور غير صحيحة. يرجى التحقق من صحة الرمز المدخل.' 
          : 'Mot de passe incorrect. Veuillez vérifier votre mot de passe.'
      );
    }
  };

  const handleForgotPassword = () => {
    resetTeacherPasswordToDefault();
    setPassword('');
    setErrorMsg(null);
    setSuccessNotice(
      isRtl
        ? 'تمت استعادة كلمة المرور إلى رمز الأمان الاحتياطي. راجع ملف pass-secours.txt.'
        : 'Mot de passe réinitialisé. Veuillez utiliser le mot de passe de secours consigné dans pass-secours.txt.'
    );
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider inline-block mb-1">
            {isRtl ? 'فضاء الأستاذ' : 'Espace Enseignant'}
          </span>

          <h2 className="text-xl font-black text-slate-900 mt-1">
            {isRtl ? 'تسجيل الدخول - فضاء الأستاذ' : 'Accès Sécurisé Enseignant'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {isRtl 
              ? 'المرجو إدخال كلمة المرور المخصصة للأستاذ للولوج إلى لوحة القيادة.'
              : 'Veuillez saisir votre mot de passe enseignant pour accéder au tableau de bord.'}
          </p>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isRtl ? 'كلمة المرور :' : 'Mot de passe :'}
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
              >
                {isRtl ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full py-2.5 px-3.5 ${
                  isRtl ? 'pl-10' : 'pr-10'
                } text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isRtl ? 'left-3' : 'right-3'
                } text-slate-400 hover:text-slate-600 transition`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 group mt-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isRtl ? 'تسجيل الدخول إلى فضاء الأستاذ' : 'Se connecter à l\'Espace Enseignant'}</span>
            <ArrowRight className={`w-4 h-4 transition-transform ${isRtl ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
          </button>
        </form>

        {/* Navigation to Home or Student Portal */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setRole('home')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
          >
            <span>{isRtl ? 'الصفحة الرئيسية' : 'Page d\'Accueil'}</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('student')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isRtl ? 'بوابة التلميذ (رمز مسار)' : 'Espace Élève (Massar)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
