/**
 * Données du chapitre « Orthographe des mots » (CM2) : faits cités et banques de phrases écrites pour l'exercice.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 * Dans les phrases, « … » marque la place d'un mot à écrire. Aucun prénom dans les phrases.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';

const f = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => f(id, PROGRAMME, citation);

/** Mot de la famille dont l'Académie dit qu'il vient du mot court (ou en est tiré). */
const derive = (id: string, citation: string) => f(`om2-${id}`, `academie-om2-${id}`, citation);

export const FAITS_ORTHOGRAPHE_CM2: readonly Fait[] = [
  prog(
    'om2-mots-frequents',
    'Écrire correctement les mots fréquents en s’appuyant sur les régularités et la formation.',
  ),
  prog('om2-homonyme', 'Radical, préfixe, suffixe, synonyme, antonyme, homonyme, polysémie'),
  prog('om2-substitution', 'substitution (ou remplacement)'),
  prog('om2-relations', 'Approfondir les relations morphologiques et sémantiques entre les mots'),
  f('om2-ou', 'academie-om2-ou', "Ou sert à unir dans une même phrase les deux termes d'une alternative"),
  f('om2-ou-lieu', 'academie-om2-ou-accent', 'En quel lieu, en quel endroit ?'),
  f('om2-ou-moment', 'academie-om2-ou-accent', 'un nom désignant un moment ou une durée'),
  f(
    'om2-la-article',
    'academie-om2-le-determinant',
    "L'article défini introduit un nom commun qui désigne une personne ou une chose bien déterminée",
  ),
  f('om2-la-elision', 'academie-om2-le-determinant', "le e ou le a s'élide devant une voyelle ou un h muet"),
  f('om2-la-pronom', 'academie-om2-le-pronom', 'à représenter une personne ou une chose dont il a été question'),
  f('om2-la-lieu', 'academie-om2-la-accent', "Désigne un lieu, un endroit autre que celui où l'on est"),
  f(
    'om2-a',
    'academie-a',
    'La préposition À introduit un complément rattaché à un verbe, à un nom, à un adjectif ou à un adverbe',
  ),
  f('om2-avoir', 'academie-avoir', "j'ai, tu as, il a, nous avons, vous avez, ils ont ; j'avais, nous avions"),
  f('om2-ce', 'academie-om2-ce', 'Sert à désigner la personne, la chose, la notion dont il est question'),
  f(
    'om2-ce-pronom',
    'academie-om2-ce-pronom',
    'Ce désigne ou reprend la chose ou la notion à laquelle on pense ou dont on parle',
  ),
  f(
    'om2-se',
    'academie-om2-se',
    'Forme atone du pronom personnel réfléchi de la troisième personne du singulier et du pluriel',
  ),
  f('om2-leur-pronom', 'cnrtl-om2-leur-pronom', 'leur signifie « à eux, à elles »'),
  f('om2-leur-place', 'cnrtl-om2-leur-pronom', 'est placé avant le verbe'),
  f(
    'om2-leur-singulier',
    'academie-om2-leur',
    'Leur reste au singulier si plusieurs personnes possèdent communément un même objet',
  ),
  f('om2-leur-pluriel', 'academie-om2-leur', 'il se met au pluriel lorsque chaque personne possède plusieurs objets'),
  f('om2-quel', 'academie-om2-quel', 'Quel est cet homme ?'),
  f('om2-quelle', 'academie-om2-quel', 'Quelles sont ses intentions ?'),
  f('om2-que-elision', 'academie-om2-que', "e s'élide devant une voyelle ou un h muet"),
  f(
    'om2-elle',
    'academie-om2-il',
    "Pronom personnel masculin (pluriel Ils ; féminin Elle, voir ce mot). Ne s'emploie qu'en fonction de sujet",
  ),
  f(
    'om2-muet',
    'academie-om2-muet',
    "Se dit d'une voyelle ou d'une consonne qui, bien qu'elle figure dans un mot, ne se prononce pas",
  ),
  f(
    'om2-derivation',
    'academie-om2-derivation',
    "mode de formation d'un mot à partir d'un autre au moyen d'un préfixe ou d'un suffixe",
  ),
  derive('dentiste', 'Dérivé de dent.'),
  derive('grandir', 'Dérivé de grand.'),
  derive('petitesse', 'Dérivé de petit.'),
  derive('bavarder', 'Dérivé de bavard.'),
  derive('laitage', 'Dérivé de lait.'),
  derive('border', 'Dérivé de bord.'),
  derive('literie', 'Dérivé de lit.'),
  derive('grosseur', 'Dérivé de gros.'),
  derive('grisaille', 'Dérivé de gris.'),
  derive('chaton', 'Dérivé de chat.'),
  derive('hauteur', 'Dérivé de haut.'),
  derive('longueur', 'Dérivé de long.'),
  derive('camper', 'Dérivé de camp.'),
  derive('draperie', 'Dérivé de drap.'),
  derive('plombier', 'Dérivé de plomb.'),
  derive('dossier', 'Dérivé de dos.'),
  derive('boiser', 'Dérivé de bois.'),
  derive('larder', 'Dérivé de lard.'),
  derive('gourmandise', 'Dérivé de gourmand.'),
  derive('renardeau', 'Dérivé de renard.'),
  derive('debut', 'Déverbal de débuter.'),
  derive('regard', 'Déverbal de regarder.'),
  derive('retard', 'Déverbal de retarder.'),
  derive('accord', "Déverbal d'accorder."),
  derive('repos', 'Déverbal de reposer'),
];

