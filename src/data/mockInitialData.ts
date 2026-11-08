import { SchoolClass, Student, Skill, Question, Evaluation, EvaluationAttempt, RemediationResource, RemediationAssignment } from '../types';

export const initialClasses: SchoolClass[] = [
  {
    id: 'class-4aep-a',
    name: '4ème Année Primaire - Section A (4AEP)',
    schoolYear: '2026 - 2027',
    institution: 'École Primaire Al-Massira (Académie Régionale)',
    teacherName: 'Prof. Hassan Alami',
  },
  {
    id: 'class-4aep-b',
    name: '4ème Année Primaire - Section B (4AEP)',
    schoolYear: '2026 - 2027',
    institution: 'École Primaire Al-Massira (Académie Régionale)',
    teacherName: 'Prof. Hassan Alami',
  }
];

export const initialStudents: Student[] = Array.from({ length: 25 }, (_, i) => {
  const num = (i + 1).toString().padStart(2, '0');
  const avatars = ['🦊', '🐼', '🦁', '🦉', '🐬', '🐯', '🐨', '🦅', '🦄', '🐝'];
  return {
    id: `std-${num}`,
    studentCode: `G1340${num}`,
    displayPseudonym: `Élève G1340${num}`,
    classId: i < 15 ? 'class-4aep-a' : 'class-4aep-b',
    pin: `${1000 + i + 1}`,
    active: true,
    avatarIcon: avatars[i % avatars.length],
  };
});

export const initialSkills: Skill[] = [
  // Français
  {
    id: 'FR-01',
    code: 'FR-01',
    subjectId: 'francais',
    nameFr: 'Lecture fluide',
    nameAr: 'قراءة النصوص بطلاقة',
    domainFr: 'Lecture',
    domainAr: 'القراءة',
    descriptionFr: 'Lire à haute voix avec fluidité, respect de la ponctuation et intonation appropriée.',
    descriptionAr: 'القراءة الجهرية بطلاقة مع مراعاة علامات الترقيم والتنغيم الصوتي.',
    targetLevel: '4AEP',
  },
  {
    id: 'FR-02',
    code: 'FR-02',
    subjectId: 'francais',
    nameFr: 'Compréhension de l\'écrit',
    nameAr: 'فهم المقروء',
    domainFr: 'Compréhension',
    domainAr: 'الفهم القرائي',
    descriptionFr: 'Identifier des informations explicites et implicites dans un texte narratif ou descriptif.',
    descriptionAr: 'استخراج معلومات صريحة وضمنية من نص سردي أو وصفي.',
    targetLevel: '4AEP',
  },
  {
    id: 'FR-03',
    code: 'FR-03',
    subjectId: 'francais',
    nameFr: 'Enrichissement du vocabulaire',
    nameAr: 'توظيف المعجم والمفردات',
    domainFr: 'Vocabulaire',
    domainAr: 'المعجم',
    descriptionFr: 'Mobiliser les synonymes, antonymes et familles de mots.',
    descriptionAr: 'توظيف المرادفات والأضداد وحقول الكلمات المناسبة للسياق.',
    targetLevel: '4AEP',
  },
  {
    id: 'FR-04',
    code: 'FR-04',
    subjectId: 'francais',
    nameFr: 'Structures grammaticales',
    nameAr: 'استعمال التراكيب النحوية',
    domainFr: 'Grammaire',
    domainAr: 'التراكيب',
    descriptionFr: 'Identifier la phrase simple, le groupe nominal sujet (GNS) et le groupe verbal (GV).',
    descriptionAr: 'التمييز بين الجملة البسيطة وعناصرها: الفاعل والمفعول به والمركب الفعلي.',
    targetLevel: '4AEP',
  },
  {
    id: 'FR-05',
    code: 'FR-05',
    subjectId: 'francais',
    nameFr: 'Conjugaison des verbes usuels',
    nameAr: 'تصريف الأفعال المعتادة',
    domainFr: 'Conjugaison',
    domainAr: 'الصرف والتحويل',
    descriptionFr: 'Conjuguer au présent de l\'indicatif les verbes du 1er groupe, être et avoir.',
    descriptionAr: 'تصريف أفعال المجموعة الأولى وأفعال الكينونة والملكية في الحاضر.',
    targetLevel: '4AEP',
  },
  {
    id: 'FR-06',
    code: 'FR-06',
    subjectId: 'francais',
    nameFr: 'Orthographe lexicale et d\'accord',
    nameAr: 'الإملاء والرسم الكتابي',
    domainFr: 'Orthographe',
    domainAr: 'الإملاء',
    descriptionFr: 'Accorder en genre et en nombre le déterminant, le nom et l\'adjectif.',
    descriptionAr: 'مطابقة المحددات والأسماء والنعوت في التذكير والتأنيث والإفراد والجمع.',
    targetLevel: '4AEP',
  },
  {
    id: 'FR-07',
    code: 'FR-07',
    subjectId: 'francais',
    nameFr: 'Production de l\'écrit',
    nameAr: 'التعبير الكتابي والإنشاء',
    domainFr: 'Production écrite',
    domainAr: 'الإنتاج الكتابي',
    descriptionFr: 'Rédiger un court paragraphe cohérent de 3 à 5 phrases sur une situation familière.',
    descriptionAr: 'كتابة فقرة منسجمة من 3 إلى 5 جمل للتعبير عن موقف أو موضوع محدد.',
    targetLevel: '4AEP',
  },
  // Mathématiques
  {
    id: 'MA-01',
    code: 'MA-01',
    subjectId: 'mathematiques',
    nameFr: 'Numération jusqu\'à 999 999',
    nameAr: 'التعامل مع الأعداد حتى 999 999',
    domainFr: 'Numération',
    domainAr: 'الأعداد والحساب',
    descriptionFr: 'Lire, écrire, décomposer, comparer et ordonner les nombres jusqu\'à 999 999.',
    descriptionAr: 'قراءة وكتابة وتفكيك ومقارنة وترتيب الأعداد إلى حدود 999 999.',
    targetLevel: '4AEP',
  },
  {
    id: 'MA-02',
    code: 'MA-02',
    subjectId: 'mathematiques',
    nameFr: 'Techniques opératoires du calcul',
    nameAr: 'العمليات الحسابية الأساسية',
    domainFr: 'Calcul',
    domainAr: 'العمليات الحسابية',
    descriptionFr: 'Maîtriser l\'addition, la soustraction avec retenue et la multiplication par un nombre à 2 chiffres.',
    descriptionAr: 'إتقان الجمع والطرح بالاحتفاظ وجداء عددين بالتقنية الاعتيادية.',
    targetLevel: '4AEP',
  },
  {
    id: 'MA-03',
    code: 'MA-03',
    subjectId: 'mathematiques',
    nameFr: 'Résolution de problèmes',
    nameAr: 'حل المسائل الرياضية',
    domainFr: 'Résolution de problèmes',
    domainAr: 'حل المسائل',
    descriptionFr: 'Analyser un énoncé, choisir la bonne opération arithmétique et rédiger la phrase de réponse.',
    descriptionAr: 'فهم معطيات المسألة، اختيار العملية الرياضية المناسبة وصياغة الحل بجملة تامة.',
    targetLevel: '4AEP',
  },
  {
    id: 'MA-04',
    code: 'MA-04',
    subjectId: 'mathematiques',
    nameFr: 'Figures géométriques & Perpendicularité',
    nameAr: 'الهندسة: التوازي والتعامد والمضلعات',
    domainFr: 'Géométrie',
    domainAr: 'الهندسة',
    descriptionFr: 'Reconnaître et tracer des droites perpendiculaires, parallèles et identifier les triangles.',
    descriptionAr: 'التعرف على المستقيمات المتعامدة والمتوازية ورسمها والتعرف على المثلثات.',
    targetLevel: '4AEP',
  },
  {
    id: 'MA-05',
    code: 'MA-05',
    subjectId: 'mathematiques',
    nameFr: 'Grandeurs et Mesures',
    nameAr: 'القياس: الكتل والأطوال والتحويلات',
    domainFr: 'Mesure',
    domainAr: 'القياس',
    descriptionFr: 'Utiliser les unités de mesure de longueur (m, dm, cm, mm) et de masse (kg, g).',
    descriptionAr: 'استعمال وحدات قياس الأطوال والكتل وإجراء التحويلات في الجدول.',
    targetLevel: '4AEP',
  },
  {
    id: 'MA-06',
    code: 'MA-06',
    subjectId: 'mathematiques',
    nameFr: 'Organisation et gestion des données',
    nameAr: 'تنظيم ومعالجة البيانات',
    domainFr: 'Organisation des données',
    domainAr: 'تنظيم المعطيات',
    descriptionFr: 'Lire, interpréter et compléter un tableau ou un graphique à barres simple.',
    descriptionAr: 'قراءة وتأويل وملء جدول أو مبيان بالأشرطة انطلاقاً من وضعية محددة.',
    targetLevel: '4AEP',
  }
];

