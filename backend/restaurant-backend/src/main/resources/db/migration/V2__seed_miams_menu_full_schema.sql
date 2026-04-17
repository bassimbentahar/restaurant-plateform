-- Seed Flyway pour Miam's / Family Food New (page menu public Just Eat)
-- Modèle retenu :
--   option_groups         = vraie table métier des groupes d’options
--   option_items          = items d’options
--   product_option_groups = table de jointure entre products et option_groups

BEGIN;

-- ============================================================
-- Catégories
-- ============================================================
INSERT INTO categories (id, name, slug)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Big tacos', 'big-tacos'),
  ('10000000-0000-0000-0000-000000000002', 'Tacos mixtes', 'mixed-tacos'),
  ('10000000-0000-0000-0000-000000000003', 'Tacos classiques', 'classic-tacos'),
  ('10000000-0000-0000-0000-000000000004', 'Tacos gratinés (une seule viande)', 'gratinated-tacos-one-meat-only'),
  ('10000000-0000-0000-0000-000000000005', 'Taco Bowls', 'taco-bowls'),
  ('10000000-0000-0000-0000-000000000006', 'Burgers', 'burger'),
  ('10000000-0000-0000-0000-000000000007', 'Paninis et grecs', 'panini-and-greek'),
  ('10000000-0000-0000-0000-000000000008', 'Mitraillettes', 'mitraillette'),
  ('10000000-0000-0000-0000-000000000009', 'Snacks', 'snacks'),
  ('10000000-0000-0000-0000-000000000010', 'Boissons sans alcool', 'non-alcoholic-drinks')
  ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Produits
-- ============================================================
INSERT INTO products (
  id,
  sku,
  slug,
  title,
  short_description,
  description,
  thumb,
  base_price,
  is_available,
  is_featured,
  is_archived,
  preparation_time_minutes,
  available_from,
  available_to,
  calories,
  ingredients_text,
  allergens_text,
  created_at,
  updated_at,
  category_id
)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'MIAMS-BT-001',
    'tacos-with-minced-beef',
    'Tacos viande hachée',
    'Choisissez votre sauce et vos suppléments.',
    'Big tacos avec viande hachée. Choisissez votre sauce et vos suppléments.',
    NULL,
    17.00,
    TRUE,
    FALSE,
    FALSE,
    15,
    '11:00:00',
    '23:00:00',
    NULL,
    'Viande hachée',
    NULL,
    NOW(),
    NOW(),
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'MIAMS-BT-002',
    'tacos-with-nuggets',
    'Tacos nuggets',
    'Choisissez votre sauce et vos suppléments.',
    'Big tacos avec nuggets. Choisissez votre sauce et vos suppléments.',
    NULL,
    17.00,
    TRUE,
    FALSE,
    FALSE,
    15,
    '11:00:00',
    '23:00:00',
    NULL,
    'Nuggets',
    NULL,
    NOW(),
    NOW(),
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'MIAMS-BT-003',
    'tacos-with-falafel-vegetarian',
    'Tacos falafel (végétarien)',
    'Choisissez votre sauce et vos suppléments.',
    'Big tacos végétarien avec falafel. Choisissez votre sauce et vos suppléments.',
    NULL,
    17.00,
    TRUE,
    FALSE,
    FALSE,
    15,
    '11:00:00',
    '23:00:00',
    NULL,
    'Falafel',
    NULL,
    NOW(),
    NOW(),
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'MIAMS-BT-004',
    'tacos-with-merguez',
    'Tacos merguez',
    'Choisissez votre sauce et vos suppléments.',
    'Big tacos avec merguez. Choisissez votre sauce et vos suppléments.',
    NULL,
    19.00,
    TRUE,
    FALSE,
    FALSE,
    15,
    '11:00:00',
    '23:00:00',
    NULL,
    'Merguez',
    NULL,
    NOW(),
    NOW(),
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'MIAMS-BT-005',
    'big-tacos-chicken-escalope',
    'Big Tacos – Escalope de poulet',
    'Big tacos garni de poulet classique, frites et fromage fondu.',
    'Big tacos garni de poulet classique, frites et fromage fondu. Choisissez votre sauce et vos suppléments.',
    NULL,
    17.00,
    TRUE,
    TRUE,
    FALSE,
    15,
    '11:00:00',
    '23:00:00',
    NULL,
    'Poulet, frites, fromage fondu',
    NULL,
    NOW(),
    NOW(),
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    'MIAMS-MT-001',
    'mixed-taco-2-meats',
    'Tacos mixte (2 viandes)',
    'Choisissez deux viandes, votre sauce et vos suppléments.',
    'Tacos mixte avec deux viandes. L’extrait public du menu affiche un prix à partir de 12.00 CHF.',
    NULL,
    12.00,
    TRUE,
    FALSE,
    FALSE,
    15,
    '11:00:00',
    '23:00:00',
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW(),
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    '20000000-0000-0000-0000-000000000007',
    'MIAMS-SN-001',
    'nuggets-7-pieces',
    'Nuggets (7 pièces)',
    NULL,
    'Nuggets (7 pièces).',
    NULL,
    7.00,
    TRUE,
    FALSE,
    FALSE,
    10,
    '11:00:00',
    '23:00:00',
    NULL,
    'Nuggets de poulet',
    NULL,
    NOW(),
    NOW(),
    '10000000-0000-0000-0000-000000000009'
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    'MIAMS-SN-002',
    'large-fries',
    'Grandes frites',
    NULL,
    'Grandes frites.',
    NULL,
    8.00,
    TRUE,
    FALSE,
    FALSE,
    8,
    '11:00:00',
    '23:00:00',
    NULL,
    'Pommes de terre',
    NULL,
    NOW(),
    NOW(),
    '10000000-0000-0000-0000-000000000009'
  ),
  (
    '20000000-0000-0000-0000-000000000009',
    'MIAMS-DR-001',
    'coca-cola-05l',
    'Coca-Cola 0.5l',
    NULL,
    'Coca-Cola 0.5l.',
    NULL,
    4.00,
    TRUE,
    FALSE,
    FALSE,
    2,
    '11:00:00',
    '23:00:00',
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW(),
    '10000000-0000-0000-0000-000000000010'
  ),
  (
    '20000000-0000-0000-0000-000000000010',
    'MIAMS-TB-001',
    'taco-bowl',
    'Taco Bowl',
    'Catégorie Taco Bowls visible sur le menu public.',
    'Entrée générique Taco Bowl pour le seed. L’extrait public confirme la catégorie Taco Bowls avec 3 articles, mais pas tous les noms des articles.',
    NULL,
    12.00,
    TRUE,
    FALSE,
    FALSE,
    15,
    '11:00:00',
    '23:00:00',
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW(),
    '10000000-0000-0000-0000-000000000005'
  )
  ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Groupes d’options
