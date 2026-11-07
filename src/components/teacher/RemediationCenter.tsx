import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { RemediationResource, Student } from '../../types';
import { 
  HeartHandshake, AlertTriangle, BookOpen, UserPlus, 
  CheckCircle2, Clock, Eye, Sparkles, X, Send, Award
} from 'lucide-react';

export const RemediationCenter: React.FC = () => {
  const { 
    lang, isRtl, skills, students, remediationResources, 
    remediationAssignments, assignRemediation, calculateStudentMastery, 
    selectedClassId 
  } = useApp();

  const t = translations[lang];
  const [selectedResource, setSelectedResource] = useState<RemediationResource | null>(null);
  const [assignModalResource, setAssignModalResource] = useState<RemediationResource | null>(null);
  const [targetStudentId, setTargetStudentId] = useState<string>('');

  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Rule-based diagnostic: Find struggling students for each skill
  const skillDifficulties = skills.map(skill => {
    const strugglingStudents: { student: Student; pct: number }[] = [];

    classStudents.forEach(st => {
      const stats = calculateStudentMastery(st.id, skill.id);
      if (stats.testsCount > 0 && stats.percentage < 65) {
        strugglingStudents.push({ student: st, pct: stats.percentage });
      }
    });

    const matchingResources = remediationResources.filter(r => r.skillId === skill.id);

    return {
      skill,
      strugglingStudents,
      matchingResources,
    };
  }).filter(item => item.strugglingStudents.length > 0 || item.matchingResources.length > 0);

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalResource || !targetStudentId) return;

    assignRemediation(targetStudentId, assignModalResource.id, assignModalResource.skillId);
    setAssignModalResource(null);
    setTargetStudentId('');
    alert(isRtl ? 'تم إسناد نشاط الدعم بنجاح للمتعلم!' : 'Activité de soutien attribuée avec succès !');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.remediation.title}</h2>
              <p className="text-xs text-slate-500">{t.remediation.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{isRtl ? 'توصيات قائمة على معايير النتائج (Rule-based)' : 'Recommandations basées sur les règles'}</span>
        </div>
      </div>

      {/* Detected Gaps & Linked Remediation */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>{t.remediation.detectedGaps}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillDifficulties.map(({ skill, strugglingStudents, matchingResources }) => (
            <div
              key={skill.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                    {skill.code}
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {strugglingStudents.length} {isRtl ? 'بحاجة لدعم' : 'en difficulté'}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  {isRtl ? skill.nameAr : skill.nameFr}
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  {isRtl ? skill.descriptionAr : skill.descriptionFr}
                </p>

                {/* Struggling Students Pseudonym Pills */}
                {strugglingStudents.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">
                      {isRtl ? 'المتعلمون ذوو الأولوية في المعالجة :' : 'Élèves ciblés (Score < 65%) :'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {strugglingStudents.map(({ student, pct }) => (
                        <span
                          key={student.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          <span>{student.avatarIcon}</span>
                          <span className="font-mono text-blue-700">{student.studentCode}</span>
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1 rounded">
                            {pct}%
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Remediation Resources */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">
                  {isRtl ? 'الموارد البيداغوجية المقترحة للمعالجة :' : 'Fiches et activités de remédiation disponibles :'}
                </span>

                {matchingResources.map(res => (
                  <div
                    key={res.id}
                    className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200/70 text-blue-900 uppercase">
                          {res.type}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900">
                          {isRtl ? res.titleAr : res.titleFr}
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {isRtl ? res.objectiveAr : res.objectiveFr}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setSelectedResource(res)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-white transition"
                        title={t.remediation.openResource}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setAssignModalResource(res);
                          if (strugglingStudents.length > 0) {
                            setTargetStudentId(strugglingStudents[0].student.id);
                          } else if (classStudents.length > 0) {
                            setTargetStudentId(classStudents[0].id);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-xs transition flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isRtl ? 'إسناد' : 'Attribuer'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Table: Assigned Remediation Activities */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            {isRtl ? 'سجل أنشطة الدعم المسندة وحالتها' : 'Suivi des activités de remédiation en cours'}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {remediationAssignments.length} {isRtl ? 'نشاط مسند' : 'assignations'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t.correction.studentCode}</th>
                <th className="py-3 px-4">{isRtl ? 'المهارة' : 'Compétence'}</th>
                <th className="py-3 px-4">{isRtl ? 'النشاط المسند' : 'Ressource assignée'}</th>
                <th className="py-3 px-4">{isRtl ? 'تاريخ الإسناد' : 'Date d\'attribution'}</th>
                <th className="py-3 px-4">{isRtl ? 'الحالة' : 'Statut'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {remediationAssignments.map(asg => {
                const student = students.find(s => s.id === asg.studentId);
                const resource = remediationResources.find(r => r.id === asg.resourceId);
                const skill = skills.find(s => s.id === asg.skillId);

                return (
                  <tr key={asg.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <span>{student?.avatarIcon}</span>
                      <span className="font-mono font-bold text-blue-700">{student?.studentCode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                        {asg.skillId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {resource ? (isRtl ? resource.titleAr : resource.titleFr) : '---'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(asg.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        asg.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {asg.status === 'completed' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{t.remediation.statusCompleted}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{t.remediation.statusPending}</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {selectedResource.type} • {selectedResource.skillId}
              </span>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-bold text-slate-900 text-base mb-2">
              {isRtl ? selectedResource.titleAr : selectedResource.titleFr}
            </h3>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl mb-4 text-xs text-amber-950">
              <span className="font-bold block mb-1">{isRtl ? 'الهدف التربوي للمورد :' : 'Objectif pédagogique :'}</span>
              <p>{isRtl ? selectedResource.objectiveAr : selectedResource.objectiveFr}</p>
            </div>

            <div className="mb-4">
              <span className="text-xs font-bold text-slate-800 block mb-1">
                {isRtl ? 'المحتوى البيداغوجي الموجه للمتعلم :' : 'Contenu guidé de la fiche :'}
              </span>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {isRtl ? selectedResource.contentAr : selectedResource.contentFr}
              </div>
            </div>

            {selectedResource.practiceQuestions && (
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  {isRtl ? 'تمرين تطبيقي مصاحب :' : 'Exercice d\'application :'}
                </span>
                {selectedResource.practiceQuestions.map((pq, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white text-xs">
                    <p className="font-semibold text-slate-800 mb-2">{pq.question}</p>
                    <div className="space-y-1">
                      {pq.options.map((opt, i) => (
                        <div key={i} className={`p-1.5 rounded text-[11px] ${
                          i === pq.correctIndex ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
                        }`}>
                          • {opt} {i === pq.correctIndex && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Activity Modal */}
      {assignModalResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {t.remediation.assignActivity}
              </h3>
              <button
                onClick={() => setAssignModalResource(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">
                  {isRtl ? 'النشاط المختار :' : 'Activité sélectionnée :'}
                </span>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 font-bold text-blue-900">
                  {isRtl ? assignModalResource.titleAr : assignModalResource.titleFr}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRtl ? 'اختر المتعلم المستهدف بالدعم :' : 'Sélectionner l\'élève destinataire :'}
                </label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                >
                  {classStudents.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.studentCode} - {st.displayPseudonym}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalResource(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition"
                >
                  {isRtl ? 'تأكيد الإسناد' : 'Confirmer l\'attribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