export const initialQuestions: Question[] = [
  // Français Questions
  {
    id: 'q-fr-01',
    skillId: 'FR-02',
    subjectId: 'francais',
    type: 'qcm',
    difficulty: 'facile',
    titleFr: 'Compréhension : Idée principale',
    titleAr: 'الفهم: الفكرة العامة للنص',
    promptFr: 'Texte court : "Chaque matin, Sami prépare son cartable avec soin, puis il rejoint ses camarades sur le chemin de l\'école avec le sourire."\n\nDe qui parle principalement ce texte ?',
    promptAr: 'نص قصير : "Chaque matin, Sami prépare son cartable avec soin, puis il rejoint ses camarades sur le chemin de l\'école avec le sourire."\n\nعن من يتحدث النص بالأساس؟',
    maxScore: 2,
    correctionMethod: 'auto',
    options: [
      { id: 'opt-1', textFr: 'De Sami qui va à l\'école avec enthousiasme', textAr: 'عن سامي المتوجه إلى المدرسة بحماس', isCorrect: true },
      { id: 'opt-2', textFr: 'Du maître de l\'école', textAr: 'عن أستاذ المدرسة', isCorrect: false },
      { id: 'opt-3', textFr: 'Du chauffeur du bus scolaire', textAr: 'عن سائق الحافلة', isCorrect: false },
      { id: 'opt-4', textFr: 'D\'un voyage en forêt', textAr: 'عن رحلة إلى الغابة', isCorrect: false },
    ],
    explanationFr: 'Le texte nomme directement Sami et décrit ses actions matinales pour aller à l\'école.',
  },
  {
    id: 'q-fr-02',
    skillId: 'FR-02',
    subjectId: 'francais',
    type: 'vrai_faux',
    difficulty: 'facile',
    titleFr: 'Compréhension : Information explicite',
    titleAr: 'الفهم: معلومة صريحة في النص',
    promptFr: 'D\'après la phrase précédente : "Sami va à l\'école triste et en pleurant."',
    promptAr: 'انطلاقاً من الجملة السابقة: "سامي يذهب إلى المدرسة حزيناً وباكياً."',
    maxScore: 1,
    correctionMethod: 'auto',
    correctBoolean: false,
    explanationFr: 'Faux : Le texte précise explicitement qu\'il rejoint ses camarades "avec le sourire".',
  },
  {
    id: 'q-fr-03',
    skillId: 'FR-04',
    subjectId: 'francais',
    type: 'qcm',
    difficulty: 'moyen',
    titleFr: 'Grammaire : Groupe Nominal Sujet (GNS)',
    titleAr: 'التراكيب: تحديد الفاعل (GNS)',
    promptFr: 'Dans la phrase : "Les petits oiseaux chantent sur les branches.", quel est le Groupe Nominal Sujet (GNS) ?',
    promptAr: 'في الجملة: "Les petits oiseaux chantent sur les branches."، ما هو الفاعل (GNS)؟',
    maxScore: 2,
    correctionMethod: 'auto',
    options: [
      { id: 'opt-1', textFr: 'Les petits oiseaux', textAr: 'Les petits oiseaux', isCorrect: true },
      { id: 'opt-2', textFr: 'chantent', textAr: 'chantent', isCorrect: false },
      { id: 'opt-3', textFr: 'sur les branches', textAr: 'sur les branches', isCorrect: false },
      { id: 'opt-4', textFr: 'oiseaux chantent', textAr: 'oiseaux chantent', isCorrect: false },
    ],
    explanationFr: 'Le sujet répond à la question "Qui est-ce qui chante ?" -> Les petits oiseaux.',
  },
  {
    id: 'q-fr-04',
    skillId: 'FR-05',
    subjectId: 'francais',
    type: 'fill_blanks',
    difficulty: 'moyen',
    titleFr: 'Conjugaison : Présent du 1er groupe',
    titleAr: 'الصرف: الحاضر لأفعال المجموعة الأولى',
    promptFr: 'Complète par la terminaison correcte du verbe chanter au présent :\n"Nous chant____ une jolie chanson marocaine."',
    promptAr: 'أكمل بالنهاية المناسبة لفعل chanter في الحاضر:\n"Nous chant____ une jolie chanson marocaine."',
    maxScore: 2,
    correctionMethod: 'auto',
    correctAnswerText: 'ons',
    explanationFr: 'Avec le pronom sujet "Nous", la terminaison des verbes du 1er groupe au présent est "-ons" (chantons).',
  },
  {
    id: 'q-fr-05',
    skillId: 'FR-07',
    subjectId: 'francais',
    type: 'production_ecrite',
    difficulty: 'difficile',
    titleFr: 'Production Écrite : Mon école préférée',
    titleAr: 'الإنتاج الكتابي: مدرستي الجميلة',
    promptFr: 'Consigne : Rédige un court texte de 3 à 4 phrases pour décrire ton école et dire ce que tu aimes y faire pendant la récréation.\n(Fais attention à la ponctuation, aux majuscules et aux accords).',
    promptAr: 'التعليمة: اكتب نصاً قصيراً من 3 إلى 4 جمل تصف فيه مدرستك وتذكر ما تحب ممارسته في وقت الاستراحة.\n(انتبه لعلامات الترقيم والحروف الكبيرة وسلامة الجمل).',
    maxScore: 10,
    correctionMethod: 'manual',
    rubricCriteria: [
      { id: 'crit-1', labelFr: 'Respect de la consigne (3-4 phrases sur l\'école)', labelAr: 'احترام التعليمة وعدد الجمل', maxScore: 2 },
      { id: 'crit-2', labelFr: 'Cohérence et organisation des idées', labelAr: 'انسجام الأفكار وحسن تنظيمها', maxScore: 2 },
      { id: 'crit-3', labelFr: 'Correction de la langue (syntaxe, majuscules, points)', labelAr: 'سلامة التراكيب وعلامات الترقيم', maxScore: 3 },
      { id: 'crit-4', labelFr: 'Richesse et justesse du vocabulaire', labelAr: 'توظيف معجم ملائم وثري', maxScore: 2 },
      { id: 'crit-5', labelFr: 'Soin et lisibilité de la rédaction', labelAr: 'وضوح الكتابة والعناية بها', maxScore: 1 },
    ],
    explanationFr: 'Correction effectuée par l\'enseignant selon la grille critériée normalisée du 4AEP.',
  },

  // Mathématiques Questions
  {
    id: 'q-ma-01',
    skillId: 'MA-01',
    subjectId: 'mathematiques',
    type: 'qcm',
    difficulty: 'facile',
    titleFr: 'Numération : Valeur de position du chiffre',
    titleAr: 'الأعداد: القيمة الوضعية للأرقام',
    promptFr: 'Dans le nombre 48 520, que représente le chiffre 8 ?',
    promptAr: 'في العدد 48 520 ، ماذا يمثل الرقم 8 ؟',
    maxScore: 2,
    correctionMethod: 'auto',
    options: [
      { id: 'opt-1', textFr: 'Le chiffre des unités de mille (8 000)', textAr: 'رقم وحدات الآلاف (8 000)', isCorrect: true },
      { id: 'opt-2', textFr: 'Le chiffre des dizaines (80)', textAr: 'رقم العشرات (80)', isCorrect: false },
      { id: 'opt-3', textFr: 'Le chiffre des centaines (800)', textAr: 'رقم المئات (800)', isCorrect: false },
      { id: 'opt-4', textFr: 'Le chiffre des dizaines de mille (80 000)', textAr: 'رقم عشرات الآلاف (80 000)', isCorrect: false },
    ],
    explanationFr: 'Dans 48 520 : 0 est l\'unité, 2 est la dizaine, 5 est la centaine, 8 est l\'unité de mille (8 000).',
  },
  {
    id: 'q-ma-02',
    skillId: 'MA-02',
    subjectId: 'mathematiques',
    type: 'short_answer',
    difficulty: 'moyen',
    titleFr: 'Calcul : Multiplication posée',
    titleAr: 'الحساب: عملية الضرب',
    promptFr: 'Calcule le résultat de : 125 × 4 = ?',
    promptAr: 'احسب نتيجة الجداء التالي: 125 × 4 = ؟',
    maxScore: 2,
    correctionMethod: 'auto',
    correctAnswerText: '500',
    explanationFr: '125 × 4 = (100 × 4) + (25 × 4) = 400 + 100 = 500.',
  },
  {
    id: 'q-ma-03',
    skillId: 'MA-02',
    subjectId: 'mathematiques',
    type: 'short_answer',
    difficulty: 'moyen',
    titleFr: 'Calcul : Soustraction avec retenue',
    titleAr: 'الحساب: عملية الطرح بالاحتفاظ',
    promptFr: 'Calcule : 750 - 280 = ?',
    promptAr: 'احسب عملية الطرح: 750 - 280 = ؟',
    maxScore: 2,
    correctionMethod: 'auto',
    correctAnswerText: '470',
    explanationFr: '750 - 280 = 470.',
  },
  {
    id: 'q-ma-04',
    skillId: 'MA-03',
    subjectId: 'mathematiques',
    type: 'problem_solving',
    difficulty: 'difficile',
    titleFr: 'Résolution de problème : Achat de livres pour la classe',
    titleAr: 'مسألة رياضية: شراء كتب لخزانة القسم',
    promptFr: 'Énoncé : La coopérative scolaire dispose de 600 dirhams. Le maître achète 8 contes à 45 DH l\'un.\n1) Quel est le prix total des contes ?\n2) Combien de dirhams reste-t-il à la coopérative ?\n\nÉcris tes calculs et tes phrases de réponse.',
    promptAr: 'نص المسألة: تتوفر تعاونية القسم على 600 درهم. اشترى الأستاذ 8 قصص بثمن 45 درهماً للقصة الواحدة.\n1) ما هو الثمن الإجمالي للقصص؟\n2) كم درهماً بقي في صندوق التعاونية؟\n\nاكتب العمليات وجمل الحل.',
    maxScore: 5,
    correctionMethod: 'manual',
    rubricCriteria: [
      { id: 'crit-p1', labelFr: 'Compréhension et choix des opérations (Multiplication puis Soustraction)', labelAr: 'فهم الوضعية واختيار العمليات المناسبة (الضرب ثم الطرح)', maxScore: 1.5 },
      { id: 'crit-p2', labelFr: 'Justesse du calcul de la dépense (8 × 45 = 360 DH)', labelAr: 'صحة حساب ثمن القصص (8 × 45 = 360 درهم)', maxScore: 1.5 },
      { id: 'crit-p3', labelFr: 'Justesse du calcul du reste (600 - 360 = 240 DH)', labelAr: 'صحة حساب المبلغ المتبقي (600 - 360 = 240 درهم)', maxScore: 1.0 },
      { id: 'crit-p4', labelFr: 'Formulation claire des phrases de réponse avec unités (DH)', labelAr: 'صياغة جملة الحل واضحة مع ذكر الوحدة (درهم)', maxScore: 1.0 },
    ],
    explanationFr: '1) Prix des contes = 8 × 45 = 360 DH. 2) Reste = 600 - 360 = 240 DH.',
  },
  {
    id: 'q-ma-05',
    skillId: 'MA-04',
    subjectId: 'mathematiques',
    type: 'qcm',
    difficulty: 'moyen',
    titleFr: 'Géométrie : Droites perpendiculaires',
    titleAr: 'الهندسة: المستقيمات المتعامدة',
    promptFr: 'Deux droites qui se coupent en formant un angle droit (90°) sont appelées :',
    promptAr: 'مستقيمان يتقاطعان ويكونان زاوية قائمة (90 درجة) يسميان :',
    maxScore: 2,
    correctionMethod: 'auto',
    options: [
      { id: 'opt-1', textFr: 'Des droites perpendiculaires', textAr: 'مستقيمان متعامدان', isCorrect: true },
      { id: 'opt-2', textFr: 'Des droites parallèles', textAr: 'مستقيمان متوازيان', isCorrect: false },
      { id: 'opt-3', textFr: 'Des segments courbes', textAr: 'قطع منحنية', isCorrect: false },
    ],
    explanationFr: 'Deux droites sécantes formant un angle droit sont strictement perpendiculaires.',
  },

  // 1. New Question Type: Ordering (Remise en ordre) - Français
  {
    id: 'q-fr-06',
    skillId: 'FR-04',
    subjectId: 'francais',
    type: 'ordering',
    difficulty: 'moyen',
    titleFr: 'Grammaire : Remise en ordre d\'une phrase',
    titleAr: 'التراكيب: ترتيب الكلمات لتكوين جملة تامة',
    promptFr: 'Remets ces étiquettes dans le bon ordre pour former une phrase correcte :',
    promptAr: 'رتب الكلمات التالية لتكوين جملة مفيدة تامة المعنى :',
    maxScore: 3,
    correctionMethod: 'auto',
    orderingItems: ['Chaque matin,', 'les élèves', 'entrent en classe', 'dans le calme.'],
    explanationFr: 'Ordre canonique : Complément circonstanciel + Sujet + Verbe + Complément de manière.',
  },

  // 2. New Question Type: Matching (Relier les éléments) - Français
  {
    id: 'q-fr-07',
    skillId: 'FR-03',
    subjectId: 'francais',
    type: 'matching',
    difficulty: 'moyen',
    titleFr: 'Vocabulaire : Relier chaque mot à son contraire',
    titleAr: 'المعجم: ربط الكلمات بأضدادها المقابلة',
    promptFr: 'Relie chaque adjectif à son antonyme (contraire) :',
    promptAr: 'صل كل صفة بضدها المناسب :',
    maxScore: 4,
    correctionMethod: 'auto',
    matchingPairs: [
      { id: 'm1', left: 'Grand (كبير)', right: 'Petit (صغير)' },
      { id: 'm2', left: 'Rapide (سريع)', right: 'Lent (بطيء)' },
      { id: 'm3', left: 'Facile (سهل)', right: 'Difficile (صعب)' },
      { id: 'm4', left: 'Généreux (كريم)', right: 'Avare (بخيل)' },
    ],
    explanationFr: 'Grand <-> Petit, Rapide <-> Lent, Facile <-> Difficile, Généreux <-> Avare.',
  },

  // 3. New Question Type: Categorization (Classification en tableau) - Français
  {
    id: 'q-fr-08',
    skillId: 'FR-04',
    subjectId: 'francais',
    type: 'categorization',
    difficulty: 'moyen',
    titleFr: 'Grammaire : Classer les Noms propres et Noms communs',
    titleAr: 'التراكيب: تصنيف أسماء العلم والأسماء المشتركة في جدول',
    promptFr: 'Classe chaque nom dans la catégorie appropriée :',
    promptAr: 'صنّف كل اسم في الخانة المناسبة (اسم علم / اسم مشترك) :',
    maxScore: 4,
    correctionMethod: 'auto',
    categories: [
      { id: 'cat-propre', nameFr: 'Noms Propres (أسماء علم)', nameAr: 'أسماء علم', items: ['Rabat', 'Maroc', 'Sami'] },
      { id: 'cat-commun', nameFr: 'Noms Communs (أسماء مشتركة)', nameAr: 'أسماء مشتركة', items: ['arbre', 'cartable', 'maison'] },
    ],
    explanationFr: 'Les noms propres commencent par une majuscule et désignent un être ou lieu unique.',
  },

  // 4. New Question Type: Odd One Out (Trouver l\'intrus) - Français
  {
    id: 'q-fr-09',
    skillId: 'FR-05',
    subjectId: 'francais',
    type: 'odd_one_out',
    difficulty: 'facile',
    titleFr: 'Conjugaison : Trouver le verbe intrus',
    titleAr: 'الصرف: تحديد الفعل الدخيل غير المنتمي للمجموعة',
    promptFr: 'Tous ces verbes sont du 1er groupe (-ER) SAUF UN. Trouve le verbe intrus :',
    promptAr: 'جميع هذه الأفعال تنتمي إلى المجموعة الأولى ما عدا فعلاً واحداً دخيلاً. حدده :',
    maxScore: 2,
    correctionMethod: 'auto',
    oddOneOutItems: [
      { id: 'od-1', textFr: 'Marcher (يمشي)', isOdd: false },
      { id: 'od-2', textFr: 'Chanter (يغني)', isOdd: false },
      { id: 'od-3', textFr: 'Finir (ينهي)', isOdd: true },
      { id: 'od-4', textFr: 'Dessiner (يرسم)', isOdd: false },
    ],
    explanationFr: '"Finir" est un verbe du 2ème groupe (nous finissons), les autres sont du 1er groupe (-er).',
  },

  // 5. New Question Type: Ordering (Rangement croissant) - Mathématiques
  {
    id: 'q-ma-06',
    skillId: 'MA-01',
    subjectId: 'mathematiques',
    type: 'ordering',
    difficulty: 'moyen',
    titleFr: 'Numération : Ranger les nombres dans l\'ordre croissant',
    titleAr: 'الأعداد: ترتيب الأعداد تزايدياً من الأصغر إلى الأكبر',
    promptFr: 'Range ces nombres du plus petit au plus grand (ordre croissant <) :',
    promptAr: 'رتب الأعداد التالية تزايدياً من الأصغر إلى الأكبر :',
    maxScore: 3,
    correctionMethod: 'auto',
    orderingItems: ['14 500', '28 750', '65 200', '99 100'],
    explanationFr: '14 500 < 28 750 < 65 200 < 99 100.',
  },

  // 6. New Question Type: Matching (Géométrie et propriétés) - Mathématiques
  {
    id: 'q-ma-07',
    skillId: 'MA-04',
    subjectId: 'mathematiques',
    type: 'matching',
    difficulty: 'moyen',
    titleFr: 'Géométrie : Relier la figure géométrique à sa propriété',
    titleAr: 'الهندسة: ربط الشكل الهندسي بخاصيته المناسبة',
    promptFr: 'Relie chaque concept géométrique à sa définition exacte :',
    promptAr: 'صل كل عنصر هندسي بتعريفه الدقيق :',
    maxScore: 4,
    correctionMethod: 'auto',
    matchingPairs: [
      { id: 'gm1', left: 'Carré (مربع)', right: '4 côtés égaux et 4 angles droits' },
      { id: 'gm2', left: 'Triangle rectangle (مثلث قائم الزاوية)', right: 'Possède 1 angle droit' },
      { id: 'gm3', left: 'Droites parallèles (مستقيمان متوازيان)', right: 'Ne se coupent jamais' },
      { id: 'gm4', left: 'Droites perpendiculaires (مستقيمان متعامدان)', right: 'Se coupent à angle droit (90°)' },
    ],
    explanationFr: 'Propriétés fondamentales des figures et droites du programme 4AEP.',
  },

  // 7. New Question Type: Categorization (Mesures) - Mathématiques
  {
    id: 'q-ma-08',
    skillId: 'MA-05',
    subjectId: 'mathematiques',
    type: 'categorization',
    difficulty: 'moyen',
    titleFr: 'Mesure : Classer les unités de Longueur et de Masse',
    titleAr: 'القياس: تصنيف وحدات الأطوال ووحدات الكتل',
    promptFr: 'Classe chaque unité de mesure dans la bonne colonne :',
    promptAr: 'صنّف كل وحدة في المجموعة المناسبة (أطوال / كتل) :',
    maxScore: 4,
    correctionMethod: 'auto',
    categories: [
      { id: 'c-long', nameFr: 'Unités de Longueur (وحدات الأطوال)', nameAr: 'وحدات الأطوال', items: ['mètre (m)', 'centimètre (cm)', 'kilomètre (km)'] },
      { id: 'c-mass', nameFr: 'Unités de Masse (وحدات الكتل)', nameAr: 'وحدات الكتل', items: ['kilogramme (kg)', 'gramme (g)', 'tonne (t)'] },
    ],
    explanationFr: 'Le mètre (et ses sous-multiples) mesure les longueurs ; le gramme mesure les masses.',
  },

  // 8. New Question Type: Odd One Out (Calcul) - Mathématiques
  {
    id: 'q-ma-09',
    skillId: 'MA-02',
    subjectId: 'mathematiques',
    type: 'odd_one_out',
    difficulty: 'facile',
    titleFr: 'Calcul : Trouver le nombre intrus',
    titleAr: 'الحساب: تحديد العدد الدخيل غير المضاعف لـ 5',
    promptFr: 'Tous ces nombres sont des multiples de 5 (se terminent par 0 ou 5) SAUF UN. Trouve l\'intrus :',
    promptAr: 'جميع هذه الأعداد هي مضاعفات للعدد 5 ما عدا عدداً واحداً دخيلاً. حدده :',
    maxScore: 2,
    correctionMethod: 'auto',
    oddOneOutItems: [
      { id: 'mi-1', textFr: '25', isOdd: false },
      { id: 'mi-2', textFr: '40', isOdd: false },
      { id: 'mi-3', textFr: '37', isOdd: true },
      { id: 'mi-4', textFr: '50', isOdd: false },
    ],
    explanationFr: '37 ne se termine ni par 0 ni par 5, ce n\'est pas un multiple de 5.',
  },

  // 9. Drag & Drop Text Cloze Question - Français
  {
    id: 'q-fr-10',
    skillId: 'FR-02',
    subjectId: 'francais',
    type: 'drag_drop_text',
    difficulty: 'moyen',
    titleFr: 'Texte à trous (Glisser-Déposer) : La journée de Sami',
    titleAr: 'إتمام نص بسحب وإفلات الكلمات: يوميات سامي',
    promptFr: 'Glisse ou place les mots de la boîte dans les bons trous du texte :',
    promptAr: 'اسحب أو ضع الكلمات المناسبة من الصندوق في فراغات النص :',
    maxScore: 4,
    correctionMethod: 'auto',
    dragDropTemplate: 'Chaque matin, Sami prépare son [1] avec soin. Il marche vers [2] avec ses camarades pour écouter la leçon du [3]. À la récréation, ils jouent joyeusement dans la [4].',
    dragDropSlots: [
      { slotIndex: 1, expectedWord: 'cartable' },
      { slotIndex: 2, expectedWord: "l'école" },
      { slotIndex: 3, expectedWord: 'maître' },
      { slotIndex: 4, expectedWord: 'cour' },
    ],
    dragDropWordBank: ['cartable', "l'école", 'maître', 'cour', 'voiture', 'forêt'],
    explanationFr: 'Texte narratif reconstitué avec les mots clés de la vie scolaire.',
  },

  // 10. Drag & Drop Text Cloze Question - Mathématiques
  {
    id: 'q-ma-10',
    skillId: 'MA-04',
    subjectId: 'mathematiques',
    type: 'drag_drop_text',
    difficulty: 'moyen',
    titleFr: 'Maths à trous (Glisser-Déposer) : Vocabulaire mathématique',
    titleAr: 'إتمام نص رياضي بسحب وإفلات المصطلحات',
    promptFr: 'Complète la règle mathématique en glissant les termes dans les bons espaces :',
    promptAr: 'أتمم القاعدة الرياضية بسحب المصطلحات إلى مواضعها الصحيحة :',
    maxScore: 4,
    correctionMethod: 'auto',
    dragDropTemplate: "Dans une multiplication, le résultat s'appelle le [1]. Si on multiplie un nombre par [2], le résultat est toujours 0. Deux droites perpendiculaires forment un [3] mesurant [4] degrés.",
    dragDropSlots: [
      { slotIndex: 1, expectedWord: 'produit' },
      { slotIndex: 2, expectedWord: 'zéro' },
      { slotIndex: 3, expectedWord: 'angle droit' },
      { slotIndex: 4, expectedWord: '90' },
    ],
    dragDropWordBank: ['produit', 'zéro', 'angle droit', '90', 'somme', '180'],
    explanationFr: 'Définitions du produit, de la multiplication par zéro et des angles droits (90°).',
  }
];

