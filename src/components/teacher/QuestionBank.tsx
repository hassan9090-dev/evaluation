import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { Question, QuestionType, Difficulty, SubjectId } from '../../types';
import { 
  Database, PlusCircle, Filter, Search, CheckCircle2, 
  Trash2, X, HelpCircle, FileText, Check, ListChecks,
  ChevronDown, ChevronRight, BookOpen, Calculator, Layers, Plus, AlertTriangle
} from 'lucide-react';

export const QuestionBank: React.FC = () => {
  const { lang, isRtl, questions, skills, subjects, addQuestion, deleteQuestion } = useApp();
  const t = translations[lang];

  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Question Form state
  const [subjectId, setSubjectId] = useState<SubjectId>('francais');
  const [skillId, setSkillId] = useState<string>('FR-02');
  const [type, setType] = useState<QuestionType>('qcm');
  const [difficulty, setDifficulty] = useState<Difficulty>('facile');
  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [promptFr, setPromptFr] = useState('');
  const [promptAr, setPromptAr] = useState('');
  const [maxScore, setMaxScore] = useState(2);
  const [qcmOptions, setQcmOptions] = useState([
    { id: 'opt-1', textFr: '', isCorrect: true },
    { id: 'opt-2', textFr: '', isCorrect: false },
    { id: 'opt-3', textFr: '', isCorrect: false },
  ]);
  const [correctBoolean, setCorrectBoolean] = useState<boolean>(true);
  const [correctText, setCorrectText] = useState('');
  const [orderingText, setOrderingText] = useState('Chaque matin, les élèves, entrent en classe, dans le calme.');
  const [matchingPairsInput, setMatchingPairsInput] = useState([
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

  const filteredQuestions = questions.filter(q => {
    if (subjectFilter !== 'all' && q.subjectId !== subjectFilter) return false;
    if (skillFilter !== 'all' && q.skillId !== skillFilter) return false;
    if (typeFilter !== 'all' && q.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const qText = `${q.titleFr} ${q.titleAr} ${q.promptFr} ${q.promptAr}`.toLowerCase();
      if (!qText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleFr.trim() && !titleAr.trim()) return;

    const isAuto = type === 'qcm' || type === 'vrai_faux' || type === 'fill_blanks' || type === 'short_answer' || type === 'ordering' || type === 'matching' || type === 'categorization' || type === 'odd_one_out' || type === 'drag_drop_text';

    const newQuestion: Question = {
      id: `q-${Date.now().toString().slice(-6)}`,
      skillId,
      subjectId,
      type,
      difficulty,
      titleFr: titleFr || titleAr,
      titleAr: titleAr || titleFr,
      promptFr: promptFr || promptAr,
      promptAr: promptAr || promptFr,
      maxScore: Number(maxScore),
      correctionMethod: isAuto ? 'auto' : 'manual',
      options: type === 'qcm' ? qcmOptions : undefined,
      correctBoolean: type === 'vrai_faux' ? correctBoolean : undefined,
      correctAnswerText: (type === 'fill_blanks' || type === 'short_answer') ? correctText : undefined,
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

    addQuestion(newQuestion);
    setShowAddModal(false);

    // Reset Form
    setTitleFr('');
    setTitleAr('');
    setPromptFr('');
    setPromptAr('');
    setCorrectText('');
  };

  const [collapsedSkills, setCollapsedSkills] = useState<Record<string, boolean>>({});
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  const toggleSkillCollapse = (skillKey: string) => {
    setCollapsedSkills(prev => ({
      ...prev,
      [skillKey]: !prev[skillKey],
    }));
  };

  const openAddModalForSkill = (targetSubjectId: SubjectId, targetSkillId: string) => {
    setSubjectId(targetSubjectId);
    setSkillId(targetSkillId);
    setShowAddModal(true);
  };

  const handleConfirmDeleteQuestion = () => {
    if (!questionToDelete) return;
    deleteQuestion(questionToDelete.id);
    setQuestionToDelete(null);
  };

  const displaySubjects = subjectFilter === 'all' 
    ? subjects 
    : subjects.filter(s => s.id === subjectFilter);

  const renderQuestionCard = (q: Question) => {
    const skill = skills.find(s => s.id === q.skillId || s.code === q.skillId);

    return (
      <div
        key={q.id}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {skill?.code || q.skillId}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                {q.type.replace('_', ' ')}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                q.difficulty === 'facile' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                q.difficulty === 'moyen' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {q.difficulty}
              </span>
            </div>

            <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {q.maxScore} pts
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
            {isRtl ? q.titleAr : q.titleFr}
          </h4>
          <p className="text-xs text-slate-600 line-clamp-3 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {isRtl ? q.promptAr : q.promptFr}
          </p>

          {/* Question Type Details */}
          {q.type === 'qcm' && q.options && (
            <div className="space-y-1 mb-3">
              {q.options.map((opt) => (
                <div key={opt.id} className={`text-[11px] px-2.5 py-1 rounded-lg flex items-center justify-between ${
                  opt.isCorrect ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200' : 'bg-slate-50 text-slate-600'
                }`}>
                  <span>{opt.textFr}</span>
                  {opt.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
              ))}
            </div>
          )}

          {q.type === 'vrai_faux' && (
            <div className="text-[11px] mb-3 text-slate-600 font-medium">
              {isRtl ? 'الإجابة الصحيحة : ' : 'Réponse correcte : '}
              <span className="font-bold text-blue-700">{q.correctBoolean ? 'Vrai (صحيح)' : 'Faux (خطأ)'}</span>
            </div>
          )}

          {q.type === 'ordering' && q.orderingItems && (
            <div className="mb-3 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-[10px] font-bold text-blue-900 block mb-1">
                {isRtl ? 'الترتيب الصحيح للبطاقات :' : 'Ordre correct des étiquettes :'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {q.orderingItems.map((item, idx) => (
                  <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-blue-800 border border-blue-200">
                    {idx + 1}. {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {q.type === 'matching' && q.matchingPairs && (
            <div className="mb-3 p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
              <span className="text-[10px] font-bold text-purple-900 block mb-1">
                {isRtl ? 'العناصر المرتبطة (المزاوجة) :' : 'Paires associées (Relier) :'}
              </span>
              <div className="space-y-1">
                {q.matchingPairs.map(p => (
                  <div key={p.id} className="text-[10px] text-purple-950 flex items-center justify-between">
                    <span className="font-semibold">{p.left}</span>
                    <span className="text-purple-400">↔</span>
                    <span className="font-bold text-purple-800">{p.right}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {q.type === 'categorization' && q.categories && (
            <div className="mb-3 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-900 block mb-1">
                {isRtl ? 'التصنيف في الجدول :' : 'Classification en catégories :'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {q.categories.map(cat => (
                  <div key={cat.id} className="p-1.5 bg-white rounded-lg border border-indigo-200">
                    <strong className="text-indigo-800 block mb-0.5">{cat.nameFr} :</strong>
                    <span className="text-slate-600">{cat.items.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {q.type === 'odd_one_out' && q.oddOneOutItems && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
              <span className="text-[10px] font-bold text-rose-900 block mb-1">
                {isRtl ? 'خيارات العنصر الدخيل :' : 'Trouver l\'intrus :'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {q.oddOneOutItems.map(item => (
                  <span key={item.id} className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    item.isOdd ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
                  }`}>
                    {item.textFr} {item.isOdd && (isRtl ? '(الدخيل ✓)' : '(Intrus ✓)')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {q.type === 'drag_drop_text' && (
            <div className="mb-3 p-2.5 rounded-xl bg-teal-50/70 border border-teal-200">
              <span className="text-[10px] font-bold text-teal-900 block mb-1">
                {isRtl ? 'نص السحب والإفلات والكلمات المتاحة :' : 'Texte à trous (Glisser-Déposer) :'}
              </span>
              <p className="text-[11px] text-teal-950 font-medium bg-white p-2 rounded-lg border border-teal-100 mb-2 leading-relaxed">
                {q.dragDropTemplate}
              </p>
              <div className="space-y-1">
                <div className="text-[10px] text-teal-800">
                  <strong className="font-semibold">{isRtl ? 'الإجابات الصحيحة للفراغات: ' : 'Réponses attendues : '}</strong>
                  {q.dragDropSlots?.map(s => `[${s.slotIndex}] = ${s.expectedWord}`).join(' | ')}
                </div>
                {q.dragDropWordBank && (
                  <div className="flex flex-wrap gap-1 items-center pt-1">
                    <span className="text-[10px] text-slate-500 font-semibold">{isRtl ? 'بنك الكلمات: ' : 'Banque de mots : '}</span>
                    {q.dragDropWordBank.map((word, wIdx) => (
                      <span key={wIdx} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                        {word}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {(q.type === 'fill_blanks' || q.type === 'short_answer') && q.correctAnswerText && (
            <div className="text-[11px] mb-3 text-slate-600">
              <span className="font-semibold">{isRtl ? 'الإجابة النموذجية : ' : 'Réponse attendue : '}</span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {q.correctAnswerText}
              </span>
            </div>
          )}

          {q.rubricCriteria && (
            <div className="mb-3 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-900 block mb-1">
                {isRtl ? 'معايير شبكة التصحيح المعيارية :' : 'Critères de la grille de correction :'}
              </span>
              <ul className="text-[10px] text-indigo-950 space-y-0.5 list-disc list-inside">
                {q.rubricCriteria.map(cr => (
                  <li key={cr.id}>
                    {isRtl ? cr.labelAr : cr.labelFr} ({cr.maxScore} pts)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            {q.correctionMethod === 'auto' 
              ? (isRtl ? 'تصحيح آلي مباشر' : 'Correction automatique')
              : (isRtl ? 'تصحيح يدوي عبر شبكة معايير' : 'Correction manuelle critériée')}
          </span>

          <button
            onClick={() => setQuestionToDelete(q)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
            title={isRtl ? 'حذف السؤال' : 'Supprimer'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isRtl ? 'بنك الأسئلة المصنفة حسب المهارات' : 'Banque de Questions Indexées par Compétences'}
              </h2>
              <p className="text-xs text-slate-500">
                {isRtl 
                  ? 'أسئلة موضوعية ومقالية مدعومة بشبكات تصحيح معيارية للمستوى الرابع' 
                  : 'Items d\'évaluation objectifs et ouverts avec grilles critériées pour le 4AEP'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isRtl ? 'إضافة سؤال جديد' : 'Créer une question'}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>{isRtl ? 'المادة :' : 'Matière :'}</span>
          </span>

          <button
            onClick={() => {
              setSubjectFilter('all');
              setSkillFilter('all');
            }}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              subjectFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{isRtl ? 'جميع المواد' : 'Toutes les matières'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              subjectFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {questions.length}
            </span>
          </button>

          {subjects.map(s => {
            const count = questions.filter(q => q.subjectId === s.id).length;
            const isSelected = subjectFilter === s.id;

            return (
              <button
                key={s.id}
                onClick={() => {
                  setSubjectFilter(s.id);
                  setSkillFilter('all');
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {s.icon === 'calculator' || s.id === 'mathematiques' ? (
                  <Calculator className="w-3.5 h-3.5" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5" />
                )}
                <span>{isRtl ? s.nameAr : s.nameFr}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Row: Search, Skill & Type Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={isRtl ? 'بحث بنص السؤال...' : 'Filtrer par mot-clé...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 ${
                  isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
                }`}
              />
            </div>

            {/* Skill Selector Filter */}
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="py-1.5 px-3 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none max-w-xs truncate"
            >
              <option value="all">{isRtl ? 'جميع الكفايات' : 'Toutes les compétences'}</option>
              {(subjectFilter === 'all' ? skills : skills.filter(s => s.subjectId === subjectFilter)).map(sk => (
                <option key={sk.id} value={sk.id}>
                  {sk.code} - {isRtl ? sk.nameAr : sk.nameFr}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-1.5 px-3 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">{isRtl ? 'جميع الأنواع' : 'Tous les types'}</option>
              <option value="qcm">QCM (اختيار من متعدد)</option>
              <option value="vrai_faux">Vrai / Faux (صحيح أو خطأ)</option>
              <option value="fill_blanks">Compléter (إكمال الفراغ)</option>
              <option value="ordering">Remise en ordre (ترتيب العناصر)</option>
              <option value="matching">Relier les éléments (المزاوجة)</option>
              <option value="categorization">Classification (تصنيف في جدول)</option>
              <option value="odd_one_out">Trouver l'intrus (العنصر الدخيل)</option>
              <option value="drag_drop_text">Glisser-Déposer (إتمام نص بالسحب والإفلات)</option>
              <option value="short_answer">Réponse courte (إجابة قصيرة)</option>
              <option value="production_ecrite">Production écrite (تعبير كتابي)</option>
              <option value="problem_solving">Résolution de problème (حل مسألة)</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {filteredQuestions.length} {isRtl ? 'سؤال معروض' : 'questions affichées'}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredQuestions.length === 0 && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h3 className="font-bold text-sm text-slate-800">
            {isRtl ? 'لم يتم العثور على أي سؤال يطابق المعايير' : 'Aucune question trouvée pour ces critères'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isRtl 
              ? 'يرجى تغيير خيارات الفلترة أو إنشاء سؤال جديد في هذه المادة.'
              : 'Modifiez vos filtres de recherche ou cliquez sur "Créer une question" pour enrichir la banque.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إنشاء سؤال جديد' : 'Créer une question'}</span>
          </button>
        </div>
      )}

      {/* Grouped Display: Par Matière et Par Compétence */}
      <div className="space-y-8">
        {displaySubjects.map(subj => {
          const subjQuestions = filteredQuestions.filter(q => q.subjectId === subj.id);
          const subjSkills = skills.filter(s => s.subjectId === subj.id);

          // If subject filter is 'all' and there are no questions in this subject matching search, skip
          if (subjQuestions.length === 0 && (searchQuery.trim() || typeFilter !== 'all' || skillFilter !== 'all')) {
            return null;
          }

          const isFrench = subj.id === 'francais';
          const isMath = subj.id === 'mathematiques';

          return (
            <div key={subj.id} className="space-y-4">
              {/* Subject Banner Header */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isFrench ? 'bg-blue-50/80 border-blue-200 text-blue-950' :
                isMath ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' :
                'bg-indigo-50/80 border-indigo-200 text-indigo-950'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-xs ${
                    isFrench ? 'bg-blue-600' :
                    isMath ? 'bg-emerald-600' :
                    'bg-indigo-600'
                  }`}>
                    {subj.icon === 'calculator' || isMath ? (
                      <Calculator className="w-5 h-5" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold tracking-tight">
                        {isRtl ? `مادة : ${subj.nameAr}` : `Discipline : ${subj.nameFr}`}
                      </h3>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        isFrench ? 'bg-blue-200/70 text-blue-900' :
                        isMath ? 'bg-emerald-200/70 text-emerald-900' :
                        'bg-indigo-200/70 text-indigo-900'
                      }`}>
                        {subjQuestions.length} {isRtl ? 'سؤال' : 'questions'}
                      </span>
                    </div>
                    <p className="text-xs opacity-80 mt-0.5">
                      {isRtl ? 'أسئلة مصنفة حسب الكفايات الأساسية للمادة' : 'Items d\'évaluation indexés par compétence fondamentale'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSubjectId(subj.id);
                    const firstSkill = subjSkills[0]?.id || 'FR-02';
                    setSkillId(firstSkill);
                    setShowAddModal(true);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto ${
                    isFrench ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                    isMath ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                    'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRtl ? `إضافة سؤال لـ ${subj.nameAr}` : `+ Question (${subj.nameFr})`}</span>
                </button>
              </div>

              {/* Competencies Breakdown inside this Subject */}
              <div className="space-y-4">
                {subjSkills.map(skill => {
                  const skillQuestions = subjQuestions.filter(q => q.skillId === skill.id || q.skillId === skill.code);

                  // If filtering by specific skill, skip others
                  if (skillFilter !== 'all' && skill.id !== skillFilter && skill.code !== skillFilter) {
                    return null;
                  }

                  // If search/type active and 0 questions, skip
                  if (skillQuestions.length === 0 && (searchQuery.trim() || typeFilter !== 'all')) {
                    return null;
                  }

                  const isCollapsed = collapsedSkills[skill.id];

                  return (
                    <div 
                      key={skill.id} 
                      className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
                    >
                      {/* Competency Header Bar */}
                      <div 
                        onClick={() => toggleSkillCollapse(skill.id)}
                        className="p-3.5 sm:p-4 bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer transition select-none"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <button
                            type="button"
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100/70 text-blue-800 border border-blue-200 shrink-0">
                            {skill.code}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                {isRtl ? skill.nameAr : skill.nameFr}
                              </h4>
                              <span className="text-[10px] text-slate-500 font-medium">
                                ({isRtl ? skill.domainAr : skill.domainFr})
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {isRtl ? skill.nameFr : skill.nameAr}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            skillQuestions.length > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {skillQuestions.length} {isRtl ? 'أسئلة' : 'questions'}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddModalForSkill(subj.id, skill.id);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                            title={isRtl ? 'إضافة سؤال لهذه الكفاية' : 'Ajouter une question pour cette compétence'}
                          >
                            <Plus className="w-3 h-3" />
                            <span className="hidden sm:inline">{isRtl ? 'إضافة سؤال' : '+ Question'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Questions List for this Competency */}
                      {!isCollapsed && (
                        <div className="p-4 bg-slate-50/30">
                          {skillQuestions.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
                              <p className="mb-2">
                                {isRtl 
                                  ? 'لا توجد أسئلة مسجلة لهذه الكفاية حتى الآن.' 
                                  : 'Aucune question enregistrée pour cette compétence actuellement.'}
                              </p>
                              <button
                                onClick={() => openAddModalForSkill(subj.id, skill.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'إنشاء أول سؤال' : 'Créer la 1ère question'}</span>
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {skillQuestions.map(renderQuestionCard)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Other/Uncategorized questions for this subject if any */}
                {(() => {
                  const uncategorized = subjQuestions.filter(
                    q => !subjSkills.some(s => s.id === q.skillId || s.code === q.skillId)
                  );
                  if (uncategorized.length === 0) return null;

                  return (
                    <div className="bg-white rounded-2xl border border-amber-200 shadow-2xs overflow-hidden">
                      <div className="p-3.5 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {isRtl ? 'عام' : 'DIVERS'}
                          </span>
                          <h4 className="text-xs font-bold text-amber-950">
                            {isRtl ? 'أسئلة عامة أو كفايات مخصصة' : 'Autres questions / Compétences personnalisées'}
                          </h4>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {uncategorized.length} questions
                        </span>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-50/30">
                        {uncategorized.map(renderQuestionCard)}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {isRtl ? 'إنشاء سؤال جديد في بنك الأسئلة' : 'Ajouter une nouvelle question'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.evaluation.subject}</label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      const val = e.target.value as SubjectId;
                      setSubjectId(val);
                      const matchingSkill = skills.find(s => s.subjectId === val);
                      setSkillId(matchingSkill ? matchingSkill.id : '');
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {subjects.map(subj => (
                      <option key={subj.id} value={subj.id}>
                        {isRtl ? subj.nameAr : subj.nameFr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRtl ? 'المهارة المستهدفة' : 'Compétence ciblée'}
                  </label>
                  <select
                    value={skillId}
                    onChange={(e) => setSkillId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {skills.filter(s => s.subjectId === subjectId).map(sk => (
                      <option key={sk.id} value={sk.id}>
                        {sk.code} - {isRtl ? sk.nameAr : sk.nameFr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRtl ? 'نوع السؤال' : 'Type de question'}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="qcm">QCM</option>
                    <option value="vrai_faux">Vrai / Faux</option>
                    <option value="fill_blanks">Compléter le mot</option>
                    <option value="ordering">Remise en ordre (ترتيب العناصر)</option>
                    <option value="matching">Relier les éléments (المزاوجة)</option>
                    <option value="categorization">Classification (تصنيف في جدول)</option>
                    <option value="odd_one_out">Trouver l'intrus (العنصر الدخيل)</option>
                    <option value="drag_drop_text">Texte à trous (Glisser-Déposer / إتمام نص بالسحب والإفلات)</option>
                    <option value="short_answer">Réponse courte</option>
                    <option value="production_ecrite">Production écrite</option>
                    <option value="problem_solving">Résolution de problème</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRtl ? 'درجة الصعوبة' : 'Difficulté'}
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="facile">{isRtl ? 'سهل' : 'Facile'}</option>
                    <option value="moyen">{isRtl ? 'متوسط' : 'Moyen'}</option>
                    <option value="difficile">{isRtl ? 'صعب' : 'Difficile'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRtl ? 'النقطة القصوى' : 'Barème (Pts)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRtl ? 'عنوان السؤال (بالفرنسية أو العربية)' : 'Titre du sujet'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Compréhension : identifier le lieu"
                  value={titleFr}
                  onChange={(e) => setTitleFr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRtl ? 'نص السؤال أو المسألة (Consigne)' : 'Texte ou consigne de la question'}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Écris ici le texte ou la question pour l'élève..."
                  value={promptFr}
                  onChange={(e) => setPromptFr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Dynamic Answer Fields */}
              {type === 'qcm' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-semibold text-slate-700 block mb-1">
                    {isRtl ? 'خيارات الاختيار من متعدد (حدد الإجابة الصحيحة) :' : 'Options QCM (coche la bonne réponse) :'}
                  </span>
                  {qcmOptions.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="qcmCorrect"
                        checked={opt.isCorrect}
                        onChange={() => {
                          setQcmOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === idx })));
                        }}
                      />
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt.textFr}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQcmOptions(prev => prev.map((o, i) => i === idx ? { ...o, textFr: val } : o));
                        }}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {type === 'vrai_faux' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="font-semibold text-slate-700 block mb-2">
                    {isRtl ? 'الإجابة الصحيحة المتوقعة :' : 'La réponse attendue est :'}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="vfAnswer"
                        checked={correctBoolean === true}
                        onChange={() => setCorrectBoolean(true)}
                      />
                      <span className="font-bold text-emerald-700">VRAI (صحيح)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="vfAnswer"
                        checked={correctBoolean === false}
                        onChange={() => setCorrectBoolean(false)}
                      />
                      <span className="font-bold text-rose-700">FAUX (خطأ)</span>
                    </label>
                  </div>
                </div>
              )}

              {(type === 'fill_blanks' || type === 'short_answer') && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الكلمة أو الرقم الصحيح المتوقع :' : 'Mot ou réponse exacte attendue :'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 500 ou ons"
                    value={correctText}
                    onChange={(e) => setCorrectText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {type === 'ordering' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block font-semibold text-slate-700">
                    {isRtl ? 'البطاقات بالترتيب السليم (افصل بينها بفاصلة ,) :' : 'Étiquettes dans le bon ordre (séparées par une virgule ,) :'}
                  </label>
                  <textarea
                    rows={2}
                    value={orderingText}
                    onChange={(e) => setOrderingText(e.target.value)}
                    placeholder="Chaque matin, les élèves, entrent en classe, dans le calme."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {isRtl ? 'سيقوم النظام بخلط البطاقات تلقائياً للمتعلم لترتيبها.' : 'Le système mélangera automatiquement les cartes pour l\'élève.'}
                  </span>
                </div>
              )}

              {type === 'matching' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block font-semibold text-slate-700">
                    {isRtl ? 'أزواج المزاوجة (العنصر ↔ المقابل) :' : 'Paires à relier (Élément gauche ↔ Correspondant droit) :'}
                  </label>
                  {matchingPairsInput.map((pair, idx) => (
                    <div key={pair.id} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={`Élément gauche ${idx + 1}`}
                        value={pair.left}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMatchingPairsInput(prev => prev.map((p, i) => i === idx ? { ...p, left: val } : p));
                        }}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder={`Correspondant ${idx + 1}`}
                        value={pair.right}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMatchingPairsInput(prev => prev.map((p, i) => i === idx ? { ...p, right: val } : p));
                        }}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {type === 'categorization' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="font-semibold text-slate-700 block">
                    {isRtl ? 'إعداد فئات الجدول والعناصر التابعة لها :' : 'Configuration des 2 colonnes de classification :'}
                  </span>
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Nom de la Catégorie 1 (ex: Noms Propres)"
                      value={cat1Name}
                      onChange={(e) => setCat1Name(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Éléments de Cat 1 séparés par des virgules (ex: Rabat, Maroc, Sami)"
                      value={cat1ItemsText}
                      onChange={(e) => setCat1ItemsText(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Nom de la Catégorie 2 (ex: Noms Communs)"
                      value={cat2Name}
                      onChange={(e) => setCat2Name(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Éléments de Cat 2 séparés par des virgules (ex: arbre, cartable)"
                      value={cat2ItemsText}
                      onChange={(e) => setCat2ItemsText(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              {type === 'odd_one_out' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-semibold text-slate-700 block">
                    {isRtl ? 'عناصر السؤال (حدد الدخيل عبر الزر الدائري) :' : 'Options d\'intrus (coche l\'élément qui est l\'intrus) :'}
                  </span>
                  {oddOptions.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="oddCorrect"
                        checked={item.isOdd}
                        onChange={() => {
                          setOddOptions(prev => prev.map((o, i) => ({ ...o, isOdd: i === idx })));
                        }}
                      />
                      <input
                        type="text"
                        placeholder={`Élément ${idx + 1}`}
                        value={item.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOddOptions(prev => prev.map((o, i) => i === idx ? { ...o, text: val } : o));
                        }}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      {item.isOdd && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {isRtl ? 'الدخيل' : 'Intrus'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {type === 'drag_drop_text' && (
                <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 space-y-3">
                  <span className="font-semibold text-teal-900 block">
                    {isRtl ? 'إعداد نص السحب والإفلات (Glisser-Déposer) :' : 'Configuration du Texte à trous (Glisser-Déposer) :'}
                  </span>
                  
                  <div>
                    <label className="block text-[11px] font-semibold text-teal-950 mb-1">
                      {isRtl ? 'نص الفقرة مع تحديد الفراغات برمز [1] و [2] و [3] :' : 'Texte avec les balises [1], [2], [3] pour les zones de dépôt :'}
                    </label>
                    <textarea
                      rows={3}
                      value={dragTemplateText}
                      onChange={(e) => setDragTemplateText(e.target.value)}
                      placeholder="Chaque matin, Sami prépare son [1] avec soin. Il marche vers [2] pour écouter le [3]."
                      className="w-full px-2.5 py-1.5 border border-teal-200 rounded-lg bg-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-teal-950 mb-1">
                      {isRtl ? 'الكلمات الصحيحة لكل فراغ (صيغة: 1: كلمة, 2: كلمة) :' : 'Mots attendus par numéro de trou (format: 1: mot, 2: mot) :'}
                    </label>
                    <input
                      type="text"
                      value={dragSlotsInput}
                      onChange={(e) => setDragSlotsInput(e.target.value)}
                      placeholder="1: cartable, 2: l'école, 3: maître"
                      className="w-full px-2.5 py-1.5 border border-teal-200 rounded-lg bg-white text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-teal-950 mb-1">
                      {isRtl ? 'بنك البطاقات القابلة للسحب (افصل بفاصلة , يمكن إضافة كلمات إضافية مضللة) :' : 'Banque d\'étiquettes à glisser (séparées par une virgule, avec distracteurs éventuels) :'}
                    </label>
                    <input
                      type="text"
                      value={dragWordBankInput}
                      onChange={(e) => setDragWordBankInput(e.target.value)}
                      placeholder="cartable, l'école, maître, cour, voiture"
                      className="w-full px-2.5 py-1.5 border border-teal-200 rounded-lg bg-white text-xs font-medium"
                    />
                    <span className="text-[10px] text-teal-700 block mt-1">
                      {isRtl ? 'تدعم الواجهة كلاً من السحب والإفلات بالماوس أو النقر لوضع البطاقة على شاشات اللمس.' : 'Supporte le glisser-déposer souris et le clic/toucher direct pour tablettes.'}
                    </span>
                  </div>
                </div>
              )}

              {type === 'production_ecrite' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-950">
                  <span className="font-bold block mb-1">
                    {isRtl ? 'شبكة التصحيح المعيارية التلقائية :' : 'Grille critériée appliquée automatiquement :'}
                  </span>
                  <p className="text-[11px] text-blue-800">
                    Respect de la consigne (2 pts), Cohérence des idées (2 pts), Correction de la langue (3 pts), Vocabulaire (2 pts), Soin (1 pt).
                  </p>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition"
                >
                  {isRtl ? 'حفظ في البنك' : 'Ajouter à la banque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              {isRtl ? 'تأكيد حذف السؤال' : 'Supprimer cette question ?'}
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              {isRtl
                ? 'هل أنت متأكد من حذف هذا السؤال من بنك الأسئلة؟ لا يمكن التراجع عن هذه العملية.'
                : 'Êtes-vous sûr de vouloir supprimer définitivement cette question du référentiel ? Cette action est irréversible.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuestion}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
              >
                {isRtl ? 'حذف السؤال' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

