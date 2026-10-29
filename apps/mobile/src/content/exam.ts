/**
 * French exam content (TEF Canada only). UI chrome stays English; everything
 * the learner reads as exam material is French. Shortened demo mock:
 * Listening and Reading carry 2 sample questions each, with an in-app note
 * that the full 40-question version comes after launch.
 */

export interface ChoiceQuestion {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  answer: number;
  /** French transcript read aloud by TTS (listening demo). */
  transcript?: string;
  /** Per-answer feedback shown in practice mode (listening demo). */
  fbRight?: string;
  fbWrong?: string;
}

export const SHORTENED_NOTE =
  'Version démo raccourcie : la version complète de 40 questions sera disponible après le lancement.';

export const LISTENING_CONSIGNE =
  'Consigne : vous allez entendre un document. Choisissez la bonne réponse.';

export const LISTENING_RULES = [
  '9 questions, 10 minutes. Le chronomètre démarre au premier document et ne s’arrête jamais.',
  'Chaque document est lu une seule fois : l’audio démarre tout seul, sans pause ni retour.',
  'La question n’est jamais écrite : seules les quatre propositions sont affichées. Répondez pendant la pause de 10 secondes.',
  'Vos réponses sont enregistrées automatiquement, y compris à la fin du temps imparti.',
];

export type ListeningImageKey = 'station' | 'airport' | 'ferry' | 'bus';

export interface ListeningQuestion {
  id: string;
  /** Spoken by TTS, never displayed during the test. */
  spoken: string;
  options: [string, string, string, string];
  /** Illustrations only: 2x2 image grid instead of text options. */
  images?: [ListeningImageKey, ListeningImageKey, ListeningImageKey, ListeningImageKey];
  answer: number;
}

export interface ListeningDoc {
  id: string;
  group: string;
  title: string;
  /** Read aloud by TTS (every document has one, Illustrations included). */
  transcript?: string;
  /** Listen count shown in the panel (demo: 1 everywhere). */
  plays: number;
  questions: ListeningQuestion[];
}

/**
 * Listening demo: 8 documents, 9 questions, order A-H, one question per
 * type except Interviews (2 follow-up questions on one document).
 * Checking rule for every new item: the correct answer is said directly
 * in the transcript, distractors never appear in it, exactly 4 options,
 * nothing beyond the transcript. Micro-trottoirs is shortened to 1 person
 * here; the full version has 3 people on the same topic.
 */
