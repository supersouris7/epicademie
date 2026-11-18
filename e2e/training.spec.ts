import { expect, test } from '@playwright/test';

test('Entraînement : série complète de tables, correction, leçon et résultats', async ({ page }) => {
  test.setTimeout(60_000); // série complète : 5 questions + variantes
  await page.goto('/');
  await page.getByRole('button', { name: /Nouveau joueur/ }).click();
  await page.getByPlaceholder('Ex. Léa').fill(`Jeu${Date.now() % 10000}`);
  await page.getByRole('button', { name: 'Une fille' }).click();
  await page.getByLabel('Date de naissance').fill('2014-03-09');
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();

  await page.getByRole('button', { name: /Entraînement/ }).click();
  // C'est ici qu'on gagne son équipement (dès le choix de la matière).
  await expect(page.getByText(/C’est ici que tu gagnes ton/)).toBeVisible();
  await page.getByRole('button', { name: 'Maths', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Entraînement · Maths/ })).toBeVisible();
  // On peut s'entraîner sur le programme d'une autre classe ; la sienne (5e) est cochée par défaut.
  const grades = page.getByRole('radiogroup', { name: 'Classe' });
  await expect(grades.getByRole('radio', { name: /5e/ })).toHaveAttribute('aria-checked', 'true');
  await grades.getByRole('radio', { name: /6e/ }).click();
  await expect(page.getByRole('button', { name: /Nombres entiers et décimaux/ }).last()).toBeVisible();
  await expect(page).toHaveURL(/classe=6e/);
  await grades.getByRole('radio', { name: /5e/ }).click();
  // Nouveau joueur : l'appli propose par où commencer.
  await page.getByRole('button', { name: /Je te propose · par où commencer Calcul mental/ }).click();
  await page.getByRole('button', { name: /Tables de multiplication/ }).click();

  // 1re réponse fausse : Questy donne un indice et on réessaie la même question.
  await expect(page.getByRole('progressbar', { name: 'Progression de la série' })).toBeVisible();
  const wrong = async () => {
    await page.getByRole('button', { name: 'Moins' }).click();
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: 'OK' }).click();
  };
  await wrong();
  await expect(page.getByText('Essaie encore !')).toBeVisible();
  // 2e erreur : explication de Questy, bulle par bulle, et mémo à la demande.
  await wrong();
  const explanation = page.getByRole('region', { name: 'Explication de Questy' });
  await expect(explanation).toContainText('Tu as répondu −1');
  await expect(explanation).toContainText('La bonne réponse');
  const more = page.getByRole('button', { name: 'Continuer l’explication' });
  while (await more.isVisible()) await more.click();
  await page.getByRole('button', { name: 'Le truc à retenir' }).click();
  await expect(page.getByRole('dialog')).toContainText('Tables de multiplication');
  await page.getByRole('button', { name: /J’ai compris/ }).click();
  await page.getByRole('button', { name: /Je réessaie/ }).click();
  await expect(page.getByText('Question similaire', { exact: true })).toBeVisible();

  // On répond « −1 » (toujours faux) jusqu'à la fin de la série : 5 questions + 3 variantes au plus.
  const ok = page.getByRole('button', { name: 'OK' });
  const next = page.getByRole('button', { name: /Suivant|Je réessaie/ });
  const end = page.getByText(/On s’accroche/);
  for (let i = 0; i < 80; i++) {
    await expect(ok.or(next).or(end).first()).toBeVisible();
    if (await end.isVisible()) break;
    if (await ok.isVisible()) {
      await wrong();
      await expect(next.or(page.getByText('Essaie encore !'))).toBeVisible();
      continue;
    }
    await next.click();
    await expect(next).toBeHidden();
  }
  await expect(page.getByText(/On s’accroche/)).toBeVisible();
  await expect(page.getByText('0/5')).toBeVisible();
  // 0/5 : peu de chances de coffre ; s'il n'y en a pas, l'appli explique comment en gagner.
  await expect(page.getByText(/Pas de coffre cette fois|Un coffre d’équipement/)).toBeVisible();
  await expect(page.getByText(/À revoir dès/)).toBeVisible();
  // Récapitulatif des erreurs avec la bonne réponse.
  await page.getByText(/Tes erreurs \(\d+\)/).click();
  await expect(page.getByText(/Réponse :/).first()).toBeVisible();

  // La notion apparaît « à revoir » demain : pas encore échue aujourd'hui, mais évaluée.
  await page.getByRole('button', { name: 'Autre notion' }).click();
  await expect(page.getByRole('button', { name: /Tables de multiplication/ })).toContainText('Maîtrise insuffisante');
});

