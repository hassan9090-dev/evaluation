import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  Users, UserPlus, Download, Upload, Search, ShieldCheck, 
  Eye, CheckCircle2, School, Plus, Trash2, X, User,
  Calendar, Building2, UserCheck, AlertTriangle, Pencil, Check,
  FileSpreadsheet, FileText, UploadCloud, CheckCheck
} from 'lucide-react';
import { SchoolClass, Student } from '../../types';

export const ClassManager: React.FC = () => {
  const { 
    lang, isRtl, students, classes, selectedClassId, setSelectedClassId, 
    addStudent, updateStudent, deleteStudent, addClass, deleteClass,
    setActiveTeacherTab, setCurrentStudent, currentStudent
  } = useApp();

  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);

  // New Student Form (NO avatar, NO pin)
  const [newCode, setNewCode] = useState('');
  const [newPseudonym, setNewPseudonym] = useState('');
  const [targetClassId, setTargetClassId] = useState(selectedClassId);

  // Edit Student Form
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editPseudonym, setEditPseudonym] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editActive, setEditActive] = useState(true);

  // In-app Modal Confirmation for Delete
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);

  // In-app Feedback Toast
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Import CSV / Excel Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTab, setImportTab] = useState<'file' | 'paste'>('file');
  const [importInputText, setImportInputText] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [parsedImportStudents, setParsedImportStudents] = useState<{ name: string; code: string; isDuplicate: boolean }[]>([]);

  // New Class Form
  const [newClassName, setNewClassName] = useState('');
  const [newSchoolYear, setNewSchoolYear] = useState('2026-2027');
  const [newInstitution, setNewInstitution] = useState('École Primaire Al-Massira');
  const [newTeacherName, setNewTeacherName] = useState('M. Hassan');

  // Make sure currentClass is valid
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0] || {
    id: 'class-default',
    name: '4ème Année A (4AEP)',
    schoolYear: '2026-2027',
    institution: 'École Primaire Al-Massira',
    teacherName: 'M. Hassan'
  };

  const classStudents = students.filter(s => s.classId === currentClass.id);

  const filteredStudents = classStudents.filter(st => 
    st.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.displayPseudonym.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const created = addClass({
      name: newClassName.trim(),
      schoolYear: newSchoolYear.trim() || '2026-2027',
      institution: newInstitution.trim() || 'École Primaire Al-Massira',
      teacherName: newTeacherName.trim() || 'M. Hassan',
    });

    setNewClassName('');
    setShowAddClassModal(false);
    setSelectedClassId(created.id);
    showFeedback(isRtl ? `تم إنشاء القسم ${created.name} بنجاح.` : `La classe "${created.name}" a été créée avec succès.`);
  };

  const handleOpenDeleteClass = (cls: SchoolClass) => {
    if (classes.length <= 1) {
      showFeedback(isRtl ? 'لا يمكن حذف القسم الوحيد المتبقي.' : 'Impossible de supprimer la seule classe restante.', 'error');
      return;
    }
    setClassToDelete(cls);
  };

  const handleConfirmDeleteClass = () => {
    if (!classToDelete) return;
    const name = classToDelete.name;
    deleteClass(classToDelete.id);
    setClassToDelete(null);
    showFeedback(isRtl ? `تم حذف القسم ${name} بنجاح.` : `La classe "${name}" a été supprimée.`);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const massar = newCode.toUpperCase().trim();
    const finalClassId = targetClassId || currentClass.id;

    addStudent({
      studentCode: massar,
      displayPseudonym: newPseudonym.trim() || (isRtl ? `تلميذ ${massar}` : `Élève ${massar}`),
      classId: finalClassId,
      active: true,
      // No avatar, no pin
    });

    const addedName = newPseudonym.trim() || `Élève ${massar}`;
    setNewCode('');
    setNewPseudonym('');
    setShowAddStudentModal(false);
    showFeedback(isRtl ? `تمت إضافة المتعلم ${addedName} (${massar}) بنجاح.` : `L'élève ${addedName} (${massar}) a été ajouté.`);
  };

  // Open Edit Modal with Student Data
  const handleOpenEditStudent = (st: Student) => {
    setEditingStudent(st);
    setEditCode(st.studentCode);
    setEditPseudonym(st.displayPseudonym);
    setEditClassId(st.classId);
    setEditActive(st.active);
  };

  // Save Student Edit
  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editCode.trim()) return;

    const massar = editCode.toUpperCase().trim();
    const updated: Student = {
      ...editingStudent,
      studentCode: massar,
      displayPseudonym: editPseudonym.trim() || (isRtl ? `تلميذ ${massar}` : `Élève ${massar}`),
      classId: editClassId || editingStudent.classId,
      active: editActive,
    };

    updateStudent(updated);

    if (currentStudent?.id === editingStudent.id) {
      setCurrentStudent(updated);
    }

    setEditingStudent(null);
    showFeedback(isRtl ? `تم تعديل بيانات المتعلم ${updated.displayPseudonym} بنجاح.` : `Les informations de l'élève "${updated.displayPseudonym}" ont été modifiées avec succès.`);
  };

  // Open Delete Student Modal
  const handleOpenDeleteStudent = (st: Student) => {
    setStudentToDelete(st);
  };

  // Confirm Delete Student
  const handleConfirmDeleteStudent = () => {
    if (!studentToDelete) return;
    const name = studentToDelete.displayPseudonym;
    const code = studentToDelete.studentCode;
    deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
    showFeedback(isRtl ? `تم حذف المتعلم ${name} (${code}) بنجاح.` : `L'élève ${name} (${code}) a été supprimé avec succès.`);
  };

  // Parsing CSV / Excel pasted text or file text
  const parseStudentsData = (content: string) => {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const result: { name: string; code: string; isDuplicate: boolean }[] = [];
    const existingCodes = new Set(students.map(s => s.studentCode.toUpperCase().trim()));

    lines.forEach((line, index) => {
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else {
        parts = line.split(/\s{2,}/);
      }

      parts = parts.map(p => p.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      if (parts.length === 0) return;

      // Skip header line if first row
      const lower = line.toLowerCase();
      if (index === 0 && (
        lower.includes('code') || lower.includes('massar') || lower.includes('nom') || 
        lower.includes('prenom') || lower.includes('name') || lower.includes('pseudonyme')
      )) {
        return;
      }

      let code = '';
      let name = '';

      if (parts.length === 1) {
        if (/^[a-z][0-9]{4,11}$/i.test(parts[0])) {
          code = parts[0].toUpperCase();
          name = isRtl ? `تلميذ ${code}` : `Élève ${code}`;
        } else {
          name = parts[0];
          const generatedNum = (students.length + result.length + 1).toString().padStart(2, '0');
          code = `G1340${generatedNum}`;
        }
      } else {
        const codeRegex = /^[a-z][0-9]{4,11}$/i;
        if (codeRegex.test(parts[0]) && !codeRegex.test(parts[1])) {
          code = parts[0].toUpperCase();
          name = parts.slice(1).join(' ');
        } else if (codeRegex.test(parts[1]) && !codeRegex.test(parts[0])) {
          code = parts[1].toUpperCase();
          name = parts[0];
        } else {
          // Fallback: column 1 name, column 2 code
          name = parts[0];
          code = parts[1].toUpperCase().replace(/\s+/g, '');
        }
      }

      if (code && name) {
        const isDup = existingCodes.has(code) || result.some(r => r.code === code);
        result.push({
          name,
          code,
          isDuplicate: isDup,
        });
      }
    });

    setParsedImportStudents(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportInputText(text);
        parseStudentsData(text);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (text: string) => {
    setImportInputText(text);
    parseStudentsData(text);
  };

  const handleConfirmBatchImport = () => {
    const toAdd = parsedImportStudents.filter(s => !s.isDuplicate);
    if (toAdd.length === 0) {
      showFeedback(isRtl ? 'لا يوجد متعلمون جدد صالحون للاستيراد.' : 'Aucun nouvel élève valide à importer.', 'error');
      return;
    }

    toAdd.forEach(item => {
      addStudent({
        studentCode: item.code,
        displayPseudonym: item.name,
        classId: currentClass.id,
        active: true,
      });
    });

    setShowImportModal(false);
    setImportInputText('');
    setParsedImportStudents([]);
    setImportFileName('');
    showFeedback(
      isRtl 
        ? `تم بنجاح استيراد ${toAdd.length} متعلم(ة) في القسم ${currentClass.name}!` 
        : `${toAdd.length} élève(s) importé(s) avec succès dans la classe ${currentClass.name} !`
    );
  };

  return (
    <div className="space-y-6">
      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150 ${
          feedbackMsg.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Classes Switcher & Manager Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1.5 mr-1">
            <School className="w-4 h-4 text-indigo-600" />
            <span>{isRtl ? 'الأقسام المتاحة :' : 'Mes Classes :'}</span>
          </span>

          {classes.map(cls => {
            const count = students.filter(s => s.classId === cls.id).length;
            const isSelected = cls.id === currentClass.id;

            return (
              <button
                key={cls.id}
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setTargetClassId(cls.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cls.name}</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count} {isRtl ? 'تلميذ' : 'élèves'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add Class Button */}
        <button
          onClick={() => setShowAddClassModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? 'إضافة قسم جديد' : 'Nouvelle Classe'}</span>
        </button>
      </div>

      {/* 2. Top Banner for Selected Class */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
              <School className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{currentClass.name}</h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {classStudents.length} {isRtl ? 'متعلم مسجل' : 'élèves inscrits'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentClass.institution}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentClass.schoolYear}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentClass.teacherName}</span>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setTargetClassId(currentClass.id);
              setShowAddStudentModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة متعلم' : 'Ajouter un élève'}</span>
          </button>

          <button
            onClick={() => {
              setImportInputText('');
              setParsedImportStudents([]);
              setImportFileName('');
              setShowImportModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer shadow-2xs"
            title={isRtl ? 'استيراد المتعلمين من ملف CSV أو Excel' : 'Importer les élèves depuis un fichier CSV ou Excel'}
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>{isRtl ? 'استيراد CSV / Excel' : 'Import CSV'}</span>
          </button>

          {classes.length > 1 && (
            <button
              onClick={() => handleOpenDeleteClass(currentClass)}
              className="p-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
              title={isRtl ? 'حذف هذا القسم' : 'Supprimer cette classe'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. CNDP & Privacy Compliance Callout */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 leading-relaxed">
          <span className="font-bold">
            {isRtl ? 'حماية البيانات الشخصية والخصوصية (قانون 09-08 بالمغرب) :' : 'Protection de la vie privée & Démarche CNDP :'}
          </span>{' '}
          {isRtl 
            ? 'تعتمد المنصة حصرياً على رموز مسار (Code Massar مثل G134001) وقسم التمدرس. لا يتم تسجيل أي صور شخصية ولا رموز PIN معقدة لحماية المتعلمين وسهولة الاستخدام.' 
            : 'L\'accès s\'effectue uniquement par le Code Massar de l\'élève et le choix de la classe. Aucun avatar animalier ni code PIN n\'est requis.'}
        </div>
      </div>

      {/* 4. Search Bar & Filter */}
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
          <span>{isRtl ? 'المتعلمون المعروضون :' : 'Élèves affichés :'}</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredStudents.length} / {classStudents.length}
          </span>
        </div>
      </div>

      {/* 5. Students Table (Clean: NO PIN, NO Avatar) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">{isRtl ? 'المعرف المستعار' : 'Identifiant Pseudonyme'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'رمز مسار (Code Massar)' : 'Code Massar'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'القسم' : 'Classe'}</th>
                <th className="py-3.5 px-4">{isRtl ? 'الحالة' : 'Statut'}</th>
                <th className="py-3.5 px-4 text-right">{isRtl ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {isRtl ? 'لا يوجد متعلمون مسجلون في هذا القسم حالياً.' : 'Aucun élève trouvé dans cette classe.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span>{student.displayPseudonym}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {student.studentCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{currentClass.name.split('-')[0]}</td>
                    <td className="py-3 px-4">
                      {student.active !== false ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {isRtl ? 'نشط' : 'Actif'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200">
                          {isRtl ? 'غير نشط' : 'Inactif'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setCurrentStudent(student);
                            setActiveTeacherTab('analytics');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                          title={isRtl ? 'البطاقة الفردية للمكتسبات' : 'Consulter le bilan individuel'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isRtl ? 'البطاقة الفردية' : 'Bilan'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditStudent(student)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition cursor-pointer"
                          title={isRtl ? 'تعديل بيانات المتعلم' : 'Modifier les informations de l\'élève'}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isRtl ? 'تعديل' : 'Modifier'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenDeleteStudent(student)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title={isRtl ? 'حذف المتعلم' : 'Supprimer cet élève'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New Class */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <School className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isRtl ? 'إضافة قسم جديد' : 'Créer une nouvelle classe'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRtl ? 'اسم القسم (مثال: 4ème Année C)' : 'Nom de la classe (ex: 4ème Année C - 4AEP)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 4ème Année C (4AEP)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRtl ? 'المؤسسة التعليمية' : 'Établissement'}
                </label>
                <input
                  type="text"
                  placeholder="École Primaire Al-Massira"
                  value={newInstitution}
                  onChange={(e) => setNewInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRtl ? 'السنة الدراسية' : 'Année scolaire'}
                  </label>
                  <input
                    type="text"
                    value={newSchoolYear}
                    onChange={(e) => setNewSchoolYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRtl ? 'اسم الأستاذ' : 'Nom enseignant'}
                  </label>
                  <input
                    type="text"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition"
                >
                  {isRtl ? 'إنشاء وتأكيد القسم' : 'Créer la classe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add New Student (NO PIN, NO AVATAR) */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isRtl ? 'إضافة متعلم جديد (برمز مسار)' : 'Ajouter un nouvel élève (Code Massar)'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRtl ? 'القسم المستهدف :' : 'Classe d\'affectation :'}
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRtl ? 'رمز مسار (إجباري - مثل: G134026)' : 'Code Massar élève (Obligatoire, ex: G134026)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="G1340..."
                  value={newCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setNewCode(val);
                    if (!newPseudonym || newPseudonym.startsWith('Élève G') || newPseudonym.startsWith('تلميذ G')) {
                      setNewPseudonym(isRtl ? `تلميذ ${val}` : `Élève ${val}`);
                    }
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono font-bold text-blue-700"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isRtl ? 'يستخدم التلميذ هذا الرمز للولوج إلى اختباراته في القسم.' : 'L\'élève utilise ce code pour entrer dans ses évaluations.'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRtl ? 'المعرف المستعار / الاسم الظاهر' : 'Pseudonyme d\'affichage'}
                </label>
                <input
                  type="text"
                  placeholder="Élève G1340..."
                  value={newPseudonym}
                  onChange={(e) => setNewPseudonym(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                />
              </div>

              {/* Informative notice: No PIN or Avatar needed */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isRtl 
                    ? 'تسجيل الدخول يتم برمز مسار واختيار القسم فقط دون الحاجة إلى رمز PIN أو صور تعبيرية.' 
                    : 'Authentification directe par Code Massar sans code PIN ni avatar.'}
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition"
                >
                  {isRtl ? 'تأكيد وحفظ المتعلم' : 'Enregistrer l\'élève'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Existing Student */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isRtl ? 'تعديل بيانات المتعلم' : 'Modifier les informations de l\'élève'}
                </h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRtl ? 'رمز مسار (Code Massar) :' : 'Code Massar élève :'}
                </label>
                <input
                  type="text"
                  required
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono font-bold text-blue-700 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRtl ? 'المعرف المستعار / الاسم الظاهر :' : 'Nom ou Pseudonyme d\'affichage :'}
                </label>
                <input
                  type="text"
                  required
                  value={editPseudonym}
                  onChange={(e) => setEditPseudonym(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRtl ? 'القسم :' : 'Classe d\'affectation :'}
                </label>
                <select
                  value={editClassId}
                  onChange={(e) => setEditClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {isRtl ? 'حالة التلميذ بالقسم :' : 'Statut de l\'élève :'}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditActive(true)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      editActive
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isRtl ? 'نشط (مشارك في الاختبارات)' : 'Actif (aux évaluations)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditActive(false)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      !editActive
                        ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{isRtl ? 'غير نشط (مؤرشف)' : 'Inactif (archivé)'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition"
                >
                  {isRtl ? 'حفظ التعديلات' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Confirm Delete Student */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-center font-bold text-slate-900 text-base mb-1">
              {isRtl ? 'تأكيد حذف المتعلم' : 'Supprimer cet élève ?'}
            </h3>
            <p className="text-center text-xs text-slate-500 mb-4 leading-relaxed">
              {isRtl ? (
                <>هل أنت متأكد من حذف المتعلم <span className="font-bold text-slate-800">{studentToDelete.displayPseudonym}</span> (رمز مسار: <span className="font-mono font-bold text-blue-700">{studentToDelete.studentCode}</span>) ؟</>
              ) : (
                <>Voulez-vous vraiment supprimer l'élève <span className="font-bold text-slate-800">{studentToDelete.displayPseudonym}</span> (Code Massar : <span className="font-mono font-bold text-blue-700">{studentToDelete.studentCode}</span>) ?</>
              )}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition"
              >
                {isRtl ? 'حذف نهائي' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Confirm Delete Class */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-center font-bold text-slate-900 text-base mb-1">
              {isRtl ? 'تأكيد حذف القسم' : 'Supprimer cette classe ?'}
            </h3>
            <p className="text-center text-xs text-slate-500 mb-4 leading-relaxed">
              {isRtl ? (
                <>هل أنت متأكد من حذف القسم <span className="font-bold text-slate-800">{classToDelete.name}</span> ؟ يحتوي على <span className="font-bold">{students.filter(s => s.classId === classToDelete.id).length}</span> متعلم(ة).</>
              ) : (
                <>Voulez-vous vraiment supprimer la classe <span className="font-bold text-slate-800">{classToDelete.name}</span> contenant <span className="font-bold">{students.filter(s => s.classId === classToDelete.id).length}</span> élève(s) ?</>
              )}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClass}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition"
              >
                {isRtl ? 'حذف القسم' : 'Supprimer la classe'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal 6: Import CSV / Excel Students */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isRtl ? 'استيراد لائحة المتعلمين (CSV / Excel)' : 'Importer la liste des élèves (CSV / Excel)'}
                  </h3>
                  <p className="text-xs text-indigo-700 font-semibold">
                    {isRtl ? 'القسم المستهدف :' : 'Classe cible :'} {currentClass.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs: Fichier vs Copier-coller */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setImportTab('file')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  importTab === 'file'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تحميل ملف CSV / Excel' : 'Fichier CSV / Excel'}</span>
              </button>
              <button
                type="button"
                onClick={() => setImportTab('paste')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  importTab === 'paste'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isRtl ? 'نسخ ولصق من جدول Excel' : 'Copier-coller depuis Excel'}</span>
              </button>
            </div>

            {/* Tab 1: Upload File */}
            {importTab === 'file' && (
              <div className="space-y-3 mb-4">
                <label className="block p-6 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30 hover:bg-indigo-50/60 transition text-center cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-800 block mb-1">
                    {importFileName ? importFileName : (isRtl ? 'اضغط لاختيار ملف CSV أو أسقطه هنا' : 'Cliquez pour sélectionner un fichier CSV ou déposez-le')}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {isRtl ? 'يقبل ملفات .csv و .txt و .tsv المستخرجة من برنامج مسار أو Excel' : 'Accepte les fichiers .csv, .tsv, .txt exportés depuis Massar ou Excel'}
                  </span>
                  <input
                    type="file"
                    accept=".csv,.txt,.tsv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Tab 2: Paste direct text */}
            {importTab === 'paste' && (
              <div className="space-y-2 mb-4">
                <label className="block text-xs font-semibold text-slate-700">
                  {isRtl ? 'الصق الأعمدة المنسوخة من جدول Excel هنا (الاسم والنسب + رمز مسار) :' : 'Collez les colonnes copiées depuis Excel (Nom & Prénom + Code Massar) :'}
                </label>
                <textarea
                  rows={5}
                  value={importInputText}
                  onChange={(e) => handlePasteChange(e.target.value)}
                  placeholder={`Amrani Sami\tG134001\nFatima Zahra Idrissi\tG134002\nYoussef Alami\tG134003`}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Preview of Parsed Students */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {isRtl ? 'معاينة المتعلمين المكتشفين :' : 'Aperçu des élèves détectés :'}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  parsedImportStudents.filter(s => !s.isDuplicate).length > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {parsedImportStudents.filter(s => !s.isDuplicate).length} {isRtl ? 'جديد صالح للاستيراد' : 'nouveau(x) à importer'}
                </span>
              </div>

              {parsedImportStudents.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  {isRtl 
                    ? 'قم بتحميل ملف أو لصق بيانات لإظهار المعاينة هنا.' 
                    : 'Chargez un fichier ou collez des lignes pour prévisualiser les élèves.'}
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase sticky top-0">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">{isRtl ? 'الاسم والنسب' : 'Nom & Prénom'}</th>
                        <th className="py-2 px-3">{isRtl ? 'رمز مسار' : 'Code Massar'}</th>
                        <th className="py-2 px-3 text-right">{isRtl ? 'الحالة' : 'Statut'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedImportStudents.map((st, idx) => (
                        <tr key={idx} className={st.isDuplicate ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="py-2 px-3 font-mono font-bold text-indigo-700">{st.code}</td>
                          <td className="py-2 px-3 text-right">
                            {st.isDuplicate ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                {isRtl ? 'مسجل مسبقاً' : 'Déjà inscrit'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {isRtl ? 'جاهز' : 'Prêt'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={parsedImportStudents.filter(s => !s.isDuplicate).length === 0}
                onClick={handleConfirmBatchImport}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" />
                <span>
                  {isRtl 
                    ? `تأكيد استيراد (${parsedImportStudents.filter(s => !s.isDuplicate).length}) متعلم(ة)` 
                    : `Confirmer l'importation de (${parsedImportStudents.filter(s => !s.isDuplicate).length}) élève(s)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