export const LISTENING_DEMO: ListeningDoc[] = [
  {
    id: 'a',
    group: 'Illustrations',
    title: 'Quatre lieux',
    plays: 1,
    transcript:
      'Regardez bien les quatre images. Vous êtes à l’aéroport : devant vous, le comptoir d’enregistrement, avec les valises sur le tapis roulant.',
    questions: [
      {
        id: 'a1',
        spoken: 'Où se trouve la personne qui parle ?',
        options: ['La gare', "L'aéroport", 'Le port', "L'arrêt de bus"],
        images: ['station', 'airport', 'ferry', 'bus'],
        answer: 1,
      },
    ],
  },
  {
    id: 'b',
    group: 'Annonces publiques',
    title: 'Train pour Lyon',
    plays: 1,
    transcript:
      'Mesdames et messieurs, le train Intercités numéro soixante-six douze à destination de Lyon partira à quatorze heures quinze, voie numéro quatre. Embarquement immédiat.',
    questions: [
      {
        id: 'b1',
        spoken: 'D’après l’annonce, à quelle heure part le train pour Lyon ?',
        options: ['14 h 05', '14 h 15', '14 h 50', '15 h 05'],
        answer: 1,
      },
    ],
  },
  {
    id: 'c',
    group: 'Messages téléphoniques',
    title: 'Cabinet dentaire',
    plays: 1,
    transcript:
      'Bonjour, c’est le cabinet du docteur Lemoine. Votre rendez-vous de demain est déplacé à jeudi à dix heures. Merci de confirmer dès que possible.',
    questions: [
      {
        id: 'c1',
        spoken: 'Que dit le message ?',
        options: [
          'Le rendez-vous est annulé.',
          'Le médecin est en retard.',
          'Le rendez-vous est déplacé à jeudi dix heures.',
          'Il faut payer la consultation.',
        ],
        answer: 2,
      },
    ],
  },
  {
    id: 'd',
    group: 'Micro-trottoirs',
    title: 'Le vélo en ville',
    plays: 1,
    transcript: 'Moi, je vais au travail à vélo : c’est rapide et ça ne pollue pas.',
    questions: [
      {
        id: 'd1',
        spoken: 'Que pense cette personne du vélo ?',
        options: ['Elle préfère la voiture.', 'C’est trop dangereux.', 'C’est rapide et propre.', 'C’est trop cher.'],
        answer: 2,
      },
    ],
  },
  {
    id: 'e',
    group: 'Chroniques radio',
    title: 'Festival de jazz',
    plays: 1,
    transcript: 'Ce week-end, la ville organise son festival de jazz : douze concerts gratuits sur la grande place.',
    questions: [
      {
        id: 'e1',
        spoken: 'De quoi parle la chronique ?',
        options: [
          'D’un festival de jazz gratuit.',
          'D’un match de football.',
          'D’une grève des trains.',
          'D’un nouveau musée.',
        ],
        answer: 0,
      },
    ],
  },
  {
    id: 'f',
    group: 'Interviews',
    title: 'Agence Horizon',
    plays: 1,
    transcript:
      'Agence Horizon, bonjour ! Bonjour, je voudrais décaler mon départ et partir en semaine. Très bien. J’ai une place le 14, en semaine, et c’est moins cher. Parfait, je prends le 14 alors. C’est noté, vous partez le 14. Bon voyage !',
    questions: [
      {
        id: 'f1',
        spoken: 'Pourquoi la cliente appelle-t-elle l’agence ?',
        options: [
          'Pour annuler une réservation.',
          'Pour réclamer un remboursement.',
          'Pour modifier la date de son départ.',
          'Pour réserver un hôtel.',
        ],
        answer: 2,
      },
      {
        id: 'f2',
        spoken: 'Quand la cliente décide-t-elle de partir ?',
        options: [
          'Elle part le week-end du 16.',
          'Elle part le 14, en semaine.',
          'Elle annule son voyage.',
          'Elle attend une promotion.',
        ],
        answer: 1,
      },
    ],
  },
  {
    id: 'g',
    group: 'Reportage',
    title: 'Marché couvert',
    plays: 1,
    transcript: 'Après deux ans de travaux, le marché couvert rouvre ses portes samedi, avec quarante commerçants.',
    questions: [
      {
        id: 'g1',
        spoken: 'Qu’annonce le reportage ?',
        options: [
          'La fermeture d’une école.',
          'L’ouverture d’une piscine.',
          'La réouverture du marché samedi.',
          'Un concert annulé.',
        ],
        answer: 2,
      },
    ],
  },
  {
    id: 'h',
    group: 'Documents divers',
    title: 'Au comptoir',
    plays: 1,
    transcript:
      'Bonjour, je viens pour échanger mon billet. Très bien. Présentez-moi votre billet et une pièce d’identité au comptoir, s’il vous plaît.',
    questions: [
      {
        id: 'h1',
        spoken: 'Que doit apporter le voyageur au comptoir ?',
        options: [
          'Son passeport uniquement',
          'Son billet et une pièce d’identité',
          'Sa carte bancaire',
          'Son bagage à main',
        ],
        answer: 1,
      },
    ],
  },
];

export const READING_CONSIGNE =
  'Consigne : lisez le document puis choisissez la bonne réponse.';

export const READING_GROUP = 'Documents du quotidien';

export const READING_RULES = [
  '6 questions, 10 minutes, cinq groupes de documents. Le chronomètre s’affiche en haut à droite.',
  'Vous pouvez circuler librement entre les questions et modifier vos réponses.',
  'Le bouton « Terminer l’épreuve » n’apparaît qu’après la dernière question : une fois validé, plus aucune modification n’est possible.',
  'Il n’y a aucun outil de marquage. Notez vous-même le numéro de l’écran si vous passez une question.',
];

