import { generate, getSkill, chapterOfAnySkill, getChapter } from './catalog.ts';
import { getSource } from './sources.ts';
import { skillLevels, skillVersion, type AnswerSpec, type Level, type Question, type Trap } from './types.ts';

/** Graines utilisées pour l'aperçu de relecture (3 variantes par niveau). */
export const PREVIEW_SEEDS: readonly number[] = [1, 2, 3];

const answerText = (a: AnswerSpec): string => {
  switch (a.kind) {
    case 'number':
      return `${a.value.n}${a.value.d === 1 ? '' : `/${a.value.d}`}${a.unit ? ` ${a.unit}` : ''}`;
    case 'fraction':
      return `${a.value.n}/${a.value.d}`;
    case 'choice':
      return String(a.options[a.correct]);
    case 'point':
      return `(${a.x} ; ${a.y})`;
    case 'text':
      return a.accepted.join(' / ');
    case 'order':
      return a.correct.map((i) => a.items[i]).join(' → ');
    case 'match':
      return a.left.map((l, i) => `${l} ↔ ${a.right[a.pairs[i] ?? 0]}`).join(' ; ');
    case 'cloze':
      return a.parts
        .map((p, i) => {
          const b = a.blanks[i];
          const word = !b ? '' : b.mode === 'list' ? b.options[b.correct] : b.accepted[0];
          return `${p}${b ? `[${word}]` : ''}`;
        })
        .join('');
  }
};

const trapText = (t: Trap): string => {
  const what =
    'value' in t
      ? `${t.value.n}${t.value.d === 1 ? '' : `/${t.value.d}`}`
      : 'option' in t
        ? `proposition ${t.option + 1}`
        : 'point' in t
          ? `(${t.point.x} ; ${t.point.y})`
          : t.text;
  return `${what} → ${t.why}`;
};

const one = (q: Question): string[] => [
  `- **Graine ${q.seed}** — ${q.prompt.replace(/\n/g, ' ')}`,
  ...(q.answer.kind === 'choice' ? [`  - Propositions : ${q.answer.options.join(' | ')}`] : []),
  ...(q.answer.kind === 'order' ? [`  - Éléments présentés : ${q.answer.items.join(' | ')}`] : []),
  ...(q.answer.kind === 'match' ? [`  - Colonne de droite : ${q.answer.right.join(' | ')}`] : []),
  `  - Réponse : ${answerText(q.answer)}`,
  ...(q.traps.length ? [`  - Pièges : ${q.traps.map(trapText).join(' ; ')}`] : ['  - Pièges : aucun']),
  `  - Indice : ${q.hint}`,
  `  - Étapes : ${q.steps.join(' ▸ ')}`,
];

/** Markdown de relecture d'une notion : niveaux 1 à 5 × graines, puis sources. */
export function previewSkill(skillId: string, seeds: readonly number[] = PREVIEW_SEEDS): string {
  const skill = getSkill(skillId);
  if (!skill) throw new Error(`Notion inconnue : ${skillId}`);
  const chapter = chapterOfAnySkill(skillId);
  const out = [
    `## ${skill.title} (\`${skill.id}\`, version ${skillVersion(skill)})`,
    '',
    `Chapitre : ${chapter?.title ?? '?'} — classe ${chapter?.grade ?? '?'}`,
    '',
    `Mémo : ${skill.lesson.memo.join(' ')}`,
    '',
  ];
  const levels = skillLevels(skill);
  for (let level = 1 as Level; level <= levels; level++) {
    out.push(`### Niveau ${level}`, '');
    for (const seed of seeds) out.push(...one(generate(skillId, level, seed)));
    out.push('');
  }
  out.push('### Sources', '');
  out.push(`- ${skill.lesson.source}`);
  for (const id of skill.lesson.sources ?? []) {
    const s = getSource(id);
    out.push(s ? `- ${s.title} — ${s.publisher}, ${s.textDate}, <${s.url}>` : `- ⚠ source inconnue : ${id}`);
  }
  out.push('');
  return out.join('\n');
}

/** Aperçu d'un chapitre (toutes ses notions) ou d'une notion, selon l'identifiant. */
export function previewOf(id: string, seeds: readonly number[] = PREVIEW_SEEDS): string {
  const chapter = getChapter(id);
  if (!chapter) return previewSkill(id, seeds);
  return [`# ${chapter.title} (${chapter.id})`, '', ...chapter.skills.map((s) => previewSkill(s.id, seeds))].join('\n');
}
