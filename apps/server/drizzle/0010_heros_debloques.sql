-- Alex et Lina débloqués dès le début (21/11/2026) : chaque profil possède les deux. Le héros porté
-- ne change pas. Retour arrière : supprimer les lignes ajoutées ici (source 'depart', héros non porté).
INSERT INTO "owned_heroes" ("profile_id", "hero", "source")
SELECT "id", h."hero", 'depart' FROM "profiles" CROSS JOIN (VALUES ('alex'), ('lina')) AS h("hero")
ON CONFLICT DO NOTHING;