export type ReadingQType = 'text-mcq' | 'sentence-gap' | 'text-gap' | 'chart';

export interface ReadingDoc {
  id: string;
  title: string;
  source: string;
  text: string[];
}

export interface ReadingQuestion {
  id: string;
  group: string;
  type: ReadingQType;
  /** Text-mcq questions point at one of READING_DOCS; gap/chart carry their own card. */
  docId?: string;
  /** Shown question text. Gap questions use the design instruction sentence. */
  prompt: string;
  /** Gap sentence/text split around the slot (gap types only). */
  before?: string;
  after?: string;
  options: [string, string, string, string];
  answer: number;
}

export interface ReadingChart {
  label: string;
  title: string;
  source: string;
  bars: { year: string; v: number }[];
  max: number;
  rule: number;
  question: string;
  options: [string, string, string, string];
  answer: number;
}

export const READING_DOCS: ReadingDoc[] = [
  {
    id: 'rdoc1',
    title: 'Prêt entre bibliothèques : un nouveau service',
    source: 'Médiathèque du centre-ville · avis aux lecteurs',
    text: [
      'La médiathèque du centre-ville propose désormais un service de prêt entre bibliothèques. Les lecteurs inscrits peuvent commander un livre disponible dans une autre médiathèque du réseau et le retirer ici sous trois jours ouvrés. Ce service est gratuit pour les abonnés.',
    ],
  },
  {
    id: 'rdoc2',
    title: 'Avis aux résidents',
    source: 'Copropriété Les Tilleuls',
    text: [
      'L’ascenseur du bâtiment B sera hors service du 12 au 16 mai pour des travaux de modernisation. Pendant cette période, merci d’utiliser l’escalier ou l’ascenseur du bâtiment A. La gardienne reste à votre disposition. Le syndic.',
    ],
  },
  {
    id: 'rdoc3',
    title: 'Le retour des bureaux à la campagne',
    source: 'Le Devoir · mars 2024 · Camille Roy',
    text: [
      'Il y a cinq ans, Sophie Béchard louait vingt postes de travail au centre-ville de Montréal. Aujourd’hui, son agence de traduction occupe l’ancienne quincaillerie d’un village de deux mille habitants, à deux heures de route de son ancien bureau.',
      'Le calcul semble évident : le loyer a baissé de soixante pour cent. Ce n’est pas le loyer qui les décide, admet-elle, mais le fait de garder des salariés qui allaient partir. Trois de ses traductrices avaient annoncé leur départ pour des régions plus abordables ; l’agence a préféré les suivre.',
      'Le mouvement reste minoritaire. Selon l’Institut de la statistique, moins de quatre pour cent des entreprises de services ont déménagé hors des grands centres depuis 2020. Mais celles qui l’ont fait déclarent un taux de rétention supérieur de onze points à la moyenne de leur secteur.',
      'Tout n’est pas résolu pour autant. Le recrutement de profils très spécialisés devient plus lent, et les municipalités concernées manquent souvent de places en garderie et de logements locatifs — deux conditions que les nouveaux arrivants citent avant le prix du terrain.',
      'Sophie Béchard, elle, ne prévoit pas de revenir. Elle garde toutefois un espace de réunion loué à la journée en ville, « pour les clients qui n’ont pas encore compris qu’on travaille très bien à quatre-vingts kilomètres d’eux ».',
    ],
  },
];