export const faitOrthographeCm2 = (id: string): Fait => {
  const x = FAITS_ORTHOGRAPHE_CM2.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + articles de dictionnaire) des faits cités par une notion. */
export const sourcesOrthographeCm2 = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitOrthographeCm2(id).source)]),
];

// ───────────────────────── Mots qui se prononcent pareil ─────────────────────────

/** Un emploi précis d'un mot : un même mot écrit peut avoir deux emplois (« leur » pronom ou déterminant). */
export interface EmploiCm2 {
  readonly mot: string;
  /** Qui est ce mot, en une phrase courte. */
  readonly role: string;
  /** Comment vérifier que c'est bien lui. */
  readonly essai: string;
}

/** Une phrase à un ou plusieurs trous, avec l'emploi attendu dans chaque trou (clé de `emplois`). */
export interface PhraseCm2 {
  readonly texte: string;
  readonly cles: readonly string[];
}

export interface Serie {
  readonly emplois: Readonly<Record<string, EmploiCm2>>;
  /** Proposition nettement différente (niveau 1, quand il n'y a que deux mots). */
  readonly intrus?: { readonly mot: string; readonly why: string };
  /** Indice commun (ne donne pas la réponse). */
  readonly indice: string;
  /** Un seul trou : niveaux 1 à 3. */
  readonly simples: readonly PhraseCm2[];
  /** Plusieurs trous, cas piégeux : niveaux 4 et 5. */
  readonly doubles: readonly PhraseCm2[];
}

const p = (texte: string, ...cles: string[]): PhraseCm2 => ({ texte, cles });

export const OU_OU: Serie = {
  emplois: {
    ou: {
      mot: 'ou',
      role: '« ou » sert à choisir entre deux choses.',
      essai: 'On peut dire « ou bien » à la place.',
    },
    où: {
      mot: 'où',
      role: '« où » parle d’un lieu ou d’un moment.',
      essai: 'On ne peut pas dire « ou bien » à la place.',
    },
  },
  intrus: { mot: 'ont', why: '« ont » vient du verbe avoir : ils ont.' },
  indice: 'Essaie de dire « ou bien » à la place du mot qui manque.',
  simples: [
    p('Tu préfères la mer … la montagne ?', 'ou'),
    p('Prends une pomme … une poire.', 'ou'),
    p('On part lundi … mardi ?', 'ou'),
    p('Veux-tu jouer dehors … lire au calme ?', 'ou'),
    p('Le sac est rouge … noir ?', 'ou'),
    p('Voici la maison … je suis né.', 'où'),
    p('… as-tu rangé tes clés ?', 'où'),
    p('Dis-moi … tu vas.', 'où'),
    p('Le jour … il a neigé, nous sommes restés au chaud.', 'où'),
    p('Je connais un parc … les canards nagent.', 'où'),
  ],
  doubles: [
    p('… vas-tu : à la piscine … au stade ?', 'où', 'ou'),
    p('Dis-moi … est le chat : dehors … dans la cave ?', 'où', 'ou'),
    p('Le village … je dors a une rivière … un grand étang.', 'où', 'ou'),
    p('Pomme … banane ? Choisis, puis dis-moi … tu la manges.', 'ou', 'où'),
    p('Tu pars à vélo … à pied jusqu’au lieu … on se retrouve ?', 'ou', 'où'),
    p('Le soir … la lune est ronde, on voit des chouettes … des hiboux.', 'où', 'ou'),
    p('Je ne sais pas … poser ce vase : sur la table … sur l’étagère.', 'où', 'ou'),
  ],
};

