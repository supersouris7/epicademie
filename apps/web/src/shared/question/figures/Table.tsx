import { type Of } from './common.ts';

/** Tableau. */
export function Table({ f }: { f: Of<'table'> }) {
  return (
    <table className="mx-auto border-collapse text-lg">
      <tbody>
        {f.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => {
              const head = f.header && j === 0;
              return head ? (
                <th key={j} className="border-outline bg-surface border-2 px-3 py-2 text-left font-bold">
                  {cell}
                </th>
              ) : (
                <td key={j} className="border-outline border-2 px-3 py-2 text-center font-bold">
                  {cell}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
