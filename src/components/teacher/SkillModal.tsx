import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Skill, SubjectId } from '../../types';
import { 
  Target, X, Check, BookMarked, Calculator, 
  Sparkles, AlertCircle, CheckCircle2 
} from 'lucide-react';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillToEdit?: Skill | null;
  defaultSubject?: SubjectId;
}

const COMMON_DOMAINS_FR: Record<SubjectId, string[]> = {
  francais: [
    'Compréhension de l\'écrit',
    'Grammaire',
    'Conjugaison',
    'Orthographe',
    'Lexique & Vocabulaire',
    'Production de l\'écrit'
  ],
  mathematiques: [
    'Nombres et Calcul',
    'Géométrie et Espace',
    'Grandeurs et Mesures',
    'Organisation et Gestion des Données',
    'Résolution de Problèmes'
  ]
};

const DOMAIN_AR_MAP: Record<string, string> = {
  'Compréhension de l\'écrit': 'فهم المقروء',
  'Grammaire': 'التراكيب',
  'Conjugaison': 'الصرف والتحويل',
  'Orthographe': 'الإملاء',
  'Lexique & Vocabulaire': 'المعجم والدلالة',
  'Production de l\'écrit': 'الإنتاج الكتابي',
  'Nombres et Calcul': 'الأعداد والحساب',
  'Géométrie et Espace': 'الهندسة والفضاء',
  'Grandeurs et Mesures': 'القياس والمقادير',
  'Organisation et Gestion des Données': 'تنظيم ومعالجة البيانات',
  'Résolution de Problèmes': 'حل المسائل الرياضية'
};

