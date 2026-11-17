-- Nouveaux héros (kit combat) : Nassim, Tao, Lina, Ayla et Pixel remplacent Alex, Zoé, Léo et Mia.
UPDATE `profiles` SET `hero` = CASE `hero`
  WHEN 'alex' THEN 'nassim'
  WHEN 'leo' THEN 'tao'
  WHEN 'zoe' THEN 'lina'
  WHEN 'mia' THEN 'ayla'
  ELSE 'nassim'
END
WHERE `hero` NOT IN ('nassim', 'tao', 'lina', 'ayla', 'pixel');