test('outils : calculatrice, brouillon, tableau de conversion', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Nouveau joueur/ }).click();
  await page.getByPlaceholder('Ex. Léa').fill(`Outil${Date.now() % 10000}`);
  await page.getByRole('button', { name: 'Un garçon' }).click();
  await page.getByLabel('Date de naissance').fill('2013-05-20');
  await expect(page.getByText('Tu es en 4e ?')).toBeVisible();
  await page.getByRole('button', { name: 'Oui', exact: true }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await expect(page).toHaveURL(/\/hub$/);
  // Toutes les classes du CM1 à la 3e ont leur programme : plus de message « arrive bientôt ».
  await expect(page.getByText(/arrive bientôt/)).toHaveCount(0);

  // Aire du disque : Questy conseille la calculatrice ; elle remplace le pavé dans la zone d'outils.
  await page.goto('/partie/entrainement/m5-espace/m5-disque');
  await expect(page.getByText('Tu peux t’aider de la calculatrice.')).toBeVisible();
  await page.getByRole('tab', { name: 'Calculatrice' }).click();
  const panel = page.getByRole('tabpanel');
  for (const k of ['Pi', '×', '2', '5', '=']) await panel.getByRole('button', { name: k, exact: true }).click();
  await expect(panel).toContainText('78,539816');
  await page.getByRole('button', { name: 'Envoyer 78,539816 dans ma réponse' }).click();
  await expect(page.getByRole('tab', { name: 'Répondre' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByLabel('Ta réponse')).toHaveText('78,539816');
  await expect(page.getByRole('button', { name: 'OK' })).toBeVisible();

  // Brouillon : on dessine, on change d'onglet, le dessin est conservé.
  await page.getByRole('tab', { name: 'Brouillon' }).click();
  const canvas = page.getByRole('img', { name: /Zone de brouillon/ });
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 60, { steps: 10 });
  await page.mouse.up();
  await expect(page.getByRole('button', { name: 'Annuler' })).toBeEnabled();
  await page.getByRole('tab', { name: 'Calculatrice' }).click();
  await page.getByRole('tab', { name: 'Brouillon' }).click();
  await expect(page.getByRole('button', { name: 'Annuler' })).toBeEnabled();
  // Pleine page : l'énoncé reste en haut, le dessin est conservé.
  await page.getByRole('button', { name: 'Pleine page' }).click();
  const full = page.getByRole('dialog', { name: 'Brouillon pleine page' });
  await expect(full).toContainText('arrondie au dixième');
  await expect(full.getByRole('button', { name: 'Annuler' })).toBeEnabled();
  await full.getByRole('button', { name: 'Réduire' }).click();
  await expect(full).toBeHidden();
  // La réponse envoyée depuis la calculatrice est toujours là.
  await page.getByRole('tab', { name: 'Répondre' }).click();
  await expect(page.getByLabel('Ta réponse')).toHaveText('78,539816');

  // Tableau de conversion à remplir, unités de l'énoncé surlignées.
  await page.goto('/partie/entrainement/m5-espace/m5-conversions-volume');
  await page.getByRole('tab', { name: 'Conversion' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('dm');
  await page.getByRole('button', { name: 'Case 4' }).click();
  await page.getByRole('tabpanel').getByRole('button', { name: '2', exact: true }).click();
  await page.getByRole('button', { name: 'Virgule' }).click();
  await expect(page.getByRole('button', { name: 'Case 4' })).toHaveText('2');
  await page.getByRole('button', { name: 'Envoyer 2 dans ma réponse' }).click();
  await expect(page.getByLabel('Ta réponse')).toHaveText('2');

  // Pause aux couleurs de l'appli.
  // Pause : même bouton qu'au combat, menu Reprendre / Quitter.
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('alertdialog', { name: 'Pause' })).toContainText('cette série ne sera pas comptée');
  await page.getByRole('button', { name: 'Reprendre' }).click();
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.getByRole('button', { name: 'Quitter la série' }).click();
  await expect(page).toHaveURL(/\/hub$/);

  // Parcours dans l'appli : « précédent » pendant la série demande confirmation ;
  // après « Quitter », « précédent » ramène à la liste des notions, pas dans la partie.
  await page.getByRole('button', { name: /^Entraînement/ }).click();
  await page.getByRole('button', { name: 'Maths', exact: true }).click();
  await page.getByRole('button', { name: /^Multiplier et diviser des relatifs \d/ }).click();
  await page
    .getByRole('button', { name: /^Produit de deux relatifs|^Multiplier/ })
    .first()
    .click();
  await expect(page.getByRole('progressbar', { name: 'Progression de la série' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('alertdialog', { name: 'Pause' })).toBeVisible();
  await page.getByRole('button', { name: 'Reprendre' }).click();
  await expect(page.getByRole('alertdialog', { name: 'Pause' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.getByRole('button', { name: 'Quitter la série' }).click();
  await expect(page).toHaveURL(/\/hub$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/jouer\/entrainement\/maths\/m4-relatifs/);
  await expect(page.getByRole('progressbar', { name: 'Progression de la série' })).toHaveCount(0);

  // Tables : brouillon disponible, pas de calculatrice ni de conseil.
  await page.goto('/partie/entrainement/m5-calcul/m5-tables');
  await expect(page.getByRole('tab', { name: 'Brouillon' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Calculatrice' })).toHaveCount(0);
  await expect(page.getByRole('note')).toHaveCount(0);

  // Puissances : calculer un carré n'est pas l'objectif, la calculatrice est là.
  await page.goto('/partie/entrainement/m5-puissances/m5-puissances-expressions');
  await expect(page.getByRole('tab', { name: 'Calculatrice' })).toBeVisible();

  // Priorités opératoires : le brouillon est conseillé.
  await page.goto('/partie/entrainement/m5-operations/m5-priorites');
  await expect(page.getByText('Je te conseille de faire un brouillon pour cette question.')).toBeVisible();
});