export const initialEvaluations: Evaluation[] = [
  {
    id: 'eval-diag-01',
    titleFr: 'Évaluation Diagnostique Initiale (Pré-Test 4AEP)',
    titleAr: 'التقويم التشخيصي الأولي (الروائز القبلية للمستوى الرابع)',
    descriptionFr: 'Mesure des prérequis fondamentaux en compréhension, calcul et numération en début d\'année.',
    descriptionAr: 'قياس المكتسبات القبلية في الفهم والحساب والأعداد عند انطلاق الموسم الدراسي.',
    subjectId: 'francais',
    type: 'diagnostic',
    classId: 'class-4aep-a',
    questionIds: ['q-fr-01', 'q-fr-02', 'q-fr-03', 'q-fr-04', 'q-ma-01', 'q-ma-02'],
    totalScore: 11,
    durationMinutes: 45,
    status: 'active',
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'eval-form-01',
    titleFr: 'Évaluation Formative : Français - Unité 1 (Diversifiée)',
    titleAr: 'تقويم تكويني متنوع: اللغة الفرنسية - الوحدة الأولى',
    descriptionFr: 'Vérification complète : Compréhension, Grammaire, Ordre des mots, Appariement, Classification et Expression.',
    descriptionAr: 'تقويم شامل يجمع بين الفهم، التراكيب، ترتيب الكلمات، المزاوجة، التصنيف، والإنتاج الكتابي.',
    subjectId: 'francais',
    type: 'formatif',
    classId: 'class-4aep-a',
    questionIds: ['q-fr-01', 'q-fr-02', 'q-fr-03', 'q-fr-10', 'q-fr-06', 'q-fr-07', 'q-fr-08', 'q-fr-09', 'q-fr-04', 'q-fr-05'],
    totalScore: 34,
    durationMinutes: 45,
    status: 'active',
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'eval-form-02',
    titleFr: 'Évaluation Formative : Mathématiques (Diversifiée)',
    titleAr: 'تقويم تكويني متنوع: الرياضيات والمهارات المتعددة',
    descriptionFr: 'Contrôle continu : Numération, Rangement croissant, Calcul, Intrus, Géométrie, Mesures, Texte à trous et Problèmes.',
    descriptionAr: 'مراقبة مستمرة تشمل الأعداد، الترتيب التزايدي، الحساب، العنصر الدخيل، الهندسة، وحدات القياس، إتمام النص والمسائل.',
    subjectId: 'mathematiques',
    type: 'formatif',
    classId: 'class-4aep-a',
    questionIds: ['q-ma-01', 'q-ma-06', 'q-ma-02', 'q-ma-09', 'q-ma-10', 'q-ma-07', 'q-ma-08', 'q-ma-04', 'q-ma-05'],
    totalScore: 28,
    durationMinutes: 45,
    status: 'active',
    createdAt: '2026-10-25T11:00:00Z',
  }
];