/** Demo: 6 questions, 5 groups, 4 types (no ordering, no graph-matching). */
export const READING_QUESTIONS: ReadingQuestion[] = [
  {
    id: 'r1',
    group: 'Documents du quotidien',
    type: 'text-mcq',
    docId: 'rdoc1',
    prompt: 'Ce service permet de…',
    options: [
      'acheter des livres d’occasion',
      'emprunter un livre d’une autre médiathèque',
      'rendre un livre en retard sans frais',
      's’inscrire à un atelier de lecture',
    ],
    answer: 1,
  },
  {
    id: 'r2',
    group: 'Phrases lacunaires',
    type: 'sentence-gap',
    prompt: 'Choisissez le mot ou l’expression qui complète la phrase.',
    before: 'Les entreprises qui ouvrent un bureau en région le font',
    after: 'pour retenir leurs employés.',
    options: ['d’abord', 'rarement', 'malgré tout', 'en principe'],
    answer: 0,
  },
  {
    id: 'r3',
    group: 'Textes lacunaires',
    type: 'text-gap',
    prompt: 'Choisissez le mot ou l’expression qui complète le texte.',
    before: 'Il pleut depuis ce matin, mais le marché du samedi a lieu comme',
    after: '. Les commerçants ont installé leurs stands sous des barnums et les clients sont venus nombreux malgré le mauvais temps.',
    options: ['prévu', 'annulé', 'payant', 'rarement'],
    answer: 0,
  },
  {
    id: 'r4',
    group: 'Lecture rapide',
    type: 'chart',
    prompt: 'En quelle année la part du vélo dépasse-t-elle 10 % pour la première fois ?',
    options: ['En 2015', 'En 2018', 'En 2021', 'En 2024'],
    answer: 2,
  },
  {
    id: 'r5',
    group: 'Documents administratifs et professionnels',
    type: 'text-mcq',
    docId: 'rdoc2',
    prompt: 'Pendant les travaux, les résidents doivent…',
    options: [
      'utiliser l’escalier ou l’ascenseur du bâtiment A',
      'quitter l’immeuble avant le 12 mai',
      'payer un supplément de charges',
      'contacter la mairie de leur arrondissement',
    ],
    answer: 0,
  },
  {
    id: 'r6',
    group: 'Article de presse',
    type: 'text-mcq',
    docId: 'rdoc3',
    prompt: 'Qu’est-ce qui a décidé Sophie Béchard à quitter le centre-ville ?',
    options: [
      'La baisse du loyer de son bureau.',
      'Le départ annoncé de plusieurs employées.',
      'Une demande de ses clients montréalais.',
      'Un programme d’aide municipal.',
    ],
    answer: 1,
  },
];

/** Design chart example, used exactly (Lecture rapide demo chart-as-document). */
export const READING_CHART: ReadingChart = {
  label: 'DOCUMENT · Ville de Sherbrooke',
  title: 'Part du vélo dans les déplacements quotidiens',
  source: 'Enquête origine-destination · 2024',
  bars: [
    { year: '2015', v: 6 },
    { year: '2018', v: 9 },
    { year: '2021', v: 14 },
    { year: '2024', v: 23 },
  ],
  max: 30,
  rule: 10,
  question: 'En quelle année la part du vélo dépasse-t-elle 10 % pour la première fois ?',
  options: ['En 2015', 'En 2018', 'En 2021', 'En 2024'],
  answer: 2,
};

// Contest scope cut (owner decision): stage 0 builds section B only.
// Section A stays in the file, hidden behind INCLUDE_SECTION_A — flip the
// flag to bring it back, no rewrite needed.
export const INCLUDE_SECTION_A = false;

export interface WritingTask {
  section: 'A' | 'B';
  kicker: string;
  title: string;
  consigne: string;
  short: string;
  docLabel: string;
  doc: string;
  min: number;
  placeholder: string;
}

// Full Writing demo content (both TEF tasks). Mirrors WritingTest.dc.html;
// drafts start empty on the phone so the candidate actually writes.
export const WRITING_TASKS_ALL: WritingTask[] = [
  {
    section: 'A',
    kicker: 'Tâche 1 · section A',
    title: 'Terminer un fait divers',
    consigne:
      "Vous êtes journaliste. Voici le début d'un fait divers paru dans la presse locale. Rédigez la suite de l'article en quatre-vingts mots au minimum, en gardant le même ton.",
    short: 'Rédigez la suite de ce fait divers en gardant le ton de la presse locale. 80 mots minimum.',
    docLabel: "DÉBUT DE L'ARTICLE",
    doc: '« Mardi matin, les habitants du quartier Saint-Roch ont découvert que la fontaine de la place avait retrouvé son eau, trente ans après avoir été fermée. Personne ne savait encore qui… »',
    min: 80,
    placeholder: "Continuez l'article…",
  },
  {
    section: 'B',
    kicker: 'Tâche 2 · section B',
    title: 'Exprimer et défendre un point de vue',
    consigne:
      "Votre ville envisage d'interdire les voitures dans le centre historique le week-end. Vous écrivez au courrier des lecteurs du journal local pour donner votre avis et le justifier en deux cents mots au minimum.",
    short: 'Écrivez au courrier des lecteurs pour donner votre avis sur la fermeture du centre aux voitures. 200 mots minimum.',
    docLabel: 'COURRIER DES LECTEURS',
    doc: '« Centre-ville sans voiture le week-end : la mairie consulte les habitants jusqu’au 15 avril » — Le Journal de la Ville, mars 2025.',
    min: 200,
    placeholder: 'Madame, Monsieur,',
  },
];

