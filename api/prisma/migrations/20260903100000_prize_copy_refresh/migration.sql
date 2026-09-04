-- Copie des lots : intitules et descriptions
--
-- Ces textes vivent dans prisma/seed.ts, que la chaine de deploiement
-- n'execute pas : elle ne joue que les migrations. Les bases deployees sont
-- donc restees sur la copie d origine, longue d une ligne, alors que la page
-- d'accueil reserve desormais un panneau entier a chaque lot.
--
-- Les valeurs sont recopiees de PRIZE_METADATA, dont elles doivent rester le
-- reflet exact : toucher a l une sans l autre les ferait diverger, la seed
-- reprenant la main en local et cette migration sur les environnements.
--
-- Idempotente par nature : des valeurs fixes sur cinq lignes identifiees par
-- leur code, et le registre des migrations empeche de la rejouer.

UPDATE "prizes"
   SET "name" = 'L''infuseur artisanal en inox et bois de noyer',
       "description" = 'Conçu pour sublimer chaque rituel de dégustation, cet infuseur allie la noblesse du bois de noyer naturel et la finesse d''un maillage fin en acier inoxydable. Son design épuré, rehaussé d''une délicate feuille gravée, permet aux feuilles de thé bio et aux fleurs de s''épanouir pleinement au contact de l''eau chaude. Une pièce durable, chaleureuse et authentique, parfaitement ancrée dans l''esprit slow living de Thé Tip Top.'
 WHERE "code" = 'INFUSER';

UPDATE "prizes"
   SET "name" = 'La boîte de thé détox ou d''infusion, 100 grammes',
       "description" = 'Cent grammes d''un mélange bio à savourer quand le rythme retombe. Les feuilles et les fleurs, cueillies chez nos producteurs partenaires, sont conditionnées dans une boîte métallique qui les garde à l''abri de la lumière et de l''humidité. Une infusion douce, sans théine, qui accompagne aussi bien la fin de journée que les premiers instants du matin. À laisser reposer quelques minutes dans une eau frémissante.'
 WHERE "code" = 'TEA_DETOX';

UPDATE "prizes"
   SET "name" = 'La boîte de thé signature, 100 grammes',
       "description" = 'L''assemblage qui a fait connaître la maison, dans sa boîte de cent grammes. Un thé bio dont l''équilibre se travaille récolte après récolte, entre rondeur et longueur en bouche, et qui supporte aussi bien l''infusion courte que la seconde eau. La boîte signature, sobre et refermable, se glisse dans un placard de cuisine comme sur une étagère de bureau.'
 WHERE "code" = 'TEA_SIGNATURE';

UPDATE "prizes"
   SET "name" = 'Le coffret découverte, d''une valeur de 39 €',
       "description" = 'Une sélection de nos thés et infusions bio réunis dans un écrin de carton recyclé, pour parcourir la gamme sans avoir à choisir tout de suite. Chaque sachet porte sa température et son temps d''infusion, de quoi apprivoiser les mélanges un à un. Le format qu''on offre volontiers, et qu''on garde parfois pour soi.'
 WHERE "code" = 'GIFT_BOX_39';

UPDATE "prizes"
   SET "name" = 'Le coffret découverte premium, d''une valeur de 69 €',
       "description" = 'Notre plus belle boîte : une sélection resserrée de grands crus bio, présentée dans un coffret fermé par un ruban de lin. Chaque thé y est accompagné de sa fiche de dégustation, qui dit d''où il vient, ce qu''il révèle et comment le préparer. Un objet pensé pour durer au-delà de la dernière tasse, à ranger parmi les choses que l''on garde.'
 WHERE "code" = 'GIFT_BOX_69';
