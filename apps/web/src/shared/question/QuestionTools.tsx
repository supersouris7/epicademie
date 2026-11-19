import { useState } from 'react';
import { gradeOfSkill, type Advice, type Question, type Response, type Skill } from '@questeo/content';
import { MathText } from './MathText.tsx';
import { Figure } from './figures/Figure.tsx';
import { Brouillon, type Stroke } from './tools/Brouillon.tsx';
import { Calculator } from './tools/Calculator.tsx';
import { ConversionTable } from './tools/ConversionTable.tsx';
import { EMPTY_CALC, type CalcState } from './calcState.ts';
import { conversionNeeded, emptyConversion, unitsIn, type ConversionKind, type ConversionState } from './conversion.ts';
import { AnswerInput } from './AnswerInput.tsx';
import { PlayDock, type DockTab } from './PlayDock.tsx';
import { toolTabs } from './tools.ts';

/** Tableau adapté à l'unité de la question (aires en ^2, volumes en ^3 ou en litres). */
function conversionKind(q: Question): ConversionKind {
  const text = q.prompt + (q.answer.kind === 'number' ? (q.answer.unit ?? '') : '');
  if (/\^3|\b[kchd]?a?L\b|\bmL\b/.test(text)) return 'volume';
  if (/\d\s?(?:kg|hg|dag|g|dg|cg|mg)\b/.test(text)) return 'masse';
  if (text.includes('^2')) return 'aire';
  return 'longueur';
}

interface QuestionToolsProps {
  readonly question: Question;
  readonly skill: Skill | undefined;
  /** Outil conseillé par Questy : son onglet brille tant qu'il n'a pas été ouvert. */
  readonly advice?: Advice;
  /** Option de QCM déjà essayée (grisée au 2e essai). */
  readonly excluded?: number;
  /** Change à chaque nouvel essai : vide la saisie et revient au pavé. */
  readonly attempt?: number;
  readonly picked: { x: number; y: number } | null;
  readonly onSubmit: (r: Response) => void;
}

/**
 * Zone « Répondre » (pavé, clavier ou choix) et outils d'une question : calculatrice, brouillon (agrandissable en pleine page),
 * tableau de conversion. À monter avec une `key` propre à la question pour repartir de zéro.
 */
export function QuestionTools({
  question,
  skill,
  advice,
  excluded,
  attempt = 0,
  picked,
  onSubmit,
}: QuestionToolsProps) {
  const [tab, setTab] = useState<DockTab>('reponse');
  const [opened, setOpened] = useState<ReadonlySet<DockTab>>(new Set());
  const [bigDraft, setBigDraft] = useState(false);
  const [strokes, setStrokes] = useState<readonly Stroke[]>([]);
  const [calc, setCalc] = useState<CalcState>(EMPTY_CALC);
  const [conv, setConv] = useState<ConversionState | null>(null);
  const [fill, setFill] = useState<{ value: string; nonce: number } | null>(null);

  // Nouvel essai : retour au pavé, saisie vide (brouillon et calculatrice gardés).
  const [seenAttempt, setSeenAttempt] = useState(attempt);
  if (attempt !== seenAttempt) {
    setSeenAttempt(attempt);
    setTab('reponse');
    setFill(null);
  }

  const tabs = toolTabs(question, skill);
  const activeTab = tabs.includes(tab) ? tab : 'reponse';
  const selectTab = (t: DockTab) => {
    setTab(t);
    setOpened((o) => new Set(o).add(t));
  };
  const kind =
    (question.answer.kind === 'number' ? conversionNeeded(question.prompt, question.answer.unit) : null) ??
    conversionKind(question);
  const sendToAnswer =
    question.answer.kind === 'number'
      ? (value: string) => {
          setFill({ value, nonce: Date.now() });
          setTab('reponse');
        }
      : undefined;

  return (
    <>
      <PlayDock
        tabs={tabs}
        active={activeTab}
        glow={advice && tabs.includes(advice) && !opened.has(advice) ? advice : undefined}
        onSelect={selectTab}
      >
        <div className={activeTab === 'reponse' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
          <AnswerInput
            key={`${fill?.nonce ?? 0}-${attempt}`}
            excluded={excluded}
            question={question}
            disabled={false}
            onSubmit={onSubmit}
            picked={picked}
            initialText={fill?.value}
          />
        </div>
        {activeTab === 'calculatrice' && (
          <Calculator state={calc} onChange={setCalc} grade={gradeOfSkill(question.skillId)} onUse={sendToAnswer} />
        )}
        {activeTab === 'brouillon' && !bigDraft && (
          <Brouillon strokes={strokes} onChange={setStrokes} onToggleExpand={() => setBigDraft(true)} />
        )}
        {activeTab === 'conversion' && (
          <ConversionTable
            kind={kind}
            state={conv ?? emptyConversion(kind)}
            onChange={setConv}
            highlight={unitsIn(question.prompt)}
            onUse={sendToAnswer}
          />
        )}
      </PlayDock>
      {/* Brouillon pleine page : l'énoncé reste en haut, la feuille prend tout le reste. */}
      {bigDraft && (
        <div
          className="bg-bg fixed inset-0 z-40 flex flex-col gap-2 p-3"
          role="dialog"
          aria-label="Brouillon pleine page"
        >
          <div className="flex max-h-[30dvh] shrink-0 gap-3 overflow-y-auto">
            <h2 className="flex-1 text-xl leading-snug font-bold">
              <MathText text={question.prompt} />
            </h2>
            {question.figure && (
              <div className="w-[40%] max-w-xs shrink-0">
                <Figure figure={question.figure} maxHeight="26dvh" picked={picked} />
              </div>
            )}
          </div>
          <div className="min-h-0 flex-1">
            <Brouillon strokes={strokes} onChange={setStrokes} expanded onToggleExpand={() => setBigDraft(false)} />
          </div>
        </div>
      )}
    </>
  );
}