-- ============================================================
INSERT INTO option_groups (
  id,
  name,
  description,
  min_selections,
  max_selections,
  required,
  is_available,
  display_order
)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'Choisissez votre sauce', 'Sélection de sauce pour les tacos.', 1, 1, TRUE, TRUE, 0),
  ('30000000-0000-0000-0000-000000000002', 'Suppléments', 'Suppléments optionnels pour les tacos.', 0, 5, FALSE, TRUE, 1),
  ('30000000-0000-0000-0000-000000000003', 'Choisissez deux viandes', 'Sélection de deux viandes pour les tacos mixtes.', 2, 2, TRUE, TRUE, 0)
  ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Items d’options
-- ============================================================
INSERT INTO option_items (
  id,
  name,
  description,
  price_adjustment,
  is_default,
  is_available,
  display_order,
  option_group_id
)
VALUES
  -- Sauces
  ('40000000-0000-0000-0000-000000000001', 'Algérienne', NULL, 0.00, FALSE, TRUE, 0, '30000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', 'Samouraï', NULL, 0.00, FALSE, TRUE, 1, '30000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000003', 'Harissa', NULL, 0.00, FALSE, TRUE, 2, '30000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000004', 'Mayonnaise', NULL, 0.00, FALSE, TRUE, 3, '30000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000005', 'Ketchup', NULL, 0.00, FALSE, TRUE, 4, '30000000-0000-0000-0000-000000000001'),

  -- Suppléments
  ('40000000-0000-0000-0000-000000000006', 'Fromage supplémentaire', NULL, 1.00, FALSE, TRUE, 0, '30000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000007', 'Frites supplémentaires', NULL, 1.50, FALSE, TRUE, 1, '30000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000008', 'Jalapeños', NULL, 1.00, FALSE, TRUE, 2, '30000000-0000-0000-0000-000000000002'),

  -- Choix de viandes
  ('40000000-0000-0000-0000-000000000009', 'Viande hachée', NULL, 0.00, FALSE, TRUE, 0, '30000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000010', 'Nuggets', NULL, 0.00, FALSE, TRUE, 1, '30000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000011', 'Falafel', NULL, 0.00, FALSE, TRUE, 2, '30000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000012', 'Merguez', NULL, 0.00, FALSE, TRUE, 3, '30000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000013', 'Escalope de poulet', NULL, 0.00, FALSE, TRUE, 4, '30000000-0000-0000-0000-000000000003')
  ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Liaison produits ↔ groupes d’options
-- ============================================================
INSERT INTO product_option_groups (product_id, option_group_id)
VALUES
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002'),

  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),

  ('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002'),

  ('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002'),

  ('20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002'),

  ('20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002'),

  ('20000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000002')
  ON CONFLICT DO NOTHING;

COMMIT;
