import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  Question, QuestionType, Difficulty, SubjectId, MatchingPair, QuestionOption 
} from '../../types';
import { 
  X, Plus, Trash2, CheckCircle2, FileQuestion, Sparkles, AlertCircle 
} from 'lucide-react';

interface EvaluationQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: SubjectId;
  onSave: (question: Question) => void;
  initialSkillId?: string;
  evaluationTitle?: string;
}

export const EvaluationQuestionModal: React.FC<EvaluationQuestionModalProps> = ({
  isOpen,
  onClose,
  subjectId: defaultSubjectId,
  onSave,
  initialSkillId,
  evaluationTitle,
}) => {
  const { lang, isRtl, skills, subjects } = useApp();
  const t = translations[lang];

  const [subjectId, setSubjectId] = useState<SubjectId>(defaultSubjectId);
  const [skillId, setSkillId] = useState<string>('');
  const [type, setType] = useState<QuestionType>('qcm');
  const [difficulty, setDifficulty] = useState<Difficulty>('facile');
  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [promptFr, setPromptFr] = useState('');
  const [promptAr, setPromptAr] = useState('');
  const [maxScore, setMaxScore] = useState<number>(2);

  // Type-specific states
  const [qcmOptions, setQcmOptions] = useState<QuestionOption[]>([
    { id: 'opt-1', textFr: '', isCorrect: true },
    { id: 'opt-2', textFr: '', isCorrect: false },
    { id: 'opt-3', textFr: '', isCorrect: false },
  ]);
  const [correctBoolean, setCorrectBoolean] = useState<boolean>(true);
  const [correctText, setCorrectText] = useState('');
  const [orderingText, setOrderingText] = useState('Chaque matin, les élèves, entrent en classe, dans le calme.');
  const [matchingPairsInput, setMatchingPairsInput] = useState<MatchingPair[]>([
    { id: '1', left: 'Grand', right: 'Petit' },
    { id: '2', left: 'Rapide', right: 'Lent' },
    { id: '3', left: 'Facile', right: 'Difficile' },
  ]);
  const [cat1Name, setCat1Name] = useState('Noms Propres (أسماء علم)');
  const [cat1ItemsText, setCat1ItemsText] = useState('Rabat, Maroc, Sami');
  const [cat2Name, setCat2Name] = useState('Noms Communs (أسماء مشتركة)');
  const [cat2ItemsText, setCat2ItemsText] = useState('arbre, maison, cartable');
  const [oddOptions, setOddOptions] = useState([
    { id: '1', text: 'Marcher', isOdd: false },
    { id: '2', text: 'Chanter', isOdd: false },
    { id: '3', text: 'Finir', isOdd: true },
    { id: '4', text: 'Dessiner', isOdd: false },
  ]);
  const [dragTemplateText, setDragTemplateText] = useState('Chaque matin, Sami prépare son [1] avec soin. Il marche vers [2] pour écouter le [3].');
  const [dragSlotsInput, setDragSlotsInput] = useState('1: cartable, 2: l\'école, 3: maître');
  const [dragWordBankInput, setDragWordBankInput] = useState('cartable, l\'école, maître, cour, voiture');

  // Reset or initialize when opened
  useEffect(() => {
    if (isOpen) {
      setSubjectId(defaultSubjectId);
      const availableSkills = skills.filter(s => s.subjectId === defaultSubjectId);
      if (initialSkillId && availableSkills.some(s => s.id === initialSkillId || s.code === initialSkillId)) {
        setSkillId(initialSkillId);
      } else if (availableSkills.length > 0) {
        setSkillId(availableSkills[0].id);
      } else {
        setSkillId('');
      }
    }
  }, [isOpen, defaultSubjectId, initialSkillId, skills]);

  // When subject changes, pick first matching skill
  const handleSubjectChange = (newSubjectId: SubjectId) => {
    setSubjectId(newSubjectId);
    const available = skills.filter(s => s.subjectId === newSubjectId);
    setSkillId(available.length > 0 ? available[0].id : '');
  };

  const availableSkills = skills.filter(s => s.subjectId === subjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const autoTitle = `Question ${type.toUpperCase()}`;
    const cleanTitleFr = titleFr.trim() || promptFr.trim().slice(0, 40) || (isRtl ? (titleAr.trim() || autoTitle) : autoTitle);
    const cleanTitleAr = titleAr.trim() || promptAr.trim().slice(0, 40) || cleanTitleFr;
    const cleanPromptFr = promptFr.trim() || cleanTitleFr;
    const cleanPromptAr = promptAr.trim() || cleanTitleAr;

    const isAuto = ['qcm', 'vrai_faux', 'fill_blanks', 'short_answer', 'ordering', 'matching', 'categorization', 'odd_one_out', 'drag_drop_text'].includes(type);

    const safeQcmOptions = qcmOptions.map((opt, i) => ({
      ...opt,
      textFr: opt.textFr.trim() || `Option ${i + 1}`,
      textAr: opt.textAr?.trim() || opt.textFr.trim() || `الخيار ${i + 1}`,
    }));

    const newQuestion: Question = {
      id: `q-${Date.now().toString().slice(-6)}`,
      skillId: skillId || (availableSkills[0]?.id || 'GENERAL'),
      subjectId,
      type,
      difficulty,
      titleFr: cleanTitleFr,
      titleAr: cleanTitleAr,
      promptFr: cleanPromptFr,
      promptAr: cleanPromptAr,
      maxScore: Number(maxScore) || 2,
      correctionMethod: isAuto ? 'auto' : 'manual',
      options: type === 'qcm' ? safeQcmOptions : undefined,
      correctBoolean: type === 'vrai_faux' ? correctBoolean : undefined,
      correctAnswerText: (type === 'fill_blanks' || type === 'short_answer') ? (correctText.trim() || 'réponse') : undefined,
      orderingItems: type === 'ordering' 
        ? orderingText.split(',').map(s => s.trim()).filter(Boolean) 
        : undefined,
      matchingPairs: type === 'matching'
        ? matchingPairsInput.filter(p => p.left && p.right)
        : undefined,
      categories: type === 'categorization'
        ? [
            { id: 'cat-1', nameFr: cat1Name, nameAr: cat1Name, items: cat1ItemsText.split(',').map(s => s.trim()).filter(Boolean) },
            { id: 'cat-2', nameFr: cat2Name, nameAr: cat2Name, items: cat2ItemsText.split(',').map(s => s.trim()).filter(Boolean) },
          ]
        : undefined,
      oddOneOutItems: type === 'odd_one_out'
        ? oddOptions.map(o => ({ id: o.id, textFr: o.text, isOdd: o.isOdd }))
        : undefined,
      dragDropTemplate: type === 'drag_drop_text' ? dragTemplateText : undefined,
      dragDropSlots: type === 'drag_drop_text' 
        ? dragSlotsInput.split(',').map(s => {
            const parts = s.split(':');
            return {
              slotIndex: parseInt(parts[0]?.trim() || '1', 10),
              expectedWord: parts[1]?.trim() || '',
            };
          }).filter(s => s.expectedWord)
        : undefined,
      dragDropWordBank: type === 'drag_drop_text'
        ? dragWordBankInput.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
      rubricCriteria: type === 'production_ecrite' ? [
        { id: 'c1', labelFr: 'Respect de la consigne', labelAr: 'احترام التعليمة', maxScore: 2 },
        { id: 'c2', labelFr: 'Organisation des idées', labelAr: 'تنظيم الأفكار', maxScore: 2 },
        { id: 'c3', labelFr: 'Correction de la langue', labelAr: 'سلامة اللغة', maxScore: 3 },
        { id: 'c4', labelFr: 'Vocabulaire approprié', labelAr: 'المفردات', maxScore: 2 },
        { id: 'c5', labelFr: 'Soin et lisibilité', labelAr: 'وضوح الخط', maxScore: 1 },
      ] : type === 'problem_solving' ? [
        { id: 'cp1', labelFr: 'Compréhension du problème', labelAr: 'فهم المسألة', maxScore: 1.5 },
        { id: 'cp2', labelFr: 'Calcul de l\'opération', labelAr: 'إنجاز العملية', maxScore: 2.5 },
        { id: 'cp3', labelFr: 'Rédaction de la réponse', labelAr: 'جملة الحل', maxScore: 1 },
      ] : undefined,
    };

    onSave(newQuestion);
    onClose();

    // Reset Form
    setTitleFr('');
    setTitleAr('');
    setPromptFr('');
    setPromptAr('');
    setCorrectText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 border border-slate-200 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FileQuestion className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isRtl ? 'إضافة سؤال جديد لهذا الاختبار' : 'Ajouter une question à cette évaluation'}
              </h3>
              {evaluationTitle && (
                <p className="text-[11px] text-blue-600 font-medium truncate max-w-md">
                  {isRtl ? 'تقويم :' : 'Évaluation :'} {evaluationTitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Row 1: Subject and Competency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.evaluation.subject}
              </label>
              <select
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value as SubjectId)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {isRtl ? s.nameAr : s.nameFr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRtl ? 'المهارة / الكفاية المستهدفة' : 'Compétence ciblée'}
              </label>
              <select
                value={skillId}
                onChange={(e) => setSkillId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                {availableSkills.map(sk => (
                  <option key={sk.id} value={sk.id}>
                    {sk.code} - {isRtl ? sk.nameAr : sk.nameFr}
                  </option>
                ))}
                {availableSkills.length === 0 && (
                  <option value="">{isRtl ? 'عام' : 'Général'}</option>
                )}
              </select>
            </div>
          </div>

          {/* Row 2: Type, Difficulty, Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRtl ? 'نوع السؤال' : 'Format / Type de question'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as QuestionType)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="qcm">QCM (Choix multiple)</option>
                <option value="vrai_faux">Vrai / Faux (صحيح / خطأ)</option>
                <option value="fill_blanks">Compléter le mot (إتمام الكلمة)</option>
                <option value="ordering">Remise en ordre (ترتيب العناصر)</option>
                <option value="matching">Relier les éléments (المزاوجة)</option>
                <option value="categorization">Classification (تصنيف في جدول)</option>
                <option value="odd_one_out">Trouver l'intrus (العنصر الدخيل)</option>
                <option value="drag_drop_text">Texte à trous (Glisser-Déposer)</option>
                <option value="short_answer">Réponse courte (إجابة قصيرة)</option>
                <option value="production_ecrite">Production écrite (إنتاج كتابي)</option>
                <option value="problem_solving">Résolution de problème (حل مسألة)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRtl ? 'درجة الصعوبة' : 'Difficulté'}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="facile">{isRtl ? 'سهل' : 'Facile'}</option>
                <option value="moyen">{isRtl ? 'متوسط' : 'Moyen'}</option>
                <option value="difficile">{isRtl ? 'صعب' : 'Difficile'}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRtl ? 'النقطة القصوى (Barème)' : 'Barème (Pts)'}
              </label>
              <input
                type="number"
                min={0.5}
                max={20}
                step={0.5}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          {/* Question Title & Prompt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRtl ? 'عنوان السؤال (بالفرنسية أو اختياري)' : 'Titre du sous-exercice (FR)'}
              </label>
              <input
                type="text"
                placeholder="Ex: Accord sujet-verbe ou Calcul mental"
                value={titleFr}
                onChange={(e) => setTitleFr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRtl ? 'عنوان السؤال (بالعربية)' : 'Titre du sous-exercice (AR)'}
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="مثال: التراكيب أو الحساب الذهني"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRtl ? 'نص التعليمة للتلميذ (FR)' : 'Consigne / Énoncé pour l\'élève (FR)'}
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Lis attentivement la phrase puis choisis la bonne réponse."
                value={promptFr}
                onChange={(e) => setPromptFr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRtl ? 'نص التعليمة للتلميذ (AR)' : 'Consigne / Énoncé pour l\'élève (AR)'}
              </label>
              <textarea
                rows={2}
                dir="rtl"
                placeholder="مثال: اقرأ السؤال جيدا ثم حدد الجواب الصحيح."
                value={promptAr}
                onChange={(e) => setPromptAr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
              />
            </div>
          </div>

          {/* DYNAMIC FORM SECTION BASED ON QUESTION TYPE */}

          {/* 1. QCM */}
          {type === 'qcm' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  {isRtl ? 'خيارات الإجابة (حدد الخيار الصحيح) :' : 'Options de réponse (Cochez la bonne réponse) :'}
                </span>
                <button
                  type="button"
                  onClick={() => setQcmOptions(prev => [...prev, { id: `opt-${Date.now()}`, textFr: '', isCorrect: false }])}
                  className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إضافة خيار' : 'Ajouter une option'}</span>
                </button>
              </div>

              {qcmOptions.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctQcm"
                    checked={opt.isCorrect}
                    onChange={() => setQcmOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === idx })))}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title={isRtl ? 'تعيين كإجابة صحيحة' : 'Définir comme bonne réponse'}
                  />
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={opt.textFr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQcmOptions(prev => prev.map((o, i) => i === idx ? { ...o, textFr: val, textAr: val } : o));
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                  {qcmOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setQcmOptions(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 2. Vrai / Faux */}
          {type === 'vrai_faux' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-2">
                {isRtl ? 'الجواب الصحيح المتوقع :' : 'Réponse attendue :'}
              </span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold px-3 py-1.5 rounded-lg border bg-white border-slate-200 hover:border-emerald-300">
                  <input
                    type="radio"
                    name="vf"
                    checked={correctBoolean === true}
                    onChange={() => setCorrectBoolean(true)}
                    className="text-emerald-600"
                  />
                  <span className="text-emerald-700">{isRtl ? 'صحيح (Vrai)' : 'Vrai'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold px-3 py-1.5 rounded-lg border bg-white border-slate-200 hover:border-rose-300">
                  <input
                    type="radio"
                    name="vf"
                    checked={correctBoolean === false}
                    onChange={() => setCorrectBoolean(false)}
                    className="text-rose-600"
                  />
                  <span className="text-rose-700">{isRtl ? 'خطأ (Faux)' : 'Faux'}</span>
                </label>
              </div>
            </div>
          )}

          {/* 3. Fill Blanks / Short Answer */}
          {(type === 'fill_blanks' || type === 'short_answer') && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="font-semibold text-slate-700 block mb-1">
                {isRtl ? 'الكلمة أو القيمة الصحيحة المطلوبة :' : 'Mot exact ou valeur attendue :'}
              </label>
              <input
                type="text"
                placeholder="Ex: chantent (ou 450)"
                value={correctText}
                onChange={(e) => setCorrectText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 font-bold"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isRtl ? 'التصحيح التلقائي يتسامح مع الفراغات وحالة الأحرف.' : 'La correction automatique tolère les espaces et la casse des lettres.'}
              </p>
            </div>
          )}

          {/* 4. Ordering */}
          {type === 'ordering' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-semibold text-slate-700 block">
                {isRtl ? 'العناصر مرتبة بشكل صحيح (مفصولة بفاصلة) :' : 'Éléments dans l\'ordre chronologique/croissant correct (séparés par une virgule) :'}
              </label>
              <textarea
                rows={2}
                value={orderingText}
                onChange={(e) => setOrderingText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
              />
              <span className="text-[10px] text-slate-500 block">
                {isRtl ? 'سيقوم النظام بخلطها عشوائياً عند اجتياز التلميذ للاختبار.' : 'Le système les mélangera automatiquement lors du passage par l\'élève.'}
              </span>
            </div>
          )}

          {/* 5. Matching */}
          {type === 'matching' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  {isRtl ? 'الأزواج المتطابقة (يسار - يمين) :' : 'Paires à relier (Gauche - Droite correspondante) :'}
                </span>
                <button
                  type="button"
                  onClick={() => setMatchingPairsInput(prev => [...prev, { id: String(Date.now()), left: '', right: '' }])}
                  className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إضافة زوج' : 'Ajouter une paire'}</span>
                </button>
              </div>

              {matchingPairsInput.map((pair, idx) => (
                <div key={pair.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Élément gauche ${idx + 1}`}
                    value={pair.left}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMatchingPairsInput(prev => prev.map((p, i) => i === idx ? { ...p, left: val } : p));
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                  <span className="text-slate-400 font-bold">⇄</span>
                  <input
                    type="text"
                    placeholder={`Élément droit correspondant ${idx + 1}`}
                    value={pair.right}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMatchingPairsInput(prev => prev.map((p, i) => i === idx ? { ...p, right: val } : p));
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                  {matchingPairsInput.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setMatchingPairsInput(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 6. Categorization */}
          {type === 'categorization' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-semibold text-slate-700 block">
                {isRtl ? 'جدول التصنيف (خانة 1 وخانة 2) :' : 'Tableau de classification (Catégorie 1 et Catégorie 2) :'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 block">Catégorie A</label>
                  <input
                    type="text"
                    value={cat1Name}
                    onChange={(e) => setCat1Name(e.target.value)}
                    placeholder="Nom Catégorie 1"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-bold"
                  />
                  <textarea
                    rows={2}
                    value={cat1ItemsText}
                    onChange={(e) => setCat1ItemsText(e.target.value)}
                    placeholder="Éléments séparés par des virgules (ex: Rabat, Maroc)"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-[11px]"
                  />
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 block">Catégorie B</label>
                  <input
                    type="text"
                    value={cat2Name}
                    onChange={(e) => setCat2Name(e.target.value)}
                    placeholder="Nom Catégorie 2"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-bold"
                  />
                  <textarea
                    rows={2}
                    value={cat2ItemsText}
                    onChange={(e) => setCat2ItemsText(e.target.value)}
                    placeholder="Éléments séparés par des virgules (ex: arbre, cartable)"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7. Odd One Out */}
          {type === 'odd_one_out' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  {isRtl ? 'عناصر القائمة (حدد العنصر الدخيل) :' : 'Éléments de la liste (Cochez l\'intrus) :'}
                </span>
                <button
                  type="button"
                  onClick={() => setOddOptions(prev => [...prev, { id: String(Date.now()), text: '', isOdd: false }])}
                  className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إضافة كلمة' : 'Ajouter un mot'}</span>
                </button>
              </div>

              {oddOptions.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="oddOne"
                    checked={opt.isOdd}
                    onChange={() => setOddOptions(prev => prev.map((o, i) => ({ ...o, isOdd: i === idx })))}
                    className="w-4 h-4 text-rose-600 cursor-pointer"
                    title={isRtl ? 'تحديد كعنصر دخيل' : 'Définir comme l\'intrus'}
                  />
                  <input
                    type="text"
                    placeholder={`Mot ${idx + 1}`}
                    value={opt.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOddOptions(prev => prev.map((o, i) => i === idx ? { ...o, text: val } : o));
                    }}
                    className={`flex-1 px-3 py-1.5 border rounded-lg bg-white ${opt.isOdd ? 'border-rose-400 bg-rose-50/50 font-bold text-rose-900' : 'border-slate-200'}`}
                  />
                  {oddOptions.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setOddOptions(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 8. Drag and drop text */}
          {type === 'drag_drop_text' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {isRtl ? 'النص مع علامات الفراغ [1]، [2] :' : 'Texte modèle avec balises de trous [1], [2]... :'}
                </label>
                <textarea
                  rows={2}
                  value={dragTemplateText}
                  onChange={(e) => setDragTemplateText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isRtl ? 'الكلمات الصحيحة لكل فراغ :' : 'Mots attendus pour chaque trou :'}
                  </label>
                  <input
                    type="text"
                    value={dragSlotsInput}
                    onChange={(e) => setDragSlotsInput(e.target.value)}
                    placeholder="1: cartable, 2: l'école"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isRtl ? 'بنك الكلمات المقترحة (مع المشتتات) :' : 'Banque de mots proposée à l\'élève :'}
                  </label>
                  <input
                    type="text"
                    value={dragWordBankInput}
                    onChange={(e) => setDragWordBankInput(e.target.value)}
                    placeholder="cartable, l'école, voiture, cour"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 9. Production écrite notice */}
          {type === 'production_ecrite' && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-950">
              <span className="font-bold block mb-1">
                {isRtl ? 'شبكة التصحيح المعيارية المعتمدة تلقائياً :' : 'Grille critériée automatique intégrée :'}
              </span>
              <p className="text-[11px] text-blue-800">
                Respect de la consigne (2 pts), Cohérence des idées (2 pts), Correction de la langue (3 pts), Vocabulaire (2 pts), Soin et lisibilité (1 pt).
              </p>
            </div>
          )}

          {/* 10. Problem solving notice */}
          {type === 'problem_solving' && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-950">
              <span className="font-bold block mb-1">
                {isRtl ? 'شبكة تقويم حل المسألة المعتمدة تلقائياً :' : 'Grille critériée de résolution de problème :'}
              </span>
              <p className="text-[11px] text-indigo-800">
                Compréhension du problème (1.5 pts), Justesse du calcul (2.5 pts), Rédaction de la phrase de réponse (1 pt).
              </p>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isRtl ? 'إدراج في هذا الاختبار' : 'Ajouter à cette évaluation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
