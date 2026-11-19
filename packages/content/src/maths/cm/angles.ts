import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';
import { bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';

export function buildAngles({ S, C, cm2, id }: Contexte): Chapter {
  // ——— Angles ———

  const anglesSkills: Skill[] = [
    S(
      id('angles'),
      'Comparer des angles',
      'Comparer des angles',
      ['Un angle **aigu** est plus petit qu’un angle droit ; un angle **obtus** est plus grand.'],
      (rng) => {
        const q = rng.pick([
          { p: 'Un angle plus petit qu’un angle droit est…', a: 'aigu', w: ['obtus', 'plat'] },
          { p: 'Un angle plus grand qu’un angle droit (mais pas plat) est…', a: 'obtus', w: ['aigu', 'droit'] },
          { p: 'L’angle formé par les deux aiguilles à 3 h est…', a: 'droit', w: ['aigu', 'obtus'] },
          { p: 'L’angle formé par les aiguilles à 1 h est…', a: 'aigu', w: ['droit', 'obtus'] },
          { p: 'L’angle formé par les aiguilles à 5 h est…', a: 'obtus', w: ['aigu', 'droit'] },
        ]);
        return {
          prompt: q.p,
          ...choice(
            rng,
            q.a,
            q.w.map((w) => ({ label: w, why: 'Compare avec un angle droit (le coin d’une feuille).' })),
          ),
          hint: 'Compare avec le coin d’une feuille (angle droit).',
          steps: ['On compare avec un angle droit.', `C’est un angle **${q.a}**.`],
          targetSeconds: 15,
        };
      },
    ),
  ];
  if (cm2) {
    anglesSkills.push(
      S(
        id('mesure-angles'),
        'Angle droit et degrés',
        'Savoir qu’un angle droit mesure 90°',
        ['Un angle droit mesure **90°**. Sa moitié (par pliage) mesure 45°. Deux angles droits font 180°.'],
        (rng) => {
          const q = rng.pick([
            { p: 'Combien de degrés mesure un angle droit ?', a: 90, w: 100 },
            { p: 'On plie un angle droit en deux. Combien mesure chaque moitié ?', a: 45, w: 90 },
            { p: 'Combien de degrés font deux angles droits côte à côte ?', a: 180, w: 90 },
            { p: 'Combien de degrés font trois angles de 30° mis côte à côte ?', a: 90, w: 60 },
          ]);
          return {
            prompt: q.p,
            answer: num(q.a, '°'),
            traps: traps(r(q.a), [[q.w, 'Un angle droit mesure 90°.']]),
            hint: 'Rappelle-toi la mesure d’un angle droit en degrés.',
            steps: ['Un angle droit mesure 90°.', `Réponse : **${q.a}°**.`],
            targetSeconds: 15,
          };
        },
      ),
    );
  }
  const angles = C(
    id('angles'),
    'geometrie',
    'Les angles',
    anglesSkills,
    bossOf(
      [
        S(
          id('boss-angles-horloge'),
          'Problème : l’horloge',
          'Utiliser le lexique spécifique associé aux angles',
          ['À 3 h et à 9 h, les aiguilles forment un angle droit ; à 6 h, un angle plat.'],
          (rng) => {
            const q = rng.pick([
              { h: 3, a: 'droit' },
              { h: 9, a: 'droit' },
              { h: 6, a: 'plat' },
              { h: 2, a: 'aigu' },
              { h: 4, a: 'obtus' },
            ]);
            return {
              prompt: `À ${q.h} h pile, quel angle forment les aiguilles de l’horloge ?`,
              ...choice(
                rng,
                q.a,
                ['droit', 'plat', 'aigu', 'obtus']
                  .filter((x) => x !== q.a)
                  .map((x) => ({ label: x, why: 'Imagine les aiguilles : 3 h = angle droit, 6 h = angle plat.' })),
              ),
              hint: 'À 3 h, les aiguilles forment un angle droit.',
              steps: ['On imagine la position des aiguilles.', `L’angle est **${q.a}**.`],
              targetSeconds: 25,
            };
          },
        ),
        S(
          id('boss-angles-equerre'),
          'Problème : l’équerre',
          'Comparer des angles',
          ['L’équerre sert à vérifier un angle droit.'],
          (rng) => ({
            prompt: 'Quel instrument utilise-t-on pour vérifier qu’un angle est droit ?',
            ...choice(rng, 'L’équerre', [
              { label: 'Le compas', why: 'Le compas trace des cercles.' },
              { label: 'La règle', why: 'La règle trace et mesure des segments.' },
            ]),
            hint: 'Il a lui-même un angle droit.',
            steps: ['L’équerre possède un angle droit.', 'On utilise **l’équerre**.'],
            targetSeconds: 15,
          }),
        ),
      ],
      [
        S(
          id('boss-angles-piege'),
          'Piège : la longueur des côtés',
          'Comparer des angles',
          ['La taille d’un angle ne dépend **pas** de la longueur de ses côtés : seulement de son ouverture.'],
          (rng) => ({
            prompt: 'Si on allonge les côtés d’un angle, l’angle devient-il plus grand ?',
            ...choice(
              rng,
              'Non',
              [{ label: 'Oui', why: 'L’ouverture ne change pas quand on allonge les côtés.' }],
              true,
            ),
            hint: 'Un angle, c’est une ouverture.',
            steps: ['La mesure d’un angle dépend de son ouverture, pas de la longueur des côtés.', '**Non**.'],
            targetSeconds: 15,
          }),
        ),
      ],
    ),
  );

  return angles;
}