export const WRITING_TASKS: WritingTask[] = INCLUDE_SECTION_A
  ? WRITING_TASKS_ALL
  : WRITING_TASKS_ALL.filter((t) => t.section === 'B');

export const WRITING_RULES_ALL = [
  'Deux textes, 10 minutes en tout pour cette démo. Vous répartissez le temps comme vous voulez : rien n’est imposé par texte.',
  'Tâche A : terminer un fait divers, 80 mots minimum. Tâche B : défendre un point de vue, 200 mots minimum.',
  "Un clavier d'accents est disponible à l'écran. Le champ est en texte brut : l'orthographe et la grammaire sont évaluées, la mise en page non.",
  'Les deux textes sont envoyés ensemble. À la fin du temps imparti, ils partent tels quels.',
];

export const WRITING_RULES = INCLUDE_SECTION_A
  ? WRITING_RULES_ALL
  : [
      'Un seul texte : défendre un point de vue, 200 mots minimum. 10 minutes pour cette démo (35 minutes à l’examen).',
      "Un clavier d'accents est disponible à l'écran. Le champ est en texte brut : l'orthographe et la grammaire sont évaluées, la mise en page non.",
      'Le texte est envoyé une seule fois. À la fin du temps imparti, il part tel quel.',
    ];

export const WRITING_NOTE =
  'Le compteur de mots et l’alerte de minimum sont propres à l’application. L’examen annonce un minimum mais rien ne confirme qu’il compte les mots ou bloque un texte trop court.';

export const WRITING_ACCENTS = [
  'é',
  'è',
  'ê',
  'ë',
  'à',
  'â',
  'î',
  'ï',
  'ô',
  'ù',
  'û',
  'ü',
  'ç',
  'œ',
  '«',
  '»',
];

export const WRITING_CRITERIA = [
  'Respect de la situation',
  'Organisation du texte',
  'Lexique',
  'Syntaxe',
];

export const WRITING_DEMO_SECS = 600;

export interface SpeakingTurn {
  at: number;
  who: 'you' | 'ex';
  text: string;
}

export interface SpeakingTask {
  section: 'A' | 'B';
  kicker: string;
  title: string;
  consigne: string;
  short: string;
  docLabel: string;
  doc: string;
  prep: number;
  max: number;
  maxLabel: string;
  format: string;
  turns: SpeakingTurn[];
}

