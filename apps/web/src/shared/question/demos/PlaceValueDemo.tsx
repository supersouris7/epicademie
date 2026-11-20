/**
 * Le nombre dans le tableau des rangs : partie entière à gauche de la virgule, décimales à
 * droite (dixièmes, centièmes, millièmes), chaque chiffre dans sa colonne.
 */
const INTEGER = ['milliers', 'centaines', 'dizaines', 'unités'] as const;
const DECIMAL = ['dixièmes', 'centièmes', 'millièmes'] as const;

export function PlaceValueDemo({ value }: { readonly value: string }) {
  const [int = '0', dec = ''] = value.replace(/\s/g, '').split(',');
  const intCols = INTEGER.slice(Math.max(0, INTEGER.length - Math.max(int.length, 1)));
  const decCols = DECIMAL.slice(0, Math.max(dec.length, 1));
  const ints = int.padStart(intCols.length, ' ').split('');
  return (
    <figure className="flex flex-col gap-2" aria-label={`${value} dans le tableau des rangs`}>
      <div className="overflow-x-auto">
        <table className="mx-auto border-collapse text-center">
          <thead>
            <tr>
              <th colSpan={intCols.length} className="bg-info rounded-t-lg px-2 text-sm text-white">
                partie entière
              </th>
              <th aria-hidden />
              <th colSpan={decCols.length} className="bg-success rounded-t-lg px-2 text-sm text-white">
                décimales
              </th>
            </tr>
            <tr className="text-xs">
              {intCols.map((c) => (
                <th key={c} scope="col" className="border-outline border-2 px-1.5 py-1">
                  {c}
                </th>
              ))}
              <th aria-hidden />
              {decCols.map((c) => (
                <th key={c} scope="col" className="border-outline border-2 px-1.5 py-1">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="font-display text-3xl">
              {ints.map((d, i) => (
                <td key={i} className="border-outline border-2 px-2" style={{ color: 'var(--info)' }}>
                  {d.trim()}
                </td>
              ))}
              <td className="font-display px-1 text-3xl">,</td>
              {decCols.map((c, i) => (
                <td key={c} className="border-outline border-2 px-2" style={{ color: 'var(--success)' }}>
                  {dec[i] ?? ''}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {dec.length > 0 && (
        <p className="text-center text-sm">
          {value} = {int} unité{Number(int) > 1 ? 's' : ''}
          {dec.split('').map((d, i) => ` + ${d} ${DECIMAL[i]?.replace(/s$/, Number(d) > 1 ? 's' : '') ?? ''}`)}
        </p>
      )}
    </figure>
  );
}
