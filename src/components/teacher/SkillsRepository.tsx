import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { Skill, SubjectId } from '../../types';
import { 
  BookMarked, Calculator, CheckCircle2, AlertCircle, 
  Target, Info, ArrowUpRight, Plus, Pencil, Trash2, 
  Search, Filter, Sparkles, Check 
} from 'lucide-react';
import { SkillModal } from './SkillModal';

export const SkillsRepository: React.FC = () => {
  const { 
    lang, isRtl, skills, deleteSkill, 
    calculateSkillMasteryForClass, setActiveTeacherTab 
  } = useApp();

  const [activeSubject, setActiveSubject] = useState<SubjectId>('francais');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<Skill | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const t = translations[lang];

  // Subject skills
  const subjectSkills = skills.filter(s => s.subjectId === activeSubject);

  // Available unique domains for current subject
  const availableDomains = Array.from(new Set(subjectSkills.map(s => isRtl ? s.domainAr : s.domainFr))).filter(Boolean);

  // Filtered skills by domain and search query
  const filteredSkills = subjectSkills.filter(skill => {
    // Domain match
    if (selectedDomain !== 'all') {
      const dom = isRtl ? skill.domainAr : skill.domainFr;
      if (dom !== selectedDomain) return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = skill.code.toLowerCase().includes(q);
      const nameMatch = (isRtl ? skill.nameAr : skill.nameFr).toLowerCase().includes(q) || skill.nameFr.toLowerCase().includes(q) || skill.nameAr.toLowerCase().includes(q);
      const domainMatch = (isRtl ? skill.domainAr : skill.domainFr).toLowerCase().includes(q);
      const descMatch = (skill.descriptionFr || '').toLowerCase().includes(q) || (skill.descriptionAr || '').toLowerCase().includes(q);
      return codeMatch || nameMatch || domainMatch || descMatch;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setSkillToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill: Skill) => {
    setSkillToEdit(skill);
    setIsModalOpen(true);
  };

  const handleDeleteSkill = (skill: Skill) => {
    const skillName = isRtl ? skill.nameAr : skill.nameFr;
    const confirmText = isRtl
      ? `هل أنت متأكد من حذف المهارة [${skill.code}]: "${skillName}" من شبكة الكفايات؟`
      : `Voulez-vous vraiment supprimer la compétence [${skill.code}] : "${skillName}" du référentiel ?`;

    if (window.confirm(confirmText)) {
      const ok = deleteSkill(skill.id);
      if (ok) {
        setNotification({
          type: 'info',
          text: isRtl 
            ? `تم حذف المهارة (${skill.code}) بنجاح.` 
            : `La compétence (${skill.code}) a été supprimée avec succès.`
        });
        setTimeout(() => setNotification(null), 4000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Action Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-2xs">
              <Target className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  {isRtl ? 'شبكة المهارات والكفايات المعتمدة (4AEP)' : 'Référentiel des Compétences (4AEP)'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono">
                  {filteredSkills.length} {isRtl ? 'مهارة' : 'compétences'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl 
                  ? 'إدارة، إضافة، تعديل وحذف كفايات المنهاج الدراسي للتعليم الابتدائي - الفرنسية والرياضيات' 
                  : 'Gestion, ajout, modification et suppression des compétences du curriculum national (Français & Maths)'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls: Subject Switcher & New Skill Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subject Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                setActiveSubject('francais');
                setSelectedDomain('all');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubject === 'francais'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.evaluation.francais}</span>
            </button>
            <button
              onClick={() => {
                setActiveSubject('mathematiques');
                setSelectedDomain('all');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubject === 'mathematiques'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.evaluation.mathematiques}</span>
            </button>
          </div>

          {/* Add Skill Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isRtl ? 'إضافة مهارة جديدة' : 'Nouvelle Compétence'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{notification.text}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs text-indigo-500 hover:text-indigo-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search & Domain Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={isRtl ? 'البحث بالرمز (Code)، المجال، أو عنوان المهارة...' : 'Rechercher par code (FR-01), domaine ou titre...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition ${
                isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 ${isRtl ? 'left-3' : 'right-3'}`}
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            <span>{isRtl ? 'إجمالي المهارات بالمادة :' : 'Total dans cette matière :'} </span>
            <strong className="text-slate-900 font-mono">{subjectSkills.length}</strong>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>{isRtl ? 'المجال :' : 'Domaine :'}</span>
          </span>

          <button
            onClick={() => setSelectedDomain('all')}
            className={`text-[11px] px-3 py-1 rounded-xl transition font-semibold whitespace-nowrap cursor-pointer ${
              selectedDomain === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isRtl ? 'الكل (جميع المجالات)' : 'Tous les domaines'}
          </button>

          {availableDomains.map(dom => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`text-[11px] px-3 py-1 rounded-xl transition font-semibold whitespace-nowrap cursor-pointer ${
                selectedDomain === dom
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Mastery Threshold Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
          <div className="text-[11px] font-bold text-rose-800">{t.masteryLevels.level1}</div>
          <p className="text-[10px] text-rose-600 mt-0.5">{t.masteryLevels.desc1}</p>
        </div>
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="text-[11px] font-bold text-amber-800">{t.masteryLevels.level2}</div>
          <p className="text-[10px] text-amber-600 mt-0.5">{t.masteryLevels.desc2}</p>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="text-[11px] font-bold text-emerald-800">{t.masteryLevels.level3}</div>
          <p className="text-[10px] text-emerald-600 mt-0.5">{t.masteryLevels.desc3}</p>
        </div>
        <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200">
          <div className="text-[11px] font-bold text-indigo-800">{t.masteryLevels.level4}</div>
          <p className="text-[10px] text-indigo-600 mt-0.5">{t.masteryLevels.desc4}</p>
        </div>
      </div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🎯
          </div>
          <h3 className="font-bold text-sm text-slate-800">
            {isRtl ? 'لم يتم العثور على أي مهارة تطابق معايير البحث' : 'Aucune compétence trouvée pour ces critères'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isRtl 
              ? 'يمكنك تغيير نص البحث أو اختيار مجال آخر، أو إضافة مهارة جديدة مباشرة إلى الشبكة.'
              : 'Modifiez vos filtres de recherche ou cliquez sur "Nouvelle Compétence" pour en créer une.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إضافة مهارة الآن' : 'Créer une compétence'}</span>
          </button>
        </div>
      )}

      {/* Competencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map(skill => {
          const stats = calculateSkillMasteryForClass(skill.id);
          const hasTested = stats.testedCount > 0;

          return (
            <div 
              key={skill.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between group relative"
            >
              <div>
                {/* Domain & Code & Action Buttons */}
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                      {skill.code}
                    </span>
                    <span className="text-xs font-bold text-slate-600 truncate">
                      {isRtl ? skill.domainAr : skill.domainFr}
                    </span>
                  </div>

                  {/* Actions: Edit & Delete buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(skill)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-500 hover:text-indigo-700 transition cursor-pointer"
                      title={isRtl ? 'تعديل المهارة' : 'Modifier cette compétence'}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title={isRtl ? 'حذف المهارة' : 'Supprimer cette compétence'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Skill Name */}
                <h3 className="text-base font-extrabold text-slate-900 mb-1.5 leading-snug">
                  {isRtl ? skill.nameAr : skill.nameFr}
                </h3>

                {/* Second language name subtitle */}
                <p className="text-[11px] text-slate-400 mb-2 font-medium">
                  {isRtl ? skill.nameFr : skill.nameAr}
                </p>

                {/* Skill Pedagogical Description */}
                {(skill.descriptionFr || skill.descriptionAr) && (
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {isRtl ? (skill.descriptionAr || skill.descriptionFr) : (skill.descriptionFr || skill.descriptionAr)}
                  </p>
                )}
              </div>

              {/* Progress Bar, Stats & Actions */}
              <div className="pt-3 border-t border-slate-100 mt-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {hasTested 
                      ? `${stats.testedCount} ${isRtl ? 'سؤال منجز' : 'questions évaluées'}` 
                      : (isRtl ? 'جاهزة للتقويم' : 'Disponible en banque')}
                  </span>
                  {hasTested && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-700">
                        {stats.totalObtained} / {stats.totalMax} pts
                      </span>
                      <span className={`px-2 py-0.2 rounded-full text-[11px] font-extrabold border ${
                        stats.level === 4 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                        stats.level === 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        stats.level === 2 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {stats.percentage}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all duration-500 ${
                      !hasTested ? 'bg-slate-200' :
                      stats.level === 4 ? 'bg-indigo-600' :
                      stats.level === 3 ? 'bg-emerald-600' :
                      stats.level === 2 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${hasTested ? stats.percentage : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                    {skill.targetLevel || '4AEP'}
                  </span>
                  <button
                    onClick={() => setActiveTeacherTab('remediation')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isRtl ? 'أنشطة الدعم المرتبطة' : 'Activités de soutien'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Skill Modal */}
      <SkillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        skillToEdit={skillToEdit}
        defaultSubject={activeSubject}
      />
    </div>
  );
};
