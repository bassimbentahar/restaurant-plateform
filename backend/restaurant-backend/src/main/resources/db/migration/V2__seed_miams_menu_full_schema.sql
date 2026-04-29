BEGIN;

INSERT INTO categories (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  slug
)
VALUES
  ('10000000-0000-0000-0000-000000000001', NOW(), NOW(), 'system', 'system', 'Big tacos', 'big-tacos'),
  ('10000000-0000-0000-0000-000000000002', NOW(), NOW(), 'system', 'system', 'Tacos mixtes', 'mixed-tacos'),
  ('10000000-0000-0000-0000-000000000003', NOW(), NOW(), 'system', 'system', 'Tacos classiques', 'classic-tacos'),
  ('10000000-0000-0000-0000-000000000004', NOW(), NOW(), 'system', 'system', 'Tacos gratinés (une seule viande)', 'gratinated-tacos-one-meat-only'),
  ('10000000-0000-0000-0000-000000000005', NOW(), NOW(), 'system', 'system', 'Taco Bowls', 'taco-bowls'),
  ('10000000-0000-0000-0000-000000000006', NOW(), NOW(), 'system', 'system', 'Burgers', 'burger'),
  ('10000000-0000-0000-0000-000000000007', NOW(), NOW(), 'system', 'system', 'Paninis et grecs', 'panini-and-greek'),
  ('10000000-0000-0000-0000-000000000008', NOW(), NOW(), 'system', 'system', 'Mitraillettes', 'mitraillette'),
  ('10000000-0000-0000-0000-000000000009', NOW(), NOW(), 'system', 'system', 'Snacks', 'snacks'),
  ('10000000-0000-0000-0000-000000000010', NOW(), NOW(), 'system', 'system', 'Boissons sans alcool', 'non-alcoholic-drinks')
  ON CONFLICT (id) DO NOTHING;

