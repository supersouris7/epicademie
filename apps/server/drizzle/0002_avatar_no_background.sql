-- La couleur de fond des avatars est supprimée (inutile : les styles retenus remplissent le cercle).
UPDATE `profiles` SET `avatar` = json_remove(`avatar`, '$.background');
