import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { TeacherNav } from './components/teacher/TeacherNav';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { ClassManager } from './components/teacher/ClassManager';
import { SkillsRepository } from './components/teacher/SkillsRepository';
import { QuestionBank } from './components/teacher/QuestionBank';
import { EvaluationManager } from './components/teacher/EvaluationManager';
import { CorrectionCenter } from './components/teacher/CorrectionCenter';
import { RemediationCenter } from './components/teacher/RemediationCenter';
import { AnalyticsReports } from './components/teacher/AnalyticsReports';
import { ResearchProtocolView } from './components/teacher/ResearchProtocolView';
import { TeacherLogin } from './components/teacher/TeacherLogin';
import { StudentPortal } from './components/student/StudentPortal';

const AppContent: React.FC = () => {
  const { role, activeTeacherTab, isTeacherAuthenticated, lang, isRtl } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Header />

      {role === 'teacher' && isTeacherAuthenticated && <TeacherNav />}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {role === 'teacher' ? (
          !isTeacherAuthenticated ? (
            <TeacherLogin />
          ) : (
            <>
              {activeTeacherTab === 'dashboard' && <TeacherDashboard />}
              {activeTeacherTab === 'classes' && <ClassManager />}
              {activeTeacherTab === 'skills' && <SkillsRepository />}
              {activeTeacherTab === 'questionBank' && <QuestionBank />}
              {activeTeacherTab === 'evaluations' && <EvaluationManager />}
              {activeTeacherTab === 'correction' && <CorrectionCenter />}
              {activeTeacherTab === 'remediation' && <RemediationCenter />}
              {activeTeacherTab === 'analytics' && <AnalyticsReports />}
              {activeTeacherTab === 'research' && <ResearchProtocolView />}
            </>
          )
        ) : (
          <StudentPortal />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">ÉVAL'PROGRESS v1.0</span>
            <span>•</span>
            <span>{isRtl ? 'منصة تقويم وتتبع المكتسبات (4AEP)' : 'Plateforme d\'évaluation et de suivi des acquis (4AEP)'}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {isRtl 
              ? 'مشروع بحث تطبيقي وتطوير تربوي - مطابق لضوابط حماية المعطيات الشخصية (CNDP)' 
              : 'Recherche-Action EdTech • Évaluation formative & Remédiation individualisée'}
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