export const LA_LA_LA: Serie = {
  emplois: {
    article: {
      mot: 'la',
      role: '« la » est un article défini : il accompagne un nom.',
      essai: 'On peut dire « une » à la place.',
    },
    pronom: {
      mot: 'la',
      role: '« la » est un pronom : il remplace un nom féminin, juste avant le verbe.',
      essai: 'On peut penser à « le » pour un nom masculin : « je le vois », « je la vois ».',
    },
    'l’a': {
      mot: 'l’a',
      role: '« l’a » réunit « le » ou « la » (devenu « l’ ») et le verbe avoir.',
      essai: 'On peut dire « l’avait » à la place.',
    },
    là: {
      mot: 'là',
      role: '« là » indique un lieu, un endroit.',
      essai: 'On peut dire « ici » à la place.',
    },
  },
  indice: 'Essaie « une », puis « l’avait », puis « ici » à la place du mot qui manque.',
  simples: [
    p('Ferme … porte, s’il te plaît.', 'article'),
    p('Le facteur sonne à … grille.', 'article'),
    p('Nous regardons … lune.', 'article'),
    p('Cette chanson, je … connais par cœur.', 'pronom'),
    p('La balle roule, le chien … suit.', 'pronom'),
    p('Ta lettre, tu … postes demain.', 'pronom'),
    p('Ce film, mon frère … déjà vu.', 'l’a'),
    p('Le ballon est perdu ? Non, le chien … trouvé.', 'l’a'),
    p('Sa montre, il … oubliée dans le car.', 'l’a'),
    p('Pose ton sac …, près du banc.', 'là'),
    p('Ne reste pas …, tu vas avoir froid.', 'là'),
    p('Qui est … ?', 'là'),
  ],
  doubles: [
    p('Ma sœur cherche sa clé : elle … posée …, sur la table.', 'l’a', 'là'),
    p('La soupe est chaude, je … goûte, puis je pose … cuillère.', 'pronom', 'article'),
    p('Ce n’est pas ici : … boîte est …, derrière le lit.', 'article', 'là'),
    p('Il a vu … girafe et il … prise en photo.', 'article', 'l’a'),
    p('La carte, tu … gardes … ?', 'pronom', 'là'),
    p('Le chat voit … souris, mais il ne … touche pas.', 'article', 'pronom'),
    p('Qui … mis …, ce vieux vélo ?', 'l’a', 'là'),
  ],
};

export const CE_SE: Serie = {
  emplois: {
    ce: {
      mot: 'ce',
      role: '« ce » est un déterminant démonstratif : il montre un nom.',
      essai: 'On peut mettre le nom au pluriel avec « ces ».',
    },
    pronom: {
      mot: 'ce',
      role: '« ce » est un pronom : il désigne la chose dont on parle, devant « qui » ou « que ».',
      essai: 'On peut dire « la chose » à la place : « la chose qui brille ».',
    },
    se: {
      mot: 'se',
      role: '« se » est un pronom personnel : il va avec le verbe et renvoie au sujet.',
      essai: 'On peut dire « me » avec « je » : « je me lave », « il se lave ».',
    },
  },
  intrus: { mot: 'ces', why: '« ces » montre plusieurs choses : ces livres.' },
  indice: 'Regarde le mot qui suit : un nom, ou un verbe ? Essaie « je me … » avec le verbe.',
  simples: [
    p('J’aime beaucoup … dessin.', 'ce'),
    p('Nous partons … matin.', 'ce'),
    p('Qui a laissé … vélo dehors ?', 'ce'),
    p('Raconte-moi … que tu as vu.', 'pronom'),
    p('Voici … qui me fait rire.', 'pronom'),
    p('Il choisit … qui lui plaît.', 'pronom'),
    p('Mon frère … lave les mains.', 'se'),
    p('Le chat … cache sous le lit.', 'se'),
    p('Les enfants … lèvent tôt.', 'se'),
    p('La nuit, le hérisson … promène.', 'se'),
  ],
  doubles: [
    p('Dans … jardin, le merle … cache.', 'ce', 'se'),
    p('Le chien … roule dans … tas de feuilles.', 'se', 'ce'),
    p('… soir, la famille … retrouve autour de la table.', 'ce', 'se'),
    p('Il … demande … que contient la boîte.', 'se', 'pronom'),
    p('Écoute … qui … passe dans la cour.', 'pronom', 'se'),
    p('Les deux amies … souviennent de … voyage.', 'se', 'ce'),
    p('… petit renard … glisse sous la haie.', 'ce', 'se'),
  ],
};

