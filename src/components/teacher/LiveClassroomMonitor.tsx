import React from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  Wifi, CheckCircle2, Clock, Eye, AlertCircle, 
  RotateCcw, Sparkles, UserCheck, ShieldCheck, Layers,
  FileCheck, ArrowRight
} from 'lucide-react';

export const LiveClassroomMonitor: React.FC = () => {
  const { 
    lang, isRtl, students, attempts, evaluations, 
    activePresences, serverConnected, lastSyncTime, syncNow,
    setActiveTeacherTab
  } = useApp();

  const t = translations[lang];

  // Active evaluations map
  const evalMap = new Map(evaluations.map(e => [e.id, e]));

  // Count active taking tests
  const activeTakingTest = activePresences.filter(p => p.status === 'taking_test');

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-md space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-inner">
            <Wifi className={`w-6 h-6 ${serverConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider ${
                serverConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${serverConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{serverConnected ? (isRtl ? 'الخادم المركزي متصل' : 'Serveur PC Prof En Ligne') : (isRtl ? 'الخادم غير متصل' : 'Mode Hors Ligne')}</span>
              </span>
              {lastSyncTime && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {isRtl ? 'آخر مزامنة : ' : 'Dernière synchro : '}{lastSyncTime}
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {isRtl ? 'مراقبة إنجاز ووصول نسخ التلاميذ في الحين (Live Room)' : 'Centralisation & Surveillance des Copies en Direct'}
            </h3>
            <p className="text-xs text-slate-500">
              {isRtl 
                ? 'تصل إجابات ونسخ التلاميذ من لوحاتهم إلى حاسوب الأستاذ مباشرة وتُحفظ تلقائياً في قاعدة البيانات.' 
                : 'Les copies envoyées depuis les tablettes des élèves arrivent directement sur votre PC et sont enregistrées en temps réel.'}
            </p>
          </div>
        </div>

        {/* Sync button & Quick Counter */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="text-right px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              {isRtl ? 'في طور الإنجاز' : 'En examen'}
            </span>
            <span className="font-mono text-sm font-black text-indigo-700">
              {activeTakingTest.length} {isRtl ? 'تلميذ' : 'élève(s)'}
            </span>
          </div>

          <button
            onClick={() => syncNow()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Actualiser les copies"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRtl ? 'تحديث الآن' : 'Actualiser'}</span>
          </button>
        </div>
      </div>

      {/* 25 Students Live Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold">
            {isRtl ? 'حالة لوحات جميع تلاميذ القسم (4AEP) :' : 'État des 25 tablettes de la classe (4AEP) :'}
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>{isRtl ? 'يجتاز الاختبار' : 'En examen'}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{isRtl ? 'تم تسليم النسخة' : 'Copie reçue'}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>{isRtl ? 'غير متصل' : 'En attente'}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {students.map((st) => {
            // Find live presence
            const presence = activePresences.find(p => p.studentId === st.id);
            // Find submitted attempt
            const studentAttempts = attempts.filter(a => a.studentId === st.id);
            const latestAttempt = studentAttempts[studentAttempts.length - 1];

            const isTakingTest = presence && presence.status === 'taking_test';
            const hasSubmitted = latestAttempt && latestAttempt.status !== 'in_progress';

            const activeEval = isTakingTest && presence.currentTestId ? evalMap.get(presence.currentTestId) : null;
            const completedEval = hasSubmitted ? evalMap.get(latestAttempt.evaluationId) : null;

            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2.5 ${
                  isTakingTest
                    ? 'border-indigo-400 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-400/20'
                    : hasSubmitted
                    ? 'border-emerald-300 bg-emerald-50/40 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Student Info Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xl">{st.avatarIcon}</span>
                    <div className="truncate">
                      <span className="font-bold text-xs text-slate-900 block truncate">
                        {st.displayPseudonym}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 block">
                        {st.studentCode}
                      </span>
                    </div>
                  </div>

                  <span className={`w-3 h-3 rounded-full shrink-0 ${
                    isTakingTest ? 'bg-indigo-600 animate-pulse' : hasSubmitted ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                </div>

                {/* Status Box */}
                {isTakingTest && (
                  <div className="p-2 bg-white rounded-xl border border-indigo-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-indigo-900">
                      <span className="truncate">{activeEval ? (isRtl ? activeEval.titleAr : activeEval.titleFr) : 'Évaluation en cours'}</span>
                      <span className="text-indigo-600 font-mono shrink-0">
                        Q {presence.currentQIndex || 1}/{presence.totalQuestions || 8}
                      </span>
                    </div>
                    {/* Mini live progress bar */}
                    <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full transition-all duration-300"
                        style={{ 
                          width: `${Math.round(((presence.currentQIndex || 1) / (presence.totalQuestions || 8)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                {hasSubmitted && !isTakingTest && (
                  <div className="p-2 bg-white rounded-xl border border-emerald-200 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-emerald-950 truncate">
                        {completedEval ? (isRtl ? completedEval.titleAr : completedEval.titleFr) : 'Copie reçue'}
                      </span>
                    </div>
                    <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                      {latestAttempt.totalScore !== undefined ? `${latestAttempt.totalScore}/${latestAttempt.maxScore}` : 'En attente'}
                    </span>
                  </div>
                )}

                {!isTakingTest && !hasSubmitted && (
                  <div className="p-2 bg-slate-50 rounded-xl text-center text-[10px] font-semibold text-slate-400">
                    {isRtl ? 'لم يبدأ بعد' : 'En attente de connexion'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-xs text-indigo-950 font-semibold">
            {isRtl 
              ? 'جميع النسخ يتم حفظها تلقائياً على حاسوبك في مجلد data/attempts.json ويمكن تصحيحها في "مركز التصحيح".' 
              : 'Toutes les copies sont sauvegardées en local sur votre PC dans data/attempts.json et sont prêtes à être corrigées.'}
          </p>
        </div>

        <button
          onClick={() => setActiveTeacherTab('correction')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>{isRtl ? 'فتح مركز التصحيح' : 'Ouvrir le Centre de Correction'}</span>
          <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};
