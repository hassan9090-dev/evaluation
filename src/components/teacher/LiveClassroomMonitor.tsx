import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wifi, CheckCircle2, Clock, AlertCircle, 
  RotateCcw, FileCheck, ArrowRight, School, User, Calendar, BookOpen
} from 'lucide-react';

interface LiveClassroomMonitorProps {
  onBackToEvaluations?: () => void;
}

export const LiveClassroomMonitor: React.FC<LiveClassroomMonitorProps> = ({ onBackToEvaluations }) => {
  const { 
    isRtl, classes, subjects,
    students, attempts, evaluations, 
    activePresences, serverConnected, lastSyncTime, syncNow,
    setActiveTeacherTab
  } = useApp();

  // Only consider the single currently active evaluation
  const activeEvaluation = evaluations.find(e => e.status === 'active') || null;
  const activeClass = activeEvaluation ? classes.find(c => c.id === activeEvaluation.classId) : null;
  const activeSubject = activeEvaluation ? subjects.find(s => s.id === activeEvaluation.subjectId) : null;

  // Students belonging strictly to the active evaluation's class
  const displayedStudents = activeEvaluation
    ? students.filter(st => st.classId === activeEvaluation.classId)
    : [];

  // Count active taking tests & submitted copies strictly for the active evaluation
  const activeTakingTest = activeEvaluation
    ? activePresences.filter(
        p =>
          p.status === 'taking_test' &&
          (!p.currentTestId || p.currentTestId === activeEvaluation.id) &&
          displayedStudents.some(st => st.id === p.studentId)
      )
    : [];

  const activeSubmittedCount = activeEvaluation
    ? displayedStudents.filter(st =>
        attempts.some(
          a =>
            a.studentId === st.id &&
            a.evaluationId === activeEvaluation.id &&
            a.status !== 'in_progress'
        )
      ).length
    : 0;

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
                ? 'تتعلق المراقبة المباشرة فقط بالاختبار النشط حالياً، حيث تصل نسخ التلاميذ مباشرة إلى حاسوب الأستاذ.' 
                : 'Suivi en temps réel dédié exclusivement à l\'évaluation active en cours.'}
            </p>
          </div>
        </div>

        {/* Sync button & Quick Counters for the Active Evaluation */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {activeEvaluation && (
            <>
              <div className="text-right px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-200">
                <span className="text-[10px] font-bold text-indigo-500 uppercase block">
                  {isRtl ? 'في طور الإنجاز' : 'En examen'}
                </span>
                <span className="font-mono text-sm font-black text-indigo-700">
                  {activeTakingTest.length} {isRtl ? 'تلميذ' : 'élève(s)'}
                </span>
              </div>

              <div className="text-right px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">
                  {isRtl ? 'النسخ المستلمة' : 'Copies reçues'}
                </span>
                <span className="font-mono text-sm font-black text-emerald-700">
                  {activeSubmittedCount} / {displayedStudents.length}
                </span>
              </div>
            </>
          )}

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

      {/* Empty State if no evaluation is active */}
      {!activeEvaluation ? (
        <div className="p-10 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-black text-slate-800">
            {isRtl ? 'لا يوجد أي اختبار نشط حالياً' : 'Aucune évaluation active en cours'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isRtl
              ? 'المراقبة المباشرة وتجميع النسخ تخص فقط الاختبار النشط. يرجى تفعيل اختبار واحد من لائحة الاختبارات لبدء المراقبة المباشرة.'
              : 'La surveillance en direct ne concerne que l\'évaluation active. Veuillez activer une évaluation dans la liste des sessions pour suivre les copies en temps réel.'}
          </p>
          {onBackToEvaluations && (
            <button
              onClick={onBackToEvaluations}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isRtl ? 'العودة لتفعيل اختبار' : 'Choisir et activer une évaluation'}</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Active Evaluation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-slate-50 border border-indigo-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isRtl ? 'الاختبار النشط حالياً' : 'Évaluation Active'}</span>
                </span>
                {activeSubject && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeSubject.id === 'francais'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isRtl ? activeSubject.nameAr : activeSubject.nameFr}
                  </span>
                )}
              </div>
              <h4 className="text-base font-black text-slate-900">
                {isRtl ? activeEvaluation.titleAr : activeEvaluation.titleFr}
              </h4>
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <School className="w-3.5 h-3.5 text-indigo-600" />
                <span>{activeClass ? activeClass.name : (isRtl ? 'القسم المستهدف' : 'Classe cible')}</span>
              </span>
              {activeEvaluation.dateRealisation && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{activeEvaluation.dateRealisation}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{activeEvaluation.durationMinutes} min</span>
              </span>
            </div>
          </div>

          {/* Students Live Grid for the Active Evaluation's Class */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
              <span className="font-bold">
                {isRtl 
                  ? `تلاميذ القسم المعني بالاختبار النشط (${activeClass?.name || ''} — ${displayedStudents.length} تلميذ) :` 
                  : `Élèves de la classe concernée (${activeClass?.name || 'Classe cible'} — ${displayedStudents.length} tablettes) :`}
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
                  <span>{isRtl ? 'في الانتظار' : 'En attente'}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {displayedStudents.map((st) => {
                // Find live presence strictly for this active evaluation
                const presence = activePresences.find(
                  p =>
                    p.studentId === st.id &&
                    p.status === 'taking_test' &&
                    (!p.currentTestId || p.currentTestId === activeEvaluation.id)
                );
                // Find submitted attempt strictly for this active evaluation
                const studentAttempts = attempts.filter(
                  a => a.studentId === st.id && a.evaluationId === activeEvaluation.id
                );
                const latestAttempt = studentAttempts[studentAttempts.length - 1];

                const isTakingTest = Boolean(presence);
                const hasSubmitted = Boolean(latestAttempt && latestAttempt.status !== 'in_progress');
                const totalQCount = activeEvaluation.questionIds.length || presence?.totalQuestions || 8;

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
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
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
                    {isTakingTest && presence && (
                      <div className="p-2 bg-white rounded-xl border border-indigo-200 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-indigo-900">
                          <span className="truncate">
                            {isRtl ? activeEvaluation.titleAr : activeEvaluation.titleFr}
                          </span>
                          <span className="text-indigo-600 font-mono shrink-0">
                            Q {presence.currentQIndex || 1}/{presence.totalQuestions || totalQCount}
                          </span>
                        </div>
                        {/* Mini live progress bar */}
                        <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full transition-all duration-300"
                            style={{ 
                              width: `${Math.round(((presence.currentQIndex || 1) / (presence.totalQuestions || totalQCount)) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {hasSubmitted && !isTakingTest && latestAttempt && (
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-bold text-emerald-950 truncate">
                            {isRtl ? 'تم استلام النسخة' : 'Copie reçue'}
                          </span>
                        </div>
                        <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                          {latestAttempt.totalScore !== undefined ? `${latestAttempt.totalScore} / 10` : (isRtl ? 'قيد التصحيح' : 'À corriger')}
                        </span>
                      </div>
                    )}

                    {!isTakingTest && !hasSubmitted && (
                      <div className="p-2 bg-slate-50 rounded-xl text-center text-[10px] font-semibold text-slate-400">
                        {isRtl ? 'لم يبدأ الاختبار بعد' : 'En attente de connexion'}
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
                  ? 'جميع نسخ هذا الاختبار النشط يتم حفظها تلقائياً ويمكن تصحيحها في "مركز التصحيح".' 
                  : 'Les copies reçues pour cette évaluation active sont sauvegardées en temps réel et prêtes à être corrigées.'}
              </p>
            </div>

            <button
              onClick={() => setActiveTeacherTab('correction')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>{isRtl ? 'عرض النتائج' : 'Ouvrir les Résultats'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

