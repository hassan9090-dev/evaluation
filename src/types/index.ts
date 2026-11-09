export type Role = 'home' | 'teacher' | 'student';
export type Language = 'fr' | 'ar';

export type SubjectId = string;

export interface Subject {
  id: string;
  nameFr: string;
  nameAr: string;
  code: string;
  icon?: string;
  isDefault?: boolean;
}

export type EvaluationType = 'diagnostic' | 'formatif' | 'sommatif';

export type QuestionType = 
  | 'qcm' 
  | 'vrai_faux' 
  | 'fill_blanks' 
  | 'drag_drop_text'
  | 'ordering' 
  | 'matching' 
  | 'categorization'
  | 'odd_one_out' 
  | 'short_answer' 
  | 'production_ecrite' 
  | 'problem_solving';

export type Difficulty = 'facile' | 'moyen' | 'difficile';

export type MasteryLevel = 1 | 2 | 3 | 4;
// 1: Non maîtrisé (< 50%)
// 2: En cours d'acquisition (50% - 74%)
// 3: Maîtrisé (75% - 89%)
// 4: Très bien maîtrisé (>= 90%)

export interface Skill {
  id: string;
  code: string; // e.g., 'FR-01', 'MA-02'
  subjectId: SubjectId;
  nameFr: string;
  nameAr: string;
  domainFr: string;
  domainAr: string;
  descriptionFr: string;
  descriptionAr: string;
  targetLevel: string; // e.g., '4AEP'
}

export interface RubricCriterion {
  id: string;
  labelFr: string;
  labelAr: string;
  maxScore: number;
  descriptionFr?: string;
}

export interface QuestionOption {
  id: string;
  textFr: string;
  textAr?: string;
  isCorrect?: boolean;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface CategoryGroup {
  id: string;
  nameFr: string;
  nameAr: string;
  items: string[];
}

export interface OddOneOutItem {
  id: string;
  textFr: string;
  textAr?: string;
  isOdd: boolean;
}

export interface DragDropSlot {
  slotIndex: number;
  expectedWord: string;
}

export interface Question {
  id: string;
  skillId: string;
  subjectId: SubjectId;
  type: QuestionType;
  difficulty: Difficulty;
  titleFr: string;
  titleAr: string;
  promptFr: string;
  promptAr: string;
  maxScore: number;
  correctionMethod: 'auto' | 'manual' | 'hybrid';
  options?: QuestionOption[]; // for QCM
  correctBoolean?: boolean; // for vrai_faux
  correctAnswerText?: string; // for short answer / fill blank
  blanksTemplate?: string; // e.g. "Le chat [dort] sous [la table]."
  dragDropTemplate?: string; // Text containing placeholder tokens like "[1]", "[2]"
  dragDropSlots?: DragDropSlot[];
  dragDropWordBank?: string[]; // Word chips in bank (including distractors)
  orderingItems?: string[]; // for ordering
  matchingPairs?: MatchingPair[]; // for matching
  categories?: CategoryGroup[]; // for categorization
  oddOneOutItems?: OddOneOutItem[]; // for odd_one_out
  rubricCriteria?: RubricCriterion[]; // for production ecrite / problem solving
  explanationFr?: string;
  explanationAr?: string;
  mediaUrl?: string;
}

export interface Evaluation {
  id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  subjectId: SubjectId;
  type: EvaluationType;
  classId: string;
  questionIds: string[];
  totalScore: number;
  durationMinutes: number;
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  startDate?: string;
  endDate?: string;
  dateRealisation?: string; // Date de réalisation de l'évaluation
}

export interface StudentAnswer {
  questionId: string;
  studentResponse: any; // string, string[], boolean, array of pairs
  scoreObtained?: number;
  maxScore: number;
  isCorrect?: boolean;
  rubricScores?: Record<string, number>; // criterionId -> score
  teacherComment?: string;
}

export interface EvaluationAttempt {
  id: string;
  evaluationId: string;
  studentId: string;
  startedAt: string;
  submittedAt?: string;
  totalScore?: number;
  maxScore: number;
  percentage?: number;
  status: 'in_progress' | 'submitted' | 'corrected';
  answers: Record<string, StudentAnswer>;
  generalFeedback?: string;
}

export interface Student {
  id: string;
  studentCode: string; // Code Massar (e.g. 'G134001')
  displayPseudonym: string; // e.g. 'Élève G134001'
  classId: string;
  pin?: string;
  active: boolean;
  avatarIcon?: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g., '4ème Année A (4AEP)'
  schoolYear: string; // e.g., '2026-2027'
  institution: string; // e.g., 'École Primaire Al-Massira'
  teacherName: string;
}

export interface RemediationResource {
  id: string;
  skillId: string;
  subjectId: SubjectId;
  titleFr: string;
  titleAr: string;
  type: 'fiche' | 'exercice' | 'jeu' | 'video';
  objectiveFr: string;
  objectiveAr: string;
  contentFr: string;
  contentAr: string;
  difficulty: Difficulty;
  practiceQuestions?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface RemediationAssignment {
  id: string;
  studentId: string;
  resourceId: string;
  skillId: string;
  assignedAt: string;
  status: 'pending' | 'completed';
  completedAt?: string;
  studentNotes?: string;
}

export interface LivePresence {
  studentId: string;
  studentCode: string;
  currentTestId?: string;
  currentQIndex?: number;
  totalQuestions?: number;
  status: 'online' | 'taking_test' | 'submitted';
  lastSeen: number;
}
