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
}

export const SHORTENED_NOTE =
  'Version démo raccourcie : la version complète de 40 questions sera disponible après le lancement.';

export const LISTENING_CONSIGNE =
  'Consigne : vous allez entendre un document. Choisissez la bonne réponse.';

export const LISTENING_SAMPLE: ChoiceQuestion[] = [
  {
    id: 'l1',
    prompt: 'D’après l’annonce, à quelle heure part le train pour Lyon ?',
    options: ['14 h 05', '14 h 15', '14 h 50', '15 h 05'],
    answer: 1,
  },
  {
    id: 'l2',
    prompt: 'Que doit apporter le voyageur au comptoir ?',
    options: [
      'Son passeport uniquement',
      'Son billet et une pièce d’identité',
      'Sa carte bancaire',
      'Son bagage à main',
    ],
    answer: 1,
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
