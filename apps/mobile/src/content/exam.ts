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

export const READING_PASSAGE =
  'La médiathèque du centre-ville propose désormais un service de prêt entre bibliothèques. Les lecteurs inscrits peuvent commander un livre disponible dans une autre médiathèque du réseau et le retirer ici sous trois jours ouvrés. Ce service est gratuit pour les abonnés.';

export const READING_SAMPLE: ChoiceQuestion[] = [
  {
    id: 'r1',
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
    prompt: 'Le retrait du livre se fait…',
    options: [
      'le jour même de la commande',
      'sous trois jours ouvrés',
      'uniquement le samedi',
      'après un mois d’attente',
    ],
    answer: 1,
  },
];

export const WRITING_B_CONSIGNE = 'Expression écrite — Tâche B';
export const WRITING_B_SUBJECT =
  'Vous écrivez au courrier des lecteurs d’un journal pour donner votre point de vue sur les transports en commun dans votre ville : faut-il les rendre gratuits ? Donnez au moins trois arguments et justifiez votre position. (200 mots minimum, 35 minutes)';
export const WRITING_B_FLOOR = 200;

export const SPEAKING_B_CONSIGNE = 'Expression orale — Tâche B';
export const SPEAKING_B_DOCUMENT =
  'Annonce : « Venez découvrir notre nouveau parc municipal ! Espaces verts, pistes cyclables, aires de jeux pour enfants et concerts gratuits chaque dimanche. Entrée libre. » Présentez ce document à votre ami(e) puis essayez de le/la convaincre de vous y accompagner ce week-end.';
export const PARTNER_LABEL = 'Examinateur IA (démo)';
export const PARTNER_DISCLAIMER =
  'Ce partenaire est une démonstration d’intelligence artificielle, pas un vrai examinateur.';
export const SPEAKING_MAX_TURNS = 3;
