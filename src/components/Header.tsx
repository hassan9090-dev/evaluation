import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../locales/translations';
import { 
  GraduationCap, Languages, Wifi, WifiOff, 
  RotateCcw, ShieldCheck, ChevronDown, LogOut,
  QrCode, PanelLeft, User
} from 'lucide-react';
import { LocalNetworkQrModal } from './network/LocalNetworkQrModal';

export const Header: React.FC = () => {
  const { 
    role, setRole, lang, setLang, isRtl, isOffline, setIsOffline, 
    currentStudent, setCurrentStudent, students, resetToDefaults,
    teacherLogout, studentLogout, serverConnected, lastSyncTime, 
    isSidebarCollapsed, toggleSidebar
  } = useApp();

  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const t = translations[lang];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      {/* Top Banner / Privacy Alert */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-200 shrink-0" />
          <span className="font-medium">{t.app.anonymousNotice}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Central PC Prof status */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-white border border-white/20" title={lastSyncTime ? `Dernière synchro: ${lastSyncTime}` : 'Connecté au serveur PC Prof'}>
            <span className={`w-2 h-2 rounded-full ${serverConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="hidden sm:inline">
              {serverConnected 
                ? (isRtl ? 'حاسوب الأستاذ متصل' : 'PC Prof Connecté')
                : (isRtl ? 'حفظ محلي' : 'Mode Local')}
            </span>
          </div>
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              isOffline ? 'bg-amber-500 text-white' : 'bg-blue-600/60 hover:bg-blue-600 text-blue-100'
            }`}
            title="Simuler le mode hors ligne (PWA)"
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3 h-3" />
                <span>{t.app.offlineMode}</span>
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 text-emerald-300" />
                <span>{t.app.onlineStatus}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Sidebar Toggle & Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              title={isSidebarCollapsed ? t.nav.expandSidebar : t.nav.collapseSidebar}
            >
              <PanelLeft className="w-4 h-4 text-slate-700" />
            </button>

            <button
              onClick={() => {
                if (role === 'teacher') teacherLogout();
                if (role === 'student') studentLogout();
                setRole('home');
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
              title="Aller à la page d'accueil"
            >
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    <span>Suivi</span>
                    <span className="text-blue-600">-Pédagogique</span>
                  </h1>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                    4AEP
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden lg:block leading-none">
                  {t.app.slogan}
                </p>
              </div>
            </button>
          </div>

          {/* Controls: Role Switcher, Student Selector, Language, Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Switcher when in Student Mode */}
            {role === 'student' && currentStudent && (
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button
                    onClick={() => setShowStudentPicker(!showStudentPicker)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-semibold text-blue-700">{currentStudent.studentCode}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showStudentPicker && (
                    <div className={`absolute top-full mt-1.5 ${isRtl ? 'left-0' : 'right-0'} w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto`}>
                      <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">
                        {isRtl ? 'اختر رمز مسار (Code Massar) :' : 'Choisir un Code Massar :'}
                      </div>
                      {students.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => {
                            setCurrentStudent(st);
                            setShowStudentPicker(false);
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition ${
                            currentStudent?.id === st.id 
                              ? 'bg-blue-50 text-blue-700 font-semibold' 
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="flex-1 truncate">
                            <span className="font-bold">{st.studentCode}</span>
                            <span className="text-[10px] text-slate-400 block">{st.displayPseudonym}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={studentLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition"
                  title={isRtl ? 'تسجيل الخروج من هذا الحساب' : 'Changer de compte Massar'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{isRtl ? 'خروج' : 'Quitter'}</span>
                </button>
              </div>
            )}

            {/* Quitter vers l'accueil button */}
            {role !== 'home' && (
              <button
                onClick={() => {
                  if (role === 'teacher') teacherLogout();
                  if (role === 'student') studentLogout();
                  setRole('home');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                title={t.nav.quitPrompt}
              >
                <LogOut className={`w-3.5 h-3.5 text-rose-600 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{t.nav.quit}</span>
              </button>
            )}

            {/* Local Network QR Code Projector Button */}
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition shadow-2xs cursor-pointer"
              title={isRtl ? 'عرض ومشاركة رمز QR لربط أجهزة التلاميذ' : 'Projeter le QR Code pour les tablettes (Réseau Local)'}
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">{isRtl ? 'رمز QR للقسم' : 'QR Code Tablettes'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
              title="Changer de langue / تغيير اللغة"
            >
              <Languages className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">{lang === 'fr' ? 'العربية' : 'Français'}</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm(isRtl ? 'هل تريد استعادة البيانات التجريبية الأصلية؟' : 'Voulez-vous réinitialiser les données de démonstration ?')) {
                  resetToDefaults();
                }
              }}
              className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition"
              title={t.common.resetDemo}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Local Network QR Code Projector Modal */}
      <LocalNetworkQrModal 
        isOpen={showQrModal} 
        onClose={() => setShowQrModal(false)} 
      />
    </header>
  );
};