export const LEUR_LEURS: Serie = {
  emplois: {
    pronom: {
      mot: 'leur',
      role: '« leur » est un pronom : il veut dire « à eux » ou « à elles », devant le verbe. Il ne prend jamais de s.',
      essai: 'On peut dire « lui » à la place.',
    },
    un: {
      mot: 'leur',
      role: '« leur » est un déterminant possessif : une seule chose pour plusieurs personnes.',
      essai: 'Le nom qui suit est au singulier, comme avec « son » ou « sa ».',
    },
    plusieurs: {
      mot: 'leurs',
      role: '« leurs » est un déterminant possessif : plusieurs choses pour plusieurs personnes.',
      essai: 'Le nom qui suit est au pluriel, comme avec « ses ».',
    },
  },
  intrus: { mot: 'l’heure', why: '« l’heure » parle du temps : lire l’heure.' },
  indice: 'Regarde le mot qui suit : un verbe, ou un nom au singulier ou au pluriel ?',
  simples: [
    p('Le maître … donne un livre.', 'pronom'),
    p('Je … parle de mon voyage.', 'pronom'),
    p('Chaque soir, les parents … racontent une histoire.', 'pronom'),
    p('Tu … montres le chemin.', 'pronom'),
    p('Les voisins promènent … chien.', 'un'),
    p('Les élèves écoutent … maîtresse.', 'un'),
    p('Les oiseaux construisent … nid.', 'un'),
    p('Les enfants rangent … jouets.', 'plusieurs'),
    p('Les joueurs mettent … chaussures.', 'plusieurs'),
    p('Les voisines arrosent … fleurs.', 'plusieurs'),
    p('Les chevaux secouent … crinières.', 'plusieurs'),
  ],
  doubles: [
    p('Les élèves rangent … cahiers, puis le maître … dit au revoir.', 'plusieurs', 'pronom'),
    p('Mes cousins ont … vélo ; je … prête une pompe.', 'un', 'pronom'),
    p('Les chats lèchent … pattes et regardent … maître.', 'plusieurs', 'un'),
    p('Je … écris pour avoir de … nouvelles.', 'pronom', 'plusieurs'),
    p('Les enfants montrent … dessins à … mère.', 'plusieurs', 'un'),
    p('Les campeurs plantent … tente ; la nuit … paraît longue.', 'un', 'pronom'),
    p('Les canards suivent … mère et agitent … ailes.', 'un', 'plusieurs'),
  ],
};

export const QUEL_QUELLE: Serie = {
  emplois: {
    quel: {
      mot: 'quel',
      role: '« quel » accompagne un nom masculin : il sert à demander ou à s’exclamer.',
      essai: 'On ne peut pas dire « qu’il » à la place, et le nom est masculin.',
    },
    quelle: {
      mot: 'quelle',
      role: '« quelle » accompagne un nom féminin : il sert à demander ou à s’exclamer.',
      essai: 'On ne peut pas dire « qu’il » à la place, et le nom est féminin.',
    },
    'qu’elle': {
      mot: 'qu’elle',
      role: '« qu’elle » réunit « que » (devenu « qu’ ») et le pronom « elle », sujet du verbe.',
      essai: 'On peut dire « qu’il » à la place.',
    },
  },
  indice: 'Essaie de dire « qu’il ». Si ça marche mal, cherche le nom : masculin ou féminin ?',
  simples: [
    p('… beau soleil !', 'quel'),
    p('… âge as-tu ?', 'quel'),
    p('Dis-moi … roman tu lis.', 'quel'),
    p('… belle journée !', 'quelle'),
    p('… heure est-il ?', 'quelle'),
    p('Je me demande … couleur choisir.', 'quelle'),
    p('Je crois … dort.', 'qu’elle'),
    p('Il faut … vienne ce soir.', 'qu’elle'),
    p('Ma sœur dit … a faim.', 'qu’elle'),
    p('Je vois … court très vite.', 'qu’elle'),
  ],
  doubles: [
    p('… joie quand on apprend … arrive demain !', 'quelle', 'qu’elle'),
    p('Je ne sais pas … jour … revient.', 'quel', 'qu’elle'),
    p('Elle demande … heure il est et dit … est pressée.', 'quelle', 'qu’elle'),
    p('… courage ! On voit … n’a pas peur.', 'quel', 'qu’elle'),
    p('Sais-tu … plat … prépare ?', 'quel', 'qu’elle'),
    p('… chance ! Je crois … a gagné.', 'quelle', 'qu’elle'),
    p('Dis-moi … route … prend, et à … moment.', 'quelle', 'qu’elle', 'quel'),
  ],
};

