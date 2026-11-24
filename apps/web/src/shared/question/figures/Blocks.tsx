import type { ReactNode } from 'react';
import type { Block } from '@epicademie/content';

/** Programme par blocs. */
const BLOCK_COLORS = {
  ask: '#5cb1d6',
  set: '#ff8c1a',
  change: '#ff8c1a',
  say: '#9966ff',
  repeat: '#ffab19',
  if: '#ffab19',
  until: '#ffab19',
} as const;

/** Bloc « C » de contrôle : en-tête, blocs imbriqués, éventuel « sinon ». */
function ControlBlock({
  color,
  head,
  body,
  elseHead,
  elseBody,
}: {
  color: string;
  head: ReactNode;
  body: readonly Block[];
  elseHead?: ReactNode;
  elseBody?: readonly Block[];
}) {
  const inner = (blocks: readonly Block[]) => (
    <div className="ml-5 flex flex-col gap-1 rounded-l-lg bg-[var(--surface-2)] py-2 pl-2">
      {blocks.map((c, i) => (
        <BlockView key={i} b={c} />
      ))}
    </div>
  );
  return (
    <div
      className="w-fit rounded-lg border-2 border-black/20 text-base font-bold text-white"
      style={{ backgroundColor: color }}
    >
      <div className="px-3 py-2">{head}</div>
      {inner(body)}
      {elseBody && (
        <>
          <div className="px-3 py-2">{elseHead}</div>
          {inner(elseBody)}
        </>
      )}
      <div className="h-4" />
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="mx-1 inline-block rounded-full bg-white px-2 py-0.5 font-bold text-on-light">{children}</span>
  );
}

function BlockView({ b }: { b: Block }) {
  const style = { backgroundColor: BLOCK_COLORS[b.op] };
  const cls =
    'w-fit rounded-lg border-2 border-black/20 px-3 py-2 text-base font-bold text-white shadow-[0_3px_0_rgba(0,0,0,0.2)]';
  switch (b.op) {
    case 'ask':
      return (
        <div className={cls} style={style}>
          demander <Pill>{b.text}</Pill> et attendre
        </div>
      );
    case 'set':
      return (
        <div className={cls} style={style}>
          mettre <Pill>{b.variable}</Pill> à <Pill>{b.expr}</Pill>
        </div>
      );
    case 'change':
      return (
        <div className={cls} style={style}>
          ajouter <Pill>{b.by}</Pill> à <Pill>{b.variable}</Pill>
        </div>
      );
    case 'say':
      return (
        <div className={cls} style={style}>
          dire <Pill>{b.expr}</Pill>
        </div>
      );
    case 'repeat':
      return (
        <ControlBlock
          color={style.backgroundColor}
          head={
            <>
              répéter <Pill>{b.times}</Pill> fois
            </>
          }
          body={b.body}
        />
      );
    case 'if':
      return (
        <ControlBlock
          color={style.backgroundColor}
          head={
            <>
              si <Pill>{b.cond}</Pill> alors
            </>
          }
          body={b.then}
          elseHead="sinon"
          elseBody={b.else}
        />
      );
    case 'until':
      return (
        <ControlBlock
          color={style.backgroundColor}
          head={
            <>
              répéter jusqu’à <Pill>{b.cond}</Pill>
            </>
          }
          body={b.body}
        />
      );
  }
}

export function Blocks({ program }: { program: readonly Block[] }) {
  return (
    <div className="flex flex-col gap-1.5" role="img" aria-label="Programme en blocs">
      <div className="w-fit rounded-t-2xl rounded-b-lg bg-[#ffbf00] px-3 py-2 text-base font-bold text-on-light">
        quand le drapeau vert est cliqué
      </div>
      {program.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </div>
  );
}
