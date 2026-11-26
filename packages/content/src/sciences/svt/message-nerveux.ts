import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees-nerveux.ts';
import { generer, saisieur } from './reproduction-kit.ts';

// ——— Le message nerveux : récepteurs, nerfs, centres nerveux et neurones ———

const DEFS = {
  'récepteur sensoriel':
    'la structure qui, quand elle est stimulée, produit un message électrique envoyé vers le système nerveux central',
  neurone: 'la cellule du tissu nerveux, formée d’un corps cellulaire et de prolongements',
  nerf: 'un ensemble de fibres qui relie des organes au cerveau ou à la moelle épinière',
  'message nerveux': 'le signal de nature électrique qui circule dans les nerfs et les neurones',
  synapse: 'la zone de communication entre deux neurones',
  neurotransmetteur: 'la petite molécule qui fait passer le signal d’un neurone à l’autre',
  axone: 'le long prolongement d’un neurone',
  cerveau: 'l’organe logé dans le crâne qui reçoit et traite les informations venues du corps',
  'moelle épinière': 'la partie du système nerveux central logée dans la colonne vertébrale, d’où partent des nerfs',
} as const;
type Terme = keyof typeof DEFS;

const REPERES: Readonly<Record<Terme, string>> = {
  'récepteur sensoriel': 'Repère : il est le point de départ du message.',
  neurone: 'Repère : c’est une cellule.',
  nerf: 'Repère : c’est un « câble » fait de nombreuses fibres.',
  'message nerveux': 'Repère : c’est ce qui circule, pas ce qui le transporte.',
  synapse: 'Repère : elle se situe entre deux cellules nerveuses.',
  neurotransmetteur: 'Repère : c’est une substance chimique libérée entre deux neurones.',
  axone: 'Repère : c’est une partie d’une cellule nerveuse.',
  cerveau: 'Repère : il se trouve dans le crâne.',
  'moelle épinière': 'Repère : elle descend le long du dos, à l’abri des vertèbres.',
};

const INDICE = 'Demande-toi s’il s’agit d’une cellule, d’un organe, d’un signal, d’une zone ou d’une molécule.';

const saisie = saisieur(DEFS, INDICE);

