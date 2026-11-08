import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, 
  RotateCcw, ShieldCheck, X, Sparkles
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { lang, isRtl, teacherPassword, changeTeacherPassword, resetTeacherPasswordToDefault } = useApp();

  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    // Verify current password or allow if emergency recovery master key (admin123) was entered
    if (currentPassInput.trim() !== teacherPassword && currentPassInput.trim() !== 'admin123') {
      setStatusMsg({
        type: 'error',
        text: isRtl 
          ? 'كلمة المرور الحالية غير صحيحة.' 
          : 'Le mot de passe actuel saisi est incorrect.'
      });
      return;
    }

    if (newPassword.trim().length < 4) {
      setStatusMsg({
        type: 'error',
        text: isRtl 
          ? 'يجب أن تتكون كلمة المرور الجديدة من 4 أحرف على الأقل.' 
          : 'Le nouveau mot de passe doit comporter au moins 4 caractères.'
      });
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setStatusMsg({
        type: 'error',
        text: isRtl 
          ? 'كلمتا المرور الجديدتان غير متطابقتين.' 
          : 'Les deux nouveaux mots de passe ne correspondent pas.'
      });
      return;
    }

    const ok = changeTeacherPassword(newPassword.trim());
    if (ok) {
      setStatusMsg({
        type: 'success',
        text: isRtl 
          ? 'تم تغيير كلمة المرور بنجاح! في حال نسيانها، يمكنك دائماً استخدام رمز الأمان الاحتياطي: admin123.' 
          : 'Mot de passe modifié avec succès ! En cas d\'oubli, le mot de passe de secours admin123 reste toujours actif.'
      });
      setCurrentPassInput('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleResetToEmergencyDefault = () => {
    if (window.confirm(isRtl ? 'هل تريد استعادة كلمة المرور الاحتياطية (admin123)؟' : 'Voulez-vous réinitialiser votre mot de passe au mot de passe de secours : admin123 ?')) {
      resetTeacherPasswordToDefault();
      setStatusMsg({
        type: 'success',
        text: isRtl 
          ? 'تمت استعادة كلمة المرور بنجاح إلى: admin123' 
          : 'Mot de passe réinitialisé avec succès à : admin123'
      });
      setCurrentPassInput('admin123');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-w-md w-full flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs text-amber-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {isRtl ? 'تعديل كلمة مرور الأستاذ' : 'Modifier le mot de passe Enseignant'}
              </h3>
              <p className="text-[11px] text-blue-100">
                {isRtl ? 'تأمين الولوج لفضاء إدارة التقويمات' : 'Sécurisation de l\'accès au portail enseignant'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Status Message */}
          {statusMsg && (
            <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 animate-in fade-in ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="flex-1 leading-relaxed">{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3.5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? 'كلمة المرور الحالية :' : 'Mot de passe actuel :'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassInput}
                  onChange={(e) => setCurrentPassInput(e.target.value)}
                  placeholder="Mot de passe actuel..."
                  className="w-full py-2.5 px-3.5 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? 'كلمة المرور الجديدة :' : 'Nouveau mot de passe :'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Au moins 4 caractères..."
                  className="w-full py-2.5 px-3.5 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRtl ? 'تأكيد كلمة المرور الجديدة :' : 'Confirmer le nouveau mot de passe :'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer..."
                  className="w-full py-2.5 px-3.5 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Toggle show/hide password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? (isRtl ? 'إخفاء الرموز' : 'Masquer') : (isRtl ? 'إظهار الرموز' : 'Afficher les mots de passe')}</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer mt-1"
            >
              {isRtl ? 'حفظ كلمة المرور الجديدة' : 'Enregistrer le nouveau mot de passe'}
            </button>
          </form>

          {/* Emergency Fallback Section - Visible only when connected teacher opens this modal */}
          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-3xl space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-800">
                    {isRtl ? 'كلمة المرور الاحتياطية المعتمدة :' : 'Mot de passe de secours :'}
                  </span>
                  <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg select-all">
                    admin123
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {isRtl
                    ? 'في حال نسيت كلمة المرور الخاصة بك، يمكنك دائماً استعمال كلمة المرور الاحتياطية (admin123) المسجلة في ملف pass-secours.txt.'
                    : 'En cas d\'oubli de votre mot de passe, vous pouvez toujours utiliser le mot de passe de secours admin123 (enregistré dans pass-secours.txt).'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetToEmergencyDefault}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 text-indigo-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isRtl ? 'استعادة كلمة المرور الاحتياطية (admin123)' : 'Réinitialiser au mot de passe de secours (admin123)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
