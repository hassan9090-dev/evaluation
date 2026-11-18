import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  GraduationCap, LayoutDashboard, Sparkles, QrCode, ShieldCheck, 
  ArrowRight, Users, Target, Database, FileCheck2, HeartHandshake, 
  Wifi, CheckCircle2, Lock, KeyRound, Monitor, Smartphone, BookOpen,
  Calculator, Award
} from 'lucide-react';
import { LocalNetworkQrModal } from '../network/LocalNetworkQrModal';
import { ChangePasswordModal } from '../teacher/ChangePasswordModal';

export const HomePage: React.FC = () => {
  const { 
    lang, isRtl, setRole, setActiveTeacherTab, isTeacherAuthenticated, 
    teacherPassword, serverConnected, students, setCurrentStudent 
  } = useApp();
  const t = translations[lang];

  const [showQrModal, setShowQrModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleTeacherAccess = () => {
    setRole('teacher');
    setActiveTeacherTab('dashboard');
  };

  const handleStudentAccess = () => {
    // Access strictly requires class selection and Massar code on the student portal
    setRole('student');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-12">
      {/* Two Main Gateways / Action Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* GATEWAY 1: Teacher Space & Dashboard */}
        <div className="bg-white rounded-3xl border border-slate-200 hover:border-blue-300 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <LayoutDashboard className="w-6 h-6" />
              </div>

              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                {isRtl ? 'فضاء الأستاذ' : 'Espace Enseignant'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              {isRtl ? 'لوحة القيادة وفضاء الأستاذ' : 'Dashboard & Espace Professeur'}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isRtl 
                ? 'إدارة الأقسام والمتعلمين، إعداد الاختبارات التكوينية، وتتبع الإنجازات والنتائج المركزية في الوقت الفعلي مع شبكات التصحيح المعيارية.'
                : 'Pilotez l\'ensemble du cycle d\'évaluation formative : conception des tests, suivi en temps réel de la passation, correction centralisée et analyse fine des compétences.'}
            </p>

            {/* Feature Highlights */}
            <div className="mt-5 space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <Monitor className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isRtl ? 'حاسوب الأستاذ المركزي :' : 'PC Professeur Central :'}</strong>{' '}
                  {isRtl ? 'استقبال مباشر لجميع الإنجازات دون ضياع للوقت.' : 'Réception instantanée de toutes les copies des tablettes.'}
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <Target className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isRtl ? 'المصفوفة المهارية 4AEP :' : 'Référentiel 4AEP :'}</strong>{' '}
                  {isRtl ? 'تغطية شاملة لكفايات اللغات والرياضيات (UD1 إلى UD6).' : 'Couverture complète des compétences Français & Mathématiques.'}
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <Award className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isRtl ? 'النتائج والتقارير المفصلة :' : 'Résultats & Rapports :'}</strong>{' '}
                  {isRtl ? 'تصحيح مركزي وتقارير فردية وجماعية مفصلة.' : 'Notation sur 10 par classe et bilans de maîtrise détaillés.'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleTeacherAccess}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 group/btn cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>
                  {isTeacherAuthenticated 
                    ? (isRtl ? 'الدخول المباشر إلى لوحة القيادة' : 'Ouvrir le Dashboard Enseignant')
                    : (isRtl ? 'تسجيل الدخول إلى فضاء الأستاذ' : 'Accéder à l\'Espace Enseignant')}
                </span>
                <ArrowRight className={`w-4 h-4 transition-transform ${isRtl ? 'group-hover/btn:-translate-x-1 rotate-180' : 'group-hover/btn:translate-x-1'}`} />
              </button>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="p-3 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-600 hover:text-blue-700 transition flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Modifier ou réinitialiser le mot de passe enseignant"
              >
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span className="sm:hidden">{isRtl ? 'كلمة المرور' : 'Mot de passe'}</span>
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRtl ? 'فضاء مؤمن بكلمة مرور' : 'Espace sécurisé par mot de passe'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {isRtl ? 'خاص بالأساتذة' : 'Réservé aux enseignants'}
              </span>
            </div>
          </div>
        </div>

        {/* GATEWAY 2: Student Space & Tablets */}
        <div className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>

              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                {isRtl ? 'فضاء المتعلم' : 'Espace Élève'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              {isRtl ? 'فضاء التلميذ والأجهزة اللوحية' : 'Portail Élève & Tablettes'}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isRtl
                ? 'واجهة تفاعلية ميسرة تمكن التلميذ من اجتياز الاختبارات التقويمية وممارسة أنشطة المعالجة الداعمة باستخدام رمز مسار (Code Massar).'
                : 'Interface interactive simplifiée pour tablettes tactiles. L\'élève s\'identifie avec son Code Massar anonymisé, passe ses évaluations et réalise ses activités de soutien.'}
            </p>

            {/* Feature Highlights */}
            <div className="mt-5 space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <Smartphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isRtl ? 'ولوج سهل عبر رمز مسار :' : 'Connexion Code Massar :'}</strong>{' '}
                  {isRtl ? 'حفظ الخصوصية بدون الحاجة لكلمات مرور معقدة.' : 'Respect de la vie privée sans mot de passe complexe.'}
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <FileCheck2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isRtl ? 'تمارين تفاعلية متنوعة :' : 'Formats Variés :'}</strong>{' '}
                  {isRtl ? 'اختيار من متعدد، صحيح/خطأ، ربط، وملء الفراغات.' : 'QCM, Vrai/Faux, appariement et saisie guidée.'}
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <Wifi className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isRtl ? 'مسح رمز QR الفوري :' : 'Scan QR Code en Classe :'}</strong>{' '}
                  {isRtl ? 'الاتصال المباشر بشبكة الفصل دون كتابة روابط.' : 'Connexion instantanée des tablettes au réseau local.'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleStudentAccess}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition flex items-center justify-center gap-2 group/btn cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isRtl ? 'الولوج إلى فضاء التلميذ (القسم + رمز مسار)' : 'Accéder à l\'Espace Élève (Classe + Code Massar)'}</span>
                <ArrowRight className={`w-4 h-4 transition-transform ${isRtl ? 'group-hover/btn:-translate-x-1 rotate-180' : 'group-hover/btn:translate-x-1'}`} />
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="py-3 px-4 rounded-2xl border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="Afficher le QR code pour la classe"
              >
                <QrCode className="w-4 h-4" />
                <span className="sm:hidden">{isRtl ? 'رمز QR' : 'QR Code'}</span>
              </button>
            </div>

            {/* Requirement note */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
              <span className="font-semibold">{isRtl ? 'شرط الدخول :' : 'Condition d\'accès :'}</span>
              <span className="font-medium text-indigo-700">
                {isRtl ? 'تحديد القسم (4AEP) + إدخال رمز مسار الخاص' : 'Choix obligatoire de la classe + Code Massar'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LocalNetworkQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};