INSERT INTO products (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
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
  category_id
)
VALUES
  ('20000000-0000-0000-0000-000000000001', NOW(), NOW(), 'system', 'system', 'MIAMS-BT-001', 'tacos-with-minced-beef', 'Tacos viande hachée', 'Choisissez votre sauce et vos suppléments.', 'Big tacos avec viande hachée. Choisissez votre sauce et vos suppléments.', '/assets/products/tacos-viande-hachee.jpg', 17.00, TRUE, FALSE, FALSE, 15, '11:00:00', '23:00:00', NULL, 'Viande hachée', NULL, '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', NOW(), NOW(), 'system', 'system', 'MIAMS-BT-002', 'tacos-with-nuggets', 'Tacos nuggets', 'Choisissez votre sauce et vos suppléments.', 'Big tacos avec nuggets. Choisissez votre sauce et vos suppléments.', '/assets/products/tacos-nuggets.jpg', 17.00, TRUE, FALSE, FALSE, 15, '11:00:00', '23:00:00', NULL, 'Nuggets', NULL, '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', NOW(), NOW(), 'system', 'system', 'MIAMS-BT-003', 'tacos-with-falafel-vegetarian', 'Tacos falafel (végétarien)', 'Choisissez votre sauce et vos suppléments.', 'Big tacos végétarien avec falafel. Choisissez votre sauce et vos suppléments.', '/assets/products/tacos-falafel.jpg', 17.00, TRUE, FALSE, FALSE, 15, '11:00:00', '23:00:00', NULL, 'Falafel', NULL, '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000004', NOW(), NOW(), 'system', 'system', 'MIAMS-BT-004', 'tacos-with-merguez', 'Tacos merguez', 'Choisissez votre sauce et vos suppléments.', 'Big tacos avec merguez. Choisissez votre sauce et vos suppléments.', '/assets/products/tacos-merguez.jpg', 19.00, TRUE, FALSE, FALSE, 15, '11:00:00', '23:00:00', NULL, 'Merguez', NULL, '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000005', NOW(), NOW(), 'system', 'system', 'MIAMS-BT-005', 'big-tacos-chicken-escalope', 'Big Tacos – Escalope de poulet', 'Big tacos garni de poulet classique, frites et fromage fondu.', 'Big tacos garni de poulet classique, frites et fromage fondu. Choisissez votre sauce et vos suppléments.', '/assets/products/tacos-poulet.jpg', 17.00, TRUE, TRUE, FALSE, 15, '11:00:00', '23:00:00', NULL, 'Poulet, frites, fromage fondu', NULL, '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000006', NOW(), NOW(), 'system', 'system', 'MIAMS-MT-001', 'mixed-taco-2-meats', 'Tacos mixte (2 viandes)', 'Choisissez deux viandes, votre sauce et vos suppléments.', 'Tacos mixte avec deux viandes. L’extrait public du menu affiche un prix à partir de 12.00 CHF.', '/assets/products/tacos-mixte.jpg', 12.00, TRUE, FALSE, FALSE, 15, '11:00:00', '23:00:00', NULL, NULL, NULL, '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000007', NOW(), NOW(), 'system', 'system', 'MIAMS-SN-001', 'nuggets-7-pieces', 'Nuggets (7 pièces)', NULL, 'Nuggets (7 pièces).', '/assets/products/nuggets.jpg', 7.00, TRUE, FALSE, FALSE, 10, '11:00:00', '23:00:00', NULL, 'Nuggets de poulet', NULL, '10000000-0000-0000-0000-000000000009'),
  ('20000000-0000-0000-0000-000000000008', NOW(), NOW(), 'system', 'system', 'MIAMS-SN-002', 'large-fries', 'Grandes frites', NULL, 'Grandes frites.', '/assets/products/grandes-frites.jpg', 8.00, TRUE, FALSE, FALSE, 8, '11:00:00', '23:00:00', NULL, 'Pommes de terre', NULL, '10000000-0000-0000-0000-000000000009'),
  ('20000000-0000-0000-0000-000000000009', NOW(), NOW(), 'system', 'system', 'MIAMS-DR-001', 'coca-cola-05l', 'Coca-Cola 0.5l', NULL, 'Coca-Cola 0.5l.', '/assets/products/coca-cola.jpg', 4.00, TRUE, FALSE, FALSE, 2, '11:00:00', '23:00:00', NULL, NULL, NULL, '10000000-0000-0000-0000-000000000010'),
  ('20000000-0000-0000-0000-000000000010', NOW(), NOW(), 'system', 'system', 'MIAMS-TB-001', 'taco-bowl', 'Taco Bowl', 'Catégorie Taco Bowls visible sur le menu public.', 'Entrée générique Taco Bowl pour le seed. L’extrait public confirme la catégorie Taco Bowls avec 3 articles, mais pas tous les noms des articles.', '/assets/products/taco-bowl.jpg', 12.00, TRUE, FALSE, FALSE, 15, '11:00:00', '23:00:00', NULL, NULL, NULL, '10000000-0000-0000-0000-000000000005')
  ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  url,
  alt_text,
  display_order,
  is_primary,
  product_id
)
VALUES
  ('50000000-0000-0000-0000-000000000001', NOW(), NOW(), 'system', 'system', '/assets/products/tacos-viande-hachee.jpg', 'Tacos viande hachée', 0, TRUE, '20000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', NOW(), NOW(), 'system', 'system', '/assets/products/tacos-nuggets.jpg', 'Tacos nuggets', 0, TRUE, '20000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000003', NOW(), NOW(), 'system', 'system', '/assets/products/tacos-falafel.jpg', 'Tacos falafel', 0, TRUE, '20000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000004', NOW(), NOW(), 'system', 'system', '/assets/products/tacos-merguez.jpg', 'Tacos merguez', 0, TRUE, '20000000-0000-0000-0000-000000000004'),
  ('50000000-0000-0000-0000-000000000005', NOW(), NOW(), 'system', 'system', '/assets/products/tacos-poulet.jpg', 'Big Tacos escalope de poulet', 0, TRUE, '20000000-0000-0000-0000-000000000005'),
  ('50000000-0000-0000-0000-000000000006', NOW(), NOW(), 'system', 'system', '/assets/products/tacos-mixte.jpg', 'Tacos mixte', 0, TRUE, '20000000-0000-0000-0000-000000000006'),
  ('50000000-0000-0000-0000-000000000007', NOW(), NOW(), 'system', 'system', '/assets/products/nuggets.jpg', 'Nuggets 7 pièces', 0, TRUE, '20000000-0000-0000-0000-000000000007'),
  ('50000000-0000-0000-0000-000000000008', NOW(), NOW(), 'system', 'system', '/assets/products/grandes-frites.jpg', 'Grandes frites', 0, TRUE, '20000000-0000-0000-0000-000000000008'),
  ('50000000-0000-0000-0000-000000000009', NOW(), NOW(), 'system', 'system', '/assets/products/coca-cola.jpg', 'Coca-Cola 0.5l', 0, TRUE, '20000000-0000-0000-0000-000000000009'),
  ('50000000-0000-0000-0000-000000000010', NOW(), NOW(), 'system', 'system', '/assets/products/taco-bowl.jpg', 'Taco Bowl', 0, TRUE, '20000000-0000-0000-0000-000000000010')
  ON CONFLICT (id) DO NOTHING;