// Realistic attempts for class students to power dashboards and research analytics
export const generateInitialAttempts = (): EvaluationAttempt[] => {
  const attempts: EvaluationAttempt[] = [];

  // 1. Diagnostic attempts for all 25 students (closed & corrected)
  initialStudents.forEach((student, index) => {
    // Generate realistic grades spanning our 4 tiers
    // A few students struggling (<50%), some developing (50-74%), many proficient (75-89%), and some mastery (>=90%)
    let scoreMod = 0;
    if (index < 4) scoreMod = 0.42; // struggling (<50%)
    else if (index < 11) scoreMod = 0.65; // en cours (50-74%)
    else if (index < 20) scoreMod = 0.82; // maîtrisé (75-89%)
    else scoreMod = 0.95; // très bien maîtrisé (>=90%)

    const q1Score = scoreMod > 0.5 ? 2 : 0;
    const q2Score = scoreMod > 0.4 ? 1 : 0;
    const q3Score = scoreMod > 0.6 ? 2 : (scoreMod > 0.45 ? 1 : 0);
    const q4Score = scoreMod > 0.65 ? 2 : 0;
    const qma1Score = scoreMod > 0.5 ? 2 : 0;
    const qma2Score = scoreMod > 0.6 ? 2 : 0;

    const total = q1Score + q2Score + q3Score + q4Score + qma1Score + qma2Score;
    const maxScore = 11;
    const percentage = Math.round((total / maxScore) * 100);

    attempts.push({
      id: `att-diag-${student.studentCode}`,
      evaluationId: 'eval-diag-01',
      studentId: student.id,
      startedAt: '2026-09-15T09:05:00Z',
      submittedAt: '2026-09-15T09:40:00Z',
      maxScore,
      totalScore: total,
      percentage,
      status: 'corrected',
      answers: {
        'q-fr-01': { questionId: 'q-fr-01', studentResponse: q1Score === 2 ? 'opt-1' : 'opt-2', scoreObtained: q1Score, maxScore: 2, isCorrect: q1Score === 2 },
        'q-fr-02': { questionId: 'q-fr-02', studentResponse: q2Score === 1 ? false : true, scoreObtained: q2Score, maxScore: 1, isCorrect: q2Score === 1 },
        'q-fr-03': { questionId: 'q-fr-03', studentResponse: q3Score === 2 ? 'opt-1' : 'opt-2', scoreObtained: q3Score, maxScore: 2, isCorrect: q3Score === 2 },
        'q-fr-04': { questionId: 'q-fr-04', studentResponse: q4Score === 2 ? 'ons' : 'ez', scoreObtained: q4Score, maxScore: 2, isCorrect: q4Score === 2 },
        'q-ma-01': { questionId: 'q-ma-01', studentResponse: qma1Score === 2 ? 'opt-1' : 'opt-3', scoreObtained: qma1Score, maxScore: 2, isCorrect: qma1Score === 2 },
        'q-ma-02': { questionId: 'q-ma-02', studentResponse: qma2Score === 2 ? '500' : '450', scoreObtained: qma2Score, maxScore: 2, isCorrect: qma2Score === 2 },
      },
      generalFeedback: percentage >= 75 
        ? "Très bon travail en début d'année. Poursuis sur cette dynamique."
        : percentage >= 50
        ? "Bases convenables mais vigilance requise sur la conjugaison et la multiplication."
        : "Difficultés repérées en compréhension et numération. Programme de soutien recommandé."
    });
  });

  // 2. Formative French test attempts (15 students already submitted, some corrected, some waiting for teacher rubric)
  initialStudents.slice(0, 15).forEach((student, index) => {
    const isTeacherCorrected = index < 10;
    const basePct = 0.55 + ((index % 6) * 0.08);
    const autoScore = (basePct > 0.6 ? 2 : 0) + 1 + (basePct > 0.5 ? 2 : 0) + (basePct > 0.7 ? 2 : 0);
    const rubricScores = isTeacherCorrected ? {
      'crit-1': basePct > 0.6 ? 2 : 1,
      'crit-2': basePct > 0.7 ? 2 : 1,
      'crit-3': basePct > 0.8 ? 3 : 2,
      'crit-4': basePct > 0.7 ? 2 : 1,
      'crit-5': 1,
    } : undefined;

    const rubricTotal = rubricScores ? Object.values(rubricScores).reduce((a, b) => a + b, 0) : 0;
    const totalScore = isTeacherCorrected ? autoScore + rubricTotal : autoScore;
    const maxScore = 17;

    attempts.push({
      id: `att-form1-${student.studentCode}`,
      evaluationId: 'eval-form-01',
      studentId: student.id,
      startedAt: '2026-10-20T10:05:00Z',
      submittedAt: '2026-10-20T10:35:00Z',
      maxScore,
      totalScore: isTeacherCorrected ? totalScore : undefined,
      percentage: isTeacherCorrected ? Math.round((totalScore / maxScore) * 100) : undefined,
      status: isTeacherCorrected ? 'corrected' : 'submitted',
      answers: {
        'q-fr-01': { questionId: 'q-fr-01', studentResponse: 'opt-1', scoreObtained: 2, maxScore: 2, isCorrect: true },
        'q-fr-02': { questionId: 'q-fr-02', studentResponse: false, scoreObtained: 1, maxScore: 1, isCorrect: true },
        'q-fr-03': { questionId: 'q-fr-03', studentResponse: 'opt-1', scoreObtained: 2, maxScore: 2, isCorrect: true },
        'q-fr-04': { questionId: 'q-fr-04', studentResponse: 'ons', scoreObtained: 2, maxScore: 2, isCorrect: true },
        'q-fr-05': {
          questionId: 'q-fr-05',
          studentResponse: "Mon école est grande et fleurie. J'aime lire des livres dans la cour pendant la récréation avec mes amis. J'adore les cours de mathématiques.",
          scoreObtained: isTeacherCorrected ? rubricTotal : undefined,
          maxScore: 10,
          rubricScores,
          teacherComment: isTeacherCorrected ? "Bon paragraphe descriptif. Veille aux accords en nombre des adjectifs." : undefined,
        }
      },
      generalFeedback: isTeacherCorrected ? "Progression notable dans l'expression écrite." : undefined
    });
  });

  return attempts;
};

