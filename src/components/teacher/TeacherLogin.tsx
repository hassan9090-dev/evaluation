import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  Lock, KeyRound, Eye, EyeOff, ShieldCheck, GraduationCap, 
  ArrowRight, Sparkles, CheckCircle2, AlertCircle 
} from 'lucide-react';

export const TeacherLogin: React.FC = () => {
  const { lang, isRtl, teacherLogin, setRole } = useApp();
  const t = translations[lang];

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const success = teacherLogin(password.trim());
    if (!success) {
      setErrorMsg(
        isRtl 
          ? 'كلمة المرور غير صحيحة. كلمة المرور المطلوبة هي: pass123' 
          : 'Mot de passe incorrect. Le mot de passe requis est : pass123'
      );
    }
  };

  const handleFillDemoPassword = () => {
    setPassword('pass123');
    setErrorMsg(null);
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
              ? 'المرجو إدخال كلمة المرور المخصصة للأستاذ (pass123) للولوج إلى لوحة التتبع وبنك الأسئلة وإدارة التقويمات.'
              : 'Veuillez saisir votre mot de passe enseignant (pass123) pour accéder au tableau de bord et à la banque de questions.'}
          </p>
        </div>

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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'كلمة المرور :' : 'Mot de passe :'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="pass123"
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

          {/* Quick Demo Hint Chip */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[11px] text-slate-500 font-medium">
              {isRtl ? 'كلمة المرور الافتراضية :' : 'Mot de passe par défaut :'}
            </span>
            <button
              type="button"
              onClick={handleFillDemoPassword}
              className="text-[11px] font-mono font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition"
              title="Cliquer pour remplir pass123"
            >
              pass123 (تعبئة سريعة)
            </button>
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

        {/* Switch to Student Portal */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 mb-2">
            {isRtl ? 'أنت تلميذ وتريد إنجاز الاختبارات؟' : 'Tu es un élève et tu souhaites passer tes tests ?'}
          </p>
          <button
            type="button"
            onClick={() => setRole('student')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isRtl ? 'الانتقال إلى بوابة التلميذ (رمز مسار)' : 'Accéder à l\'Espace Élève (Code Massar)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