INSERT INTO option_groups (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  min_selections,
  max_selections,
  required,
  is_available,
  display_order
)
VALUES
  ('30000000-0000-0000-0000-000000000001', NOW(), NOW(), 'system', 'system', 'Choisissez votre sauce', 'Sélection de sauce pour les tacos.', 1, 1, TRUE, TRUE, 0),
  ('30000000-0000-0000-0000-000000000002', NOW(), NOW(), 'system', 'system', 'Suppléments', 'Suppléments optionnels pour les tacos.', 0, 5, FALSE, TRUE, 1),
  ('30000000-0000-0000-0000-000000000003', NOW(), NOW(), 'system', 'system', 'Choisissez deux viandes', 'Sélection de deux viandes pour les tacos mixtes.', 2, 2, TRUE, TRUE, 0)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO option_items (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  price_adjustment,
  is_default,
  is_available,
  display_order,
  option_group_id
)
VALUES
  ('40000000-0000-0000-0000-000000000001', NOW(), NOW(), 'system', 'system', 'Algérienne', NULL, 0.00, FALSE, TRUE, 0, '30000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', NOW(), NOW(), 'system', 'system', 'Samouraï', NULL, 0.00, FALSE, TRUE, 1, '30000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000003', NOW(), NOW(), 'system', 'system', 'Harissa', NULL, 0.00, FALSE, TRUE, 2, '30000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000004', NOW(), NOW(), 'system', 'system', 'Mayonnaise', NULL, 0.00, FALSE, TRUE, 3, '30000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000005', NOW(), NOW(), 'system', 'system', 'Ketchup', NULL, 0.00, FALSE, TRUE, 4, '30000000-0000-0000-0000-000000000001'),

  ('40000000-0000-0000-0000-000000000006', NOW(), NOW(), 'system', 'system', 'Fromage supplémentaire', NULL, 1.00, FALSE, TRUE, 0, '30000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000007', NOW(), NOW(), 'system', 'system', 'Frites supplémentaires', NULL, 1.50, FALSE, TRUE, 1, '30000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000008', NOW(), NOW(), 'system', 'system', 'Jalapeños', NULL, 1.00, FALSE, TRUE, 2, '30000000-0000-0000-0000-000000000002'),

  ('40000000-0000-0000-0000-000000000009', NOW(), NOW(), 'system', 'system', 'Viande hachée', NULL, 0.00, FALSE, TRUE, 0, '30000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000010', NOW(), NOW(), 'system', 'system', 'Nuggets', NULL, 0.00, FALSE, TRUE, 1, '30000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000011', NOW(), NOW(), 'system', 'system', 'Falafel', NULL, 0.00, FALSE, TRUE, 2, '30000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000012', NOW(), NOW(), 'system', 'system', 'Merguez', NULL, 0.00, FALSE, TRUE, 3, '30000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000013', NOW(), NOW(), 'system', 'system', 'Escalope de poulet', NULL, 0.00, FALSE, TRUE, 4, '30000000-0000-0000-0000-000000000003')
  ON CONFLICT (id) DO NOTHING;

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
