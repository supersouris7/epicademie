/**
 * Exporte les SVG statiques de Questy (favicon, icône PWA) depuis les composants React,
 * pour garder une source unique.  Usage : pnpm --filter @questeo/web mascot:export
 */
import { writeFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { QuestyFull, QuestyHead } from '../src/components/mascot/Questy.tsx';

const xml = (svg: string) => svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
writeFileSync(
  new URL('../public/questy-head.svg', import.meta.url),
  xml(renderToStaticMarkup(<QuestyHead size={256} />)),
);
writeFileSync(new URL('../public/questy.svg', import.meta.url), xml(renderToStaticMarkup(<QuestyFull size={400} />)));
console.log('Mascotte exportée dans public/');
