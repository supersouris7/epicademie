import type { Demo } from '@epicademie/content';
import { ConversionDemoView } from '../ConversionDemoView.tsx';
import { DivisionDemo } from './DivisionDemo.tsx';
import { FractionDemo } from './FractionDemo.tsx';
import { NumberLineDemo } from './NumberLineDemo.tsx';
import { PlaceValueDemo } from './PlaceValueDemo.tsx';
import { UnitsDemo } from './UnitsDemo.tsx';

/** Schéma d'une explication (ou d'un mot du dictionnaire), selon son type. */
export function DemoView({ demo }: { readonly demo: Demo }) {
  switch (demo.kind) {
    case 'conversion':
      return <ConversionDemoView demo={demo} />;
    case 'division':
      return <DivisionDemo dividend={demo.dividend} divisor={demo.divisor} />;
    case 'unites':
      return <UnitsDemo focus={demo.focus} />;
    case 'rangs':
      return <PlaceValueDemo value={demo.value} />;
    case 'fraction':
      return <FractionDemo parts={demo.parts} />;
    case 'droite':
      return <NumberLineDemo values={demo.values} />;
  }
}
