import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  Users, UserPlus, Download, Upload, Search, ShieldCheck, 
  Eye, CheckCircle2, Lock, School, Sparkles, X
} from 'lucide-react';
import { Student } from '../../types';

export const ClassManager: React.FC = () => {
  const { 
    lang, isRtl, students, classes, selectedClassId, setSelectedClassId, 
    addStudent, setActiveTeacherTab, setCurrentStudent 
  } = useApp();

  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newPseudonym, setNewPseudonym] = useState('');
  const [newPin, setNewPin] = useState('1234');
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);

  const filteredStudents = classStudents.filter(st => 
    st.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.displayPseudonym.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    addStudent({
      studentCode: newCode.toUpperCase().trim(),
      displayPseudonym: newPseudonym.trim() || `Élève ${newCode.toUpperCase().trim()}`,
      classId: selectedClassId,
      pin: newPin || '1234',
      active: true,
      avatarIcon: selectedAvatar,
    });

    setNewCode('');
    setNewPseudonym('');
    setShowAddModal(false);
  };

  const exportStudentsToCSV = () => {
    const headers = ['ID', 'Student_Code', 'Display_Pseudonym', 'Class_ID', 'Status'];
    const rows = classStudents.map(s => [
      s.id,
      s.studentCode,
      s.displayPseudonym,
      s.classId,
      s.active ? 'Actif' : 'Inactif'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `liste_eleves_${currentClass.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimulateCSVImport = () => {
    const nextIdx = students.length + 1;
    const num = nextIdx.toString().padStart(2, '0');
    addStudent({
      studentCode: `G1340${num}`,
      displayPseudonym: `Élève G1340${num}`,
      classId: selectedClassId,
      pin: `${1000 + nextIdx}`,
      active: true,
      avatarIcon: '🐯',
    });
    alert(isRtl ? 'تم استيراد تلميذ جديد برمز مسار بنجاح!' : 'Élève importé avec succès avec Code Massar !');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Class info and Privacy Note */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <School className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{currentClass.name}</h2>
              <p className="text-xs text-slate-500">
                {currentClass.institution} • {currentClass.schoolYear} • {currentClass.teacherName}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة متعلم' : 'Ajouter un élève'}</span>
          </button>
          <button
            onClick={exportStudentsToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition"
            title="Exporter en CSV pour Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>
          <button
            onClick={handleSimulateCSVImport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition"
            title="Importer une liste CSV"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>{isRtl ? 'استيراد CSV' : 'Import CSV'}</span>
          </button>
        </div>
      </div>

      {/* CNDP & Privacy Compliance Callout */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950">
          <span className="font-bold">
            {isRtl ? 'حماية البيانات الشخصية والخصوصية (قانون 09-08 بالمغرب) :' : 'Protection de la vie privée & Démarche CNDP :'}
          </span>{' '}
          {isRtl 
            ? 'تعتمد المنصة على رموز مسار (Code Massar مثل G134001). لا يتم تسجيل أي معطى حساس للمتعلمين داخل قاعدة البيانات لضمان السرية والخصوصية.' 
            : 'Seuls les identifiants Code Massar (ex: G134001) sont enregistrés pour garantir la confidentialité totale des élèves.'}
        </div>
      </div>

      {/* Search Bar & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={isRtl ? 'ابحث برمز مسار (مثلاً: G134001)...' : 'Rechercher par Code Massar (ex: G134001)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{isRtl ? 'عدد المتعلمين في القائمة:' : 'Élèves affichés :'}</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredStudents.length} / {classStudents.length}
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{isRtl ? 'المعرف المستعار' : 'Identifiant Pseudonyme'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'رمز مسار (Code Massar)' : 'Code Massar'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'الرمز السري (PIN)' : 'Code PIN'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'القسم' : 'Classe'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'الحالة' : 'Statut'}</th>
                <th className="py-3.5 px-4 text-right">{isRtl ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-xs">
                      {student.avatarIcon}
                    </span>
                    <span>{student.displayPseudonym}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {student.studentCode}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      {student.pin}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{currentClass.name.split('-')[0]}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {isRtl ? 'نشط' : 'Actif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setCurrentStudent(student);
                        setActiveTeacherTab('analytics');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-semibold transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isRtl ? 'البطاقة الفردية' : 'Bilan individuel'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {isRtl ? 'إضافة متعلم جديد (معرف مستعار)' : 'Ajouter un nouvel élève (pseudonyme)'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRtl ? 'رمز مسار (مثل: G134026)' : 'Code Massar (ex: G134026)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="G1340..."
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRtl ? 'التسمية المستعارة' : 'Pseudonyme d\'affichage'}
                </label>
                <input
                  type="text"
                  placeholder="Élève A-..."
                  value={newPseudonym}
                  onChange={(e) => setNewPseudonym(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRtl ? 'رمز PIN للدخول' : 'Code PIN (4 chiffres)'}
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الرمز التعبيري' : 'Avatar'}
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {['🦊', '🦁', '🐼', '🦉', '🐬'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSelectedAvatar(emoji)}
                        className={`text-lg p-1 rounded-lg border ${
                          selectedAvatar === emoji ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
                  {isRtl ? 'تأكيد الإضافة' : 'Enregistrer l\'élève'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
