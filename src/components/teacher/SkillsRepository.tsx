import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { SubjectId } from '../../types';
import { 
  BookMarked, Calculator, CheckCircle2, AlertCircle, 
  Target, Info, ArrowUpRight
} from 'lucide-react';

export const SkillsRepository: React.FC = () => {
  const { lang, isRtl, skills, calculateSkillMasteryForClass, setActiveTeacherTab } = useApp();
  const [activeSubject, setActiveSubject] = useState<SubjectId>('francais');

  const t = translations[lang];
  const filteredSkills = skills.filter(s => s.subjectId === activeSubject);

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isRtl ? 'شبكة المهارات والكفايات المعتمدة (4AEP)' : 'Référentiel des Compétences du 4AEP'}
              </h2>
              <p className="text-xs text-slate-500">
                {isRtl 
                  ? 'وفق المنهاج الدراسي المغربي للتعليم الابتدائي - مادتي اللغة الفرنسية والرياضيات' 
                  : 'Conforme au curriculum national marocain de l\'enseignement primaire (Français & Mathématiques)'}
              </p>
            </div>
          </div>
        </div>

        {/* Subject Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubject('francais')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubject === 'francais'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookMarked className="w-4 h-4 text-blue-600" />
            <span>{t.evaluation.francais}</span>
          </button>
          <button
            onClick={() => setActiveSubject('mathematiques')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubject === 'mathematiques'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>{t.evaluation.mathematiques}</span>
          </button>
        </div>
      </div>

      {/* Mastery Threshold Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
          <div className="text-[11px] font-bold text-rose-800">{t.masteryLevels.level1}</div>
          <p className="text-[10px] text-rose-600 mt-0.5">{t.masteryLevels.desc1}</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
          <div className="text-[11px] font-bold text-amber-800">{t.masteryLevels.level2}</div>
          <p className="text-[10px] text-amber-600 mt-0.5">{t.masteryLevels.desc2}</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="text-[11px] font-bold text-emerald-800">{t.masteryLevels.level3}</div>
          <p className="text-[10px] text-emerald-600 mt-0.5">{t.masteryLevels.desc3}</p>
        </div>
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
          <div className="text-[11px] font-bold text-indigo-800">{t.masteryLevels.level4}</div>
          <p className="text-[10px] text-indigo-600 mt-0.5">{t.masteryLevels.desc4}</p>
        </div>
      </div>

      {/* Competencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map(skill => {
          const stats = calculateSkillMasteryForClass(skill.id);
          const hasTested = stats.testedCount > 0;

          return (
            <div 
              key={skill.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Domain & Code Tag */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                      {skill.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {isRtl ? skill.domainAr : skill.domainFr}
                    </span>
                  </div>

                  {/* Real-time class mastery percentage badge */}
                  {hasTested ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        TM<sub>s</sub> :
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                        stats.level === 4 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                        stats.level === 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        stats.level === 2 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {stats.percentage}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      {isRtl ? 'لم يقيّم بعد' : 'Non évaluée'}
                    </span>
                  )}
                </div>

                {/* Skill Name */}
                <h3 className="text-base font-bold text-slate-900 mb-1.5">
                  {isRtl ? skill.nameAr : skill.nameFr}
                </h3>

                {/* Skill Pedagogical Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {isRtl ? skill.descriptionAr : skill.descriptionFr}
                </p>
              </div>

              {/* Progress Bar & Actions */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[11px] text-slate-500">
                    {hasTested 
                      ? `${stats.testedCount} ${isRtl ? 'محاولة مجتازة' : 'questions évaluées'}` 
                      : (isRtl ? 'جاهزة للاختبار' : 'Disponible en banque')}
                  </span>
                  {hasTested && (
                    <span className="font-bold text-slate-700">
                      {stats.totalObtained} / {stats.totalMax} pts
                    </span>
                  )}
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all duration-500 ${
                      stats.level === 4 ? 'bg-indigo-600' :
                      stats.level === 3 ? 'bg-emerald-600' :
                      stats.level === 2 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isRtl ? 'المستوى: 4 ابتدائي (4AEP)' : 'Niveau : 4ème AEP'}
                  </span>
                  <button
                    onClick={() => setActiveTeacherTab('remediation')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
    </div>
  );
};
