import React, { useState } from 'react';
import { useApp, TeacherTab, StudentTab } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  Home, LayoutDashboard, Users, Target, Database, FileCheck2, 
  CheckCircle, HeartHandshake, BarChart3, GraduationCap, KeyRound, 
  Lock, Sparkles, QrCode, LogOut, ChevronLeft, ChevronRight, 
  PanelLeftClose, PanelLeftOpen, Award
} from 'lucide-react';
import { ChangePasswordModal } from '../teacher/ChangePasswordModal';
import { LocalNetworkQrModal } from '../network/LocalNetworkQrModal';

export const Sidebar: React.FC = () => {
  const { 
    role, setRole, lang, isRtl,
    activeTeacherTab, setActiveTeacherTab, 
    activeStudentTab, setActiveStudentTab,
    isTeacherAuthenticated, teacherLogout,
    currentStudent, studentLogout,
    isSidebarCollapsed, toggleSidebar,
    attempts, remediationAssignments
  } = useApp();

  const t = translations[lang];

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const pendingGradingCount = attempts.filter(a => a.status === 'submitted').length;
  const pendingRemCount = remediationAssignments.filter(a => a.status === 'pending').length;

  const teacherNavItems: { tab: TeacherTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { tab: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { tab: 'classes', label: t.nav.classes, icon: Users },
    { tab: 'skills', label: t.nav.skills, icon: Target },
    { tab: 'questionBank', label: t.nav.questionBank, icon: Database },
    { tab: 'evaluations', label: t.nav.evaluations, icon: FileCheck2 },
    { tab: 'correction', label: t.nav.correction, icon: CheckCircle, badge: pendingGradingCount },
    { tab: 'remediation', label: t.nav.remediation, icon: HeartHandshake, badge: pendingRemCount },
    { tab: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { tab: 'research', label: t.nav.research, icon: GraduationCap },
  ];

  const studentNavItems: { tab: StudentTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'home', label: t.nav.studentHome, icon: Home },
    { tab: 'tests', label: t.nav.studentTests, icon: FileCheck2 },
    { tab: 'remediation', label: t.nav.studentRemediation, icon: HeartHandshake },
    { tab: 'results', label: t.nav.studentResults, icon: Award },
  ];

  // Handler for Quitter command (returns to Home Page)
  const handleQuit = () => {
    if (role === 'teacher') {
      teacherLogout();
    } else if (role === 'student') {
      studentLogout();
    }
    setRole('home');
  };

  const widthClass = isSidebarCollapsed ? 'w-18' : 'w-64';

  return (
    <>
      <aside 
        className={`${widthClass} shrink-0 bg-white border-r border-slate-200 h-[calc(100vh-4.25rem)] sticky top-16 z-30 flex flex-col justify-between transition-all duration-300 ease-in-out select-none shadow-xs no-print`}
      >
        {/* Top: Sidebar Brand & Collapse Action */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
            {!isSidebarCollapsed ? (
              <button 
                onClick={handleQuit}
                className="flex items-center gap-2.5 overflow-hidden text-left cursor-pointer group"
                title="Page d'accueil"
              >
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    Suivi<span className="text-blue-600">-Pédago</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">4AEP • Primaire</div>
                </div>
              </button>
            ) : (
              <button 
                onClick={handleQuit}
                className="w-10 h-10 mx-auto rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs cursor-pointer hover:scale-105 transition-transform"
                title="Page d'Accueil"
              >
                <GraduationCap className="w-5 h-5" />
              </button>
            )}

            {/* Collapse / Expand Toggle Button */}
            {!isSidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title={t.nav.collapseSidebar}
              >
                {isRtl ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Scrollable Navigation List - ONLY menus for current user */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 no-scrollbar">
            
            {/* ---------------------------------------------------- */}
            {/* CASE 1: HOME VISITOR (role === 'home')               */}
            {/* ---------------------------------------------------- */}
            {role === 'home' && (
              <div className="space-y-2">
                <div>
                  <button
                    onClick={() => setRole('home')}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs`}
                    title={t.nav.home}
                  >
                    <Home className="w-4 h-4 shrink-0 text-blue-600" />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{t.nav.home}</span>
                    )}
                  </button>
                </div>

                {!isSidebarCollapsed && (
                  <div className="px-3 pt-3 pb-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                    {isRtl ? 'الولوج إلى الفضاءات' : 'Espaces disponibles'}
                  </div>
                )}

                <button
                  onClick={() => {
                    setRole('teacher');
                    setActiveTeacherTab('dashboard');
                  }}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-100 transition cursor-pointer`}
                  title={isRtl ? 'فضاء الأستاذ' : 'Espace Enseignant'}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0 text-blue-600" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{isRtl ? 'فضاء الأستاذ' : 'Espace Enseignant'}</span>
                  )}
                </button>

                <button
                  onClick={() => setRole('student')}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-100 transition cursor-pointer`}
                  title={isRtl ? 'فضاء المتعلم' : 'Portail Élève'}
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-indigo-600" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{isRtl ? 'فضاء المتعلم' : 'Portail Élève'}</span>
                  )}
                </button>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* CASE 2: TEACHER ONLY (role === 'teacher')            */}
            {/* ---------------------------------------------------- */}
            {role === 'teacher' && (
              <div className="space-y-1.5">
                {/* Header for Teacher */}
                <div className="px-3 pt-1 pb-1 flex items-center justify-between">
                  {!isSidebarCollapsed && (
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                      {isRtl ? 'فضاء الأستاذ' : 'Espace Enseignant'}
                    </span>
                  )}
                  {isTeacherAuthenticated && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {!isSidebarCollapsed && <span>{isRtl ? 'متصل' : 'Actif'}</span>}
                    </span>
                  )}
                </div>

                {/* Prominent "Quitter vers l'accueil" command */}
                <button
                  onClick={handleQuit}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5 px-3'} py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition cursor-pointer mb-2 group shadow-2xs`}
                  title={t.nav.quitPrompt}
                >
                  <LogOut className={`w-4 h-4 text-rose-600 shrink-0 group-hover:-translate-x-0.5 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{t.nav.quit}</span>
                  )}
                </button>

                {!isTeacherAuthenticated ? (
                  <div className={`p-3 rounded-xl bg-blue-50/70 border border-blue-200 ${isSidebarCollapsed ? 'text-center' : ''}`}>
                    <Lock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    {!isSidebarCollapsed && (
                      <div className="text-[11px] font-bold text-blue-900 text-center leading-tight">
                        {isRtl ? 'يرجى تسجيل الدخول للوصول إلى لوحة القيادة' : 'Connexion requise'}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Authenticated Teacher Tabs Only */
                  teacherNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTeacherTab === item.tab;

                    return (
                      <button
                        key={item.tab}
                        onClick={() => setActiveTeacherTab(item.tab)}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title={item.label}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        {!isSidebarCollapsed && (
                          <span className="truncate flex-1 text-left">{item.label}</span>
                        )}
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive 
                              ? 'bg-white text-blue-700' 
                              : 'bg-amber-100 text-amber-800'
                          } ${isSidebarCollapsed ? 'absolute -top-1 -right-1 ring-2 ring-white' : ''}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* CASE 3: STUDENT ONLY (role === 'student')            */}
            {/* ---------------------------------------------------- */}
            {role === 'student' && (
              <div className="space-y-1.5">
                {/* Header for Student */}
                <div className="px-3 pt-1 pb-1">
                  {!isSidebarCollapsed && (
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        {isRtl ? 'فضاء المتعلم' : 'Espace Élève'}
                      </span>
                      {currentStudent && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {currentStudent.studentCode}
                        </span>
                      )}
                    </div>
                  )}
                  {!isSidebarCollapsed && currentStudent && (
                    <div className="text-xs font-bold text-slate-800 truncate mb-1">
                      {currentStudent.avatarIcon} {currentStudent.displayPseudonym}
                    </div>
                  )}
                </div>

                {/* Prominent "Quitter vers l'accueil" command */}
                <button
                  onClick={handleQuit}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5 px-3'} py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition cursor-pointer mb-2 group shadow-2xs`}
                  title={t.nav.quitPrompt}
                >
                  <LogOut className={`w-4 h-4 text-rose-600 shrink-0 group-hover:-translate-x-0.5 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{t.nav.quit}</span>
                  )}
                </button>

                {!currentStudent ? (
                  <div className={`p-3 rounded-xl bg-purple-50/70 border border-purple-200 ${isSidebarCollapsed ? 'text-center' : ''}`}>
                    <Sparkles className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    {!isSidebarCollapsed && (
                      <div className="text-[11px] font-bold text-purple-900 text-center leading-tight">
                        {isRtl ? 'اختيار القسم وإدخال رمز مسار مطلوب' : 'Classe & Code Massar requis'}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Authenticated Student Tabs Only */
                  studentNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeStudentTab === item.tab;

                    return (
                      <button
                        key={item.tab}
                        onClick={() => setActiveStudentTab(item.tab)}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title={item.label}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        {!isSidebarCollapsed && (
                          <span className="truncate flex-1 text-left">{item.label}</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Utilities & Actions */}
        <div className="p-2 border-t border-slate-100 space-y-1.5 bg-slate-50/50">
          
          {/* Bottom "Quitter" Action when in Teacher or Student mode */}
          {role !== 'home' && (
            <button
              onClick={handleQuit}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2 px-3'} py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-100/70 transition cursor-pointer`}
              title={t.nav.quitPrompt}
            >
              <LogOut className={`w-3.5 h-3.5 text-rose-600 shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
              {!isSidebarCollapsed && (
                <span className="truncate">{t.nav.quit}</span>
              )}
            </button>
          )}

          {/* Teacher: Change Password */}
          {role === 'teacher' && isTeacherAuthenticated && (
            <button
              onClick={() => setShowPasswordModal(true)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2 px-3'} py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 transition cursor-pointer`}
              title={isRtl ? 'تعديل كلمة مرور الأستاذ' : 'Modifier mot de passe enseignant'}
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              {!isSidebarCollapsed && (
                <span className="truncate">{isRtl ? 'كلمة المرور' : 'Mot de passe'}</span>
              )}
            </button>
          )}

          {/* Teacher: Lock Session */}
          {role === 'teacher' && isTeacherAuthenticated && (
            <button
              onClick={teacherLogout}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2 px-3'} py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer`}
              title={isRtl ? 'قفل فضاء الأستاذ' : 'Verrouiller la session'}
            >
              <Lock className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              {!isSidebarCollapsed && (
                <span className="truncate">{isRtl ? 'قفل الجلسة' : 'Verrouiller'}</span>
              )}
            </button>
          )}

          {/* Student: Change Account / Logout */}
          {role === 'student' && currentStudent && (
            <button
              onClick={studentLogout}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2 px-3'} py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer`}
              title={isRtl ? 'تغيير الحساب' : 'Changer de compte Massar'}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
              {!isSidebarCollapsed && (
                <span className="truncate">{isRtl ? 'تغيير التلميذ' : 'Changer d\'élève'}</span>
              )}
            </button>
          )}

          {/* Classroom QR Code Launcher (Teacher or Home) */}
          {role !== 'student' && (
            <button
              onClick={() => setShowQrModal(true)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2 px-3'} py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer shadow-2xs`}
              title={isRtl ? 'عرض رمز QR لربط أجهزة التلاميذ' : 'QR Code Réseau Local Tablettes'}
            >
              <QrCode className="w-4 h-4 text-indigo-600 shrink-0" />
              {!isSidebarCollapsed && (
                <span className="truncate">{isRtl ? 'رمز QR للقسم' : 'QR Code Tablettes'}</span>
              )}
            </button>
          )}

          {/* Expand Toggle when collapsed */}
          {isSidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
              title={t.nav.expandSidebar}
            >
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </aside>

      {/* Modals */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />

      <LocalNetworkQrModal 
        isOpen={showQrModal} 
        onClose={() => setShowQrModal(false)} 
      />
    </>
  );
};