// Full Speaking demo content (both TEF sections). Examiner cues mirror
// SpeakingTest.dc.html; durations are measured live, never seeded. Section
// A is hidden behind INCLUDE_SECTION_A (same flag as Writing).
export const SPEAKING_TASKS_ALL: SpeakingTask[] = [
  {
    section: 'A',
    kicker: 'Tâche 1 · section A',
    title: 'Obtenir des informations',
    consigne:
      "Vous avez vu cette annonce dans un journal local. Vous téléphonez à l'atelier pour obtenir plus d'informations. Posez une dizaine de questions à votre interlocuteur.",
    short: "Vous téléphonez à l'atelier pour obtenir des informations. Posez une dizaine de questions.",
    docLabel: 'ANNONCE',
    doc: 'Atelier Le Panier — cours de cuisine française. Petits groupes de six personnes, quatre samedis de suite. Inscription avant le 30 mars.',
    prep: 60,
    max: 300,
    maxLabel: '5:00',
    format: "Jeu de rôle formel avec l'examinateur",
    turns: [
      { at: 0, who: 'you', text: "Bonjour, je vous appelle au sujet de votre atelier de cuisine." },
      { at: 14, who: 'ex', text: "Bonjour ! Oui, l'atelier Le Panier. Que voulez-vous savoir ?" },
      { at: 42, who: 'you', text: 'Posez vos questions : dates, prix, niveau, matériel, nombre de places…' },
      { at: 96, who: 'ex', text: 'Les quatre samedis, de 10 h à 13 h. Le matériel est fourni.' },
      { at: 150, who: 'you', text: 'Relancez : demandez une précision sur ce qu’il vient de dire.' },
      { at: 214, who: 'ex', text: 'Il reste deux places. Souhaitez-vous que je vous inscrive ?' },
    ],
  },
  {
    section: 'B',
    kicker: 'Tâche 2 · section B',
    title: 'Présenter et convaincre',
    consigne:
      "Votre entreprise envisage de passer à la semaine de quatre jours. Vous êtes favorable au projet. Présentez la situation à un collègue hésitant et convainquez-le de signer la proposition.",
    short: 'Présentez la situation à un collègue hésitant et convainquez-le de signer la proposition.',
    docLabel: 'DOCUMENT',
    doc: '« La semaine de quatre jours : moins d’heures, autant de travail ? » — note interne, mars 2025.',
    prep: 60,
    max: 600,
    maxLabel: '10:00',
    format: "Jeu de rôle informel avec l'examinateur",
    turns: [
      { at: 0, who: 'you', text: 'Présentez le document à votre collègue : de quoi il s’agit, et ce que vous en pensez.' },
      { at: 40, who: 'ex', text: "Quatre jours, d'accord, mais on va devoir tout finir en moins de temps, non ?" },
      { at: 120, who: 'you', text: 'Répondez à son objection, puis donnez un argument concret.' },
      { at: 240, who: 'ex', text: 'Et les clients ? Ils appellent le vendredi, eux.' },
      { at: 360, who: 'you', text: 'Proposez une solution et invitez-le à signer la proposition.' },
      { at: 480, who: 'ex', text: "Bon… si l'essai ne dure que trois mois, je veux bien y réfléchir." },
    ],
  },
];

export const SPEAKING_TASKS: SpeakingTask[] = INCLUDE_SECTION_A
  ? SPEAKING_TASKS_ALL
  : SPEAKING_TASKS_ALL.filter((t) => t.section === 'B');

export const SPEAKING_RULES_ALL = [
  'Deux sections, 15 minutes en tout. La section A dure 5 minutes, la section B 10 minutes.',
  "Chaque section commence par une minute de découverte du sujet. La prise de notes n'est pas autorisée.",
  "Un examinateur vous fait face et joue le rôle de votre interlocuteur. Vous l'entendez : rien n'est écrit, ni ici ni le jour de l'examen.",
  "Tout est enregistré une seule fois. Il n'y a pas de seconde prise le jour de l'examen.",
];

export const SPEAKING_RULES = INCLUDE_SECTION_A
  ? SPEAKING_RULES_ALL
  : [
      'Une seule partie, 10 minutes : présenter et convaincre.',
      "La partie commence par une minute de découverte du sujet. La prise de notes n'est pas autorisée.",
      "Un examinateur vous fait face et joue le rôle de votre interlocuteur. Vous l'entendez : rien n'est écrit, ni ici ni le jour de l'examen.",
      "Tout est enregistré une seule fois. Il n'y a pas de seconde prise le jour de l'examen.",
    ];

export const SPEAKING_NOTE =
  "Le retour de l'IA ne concerne que l'entraînement. Le jour de l'examen, deux examinateurs notent l'enregistrement.";

export const SPEAKING_CRITERIA = ['Présentation des faits', 'Argumentation', 'Interaction', 'Lexique'];

export const PARTNER_LABEL = 'Examinateur IA (démo)';
export const PARTNER_DISCLAIMER =
  'Ce partenaire est une démonstration d’intelligence artificielle, pas un vrai examinateur.';
