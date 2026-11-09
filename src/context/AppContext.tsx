import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Role, Language, SchoolClass, Student, Skill, Question, 
  Evaluation, EvaluationAttempt, RemediationResource, RemediationAssignment, MasteryLevel,
  LivePresence, Subject
} from '../types';
import { 
  initialClasses, initialStudents, initialSkills, initialQuestions, 
  initialEvaluations, generateInitialAttempts, initialRemediationResources, 
  initialRemediationAssignments 
} from '../data/mockInitialData';

export const initialSubjects: Subject[] = [
  { id: 'francais', nameFr: 'Français', nameAr: 'اللغة الفرنسية', code: 'FR', icon: 'book', isDefault: true },
  { id: 'mathematiques', nameFr: 'Mathématiques', nameAr: 'الرياضيات', code: 'MA', icon: 'calculator', isDefault: true },
];

export type TeacherTab = 
  | 'dashboard' 
  | 'classes' 
  | 'skills' 
  | 'questionBank' 
  | 'evaluations' 
  | 'correction' 
  | 'remediation' 
  | 'analytics';

export type StudentTab = 
  | 'home' 
  | 'tests' 
  | 'results' 
  | 'remediation';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  isRtl: boolean;
  activeTeacherTab: TeacherTab;
  setActiveTeacherTab: (tab: TeacherTab) => void;
  activeStudentTab: StudentTab;
  setActiveStudentTab: (tab: StudentTab) => void;
  currentStudent: Student | null;
  setCurrentStudent: (student: Student | null) => void;
  isTeacherAuthenticated: boolean;
  teacherPassword: string;
  teacherLogin: (password: string) => boolean;
  changeTeacherPassword: (newPassword: string) => boolean;
  resetTeacherPasswordToDefault: () => void;
  teacherLogout: () => void;
  studentLoginByMassar: (codeMassar: string, classId?: string) => { success: boolean; student?: Student; error?: string };
  studentLogout: () => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;

  // Real-Time Classroom Centralization
  serverConnected: boolean;
  lastSyncTime: string | null;
  activePresences: LivePresence[];
  syncNow: () => Promise<void>;
  sendStudentPresence: (data: Partial<LivePresence>) => void;

  // Data
  classes: SchoolClass[];
  students: Student[];
  subjects: Subject[];
  skills: Skill[];
  questions: Question[];
  evaluations: Evaluation[];
  attempts: EvaluationAttempt[];
  remediationResources: RemediationResource[];
  remediationAssignments: RemediationAssignment[];

  // Actions
  addQuestion: (q: Question) => void;
  updateQuestion: (q: Question) => void;
  deleteQuestion: (id: string) => void;
  addSubject: (subj: Omit<Subject, 'id'> & { id?: string }) => Subject;
  deleteSubject: (id: string) => { success: boolean; error?: string };
  addSkill: (skillData: Omit<Skill, 'id'>) => Skill;
  updateSkill: (id: string, updated: Partial<Skill>) => boolean;
  deleteSkill: (id: string) => boolean;
  addEvaluation: (ev: Evaluation) => void;
  updateEvaluation: (ev: Evaluation) => void;
  deleteEvaluation: (id: string) => void;
  addStudent: (s: Omit<Student, 'id'>) => void;
  updateStudent: (s: Student) => void;
  deleteStudent: (id: string) => void;
  addClass: (cls: Omit<SchoolClass, 'id'>) => SchoolClass;
  updateClass: (cls: SchoolClass) => void;
  deleteClass: (id: string) => boolean;
  submitAttempt: (attempt: EvaluationAttempt) => void;
  saveGrading: (attemptId: string, updatedAnswers: Record<string, any>, generalFeedback?: string) => void;
  assignRemediation: (studentId: string, resourceId: string, skillId: string) => void;
  completeRemediation: (assignmentId: string, notes?: string) => void;
  resetToDefaults: () => void;

  // Analytics Helpers
  getSkillById: (id: string) => Skill | undefined;
  getQuestionById: (id: string) => Question | undefined;
  getEvaluationById: (id: string) => Evaluation | undefined;
  getMasteryLevel: (percentage: number) => { level: MasteryLevel; labelKey: string; color: string; badgeBg: string };
  calculateSkillMasteryForClass: (skillId: string, classId?: string) => {
    percentage: number;
    totalObtained: number;
    totalMax: number;
    testedCount: number;
    level: MasteryLevel;
  };
  calculateStudentMastery: (studentId: string, skillId: string) => {
    percentage: number;
    level: MasteryLevel;
    testsCount: number;
  };
  calculateClassOverview: (classId: string) => {
    studentCount: number;
    evaluationsCount: number;
    participationRate: number;
    averageScorePct: number;
    levelDistribution: Record<MasteryLevel, number>;
    criticalSkills: { skill: Skill; masteryPct: number; studentsNeedingHelp: number }[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'eval_progress_v2_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'student' || params.get('massar') || params.get('code')) {
        return 'student';
      }
      if (urlRole === 'teacher') return 'teacher';
      if (urlRole === 'home') return 'home';
    } catch {
      // ignore in SSR or test
    }
    // Par défaut en premier toujours mettre la page accueil
    return 'home';
  });

  const PRIMARY_TEACHER_PASSWORD = 'admin123';
  const LEGACY_TEACHER_PASSWORD = 'admin123';

  const [teacherPassword, setTeacherPassword] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'teacher_password');
    if (!saved || saved === 'PassProf@123' || saved === 'pass123') {
      return PRIMARY_TEACHER_PASSWORD;
    }
    return saved;
  });

  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEY_PREFIX + 'teacher_auth') === 'true';
  });

  const teacherLogout = () => {
    setIsTeacherAuthenticated(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY_PREFIX + 'teacher_auth');
    } catch {
      // ignore
    }
  };

  const setRole = (newRole: Role) => {
    // Si le professeur quitte son espace, il est automatiquement déconnecté et devra ressaisir son mot de passe
    if (role === 'teacher' && newRole !== 'teacher') {
      teacherLogout();
    }
    setRoleState(newRole);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'role', newRole);
    } catch {
      // ignore
    }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_PREFIX + 'sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEY_PREFIX + 'lang') as Language) || 'fr';
  });

  const isRtl = lang === 'ar';

  const [activeTeacherTab, setActiveTeacherTab] = useState<TeacherTab>('dashboard');
  const [activeStudentTab, setActiveStudentTab] = useState<StudentTab>('home');
  const [selectedClassId, setSelectedClassId] = useState<string>('class-4aep-a');
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Core Data States
  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'classes');
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const teacherLogin = (password: string): boolean => {
    const clean = password.trim();
    if (clean === teacherPassword || clean === PRIMARY_TEACHER_PASSWORD || clean === LEGACY_TEACHER_PASSWORD) {
      setIsTeacherAuthenticated(true);
      sessionStorage.setItem(STORAGE_KEY_PREFIX + 'teacher_auth', 'true');
      return true;
    }
    return false;
  };

  const changeTeacherPassword = (newPassword: string): boolean => {
    if (!newPassword || newPassword.trim().length < 4) return false;
    const clean = newPassword.trim();
    setTeacherPassword(clean);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'teacher_password', clean);
    return true;
  };

  const resetTeacherPasswordToDefault = () => {
    setTeacherPassword(PRIMARY_TEACHER_PASSWORD);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'teacher_password', PRIMARY_TEACHER_PASSWORD);
  };

  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlMassar = params.get('massar') || params.get('code');
      if (urlMassar) {
        const clean = urlMassar.trim().toLowerCase();
        const found = initialStudents.find(s => s.studentCode.toLowerCase() === clean);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    // L'accès à la page élève oblige le choix de la classe et le code massar élève
    return null;
  });

  const studentLoginByMassar = (codeMassar: string, classId?: string): { success: boolean; student?: Student; error?: string } => {
    if (!classId) {
      return { 
        success: false, 
        error: isRtl ? 'يرجى تحديد القسم أولاً للمتابعة.' : 'Veuillez sélectionner votre classe d\'abord.' 
      };
    }

    if (!codeMassar || !codeMassar.trim()) {
      return { 
        success: false, 
        error: isRtl ? 'يرجى إدخال رمز مسار الخاص بك.' : 'Veuillez saisir votre Code Massar.' 
      };
    }

    const clean = codeMassar.trim().toLowerCase();
    const found = students.find(s => s.studentCode.toLowerCase() === clean);
    if (!found) {
      return { 
        success: false, 
        error: isRtl ? `رمز مسار "${codeMassar}" غير موجود.` : `Le Code Massar "${codeMassar}" est introuvable.` 
      };
    }

    if (found.classId !== classId) {
      const targetClass = classes.find(c => c.id === found.classId);
      const targetClassName = targetClass ? targetClass.name : found.classId;
      return { 
        success: false, 
        error: isRtl 
          ? `رمز مسار هذا مسجل في (${targetClassName}) وليس في القسم المحدد.` 
          : `Ce Code Massar appartient à (${targetClassName}) et non à la classe sélectionnée.` 
      };
    }

    setCurrentStudent(found);
    setSelectedClassId(classId);
    try {
      sessionStorage.setItem(STORAGE_KEY_PREFIX + 'current_student_code', found.studentCode);
    } catch {
      // ignore
    }
    return { success: true, student: found };
  };

  const studentLogout = () => {
    setCurrentStudent(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY_PREFIX + 'current_student_code');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'current_student_code');
    } catch {
      // ignore
    }
  };

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'subjects');
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [skills, setSkills] = useState<Skill[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'skills');
    return saved ? JSON.parse(saved) : initialSkills;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'questions');
    return saved ? JSON.parse(saved) : initialQuestions;
  });

  const normalizeEvaluationTo10 = (ev: Evaluation): Evaluation => ({
    ...ev,
    totalScore: 10,
  });

  const normalizeAttemptTo10 = (att: EvaluationAttempt): EvaluationAttempt => {
    if (att.maxScore === 10) return att;
    const oldMax = att.maxScore > 0 ? att.maxScore : 10;
    const normalizedTotal = att.totalScore !== undefined
      ? Math.min(10, Math.round((att.totalScore / oldMax) * 10 * 10) / 10)
      : undefined;
    const pct = att.percentage !== undefined
      ? att.percentage
      : (normalizedTotal !== undefined ? Math.round(normalizedTotal * 10) : undefined);
    return {
      ...att,
      maxScore: 10,
      totalScore: normalizedTotal,
      percentage: pct,
    };
  };

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'evaluations');
    const list: Evaluation[] = saved ? JSON.parse(saved) : initialEvaluations;
    return list.map(normalizeEvaluationTo10);
  });

  const [attempts, setAttempts] = useState<EvaluationAttempt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'attempts');
    const list: EvaluationAttempt[] = saved ? JSON.parse(saved) : generateInitialAttempts();
    return list.map(normalizeAttemptTo10);
  });

  const [remediationResources, setRemediationResources] = useState<RemediationResource[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'rem_res');
    return saved ? JSON.parse(saved) : initialRemediationResources;
  });

  const [remediationAssignments, setRemediationAssignments] = useState<RemediationAssignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'rem_asg');
    return saved ? JSON.parse(saved) : initialRemediationAssignments;
  });

  // Central Server Synchronization States
  const [serverConnected, setServerConnected] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [activePresences, setActivePresences] = useState<LivePresence[]>([]);

  // 1. Synchronize attempts with PC Prof
  const syncNow = useCallback(async () => {
    try {
      const res = await fetch('/api/attempts');
      if (res.ok) {
        const serverAttempts: EvaluationAttempt[] = await res.json();
        setServerConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString());

        if (Array.isArray(serverAttempts) && serverAttempts.length > 0) {
          setAttempts(prev => {
            const mergedMap = new Map<string, EvaluationAttempt>();
            prev.forEach(a => mergedMap.set(a.id, normalizeAttemptTo10(a)));
            serverAttempts.forEach(sa => mergedMap.set(sa.id, normalizeAttemptTo10(sa)));
            return Array.from(mergedMap.values());
          });
        }
      } else {
        setServerConnected(false);
      }
    } catch {
      setServerConnected(false);
    }
  }, []);

  // Poll central server every 3.5 seconds
  useEffect(() => {
    syncNow();
    const interval = setInterval(syncNow, 3500);
    return () => clearInterval(interval);
  }, [syncNow]);

  // Poll live student presence if teacher
  useEffect(() => {
    if (role !== 'teacher') return;
    const fetchPresence = async () => {
      try {
        const res = await fetch('/api/presence');
        if (res.ok) {
          const presences = await res.json();
          if (Array.isArray(presences)) {
            setActivePresences(presences);
          }
        }
      } catch {
        // ignore
      }
    };

    fetchPresence();
    const pInterval = setInterval(fetchPresence, 3000);
    return () => clearInterval(pInterval);
  }, [role]);

  // Heartbeat sender from student tablet
  const sendStudentPresence = useCallback(async (data: Partial<LivePresence>) => {
    if (!currentStudent) return;
    try {
      await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentStudent.id,
          studentCode: currentStudent.studentCode,
          ...data,
        }),
      });
    } catch {
      // ignore
    }
  }, [currentStudent]);

  // Listen to scanned QR code URL params (?role=student&massar=CODE)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      const urlMassar = params.get('massar') || params.get('code');
      if (urlRole === 'student' || urlMassar) {
        setRole('student');
        if (urlMassar) {
          const clean = urlMassar.trim().toLowerCase();
          const found = students.find(s => s.studentCode.toLowerCase() === clean);
          if (found) {
            setCurrentStudent(found);
            localStorage.setItem(STORAGE_KEY_PREFIX + 'current_student_code', found.studentCode);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [students]);

  // LocalStorage Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'lang', lang);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'skills', JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'attempts', JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'rem_res', JSON.stringify(remediationResources));
  }, [remediationResources]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'rem_asg', JSON.stringify(remediationAssignments));
  }, [remediationAssignments]);

  // Helpers
  const getSkillById = (id: string) => skills.find(s => s.id === id);
  const getQuestionById = (id: string) => questions.find(q => q.id === id);
  const getEvaluationById = (id: string) => evaluations.find(e => e.id === id);

  const getMasteryLevel = (percentage: number) => {
    if (percentage >= 90) {
      return { 
        level: 4 as MasteryLevel, 
        labelKey: 'level4', 
        color: 'text-indigo-700 dark:text-indigo-400', 
        badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700' 
      };
    }
    if (percentage >= 75) {
      return { 
        level: 3 as MasteryLevel, 
        labelKey: 'level3', 
        color: 'text-emerald-700 dark:text-emerald-400', 
        badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700' 
      };
    }
    if (percentage >= 50) {
      return { 
        level: 2 as MasteryLevel, 
        labelKey: 'level2', 
        color: 'text-amber-700 dark:text-amber-400', 
        badgeBg: 'bg-amber-50 border-amber-200 text-amber-700' 
      };
    }
    return { 
      level: 1 as MasteryLevel, 
      labelKey: 'level1', 
      color: 'text-rose-700 dark:text-rose-400', 
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-700' 
    };
  };

  const calculateSkillMasteryForClass = (skillId: string, classId?: string) => {
    const targetClassId = classId || selectedClassId;
    const classStudentIds = new Set(
      students.filter(s => s.classId === targetClassId).map(s => s.id)
    );

    let totalObtained = 0;
    let totalMax = 0;
    let testedCount = 0;

    attempts.forEach(att => {
      if (!classStudentIds.has(att.studentId)) return;
      if (att.status !== 'corrected') return;

      Object.values(att.answers).forEach(ans => {
        const q = getQuestionById(ans.questionId);
        if (q && q.skillId === skillId) {
          if (ans.scoreObtained !== undefined) {
            totalObtained += ans.scoreObtained;
            totalMax += ans.maxScore;
            testedCount++;
          }
        }
      });
    });

    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const { level } = getMasteryLevel(percentage);

    return {
      percentage,
      totalObtained,
      totalMax,
      testedCount,
      level,
    };
  };

  const calculateStudentMastery = (studentId: string, skillId: string) => {
    let totalObtained = 0;
    let totalMax = 0;
    let testsCount = 0;

    attempts.forEach(att => {
      if (att.studentId !== studentId) return;
      if (att.status !== 'corrected') return;

      Object.values(att.answers).forEach(ans => {
        const q = getQuestionById(ans.questionId);
        if (q && q.skillId === skillId) {
          if (ans.scoreObtained !== undefined) {
            totalObtained += ans.scoreObtained;
            totalMax += ans.maxScore;
            testsCount++;
          }
        }
      });
    });

    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const { level } = getMasteryLevel(percentage);

    return {
      percentage,
      level,
      testsCount,
    };
  };

  const calculateClassOverview = (classId: string) => {
    const classStudents = students.filter(s => s.classId === classId);
    const studentCount = classStudents.length;
    const classEvals = evaluations.filter(e => e.classId === classId);
    const evaluationsCount = classEvals.length;

    const studentIds = new Set(classStudents.map(s => s.id));
    const classAttempts = attempts.filter(a => studentIds.has(a.studentId) && a.status === 'corrected');

    const totalPossibleAttempts = Math.max(1, studentCount * classEvals.filter(e => e.status !== 'draft').length);
    const participationRate = Math.min(100, Math.round((classAttempts.length / totalPossibleAttempts) * 100));

    const avgScorePct = classAttempts.length > 0
      ? Math.round(classAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / classAttempts.length)
      : 0;

    const levelDistribution: Record<MasteryLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    classAttempts.forEach(att => {
      if (att.percentage !== undefined) {
        const { level } = getMasteryLevel(att.percentage);
        levelDistribution[level] = (levelDistribution[level] || 0) + 1;
      }
    });

    // Identify critical skills
    const criticalSkills: { skill: Skill; masteryPct: number; studentsNeedingHelp: number }[] = [];
    skills.forEach(skill => {
      const stats = calculateSkillMasteryForClass(skill.id, classId);
      if (stats.testedCount > 0 && stats.percentage < 70) {
        let studentsStruggling = 0;
        classStudents.forEach(st => {
          const stMastery = calculateStudentMastery(st.id, skill.id);
          if (stMastery.testsCount > 0 && stMastery.percentage < 60) {
            studentsStruggling++;
          }
        });
        criticalSkills.push({
          skill,
          masteryPct: stats.percentage,
          studentsNeedingHelp: studentsStruggling,
        });
      }
    });

    criticalSkills.sort((a, b) => a.masteryPct - b.masteryPct);

    return {
      studentCount,
      evaluationsCount,
      participationRate,
      averageScorePct: avgScorePct,
      levelDistribution,
      criticalSkills: criticalSkills.slice(0, 4),
    };
  };

  // State Mutators
  const addQuestion = (q: Question) => {
    setQuestions(prev => [q, ...prev]);
  };

  const updateQuestion = (q: Question) => {
    setQuestions(prev => prev.map(item => item.id === q.id ? q : item));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const addEvaluation = (ev: Evaluation) => {
    setEvaluations(prev => [ev, ...prev]);
  };

  const updateEvaluation = (ev: Evaluation) => {
    setEvaluations(prev => prev.map(item => item.id === ev.id ? ev : item));
  };

  const deleteEvaluation = (id: string) => {
    setEvaluations(prev => prev.filter(item => item.id !== id));
  };

  const addStudent = (s: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...s,
      id: `std-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6)}`
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (s: Student) => {
    setStudents(prev => prev.map(st => st.id === s.id ? s : st));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(st => st.id !== id));
    if (currentStudent?.id === id) {
      setCurrentStudent(null);
    }
  };

  const addClass = (clsData: Omit<SchoolClass, 'id'>): SchoolClass => {
    const newClass: SchoolClass = {
      ...clsData,
      id: `class-${Date.now().toString().slice(-6)}`
    };
    setClasses(prev => [...prev, newClass]);
    setSelectedClassId(newClass.id);
    return newClass;
  };

  const updateClass = (cls: SchoolClass) => {
    setClasses(prev => prev.map(c => c.id === cls.id ? cls : c));
  };

  const deleteClass = (id: string): boolean => {
    if (classes.length <= 1) return false;
    setClasses(prev => prev.filter(c => c.id !== id));
    if (selectedClassId === id) {
      const remaining = classes.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setSelectedClassId(remaining[0].id);
      }
    }
    return true;
  };

  const submitAttempt = (attempt: EvaluationAttempt) => {
    // Automatically grade any objective questions
    const ev = getEvaluationById(attempt.evaluationId);
    let autoTotal = 0;
    let hasManualQuestions = false;

    const scoredAnswers: Record<string, any> = { ...attempt.answers };

    Object.keys(scoredAnswers).forEach(qId => {
      const q = getQuestionById(qId);
      if (!q) return;

      const ans = scoredAnswers[qId];
      if (q.type === 'qcm') {
        const correctOpt = q.options?.find(o => o.isCorrect);
        const isOk = correctOpt && ans.studentResponse === correctOpt.id;
        ans.isCorrect = !!isOk;
        ans.scoreObtained = isOk ? q.maxScore : 0;
        autoTotal += ans.scoreObtained;
      } else if (q.type === 'vrai_faux') {
        const isOk = ans.studentResponse === q.correctBoolean;
        ans.isCorrect = !!isOk;
        ans.scoreObtained = isOk ? q.maxScore : 0;
        autoTotal += ans.scoreObtained;
      } else if (q.type === 'fill_blanks' || q.type === 'short_answer') {
        const cleanStudent = (ans.studentResponse || '').toString().trim().toLowerCase();
        const cleanExpected = (q.correctAnswerText || '').trim().toLowerCase();
        const isOk = cleanStudent === cleanExpected;
        ans.isCorrect = isOk;
        ans.scoreObtained = isOk ? q.maxScore : 0;
        autoTotal += ans.scoreObtained;
      } else if (q.type === 'ordering') {
        const studentArr = Array.isArray(ans.studentResponse) ? ans.studentResponse : [];
        const expected = q.orderingItems || [];
        const isExact = studentArr.length === expected.length && studentArr.every((item: string, i: number) => item === expected[i]);
        ans.isCorrect = isExact;
        ans.scoreObtained = isExact ? q.maxScore : 0;
        autoTotal += ans.scoreObtained;
      } else if (q.type === 'matching') {
        const studentPairs = ans.studentResponse || {};
        const pairs = q.matchingPairs || [];
        let correctCount = 0;
        pairs.forEach(p => {
          if (studentPairs[p.left] === p.right) correctCount++;
        });
        const isAllCorrect = pairs.length > 0 && correctCount === pairs.length;
        ans.isCorrect = isAllCorrect;
        const partialScore = pairs.length > 0 ? Math.round((correctCount / pairs.length) * q.maxScore * 10) / 10 : 0;
        ans.scoreObtained = partialScore;
        autoTotal += ans.scoreObtained;
      } else if (q.type === 'categorization') {
        const studentBins = ans.studentResponse || {};
        const cats = q.categories || [];
        let totalItems = 0;
        let correctItems = 0;
        cats.forEach(c => {
          totalItems += c.items.length;
          const placed = studentBins[c.id] || [];
          c.items.forEach(it => {
            if (placed.includes(it)) correctItems++;
          });
        });
        const isAllCorrect = totalItems > 0 && correctItems === totalItems;
        ans.isCorrect = isAllCorrect;
        const partialScore = totalItems > 0 ? Math.round((correctItems / totalItems) * q.maxScore * 10) / 10 : 0;
        ans.scoreObtained = partialScore;
        autoTotal += ans.scoreObtained;
      } else if (q.type === 'drag_drop_text') {
        const studentSlots = ans.studentResponse || {}; // { [slotIndex]: word }
        const slots = q.dragDropSlots || [];
        let correctCount = 0;
        slots.forEach(s => {
          const studentWord = (studentSlots[s.slotIndex] || '').toString().trim().toLowerCase();
          const expected = s.expectedWord.trim().toLowerCase();
          if (studentWord === expected) {
            correctCount++;
          }
        });
        const isAllCorrect = slots.length > 0 && correctCount === slots.length;
        ans.isCorrect = isAllCorrect;
        const partialScore = slots.length > 0 ? Math.round((correctCount / slots.length) * q.maxScore * 10) / 10 : 0;
        ans.scoreObtained = partialScore;
        autoTotal += ans.scoreObtained;
      } else if (q.type === 'odd_one_out') {
        const chosenId = ans.studentResponse;
        const oddItem = q.oddOneOutItems?.find(i => i.isOdd);
        const isOk = oddItem && chosenId === oddItem.id;
        ans.isCorrect = !!isOk;
        ans.scoreObtained = isOk ? q.maxScore : 0;
        autoTotal += ans.scoreObtained;
      } else {
        hasManualQuestions = true;
      }
    });

    const isAllAuto = !hasManualQuestions;
    const rawQuestionsMax = ev
      ? ev.questionIds.reduce((sum, qId) => {
          const q = getQuestionById(qId);
          return sum + (q ? q.maxScore : 0);
        }, 0)
      : Object.values(scoredAnswers).reduce((sum: number, ans: any) => sum + Number(ans.maxScore || 1), 0);

    const effectiveRawMax = rawQuestionsMax > 0 ? rawQuestionsMax : 10;
    const noteSur10 = isAllAuto
      ? Math.min(10, Math.round((autoTotal / effectiveRawMax) * 10 * 10) / 10)
      : undefined;
    const percentage = isAllAuto
      ? Math.min(100, Math.round((autoTotal / effectiveRawMax) * 100))
      : undefined;

    const completedAttempt: EvaluationAttempt = {
      ...attempt,
      maxScore: 10,
      status: isAllAuto ? 'corrected' : 'submitted',
      totalScore: noteSur10,
      percentage,
      answers: scoredAnswers,
      submittedAt: new Date().toISOString(),
    };

    setAttempts(prev => {
      const idx = prev.findIndex(a => a.id === completedAttempt.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = completedAttempt;
        return copy;
      }
      return [completedAttempt, ...prev];
    });

    // Centralize directly to the Teacher's PC!
    fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completedAttempt),
    })
      .then(res => {
        if (res.ok) {
          setServerConnected(true);
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      })
      .catch(err => {
        console.warn('Network issue reaching teacher server, stored locally:', err);
      });
  };

  const saveGrading = (attemptId: string, updatedAnswers: Record<string, any>, generalFeedback?: string) => {
    let updatedAttemptToSync: EvaluationAttempt | null = null;

    setAttempts(prev => prev.map(att => {
      if (att.id !== attemptId) return att;

      let rawTotal = 0;
      let rawMax = 0;
      Object.values(updatedAnswers).forEach((ans: any) => {
        if (ans.scoreObtained !== undefined) {
          rawTotal += Number(ans.scoreObtained);
        }
        const q = getQuestionById(ans.questionId);
        rawMax += Number(ans.maxScore || q?.maxScore || 0);
      });

      if (rawMax <= 0) {
        const ev = getEvaluationById(att.evaluationId);
        rawMax = ev
          ? ev.questionIds.reduce((sum, qId) => {
              const q = getQuestionById(qId);
              return sum + (q ? q.maxScore : 0);
            }, 0)
          : 10;
      }

      const effectiveRawMax = rawMax > 0 ? rawMax : 10;
      const noteSur10 = Math.min(10, Math.round((rawTotal / effectiveRawMax) * 10 * 10) / 10);
      const percentage = Math.min(100, Math.round((rawTotal / effectiveRawMax) * 100));

      const updated = {
        ...att,
        status: 'corrected' as const,
        answers: updatedAnswers,
        maxScore: 10,
        totalScore: noteSur10,
        percentage,
        generalFeedback: generalFeedback ?? att.generalFeedback,
      };

      updatedAttemptToSync = updated;
      return updated;
    }));

    if (updatedAttemptToSync) {
      fetch(`/api/attempts/${attemptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAttemptToSync),
      })
        .then(res => {
          if (res.ok) {
            setServerConnected(true);
            setLastSyncTime(new Date().toLocaleTimeString());
          }
        })
        .catch(err => console.warn('Could not sync grading with server:', err));
    }
  };

  const assignRemediation = (studentId: string, resourceId: string, skillId: string) => {
    const newAsg: RemediationAssignment = {
      id: `asg-${Date.now()}`,
      studentId,
      resourceId,
      skillId,
      assignedAt: new Date().toISOString(),
      status: 'pending',
    };
    setRemediationAssignments(prev => [newAsg, ...prev]);
  };

  const completeRemediation = (assignmentId: string, notes?: string) => {
    setRemediationAssignments(prev => prev.map(asg => {
      if (asg.id !== assignmentId) return asg;
      return {
        ...asg,
        status: 'completed',
        completedAt: new Date().toISOString(),
        studentNotes: notes || asg.studentNotes,
      };
    }));
  };

  const addSkill = (skillData: Omit<Skill, 'id'>): Skill => {
    const newSkill: Skill = {
      ...skillData,
      id: `skill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setSkills(prev => [newSkill, ...prev]);
    return newSkill;
  };

  const updateSkill = (id: string, updatedData: Partial<Skill>): boolean => {
    let found = false;
    setSkills(prev => prev.map(s => {
      if (s.id === id) {
        found = true;
        return { ...s, ...updatedData };
      }
      return s;
    }));
    return found;
  };

  const deleteSkill = (id: string): boolean => {
    let found = false;
    setSkills(prev => {
      const filtered = prev.filter(s => {
        if (s.id === id) {
          found = true;
          return false;
        }
        return true;
      });
      return filtered;
    });
    return found;
  };

  const addSubject = (subj: Omit<Subject, 'id'> & { id?: string }): Subject => {
    const rawId = subj.id || subj.nameFr.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    const safeBaseId = rawId || `subj_${Date.now().toString(36)}`;

    let finalId = safeBaseId;
    let count = 1;
    while (subjects.some(s => s.id === finalId)) {
      finalId = `${safeBaseId}_${count++}`;
    }

    const newSubj: Subject = {
      ...subj,
      id: finalId,
      code: (subj.code || finalId.slice(0, 3)).toUpperCase(),
    };

    setSubjects(prev => [...prev, newSubj]);
    return newSubj;
  };

  const deleteSubject = (id: string): { success: boolean; error?: string } => {
    if (subjects.length <= 1) {
      return {
        success: false,
        error: isRtl 
          ? 'لا يمكن حذف المادة الدراسية الوحيدة المتبقية في المنصة.' 
          : 'Impossible de supprimer la seule matière restante dans le référentiel.'
      };
    }

    // Cascade: remove skills associated with this subject
    setSkills(prev => prev.filter(s => s.subjectId !== id));

    // Remove subject
    setSubjects(prev => prev.filter(s => s.id !== id));
    return { success: true };
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setClasses(initialClasses);
    setStudents(initialStudents);
    setSubjects(initialSubjects);
    setSkills(initialSkills);
    setQuestions(initialQuestions);
    setEvaluations(initialEvaluations);
    setAttempts(generateInitialAttempts());
    setRemediationResources(initialRemediationResources);
    setRemediationAssignments(initialRemediationAssignments);
    setCurrentStudent(null);
    setRole('home');
    setActiveTeacherTab('dashboard');
    setActiveStudentTab('home');

    fetch('/api/reset', { method: 'POST' }).catch(() => {});
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        lang,
        setLang,
        isRtl,
        activeTeacherTab,
        setActiveTeacherTab,
        activeStudentTab,
        setActiveStudentTab,
        currentStudent,
        setCurrentStudent,
        isTeacherAuthenticated,
        teacherPassword,
        teacherLogin,
        changeTeacherPassword,
        resetTeacherPasswordToDefault,
        teacherLogout,
        studentLoginByMassar,
        studentLogout,
        selectedClassId,
        setSelectedClassId,
        isOffline,
        setIsOffline,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        serverConnected,
        lastSyncTime,
        activePresences,
        syncNow,
        sendStudentPresence,
        classes,
        students,
        subjects,
        skills,
        questions,
        evaluations,
        attempts,
        remediationResources,
        remediationAssignments,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addSubject,
        deleteSubject,
        addSkill,
        updateSkill,
        deleteSkill,
        addEvaluation,
        updateEvaluation,
        deleteEvaluation,
        addStudent,
        updateStudent,
        deleteStudent,
        addClass,
        updateClass,
        deleteClass,
        submitAttempt,
        saveGrading,
        assignRemediation,
        completeRemediation,
        resetToDefaults,
        getSkillById,
        getQuestionById,
        getEvaluationById,
        getMasteryLevel,
        calculateSkillMasteryForClass,
        calculateStudentMastery,
        calculateClassOverview,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
