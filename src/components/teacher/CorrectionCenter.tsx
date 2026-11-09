import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { EvaluationAttempt, Question } from '../../types';
import { 
  CheckCircle, FileEdit, Award, MessageSquare, Save, 
  CheckCircle2, Clock, X, AlertCircle, ChevronRight, Sliders, User
} from 'lucide-react';

export const CorrectionCenter: React.FC = () => {
  const { 
    lang, isRtl, evaluations, attempts, students, questions, 
    skills, saveGrading, getMasteryLevel 
  } = useApp();

  const t = translations[lang];
  const [selectedEvalId, setSelectedEvalId] = useState<string>('eval-form-01');
  const [activeAttempt, setActiveAttempt] = useState<EvaluationAttempt | null>(null);

  // Rubric edit state when grading an attempt
  const [editableAnswers, setEditableAnswers] = useState<Record<string, any>>({});
  const [feedbackText, setFeedbackText] = useState('');

  const currentEval = evaluations.find(e => e.id === selectedEvalId) || evaluations[0];
  const evalAttempts = attempts.filter(a => a.evaluationId === selectedEvalId);

  const openGradingModal = (att: EvaluationAttempt) => {
    setActiveAttempt(att);
    setEditableAnswers(JSON.parse(JSON.stringify(att.answers)));
    setFeedbackText(att.generalFeedback || '');
  };

  const handleUpdateRubricCriterion = (questionId: string, criterionId: string, score: number) => {
    setEditableAnswers(prev => {
      const qAns = { ...(prev[questionId] || { questionId, rubricScores: {} }) };
      const currentRubrics = { ...(qAns.rubricScores || {}) };
      currentRubrics[criterionId] = score;

      // Sum all rubrics for this question
      const totalRubricScore = Object.values(currentRubrics).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
      qAns.rubricScores = currentRubrics;
      qAns.scoreObtained = totalRubricScore;

      return {
        ...prev,
        [questionId]: qAns,
      };
    });
  };

  const handleUpdateDirectScore = (questionId: string, score: number) => {
    setEditableAnswers(prev => {
      const qAns = { ...(prev[questionId] || { questionId }) };
      qAns.scoreObtained = score;
      return {
        ...prev,
        [questionId]: qAns,
      };
    });
  };

  const handleSaveAttemptGrading = () => {
    if (!activeAttempt) return;
    saveGrading(activeAttempt.id, editableAnswers, feedbackText);
    setActiveAttempt(null);
  };

  // Calculate current modal live total and normalized /10 grade
  const liveRawScore = Object.values(editableAnswers).reduce((sum, ans) => {
    return sum + Number(ans?.scoreObtained || 0);
  }, 0);

  const rawMaxScore = (() => {
    const ansMax = Object.values(editableAnswers).reduce((sum: number, ans: any) => {
      const q = questions.find(item => item.id === ans?.questionId);
      return sum + Number(ans?.maxScore || q?.maxScore || 0);
    }, 0);
    if (ansMax > 0) return ansMax;
    if (currentEval) {
      const qMax = currentEval.questionIds.reduce((sum, qId) => {
        const q = questions.find(item => item.id === qId);
        return sum + (q ? q.maxScore : 0);
      }, 0);
      if (qMax > 0) return qMax;
    }
    return 10;
  })();

  const liveNoteSur10 = Math.min(10, Math.round((liveRawScore / rawMaxScore) * 10 * 10) / 10);
  const livePercentage = Math.min(100, Math.round((liveRawScore / rawMaxScore) * 100));
  const { level: liveLevel } = getMasteryLevel(livePercentage);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.correction.title}</h2>
              <p className="text-xs text-slate-500">{t.correction.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Evaluation Picker Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            {t.correction.filterByEval} :
          </label>
          <select
            value={selectedEvalId}
            onChange={(e) => setSelectedEvalId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {evaluations.map(ev => (
              <option key={ev.id} value={ev.id}>
                {isRtl ? ev.titleAr : ev.titleFr} ({ev.subjectId === 'francais' ? 'Français' : 'Maths'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800">
              {isRtl ? 'قائمة محاولات المتعلمين' : 'Feuilles d\'examen remises'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({evalAttempts.length} {isRtl ? 'محاولة مسجلة' : 'copies'})
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {evalAttempts.filter(a => a.status === 'corrected').length} {isRtl ? 'تم تصحيحه ومصادقته' : 'validées'}
            </span>
            <span className="flex items-center gap-1 text-amber-600 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {evalAttempts.filter(a => a.status !== 'corrected').length} {isRtl ? 'في انتظار التنقيط' : 'en attente'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t.correction.studentCode}</th>
                <th className="py-3 px-4">{isRtl ? 'تاريخ الإرسال' : 'Date d\'envoi'}</th>
                <th className="py-3 px-4">{isRtl ? 'الحالة' : 'Statut'}</th>
                <th className="py-3 px-4">{t.correction.finalScore} (/10)</th>
                <th className="py-3 px-4">{isRtl ? 'مستوى التحكم' : 'Niveau de maîtrise'}</th>
                <th className="py-3 px-4 text-right">{isRtl ? 'الإجراء' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evalAttempts.map(att => {
                const student = students.find(s => s.id === att.studentId);
                const hasScore = att.totalScore !== undefined;
                const pct = att.percentage ?? 0;
                const { level, badgeBg } = getMasteryLevel(pct);
                const displayScore10 = hasScore
                  ? (att.maxScore === 10 ? att.totalScore : Math.round(((att.totalScore || 0) / (att.maxScore || 10)) * 10 * 10) / 10)
                  : undefined;

                return (
                  <tr key={att.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                        <User className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-mono font-bold text-blue-700">{student?.studentCode}</span>
                      <span className="text-slate-400 font-normal">({student?.displayPseudonym})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {att.submittedAt ? new Date(att.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        att.status === 'corrected' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {att.status === 'corrected' ? t.evaluation.corrected : t.evaluation.pendingGrading}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {hasScore ? (
                        <span>
                          <strong className="text-blue-700 text-sm">{displayScore10}</strong> / 10
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">-- / 10</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {hasScore ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeBg}`}>
                          {t.masteryLevels[`level${level}` as keyof typeof t.masteryLevels]}
                        </span>
                      ) : (
                        <span className="text-slate-400">---</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openGradingModal(att)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-[11px] transition ${
                          att.status === 'corrected'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>{att.status === 'corrected' ? (isRtl ? 'مراجعة التصحيح' : 'Revoir la note') : (isRtl ? 'تصحيح الورقة' : 'Noter la copie')}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Grading Modal with Rubric */}
      {activeAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg">
                    {students.find(s => s.id === activeAttempt.studentId)?.studentCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {isRtl ? currentEval.titleAr : currentEval.titleFr}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {isRtl ? 'تصحيح ورقة المتعلم وتقييم المعايير' : 'Évaluation formative et notation détaillée'}
                </h3>
              </div>

              {/* Dynamic Score Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">{t.correction.finalScore}</span>
                  <div className="text-xl font-extrabold text-blue-700">
                    {liveNoteSur10} <span className="text-xs text-slate-500 font-bold">/ 10</span>{' '}
                    <span className="text-xs text-slate-400 font-normal">({livePercentage}%)</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveAttempt(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Questions to Grade List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs">
              {currentEval.questionIds.map((qId, index) => {
                const q = questions.find(item => item.id === qId);
                if (!q) return null;
                const studentAns = editableAnswers[qId] || {};
                const isAuto = q.correctionMethod === 'auto';
                const isCorrect = studentAns.isCorrect;

                return (
                  <div 
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs"
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {q.skillId}
                        </span>
                        <span className="font-bold text-slate-800">
                          {isRtl ? q.titleAr : q.titleFr}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAuto ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isCorrect ? (isRtl ? 'صحيح (آلي)' : 'Correct (Auto)') : (isRtl ? 'خاطئ (آلي)' : 'Incorrect (Auto)')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            {isRtl ? 'تقييم بشبكة معايير' : 'Grille critériée'}
                          </span>
                        )}
                        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                          {studentAns.scoreObtained ?? 0} / {q.maxScore} pts
                        </span>
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <div className="p-2.5 rounded-lg bg-slate-50 text-slate-700 font-medium mb-3">
                      {isRtl ? q.promptAr : q.promptFr}
                    </div>

                    {/* Student Response Display */}
                    <div className="mb-3">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        {isRtl ? 'إجابة المتعلم المحصلة :' : 'Réponse fournie par l\'élève :'}
                      </span>
                      <div className="p-3 rounded-lg bg-blue-50/40 border border-blue-100 text-slate-800 font-mono text-xs leading-relaxed">
                        {typeof studentAns.studentResponse === 'boolean'
                          ? (studentAns.studentResponse ? 'VRAI (صحيح)' : 'FAUX (خطأ)')
                          : Array.isArray(studentAns.studentResponse)
                          ? studentAns.studentResponse.map((item: string, i: number) => `[${i + 1}] ${item}`).join(' ➔ ')
                          : typeof studentAns.studentResponse === 'object' && studentAns.studentResponse !== null
                          ? Object.entries(studentAns.studentResponse)
                              .map(([k, v]) => `${k} ➜ ${Array.isArray(v) ? v.join(', ') : v}`)
                              .join(' | ')
                          : studentAns.studentResponse || (isRtl ? 'لا توجد إجابة' : 'Aucune réponse')}
                      </div>
                    </div>

                    {/* Manual Rubric Scoring Criteria Buttons if available */}
                    {q.rubricCriteria && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                        <span className="font-bold text-indigo-900 block">
                          {isRtl ? 'تنقيط معايير شبكة التقييم :' : 'Évaluation des critères de la grille :'}
                        </span>

                        <div className="space-y-2">
                          {q.rubricCriteria.map(crit => {
                            const currentCriterionScore = studentAns.rubricScores?.[crit.id] ?? 0;
                            // Create point increments: 0, 0.5, 1, ..., crit.maxScore
                            const steps: number[] = [];
                            for (let step = 0; step <= crit.maxScore; step += 1) {
                              steps.push(step);
                            }

                            return (
                              <div key={crit.id} className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex-1">
                                  <span className="font-semibold text-indigo-950">
                                    {isRtl ? crit.labelAr : crit.labelFr}
                                  </span>
                                  <span className="text-[10px] text-indigo-600 block">
                                    Max : {crit.maxScore} pts
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {steps.map(val => (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={() => handleUpdateRubricCriterion(q.id, crit.id, val)}
                                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                                        currentCriterionScore === val
                                          ? 'bg-blue-600 text-white shadow-xs'
                                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                      }`}
                                    >
                                      {val} pt{val > 1 ? 's' : ''}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Fallback direct score adjustment if manual without criteria */}
                    {!isAuto && !q.rubricCriteria && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                        <span className="font-semibold text-slate-700">
                          {isRtl ? 'منح النقطة يدوياً :' : 'Attribuer la note :'}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={q.maxScore}
                          value={studentAns.scoreObtained ?? 0}
                          onChange={(e) => handleUpdateDirectScore(q.id, Number(e.target.value))}
                          className="w-20 px-2.5 py-1 border border-slate-200 rounded-lg font-bold text-center"
                        />
                        <span className="text-slate-400">/ {q.maxScore} pts</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* General Teacher Pedagogical Feedback Note */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>{t.correction.teacherFeedback}</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={isRtl ? 'اكتب ملاحظاتك وتوجيهاتك للمتعلم لدعمه وتطوير مهاراته...' : 'Conseils et observations pour orienter l\'élève...'}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-500">{isRtl ? 'المستوى المحقق:' : 'Palier atteint :'}</span>{' '}
                <span className="font-bold text-blue-700">
                  {t.masteryLevels[`level${liveLevel}` as keyof typeof t.masteryLevels]}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAttempt(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttemptGrading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.correction.saveGrading}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
