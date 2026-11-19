/**
 * Exporte l'icône statique de Questy (favicon) depuis le composant React, pour garder une source unique.
 * Usage : pnpm --filter @questeo/web mascot:export
 */
import { rmSync, writeFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { Questy } from '../src/shared/ui/mascot/Questy.tsx';

const xml = (svg: string) => svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
writeFileSync(
  new URL('../public/questy.svg', import.meta.url),
  xml(renderToStaticMarkup(<Questy size={256} mood="happy" />)),
);
rmSync(new URL('../public/questy-head.svg', import.meta.url), { force: true });
console.log('Mascotte exportée dans public/questy.svg');
