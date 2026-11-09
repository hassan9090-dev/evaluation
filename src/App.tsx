import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/navigation/Sidebar';
import { HomePage } from './components/home/HomePage';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { ClassManager } from './components/teacher/ClassManager';
import { SkillsRepository } from './components/teacher/SkillsRepository';
import { EvaluationManager } from './components/teacher/EvaluationManager';
import { CorrectionCenter } from './components/teacher/CorrectionCenter';
import { RemediationCenter } from './components/teacher/RemediationCenter';
import { AnalyticsReports } from './components/teacher/AnalyticsReports';
import { TeacherLogin } from './components/teacher/TeacherLogin';
import { StudentPortal } from './components/student/StudentPortal';
import { StudentMassarLogin } from './components/student/StudentMassarLogin';

const AppContent: React.FC = () => {
  const { role, activeTeacherTab, isTeacherAuthenticated, currentStudent, isRtl } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Header />

      {/* Main Layout with Collapsible Left Sidebar */}
      <div className="flex-1 flex min-h-0 w-full">
        {/* Left Collapsible Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {role === 'home' ? (
              <HomePage />
            ) : role === 'teacher' ? (
              !isTeacherAuthenticated ? (
                <TeacherLogin />
              ) : (
                <>
                  {activeTeacherTab === 'dashboard' && <TeacherDashboard />}
                  {activeTeacherTab === 'classes' && <ClassManager />}
                  {activeTeacherTab === 'skills' && <SkillsRepository />}
                  {(activeTeacherTab === 'evaluations' || (activeTeacherTab as string) === 'questionBank') && <EvaluationManager />}
                  {activeTeacherTab === 'correction' && <CorrectionCenter />}
                  {activeTeacherTab === 'remediation' && <RemediationCenter />}
                  {activeTeacherTab === 'analytics' && <AnalyticsReports />}
                </>
              )
            ) : !currentStudent ? (
              <StudentMassarLogin />
            ) : (
              <StudentPortal />
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Suivi-Pédagogique v1.0</span>
                <span>•</span>
                <span>{isRtl ? 'منصة تقويم وتتبع المكتسبات (4AEP)' : 'Plateforme d\'évaluation et de suivi des acquis (4AEP)'}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {isRtl 
                  ? 'التقويم التكويني والدعم الفردي - مطابق لضوابط حماية المعطيات الشخصية (CNDP)' 
                  : 'Évaluation formative & Remédiation individualisée'}
              </div>
            </div>
          </footer>
        </div>
      </div>
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