export const messageNerveux: Skill = {
  id: 'v4-message-nerveux',
  title: 'Le message nerveux',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **récepteur sensoriel** stimulé produit un **message nerveux**, de nature électrique ; un **nerf** sensitif le conduit vers les **centres nerveux** (cerveau, moelle épinière), puis un nerf moteur porte l’ordre jusqu’au muscle.',
      'Les **neurones** se relaient : au niveau d’une **synapse**, des molécules (neurotransmetteurs) font passer le message d’une cellule à l’autre.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Message nerveux, centres nerveux, nerfs, cellules nerveuses ».`,
    sources: [
      PROGRAMME,
      'academie-neurone',
      'academie-nerf',
      'academie-influx',
      'academie-centre',
      'academie-nerveux',
      'academie-recepteur',
      'academie-cerveau',
      'academie-moelle',
      'cnrtl-synapse',
      'inserm-epilepsie',
      'inserm-sclerose-plaques',
      'inserm-sla',
      'inserm-douleur',
    ],
  },
  generate: generer<Terme>({
    defs: DEFS,
    reperes: REPERES,
    indice: INDICE,
    simples: ['nerf', 'cerveau', 'synapse'],
    cas: [
      {
        prompt: 'La peau d’une main touche une tasse chaude. Quel nerf conduit le message vers les centres nerveux ?',
        bonne: 'un nerf sensitif',
        fausses: [
          ['un nerf moteur', 'Un nerf moteur commande un muscle : il part des centres nerveux.'],
          ['une artère', 'Une artère transporte du sang, pas un message nerveux.'],
          ['un tendon', 'Un tendon relie un muscle à un os.'],
        ],
        indice: 'Le message vient d’un organe des sens et va vers les centres.',
        explication: ['Les nerfs sensitifs transmettent les sensations de la périphérie vers les centres nerveux.'],
      },
      {
        prompt: 'Quel nerf apporte à un muscle l’ordre de se contracter ?',
        bonne: 'un nerf moteur',
        fausses: [
          ['un nerf sensitif', 'Le nerf sensitif va des récepteurs vers les centres nerveux.'],
          ['le nerf optique', 'Le nerf optique relie l’œil au cerveau.'],
          ['une veine', 'Une veine ramène le sang vers le cœur.'],
        ],
        indice: 'Cherche le nerf qui commande.',
        explication: ['Les nerfs moteurs commandent un muscle.'],
      },
      {
        prompt: 'De quelle nature est le message qui parcourt un nerf ?',
        bonne: 'électrique',
        fausses: [
          ['sonore', 'Le son est capté par l’oreille, mais il ne parcourt pas le nerf.'],
          ['lumineuse', 'La lumière est captée par l’œil, mais elle ne parcourt pas le nerf.'],
          ['alimentaire', 'Les aliments suivent le tube digestif.'],
        ],
        indice: 'Pense au signal qui parcourt aussi un circuit.',
        explication: ['L’influx nerveux est une onde de nature électrique qui parcourt le nerf.'],
      },
      {
        prompt: 'Comment le message passe-t-il d’un neurone au suivant ?',
        bonne: 'des neurotransmetteurs sont libérés au niveau d’une synapse',
        fausses: [
          [
            'le message voyage dans le sang',
            'Le sang transporte des substances, pas le message d’un neurone au suivant.',
          ],
          ['les deux neurones fusionnent en une seule cellule', 'Les neurones restent deux cellules distinctes.'],
          ['le message passe par un tendon', 'Un tendon relie un muscle à un os.'],
        ],
        indice: 'Une substance chimique intervient entre les deux cellules.',
        explication: ['Au niveau de la synapse, des neurotransmetteurs transmettent le message au second neurone.'],
      },
      {
        prompt: 'De quoi se compose le système nerveux central ?',
        bonne: 'de l’encéphale (dont le cerveau) et de la moelle épinière',
        fausses: [
          ['des nerfs seulement', 'Les nerfs relient le système nerveux central au reste du corps.'],
          ['des muscles et des os', 'Ils forment l’appareil du mouvement.'],
          ['du cerveau et du cœur', 'Le cœur est un organe de la circulation.'],
        ],
        indice: 'Les nerfs relient cette partie au reste du corps : cherche ce qu’ils rejoignent.',
        explication: ['Le système nerveux central comprend l’encéphale et la moelle épinière.'],
      },
    ],
    rangements: [
      {
        prompt: 'On touche un objet puis on le saisit exprès. Range le trajet du message nerveux.',
        suite: [
          'un récepteur de la peau est stimulé',
          'un nerf sensitif conduit le message vers les centres nerveux',
          'le cerveau reçoit l’information et prépare une réponse',
          'un nerf moteur conduit l’ordre vers un muscle de la main',
          'le muscle se contracte',
        ],
        indice: 'Le message part d’un récepteur et finit dans un muscle.',
        explication: 'Le message va du récepteur aux centres nerveux, puis des centres nerveux au muscle.',
      },
      {
        prompt: 'Range la transmission du message d’un neurone au suivant.',
        suite: [
          'le message parcourt l’axone du premier neurone',
          'il atteint l’extrémité, au niveau de la synapse',
          'des neurotransmetteurs sont libérés',
          'le second neurone est activé',
        ],
        indice: 'La molécule agit à la jonction, après l’arrivée du message.',
        explication: 'Le message suit l’axone, puis la synapse permet de passer au neurone suivant.',
      },
    ],
    trous: [
      {
        prompt: 'Complète : les deux sortes de nerfs.',
        parts: [
          'Les nerfs ',
          ' conduisent les messages des récepteurs vers les centres nerveux ; les nerfs ',
          ' les conduisent vers les muscles.',
        ],
        choix: [
          [['sensitifs', 'moteurs', 'digestifs'], 0],
          [['sensitifs', 'moteurs', 'digestifs'], 1],
        ],
        indice: 'Un type apporte les sensations, l’autre commande le mouvement.',
        explication: 'Les noms indiquent le rôle : sentir ou faire bouger.',
      },
      {
        prompt: 'Complète : le passage du message.',
        parts: ['Le message nerveux est de nature ', ' ; il passe d’un neurone à l’autre au niveau d’une ', '.'],
        choix: [
          [['électrique', 'sonore', 'lumineuse'], 0],
          [['synapse', 'artère', 'alvéole'], 0],
        ],
        indice: 'Pense au signal dans le nerf, puis à la jonction entre deux cellules.',
        explication: 'Le message est électrique dans le nerf et franchit les synapses.',
      },
      {
        prompt: 'Complète : l’organisation du système nerveux.',
        parts: ['Le système nerveux central comprend l’encéphale et la ', ' ; des ', ' le relient aux organes.'],
        choix: [
          [['moelle épinière', 'moelle osseuse', 'trachée'], 0],
          [['nerfs', 'tendons', 'vaisseaux sanguins'], 0],
        ],
        indice: 'Un centre nerveux est protégé par les vertèbres.',
        explication: 'La moelle épinière et l’encéphale sont reliés aux organes par les nerfs.',
      },
    ],
    faciles: [
      saisie('neurone', ['le', 'un'], ['nerf', 'synapse'], ['neurones', 'les neurones']),
      saisie('nerf', ['le', 'un'], ['neurone', 'axone'], ['nerfs', 'les nerfs']),
      saisie('synapse', ['la', 'une'], ['neurone', 'axone'], ['synapses', 'les synapses']),
      saisie('cerveau', ['le'], ['moelle épinière', 'nerf'], ['encéphale', 'l’encéphale', 'encephale']),
    ],
    saisies: [
      saisie(
        'message nerveux',
        ['le', 'un'],
        ['nerf', 'synapse'],
        ['influx nerveux', 'l’influx nerveux', 'un influx nerveux', 'influx', 'l’influx', 'messages nerveux'],
      ),
      saisie(
        'récepteur sensoriel',
        ['le', 'un'],
        ['neurotransmetteur', 'nerf'],
        ['récepteur', 'le récepteur', 'un récepteur', 'recepteur', 'récepteurs sensoriels', 'récepteurs'],
      ),
      saisie('neurotransmetteur', ['le', 'un'], ['synapse', 'axone'], ['neurotransmetteurs', 'les neurotransmetteurs']),
      saisie('axone', ['l’', 'un'], ['synapse', 'nerf'], ['axones', 'les axones']),
      saisie('moelle épinière', ['la'], ['cerveau', 'nerf'], ['moelle', 'la moelle']),
    ],
    series: [
      [
        ['récepteur sensoriel', 'est stimulé et produit un message électrique'],
        ['nerf sensitif', 'conduit le message vers les centres nerveux'],
        ['cerveau', 'reçoit et traite l’information'],
        ['nerf moteur', 'conduit l’ordre vers un muscle'],
        ['muscle', 'se contracte et réalise le mouvement'],
      ],
      [
        ['neurone', DEFS.neurone],
        ['axone', DEFS.axone],
        ['synapse', DEFS.synapse],
        ['neurotransmetteur', DEFS.neurotransmetteur],
        ['moelle épinière', DEFS['moelle épinière']],
      ],
    ],
    pieges: [
      {
        prompt: 'On pose la main sur une surface brûlante. Où la douleur est-elle identifiée et ressentie ?',
        bonne: 'dans le cerveau',
        fausses: [
          ['dans la peau seulement', 'La peau détecte, mais le signal est identifié dans le cerveau.'],
          ['dans le nerf sensitif', 'Le nerf conduit le message, il ne l’identifie pas.'],
          ['dans le muscle du bras', 'Le muscle exécute un mouvement.'],
        ],
        indice: 'Distingue le lieu de la brûlure et le lieu où le message est reconnu.',
        explication: [
          'L’information chemine par la moelle épinière jusqu’au cerveau, qui l’identifie comme douloureuse.',
        ],
      },
      {
        prompt: 'Quelle différence y a-t-il entre un nerf et un neurone ?',
        bonne: 'le neurone est une cellule ; le nerf est un ensemble de fibres',
        fausses: [
          ['le nerf est une cellule ; le neurone est un ensemble de fibres', 'C’est l’inverse.'],
          ['ce sont deux noms exactement pour la même cellule', 'Un nerf regroupe de nombreuses fibres.'],
          ['le nerf se trouve dans le crâne, le neurone dans les muscles', 'Des nerfs parcourent tout le corps.'],
        ],
        indice: 'Compare une cellule et un câble formé de nombreux fils.',
        explication: ['Un nerf est constitué de fibres ; le neurone est la cellule élémentaire du tissu nerveux.'],
      },
      {
        prompt:
          'Certaines fibres nerveuses sont entourées d’une gaine, la myéline. À quoi sert-elle notamment, selon l’Inserm ?',
        bonne: 'à accélérer la propagation du message nerveux',
        fausses: [
          ['à transporter de l’oxygène jusqu’aux muscles', 'C’est le rôle du sang.'],
          ['à fabriquer les muscles', 'La myéline entoure des fibres nerveuses.'],
          ['à bloquer tous les messages', 'Elle les accélère au lieu de les arrêter.'],
        ],
        indice: 'Pense à la vitesse du signal.',
        explication: ['La myéline isole les fibres et accélère la propagation de l’influx nerveux.'],
      },
    ],
    dossiers: [
      {
        titre: 'Expérience « lampe verte »',
        lignes: [
          'Expérience (inventée) faite en classe.',
          'Un élève appuie sur un bouton dès qu’une lampe verte s’allume.',
          'Durée moyenne mesurée entre l’allumage et l’appui : 0,25 seconde.',
        ],
        questions: [
          {
            prompt: 'Quels récepteurs sont stimulés en premier dans cette expérience ?',
            bonne: 'des récepteurs situés dans les yeux',
            fausses: [
              ['des récepteurs situés dans les muscles du doigt', 'Le muscle n’intervient qu’à la fin pour appuyer.'],
              ['des récepteurs situés dans les oreilles', 'Le signal ici est lumineux, pas sonore.'],
              [
                'des récepteurs situés dans la peau du bras',
                'La peau ne capte pas la lumière de la lampe pour déclencher l’appui.',
              ],
            ],
            indice: 'Quelle est la nature du stimulus ?',
            explication: ['Le stimulus est la lumière : les récepteurs de l’œil le captent.'],
          },
          {
            prompt: 'Pourquoi l’appui n’est-il pas instantané ?',
            bonne: 'le message nerveux met du temps à aller des yeux au doigt en passant par les centres nerveux',
            fausses: [
              ['le message voyage par le tube digestif', 'La commande ne passe pas par la digestion.'],
              ['la lumière doit d’abord devenir un son', 'Aucune conversion en son n’intervient.'],
              ['le muscle doit d’abord réfléchir seul', 'Un muscle exécute un ordre venu des centres nerveux.'],
            ],
            indice: 'Suis tout le trajet entre l’œil et la main.',
            explication: [
              'Le message passe par les nerfs, les centres nerveux et des synapses avant d’atteindre le muscle.',
            ],
          },
        ],
      },
      {
        titre: 'Cas fictif « patient R »',
        lignes: [
          'Cas (inventé) pour exercice.',
          'La personne sent normalement qu’on lui touche la main.',
          'Elle ne parvient plus à plier les doigts, alors que ses muscles sont intacts.',
        ],
        questions: [
          {
            prompt: 'Quelle explication est la plus cohérente avec ce cas ?',
            bonne: 'l’ordre ne parvient plus aux muscles : la voie motrice est atteinte',
            fausses: [
              ['les récepteurs de la peau ne fonctionnent plus', 'La personne sent le toucher.'],
              ['les muscles sont détruits', 'Le cas précise qu’ils sont intacts.'],
              ['aucun message sensitif n’atteint le cerveau', 'La personne perçoit le toucher.'],
            ],
            indice: 'Ce qui fonctionne encore te dit quelle voie est intacte.',
            explication: ['La sensation arrive, mais la commande des muscles ne passe plus.'],
          },
          {
            prompt: 'Quel élément conduit normalement l’ordre de plier les doigts jusqu’aux muscles ?',
            bonne: 'un nerf moteur',
            fausses: [
              ['un nerf sensitif', 'Il va vers les centres nerveux.'],
              ['une artère du bras', 'Elle transporte du sang.'],
              ['un tendon', 'Un tendon relie le muscle à l’os.'],
            ],
            indice: 'Il part des centres nerveux et va vers un muscle.',
            explication: ['Les nerfs moteurs commandent les muscles.'],
          },
        ],
      },
    ],
  }),
};
