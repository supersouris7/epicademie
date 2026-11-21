-- Avatars (21/11/2026) : les avatars générés par bibliothèque sont remplacés par 25 portraits
-- dessinés (« 01 » à « 25 »). Chaque profil existant reçoit un portrait tiré de son ancienne
-- graine (toujours le même pour un profil donné) ; l'enfant peut le changer. Retour arrière :
-- restaurer la sauvegarde d'avant migration (l'ancien avatar n'est pas conservé).
UPDATE "profiles"
SET "avatar" = jsonb_build_object(
  'style', 'portrait',
  'seed', lpad(((abs(hashtext(coalesce("avatar"->>'seed', "id"::text))) % 25) + 1)::text, 2, '0')
)
WHERE "avatar"->>'style' IS DISTINCT FROM 'portrait';
