import { describe, expect, it } from 'vitest';
import { assetSrc } from './assets.ts';
import { bossHeadId, bossPoseId, SUBJECT_BOSSES } from './bosses.ts';
import { BOSS_EXPRESSIONS } from './catalog/bosses.ts';
import { facingOf, mustFlip, shownFacing, SOURCE_FACING, type Facing } from './orientation.ts';

/** Usage → côté voulu : arène et bulles (posées à droite) : gauche ; ligne de chapitre (à gauche) : droite. */
const POSE_USES = {
  intro: 'idle',
  attente: 'idle',
  attaque: 'attack',
  'coup reçu': 'hurt',
  KO: 'defeat',
  victoire: 'victory',
} as const;

const bosses = [...Object.values(SUBJECT_BOSSES).map((b) => b.id), 'empereur'];

describe('orientation des boss (ticket 46)', () => {
  it('table des sources : sens dessiné relevé sur les planches', () => {
    expect(facingOf('bosses-sorcier-pi-pose-idle')).toBe('left');
    expect(facingOf('bosses-sorcier-pi-head-rage-cri')).toBe('left');
    expect(facingOf('bosses-sorcier-pi-portrait')).toBe('left');
    expect(facingOf('bosses-sorcier-pi-anim-idle')).toBe('front');
    expect(facingOf('bosses-empereur-empereur')).toBe('front');
    expect(facingOf('bosses-lord-blabla-pose-idle')).toBe('front');
  });

  it('retourne seulement une image tournée du mauvais côté', () => {
    expect(mustFlip('bosses-sorcier-pi-head-menace', 'left')).toBe(false);
    expect(mustFlip('bosses-sorcier-pi-head-menace', 'right')).toBe(true);
    expect(mustFlip('bosses-sorcier-pi-anim-idle', 'right')).toBe(false);
  });

  it.each(bosses)('%s : arène, rage, HUD et bulles, selon la règle', (id) => {
    for (const pose of Object.values(POSE_USES)) {
      // Dans l'arène, le boss regarde le héros (à gauche) ou est de face.
      expect(['left', 'front'], `${id} ${pose}`).toContain(shownFacing(bossPoseId(id, pose), 'left'));
    }
    for (const expression of BOSS_EXPRESSIONS) {
      const head = bossHeadId(id, expression);
      // HUD de combat et bulles : posés à droite, visage vers le centre (à gauche).
      expect(['left', 'front'], `${id} ${expression} HUD`).toContain(shownFacing(head, 'left'));
      // Ligne de chapitre : posé à gauche, visage vers le centre (à droite).
      expect(['right', 'front'], `${id} ${expression} chapitres`).toContain(shownFacing(head, 'right'));
    }
    // Rage plein écran (animation) et gros plan (portrait) : de face, ou regardant le héros.
    expect(['left', 'front']).toContain(shownFacing(`bosses-${id}-anim-idle`, 'left'));
    expect(['left', 'front']).toContain(shownFacing(`bosses-${id}-portrait`, 'left'));
  });

  it('chaque image du Sorcier π référencée par la table existe', () => {
    for (const pose of Object.values(POSE_USES)) expect(assetSrc(bossPoseId('sorcier-pi', pose))).not.toBeNull();
    expect(assetSrc('bosses-sorcier-pi-anim-idle')).not.toBeNull();
    const facings: Facing[] = Object.values(SOURCE_FACING);
    expect(facings.length).toBeGreaterThan(3);
  });
});