export const initialRemediationResources: RemediationResource[] = [
  {
    id: 'res-rem-01',
    skillId: 'FR-02',
    subjectId: 'francais',
    titleFr: 'Fiche d\'entraînement : Repérer les indices dans un texte',
    titleAr: 'بطاقة داعمة: استخراج المؤشرات الصريحة والضمنية من النص',
    type: 'fiche',
    objectiveFr: 'Aider l\'élève à surligner les mots-clés qui répondent à Qui ? Où ? Quand ?',
    objectiveAr: 'مساعدة المتعلم على تحديد الكلمات المفاتيح التي تجيب عن: من؟ أين؟ متى؟',
    contentFr: 'Pour bien comprendre un texte narratif :\n1. Lis le titre et observe l\'illustration.\n2. Repère les personnages principaux (Qui ?).\n3. Identifie le lieu et le moment de l\'action (Où et Quand ?).\n4. Ne devine pas au hasard : trouve la phrase exacte du texte.',
    contentAr: 'لفهم نص سردي فهماً سليماً:\n1. اقرأ العنوان ولاحظ الصورة المصاحبة.\n2. حدد الشخصيات الرئيسية (من؟).\n3. حدد مكان وزمان الحدث (أين؟ ومتى؟).\n4. استخرج الجملة التي تتضمن المعلومة بدقة.',
    difficulty: 'facile',
    practiceQuestions: [
      {
        question: 'Quelle question permet de trouver le lieu dans un texte ?',
        options: ['Qui ?', 'Où ?', 'Pourquoi ?', 'Combien ?'],
        correctIndex: 1,
        explanation: '"Où ?" indique le lieu géographique où se déroule l\'action.'
      }
    ]
  },
  {
    id: 'res-rem-02',
    skillId: 'FR-05',
    subjectId: 'francais',
    titleFr: 'Atelier de remédiation : Le présent des verbes en -ER',
    titleAr: 'ورشة المعالجة: تصريف أفعال المجموعة الأولى في الحاضر',
    type: 'exercice',
    objectiveFr: 'Stabiliser la mémorisation des terminaisons régulières : -e, -es, -e, -ons, -ez, -ent.',
    objectiveAr: 'تثبيت نهايات أفعال المجموعة الأولى في الحاضر: e, -es, -e, -ons, -ez, -ent-',
    contentFr: 'Règle d\'or :\nPour conjuguer un verbe en -ER au présent (comme sauter, chanter, ranger) :\nOn retire -ER pour garder le radical, puis on ajoute :\nJe -> -e\nTu -> -es\nIl/Elle -> -e\nNous -> -ons\nVous -> -ez\nIls/Elles -> -ent',
    contentAr: 'قاعدة أساسية:\nلتصريف فعل منتهي بـ ER في الحاضر، نحذف ER ونضيف النهايات المناسبة لكل ضمير.',
    difficulty: 'moyen',
    practiceQuestions: [
      {
        question: 'Tu (parler) avec gentillesse. Quelle est la bonne terminaison ?',
        options: ['parle', 'parles', 'parlons', 'parlez'],
        correctIndex: 1,
        explanation: 'Avec "Tu", on met toujours "-es" : Tu parles.'
      }
    ]
  },
  {
    id: 'res-rem-03',
    skillId: 'MA-02',
    subjectId: 'mathematiques',
    titleFr: 'Technique opératoire : La soustraction posée avec retenue',
    titleAr: 'التقنية الاعتيادية: الطرح بالاحتفاظ خطوة بخطوة',
    type: 'fiche',
    objectiveFr: 'Maîtriser la compensation ou le cassage de dizaine sans erreur d\'oubli.',
    objectiveAr: 'التمكن من تقنية الطرح بالاحتفاظ دون نسيان إرجاع الاحتفاظ إلى الرتبة الموالية.',
    contentFr: 'Méthode pratique :\n1. Aligne verticalement unités sous unités, dizaines sous dizaines, centaines sous centaines.\n2. Si le chiffre du haut est plus petit que celui du bas (ex: 2 - 5 impossible) :\nAjoute 1 dizaine en haut (12) et ajoute 1 retenue au chiffre du bas de la colonne suivante.',
    contentAr: 'الخطوات العملية:\n1. ضع الوحدات تحت الوحدات والعشرات تحت العشرات.\n2. عندما يكون رقم المطروح منه أصغر من المطروح، نضيف 10 إلى الأعلى ونضيف 1 إلى رتبة العشرات بالأسفل.',
    difficulty: 'moyen',
    practiceQuestions: [
      {
        question: 'Combien fait 52 - 17 ?',
        options: ['45', '35', '36', '42'],
        correctIndex: 1,
        explanation: '12 - 7 = 5, puis 5 - 2 = 3. Le résultat est 35.'
      }
    ]
  },
  {
    id: 'res-rem-04',
    skillId: 'MA-03',
    subjectId: 'mathematiques',
    titleFr: 'Guide méthodique : Résoudre un problème en 4 étapes',
    titleAr: 'الدليل المنهجي: حل مسألة رياضية في 4 خطوات ذهبية',
    type: 'fiche',
    objectiveFr: 'Structurer le raisonnement logique avant d\'écrire les nombres.',
    objectiveAr: 'بناء التفكير المنطقي لاختيار العملية الحسابية الصحيحة.',
    contentFr: 'Les 4 étapes du champion de mathématiques :\n1. Je lis attentivement l\'histoire et j\'entoure les nombres utiles.\n2. Je cherche ce que l\'on me demande (le mot-clé : reste, total, fois plus).\n3. J\'écris l\'opération en ligne puis posée.\n4. Je rédige la phrase de conclusion avec l\'unité (DH, kg, mètres).',
    contentAr: 'الخطوات الأربع لحل المسألة:\n1. قراءة نص المسألة وتحديد المعطيات الأساسية.\n2. تحديد المطلوب وفهم السؤال.\n3. اختيار العملية المناسبة وإنجازها.\n4. كتابة جملة الحل مع ذكر الوحدة المناسبة.',
    difficulty: 'difficile',
    practiceQuestions: [
      {
        question: 'Le mot "reste" dans une question oriente généralement vers :',
        options: ['Une soustraction (-)', 'Une addition (+)', 'Une division (:)', 'Une géométrie'],
        correctIndex: 0,
        explanation: 'Pour trouver ce qu\'il reste après une dépense ou une perte, on fait une soustraction.'
      }
    ]
  }
];

