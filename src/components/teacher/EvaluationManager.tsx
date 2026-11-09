import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { Evaluation, EvaluationType, SubjectId, Question } from '../../types';
import { 
  FileCheck2, PlusCircle, Clock, BookOpen, CheckCircle, CheckCircle2,
  PlayCircle, StopCircle, Eye, AlertCircle, X, CheckSquare, Layers,
  Radio, Wifi, MonitorCheck, Calendar, Users, Trash2, ArrowUp, ArrowDown,
  Plus, Check, HelpCircle, AlertTriangle, ListChecks, ChevronDown, ChevronUp
} from 'lucide-react';
import { LiveClassroomMonitor } from './LiveClassroomMonitor';
import { EvaluationQuestionModal } from './EvaluationQuestionModal';

export const EvaluationManager: React.FC = () => {
  const { 
    lang, isRtl, evaluations, questions, skills, subjects, classes, selectedClassId, 
    addEvaluation, updateEvaluation, deleteEvaluation, addQuestion, deleteQuestion,
    setActiveTeacherTab, activePresences, serverConnected
  } = useApp();

  const t = translations[lang];
  const [activeSubTab, setActiveSubTab] = useState<'monitor' | 'list'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewEval, setPreviewEval] = useState<Evaluation | null>(null);
  const [selectedEvalForQuestions, setSelectedEvalForQuestions] = useState<Evaluation | null>(null);
  const [evalToDelete, setEvalToDelete] = useState<Evaluation | null>(null);
  const [classFilter, setClassFilter] = useState<string>('all');

  // Question Creation Modals
  const [showQuestionModalForEval, setShowQuestionModalForEval] = useState(false);

  // Count active taking tests
  const activeTakingCount = activePresences.filter(p => p.status === 'taking_test').length;

  // New Evaluation Form State
  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [subjectId, setSubjectId] = useState<SubjectId>('francais');
  const [evalClassId, setEvalClassId] = useState<string>(selectedClassId || (classes[0]?.id || 'class-4aep-a'));
  const [dateRealisation, setDateRealisation] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
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

  const removeQuestionFromSelected = (id: string) => {
    setSelectedQuestionIds(prev => prev.filter(qId => qId !== id));
  };

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetSubj = subjects.find(s => s.id === subjectId);
    const targetCls = classes.find(c => c.id === evalClassId);
    const defaultTitle = targetSubj ? `Évaluation ${targetSubj.nameFr} - ${targetCls?.name || ''}` : 'Nouvelle Évaluation';

    const finalTitleFr = titleFr.trim() || titleAr.trim() || defaultTitle;
    const finalTitleAr = titleAr.trim() || titleFr.trim() || (targetSubj ? `تقويم ${targetSubj.nameAr}` : 'تقويم جديد');

    const newEval: Evaluation = {
      id: `eval-${Date.now().toString().slice(-6)}`,
      titleFr: finalTitleFr,
      titleAr: finalTitleAr,
      descriptionFr: descriptionFr.trim() || 'Évaluation des compétences et apprentissages.',
      descriptionAr: 'تقويم الكفايات والمكتسبات الدراسية.',
      subjectId,
      type,
      classId: evalClassId || (classes[0]?.id || 'class-4aep-a'),
      questionIds: [],
      totalScore: 10,
      durationMinutes: Number(durationMinutes) || 45,
      status: 'active',
      createdAt: new Date().toISOString(),
      dateRealisation: dateRealisation || new Date().toISOString().split('T')[0],
    };

    addEvaluation(newEval);
    setShowCreateModal(false);
    setActiveSubTab('list');

    // Reset Form
    setTitleFr('');
    setTitleAr('');
    setDescriptionFr('');
    setSelectedQuestionIds([]);

    // Open question management immediately for this newly created evaluation
    setSelectedEvalForQuestions(newEval);
  };

  const handleToggleStatus = (ev: Evaluation) => {
    const nextStatus = ev.status === 'active' ? 'closed' : 'active';
    updateEvaluation({ ...ev, status: nextStatus });
  };

  const handleConfirmDeleteEval = () => {
    if (!evalToDelete) return;
    deleteEvaluation(evalToDelete.id);
    setEvalToDelete(null);
  };


  // Helper when a question is created directly inside an existing Evaluation
  const handleSaveQuestionForExistingEval = (newQuestion: Question) => {
    if (!selectedEvalForQuestions) return;
    addQuestion(newQuestion);

    const updatedQuestionIds = [...selectedEvalForQuestions.questionIds, newQuestion.id];

    const updated: Evaluation = {
      ...selectedEvalForQuestions,
      questionIds: updatedQuestionIds,
      totalScore: 10,
    };

    updateEvaluation(updated);
    setSelectedEvalForQuestions(updated);
  };


  // Helper to remove a question from an existing evaluation
  const handleDetachQuestionFromEval = (qId: string) => {
    if (!selectedEvalForQuestions) return;
    const updatedQuestionIds = selectedEvalForQuestions.questionIds.filter(id => id !== qId);

    const updated: Evaluation = {
      ...selectedEvalForQuestions,
      questionIds: updatedQuestionIds,
      totalScore: 10,
    };

    updateEvaluation(updated);
    setSelectedEvalForQuestions(updated);
  };

  // Helper to reorder questions inside an existing evaluation
  const handleMoveQuestionInEval = (index: number, direction: 'up' | 'down') => {
    if (!selectedEvalForQuestions) return;
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= selectedEvalForQuestions.questionIds.length) return;

    const list = [...selectedEvalForQuestions.questionIds];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    const updated: Evaluation = {
      ...selectedEvalForQuestions,
      questionIds: list,
    };

    updateEvaluation(updated);
    setSelectedEvalForQuestions(updated);
  };

  // Filter evaluations by class
  const filteredEvaluations = evaluations.filter(ev => {
    if (classFilter !== 'all' && ev.classId !== classFilter) return false;
    return true;
  });

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
                  {isRtl ? 'إدارة الاختبارات والتقويمات' : 'Gestion des Évaluations'}
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
                  ? 'برمجة الاختبارات وتحديد الأقسام المستهدفة وتواريخ الإنجاز، مع بناء الأسئلة مباشرة لكل اختبار' 
                  : 'Création d\'évaluations par classe avec date de réalisation et gestion directe des questions par évaluation'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEvalClassId(selectedClassId || (classes[0]?.id || 'class-4aep-a'));
            setDateRealisation(new Date().toISOString().split('T')[0]);
            setSelectedQuestionIds([]);
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isRtl ? 'إنشاء اختبار جديد' : 'Nouvelle Évaluation'}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs & Class Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeSubTab === 'list'
                ? 'bg-white text-blue-700 shadow-xs border border-blue-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>{isRtl ? 'لائحة وبرمجة الاختبارات' : 'Sessions d\'évaluation'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-black">
              {evaluations.length}
            </span>
          </button>

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
              {activeTakingCount > 0 ? `${activeTakingCount} live` : 'Live Room'}
            </span>
          </button>
        </div>

        {/* Filter by Class */}
        {activeSubTab === 'list' && (
          <div className="flex items-center gap-2 px-2 self-end sm:self-auto">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
              {isRtl ? 'تصفية حسب القسم :' : 'Filtrer par classe :'}
            </span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{isRtl ? 'جميع الأقسام' : 'Toutes les classes'}</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area based on Sub-Tab */}
      {activeSubTab === 'monitor' ? (
        <LiveClassroomMonitor />
      ) : (
        <div className="space-y-4">
          {filteredEvaluations.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm mb-1">
                {isRtl ? 'لا توجد اختبارات مسجلة لهذه الفئة' : 'Aucune évaluation trouvée'}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {isRtl ? 'يمكنك إنشاء اختبار جديد وتحديد تاريخ الإنجاز والقسم وإضافة الأسئلة إليه' : 'Créez une nouvelle évaluation pour définir la classe cible, la date de réalisation et y ajouter vos questions.'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition cursor-pointer"
              >
                {isRtl ? 'إنشاء أول اختبار' : 'Créer une évaluation'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvaluations.map(ev => {
                const targetClass = classes.find(c => c.id === ev.classId);
                const subj = subjects.find(s => s.id === ev.subjectId);

                return (
                  <div
                    key={ev.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            ev.type === 'diagnostic' ? 'bg-amber-100 text-amber-800' :
                            ev.type === 'formatif' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {t.evaluation[ev.type]}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {subj ? (isRtl ? subj.nameAr : subj.nameFr) : ev.subjectId}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleStatus(ev)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
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

                      {/* Title & Description */}
                      <h3 className="font-bold text-base text-slate-900 mb-1.5 line-clamp-2">
                        {isRtl ? ev.titleAr : ev.titleFr}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3.5 line-clamp-2">
                        {isRtl ? ev.descriptionAr : ev.descriptionFr}
                      </p>

                      {/* Class & Date de réalisation Highlights */}
                      <div className="space-y-1.5 mb-3.5">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs font-semibold">
                          <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-[11px] text-indigo-700 font-bold">{isRtl ? 'القسم :' : 'Classe :'}</span>
                          <span className="truncate">{targetClass ? targetClass.name : (ev.classId || 'Non assigné')}</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 text-xs font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-[11px] text-emerald-700 font-bold">{isRtl ? 'تاريخ الإنجاز :' : 'Prévu le :'}</span>
                          <span>{ev.dateRealisation ? new Date(ev.dateRealisation).toLocaleDateString() : (isRtl ? 'غير محدد' : 'Non fixé')}</span>
                        </div>
                      </div>

                      {/* Meta Specs */}
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-center mb-3">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">{t.evaluation.duration}</span>
                          <span className="text-xs font-bold text-slate-800">
                            {ev.durationMinutes} min
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">{isRtl ? 'الأسئلة' : 'Questions'}</span>
                          <span className="text-xs font-bold text-slate-800">
                            {ev.questionIds.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">{t.evaluation.totalScore}</span>
                          <span className="text-xs font-black text-blue-700">
                            / 10
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-1.5">
                        {/* Direct Button to Manage Questions for this Evaluation */}
                        <button
                          onClick={() => setSelectedEvalForQuestions(ev)}
                          className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                            ev.questionIds.length === 0
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                          title={isRtl ? 'إدارة وإضافة الأسئلة لهذا الاختبار' : 'Gérer et ajouter les questions'}
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>
                            {ev.questionIds.length === 0 
                              ? (isRtl ? '+ إضافة أسئلة (0)' : '+ Ajouter des questions') 
                              : (isRtl ? `الأسئلة (${ev.questionIds.length})` : `Gérer questions (${ev.questionIds.length})`)}
                          </span>
                        </button>

                        <button
                          onClick={() => setPreviewEval(ev)}
                          className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                          title={t.common.preview}
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden sm:inline">{t.common.preview}</span>
                        </button>

                        <button
                          onClick={() => setEvalToDelete(ev)}
                          className="py-1.5 px-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title={isRtl ? 'حذف الاختبار' : 'Supprimer l\'évaluation'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setActiveTeacherTab('correction')}
                        className="w-full py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200/60"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isRtl ? 'تصحيح الإجابات والنسخ' : 'Corriger les copies'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: GÉRER LES QUESTIONS DE L'ÉVALUATION (Direct Question Management for Evaluation) */}
      {selectedEvalForQuestions && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-5 sm:p-6 border border-slate-200 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                    {t.evaluation[selectedEvalForQuestions.type]}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{classes.find(c => c.id === selectedEvalForQuestions.classId)?.name || 'Classe'}</span>
                  </span>
                  {selectedEvalForQuestions.dateRealisation && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(selectedEvalForQuestions.dateRealisation).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {isRtl ? selectedEvalForQuestions.titleAr : selectedEvalForQuestions.titleFr}
                </h3>
                <p className="text-xs text-slate-500">
                  {isRtl ? 'إدارة الأسئلة وإضافة تمارين جديدة مخصصة لهذا الاختبار' : 'Questions associées à cette évaluation • Ajout direct et ordonnancement'}
                </p>
              </div>

              <button
                onClick={() => setSelectedEvalForQuestions(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Toolbar inside Evaluation Questions Modal */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-slate-700">
                  {selectedEvalForQuestions.questionIds.length} {isRtl ? 'أسئلة مضمنة' : 'questions incluses'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-black text-xs text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                  {isRtl ? 'التنقيط الرسمي : / 10' : 'Note sur / 10'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Button 1: Create a brand new question specifically for this evaluation */}
                <button
                  type="button"
                  onClick={() => setShowQuestionModalForEval(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isRtl ? 'إنشاء سؤال جديد لهذا الاختبار' : '+ Créer une question'}</span>
                </button>

              </div>
            </div>

            {/* List of Questions in the Evaluation */}
            <div className="space-y-3">
              {selectedEvalForQuestions.questionIds.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 mb-1">
                    {isRtl ? 'هذا الاختبار لا يحتوي على أسئلة بعد.' : 'Cette évaluation ne comporte aucune question pour l\'instant.'}
                  </p>
                  <p className="text-[11px] text-slate-400 mb-4">
                    {isRtl ? 'اضغط على الزر أدناه لإنشاء وإضافة السؤال الأول.' : 'Cliquez sur le bouton ci-dessous pour créer votre première question.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowQuestionModalForEval(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRtl ? 'إنشاء أول سؤال' : 'Créer une première question'}</span>
                  </button>
                </div>
              ) : (
                selectedEvalForQuestions.questionIds.map((qId, index) => {
                  const q = questions.find(item => item.id === qId);
                  if (!q) {
                    return (
                      <div key={qId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center text-slate-400">
                        <span>Question introuvable (ID: {qId})</span>
                        <button
                          onClick={() => handleDetachQuestionFromEval(qId)}
                          className="text-rose-500 hover:underline font-bold"
                        >
                          Retirer
                        </button>
                      </div>
                    );
                  }

                  const skill = skills.find(s => s.id === q.skillId || s.code === q.skillId);

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {skill?.code || q.skillId}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {q.type}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {skill ? (isRtl ? skill.nameAr : skill.nameFr) : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            {q.maxScore} pts
                          </span>

                          {/* Reordering Buttons */}
                          <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveQuestionInEval(index, 'up')}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              title={isRtl ? 'تحريك للأعلى' : 'Monter'}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === selectedEvalForQuestions.questionIds.length - 1}
                              onClick={() => handleMoveQuestionInEval(index, 'down')}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              title={isRtl ? 'تحريك للأسفل' : 'Descendre'}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Remove from evaluation button */}
                          <button
                            type="button"
                            onClick={() => handleDetachQuestionFromEval(q.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title={isRtl ? 'إزالة من هذا الاختبار' : 'Retirer de cette évaluation'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Question details */}
                      <h4 className="font-bold text-xs text-slate-800 mb-1">
                        {isRtl ? (q.titleAr || q.titleFr) : (q.titleFr || q.titleAr)}
                      </h4>
                      <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                        {isRtl ? (q.promptAr || q.promptFr) : (q.promptFr || q.promptAr)}
                      </p>

                      {/* Preview of options/rubrics */}
                      {q.type === 'qcm' && q.options && (
                        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100">
                          {q.options.map(opt => (
                            <span
                              key={opt.id}
                              className={`text-[11px] px-2 py-0.5 rounded-md border ${
                                opt.isCorrect 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {opt.isCorrect && '✓ '}{opt.textFr || opt.textAr}
                            </span>
                          ))}
                        </div>
                      )}

                      {q.rubricCriteria && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                          <span className="font-semibold">{isRtl ? 'شبكة التصحيح المعيارية :' : 'Grille :'}</span>{' '}
                          {q.rubricCriteria.map(c => `${isRtl ? c.labelAr : c.labelFr} (${c.maxScore}pts)`).join(' • ')}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedEvalForQuestions(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                {t.common.cancel} / {isRtl ? 'تم' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CRÉER UNE NOUVELLE ÉVALUATION */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-5 sm:p-6 border border-slate-200 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <PlusCircle className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {isRtl ? 'إنشاء وبرمجة تقويم جديد' : 'Créer une nouvelle évaluation'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvaluation} className="space-y-4 text-xs">
              
              {/* Row 1: Subject, Target Class & Realization Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Subject */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.evaluation.subject} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      const val = e.target.value as SubjectId;
                      setSubjectId(val);
                      setSelectedQuestionIds([]);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {isRtl ? s.nameAr : s.nameFr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Classe Concernée */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isRtl ? 'القسم المعني' : 'Classe concernée'} <span className="text-rose-500">*</span></span>
                  </label>
                  <select
                    value={evalClassId}
                    onChange={(e) => setEvalClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.schoolYear})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date de Réalisation */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isRtl ? 'تاريخ الإنجاز' : 'Date de réalisation'} <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateRealisation}
                    onChange={(e) => setDateRealisation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Type, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRtl ? 'نوع التقويم' : 'Type d\'évaluation'}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EvaluationType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
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
                    <div className="flex gap-1">
                      {[20, 30, 45, 60].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDurationMinutes(mins)}
                          className={`text-[10px] px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
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
              </div>

              {/* Row 3: Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRtl ? 'عنوان الاختبار (بالفرنسية)' : 'Titre de l\'évaluation (FR)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Évaluation diagnostique - 4AEP"
                    value={titleFr}
                    onChange={(e) => setTitleFr(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRtl ? 'عنوان الاختبار (بالعربية)' : 'Titre de l\'évaluation (AR)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثال: التقويم التشخيصي - المستوى الرابع"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRtl ? 'أهداف أو وصف الاختبار' : 'Description / Objectifs pédagogiques'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Objectifs de la session, compétences prioritaires..."
                  value={descriptionFr}
                  onChange={(e) => setDescriptionFr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Workflow Notice */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-950 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold block text-blue-900 text-xs mb-0.5">
                    {isRtl ? 'المرحلة الأولى : إعداد وبرمجة جلسة الاختبار' : 'Étape 1 : Paramétrage et enregistrement de l\'évaluation'}
                  </span>
                  <p className="text-blue-800 text-[11px]">
                    {isRtl 
                      ? 'بعد تحديد المادة والقسم وتاريخ الإنجاز، اضغط على الزر أدناه لحفظ الاختبار. ستفتح لك مباشرة واجهة إضافة وبناء الأسئلة والتمارين لهذا الاختبار.' 
                      : 'Renseignez la matière, la classe et la date. Dès que vous enregistrez, l\'espace de gestion s\'ouvrira immédiatement pour vous permettre d\'ajouter vos questions une par une.'}
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  <span>{isRtl ? 'إنشاء الاختبار ومتابعة لإضافة الأسئلة' : 'Créer l\'évaluation et ajouter les questions'}</span>
                  <span className="text-sm">➜</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* QUESTION MODAL FOR EXISTING EVALUATION */}
      {selectedEvalForQuestions && (
        <EvaluationQuestionModal
          isOpen={showQuestionModalForEval}
          onClose={() => setShowQuestionModalForEval(false)}
          subjectId={selectedEvalForQuestions.subjectId}
          onSave={handleSaveQuestionForExistingEval}
          evaluationTitle={isRtl ? selectedEvalForQuestions.titleAr : selectedEvalForQuestions.titleFr}
        />
      )}

      {/* PREVIEW MODAL */}
      {previewEval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                    {t.evaluation[previewEval.type]}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {classes.find(c => c.id === previewEval.classId)?.name}
                  </span>
                  {previewEval.dateRealisation && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {new Date(previewEval.dateRealisation).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {isRtl ? previewEval.titleAr : previewEval.titleFr}
                </h3>
              </div>
              <button
                onClick={() => setPreviewEval(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition cursor-pointer"
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
                const skill = skills.find(s => s.id === q.skillId || s.code === q.skillId);

                return (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {skill?.code || q.skillId}
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
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE EVALUATION CONFIRMATION MODAL */}
      {evalToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              {isRtl ? 'تأكيد حذف الاختبار' : 'Supprimer cette évaluation ?'}
            </h3>
            <p className="text-xs text-slate-600 mb-2 font-medium">
              « {isRtl ? evalToDelete.titleAr : evalToDelete.titleFr} »
            </p>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {isRtl
                ? 'هل أنت متأكد من حذف هذا الاختبار نهائياً؟ ستفقد جميع التعيينات المرتبطة به.'
                : 'Êtes-vous sûr de vouloir supprimer définitivement cette évaluation ? Cette action est irréversible.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setEvalToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEval}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
              >
                {isRtl ? 'حذف الاختبار' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
