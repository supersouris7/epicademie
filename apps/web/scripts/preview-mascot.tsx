/** Planche de prévisualisation des humeurs de Questy : tsx scripts/preview-mascot.tsx <sortie.html> */
import { writeFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { Questy } from '../src/shared/ui/mascot/Questy.tsx';
import { MOODS, MOOD_IDS } from '../src/shared/ui/mascot/moods.ts';

const html = renderToStaticMarkup(
  <body style={{ margin: 0, padding: 16, background: '#fff6e9', font: 'bold 15px sans-serif' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
      {MOOD_IDS.map((id) => (
        <figure key={id} style={{ margin: 0, textAlign: 'center' }}>
          <Questy mood={id} size={150} />
          <figcaption>
            {id} — {MOODS[id].label}
          </figcaption>
        </figure>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
      {MOOD_IDS.map((id) => (
        <Questy key={id} mood={id} size={40} />
      ))}
    </div>
  </body>,
);
writeFileSync(process.argv[2] ?? 'mascot-preview.html', `<!doctype html>${html}`);
