import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { Evaluation, EvaluationType, SubjectId } from '../../types';
import { 
  FileCheck2, PlusCircle, Clock, BookOpen, CheckCircle, 
  PlayCircle, StopCircle, Eye, AlertCircle, X, CheckSquare, Layers,
  Radio, Wifi, MonitorCheck
} from 'lucide-react';
import { LiveClassroomMonitor } from './LiveClassroomMonitor';

export const EvaluationManager: React.FC = () => {
  const { 
    lang, isRtl, evaluations, questions, skills, selectedClassId, 
    addEvaluation, updateEvaluation, setActiveTeacherTab,
    activePresences, serverConnected
  } = useApp();

  const t = translations[lang];
  const [activeSubTab, setActiveSubTab] = useState<'monitor' | 'list'>('monitor');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewEval, setPreviewEval] = useState<Evaluation | null>(null);

  // Count active taking tests
  const activeTakingCount = activePresences.filter(p => p.status === 'taking_test').length;

  // New Evaluation Form
  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [subjectId, setSubjectId] = useState<SubjectId>('francais');
  const [type, setType] = useState<EvaluationType>('formatif');
  const [durationMinutes, setDurationMinutes] = useState(40);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const availableQuestions = questions.filter(q => q.subjectId === subjectId);
  const calculatedTotalScore = selectedQuestionIds.reduce((sum, qId) => {
    const q = questions.find(item => item.id === qId);
    return sum + (q ? q.maxScore : 0);
  }, 0);

  const toggleQuestionSelection = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(prev => prev.filter(qId => qId !== id));
    } else {
      setSelectedQuestionIds(prev => [...prev, id]);
    }
  };

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleFr.trim() && !titleAr.trim()) return;
    if (selectedQuestionIds.length === 0) {
      alert(isRtl ? 'يرجى اختيار سؤال واحد على الأقل للاختبار' : 'Veuillez sélectionner au moins une question.');
      return;
    }

    const newEval: Evaluation = {
      id: `eval-${Date.now().toString().slice(-6)}`,
      titleFr: titleFr || titleAr,
      titleAr: titleAr || titleFr,
      descriptionFr: descriptionFr || 'Évaluation des apprentissages 4AEP.',
      descriptionAr: 'تقويم المكتسبات للمستوى الرابع ابتدائي.',
      subjectId,
      type,
      classId: selectedClassId,
      questionIds: selectedQuestionIds,
      totalScore: calculatedTotalScore,
      durationMinutes: Number(durationMinutes),
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    addEvaluation(newEval);
    setShowCreateModal(false);
    setActiveSubTab('list');

    // Reset Form
    setTitleFr('');
    setTitleAr('');
    setDescriptionFr('');
    setSelectedQuestionIds([]);
  };

  const handleToggleStatus = (ev: Evaluation) => {
    const nextStatus = ev.status === 'active' ? 'closed' : ev.status === 'closed' ? 'active' : 'active';
    updateEvaluation({ ...ev, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FileCheck2 className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {isRtl ? 'إدارة الاختبارات والمراقبة المباشرة للنسخ' : 'Évaluations & Surveillance des Copies'}
                </h2>
                {activeTakingCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{activeTakingCount} {isRtl ? 'يجتازون الآن' : 'en examen'}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl 
                  ? 'مراقبة مركزية للوحات التلاميذ في الوقت الفعلي، تجميع فوري للإجابات، وبرمجة الجلسات التقويمية' 
                  : 'Surveillance en direct des tablettes élèves, centralisation des copies et gestion des sessions d\'évaluation'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedQuestionIds(availableQuestions.slice(0, 3).map(q => q.id));
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isRtl ? 'إنشاء اختبار جديد' : 'Nouvelle Évaluation'}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('monitor')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeSubTab === 'monitor'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Radio className={`w-4 h-4 text-indigo-600 ${activeTakingCount > 0 ? 'animate-pulse' : ''}`} />
            <span>{isRtl ? 'المراقبة المباشرة وتجميع النسخ' : 'Surveillance en Direct & Copies'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTakingCount > 0 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-indigo-50 text-indigo-700'
            }`}>
              {activeTakingCount > 0 ? `${activeTakingCount} en direct` : 'Live Room'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('list')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeSubTab === 'list'
                ? 'bg-white text-blue-700 shadow-xs border border-blue-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>{isRtl ? 'لائحة وبرمجة الاختبارات' : 'Sessions & Catalogue des Évaluations'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-black">
              {evaluations.length}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-2 px-3">
          <span className={`w-2 h-2 rounded-full ${serverConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span>{serverConnected ? (isRtl ? 'الاتصال بالشبكة نشط' : 'Réseau classe connecté') : (isRtl ? 'وضع محلي' : 'Mode local')}</span>
        </div>
      </div>

      {/* Main Content Area based on Sub-Tab */}
      {activeSubTab === 'monitor' ? (
        <LiveClassroomMonitor />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {evaluations.map(ev => (
          <div
            key={ev.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  ev.type === 'diagnostic' ? 'bg-amber-100 text-amber-800' :
                  ev.type === 'formatif' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {t.evaluation[ev.type]}
                </span>

                <button
                  onClick={() => handleToggleStatus(ev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                    ev.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={isRtl ? 'تغيير حالة الاختبار' : 'Changer le statut'}
                >
                  {ev.status === 'active' ? (
                    <>
                      <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.evaluation.statusActive}</span>
                    </>
                  ) : (
                    <>
                      <StopCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.evaluation.statusClosed}</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="font-bold text-base text-slate-900 mb-1.5 line-clamp-2">
                {isRtl ? ev.titleAr : ev.titleFr}
              </h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                {isRtl ? ev.descriptionAr : ev.descriptionFr}
              </p>

              {/* Meta Specs */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">{t.evaluation.subject}</span>
                  <span className="text-xs font-bold text-slate-800">
                    {ev.subjectId === 'francais' ? 'Français' : 'Maths'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">{t.evaluation.duration}</span>
                  <span className="text-xs font-bold text-slate-800">
                    {ev.durationMinutes} min
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">{t.evaluation.totalScore}</span>
                  <span className="text-xs font-bold text-blue-700">
                    {ev.totalScore} pts
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between mb-4">
                <span>{ev.questionIds.length} {isRtl ? 'أسئلة مرتبطة' : 'questions incluses'}</span>
                <span className="text-slate-400">{new Date(ev.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewEval(ev)}
                className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.common.preview}</span>
              </button>

              <button
                onClick={() => setActiveTeacherTab('correction')}
                className="flex-1 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>{isRtl ? 'تصحيح الإجابات' : 'Corriger'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Preview Modal */}
      {previewEval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                  {t.evaluation[previewEval.type]}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {isRtl ? previewEval.titleAr : previewEval.titleFr}
                </h3>
              </div>
              <button
                onClick={() => setPreviewEval(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {isRtl ? previewEval.descriptionAr : previewEval.descriptionFr}
              </div>

              <div className="text-xs font-bold text-slate-900">
                {isRtl ? 'الأسئلة المدرجة في الاختبار :' : 'Questions composant cette évaluation :'}
              </div>

              {previewEval.questionIds.map((qId, idx) => {
                const q = questions.find(item => item.id === qId);
                if (!q) return null;
                const skill = skills.find(s => s.id === q.skillId);

                return (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {q.skillId}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {skill ? (isRtl ? skill.nameAr : skill.nameFr) : ''}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {q.maxScore} pts
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-800 mb-2">
                      {isRtl ? q.promptAr : q.promptFr}
                    </p>

                    {q.rubricCriteria && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                        <span className="font-semibold">{isRtl ? 'معايير التنقيط :' : 'Grille :'}</span>{' '}
                        {q.rubricCriteria.map(c => `${isRtl ? c.labelAr : c.labelFr} (${c.maxScore}pts)`).join(' • ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewEval(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Evaluation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {isRtl ? 'إنشاء وبرمجة تقويم جديد' : 'Créer une nouvelle session d\'évaluation'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvaluation} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.evaluation.subject}</label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      const val = e.target.value as SubjectId;
                      setSubjectId(val);
                      setSelectedQuestionIds([]);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="francais">{t.evaluation.francais}</option>
                    <option value="mathematiques">{t.evaluation.mathematiques}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRtl ? 'نوع التقويم' : 'Type d\'évaluation'}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EvaluationType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="diagnostic">{t.evaluation.diagnostic}</option>
                    <option value="formatif">{t.evaluation.formatif}</option>
                    <option value="sommatif">{t.evaluation.sommatif}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.evaluation.duration} ({isRtl ? 'بالدقيقة' : 'min'})
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    />
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                      {isRtl ? 'دقيقة' : 'min'}
                    </span>
                  </div>
                  {/* Quick Presets */}
                  <div className="flex gap-1.5 mt-1.5">
                    {[15, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDurationMinutes(mins)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition ${
                          durationMinutes === mins
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Informative Timer Notice */}
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 flex items-center gap-2 text-[11px]">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  {isRtl 
                    ? 'يظهر عداد تنازلي مباشر (بالدقائق والثواني) في شاشة المتعلم طيلة فترة الاختبار مع تنبيه عند اقتراب النهاية.' 
                    : 'Un compte à rebours interactif (minutes & secondes) s\'affichera en temps réel pour l\'élève.'}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRtl ? 'عنوان الاختبار' : 'Titre de l\'évaluation'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Évaluation formative - Unité 2 (Français)"
                  value={titleFr}
                  onChange={(e) => setTitleFr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRtl ? 'وصف أو أهداف الاختبار' : 'Description pédagogique'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Objectifs de la session, compétences évaluées..."
                  value={descriptionFr}
                  onChange={(e) => setDescriptionFr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Questions Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700">
                    {isRtl ? 'اختر الأسئلة من بنك الأسئلة :' : 'Sélectionner les questions dans la banque :'}
                  </label>
                  <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {selectedQuestionIds.length} sélectionnée(s) • Total : {calculatedTotalScore} pts
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {availableQuestions.map(q => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQuestionSelection(q.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                          isSelected ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div onClick
                            className="rounded text-blue-600 focus:ring-0"
                          />
                          <div>
                            <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-100/70 px-1.5 py-0.5 rounded mr-1.5">
                              {q.skillId}
                            </span>
                            <span>{q.titleFr}</span>
                          </div>
                        </div>
                        <span className="text-slate-500 font-bold">{q.maxScore} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition"
                >
                  {isRtl ? 'نشر وتفعيل الاختبار' : 'Créer et publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
