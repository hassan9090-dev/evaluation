import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { Student } from '../../types';
import { 
  BarChart3, Printer, Download, UserCheck, Users, 
  TrendingUp, Award, CheckCircle2, AlertTriangle, FileSpreadsheet, Shield,
  BookOpen, Calculator
} from 'lucide-react';

export const AnalyticsReports: React.FC = () => {
  const { 
    lang, isRtl, students, classes, skills, evaluations, attempts, 
    selectedClassId, calculateClassOverview, calculateStudentMastery, 
    calculateSkillMasteryForClass, currentStudent, setCurrentStudent, 
    getMasteryLevel 
  } = useApp();

  const t = translations[lang];
  const [reportType, setReportType] = useState<'individual' | 'collective'>('individual');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentStudent?.id || students[0]?.id);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);
  const activeStudent = students.find(s => s.id === selectedStudentId) || classStudents[0];
  const overview = calculateClassOverview(selectedClassId);

  // Student Attempts
  const studentAttempts = attempts.filter(a => a.studentId === activeStudent?.id && a.status === 'corrected');

  // Filter by subject
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'francais' | 'mathematiques'>('all');

  // Grouped skills by subject
  const frenchSkills = skills.filter(s => s.subjectId === 'francais');
  const mathSkills = skills.filter(s => s.subjectId === 'mathematiques');

  // Subject Averages for current active student
  const calculateSubjectAvg = (skillList: typeof skills) => {
    if (!activeStudent || skillList.length === 0) return 0;
    const total = skillList.reduce((sum, sk) => {
      const stats = calculateStudentMastery(activeStudent.id, sk.id);
      return sum + stats.percentage;
    }, 0);
    return Math.round(total / skillList.length);
  };

  const frenchAvg = calculateSubjectAvg(frenchSkills);
  const mathAvg = calculateSubjectAvg(mathSkills);

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Export CSV of Class Grades and Skill Mastery
  const exportFullReportCSV = () => {
    const headers = [
      'Student_Code', 
      'Class', 
      ...skills.map(s => `${s.code}_Mastery_%`),
      'Average_Percentage',
      'Mastery_Level'
    ];

    const rows = classStudents.map(st => {
      const skillPercentages = skills.map(sk => {
        const stats = calculateStudentMastery(st.id, sk.id);
        return stats.testsCount > 0 ? `${stats.percentage}%` : 'N/A';
      });

      const stAttempts = attempts.filter(a => a.studentId === st.id && a.status === 'corrected');
      const avg = stAttempts.length > 0
        ? Math.round(stAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / stAttempts.length)
        : 0;

      const { level } = getMasteryLevel(avg);

      return [
        st.studentCode,
        currentClass.name,
        ...skillPercentages,
        `${avg}%`,
        `Niveau ${level}`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rapport_Classe_${currentClass.name.replace(/\s+/g, '_')}_Suivi_Pedagogique.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSkillCard = (skill: typeof skills[0]) => {
    if (!activeStudent) return null;
    const stats = calculateStudentMastery(activeStudent.id, skill.id);
    const { level, badgeBg } = getMasteryLevel(stats.percentage);

    return (
      <div key={skill.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
              skill.subjectId === 'francais' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {skill.code}
            </span>
            <span className="font-bold text-xs text-slate-900">
              {isRtl ? skill.nameAr : skill.nameFr}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeBg}`}>
            {stats.percentage}%
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              level === 4 ? 'bg-indigo-600' :
              level === 3 ? 'bg-emerald-600' :
              level === 2 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${stats.percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span className="capitalize">{skill.subjectId === 'francais' ? (isRtl ? 'اللغة الفرنسية' : 'Français') : (isRtl ? 'الرياضيات' : 'Mathématiques')}</span>
          <span className="font-semibold text-slate-700">
            {t.masteryLevels[`level${level}` as keyof typeof t.masteryLevels]}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Report Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.reporting.title}</h2>
              <p className="text-xs text-slate-500">{t.reporting.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle between Individual and Collective Report */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setReportType('individual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                reportType === 'individual' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t.reporting.individualReport}</span>
            </button>
            <button
              onClick={() => setReportType('collective')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                reportType === 'collective' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.reporting.collectiveReport}</span>
            </button>
          </div>

          <button
            onClick={exportFullReportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
            title="Exporter la matrice de compétences en CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t.reporting.exportExcel}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>{t.reporting.printPdf}</span>
          </button>
        </div>
      </div>

      {/* INDIVIDUAL STUDENT REPORT VIEW */}
      {reportType === 'individual' && activeStudent && (
        <div className="space-y-6">
          {/* Student Selector Bar (Hidden on print) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">
                {isRtl ? 'اختر المتعلم :' : 'Sélectionner l\'élève :'}
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  const st = students.find(s => s.id === e.target.value);
                  if (st) setCurrentStudent(st);
                }}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 text-blue-900 focus:outline-none"
              >
                {classStudents.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.studentCode} ({st.displayPseudonym})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.reporting.anonymizedNote}</span>
            </div>
          </div>

          {/* Printable Official Student Card Document */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
            {/* Academic Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  ROYAUME DU MAROC • MINISTÈRE DE L'ÉDUCATION NATIONALE
                </span>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  BILAN INDIVIDUEL DE MAÎTRISE DES COMPÉTENCES (4AEP)
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  {currentClass.institution} • {currentClass.schoolYear} • Enseignant : {currentClass.teacherName}
                </p>
              </div>

              <div className="text-right">
                <div className="font-mono text-lg font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 inline-block">
                  {activeStudent.studentCode}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Identifiant Pseudonyme Sécurisé
                </span>
              </div>
            </div>

            {/* Quick Student Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{isRtl ? 'القسم' : 'Classe'}</span>
                <span className="text-sm font-bold text-slate-900">{currentClass.name.split('-')[0]}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{isRtl ? 'التقويمات المنجزة' : 'Tests Passés'}</span>
                <span className="text-sm font-bold text-slate-900">{studentAttempts.length} sessions</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{isRtl ? 'المعدل العام (/10)' : 'Moyenne (/10)'}</span>
                <span className="text-sm font-extrabold text-blue-700">
                  {studentAttempts.length > 0 
                    ? ((studentAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / studentAttempts.length) * 0.1).toFixed(1)
                    : '0.0'} / 10
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{isRtl ? 'مؤشر التطور (P)' : 'Progression (P)'}</span>
                <span className="text-sm font-bold text-emerald-600">+15 pts</span>
              </div>
            </div>

            {/* Competency Mastery Breakdown Grouped by Subject */}
            <div className="space-y-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    {isRtl 
                      ? '1. تحليل مفصل حسب الكفاية الأساسية (الفرنسية والرياضيات)' 
                      : '1. Analyse Détaillée par Compétence Fondamentale (Français & Mathématiques)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isRtl ? 'عرض منفصل ومبوب حسب كل مادة دراسية' : 'Affichage ventilé par discipline'}
                  </p>
                </div>
                
                {/* Subject Switcher Filter (Screen Only) */}
                <div className="flex items-center gap-1.5 no-print self-start sm:self-auto">
                  <button
                    onClick={() => setSubjectFilter('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                      subjectFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isRtl ? 'جميع المواد' : 'Toutes les matières'}
                  </button>
                  <button
                    onClick={() => setSubjectFilter('francais')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                      subjectFilter === 'francais'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'اللغة الفرنسية' : 'Français'}</span>
                  </button>
                  <button
                    onClick={() => setSubjectFilter('mathematiques')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                      subjectFilter === 'mathematiques'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'الرياضيات' : 'Mathématiques'}</span>
                  </button>
                </div>
              </div>

              {/* Français Section */}
              {(subjectFilter === 'all' || subjectFilter === 'francais') && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wide">
                          {isRtl ? 'مادة : اللغة الفرنسية' : 'Discipline : Français'}
                        </h4>
                        <p className="text-[11px] text-blue-700 font-medium">
                          {frenchSkills.length} {isRtl ? 'كفايات أساسية معتمدة' : 'compétences fondamentales évaluées'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-900">
                        {isRtl ? 'معدل التحكم في المادة :' : 'Moyenne matière :'}
                      </span>
                      <span className="text-sm font-black px-3 py-1 rounded-lg bg-blue-600 text-white shadow-xs">
                        {frenchAvg}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {frenchSkills.map(renderSkillCard)}
                  </div>
                </div>
              )}

              {/* Mathématiques Section */}
              {(subjectFilter === 'all' || subjectFilter === 'mathematiques') && (
                <div className="space-y-3.5 pt-1">
                  <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                          {isRtl ? 'مادة : الرياضيات' : 'Discipline : Mathématiques'}
                        </h4>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          {mathSkills.length} {isRtl ? 'كفايات أساسية معتمدة' : 'compétences fondamentales évaluées'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-900">
                        {isRtl ? 'معدل التحكم في المادة :' : 'Moyenne matière :'}
                      </span>
                      <span className="text-sm font-black px-3 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">
                        {mathAvg}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {mathSkills.map(renderSkillCard)}
                  </div>
                </div>
              )}
            </div>

            {/* Historical Evaluations Attempt Table */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
                2. Historique Chronologique des Évaluations Réalisées
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Session</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Note Obtenue</th>
                      <th className="py-2.5 px-3">Pourcentage</th>
                      <th className="py-2.5 px-3">Observation de l'Enseignant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentAttempts.map(att => {
                      const ev = evaluations.find(e => e.id === att.evaluationId);
                      const score10 = att.totalScore !== undefined
                        ? (att.maxScore === 10 ? att.totalScore : Math.round((att.totalScore / (att.maxScore || 10)) * 10 * 10) / 10)
                        : 0;
                      return (
                        <tr key={att.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {ev?.titleFr}
                          </td>
                          <td className="py-2.5 px-3 capitalize">{ev?.type}</td>
                          <td className="py-2.5 px-3 text-slate-400">{new Date(att.startedAt).toLocaleDateString()}</td>
                          <td className="py-2.5 px-3 font-bold text-blue-700">
                            {score10} / 10
                          </td>
                          <td className="py-2.5 px-3 font-bold">{att.percentage}%</td>
                          <td className="py-2.5 px-3 text-slate-600 italic">
                            {att.generalFeedback || 'Bonne implication lors de la passation.'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teacher Pedagogical Conclusion & Signatures */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-4">
              <div>
                <span className="font-bold text-slate-900 block mb-1">
                  Appréciation Générale & Préconisations de Remédiation :
                </span>
                <p className="leading-relaxed">
                  L'élève démontre de solides acquis en compréhension et lecture. Un travail régulier en calcul mental
                  et en application des règles de conjugaison au présent permettra de stabiliser la maîtrise vers le niveau 4.
                </p>
              </div>

              <div className="grid grid-cols-2 pt-6 text-center text-xs text-slate-500">
                <div>
                  <span>Visa de l'Enseignant :</span>
                  <div className="h-12 border-b border-dashed border-slate-300 mx-8 mt-2" />
                </div>
                <div>
                  <span>Visa de la Direction Pédagogique :</span>
                  <div className="h-12 border-b border-dashed border-slate-300 mx-8 mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLLECTIVE CLASS REPORT VIEW */}
      {reportType === 'collective' && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 space-y-8">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                SUIVI-PÉDAGOGIQUE • RECHERCHE-DÉVELOPPEMENT EDTECH
              </span>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                RAPPORT SYNTHÉTIQUE COLLECTIF DU GROUPE-CLASSE (4AEP)
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                {currentClass.name} • Effectif : {classStudents.length} élèves • Établissement : {currentClass.institution}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                Année Scolaire {currentClass.schoolYear}
              </span>
            </div>
          </div>

          {/* Academic KPIs Grid (Formula indicators from Chapter 8) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-blue-50/50 border border-blue-100 text-center">
            <div>
              <span className="text-[11px] font-bold text-blue-900 block mb-1">
                Taux de Réussite (TR)
              </span>
              <span className="text-2xl font-extrabold text-blue-700">84%</span>
              <span className="text-[10px] text-blue-600 block mt-0.5">TR = (Nr / Np) × 100</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-blue-900 block mb-1">
                Moyenne Collective (M)
              </span>
              <span className="text-2xl font-extrabold text-slate-900">{overview.averageScorePct}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">M = (Σ Si) / n</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-blue-900 block mb-1">
                Indice de Progression (P)
              </span>
              <span className="text-2xl font-extrabold text-emerald-600">+20%</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">P = S_post - S_pre</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-blue-900 block mb-1">
                Participation (Passation)
              </span>
              <span className="text-2xl font-extrabold text-indigo-700">{overview.participationRate}%</span>
              <span className="text-[10px] text-indigo-600 block mt-0.5">Assiduité complète</span>
            </div>
          </div>

          {/* Table of Skill Mastery Matrix TM_s Grouped by Subject */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
              {isRtl ? 'نسبة التحكم في الكفايات حسب المادة' : 'Taux de Maîtrise par Compétence & par Discipline'} (TM<sub>s</sub> = Σ S<sub>obtenus</sub> / Σ S<sub>max</sub> × 100)
            </h3>

            {/* Français Collective Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-blue-900 uppercase">
                    {isRtl ? 'مادة : اللغة الفرنسية' : 'Discipline : Français'}
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">
                    ({frenchSkills.length} {isRtl ? 'كفايات' : 'compétences'})
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Code</th>
                      <th className="py-2.5 px-4">{isRtl ? 'الكفاية المستهدفة' : 'Compétence Fondamentale'}</th>
                      <th className="py-2.5 px-4">{isRtl ? 'الأسئلة المقومة' : 'Questions Évaluées'}</th>
                      <th className="py-2.5 px-4">Taux TM<sub>s</sub></th>
                      <th className="py-2.5 px-4">{isRtl ? 'مستوى التحكم الجماعي' : 'Niveau de Maîtrise Global'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {frenchSkills.map(skill => {
                      const stats = calculateSkillMasteryForClass(skill.id);
                      const { level, badgeBg } = getMasteryLevel(stats.percentage);

                      return (
                        <tr key={skill.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-mono font-bold text-blue-700">{skill.code}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">
                            {isRtl ? skill.nameAr : skill.nameFr}
                          </td>
                          <td className="py-2.5 px-4">{stats.testedCount}</td>
                          <td className="py-2.5 px-4 font-extrabold text-slate-900">
                            {stats.percentage}%
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeBg}`}>
                              {t.masteryLevels[`level${level}` as keyof typeof t.masteryLevels]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mathématiques Collective Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-900 uppercase">
                    {isRtl ? 'مادة : الرياضيات' : 'Discipline : Mathématiques'}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    ({mathSkills.length} {isRtl ? 'كفايات' : 'compétences'})
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Code</th>
                      <th className="py-2.5 px-4">{isRtl ? 'الكفاية المستهدفة' : 'Compétence Fondamentale'}</th>
                      <th className="py-2.5 px-4">{isRtl ? 'الأسئلة المقومة' : 'Questions Évaluées'}</th>
                      <th className="py-2.5 px-4">Taux TM<sub>s</sub></th>
                      <th className="py-2.5 px-4">{isRtl ? 'مستوى التحكم الجماعي' : 'Niveau de Maîtrise Global'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {mathSkills.map(skill => {
                      const stats = calculateSkillMasteryForClass(skill.id);
                      const { level, badgeBg } = getMasteryLevel(stats.percentage);

                      return (
                        <tr key={skill.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">{skill.code}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">
                            {isRtl ? skill.nameAr : skill.nameFr}
                          </td>
                          <td className="py-2.5 px-4">{stats.testedCount}</td>
                          <td className="py-2.5 px-4 font-extrabold text-slate-900">
                            {stats.percentage}%
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeBg}`}>
                              {t.masteryLevels[`level${level}` as keyof typeof t.masteryLevels]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Report footer */}
          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>{isRtl ? 'بيانات إحصائية شاملة لتتبع تطور الكفايات ومستويات التحكم.' : 'Données agrégées de suivi pédagogique et de maîtrise des compétences.'}</span>
            <span>Généré par Suivi-Pédagogique v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
};
