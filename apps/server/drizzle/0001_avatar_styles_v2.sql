-- Styles d'avatar retirés (adventurer, big-smile, bottts, croodles) → fun-emoji, en gardant la graine.
UPDATE `profiles`
SET `avatar` = json_set(`avatar`, '$.style', 'fun-emoji')
WHERE json_extract(`avatar`, '$.style') NOT IN ('fun-emoji', 'adventurer-neutral', 'pixelbot');
