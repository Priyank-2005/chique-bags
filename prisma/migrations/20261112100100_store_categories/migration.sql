-- The store now sells four ranges: Luxury bags, Metal bags, Flapbags and Clutches.
-- The three sample categories are renamed in place (so their products and cover photos are kept)
-- and Metal bags is added. Safe to run more than once, and on a fresh database.

UPDATE "categories"
SET "name" = 'Luxury bags', "slug" = 'luxury-bags', "description" = 'Statement bags in premium finishes.', "sortOrder" = 10, "updatedAt" = NOW()
WHERE "slug" = 'crossbody-bags' AND NOT EXISTS (SELECT 1 FROM "categories" WHERE "slug" = 'luxury-bags');

UPDATE "categories"
SET "name" = 'Flapbags', "slug" = 'flapbags', "description" = 'Classic flap styles with polished clasps and chain straps.', "sortOrder" = 30, "updatedAt" = NOW()
WHERE "slug" = 'quilted-chain' AND NOT EXISTS (SELECT 1 FROM "categories" WHERE "slug" = 'flapbags');

UPDATE "categories"
SET "name" = 'Clutches', "slug" = 'clutches', "description" = 'Compact clutches for evenings and occasions.', "sortOrder" = 40, "updatedAt" = NOW()
WHERE "slug" = 'crescent-slings' AND NOT EXISTS (SELECT 1 FROM "categories" WHERE "slug" = 'clutches');

INSERT INTO "categories" ("id", "name", "slug", "description", "sortOrder", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v."name", v."slug", v."description", v."sortOrder", true, NOW(), NOW()
FROM (VALUES
  ('Luxury bags', 'luxury-bags', 'Statement bags in premium finishes.', 10),
  ('Metal bags', 'metal-bags', 'Bags with polished metal frames and hardware.', 20),
  ('Flapbags', 'flapbags', 'Classic flap styles with polished clasps and chain straps.', 30),
  ('Clutches', 'clutches', 'Compact clutches for evenings and occasions.', 40)
) AS v("name", "slug", "description", "sortOrder")
WHERE NOT EXISTS (SELECT 1 FROM "categories" c WHERE c."slug" = v."slug");

-- Three of the sample bags suit a different range than the one their old category maps to.
UPDATE "products" SET "categoryId" = (SELECT "id" FROM "categories" WHERE "slug" = 'clutches')
WHERE "slug" IN ('aura-quilted-chain-clutch', 'the-petite-crescent-sling');

UPDATE "products" SET "categoryId" = (SELECT "id" FROM "categories" WHERE "slug" = 'flapbags')
WHERE "slug" IN ('petal-pink-mini-flap-bag');