export const SERIES_CM2: readonly Serie[] = [OU_OU, LA_LA_LA, CE_SE, LEUR_LEURS, QUEL_QUELLE];

// ───────────────────────── Lettres muettes finales ─────────────────────────

export interface MotMuet {
  /** Le mot court, avec sa lettre muette finale. */
  readonly mot: string;
  /** Un mot de la famille où cette lettre s'entend. */
  readonly parent: string;
  readonly fait: string;
  /** Niveaux 1 à 3 (courant) ou 4 et 5 (difficile). */
  readonly niveau: 'courant' | 'difficile';
  /** Phrase à un trou, qui ne laisse qu'un mot possible. */
  readonly phrase: string;
}

const m = (
  niveau: MotMuet['niveau'],
  [mot, parent, fait]: readonly [mot: string, parent: string, fait: string],
  phrase: string,
): MotMuet => ({ niveau, mot, parent, fait: `om2-${fait}`, phrase });

export const MOTS_MUETS: readonly MotMuet[] = [
  m('courant', ['dent', 'dentiste', 'dentiste'], 'Le bébé a sa première … aujourd’hui.'),
  m('courant', ['grand', 'grandir', 'grandir'], 'Ce chêne est très … pour son âge.'),
  m('courant', ['petit', 'petitesse', 'petitesse'], 'Mon frère est encore … pour ce vélo.'),
  m('courant', ['bavard', 'bavarder', 'bavarder'], 'Ce perroquet est vraiment … le matin.'),
  m('courant', ['lait', 'laitage', 'laitage'], 'Je verse du … dans mon bol.'),
  m('courant', ['bord', 'border', 'border'], 'Ne marche pas au … du quai.'),
  m('courant', ['lit', 'literie', 'literie'], 'Le soir, je me couche dans mon … douillet.'),
  m('courant', ['gros', 'grosseur', 'grosseur'], 'Un … nuage cache le soleil.'),
  m('courant', ['gris', 'grisaille', 'grisaille'], 'Le ciel est tout … ce matin.'),
  m('courant', ['chat', 'chaton', 'chaton'], 'Le … ronronne sur le coussin.'),
  m('courant', ['haut', 'hauteur', 'hauteur'], 'Ce mur est trop … pour moi.'),
  m('difficile', ['long', 'longueur', 'longueur'], 'Le voyage en train a été très … pour nous.'),
  m('difficile', ['camp', 'camper', 'camper'], 'Les scouts montent leur … dans la prairie.'),
  m('difficile', ['drap', 'draperie', 'draperie'], 'Je change le … de mon matelas.'),
  m('difficile', ['plomb', 'plombier', 'plombier'], 'Cette valise est lourde comme du … et je la traîne.'),
  m('difficile', ['dos', 'dossier', 'dossier'], 'Je porte mon sac sur le … jusqu’à l’école.'),
  m('difficile', ['bois', 'boiser', 'boiser'], 'Cette chaise est en … clair.'),
  m('difficile', ['lard', 'larder', 'larder'], 'Le cuisinier fait griller du … à la poêle.'),
  m('difficile', ['gourmand', 'gourmandise', 'gourmandise'], 'Ce garçon est un vrai … : il adore les gâteaux.'),
  m('difficile', ['renard', 'renardeau', 'renardeau'], 'Un … roux sort de la forêt.'),
  m('difficile', ['début', 'débuter', 'debut'], 'Nous sommes au … du film.'),
  m('difficile', ['regard', 'regarder', 'regard'], 'Le hibou a un … perçant.'),
  m('difficile', ['retard', 'retarder', 'retard'], 'Le bus arrive avec dix minutes de … ce soir.'),
  m('difficile', ['accord', 'accorder', 'accord'], 'Nous sommes tous d’… pour jouer.'),
  m('difficile', ['repos', 'reposer', 'repos'], 'Après la course, il faut du … pour récupérer.'),
];
