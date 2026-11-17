-- Style « Personnage » (big-ears) retiré : la tête était trop coupée dans l'anneau. → « Visage », même graine.
UPDATE `profiles`
SET `avatar` = json_remove(json_set(`avatar`, '$.style', 'adventurer-neutral'), '$.hair')
WHERE json_extract(`avatar`, '$.style') = 'big-ears';