export const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  onClose,
  skillToEdit,
  defaultSubject = 'francais',
}) => {
  const { isRtl, addSkill, updateSkill, skills, subjects } = useApp();

  const isEditing = !!skillToEdit;

  const [subjectId, setSubjectId] = useState<SubjectId>(defaultSubject);
  const [code, setCode] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [domainFr, setDomainFr] = useState('');
  const [domainAr, setDomainAr] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [targetLevel, setTargetLevel] = useState('4AEP');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize form when modal opens or skillToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (skillToEdit) {
        setSubjectId(skillToEdit.subjectId);
        setCode(skillToEdit.code);
        setNameFr(skillToEdit.nameFr);
        setNameAr(skillToEdit.nameAr);
        setDomainFr(skillToEdit.domainFr);
        setDomainAr(skillToEdit.domainAr);
        setDescriptionFr(skillToEdit.descriptionFr || '');
        setDescriptionAr(skillToEdit.descriptionAr || '');
        setTargetLevel(skillToEdit.targetLevel || '4AEP');
      } else {
        // Suggest a new sequential code based on existing skills
        const subjectSkills = skills.filter(s => s.subjectId === defaultSubject);
        const currentSubj = subjects.find(s => s.id === defaultSubject);
        const prefix = currentSubj?.code || 'CP';
        const nextNum = (subjectSkills.length + 1).toString().padStart(2, '0');
        
        setSubjectId(defaultSubject);
        setCode(`${prefix}-${nextNum}`);
        setNameFr('');
        setNameAr('');
        const domains = COMMON_DOMAINS_FR[defaultSubject] || ['Général', 'Apprentissages'];
        const defaultDomain = domains[0];
        setDomainFr(defaultDomain);
        setDomainAr(DOMAIN_AR_MAP[defaultDomain] || defaultDomain);
        setDescriptionFr('');
        setDescriptionAr('');
        setTargetLevel('4AEP');
      }
      setErrorMsg(null);
    }
  }, [isOpen, skillToEdit, defaultSubject, skills, subjects]);

  if (!isOpen) return null;

  const handleDomainSelect = (domFr: string) => {
    setDomainFr(domFr);
    if (DOMAIN_AR_MAP[domFr]) {
      setDomainAr(DOMAIN_AR_MAP[domFr]);
    }
  };

  const handleSubjectChange = (newSubject: SubjectId) => {
    setSubjectId(newSubject);
    if (!isEditing) {
      const subjectSkills = skills.filter(s => s.subjectId === newSubject);
      const currentSubj = subjects.find(s => s.id === newSubject);
      const prefix = currentSubj?.code || 'CP';
      const nextNum = (subjectSkills.length + 1).toString().padStart(2, '0');
      setCode(`${prefix}-${nextNum}`);
      const domains = COMMON_DOMAINS_FR[newSubject] || ['Général', 'Apprentissages'];
      const defDomain = domains[0];
      setDomainFr(defDomain);
      setDomainAr(DOMAIN_AR_MAP[defDomain] || defDomain);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = code.trim().toUpperCase();
    const cleanNameFr = nameFr.trim();
    const cleanNameAr = nameAr.trim();
    const cleanDomainFr = domainFr.trim();
    const cleanDomainAr = domainAr.trim();

    if (!cleanCode) {
      setErrorMsg(isRtl ? 'يرجى تحديد رمز المهارة (مثال: FR-07).' : 'Le code de la compétence est requis (ex: FR-07).');
      return;
    }

    if (!cleanNameFr || !cleanNameAr) {
      setErrorMsg(isRtl ? 'يرجى إدخال عنوان المهارة بالفرنسية وبالعربية.' : 'L\'intitulé de la compétence est obligatoire en français et en arabe.');
      return;
    }

    if (!cleanDomainFr || !cleanDomainAr) {
      setErrorMsg(isRtl ? 'يرجى إدخال مجال الكفاية بالفرنسية وبالعربية.' : 'Le domaine de la compétence est obligatoire en français et en arabe.');
      return;
    }

    // Check duplicate code if adding
    if (!isEditing && skills.some(s => s.code.toUpperCase() === cleanCode)) {
      setErrorMsg(
        isRtl 
          ? `الرمز "${cleanCode}" مستعمل مسبقاً. يرجى اختيار رمز فريد.` 
          : `Le code "${cleanCode}" est déjà utilisé par une autre compétence.`
      );
      return;
    }

    const payload = {
      code: cleanCode,
      subjectId,
      nameFr: cleanNameFr,
      nameAr: cleanNameAr,
      domainFr: cleanDomainFr,
      domainAr: cleanDomainAr,
      descriptionFr: descriptionFr.trim(),
      descriptionAr: descriptionAr.trim(),
      targetLevel: targetLevel.trim() || '4AEP',
    };

    if (isEditing && skillToEdit) {
      updateSkill(skillToEdit.id, payload);
    } else {
      addSkill(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-w-2xl w-full my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs text-amber-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {isEditing 
                  ? (isRtl ? 'تعديل مهارة من شبكة الكفايات' : 'Modifier la Compétence')
                  : (isRtl ? 'إضافة مهارة جديدة إلى الشبكة' : 'Ajouter une Nouvelle Compétence')}
              </h3>
              <p className="text-[11px] text-blue-100">
                {isRtl 
                  ? 'المنهاج المغربي للتعليم الابتدائي - المستوى الرابع (4AEP)' 
                  : 'Curriculum National Marocain • 4ème Année Primaire (4AEP)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Subject Switcher & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'المادة الدراسية :' : 'Matière :'}
              </label>
              <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSubjectChange(s.id)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex-1 min-w-[90px] ${
                      subjectId === s.id
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s.icon === 'calculator' ? (
                      <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <BookMarked className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>{isRtl ? s.nameAr : s.nameFr}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'رمز المهارة (Code) :' : 'Code de la compétence :'}
              </label>
              <input
                type="text"
                required
                placeholder="FR-01"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full py-2 px-3 font-mono font-bold text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 uppercase"
              />
            </div>
          </div>

          {/* Common Domain Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'اختيار مجال مقترح أو كتابة مجال مخصص :' : 'Domaines courants du curriculum :'}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(COMMON_DOMAINS_FR[subjectId] || ['Général', 'Apprentissages fondamentaux', 'Activités pratiques']).map((dom) => (
                <button
                  key={dom}
                  type="button"
                  onClick={() => handleDomainSelect(dom)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    domainFr === dom
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {dom}
                </button>
              ))}
            </div>
          </div>

          {/* Domain Fields (French & Arabic) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? 'المجال بالفرنسية (Domaine FR) :' : 'Domaine (Français) :'}
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Grammaire, Nombres et Calcul..."
                value={domainFr}
                onChange={(e) => setDomainFr(e.target.value)}
                className="w-full py-2 px-3 text-xs font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? 'المجال بالعربية (Domaine AR) :' : 'Domaine (Arabe) :'}
              </label>
              <input
                type="text"
                required
                dir="rtl"
                placeholder="مثال: التراكيب، الأعداد والحساب..."
                value={domainAr}
                onChange={(e) => setDomainAr(e.target.value)}
                className="w-full py-2 px-3 text-xs font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Skill Title / Name (French & Arabic) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? 'عنوان المهارة بالفرنسية (Intitulé FR) :' : 'Intitulé de la compétence (Français) :'}
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Identifier le Groupe Nominal Sujet (GNS)..."
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                className="w-full py-2.5 px-3 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? 'عنوان المهارة بالعربية (Intitulé AR) :' : 'Intitulé de la compétence (Arabe) :'}
              </label>
              <input
                type="text"
                required
                dir="rtl"
                placeholder="مثال: تعيين الفاعل والتمييز بين عناصره..."
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full py-2.5 px-3 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Pedagogical Description (French & Arabic) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? 'التوصيف الديدكتيكي بالفرنسية :' : 'Description pédagogique (Français) :'}
              </label>
              <textarea
                rows={3}
                placeholder="Objectifs d'apprentissage, critères d'évaluation et observables..."
                value={descriptionFr}
                onChange={(e) => setDescriptionFr(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? 'التوصيف الديدكتيكي بالعربية :' : 'Description pédagogique (Arabe) :'}
              </label>
              <textarea
                rows={3}
                dir="rtl"
                placeholder="الأهداف التعلمية، المؤشرات القابلة للملاحظة والتقويم..."
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 leading-relaxed"
              />
            </div>
          </div>

          {/* Target Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isRtl ? 'المستوى الدراسي المستهدف :' : 'Niveau d\'enseignement cible :'}
            </label>
            <input
              type="text"
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              placeholder="4AEP"
              className="w-36 py-2 px-3 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Annuler'}
            </button>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {isEditing 
                  ? (isRtl ? 'حفظ التعديلات' : 'Enregistrer les modifications')
                  : (isRtl ? 'إضافة الكفاية' : 'Ajouter la compétence')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