export const initialRemediationAssignments: RemediationAssignment[] = [
  {
    id: 'asg-01',
    studentId: 'std-01', // ELEVE-A01 had difficulties in diagnostic
    resourceId: 'res-rem-01',
    skillId: 'FR-02',
    assignedAt: '2026-09-18T10:00:00Z',
    status: 'completed',
    completedAt: '2026-09-22T14:30:00Z',
    studentNotes: 'J\'ai bien compris comment repérer les personnages.'
  },
  {
    id: 'asg-02',
    studentId: 'std-02', // ELEVE-A02
    resourceId: 'res-rem-02',
    skillId: 'FR-05',
    assignedAt: '2026-09-18T10:00:00Z',
    status: 'completed',
    completedAt: '2026-09-23T11:00:00Z',
  },
  {
    id: 'asg-03',
    studentId: 'std-03', // ELEVE-A03
    resourceId: 'res-rem-03',
    skillId: 'MA-02',
    assignedAt: '2026-09-19T09:00:00Z',
    status: 'pending',
  },
  {
    id: 'asg-04',
    studentId: 'std-04', // ELEVE-A04
    resourceId: 'res-rem-04',
    skillId: 'MA-03',
    assignedAt: '2026-09-19T09:00:00Z',
    status: 'pending',
  }
];
