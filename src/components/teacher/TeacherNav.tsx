import React, { useState } from 'react';
import { useApp, TeacherTab } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  LayoutDashboard, Users, Target, FileCheck2, 
  CheckCircle, HeartHandshake, BarChart3, KeyRound
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

export const TeacherNav: React.FC = () => {
  const { lang, isRtl, activeTeacherTab, setActiveTeacherTab, attempts, remediationAssignments } = useApp();
  const t = translations[lang];

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const pendingGradingCount = attempts.filter(a => a.status === 'submitted').length;
  const pendingRemCount = remediationAssignments.filter(a => a.status === 'pending').length;

  const navItems: { tab: TeacherTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { tab: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { tab: 'classes', label: t.nav.classes, icon: Users },
    { tab: 'skills', label: t.nav.skills, icon: Target },
    { tab: 'evaluations', label: t.nav.evaluations, icon: FileCheck2 },
    { tab: 'correction', label: t.nav.correction, icon: CheckCircle, badge: pendingGradingCount },
    { tab: 'remediation', label: t.nav.remediation, icon: HeartHandshake, badge: pendingRemCount },
    { tab: 'analytics', label: t.nav.analytics, icon: BarChart3 },
  ];

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 gap-2">
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar flex-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTeacherTab === item.tab;

                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTeacherTab(item.tab)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white text-blue-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Change Password Trigger */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 transition cursor-pointer"
              title={isRtl ? 'تعديل كلمة مرور الأستاذ' : 'Modifier le mot de passe enseignant'}
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">{isRtl ? 'كلمة المرور' : 'Mot de passe'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
    </>
  );
};
