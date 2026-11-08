import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { Evaluation, EvaluationAttempt, Question } from '../../types';
import confetti from 'canvas-confetti';
import { 
  Sparkles, BookOpen, Award, CheckCircle2, Clock, 
  ArrowRight, ArrowLeft, Send, Check, Star, ShieldCheck, 
  HelpCircle, ChevronRight, AlertCircle, HeartHandshake, Smile,
  ArrowUp, ArrowDown, Shuffle, Link2, FolderPlus, Eye, SearchCheck, LogOut, RotateCcw
} from 'lucide-react';
import { StudentMassarLogin } from './StudentMassarLogin';

export const StudentPortal: React.FC = () => {
  const { 
    lang, isRtl, currentStudent, evaluations, attempts, 
    questions, skills, remediationAssignments, remediationResources, 
    submitAttempt, completeRemediation, activeStudentTab, setActiveStudentTab,
    studentLogout, sendStudentPresence
  } = useApp();

  const t = translations[lang];

  // Active Test-Taking State
  const [activeTest, setActiveTest] = useState<Evaluation | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answersDraft, setAnswersDraft] = useState<Record<string, any>>({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [testFinishedFeedback, setTestFinishedFeedback] = useState<string | null>(null);

  // Active Countdown Timer State
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isTimeUpModal, setIsTimeUpModal] = useState<boolean>(false);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number>(5);
  const [dismissTimeWarning, setDismissTimeWarning] = useState<boolean>(false);

  // Active Remediation Activity State
  const [activeRemediation, setActiveRemediation] = useState<any | null>(null);
  const [remQuizAnswer, setRemQuizAnswer] = useState<number | null>(null);
  const [remQuizFeedback, setRemQuizFeedback] = useState<string | null>(null);
  const [selectedWordForPlacement, setSelectedWordForPlacement] = useState<string | null>(null);

  // Student's completed & pending attempts
  const studentAttempts = currentStudent ? attempts.filter(a => a.studentId === currentStudent.id) : [];
  const studentAssignments = currentStudent ? remediationAssignments.filter(a => a.studentId === currentStudent.id) : [];

  // Active tests available to take - always show all active evaluations!
  const availableEvaluations = evaluations.filter(ev => ev.status === 'active');

  // Start an evaluation
  const handleStartTest = (ev: Evaluation) => {
    setActiveTest(ev);
    setCurrentQuestionIndex(0);
    setSelectedWordForPlacement(null);

    // Load any existing draft or initialize blank answers
    const existingAttempt = studentAttempts.find(a => a.evaluationId === ev.id);
    if (existingAttempt) {
      setAnswersDraft(JSON.parse(JSON.stringify(existingAttempt.answers)));
    } else {
      const initial: Record<string, any> = {};
      ev.questionIds.forEach(qId => {
        const q = questions.find(item => item.id === qId);
        let defaultResp: any = '';
        if (q?.type === 'vrai_faux') defaultResp = true;
        else if (q?.type === 'ordering') {
          // Initialize with shuffled items so student reorders them
          defaultResp = [...(q.orderingItems || [])].reverse();
        } else if (q?.type === 'matching') {
          defaultResp = {};
        } else if (q?.type === 'categorization') {
          defaultResp = {};
        } else if (q?.type === 'odd_one_out') {
          defaultResp = '';
        } else if (q?.type === 'drag_drop_text') {
          defaultResp = {};
        }

        initial[qId] = {
          questionId: qId,
          studentResponse: defaultResp,
          maxScore: q?.maxScore || 1,
        };
      });
      setAnswersDraft(initial);
    }
  };

  // Submit test
  const handleFinalSubmit = () => {
    if (!activeTest || !currentStudent) return;

    const newAttempt: EvaluationAttempt = {
      id: `att-${Date.now().toString().slice(-6)}`,
      evaluationId: activeTest.id,
      studentId: currentStudent.id,
      startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      maxScore: activeTest.totalScore,
      status: 'submitted',
      answers: answersDraft,
    };

    submitAttempt(newAttempt);
    setShowSubmitConfirm(false);
    setActiveTest(null);

    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTestFinishedFeedback(
      isRtl
        ? 'أحسنت يا بطل! تم إرسال إجاباتك بنجاح إلى الأستاذ للمراجعة والتصحيح.'
        : 'Bravo ! Tes réponses ont été transmises avec succès à ton enseignant pour correction.'
    );
  };

  // Live Timer Countdown Effect
  useEffect(() => {
    if (!activeTest) {
      setTimeLeftSeconds(0);
      setIsTimeUpModal(false);
      setDismissTimeWarning(false);
      return;
    }

    const durationMin = activeTest.durationMinutes || 30;
    const initialSec = durationMin * 60;
    setTimeLeftSeconds(initialSec);
    setIsTimeUpModal(false);
    setAutoSubmitCountdown(5);
    setDismissTimeWarning(false);

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUpModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTest?.id]);

  // Auto-submit countdown when time is up
  useEffect(() => {
    if (!isTimeUpModal || !activeTest) return;

    if (autoSubmitCountdown <= 0) {
      handleFinalSubmit();
      return;
    }

    const autoTimer = setInterval(() => {
      setAutoSubmitCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(autoTimer);
  }, [isTimeUpModal, autoSubmitCountdown, activeTest]);

  // Live Presence heartbeat to Teacher PC
  useEffect(() => {
    if (!currentStudent) return;
    sendStudentPresence({
      currentTestId: activeTest?.id,
      currentQIndex: activeTest ? currentQuestionIndex + 1 : 0,
      totalQuestions: activeTest ? activeTest.questionIds.length : 0,
      status: activeTest ? 'taking_test' : 'online',
    });

    const pInterval = setInterval(() => {
      sendStudentPresence({
        currentTestId: activeTest?.id,
        currentQIndex: activeTest ? currentQuestionIndex + 1 : 0,
        totalQuestions: activeTest ? activeTest.questionIds.length : 0,
        status: activeTest ? 'taking_test' : 'online',
      });
    }, 4000);

    return () => clearInterval(pInterval);
  }, [currentStudent?.id, activeTest?.id, currentQuestionIndex, sendStudentPresence]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentStudent) {
    return <StudentMassarLogin />;
  }

  return (
    <div className="space-y-6">
      {/* Friendly Student Header Banner */}
      <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30">
            {currentStudent.avatarIcon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                {isRtl ? 'رمز مسار : ' : 'Code Massar : '}{currentStudent.studentCode}
              </span>
              <span className="text-xs text-blue-200">
                4ème Année Primaire (4AEP)
              </span>
              <button
                type="button"
                onClick={studentLogout}
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white border border-white/20 transition flex items-center gap-1 cursor-pointer"
                title={isRtl ? 'تغيير الحساب والدخول برمز مسار آخر' : 'Changer de Code Massar'}
              >
                <LogOut className="w-3 h-3" />
                <span>{t.student.switchStudent}</span>
              </button>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {t.student.welcome} {currentStudent.displayPseudonym} !
            </h2>
            <p className="text-blue-100 text-xs md:text-sm mt-0.5">
              {t.student.encouragement}
            </p>
          </div>
        </div>

        {/* Student Quick Tabs */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20">
          <button
            onClick={() => setActiveStudentTab('home')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeStudentTab === 'home' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.student.myEvaluations}</span>
          </button>
          <button
            onClick={() => setActiveStudentTab('results')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeStudentTab === 'results' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{t.student.myResults}</span>
          </button>
          <button
            onClick={() => setActiveStudentTab('remediation')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeStudentTab === 'remediation' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-rose-300" />
            <span>{t.student.myActivities}</span>
            {studentAssignments.filter(a => a.status === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Completion Alert Modal if just finished */}
      {testFinishedFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <p className="text-xs font-bold text-emerald-950">{testFinishedFeedback}</p>
          </div>
          <button
            onClick={() => setTestFinishedFeedback(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Fermer
          </button>
        </div>
      )}

      {/* ======================= TAB 1: MY EVALUATIONS ======================= */}
      {activeStudentTab === 'home' && !activeTest && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isRtl ? 'الاختبارات والتقويمات المتاحة لك الآن' : 'Évaluations prêtes pour toi'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl ? 'اختر اختباراً واقرأ الأسئلة بهدوء وتركيز' : 'Prends ton temps et lis bien chaque question.'}
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {availableEvaluations.length} {isRtl ? 'اختبار متاح' : 'session(s) active(s)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableEvaluations.map(ev => {
              const existingAttempt = studentAttempts.find(a => a.evaluationId === ev.id);
              const isCorrected = existingAttempt && existingAttempt.status === 'corrected';
              const isSubmitted = existingAttempt && existingAttempt.status === 'submitted';

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl p-6 border-2 border-slate-100 hover:border-blue-300 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          ev.subjectId === 'francais' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ev.subjectId === 'francais' ? 'Français' : 'Mathématiques'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {ev.type === 'diagnostic' ? (isRtl ? 'تشخيصي' : 'Diagnostique') : (isRtl ? 'تكويني' : 'Formatif')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{ev.durationMinutes} min</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 mb-2 leading-snug">
                      {isRtl ? ev.titleAr : ev.titleFr}
                    </h4>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-3">
                      {isRtl ? ev.descriptionAr : ev.descriptionFr}
                    </p>

                    {/* Attempt Status Banner if taken */}
                    {isCorrected && (
                      <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                        <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isRtl ? 'تم التصحيح :' : 'Corrigé :'}</span>
                        </span>
                        <span className="font-mono font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                          {existingAttempt.totalScore} / {existingAttempt.maxScore} pts ({existingAttempt.percentage}%)
                        </span>
                      </div>
                    )}

                    {isSubmitted && !isCorrected && (
                      <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800 font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{isRtl ? 'تم الإرسال (في انتظار تصحيح الأستاذ)' : 'Devoir envoyé (en attente de correction)'}</span>
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 mb-6">
                      <span>{ev.questionIds.length} {isRtl ? 'أسئلة' : 'questions'}</span>
                      <span className="text-blue-700">{ev.totalScore} {isRtl ? 'نقطة' : 'points'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartTest(ev)}
                    className={`w-full py-3 rounded-2xl text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 group cursor-pointer ${
                      isCorrected || isSubmitted
                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                    }`}
                  >
                    {isCorrected || isSubmitted ? (
                      <>
                        <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                        <span>{isRtl ? 'إعادة إنجاز الاختبار (للتدريب)' : 'Refaire l\'évaluation (Entraînement)'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isRtl ? 'بدء الاختبار الآن' : 'Commencer l\'évaluation'}</span>
                        <ArrowRight className={`w-4 h-4 transition-transform ${isRtl ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {availableEvaluations.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Smile className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">
                {isRtl ? 'رائع جداً! لا توجد اختبارات متبقية للإنجاز اليوم.' : 'Bravo ! Toutes les évaluations disponibles ont été complétées.'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {isRtl ? 'يمكنك مراجعة دفتر مكتسباتك أو إنجاز أنشطة الدعم المخصصة لك.' : 'Tu peux consulter ton carnet de compétences ou faire tes fiches de soutien.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================= ACTIVE TEST TAKING ENGINE ======================= */}
      {activeTest && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-blue-200 shadow-xl space-y-6">
          {/* Test Header with Live Countdown Timer */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                  {activeTest.subjectId}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {isRtl ? 'المستوى الرابع ابتدائي' : '4ème Année Primaire'}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{activeTest.durationMinutes} {isRtl ? 'دقيقة' : 'min'}</span>
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {isRtl ? activeTest.titleAr : activeTest.titleFr}
              </h3>
            </div>

            {/* Live Countdown Timer & Stepper */}
            <div className="flex items-center gap-3 self-end md:self-center">
              {/* Live Countdown Widget */}
              <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border-2 transition shadow-xs ${
                timeLeftSeconds <= 60 
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : timeLeftSeconds <= 300 
                  ? 'bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-400/20'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <div className={`p-1.5 rounded-xl ${
                  timeLeftSeconds <= 60 ? 'bg-rose-100 text-rose-600' :
                  timeLeftSeconds <= 300 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <Clock className={`w-4 h-4 ${timeLeftSeconds <= 60 ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block">
                    {t.student.timeRemaining}
                  </span>
                  <div className="font-mono text-base font-black tracking-wider leading-none mt-0.5">
                    {formatTime(timeLeftSeconds)}
                  </div>
                </div>
              </div>

              {/* Stepper indicator */}
              <div className="text-right px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Question</span>
                <span className="text-sm font-black text-blue-700">
                  {currentQuestionIndex + 1} / {activeTest.questionIds.length}
                </span>
              </div>
            </div>
          </div>

          {/* Dual Progress: Questions & Time Elapsed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>{isRtl ? 'تقدم الإجابة على الأسئلة' : 'Progression des questions'}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / activeTest.questionIds.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / activeTest.questionIds.length) * 100}%` }}
              />
            </div>

            {/* Time progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeftSeconds <= 60 ? 'bg-rose-500' :
                  timeLeftSeconds <= 300 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ 
                  width: `${Math.max(0, Math.min(100, (timeLeftSeconds / ((activeTest.durationMinutes || 30) * 60)) * 100))}%` 
                }}
              />
            </div>
          </div>

          {/* Warning Banner if <= 5 minutes */}
          {timeLeftSeconds <= 300 && timeLeftSeconds > 0 && !dismissTimeWarning && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t.student.timeNoticeWarning} ({formatTime(timeLeftSeconds)})</span>
              </div>
              <button
                type="button"
                onClick={() => setDismissTimeWarning(true)}
                className="p-1 hover:bg-amber-100 rounded-lg text-amber-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Question Viewer */}
          {(() => {
            const currentQId = activeTest.questionIds[currentQuestionIndex];
            const currentQ = questions.find(q => q.id === currentQId);
            if (!currentQ) return null;
            const currentAnswerObj = answersDraft[currentQId] || {};

            return (
              <div className="space-y-6">
                {/* Question Prompt Card */}
                <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                      {currentQ.skillId}
                    </span>
                    <span className="text-xs font-extrabold text-blue-800 bg-white px-3 py-1 rounded-full border border-blue-200">
                      {currentQ.maxScore} points
                    </span>
                  </div>

                  <h4 className="text-base md:text-lg font-bold text-slate-900 leading-relaxed">
                    {isRtl ? currentQ.promptAr : currentQ.promptFr}
                  </h4>
                </div>

                {/* Question Input Based on Type */}
                <div className="space-y-3">
                  {/* QCM */}
                  {currentQ.type === 'qcm' && currentQ.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQ.options.map(opt => {
                        const isSelected = currentAnswerObj.studentResponse === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setAnswersDraft(prev => ({
                                ...prev,
                                [currentQId]: {
                                  ...prev[currentQId],
                                  questionId: currentQId,
                                  studentResponse: opt.id,
                                }
                              }));
                            }}
                            className={`p-4 rounded-2xl border-2 text-left text-xs font-bold transition flex items-center justify-between ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <span>{opt.textFr}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Vrai / Faux */}
                  {currentQ.type === 'vrai_faux' && (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setAnswersDraft(prev => ({
                            ...prev,
                            [currentQId]: {
                              ...prev[currentQId],
                              questionId: currentQId,
                              studentResponse: true,
                            }
                          }));
                        }}
                        className={`p-5 rounded-2xl border-2 font-black text-sm transition text-center ${
                          currentAnswerObj.studentResponse === true
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        ✓ VRAI (صحيح)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAnswersDraft(prev => ({
                            ...prev,
                            [currentQId]: {
                              ...prev[currentQId],
                              questionId: currentQId,
                              studentResponse: false,
                            }
                          }));
                        }}
                        className={`p-5 rounded-2xl border-2 font-black text-sm transition text-center ${
                          currentAnswerObj.studentResponse === false
                            ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        ✗ FAUX (خطأ)
                      </button>
                    </div>
                  )}

                  {/* Short Answer / Fill Blanks */}
                  {(currentQ.type === 'fill_blanks' || currentQ.type === 'short_answer') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isRtl ? 'اكتب إجابتك هنا :' : 'Écris ta réponse ici :'}
                      </label>
                      <input
                        type="text"
                        placeholder="Ta réponse..."
                        value={currentAnswerObj.studentResponse || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAnswersDraft(prev => ({
                            ...prev,
                            [currentQId]: {
                              ...prev[currentQId],
                              questionId: currentQId,
                              studentResponse: val,
                            }
                          }));
                        }}
                        className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-base font-bold text-slate-900 bg-slate-50/50"
                      />
                    </div>
                  )}

                  {/* Drag & Drop Cloze Text (Texte à trous avec glisser-déposer / إتمام الفراغات بالسحب والإفلات) */}
                  {currentQ.type === 'drag_drop_text' && currentQ.dragDropTemplate && (() => {
                    const currentSlots: Record<number, string> = currentAnswerObj.studentResponse || {};
                    const wordBank = currentQ.dragDropWordBank || [];

                    const assignWordToSlot = (slotIdx: number, word: string) => {
                      setAnswersDraft(prev => ({
                        ...prev,
                        [currentQId]: {
                          ...prev[currentQId],
                          questionId: currentQId,
                          studentResponse: {
                            ...currentSlots,
                            [slotIdx]: word,
                          }
                        }
                      }));
                      setSelectedWordForPlacement(null);
                    };

                    const removeWordFromSlot = (slotIdx: number) => {
                      const updated = { ...currentSlots };
                      delete updated[slotIdx];
                      setAnswersDraft(prev => ({
                        ...prev,
                        [currentQId]: {
                          ...prev[currentQId],
                          questionId: currentQId,
                          studentResponse: updated,
                        }
                      }));
                    };

                    // Split template by [1], [2], etc.
                    const parts = currentQ.dragDropTemplate.split(/(\[\d+\])/g);

                    return (
                      <div className="space-y-5">
                        {/* Word Bank Bar with Drag / Click-to-place */}
                        <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-blue-900 flex items-center gap-1.5 uppercase tracking-wider">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              {isRtl ? 'بنك الكلمات (اسحب الكلمة أو اضغط عليها لتحديدها) :' : 'Banque de mots (Glisse un mot ou clique dessus) :'}
                            </span>
                            {selectedWordForPlacement && (
                              <span className="text-[10px] font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 animate-pulse">
                                {isRtl ? 'اضغط على الفراغ المناسب لوضع:' : 'Clique sur un trou pour placer :'} "{selectedWordForPlacement}"
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2.5 pt-1">
                            {wordBank.map((word, wIdx) => {
                              const isPlaced = Object.values(currentSlots).includes(word);
                              const isSelected = selectedWordForPlacement === word;

                              return (
                                <button
                                  key={wIdx}
                                  type="button"
                                  draggable={true}
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', word);
                                    setSelectedWordForPlacement(word);
                                  }}
                                  onClick={() => {
                                    setSelectedWordForPlacement(selectedWordForPlacement === word ? null : word);
                                  }}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-grab active:cursor-grabbing flex items-center gap-1.5 ${
                                    isSelected
                                      ? 'bg-blue-600 text-white ring-4 ring-blue-300 scale-105'
                                      : isPlaced
                                      ? 'bg-white/80 text-slate-400 border border-slate-200 line-through opacity-70'
                                      : 'bg-white text-slate-800 border-2 border-blue-300 hover:border-blue-500 hover:scale-105'
                                  }`}
                                >
                                  <span>{word}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Paragraph with Cloze Slots */}
                        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm leading-loose text-sm sm:text-base font-medium text-slate-800">
                          {parts.map((part, pIdx) => {
                            const match = part.match(/^\[(\d+)\]$/);
                            if (match) {
                              const slotIndex = parseInt(match[1]);
                              const filledWord = currentSlots[slotIndex];

                              if (filledWord) {
                                return (
                                  <span
                                    key={pIdx}
                                    onClick={() => removeWordFromSlot(slotIndex)}
                                    title="Clique pour retirer ce mot"
                                    className="inline-flex items-center gap-1.5 mx-1.5 px-3 py-1 rounded-xl bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer hover:bg-rose-600 transition group align-middle"
                                  >
                                    <span>{filledWord}</span>
                                    <span className="text-[10px] bg-white/20 rounded-full w-4 h-4 flex items-center justify-center group-hover:bg-rose-700">
                                      ✕
                                    </span>
                                  </span>
                                );
                              }

                              return (
                                <span
                                  key={pIdx}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    const word = e.dataTransfer.getData('text/plain') || selectedWordForPlacement;
                                    if (word) assignWordToSlot(slotIndex, word);
                                  }}
                                  onClick={() => {
                                    if (selectedWordForPlacement) {
                                      assignWordToSlot(slotIndex, selectedWordForPlacement);
                                    }
                                  }}
                                  className={`inline-flex items-center justify-center mx-1.5 px-3.5 py-1.5 rounded-xl border-2 border-dashed font-bold text-xs transition cursor-pointer align-middle ${
                                    selectedWordForPlacement
                                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 animate-pulse'
                                      : 'border-slate-300 bg-slate-50 text-slate-400 hover:border-blue-400 hover:bg-blue-50/50'
                                  }`}
                                >
                                  {selectedWordForPlacement ? `➔ Déposer ici [${slotIndex}]` : `[ الفراغ ${slotIndex} ]`}
                                </span>
                              );
                            }

                            return <span key={pIdx}>{part}</span>;
                          })}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                          <span>💡 {isRtl ? 'يمكنك سحب الكلمة أو الضغط عليها ثم الضغط على الفراغ لتثبيتها.' : 'Astuce : Glisse le mot vers le trou ou clique sur le mot puis sur le trou.'}</span>
                          <span className="font-bold text-blue-700">
                            {Object.keys(currentSlots).length} / {currentQ.dragDropSlots?.length || 4} {isRtl ? 'فراغات مكتملة' : 'trous remplis'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 1. Ordering (Remise en ordre avec flèches haut/bas) */}
                  {currentQ.type === 'ordering' && currentQ.orderingItems && (() => {
                    const currentList = Array.isArray(currentAnswerObj.studentResponse) && currentAnswerObj.studentResponse.length === currentQ.orderingItems.length
                      ? currentAnswerObj.studentResponse
                      : [...currentQ.orderingItems].reverse();

                    const moveItem = (fromIdx: number, toIdx: number) => {
                      if (toIdx < 0 || toIdx >= currentList.length) return;
                      const copy = [...currentList];
                      const [moved] = copy.splice(fromIdx, 1);
                      copy.splice(toIdx, 0, moved);

                      setAnswersDraft(prev => ({
                        ...prev,
                        [currentQId]: {
                          ...prev[currentQId],
                          questionId: currentQId,
                          studentResponse: copy,
                        }
                      }));
                    };

                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{isRtl ? 'استعمل الأسهم لترتيب البطاقات بالتسلسل السليم :' : 'Utilise les flèches pour placer les étiquettes dans le bon ordre :'}</span>
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {currentList.length} étiquettes
                          </span>
                        </div>

                        <div className="space-y-2">
                          {currentList.map((itemText: string, idx: number) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-2xl border-2 border-slate-200 bg-white shadow-2xs hover:border-blue-400 transition flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-slate-900">
                                  {itemText}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveItem(idx, idx - 1)}
                                  className="p-2 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 disabled:opacity-20 transition"
                                  title="Monter"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === currentList.length - 1}
                                  onClick={() => moveItem(idx, idx + 1)}
                                  className="p-2 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 disabled:opacity-20 transition"
                                  title="Descendre"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 2. Matching (Relier les éléments / المزاوجة) */}
                  {currentQ.type === 'matching' && currentQ.matchingPairs && (() => {
                    const currentPairs = currentAnswerObj.studentResponse || {};
                    const rightOptions = currentQ.matchingPairs.map(p => p.right);

                    const handlePairSelect = (leftText: string, selectedRight: string) => {
                      setAnswersDraft(prev => ({
                        ...prev,
                        [currentQId]: {
                          ...prev[currentQId],
                          questionId: currentQId,
                          studentResponse: {
                            ...currentPairs,
                            [leftText]: selectedRight,
                          }
                        }
                      }));
                    };

                    return (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 font-medium">
                          {isRtl ? 'اختر العنصر المقابل والمناسب لكل عنصر من القائمة :' : 'Associe à chaque élément de gauche son correspondant à droite :'}
                        </p>

                        <div className="space-y-3">
                          {currentQ.matchingPairs.map((pair, pIdx) => {
                            const selected = currentPairs[pair.left] || '';
                            const isMatched = !!selected;

                            return (
                              <div
                                key={pair.id}
                                className={`p-4 rounded-2xl border-2 transition ${
                                  isMatched ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 bg-white'
                                } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                                    {pIdx + 1}
                                  </span>
                                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                                    {pair.left}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Link2 className={`w-4 h-4 shrink-0 ${isMatched ? 'text-indigo-600' : 'text-slate-300'}`} />
                                  <select
                                    value={selected}
                                    onChange={(e) => handlePairSelect(pair.left, e.target.value)}
                                    className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 max-w-xs"
                                  >
                                    <option value="">{isRtl ? '-- اختر المقابل --' : '-- Choisir le correspondant --'}</option>
                                    {rightOptions.map((opt, oIdx) => (
                                      <option key={oIdx} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3. Categorization (Classification en tableau) */}
                  {currentQ.type === 'categorization' && currentQ.categories && (() => {
                    const currentBins: Record<string, string[]> = currentAnswerObj.studentResponse || {};
                    const allPoolItems = currentQ.categories.flatMap(c => c.items);

                    // Find which category an item is currently placed in
                    const findItemCategory = (item: string) => {
                      for (const cat of currentQ.categories || []) {
                        if (currentBins[cat.id]?.includes(item)) return cat.id;
                      }
                      return null;
                    };

                    const handleToggleCategory = (item: string, targetCatId: string) => {
                      const updatedBins: Record<string, string[]> = {};
                      currentQ.categories?.forEach(c => {
                        updatedBins[c.id] = (currentBins[c.id] || []).filter(it => it !== item);
                      });

                      // If target is not already set, place it
                      if (!currentBins[targetCatId]?.includes(item)) {
                        updatedBins[targetCatId] = [...(updatedBins[targetCatId] || []), item];
                      }

                      setAnswersDraft(prev => ({
                        ...prev,
                        [currentQId]: {
                          ...prev[currentQId],
                          questionId: currentQId,
                          studentResponse: updatedBins,
                        }
                      }));
                    };

                    return (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500 font-medium">
                          {isRtl ? 'انقر على الفئة المناسبة لكل عنصر لتصنيفه في الجدول :' : 'Clique sur la catégorie voulue pour ranger chaque élément dans sa colonne :'}
                        </p>

                        {/* Unplaced and Placed Items list */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            {isRtl ? 'العناصر المراد تصنيفها :' : 'Éléments à classer :'}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {allPoolItems.map((item, iIdx) => {
                              const placedCatId = findItemCategory(item);
                              const placedCat = currentQ.categories?.find(c => c.id === placedCatId);

                              return (
                                <div
                                  key={iIdx}
                                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                                    placedCat ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs' : 'bg-white border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <span>{item}</span>
                                  <div className="flex items-center gap-1">
                                    {currentQ.categories?.map((cat, cIdx) => (
                                      <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleToggleCategory(item, cat.id)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                          placedCatId === cat.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                        }`}
                                      >
                                        {cIdx === 0 ? 'Col 1' : 'Col 2'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Category Bins visual table */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {currentQ.categories.map((cat, cIdx) => {
                            const itemsInCat = currentBins[cat.id] || [];
                            return (
                              <div
                                key={cat.id}
                                className="p-4 rounded-2xl border-2 border-indigo-200 bg-white space-y-2"
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">
                                      {cIdx + 1}
                                    </span>
                                    <h5 className="font-extrabold text-xs text-indigo-950">
                                      {isRtl ? cat.nameAr : cat.nameFr}
                                    </h5>
                                  </div>
                                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                    {itemsInCat.length} {isRtl ? 'عناصر' : 'éléments'}
                                  </span>
                                </div>

                                <div className="min-h-16 flex flex-wrap gap-1.5 pt-1">
                                  {itemsInCat.map((it, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-semibold"
                                    >
                                      <span>✓ {it}</span>
                                    </span>
                                  ))}
                                  {itemsInCat.length === 0 && (
                                    <span className="text-slate-400 text-[11px] italic self-center">
                                      {isRtl ? 'لا توجد عناصر مصنفة هنا بعد' : 'Aucun élément classé ici pour le moment'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4. Odd One Out (Trouver l'intrus / الكلمة الدخيلة) */}
                  {currentQ.type === 'odd_one_out' && currentQ.oddOneOutItems && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 font-medium">
                        {isRtl ? 'اضغط على العنصر الدخيل الذي لا يشارك باقي المجموعة نفس الخاصية :' : 'Clique sur l\'élément intrus qui ne possède pas la règle commune des autres :'}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {currentQ.oddOneOutItems.map(item => {
                          const isSelected = currentAnswerObj.studentResponse === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setAnswersDraft(prev => ({
                                  ...prev,
                                  [currentQId]: {
                                    ...prev[currentQId],
                                    questionId: currentQId,
                                    studentResponse: item.id,
                                  }
                                }));
                              }}
                              className={`p-4 rounded-2xl border-2 font-black text-xs sm:text-sm transition flex flex-col items-center justify-center gap-2 ${
                                isSelected
                                  ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-md ring-2 ring-rose-200'
                                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'
                              }`}>
                                <SearchCheck className="w-4 h-4" />
                              </div>
                              <span>{isRtl && item.textAr ? item.textAr : item.textFr}</span>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                                  {isRtl ? 'الدخيل المختار' : 'Intrus sélectionné'}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Production Écrite / Problem Solving */}
                  {(currentQ.type === 'production_ecrite' || currentQ.type === 'problem_solving') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isRtl ? 'مساحة الكتابة والحل المنهجي :' : 'Espace de rédaction de ton paragraphe ou de tes calculs :'}
                      </label>
                      <textarea
                        rows={5}
                        placeholder={isRtl ? 'اكتب نصك أو خطوات الحل بوضوح...' : 'Rédige tes phrases avec soin...'}
                        value={currentAnswerObj.studentResponse || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAnswersDraft(prev => ({
                            ...prev,
                            [currentQId]: {
                              ...prev[currentQId],
                              questionId: currentQId,
                              studentResponse: val,
                            }
                          }));
                        }}
                        className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-medium text-slate-900 bg-slate-50/50 leading-relaxed"
                      />
                    </div>
                  )}
                </div>

                {/* Navigation Controls */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs disabled:opacity-30 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t.student.previousQuestion}</span>
                  </button>

                  {currentQuestionIndex < activeTest.questionIds.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                    >
                      <span>{t.student.nextQuestion}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSubmitConfirm(true)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition"
                    >
                      <Send className="w-4 h-4" />
                      <span>{t.student.finishTest}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Submit Confirmation Dialog */}
          {showSubmitConfirm && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  {t.student.submitTestConfirm}
                </h4>
                <p className="text-xs text-slate-500 mb-6">
                  {isRtl 
                    ? 'لقد أجبت عن جميع الأسئلة. بعد الإرسال، سيتولى الأستاذ مراجعة إجاباتك ومنحك التقييم النهائي.' 
                    : 'Une fois envoyé, ton devoir sera transmis à ton professeur pour correction.'}
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowSubmitConfirm(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                  >
                    {isRtl ? 'مراجعة الإجابات' : 'Revoir mes réponses'}
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md"
                  >
                    {isRtl ? 'نعم، إرسال الآن' : 'Oui, envoyer mon devoir !'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Time's Up Auto-Submit Dialog */}
          {isTimeUpModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-rose-300 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
                  <Clock className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">
                  {t.student.timeUpTitle}
                </h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {t.student.timeUpMessage}
                </p>
                
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 mb-6 text-xs font-bold text-rose-700">
                  {isRtl 
                    ? `سيتم إرسال إجاباتك تلقائياً خلال ${autoSubmitCountdown} ثوانٍ...`
                    : `Transmission automatique dans ${autoSubmitCountdown} secondes...`}
                </div>

                <button
                  onClick={handleFinalSubmit}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.student.submitNow}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: MY RESULTS / CARNET ======================= */}
      {activeStudentTab === 'results' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isRtl ? 'دفتر مكتسباتي وكفاياتي' : 'Mon Carnet de Réussite & Compétences'}
            </h3>
            <p className="text-xs text-slate-500">
              {isRtl ? 'اطلع على النجوم والمهارات التي تحكمت فيها بنجاح' : 'Voici ton niveau pour chaque compétence travaillée en classe.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map(skill => {
              // Calculate for this student
              let totalObt = 0;
              let totalMx = 0;
              studentAttempts.forEach(att => {
                if (att.status !== 'corrected') return;
                Object.values(att.answers).forEach(ans => {
                  const q = questions.find(item => item.id === ans.questionId);
                  if (q && q.skillId === skill.id && ans.scoreObtained !== undefined) {
                    totalObt += ans.scoreObtained;
                    totalMx += ans.maxScore;
                  }
                });
              });

              const pct = totalMx > 0 ? Math.round((totalObt / totalMx) * 100) : 0;
              const stars = pct >= 90 ? 4 : pct >= 75 ? 3 : pct >= 50 ? 2 : totalMx > 0 ? 1 : 0;

              return (
                <div key={skill.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {skill.code}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {isRtl ? skill.nameAr : skill.nameFr}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {isRtl ? skill.domainAr : skill.domainFr}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map(sIndex => (
                      <Star
                        key={sIndex}
                        className={`w-4 h-4 ${
                          sIndex <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: MY REMEDIATION ACTIVITIES ======================= */}
      {activeStudentTab === 'remediation' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isRtl ? 'أنشطة الدعم المخصصة لتطوير مهاراتي' : 'Mes Fiches de Soutien & Exercices d\'Entraînement'}
            </h3>
            <p className="text-xs text-slate-500">
              {isRtl ? 'أنشطة خاصة اختارها لك أستاذك لمساعدتك على التقدم' : 'Activités choisies spécialement par ton enseignant.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentAssignments.map(asg => {
              const res = remediationResources.find(r => r.id === asg.resourceId);
              if (!res) return null;
              const skill = skills.find(s => s.id === asg.skillId);

              return (
                <div key={asg.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                        {res.type} • {asg.skillId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        asg.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {asg.status === 'completed' ? t.remediation.statusCompleted : t.remediation.statusPending}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      {isRtl ? res.titleAr : res.titleFr}
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      {isRtl ? res.objectiveAr : res.objectiveFr}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveRemediation({ assignment: asg, resource: res });
                      setRemQuizAnswer(null);
                      setRemQuizFeedback(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{isRtl ? 'فتح بطاقة النشاط والتدريب' : 'Ouvrir l\'activité'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {studentAssignments.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">
                {isRtl ? 'كل شيء ممتاز! لا توجد أنشطة دعم مستعجلة لك حالياً.' : 'Tout est parfait ! Tu n\'as pas de fiche de soutien en attente.'}
              </h4>
            </div>
          )}

          {/* Interactive Remediation Card Modal */}
          {activeRemediation && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {activeRemediation.resource.skillId}
                  </span>
                  <button
                    onClick={() => setActiveRemediation(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <h3 className="font-black text-slate-900 text-lg mb-3">
                  {isRtl ? activeRemediation.resource.titleAr : activeRemediation.resource.titleFr}
                </h3>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 mb-4 leading-relaxed whitespace-pre-line font-medium">
                  {isRtl ? activeRemediation.resource.contentAr : activeRemediation.resource.contentFr}
                </div>

                {/* Practice Question */}
                {activeRemediation.resource.practiceQuestions && activeRemediation.resource.practiceQuestions[0] && (
                  <div className="space-y-3 mb-6">
                    <h5 className="font-bold text-xs text-slate-900">
                      {isRtl ? 'تمرين تطبيقي مصغر :' : 'Mini-Quiz pour vérifier ta compréhension :'}
                    </h5>
                    <p className="text-xs font-semibold text-slate-800">
                      {activeRemediation.resource.practiceQuestions[0].question}
                    </p>
                    <div className="space-y-1.5">
                      {activeRemediation.resource.practiceQuestions[0].options.map((opt: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => {
                            setRemQuizAnswer(i);
                            const isOk = i === activeRemediation.resource.practiceQuestions[0].correctIndex;
                            if (isOk) {
                              confetti({ particleCount: 40 });
                              setRemQuizFeedback(isRtl ? 'إجابة صحيحة وممتازة! أحسنت.' : 'Excellente réponse ! Tu as bien compris la règle.');
                            } else {
                              setRemQuizFeedback(isRtl ? 'حاول مرة أخرى، راجع القاعدة بأعلى البطاقة.' : 'Essaie encore ! Relis bien le conseil ci-dessus.');
                            }
                          }}
                          className={`w-full p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                            remQuizAnswer === i ? 'border-indigo-600 bg-indigo-50 text-indigo-950' : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {remQuizFeedback && (
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
                        {remQuizFeedback}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveRemediation(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      completeRemediation(activeRemediation.assignment.id);
                      confetti({ particleCount: 60 });
                      setActiveRemediation(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition"
                  >
                    {isRtl ? 'تأكيد إتمام النشاط' : 'J\'ai terminé cette fiche !'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
