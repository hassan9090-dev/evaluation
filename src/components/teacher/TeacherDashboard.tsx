import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  Users, CheckCircle2, TrendingUp, AlertTriangle, 
  ArrowRight, PlusCircle, BookOpen, FileCheck, Layers,
  QrCode, Wifi, Monitor
} from 'lucide-react';
import { LocalNetworkQrModal } from '../network/LocalNetworkQrModal';

export const TeacherDashboard: React.FC = () => {
  const { 
    lang, isRtl, selectedClassId, calculateClassOverview, 
    evaluations, setActiveTeacherTab 
  } = useApp();

  const [showQrModal, setShowQrModal] = useState(false);
  const t = translations[lang];
  const overview = calculateClassOverview(selectedClassId);

  const levelConfigs = [
    { level: 1, label: t.masteryLevels.level1, count: overview.levelDistribution[1] || 0, bg: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 border-rose-200' },
    { level: 2, label: t.masteryLevels.level2, count: overview.levelDistribution[2] || 0, bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 border-amber-200' },
    { level: 3, label: t.masteryLevels.level3, count: overview.levelDistribution[3] || 0, bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 border-emerald-200' },
    { level: 4, label: t.masteryLevels.level4, count: overview.levelDistribution[4] || 0, bg: 'bg-indigo-500', text: 'text-indigo-700', badge: 'bg-indigo-50 border-indigo-200' },
  ];

  const totalAssessed = Object.values(overview.levelDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium mb-3 backdrop-blur-xs">
            <Layers className="w-3.5 h-3.5" />
            {t.app.demoClass}
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            {isRtl ? 'لوحة القيادة التربوية وتتبع المكتسبات' : 'Tableau de Bord Pédagogique & Suivi des Acquis'}
          </h2>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            {isRtl 
              ? 'تتبع مستمر لمكتسبات تلاميذ المستوى الرابع ابتدائي في مادتي الفرنسية والرياضيات وفق المنهاج المغربي المعتمد.' 
              : 'Pilotage continu des compétences des élèves du 4AEP en français et mathématiques conformément au curriculum marocain.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-extrabold text-xs shadow-md transition cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-slate-900" />
            <span>{isRtl ? 'عرض رمز QR للقسم' : 'Projeter QR Code Tablettes'}</span>
          </button>
          <button
            onClick={() => setActiveTeacherTab('evaluations')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-semibold text-xs shadow-md hover:bg-blue-50 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>{t.dashboard.quickActionNewEval}</span>
          </button>
          <button
            onClick={() => setActiveTeacherTab('remediation')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800/60 hover:bg-blue-800 text-white font-medium text-xs border border-white/20 transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>{t.dashboard.quickActionRemediation}</span>
          </button>
        </div>
      </div>

      {/* Classroom Local Wi-Fi & QR Connect Banner */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-700/50 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isRtl ? 'جاهز للاستخدام في القسم' : 'Réseau Local Prêt'}
              </span>
              <span className="text-xs text-indigo-200">
                {isRtl ? 'ربط لوحات التلاميذ بمسح رمز QR' : 'Connexion instantanée des tablettes élèves'}
              </span>
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-white">
              {isRtl ? 'عرض رمز QR لربط أجهزة التلاميذ على الشاشة أو طباعة بطاقاتهم' : 'Projeter le QR Code au tableau ou imprimer les badges de la classe'}
            </h4>
            <p className="text-xs text-indigo-200 mt-0.5">
              {isRtl ? 'التلاميذ يمسحون الرمز بكاميرا اللوحة للولوج الفوري إلى الاختبارات دون الحاجة لكتابة العنوان' : 'Les élèves scannent le code avec la caméra de leur tablette et accèdent directement aux tests.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowQrModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs transition flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Monitor className="w-4 h-4" />
          <span>{isRtl ? 'فتح نافذة العرض والبطاقات' : 'Ouvrir l\'outil QR Code'}</span>
        </button>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.dashboard.statsStudents}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{overview.studentCount}</span>
            <span className="text-xs text-slate-400 font-medium">
              {isRtl ? 'تلميذاً بالقسم 4A' : 'élèves actifs'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isRtl ? 'جميع المعرفات مشفرة ومجهولة الاسم' : '100% pseudonymes sécurisés'}</span>
          </div>
        </div>

        {/* Card 2: Active Evaluations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.dashboard.statsEvaluations}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{overview.evaluationsCount}</span>
            <span className="text-xs text-slate-400 font-medium">
              {isRtl ? 'تقويمات مبرمجة' : 'sessions'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 font-medium flex items-center gap-1">
            <span>{isRtl ? 'تشخيصي + 2 تكويني' : 'Diagnostique + Formatives'}</span>
          </div>
        </div>

        {/* Card 3: Participation Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.dashboard.statsPassation}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{overview.participationRate}%</span>
            <span className="text-xs text-slate-400 font-medium">{isRtl ? 'إنجاز' : 'taux global'}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>{isRtl ? 'مؤشر الالتزام بالاختبارات' : 'Forte assiduité aux passations'}</span>
          </div>
        </div>

        {/* Card 4: Class Average */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.dashboard.statsAverage}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{overview.averageScorePct}%</span>
            <span className="text-xs text-slate-400 font-medium">
              ≈ {(overview.averageScorePct * 0.1).toFixed(1)} / 10
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isRtl ? '+18% تطور مقارنة بالبداية' : '+18% de progression vs début'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Mastery Levels Distribution & Urgent Skills Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Mastery Levels Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t.dashboard.classMasteryTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl 
                  ? 'توزيع التقييمات وفق المستويات الأربعة المحددة في دفتر التحملات' 
                  : 'Répartition des évaluations selon les 4 paliers du cahier des charges'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {totalAssessed} {isRtl ? 'محاولة مصححة' : 'évaluations notées'}
            </span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner mb-6">
            {levelConfigs.map(cfg => {
              const pct = Math.round((cfg.count / totalAssessed) * 100);
              if (pct === 0) return null;
              return (
                <div
                  key={cfg.level}
                  style={{ width: `${pct}%` }}
                  className={`${cfg.bg} h-full transition-all duration-500 relative group`}
                  title={`${cfg.label}: ${cfg.count} (${pct}%)`}
                />
              );
            })}
          </div>

          {/* Cards for each level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {levelConfigs.map(cfg => {
              const pct = Math.round((cfg.count / totalAssessed) * 100);
              return (
                <div key={cfg.level} className={`p-4 rounded-xl border ${cfg.badge} flex items-start gap-3`}>
                  <div className={`w-3.5 h-3.5 rounded-full ${cfg.bg} mt-0.5 shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <h4 className="text-xs font-bold text-slate-800">{cfg.label}</h4>
                      <span className="text-xs font-bold text-slate-900">{pct}%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {cfg.count} {isRtl ? 'تقييم في هذا المستوى' : 'évaluations'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pre-Test vs Post-Test Progression Box */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-800">
                {t.dashboard.diagnosticVsSummative}
              </div>
              <p className="text-[11px] text-slate-500">
                {isRtl 
                  ? 'مؤشر تطور المكتسبات: P = S_post - S_pre = +20 نقطة مئوية' 
                  : 'Progression globale mesurée : P = S_post - S_pre = +20 points de maîtrise'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">PRÉ-TEST</span>
                <span className="text-sm font-bold text-slate-700">45%</span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-500" />
              <div className="text-center">
                <span className="text-[10px] text-blue-600 block font-semibold">POST-TEST</span>
                <span className="text-sm font-bold text-blue-700">65%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Urgent Skills Alert */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {t.dashboard.skillsAlertTitle}
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {isRtl 
                ? 'المهارات التي سجلت أقل من 70% وتتطلب تدخلات داعمة عاجلة للقسم:' 
                : 'Compétences dont le taux de maîtrise est inférieur à 70% :'}
            </p>

            <div className="space-y-3">
              {overview.criticalSkills.map(item => (
                <div key={item.skill.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {item.skill.code}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-800 mt-1">
                        {isRtl ? item.skill.nameAr : item.skill.nameFr}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {item.masteryPct}%
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {item.studentsNeedingHelp} {t.dashboard.studentsConcerned}
                    </span>
                    <button
                      onClick={() => setActiveTeacherTab('remediation')}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      <span>{t.dashboard.actionNeeded}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTeacherTab('remediation')}
              className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 transition flex items-center justify-center gap-2"
            >
              <span>{isRtl ? 'فتح فضاء المعالجة والدعم' : 'Ouvrir l\'Espace Remédiation'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-base">
            {t.dashboard.recentEvaluationsTitle}
          </h3>
          <button
            onClick={() => setActiveTeacherTab('evaluations')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>{isRtl ? 'عرض جميع الاختبارات' : 'Toutes les évaluations'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{isRtl ? 'عنوان الاختبار' : 'Titre de l\'évaluation'}</th>
                <th className="py-3 px-4">{isRtl ? 'المادة' : 'Matière'}</th>
                <th className="py-3 px-4">{isRtl ? 'النوع' : 'Type'}</th>
                <th className="py-3 px-4">{isRtl ? 'المدة' : 'Durée'}</th>
                <th className="py-3 px-4">{isRtl ? 'الحالة' : 'Statut'}</th>
                <th className="py-3 px-4 text-right">{isRtl ? 'الإجراء' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluations.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {isRtl ? ev.titleAr : ev.titleFr}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      ev.subjectId === 'francais' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {ev.subjectId === 'francais' ? t.evaluation.francais : t.evaluation.mathematiques}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize">{t.evaluation[ev.type]}</span>
                  </td>
                  <td className="py-3 px-4">{ev.durationMinutes} {t.evaluation.minutes}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ev.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : ev.status === 'closed'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ev.status === 'active' ? t.evaluation.statusActive : ev.status === 'closed' ? t.evaluation.statusClosed : t.evaluation.statusDraft}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveTeacherTab('correction')}
                      className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition"
                    >
                      {isRtl ? 'تصحيح والنتائج' : 'Correction & Notes'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Local Network QR Code Projector Modal */}
      <LocalNetworkQrModal 
        isOpen={showQrModal} 
        onClose={() => setShowQrModal(false)} 
      />
    </div>
  );
};
