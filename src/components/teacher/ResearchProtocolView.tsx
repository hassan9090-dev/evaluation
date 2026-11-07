import React from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../locales/translations';
import { 
  GraduationCap, BookOpen, GitMerge, FileCheck, Award, 
  Database, ShieldCheck, CheckCircle2, ChevronRight, Sparkles
} from 'lucide-react';

export const ResearchProtocolView: React.FC = () => {
  const { lang, isRtl } = useApp();
  const t = translations[lang];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-7 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            {isRtl ? 'مشروع بحث تطبيقي وتطوير رقمي (R&D)' : 'Mémoire de Master • Recherche-Développement (R&D)'}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-2">
          {isRtl 
            ? 'الإطار الأكاديمي والبروتوكول التجريبي لمشروع ÉVAL\'PROGRESS' 
            : 'Cadre Épistémologique & Protocole Expérimental du Projet ÉVAL\'PROGRESS'}
        </h2>
        <p className="text-slate-300 text-xs md:text-sm max-w-3xl leading-relaxed">
          {isRtl
            ? 'دراسة بحثية تطبيقية حول أثر المنصة الرقمية في تحسين رصد صعوبات التعلم وتتبع مكتسبات تلاميذ المستوى الرابع ابتدائي في مادتي الفرنسية والرياضيات وفق المنهجية المختلطة (كمية ونوعية).'
            : 'Étude d\'ingénierie pédagogique évaluant l\'impact d\'une plateforme numérique d\'évaluation par compétences sur le repérage des difficultés et l\'orientation de la remédiation en 4AEP.'}
        </p>
      </div>

      {/* Problematic & Research Hypotheses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Problematic */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <BookOpen className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              {isRtl ? 'الإشكالية المركزية (Problématique)' : 'Problématique Centrale'}
            </h3>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs italic leading-relaxed mb-4">
            « Dans quelle mesure la conception et l'expérimentation d'une plateforme numérique d'évaluation et de suivi des apprentissages peuvent-elles contribuer à améliorer le repérage des difficultés et le suivi des acquis des élèves de quatrième année du primaire en français et en mathématiques ? »
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isRtl 
              ? 'تجاوز التقويم التقليدي القائم على النقطة العددية الصماء نحو تقويم معياري ميكروسكوبي يرصد مستوى التحكم في كل مهارة ويوجه أنشطة المعالجة الفورية.' 
              : 'Passage d\'une évaluation sommative chiffrée globale à une granularité par compétence favorisant la régulation pédagogique immédiate.'}
          </p>
        </div>

        {/* Card 2: Hypotheses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <GitMerge className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              {isRtl ? 'فرضيات البحث (Hypothèses)' : 'Hypothèses de Recherche (H1 - H4)'}
            </h3>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-start gap-2">
              <strong className="text-indigo-700 font-mono">H1 :</strong>
              <span>Facilite le suivi longitudinal des acquis individuels et collectifs par compétence.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-start gap-2">
              <strong className="text-indigo-700 font-mono">H2 :</strong>
              <span>Affine le diagnostic précoce des obstacles d'apprentissage spécifiques.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-start gap-2">
              <strong className="text-indigo-700 font-mono">H3 :</strong>
              <span>Optimise la pertinence didactique des activités de remédiation assignées.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-start gap-2">
              <strong className="text-indigo-700 font-mono">H4 :</strong>
              <span>Allège la charge administrative de notation et d'analyse statistique de l'enseignant.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step Experimental Protocol */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" />
          <span>{isRtl ? 'المراحل الخمس للبروتوكول التجريبي (Protocole Expérimental)' : 'Protocole Expérimental en 5 Étapes'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2">
              1
            </span>
            <h4 className="font-bold text-xs text-slate-900 mb-1">Préparation</h4>
            <p className="text-[11px] text-slate-500">
              Autorisations éthiques, modélisation des compétences et calibrage de la banque de questions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2">
              2
            </span>
            <h4 className="font-bold text-xs text-slate-900 mb-1">Pré-Test</h4>
            <p className="text-[11px] text-slate-500">
              Passation du test diagnostique initial pour mesurer l'état zéro des acquis (S_pre).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2">
              3
            </span>
            <h4 className="font-bold text-xs text-slate-900 mb-1">Expérimentation</h4>
            <p className="text-[11px] text-slate-500">
              Utilisation en classe, détection des difficultés et dispensation du soutien personnalisé.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2">
              4
            </span>
            <h4 className="font-bold text-xs text-slate-900 mb-1">Post-Test</h4>
            <p className="text-[11px] text-slate-500">
              Passation de l'évaluation finale équivalente pour calculer l'indice de progression (P).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2">
              5
            </span>
            <h4 className="font-bold text-xs text-slate-900 mb-1">Analyse & Bilan</h4>
            <p className="text-[11px] text-slate-500">
              Triangulation quantitative (statistiques descriptives) et qualitative (satisfaction).
            </p>
          </div>
        </div>
      </div>

      {/* Master Thesis Outline & Innovation Pitch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Thesis Chapters */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              {isRtl ? 'هيكلة فصول مذكرة الماستر' : 'Structure du Mémoire Académique'}
            </h3>
          </div>
          <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside">
            <li><strong>Chapitre 1 :</strong> Cadre théorique (Évaluation formative & compétences)</li>
            <li><strong>Chapitre 2 :</strong> Évaluation numérique et instrumentation pédagogique</li>
            <li><strong>Chapitre 3 :</strong> Méthodologie de la recherche-action</li>
            <li><strong>Chapitre 4 :</strong> Conception technique et modélisation des données (MCD/MLD)</li>
            <li><strong>Chapitre 5 :</strong> Développement itératif du MVP</li>
            <li><strong>Chapitre 6 :</strong> Expérimentation en milieu scolaire (4AEP)</li>
            <li><strong>Chapitre 7 :</strong> Discussion des résultats, limites et perspectives</li>
          </ol>
        </div>

        {/* Teacher Innovation Contest Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Award className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                {isRtl ? 'ملف مسابقة الأستاذ المبتكر' : 'Valorisation : Prix de l\'Enseignant Innovant'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {isRtl 
                ? 'الابتكار المحوري: الربط العضوي المباشر بين نتائج التقويم ومؤشرات التحكم في المهارات مع فضاء فوري لأنشطة المعالجة والدعم، مع احترام تام لخصوصية التلميذ.' 
                : 'L\'atout distinctif réside dans le pont automatique créé entre la mesure chiffrée, le diagnostic microscopique par compétence et l\'attribution directe de fiches de remédiation individualisées.'}
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                Transférabilité assurée
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                PWA & Mode Hors-ligne
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                Conformité CNDP
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
            « La technologie ne remplace pas le jugement pédagogique de l'enseignant ; elle lui fournit des données structurées pour mieux comprendre les apprentissages et orienter ses interventions. »
          </div>
        </div>
      </div>
    </div>
  );
};
