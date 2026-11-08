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
      {/* Hero Welcome Banner */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-purple-500/10 via-pink-500/5 to-transparent rounded-full -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>{isRtl ? 'المستوى الرابع ابتدائي (4AEP) - المغرب' : '4ème Année de l\'Enseignement Primaire (4AEP)'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                serverConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${serverConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{serverConnected ? (isRtl ? 'خادم الحاسوب متصل' : 'PC Prof Connecté') : (isRtl ? 'وضع محلي' : 'Mode Local')}</span>
              </span>

              <button
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                title="Projeter le QR Code pour les tablettes élèves"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isRtl ? 'رمز QR للأجهزة' : 'QR Code Tablettes'}</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            <span>Suivi</span>
            <span className="text-blue-600">-Pédagogique</span>
            <span className="text-slate-400 font-light mx-2">|</span>
            <span className="text-slate-700 text-xl sm:text-2xl font-bold">
              {isRtl ? 'منصة تقويم وتتبع المكتسبات والدعم' : 'Évaluation & Suivi des Apprentissages'}
            </span>
          </h1>

          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
            {isRtl 
              ? 'بوابة تعليمية ذكية مخصصة لتقويم كفايات المنهاج المغربي في مادتي اللغة الفرنسية والرياضيات، مع نظام تصحيح فوري ممركز على حاسوب الأستاذ وتوليد مسارات دعم فردية للمتعلمين.'
              : 'Plateforme numérique formative conçue pour le curriculum marocain (Français & Mathématiques). Pilotez les évaluations, centralisez les copies des tablettes en direct sur le PC Professeur et déployez une remédiation individualisée.'}
          </p>

          {/* Privacy & Protocol Note */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isRtl
                ? 'مطابق لمقتضيات حماية المعطيات الشخصية (CNDP) • شبكة محلية مدرسية بدون الحاجة لإنترنت خارجي'
                : 'Conformité CNDP & Anonymat des élèves • Fonctionnement autonome en Réseau Local (LAN / WiFi)'}
            </span>
          </div>
        </div>
      </section>

      {/* Two Main Gateways / Action Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* GATEWAY 1: Teacher Space & Dashboard */}
        <div className="bg-white rounded-3xl border-2 border-blue-200 hover:border-blue-400 p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
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
                <HeartHandshake className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isRtl ? 'دعم ومعالجة فورية :' : 'Remédiation Ciblée :'}</strong>{' '}
                  {isRtl ? 'تشخيص الصعوبات وإسناد أنشطة علاجية مخصصة.' : 'Détection automatique des lacunes et soutien individualisé.'}
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
        <div className="bg-white rounded-3xl border-2 border-indigo-200 hover:border-indigo-400 p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
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

      {/* Curriculum & Methodological Overview */}
      <section className="bg-slate-100/70 rounded-3xl p-6 sm:p-8 border border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-700 uppercase tracking-wider inline-block mb-1">
            {isRtl ? 'المنظومة البيداغوجية' : 'Cadre Pédagogique'}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            {isRtl ? 'المحاور المهارية المعتمدة في 4AEP' : 'Domaines & Compétences Clés du Curriculum'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              {isRtl ? 'اللغة الفرنسية (Français)' : 'Français 4AEP'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isRtl
                ? 'فهم المقروء، التراكيب النحوية، الصرف والتحويل، الإملاء، والإنتاج الكتابي عبر الوحدات الديدكتيكية 1 إلى 6.'
                : 'Compréhension de l\'écrit, grammaire, conjugaison, orthographe, lexique et production d\'écrits à travers les 6 Unités Didactiques.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Calculator className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              {isRtl ? 'الرياضيات (Mathématiques)' : 'Mathématiques 4AEP'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isRtl
                ? 'الأعداد والحساب، العمليات الأساسية، الهندسة والإنشاءات، القياس، ومعالجة البيانات وحل المسائل اليومية.'
                : 'Nombres et calcul, opérations fondamentales, géométrie, grandeurs et mesures, organisation des données et résolution de problèmes.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              {isRtl ? 'المعالجة والدعم الفارق' : 'Remédiation Intégrée'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isRtl
                ? 'توجيه المتعلم نحو كبسولات داعمة وتمارين تفاعلية تصحيحية فور ظهور أي مؤشر غير متحكم فيه.'
                : 'Parcours d\'exercices gradués, rétroaction formative immédiate et consolidation des acquis avant les évaluations sommatives.'}
            </p>
          </div>
        </div>
      </section>

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
